'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

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
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Seller Portal</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
          
          <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>My Products</h2>
              <button style={{ padding: '0.6rem 1rem', background: 'var(--accent-color)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>+ Add Product</button>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem 0' }}>Title</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 0' }}>{p.title}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td style={{ color: p.stock > 0 ? 'inherit' : '#ef4444' }}>{p.stock}</td>
                    <td style={{ textTransform: 'capitalize' }}>
                      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.85rem', ...p.status === 'active' ? { background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' } : { background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04' } }}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recent Orders</h2>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem 0' }}>Order ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 0', fontWeight: '500' }}>{o.id.substring(0, 8)}...</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>${Number(o.totalAmount || 0).toFixed(2)}</td>
                    <td style={{ textTransform: 'capitalize' }}>
                      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.85rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-color)' }}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
