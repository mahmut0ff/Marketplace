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
      await updateDoc(userRef, {
        role: newRole
      });
      // Context will automatically update via onSnapshot
    } catch (err: any) {
      console.error('Error updating role:', err);
      setError('Failed to update role. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const activeRole = profile?.role || 'client';

  return (
    <ProtectedRoute>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' }} className="animate-fade-in-up">
        
        <div className="glass-panel" style={{ 
          borderRadius: '24px', 
          padding: '3rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Background */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'var(--accent-gradient)'
          }} />

          <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Account <span className="gradient-text">Settings</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>
            Manage your seamless experience.
          </p>

          <div style={{ padding: '2rem', background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Active Workspace Role</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
              Your current role defines the portal you access and the features available to you.
            </p>

            {error && (
              <div style={{ 
                padding: '1rem', 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                color: '#ef4444', 
                borderRadius: '8px',
                marginBottom: '1.5rem',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                {error}
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              background: 'var(--bg-tertiary)', 
              padding: '0.5rem', 
              borderRadius: '16px',
              gap: '0.5rem',
              width: '100%',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
            }}>
              {(['client', 'seller', 'admin'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  disabled={updating}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: activeRole === role ? '700' : '500',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    background: activeRole === role ? 'var(--bg-secondary)' : 'transparent',
                    color: activeRole === role ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: activeRole === role ? 'var(--shadow-md)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: updating && activeRole !== role ? 0.5 : 1,
                    transform: activeRole === role ? 'scale(1.02)' : 'scale(1)'
                  }}
                  onMouseEnter={e => {
                    if (activeRole !== role && !updating) e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={e => {
                    if (activeRole !== role && !updating) e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  {role === 'client' ? 'Покупатель' : role === 'seller' ? 'Продавец' : 'Администратор'}
                </button>
              ))}
            </div>
            
            <div style={{ 
              marginTop: '2rem', 
              padding: '1rem',
              borderRadius: '12px',
              background: 'var(--bg-tertiary)',
              border: '1px dashed var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Current Hub</span>
              <strong style={{
                padding: '0.25rem 0.75rem',
                background: 'var(--accent-color)',
                color: 'white',
                borderRadius: '99px',
                fontSize: '0.85rem'
              }}>
                {
                  activeRole === 'admin' ? 'Admin Panel' : 
                  activeRole === 'seller' ? 'Seller Portal' : 
                  'Marketplace'
                }
              </strong>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
