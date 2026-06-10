import type { Metadata } from 'next';
import { Poppins, Space_Grotesk } from 'next/font/google';
import './globals.css';
import AppProviders from '@/components/providers/AppProviders';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'PingME — Privacy-First NFC Smart Tags',
    template: '%s | PingME',
  },
  description:
    'PingME is a privacy-first contact ecosystem for vehicles, belongings, and pets powered by NFC and QR technology.',
  keywords: ['NFC', 'smart tags', 'vehicle tags', 'pet tags', 'lost and found', 'QR code'],
  metadataBase: new URL('https://plzpingme.com'),
  openGraph: {
    title: 'PingME — Privacy-First NFC Smart Tags',
    description:
      'Privacy-first contact ecosystem for vehicles, belongings, and pets.',
    url: 'https://plzpingme.com',
    siteName: 'PingME',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PingME — Privacy-First NFC Smart Tags',
    description: 'Privacy-first contact ecosystem powered by NFC & QR.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${spaceGrotesk.variable}`}>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
