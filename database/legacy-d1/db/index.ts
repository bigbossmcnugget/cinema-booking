import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function getD1() {
  if (!env.DB) {
    throw new Error('Cloudflare D1 binding `DB` is unavailable.');
  }
  return env.DB;
}

export function getDb() {
  return drizzle(getD1(), { schema });
}

export async function ensureDatabase() {
  const d1 = getD1();
  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY NOT NULL,
      reference TEXT NOT NULL,
      showtime_key TEXT NOT NULL,
      movie_title TEXT NOT NULL,
      city TEXT NOT NULL,
      show_date TEXT NOT NULL,
      show_time TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      total_cents INTEGER NOT NULL,
      status TEXT DEFAULT 'confirmed' NOT NULL,
      created_at INTEGER NOT NULL
    )`),
    d1.prepare('CREATE UNIQUE INDEX IF NOT EXISTS bookings_reference_unique ON bookings (reference)'),
    d1.prepare('CREATE INDEX IF NOT EXISTS idx_bookings_email_created ON bookings (customer_email, created_at)'),
    d1.prepare(`CREATE TABLE IF NOT EXISTS booking_seats (
      booking_id TEXT NOT NULL,
      showtime_key TEXT NOT NULL,
      seat TEXT NOT NULL,
      PRIMARY KEY (booking_id, seat),
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON UPDATE no action ON DELETE cascade
    )`),
    d1.prepare('CREATE UNIQUE INDEX IF NOT EXISTS booking_seats_showtime_seat_unique ON booking_seats (showtime_key, seat)'),
    d1.prepare('CREATE INDEX IF NOT EXISTS idx_booking_seats_showtime ON booking_seats (showtime_key)'),
  ]);
  await d1.prepare('PRAGMA optimize').run();
  return d1;
}
