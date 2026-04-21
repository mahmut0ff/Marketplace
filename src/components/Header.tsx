'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, profile } = useAuth();
  const { items } = useCart();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const dashboardLink = profile?.role === 'admin' ? '/admin/dashboard'
    : profile?.role === 'seller' ? '/seller/dashboard'
    : '/';

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
    }}>
      {/* Top bar */}
      <div style={{
        background: 'var(--accent)',
        padding: '6px 0',
        textAlign: 'center',
        fontSize: '12px',
        color: 'white',
        fontWeight: 500,
        letterSpacing: '0.3px'
      }}>
        Бесплатная доставка от $50 · Возврат 14 дней
      </div>

      {/* Main header */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        padding: '10px 24px',
        gap: '24px',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'var(--accent)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 900,
            fontSize: '18px',
          }}>M</div>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Market
          </span>
        </Link>

        {/* Catalog Button */}
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontWeight: 700,
          fontSize: '14px',
          cursor: 'pointer',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '16px' }}>☰</span>
          Каталог
        </button>

        {/* Search */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-primary)',
          border: '2px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
        }}
        >
          <input
            type="text"
            placeholder="Найти товары..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '14px',
            }}
          />
          <button style={{
            padding: '10px 20px',
            background: 'var(--accent)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 600,
          }}>🔍</button>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {user ? (
            <>
              {/* Dashboard Link */}
              {profile?.role && profile.role !== 'client' && (
                <Link href={dashboardLink} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--accent)',
                  fontSize: '11px',
                  fontWeight: 600,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '20px', marginBottom: '2px' }}>⚙️</span>
                  {profile.role === 'admin' ? 'Админ' : 'Продавец'}
                </Link>
              )}

              {/* Cart */}
              <Link href="/checkout" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                position: 'relative',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '20px', marginBottom: '2px' }}>🛒</span>
                Корзина
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '4px',
                    background: 'var(--accent)',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>{cartCount}</span>
                )}
              </Link>

              {/* Profile */}
              <Link href="/settings" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '20px', marginBottom: '2px' }}>👤</span>
                {profile?.displayName?.split(' ')[0] || 'Профиль'}
              </Link>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '20px', marginBottom: '2px' }}>🚪</span>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '20px', marginBottom: '2px' }}>👤</span>
                Войти
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
