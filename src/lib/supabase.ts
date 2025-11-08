// File Path: src/lib/supabase.ts
// Hun eh code sahi package de naal 100% chalega

import { createBrowserClient } from '@supabase/ssr'; // <-- DEKHO, HUN EH @supabase/ssr TON AA REHA HAI

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);