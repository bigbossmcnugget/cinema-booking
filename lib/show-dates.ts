import type { Locale } from './catalog';

export type ShowDate = { day: string; date: string; key: string };

// Use Tallinn's calendar day so bookings have consistent date keys.
export function getShowDates(locale: Locale, now = new Date()): ShowDate[] {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Tallinn',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (part: string) =>
    Number(parts.find((item) => item.type === part)?.value);
  const language = { en: 'en-GB', ru: 'ru-RU', et: 'et-EE' }[locale];
  const today = { en: 'Today', ru: 'Сегодня', et: 'Täna' }[locale];

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(
      Date.UTC(value('year'), value('month') - 1, value('day') + index, 12),
    );
    return {
      day:
        index === 0
          ? today
          : new Intl.DateTimeFormat(language, {
              weekday: 'short',
              timeZone: 'Europe/Tallinn',
            }).format(date),
      date: new Intl.DateTimeFormat(language, {
        day: 'numeric',
        month: 'short',
        timeZone: 'Europe/Tallinn',
      }).format(date),
      key: date.toISOString().slice(0, 10),
    };
  });
}
