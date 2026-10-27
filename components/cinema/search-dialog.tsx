'use client';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getMovieCopy } from '@/lib/catalog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CinemaController } from '@/lib/use-cinema';

export function SearchDialog({ model }: { model: CinemaController }) {
  const {
    locale,
    searchOpen,
    query,
    c,
    searchResults,
    setSearchOpen,
    setQuery,
    setDetailMovie,
  } = model;
  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-x-hidden overflow-y-auto border-white/10 bg-[#111010]/95 p-0  sm:max-w-2xl">
        <DialogHeader className="border-b border-white/8 p-6 pb-5">
          <DialogTitle className="text-2xl font-black tracking-[-.04em]">
            {c.searchTitle}
          </DialogTitle>
          <DialogDescription>{c.searchText}</DialogDescription>
        </DialogHeader>
        <div className="p-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={c.searchPlaceholder}
              className="h-13 rounded-xl bg-white/[.055] pl-11"
            />
          </div>
          <div className="mt-5 grid gap-2">
            {searchResults.length ? (
              searchResults.map((movie) => {
                const copy = getMovieCopy(movie, locale);
                return (
                  <button
                    key={movie.id}
                    onClick={() => {
                      setSearchOpen(false);
                      setDetailMovie(movie);
                    }}
                    className="group flex items-center gap-4 rounded-xl border border-transparent p-2 text-left hover:border-white/8 hover:bg-white/[.04]"
                  >
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        fill
                        sizes="112px"
                        className="object-cover   "
                        src={movie.image}
                        alt=""
                      />
                    </div>
                    <span className="min-w-0">
                      <span className="block font-bold">{copy.title}</span>
                      <span className="mt-1 block text-xs text-white/38">
                        {copy.meta} · {movie.times[0]}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="py-12 text-center text-sm text-white/40">
                {c.noResults}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
