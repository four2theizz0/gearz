'use client';
import { useState, useMemo } from 'react';
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

type FilterType = 'All' | 'Active' | 'On Hold' | 'Sold';
type SortField = 'name' | 'category' | 'price' | 'inventory' | 'status';
type SortOrder = 'asc' | 'desc';

export default function ProductTable({ products, holds }: { products: any[]; holds: any[] }) {
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [soldIds, setSoldIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.fields.category).filter(Boolean))];
    return ['All', ...uniqueCategories.sort()];
  }, [products]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortValue = (product: any, field: SortField) => {
    const f = product.fields;
    const status = getProductStatus({ ...f, id: product.id }, holds);
    const isSold = soldIds.includes(product.id) || f.inventory === 0;
    
    switch (field) {
      case 'name':
        return f.name?.toLowerCase() || '';
      case 'category':
        return f.category?.toLowerCase() || '';
      case 'price':
        return parseFloat(f.price) || 0;
      case 'inventory':
        return isSold ? 0 : (parseInt(f.inventory) || 0);
      case 'status':
        return isSold ? 'Sold' : status;
      default:
        return '';
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter(p => !deletedIds.includes(p.id))
      .filter(product => {
        const f = product.fields;
        const status = getProductStatus({ ...f, id: product.id }, holds);
        const isSold = soldIds.includes(product.id) || f.inventory === 0;
        const actualStatus = isSold ? 'Sold' : status;

        // Search filter (name, description, category, brand)
        const matchesSearch = searchTerm === '' || 
          [f.name, f.description, f.category, f.brand, f.color, f.size]
            .some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()));

        // Status filter
        const matchesStatus = statusFilter === 'All' || actualStatus === statusFilter;

        // Category filter
        const matchesCategory = categoryFilter === 'All' || f.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        const aValue = getSortValue(a, sortField);
        const bValue = getSortValue(b, sortField);
        
        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [products, deletedIds, soldIds, searchTerm, statusFilter, categoryFilter, holds, sortField, sortOrder]);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const res = await fetch(`/api/admin/delete-product?id=${id}`, { method: 'DELETE' });
    if (res.ok) setDeletedIds(ids => [...ids, id]);
    else alert('Failed to delete product.');
  }

  async function handleMarkAsSold(id: string) {
    if (!confirm('Mark this product as sold (set inventory to 0)?')) return;
    const res = await fetch('/api/admin/mark-sold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) setSoldIds(ids => [...ids, id]);
    else alert('Failed to mark product as sold.');
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search products (name, description, category, brand, color, size)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filter Buttons and Dropdowns */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <span className="text-sm text-gray-400 self-center">Status:</span>
            {(['All', 'Active', 'On Hold', 'Sold'] as FilterType[]).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white focus:ring-2 focus:ring-red-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-gray-400">
            Showing {filteredAndSortedProducts.length} of {products.filter(p => !deletedIds.includes(p.id)).length} products
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-700 rounded-lg">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-3 py-2 text-left">Image</th>
            <th 
              className="px-3 py-2 text-left cursor-pointer hover:bg-gray-700 transition-colors select-none"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-1">
                Name
                <div className="flex flex-col">
                  <svg className={`w-3 h-3 ${sortField === 'name' && sortOrder === 'asc' ? 'text-red-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  <svg className={`w-3 h-3 -mt-1 ${sortField === 'name' && sortOrder === 'desc' ? 'text-red-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </th>
            <th 
              className="px-3 py-2 text-left cursor-pointer hover:bg-gray-700 transition-colors select-none"
              onClick={() => handleSort('category')}
            >
              <div className="flex items-center gap-1">
                Category
                <div className="flex flex-col">
                  <svg className={`w-3 h-3 ${sortField === 'category' && sortOrder === 'asc' ? 'text-red-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  <svg className={`w-3 h-3 -mt-1 ${sortField === 'category' && sortOrder === 'desc' ? 'text-red-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </th>
            <th 
              className="px-3 py-2 text-left cursor-pointer hover:bg-gray-700 transition-colors select-none"
              onClick={() => handleSort('price')}
            >
              <div className="flex items-center gap-1">
                Price
                <div className="flex flex-col">
                  <svg className={`w-3 h-3 ${sortField === 'price' && sortOrder === 'asc' ? 'text-red-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  <svg className={`w-3 h-3 -mt-1 ${sortField === 'price' && sortOrder === 'desc' ? 'text-red-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </th>
            <th 
              className="px-3 py-2 text-left cursor-pointer hover:bg-gray-700 transition-colors select-none"
              onClick={() => handleSort('inventory')}
            >
              <div className="flex items-center gap-1">
                Inventory
                <div className="flex flex-col">
                  <svg className={`w-3 h-3 ${sortField === 'inventory' && sortOrder === 'asc' ? 'text-red-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  <svg className={`w-3 h-3 -mt-1 ${sortField === 'inventory' && sortOrder === 'desc' ? 'text-red-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </th>
            <th 
              className="px-3 py-2 text-left cursor-pointer hover:bg-gray-700 transition-colors select-none"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center gap-1">
                Status
                <div className="flex flex-col">
                  <svg className={`w-3 h-3 ${sortField === 'status' && sortOrder === 'asc' ? 'text-red-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  <svg className={`w-3 h-3 -mt-1 ${sortField === 'status' && sortOrder === 'desc' ? 'text-red-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </th>
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedProducts.map(product => {
            const f = product.fields;
            const status = getProductStatus({ ...f, id: product.id }, holds);
            const imageUrl = f.image_url || f.image_url_2 || f.image_url_3 || f.image_url_4 || '';
            const isSold = soldIds.includes(product.id) || f.inventory === 0;
            
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
                <td className="px-3 py-2">{isSold ? 0 : f.inventory}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${isSold ? 'bg-gray-700 text-gray-300' : status === 'Active' ? 'bg-green-800 text-green-300' : status === 'On Hold' ? 'bg-yellow-800 text-yellow-200' : 'bg-gray-700 text-gray-300'}`}>
                    {isSold ? 'Sold' : status}
                  </span>
                </td>
                <td className="px-3 py-2 flex gap-1 flex-wrap">
                  <Link href={`/products/${product.id}`} className="btn-secondary px-2 py-1 text-xs">View</Link>
                  <Link href={`/admin/edit/${product.id}`} className="btn-secondary px-2 py-1 text-xs">Edit</Link>
                  {!isSold && (
                    <button 
                      className="btn-secondary px-2 py-1 text-xs bg-blue-700 hover:bg-blue-800 text-white" 
                      onClick={() => handleMarkAsSold(product.id)}
                    >
                      Mark Sold
                    </button>
                  )}
                  <button 
                    className="btn-secondary px-2 py-1 text-xs bg-red-700 hover:bg-red-800 text-white" 
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}