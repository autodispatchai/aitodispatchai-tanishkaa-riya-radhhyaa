# 🔍 Payment Setup Failed - Complete Debug Guide

## 📋 What We Built (Complete Flow)

### 1. **Choose Plan Page** (`/choose-plan`)
- User selects plan (ESSENTIALS, PRO, ENTERPRISE)
- User selects billing cycle (monthly/yearly)
- User can select add-ons
- **Button Click Flow:**
  - If NOT logged in → Redirect to `/signup`
  - If logged in → Call `/api/billing/checkout` API
  - If Enterprise → Redirect to Calendly

### 2. **Checkout API** (`/api/billing/checkout/route.ts`)
**What it does:**
1. Checks if Stripe is configured (STRIPE_SECRET_KEY)
2. Verifies user is logged in (Supabase session)
3. Validates plan name (ESSENTIALS, PRO, ENTERPRISE)
4. Gets Stripe Price ID from environment variables:
   - Format: `PRICE_{PLAN}_{BILLING_CYCLE}`
   - Example: `PRICE_PRO_MONTHLY` = `price_xxxxx`
5. Builds line items (base plan + add-ons)
6. Creates Stripe checkout session with:
   - 14-day free trial
   - Success URL: `/dashboard`
   - Cancel URL: `/choose-plan`
   - Metadata: user_id, plan, billing, addOns
7. Returns Stripe checkout URL

### 3. **Webhook** (`/api/stripe/webhook/route.ts`)
- Listens for Stripe events
- When payment succeeds → Updates Supabase `subscriptions` table
- Sets status to `'trialing'` (14-day trial)

---

## ❌ Current Problem

**Error Message:** "Payment setup failed. Please try again or contact support."

**This error comes from:** `src/app/api/billing/checkout/route.ts` line 184

**Possible Causes:**
1. ❌ **Missing Environment Variables in Vercel** (MOST LIKELY)
2. ❌ **Stripe API Key Issues**
3. ❌ **Authentication/Session Issues**
4. ❌ **Stripe API Call Failing**

---

## 🔧 How to Debug (Step-by-Step)

### Step 1: Check Vercel Logs
1. Go to: https://vercel.com/dashboard
2. Select your project: `aitodispatchai-tanishkaa-riya-radhhyaa`
3. Click **"Logs"** tab
4. Filter by: `[billing/checkout]`
5. Look for these error messages:

**If you see:**
```
❌ Missing price ID: PRICE_PRO_MONTHLY
```
**Solution:** Add `PRICE_PRO_MONTHLY` environment variable in Vercel

**If you see:**
```
❌ Stripe not initialized - STRIPE_SECRET_KEY missing
```
**Solution:** Add `STRIPE_SECRET_KEY` in Vercel

**If you see:**
```
❌ No session or email
```
**Solution:** User not logged in properly

**If you see:**
```
❌ ERROR: [Stripe error message]
```
**Solution:** Check Stripe API key and Price IDs

### Step 2: Check Browser Console
1. Open website: https://www.autodispatchai.com/choose-plan
2. Press **F12** (Developer Tools)
3. Go to **Console** tab
4. Click "Subscribe Now" button
5. Look for these logs:

**Good logs (working):**
```
[choose-plan] ✅ Full API Response: { url: "https://checkout.stripe.com/..." }
[choose-plan] ✅ Valid Stripe URL received: https://checkout.stripe.com/...
```

**Bad logs (error):**
```
[choose-plan] ❌ API Error: { status: 400, error: "Plan not configured..." }
```

### Step 3: Check Vercel Environment Variables
1. Go to: Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. **Required Variables:**
   ```
   STRIPE_SECRET_KEY=sk_test_xxxxx (or sk_live_xxxxx)
   PRICE_ESSENTIALS_MONTHLY=price_xxxxx
   PRICE_ESSENTIALS_YEARLY=price_xxxxx
   PRICE_PRO_MONTHLY=price_xxxxx
   PRICE_PRO_YEARLY=price_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   NEXT_PUBLIC_SITE_URL=https://www.autodispatchai.com
   ```

