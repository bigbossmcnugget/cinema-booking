export type Locale = 'en' | 'ru' | 'et';
export type GenreKey = 'superhero' | 'family';

export type MovieCopy = {
  title: string;
  meta: string;
  badge: string;
  description: string;
  language: string;
};

export type Movie = MovieCopy & {
  id: string;
  image: string;
  backdrop: string;
  times: string[];
  genre: GenreKey[];
  price: number;
  translations: Record<Exclude<Locale, 'en'>, MovieCopy>;
};

// Film titles are real; prices, showtimes and subtitle availability are demo data.
export const movies: Movie[] = [
  {
    id: 'batman-1989',
    title: 'Batman',
    meta: '1989 · Superhero · 126 min',
    badge: '1989',
    description: 'Batman protects Gotham City from the Joker.',
    language: 'EN · RU/ET subtitles (demo)',
    image: '/images/batman-1989.jpg',
    backdrop: '/images/batman-1989.jpg',
    times: ['17:00', '19:30'],
    genre: ['superhero'],
    price: 7,
    translations: {
      ru: {
        title: 'Бэтмен',
        meta: '1989 · Супергерои · 126 мин',
        badge: '1989',
        description: 'Бэтмен защищает Готэм от Джокера.',
        language: 'EN · субтитры RU/ET (демо)',
      },
      et: {
        title: 'Batman',
        meta: '1989 · Superkangelased · 126 min',
        badge: '1989',
        description: 'Batman kaitseb Gotham Cityt Jokkeri eest.',
        language: 'EN · RU/ET subtiitrid (demo)',
      },
    },
  },
  {
    id: 'lego-movie',
    title: 'The Lego Movie',
    meta: '2014 · Animation · 100 min',
    badge: '2014',
    description:
      'An ordinary LEGO builder joins a team trying to save their world.',
    language: 'EN · RU/ET subtitles (demo)',
    image: '/images/lego-movie.jpg',
    backdrop: '/images/lego-movie.jpg',
    times: ['12:00', '15:00'],
    genre: ['family'],
    price: 6,
    translations: {
      ru: {
        title: 'Лего Фильм',
        meta: '2014 · Мультфильм · 100 мин',
        badge: '2014',
        description:
          'Обычный строитель LEGO присоединяется к команде, которая пытается спасти свой мир.',
        language: 'EN · субтитры RU/ET (демо)',
      },
      et: {
        title: 'LEGO film',
        meta: '2014 · Animatsioon · 100 min',
        badge: '2014',
        description:
          'Tavaline LEGO ehitaja ühineb meeskonnaga, et päästa oma maailm.',
        language: 'EN · RU/ET subtiitrid (demo)',
      },
    },
  },
  {
    id: 'superman-1978',
    title: 'Superman',
    meta: '1978 · Superhero · 143 min',
    badge: '1978',
    description:
      'Clark Kent uses his powers to help people and stop Lex Luthor.',
    language: 'EN · RU/ET subtitles (demo)',
    image: '/images/superman-1978.jpg',
    backdrop: '/images/superman-1978.jpg',
    times: ['16:00', '20:00'],
    genre: ['superhero'],
    price: 7,
    translations: {
      ru: {
        title: 'Супермен',
        meta: '1978 · Супергерои · 143 мин',
        badge: '1978',
        description: 'Кларк Кент помогает людям и противостоит Лексу Лютору.',
        language: 'EN · субтитры RU/ET (демо)',
      },
      et: {
        title: 'Superman',
        meta: '1978 · Superkangelased · 143 min',
        badge: '1978',
        description: 'Clark Kent aitab inimesi ja peatab Lex Luthori plaani.',
        language: 'EN · RU/ET subtiitrid (demo)',
      },
    },
  },
];

export function getMovieCopy(movie: Movie, locale: Locale): MovieCopy {
  return locale === 'en' ? movie : movie.translations[locale];
}

export function getMoviePriceCents(titleOrId: string): number | null {
  const movie = movies.find(
    (item) =>
      item.id === titleOrId ||
      item.title === titleOrId ||
      item.translations.ru.title === titleOrId ||
      item.translations.et.title === titleOrId,
  );
  return movie ? Math.round(movie.price * 100) : null;
}
