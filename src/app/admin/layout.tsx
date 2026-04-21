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
    { name: 'Дашборд', path: '/admin/dashboard', icon: '📊' },
    { name: 'Пользователи', path: '/admin/users', icon: '👥' },
    { name: 'Товары', path: '/admin/products', icon: '📦' },
    { name: 'Заказы', path: '/admin/orders', icon: '🧾' },
    { name: 'Реклама', path: '/admin/ads', icon: '📢' },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 100px)' }}>
        {/* Sidebar */}
        <aside style={{
          width: '220px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          top: '100px',
          height: 'calc(100vh - 100px)',
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '0 12px',
            marginBottom: '16px',
          }}>
            Админ панель
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--accent-light)' : 'transparent',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '14px',
                    transition: 'all 0.15s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--bg-primary)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{link.icon}</span>
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div style={{ marginTop: 'auto', padding: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
            Market Admin v1.0
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '24px', background: 'var(--bg-primary)', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
