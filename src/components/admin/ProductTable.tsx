'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function getProductStatus(product: any, holds: any[]): 'Active' | 'On Hold' | 'Sold' {
  if (product.status && product.status === 'Sold') return 'Sold';
  const now = new Date();
  const onHold = holds.some(hold => {
    const f = hold.fields;
    return (
      Array.isArray(f.Products) && f.Products.includes(product.id) &&
      f.hold_status === 'Active' &&
      (!f.hold_expires_at || new Date(f.hold_expires_at) > now)
    );
  });
  if (onHold) return 'On Hold';
  return 'Active';
}

export default function ProductTable({ products, holds }: { products: any[]; holds: any[] }) {
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const filteredProducts = products.filter(p => !deletedIds.includes(p.id));

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const res = await fetch(`/api/admin/delete-product?id=${id}`, { method: 'DELETE' });
    if (res.ok) setDeletedIds(ids => [...ids, id]);
    else alert('Failed to delete product.');
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border border-gray-700 rounded-lg">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-3 py-2 text-left">Image</th>
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Category</th>
            <th className="px-3 py-2 text-left">Price</th>
            <th className="px-3 py-2 text-left">Inventory</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map(product => {
            const f = product.fields;
            const status = getProductStatus({ ...f, id: product.id }, holds);
            const imageUrl = f.image_url || f.image_url_2 || f.image_url_3 || f.image_url_4 || '';
            return (
              <tr key={product.id} className="border-t border-gray-700">
                <td className="px-3 py-2">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={f.name || 'Product'} width={60} height={60} className="object-cover rounded" unoptimized />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </td>
                <td className="px-3 py-2 font-semibold">{f.name}</td>
                <td className="px-3 py-2">{f.category}</td>
                <td className="px-3 py-2">${f.price}</td>
                <td className="px-3 py-2">{f.inventory}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${status === 'Active' ? 'bg-green-800 text-green-300' : status === 'On Hold' ? 'bg-yellow-800 text-yellow-200' : 'bg-gray-700 text-gray-300'}`}>{status}</span>
                </td>
                <td className="px-3 py-2 flex gap-2">
                  <Link href={`/products/${product.id}`} className="btn-secondary px-2 py-1 text-xs">View</Link>
                  <Link href={`/admin/edit/${product.id}`} className="btn-secondary px-2 py-1 text-xs">Edit</Link>
                  <button className="btn-secondary px-2 py-1 text-xs bg-red-700 hover:bg-red-800 text-white" onClick={() => handleDelete(product.id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}