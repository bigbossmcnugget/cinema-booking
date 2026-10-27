'use client';
import { LanguageSwitcher } from './language-switcher';
import type { CinemaController } from '@/lib/use-cinema';

export function CinemaFooter({ model }: { model: CinemaController }) {
  const { locale, backendReady, c, changeLocale } = model;
  return (
    <footer className="border-t border-white/8 px-5 pb-10 pt-12 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <a className="wordmark text-2xl" href="#top">
            <span className="lumen-mark" aria-hidden="true">
              L
            </span>
            <span>LUMEN</span>
          </a>
          <p className="mt-4 max-w-md text-sm text-white/38">{c.footerLine}</p>
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
  );
}
