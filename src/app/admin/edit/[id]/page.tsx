import { fetchAirtableRecords, AIRTABLE_PRODUCTS_TABLE } from '@/lib/airtable';
import ProductEditForm from '@/components/admin/ProductEditForm';
import { notFound } from 'next/navigation';

interface EditProductPageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = params;
  const products = await fetchAirtableRecords(AIRTABLE_PRODUCTS_TABLE);
  const record = products.find((p) => p.id === id);
  if (!record) return notFound();
  const product = { ...record.fields, id: record.id };

  return (
    <div className="max-w-2xl mx-auto p-8 card">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      <ProductEditForm product={product} />
    </div>
  );
} 