import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ensureCardTables } from "@/lib/gift-cards";

// 取會員餘額
export async function GET(request: Request) {
  try {
    await ensureCardTables();
    const sql = getDb();
    const url = new URL(request.url);
    const phone = url.searchParams.get("phone");
    if (!phone) return NextResponse.json({ ok: false, error: "missing phone" }, { status: 400 });

    const rows = await sql`SELECT balance FROM card_balance WHERE phone = ${phone} LIMIT 1` as Array<{ balance: number }>;
    const balance = rows.length > 0 ? rows[0].balance : 0;

    // 最近 5 筆 log
    const logs = await sql`
      SELECT * FROM card_balance_log
      WHERE phone = ${phone}
      ORDER BY created_at DESC LIMIT 10
    `;

    return NextResponse.json({ ok: true, phone, balance, logs });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
