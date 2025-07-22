import { fetchAirtableRecords, AIRTABLE_PRODUCTS_TABLE, AIRTABLE_HOLDS_TABLE } from '@/lib/airtable';
import ImageCarousel from '@/components/ImageCarousel';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { isProductOnHold, getProductImages } from '@/lib/utils';

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
    <div className={`max-w-2xl mx-auto p-6 card mt-8 flex flex-col min-h-[80vh] ${onHold ? 'opacity-60' : ''}`}>
      {/* Back Button */}
      <Link href="/" className="mb-4 inline-block text-sm text-red-400 hover:text-red-300 font-medium">
        &larr; Back to Products
      </Link>
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <div className="mb-6 relative">
        <ImageCarousel images={images} alt={product.name || 'Product image'} />
        {onHold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
            <span className="text-xl font-bold text-gray-200 bg-red-600 px-4 py-2 rounded shadow">On Hold</span>
          </div>
        )}
      </div>
      <div className="mb-4 text-lg text-red-400 font-bold">${product.price}</div>
      <div className="mb-4 text-gray-300">{product.description}</div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="font-semibold">Category:</span> {product.category || '-'}
        </div>
        <div>
          <span className="font-semibold">Quality:</span> {product.quality || '-'}
        </div>
        <div>
          <span className="font-semibold">Brand:</span> {product.brand || '-'}
        </div>
        <div>
          <span className="font-semibold">Size:</span> {product.size || '-'}
        </div>
        <div>
          <span className="font-semibold">Weight:</span> {product.weight || '-'}
        </div>
        <div>
          <span className="font-semibold">Color:</span> {product.color || '-'}
        </div>
        <div>
          <span className="font-semibold">Inventory:</span> {product.inventory || '-'}
        </div>
      </div>
      {!onHold && (
        <div className="mt-auto pt-6">
          <Link href={`/purchase/${id}`} className="btn-primary w-full block text-center">
            Buy Now
          </Link>
        </div>
      )}
    </div>
  );
} 