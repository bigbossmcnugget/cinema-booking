import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { eq, sql } from 'drizzle-orm';
import type { AddressInfo } from 'node:net';
import { connectDatabase } from './database';
import { seedDatabase } from './seed';
import { verifyDatabase } from './verify';
import { createApiServer } from './server';
import { getShowDates } from '../lib/show-dates';
import { movies } from './schema';
import { tallinnDateTime } from './time';
import { resultRows } from './result-rows';
import type { Movie } from '../lib/catalog';

process.env.DB_DRIVER = 'pglite';
process.env.PGLITE_PATH = 'memory://';
const connection = await connectDatabase();
const server = createApiServer(connection.db, connection.driver);
let base = '';
const day = getShowDates('en')[0].key;
const key = `batman-1989|${day}|17:00|tallinn`;
const payload = {
  showtimeKey: key,
  customerName: 'Timo Triisa',
  customerEmail: 'timo@example.test',
  seats: ['A1'],
};
const post = (body: unknown) =>
  fetch(`${base}/api/bookings`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

before(async () => {
  await connection.migrate();
  await connection.migrate(); // Re-applying migrations must be safe.
  await seedDatabase(connection.db);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await connection.close();
});

void test('all 13 original tables, column types and foreign keys match the supplied design', async () => {
  const source = await readFile(
    new URL('../database/source/project.sql', import.meta.url),
    'utf8',
  );
  const groups = [...source.matchAll(/CREATE TABLE (\w+) \(([\s\S]*?)\n\);/g)];
  assert.equal(groups.length, 13);
  const rows = resultRows<{
    table_name: string;
    column_name: string;
    data_type: string;
    character_maximum_length: number | null;
    numeric_precision: number | null;
    numeric_scale: number | null;
    is_nullable: string;
  }>(
    await connection.db.execute(
      sql`SELECT table_name, column_name, data_type, character_maximum_length, numeric_precision, numeric_scale, is_nullable FROM information_schema.columns WHERE table_schema = 'public'`,
    ),
  );
  const refs = resultRows<{
    table_name: string;
    column_name: string;
    target_table: string;
    target_column: string;
  }>(
    await connection.db.execute(
      sql`SELECT tc.table_name, kcu.column_name, ccu.table_name AS target_table, ccu.column_name AS target_column FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.constraint_schema = kcu.constraint_schema JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name AND ccu.constraint_schema = tc.constraint_schema WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'`,
    ),
  );
  const types: Record<string, string> = {
    BIGINT: 'bigint',
    VARCHAR: 'character varying',
    DATE: 'date',
    TIMESTAMPTZ: 'timestamp with time zone',
    TEXT: 'text',
    SMALLINT: 'smallint',
    NUMERIC: 'numeric',
    BOOLEAN: 'boolean',
  };
  for (const [, table, body] of groups) {
    for (const [, column, type, size, scale, flags] of body.matchAll(
      /^    ([a-z_]+) (BIGINT|VARCHAR|DATE|TIMESTAMPTZ|TEXT|SMALLINT|NUMERIC|BOOLEAN)(?:\((\d+)(?:,(\d+))?\))?([^\n]*)/gm,
    )) {
      const row = rows.find(
        (r) => r.table_name === table && r.column_name === column,
      );
      assert(row, `${table}.${column} missing`);
      assert.equal(row.data_type, types[type], `${table}.${column} type`);
      if (type === 'VARCHAR')
        assert.equal(row.character_maximum_length, Number(size));
      if (type === 'NUMERIC') {
        assert.equal(row.numeric_precision, Number(size));
        assert.equal(row.numeric_scale, Number(scale));
      }
      const guestAmendment = table === 'bookings' && column === 'user_id';
      if (!guestAmendment && /NOT NULL|PRIMARY KEY/.test(flags))
        assert.equal(row.is_nullable, 'NO');
      const reference = flags.match(/REFERENCES (\w+)\((\w+)\)/);
      if (reference)
        assert(
          refs.some(
            (r) =>
              r.table_name === table &&
              r.column_name === column &&
              r.target_table === reference[1] &&
              r.target_column === reference[2],
          ),
          `${table}.${column} FK mismatch`,
        );
    }
  }
});
void test('Faker seed has >=100 large-table rows, validated FKs and consistent tickets', async () => {
  const counts = await verifyDatabase(connection.db);
  assert.equal(counts.screenings, 126);
  assert.equal(counts.tickets, 120);
  await assert.rejects(seedDatabase(connection.db), /empty database/);
});
void test('generated migration contains the required ORM indexes', async () => {
  const required = [
    'idx_bookings_screening',
    'idx_bookings_user_created',
    'idx_favorites_movie',
    'idx_movie_genres_genre',
    'idx_movies_filters',
    'idx_movies_release',
    'idx_movies_title',
    'idx_notifications_booking',
    'idx_notifications_user_created',
    'idx_payments_booking',
    'idx_screenings_hall_start',
    'idx_screenings_movie_start',
    'idx_tickets_booking',
    'idx_tickets_seat',
  ];
  const indexes = resultRows<{ indexname: string }>(
    await connection.db.execute(
      sql`SELECT indexname FROM pg_indexes WHERE schemaname = 'public'`,
    ),
  ).map((row) => row.indexname);
  for (const name of required)
    assert(indexes.includes(name), `Missing ORM index: ${name}`);
});
void test('catalogue is read from the database with real daily screening times', async () => {
  const response = await fetch(`${base}/api/catalog?date=${day}`);
  const data = (await response.json()) as { movies: Movie[] };
  assert.equal(data.movies.length, 3);
  const batman = data.movies.find((m) => m.id === 'batman-1989');
  assert(batman);
  assert.deepEqual(batman.times, ['17:00', '20:00']);
  const family = (await (
    await fetch(`${base}/api/catalog?date=${day}&genre=family`)
  ).json()) as { movies: Movie[] };
  assert.equal(family.movies.length, 1);
  assert.equal(
    (await fetch(`${base}/api/catalog?date=2026-02-30`)).status,
    400,
  );
});
void test('guest booking persists, price comes from the database, repeat is a conflict', async () => {
  const response = await post(payload);
  assert.equal(response.status, 201);
  const data = (await response.json()) as {
    booking: { totalCents: number; reference: string };
  };
  assert.equal(data.booking.totalCents, 700);
  assert.match(data.booking.reference, /^LUM-/);
  const seats = await fetch(
    `${base}/api/bookings?showtimeKey=${encodeURIComponent(key)}`,
  );
  assert.equal(seats.headers.get('cache-control'), 'no-store');
  assert(
    ((await seats.json()) as { occupied: string[] }).occupied.includes('A1'),
  );
  assert.equal((await post(payload)).status, 409);
});
void test('two requests for the same seat create only one booking', async () => {
  const results = await Promise.all([
    post({ ...payload, seats: ['A2'] }),
    post({ ...payload, seats: ['A2'] }),
  ]);
  assert.deepEqual(
    results.map((r) => r.status).sort((a, b) => a - b),
    [201, 409],
  );
});
void test('server rejects malformed types, forged prices, roles and invalid selections', async () => {
  for (const body of [
    null,
    { ...payload, customerName: 7 },
    { ...payload, customerEmail: 'invalid' },
    { ...payload, seats: [] },
    { ...payload, seats: ['A1', 'A1'] },
    { ...payload, seats: ['G1'] },
    { ...payload, seats: 'A1' },
    { ...payload, totalCents: 1 },
    { ...payload, role: 'ADMIN' },
  ]) {
    assert.equal((await post(body)).status, 400, JSON.stringify(body));
  }
});
void test('invented screening cannot be booked', async () => {
  assert.equal(
    (
      await post({
        ...payload,
        showtimeKey: `batman-1989|${day}|11:11|tallinn`,
      })
    ).status,
    404,
  );
});
void test('database constraints reject orphan ticket and invalid amount', async () => {
  await assert.rejects(
    connection.db.execute(
      sql`INSERT INTO tickets (booking_id,screening_id,seat_id,price,qr_code) VALUES (999999,999999,999999,7,'orphan-test')`,
    ),
  );
  await assert.rejects(
    connection.db.execute(sql`UPDATE payments SET amount = -1 WHERE id = 1`),
  );
});
void test('admin mutation is protected server-side even with a forged role header', async () => {
  const prior = process.env.ADMIN_API_TOKEN;
  const token = 'a-test-only-admin-token-at-least-32-characters';
  try {
    delete process.env.ADMIN_API_TOKEN;
    assert.equal(
      (
        await fetch(`${base}/api/admin/movies/1`, {
          method: 'PATCH',
          headers: { 'x-role': 'ADMIN' },
        })
      ).status,
      403,
    );
    process.env.ADMIN_API_TOKEN = token;
    assert.equal(
      (
        await fetch(`${base}/api/admin/movies/1`, {
          method: 'PATCH',
          headers: { authorization: 'Bearer wrong' },
        })
      ).status,
      403,
    );
    const result = await fetch(`${base}/api/admin/movies/1`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        description: 'Updated in the authorization test',
        isActive: true,
      }),
    });
    assert.equal(result.status, 200);
    const [row] = await connection.db
      .select()
      .from(movies)
      .where(eq(movies.id, 1));
    assert.equal(row.description, 'Updated in the authorization test');
  } finally {
    if (prior === undefined) delete process.env.ADMIN_API_TOKEN;
    else process.env.ADMIN_API_TOKEN = prior;
  }
});
void test('Tallinn time conversion handles summer and winter offsets', () => {
  assert.equal(
    tallinnDateTime('2026-10-27', '17:00').toISOString(),
    '2026-10-27T15:00:00.000Z',
  );
  assert.equal(
    tallinnDateTime('2026-07-01', '17:00').toISOString(),
    '2026-07-01T14:00:00.000Z',
  );
});
