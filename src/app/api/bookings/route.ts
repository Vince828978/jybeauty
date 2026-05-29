import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.STORAGE_URL || process.env.DATABASE_URL || "";
  return neon(url);
}

async function ensureTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    package TEXT,
    package_tier TEXT,
    addons TEXT,
    date TEXT,
    time TEXT,
    name TEXT,
    phone TEXT,
    total INTEGER,
    address TEXT,
    source TEXT DEFAULT 'online',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  // 冠 #4329 2026-05-29: 舊 table 可能漏欄；補上 IF NOT EXISTS（修上線後客戶送單但後台看不到的 bug）
  try { await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS address TEXT`; } catch {}
  try { await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS package_tier TEXT`; } catch {}
  try { await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS addons TEXT`; } catch {}
  try { await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'online'`; } catch {}
  try { await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'`; } catch {}
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const sql = getDb();
    await sql`INSERT INTO bookings (package, package_tier, addons, date, time, name, phone, total, address)
      VALUES (${body.package}, ${body.packageTier}, ${JSON.stringify(body.addons || [])}, ${body.date}, ${body.time}, ${body.name}, ${body.phone}, ${body.total}, ${body.address || ""})`;
    // sync to Google Calendar
    // 冠 #4336 2026-05-29: 之前用 VERCEL_URL fallback 導致 deployment-specific URL，
    // 改成永遠 hit 正式網址；失敗會 log 但不擋客戶送單流程
    try {
      const baseUrl = "https://www.jybeauty.tw";
      const calRes = await fetch(`${baseUrl}/api/calendar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_event",
          name: body.name,
          phone: body.phone,
          package: body.package,
          date: body.date,
          time: body.time,
          total: body.total,
          address: body.address || "",
          durationMin: body.durationMin || null,
        }),
      });
      if (!calRes.ok) {
        const txt = await calRes.text().catch(() => "");
        console.error("Calendar sync HTTP fail", calRes.status, txt);
      }
    } catch (calErr) {
      console.error("Calendar sync error (non-blocking):", calErr);
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureTable();
    const sql = getDb();
    const bookings = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;
    return NextResponse.json({ bookings });
  } catch (e) {
    return NextResponse.json({ bookings: [], error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const sql = getDb();
    await sql`DELETE FROM bookings WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    const sql = getDb();
    await sql`UPDATE bookings SET status = ${status} WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
