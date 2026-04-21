'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, total, clearCart, removeItem, updateQuantity } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [address, setAddress] = useState({
    fullName: '', streetAddress: '', city: '', postalCode: '', country: ''
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ items, shippingAddress: address, paymentMethod: 'mock_card' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      setSuccess(true);
      clearCart();
    } catch (err: any) {
      setError(err.message || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({...address, [e.target.name]: e.target.value});
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    marginBottom: '12px',
    transition: 'border-color 0.15s',
  };

  if (success) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: '36px',
        }}>✓</div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Заказ оформлен!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px', lineHeight: '1.6' }}>
          Оплата прошла успешно. Продавец уведомлен о вашем заказе.
        </p>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '14px 32px',
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Продолжить покупки
        </button>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['client']}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Оформление заказа</h1>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.15)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
          {/* Left - Form */}
          <form onSubmit={handleCheckout}>
            {/* Cart Items */}
            <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Корзина ({items.length})</h2>
              {items.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center', fontSize: '14px' }}>
                  Корзина пуста. <Link href="/" style={{ color: 'var(--accent)', fontWeight: 600 }}>Перейти в каталог</Link>
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {items.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{
                        width: '80px', height: '80px', borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden', background: '#fff', border: '1px solid var(--border-color)', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {item.image && <img src={item.image} alt={item.title} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', lineHeight: '1.3' }}>{item.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                            <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              style={{ width: '32px', height: '32px', border: 'none', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: '16px', color: 'var(--text-secondary)' }}>−</button>
                            <span style={{ width: '36px', textAlign: 'center', fontSize: '14px', fontWeight: 600 }}>{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{ width: '32px', height: '32px', border: 'none', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: '16px', color: 'var(--text-secondary)' }}>+</button>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--accent)' }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button type="button" onClick={() => removeItem(item.id)}
                            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                          >Удалить</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shipping */}
            <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Адрес доставки</h2>
              <input required name="fullName" value={address.fullName} onChange={handleChange} style={inputStyle} placeholder="ФИО" />
              <input required name="streetAddress" value={address.streetAddress} onChange={handleChange} style={inputStyle} placeholder="Улица, дом, квартира" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input required name="city" value={address.city} onChange={handleChange} style={{...inputStyle, marginBottom: 0}} placeholder="Город" />
                <input required name="postalCode" value={address.postalCode} onChange={handleChange} style={{...inputStyle, marginBottom: 0}} placeholder="Индекс" />
              </div>
              <input required name="country" value={address.country} onChange={handleChange} style={{...inputStyle, marginTop: '12px'}} placeholder="Страна" />
            </div>

            {/* Payment */}
            <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Способ оплаты</h2>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px',
                border: '2px solid var(--accent)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-light)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}>
                <input type="radio" checked readOnly style={{ accentColor: 'var(--accent)', transform: 'scale(1.2)' }} />
                Тестовая карта (Mock)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              style={{
                width: '100%',
                padding: '16px',
                background: items.length > 0 ? 'var(--accent)' : 'var(--border-color)',
                color: items.length > 0 ? 'white' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '15px',
                fontWeight: 700,
                cursor: items.length === 0 ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Обработка...' : `Оплатить $${total.toFixed(2)}`}
            </button>
          </form>

          {/* Right - Order Summary */}
          <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-md)', position: 'sticky', top: '120px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Итого</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Товары ({items.reduce((s,i) => s + i.quantity, 0)})</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Доставка</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>Бесплатно</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 800 }}>
              <span>К оплате</span>
              <span style={{ color: 'var(--accent)' }}>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
