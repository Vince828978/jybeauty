import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.STORAGE_URL || process.env.DATABASE_URL || "";
  return neon(url);
}

async function ensureTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS packages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    original_price INTEGER NOT NULL,
    package_price INTEGER NOT NULL,
    duration_min INTEGER NOT NULL,
    service_ids TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  // 冠 #4350 2026-05-29: 親友專案這種 — 後台肉包自己下單用、不對外
  try { await sql`ALTER TABLE packages ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true`; } catch {}
}

export async function GET() {
  try {
    await ensureTable();
    const sql = getDb();
    const packages = await sql`SELECT * FROM packages ORDER BY sort_order ASC, id ASC`;

    // Also fetch services to populate details
    let services: Record<string, unknown>[] = [];
    try {
      services = await sql`SELECT * FROM services WHERE is_active = true ORDER BY sort_order ASC, id ASC`;
    } catch {
      // services table may not exist yet
    }

    const serviceMap: Record<number, Record<string, unknown>> = {};
    for (const s of services) {
      serviceMap[Number(s.id)] = s;
    }

    const enriched = packages.map((pkg) => {
      let serviceIds: number[] = [];
      try {
        serviceIds = JSON.parse(String(pkg.service_ids));
      } catch {
        serviceIds = [];
      }
      const serviceDetails = serviceIds
        .map((id) => serviceMap[id])
        .filter(Boolean);
      return { ...pkg, serviceDetails };
    });

    return NextResponse.json({ packages: enriched });
  } catch (e) {
    return NextResponse.json({ packages: [], error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const sql = getDb();
    const serviceIds = JSON.stringify(body.service_ids || []);
    const result = await sql`INSERT INTO packages (name, description, original_price, package_price, duration_min, service_ids, is_active, is_public, sort_order)
      VALUES (${body.name}, ${body.description || ""}, ${body.original_price || 0}, ${body.package_price}, ${body.duration_min || 60}, ${serviceIds}, ${body.is_active !== false}, ${body.is_public !== false}, ${body.sort_order || 0})
      RETURNING *`;
    return NextResponse.json({ success: true, package: result[0] });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const sql = getDb();
    const serviceIds = JSON.stringify(body.service_ids || []);
    await sql`UPDATE packages SET
      name = ${body.name},
      description = ${body.description || ""},
      original_price = ${body.original_price || 0},
      package_price = ${body.package_price},
      duration_min = ${body.duration_min || 60},
      service_ids = ${serviceIds},
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
    await sql`UPDATE packages SET is_active = false WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
