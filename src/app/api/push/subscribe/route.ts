import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.STORAGE_URL || process.env.DATABASE_URL || "");
}

async function ensureTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    endpoint TEXT UNIQUE NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const sub = await request.json();
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return NextResponse.json({ ok: false, error: "invalid subscription" }, { status: 400 });
    }
    const ua = request.headers.get("user-agent")?.slice(0, 200) || null;
    const sql = getDb();
    await sql`INSERT INTO push_subscriptions (endpoint, p256dh, auth, user_agent)
      VALUES (${sub.endpoint}, ${sub.keys.p256dh}, ${sub.keys.auth}, ${ua})
      ON CONFLICT (endpoint) DO UPDATE SET
        p256dh=EXCLUDED.p256dh, auth=EXCLUDED.auth, user_agent=EXCLUDED.user_agent`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureTable();
    const { endpoint } = await request.json();
    if (!endpoint) return NextResponse.json({ ok: false }, { status: 400 });
    const sql = getDb();
    await sql`DELETE FROM push_subscriptions WHERE endpoint=${endpoint}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureTable();
    const sql = getDb();
    const rows = await sql`SELECT id, endpoint, user_agent, created_at FROM push_subscriptions ORDER BY id`;
    return NextResponse.json({ subscriptions: rows, vapid_set: !!process.env.VAPID_PUBLIC_KEY });
  } catch (e) {
    return NextResponse.json({ subscriptions: [], error: String(e) }, { status: 500 });
  }
}
