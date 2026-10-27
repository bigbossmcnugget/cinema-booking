import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import { ZodError } from 'zod';
import { pathToFileURL } from 'node:url';
import { connectDatabase, type Database } from './database';
import {
  ApiError,
  createBooking,
  dateInput,
  movieEdit,
  readCatalogue,
  readSeats,
} from './service';
import { movies } from './schema';
import { getShowDates } from '../lib/show-dates';

async function readJSON(request: IncomingMessage) {
  const buffers: Buffer[] = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > 16384) throw new ApiError(413, 'Request body too large.');
    buffers.push(Buffer.from(chunk));
  }
  try {
    return JSON.parse(Buffer.concat(buffers).toString('utf8')) as unknown;
  } catch {
    throw new ApiError(400, 'Invalid JSON.');
  }
}

function requireAdmin(request: IncomingMessage) {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token || token.length < 32)
    throw new ApiError(403, 'Administration is disabled.');
  const actual = Buffer.from(request.headers.authorization || '');
  const expected = Buffer.from(`Bearer ${token}`);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    throw new ApiError(403, 'Admin authorization required.');
}

export function createApiServer(db: Database, driver: string) {
  return createServer(
    async (request: IncomingMessage, response: ServerResponse) => {
      const reply = (data: unknown, status = 200) => {
        response.writeHead(status, {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff',
        });
        response.end(JSON.stringify(data));
      };
      try {
        const url = new URL(request.url || '/', 'http://127.0.0.1');
        if (request.method === 'GET' && url.pathname === '/api/health') {
          await db.execute(sql`SELECT 1`);
          return reply({ ok: true, database: 'connected', driver });
        }
        if (request.method === 'GET' && url.pathname === '/api/catalog') {
          const day = dateInput.parse(
            url.searchParams.get('date') || getShowDates('en')[0].key,
          );
          const query = (url.searchParams.get('q') || '').trim().slice(0, 100);
          const genre = url.searchParams.get('genre') || '';
          return reply({
            movies: await readCatalogue(db, day, query, genre),
            date: day,
          });
        }
        if (request.method === 'GET' && url.pathname === '/api/bookings')
          return reply(
            await readSeats(db, url.searchParams.get('showtimeKey')),
          );
        if (request.method === 'POST' && url.pathname === '/api/bookings')
          return reply(await createBooking(db, await readJSON(request)), 201);
        if (url.pathname.startsWith('/api/admin/')) {
          // This guard runs on the server in every mode, before parsing or mutation.
          requireAdmin(request);
          const match = url.pathname.match(
            /^\/api\/admin\/movies\/([1-9][0-9]*)$/,
          );
          if (request.method === 'PATCH' && match) {
            const id = Number(match[1]);
            if (!Number.isSafeInteger(id))
              throw new ApiError(400, 'Invalid movie ID.');
            const update = movieEdit.parse(await readJSON(request));
            const rows = await db
              .update(movies)
              .set({ ...update, updatedAt: new Date() })
              .where(eq(movies.id, id))
              .returning({ id: movies.id });
            if (!rows.length) throw new ApiError(404, 'Movie not found.');
            return reply({ ok: true, movie: rows[0] });
          }
        }
        return reply({ ok: false, error: 'Endpoint not found.' }, 404);
      } catch (error) {
        if (error instanceof ZodError)
          return reply(
            {
              ok: false,
              error: 'Invalid request data.',
              fields: error.issues.map((i) => i.path.join('.')),
            },
            400,
          );
        if (error instanceof ApiError)
          return reply({ ok: false, error: error.message }, error.status);
        console.error(
          'API operation failed:',
          error instanceof Error ? error.message : 'Unknown failure',
        );
        return reply(
          { ok: false, error: 'Database temporarily unavailable.' },
          503,
        );
      }
    },
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const connection = await connectDatabase();
  const server = createApiServer(connection.db, connection.driver);
  server.listen(Number(process.env.API_PORT || 3001), '127.0.0.1', () =>
    console.log(
      `Cinema API: http://127.0.0.1:${process.env.API_PORT || 3001} (${connection.driver})`,
    ),
  );
  const stop = () =>
    server.close(() => {
      void connection.close().then(() => process.exit(0));
    });
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}
