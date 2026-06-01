import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { notify } from "@/lib/notify";
import { computeTier, currentQuarterRange, nextTierProgress, TIER_CONFIG } from "@/lib/tier";

function getDb() {
  return neon(process.env.STORAGE_URL || process.env.DATABASE_URL || "");
}

async function ensureTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    address TEXT,
    referral_code TEXT,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  // 肉包 #5092 2026-06-01: 生日 (MM-DD 格式) + 生日禮使用紀錄
  await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS birthday TEXT`;
  await sql`CREATE TABLE IF NOT EXISTS birthday_gift_log (
    id SERIAL PRIMARY KEY,
    member_phone TEXT NOT NULL,
    booking_id INTEGER,
    used_at TIMESTAMP DEFAULT NOW(),
    year INTEGER NOT NULL,
    addon_name TEXT
  )`;
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const sql = getDb();

    if (body.action === "register") {
      const existing = await sql`SELECT id FROM members WHERE phone = ${body.phone}`;
      if (existing.length > 0) {
        return NextResponse.json({ success: false, error: "此電話已註冊" });
      }
      await sql`INSERT INTO members (name, phone, password, address, birthday) VALUES (${body.name}, ${body.phone}, ${body.password}, ${body.address || ""}, ${body.birthday || null})`;
      if (body.referral_phone) {
        await sql`INSERT INTO referrals (referrer_phone, referred_phone, referred_name) VALUES (${body.referral_phone}, ${body.phone}, ${body.name}) ON CONFLICT DO NOTHING`;
      }
      // 主理人 #4864 2026-05-31: 新會員加入通知
      const refNote = body.referral_phone ? `\n🤝 推薦人: ${body.referral_phone}` : "";
      await notify(
        "member",
        `新會員 — ${body.name}\n📞 ${body.phone}${body.address ? `\n📍 ${body.address}` : ""}${refNote}`,
        { name: body.name, phone: body.phone }
      );
      return NextResponse.json({ success: true });
    }

    if (body.action === "login") {
      const members = await sql`SELECT * FROM members WHERE phone = ${body.phone} AND password = ${body.password}`;
      if (members.length === 0) {
        return NextResponse.json({ success: false, error: "電話或密碼錯誤" });
      }
      const member = members[0];
      const bookings = await sql`SELECT * FROM bookings WHERE phone = ${body.phone} ORDER BY created_at DESC`;
      const referrals = await sql`SELECT * FROM referrals WHERE referrer_phone = ${body.phone}`;
      await sql`CREATE TABLE IF NOT EXISTS member_coupons (
        id SERIAL PRIMARY KEY,
        member_phone TEXT NOT NULL,
        code TEXT NOT NULL,
        discount_value INTEGER DEFAULT 10,
        description TEXT,
        expires_at TIMESTAMP,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )`;
      const coupons = await sql`SELECT * FROM member_coupons WHERE member_phone = ${body.phone} ORDER BY used ASC, created_at DESC`;

      // 肉包 #5092 2026-06-01: 計算本季消費 → 會員等級
      const q = currentQuarterRange();
      const spentRow = await sql`
        SELECT COALESCE(SUM(total), 0) AS spent
        FROM bookings
        WHERE phone = ${body.phone}
          AND status = 'confirmed'
          AND date >= ${q.start} AND date <= ${q.end}
      ` as Array<{ spent: string | number }>;
      const quarterSpent = Number(spentRow[0]?.spent || 0);
      const tier = computeTier(quarterSpent);
      const progress = nextTierProgress(quarterSpent);
      const tierInfo = {
        tier,
        tier_config: tier ? TIER_CONFIG[tier] : null,
        quarter: q,
        quarter_spent: quarterSpent,
        next_tier: progress.next,
        next_tier_remaining: progress.remaining,
        next_tier_config: progress.next ? TIER_CONFIG[progress.next] : null,
      };

      return NextResponse.json({ success: true, member, bookings, referralCount: referrals.length, referrals, coupons, tierInfo });
    }

    // 冠 #4456 2026-05-30: 改密碼
    if (body.action === "change_password") {
      const { phone, oldPassword, newPassword } = body;
      if (!phone || !oldPassword || !newPassword) {
        return NextResponse.json({ success: false, error: "缺少必要欄位" });
      }
      if (String(newPassword).length < 4) {
        return NextResponse.json({ success: false, error: "新密碼至少 4 字" });
      }
      const rows = await sql`SELECT id FROM members WHERE phone = ${phone} AND password = ${oldPassword}`;
      if (rows.length === 0) {
        return NextResponse.json({ success: false, error: "原密碼錯誤" });
      }
      await sql`UPDATE members SET password = ${newPassword} WHERE phone = ${phone}`;
      return NextResponse.json({ success: true });
    }

    // 冠 #4456: 移除自己邀請的推薦人 (測試/誤填)
    if (body.action === "delete_referral") {
      const { phone, referredPhone } = body;
      if (!phone || !referredPhone) {
        return NextResponse.json({ success: false, error: "缺少必要欄位" });
      }
      const r = await sql`DELETE FROM referrals WHERE referrer_phone = ${phone} AND referred_phone = ${referredPhone} RETURNING id`;
      return NextResponse.json({ success: true, deleted: r.length });
    }

    return NextResponse.json({ success: false, error: "unknown action" });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
