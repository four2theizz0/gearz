import { fetchAirtableRecords, AIRTABLE_PRODUCTS_TABLE, AIRTABLE_HOLDS_TABLE } from '@/lib/airtable';
import ProductTable from '@/components/admin/ProductTable';

function formatPickupDay(pickupDay: string, pickupCustom: string) {
  if (pickupDay && !isNaN(Date.parse(pickupDay))) {
    return new Date(pickupDay).toLocaleString();
  }
  if (pickupCustom) return pickupCustom;
  return pickupDay || '-';
}

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


export default async function AdminPage() {
  // Fetch products and holds
  const products = await fetchAirtableRecords(AIRTABLE_PRODUCTS_TABLE);
  const holds = await fetchAirtableRecords(AIRTABLE_HOLDS_TABLE);
  const productMap = Object.fromEntries(products.map(p => [p.id, p.fields]));
  const activeHolds = holds.filter(h => h.fields.hold_status === 'Active');

  // Filter state (default: Active)
  const filter = 'Active' as const; // For now, static. Can be made dynamic with client component.
  const filteredProducts = products.filter(p => {
    const status = getProductStatus({ ...p.fields, id: p.id }, holds);
    return status === filter; // Only show Active products for now
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-gray-400">Manage your MMA gear inventory and orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white font-bold">📦</span>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Products</p>
              <p className="text-2xl font-bold">24</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white font-bold">💰</span>
            </div>
            <div>
              <p className="text-sm text-gray-400">Revenue</p>
              <p className="text-2xl font-bold">$1,250</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white font-bold">📊</span>
            </div>
            <div>
              <p className="text-sm text-gray-400">Orders</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white font-bold">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-400">Customers</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="btn-primary w-full">Add New Product</button>
            <button className="btn-secondary w-full">View Orders</button>
            <button className="btn-secondary w-full">Manage Inventory</button>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>New order received</span>
              <span className="text-gray-400">2 min ago</span>
            </div>
            <div className="flex justify-between">
              <span>Product updated</span>
              <span className="text-gray-400">1 hour ago</span>
            </div>
            <div className="flex justify-between">
              <span>New customer registered</span>
              <span className="text-gray-400">3 hours ago</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-900 border border-yellow-700 rounded-lg">
        <p className="text-yellow-200">
          <strong>Note:</strong> Authentication will be required to access this page in production.
        </p>
      </div>

      {/* Product Inventory Table */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Product Inventory</h2>
        {/* Filter Buttons */}
        <div className="mb-4 flex gap-2">
          <button className={`btn-secondary ${filter === 'Active' ? 'bg-red-600 text-white' : ''}`}>Active</button>
          <button className={`btn-secondary ${false ? 'bg-yellow-600 text-white' : ''}`}>On Hold</button>
          <button className={`btn-secondary ${false ? 'bg-green-600 text-white' : ''}`}>Sold</button>
          <button className={`btn-secondary ${false ? 'bg-gray-700 text-white' : ''}`}>All</button>
        </div>
        <ProductTable products={filteredProducts} holds={holds} />
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Active Holds</h2>
        {activeHolds.length === 0 ? (
          <div className="text-gray-400">No active holds.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-700 rounded-lg">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">Customer</th>
                  <th className="px-3 py-2 text-left">Contact</th>
                  <th className="px-3 py-2 text-left">Hold Start</th>
                  <th className="px-3 py-2 text-left">Expires</th>
                  <th className="px-3 py-2 text-left">Pickup</th>
                  <th className="px-3 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {activeHolds.map(hold => {
                  const f = hold.fields;
                  const product = Array.isArray(f.Products) && f.Products.length > 0 ? productMap[f.Products[0]] : null;
                  return (
                    <tr key={hold.id} className="border-t border-gray-700">
                      <td className="px-3 py-2">
                        {product ? (
                          <span>
                            <span className="font-semibold">{product.name}</span>
                            <br />
                            <span className="text-xs text-gray-400">ID: {f.Products[0]}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">Unknown</span>
                        )}
                      </td>
                      <td className="px-3 py-2">{f.customer_name}</td>
                      <td className="px-3 py-2">
                        <div>{f.customer_email}</div>
                        <div>{f.customer_phone}</div>
                      </td>
                      <td className="px-3 py-2">{f.hold_created_at ? new Date(f.hold_created_at).toLocaleString() : '-'}</td>
                      <td className="px-3 py-2">{f.hold_expires_at ? new Date(f.hold_expires_at).toLocaleString() : '-'}</td>
                      <td className="px-3 py-2">
                        {formatPickupDay(f.pickup_day, f.pickup_custom)}
                      </td>
                      <td className="px-3 py-2">
                        {f.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 