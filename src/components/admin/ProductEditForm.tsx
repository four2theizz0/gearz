'use client';
import { useState } from 'react';
import AutocompleteDropdown from '@/components/AutocompleteDropdown';

interface ProductEditFormProps {
  product: any;
}

export default function ProductEditForm({ product }: ProductEditFormProps) {
  const [form, setForm] = useState({
    name: product.name || '',
    description: product.description || '',
    price: product.price || '',
    inventory: product.inventory || '',
    category: product.category || '',
    quality: product.quality || '',
    brand: product.brand || '',
    size: product.size || '',
    weight: product.weight || '',
    color: product.color || '',
    images: [product.image_url, product.image_url_2, product.image_url_3, product.image_url_4],
    newImages: Array<File | null>(4).fill(null) as (File | null)[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImageChange(idx: number, file: File | null) {
    const newImages = [...form.newImages];
    newImages[idx] = file;
    setForm({ ...form, newImages });
  }

  function handleRemoveImage(idx: number) {
    const images = [...form.images];
    images[idx] = null;
    setForm({ ...form, images });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('id', product.id);
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
      // Existing images (keep or remove)
      form.images.forEach((img, idx) => {
        if (img) formData.append(`image_url_${idx}`, img);
      });
      // New images
      form.newImages.forEach((file, idx) => {
        if (file) formData.append(`new_image_${idx}`, file);
      });
      const response = await fetch('/api/admin/update-product', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to update product');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success ? <div className="text-green-400 text-center mb-4">Product updated successfully!</div> : null}
      {error ? <div className="text-red-400 text-center mb-4">{error}</div> : null}
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
        <label className="block text-sm font-medium mb-2">Product Images (up to 4)</label>
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className="flex flex-col items-center">
              {form.images[idx] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <div className="relative">
                  <img
                    src={form.images[idx]}
                    alt={`Product ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded border"
                  />
                  <button type="button" className="absolute top-0 right-0 bg-red-700 text-white rounded-full px-2 py-1 text-xs" onClick={() => handleRemoveImage(idx)}>
                    Remove
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 bg-gray-800 rounded border flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleImageChange(idx, e.target.files?.[0] || null)}
                className="mt-2"
              />
              {form.newImages[idx] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={URL.createObjectURL(form.newImages[idx] as File)}
                  alt={`Preview ${idx + 1}`}
                  className="w-16 h-16 object-cover rounded border mt-2"
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <button type="submit" className="btn-primary w-full" disabled={submitting}>
        {submitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
} 