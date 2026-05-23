import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.STORAGE_URL || process.env.DATABASE_URL || "");
}

async function ensureTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT DEFAULT 'percent',
    discount_value INTEGER DEFAULT 15,
    description TEXT,
    max_uses INTEGER DEFAULT 0,
    used_count INTEGER DEFAULT 0,
    expires_at TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

export async function GET() {
  try {
    await ensureTable();
    const sql = getDb();
    const coupons = await sql`SELECT * FROM coupons ORDER BY created_at DESC`;
    return NextResponse.json({ coupons });
  } catch (e) {
    return NextResponse.json({ coupons: [], error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const sql = getDb();
    await sql`INSERT INTO coupons (code, discount_type, discount_value, description, max_uses, expires_at)
      VALUES (${body.code}, ${body.discount_type || "percent"}, ${body.discount_value || 15}, ${body.description || ""}, ${body.max_uses || 0}, ${body.expires_at || ""})`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const sql = getDb();
    await sql`DELETE FROM coupons WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
