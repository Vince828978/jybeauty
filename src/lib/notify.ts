/**
 * JY Beauty 通知 helper — 冠/主理人 #4864 2026-05-31
 *
 * - 寫入 notifications 表（後台紅點點 + 通知中心會顯示）
 * - 若 Vercel env 設了 TELEGRAM_BOT_TOKEN + JY_NOTIFY_CHAT_ID，會 push 到 Telegram
 * - 若 Vercel env 設了 VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY，桌面 PWA 也會收到推播 (冠 #4869)
 * - 失敗都不擋主流程（call site 不需要 try/catch）
 */
import { neon } from "@neondatabase/serverless";
import webpush from "web-push";

type NotifType = "booking" | "member" | "conflict" | "system" | "card_order";

function getDb() {
  const url = process.env.STORAGE_URL || process.env.DATABASE_URL || "";
  return neon(url);
}

async function ensureTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    data TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

export async function notify(type: NotifType, message: string, data?: unknown): Promise<void> {
  try {
    await ensureTable();
    const sql = getDb();
    await sql`INSERT INTO notifications (type, message, data)
              VALUES (${type}, ${message}, ${data ? JSON.stringify(data) : null})`;
  } catch (e) {
    console.error("[notify] DB insert failed:", e);
  }

  // Telegram push (optional, env-driven)
  // 冠 #4866 2026-05-31: 預設推 JY 群 (-5052665653)，可由 JY_NOTIFY_CHAT_ID env 覆寫
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.JY_NOTIFY_CHAT_ID || "-5052665653";
  const emoji = type === "booking" ? "📅" : type === "member" ? "✨" : type === "conflict" ? "⚠️" : "🔔";
  if (token && chatId) {
    try {
      const text = `${emoji} JY Beauty 通知\n\n${message}`;
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        console.error("[notify] Telegram push failed:", res.status, t);
      }
    } catch (e) {
      console.error("[notify] Telegram push error:", e);
    }
  }

  // Web Push (桌面 / iOS PWA 紅點) — 冠 #4869 2026-05-31
  const vapidPub = process.env.VAPID_PUBLIC_KEY;
  const vapidPriv = process.env.VAPID_PRIVATE_KEY;
  if (vapidPub && vapidPriv) {
    try {
      webpush.setVapidDetails("mailto:admin@jybeauty.tw", vapidPub, vapidPriv);
      const sql = getDb();
      const subs = await sql`SELECT endpoint, p256dh, auth FROM push_subscriptions` as { endpoint: string; p256dh: string; auth: string }[];
      const payload = JSON.stringify({
        title: `${emoji} ${type === "booking" ? "新預約" : type === "member" ? "新會員" : "JY Beauty"}`,
        body: message,
        url: "/admin",
        tag: `jy-${type}-${Date.now()}`,
      });
      await Promise.allSettled(subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload
          );
        } catch (err) {
          const statusCode = (err as { statusCode?: number })?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            // subscription gone, clean up
            await sql`DELETE FROM push_subscriptions WHERE endpoint=${s.endpoint}`;
          } else {
            console.error("[notify] web push fail:", statusCode, err);
          }
        }
      }));
    } catch (e) {
      console.error("[notify] web push error:", e);
    }
  }
}
