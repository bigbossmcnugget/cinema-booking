'use client';
import Image from 'next/image';
import { Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMovieCopy } from '@/lib/catalog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CinemaController } from '@/lib/use-cinema';

export function MovieDialog({ model }: { model: CinemaController }) {
  const { locale, detailMovie, c, setDetailMovie, openBooking } = model;
  return (
    <Dialog
      open={!!detailMovie}
      onOpenChange={(open) => !open && setDetailMovie(null)}
    >
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-x-hidden overflow-y-auto border-white/10 bg-[#0e0d0d]/97 p-0  sm:max-w-5xl">
        {detailMovie &&
          (() => {
            const copy = getMovieCopy(detailMovie, locale);
            return (
              <div className="grid lg:grid-cols-[1.15fr_.85fr]">
                <div className="relative min-h-[220px] lg:min-h-[380px]">
                  <Image
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                    src={detailMovie.image}
                    alt={copy.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0d0d] via-transparent to-black/10 lg:bg-gradient-to-r lg:from-transparent lg:to-[#0e0d0d]" />
                </div>
                <div className="flex flex-col p-6 sm:p-9 lg:py-12">
                  <p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">
                    {copy.badge}
                  </p>
                  <DialogHeader className="mt-4">
                    <DialogTitle className="text-2xl font-bold leading-tight sm:text-3xl">
                      {copy.title}
                    </DialogTitle>
                    <DialogDescription>{copy.meta}</DialogDescription>
                  </DialogHeader>
                  <p className="mt-6 text-sm leading-7 text-white/52">
                    {copy.description}
                  </p>
                  <div className="mt-7 grid gap-3 border-y border-white/8 py-5 text-xs">
                    <div className="flex justify-between text-white/35">
                      <span>{c.language}</span>
                      <span className="text-right text-white/70">
                        {copy.language}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/35">
                      <span>{c.format}</span>
                      <span className="text-white/70">4K · Dolby Atmos</span>
                    </div>
                    <div className="flex justify-between text-white/35">
                      <span>{c.firstShow}</span>
                      <span className="text-white/70">
                        {detailMovie.times[0]}
                      </span>
                    </div>
                  </div>
                  <div className="mt-7">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[.16em] text-white/30">
                      {c.bookNow}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {detailMovie.times.map((time) => (
                        <Button
                          key={time}
                          onClick={() => openBooking(detailMovie, time)}
                          className="rounded-full bg-white text-black hover:bg-primary hover:text-white"
                        >
                          <Clock3 />
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
      </DialogContent>
    </Dialog>
  );
}
