// 肉包 #5100/#5105 2026-06-01: 禮品卡 + 儲值卡 系統
//
// 禮品卡 (gift): 賣多少額度多少，送禮給朋友，產 unique code，對方註冊會員後輸入 code 入帳
// 儲值卡 (stored): 自用，買 10,000 送 1,000 (買萬送千，+10% bonus)，加值就用，扣到 0
//
// 共用 card_balance 表，by member_phone 累計可用額度

import { getDb } from "@/lib/db";

export type CardType = "gift" | "stored";

export const GIFT_CARD_OPTIONS: { price: number; value: number; label: string }[] = [
  { price: 1500, value: 1500, label: "體驗禮品卡" },
  { price: 3000, value: 3000, label: "暖心禮品卡" },
  { price: 5000, value: 5000, label: "療癒禮品卡" },
];

export const STORED_CARD_OPTIONS: { price: number; value: number; label: string; bonus: string }[] = [
  { price: 10000, value: 11000, label: "儲值卡 萬送千", bonus: "+10%" },
];

export async function ensureCardTables() {
  const sql = getDb();
  // 禮品卡 / 儲值卡 訂單表
  await sql`CREATE TABLE IF NOT EXISTS card_orders (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,                    -- 'gift' | 'stored'
    code TEXT UNIQUE NOT NULL,             -- 兌換碼 (gift only)
    price INTEGER NOT NULL,                -- 售價
    face_value INTEGER NOT NULL,           -- 卡內可用額度
    buyer_phone TEXT,                       -- 購買者電話
    buyer_name TEXT,                        -- 購買者姓名
    receiver_phone TEXT,                    -- 收禮者電話 (gift only, optional)
    receiver_name TEXT,                     -- 收禮者姓名 (gift only)
    message TEXT,                           -- 給收禮者的留言
    payment_status TEXT DEFAULT 'pending',  -- pending / paid / refunded
    payment_method TEXT,                    -- linepay / cash / transfer
    paid_at TIMESTAMP,
    redeemed_at TIMESTAMP,                 -- gift only: 被兌換時間
    redeemed_by_phone TEXT,                -- gift only: 被誰兌換
    expires_at TIMESTAMP,                  -- 1 年後
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  // 會員餘額表 (per phone 累計可用額度)
  await sql`CREATE TABLE IF NOT EXISTS card_balance (
    phone TEXT PRIMARY KEY,
    balance INTEGER NOT NULL DEFAULT 0,
    last_card_order_id INTEGER REFERENCES card_orders(id),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  // 餘額使用紀錄 (deduct when 預約付款用儲值)
  await sql`CREATE TABLE IF NOT EXISTS card_balance_log (
    id SERIAL PRIMARY KEY,
    phone TEXT NOT NULL,
    delta INTEGER NOT NULL,                 -- + 加值, - 扣除
    reason TEXT NOT NULL,                   -- 'gift_redeem' / 'stored_topup' / 'booking_pay' / 'refund'
    ref_id INTEGER,                          -- 對應 card_order_id 或 booking_id
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

// 產生兌換碼: 8 位英數，避開 0/O/1/I
export function generateRedeemCode(): string {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += charset[Math.floor(Math.random() * charset.length)];
  }
  return code;
}

export function expiryDateOneYear(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d;
}
