import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ensureCardTables } from "@/lib/gift-cards";

// 肉包標已付款 → 儲值卡直接入帳買家餘額 / 禮品卡等待對方輸入 code 才入帳
// POST /api/cards/mark-paid  body: { order_id, payment_method }

export async function POST(request: Request) {
  try {
    await ensureCardTables();
    const sql = getDb();
    const { order_id, payment_method } = await request.json();
    if (!order_id) return NextResponse.json({ ok: false, error: "missing order_id" }, { status: 400 });

    const orders = await sql`SELECT * FROM card_orders WHERE id = ${order_id} LIMIT 1` as Array<{
      id: number; type: string; face_value: number; buyer_phone: string;
      payment_status: string;
    }>;
    if (orders.length === 0) return NextResponse.json({ ok: false, error: "order not found" }, { status: 404 });
    const order = orders[0];
    if (order.payment_status === "paid") {
      return NextResponse.json({ ok: false, error: "已標已付，勿重複" }, { status: 400 });
    }

    await sql`UPDATE card_orders
      SET payment_status = 'paid', payment_method = ${payment_method || "linepay"}, paid_at = NOW()
      WHERE id = ${order_id}`;

    // 儲值卡：直接入買家會員餘額
    let balanceUpdated = false;
    if (order.type === "stored") {
      const bal = await sql`
        INSERT INTO card_balance (phone, balance, last_card_order_id, updated_at)
        VALUES (${order.buyer_phone}, ${order.face_value}, ${order.id}, NOW())
        ON CONFLICT (phone) DO UPDATE
        SET balance = card_balance.balance + ${order.face_value},
            last_card_order_id = ${order.id},
            updated_at = NOW()
        RETURNING balance
      ` as Array<{ balance: number }>;
      await sql`INSERT INTO card_balance_log (phone, delta, reason, ref_id, balance_after)
        VALUES (${order.buyer_phone}, ${order.face_value}, 'stored_topup', ${order.id}, ${bal[0].balance})`;
      balanceUpdated = true;
    }
    // 禮品卡：不入帳（等收禮者輸入 code 才入）

    return NextResponse.json({ ok: true, balance_updated: balanceUpdated });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
