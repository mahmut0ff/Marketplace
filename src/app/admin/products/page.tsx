'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const url = filter === 'all' ? '/api/products' : `/api/products?status=${filter}`;
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [user, filter]);

  const handleModerate = async (productId: string, action: 'approved' | 'rejected') => {
    // In a real app: POST to /api/products/[id]/moderate
    // Optimistic UI update for now
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: action } : p));
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', animation: 'fade-in-up 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Catalog Moderation</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Review pending products submitted by sellers.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setFilter('pending')}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              border: 'none',
              background: filter === 'pending' ? 'var(--accent-color)' : 'transparent',
              color: filter === 'pending' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Pending Review
          </button>
          <button 
            onClick={() => setFilter('all')}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              border: 'none',
              background: filter === 'all' ? 'var(--accent-color)' : 'transparent',
              color: filter === 'all' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            All Products
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading catalog...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>You're all caught up!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>There are no {filter === 'pending' ? 'pending' : ''} products to review right now.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Product details</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Seller ID</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Price</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.25rem' }}>{p.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Category: {p.category || 'Uncategorized'}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {p.sellerId || 'Unknown'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>
                    ${p.price?.toFixed(2) || '0.00'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                        padding: '0.35rem 0.75rem', 
                        borderRadius: '99px', 
                        fontSize: '0.75rem', 
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: p.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : p.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: p.status === 'approved' ? '#10b981' : p.status === 'rejected' ? '#ef4444' : '#f59e0b'
                    }}>
                        {p.status || 'pending'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    {(p.status === 'pending' || !p.status) && (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleModerate(p.id, 'approved')}
                          style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleModerate(p.id, 'rejected')}
                          style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
