import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6">
          <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
            Your Dispatcher Never Sleeps.
          </span>
          <span className="block mt-3 text-neutral-900">
            Neither Should Your Profits.
          </span>
        </h1>
        <p className="text-xl text-neutral-700 mb-8">
          AI dispatch automation for modern fleets — your 24/7 digital dispatcher that finds loads, negotiates, tracks, and notifies.
        </p>
        <Link
          href="/sign-up"
          className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}