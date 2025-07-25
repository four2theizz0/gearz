/**
 * ProductSkeleton - Loading skeleton for product cards
 * Shows animated placeholders while products are loading from Airtable
 */

export default function ProductSkeleton() {
  return (
    <div className="product-card animate-pulse">
      {/* Image Skeleton */}
      <div className="mb-6">
        <div className="aspect-square bg-gray-700 rounded-xl"></div>
      </div>
      
      {/* Content Skeleton */}
      <div className="space-y-4">
        {/* Title and Category */}
        <div>
          <div className="h-6 bg-gray-700 rounded mb-2"></div>
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gray-700 rounded-full"></div>
            <div className="h-6 w-16 bg-gray-700 rounded-full"></div>
          </div>
        </div>
        
        {/* Price */}
        <div className="flex justify-between items-center">
          <div className="h-8 w-24 bg-gray-700 rounded"></div>
          <div className="h-5 w-16 bg-gray-700 rounded"></div>
        </div>
        
        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
        
        {/* Button */}
        <div className="pt-4">
          <div className="h-12 bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * ProductGridSkeleton - Loading skeleton for the entire product grid
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array.from({ length: count }, (_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * HeroStatsSkeleton - Loading skeleton for hero section stats
 */
export function HeroStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="glass-strong rounded-2xl p-6 text-center animate-pulse">
          <div className="h-8 w-16 bg-gray-700 rounded mb-2 mx-auto"></div>
          <div className="h-5 w-24 bg-gray-700 rounded mx-auto"></div>
        </div>
      ))}
    </div>
  );
}