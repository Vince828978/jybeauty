/**
 * JY Beauty 通知 helper — 冠/主理人 #4864 2026-05-31
 *
 * - 寫入 notifications 表（後台紅點點 + 通知中心會顯示）
 * - 若 Vercel env 設了 TELEGRAM_BOT_TOKEN + JY_NOTIFY_CHAT_ID，會 push 到 Telegram
 * - 失敗都不擋主流程（call site 不需要 try/catch）
 */
import { neon } from "@neondatabase/serverless";

type NotifType = "booking" | "member" | "conflict" | "system";

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
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.JY_NOTIFY_CHAT_ID;
  if (token && chatId) {
    try {
      const emoji = type === "booking" ? "📅" : type === "member" ? "✨" : type === "conflict" ? "⚠️" : "🔔";
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
}
