import { movies } from '@/lib/catalog';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const city = url.searchParams.get('city') || 'Tallinn';
  const date = url.searchParams.get('date') || '2026-09-05';

  const sessions = movies.flatMap((movie) =>
    movie.times.map((time) => ({
      movie: movie.title,
      time,
      date,
      city,
      hall: 'Laser Hall 2',
      format: '2D · Laser 4K',
      price: movie.price,
      showtimeKey: `${movie.title}|${date}|${time}|${city}`,
    })),
  );

  return Response.json({ movies, sessions, city, date });
}
