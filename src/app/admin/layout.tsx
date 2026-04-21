'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Users', path: '/admin/users', icon: '👥' },
    { name: 'Products', path: '/admin/products', icon: '🛍️' },
    { name: 'Orders', path: '/admin/orders', icon: '📦' },
    { name: 'Ads', path: '/admin/ads', icon: '📢' },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', background: 'var(--bg-primary)' }}>
        {/* Sidebar */}
        <aside style={{ 
          width: '260px', 
          background: 'var(--bg-secondary)', 
          borderRight: '1px solid var(--border-color)',
          padding: '2rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: '64px',
          height: 'calc(100vh - 64px)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2rem', paddingLeft: '1rem' }}>
            Admin Panel
          </h2>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.path);
              return (
                <Link 
                  key={link.path} 
                  href={link.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.2s ease',
                    textDecoration: 'none'
                  }}
                >
                  <span>{link.icon}</span>
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div style={{ marginTop: 'auto', paddingLeft: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Marketplace Engine v1.0</div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
