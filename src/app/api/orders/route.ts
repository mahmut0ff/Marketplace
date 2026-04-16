import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { withAuth } from '@/lib/middleware/apiAuth';

export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
  // Only authenticated clients can checkout
  const authRes = await withAuth(req, ['client']);
  if (authRes.error) return authRes.error;
  const user = authRes.context!;

  try {
    const body = await req.json();
    const { items, shippingAddress, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const sellerIds = Array.from(new Set(items.map((i: any) => i.sellerId)));
    
    const docRef = adminDb.collection('orders').doc();
    let finalOrderData: any;

    await adminDb.runTransaction(async (transaction) => {
      const productRefs = items.map((item: any) => adminDb.collection('products').doc(item.id));
      const productDocs = await transaction.getAll(...productRefs);
      
      let totalAmount = 0;
      const updates = [];

      for (let i = 0; i < productDocs.length; i++) {
        const pDoc = productDocs[i];
        const item = items[i];
        
        if (!pDoc.exists) {
          throw new Error(`Product "${item.title || item.id}" not found.`);
        }
        
        const data = pDoc.data()! as Record<string, any>;
        const price = Number(data.price) || 0;
        const currentStock = Number(data.stock) || 0;
        const requestedQuantity = Number(item.quantity) || 1;
        
        if (currentStock < requestedQuantity) {
          throw new Error(`Not enough stock for "${data.title}". Available: ${currentStock}`);
        }
        
        totalAmount += price * requestedQuantity;
        
        updates.push({
          ref: pDoc.ref,
          newStock: currentStock - requestedQuantity
        });
        
        // Update item price to real DB price
        item.price = price;
      }
      
      for (const update of updates) {
        transaction.update(update.ref, { stock: update.newStock });
      }

      finalOrderData = {
        id: docRef.id,
        clientId: user.uid,
        sellerIds,
        items,
        totalAmount,
        shippingAddress,
        paymentMethod,
        status: paymentMethod === 'mock_card' ? 'paid' : 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      transaction.set(docRef, finalOrderData);
    });

    return NextResponse.json({ 
      message: 'Order created successfully', 
      orderId: docRef.id, 
      status: finalOrderData.status 
    }, { status: 201 });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Sellers and Clients can view orders
  const authRes = await withAuth(req, ['client', 'seller', 'admin']);
  if (authRes.error) return authRes.error;
  const user = authRes.context!;

  try {
    let queryRef: FirebaseFirestore.Query = adminDb.collection('orders');

    if (user.role === 'client') {
      queryRef = queryRef.where('clientId', '==', user.uid);
    } else if (user.role === 'seller') {
      queryRef = queryRef.where('sellerIds', 'array-contains', user.uid);
    } // admin gets all

    queryRef = queryRef.orderBy('createdAt', 'desc');

    const snapshot = await queryRef.get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
