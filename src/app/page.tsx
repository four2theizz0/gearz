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
    <div className="space-y-16">
      {/* Enhanced Hero Section */}
      <section className="hero-section text-center py-16 sm:py-24 px-4" aria-labelledby="hero-title">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 id="hero-title" className="mb-6">
              Premium MMA Gear
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover high-quality, pre-owned MMA equipment. From gloves to headgear, 
              find the gear you need to <span className="text-red-400 font-semibold">dominate in the ring</span>.
            </p>
          </div>
          
          {/* Hero Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
            <div className="glass-strong rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">{products.length}+</div>
              <div className="text-gray-300 font-medium">Products Available</div>
            </div>
            <div className="glass-strong rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
              <div className="text-gray-300 font-medium">Quality Assured</div>
            </div>
            <div className="glass-strong rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">Local</div>
              <div className="text-gray-300 font-medium">Pickup Only</div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="flex justify-center">
            <a href="#products" className="btn-primary text-lg px-8 py-4 inline-block">
              Shop Now
            </a>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section id="products" className="px-4 max-w-7xl mx-auto" aria-labelledby="products-title">
        <div className="text-center mb-12">
          <h2 id="products-title" className="mb-4">Available Products</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Hand-picked, quality-tested MMA gear from trusted brands
          </p>
        </div>
        
        {error ? (
          <div className="glass-strong rounded-2xl p-8 text-center max-w-md mx-auto" role="alert" aria-live="polite">
            <div className="text-red-400 text-lg font-semibold mb-2">⚠️ Error Loading Products</div>
            <p className="text-gray-300">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="glass-strong rounded-2xl p-8 text-center max-w-md mx-auto" role="status" aria-live="polite">
            <div className="text-gray-400 text-lg font-semibold mb-2">📦 No Products Available</div>
            <p className="text-gray-300">Check back soon for new inventory!</p>
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
                  className={`product-card group relative ${onHold ? 'opacity-60 cursor-not-allowed' : ''}`}
                  role="gridcell"
                  aria-labelledby={`product-title-${record.id}`}
                  aria-describedby={`product-details-${record.id}`}
                  data-testid="product-card"
                >
                  {/* Product Image */}
                  <div className="product-image mb-6 relative">
                    <div className="aspect-square overflow-hidden rounded-xl">
                      <ImageCarousel images={images} alt={product.name || 'Product image'} />
                    </div>
                    {onHold && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl backdrop-blur-sm"
                        role="status"
                        aria-label="This product is currently on hold"
                      >
                        <div className="glass-strong px-4 py-2 rounded-lg">
                          <span className="text-lg font-bold text-red-400">🔒 On Hold</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="space-y-4 flex-grow">
                    <div>
                      <h3 id={`product-title-${record.id}`} className="product-title text-xl font-bold mb-2 group-hover:text-red-400 transition-colors" data-testid="product-name">
                        {product.name}
                      </h3>
                      <div className="product-tags flex items-center gap-2 flex-wrap">
                        <span className="text-sm px-3 py-1 bg-gray-700 rounded-full text-gray-300" aria-label={`Category: ${product.category}`}>
                          {product.category}
                        </span>
                        <span 
                          className="text-sm px-3 py-1 bg-gradient-to-r from-green-600 to-green-700 rounded-full text-white font-medium"
                          aria-label={`Quality rating: ${product.quality}`}
                        >
                          {product.quality}
                        </span>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-red-400" aria-label={`Price: $${product.price}`} data-testid="product-price">
                        ${product.price}
                      </span>
                      {!onHold && (
                        <div className="text-green-400 text-sm font-medium">
                          ✓ Available
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div id={`product-details-${record.id}`} className="product-details grid-cols-2 gap-2 text-sm text-gray-400 pt-3 border-t border-gray-700">
                      <div><strong>Brand:</strong> {product.brand || 'N/A'}</div>
                      <div><strong>Size:</strong> {product.size || 'N/A'}</div>
                      <div><strong>Color:</strong> {product.color || 'N/A'}</div>
                      <div><strong>Weight:</strong> {product.weight || 'N/A'}</div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="pt-4 mt-auto">
                      {!onHold ? (
                        <Link 
                          href={`/products/${record.id}`} 
                          className="btn-primary w-full text-center block"
                          aria-label={`View details for ${product.name} - $${product.price}`}
                          data-testid="purchase-button"
                        >
                          View Details
                        </Link>
                      ) : (
                        <div className="btn-secondary w-full text-center block opacity-50 cursor-not-allowed">
                          Currently On Hold
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="px-4 max-w-6xl mx-auto" aria-labelledby="why-choose-us">
        <div className="text-center mb-12">
          <h2 id="why-choose-us" className="mb-4">Why Choose Our Gear</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            We're committed to providing fighters with the best equipment at unbeatable value
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list">
          <div className="feature-card text-center group" role="listitem">
            <div className="feature-icon" aria-hidden="true">
              <span className="text-white font-bold text-xl">🥊</span>
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-red-400 transition-colors">Quality Assured</h3>
            <p className="text-gray-400 leading-relaxed">
              Every piece of gear is thoroughly inspected, tested, and rated for quality. 
              We guarantee authentic, premium equipment that performs when you need it most.
            </p>
          </div>
          
          <div className="feature-card text-center group" role="listitem">
            <div className="feature-icon" aria-hidden="true">
              <span className="text-white font-bold text-xl">💰</span>
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-red-400 transition-colors">Unbeatable Prices</h3>
            <p className="text-gray-400 leading-relaxed">
              Get premium MMA gear at a fraction of retail cost. Our pre-owned equipment 
              offers exceptional value without compromising on quality or performance.
            </p>
          </div>
          
          <div className="feature-card text-center group" role="listitem">
            <div className="feature-icon" aria-hidden="true">
              <span className="text-white font-bold text-xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-red-400 transition-colors">Lightning Fast</h3>
            <p className="text-gray-400 leading-relaxed">
              Quick processing and fast shipping get you back in the ring faster. 
              Most orders are processed within 24 hours for rapid delivery.
            </p>
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="glass rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
              <div>
                <div className="text-2xl font-bold text-green-400 mb-1">5.0★</div>
                <div className="text-gray-400 text-sm">Customer Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400 mb-1">1000+</div>
                <div className="text-gray-400 text-sm">Happy Customers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400 mb-1">48hr</div>
                <div className="text-gray-400 text-sm">Hold Guarantee</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400 mb-1">100%</div>
                <div className="text-gray-400 text-sm">Authentic Gear</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
