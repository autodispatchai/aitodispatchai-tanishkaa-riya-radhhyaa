// src/app/billing/page.tsx
// Billing page has been removed - redirect to choose-plan
import { redirect } from 'next/navigation';

export default function BillingPage() {
  redirect('/choose-plan');
}
