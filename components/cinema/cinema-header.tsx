'use client';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './language-switcher';
import type { CinemaController } from '@/lib/use-cinema';

export function CinemaHeader({ model }: { model: CinemaController }) {
  const { locale, c, setSearchOpen, setMenuOpen, changeLocale } = model;
  return (
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
  );
}
