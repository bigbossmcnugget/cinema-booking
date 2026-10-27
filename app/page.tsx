'use client';
import { useCinema } from '@/lib/use-cinema';
import { CinemaHeader } from '@/components/cinema/cinema-header';
import { Schedule } from '@/components/cinema/schedule';
import { FilmCatalogue } from '@/components/cinema/film-catalogue';
import { CinemaFooter } from '@/components/cinema/cinema-footer';
import { SearchDialog } from '@/components/cinema/search-dialog';
import { MovieDialog } from '@/components/cinema/movie-dialog';
import { BookingDialog } from '@/components/cinema/booking-dialog';
import { MobileMenu } from '@/components/cinema/mobile-menu';

export default function Home() {
  const model = useCinema();
  return (
    <main className="cinema-shell min-h-screen overflow-hidden bg-background text-foreground">
      <CinemaHeader model={model} />
      <Schedule model={model} />
      <FilmCatalogue model={model} />
      <section
        id="cinemas"
        className="mx-auto max-w-6xl border-t border-white/10 px-5 py-8"
      >
        <h2 className="text-2xl font-bold">{model.c.navCinemas}</h2>
        <p className="mt-3">Lumen Rotermann</p>
        <p className="mt-1 text-sm text-white/65">Rotermanni 8, Tallinn</p>
      </section>
      <CinemaFooter model={model} />
      <SearchDialog model={model} />
      <MovieDialog model={model} />
      <BookingDialog model={model} />
      <MobileMenu model={model} />
    </main>
  );
}
