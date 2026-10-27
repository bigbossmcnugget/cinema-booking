import { and, asc, eq, gte, ilike, inArray, lt, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { Database } from './database';
import * as s from './schema';
import { movies as copy, type Movie } from '../lib/catalog';
import { localTime, nextDay, tallinnDateTime } from './time';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const dateInput = z.iso.date();
const keyInput = z
  .string()
  .max(150)
  .regex(/^[a-z0-9-]+\|\d{4}-\d{2}-\d{2}\|(?:[01]\d|2[0-3]):[0-5]\d\|tallinn$/);
const bookingInput = z
  .object({
    showtimeKey: keyInput,
    customerName: z.string().trim().min(2).max(80),
    customerEmail: z
      .email()
      .max(255)
      .transform((s) => s.toLowerCase()),
    seats: z
      .array(z.string().regex(/^[A-F](10|[1-9])$/))
      .min(1)
      .max(10)
      .refine((a) => new Set(a).size === a.length, 'Duplicate seats'),
  })
  .strict();
// Only these properties can be changed; clients cannot set role, price or booking status.
export const movieEdit = z
  .object({
    description: z.string().trim().min(1).max(5000),
    isActive: z.boolean(),
  })
  .strict();

export async function readCatalogue(
  db: Database,
  date: string,
  query = '',
  genre = '',
): Promise<Movie[]> {
  dateInput.parse(date);
  const rows = await db
    .select({ movie: s.movies, show: s.screenings })
    .from(s.movies)
    .innerJoin(s.screenings, eq(s.movies.id, s.screenings.movieId))
    .where(
      and(
        eq(s.movies.isActive, true),
        eq(s.screenings.status, 'SCHEDULED'),
        gte(s.screenings.startsAt, tallinnDateTime(date)),
        lt(s.screenings.startsAt, tallinnDateTime(nextDay(date))),
        query ? ilike(s.movies.title, `${query}%`) : undefined,
      ),
    )
    .orderBy(asc(s.movies.title), asc(s.screenings.startsAt));
  const tagged = await db
    .select({ movieId: s.movieGenres.movieId, name: s.genres.name })
    .from(s.movieGenres)
    .innerJoin(s.genres, eq(s.movieGenres.genreId, s.genres.id));
  const result = new Map<number, Movie>();
  for (const { movie, show } of rows) {
    const template = copy.find((m) => m.title === movie.originalTitle);
    if (!template) continue;
    const tags = tagged
      .filter((g) => g.movieId === movie.id)
      .map((g) => g.name);
    if (genre && !tags.includes(genre)) continue;
    const current = result.get(movie.id);
    if (current) current.times.push(localTime(show.startsAt));
    else
      result.set(movie.id, {
        ...template,
        title: movie.title,
        description: movie.description,
        image: movie.posterUrl || template.image,
        backdrop: movie.posterUrl || template.image,
        price: Number(show.basePrice),
        times: [localTime(show.startsAt)],
      });
  }
  return [...result.values()];
}

async function findShow(db: Database, key: unknown) {
  const valid = keyInput.parse(key);
  const [slug, day, time] = valid.split('|');
  dateInput.parse(day);
  const template = copy.find((m) => m.id === slug);
  if (!template) throw new ApiError(404, 'Film not found.');
  const rows = await db
    .select({
      show: s.screenings,
      movie: s.movies,
      hall: s.halls,
      cinema: s.cinemas,
    })
    .from(s.screenings)
    .innerJoin(s.movies, eq(s.movies.id, s.screenings.movieId))
    .innerJoin(s.halls, eq(s.halls.id, s.screenings.hallId))
    .innerJoin(s.cinemas, eq(s.cinemas.id, s.halls.cinemaId))
    .where(
      and(
        eq(s.movies.originalTitle, template.title),
        eq(s.screenings.startsAt, tallinnDateTime(day, time)),
        eq(s.cinemas.city, 'Tallinn'),
        eq(s.movies.isActive, true),
        eq(s.halls.isActive, true),
        eq(s.cinemas.isActive, true),
        eq(s.screenings.status, 'SCHEDULED'),
      ),
    )
    .limit(1);
  if (!rows.length) throw new ApiError(404, 'Screening not found.');
  return rows[0];
}

export async function readSeats(db: Database, key: unknown) {
  const { show, hall } = await findShow(db, key);
  const rows = await db
    .select({ row: s.seats.rowLabel, number: s.seats.seatNumber })
    .from(s.tickets)
    .innerJoin(s.seats, eq(s.tickets.seatId, s.seats.id))
    .where(eq(s.tickets.screeningId, show.id));
  return {
    ok: true,
    occupied: rows.map((r) => `${r.row}${r.number}`),
    hall: hall.name,
    price: Number(show.basePrice),
  };
}

export async function createBooking(db: Database, raw: unknown) {
  const input = bookingInput.parse(raw);
  try {
    return await db.transaction(async (tx) => {
      const { show } = await findShow(tx, input.showtimeKey);
      const available = await tx
        .select()
        .from(s.seats)
        .where(
          and(eq(s.seats.hallId, show.hallId), eq(s.seats.isActive, true)),
        );
      const chosen = input.seats.map((label) =>
        available.find(
          (seat) => `${seat.rowLabel}${seat.seatNumber}` === label,
        ),
      );
      if (chosen.some((seat) => !seat))
        throw new ApiError(400, 'Seat does not belong to this screening hall.');
      const selected = chosen.filter(
        (seat): seat is (typeof available)[number] => !!seat,
      );
      const conflict = await tx
        .select({ id: s.tickets.id })
        .from(s.tickets)
        .where(
          and(
            eq(s.tickets.screeningId, show.id),
            inArray(
              s.tickets.seatId,
              selected.map((seat) => seat.id),
            ),
          ),
        );
      if (conflict.length)
        throw new ApiError(
          409,
          'One of these seats has been booked. Choose another seat.',
        );
      // PostgreSQL numeric math avoids accepting a client-supplied price or float totals.
      const reference = `LUM-${crypto.randomUUID().toUpperCase()}`;
      const [booking] = await tx
        .insert(s.bookings)
        .values({
          screeningId: show.id,
          reference,
          guestName: input.customerName,
          guestEmail: input.customerEmail,
          totalAmount: sql`${show.basePrice}::numeric * ${selected.length}`,
          status: 'PENDING',
        })
        .returning();
      await tx
        .insert(s.tickets)
        .values(
          selected.map((seat) => ({
            bookingId: booking.id,
            screeningId: show.id,
            seatId: seat.id,
            price: show.basePrice,
            qrCode: `DEMO-${crypto.randomUUID()}`,
          })),
        );
      return {
        ok: true,
        booking: {
          reference,
          seats: input.seats,
          totalCents: Math.round(Number(booking.totalAmount) * 100),
          status: booking.status,
        },
      };
    });
  } catch (error) {
    const cause =
      error instanceof Error && 'cause' in error ? error.cause : error;
    if (
      cause &&
      typeof cause === 'object' &&
      'code' in cause &&
      cause.code === '23505'
    )
      throw new ApiError(
        409,
        'One of these seats has been booked. Choose another seat.',
      );
    throw error;
  }
}
