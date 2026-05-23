import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.STORAGE_URL || process.env.DATABASE_URL || "");
}

async function ensureTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
}

export async function GET() {
  try {
    await ensureTable();
    const sql = getDb();
    const rows = await sql`SELECT * FROM site_content`;
    const content: Record<string, string> = {};
    for (const row of rows) {
      content[String(row.key)] = String(row.value);
    }
    return NextResponse.json({ content });
  } catch (e) {
    return NextResponse.json({ content: {}, error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const sql = getDb();
    await sql`INSERT INTO site_content (key, value) VALUES (${body.key}, ${body.value})
      ON CONFLICT (key) DO UPDATE SET value = ${body.value}, updated_at = NOW()`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
