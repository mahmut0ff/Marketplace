'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, profile } = useAuth();
  const router = useRouter();

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

  return (
    <header style={{ 
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem 2rem', 
      borderBottom: '1px solid var(--glass-border)',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }} className="gradient-text">
          BigShopAI
        </h1>
      </Link>
      
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Search products..." 
          style={{ 
            padding: '0.6rem 1.2rem', 
            borderRadius: '99px', 
            border: '1px solid var(--border-color)', 
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            width: '300px',
            transition: 'all 0.3s ease',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
          }} 
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 2px var(--accent-color)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        />

        {user ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
            <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              Hi, {profile?.displayName || user.email?.split('@')[0]}
            </span>
            
            {profile?.role && profile.role !== 'client' && (
              <Link href={dashboardLink} style={{ 
                fontSize: '0.85rem', 
                padding: '0.5rem 1rem', 
                borderRadius: '8px', 
                background: 'var(--accent-color)', 
                color: 'white',
                fontWeight: '600',
                transition: 'background 0.2s, transform 0.1s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-hover)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--accent-color)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                {profile.role === 'admin' ? 'Admin Panel' : 'Seller Portal'}
              </Link>
            )}

            <Link href="/settings" style={{
              fontSize: '0.85rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              e.currentTarget.style.borderColor = 'var(--text-muted)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
            >
              Settings
            </Link>

            <button 
              onClick={handleSignOut}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#ef4444';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.color = '#ef4444';
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
            <Link href="/auth/login" style={{ 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >Log In</Link>
            <Link href="/auth/signup" style={{ 
              padding: '0.5rem 1.2rem', 
              background: 'var(--accent-color)', 
              color: 'white', 
              borderRadius: '8px', 
              fontWeight: '600',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: 'var(--glow-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(79, 70, 229, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--glow-primary)';
            }}
            >Sign Up</Link>
          </div>
        )}
      </div>
    </header>
  );
}
