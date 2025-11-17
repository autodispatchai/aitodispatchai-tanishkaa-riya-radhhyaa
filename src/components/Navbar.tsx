// src/components/Navbar.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#features', label: 'Features' },
    { href: '/choose-plan', label: 'Pricing' },
    { href: '/about-us', label: 'About Us' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl h-16 px-4 flex items-center justify-between gap-3">
        <Link href="/" aria-label="AutoDispatchAI" className="flex items-center gap-2">
          <span className="font-extrabold tracking-tight text-2xl sm:text-3xl">
            Auto
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500">
              Dispatch
            </span>
            AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6 text-[15px]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-purple-700 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 ml-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-purple-700 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Start 14-Day Trial
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(true)}
          aria-label="Open Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-50 bg-white"
          >
            <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
              <span className="font-extrabold text-xl">AutoDispatchAI</span>
              <button
                className="p-2"
                onClick={() => setMobileOpen(false)}
                aria-label="Close Menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-lg font-medium hover:text-purple-700 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-neutral-200 space-y-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-lg font-medium hover:text-purple-700 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center w-full px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Start 14-Day Trial
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

