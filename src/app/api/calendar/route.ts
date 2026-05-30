import { NextResponse } from "next/server";
import { google } from "googleapis";
import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.STORAGE_URL || process.env.DATABASE_URL || "";
  return neon(url);
}

async function ensureSettingsTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
}

async function getAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  let refreshToken = "";
  try {
    await ensureSettingsTable();
    const sql = getDb();
    const row = await sql`SELECT value FROM settings WHERE key = 'google_refresh_token'`;
    if (row.length > 0) refreshToken = row[0].value;
  } catch (e) { console.error("Settings query error:", e); }
  if (!refreshToken) refreshToken = process.env.GOOGLE_REFRESH_TOKEN || "";
  if (!clientId || !clientSecret || !refreshToken) return null;
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

async function ensureBlockedTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS blocked_dates (
    id SERIAL PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT,
    end_time TEXT,
    reason TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  // 冠 #4320 2026-05-29: 既有 table 補 end_time column
  try { await sql`ALTER TABLE blocked_dates ADD COLUMN IF NOT EXISTS end_time TEXT`; } catch {}
  await sql`CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    data TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

// 冠 #4409 2026-05-30: 每筆預約後加 40 分鐘 buffer（肉包收拾+移動安全時間）
const BUFFER_MIN = 40;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");
  if (!dateStr) {
    return NextResponse.json({ error: "date param required" }, { status: 400 });
  }
  // 服務時長（分鐘），預設 60；用於衝突計算 + 末班排除
  const durMin = Math.max(10, Math.min(480, parseInt(searchParams.get("dur") || "60") || 60));

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  const busySlots: string[] = [];
  // 10 分鐘為單位的時段；確保 (slot + durMin) 不超過 20:00 (1200 分鐘)
  const slots: string[] = [];
  for (let h = 10; h <= 20; h++) {
    for (let m = 0; m < 60; m += 10) {
      if (h === 20 && m > 0) break;
      const slotMin = h * 60 + m;
      if (slotMin + durMin > 20 * 60) break;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }

  const auth = await getAuth();
  if (auth) {
    try {
      const calendar = google.calendar({ version: "v3", auth });
      const res = await calendar.freebusy.query({
        requestBody: {
          timeMin: `${dateStr}T00:00:00+08:00`,
          timeMax: `${dateStr}T23:59:59+08:00`,
          timeZone: "Asia/Taipei",
          items: [{ id: calendarId }],
        },
      });
      const busy = res.data.calendars?.[calendarId]?.busy || [];
      for (const slot of slots) {
        const slotStart = new Date(`${dateStr}T${slot}:00+08:00`);
        const slotEnd = new Date(slotStart.getTime() + durMin * 60 * 1000);
        const isBlocked = busy.some((b) => {
          const busyStart = new Date(b.start!);
          // 既有預約 end 多卡 40 分鐘 buffer (冠 #4409)
          const busyEnd = new Date(new Date(b.end!).getTime() + BUFFER_MIN * 60 * 1000);
          return slotStart < busyEnd && slotEnd > busyStart;
        });
        if (isBlocked) busySlots.push(slot);
      }
    } catch (e) {
      console.error("Calendar API error:", e);
    }
  }

  try {
    await ensureBlockedTable();
    const sql = getDb();
    // 冠 #4320 2026-05-29: 撈 time + end_time，若有 end_time 表示範圍封鎖
    const blocked = await sql`SELECT time, end_time FROM blocked_dates WHERE date = ${dateStr}`;
    for (const row of blocked) {
      if (row.time === null || row.time === "all") {
        return NextResponse.json({ busySlots: slots, blockedAll: true });
      }
      if (row.end_time) {
        // 範圍封鎖：把區間內所有 slot 都加進 busy（含可預約服務時長重疊 + 40 buffer）
        const [bsH, bsM] = String(row.time).split(":").map(Number);
        const [beH, beM] = String(row.end_time).split(":").map(Number);
        const blockStartMin = bsH * 60 + bsM;
        // 冠 #4409: 後台封鎖區間後也加 40 buffer
        const blockEndMin = beH * 60 + beM + BUFFER_MIN;
        for (const slot of slots) {
          const [sh, sm] = slot.split(":").map(Number);
          const slotStart = sh * 60 + sm;
          const slotEnd = slotStart + durMin;
          // 任何重疊都不可預約
          if (slotStart < blockEndMin && slotEnd > blockStartMin) {
            if (!busySlots.includes(slot)) busySlots.push(slot);
          }
        }
      } else {
        // 舊資料：單一時段
        if (!busySlots.includes(row.time)) busySlots.push(row.time);
      }
    }
  } catch (e) {
    console.error("Blocked dates query error:", e);
  }

  return NextResponse.json({ busySlots, bufferMin: BUFFER_MIN });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action } = body;

  if (action === "create_event") {
    const auth = await getAuth();
    if (!auth) return NextResponse.json({ error: "Calendar not configured" }, { status: 500 });
    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
    const calendar = google.calendar({ version: "v3", auth });
    try {
      const event = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: `JY Beauty 預約 - ${body.name}`,
          description: `套餐：${body.package}\n電話：${body.phone}\n金額：$${body.total}\n地址：${body.address || "工作室"}`,
          start: { dateTime: `${body.date}T${body.time}:00+08:00`, timeZone: "Asia/Taipei" },
          end: { dateTime: (() => {
            // 優先用傳進來的 durationMin；沒有的話 fallback 到 package map (分鐘)
            const durMap: Record<string, number> = {
              "精油舒壓按摩 90min": 90, "精油按摩＋熱石 120min": 120,
              "舒壓放鬆套餐": 120, "能量煥膚套餐": 150, "極致寵愛套餐": 180,
            };
            const durMin = Math.max(10, Math.min(480, parseInt(body.durationMin) || durMap[body.package] || 120));
            const [hh, mm] = String(body.time).split(":").map((v: string) => parseInt(v));
            const startTotal = hh * 60 + mm;
            const endTotal = startTotal + durMin;
            const eh = Math.floor(endTotal / 60);
            const em = endTotal % 60;
            return `${body.date}T${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}:00+08:00`;
          })(), timeZone: "Asia/Taipei" },
          colorId: "6",
        },
      });
      return NextResponse.json({ success: true, eventId: event.data.id });
    } catch (e) {
      console.error("Create event error:", e);
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  if (action === "delete_event") {
    const auth = await getAuth();
    if (!auth) return NextResponse.json({ error: "Calendar not configured" }, { status: 500 });
    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
    const calendar = google.calendar({ version: "v3", auth });
    try {
      await calendar.events.delete({ calendarId, eventId: body.eventId });
      return NextResponse.json({ success: true });
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  if (action === "check_conflicts") {
    const auth = await getAuth();
    if (!auth) return NextResponse.json({ conflicts: [] });
    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
    const calendar = google.calendar({ version: "v3", auth });
    try {
      const sql = getDb();
      const bookings = await sql`SELECT * FROM bookings WHERE status = 'pending' OR status = 'confirmed'`;
      const conflicts: Array<{ bookingId: number; date: string; time: string; reason: string }> = [];
      for (const b of bookings) {
        const res = await calendar.freebusy.query({
          requestBody: {
            timeMin: `${b.date}T${b.time}:00+08:00`,
            timeMax: `${b.date}T${String(parseInt(b.time) + 2).padStart(2, "0")}:00:00+08:00`,
            timeZone: "Asia/Taipei",
            items: [{ id: calendarId }],
          },
        });
        const busy = res.data.calendars?.[calendarId]?.busy || [];
        if (busy.length > 0) {
          conflicts.push({ bookingId: b.id, date: b.date, time: b.time, reason: "與行事曆行程衝突" });
        }
      }
      if (conflicts.length > 0) {
        await ensureBlockedTable();
        for (const c of conflicts) {
          await sql`INSERT INTO notifications (type, message, data)
            VALUES ('conflict', ${`預約 #${c.bookingId} (${c.date} ${c.time}) ${c.reason}`}, ${JSON.stringify(c)})`;
        }
      }
      return NextResponse.json({ conflicts });
    } catch (e) {
      console.error("Conflict check error:", e);
      return NextResponse.json({ conflicts: [], error: String(e) });
    }
  }

  if (action === "block_dates") {
    try {
      await ensureBlockedTable();
      const sql = getDb();
      const dates: string[] = body.dates || [body.date];
      const reason = body.reason || "手動關閉";
      // 冠 #4320 2026-05-29: 支援 startTime + endTime 範圍封鎖；舊 payload {time} 仍相容
      const startTime: string | null = body.startTime || null;
      const endTime: string | null = body.endTime || null;
      const legacyTime: string = body.time || "all";
      for (const d of dates) {
        if (startTime && endTime) {
          await sql`INSERT INTO blocked_dates (date, time, end_time, reason) VALUES (${d}, ${startTime}, ${endTime}, ${reason})`;
        } else {
          await sql`INSERT INTO blocked_dates (date, time, end_time, reason) VALUES (${d}, ${legacyTime}, ${null}, ${reason})`;
        }
      }
      return NextResponse.json({ success: true });
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  if (action === "unblock_date") {
    try {
      await ensureBlockedTable();
      const sql = getDb();
      if (body.id) {
        await sql`DELETE FROM blocked_dates WHERE id = ${body.id}`;
      } else {
        await sql`DELETE FROM blocked_dates WHERE date = ${body.date} AND (time = ${body.time || "all"} OR time IS NULL)`;
      }
      return NextResponse.json({ success: true });
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
