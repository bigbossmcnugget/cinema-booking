import { faker } from '@faker-js/faker';
import { count } from 'drizzle-orm';
import { pathToFileURL } from 'node:url';
import { connectDatabase, type Database } from './database';
import * as s from './schema';
import { movies as catalogue } from '../lib/catalog';
import { getShowDates } from '../lib/show-dates';
import { nextDay, tallinnDateTime } from './time';

export async function seedDatabase(db: Database) {
  const [existing] = await db.select({ count: count() }).from(s.movies);
  if (existing.count)
    throw new Error(
      'Seed requires an empty database. Existing data is preserved. Use a separate demo database to seed again.',
    );
  faker.seed(2408);
  // All inserts are one transaction: a failed seed leaves no half-created dataset.
  await db.transaction(async (tx) => {
    const people = await tx
      .insert(s.users)
      .values(
        Array.from({ length: 100 }, (_, i) => ({
          email: `student${i + 1}@example.test`,
          passwordHash: '!disabled-demo-account',
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          birthDate: faker.date
            .birthdate({ min: 18, max: 70, mode: 'age' })
            .toISOString()
            .slice(0, 10),
          role: 'CUSTOMER',
        })),
      )
      .returning();
    const filmRows = await tx
      .insert(s.movies)
      .values(
        catalogue.map((m) => ({
          title: m.title,
          originalTitle: m.title,
          description: m.description,
          durationMinutes: Number(m.meta.match(/(\d+) min/)![1]),
          releaseDate: `${m.badge}-01-01`,
          ageRating: m.id === 'lego-movie' ? 0 : 12,
          originalLanguage: 'en',
          posterUrl: m.image,
          criticsRating: faker.number.int({ min: 60, max: 95 }).toFixed(1),
        })),
      )
      .returning();
    const genreRows = await tx
      .insert(s.genres)
      .values([{ name: 'superhero' }, { name: 'family' }])
      .returning();
    await tx
      .insert(s.movieGenres)
      .values(
        filmRows.map((film, i) => ({
          movieId: film.id,
          genreId: genreRows[catalogue[i].genre[0] === 'family' ? 1 : 0].id,
        })),
      );
    const [cinema] = await tx
      .insert(s.cinemas)
      .values({
        name: 'Lumen Rotermann',
        city: 'Tallinn',
        address: 'Rotermanni 8, Tallinn',
      })
      .returning();
    const rooms = await tx
      .insert(s.halls)
      .values([
        { cinemaId: cinema.id, name: 'Hall 1' },
        { cinemaId: cinema.id, name: 'Hall 2' },
      ])
      .returning();
    const chairs = await tx
      .insert(s.seats)
      .values(
        rooms.flatMap((hall) =>
          ['A', 'B', 'C', 'D', 'E', 'F'].flatMap((row) =>
            Array.from({ length: 10 }, (_, i) => ({
              hallId: hall.id,
              rowLabel: row,
              seatNumber: i + 1,
              seatType: 'STANDARD',
            })),
          ),
        ),
      )
      .returning();
    const today = getShowDates('en')[0].key;
    const programme = [
      [0, 0, '17:00'],
      [0, 0, '20:00'],
      [1, 1, '12:00'],
      [1, 1, '15:00'],
      [2, 1, '18:00'],
      [2, 1, '21:00'],
    ] as const;
    const shows = await tx
      .insert(s.screenings)
      .values(
        Array.from({ length: 21 }, (_, day) =>
          programme.map(([movie, hall, time]) => ({
            movieId: filmRows[movie].id,
            hallId: rooms[hall].id,
            startsAt: tallinnDateTime(nextDay(today, day), time),
            movieFormat: '2D',
            audioLanguage: 'en',
            subtitleLanguage: 'et',
            basePrice: catalogue[movie].price.toFixed(2),
          })),
        ).flat(),
      )
      .returning();
    for (let i = 0; i < 120; i++) {
      // Historical seed payments are explicitly simulated, never sent to a provider.
      const show = shows[i];
      const [booking] = await tx
        .insert(s.bookings)
        .values({
          userId: people[i % people.length].id,
          screeningId: show.id,
          reference: `SEED-${String(i + 1).padStart(4, '0')}`,
          status: 'PAID',
          totalAmount: show.basePrice,
        })
        .returning();
      const chair = chairs.find(
        (c) =>
          c.hallId === show.hallId && c.rowLabel === 'F' && c.seatNumber === 10,
      )!;
      await tx
        .insert(s.tickets)
        .values({
          bookingId: booking.id,
          screeningId: show.id,
          seatId: chair.id,
          price: show.basePrice,
          qrCode: `DEMO-${faker.string.uuid()}`,
        });
      await tx
        .insert(s.payments)
        .values({
          bookingId: booking.id,
          amount: show.basePrice,
          status: 'COMPLETED',
          paymentMethod: 'DEMO_ONLY',
          providerReference: `DEMO-${faker.string.uuid()}`,
          paidAt: show.startsAt,
        });
      await tx
        .insert(s.notifications)
        .values({
          userId: people[i % people.length].id,
          bookingId: booking.id,
          message: `Demo booking: ${faker.lorem.sentence()}`,
        });
    }
    await tx
      .insert(s.favorites)
      .values(
        people.map((person, i) => ({
          userId: person.id,
          movieId: filmRows[i % filmRows.length].id,
        })),
      );
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const connection = await connectDatabase();
  try {
    await seedDatabase(connection.db);
    console.log(
      'Seeded: 100 users, 126 screenings, 120 seats, 120 bookings/tickets/payments/notifications, 100 favorites.',
    );
  } finally {
    await connection.close();
  }
}
