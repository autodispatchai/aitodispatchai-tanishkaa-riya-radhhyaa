# Supabase Database Schema

## Companies Table

The `companies` table stores company information and subscription status.

### Schema

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  legal_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  mc_number TEXT,
  dot_number TEXT,
  cvor_number TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL CHECK (country IN ('Canada', 'USA')),
  consent_public_listing BOOLEAN DEFAULT false,
  invite_code TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('active', 'trialing', 'canceled')) DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_subscription_status ON companies(subscription_status);

-- Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company"
  ON companies FOR UPDATE
  USING (auth.uid() = user_id);
```

### TypeScript Types

The types are defined in `src/types/supabase.ts`:

```typescript
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          legal_name: string | null;
          email: string;
          phone: string | null;
          mc_number: string | null;
          dot_number: string | null;
          cvor_number: string | null;
          address: string;
          city: string;
          state: string;
          postal_code: string;
          country: 'Canada' | 'USA';
          consent_public_listing: boolean;
          invite_code: string | null;
          subscription_status: 'active' | 'trialing' | 'canceled' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          legal_name?: string | null;
          email: string;
          phone?: string | null;
          mc_number?: string | null;
          dot_number?: string | null;
          cvor_number?: string | null;
          address: string;
          city: string;
          state: string;
          postal_code: string;
          country: 'Canada' | 'USA';
          consent_public_listing?: boolean;
          invite_code?: string | null;
          subscription_status?: 'active' | 'trialing' | 'canceled' | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          legal_name?: string | null;
          email?: string;
          phone?: string | null;
          mc_number?: string | null;
          dot_number?: string | null;
          cvor_number?: string | null;
          address?: string;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: 'Canada' | 'USA';
          consent_public_listing?: boolean;
          invite_code?: string | null;
          subscription_status?: 'active' | 'trialing' | 'canceled' | null;
          updated_at?: string;
        };
      };
    };
  };
}
```

## Subscription Flow

1. User signs up → `auth.users` record created
2. User creates company → `companies` record created with `subscription_status = NULL`
3. User selects plan → Stripe checkout session created
4. Stripe webhook → Updates `companies.subscription_status` to `'active'` or `'trialing'`
5. User redirected to `/dashboard` (protected route checks `subscription_status === 'active'`)

## Webhook Handler

The Stripe webhook handler (`src/app/api/stripe/webhook/route.ts`) updates the `subscription_status` field when:
- `checkout.session.completed` → Set to `'active'`
- `customer.subscription.updated` → Update status based on Stripe subscription status
- `customer.subscription.deleted` → Set to `'canceled'`

