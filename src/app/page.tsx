'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
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
  }, []);

  return (
    <main style={{ minHeight: '100vh', padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Premium Hero Section */}
      <section style={{ 
        position: 'relative',
        padding: '6rem 2rem', 
        borderRadius: '32px', 
        background: 'var(--bg-secondary)',
        marginBottom: '4rem',
        textAlign: 'center',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }} className="animate-fade-in-up">
        {/* Subtle background glow effect */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-10%',
          width: '70%',
          height: '200%',
          background: 'radial-gradient(ellipse at center, rgba(79, 70, 229, 0.15) 0%, rgba(0,0,0,0) 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-50%',
          right: '-10%',
          width: '60%',
          height: '150%',
          background: 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.1) 0%, rgba(0,0,0,0) 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
            The Future of <span className="gradient-text">E-Commerce</span>
          </h2>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
            Discover curated premium products from top sellers globally. Our AI-driven platform brings you exactly what you need, before you even know it.
          </p>
          <button style={{
            padding: '1rem 2.5rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: 'white',
            background: 'var(--accent-gradient)',
            border: 'none',
            borderRadius: '99px',
            cursor: 'pointer',
            boxShadow: 'var(--glow-primary)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          className="animate-pulse-glow"
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Explore Collection
          </button>
        </div>
      </section>

      {/* Catalog Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }} className="animate-fade-in-up">
        <h3 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Trending Now</h3>
        <select style={{ 
          padding: '0.6rem 1.2rem', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)', 
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(10px)',
          color: 'var(--text-primary)',
          fontWeight: '500',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <option>Sort by: Featured</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
          Loading catalog...
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '2.5rem' 
        }}>
          {products.map((p, i) => (
            <Link href={`/products/${p.id}`} key={p.id}>
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
                  animationDelay: `${i * 0.1}s`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg), 0 0 20px rgba(79,70,229,0.15)';
                  e.currentTarget.style.borderColor = 'var(--accent-color)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                }}
              >
                <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src={p.image || p.images?.[0]} 
                    alt={p.title} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
                    }} 
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--glass-border)'
                  }}>
                    Premium
                  </div>
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1, background: 'var(--bg-secondary)' }}>
                  <h4 style={{ fontWeight: '700', fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    {p.title}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description || "Experience the best quality products curated just for you."}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <p style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.3rem' }}>
                      ${Number(p.price).toFixed(2)}
                    </p>
                    <button style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--bg-tertiary)',
                      border: 'none',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--accent-color)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'rotate(90deg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.transform = 'rotate(0)';
                    }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </main>
  );
}
