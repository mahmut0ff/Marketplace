'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setOrders([
        { id: 'ORD-904', buyerId: 'user_123', totalAmount: 450.00, platformFee: 45.00, status: 'PAID', date: '2026-04-20T14:32:00Z' },
        { id: 'ORD-905', buyerId: 'user_456', totalAmount: 120.50, platformFee: 12.05, status: 'REFUNDED', date: '2026-04-21T09:15:00Z' },
        { id: 'ORD-906', buyerId: 'user_789', totalAmount: 890.00, platformFee: 89.00, status: 'PENDING', date: '2026-04-21T11:05:00Z' },
      ]);
      setLoading(false);
    }, 600);
  }, [user]);

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'PAID': return { bg: 'rgba(34,197,94,0.08)', color: 'var(--success)', text: 'Оплачен' };
      case 'REFUNDED': return { bg: 'rgba(239,68,68,0.08)', color: 'var(--danger)', text: 'Возврат' };
      case 'PENDING': return { bg: 'rgba(245,158,11,0.08)', color: 'var(--warning)', text: 'Ожидание' };
      default: return { bg: 'var(--bg-primary)', color: 'var(--text-muted)', text: status };
    }
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Заказы</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Все транзакции на платформе</p>
        </div>
        <button style={{
          padding: '10px 20px',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 600,
          fontSize: '13px',
          cursor: 'pointer',
        }}>
          Экспорт CSV
        </button>
      </div>

      <div className="card" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>Загрузка транзакций...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                {['Заказ', 'Дата', 'Сумма', 'Комиссия', 'Статус'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Нет заказов</td></tr>
              ) : orders.map(o => {
                const st = getStatusStyle(o.status);
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-primary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{o.id}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Покупатель: {o.buyerId}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {new Date(o.date).toLocaleDateString('ru-RU')}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                      ${o.totalAmount.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--accent)' }}>
                      ${o.platformFee.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                        textTransform: 'uppercase', background: st.bg, color: st.color,
                      }}>{st.text}</span>
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