3. **Check if variables exist:**
   - If missing → Add them
   - If present → Verify values are correct (no extra spaces, correct format)

### Step 4: Verify Stripe Price IDs
1. Go to: https://dashboard.stripe.com/test/products (or /products for live)
2. Find your products:
   - ESSENTIALS (monthly)
   - ESSENTIALS (yearly)
   - PRO (monthly)
   - PRO (yearly)
3. Copy the **Price ID** (starts with `price_`)
4. Match with Vercel environment variables:
   - `PRICE_ESSENTIALS_MONTHLY` should match ESSENTIALS monthly price ID
   - `PRICE_PRO_MONTHLY` should match PRO monthly price ID

---

## 🎯 Most Likely Fix

### Issue: Missing `PRICE_PRO_MONTHLY` in Vercel

**Solution:**
1. Get Stripe Price ID:
   - Stripe Dashboard → Products → PRO → Monthly Price → Copy ID
2. Add to Vercel:
   - Vercel → Settings → Environment Variables
   - Add: `PRICE_PRO_MONTHLY` = `price_xxxxx`
3. Redeploy:
   - Vercel will auto-redeploy
   - Or manually: Deployments → Redeploy

---

## 📝 Code Flow (Technical)

```
User clicks "Subscribe Now"
    ↓
choose-plan/page.tsx → handleChoosePlan()
    ↓
Checks: User logged in? (Supabase session)
    ↓
POST /api/billing/checkout
    ↓
checkout/route.ts:
    1. Check Stripe initialized ✓
    2. Check user authenticated ✓
    3. Parse request body ✓
    4. Validate plan ✓
    5. Get Price ID from env: PRICE_PRO_MONTHLY ❌ (MISSING?)
    6. Build line items ✓
    7. Create Stripe session ❌ (FAILS HERE?)
    8. Return URL ✓
    ↓
If success → Redirect to Stripe checkout
If error → Show "Payment setup failed"
```

---

## 🚨 Common Errors & Solutions

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Payment setup failed" | Generic catch-all error | Check Vercel logs for exact error |
| "Plan not configured. Missing: PRICE_PRO_MONTHLY" | Missing env var | Add `PRICE_PRO_MONTHLY` in Vercel |
| "Payment service not configured" | Missing `STRIPE_SECRET_KEY` | Add `STRIPE_SECRET_KEY` in Vercel |
| "Not authenticated" | User not logged in | User needs to login first |
| "Stripe error: ..." | Stripe API issue | Check Stripe dashboard, verify API key |

---

## ✅ Quick Checklist

- [ ] User is logged in (check Supabase session)
- [ ] `STRIPE_SECRET_KEY` exists in Vercel
- [ ] `PRICE_PRO_MONTHLY` exists in Vercel (or `PRICE_ESSENTIALS_MONTHLY` if testing ESSENTIALS)
- [ ] Price IDs match Stripe dashboard
- [ ] Vercel logs show detailed error (not generic)
- [ ] Browser console shows API response

---

## 📞 What to Share with Helper

1. **Vercel Logs:**
   - Copy the full error from Vercel logs (with `[billing/checkout]` prefix)

2. **Browser Console:**
   - Copy the console output when clicking "Subscribe Now"

3. **Environment Variables:**
   - List which `PRICE_*` variables exist in Vercel
   - Don't share actual values (security)

4. **Stripe Dashboard:**
   - Confirm Price IDs exist for PRO/ESSENTIALS plans
   - Confirm API key is active

---

## 🔑 Key Files

1. **`src/app/choose-plan/page.tsx`** - Frontend, calls API
2. **`src/app/api/billing/checkout/route.ts`** - Backend, creates Stripe session
3. **`src/app/api/stripe/webhook/route.ts`** - Handles payment success

---

## 💡 Next Steps

1. **Check Vercel logs first** - This will show exact error
2. **Verify environment variables** - Most common issue
3. **Test with browser console open** - See client-side errors
4. **Share logs with helper** - They can identify exact issue

---

**Last Updated:** Just now
**Status:** Waiting for Vercel logs to identify exact issue

