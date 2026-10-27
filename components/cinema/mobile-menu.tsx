'use client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { LanguageSwitcher } from './language-switcher';
import type { CinemaController } from '@/lib/use-cinema';

export function MobileMenu({ model }: { model: CinemaController }) {
  const { locale, menuOpen, c, setMenuOpen, changeLocale } = model;
  return (
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
  );
}
