'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We would normally fetch from /api/products/[id]
    // But since we want to handle missing firebase keys gracefully, we mock it.
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('API failed (likely missing DB config)');
        const data = await res.json();
        setProduct(data.product);
      } catch (err) {
        console.warn(err);
        // Fallback Mock Data for UI demonstration
        setProduct({
          id,
          title: 'Premium Wireless Headphones',
          description: 'Experience pure sound with extreme clarity and deep bass in a sleek finish.',
          price: 299.99,
          stock: 10,
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80']
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading product details...</div>;

  if (!product) return <div style={{ padding: '2rem' }}>Product not found.</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }} className="animate-fade-in-up">
      <Link href="/" style={{ color: 'var(--text-secondary)', marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', transition: 'color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <span>&larr;</span> Back to Catalog
      </Link>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1fr', gap: '4rem', marginTop: '1rem', alignItems: 'start' }}>
        <div style={{ position: 'relative' }}>
          {/* Decorative glow behind image */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '80%',
            background: 'var(--accent-color)',
            filter: 'blur(100px)',
            opacity: 0.2,
            zIndex: 0,
            pointerEvents: 'none'
          }} />
          
          <div className="glass-panel" style={{ 
            borderRadius: '32px', 
            overflow: 'hidden', 
            aspectRatio: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
            padding: '2rem'
          }}>
            <img 
              src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'} 
              alt={product.title} 
              style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.4s ease' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent-color)', borderRadius: '99px', fontWeight: '700', fontSize: '0.85rem', marginBottom: '1.5rem', alignSelf: 'flex-start' }}>
            New Arrival
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '1rem', lineHeight: '1.1', letterSpacing: '-1px' }}>{product.title}</h1>
          <p style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem' }} className="gradient-text">
            ${Number(product.price).toFixed(2)}
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
            {product.description}
          </p>
          
          <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              background: product.stock > 0 ? '#10b981' : '#ef4444',
              boxShadow: product.stock > 0 ? '0 0 10px rgba(16, 185, 129, 0.5)' : '0 0 10px rgba(239, 68, 68, 0.5)'
            }}></span>
            <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
              {product.stock > 0 ? `${product.stock} items left in stock` : 'Currently out of stock'}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{
              flex: 2,
              padding: '1.25rem 2rem',
              background: 'var(--accent-gradient)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '1.15rem',
              fontWeight: '700',
              cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
              opacity: product.stock > 0 ? 1 : 0.5,
              transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
              boxShadow: 'var(--glow-primary)'
            }}
            onMouseEnter={e => {
              if (product.stock > 0) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(79, 70, 229, 0.4)';
              }
            }}
            onMouseLeave={e => {
              if (product.stock > 0) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--glow-primary)';
              }
            }}
            >
              Add to Cart
            </button>
            <button style={{
              flex: 1,
              padding: '1.25rem 2rem',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '16px',
              fontSize: '1.15rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--glass-bg)'}
            >
              ♡ Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
