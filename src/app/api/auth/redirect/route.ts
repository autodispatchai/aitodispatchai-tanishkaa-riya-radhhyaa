import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://autodispatchai.com';

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.redirect(new URL('/', BASE));
    }

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', session.user.id)
      .single();

    if (company) {
      return NextResponse.redirect(new URL('/app', BASE));
    } else {
      return NextResponse.redirect(new URL('/onboarding/create-company', BASE));
    }
  } catch (err) {
    console.error('Auth redirect route crashed:', err);
    return NextResponse.redirect(new URL('/', BASE));
  }
}
