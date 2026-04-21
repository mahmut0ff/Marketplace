'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminAdsPage() {
  const { user } = useAuth();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/admin/ads', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { const data = await res.json(); setAds(data.ads || []); }
      } catch (err) { console.error('Failed to fetch ads', err); }
      finally { setLoading(false); }
    };
    fetchAds();
  }, [user]);

  const handleAction = async (adId: string, status: 'active' | 'rejected') => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ adId, status })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setAds(prev => prev.map(a => a.id === adId ? { ...a, status } : a));
    } catch (err: any) { alert(err.message); }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'active': return { bg: 'rgba(34,197,94,0.08)', color: 'var(--success)', text: 'Активна' };
      case 'rejected': return { bg: 'rgba(239,68,68,0.08)', color: 'var(--danger)', text: 'Отклонена' };
      default: return { bg: 'rgba(245,158,11,0.08)', color: 'var(--warning)', text: 'На проверке' };
    }
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Модерация рекламы</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Проверка рекламных баннеров от продавцов</p>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>Загрузка...</div>
      ) : ads.length === 0 ? (
        <div className="card" style={{ padding: '48px 20px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>📭</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Нет рекламных объявлений</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ads.map(ad => {
            const st = getStatusStyle(ad.status);
            return (
              <div key={ad.id} className="card" style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'stretch',
              }}>
                {/* Banner preview */}
                <div style={{ width: '200px', flexShrink: 0, background: '#f5f5f5' }}>
                  <img src={ad.imageUrl} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>

                {/* Details */}
                <div style={{ flex: 1, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{ad.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>{ad.subtitle}</div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>{new Date(ad.startDate).toLocaleDateString('ru-RU')} — {new Date(ad.endDate).toLocaleDateString('ru-RU')}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>${ad.totalCost}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                      textTransform: 'uppercase', background: st.bg, color: st.color,
                    }}>{st.text}</span>

                    {ad.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleAction(ad.id, 'active')}
                          style={{ padding: '6px 14px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                          Одобрить
                        </button>
                        <button onClick={() => handleAction(ad.id, 'rejected')}
                          style={{ padding: '6px 14px', background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                          Отклонить
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
