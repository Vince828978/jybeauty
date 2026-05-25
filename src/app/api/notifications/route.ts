import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

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

export async function GET() {
  try {
    await ensureTable();
    const sql = getDb();
    const all = await sql`SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50`;
    const unread = await sql`SELECT COUNT(*) as count FROM notifications WHERE read = false`;
    return NextResponse.json({ notifications: all, unreadCount: Number(unread[0]?.count || 0) });
  } catch (e) {
    return NextResponse.json({ notifications: [], unreadCount: 0, error: String(e) });
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureTable();
    const { id, readAll } = await request.json();
    const sql = getDb();
    if (readAll) {
      await sql`UPDATE notifications SET read = true WHERE read = false`;
    } else if (id) {
      await sql`UPDATE notifications SET read = true WHERE id = ${id}`;
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
