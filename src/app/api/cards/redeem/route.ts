import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ensureCardTables } from "@/lib/gift-cards";

// 肉包 #5100 2026-06-01: 禮品卡兌換 API
// POST /api/cards/redeem
// body: { code, phone }

export async function POST(request: Request) {
  try {
    await ensureCardTables();
    const sql = getDb();
    const { code, phone } = await request.json();

    if (!code || !phone) {
      return NextResponse.json({ ok: false, error: "缺 code 或 phone" }, { status: 400 });
    }

    const orders = await sql`
      SELECT * FROM card_orders WHERE code = ${code} LIMIT 1
    ` as Array<{
      id: number; type: string; face_value: number; payment_status: string;
      redeemed_at: string | null; redeemed_by_phone: string | null;
      expires_at: string;
    }>;
    if (orders.length === 0) {
      return NextResponse.json({ ok: false, error: "兌換碼不存在" }, { status: 404 });
    }
    const order = orders[0];

    if (order.type !== "gift") {
      return NextResponse.json({ ok: false, error: "此卡不是禮品卡，無需兌換" }, { status: 400 });
    }
    if (order.payment_status !== "paid") {
      return NextResponse.json({ ok: false, error: "此卡尚未付款，無法兌換" }, { status: 400 });
    }
    if (order.redeemed_at) {
      return NextResponse.json({ ok: false, error: `兌換碼已於 ${order.redeemed_at} 被 ${order.redeemed_by_phone} 兌換過` }, { status: 400 });
    }
    if (new Date(order.expires_at) < new Date()) {
      return NextResponse.json({ ok: false, error: "兌換碼已過期" }, { status: 400 });
    }

    // 入帳 + 標記已兌換
    await sql`UPDATE card_orders
      SET redeemed_at = NOW(), redeemed_by_phone = ${phone}
      WHERE id = ${order.id}`;

    // upsert balance
    const bal = await sql`
      INSERT INTO card_balance (phone, balance, last_card_order_id, updated_at)
      VALUES (${phone}, ${order.face_value}, ${order.id}, NOW())
      ON CONFLICT (phone) DO UPDATE
      SET balance = card_balance.balance + ${order.face_value},
          last_card_order_id = ${order.id},
          updated_at = NOW()
      RETURNING balance
    ` as Array<{ balance: number }>;

    await sql`INSERT INTO card_balance_log (phone, delta, reason, ref_id, balance_after)
      VALUES (${phone}, ${order.face_value}, 'gift_redeem', ${order.id}, ${bal[0].balance})`;

    return NextResponse.json({
      ok: true,
      added: order.face_value,
      new_balance: bal[0].balance,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
