'use client';

import { useEffect, useMemo, useState, type SubmitEvent } from 'react';
import Image from 'next/image';
import { Check, Clock3, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import {
  getMovieCopy,
  movies,
  type GenreKey,
  type Locale,
  type Movie,
} from '@/lib/catalog';

import { ui } from '@/lib/ui-copy';
import { getShowDates } from '@/lib/show-dates';

const genreOptions: { id: 'all' | GenreKey; labelKey: string }[] = [
  { id: 'all', labelKey: 'allFilms' },
  { id: 'superhero', labelKey: 'superhero' },
  { id: 'family', labelKey: 'family' },
];

const seatRows = ['A', 'B', 'C', 'D', 'E', 'F'];

function LanguageSwitcher({
  locale,
  onChange,
  compact = false,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
  compact?: boolean;
}) {
  return (
    <fieldset
      className={`language-switcher ${compact ? 'w-full justify-center' : ''}`}
      aria-label="Language"
    >
      {(['en', 'ru', 'et'] as Locale[]).map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          aria-pressed={locale === item}
          className={locale === item ? 'is-active' : ''}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </fieldset>
  );
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>('en');
  const [activeDate, setActiveDate] = useState(0);
  const [activeGenre, setActiveGenre] = useState<'all' | GenreKey>('all');
  const activeCity = 'tallinn';
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [detailMovie, setDetailMovie] = useState<Movie | null>(null);
  const [bookingMovie, setBookingMovie] = useState<Movie | null>(null);
  const [bookingTime, setBookingTime] = useState('');
  const [bookingStep, setBookingStep] = useState<
    'seats' | 'checkout' | 'success'
  >('seats');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [unavailableSeats, setUnavailableSeats] = useState<string[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmationId, setConfirmationId] = useState('');
  const [backendReady, setBackendReady] = useState(false);
  const c = ui[locale];
  const dates = useMemo(() => getShowDates(locale), [locale]);
  useEffect(() => {
    const saved = window.localStorage.getItem('lumen-locale');
    if (saved === 'en' || saved === 'ru' || saved === 'et')
      queueMicrotask(() => setLocale(saved));

    fetch('/api/health')
      .then((response) => setBackendReady(response.ok))
      .catch(() => setBackendReady(false));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem('lumen-locale', locale);
  }, [locale]);

  const visibleMovies = useMemo(
    () =>
      movies.filter(
        (movie) => activeGenre === 'all' || movie.genre.includes(activeGenre),
      ),
    [activeGenre],
  );

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return movies.slice(0, 4);
    return movies.filter((movie) => {
      const copy = getMovieCopy(movie, locale);
      return `${copy.title} ${copy.meta} ${copy.description}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [query, locale]);

  function changeLocale(nextLocale: Locale) {
    setLocale(nextLocale);
  }

  function getShowtimeKey(movie: Movie, time: string) {
    return `${movie.id}|${dates[activeDate].key}|${time}|${activeCity}`;
  }

  async function openBooking(movie: Movie, time: string) {
    setDetailMovie(null);
    setBookingMovie(movie);
    setBookingTime(time);
    setBookingStep('seats');
    setSelectedSeats([]);
    setUnavailableSeats([]);
    setBookingError('');
    setSeatsLoading(true);
    try {
      const response = await fetch(
        `/api/bookings?showtimeKey=${encodeURIComponent(getShowtimeKey(movie, time))}`,
      );
      const payload = (await response.json()) as { occupied?: string[] };
      if (!response.ok) throw new Error(c.authLoad);
      setUnavailableSeats(payload.occupied || []);
      setBackendReady(true);
    } catch {
      setBookingError(c.authLoad);
    } finally {
      setSeatsLoading(false);
    }
  }

  function toggleSeat(seat: string) {
    if (unavailableSeats.includes(seat)) return;
    setSelectedSeats((current) =>
      current.includes(seat)
        ? current.filter((item) => item !== seat)
        : [...current, seat],
    );
  }

  async function submitBooking(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bookingMovie || !selectedSeats.length) return;
    const formData = new FormData(event.currentTarget);
    setBookingSubmitting(true);
    setBookingError('');
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          showtimeKey: getShowtimeKey(bookingMovie, bookingTime),
          movieTitle: bookingMovie.title,
          city: 'Tallinn',
          showDate: dates[activeDate].key,
          showTime: bookingTime,
          customerName: formData.get('name'),
          customerEmail: formData.get('email'),
          seats: selectedSeats,
        }),
      });
      const payload = (await response.json()) as {
        booking?: { reference: string };
        occupied?: string[];
      };
      if (!response.ok) {
        if (payload.occupied?.length)
          setUnavailableSeats((current) =>
            Array.from(new Set([...current, ...payload.occupied!])),
          );
        throw new Error(c.authBook);
      }
      setConfirmationId(payload.booking?.reference || 'LUM-DEMO');
      setBackendReady(true);
      setBookingStep('success');
    } catch {
      setBookingError(c.authBook);
    } finally {
      setBookingSubmitting(false);
    }
  }

  const orderTotal = bookingMovie
    ? selectedSeats.length * bookingMovie.price
    : 0;
  return (
    <main className="cinema-shell min-h-screen overflow-hidden bg-background text-foreground">
      <header className="site-header" id="top">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center gap-5 px-5">
          <a className="wordmark group" href="#top" aria-label="Lumen home">
            <span className="lumen-mark" aria-hidden="true">
              L
            </span>
            <span>LUMEN</span>
          </a>
          <nav
            className="hidden items-center gap-1 text-[13px] font-semibold text-white/62 lg:flex"
            aria-label="Main navigation"
          >
            <a className="nav-link text-white" href="#schedule">
              {c.navShowtimes}
            </a>
            <a className="nav-link" href="#movies">
              {c.navFilms}
            </a>
            <a className="nav-link" href="#cinemas">
              {c.navCinemas}
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="hidden sm:block">
              <LanguageSwitcher locale={locale} onChange={changeLocale} />
            </div>
            <Button
              onClick={() => setSearchOpen(true)}
              aria-label={c.search}
              variant="ghost"
              size="icon"
              className="rounded-full text-white/72 hover:bg-white/10 hover:text-white"
            >
              <Search />
            </Button>
            <Button
              onClick={() => setMenuOpen(true)}
              variant="ghost"
              size="icon"
              className="rounded-full text-white/72 hover:bg-white/10 hover:text-white lg:hidden"
              aria-label={c.menu}
            >
              <Menu />
            </Button>
          </div>
        </div>
      </header>

      <section id="schedule" className="mx-auto max-w-6xl px-5 pt-9 pb-5">
        <h1 className="text-3xl font-bold">{c.navShowtimes}</h1>
        <p className="mt-3 text-base text-white/65">{c.playingText}</p>
        <p className="mt-3 text-sm text-white/65">Lumen Rotermann · Tallinn</p>
        <fieldset className="mt-6">
          <legend className="mb-3 text-sm font-semibold">{c.date}</legend>
          <div className="flex flex-wrap gap-2">
            {dates.map((item, index) => (
              <button
                key={item.key}
                onClick={() => setActiveDate(index)}
                aria-pressed={activeDate === index}
                className={`date-button ${activeDate === index ? 'is-active' : ''}`}
              >
                <span className="block font-semibold">{item.day}</span>
                <span className="block text-sm">{item.date}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      <section id="movies" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-7">
        <div className=" mb-8 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <p className="section-kicker">{c.playingEyebrow}</p>
            <h2 className="section-title">{c.playingTitle}</h2>
          </div>
          <div className="rail-scroll flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/8 bg-white/[.025] p-1">
            {genreOptions.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setActiveGenre(genre.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold  ${activeGenre === genre.id ? 'bg-white text-black' : 'text-white/45 hover:text-white'}`}
              >
                {c[genre.labelKey]}
              </button>
            ))}
          </div>
        </div>

        <div className="movie-grid">
          {visibleMovies.map((movie) => {
            const copy = getMovieCopy(movie, locale);
            return (
              <article key={movie.id} className="movie-tile  group">
                <button
                  onClick={() => setDetailMovie(movie)}
                  className="movie-art"
                  aria-label={copy.title}
                >
                  <Image
                    fill
                    sizes="(max-width: 540px) 100vw, (max-width: 850px) 50vw, 33vw"
                    className="object-contain"
                    style={{ objectFit: 'contain' }}
                    src={movie.image}
                    alt={copy.title}
                  />
                </button>
                <div className="p-4">
                  <h3 className="text-lg font-bold">
                    <button
                      onClick={() => setDetailMovie(movie)}
                      className="text-left hover:underline"
                    >
                      {copy.title}
                    </button>
                  </h3>
                  <p className="mt-2 text-sm text-white/65">{copy.meta}</p>
                  <button
                    onClick={() => setDetailMovie(movie)}
                    className="mt-3 text-sm underline"
                  >
                    {c.moreInfo}
                  </button>
                </div>
                <div className="flex items-center gap-2 border-t border-white/7 bg-[#111]/90 p-2.5">
                  <div className="rail-scroll flex min-w-0 flex-1 gap-1 overflow-x-auto">
                    {movie.times.map((time) => (
                      <button
                        key={time}
                        onClick={() => openBooking(movie, time)}
                        className="showtime-pill"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        id="cinemas"
        className="mx-auto max-w-6xl border-t border-white/10 px-5 py-8"
      >
        <h2 className="text-2xl font-bold">{c.navCinemas}</h2>
        <p className="mt-3">Lumen Rotermann</p>
        <p className="mt-1 text-sm text-white/65">Rotermanni 8, Tallinn</p>
      </section>

      <footer className="border-t border-white/8 px-5 pb-10 pt-12 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <a className="wordmark text-2xl" href="#top">
              <span className="lumen-mark" aria-hidden="true">
                L
              </span>
              <span>LUMEN</span>
            </a>
            <p className="mt-4 max-w-md text-sm text-white/38">
              {c.footerLine}
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <LanguageSwitcher locale={locale} onChange={changeLocale} />
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.14em] text-white/28">
              <span
                className={`size-1.5 rounded-full ${backendReady ? 'bg-emerald-400' : 'bg-amber-400'}`}
              />
              {backendReady ? c.backendReady : c.previewMode}
            </div>
          </div>
        </div>
      </footer>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-x-hidden overflow-y-auto border-white/10 bg-[#111010]/95 p-0  sm:max-w-2xl">
          <DialogHeader className="border-b border-white/8 p-6 pb-5">
            <DialogTitle className="text-2xl font-black tracking-[-.04em]">
              {c.searchTitle}
            </DialogTitle>
            <DialogDescription>{c.searchText}</DialogDescription>
          </DialogHeader>
          <div className="p-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={c.searchPlaceholder}
                className="h-13 rounded-xl bg-white/[.055] pl-11"
              />
            </div>
            <div className="mt-5 grid gap-2">
              {searchResults.length ? (
                searchResults.map((movie) => {
                  const copy = getMovieCopy(movie, locale);
                  return (
                    <button
                      key={movie.id}
                      onClick={() => {
                        setSearchOpen(false);
                        setDetailMovie(movie);
                      }}
                      className="group flex items-center gap-4 rounded-xl border border-transparent p-2 text-left hover:border-white/8 hover:bg-white/[.04]"
                    >
                      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          fill
                          sizes="112px"
                          className="object-cover   "
                          src={movie.image}
                          alt=""
                        />
                      </div>
                      <span className="min-w-0">
                        <span className="block font-bold">{copy.title}</span>
                        <span className="mt-1 block text-xs text-white/38">
                          {copy.meta} · {movie.times[0]}
                        </span>
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="py-12 text-center text-sm text-white/40">
                  {c.noResults}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!detailMovie}
        onOpenChange={(open) => !open && setDetailMovie(null)}
      >
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-x-hidden overflow-y-auto border-white/10 bg-[#0e0d0d]/97 p-0  sm:max-w-5xl">
          {detailMovie &&
            (() => {
              const copy = getMovieCopy(detailMovie, locale);
              return (
                <div className="grid lg:grid-cols-[1.15fr_.85fr]">
                  <div className="relative min-h-[220px] lg:min-h-[380px]">
                    <Image
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover"
                      src={detailMovie.image}
                      alt={copy.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0d0d] via-transparent to-black/10 lg:bg-gradient-to-r lg:from-transparent lg:to-[#0e0d0d]" />
                  </div>
                  <div className="flex flex-col p-6 sm:p-9 lg:py-12">
                    <p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">
                      {copy.badge}
                    </p>
                    <DialogHeader className="mt-4">
                      <DialogTitle className="text-2xl font-bold leading-tight sm:text-3xl">
                        {copy.title}
                      </DialogTitle>
                      <DialogDescription>{copy.meta}</DialogDescription>
                    </DialogHeader>
                    <p className="mt-6 text-sm leading-7 text-white/52">
                      {copy.description}
                    </p>
                    <div className="mt-7 grid gap-3 border-y border-white/8 py-5 text-xs">
                      <div className="flex justify-between text-white/35">
                        <span>{c.language}</span>
                        <span className="text-right text-white/70">
                          {copy.language}
                        </span>
                      </div>
                      <div className="flex justify-between text-white/35">
                        <span>{c.format}</span>
                        <span className="text-white/70">4K · Dolby Atmos</span>
                      </div>
                      <div className="flex justify-between text-white/35">
                        <span>{c.firstShow}</span>
                        <span className="text-white/70">
                          {detailMovie.times[0]}
                        </span>
                      </div>
                    </div>
                    <div className="mt-7">
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[.16em] text-white/30">
                        {c.bookNow}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {detailMovie.times.map((time) => (
                          <Button
                            key={time}
                            onClick={() => openBooking(detailMovie, time)}
                            className="rounded-full bg-white text-black hover:bg-primary hover:text-white"
                          >
                            <Clock3 />
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!bookingMovie}
        onOpenChange={(open) => !open && setBookingMovie(null)}
      >
        <DialogContent
          className={`max-h-[94vh] max-w-6xl overflow-x-hidden overflow-y-auto border-white/10 bg-[#0e0d0d]/98 p-0 sm:max-w-6xl ${bookingStep === 'checkout' ? 'checkout-dialog' : ''}`}
        >
          {bookingMovie && bookingStep === 'seats' && (
            <div className="grid lg:grid-cols-[1fr_320px]">
              <div className="p-5 sm:p-9">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black tracking-[-.05em]">
                    {c.chooseSeats}
                  </DialogTitle>
                  <DialogDescription>
                    {getMovieCopy(bookingMovie, locale).title} ·{' '}
                    {dates[activeDate].day}, {bookingTime} · Lumen Rotermann
                  </DialogDescription>
                </DialogHeader>
                <div className="relative mx-auto mt-10 max-w-xl">
                  {seatsLoading && (
                    <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-[#111]/85 text-sm text-white/55 ">
                      {c.loadingSeats}
                    </div>
                  )}
                  <div className="mx-auto mb-6 w-full border-b border-white/25 py-2 text-center text-sm text-white/65">
                    {c.screen}
                  </div>
                  <div className="mt-5 grid gap-2.5 overflow-x-auto pb-2">
                    {seatRows.map((row) => (
                      <div
                        key={row}
                        className="grid min-w-[510px] grid-cols-[24px_repeat(10,1fr)_24px] items-center gap-2"
                      >
                        <span className="text-[10px] text-white/25">{row}</span>
                        {Array.from(
                          { length: 10 },
                          (_, index) => `${row}${index + 1}`,
                        ).map((seat, seatIndex) => {
                          const occupied = unavailableSeats.includes(seat);
                          const selected = selectedSeats.includes(seat);
                          return (
                            <button
                              key={seat}
                              disabled={occupied}
                              onClick={() => toggleSeat(seat)}
                              aria-label={seat}
                              className={`aspect-square rounded-t-lg rounded-b-[5px] border text-[9px] font-bold  ${occupied ? 'cursor-not-allowed border-transparent bg-white/[.04] text-white/12' : selected ? 'border-primary bg-primary text-white' : 'border-white/12 bg-white/[.055] text-white/40 hover:border-primary/60 hover:text-white'}`}
                            >
                              {seatIndex + 1}
                            </button>
                          );
                        })}
                        <span className="text-right text-[10px] text-white/25">
                          {row}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-wrap justify-center gap-5 text-[10px] text-white/35">
                    <span className="flex items-center gap-2">
                      <i className="size-3 rounded-sm border border-white/20 bg-white/[.06]" />
                      {c.free}
                    </span>
                    <span className="flex items-center gap-2">
                      <i className="size-3 rounded-sm bg-primary" />
                      {c.selected}
                    </span>
                    <span className="flex items-center gap-2">
                      <i className="size-3 rounded-sm bg-white/[.04]" />
                      {c.occupied}
                    </span>
                  </div>
                </div>
              </div>
              <aside className="flex flex-col border-t border-white/8 bg-[#121010] p-6 lg:border-l lg:border-t-0">
                <div className="relative h-36 w-full overflow-hidden rounded-xl">
                  <Image
                    fill
                    sizes="320px"
                    className="object-cover"
                    src={bookingMovie.image}
                    alt=""
                  />
                </div>
                <h3 className="mt-5 text-lg font-bold">
                  {getMovieCopy(bookingMovie, locale).title}
                </h3>
                <p className="mt-1 text-xs text-white/40">
                  {dates[activeDate].day}, {dates[activeDate].date} ·{' '}
                  {bookingTime}
                </p>
                <div className="mt-6 space-y-3 border-y border-white/8 py-5 text-xs">
                  <div className="flex justify-between text-white/40">
                    <span>{c.hall}</span>
                    <span className="text-white">Laser Hall 2</span>
                  </div>
                  <div className="flex justify-between text-white/40">
                    <span>{c.seats}</span>
                    <span className="text-white">
                      {selectedSeats.length ? selectedSeats.join(', ') : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/40">
                    <span>{c.tickets}</span>
                    <span className="text-white">{selectedSeats.length}</span>
                  </div>
                </div>
                <div className="mt-auto pt-6">
                  {bookingError && (
                    <p className="mb-4 rounded-xl bg-primary/10 p-3 text-xs text-red-200">
                      {bookingError}
                    </p>
                  )}
                  <div className="mb-5 flex items-end justify-between">
                    <span className="text-xs text-white/40">{c.total}</span>
                    <strong className="text-2xl">
                      {orderTotal.toFixed(2)} €
                    </strong>
                  </div>
                  <Button
                    disabled={!selectedSeats.length || seatsLoading}
                    onClick={() => {
                      setBookingError('');
                      setBookingStep('checkout');
                    }}
                    className="h-12 w-full rounded-xl bg-primary font-bold text-white hover:bg-[#ff6258]"
                  >
                    {c.continue}
                  </Button>
                </div>
              </aside>
            </div>
          )}
          {bookingMovie && bookingStep === 'checkout' && (
            <div className="plain-checkout">
              <button type="button" onClick={() => setBookingStep('seats')}>
                {c.backSeats}
              </button>
              <DialogHeader>
                <DialogTitle>{c.checkoutTitle}</DialogTitle>
                <DialogDescription>{c.checkoutText}</DialogDescription>
              </DialogHeader>
              <p>
                {getMovieCopy(bookingMovie, locale).title} ·{' '}
                {dates[activeDate].date} · {bookingTime}
              </p>
              <p>
                {c.seats}: {selectedSeats.join(', ')} · {c.total}:{' '}
                {orderTotal.toFixed(2)} €
              </p>
              <form onSubmit={submitBooking}>
                <label htmlFor="checkout-name">{c.name}</label>
                <input
                  id="checkout-name"
                  name="name"
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder={c.namePlaceholder}
                  autoComplete="name"
                />
                <label htmlFor="checkout-email">{c.emailLabel}</label>
                <input
                  id="checkout-email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <p>{c.demoNotice}</p>
                {bookingError && <p role="alert">{bookingError}</p>}
                <button disabled={bookingSubmitting} type="submit">
                  {bookingSubmitting ? c.saving : c.confirmOrder}
                </button>
              </form>
            </div>
          )}
          {bookingMovie && bookingStep === 'success' && (
            <div className="flex min-h-[560px] flex-col items-center justify-center p-8 text-center">
              <div className="grid size-20 place-items-center rounded-full bg-primary text-white">
                <Check className="size-9" strokeWidth={3} />
              </div>
              <DialogHeader className="mt-7 items-center">
                <DialogTitle className="text-4xl font-black tracking-[-.055em]">
                  {c.successTitle}
                </DialogTitle>
                <DialogDescription className="max-w-md text-center">
                  {c.successText}{' '}
                  <span className="font-bold text-white">{confirmationId}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="mt-7 rounded-xl border border-white/8 bg-white/[.035] px-6 py-4 text-sm">
                <span className="text-white/40">
                  {getMovieCopy(bookingMovie, locale).title}
                </span>
                <br />
                <strong>
                  {bookingTime} · {c.seats.toLowerCase()}{' '}
                  {selectedSeats.join(', ')}
                </strong>
              </div>
              <Button
                onClick={() => setBookingMovie(null)}
                className="mt-8 h-12 rounded-full bg-primary px-7 font-bold text-white hover:bg-[#ff6258]"
              >
                {c.done}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          className="flex w-[88%] flex-col border-white/10 bg-[#100f0f] p-0"
          side="right"
        >
          <SheetHeader className="border-b border-white/8 p-6">
            <SheetTitle className="wordmark text-xl">
              <span className="lumen-mark" aria-hidden="true">
                L
              </span>
              <span>LUMEN</span>
            </SheetTitle>
            <SheetDescription className="sr-only">
              {c.mobileMenu}
            </SheetDescription>
          </SheetHeader>
          <nav className="grid gap-1 p-4 text-2xl font-black tracking-[-.045em]">
            {[
              [c.navShowtimes, '#schedule'],
              [c.navFilms, '#movies'],
              [c.navCinemas, '#cinemas'],
            ].map(([label, href]) => (
              <a
                key={label}
                onClick={() => setMenuOpen(false)}
                href={href}
                className="rounded-xl px-4 py-4 hover:bg-white/[.05] hover:text-primary"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-auto grid gap-3 border-t border-white/8 p-5">
            <LanguageSwitcher compact locale={locale} onChange={changeLocale} />
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}
