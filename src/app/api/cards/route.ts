import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  ensureCardTables,
  generateRedeemCode,
  expiryDateOneYear,
  GIFT_CARD_OPTIONS,
  STORED_CARD_OPTIONS,
} from "@/lib/gift-cards";
import { notify } from "@/lib/notify";

// 肉包 #5100/#5105 2026-06-01: 禮品卡 / 儲值卡 API

// GET /api/cards → 返回可購買的卡種選項 (前端展示用)
export async function GET() {
  await ensureCardTables();
  return NextResponse.json({
    ok: true,
    gift_options: GIFT_CARD_OPTIONS,
    stored_options: STORED_CARD_OPTIONS,
  });
}

// POST /api/cards → 建立卡片訂單 (購買)
// body: { type: 'gift'|'stored', price, buyer_phone, buyer_name, receiver_phone?, receiver_name?, message? }
export async function POST(request: Request) {
  try {
    await ensureCardTables();
    const body = await request.json();
    const sql = getDb();

    const type = body.type === "stored" ? "stored" : "gift";
    const price = Number(body.price || 0);

    // 驗證價格 + 算 face_value
    let faceValue = price;
    if (type === "gift") {
      const opt = GIFT_CARD_OPTIONS.find(o => o.price === price);
      if (!opt) return NextResponse.json({ ok: false, error: "禮品卡金額不在選項內" }, { status: 400 });
      faceValue = opt.value;
    } else {
      const opt = STORED_CARD_OPTIONS.find(o => o.price === price);
      if (!opt) return NextResponse.json({ ok: false, error: "儲值卡金額不在選項內" }, { status: 400 });
      faceValue = opt.value;
    }

    if (!body.buyer_phone || !body.buyer_name) {
      return NextResponse.json({ ok: false, error: "缺購買者資訊" }, { status: 400 });
    }

    const code = generateRedeemCode();
    const expires = expiryDateOneYear();

    const r = await sql`INSERT INTO card_orders
      (type, code, price, face_value, buyer_phone, buyer_name, receiver_phone, receiver_name, message, expires_at)
      VALUES (${type}, ${code}, ${price}, ${faceValue},
        ${body.buyer_phone}, ${body.buyer_name},
        ${body.receiver_phone || null}, ${body.receiver_name || null},
        ${body.message || null}, ${expires.toISOString()})
      RETURNING *`;

    // 通知 owner: 新卡片訂單
    const typeLabel = type === "gift" ? "🎁 禮品卡" : "💳 儲值卡";
    await notify(
      "card_order",
      `新卡片訂單 — ${typeLabel}\n💰 售價 NT$${price.toLocaleString()} → 額度 NT$${faceValue.toLocaleString()}\n👤 ${body.buyer_name} (${body.buyer_phone})${body.receiver_name ? `\n🎀 送給 ${body.receiver_name}` : ""}\n📝 兌換碼: ${code}`,
      { type, price, code }
    );

    return NextResponse.json({ ok: true, card: r[0] });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
