'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AutocompleteDropdown from '@/components/AutocompleteDropdown';

export default function CreateProductPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    inventory: '',
    category: '',
    quality: '',
    brand: '',
    size: '',
    weight: '',
    color: '',
    images: Array<File | null>(4).fill(null) as (File | null)[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin/login');
      }
    }
    
    checkAuth();
  }, [router]);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImageChange(idx: number, file: File | null) {
    const images = [...form.images];
    images[idx] = file;
    setForm({ ...form, images });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('inventory', form.inventory);
      formData.append('category', form.category);
      formData.append('quality', form.quality);
      if (form.brand) formData.append('brand', form.brand);
      if (form.size) formData.append('size', form.size);
      if (form.weight) formData.append('weight', form.weight);
      if (form.color) formData.append('color', form.color);

      // Add images
      form.images.forEach((image, idx) => {
        if (image) {
          formData.append(`image_${idx}`, image);
        }
      });

      // Submit to API
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create product');
      }

      setSuccess(true);
      // Reset form
      setForm({
        name: '',
        description: '',
        price: '',
        inventory: '',
        category: '',
        quality: '',
        brand: '',
        size: '',
        weight: '',
        color: '',
        images: Array<File | null>(4).fill(null) as (File | null)[],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8 card">
      <h1 className="text-3xl font-bold mb-6">Create New Product</h1>
      {success ? (
        <div className="text-green-400 text-center mb-4">Product created successfully!</div>
      ) : null}
      {error ? (
        <div className="text-red-400 text-center mb-4">{error}</div>
      ) : null}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="input-field w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} required className="input-field w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Price</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} required className="input-field w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Inventory</label>
            <input name="inventory" type="number" value={form.inventory} onChange={handleChange} required className="input-field w-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <AutocompleteDropdown
              name="category"
              value={form.category}
              onChange={(value) => setForm({ ...form, category: value })}
              field="category"
              placeholder="Select or enter category..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Quality</label>
            <AutocompleteDropdown
              name="quality"
              value={form.quality}
              onChange={(value) => setForm({ ...form, quality: value })}
              field="quality"
              placeholder="Select or enter quality..."
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Brand</label>
            <AutocompleteDropdown
              name="brand"
              value={form.brand}
              onChange={(value) => setForm({ ...form, brand: value })}
              field="brand"
              placeholder="Select or enter brand..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Size</label>
            <AutocompleteDropdown
              name="size"
              value={form.size}
              onChange={(value) => setForm({ ...form, size: value })}
              field="size"
              placeholder="Select or enter size..."
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Weight</label>
            <AutocompleteDropdown
              name="weight"
              value={form.weight}
              onChange={(value) => setForm({ ...form, weight: value })}
              field="weight"
              placeholder="Select or enter weight..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <AutocompleteDropdown
              name="color"
              value={form.color}
              onChange={(value) => setForm({ ...form, color: value })} 
              field="color"
              placeholder="Select or enter color..."
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Product Images (up to 4, 1200x1200px recommended)</label>
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="flex flex-col items-center">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleImageChange(idx, e.target.files?.[0] || null)}
                  className="mb-2"
                />
                {form.images[idx] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={URL.createObjectURL(form.images[idx] as File)}
                    alt={`Preview ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded border"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-800 rounded border flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
} 