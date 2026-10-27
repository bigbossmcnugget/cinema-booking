import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const bookings = sqliteTable(
  'bookings',
  {
    id: text('id').primaryKey(),
    reference: text('reference').notNull(),
    showtimeKey: text('showtime_key').notNull(),
    movieTitle: text('movie_title').notNull(),
    city: text('city').notNull(),
    showDate: text('show_date').notNull(),
    showTime: text('show_time').notNull(),
    customerName: text('customer_name').notNull(),
    customerEmail: text('customer_email').notNull(),
    totalCents: integer('total_cents').notNull(),
    status: text('status').notNull().default('confirmed'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    uniqueIndex('bookings_reference_unique').on(table.reference),
    index('idx_bookings_email_created').on(table.customerEmail, table.createdAt),
  ],
);

export const bookingSeats = sqliteTable(
  'booking_seats',
  {
    bookingId: text('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
    showtimeKey: text('showtime_key').notNull(),
    seat: text('seat').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.bookingId, table.seat] }),
    uniqueIndex('booking_seats_showtime_seat_unique').on(table.showtimeKey, table.seat),
    index('idx_booking_seats_showtime').on(table.showtimeKey),
  ],
);
