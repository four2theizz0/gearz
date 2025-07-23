'use client';
import { useState } from 'react';
import { HoldRecord } from '@/lib/airtable';
import { formatPickupDay, formatDate } from '@/lib/dateUtils';
import ClientOnly from '@/components/ClientOnly';
import { useToast } from '@/components/ui/ToastContainer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface HoldManagementProps {
  holds: any[];
  productMap: Record<string, any>;
  onHoldUpdate: () => void;
}

export default function HoldManagement({ holds, productMap, onHoldUpdate }: HoldManagementProps) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [showCompleteForm, setShowCompleteForm] = useState<string | null>(null);
  const [saleDetails, setSaleDetails] = useState({
    payment_method: '',
    transaction_id: '',
    final_price: '',
    admin_notes: ''
  });
  
  const { showSuccess, showError } = useToast();


  const isExpired = (holdExpiresAt: string) => {
    if (!holdExpiresAt) return false;
    return new Date(holdExpiresAt) < new Date();
  };

  const getExpirationStatus = (holdExpiresAt: string) => {
    if (!holdExpiresAt) return null;
    
    const expiresAt = new Date(holdExpiresAt);
    const now = new Date();
    const diffHours = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return { status: 'expired', text: 'Expired', color: 'bg-red-600' };
    if (diffHours < 2) return { status: 'critical', text: `${Math.ceil(diffHours)}h left`, color: 'bg-red-500' };
    if (diffHours < 6) return { status: 'warning', text: `${Math.ceil(diffHours)}h left`, color: 'bg-yellow-500' };
    return { status: 'good', text: `${Math.ceil(diffHours)}h left`, color: 'bg-green-600' };
  };

  const handleCompleteSale = async (holdId: string) => {
    setProcessing(holdId);
    try {
      const response = await fetch('/api/admin/complete-hold-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdId,
          ...saleDetails,
          final_price: saleDetails.final_price ? parseFloat(saleDetails.final_price) : undefined
        })
      });

      if (response.ok) {
        showSuccess('Sale Completed!', 'Hold successfully converted to sale and products marked as sold.');
        setShowCompleteForm(null);
        setSaleDetails({ payment_method: '', transaction_id: '', final_price: '', admin_notes: '' });
        onHoldUpdate();
      } else {
        const error = await response.json();
        showError('Sale Failed', error.error || 'Failed to complete sale');
      }
    } catch (error) {
      showError('Error', 'An unexpected error occurred while completing the sale');
    }
    setProcessing(null);
  };

  const handleCancelHold = async (holdId: string) => {
    if (!confirm('Cancel this hold? The product will become available again.')) return;
    
    setProcessing(holdId);
    try {
      const response = await fetch('/api/admin/update-hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdId,
          hold_status: 'Cancelled'
        })
      });

      if (response.ok) {
        showSuccess('Hold Cancelled', 'Hold cancelled successfully. Product is now available again.');
        onHoldUpdate();
      } else {
        showError('Cancel Failed', 'Failed to cancel hold. Please try again.');
      }
    } catch (error) {
      showError('Error', 'An unexpected error occurred while cancelling the hold');
    }
    setProcessing(null);
  };

  const handleExtendHold = async (holdId: string) => {
    // Find the current hold to get its existing expiration time
    const currentHold = holds.find(h => h.id === holdId);
    if (!currentHold || !currentHold.fields.hold_expires_at) {
      alert('Cannot extend hold: no expiration time found');
      return;
    }
    
    // Add 24 hours to the EXISTING expiration time, not current time
    const currentExpiration = new Date(currentHold.fields.hold_expires_at);
    const newExpiration = new Date(currentExpiration.getTime() + (24 * 60 * 60 * 1000));
    
    setProcessing(holdId);
    try {
      const response = await fetch('/api/admin/update-hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdId,
          hold_expires_at: newExpiration.toISOString()
          // Don't update pickup_day - it should stay as the original pickup date
        })
      });

      if (response.ok) {
        showSuccess('Hold Extended', 'Hold extended by 24 hours successfully.');
        onHoldUpdate();
      } else {
        showError('Extend Failed', 'Failed to extend hold. Please try again.');
      }
    } catch (error) {
      showError('Error', 'An unexpected error occurred while extending the hold');
    }
    setProcessing(null);
  };

  const calculateTotalPrice = (productIds: string[]) => {
    return productIds.reduce((total, productId) => {
      const product = productMap[productId];
      return total + (product ? parseFloat(product.price) || 0 : 0);
    }, 0);
  };

  if (holds.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        No active holds at the moment.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Total Active Holds</div>
          <div className="text-2xl font-bold text-white">{holds.length}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Expiring Soon (&lt; 6h)</div>
          <div className="text-2xl font-bold text-yellow-400">
            {holds.filter(h => {
              const status = getExpirationStatus(h.fields.hold_expires_at);
              return status && (status.status === 'critical' || status.status === 'warning');
            }).length}
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Expired</div>
          <div className="text-2xl font-bold text-red-400">
            {holds.filter(h => isExpired(h.fields.hold_expires_at)).length}
          </div>
        </div>
      </div>

      {/* Holds Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-700 rounded-lg">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Contact</th>
              <th className="px-3 py-2 text-left">Price</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Original Pickup</th>
              <th className="px-3 py-2 text-left">Hold Expires</th>
              <th className="px-3 py-2 text-left">Notes</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {holds.map(hold => {
              const f = hold.fields;
              const productIds = Array.isArray(f.Products) ? f.Products : [];
              const product = productIds.length > 0 ? productMap[productIds[0]] : null;
              const totalPrice = calculateTotalPrice(productIds);
              const expirationStatus = getExpirationStatus(f.hold_expires_at);
              const expired = isExpired(f.hold_expires_at);
              
              return (
                <tr key={hold.id} className={`border-t border-gray-700 ${expired ? 'bg-red-900/20' : ''}`}>
                  <td className="px-3 py-2">
                    {product ? (
                      <div>
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-xs text-gray-400">
                          {productIds.length > 1 ? `+${productIds.length - 1} more` : ''}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Unknown</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{f.customer_name}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs">
                      <div className="truncate max-w-32">{f.customer_email}</div>
                      {f.customer_phone && <div>{f.customer_phone}</div>}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-semibold">${totalPrice.toFixed(2)}</div>
                  </td>
                  <td className="px-3 py-2">
                    <ClientOnly fallback={
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-600 text-gray-300">
                        Loading...
                      </span>
                    }>
                      {expirationStatus ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${expirationStatus.color}`}>
                          {expirationStatus.text}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-600 text-gray-300">
                          No expiration
                        </span>
                      )}
                    </ClientOnly>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {formatPickupDay(f.pickup_day, f.pickup_custom)}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <ClientOnly fallback={<span className="text-gray-500">Loading...</span>}>
                      {f.hold_expires_at ? formatPickupDay(f.hold_expires_at, '') : '-'}
                    </ClientOnly>
                  </td>
                  <td className="px-3 py-2 text-xs max-w-24">
                    <div className="truncate" title={f.notes}>
                      {f.notes || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => setShowCompleteForm(hold.id)}
                        disabled={processing === hold.id}
                        className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50 flex items-center gap-1"
                      >
                        {processing === hold.id && processing !== null ? (
                          <>
                            <LoadingSpinner size="small" />
                            Processing...
                          </>
                        ) : (
                          'Complete Sale'
                        )}
                      </button>
                      <button
                        onClick={() => handleExtendHold(hold.id)}
                        disabled={processing === hold.id}
                        className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 flex items-center gap-1"
                      >
                        {processing === hold.id ? (
                          <>
                            <LoadingSpinner size="small" />
                            Extending...
                          </>
                        ) : (
                          'Extend'
                        )}
                      </button>
                      <button
                        onClick={() => handleCancelHold(hold.id)}
                        disabled={processing === hold.id}
                        className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 flex items-center gap-1"
                      >
                        {processing === hold.id ? (
                          <>
                            <LoadingSpinner size="small" />
                            Cancelling...
                          </>
                        ) : (
                          'Cancel'
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Complete Sale Modal */}
      {showCompleteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Complete Sale</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  value={saleDetails.payment_method}
                  onChange={(e) => setSaleDetails(prev => ({ ...prev, payment_method: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="">Select payment method</option>
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="venmo">Venmo</option>
                  <option value="zelle">Zelle</option>
                  <option value="paypal">PayPal</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Transaction ID (optional)</label>
                <input
                  type="text"
                  value={saleDetails.transaction_id}
                  onChange={(e) => setSaleDetails(prev => ({ ...prev, transaction_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="Receipt number, confirmation code, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Final Price (optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={saleDetails.final_price}
                  onChange={(e) => setSaleDetails(prev => ({ ...prev, final_price: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="Leave blank to use listed price"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Admin Notes (optional)</label>
                <textarea
                  value={saleDetails.admin_notes}
                  onChange={(e) => setSaleDetails(prev => ({ ...prev, admin_notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  rows={3}
                  placeholder="Any additional notes about this sale..."
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => handleCompleteSale(showCompleteForm)}
                disabled={processing === showCompleteForm}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing === showCompleteForm ? (
                  <>
                    <LoadingSpinner size="small" />
                    Processing Sale...
                  </>
                ) : (
                  'Complete Sale'
                )}
              </button>
              <button
                onClick={() => {
                  setShowCompleteForm(null);
                  setSaleDetails({ payment_method: '', transaction_id: '', final_price: '', admin_notes: '' });
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}