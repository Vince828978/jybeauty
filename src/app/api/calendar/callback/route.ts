import { NextResponse } from "next/server";
import { google } from "googleapis";

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
    return NextResponse.json({
      message: "授權成功！請將下方 refresh_token 設定到 Vercel 環境變數 GOOGLE_REFRESH_TOKEN",
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
