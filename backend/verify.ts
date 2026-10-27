import { count, sql } from 'drizzle-orm';
import { pathToFileURL } from 'node:url';
import { connectDatabase, type Database } from './database';
import * as s from './schema';
import { resultRows } from './result-rows';

export async function verifyDatabase(db: Database) {
  const counts: Record<string, number> = {};
  for (const [name, table] of Object.entries({
    users: s.users,
    movies: s.movies,
    genres: s.genres,
    movie_genres: s.movieGenres,
    cinemas: s.cinemas,
    halls: s.halls,
    seats: s.seats,
    screenings: s.screenings,
    bookings: s.bookings,
    tickets: s.tickets,
    payments: s.payments,
    favorites: s.favorites,
    notifications: s.notifications,
  })) {
    const [row] = await db.select({ count: count() }).from(table);
    counts[name] = row.count;
  }
  for (const name of [
    'screenings',
    'bookings',
    'tickets',
    'payments',
    'notifications',
  ])
    if (counts[name] < 100) throw new Error(`${name} has fewer than 100 rows.`);
  // Joins test semantic consistency in addition to PostgreSQL's FK constraints.
  const mismatch = await db.execute(sql`SELECT t.id FROM tickets t
    JOIN bookings b ON b.id = t.booking_id JOIN screenings sc ON sc.id = t.screening_id JOIN seats se ON se.id = t.seat_id
    WHERE b.screening_id <> t.screening_id OR sc.hall_id <> se.hall_id`);
  if (resultRows(mismatch).length)
    throw new Error('Ticket screening/hall mismatch.');
  const foreignKeys = await db.execute(
    sql`SELECT conname FROM pg_constraint WHERE contype = 'f' AND connamespace = 'public'::regnamespace AND convalidated = false`,
  );
  if (resultRows(foreignKeys).length)
    throw new Error('Unvalidated foreign keys.');
  const overlap =
    await db.execute(sql`SELECT a.id FROM screenings a JOIN screenings b ON a.hall_id = b.hall_id AND a.id < b.id
    JOIN movies ma ON ma.id = a.movie_id JOIN movies mb ON mb.id = b.movie_id
    WHERE a.starts_at < b.starts_at + mb.duration_minutes * interval '1 minute'
      AND b.starts_at < a.starts_at + ma.duration_minutes * interval '1 minute'`);
  if (resultRows(overlap).length)
    throw new Error('Overlapping demo screenings.');
  return counts;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const connection = await connectDatabase();
  try {
    console.table(await verifyDatabase(connection.db));
    console.log(
      'Demo counts, validated foreign keys, ticket consistency and screening times verified.',
    );
  } finally {
    await connection.close();
  }
}
