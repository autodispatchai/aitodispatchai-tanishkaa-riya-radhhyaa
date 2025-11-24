-- ============================================================
-- Migration: Create users, companies, and files tables
-- Purpose: Map Clerk users to Supabase, enable tenant isolation
-- ============================================================

-- 1. USERS TABLE (Clerk → Supabase mapping)
-- This table maps Clerk user IDs to Supabase user records
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL UNIQUE, -- Clerk user ID (e.g., user_2abc123)
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'owner')),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON public.users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);

-- 2. UPDATE COMPANIES TABLE
-- Add clerk_user_id column and update owner_id to reference users table
-- Note: If companies table already exists, we'll migrate gradually

-- First, check if companies table exists and has owner_id
-- If it references auth.users, we'll need to migrate data
DO $$
BEGIN
  -- Add clerk_user_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'companies' 
    AND column_name = 'clerk_user_id'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN clerk_user_id TEXT;
    CREATE INDEX IF NOT EXISTS idx_companies_clerk_user_id ON public.companies(clerk_user_id);
  END IF;

  -- Update owner_id to reference users table instead of auth.users
  -- This is a breaking change, so we'll keep both for migration period
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'companies' 
    AND column_name = 'owner_user_id'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN owner_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_companies_owner_user_id ON public.companies(owner_user_id);
  END IF;
END $$;

-- 3. FILES TABLE (for signed URL uploads)
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  truck_id UUID, -- Optional: link to truck/vehicle
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase storage path
  file_type TEXT, -- MIME type
  file_size BIGINT, -- bytes
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for files table
CREATE INDEX IF NOT EXISTS idx_files_company_id ON public.files(company_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_truck_id ON public.files(truck_id);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON public.files(created_at DESC);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can view their own record
CREATE POLICY "Users can view own record"
  ON public.users FOR SELECT
  USING (
    -- Option 1: Using Clerk user ID from JWT claims (if injected)
    auth.jwt() ->> 'clerk_user_id' = clerk_user_id
    OR
    -- Option 2: Using function-based check (requires helper function)
    public.get_user_id_from_clerk() = clerk_user_id
  );

-- Users can update their own record
CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE
  USING (
    auth.jwt() ->> 'clerk_user_id' = clerk_user_id
    OR
    public.get_user_id_from_clerk() = clerk_user_id
  );

-- Admins can view all users in their company
CREATE POLICY "Admins can view company users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = (SELECT id FROM public.users WHERE clerk_user_id = (auth.jwt() ->> 'clerk_user_id'))
      AND u.role IN ('admin', 'owner')
      AND u.company_id = public.users.company_id
    )
  );

-- Files table policies
-- Users can view files from their company
CREATE POLICY "Users can view company files"
  ON public.files FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.users
      WHERE clerk_user_id = (auth.jwt() ->> 'clerk_user_id')
    )
  );

-- Users can insert files for their company
CREATE POLICY "Users can insert company files"
  ON public.files FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.users
      WHERE clerk_user_id = (auth.jwt() ->> 'clerk_user_id')
    )
  );

-- Users can update their own files
CREATE POLICY "Users can update own files"
  ON public.files FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM public.users
      WHERE clerk_user_id = (auth.jwt() ->> 'clerk_user_id')
    )
  );

-- Users can delete their own files
CREATE POLICY "Users can delete own files"
  ON public.files FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM public.users
      WHERE clerk_user_id = (auth.jwt() ->> 'clerk_user_id')
    )
  );

-- 5. HELPER FUNCTION (Alternative to JWT claims)
-- This function extracts Clerk user ID from request context
-- Note: This requires custom implementation in your app
CREATE OR REPLACE FUNCTION public.get_user_id_from_clerk()
RETURNS TEXT AS $$
BEGIN
  -- This will be set by your application via SET LOCAL
  -- Example: SET LOCAL clerk_user_id = 'user_2abc123';
  RETURN current_setting('app.clerk_user_id', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. EXAMPLE INSERT STATEMENTS (for testing)
-- These are commented out - uncomment to test

-- INSERT INTO public.users (clerk_user_id, email, first_name, last_name, role)
-- VALUES ('user_2abc123', 'test@example.com', 'John', 'Doe', 'owner');

-- INSERT INTO public.companies (company_name, email, clerk_user_id, owner_user_id)
-- VALUES (
--   'Test Company',
--   'test@example.com',
--   'user_2abc123',
--   (SELECT id FROM public.users WHERE clerk_user_id = 'user_2abc123')
-- );

-- ============================================================
-- NOTES:
-- 1. Supabase Auth is DISABLED - Clerk is single source of truth
-- 2. To disable Supabase Auth:
--    - Go to Supabase Dashboard → Authentication → Settings
--    - Disable "Enable email signup" and all OAuth providers
--    - Or use RLS to block auth.users access
-- 3. JWT claims injection: Clerk JWT must include 'clerk_user_id' claim
--    Configure this in Clerk Dashboard → JWT Templates
-- 4. Migration strategy:
--    - Keep old owner_id column temporarily
--    - Migrate data: UPDATE companies SET owner_user_id = (SELECT id FROM users WHERE clerk_user_id = ...)
--    - Remove old column after migration complete
-- ============================================================

