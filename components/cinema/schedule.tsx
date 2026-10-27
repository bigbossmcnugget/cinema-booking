'use client';
import type { CinemaController } from '@/lib/use-cinema';

export function Schedule({ model }: { model: CinemaController }) {
  const { activeDate, c, dates, setActiveDate } = model;
  return (
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
  );
}
