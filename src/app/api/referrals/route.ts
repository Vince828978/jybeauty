import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.STORAGE_URL || process.env.DATABASE_URL || "");
}

async function ensureTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_phone TEXT NOT NULL,
    referrer_name TEXT,
    referred_phone TEXT NOT NULL,
    referred_name TEXT,
    reward_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

export async function GET() {
  try {
    await ensureTable();
    const sql = getDb();
    const referrals = await sql`SELECT * FROM referrals ORDER BY created_at DESC`;
    return NextResponse.json({ referrals });
  } catch (e) {
    return NextResponse.json({ referrals: [], error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const sql = getDb();
    await sql`INSERT INTO referrals (referrer_phone, referrer_name, referred_phone, referred_name)
      VALUES (${body.referrer_phone}, ${body.referrer_name || ""}, ${body.referred_phone}, ${body.referred_name || ""})`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id } = await request.json();
    const sql = getDb();
    await sql`UPDATE referrals SET reward_claimed = true WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
