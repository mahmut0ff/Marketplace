'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // Status Chip Component (Strict UI)
  const StatusChip = ({ status }: { status: string }) => {
    let bg = '#f3f4f6';
    let color = '#4b5563';
    
    switch(status) {
      case 'pending': bg = '#fef3c7'; color = '#92400e'; break;
      case 'paid': bg = '#dbeafe'; color = '#1e3a8a'; break;
      case 'processing': bg = '#e0e7ff'; color = '#3730a3'; break;
      case 'shipped': bg = '#fce7f3'; color = '#9d174d'; break;
      case 'delivered': bg = '#dcfce7'; color = '#166534'; break;
      case 'cancelled':
      case 'refunded': bg = '#fee2e2'; color = '#991b1b'; break;
    }

    return (
      <span style={{ 
        backgroundColor: bg, 
        color: color, 
        padding: '0.25rem 0.75rem', 
        borderRadius: '4px', 
        fontSize: '0.8rem', 
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        display: 'inline-block'
      }}>
        {status}
      </span>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['seller', 'admin']}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem', fontFamily: 'inherit', color: '#111827' }}>
        
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: '#111827' }}>Orders Management</h1>
            <p style={{ color: '#4b5563', margin: 0, fontSize: '1rem' }}>Track, process, and update customer orders.</p>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: '500' }}>
            Total Orders: {orders.length}
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
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280' }}>No orders found for this account.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <tr>
                    <th style={{ padding: '1rem', color: '#374151', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order ID</th>
                    <th style={{ padding: '1rem', color: '#374151', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                    <th style={{ padding: '1rem', color: '#374151', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Destination</th>
                    <th style={{ padding: '1rem', color: '#374151', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Items</th>
                    <th style={{ padding: '1rem', color: '#374151', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Total</th>
                    <th style={{ padding: '1rem', color: '#374151', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                    <th style={{ padding: '1rem', color: '#374151', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.95rem' }}>
                  {orders.map((o) => {
                    const itemCount = (o.items || []).reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
                    return (
                      <tr key={o.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#4f46e5', fontWeight: '600' }}>
                          <Link href={`/seller/orders/${o.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {o.id.substring(0, 10).toUpperCase()}
                          </Link>
                        </td>
                        <td style={{ padding: '1rem', color: '#4b5563' }}>
                          {new Date(o.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td style={{ padding: '1rem', color: '#111827' }}>
                          {o.shippingAddress?.city || 'N/A'}, {o.shippingAddress?.country || 'N/A'}
                        </td>
                        <td style={{ padding: '1rem', color: '#4b5563', textAlign: 'right' }}>{itemCount}</td>
                        <td style={{ padding: '1rem', color: '#111827', fontWeight: '600', textAlign: 'right' }}>
                          ${Number(o.totalAmount || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <StatusChip status={o.status || 'pending'} />
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <Link href={`/seller/orders/${o.id}`} style={{ 
                            display: 'inline-block',
                            padding: '0.4rem 1rem', 
                            background: '#ffffff', 
                            border: '1px solid #d1d5db', 
                            borderRadius: '4px', 
                            color: '#374151', 
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            textDecoration: 'none',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.borderColor = '#9ca3af'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </ProtectedRoute>
  );
}
