import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export type AllowedRoles = 'client' | 'seller' | 'admin';

export interface RouteContext {
  uid: string;
  email: string;
  role: AllowedRoles;
}

export async function withAuth(
  req: NextRequest, 
  allowedRoles?: AllowedRoles[]
): Promise<{ error?: NextResponse; context?: RouteContext }> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: NextResponse.json({ error: 'Missing or invalid authorization token' }, { status: 401 }) };
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    // Fetch User Role from Firestore Database
    let userData: any = null;
    try {
      const userDocRef = adminDb.collection('users').doc(uid);
      const userDoc = await userDocRef.get();
      if (userDoc.exists) userData = userDoc.data();
    } catch (dbErr) {
      // Fallback for Vercel/Netlify environments missing FIREBASE_PRIVATE_KEY
      console.warn("Falling back to REST API for user fetch due to missing Admin SDK credentials.");
      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const restRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (restRes.ok) {
        const restData = await restRes.json();
        if (restData.fields) {
          userData = {
            role: restData.fields.role?.stringValue,
            status: restData.fields.status?.stringValue,
          };
        }
      }
    }

    if (!userData) {
      return { error: NextResponse.json({ error: 'User profile not found or accessible' }, { status: 403 }) };
    }

    const userRole = userData.role as AllowedRoles;

    // Blocked check
    if (userData.status === 'blocked') {
      return { error: NextResponse.json({ error: 'Account is blocked' }, { status: 403 }) };
    }

    // Role check
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return { error: NextResponse.json({ error: `Requires one of roles: ${allowedRoles.join(', ')}` }, { status: 403 }) };
    }

    return { 
      context: { 
        uid, 
        email: email || '', 
        role: userRole 
      } 
    };
    
  } catch (err: any) {
    console.error('Auth Middleware Error:', err.message);
    return { error: NextResponse.json({ error: 'Unauthorized', details: err.message }, { status: 401 }) };
  }
}
