import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { withAuth } from '@/lib/middleware/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const snap = await adminDb.collection('reviews').where('productId', '==', id).orderBy('createdAt', 'desc').get();
    
    const reviews = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authRes = await withAuth(req, ['client']);
  if (authRes.error) return authRes.error;
  const user = authRes.context!;

  try {
    const body = await req.json();
    const { rating, comment, sellerId } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating (1-5)' }, { status: 400 });
    }

    if (!sellerId) {
      return NextResponse.json({ error: 'Missing sellerId' }, { status: 400 });
    }

    // Verify purchase
    const ordersSnap = await adminDb.collection('orders')
      .where('clientId', '==', user.uid)
      .get();

    let hasPurchased = false;
    for (const doc of ordersSnap.docs) {
      const items = doc.data().items || [];
      if (items.some((i: any) => i.id === id)) {
        hasPurchased = true;
        break;
      }
    }

    if (!hasPurchased) {
      return NextResponse.json({ error: 'You must purchase this product before leaving a review.' }, { status: 403 });
    }

    // Check if review already exists
    const existingReviewSnap = await adminDb.collection('reviews')
      .where('productId', '==', id)
      .where('clientId', '==', user.uid)
      .get();

    if (!existingReviewSnap.empty) {
      return NextResponse.json({ error: 'You have already reviewed this product.' }, { status: 403 });
    }

    // Run transaction to add review and update product avg
    const reviewData = {
      productId: id,
      sellerId,
      clientId: user.uid,
      clientName: user.email || 'Anonymous', // using email mapped/could be displayname
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date().toISOString()
    };

    const newReviewRef = adminDb.collection('reviews').doc();
    const productRef = adminDb.collection('products').doc(id);

    await adminDb.runTransaction(async (t) => {
      const pDoc = await t.get(productRef);
      if (!pDoc.exists) throw new Error('Product not found');

      const pData = pDoc.data()!;
      const currentAvg = pData.averageRating || 0;
      const currentCount = pData.reviewCount || 0;

      const newCount = currentCount + 1;
      const newAvg = ((currentAvg * currentCount) + Number(rating)) / newCount;

      t.set(newReviewRef, reviewData);
      t.update(productRef, {
        averageRating: newAvg,
        reviewCount: newCount
      });
    });

    return NextResponse.json({ message: 'Review successfully added', reviewData }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
