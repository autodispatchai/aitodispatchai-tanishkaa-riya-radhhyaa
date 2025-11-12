// src/app/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// ===== SEO METADATA (Canada + AutoDispatchAI) =====
export const metadata: Metadata = {
  title: 'AutoDispatchAI — AI Dispatch Automation for Fleets (Canada & US)',
  description: '24/7 AI dispatcher that reads emails, finds loads, negotiates, tracks drivers. Human-in-the-loop. Start 14-day trial.',
  keywords: 'AI dispatch, trucking automation, load board, Samsara, Gmail dispatch, cross-border, eManifest, Canada trucking',
  metadataBase: new URL('https://autodispatchai.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-CA': '/',
    },
  },
  openGraph: {
    title: 'AutoDispatchAI — Your Dispatcher Never Sleeps',
    description: 'AI automation for trucking fleets. Save 30–50% planner time. Up to 80% workflows automated.',
    url: 'https://autodispatchai.com',
    siteName: 'AutoDispatchAI',
    images: [
      {
        url: '/og-image.jpg', // public/og-image.jpg
        width: 1200,
        height: 630,
        alt: 'AutoDispatchAI — AI Dispatch Dashboard',
      },
    ],
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoDispatchAI — AI Dispatch for Fleets',
    description: 'Never miss a load. AI reads, matches, negotiates — you approve.',
    images: ['/og-image.jpg'],
    creator: '@AutoDispatchAI',
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
  verification: {
    google: 'your-google-site-verification-code', // Optional
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA">
      <head>
        {/* Favicon (Optional) */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}