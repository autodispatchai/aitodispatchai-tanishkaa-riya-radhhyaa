'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('cookie_consent');
      if (!consent) {
        setShow(true);
      }
    }
  }, []);

  const handleAccept = (type: 'all' | 'essential') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookie_consent', type);
      setShow(false);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-neutral-700 leading-relaxed">
                We use cookies to improve your experience. By continuing, you accept our{' '}
                <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 underline font-medium">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleAccept('essential')}
                className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors whitespace-nowrap"
              >
                Reject
              </button>
              <button
                onClick={() => handleAccept('all')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

