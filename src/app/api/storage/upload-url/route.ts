import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { data: user } = await supabaseAdmin.from('users').select('id, company_id').eq('clerk_user_id', clerkUserId).single();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const searchParams = req.nextUrl.searchParams;
    const companyId = searchParams.get('company_id');
    const truckId = searchParams.get('truck_id');
    const fileName = searchParams.get('file_name');
    const fileType = searchParams.get('file_type') || 'application/octet-stream';
    if (!fileName) {
      return NextResponse.json({ error: 'file_name is required' }, { status: 400 });
    }
    const targetCompanyId = companyId || user.company_id;
    if (!targetCompanyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = truckId ? `companies/${targetCompanyId}/trucks/${truckId}/${timestamp}_${sanitizedFileName}` : `companies/${targetCompanyId}/files/${timestamp}_${sanitizedFileName}`;
    const expiresIn = 3600;
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage.from('files').createSignedUrl(filePath, expiresIn);
    if (signedUrlError || !signedUrlData) {
      return NextResponse.json({ error: 'Failed to generate upload URL', details: signedUrlError?.message }, { status: 500 });
    }
    return NextResponse.json({
      uploadUrl: signedUrlData.signedUrl,
      filePath,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      fileName: sanitizedFileName,
      fileType,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const body = await req.json();
    const { company_id, truck_id, file_name, file_type } = body;
    if (!file_name) {
      return NextResponse.json({ error: 'file_name is required' }, { status: 400 });
    }
    const { data: user } = await supabaseAdmin.from('users').select('id, company_id').eq('clerk_user_id', clerkUserId).single();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const targetCompanyId = company_id || user.company_id;
    if (!targetCompanyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }
    const timestamp = Date.now();
    const sanitizedFileName = file_name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = truck_id ? `companies/${targetCompanyId}/trucks/${truck_id}/${timestamp}_${sanitizedFileName}` : `companies/${targetCompanyId}/files/${timestamp}_${sanitizedFileName}`;
    const expiresIn = 3600;
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage.from('files').createSignedUrl(filePath, expiresIn);
    if (signedUrlError || !signedUrlData) {
      return NextResponse.json({ error: 'Failed to generate upload URL', details: signedUrlError?.message }, { status: 500 });
    }
    return NextResponse.json({
      uploadUrl: signedUrlData.signedUrl,
      filePath,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      fileName: sanitizedFileName,
      fileType: file_type || 'application/octet-stream',
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 });
  }
}

