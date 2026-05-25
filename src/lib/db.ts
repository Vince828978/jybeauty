import { neon } from "@neondatabase/serverless";

export function getDb() {
  const url = process.env.STORAGE_URL || process.env.DATABASE_URL || "";
  return neon(url);
}

let _initialized = false;

export async function ensureAllTables() {
  if (_initialized) return;
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    package TEXT,
    package_tier TEXT,
    addons TEXT,
    date TEXT,
    time TEXT,
    name TEXT,
    phone TEXT,
    total INTEGER,
    address TEXT,
    source TEXT DEFAULT 'online',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name TEXT,
    phone TEXT UNIQUE,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
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
  await sql`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
  _initialized = true;
}
