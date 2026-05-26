import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.STORAGE_URL || process.env.DATABASE_URL || "");
}

async function ensureTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS member_coupons (
    id SERIAL PRIMARY KEY,
    member_phone TEXT NOT NULL,
    code TEXT NOT NULL,
    discount_value INTEGER DEFAULT 10,
    description TEXT,
    expires_at TIMESTAMP,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

export async function GET() {
  try {
    await ensureTable();
    const sql = getDb();
    const coupons = await sql`SELECT * FROM member_coupons ORDER BY created_at DESC`;
    return NextResponse.json({ coupons });
  } catch (e) {
    return NextResponse.json({ coupons: [], error: String(e) });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const sql = getDb();
    const code = body.code || `JYB${Date.now().toString(36).toUpperCase()}`;
    await sql`INSERT INTO member_coupons (member_phone, code, discount_value, description, expires_at)
      VALUES (${body.phone}, ${code}, ${body.discount_value || 10}, ${body.description || ""}, ${body.expires_at || null})`;
    return NextResponse.json({ success: true, code });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
