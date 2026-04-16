'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [address, setAddress] = useState({
    fullName: '',
    streetAddress: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return router.push('/auth/login');
    if (items.length === 0) return;

    setLoading(true);
    setError('');
    
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items,
          shippingAddress: address,
          paymentMethod: 'mock_card' // Fake billing
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      setSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({...address, [e.target.name]: e.target.value});
  };

  const inputStyle = {
    width: '100%',
    padding: '0.85rem 1rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    background: 'rgba(255,255,255,0.02)',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    fontSize: '1rem',
    marginBottom: '1rem',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
  };

  if (success) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ color: 'var(--accent-color)', fontSize: '2.5rem', marginBottom: '1rem' }}>Order Confirmed!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2rem' }}>
          Your payment was successful and stock has been updated. The seller has been notified.
        </p>
        <button 
          onClick={() => router.push('/')}
          style={{ padding: '1rem 2.5rem', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['client']}>
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', fontWeight: '800' }}>Checkout</h1>
          
          {error && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '12px', marginBottom: '2rem' }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleCheckout}>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Shipping Address</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <input required name="fullName" value={address.fullName} onChange={handleChange} style={inputStyle} placeholder="Full Name" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <input required name="streetAddress" value={address.streetAddress} onChange={handleChange} style={inputStyle} placeholder="Street Address" />
                </div>
                <div>
                  <input required name="city" value={address.city} onChange={handleChange} style={inputStyle} placeholder="City" />
                </div>
                <div>
                  <input required name="postalCode" value={address.postalCode} onChange={handleChange} style={inputStyle} placeholder="Postal / Zip Code" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <input required name="country" value={address.country} onChange={handleChange} style={inputStyle} placeholder="Country" />
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Payment Method</h2>
              <div style={{ padding: '1.5rem', border: '2px solid var(--accent-color)', borderRadius: '12px', background: 'var(--bg-tertiary)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--accent-color)' }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', fontWeight: '600' }}>
                  <input type="radio" checked readOnly style={{ accentColor: 'var(--accent-color)', transform: 'scale(1.2)' }} />
                  Mock Credit Card (Test Environment)
                </label>
                <p style={{ marginTop: '0.5rem', marginLeft: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Billing page simulation mode. Uses dummy credentials to verify functional end-to-end checkout.
                </p>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || items.length === 0}
              style={{ width: '100%', padding: '1.25rem', background: 'var(--accent-gradient)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', cursor: items.length === 0 ? 'not-allowed' : 'pointer', boxShadow: 'var(--glow-primary)', opacity: loading || items.length === 0 ? 0.7 : 1, transition: 'all 0.2s' }}
            >
              {loading ? 'Processing Order...' : `Pay $${total.toFixed(2)}`}
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', height: 'fit-content', position: 'sticky', top: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>Order Summary</h2>
          
          {items.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>Your cart is empty.</p>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-tertiary)', flexShrink: 0 }}>
                      {item.image && <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: '600' }}>{item.title}</h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: '600' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ paddingTop: '1.5rem', borderTop: '1px dashed var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.4rem' }}>
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
