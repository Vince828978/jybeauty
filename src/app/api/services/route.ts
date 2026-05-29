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
    is_public BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  // 冠 #4344 2026-05-29: 加 is_public 欄，true=客戶網站可見、false=只有後台手動下單看得到
  try { await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true`; } catch {}
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
    const result = await sql`INSERT INTO services (name, description, duration_min, price, category, is_active, is_public, sort_order)
      VALUES (${body.name}, ${body.description || ""}, ${body.duration_min || 60}, ${body.price}, ${body.category || "身體"}, ${body.is_active !== false}, ${body.is_public !== false}, ${body.sort_order || 0})
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
      is_public = ${body.is_public !== false},
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
