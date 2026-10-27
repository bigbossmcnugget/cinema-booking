export type Locale = 'en' | 'ru' | 'et';

export type GenreKey = 'premiere' | 'thriller' | 'family' | 'arthouse';

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
  rating: string;
  price: number;
  translations: Record<Exclude<Locale, 'en'>, MovieCopy>;
};

export const movies: Movie[] = [
  {
    id: 'night-side',
    title: 'The Other Side of Night',
    meta: '16+ · Thriller · 1h 47m',
    image: '/images/night-side.jpg',
    backdrop: '/images/backdrop-night.jpg',
    times: ['17:40', '19:20', '21:50'],
    badge: 'Premiere',
    genre: ['premiere', 'thriller'],
    rating: '8.1',
    price: 11.9,
    language: 'EN · RU/ET subtitles',
    description:
      'A photographer spots a stranger in his night images whom nobody else can see. The search leads him to the secret of a vanished city block.',
    translations: {
      ru: {
        title: 'Другая сторона ночи',
        meta: '16+ · Триллер · 1 ч 47 мин',
        badge: 'Премьера',
        language: 'EN · субтитры RU/ET',
        description:
          'Фотограф замечает на своих ночных снимках незнакомку, которую никто больше не видит. Поиски приводят его к тайне исчезнувшего квартала.',
      },
      et: {
        title: 'Öö teine pool',
        meta: '16+ · Põnevik · 1 h 47 min',
        badge: 'Esilinastus',
        language: 'EN · RU/ET subtiitrid',
        description:
          'Fotograaf märkab oma öistel piltidel võõrast, keda keegi teine ei näe. Otsing viib ta kadunud linnakvartali saladuseni.',
      },
    },
  },
  {
    id: 'rain-city',
    title: 'City After Rain',
    meta: '12+ · Drama · 2h 04m',
    image: '/images/rain-city.jpg',
    backdrop: '/images/backdrop-rain.jpg',
    times: ['16:15', '18:45', '20:30'],
    badge: 'Lumen Selection',
    genre: ['arthouse'],
    rating: '7.8',
    price: 10.9,
    language: 'ET · RU/EN subtitles',
    description:
      'One long walk through a rain-soaked city changes the lives of three strangers. A quiet story about chance, memory and second chances.',
    translations: {
      ru: {
        title: 'Город после дождя',
        meta: '12+ · Драма · 2 ч 04 мин',
        badge: 'Выбор Lumen',
        language: 'ET · субтитры RU/EN',
        description:
          'Одна длинная прогулка по мокрому городу меняет жизни трёх незнакомцев. Тихое кино о случайностях, памяти и втором шансе.',
      },
      et: {
        title: 'Linn pärast vihma',
        meta: '12+ · Draama · 2 h 04 min',
        badge: 'Lumeni valik',
        language: 'ET · RU/EN subtiitrid',
        description:
          'Üks pikk jalutuskäik vihmases linnas muudab kolme võõra elu. Vaikne lugu juhusest, mälust ja uutest võimalustest.',
      },
    },
  },
  {
    id: 'zero-orbit',
    title: 'Zero Orbit',
    meta: '12+ · Sci-fi · 1h 56m',
    image: '/images/zero-orbit.jpg',
    backdrop: '/images/backdrop-orbit.jpg',
    times: ['15:50', '18:10', '22:20'],
    badge: 'Dolby Atmos',
    genre: ['premiere'],
    rating: '8.4',
    price: 13.9,
    language: 'EN · RU/ET subtitles',
    description:
      'The crew of the first private space station loses contact with Earth and discovers a signal no human could have sent.',
    translations: {
      ru: {
        title: 'Нулевая орбита',
        meta: '12+ · Фантастика · 1 ч 56 мин',
        badge: 'Dolby Atmos',
        language: 'EN · субтитры RU/ET',
        description:
          'Экипаж первой частной станции теряет связь с Землёй и обнаруживает сигнал, который не мог быть отправлен человеком.',
      },
      et: {
        title: 'Nullorbiit',
        meta: '12+ · Ulme · 1 h 56 min',
        badge: 'Dolby Atmos',
        language: 'EN · RU/ET subtiitrid',
        description:
          'Esimese erajaama meeskond kaotab ühenduse Maaga ja avastab signaali, mida ükski inimene poleks saanud saata.',
      },
    },
  },
  {
    id: 'last-stop',
    title: 'Last Stop',
    meta: '16+ · Crime · 1h 52m',
    image: '/images/last-stop.jpg',
    backdrop: '/images/backdrop-rain.jpg',
    times: ['14:30', '19:00', '21:35'],
    badge: 'New release',
    genre: ['premiere', 'thriller'],
    rating: '7.6',
    price: 10.9,
    language: 'RU · ET subtitles',
    description:
      'A night driver takes one last fare and lands between two people ready to do anything for the contents of a forgotten suitcase.',
    translations: {
      ru: {
        title: 'Последняя остановка',
        meta: '16+ · Криминал · 1 ч 52 мин',
        badge: 'Новинка',
        language: 'RU · субтитры ET',
        description:
          'Ночной водитель получает последний заказ и оказывается между двумя людьми, которые готовы на всё ради содержимого забытого чемодана.',
      },
      et: {
        title: 'Viimane peatus',
        meta: '16+ · Krimi · 1 h 52 min',
        badge: 'Uus',
        language: 'RU · ET subtiitrid',
        description:
          'Öine juht võtab viimase tellimuse ja satub kahe inimese vahele, kes on unustatud kohvri sisu nimel valmis kõigeks.',
      },
    },
  },
  {
    id: 'signal',
    title: 'Signal in the Silence',
    meta: '6+ · Adventure · 1h 34m',
    image: '/images/signal.jpg',
    backdrop: '/images/backdrop-orbit.jpg',
    times: ['12:10', '14:20', '16:40'],
    badge: 'Family film',
    genre: ['family'],
    rating: '8.0',
    price: 8.9,
    language: 'RU dub · ET',
    description:
      'A brother and sister find an old radio transmitter and follow a voice calling them from a distant island.',
    translations: {
      ru: {
        title: 'Сигнал в тишине',
        meta: '6+ · Приключения · 1 ч 34 мин',
        badge: 'Семейное кино',
        language: 'RU дубляж · ET',
        description:
          'Брат и сестра находят старый радиопередатчик и отправляются навстречу голосу, который зовёт их с далёкого острова.',
      },
      et: {
        title: 'Signaal vaikuses',
        meta: '6+ · Seiklus · 1 h 34 min',
        badge: 'Perefilm',
        language: 'RU dubleering · ET',
        description:
          'Õde ja vend leiavad vana raadiosaatja ning lähevad otsima häält, mis kutsub neid kaugelt saarelt.',
      },
    },
  },
  {
    id: 'lost-light',
    title: 'Lost Light',
    meta: '12+ · Romance · 1h 43m',
    image: '/images/lost-light.jpg',
    backdrop: '/images/backdrop-night.jpg',
    times: ['13:25', '17:10', '20:10'],
    badge: 'Only at Lumen',
    genre: ['arthouse'],
    rating: '7.9',
    price: 9.9,
    language: 'FR · RU/ET subtitles',
    description:
      'A restorer of vintage signs and an architect meet in a city preparing to switch off its last neon light forever.',
    translations: {
      ru: {
        title: 'Потерянный свет',
        meta: '12+ · Мелодрама · 1 ч 43 мин',
        badge: 'Только в Lumen',
        language: 'FR · субтитры RU/ET',
        description:
          'Реставратор старых вывесок и архитектор встречаются в городе, который готовится навсегда выключить свой последний неон.',
      },
      et: {
        title: 'Kadunud valgus',
        meta: '12+ · Romantika · 1 h 43 min',
        badge: 'Ainult Lumenis',
        language: 'FR · RU/ET subtiitrid',
        description:
          'Vanade valgusreklaamide restauraator ja arhitekt kohtuvad linnas, mis valmistub oma viimast neoonvalgust igaveseks kustutama.',
      },
    },
  },
];

export function getMovieCopy(movie: Movie, locale: Locale): MovieCopy {
  if (locale === 'en') {
    return {
      title: movie.title,
      meta: movie.meta,
      badge: movie.badge,
      description: movie.description,
      language: movie.language,
    };
  }
  return movie.translations[locale];
}

export function getMoviePriceCents(titleOrId: string) {
  const movie = movies.find(
    (item) =>
      item.id === titleOrId ||
      item.title === titleOrId ||
      item.translations.ru.title === titleOrId ||
      item.translations.et.title === titleOrId,
  );
  return movie ? Math.round(movie.price * 100) : null;
}
