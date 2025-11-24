import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature || !CLERK_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing headers or secret' }, { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);
  
  try {
    const evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as any;

    if (evt.type === 'user.created') {
      const user = evt.data;
      const email = user.email_addresses?.[0]?.email_address;
      if (email) {
        await supabaseAdmin.from('users').upsert({
          clerk_user_id: user.id,
          email,
          first_name: user.first_name,
          last_name: user.last_name,
          image_url: user.image_url,
          role: 'user',
        }, { onConflict: 'clerk_user_id' });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
