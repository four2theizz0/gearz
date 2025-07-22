'use client';
import { useState, useEffect } from 'react';
import ClientOnly from '@/components/ClientOnly';

interface HoldNotificationsProps {
  holds: any[];
  productMap: Record<string, any>;
}

export default function HoldNotifications({ holds, productMap }: HoldNotificationsProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const now = new Date();
    const urgent: any[] = [];

    holds.forEach(hold => {
      const f = hold.fields;
      if (!f.hold_expires_at || dismissed.includes(hold.id)) return;

      const expiresAt = new Date(f.hold_expires_at);
      const diffHours = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      // Create notifications for critical timeframes
      if (diffHours < 0) {
        urgent.push({
          id: hold.id,
          type: 'expired',
          title: 'Hold Expired',
          message: `${f.customer_name}'s hold has expired`,
          customer: f.customer_name,
          product: f.Products && f.Products[0] ? productMap[f.Products[0]]?.name : 'Unknown Product',
          priority: 'high'
        });
      } else if (diffHours < 2) {
        urgent.push({
          id: hold.id,
          type: 'critical',
          title: 'Hold Expiring Soon',
          message: `${f.customer_name}'s hold expires in ${Math.ceil(diffHours)} hour${Math.ceil(diffHours) !== 1 ? 's' : ''}`,
          customer: f.customer_name,
          product: f.Products && f.Products[0] ? productMap[f.Products[0]]?.name : 'Unknown Product',
          priority: 'high'
        });
      } else if (diffHours < 6) {
        urgent.push({
          id: hold.id,
          type: 'warning',
          title: 'Hold Expiring Today',
          message: `${f.customer_name}'s hold expires in ${Math.ceil(diffHours)} hours`,
          customer: f.customer_name,
          product: f.Products && f.Products[0] ? productMap[f.Products[0]]?.name : 'Unknown Product',
          priority: 'medium'
        });
      }
    });

    setNotifications(urgent);
  }, [holds, productMap, dismissed]);

  const dismiss = (notificationId: string) => {
    setDismissed(prev => [...prev, notificationId]);
  };

  if (notifications.length === 0) return null;

  return (
    <ClientOnly>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-yellow-300">⚠️ Hold Notifications</h3>
        <div className="space-y-2">
          {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg border-l-4 flex items-center justify-between ${
              notification.type === 'expired' 
                ? 'bg-red-900/30 border-red-500' 
                : notification.type === 'critical'
                ? 'bg-red-800/30 border-red-400'
                : 'bg-yellow-800/30 border-yellow-500'
            }`}
          >
            <div>
              <div className="font-medium">{notification.title}</div>
              <div className="text-sm text-gray-300">{notification.message}</div>
              <div className="text-xs text-gray-400 mt-1">
                Product: {notification.product} | Customer: {notification.customer}
              </div>
            </div>
            <button
              onClick={() => dismiss(notification.id)}
              className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded"
            >
              ✕
            </button>
          </div>
          ))}
        </div>
      </div>
    </ClientOnly>
  );
}