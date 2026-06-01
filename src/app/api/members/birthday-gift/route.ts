import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// 肉包 #5092 2026-06-01: 生日禮資格檢查
// 規則：當月生日 + 該年還沒用過 = 可選 1 項免費加購
// GET /api/members/birthday-gift?phone=09xxxxxxxx

const BIRTHDAY_ADDONS = ["眼周按摩 20min", "香薰加強", "拔罐放鬆 15min", "熱敷 10min"];

export async function GET(request: Request) {
  try {
    const sql = getDb();
    const url = new URL(request.url);
    const phone = url.searchParams.get("phone");
    if (!phone) return NextResponse.json({ ok: false, error: "missing phone" }, { status: 400 });

    const rows = await sql`SELECT birthday FROM members WHERE phone = ${phone} LIMIT 1` as Array<{ birthday: string | null }>;
    if (rows.length === 0) {
      return NextResponse.json({ ok: true, eligible: false, reason: "not a member" });
    }
    const bday = rows[0].birthday;
    if (!bday) {
      return NextResponse.json({ ok: true, eligible: false, reason: "birthday not set" });
    }

    // birthday format: YYYY-MM-DD or MM-DD
    const parts = bday.split("-");
    const bdayMonth = parts.length === 3 ? parseInt(parts[1]) : parseInt(parts[0]);
    const today = new Date();
    if (bdayMonth !== today.getMonth() + 1) {
      return NextResponse.json({ ok: true, eligible: false, reason: "not birthday month", current_month: today.getMonth() + 1, birthday_month: bdayMonth });
    }

    // 檢查當年是否已用
    const used = await sql`
      SELECT id FROM birthday_gift_log
      WHERE member_phone = ${phone} AND year = ${today.getFullYear()}
      LIMIT 1
    ` as Array<{ id: number }>;
    if (used.length > 0) {
      return NextResponse.json({ ok: true, eligible: false, reason: "already used this year" });
    }

    return NextResponse.json({
      ok: true,
      eligible: true,
      birthday: bday,
      addons: BIRTHDAY_ADDONS,
      message: "🎂 生日快樂！本月預約任一服務可選 1 項免費加購",
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

// 標記已使用 (booking 完成時呼叫)
// POST /api/members/birthday-gift  body: { phone, booking_id?, addon_name? }
export async function POST(request: Request) {
  try {
    const sql = getDb();
    const { phone, booking_id, addon_name } = await request.json();
    if (!phone || !addon_name) return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });
    await sql`INSERT INTO birthday_gift_log (member_phone, booking_id, year, addon_name)
      VALUES (${phone}, ${booking_id || null}, ${new Date().getFullYear()}, ${addon_name})`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
