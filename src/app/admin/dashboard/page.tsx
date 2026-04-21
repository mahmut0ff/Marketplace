'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeVendors: 0,
    pendingAds: 0,
    pendingProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch these aggregated stats from an API endpoint
    // e.g. /api/admin/dashboard-stats
    // For now we will mock them for the UI structure
    setLoading(true);
    setTimeout(() => {
      setStats({
        totalUsers: 1432,
        activeVendors: 89,
        pendingAds: 12,
        pendingProducts: 24,
      });
      setLoading(false);
    }, 500);
  }, [user]);

  const KpiCard = ({ title, value, color }: { title: string, value: string | number, color: string }) => (
    <div className="glass-panel" style={{ 
      padding: '1.5rem', 
      borderRadius: '16px', 
      display: 'flex', 
      flexDirection: 'column',
      gap: '0.5rem',
      boxShadow: 'var(--shadow-md)'
    }}>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: color }}>{value}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', animation: 'fade-in-up 0.5s ease-out' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Welcome back. Here's what's happening today.</p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[1,2,3,4].map(i => <div key={i} className="glass-panel" style={{ height: '120px', borderRadius: '16px', animation: 'pulse-glow 2s infinite' }}></div>)}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <KpiCard title="Total Users" value={stats.totalUsers} color="var(--text-primary)" />
            <KpiCard title="Active Vendors" value={stats.activeVendors} color="var(--accent-color)" />
            <KpiCard title="Pending Ads" value={stats.pendingAds} color="#f59e0b" />
            <KpiCard title="Pending Products" value={stats.pendingProducts} color="#ef4444" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', minHeight: '300px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Recent Activity</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div>
                  <div><span style={{ fontWeight: 600 }}>New Vendor</span> registered (Acme Corp)</div>
                  <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>2 mins ago</div>
                </li>
                <li style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></div>
                  <div><span style={{ fontWeight: 600 }}>Product rejected</span> by Admin</div>
                  <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>1 hour ago</div>
                </li>
                <li style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-color)' }}></div>
                  <div><span style={{ fontWeight: 600 }}>Large Order</span> completed ($1,240)</div>
                  <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>3 hours ago</div>
                </li>
              </ul>
            </div>
            
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <p style={{ color: 'var(--text-muted)' }}>Revenue Chart Placeholder</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
