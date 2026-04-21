'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { const data = await res.json(); setUsers(data.users || []); }
      } catch (err) { console.error('Failed to fetch users', err); }
      finally { setLoading(false); }
    };
    fetchUsers();
  }, [user]);

  const handleBlockUser = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
  };

  const getRoleBadge = (role: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      admin: { bg: 'var(--accent-light)', color: 'var(--accent)' },
      seller: { bg: 'rgba(245,158,11,0.08)', color: 'var(--warning)' },
      client: { bg: 'var(--bg-primary)', color: 'var(--text-muted)' },
    };
    const s = map[role] || map.client;
    return s;
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Пользователи</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Управление покупателями и продавцами</p>
        </div>
        <input
          type="text"
          placeholder="Поиск по email..."
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            width: '260px',
            fontSize: '13px',
          }}
        />
      </div>

      <div className="card" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>Загрузка...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Аккаунт</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Роль</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Дата</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Статус</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Действие</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Нет пользователей</td></tr>
              ) : users.map(u => {
                const roleBadge = getRoleBadge(u.role || 'client');
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-primary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, marginBottom: '2px' }}>{u.email}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {u.id.slice(0, 12)}...</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                        background: roleBadge.bg, color: roleBadge.color,
                      }}>{u.role || 'client'}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ru-RU') : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '12px', fontWeight: 600,
                        color: u.status === 'blocked' ? 'var(--danger)' : 'var(--success)',
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.status === 'blocked' ? 'var(--danger)' : 'var(--success)' }} />
                        {u.status === 'blocked' ? 'Заблокирован' : 'Активен'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleBlockUser(u.id, u.status)}
                        style={{
                          padding: '6px 14px',
                          background: 'transparent',
                          border: `1px solid ${u.status === 'blocked' ? 'var(--border-color)' : 'var(--danger)'}`,
                          color: u.status === 'blocked' ? 'var(--text-secondary)' : 'var(--danger)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '12px',
                          transition: 'all 0.15s',
                        }}
                      >
                        {u.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
