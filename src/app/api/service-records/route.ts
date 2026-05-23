import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.STORAGE_URL || process.env.DATABASE_URL || "");
}

async function ensureTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS service_records (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER,
    customer_phone TEXT,
    customer_name TEXT,
    service_date TEXT,
    package TEXT,
    products_used TEXT,
    techniques TEXT,
    skin_condition TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

export async function GET(request: Request) {
  try {
    await ensureTable();
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const records = phone
      ? await sql`SELECT * FROM service_records WHERE customer_phone = ${phone} ORDER BY service_date DESC`
      : await sql`SELECT * FROM service_records ORDER BY service_date DESC`;
    return NextResponse.json({ records });
  } catch (e) {
    return NextResponse.json({ records: [], error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const sql = getDb();
    await sql`INSERT INTO service_records (booking_id, customer_phone, customer_name, service_date, package, products_used, techniques, skin_condition, notes)
      VALUES (${body.booking_id || 0}, ${body.customer_phone}, ${body.customer_name || ""}, ${body.service_date || ""}, ${body.package || ""}, ${body.products_used || ""}, ${body.techniques || ""}, ${body.skin_condition || ""}, ${body.notes || ""})`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
