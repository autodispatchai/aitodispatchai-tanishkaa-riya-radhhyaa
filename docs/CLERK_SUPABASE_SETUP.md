# Clerk + Supabase Integration Setup Guide

This document outlines the complete setup process for integrating Clerk authentication with Supabase for AutoDispatchAI.

## Overview

**Architecture:**
- **Clerk** = Single source of truth for authentication (SOC2 in progress)
- **Supabase** = Data storage and RLS (Row Level Security) for tenant isolation
- **Mapping:** Clerk users → Supabase `users` table via `clerk_user_id`

**Security Statement:**
> AutoDispatchAI uses Clerk for authentication (SOC2 controls in progress). User files stored in Supabase with short-lived signed URLs; PII encrypted in transit & at rest.

---

## 1. Installation

### Prerequisites
- Node.js 18+
- Next.js 14+ (App Router)
- Supabase project
- Clerk account

### Install Dependencies

```bash
npm install @clerk/nextjs svix
```

---

## 2. Environment Variables

Add these to your `.env.local` (and Vercel environment variables):

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_... # From Clerk Dashboard → Webhooks

# Supabase (Data storage only - Auth disabled)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Server-side only, never expose to client

# Site URL
NEXT_PUBLIC_SITE_URL=https://www.autodispatchai.com
```

### Getting Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **API Keys** → Copy `Publishable Key` and `Secret Key`
4. Go to **Webhooks** → Create endpoint → Copy `Signing Secret`

### Getting Supabase Keys

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy `Project URL` and `anon public` key
5. Copy `service_role` key (⚠️ Keep this secret!)

---

## 3. Database Setup

### Run SQL Migrations

1. Go to Supabase Dashboard → **SQL Editor**
2. Run the migration file: `sql/migrations/001_create_users_companies_files.sql`

This creates:
- `users` table (Clerk → Supabase mapping)
- Updates `companies` table with `clerk_user_id` and `owner_user_id`
- `files` table for file metadata
- RLS policies for tenant isolation

### Verify Tables

```sql
-- Check users table
SELECT * FROM public.users LIMIT 5;

-- Check companies table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'companies';
```

---

## 4. Disable Supabase Auth

**Important:** Clerk is now the single source of truth for authentication.

### Steps to Disable Supabase Auth

1. Go to Supabase Dashboard → **Authentication** → **Settings**
2. Disable:
   - ✅ Email signup
   - ✅ All OAuth providers (Google, Azure, etc.)
   - ✅ Magic links
3. **Optional:** Add RLS policy to block `auth.users` access:

```sql
-- Block direct access to auth.users (optional)
CREATE POLICY "Block auth.users access"
  ON auth.users FOR ALL
  USING (false);
```

---

## 5. Clerk Webhook Configuration

### Create Webhook Endpoint in Clerk

1. Go to Clerk Dashboard → **Webhooks**
2. Click **Add Endpoint**
3. Enter URL: `https://www.autodispatchai.com/api/clerk/webhook`
4. Select events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted` (optional)
5. Copy the **Signing Secret** → Add to `CLERK_WEBHOOK_SECRET`

### Test Webhook

```bash
# Health check
curl https://www.autodispatchai.com/api/clerk/webhook

# Should return: {"status":"webhook alive","ts":"...","configured":true}
```

### Verify Webhook Works

1. Sign up a new user via Clerk
2. Check Supabase `users` table:
   ```sql
   SELECT * FROM public.users WHERE clerk_user_id = 'user_...';
   ```
3. Should see a new row with Clerk user ID mapped

---

## 6. JWT Claims Configuration (Optional but Recommended)

To enable RLS policies that use `auth.jwt() ->> 'clerk_user_id'`, configure Clerk JWT:

1. Go to Clerk Dashboard → **JWT Templates**
2. Create new template or edit default
3. Add claim:
   ```json
   {
     "clerk_user_id": "{{user.id}}"
   }
   ```
4. Save and apply to your application

**Note:** If JWT claims aren't configured, RLS will fall back to function-based checks (`get_user_id_from_clerk()`).

---

## 7. Supabase Storage Setup

### Create Storage Bucket

1. Go to Supabase Dashboard → **Storage**
2. Create bucket: `files`
3. Set to **Private** (not public)
4. Enable RLS

### Storage RLS Policy

```sql
-- Allow authenticated users to upload to their company folder
CREATE POLICY "Users can upload to company folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'files' AND
    (storage.foldername(name))[1] = 'companies' AND
    (storage.foldername(name))[2] IN (
      SELECT company_id::text FROM public.users
      WHERE clerk_user_id = (auth.jwt() ->> 'clerk_user_id')
    )
  );
