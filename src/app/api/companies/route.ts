import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

async function getServerSupabase() {
  const cookieStore = await cookies(); // 👈 Next 15/16: cookies() is async
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        // No-ops for API routes; Supabase client requires these functions
        set: () => {},
        remove: () => {},
      },
    }
  );
}

// GET /api/companies → list current user’s companies
export async function GET() {
  const supabase = await getServerSupabase();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, companies: data }, { status: 200 });
}

// POST /api/companies → create a company for the logged-in user
export async function POST(req: Request) {
  const supabase = await getServerSupabase();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json();
  const required = ['company_name', 'email', 'address', 'city', 'state', 'postal_code', 'country'] as const;
  for (const k of required) {
    if (!body[k] || String(body[k]).trim() === '') {
      return NextResponse.json({ ok: false, error: `Missing field: ${k}` }, { status: 400 });
    }
  }

  const insertRow = {
    owner_id: auth.user.id,
    company_name: String(body.company_name).trim(),
    legal_name: body.legal_name ? String(body.legal_name).trim() : null,
    email: String(body.email).trim(),
    phone: body.phone ? String(body.phone).trim() : null,
    mc_number: body.mc_number ? String(body.mc_number).trim() : null,
    dot_number: body.dot_number ? String(body.dot_number).trim() : null,
    address: String(body.address).trim(),
    city: String(body.city).trim(),
    state: String(body.state).trim(),
    postal_code: String(body.postal_code).trim(),
    country: String(body.country).trim(),
  };

  const { data, error } = await supabase
    .from('companies')
    .insert(insertRow)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, company: data }, { status: 201 });
}
