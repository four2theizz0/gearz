import { fetchAirtableRecords, AIRTABLE_PRODUCTS_TABLE, AIRTABLE_HOLDS_TABLE } from '@/lib/airtable';
import ImageCarousel from '@/components/ImageCarousel';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { isProductOnHold, getProductImages } from '@/lib/utils';
import ProductDetailClient from './ProductDetailClient';

interface ProductDetailPageProps {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = params;
  const records = await fetchAirtableRecords(AIRTABLE_PRODUCTS_TABLE);
  const holds = await fetchAirtableRecords(AIRTABLE_HOLDS_TABLE);
  const record = records.find((r) => r.id === id);
  if (!record) return notFound();
  const product = record.fields;
  const images = getProductImages(product);
  const onHold = isProductOnHold(record.id, holds);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 mb-6 text-red-400 hover:text-red-300 font-medium transition-colors"
        >
          <span>←</span> Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-6">
            <div className="glass-strong rounded-2xl p-6">
              <div className="aspect-square overflow-hidden rounded-xl relative">
                <ImageCarousel images={images} alt={product.name || 'Product image'} />
                {onHold && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl backdrop-blur-sm">
                    <div className="glass-strong px-6 py-3 rounded-lg">
                      <span className="text-xl font-bold text-red-400">🔒 On Hold</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Title and Tags */}
            <div className="glass-strong rounded-2xl p-6">
              <h1 className="text-3xl font-bold mb-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm px-4 py-2 bg-gray-700 rounded-full text-gray-300">
                  {product.category}
                </span>
                <span className="text-sm px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 rounded-full text-white font-medium">
                  {product.quality}
                </span>
              </div>
              
              <div className="text-3xl font-bold text-red-400 mb-4">
                ${product.price}
              </div>
              
              {product.description && (
                <p className="text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Product Details */}
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-200">Product Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400 block mb-1">Brand</span>
                    <span className="text-white font-medium">{product.brand || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Size</span>
                    <span className="text-white font-medium">{product.size || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Weight</span>
                    <span className="text-white font-medium">{product.weight || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400 block mb-1">Color</span>
                    <span className="text-white font-medium">{product.color || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Condition</span>
                    <span className="text-white font-medium">{product.quality || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Available</span>
                    <span className="text-green-400 font-medium flex items-center gap-1">
                      ✓ In Stock
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="glass-strong rounded-2xl p-6">
              <ProductDetailClient
                productId={id}
                productName={product.name}
                productPrice={parseFloat(product.price?.toString() || '0')}
                onHold={onHold}
              />
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-sm text-gray-400 text-center">
                  <span>📍</span> Local pickup only • <span>💬</span> Contact us with questions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 