'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductTable from '@/components/admin/ProductTable';
import HoldManagement from '@/components/admin/HoldManagement';
import HoldNotifications from '@/components/admin/HoldNotifications';
import { formatPickupDay } from '@/lib/dateUtils';
import ClientOnly from '@/components/ClientOnly';
import { useToast } from '@/components/ui/ToastContainer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AdminDashboardProps {
  initialProducts: any[];
  initialHolds: any[];
  productMap: Record<string, any>;
}

export default function AdminDashboard({ 
  initialProducts, 
  initialHolds, 
  productMap 
}: AdminDashboardProps) {
  const [products] = useState(initialProducts);
  const [holds, setHolds] = useState(initialHolds);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  // Logout function
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        showSuccess('Logged Out', 'You have been successfully logged out');
        router.push('/admin/login');
      } else {
        showError('Logout Failed', 'There was an error logging out');
      }
    } catch (error) {
      console.error('Logout error:', error);
      showError('Logout Failed', 'Network error during logout');
    }
  };

  const activeHolds = holds.filter(h => {
    const fields = h.fields;
    
    // Only show holds with explicit "Active" status (filter out null/undefined/other statuses)
    const hasActiveStatus = fields.hold_status === 'Active' || 
                           fields.hold_status === 'active' ||
                           fields.hold_status === 'ACTIVE';
    
    // More flexible expiration check
    const isNotExpired = !fields.hold_expires_at || 
                        new Date(fields.hold_expires_at) > new Date();
    
    return hasActiveStatus && isNotExpired;
  });

  const expiredHolds = holds.filter(h => {
    const fields = h.fields;
    
    // Only show holds with explicit "Active" status that ARE expired
    const hasActiveStatus = fields.hold_status === 'Active' || 
                           fields.hold_status === 'active' ||
                           fields.hold_status === 'ACTIVE';
    
    const isExpired = fields.hold_expires_at && 
                     new Date(fields.hold_expires_at) <= new Date();
    
    return hasActiveStatus && isExpired;
  });

  const handleHoldUpdate = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Fetch fresh holds data
      const response = await fetch('/api/admin/refresh-holds');
      if (response.ok) {
        const freshHolds = await response.json();
        setHolds(freshHolds.holds);
        setRefreshKey(prev => prev + 1);
        showSuccess('Data Refreshed', 'Hold information updated successfully');
      } else {
        showError('Refresh Failed', 'Failed to refresh data. Please try again.');
        // Fallback to page reload if API call fails
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error) {
      showError('Connection Error', 'Unable to connect to server. Refreshing page...');
      // Fallback to page reload if there's an error
      setTimeout(() => window.location.reload(), 2000);
    } finally {
      setIsRefreshing(false);
    }
  }, [showSuccess, showError]);

  // Auto-refresh holds data every 2 minutes to catch expiration changes
  useEffect(() => {
    const interval = setInterval(() => {
      handleHoldUpdate();
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [handleHoldUpdate]);

  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your MMA gear inventory and orders</p>
        </div>
        <button
          onClick={handleLogout}
          className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 hover:bg-red-600 hover:border-red-500 transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
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
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white font-bold">⏰</span>
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Holds</p>
              <p className="text-2xl font-bold">{activeHolds.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white font-bold">💰</span>
            </div>
            <div>
              <p className="text-sm text-gray-400">Potential Revenue</p>
              <p className="text-2xl font-bold">
                ${activeHolds.reduce((total, hold) => {
                  const productIds = Array.isArray(hold.fields.Products) ? hold.fields.Products : [];
                  return total + productIds.reduce((sum: number, id: string) => {
                    const product = productMap[id];
                    return sum + (product ? parseFloat(product.price) || 0 : 0);
                  }, 0);
                }, 0).toFixed(0)}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white font-bold">💀</span>
            </div>
            <div>
              <p className="text-sm text-gray-400">Expired Holds</p>
              <p className="text-2xl font-bold">{expiredHolds.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a href="/admin/create" className="btn-primary w-full block text-center">Add New Product</a>
            <button 
              className="btn-secondary w-full flex items-center justify-center gap-2" 
              onClick={handleHoldUpdate}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                'Refresh Data'
              )}
            </button>
            <button className="btn-secondary w-full">Export Reports</button>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Hold management system active</span>
              <span className="text-gray-400">Now</span>
            </div>
            <div className="flex justify-between">
              <span>Auto-refresh every 2 minutes</span>
              <span className={`text-xs ${isRefreshing ? 'text-yellow-400' : 'text-gray-400'}`}>
                {isRefreshing ? 'Updating...' : 'Active'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Sales tracking enabled</span>
              <span className="text-gray-400">Now</span>
            </div>
          </div>
        </div>
      </div>


      {/* Hold Notifications */}
      <HoldNotifications holds={activeHolds} productMap={productMap} />

      {/* Hold Management Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Active Hold Management</h2>
        <HoldManagement 
          holds={activeHolds} 
          productMap={productMap} 
          onHoldUpdate={handleHoldUpdate}
        />
      </div>

      {/* Expired Holds Section */}
      {expiredHolds.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-red-300">Expired Holds</h2>
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <p className="text-red-200 text-sm mb-4">
              These holds have expired but customers may still be interested. Consider contacting them or cleaning up old records.
            </p>
            <HoldManagement 
              holds={expiredHolds} 
              productMap={productMap} 
              onHoldUpdate={handleHoldUpdate}
            />
          </div>
        </div>
      )}

      {/* Product Inventory Table */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Product Inventory</h2>
        <ProductTable products={products} holds={holds} />
      </div>
    </div>
  );
}