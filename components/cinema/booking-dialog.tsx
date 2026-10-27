'use client';
import Image from 'next/image';
import { Check } from 'lucide-react';
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

const seatRows = ['A', 'B', 'C', 'D', 'E', 'F'];

export function BookingDialog({ model }: { model: CinemaController }) {
  const {
    locale,
    activeDate,
    bookingMovie,
    bookingTime,
    bookingStep,
    selectedSeats,
    unavailableSeats,
    seatsLoading,
    bookingSubmitting,
    bookingError,
    confirmationId,
    bookingHall,
    c,
    dates,
    orderTotal,
    setBookingMovie,
    setBookingStep,
    setBookingError,
    openBooking,
    toggleSeat,
    submitBooking,
  } = model;
  return (
    <Dialog
      open={!!bookingMovie}
      onOpenChange={(open) => !open && setBookingMovie(null)}
    >
      <DialogContent
        className={`max-h-[94vh] max-w-6xl overflow-x-hidden overflow-y-auto border-white/10 bg-[#0e0d0d]/98 p-0 sm:max-w-6xl ${bookingStep === 'checkout' ? 'checkout-dialog' : ''}`}
      >
        {bookingMovie && bookingStep === 'seats' && (
          <div className="grid lg:grid-cols-[1fr_320px]">
            <div className="p-5 sm:p-9">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-[-.05em]">
                  {c.chooseSeats}
                </DialogTitle>
                <DialogDescription>
                  {getMovieCopy(bookingMovie, locale).title} ·{' '}
                  {dates[activeDate].day}, {bookingTime} · Lumen Rotermann
                </DialogDescription>
              </DialogHeader>
              <div className="relative mx-auto mt-10 max-w-xl">
                {seatsLoading && (
                  <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-[#111]/85 text-sm text-white/55 ">
                    {c.loadingSeats}
                  </div>
                )}
                <div className="mx-auto mb-6 w-full border-b border-white/25 py-2 text-center text-sm text-white/65">
                  {c.screen}
                </div>
                <div className="mt-5 grid gap-2.5 overflow-x-auto pb-2">
                  {seatRows.map((row) => (
                    <div
                      key={row}
                      className="grid min-w-[510px] grid-cols-[24px_repeat(10,1fr)_24px] items-center gap-2"
                    >
                      <span className="text-[10px] text-white/25">{row}</span>
                      {Array.from(
                        { length: 10 },
                        (_, index) => `${row}${index + 1}`,
                      ).map((seat, seatIndex) => {
                        const occupied = unavailableSeats.includes(seat);
                        const selected = selectedSeats.includes(seat);
                        return (
                          <button
                            key={seat}
                            disabled={occupied}
                            onClick={() => toggleSeat(seat)}
                            aria-label={seat}
                            className={`aspect-square rounded-t-lg rounded-b-[5px] border text-[9px] font-bold  ${occupied ? 'cursor-not-allowed border-transparent bg-white/[.04] text-white/12' : selected ? 'border-primary bg-primary text-white' : 'border-white/12 bg-white/[.055] text-white/40 hover:border-primary/60 hover:text-white'}`}
                          >
                            {seatIndex + 1}
                          </button>
                        );
                      })}
                      <span className="text-right text-[10px] text-white/25">
                        {row}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-5 text-[10px] text-white/35">
                  <span className="flex items-center gap-2">
                    <i className="size-3 rounded-sm border border-white/20 bg-white/[.06]" />
                    {c.free}
                  </span>
                  <span className="flex items-center gap-2">
                    <i className="size-3 rounded-sm bg-primary" />
                    {c.selected}
                  </span>
                  <span className="flex items-center gap-2">
                    <i className="size-3 rounded-sm bg-white/[.04]" />
                    {c.occupied}
                  </span>
                </div>
              </div>
            </div>
            <aside className="flex flex-col border-t border-white/8 bg-[#121010] p-6 lg:border-l lg:border-t-0">
              <div className="relative h-36 w-full overflow-hidden rounded-xl">
                <Image
                  fill
                  sizes="320px"
                  className="object-cover"
                  src={bookingMovie.image}
                  alt=""
                />
              </div>
              <h3 className="mt-5 text-lg font-bold">
                {getMovieCopy(bookingMovie, locale).title}
              </h3>
              <p className="mt-1 text-xs text-white/40">
                {dates[activeDate].day}, {dates[activeDate].date} ·{' '}
                {bookingTime}
              </p>
              <div className="mt-6 space-y-3 border-y border-white/8 py-5 text-xs">
                <div className="flex justify-between text-white/40">
                  <span>{c.hall}</span>
                  <span className="text-white">{bookingHall || '—'}</span>
                </div>
                <div className="flex justify-between text-white/40">
                  <span>{c.seats}</span>
                  <span className="text-white">
                    {selectedSeats.length ? selectedSeats.join(', ') : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-white/40">
                  <span>{c.tickets}</span>
                  <span className="text-white">{selectedSeats.length}</span>
                </div>
              </div>
              <div className="mt-auto pt-6">
                {bookingError && (
                  <div
                    role="alert"
                    className="mb-4 rounded-xl bg-primary/10 p-3 text-xs text-red-200"
                  >
                    <p>{bookingError}</p>
                    <button
                      className="mt-2 underline"
                      type="button"
                      onClick={() => openBooking(bookingMovie, bookingTime)}
                    >
                      ↻ {c.retry}
                    </button>
                  </div>
                )}
                <div className="mb-5 flex items-end justify-between">
                  <span className="text-xs text-white/40">{c.total}</span>
                  <strong className="text-2xl">
                    {orderTotal.toFixed(2)} €
                  </strong>
                </div>
                <Button
                  disabled={
                    !selectedSeats.length || seatsLoading || !!bookingError
                  }
                  onClick={() => {
                    setBookingError('');
                    setBookingStep('checkout');
                  }}
                  className="h-12 w-full rounded-xl bg-primary font-bold text-white hover:bg-[#ff6258]"
                >
                  {c.continue}
                </Button>
              </div>
            </aside>
          </div>
        )}
        {bookingMovie && bookingStep === 'checkout' && (
          <div className="plain-checkout">
            <button type="button" onClick={() => setBookingStep('seats')}>
              {c.backSeats}
            </button>
            <DialogHeader>
              <DialogTitle>{c.checkoutTitle}</DialogTitle>
              <DialogDescription>{c.checkoutText}</DialogDescription>
            </DialogHeader>
            <p>
              {getMovieCopy(bookingMovie, locale).title} ·{' '}
              {dates[activeDate].date} · {bookingTime}
            </p>
            <p>
              {c.seats}: {selectedSeats.join(', ')} · {c.total}:{' '}
              {orderTotal.toFixed(2)} €
            </p>
            <form onSubmit={submitBooking}>
              <label htmlFor="checkout-name">{c.name}</label>
              <input
                id="checkout-name"
                name="name"
                required
                minLength={2}
                maxLength={80}
                placeholder={c.namePlaceholder}
                autoComplete="name"
              />
              <label htmlFor="checkout-email">{c.emailLabel}</label>
              <input
                id="checkout-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
              <p>{c.demoNotice}</p>
              {bookingError && <p role="alert">{bookingError}</p>}
              <button disabled={bookingSubmitting} type="submit">
                {bookingSubmitting ? c.saving : c.confirmOrder}
              </button>
            </form>
          </div>
        )}
        {bookingMovie && bookingStep === 'success' && (
          <div className="flex min-h-[560px] flex-col items-center justify-center p-8 text-center">
            <div className="grid size-20 place-items-center rounded-full bg-primary text-white">
              <Check className="size-9" strokeWidth={3} />
            </div>
            <DialogHeader className="mt-7 items-center">
              <DialogTitle className="text-4xl font-black tracking-[-.055em]">
                {c.successTitle}
              </DialogTitle>
              <DialogDescription className="max-w-md text-center">
                {c.successText}{' '}
                <span className="font-bold text-white">{confirmationId}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="mt-7 rounded-xl border border-white/8 bg-white/[.035] px-6 py-4 text-sm">
              <span className="text-white/40">
                {getMovieCopy(bookingMovie, locale).title}
              </span>
              <br />
              <strong>
                {bookingTime} · {c.seats.toLowerCase()}{' '}
                {selectedSeats.join(', ')}
              </strong>
            </div>
            <Button
              onClick={() => setBookingMovie(null)}
              className="mt-8 h-12 rounded-full bg-primary px-7 font-bold text-white hover:bg-[#ff6258]"
            >
              {c.done}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
