import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.STORAGE_URL || process.env.DATABASE_URL || "");
}

async function ensureTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    address TEXT,
    referral_code TEXT,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const sql = getDb();

    if (body.action === "register") {
      const existing = await sql`SELECT id FROM members WHERE phone = ${body.phone}`;
      if (existing.length > 0) {
        return NextResponse.json({ success: false, error: "此電話已註冊" });
      }
      await sql`INSERT INTO members (name, phone, password, address) VALUES (${body.name}, ${body.phone}, ${body.password}, ${body.address || ""})`;
      if (body.referral_phone) {
        await sql`INSERT INTO referrals (referrer_phone, referred_phone, referred_name) VALUES (${body.referral_phone}, ${body.phone}, ${body.name}) ON CONFLICT DO NOTHING`;
      }
      return NextResponse.json({ success: true });
    }

    if (body.action === "login") {
      const members = await sql`SELECT * FROM members WHERE phone = ${body.phone} AND password = ${body.password}`;
      if (members.length === 0) {
        return NextResponse.json({ success: false, error: "電話或密碼錯誤" });
      }
      const member = members[0];
      const bookings = await sql`SELECT * FROM bookings WHERE phone = ${body.phone} ORDER BY created_at DESC`;
      const referrals = await sql`SELECT * FROM referrals WHERE referrer_phone = ${body.phone}`;
      return NextResponse.json({ success: true, member, bookings, referralCount: referrals.length });
    }

    return NextResponse.json({ success: false, error: "unknown action" });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
