'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function SellerAdsPage() {
  const { user } = useAuth();
  const [ads, setAds] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [productId, setProductId] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        // Fetch ads
        const adsRes = await fetch('/api/seller/ads', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (adsRes.ok) {
          const adsData = await adsRes.json();
          setAds(adsData.ads || []);
        }

        // Fetch products to populate the dropdown
        const pRes = await fetch(`/api/products?sellerId=${user.uid}`);
        if (pRes.ok) {
          const pData = await pRes.json();
          setProducts(pData.products || []);
        }

      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Recalculate cost when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      s.setHours(0,0,0,0);
      e.setHours(0,0,0,0);
      
      const diffTime = e.getTime() - s.getTime();
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays < 1) diffDays = 0;
      setTotalCost(diffDays * 100);
    } else {
      setTotalCost(0);
    }
  }, [startDate, endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (totalCost <= 0) return alert('Invalid date range.');
    
    setSubmitting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/seller/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId, title, subtitle, imageUrl, startDate, endDate
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAds([data.ad, ...ads]);
      
      // Reset form
      setProductId('');
      setTitle('');
      setSubtitle('');
      setImageUrl('');
      setStartDate('');
      setEndDate('');
      setTotalCost(0);
      alert('Campaign created! Awaiting admin approval.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f9fafb' };

  return (
    <ProtectedRoute allowedRoles={['seller', 'admin']}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem', color: '#111827' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>Ad Campaigns</h1>
          <p style={{ color: '#4b5563', margin: 0, fontSize: '1rem' }}>Create and manage premium display banners for your products.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '3rem', alignItems: 'start' }}>
          
          {/* Create Ad Form */}
          <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>Create New Campaign</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Target Product</label>
              <select required value={productId} onChange={e => setProductId(e.target.value)} style={inputStyle}>
                <option value="">Select a product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Headline</label>
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Get 20% Faster Audio!" style={inputStyle} maxLength={50} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Subtitle (Optional)</label>
              <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Limited time offer..." style={inputStyle} maxLength={100} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Banner Image URL</label>
              <input required type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." style={inputStyle} />
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>Use a wide landscape image (21:9 ratio recommended).</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Start Date</label>
                <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>End Date</label>
                <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate || new Date().toISOString().split('T')[0]} style={inputStyle} />
              </div>
            </div>

            <div style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '0.5rem' }}>Estimated Campaign Cost ($100 / day)</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: totalCost > 0 ? '#111827' : '#9ca3af' }}>
                ${totalCost}
              </div>
            </div>

            <button type="submit" disabled={submitting || totalCost <= 0} style={{
              width: '100%', padding: '1rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '1.1rem', cursor: (submitting || totalCost <= 0) ? 'not-allowed' : 'pointer', opacity: (submitting || totalCost <= 0) ? 0.6 : 1
            }}>
              {submitting ? 'Processing...' : 'Submit & Pay'}
            </button>
          </form>

          {/* Active Campaigns List */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>Campaign History</h3>
            
            {loading ? <p>Loading campaigns...</p> : ads.length === 0 ? (
              <div style={{ padding: '3rem', background: '#f9fafb', borderRadius: '12px', textAlign: 'center', border: '1px dashed #d1d5db', color: '#6b7280' }}>
                No past or active campaigns.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {ads.map(ad => (
                  <div key={ad.id} style={{ display: 'flex', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ width: '200px', background: '#f3f4f6', position: 'relative' }}>
                      <img src={ad.imageUrl} alt="Ad Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '1.5rem', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h4 style={{ fontWeight: '700', fontSize: '1.1rem', margin: 0 }}>{ad.title}</h4>
                        <span style={{ 
                          padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase',
                          background: ad.status === 'active' ? '#d1fae5' : ad.status === 'pending' ? '#fef3c7' : '#fee2e2',
                          color: ad.status === 'active' ? '#065f46' : ad.status === 'pending' ? '#92400e' : '#991b1b'
                        }}>
                          {ad.status}
                        </span>
                      </div>
                      <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '1rem' }}>{ad.subtitle}</p>
                      
                      <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: '#6b7280' }}>
                        <div><strong>Dates:</strong> {new Date(ad.startDate).toLocaleDateString()} - {new Date(ad.endDate).toLocaleDateString()}</div>
                        <div><strong>Cost:</strong> ${ad.totalCost}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </ProtectedRoute>
  );
}
