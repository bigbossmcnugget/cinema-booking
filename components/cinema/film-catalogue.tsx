'use client';
import Image from 'next/image';
import { getMovieCopy, type GenreKey } from '@/lib/catalog';
import type { CinemaController } from '@/lib/use-cinema';

const genreOptions: { id: 'all' | GenreKey; labelKey: string }[] = [
  { id: 'all', labelKey: 'allFilms' },
  { id: 'superhero', labelKey: 'superhero' },
  { id: 'family', labelKey: 'family' },
];

export function FilmCatalogue({ model }: { model: CinemaController }) {
  const {
    locale,
    activeGenre,
    catalogError,
    retryCatalogue,
    c,
    visibleMovies,
    setActiveGenre,
    setDetailMovie,
    openBooking,
  } = model;
  return (
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
        {catalogError && (
          <div role="alert">
            <p>{c.catalogUnavailable}</p>
            <button className="mt-2 underline" onClick={retryCatalogue}>
              {c.retry}
            </button>
          </div>
        )}
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
  );
}
