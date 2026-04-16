'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminAdsPage() {
  const { user } = useAuth();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/admin/ads', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAds(data.ads || []);
        }
      } catch (err) {
        console.error('Failed to fetch ads', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [user]);

  const handleAction = async (adId: string, status: 'active' | 'rejected') => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/ads', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adId, status })
      });
      
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }

      setAds(prev => prev.map(a => a.id === adId ? { ...a, status } : a));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem', color: '#111827' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>Ad Moderation</h1>
          <p style={{ color: '#4b5563', margin: 0, fontSize: '1rem' }}>Review and approve seller promotional banners.</p>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : ads.length === 0 ? (
          <p>No ads found in the system.</p>
        ) : (
          <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '1rem', color: '#374151', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Banner</th>
                  <th style={{ padding: '1rem', color: '#374151', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Details</th>
                  <th style={{ padding: '1rem', color: '#374151', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Dates & Cost</th>
                  <th style={{ padding: '1rem', color: '#374151', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem', color: '#374151', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.95rem' }}>
                {ads.map((ad) => (
                  <tr key={ad.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem', width: '250px' }}>
                      <img src={ad.imageUrl} alt="Ad Banner" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '700', marginBottom: '0.3rem' }}>{ad.title}</div>
                      <div style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{ad.subtitle}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>ProductID: {ad.productId}</div>
                    </td>
                    <td style={{ padding: '1rem', color: '#4b5563' }}>
                      <div>{new Date(ad.startDate).toLocaleDateString()}</div>
                      <div>to {new Date(ad.endDate).toLocaleDateString()}</div>
                      <div style={{ fontWeight: '700', color: '#111827', marginTop: '0.5rem' }}>${ad.totalCost}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                          padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase',
                          background: ad.status === 'active' ? '#d1fae5' : ad.status === 'pending' ? '#fef3c7' : '#fee2e2',
                          color: ad.status === 'active' ? '#065f46' : ad.status === 'pending' ? '#92400e' : '#991b1b'
                        }}>
                          {ad.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {ad.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleAction(ad.id, 'active')} style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Approve</button>
                          <button onClick={() => handleAction(ad.id, 'rejected')} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
