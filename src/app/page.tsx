'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [ads, setAds] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('featured');
  // const [category, setCategory] = useState(''); // could add category filter if needed

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Ads
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch('/api/ads');
        if (res.ok) {
          const data = await res.json();
          setAds(data.ads || []);
        }
      } catch (err) {}
    };
    fetchAds();
  }, []);

  // Ad Slider Logic
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads.length]);

  // Fetch Logic
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.append('q', debouncedSearch);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (sort) params.append('sort', sort);

        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [debouncedSearch, minPrice, maxPrice, sort]);

  const inputStyle = {
    padding: '0.8rem 1.2rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    background: 'rgba(255,255,255,0.02)',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s'
  };

  return (
    <main style={{ minHeight: '100vh', padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Banner/Ad Hero Section */}
      <section style={{ 
        position: 'relative',
        borderRadius: '32px', 
        background: 'var(--bg-secondary)',
        marginBottom: '3rem',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }} className="animate-fade-in-up">
        
        {ads.length > 0 ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {ads.map((ad, idx) => (
              <div key={ad.id} style={{ 
                position: 'absolute', inset: 0, 
                opacity: idx === currentAdIndex ? 1 : 0, 
                transition: 'opacity 1s ease-in-out',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center',
                background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${ad.imageUrl})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                color: 'white'
              }}>
                <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '24px', maxWidth: '800px', margin: '0 auto' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', background: '#fbbf24', color: '#000', padding: '0.3rem 0.8rem', borderRadius: '99px', display: 'inline-block', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Featured Sponsor</div>
                  <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '1rem', lineHeight: '1.1' }}>{ad.title}</h2>
                  <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>{ad.subtitle}</p>
                  <Link href={`/products/${ad.productId}`}>
                    <button style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: '700', borderRadius: '99px', border: 'none', background: 'white', color: 'black', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                      Shop Now
                    </button>
                  </Link>
                </div>
              </div>
            ))}
            
            {/* Slider Dots */}
            <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {ads.map((_, idx) => (
                <div key={idx} onClick={() => setCurrentAdIndex(idx)} style={{ width: '12px', height: '12px', borderRadius: '50%', background: idx === currentAdIndex ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'background 0.3s' }} />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: '6rem 2rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{
              position: 'absolute', top: '-50%', left: '-10%', width: '70%', height: '200%',
              background: 'radial-gradient(ellipse at center, rgba(79, 70, 229, 0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none'
            }} />
            <h2 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '1.5rem', letterSpacing: '-1px', position: 'relative', zIndex: 1 }}>
              The Future of <span className="gradient-text">E-Commerce</span>
            </h2>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6', position: 'relative', zIndex: 1 }}>
              Discover curated premium products from top sellers globally.
            </p>
          </div>
        )}

        {/* Global Search Input Overlay */}
        <div style={{ position: 'absolute', bottom: ads.length > 0 ? '60px' : '30px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '600px', zIndex: 10, padding: '0 2rem' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '1.2rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search products by brand, title, or category..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                ...inputStyle,
                padding: '1.2rem 1.2rem 1.2rem 3rem',
                fontSize: '1.1rem',
                borderRadius: '99px',
                background: ads.length > 0 ? 'rgba(0,0,0,0.5)' : 'var(--glass-bg)',
                color: ads.length > 0 ? 'white' : 'var(--text-primary)',
                borderColor: ads.length > 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(15px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }} 
            />
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '3rem' }}>
        
        {/* Sidebar Filters */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', position: 'sticky', top: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              Filters
            </h3>

            {/* Price Filter */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price Range</h4>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  style={{ ...inputStyle, padding: '0.6rem', textAlign: 'center' }} 
                />
                <span style={{ color: 'var(--text-secondary)' }}>-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  style={{ ...inputStyle, padding: '0.6rem', textAlign: 'center' }} 
                />
              </div>
            </div>

            <button 
                onClick={() => {
                  setSearch('');
                  setMinPrice('');
                  setMaxPrice('');
                  setSort('featured');
                }}
                style={{ 
                  width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'transparent',
                  border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer',
                  fontWeight: '600', transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Catalog Grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', animationDelay: '0.2s' }} className="animate-fade-in-up">
            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
              {search ? `Results for "${search}"` : 'Trending Now'}
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{products.length} Items</span>
              <select 
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{ 
                  padding: '0.6rem 1.2rem', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border-color)', 
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(10px)',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <option value="featured">Sort by: Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
              {[1,2,3,4].map(i => (
                 <div key={i} style={{ height: '350px', background: 'var(--bg-secondary)', borderRadius: '24px', animation: 'pulse 1.5s infinite ease-in-out' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px dashed var(--border-color)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕵️‍♂️</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No products found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '2rem' 
            }}>
              {products.map((p, i) => (
                <Link href={`/products/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
                  <div 
                    className="glass-panel"
                    style={{ 
                      borderRadius: '24px', 
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      animationDelay: `${i * 0.05}s`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg), 0 0 20px rgba(79,70,229,0.15)';
                      e.currentTarget.style.borderColor = 'var(--accent-color)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
                      e.currentTarget.style.borderColor = 'var(--glass-border)';
                    }}
                  >
                    <div style={{ height: '220px', overflow: 'hidden', position: 'relative', background: '#ffffff' }}>
                      <img 
                        src={p.image || p.images?.[0] || 'https://via.placeholder.com/400'} 
                        alt={p.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem', transition: 'transform 0.5s ease' }} 
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
                      <h4 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                        {p.title}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.description || "Premium product curated just for you."}
                      </p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <p style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                          ${Number(p.price).toFixed(2)}
                        </p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(251, 191, 36, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '8px' }}>
                          <span style={{ color: '#fbbf24', fontSize: '0.9rem' }}>★</span>
                          <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>
                            {p.averageRating ? Number(p.averageRating).toFixed(1) : 'New'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
