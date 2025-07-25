import { redirect } from 'next/navigation';
import { fetchAirtableRecords, AIRTABLE_PRODUCTS_TABLE, AIRTABLE_HOLDS_TABLE } from '@/lib/airtable';
import { isAuthenticated } from '@/lib/auth';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  // Check authentication
  if (!isAuthenticated()) {
    redirect('/admin/login');
  }

  // Fetch products and holds
  const products = await fetchAirtableRecords(AIRTABLE_PRODUCTS_TABLE);
  const holds = await fetchAirtableRecords(AIRTABLE_HOLDS_TABLE);
  const productMap = Object.fromEntries(products.map(p => [p.id, p.fields]));

  return (
    <AdminDashboard 
      initialProducts={products}
      initialHolds={holds}
      productMap={productMap}
    />
  );
} 