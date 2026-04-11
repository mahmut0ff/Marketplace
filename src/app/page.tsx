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
      


      {/* Hero Section */}
      <section style={{ 
        padding: '4rem 2rem', 
        borderRadius: '24px', 
        background: 'linear-gradient(135deg, var(--accent-hover), var(--accent-color))',
        color: 'white',
        marginBottom: '3rem',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>Future of E-Commerce</h2>
        <p style={{ fontSize: '1.2rem', opacity: '0.9', maxWidth: '600px', margin: '0 auto' }}>
          Discover curated premium products from top sellers globally, integrated with AI recommendations and seamless checkout.
        </p>
      </section>

      {/* Catalog Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Trending Now</h3>
        <select style={{ 
          padding: '0.5rem', 
          borderRadius: '8px', 
          border: '1px solid var(--border-color)', 
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)'
        }}>
          <option>Sort by: Featured</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading catalog...</div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          {products.map((p) => (
            <Link href={`/products/${p.id}`} key={p.id}>
              <div style={{ 
                background: 'var(--bg-secondary)', 
                borderRadius: '16px', 
                overflow: 'hidden',
                border: '1px solid var(--glass-border)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              >
                <div style={{ height: '220px', overflow: 'hidden' }}>
                  <img src={p.image || p.images?.[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h4 style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{p.title}</h4>
                  <p style={{ fontWeight: '700', color: 'var(--accent-color)', fontSize: '1.2rem', marginTop: 'auto' }}>${Number(p.price).toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </main>
  );
}
