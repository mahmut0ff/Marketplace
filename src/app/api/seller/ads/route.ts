import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { withAuth } from '@/lib/middleware/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authRes = await withAuth(req, ['seller', 'admin']);
  if (authRes.error) return authRes.error;
  const user = authRes.context!;

  try {
    const snap = await adminDb.collection('ads')
      .where('sellerId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .get();
      
    const ads = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ ads }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authRes = await withAuth(req, ['seller', 'admin']);
  if (authRes.error) return authRes.error;
  const user = authRes.context!;

  try {
    const body = await req.json();
    const { productId, title, subtitle, imageUrl, startDate, endDate } = body;

    if (!productId || !title || !imageUrl || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate days. Reset time part to count strict calendar differences.
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    // Adding 1 because if start and end are the same day, it's 1 day of ad.
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    
    if (diffDays < 1) {
      return NextResponse.json({ error: 'End date must be after or equal to start date.' }, { status: 400 });
    }

    const totalCost = diffDays * 100; // $100 per day

    const adRef = adminDb.collection('ads').doc();
    const newAd = {
      id: adRef.id,
      sellerId: user.uid,
      productId,
      title,
      subtitle: subtitle || '',
      imageUrl,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalCost,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await adRef.set(newAd);

    return NextResponse.json({ message: 'Ad campaign created', ad: newAd }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
