// src/lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[supabaseAdmin] Missing Supabase URL or SERVICE_ROLE_KEY - using fallback client');
}

// Create client with fallback values to prevent build-time errors
// Runtime errors will occur if env vars are missing, but build will succeed
export const supabaseAdmin = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
  {
    auth: { persistSession: false },
  }
);