```

---

## 8. Vercel Deployment Checklist

### Environment Variables

Add all environment variables from step 2 to Vercel:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add each variable for **Production**, **Preview**, and **Development**
3. **Important:** `SUPABASE_SERVICE_ROLE_KEY` should only be available server-side

### Deploy

```bash
git push origin main
# Vercel will auto-deploy
```

### Post-Deployment

1. ✅ Verify webhook endpoint is accessible
2. ✅ Test sign up flow → Check Supabase `users` table
3. ✅ Test file upload → Check Supabase Storage
4. ✅ Check Vercel logs for any errors

---

## 9. Testing the Integration

### Test Flow

1. **Sign Up:**
   - Visit `https://www.autodispatchai.com`
   - Click "Sign Up"
   - Complete Clerk signup
   - Verify webhook creates user in Supabase

2. **Create Company:**
   - After signup, create company
   - Verify `companies` table has `clerk_user_id` set

3. **File Upload:**
   ```typescript
   // Frontend example
   const res = await fetch('/api/storage/upload-url?company_id=...&file_name=test.pdf');
   const { uploadUrl, filePath } = await res.json();
   
   // Upload file
   await fetch(uploadUrl, {
     method: 'PUT',
     body: file,
     headers: { 'Content-Type': 'application/pdf' },
   });
   ```

4. **RLS Verification:**
   - Try accessing another company's data → Should be blocked
   - Verify only own company data is accessible

---

## 10. Troubleshooting

### Webhook Not Working

**Symptoms:** Users created in Clerk but not in Supabase

**Solutions:**
1. Check `CLERK_WEBHOOK_SECRET` is set correctly
2. Verify webhook URL is accessible (not blocked by firewall)
3. Check Vercel logs: `vercel logs --follow`
4. Test webhook manually:
   ```bash
   curl -X POST https://www.autodispatchai.com/api/clerk/webhook \
     -H "svix-id: test" \
     -H "svix-timestamp: 1234567890" \
     -H "svix-signature: test"
   ```

### RLS Policies Not Working

**Symptoms:** Users can't access their own data

**Solutions:**
1. Verify JWT claims include `clerk_user_id`
2. Check RLS policies are enabled: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
3. Use function-based check if JWT claims aren't available:
   ```sql
   -- In your app, before query:
   SET LOCAL app.clerk_user_id = 'user_2abc123';
   ```

### File Upload Fails

**Symptoms:** 403 or 500 errors when uploading

**Solutions:**
1. Verify storage bucket exists and is named `files`
2. Check RLS policies on `storage.objects`
3. Verify `SUPABASE_SERVICE_ROLE_KEY` is set (server-side only)
4. Check file path format matches policy expectations

---

## 11. Migration from Supabase Auth

If you're migrating from Supabase Auth to Clerk:

### Step 1: Export Existing Users

```sql
-- Export Supabase auth.users to CSV
COPY (
  SELECT id, email, created_at 
  FROM auth.users
) TO '/tmp/users_export.csv' WITH CSV HEADER;
```

### Step 2: Create Clerk Users

- Use Clerk Dashboard → **Users** → **Import Users** (if available)
- Or use Clerk API to create users programmatically

### Step 3: Map Users

```sql
-- Update companies table with clerk_user_id
UPDATE companies c
SET clerk_user_id = u.clerk_user_id
FROM users u
WHERE c.owner_id = u.id; -- Assuming you've migrated owner_id
```

### Step 4: Verify Migration

```sql
-- Check all companies have clerk_user_id
SELECT COUNT(*) FROM companies WHERE clerk_user_id IS NULL;
-- Should be 0
```

---

## 12. Security Best Practices

### ✅ Do's

- ✅ Always verify webhook signatures
- ✅ Use `SUPABASE_SERVICE_ROLE_KEY` server-side only
- ✅ Use short-lived signed URLs (1 hour max)
- ✅ Enable RLS on all tables
- ✅ Validate user access before database operations
- ✅ Log all authentication events

### ❌ Don'ts

- ❌ Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- ❌ Don't disable RLS policies
- ❌ Don't trust client-provided user IDs
- ❌ Don't use long-lived signed URLs
- ❌ Don't skip webhook signature verification

---

## 13. Support & Resources

- **Clerk Docs:** https://clerk.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Webhook Testing:** Use Clerk Dashboard → Webhooks → Test endpoint
- **RLS Debugging:** Enable Supabase query logging

---

## 14. CEO Summary

**What Changed:**
- Replaced Supabase Auth with Clerk (enterprise-grade authentication)
- Added user mapping table to link Clerk users to Supabase data
- Implemented secure file upload flow with signed URLs

**Security:**
- All authentication handled by Clerk (SOC2 in progress)
- Data stored in Supabase with tenant isolation (RLS)
- Files uploaded via short-lived signed URLs (1 hour expiry)

**Next Steps:**
1. Configure Clerk webhook in production
2. Run database migrations
3. Test signup flow end-to-end
4. Monitor webhook logs for first 24 hours

---

**Last Updated:** 2025-01-XX  
**Maintained By:** AutoDispatchAI Engineering Team

