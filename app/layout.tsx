import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  variable: '--font-lumen-sans',
  subsets: ['latin', 'cyrillic'],
});

export const metadata: Metadata = {
  title: 'Lumen — Cinema, reimagined',
  description:
    'Discover films, showtimes and unforgettable cinema experiences at Lumen in Tallinn.',
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'Lumen — Cinema, reimagined',
    description:
      'Discover films, showtimes and unforgettable cinema experiences at Lumen.',
    images: [{ url: '/og.png', width: 1730, height: 909, alt: 'Lumen cinema' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lumen — Cinema, reimagined',
    description:
      'Discover films, showtimes and unforgettable cinema experiences at Lumen.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${manrope.variable} antialiased`}>{children}</body>
    </html>
  );
}
