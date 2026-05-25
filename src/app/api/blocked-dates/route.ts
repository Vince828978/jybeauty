import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.STORAGE_URL || process.env.DATABASE_URL || "";
  return neon(url);
}

async function ensureTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS blocked_dates (
    id SERIAL PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT,
    reason TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

export async function GET() {
  try {
    await ensureTable();
    const sql = getDb();
    const rows = await sql`SELECT * FROM blocked_dates ORDER BY date DESC, time`;
    return NextResponse.json({ blockedDates: rows });
  } catch (e) {
    return NextResponse.json({ blockedDates: [], error: String(e) });
  }
}
