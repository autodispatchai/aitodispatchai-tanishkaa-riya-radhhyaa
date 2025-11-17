import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import CookieConsent from '@/components/CookieConsent';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = Roboto_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: {
    default: 'AutoDispatchAI — AI Dispatch Automation for Fleets (Canada & US)',
    template: '%s — AutoDispatchAI',
  },
  description: 'Your 24/7 digital dispatcher. Finds loads, negotiates, tracks, and notifies — built for cross-border carriers.',
  metadataBase: new URL('https://autodispatchai.com'),
  keywords: ['AI dispatch', 'trucking automation', 'load board', 'fleet management', 'cross-border logistics'],
  authors: [{ name: 'AutoDispatchAI' }],
  creator: 'AutoDispatchAI',
  publisher: 'AutoDispatchAI Inc.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://autodispatchai.com',
    siteName: 'AutoDispatchAI',
    title: 'AutoDispatchAI — Your Dispatcher Never Sleeps',
    description: 'AI dispatch automation for modern fleets. 24/7 digital dispatcher that finds loads, negotiates, tracks, and notifies.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'AutoDispatchAI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoDispatchAI',
    description: 'Your dispatcher never sleeps. Neither should your profits.',
    images: ['/og.png'],
    creator: '@autodispatchai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'AutoDispatchAI',
              url: 'https://autodispatchai.vercel.app',
              logo: 'https://autodispatchai.vercel.app/logo.png',
              founder: [
                { '@type': 'Person', name: 'Deepak Sidhu', jobTitle: 'CEO & Founder' },
                { '@type': 'Person', name: 'Danny Singh', jobTitle: 'Co-Founder & Operations' },
                { '@type': 'Person', name: 'Komal Sidhu', jobTitle: 'Co-Founder & Tech/AI' },
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased bg-white text-neutral-900">
        {children}
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
// ...existing code...