import { fetchAirtableRecords, AIRTABLE_PRODUCTS_TABLE } from '@/lib/airtable';
import ImageCarousel from '@/components/ImageCarousel';
import Link from 'next/link';
import PurchaseForm from '@/components/PurchaseForm';

interface PurchasePageProps {
  params: { id: string };
}

export default async function PurchasePage({ params }: PurchasePageProps) {
  const { id } = params;
  const records = await fetchAirtableRecords(AIRTABLE_PRODUCTS_TABLE);
  const record = records.find((r) => r.id === id);
  if (!record) return <div className="text-center text-red-400 mt-12">Product not found.</div>;
  const product = record.fields;
  const images = [
    product.image_url,
    product.image_url_2,
    product.image_url_3,
    product.image_url_4,
  ].filter(Boolean);

  return (
    <div className="max-w-2xl mx-auto p-6 card mt-8 flex flex-col min-h-[80vh]">
      {/* Back Button */}
      <Link href={`/products/${id}`} className="mb-4 inline-block text-sm text-red-400 hover:text-red-300 font-medium">
        &larr; Back to Product
      </Link>
      <h1 className="text-2xl font-bold mb-2">Buy Now: {product.name}</h1>
      <div className="mb-4">
        <ImageCarousel images={images} alt={product.name || 'Product image'} />
      </div>
      <div className="mb-4 text-lg text-red-400 font-bold">${product.price}</div>
      <PurchaseForm productId={id} productName={product.name} productPrice={product.price} />
    </div>
  );
} 