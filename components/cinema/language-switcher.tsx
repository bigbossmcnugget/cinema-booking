'use client';
import type { Locale } from '@/lib/catalog';
export function LanguageSwitcher({
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
