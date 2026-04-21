'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Currently acting as a UI stub since the API may not exist yet
    // In a real app we fetch from /api/admin/orders
    const fetchOrdersMock = () => {
      setLoading(true);
      setTimeout(() => {
        setOrders([
          { id: 'ORD-INT-904', buyerId: 'user_123', totalAmount: 450.00, platformFee: 45.00, status: 'PAID', date: '2026-04-20T14:32:00Z' },
          { id: 'ORD-INT-905', buyerId: 'user_456', totalAmount: 120.50, platformFee: 12.05, status: 'REFUNDED', date: '2026-04-21T09:15:00Z' },
          { id: 'ORD-INT-906', buyerId: 'user_789', totalAmount: 890.00, platformFee: 89.00, status: 'PENDING', date: '2026-04-21T11:05:00Z' },
        ]);
        setLoading(false);
      }, 600);
    };
    fetchOrdersMock();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' };
      case 'REFUNDED': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' };
      case 'PENDING': return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' };
      default: return { bg: 'var(--bg-tertiary)', text: 'var(--text-secondary)' };
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', animation: 'fade-in-up 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Global Orders</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Monitor all marketplace transactions and platform fees.</p>
        </div>
        <button style={{ 
          padding: '0.75rem 1.5rem', 
          background: 'var(--bg-secondary)', 
          color: 'var(--text-primary)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '8px', 
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          Export CSV
        </button>
      </div>

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading transactions...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Order ID</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Date</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Amount</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Platform Fee</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No orders found.</td></tr>
              ) : (
                orders.map(o => {
                  const statusStyle = getStatusColor(o.status);
                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>
                        {o.id}
                        <div style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Buyer: {o.buyerId}</div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {new Date(o.date).toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>
                        ${o.totalAmount.toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--accent-color)' }}>
                        ${o.platformFee.toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ 
                            padding: '0.35rem 0.75rem', 
                            borderRadius: '99px', 
                            fontSize: '0.75rem', 
                            fontWeight: 700,
                            background: statusStyle.bg,
                            color: statusStyle.text
                        }}>
                            {o.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <button style={{ 
                          padding: '0.5rem', 
                          background: 'transparent', 
                          color: 'var(--text-primary)', 
                          border: 'none', 
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}>
                          View Detals
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
