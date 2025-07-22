import Link from 'next/link';
import ImageCarousel from '@/components/ImageCarousel';
import { fetchAirtableRecords, AIRTABLE_PRODUCTS_TABLE, AIRTABLE_HOLDS_TABLE, AirtableRecord } from '@/lib/airtable';
import { isProductOnHold, getProductImages } from '@/lib/utils';

export default async function Home() {
  let products: AirtableRecord[] = [];
  let holds: AirtableRecord[] = [];
  let error: string | null = null;
  try {
    products = await fetchAirtableRecords(AIRTABLE_PRODUCTS_TABLE);
    holds = await fetchAirtableRecords(AIRTABLE_HOLDS_TABLE);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load products.';
  }


  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
          Premium MMA Gear
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Discover high-quality, pre-owned MMA equipment. From gloves to headgear, 
          find the gear you need to dominate in the ring.
        </p>
      </section>

      {/* Product Grid */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">Available Products</h2>
        {error ? (
          <div className="text-red-400 text-center">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-gray-400 text-center">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((record) => {
              const product = record.fields;
              const images = getProductImages(product);
              const onHold = isProductOnHold(record.id, holds);
              return (
                <div key={record.id} className={`card p-6 transition-transform relative ${onHold ? 'opacity-60 pointer-events-none' : 'hover:scale-105'}`}>
                  <div className="mb-4 relative">
                    <ImageCarousel images={images} alt={product.name || 'Product image'} />
                    {onHold && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                        <span className="text-xl font-bold text-gray-200 bg-red-600 px-4 py-2 rounded shadow">On Hold</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-red-400 font-bold">{product.price}</span>
                    <span className="text-sm text-gray-400">{product.category}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-green-400 bg-green-900 px-2 py-1 rounded">
                      {product.quality}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Brand: {product.brand || '-'}<br />
                    Size: {product.size || '-'}<br />
                    Weight: {product.weight || '-'}<br />
                    Color: {product.color || '-'}
                  </div>
                  {!onHold && (
                    <Link href={`/products/${record.id}`} className="absolute inset-0 z-10" aria-label={`View ${product.name}`}></Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-800 rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">✓</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Quality Assured</h3>
            <p className="text-gray-400">All gear is inspected and rated for quality</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">$</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Best Prices</h3>
            <p className="text-gray-400">Competitive pricing on premium equipment</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">⚡</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast Shipping</h3>
            <p className="text-gray-400">Quick delivery to get you in the ring faster</p>
          </div>
        </div>
      </section>
    </div>
  );
}
