import { ensureDatabase } from '@/db';
import { getMoviePriceCents } from '@/lib/catalog';

const systemOccupiedSeats = ['A3', 'A4', 'B7', 'C2', 'C3', 'C8', 'D5', 'D6', 'E1', 'E9', 'F4'];
const seatPattern = /^[A-F](10|[1-9])$/;

type BookingInput = {
  showtimeKey?: string;
  movieTitle?: string;
  city?: string;
  showDate?: string;
  showTime?: string;
  customerName?: string;
  customerEmail?: string;
  seats?: string[];
};

function error(message: string, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

export async function GET(request: Request) {
  const showtimeKey = new URL(request.url).searchParams.get('showtimeKey')?.trim();
  if (!showtimeKey) return error('Не указан идентификатор сеанса.');

  try {
    const d1 = await ensureDatabase();
    const result = await d1
      .prepare('SELECT seat FROM booking_seats WHERE showtime_key = ? ORDER BY seat')
      .bind(showtimeKey)
      .all<{ seat: string }>();

    const bookedSeats = (result.results || []).map((row) => row.seat);
    return Response.json({
      ok: true,
      occupied: Array.from(new Set([...systemOccupiedSeats, ...bookedSeats])),
    });
  } catch (cause) {
    console.error('Could not load seats', cause);
    return error('Не удалось загрузить места. Попробуйте ещё раз.', 503);
  }
}

export async function POST(request: Request) {
  let body: BookingInput;
  try {
    body = (await request.json()) as BookingInput;
  } catch {
    return error('Некорректный формат запроса.');
  }

  const showtimeKey = body.showtimeKey?.trim();
  const movieTitle = body.movieTitle?.trim();
  const city = body.city?.trim();
  const showDate = body.showDate?.trim();
  const showTime = body.showTime?.trim();
  const customerName = body.customerName?.trim();
  const customerEmail = body.customerEmail?.trim().toLowerCase();
  const seats = Array.from(new Set(body.seats || []));

  if (!showtimeKey || !movieTitle || !city || !showDate || !showTime) {
    return error('Не хватает данных о сеансе.');
  }
  if (!customerName || customerName.length < 2 || customerName.length > 80) {
    return error('Укажите имя от 2 до 80 символов.');
  }
  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return error('Укажите корректную электронную почту.');
  }
  if (!seats.length || seats.length > 10 || seats.some((seat) => !seatPattern.test(seat))) {
    return error('Выберите от 1 до 10 корректных мест.');
  }
  if (seats.some((seat) => systemOccupiedSeats.includes(seat))) {
    return error('Одно из мест уже занято. Обновите схему зала.', 409);
  }

  const unitPriceCents = getMoviePriceCents(movieTitle);
  if (unitPriceCents === null) return error('Фильм не найден.', 404);

  try {
    const d1 = await ensureDatabase();
    const placeholders = seats.map(() => '?').join(', ');
    const conflicts = await d1
      .prepare(`SELECT seat FROM booking_seats WHERE showtime_key = ? AND seat IN (${placeholders})`)
      .bind(showtimeKey, ...seats)
      .all<{ seat: string }>();

    if (conflicts.results?.length) {
      return Response.json(
        { ok: false, error: 'Часть мест только что заняли.', occupied: conflicts.results.map((row) => row.seat) },
        { status: 409 },
      );
    }

    const id = crypto.randomUUID();
    const reference = `LUM-${id.slice(0, 8).toUpperCase()}`;
    const totalCents = unitPriceCents * seats.length;

    await d1.batch([
      d1.prepare(`INSERT INTO bookings
        (id, reference, showtime_key, movie_title, city, show_date, show_time, customer_name, customer_email, total_cents, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)`)
        .bind(id, reference, showtimeKey, movieTitle, city, showDate, showTime, customerName, customerEmail, totalCents, Date.now()),
      ...seats.map((seat) =>
        d1.prepare('INSERT INTO booking_seats (booking_id, showtime_key, seat) VALUES (?, ?, ?)')
          .bind(id, showtimeKey, seat),
      ),
    ]);

    return Response.json(
      { ok: true, booking: { id, reference, seats, totalCents, status: 'confirmed' } },
      { status: 201 },
    );
  } catch (cause) {
    console.error('Could not create booking', cause);
    const message = cause instanceof Error ? cause.message : '';
    if (message.includes('UNIQUE') || message.includes('constraint')) {
      return error('Одно из мест уже занято. Обновите схему зала.', 409);
    }
    return error('Не удалось оформить заказ. Попробуйте ещё раз.', 503);
  }
}
