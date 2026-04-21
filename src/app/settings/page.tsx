'use client';

import React, { useState } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/client';
import { doc, updateDoc } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = async (newRole: UserRole) => {
    if (!user || user.uid !== profile?.uid || profile?.role === newRole) return;
    setUpdating(true);
    setError(null);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { role: newRole });
    } catch (err: any) {
      console.error('Error updating role:', err);
      setError('Не удалось изменить роль. Попробуйте снова.');
    } finally {
      setUpdating(false);
    }
  };

  const activeRole = profile?.role || 'client';

  const roles = [
    { key: 'client' as const, name: 'Покупатель', icon: '🛒', desc: 'Просмотр каталога и оформление заказов' },
    { key: 'seller' as const, name: 'Продавец', icon: '🏪', desc: 'Управление товарами и заказами' },
    { key: 'admin' as const, name: 'Администратор', icon: '⚙️', desc: 'Полный контроль над платформой' },
  ];

  return (
    <ProtectedRoute>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Настройки</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
          Управление аккаунтом и выбор роли
        </p>

        {/* Account Info */}
        <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Аккаунт</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Email</span>
              <span style={{ fontWeight: 600 }}>{user?.email || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Имя</span>
              <span style={{ fontWeight: 600 }}>{profile?.displayName || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Статус</span>
              <span className="badge badge-success">{profile?.status || 'active'}</span>
            </div>
          </div>
        </div>

        {/* Role Selector */}
        <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Выберите роль</h2>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(239,68,68,0.06)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {roles.map((role) => (
              <button
                key={role.key}
                onClick={() => handleRoleChange(role.key)}
                disabled={updating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: activeRole === role.key ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                  background: activeRole === role.key ? 'var(--accent-light)' : 'var(--bg-secondary)',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  opacity: updating && activeRole !== role.key ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: '24px' }}>{role.icon}</span>
                <div>
                  <div style={{
                    fontWeight: 600,
                    fontSize: '14px',
                    color: activeRole === role.key ? 'var(--accent)' : 'var(--text-primary)',
                  }}>
                    {role.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {role.desc}
                  </div>
                </div>
                {activeRole === role.key && (
                  <span style={{
                    marginLeft: 'auto',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
