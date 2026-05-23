import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.STORAGE_URL || process.env.DATABASE_URL || "";
  return neon(url);
}

async function ensureTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

export async function GET() {
  try {
    await ensureTable();
    const sql = getDb();
    const customers = await sql`SELECT c.*,
      (SELECT COUNT(*) FROM bookings b WHERE b.phone = c.phone) as booking_count,
      (SELECT COALESCE(SUM(b.total), 0) FROM bookings b WHERE b.phone = c.phone AND b.status = 'confirmed') as total_spent,
      (SELECT b.date FROM bookings b WHERE b.phone = c.phone ORDER BY b.created_at DESC LIMIT 1) as last_visit
    FROM customers c ORDER BY c.created_at DESC`;
    return NextResponse.json({ customers });
  } catch (e) {
    return NextResponse.json({ customers: [], error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const sql = getDb();
    await sql`INSERT INTO customers (name, phone, address, notes)
      VALUES (${body.name}, ${body.phone}, ${body.address || ""}, ${body.notes || ""})
      ON CONFLICT (phone) DO UPDATE SET name = ${body.name}, address = ${body.address || ""}, notes = ${body.notes || ""}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const sql = getDb();
    await sql`DELETE FROM customers WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
