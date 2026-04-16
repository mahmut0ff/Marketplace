'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function SellerReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/seller/reviews', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['seller', 'admin']}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem', fontFamily: 'inherit', color: '#111827' }}>
        
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: '#111827' }}>Product Reviews</h1>
            <p style={{ color: '#4b5563', margin: 0, fontSize: '1rem' }}>See what customers are saying about your products.</p>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: '500' }}>
            Total Reviews: {reviews.length}
          </div>
        </div>

        <div style={{ 
          background: '#ffffff', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280' }}>No reviews yet for your products.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <tr>
                    <th style={{ padding: '1rem', color: '#374151', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product</th>
                    <th style={{ padding: '1rem', color: '#374151', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Client</th>
                    <th style={{ padding: '1rem', color: '#374151', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating</th>
                    <th style={{ padding: '1rem', color: '#374151', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Comment</th>
                    <th style={{ padding: '1rem', color: '#374151', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Date</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.95rem' }}>
                  {reviews.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '1rem', color: '#4f46e5', fontWeight: '600' }}>
                        <Link href={`/products/${r.productId}`} style={{ textDecoration: 'none', color: 'inherit' }} target="_blank">
                          {r.productTitle}
                        </Link>
                      </td>
                      <td style={{ padding: '1rem', color: '#111827' }}>
                        {r.clientName}
                      </td>
                      <td style={{ padding: '1rem', color: '#d97706', fontSize: '1.2rem', letterSpacing: '1px' }}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </td>
                      <td style={{ padding: '1rem', color: '#4b5563', maxWidth: '300px', whiteSpace: 'normal', wordWrap: 'break-word' }}>
                        {r.comment}
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280', textAlign: 'right' }}>
                        {new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </ProtectedRoute>
  );
}
