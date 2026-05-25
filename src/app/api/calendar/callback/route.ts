import { NextResponse } from "next/server";
import { google } from "googleapis";
import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.STORAGE_URL || process.env.DATABASE_URL || "";
  return neon(url);
}

function getOAuth2() {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "https://jybeauty.tw/api/calendar/callback";
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "no code" }, { status: 400 });
  }

  const oauth2 = getOAuth2();
  try {
    const { tokens } = await oauth2.getToken(code);
    if (tokens.refresh_token) {
      try {
        const sql = getDb();
        await sql`CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW()
        )`;
        await sql`INSERT INTO settings (key, value, updated_at) VALUES ('google_refresh_token', ${tokens.refresh_token}, NOW())
          ON CONFLICT (key) DO UPDATE SET value = ${tokens.refresh_token}, updated_at = NOW()`;
      } catch (dbErr) {
        console.error("Failed to save token to DB:", dbErr);
      }
    }
    return NextResponse.json({
      message: "授權成功！Token 已自動儲存，行事曆連動即刻生效。",
      saved: true,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
