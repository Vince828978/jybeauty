import { NextResponse } from "next/server";
import { google } from "googleapis";
import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.STORAGE_URL || process.env.DATABASE_URL || "";
  return neon(url);
}

function getAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || "";
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
    reason TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    data TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");
  if (!dateStr) {
    return NextResponse.json({ error: "date param required" }, { status: 400 });
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  const busySlots: string[] = [];
  const slots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

  const auth = getAuth();
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
        const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
        const isBlocked = busy.some((b) => {
          const busyStart = new Date(b.start!);
          const busyEnd = new Date(b.end!);
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
    const blocked = await sql`SELECT time FROM blocked_dates WHERE date = ${dateStr}`;
    for (const row of blocked) {
      if (row.time === null || row.time === "all") {
        return NextResponse.json({ busySlots: slots, blockedAll: true });
      }
      if (!busySlots.includes(row.time)) busySlots.push(row.time);
    }
  } catch (e) {
    console.error("Blocked dates query error:", e);
  }

  return NextResponse.json({ busySlots });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action } = body;

  if (action === "create_event") {
    const auth = getAuth();
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
          end: { dateTime: `${body.date}T${String(parseInt(body.time) + 2).padStart(2, "0")}:00:00+08:00`, timeZone: "Asia/Taipei" },
          colorId: "6",
        },
      });
      return NextResponse.json({ success: true, eventId: event.data.id });
    } catch (e) {
      console.error("Create event error:", e);
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  if (action === "check_conflicts") {
    const auth = getAuth();
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
      const time = body.time || "all";
      const reason = body.reason || "手動關閉";
      for (const d of dates) {
        await sql`INSERT INTO blocked_dates (date, time, reason) VALUES (${d}, ${time}, ${reason})`;
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
