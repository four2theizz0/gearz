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
      <section className="text-center py-8 sm:py-16" aria-labelledby="hero-title">
        <h1 
          id="hero-title" 
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent px-4"
        >
          Premium MMA Gear
        </h1>
        <p 
          className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4"
          role="text"
        >
          Discover high-quality, pre-owned MMA equipment. From gloves to headgear, 
          find the gear you need to dominate in the ring.
        </p>
      </section>

      {/* Product Grid */}
      <section className="px-4" aria-labelledby="products-title">
        <h2 id="products-title" className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Available Products</h2>
        {error ? (
          <div className="text-red-400 text-center" role="alert" aria-live="polite">
            <strong>Error loading products:</strong> {error}
          </div>
        ) : products.length === 0 ? (
          <div className="text-gray-400 text-center" role="status" aria-live="polite">
            No products found at this time. Please check back later.
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            role="grid"
            aria-label={`${products.length} products available`}
          >
            {products.map((record) => {
              const product = record.fields;
              const images = getProductImages(product);
              const onHold = isProductOnHold(record.id, holds);
              return (
                <article 
                  key={record.id} 
                  className={`card p-6 transition-transform relative ${onHold ? 'opacity-60' : 'hover:scale-105'}`}
                  role="gridcell"
                  aria-labelledby={`product-title-${record.id}`}
                  aria-describedby={`product-details-${record.id}`}
                >
                  <div className="mb-4 relative">
                    <ImageCarousel images={images} alt={product.name || 'Product image'} />
                    {onHold && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg"
                        role="status"
                        aria-label="This product is currently on hold"
                      >
                        <span className="text-sm sm:text-xl font-bold text-gray-200 bg-red-600 px-2 sm:px-4 py-1 sm:py-2 rounded shadow">
                          On Hold
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 id={`product-title-${record.id}`} className="text-lg font-semibold mb-2">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-red-400 font-bold" aria-label={`Price: ${product.price}`}>
                      {product.price}
                    </span>
                    <span className="text-sm text-gray-400" aria-label={`Category: ${product.category}`}>
                      {product.category}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span 
                      className="text-sm text-green-400 bg-green-900 px-2 py-1 rounded"
                      aria-label={`Quality rating: ${product.quality}`}
                    >
                      {product.quality}
                    </span>
                  </div>
                  <div id={`product-details-${record.id}`} className="text-xs text-gray-400">
                    <div><span className="sr-only">Product details: </span></div>
                    <div>Brand: {product.brand || 'Not specified'}</div>
                    <div>Size: {product.size || 'Not specified'}</div>
                    <div>Weight: {product.weight || 'Not specified'}</div>
                    <div>Color: {product.color || 'Not specified'}</div>
                  </div>
                  {!onHold && (
                    <Link 
                      href={`/products/${record.id}`} 
                      className="absolute inset-0 z-10" 
                      aria-label={`View details for ${product.name} - ${product.price}`}
                    >
                      <span className="sr-only">View product details</span>
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-800 rounded-lg p-4 sm:p-8 mx-4" aria-labelledby="why-choose-us">
        <h2 id="why-choose-us" className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8" role="list">
          <div className="text-center" role="listitem">
            <div 
              className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
              aria-hidden="true"
            >
              <span className="text-white font-bold text-sm sm:text-base">✓</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">Quality Assured</h3>
            <p className="text-gray-400 text-sm sm:text-base">All gear is inspected and rated for quality</p>
          </div>
          <div className="text-center" role="listitem">
            <div 
              className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
              aria-hidden="true"
            >
              <span className="text-white font-bold text-sm sm:text-base">$</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">Best Prices</h3>
            <p className="text-gray-400 text-sm sm:text-base">Competitive pricing on premium equipment</p>
          </div>
          <div className="text-center" role="listitem">
            <div 
              className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
              aria-hidden="true"
            >
              <span className="text-white font-bold text-sm sm:text-base">⚡</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">Fast Shipping</h3>
            <p className="text-gray-400 text-sm sm:text-base">Quick delivery to get you in the ring faster</p>
          </div>
        </div>
      </section>
    </div>
  );
}
