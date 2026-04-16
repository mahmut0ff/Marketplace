import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { withAuth } from '@/lib/middleware/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authRes = await withAuth(req, ['admin']);
  if (authRes.error) return authRes.error;

  try {
    const snap = await adminDb.collection('ads').orderBy('createdAt', 'desc').get();
    const ads = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ ads }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authRes = await withAuth(req, ['admin']);
  if (authRes.error) return authRes.error;

  try {
    const body = await req.json();
    const { adId, status } = body;

    if (!adId || !['active', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid adId or status' }, { status: 400 });
    }

    const docRef = adminDb.collection('ads').doc(adId);
    
    // Just update status
    await docRef.update({
      status
    });

    return NextResponse.json({ message: `Ad marked as ${status}` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
