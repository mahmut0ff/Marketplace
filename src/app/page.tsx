'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [ads, setAds] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('featured');

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSearch(search); }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch('/api/ads');
        if (res.ok) { const data = await res.json(); setAds(data.ads || []); }
      } catch (err) {}
    };
    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads.length]);

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

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Banner Slider */}
      {ads.length > 0 && (
        <section style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '16px 24px 0',
        }}>
          <div style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            height: '320px',
            background: 'var(--bg-secondary)',
          }}>
            {ads.map((ad, idx) => (
              <Link href={`/products/${ad.productId}`} key={ad.id} style={{
                position: 'absolute',
                inset: 0,
                opacity: idx === currentAdIndex ? 1 : 0,
                transition: 'opacity 0.6s ease',
                display: 'flex',
                pointerEvents: idx === currentAdIndex ? 'auto' : 'none',
              }}>
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '32px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  color: 'white',
                }}>
                  <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>{ad.title}</h2>
                  <p style={{ fontSize: '15px', opacity: 0.9 }}>{ad.subtitle}</p>
                </div>
              </Link>
            ))}
            {/* Dots */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '16px',
              display: 'flex',
              gap: '6px',
              zIndex: 5,
            }}>
              {ads.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentAdIndex(idx)}
                  style={{
                    width: idx === currentAdIndex ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '99px',
                    background: idx === currentAdIndex ? 'white' : 'rgba(255,255,255,0.5)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px 24px',
        display: 'flex',
        gap: '20px',
      }}>
        {/* Sidebar Filters */}
        <aside style={{
          width: '240px',
          flexShrink: 0,
          position: 'sticky',
          top: '120px',
          alignSelf: 'flex-start',
        }}>
          <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>
              Фильтры
            </h3>

            {/* Search within filters */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Поиск</label>
              <input
                type="text"
                placeholder="Искать..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
            </div>

            {/* Price Range */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Цена</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="от"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    textAlign: 'center',
                  }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                <input
                  type="number"
                  placeholder="до"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    textAlign: 'center',
                  }}
                />
              </div>
            </div>

            {/* Sort */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Сортировка</label>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <option value="featured">Популярные</option>
                <option value="newest">Новинки</option>
                <option value="price_asc">Цена ↑</option>
                <option value="price_desc">Цена ↓</option>
              </select>
            </div>

            <button
              onClick={() => { setSearch(''); setMinPrice(''); setMaxPrice(''); setSort('featured'); }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              Сбросить фильтры
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <section style={{ flex: 1 }}>
          {/* Toolbar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {search ? `Результаты: «${search}»` : 'Каталог товаров'}
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {products.length} товаров
            </span>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px',
            }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div className="skeleton" style={{ height: '240px', borderRadius: 0 }} />
                  <div style={{ padding: '12px' }}>
                    <div className="skeleton" style={{ height: '14px', width: '80%', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ height: '20px', width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card" style={{
              textAlign: 'center',
              padding: '60px 20px',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
              <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>Ничего не найдено</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Попробуйте изменить фильтры или поисковый запрос</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px',
            }}>
              {products.map((p) => (
                <Link href={`/products/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
                  <div
                    className="card"
                    style={{
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    {/* Image */}
                    <div style={{
                      height: '240px',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      <img
                        src={p.image || p.images?.[0] || 'https://via.placeholder.com/400'}
                        alt={p.title}
                        style={{
                          maxWidth: '90%',
                          maxHeight: '90%',
                          objectFit: 'contain',
                          transition: 'transform 0.3s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      {p.stock !== undefined && p.stock <= 5 && p.stock > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          background: 'var(--danger)',
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                        }}>
                          Осталось {p.stock} шт
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      flexGrow: 1,
                      gap: '6px',
                    }}>
                      {/* Price */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                        }}>
                          ${Number(p.price).toFixed(0)}
                        </span>
                      </div>

                      {/* Title */}
                      <p style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {p.title}
                      </p>

                      {/* Rating */}
                      {p.averageRating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
                          <span style={{ color: '#fbbf24', fontSize: '12px' }}>★</span>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {Number(p.averageRating).toFixed(1)}
                          </span>
                          {p.reviewCount && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              ({p.reviewCount})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
