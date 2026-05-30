import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.STORAGE_URL || process.env.DATABASE_URL || "");
}

async function ensureTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS market_pricing_refs (
    id SERIAL PRIMARY KEY,
    sku_keyword TEXT NOT NULL,
    duration_min INTEGER,
    source_name TEXT,
    price_low INTEGER,
    price_high INTEGER,
    notes TEXT,
    photo_filename TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_market_refs_sku ON market_pricing_refs(sku_keyword)`;
}

export async function GET() {
  try {
    await ensureTable();
    const sql = getDb();
    const refs = await sql`SELECT * FROM market_pricing_refs ORDER BY sku_keyword, duration_min`;
    return NextResponse.json({ refs });
  } catch (e) {
    return NextResponse.json({ refs: [], error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const sql = getDb();
    const { sku_keyword, duration_min, source_name, price_low, price_high, notes, photo_filename } = body;
    if (!sku_keyword) {
      return NextResponse.json({ success: false, error: "sku_keyword required" }, { status: 400 });
    }
    const result = await sql`INSERT INTO market_pricing_refs
      (sku_keyword, duration_min, source_name, price_low, price_high, notes, photo_filename)
      VALUES (${sku_keyword}, ${duration_min || null}, ${source_name || ""}, ${price_low || null}, ${price_high || null}, ${notes || ""}, ${photo_filename || ""})
      RETURNING *`;
    return NextResponse.json({ success: true, ref: result[0] });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const sql = getDb();
    await sql`UPDATE market_pricing_refs SET
      sku_keyword = ${body.sku_keyword},
      duration_min = ${body.duration_min || null},
      source_name = ${body.source_name || ""},
      price_low = ${body.price_low || null},
      price_high = ${body.price_high || null},
      notes = ${body.notes || ""},
      updated_at = NOW()
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
    await sql`DELETE FROM market_pricing_refs WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
