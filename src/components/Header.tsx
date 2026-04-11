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
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1.5rem 2rem', 
      borderBottom: '1px solid var(--border-color)',
      maxWidth: '1400px',
      margin: '0 auto 2rem auto',
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-primary)', margin: 0 }}>
          BigShop<span style={{ color: 'var(--accent-color)' }}>AI</span>
        </h1>
      </Link>
      
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Search products..." 
          style={{ 
            padding: '0.6rem 1rem', 
            borderRadius: '20px', 
            border: '1px solid var(--border-color)', 
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            outline: 'none',
            width: '250px'
          }} 
        />

        {user ? (
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
            <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
              Hi, {profile?.displayName || user.email?.split('@')[0]}
            </span>
            
            {profile?.role && profile.role !== 'client' && (
              <Link href={dashboardLink} style={{ 
                fontSize: '0.85rem', 
                padding: '0.4rem 0.8rem', 
                borderRadius: '12px', 
                background: 'var(--bg-secondary)', 
                color: 'var(--text-primary)',
                fontWeight: '600'
              }}>
                {profile.role === 'admin' ? 'Admin Panel' : 'Seller Portal'}
              </Link>
            )}

            <button 
              onClick={handleSignOut}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ef4444',
                borderRadius: '12px',
                background: 'transparent',
                color: '#ef4444',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
            <Link href="/auth/login" style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Log In</Link>
            <Link href="/auth/signup" style={{ 
              padding: '0.6rem 1.2rem', 
              background: 'var(--text-primary)', 
              color: 'var(--bg-primary)', 
              borderRadius: '20px', 
              fontWeight: '600' 
            }}>Sign Up</Link>
          </div>
        )}
      </div>
    </header>
  );
}
