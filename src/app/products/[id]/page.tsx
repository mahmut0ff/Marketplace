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
  const [selectedImage, setSelectedImage] = useState(0);

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
    if (!user) return alert('Пожалуйста, авторизуйтесь');
    setSubmittingReview(true);
    setReviewError('');
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rating: reviewInput.rating, comment: reviewInput.comment, sellerId: product.sellerId })
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

  if (loading) return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div className="skeleton" style={{ height: '500px', borderRadius: 'var(--radius-md)' }} />
        <div>
          <div className="skeleton" style={{ height: '32px', width: '80%', marginBottom: '16px' }} />
          <div className="skeleton" style={{ height: '24px', width: '30%', marginBottom: '24px' }} />
          <div className="skeleton" style={{ height: '100px', marginBottom: '24px' }} />
          <div className="skeleton" style={{ height: '48px', width: '60%' }} />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
      <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Товар не найден</h2>
      <Link href="/" style={{ color: 'var(--accent)', fontWeight: 600 }}>← Вернуться в каталог</Link>
    </div>
  );

  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px' }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
        <Link href="/" style={{ transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >Главная</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--text-secondary)' }}>{product.title}</span>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', gap: '40px', alignItems: 'start' }}>
        {/* Left — Images */}
        <div style={{ position: 'sticky', top: '120px' }}>
          <div className="card" style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            aspectRatio: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            marginBottom: '12px',
          }}>
            <img
              src={images[selectedImage]}
              alt={product.title}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-sm)',
                    border: idx === selectedImage ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    padding: '4px',
                    background: 'var(--bg-secondary)',
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — Info */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', lineHeight: '1.3', color: 'var(--text-primary)' }}>
            {product.title}
          </h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,2,3,4,5].map(star => (
                <span key={star} style={{
                  fontSize: '16px',
                  color: star <= Math.round(product.averageRating || 0) ? '#fbbf24' : 'var(--border-color)',
                }}>★</span>
              ))}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {product.reviewCount || 0} отзывов
            </span>
          </div>

          {/* Price */}
          <div style={{
            padding: '20px',
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
          }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent)' }}>
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          {/* Stock */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
            padding: '12px 16px',
            background: product.stock > 0 ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${product.stock > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: product.stock > 0 ? 'var(--success)' : 'var(--danger)',
            }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: product.stock > 0 ? 'var(--success)' : 'var(--danger)' }}>
              {product.stock > 0 ? `В наличии · ${product.stock} шт` : 'Нет в наличии'}
            </span>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Описание</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '14px' }}>
              {product.description}
            </p>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            style={{
              width: '100%',
              padding: '16px',
              background: product.stock > 0 ? 'var(--accent)' : 'var(--border-color)',
              color: product.stock > 0 ? 'white' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              fontWeight: 700,
              cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (product.stock > 0) e.currentTarget.style.background = 'var(--accent-hover)'; }}
            onMouseLeave={e => { if (product.stock > 0) e.currentTarget.style.background = 'var(--accent)'; }}
          >
            Добавить в корзину
          </button>

          {/* Reviews */}
          <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
              Отзывы ({reviews.length})
            </h2>

            {/* Review form */}
            {user && (
              <form onSubmit={handleReviewSubmit} className="card" style={{ padding: '20px', marginBottom: '24px', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Оставить отзыв</h3>
                {reviewError && (
                  <div style={{ color: 'var(--danger)', fontSize: '13px', padding: '8px 12px', background: 'rgba(239,68,68,0.06)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                    {reviewError}
                  </div>
                )}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Оценка</label>
                  <select
                    value={reviewInput.rating}
                    onChange={e => setReviewInput({...reviewInput, rating: Number(e.target.value)})}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  >
                    <option value={5}>★★★★★</option>
                    <option value={4}>★★★★☆</option>
                    <option value={3}>★★★☆☆</option>
                    <option value={2}>★★☆☆☆</option>
                    <option value={1}>★☆☆☆☆</option>
                  </select>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Комментарий</label>
                  <textarea
                    required
                    value={reviewInput.comment}
                    onChange={e => setReviewInput({...reviewInput, comment: e.target.value})}
                    placeholder="Поделитесь впечатлениями о товаре..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      minHeight: '80px',
                      resize: 'vertical',
                      fontSize: '13px',
                    }}
                  />
                </div>
                <button type="submit" disabled={submittingReview} style={{
                  padding: '10px 24px',
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: submittingReview ? 'not-allowed' : 'pointer',
                  opacity: submittingReview ? 0.6 : 1,
                }}>
                  {submittingReview ? 'Отправка...' : 'Отправить'}
                </button>
              </form>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Отзывов пока нет. Будьте первым!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviews.map(rev => (
                  <div key={rev.id} className="card" style={{ padding: '16px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{rev.clientName}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        {new Date(rev.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ fontSize: '13px', color: s <= rev.rating ? '#fbbf24' : 'var(--border-color)' }}>★</span>
                      ))}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>{rev.comment}</p>
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
