'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Welcome to AutoDispatchAI</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your 14-day free trial is active! Start adding loads.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Active Loads</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Profit Today</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">$0</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Trial Days Left</h3>
            <p className="text-3xl font-bold mt-2 text-blue-600">14</p>
          </div>
        </div>

        <div className="mt-10 bg-white p-8 rounded-xl shadow">
          <h2 className="text-2xl font-bold mb-4">Connect Your Email</h2>
          <p className="text-gray-600 mb-6">
            Let AutoDispatchAI read your load emails automatically.
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700">
            Connect Gmail / Outlook
          </button>
        </div>
      </div>
    </div>
  );
}