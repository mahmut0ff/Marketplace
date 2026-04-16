import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { withAuth } from '@/lib/middleware/apiAuth';

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const sellerId = searchParams.get('sellerId');
    const q = searchParams.get('q');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort'); // price_asc, price_desc, newest, featured
    const status = searchParams.get('status');

    let queryRef: FirebaseFirestore.Query = adminDb.collection('products');

    // Base filters that can be indexed easily
    if (category) queryRef = queryRef.where('categoryId', '==', category);
    
    if (sellerId) {
      queryRef = queryRef.where('sellerId', '==', sellerId);
      if (status) queryRef = queryRef.where('status', '==', status);
    } else if (status === 'pending') {
      const authRes = await withAuth(req, ['admin']);
      if (authRes.error) return authRes.error;
      queryRef = queryRef.where('status', '==', 'pending');
    } else if (status === 'all') {
      const authRes = await withAuth(req, ['admin']);
      if (authRes.error) return authRes.error;
    } else {
      queryRef = queryRef.where('status', '==', 'active');
    }

    const snapshot = await queryRef.get();
    let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // In-memory text search
    if (q) {
      const lowerQ = q.toLowerCase();
      products = products.filter((p: any) => 
        (p.title && p.title.toLowerCase().includes(lowerQ)) || 
        (p.description && p.description.toLowerCase().includes(lowerQ))
      );
    }

    // In-memory price filter
    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) products = products.filter((p: any) => p.price >= min);
    }
    
    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) products = products.filter((p: any) => p.price <= max);
    }

    // In-memory sort
    if (sort === 'price_asc') {
      products.sort((a: any, b: any) => a.price - b.price);
    } else if (sort === 'price_desc') {
      products.sort((a: any, b: any) => b.price - a.price);
    } else if (sort === 'newest') {
      products.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // featured / default (newest by default)
      products.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({ products }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Only sellers and admins can create products
  const authRes = await withAuth(req, ['seller', 'admin']);
  if (authRes.error) return authRes.error;
  const user = authRes.context!;

  try {
    const body = await req.json();
    const { title, description, price, stock, categoryId, images, attributes } = body;

    // Validate inputs
    if (!title || price == null || stock == null) {
      return NextResponse.json({ error: 'Title, price, and stock are required' }, { status: 400 });
    }

    const docRef = adminDb.collection('products').doc();
    const newProduct = {
      id: docRef.id,
      title,
      description: description || '',
      price: Number(price),
      stock: Number(stock),
      sellerId: user.uid, // Product bound to creator
      categoryId: categoryId || null,
      images: images || [],
      attributes: attributes || {},
      status: user.role === 'admin' ? 'active' : 'pending',

      createdAt: new Date().toISOString(),
      rating: 0,
      reviewCount: 0
    };
    
    await docRef.set(newProduct);

    return NextResponse.json({ message: 'Product created', product: newProduct }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
