'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const TIMELINE_STAGES = [
  { id: 'pending', label: 'Pending' },
  { id: 'paid', label: 'Paid' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' }
];

export default function OrderDetailsPage() {
  const { user } = useAuth();
  const { id } = useParams();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !id) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/orders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Order not found or unauthorized access');
        const data = await res.json();
        setOrder(data.order);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [user, id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!user || !order) return;
    setUpdating(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      setOrder((prev: any) => ({ ...prev, status: newStatus }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['seller', 'admin']}>
        <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280', fontFamily: 'inherit' }}>Loading order details...</div>
      </ProtectedRoute>
    );
  }

  if (error || !order) {
    return (
      <ProtectedRoute allowedRoles={['seller', 'admin']}>
        <div style={{ padding: '4rem', textAlign: 'center', color: '#ef4444', fontFamily: 'inherit' }}>{error || 'Order not found.'}</div>
      </ProtectedRoute>
    );
  }

  const currentStageIndex = TIMELINE_STAGES.findIndex(s => s.id === order.status);
  const isCancelledOrRefunded = ['cancelled', 'refunded'].includes(order.status);

  return (
    <ProtectedRoute allowedRoles={['seller', 'admin']}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem', fontFamily: 'inherit', color: '#111827' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/seller/orders" style={{ display: 'inline-block', marginBottom: '1rem', color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>
            &larr; Back to Orders
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>Order #{order.id.toUpperCase()}</h1>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ padding: '0.5rem 1rem', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', color: '#374151' }}>Print Invoice</button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 1.5rem 0' }}>Fulfillment Status</h2>
          
          {isCancelledOrRefunded ? (
            <div style={{ padding: '1.5rem', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontWeight: '600', textAlign: 'center' }}>
              This order has been {order.status.toUpperCase()}.
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {/* Timeline Line */}
              <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', background: '#e5e7eb', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: '15px', left: '10%', width: currentStageIndex >= 0 ? `${(currentStageIndex / (TIMELINE_STAGES.length - 1)) * 80}%` : '0%', height: '2px', background: '#4f46e5', zIndex: 1, transition: 'width 0.4s' }} />
              
              {/* Stages */}
              {TIMELINE_STAGES.map((stage, i) => {
                const isCompleted = currentStageIndex >= i;
                const isCurrent = currentStageIndex === i;
                return (
                  <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', width: '20%' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      background: isCompleted ? '#4f46e5' : '#ffffff', 
                      border: `2px solid ${isCompleted ? '#4f46e5' : '#d1d5db'}`,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: isCompleted ? '#ffffff' : '#9ca3af',
                      marginBottom: '0.75rem',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(79, 70, 229, 0.2)' : 'none',
                      transition: 'all 0.2s'
                    }}>
                      {isCompleted ? '✓' : i + 1}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: isCurrent ? '700' : '500', color: isCompleted ? '#111827' : '#6b7280' }}>
                      {stage.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Buttons for Seller */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280', marginRight: 'auto' }}>Update order status:</span>
            
            <button 
              onClick={() => handleStatusUpdate('cancelled')}
              disabled={updating || isCancelledOrRefunded}
              style={{ padding: '0.5rem 1rem', background: '#ffffff', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', fontWeight: '500', cursor: (updating || isCancelledOrRefunded) ? 'not-allowed' : 'pointer', opacity: (updating || isCancelledOrRefunded) ? 0.5 : 1 }}
            >
              Cancel Order
            </button>
            <button 
              onClick={() => handleStatusUpdate('refunded')}
              disabled={updating || isCancelledOrRefunded}
              style={{ padding: '0.5rem 1rem', background: '#ffffff', border: '1px solid #d1d5db', color: '#374151', borderRadius: '4px', fontWeight: '500', cursor: (updating || isCancelledOrRefunded) ? 'not-allowed' : 'pointer', opacity: (updating || isCancelledOrRefunded) ? 0.5 : 1 }}
            >
              Mark Refunded
            </button>
            
            <select 
              value={order.status}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              disabled={updating || isCancelledOrRefunded}
              style={{ padding: '0.6rem 1rem', background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: (updating || isCancelledOrRefunded) ? 'not-allowed' : 'pointer', opacity: (updating || isCancelledOrRefunded) ? 0.5 : 1 }}
            >
              <option value="pending">Set to Pending</option>
              <option value="paid">Set to Paid</option>
              <option value="processing">Set to Processing</option>
              <option value="shipped">Set to Shipped</option>
              <option value="delivered">Set to Delivered</option>
            </select>
          </div>
        </div>

        {/* Info Blocks */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 1rem 0' }}>Customer Details</h2>
            <div style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: '1.6' }}>
              <strong style={{ color: '#111827' }}>Customer ID:</strong> {order.clientId}<br/>
              <strong style={{ color: '#111827' }}>Shipping Destination:</strong><br/>
              {order.shippingAddress?.fullName || 'No Name Provided'}<br/>
              {order.shippingAddress?.addressLine1 || 'No Address'}<br/>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br/>
              {order.shippingAddress?.country}<br/><br/>
              <strong style={{ color: '#111827' }}>Phone:</strong> {order.shippingAddress?.phone || 'N/A'}<br/>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 1rem 0' }}>Payment Summary</h2>
            <div style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: '1.6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Method:</span>
                <span style={{ fontWeight: '500', color: '#111827' }}>{order.paymentMethod === 'mock_card' ? 'Credit Card' : order.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: '500', color: '#111827' }}>${Number(order.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Shipping:</span>
                <span style={{ fontWeight: '500', color: '#111827' }}>$0.00</span>
              </div>
              <div style={{ height: '1px', background: '#e5e7eb', margin: '1rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                <strong style={{ color: '#111827' }}>Total:</strong>
                <strong style={{ color: '#4f46e5' }}>${Number(order.totalAmount || 0).toFixed(2)}</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Ordered Items */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>Ordered Items</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '1rem 2rem', color: '#6b7280', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Product</th>
                <th style={{ padding: '1rem 2rem', color: '#6b7280', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '1rem 2rem', color: '#6b7280', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Qty</th>
                <th style={{ padding: '1rem 2rem', color: '#6b7280', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: idx === order.items.length - 1 ? 'none' : '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '4px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                         <img src={item.image || 'https://via.placeholder.com/40'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#111827' }}>{item.title}</div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.2rem' }}>
                          ID: {item.productId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem 2rem', color: '#4b5563' }}>${Number(item.price).toFixed(2)}</td>
                  <td style={{ padding: '1.5rem 2rem', color: '#111827', fontWeight: '500' }}>x{item.quantity}</td>
                  <td style={{ padding: '1.5rem 2rem', textAlign: 'right', fontWeight: '600', color: '#111827' }}>
                    ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </ProtectedRoute>
  );
}
