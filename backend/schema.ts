import { relations, sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  date,
  index,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';

const id = () =>
  bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity();
const fk = (name: string) => bigint(name, { mode: 'number' });
const created = () =>
  timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updated = () =>
  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow();

export const users = pgTable(
  'users',
  {
    id: id(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    birthDate: date('birth_date'),
    phone: varchar('phone', { length: 30 }),
    role: varchar('role', { length: 20 }).notNull().default('CUSTOMER'),
    createdAt: created(),
    updatedAt: updated(),
  },
  (t) => [
    check('users_role_check', sql`${t.role} IN ('CUSTOMER','CURATOR','ADMIN')`),
  ],
);

export const movies = pgTable(
  'movies',
  {
    id: id(),
    title: varchar('title', { length: 255 }).notNull(),
    originalTitle: varchar('original_title', { length: 255 }),
    description: text('description').notNull(),
    durationMinutes: smallint('duration_minutes').notNull(),
    releaseDate: date('release_date').notNull(),
    ageRating: smallint('age_rating').notNull(),
    criticsRating: numeric('critics_rating', { precision: 4, scale: 1 }),
    originalLanguage: varchar('original_language', { length: 10 }).notNull(),
    trailerUrl: varchar('trailer_url', { length: 500 }),
    posterUrl: varchar('poster_url', { length: 500 }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: created(),
    updatedAt: updated(),
  },
  (t) => [
    check('movies_duration_check', sql`${t.durationMinutes} > 0`),
    check('movies_age_check', sql`${t.ageRating} BETWEEN 0 AND 18`),
    check('movies_critics_check', sql`${t.criticsRating} BETWEEN 0 AND 100`),
    index('idx_movies_title').on(t.title),
    index('idx_movies_filters').on(
      t.ageRating,
      t.criticsRating,
      t.originalLanguage,
    ),
    index('idx_movies_release').on(t.releaseDate),
  ],
);
export const genres = pgTable('genres', {
  id: id(),
  name: varchar('name', { length: 80 }).notNull().unique(),
});
export const movieGenres = pgTable(
  'movie_genres',
  {
    movieId: fk('movie_id')
      .notNull()
      .references(() => movies.id, { onDelete: 'cascade' }),
    genreId: fk('genre_id')
      .notNull()
      .references(() => genres.id, { onDelete: 'restrict' }),
  },
  (t) => [
    primaryKey({ columns: [t.movieId, t.genreId] }),
    index('idx_movie_genres_genre').on(t.genreId),
  ],
);
export const cinemas = pgTable(
  'cinemas',
  {
    id: id(),
    name: varchar('name', { length: 150 }).notNull(),
    city: varchar('city', { length: 100 }).notNull(),
    address: varchar('address', { length: 255 }).notNull(),
    timezone: varchar('timezone', { length: 50 })
      .notNull()
      .default('Europe/Tallinn'),
    isActive: boolean('is_active').notNull().default(true),
  },
  (t) => [unique('cinemas_name_city_unique').on(t.name, t.city)],
);
export const halls = pgTable(
  'halls',
  {
    id: id(),
    cinemaId: fk('cinema_id')
      .notNull()
      .references(() => cinemas.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 80 }).notNull(),
    supportedFormat: varchar('supported_format', { length: 10 })
      .notNull()
      .default('2D'),
    isActive: boolean('is_active').notNull().default(true),
  },
  (t) => [
    unique('halls_cinema_name_unique').on(t.cinemaId, t.name),
    check(
      'halls_format_check',
      sql`${t.supportedFormat} IN ('2D','3D','IMAX')`,
    ),
  ],
);
export const seats = pgTable(
  'seats',
  {
    id: id(),
    hallId: fk('hall_id')
      .notNull()
      .references(() => halls.id, { onDelete: 'restrict' }),
    rowLabel: varchar('row_label', { length: 10 }).notNull(),
    seatNumber: smallint('seat_number').notNull(),
    seatType: varchar('seat_type', { length: 20 })
      .notNull()
      .default('STANDARD'),
    isActive: boolean('is_active').notNull().default(true),
  },
  (t) => [
    unique('seats_hall_row_number_unique').on(
      t.hallId,
      t.rowLabel,
      t.seatNumber,
    ),
    check('seats_number_check', sql`${t.seatNumber} > 0`),
    check(
      'seats_type_check',
      sql`${t.seatType} IN ('STANDARD','PREMIUM','ACCESSIBLE')`,
    ),
  ],
);
export const screenings = pgTable(
  'screenings',
  {
    id: id(),
    movieId: fk('movie_id')
      .notNull()
      .references(() => movies.id, { onDelete: 'restrict' }),
    hallId: fk('hall_id')
      .notNull()
      .references(() => halls.id, { onDelete: 'restrict' }),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    movieFormat: varchar('movie_format', { length: 10 }).notNull(),
    audioLanguage: varchar('audio_language', { length: 10 }).notNull(),
    subtitleLanguage: varchar('subtitle_language', { length: 10 }),
    basePrice: numeric('base_price', { precision: 10, scale: 2 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('SCHEDULED'),
  },
  (t) => [
    unique('screenings_hall_start_unique').on(t.hallId, t.startsAt),
    check(
      'screenings_format_check',
      sql`${t.movieFormat} IN ('2D','3D','IMAX')`,
    ),
    check('screenings_price_check', sql`${t.basePrice} >= 0`),
    check(
      'screenings_status_check',
      sql`${t.status} IN ('SCHEDULED','CANCELLED','FINISHED')`,
    ),
    index('idx_screenings_movie_start').on(t.movieId, t.startsAt),
    index('idx_screenings_hall_start').on(t.hallId, t.startsAt),
  ],
);
export const bookings = pgTable(
  'bookings',
  {
    id: id(),
    userId: fk('user_id').references(() => users.id, { onDelete: 'restrict' }),
    screeningId: fk('screening_id')
      .notNull()
      .references(() => screenings.id, { onDelete: 'restrict' }),
    reference: varchar('reference', { length: 40 }).notNull().unique(),
    guestName: varchar('guest_name', { length: 80 }),
    guestEmail: varchar('guest_email', { length: 255 }),
    status: varchar('status', { length: 20 }).notNull().default('PENDING'),
    totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
    createdAt: created(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  },
  (t) => [
    check(
      'bookings_status_check',
      sql`${t.status} IN ('PENDING','PAID','CANCELLED','EXPIRED')`,
    ),
    check('bookings_total_check', sql`${t.totalAmount} >= 0`),
    check(
      'bookings_cancelled_check',
      sql`${t.cancelledAt} IS NULL OR ${t.status} = 'CANCELLED'`,
    ),
    check(
      'bookings_customer_check',
      sql`${t.userId} IS NOT NULL OR (${t.guestName} IS NOT NULL AND ${t.guestEmail} IS NOT NULL)`,
    ),
    index('idx_bookings_user_created').on(t.userId, t.createdAt),
    index('idx_bookings_screening').on(t.screeningId),
  ],
);
export const tickets = pgTable(
  'tickets',
  {
    id: id(),
    bookingId: fk('booking_id')
      .notNull()
      .references(() => bookings.id, { onDelete: 'restrict' }),
    screeningId: fk('screening_id')
      .notNull()
      .references(() => screenings.id, { onDelete: 'restrict' }),
    seatId: fk('seat_id')
      .notNull()
      .references(() => seats.id, { onDelete: 'restrict' }),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    qrCode: varchar('qr_code', { length: 255 }).notNull().unique(),
    status: varchar('status', { length: 20 }).notNull().default('VALID'),
    issuedAt: timestamp('issued_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique('tickets_screening_seat_unique').on(t.screeningId, t.seatId),
    check('tickets_price_check', sql`${t.price} >= 0`),
    check(
      'tickets_status_check',
      sql`${t.status} IN ('VALID','USED','CANCELLED')`,
    ),
    index('idx_tickets_booking').on(t.bookingId),
    index('idx_tickets_seat').on(t.seatId),
  ],
);
export const payments = pgTable(
  'payments',
  {
    id: id(),
    bookingId: fk('booking_id')
      .notNull()
      .references(() => bookings.id, { onDelete: 'restrict' }),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('PENDING'),
    paymentMethod: varchar('payment_method', { length: 30 }).notNull(),
    providerReference: varchar('provider_reference', { length: 255 }).unique(),
    createdAt: created(),
    paidAt: timestamp('paid_at', { withTimezone: true }),
  },
  (t) => [
    check('payments_amount_check', sql`${t.amount} > 0`),
    check(
      'payments_status_check',
      sql`${t.status} IN ('PENDING','COMPLETED','FAILED','REFUNDED')`,
    ),
    index('idx_payments_booking').on(t.bookingId),
  ],
);
export const favorites = pgTable(
  'favorites',
  {
    userId: fk('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    movieId: fk('movie_id')
      .notNull()
      .references(() => movies.id, { onDelete: 'cascade' }),
    createdAt: created(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.movieId] }),
    index('idx_favorites_movie').on(t.movieId),
  ],
);
export const notifications = pgTable(
  'notifications',
  {
    id: id(),
    userId: fk('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bookingId: fk('booking_id').references(() => bookings.id, {
      onDelete: 'cascade',
    }),
    message: text('message').notNull(),
    isRead: boolean('is_read').notNull().default(false),
    createdAt: created(),
    readAt: timestamp('read_at', { withTimezone: true }),
  },
  (t) => [
    index('idx_notifications_user_created').on(t.userId, t.createdAt),
    index('idx_notifications_booking').on(t.bookingId),
  ],
);

// ORM navigation relations supplement the actual foreign keys above.
export const moviesRelations = relations(movies, ({ many }) => ({
  genres: many(movieGenres),
  screenings: many(screenings),
  favorites: many(favorites),
}));
export const genresRelations = relations(genres, ({ many }) => ({
  movies: many(movieGenres),
}));
export const movieGenresRelations = relations(movieGenres, ({ one }) => ({
  movie: one(movies, {
    fields: [movieGenres.movieId],
    references: [movies.id],
  }),
  genre: one(genres, {
    fields: [movieGenres.genreId],
    references: [genres.id],
  }),
}));
export const cinemasRelations = relations(cinemas, ({ many }) => ({
  halls: many(halls),
}));
export const hallsRelations = relations(halls, ({ one, many }) => ({
  cinema: one(cinemas, { fields: [halls.cinemaId], references: [cinemas.id] }),
  seats: many(seats),
  screenings: many(screenings),
}));
export const seatsRelations = relations(seats, ({ one, many }) => ({
  hall: one(halls, { fields: [seats.hallId], references: [halls.id] }),
  tickets: many(tickets),
}));
export const screeningsRelations = relations(screenings, ({ one, many }) => ({
  movie: one(movies, { fields: [screenings.movieId], references: [movies.id] }),
  hall: one(halls, { fields: [screenings.hallId], references: [halls.id] }),
  bookings: many(bookings),
  tickets: many(tickets),
}));
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  favorites: many(favorites),
  notifications: many(notifications),
}));
export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  screening: one(screenings, {
    fields: [bookings.screeningId],
    references: [screenings.id],
  }),
  tickets: many(tickets),
  payments: many(payments),
  notifications: many(notifications),
}));
export const ticketsRelations = relations(tickets, ({ one }) => ({
  booking: one(bookings, {
    fields: [tickets.bookingId],
    references: [bookings.id],
  }),
  screening: one(screenings, {
    fields: [tickets.screeningId],
    references: [screenings.id],
  }),
  seat: one(seats, { fields: [tickets.seatId], references: [seats.id] }),
}));
export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));
export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  movie: one(movies, { fields: [favorites.movieId], references: [movies.id] }),
}));
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  booking: one(bookings, {
    fields: [notifications.bookingId],
    references: [bookings.id],
  }),
}));
