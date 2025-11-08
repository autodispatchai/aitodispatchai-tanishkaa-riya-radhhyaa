// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr';

// Export the supabase client
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);