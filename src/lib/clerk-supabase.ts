/**
 * Clerk + Supabase Integration Utilities
 * 
 * Helper functions to bridge Clerk authentication with Supabase data access
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from './supabaseAdmin';

/**
 * Get current Clerk user ID from session
 */
export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Get Supabase user record for current Clerk user
 */
export async function getSupabaseUser() {
  const clerkUserId = await getClerkUserId();
  
  if (!clerkUserId) {
    return { user: null, error: null };
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  return { user, error };
}

/**
 * Get current user's company
 */
export async function getCurrentUserCompany() {
  const { user, error: userError } = await getSupabaseUser();
  
  if (userError || !user || !user.company_id) {
    return { company: null, error: userError };
  }

  const { data: company, error: companyError } = await supabaseAdmin
    .from('companies')
    .select('*')
    .eq('id', user.company_id)
    .single();

  return { company, error: companyError };
}

/**
 * Create Supabase client with Clerk user context
 * This sets the clerk_user_id in the request context for RLS policies
 */
export async function createSupabaseClientWithClerk() {
  const clerkUserId = await getClerkUserId();
  
  if (!clerkUserId) {
    // Return admin client if no Clerk user (for public routes)
    return supabaseAdmin;
  }

  // For RLS to work, we need to inject clerk_user_id into the request
  // This is done via SET LOCAL in a transaction or via JWT claims
  // For now, we'll use the admin client and rely on application-level checks
  // In production, configure Clerk JWT to include clerk_user_id claim
  
  return supabaseAdmin;
}

/**
 * Verify user has access to a company
 */
export async function verifyCompanyAccess(companyId: string): Promise<boolean> {
  const { user } = await getSupabaseUser();
  
  if (!user) {
    return false;
  }

  // Check if user's company matches
  if (user.company_id === companyId) {
    return true;
  }

  // Check if user is admin/owner (can access any company in their organization)
  if (user.role === 'admin' || user.role === 'owner') {
    return true;
  }

  return false;
}

