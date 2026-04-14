'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const headers = { 'Authorization': `Bearer ${token}` };

        const [prodRes, orderRes] = await Promise.all([
          fetch(`/api/products?sellerId=${user.uid}`, { headers }),
          fetch('/api/orders', { headers })
        ]);

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData.products || []);
        }
        
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrders(orderData.orders || []);
        }
      } catch (err) {
        console.error('Error fetching seller data', err);
      }
    };
    
    fetchData();
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['seller', 'admin']}>
      <div style={{ padding: '3rem 2rem', maxWidth: '1400px', margin: '0 auto' }} className="animate-fade-in-up">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>Seller <span className="gradient-text">Portal</span></h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Overview of your metrics and recent activities.</p>
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
            transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            + Add Product
          </Link>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Recent Products</h2>
              <Link href="/seller/products" style={{ 
                color: 'var(--accent-color)', 
                fontWeight: '600',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: 'rgba(79, 70, 229, 0.1)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(79, 70, 229, 0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(79, 70, 229, 0.1)'}
              >
                View Full Catalog &rarr;
              </Link>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--bg-tertiary)' }}>
                  <tr>
                    <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem' }}>Title</th>
                    <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem' }}>Price</th>
                    <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem' }}>Stock</th>
                    <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 5).map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: i === products.slice(0, 5).length - 1 ? 'none' : '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>{p.title}</td>
                      <td style={{ padding: '1.25rem' }}>${Number(p.price).toFixed(2)}</td>
                      <td style={{ padding: '1.25rem', color: p.stock > 0 ? 'var(--text-primary)' : '#ef4444', fontWeight: p.stock > 0 ? '500' : '700' }}>{p.stock}</td>
                      <td style={{ padding: '1.25rem', textTransform: 'capitalize' }}>
                        <span style={{ 
                          padding: '0.3rem 0.8rem', 
                          borderRadius: '99px', 
                          fontSize: '0.85rem', 
                          fontWeight: '700',
                          ...p.status === 'active' 
                            ? { background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' } 
                            : { background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04' } 
                        }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No products listed yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Recent Orders</h2>
              <Link href="/seller/orders" style={{ 
                color: 'var(--accent-color)', 
                fontWeight: '600',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: 'rgba(79, 70, 229, 0.1)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(79, 70, 229, 0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(79, 70, 229, 0.1)'}
              >
                View All Orders &rarr;
              </Link>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--bg-tertiary)' }}>
                  <tr>
                    <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem' }}>Order ID</th>
                    <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem' }}>Date</th>
                    <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem' }}>Amount</th>
                    <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem' }}>Status</th>
                    <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((o, i) => (
                    <tr key={o.id} style={{ borderBottom: i === orders.slice(0, 5).length - 1 ? 'none' : '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>{o.id.substring(0, 8)}...</td>
                      <td style={{ padding: '1.25rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1.25rem' }}>${Number(o.totalAmount || 0).toFixed(2)}</td>
                      <td style={{ padding: '1.25rem', textTransform: 'capitalize' }}>
                        <span style={{ padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: '700', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-color)' }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                         <Link href={`/seller/orders/${o.id}`} style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            textDecoration: 'none'
                          }}>
                            Details
                          </Link>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent orders.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
