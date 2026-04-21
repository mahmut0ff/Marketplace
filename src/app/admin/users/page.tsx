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
        const res = await fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  const handleBlockUser = async (userId: string, currentStatus: string) => {
    // In a real app, you would fire a request to /api/users/[id]/block
    // For now we'll do an optimistic UI update
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', animation: 'fade-in-up 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Users Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage buyers, sellers, and system administrators.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Search by email..." 
              style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  width: '300px'
              }}
            />
        </div>
      </div>

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading network...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Account</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Registration Date</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No users found.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{u.email}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {u.id}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '99px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          background: u.role === 'admin' ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-tertiary)',
                          color: u.role === 'admin' ? 'var(--accent-color)' : 'var(--text-secondary)',
                      }}>
                          {u.role || 'user'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '99px', 
                          fontSize: '0.8rem', 
                          fontWeight: 600,
                          background: u.status === 'blocked' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: u.status === 'blocked' ? '#ef4444' : '#10b981'
                      }}>
                          {u.status || 'active'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleBlockUser(u.id, u.status)}
                        style={{ 
                          padding: '0.5rem 1rem', 
                          background: 'transparent', 
                          border: `1px solid ${u.status === 'blocked' ? 'var(--border-color)' : '#ef4444'}`, 
                          color: u.status === 'blocked' ? 'var(--text-secondary)' : '#ef4444', 
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {u.status === 'blocked' ? 'Unblock Account' : 'Block User'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
