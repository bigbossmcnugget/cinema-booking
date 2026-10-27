'use client';
import { useEffect, useMemo, useState, type SubmitEvent } from 'react';
import {
  getMovieCopy,
  type GenreKey,
  type Locale,
  type Movie,
} from '@/lib/catalog';
import { ui } from '@/lib/ui-copy';
import { getShowDates } from '@/lib/show-dates';

export function useCinema() {
  const [catalog, setCatalog] = useState<{ date: string; movies: Movie[] }>({
    date: '',
    movies: [],
  });
  const [failedDate, setFailedDate] = useState('');
  const [catalogAttempt, setCatalogAttempt] = useState(0);
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
  const [bookingHall, setBookingHall] = useState('');
  const [bookingPrice, setBookingPrice] = useState(0);
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

  const dateKey = dates[activeDate].key;
  const movies = useMemo(
    () => (catalog.date === dateKey ? catalog.movies : []),
    [catalog, dateKey],
  );
  const catalogError = failedDate === dateKey;
  function retryCatalogue() {
    setFailedDate('');
    setCatalogAttempt((attempt) => attempt + 1);
  }
  useEffect(() => {
    const abort = new AbortController();
    fetch(`/api/catalog?date=${dateKey}`, { signal: abort.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Catalogue unavailable');
        const payload = (await response.json()) as { movies: Movie[] };
        if (abort.signal.aborted) return;
        setCatalog({ date: dateKey, movies: payload.movies });
        setFailedDate('');
        setBackendReady(true);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setFailedDate(dateKey);
          setBackendReady(false);
        }
      });
    return () => abort.abort();
  }, [dateKey, catalogAttempt]);

  const visibleMovies = useMemo(
    () =>
      movies.filter(
        (movie) => activeGenre === 'all' || movie.genre.includes(activeGenre),
      ),
    [activeGenre, movies],
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
  }, [query, locale, movies]);

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
    setBookingHall('');
    setBookingPrice(movie.price);
    setBookingStep('seats');
    setSelectedSeats([]);
    setUnavailableSeats([]);
    setBookingError('');
    setSeatsLoading(true);
    try {
      const response = await fetch(
        `/api/bookings?showtimeKey=${encodeURIComponent(getShowtimeKey(movie, time))}`,
      );
      const payload = (await response.json()) as {
        occupied?: string[];
        hall: string;
        price: number;
      };
      if (!response.ok) throw new Error(c.authLoad);
      setUnavailableSeats(payload.occupied || []);
      setBookingHall(payload.hall);
      setBookingPrice(payload.price);
      setBackendReady(true);
    } catch {
      setBookingError(c.authLoad);
    } finally {
      setSeatsLoading(false);
    }
  }

  function toggleSeat(seat: string) {
    if (unavailableSeats.includes(seat) || seatsLoading || bookingError) return;
    setSelectedSeats((current) =>
      current.includes(seat)
        ? current.filter((item) => item !== seat)
        : current.length < 10
          ? [...current, seat]
          : current,
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
        setSelectedSeats([]);
        setBookingStep('seats');
        throw new Error(c.authBook);
      }
      if (!payload.booking?.reference) throw new Error(c.authBook);
      setConfirmationId(payload.booking.reference);
      setBackendReady(true);
      setBookingStep('success');
    } catch {
      setBookingError(c.authBook);
    } finally {
      setBookingSubmitting(false);
    }
  }

  const orderTotal = bookingMovie ? selectedSeats.length * bookingPrice : 0;
  return {
    locale,
    activeDate,
    activeGenre,
    searchOpen,
    menuOpen,
    query,
    detailMovie,
    bookingMovie,
    bookingTime,
    bookingStep,
    selectedSeats,
    unavailableSeats,
    seatsLoading,
    bookingSubmitting,
    bookingError,
    confirmationId,
    backendReady,
    bookingHall,
    catalogError,
    retryCatalogue,
    c,
    dates,
    visibleMovies,
    searchResults,
    orderTotal,
    setActiveDate,
    setActiveGenre,
    setSearchOpen,
    setMenuOpen,
    setQuery,
    setDetailMovie,
    setBookingMovie,
    setBookingStep,
    setBookingError,
    changeLocale,
    openBooking,
    toggleSeat,
    submitBooking,
  };
}
export type CinemaController = ReturnType<typeof useCinema>;
