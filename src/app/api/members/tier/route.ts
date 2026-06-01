import { NextResponse } from "next/server";
import { getDb, ensureAllTables } from "@/lib/db";
import { computeTier, currentQuarterRange, nextTierProgress, TIER_CONFIG } from "@/lib/tier";

// 肉包 #5092 2026-06-01: 取得指定會員當前等級 + 本季消費 + 下一級剩多少
// GET /api/members/tier?phone=09xxxxxxxx
export async function GET(request: Request) {
  try {
    await ensureAllTables();
    const sql = getDb();
    const url = new URL(request.url);
    const phone = url.searchParams.get("phone");
    if (!phone) {
      return NextResponse.json({ ok: false, error: "missing phone" }, { status: 400 });
    }
    const q = currentQuarterRange();
    const rows = await sql`
      SELECT COALESCE(SUM(total), 0) AS spent
      FROM bookings
      WHERE phone = ${phone}
        AND status = 'confirmed'
        AND date >= ${q.start} AND date <= ${q.end}
    ` as Array<{ spent: string | number }>;
    const spent = Number(rows[0]?.spent || 0);
    const tier = computeTier(spent);
    const progress = nextTierProgress(spent);
    return NextResponse.json({
      ok: true,
      phone,
      quarter: q,
      quarter_spent: spent,
      tier,
      tier_config: tier ? TIER_CONFIG[tier] : null,
      next_tier: progress.next,
      next_tier_remaining: progress.remaining,
      next_tier_config: progress.next ? TIER_CONFIG[progress.next] : null,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
