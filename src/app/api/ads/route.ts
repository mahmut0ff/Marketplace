import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Fetch all active ads.
    const snap = await adminDb.collection('ads')
      .where('status', '==', 'active')
      .get();
      
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Filter by dates
    const validAds = [];
    for (const doc of snap.docs) {
      const data = doc.data();
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999); // end of that day
      
      if (today >= start && today <= end) {
        validAds.push({ id: doc.id, ...data });
      }
    }
    
    return NextResponse.json({ ads: validAds }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
