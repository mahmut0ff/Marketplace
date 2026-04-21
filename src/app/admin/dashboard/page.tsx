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
    setLoading(true);
    setTimeout(() => {
      setStats({ totalUsers: 1432, activeVendors: 89, pendingAds: 12, pendingProducts: 24 });
      setLoading(false);
    }, 500);
  }, [user]);

  const kpis = [
    { label: 'Пользователи', value: stats.totalUsers, color: 'var(--text-primary)', icon: '👥' },
    { label: 'Продавцы', value: stats.activeVendors, color: 'var(--accent)', icon: '🏪' },
    { label: 'Товары на модерации', value: stats.pendingProducts, color: 'var(--danger)', icon: '📦' },
    { label: 'Реклама на модерации', value: stats.pendingAds, color: 'var(--warning)', icon: '📢' },
  ];

  return (
    <div style={{ maxWidth: '1200px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Дашборд</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Обзор ключевых метрик платформы</p>

      {/* KPI Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-md)' }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {kpis.map(kpi => (
            <div key={kpi.label} className="card" style={{
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
            }}>
              <span style={{ fontSize: '28px' }}>{kpi.icon}</span>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{kpi.label}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
            Последние действия
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { text: 'Новый продавец зарегистрировался', badge: 'Новый', color: 'var(--success)', time: '2 мин' },
              { text: 'Товар отклонён модератором', badge: 'Отклонен', color: 'var(--danger)', time: '1 час' },
              { text: 'Крупный заказ завершён ($1,240)', badge: 'Заказ', color: 'var(--accent)', time: '3 часа' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%', background: item.color, flexShrink: 0,
                }} />
                <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{item.text}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
        }}>
          <span style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>📈</span>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>График выручки (скоро)</p>
        </div>
      </div>
    </div>
  );
}
