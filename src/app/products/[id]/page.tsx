'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewInput, setReviewInput] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        setProduct(data.product);

        const revRes = await fetch(`/api/products/${id}/reviews`);
        if (revRes.ok) {
          const revData = await revRes.json();
          setReviews(revData.reviews || []);
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    
    addItem({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      quantity: 1,
      image: product.images?.[0],
      sellerId: product.sellerId
    });
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Please login to review');
    setSubmittingReview(true);
    setReviewError('');

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: reviewInput.rating,
          comment: reviewInput.comment,
          sellerId: product.sellerId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      
      setReviews([data.reviewData, ...reviews]);
      setReviewInput({ rating: 5, comment: '' });
    } catch (err: any) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

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
        {/* Left Column - Image */}
        <div style={{ position: 'sticky', top: '2rem' }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '80%', height: '80%', background: 'var(--accent-color)', filter: 'blur(100px)', opacity: 0.2, zIndex: 0, pointerEvents: 'none'
          }} />
          <div className="glass-panel" style={{ 
            borderRadius: '32px', overflow: 'hidden', aspectRatio: '1', display: 'flex', alignItems: 'center',
            justifyContent: 'center', position: 'relative', zIndex: 1, padding: '2rem'
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
        
        {/* Right Column - Details */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '0.5rem', lineHeight: '1.1', letterSpacing: '-1px' }}>{product.title}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.2rem', color: '#fbbf24' }}>
              {'★'.repeat(Math.round(product.averageRating || 0))}{'☆'.repeat(5 - Math.round(product.averageRating || 0))}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>({product.reviewCount || 0} reviews)</span>
          </div>

          <p style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '2rem' }} className="gradient-text">
            ${Number(product.price).toFixed(2)}
          </p>

          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
            {product.description}
          </p>
          
          <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ 
              display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', 
              background: product.stock > 0 ? '#10b981' : '#ef4444',
              boxShadow: product.stock > 0 ? '0 0 10px rgba(16, 185, 129, 0.5)' : '0 0 10px rgba(239, 68, 68, 0.5)'
            }}></span>
            <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
              {product.stock > 0 ? `${product.stock} items left in stock` : 'Currently out of stock'}
            </span>
          </div>
          
          <button onClick={handleAddToCart} style={{
              width: '100%',
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
              boxShadow: 'var(--glow-primary)',
              marginBottom: '4rem'
            }}
          >
            Add to Cart & Checkout
          </button>
          
          {/* Reviews Section */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem' }}>Customer Reviews</h2>

            {/* Leave a review form */}
            {user && (user as any).role === 'client' && (
              <form onSubmit={handleReviewSubmit} className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '700' }}>Have you purchased this?</h3>
                {reviewError && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{reviewError}</div>}
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Rating</label>
                  <select 
                    value={reviewInput.rating}
                    onChange={e => setReviewInput({...reviewInput, rating: Number(e.target.value)})}
                    style={{ padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', width: '100px' }}
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Comment</label>
                  <textarea 
                    required
                    value={reviewInput.comment}
                    onChange={e => setReviewInput({...reviewInput, comment: e.target.value})}
                    placeholder="Share your thoughts about this product..."
                    style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', minHeight: '100px', resize: 'vertical' }}
                  />
                </div>
                
                <button type="submit" disabled={submittingReview} style={{
                  padding: '0.8rem 2rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', fontWeight: '600', cursor: submittingReview ? 'not-allowed' : 'pointer'
                }}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No reviews yet. Be the first to try it!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reviews.map(rev => (
                  <div key={rev.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: '700' }}>{rev.clientName}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ color: '#fbbf24', fontSize: '1rem', marginBottom: '1rem' }}>
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
