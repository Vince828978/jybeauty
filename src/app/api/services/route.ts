import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.STORAGE_URL || process.env.DATABASE_URL || "";
  return neon(url);
}

async function ensureTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    duration_min INTEGER NOT NULL DEFAULT 60,
    price INTEGER NOT NULL,
    category TEXT DEFAULT '身體',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

export async function GET() {
  try {
    await ensureTable();
    const sql = getDb();
    const services = await sql`SELECT * FROM services ORDER BY sort_order ASC, id ASC`;
    return NextResponse.json({ services });
  } catch (e) {
    return NextResponse.json({ services: [], error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const sql = getDb();
    const result = await sql`INSERT INTO services (name, description, duration_min, price, category, is_active, sort_order)
      VALUES (${body.name}, ${body.description || ""}, ${body.duration_min || 60}, ${body.price}, ${body.category || "身體"}, ${body.is_active !== false}, ${body.sort_order || 0})
      RETURNING *`;
    return NextResponse.json({ success: true, service: result[0] });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const sql = getDb();
    await sql`UPDATE services SET
      name = ${body.name},
      description = ${body.description || ""},
      duration_min = ${body.duration_min || 60},
      price = ${body.price},
      category = ${body.category || "身體"},
      is_active = ${body.is_active !== false},
      sort_order = ${body.sort_order || 0}
      WHERE id = ${body.id}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureTable();
    const { id } = await request.json();
    const sql = getDb();
    await sql`UPDATE services SET is_active = false WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
