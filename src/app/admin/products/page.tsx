'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const url = filter === 'all' ? '/api/products' : `/api/products?status=${filter}`;
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { const data = await res.json(); setProducts(data.products || []); }
      } catch (err) { console.error('Failed to fetch products', err); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, [user, filter]);

  const handleModerate = async (productId: string, action: 'approved' | 'rejected') => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: action } : p));
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'approved': return { bg: 'rgba(34,197,94,0.08)', color: 'var(--success)', text: 'Одобрен' };
      case 'rejected': return { bg: 'rgba(239,68,68,0.08)', color: 'var(--danger)', text: 'Отклонён' };
      default: return { bg: 'rgba(245,158,11,0.08)', color: 'var(--warning)', text: 'На проверке' };
    }
  };

  const tabs = [
    { key: 'pending', label: 'На модерации' },
    { key: 'all', label: 'Все товары' },
  ];

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Модерация товаров</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Проверка и одобрение товаров от продавцов</p>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                background: filter === tab.key ? 'var(--accent)' : 'transparent',
                color: filter === tab.key ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >{tab.label}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>Загрузка каталога...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Всё проверено!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Нет товаров на модерации</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Товар</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Продавец</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Цена</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Статус</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Действие</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const st = getStatusStyle(p.status);
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-primary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, marginBottom: '2px' }}>{p.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.category || 'Без категории'}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {p.sellerId?.slice(0, 12) || '—'}...
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                      ${p.price?.toFixed(2) || '0.00'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                        textTransform: 'uppercase', background: st.bg, color: st.color,
                      }}>{st.text}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {(p.status === 'pending' || !p.status) && (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleModerate(p.id, 'approved')}
                            style={{ padding: '6px 14px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                            Одобрить
                          </button>
                          <button onClick={() => handleModerate(p.id, 'rejected')}
                            style={{ padding: '6px 14px', background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                            Отклонить
                          </button>
                        </div>
                      )}
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
