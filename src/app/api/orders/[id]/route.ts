import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { withAuth } from '@/lib/middleware/apiAuth';

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authRes = await withAuth(req, ['client', 'seller', 'admin']);
  if (authRes.error) return authRes.error;
  const user = authRes.context!;

  try {
    const docRef = adminDb.collection('orders').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderData = docSnap.data();

    // Verify access
    if (user.role === 'client' && orderData?.clientId !== user.uid) {
      return NextResponse.json({ error: 'Unauthorized access to order' }, { status: 403 });
    }
    if (user.role === 'seller' && !(orderData?.sellerIds || []).includes(user.uid)) {
      return NextResponse.json({ error: 'Unauthorized access to order' }, { status: 403 });
    }

    return NextResponse.json({ order: { id: docSnap.id, ...orderData } }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Only sellers and admins can update statuses
  const authRes = await withAuth(req, ['seller', 'admin']);
  if (authRes.error) return authRes.error;
  const user = authRes.context!;

  try {
    const docRef = adminDb.collection('orders').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderData = docSnap.data();

    if (user.role === 'seller' && !(orderData?.sellerIds || []).includes(user.uid)) {
      return NextResponse.json({ error: 'Unauthorized access to order' }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body;

    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData = { 
      status, 
      updatedAt: new Date().toISOString() 
    };

    await docRef.update(updateData);

    return NextResponse.json({ message: 'Order status updated', status }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
