// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr';

// ✅ CLIENT-SIDE: for use in React components or pages
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
