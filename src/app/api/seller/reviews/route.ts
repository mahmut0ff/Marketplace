import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { withAuth } from '@/lib/middleware/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authRes = await withAuth(req, ['seller', 'admin']);
  if (authRes.error) return authRes.error;
  const user = authRes.context!;

  try {
    let query = adminDb.collection('reviews') as FirebaseFirestore.Query;
    
    // If it's a seller, they can only see reviews for their products
    if (user.role === 'seller') {
      query = query.where('sellerId', '==', user.uid);
    }
    
    query = query.orderBy('createdAt', 'desc');

    const snap = await query.get();
    
    const reviewsWithProducts = await Promise.all(snap.docs.map(async (doc) => {
      const data = doc.data();
      // Optionally fetch basic product info to show alongside the review
      let productTitle = 'Unknown Product';
      try {
        const pDoc = await adminDb.collection('products').doc(data.productId).get();
        if (pDoc.exists) productTitle = pDoc.data()?.title || productTitle;
      } catch (e) {}
      
      return {
        id: doc.id,
        ...data,
        productTitle
      };
    }));

    return NextResponse.json({ reviews: reviewsWithProducts }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
