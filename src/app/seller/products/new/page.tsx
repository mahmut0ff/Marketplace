'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProductForm, { ProductFormData } from '@/components/seller/ProductForm';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function CreateProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ProductFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create product');
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
            Add New <span className="gradient-text">Product</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Create a new listing in your catalog.</p>
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

        <ProductForm onSubmit={handleSubmit} isLoading={isSubmitting} />

      </div>
    </ProtectedRoute>
  );
}
