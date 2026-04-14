'use client';

import React, { useState } from 'react';
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/contexts/AuthContext';

export interface ProductFormData {
  title: string;
  description: string;
  price: string | number;
  stock: string | number;
  categoryId: string;
  images: string[];
  attributes: {
    colors: string[];
    sizes: string[];
    [key: string]: any;
  };
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading: boolean;
}

export default function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<ProductFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    stock: initialData?.stock || '',
    categoryId: initialData?.categoryId || '',
    images: initialData?.images || [],
    attributes: {
      colors: initialData?.attributes?.colors || [],
      sizes: initialData?.attributes?.sizes || [],
      ...initialData?.attributes
    }
  });

  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addColor = () => {
    if (colorInput.trim() && !formData.attributes.colors.includes(colorInput.trim())) {
      setFormData(prev => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          colors: [...prev.attributes.colors, colorInput.trim()]
        }
      }));
      setColorInput('');
    }
  };

  const removeColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        colors: prev.attributes.colors.filter(c => c !== color)
      }
    }));
  };

  const addSize = () => {
    if (sizeInput.trim() && !formData.attributes.sizes.includes(sizeInput.trim())) {
      setFormData(prev => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          sizes: [...prev.attributes.sizes, sizeInput.trim()]
        }
      }));
      setSizeInput('');
    }
  };

  const removeSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        sizes: prev.attributes.sizes.filter(s => s !== size)
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !user) return;
    
    setUploadError(null);
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      // Create a unique file name
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `products/${user.uid}/${fileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => ({ ...prev, [fileName]: progress }));
        },
        (error) => {
          console.error("Upload error:", error);
          setUploadError(`Failed to upload ${file.name}`);
          setUploadProgress(prev => {
            const newProg = { ...prev };
            delete newProg[fileName];
            return newProg;
          });
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, downloadURL]
          }));
          setUploadProgress(prev => {
            const newProg = { ...prev };
            delete newProg[fileName];
            return newProg;
          });
        }
      );
    });
    
    // Clear input
    e.target.value = '';
  };

  const removeImage = (urlToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(url => url !== urlToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Helper styles for inputs
  const inputStyle = {
    width: '100%',
    padding: '0.85rem 1rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    background: 'rgba(255,255,255,0.02)',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    fontSize: '1rem',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '0.5rem'
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Basic Info */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Basic Information</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Product Title</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              style={inputStyle} 
              placeholder="e.g. Premium Cotton T-Shirt"
              required 
            />
          </div>

          <div>
            <label style={labelStyle}>Price ($)</label>
            <input 
              type="number" 
              name="price" 
              value={formData.price} 
              onChange={handleChange} 
              style={inputStyle} 
              placeholder="0.00"
              step="0.01"
              min="0"
              required 
            />
          </div>

          <div>
            <label style={labelStyle}>Stock Quantity</label>
            <input 
              type="number" 
              name="stock" 
              value={formData.stock} 
              onChange={handleChange} 
              style={inputStyle} 
              placeholder="100"
              min="0"
              required 
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }} 
              placeholder="Describe your product..."
              required 
            />
          </div>
        </div>
      </div>

      {/* Attributes */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Variants & Attributes</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Colors */}
          <div>
            <label style={labelStyle}>Colors</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                type="text" 
                value={colorInput} 
                onChange={(e) => setColorInput(e.target.value)} 
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } }}
                style={inputStyle} 
                placeholder="e.g. Red, #FF0000"
              />
              <button 
                type="button" 
                onClick={addColor}
                style={{ padding: '0 1.5rem', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }}
              >
                Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {formData.attributes.colors.map(color => (
                <div key={color} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: 'var(--accent-color)', color: 'white', borderRadius: '99px', fontSize: '0.85rem', fontWeight: '600' }}>
                   {/* If it's a hex we could show a swatch, but let's just display text for now */}
                  {color}
                  <button type="button" onClick={() => removeColor(color)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label style={labelStyle}>Sizes</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                type="text" 
                value={sizeInput} 
                onChange={(e) => setSizeInput(e.target.value)} 
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSize(); } }}
                style={inputStyle} 
                placeholder="e.g. S, M, L, XL"
              />
              <button 
                type="button" 
                onClick={addSize}
                style={{ padding: '0 1.5rem', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }}
              >
                Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {formData.attributes.sizes.map(size => (
                <div key={size} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
                  {size}
                  <button type="button" onClick={() => removeSize(size)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Product Images</h2>
        
        {uploadError && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{uploadError}</div>}

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'inline-block',
            padding: '0.8rem 1.5rem',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            color: 'var(--text-primary)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
          >
            &#8682; Upload Images
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageUpload} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>

        {/* Upload Progressing */}
        {Object.keys(uploadProgress).length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Uploading...</p>
            {Object.entries(uploadProgress).map(([name, prog]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ flex: 1, height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${prog}%`, background: 'var(--accent-color)', transition: 'width 0.2s' }} />
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', width: '40px' }}>{Math.round(prog)}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Image Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
          {formData.images.map((url, i) => (
            <div key={i} style={{ aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <img src={url} alt={`Product image ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => removeImage(url)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)'
                }}
              >
                ✕
              </button>
            </div>
          ))}
          {formData.images.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
              No images uploaded yet. Upload product photos to make it stand out.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
        <button 
          type="button" 
          onClick={() => window.history.back()}
          style={{ padding: '1rem 2rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isLoading || Object.keys(uploadProgress).length > 0}
          style={{ padding: '1rem 2.5rem', background: 'var(--accent-gradient)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: 'var(--glow-primary)', opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? 'Saving...' : 'Save Product'}
        </button>
      </div>

    </form>
  );
}
