import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = "/tmp/jybeauty-bookings.json";

function readBookings() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function writeBookings(bookings: unknown[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2));
}

export async function POST(request: Request) {
  const body = await request.json();
  const booking = {
    id: Date.now().toString(),
    ...body,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  const bookings = readBookings();
  bookings.push(booking);
  writeBookings(bookings);

  return NextResponse.json({ success: true, booking });
}

export async function GET() {
  const bookings = readBookings();
  return NextResponse.json({ bookings });
}
