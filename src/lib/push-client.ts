// JY Beauty client-side Web Push helper
// 冠 #4869 2026-05-31

function urlBase64ToBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buf = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return buf;
}

export async function isPushSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export async function isPushSubscribed(): Promise<boolean> {
  if (!(await isPushSupported())) return false;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return false;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch { return false; }
}

export async function enablePush(): Promise<{ ok: boolean; error?: string }> {
  if (!(await isPushSupported())) return { ok: false, error: "瀏覽器不支援 Web Push" };
  try {
    // 1. 註冊 service worker
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    // 2. 拿 server 的 VAPID public key
    const vapidRes = await fetch("/api/push/vapid-public-key");
    const vapidJson = await vapidRes.json();
    if (!vapidJson.publicKey) return { ok: false, error: "Server 沒設 VAPID_PUBLIC_KEY (找冠冠設)" };

    // 3. 請求權限
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return { ok: false, error: "你拒絕了通知權限" };

    // 4. 訂閱
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToBuffer(vapidJson.publicKey),
      });
    }

    // 5. 推給 server 存
    const saveRes = await fetch("/api/push/subscribe", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
    });
    const saveJson = await saveRes.json();
    if (!saveJson.ok) return { ok: false, error: "Server 儲存失敗" };

    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function disablePush(): Promise<void> {
  if (!(await isPushSupported())) return;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;
    await fetch("/api/push/subscribe", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
    await sub.unsubscribe();
  } catch (e) {
    console.error("[push-client] disable error:", e);
  }
}
