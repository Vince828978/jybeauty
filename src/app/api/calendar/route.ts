import { NextResponse } from "next/server";
import { google } from "googleapis";

function getAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || "";
  if (!clientId || !clientSecret || !refreshToken) return null;
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");
  if (!dateStr) {
    return NextResponse.json({ error: "date param required" }, { status: 400 });
  }

  const auth = getAuth();
  if (!auth) {
    return NextResponse.json({ busySlots: [] });
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  const calendar = google.calendar({ version: "v3", auth });

  const timeMin = `${dateStr}T00:00:00+08:00`;
  const timeMax = `${dateStr}T23:59:59+08:00`;

  try {
    const res = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        timeZone: "Asia/Taipei",
        items: [{ id: calendarId }],
      },
    });

    const busy = res.data.calendars?.[calendarId]?.busy || [];
    const busySlots: string[] = [];
    const slots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

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

    return NextResponse.json({ busySlots });
  } catch (e) {
    console.error("Calendar API error:", e);
    return NextResponse.json({ busySlots: [] });
  }
}
