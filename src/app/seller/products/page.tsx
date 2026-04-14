'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function SellerProductsCatalog() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const headers = { 'Authorization': `Bearer ${token}` };
        
        let url = `/api/products?sellerId=${user.uid}`;
        if (statusFilter !== 'all') url += `&status=${statusFilter}`;
        if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce for search
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [user, searchQuery, statusFilter]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        const errData = await res.json();
        alert(`Error deleting product: ${errData.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete product.');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['seller', 'admin']}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem' }} className="animate-fade-in-up">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px', marginBottom: '0.5rem' }}>
              Product <span className="gradient-text">Catalog</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage your inventory, pricing, and product details.</p>
          </div>
          
          <Link href="/seller/products/new" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 2rem',
            background: 'var(--accent-gradient)',
            color: 'white',
            borderRadius: '16px',
            fontWeight: '700',
            fontSize: '1.1rem',
            boxShadow: 'var(--glow-primary)',
            transition: 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
            textDecoration: 'none'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            + New Product
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px', marginBottom: '2.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <input 
              type="text" 
              placeholder="Search products by title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem 1.2rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.8rem 1.2rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Data Table */}
        <div className="glass-panel" style={{ borderRadius: '24px', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading your products...</div>
          ) : products.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ fontSize: '3rem', opacity: 0.5 }}>📦</div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No Products Found</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {searchQuery ? "No products match your search criteria." : "You haven't added any products yet."}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--bg-tertiary)' }}>
                  <tr>
                    <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase' }}>Product</th>
                    <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase' }}>Price</th>
                    <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase' }}>Stock</th>
                    <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: i === products.length - 1 ? 'none' : '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '50px', height: '50px', borderRadius: '10px', overflow: 'hidden', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                            <img src={p.images?.[0] || 'https://via.placeholder.com/50'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{p.title}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.attributes?.colors?.length || 0} colors, {p.attributes?.sizes?.length || 0} sizes</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600' }}>${Number(p.price).toFixed(2)}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ color: p.stock > 0 ? 'var(--text-primary)' : '#ef4444', fontWeight: p.stock > 0 ? '500' : '700' }}>
                          {p.stock}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textTransform: 'capitalize' }}>
                        <span style={{ 
                          padding: '0.4rem 0.8rem', 
                          borderRadius: '99px', 
                          fontSize: '0.85rem', 
                          fontWeight: '700',
                          ...p.status === 'active' 
                            ? { background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', border: '1px solid rgba(34, 197, 94, 0.2)' } 
                            : { background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', border: '1px solid rgba(234, 179, 8, 0.2)' } 
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <Link href={`/seller/products/${p.id}/edit`} style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-muted)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                          >
                            Edit
                          </Link>
                          <button onClick={() => handleDelete(p.id, p.title)} style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: 'none',
                            color: '#ef4444',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                          >
                            Delete
                          </button>
                        </div>
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
