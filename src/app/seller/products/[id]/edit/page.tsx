'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProductForm, { ProductFormData } from '@/components/seller/ProductForm';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [initialData, setInitialData] = useState<Partial<ProductFormData> | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!user || !id) return;
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product data');
        const data = await res.json();
        setInitialData(data.product);
      } catch (err: any) {
        console.error(err);
        setError('Error loading product details. It may not exist.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchProduct();
  }, [user, id]);

  const handleSubmit = async (data: ProductFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update product');
      }

      router.push('/seller/products');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['seller', 'admin']}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem' }} className="animate-fade-in-up">
        
        <Link href="/seller/products" style={{ color: 'var(--text-secondary)', marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
          <span>&larr;</span> Back to Catalog
        </Link>
        
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px', marginBottom: '0.5rem' }}>
            Edit <span className="gradient-text">Product</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Update your product details and variants.</p>
        </div>

        {error && (
          <div style={{ 
            padding: '1rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            color: '#ef4444', 
            borderRadius: '12px',
            marginBottom: '2rem',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        {isFetching ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading product details...</div>
        ) : initialData ? (
          <ProductForm initialData={initialData} onSubmit={handleSubmit} isLoading={isSubmitting} />
        ) : null}

      </div>
    </ProtectedRoute>
  );
}
