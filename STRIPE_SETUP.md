# Stripe Setup Instructions

## Problem
The billing page shows "Redirecting to checkout..." but doesn't redirect to Stripe because **Stripe Price IDs are not configured**.

## Solution: Add Stripe Price IDs

1. **Go to Stripe Dashboard:**
   - Login to https://dashboard.stripe.com
   - Go to **Products** → Create or select your products

2. **Get Price IDs:**
   - For each plan (ESSENTIALS, PRO), create a product
   - For each product, create pricing:
     - Monthly price
     - Yearly price (optional)
   - Copy the **Price ID** (starts with `price_...`)

3. **Update `src/app/api/stripe/checkout/route.ts`:**
   
   Find this section (around line 82):
   ```typescript
   const priceMap: Record<string, string> = {
     // Add your Stripe price IDs here:
     // 'ESSENTIALS_monthly': 'price_xxxxxxxxxxxxx',
     // 'ESSENTIALS_yearly': 'price_xxxxxxxxxxxxx',
     // 'PRO_monthly': 'price_xxxxxxxxxxxxx',
     // 'PRO_yearly': 'price_xxxxxxxxxxxxx',
   };
   ```

   Replace with your actual price IDs:
   ```typescript
   const priceMap: Record<string, string> = {
     'ESSENTIALS_monthly': 'price_1234567890abcdef',  // Replace with your actual price ID
     'ESSENTIALS_yearly': 'price_0987654321fedcba',  // Replace with your actual price ID
     'PRO_monthly': 'price_abcdef1234567890',        // Replace with your actual price ID
     'PRO_yearly': 'price_fedcba0987654321',          // Replace with your actual price ID
   };
   ```

4. **Deploy:**
   - Commit and push changes
   - Vercel will auto-deploy

## Testing

After adding price IDs:
1. Go to `/billing?plan=pro`
2. Should automatically redirect to Stripe checkout
3. Complete test payment
4. Should redirect to `/dashboard`

## Error Messages

If you see an error, it will now display:
- "Stripe price ID not configured for PRO (monthly). Please contact support or configure price IDs."

This means you need to add the price IDs as described above.

