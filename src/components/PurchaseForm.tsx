"use client";
import { useState } from "react";
import { useToast } from '@/components/ui/ToastContainer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function getTodayTomorrowLabels() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const format = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return {
    today: `Today (${format(today)})`,
    tomorrow: `Tomorrow (${format(tomorrow)})`,
  };
}

interface PurchaseFormProps {
  productId: string;
  productName: string;
  productPrice: number;
}

export default function PurchaseForm({ productId, productName, productPrice }: PurchaseFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [pickupDay, setPickupDay] = useState("Today");
  const [otherPickup, setOtherPickup] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { today, tomorrow } = getTodayTomorrowLabels();
  
  const { showSuccess, showError } = useToast();

  if (submitted) {
    return (
      <div className="text-green-400 text-center py-8 text-lg font-semibold">
        Thank you! We will contact you soon about your purchase of <span className="font-bold">{productName}</span>.
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, any> = {
      productId,
      productName,
      productPrice,
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      pickupDay,
      otherPickup: pickupDay === "Other" ? otherPickup : "",
      notes,
    };
    try {
      const res = await fetch("/api/purchase-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to send email");
      }
      showSuccess('Purchase Request Sent!', `We'll contact you soon about ${productName}. Check your email for confirmation.`);
      setSubmitted(true);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send email";
      setError(errorMessage);
      showError('Purchase Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form 
      className="space-y-4 mt-4" 
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="purchase-form-title"
    >
      {/* Prefilled product info (hidden) */}
      <input type="hidden" name="productId" value={productId} />
      {/* For future: edit/cancel token */}
      <input type="hidden" name="editToken" value="" />
      <div>
        <label className="block text-sm font-medium mb-1">Product</label>
        <input value={productName} readOnly className="input-field w-full bg-gray-700 text-gray-300" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Price</label>
        <input value={`$${productPrice}`} readOnly className="input-field w-full bg-gray-700 text-gray-300" />
      </div>
      <div>
        <label htmlFor="customer-name" className="block text-sm font-medium mb-1">
          Name <span className="text-red-500" aria-label="required">*</span>
        </label>
        <input 
          id="customer-name"
          name="name" 
          type="text"
          required 
          className="input-field w-full" 
          aria-describedby="name-error"
          autoComplete="name"
        />
      </div>
      <div>
        <label htmlFor="customer-email" className="block text-sm font-medium mb-1">
          Email <span className="text-red-500" aria-label="required">*</span>
        </label>
        <input 
          id="customer-email"
          name="email" 
          type="email" 
          required 
          className="input-field w-full" 
          aria-describedby="email-error"
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="customer-phone" className="block text-sm font-medium mb-1">
          Phone <span className="text-red-500" aria-label="required">*</span>
        </label>
        <input 
          id="customer-phone"
          name="phone" 
          type="tel" 
          required 
          className="input-field w-full" 
          aria-describedby="phone-error"
          autoComplete="tel"
        />
      </div>
      <div>
        <label htmlFor="pickup-day" className="block text-sm font-medium mb-1">
          Preferred Pickup Day <span className="text-red-500" aria-label="required">*</span>
        </label>
        <select
          id="pickup-day"
          name="pickupDay"
          className="input-field w-full"
          value={pickupDay}
          onChange={e => setPickupDay(e.target.value)}
          required
          aria-describedby="pickup-instructions"
        >
          <option value="Today">{today}</option>
          <option value="Tomorrow">{tomorrow}</option>
          <option value="Other">Other (specify below)</option>
        </select>
        <div id="pickup-instructions" className="sr-only">
          Select when you would like to pick up your order
        </div>
        {pickupDay === "Other" && (
          <div className="mt-2">
            <label htmlFor="other-pickup" className="sr-only">
              Specify your preferred pickup day and time
            </label>
            <input
              id="other-pickup"
              name="otherPickup"
              className="input-field w-full"
              placeholder="Please specify your preferred pickup day/time"
              value={otherPickup}
              onChange={e => setOtherPickup(e.target.value)}
              required
              aria-describedby="other-pickup-help"
            />
            <div id="other-pickup-help" className="text-xs text-gray-400 mt-1">
              Example: "Saturday afternoon" or "Weekdays after 5pm"
            </div>
          </div>
        )}
      </div>
      <div>
        <label htmlFor="customer-notes" className="block text-sm font-medium mb-1">
          Notes (optional)
        </label>
        <textarea 
          id="customer-notes"
          name="notes" 
          className="input-field w-full" 
          rows={3} 
          value={notes} 
          onChange={e => setNotes(e.target.value)}
          aria-describedby="notes-help"
          placeholder="Any special requests or questions..."
        />
        <div id="notes-help" className="text-xs text-gray-400 mt-1">
          Share any additional information or special requests
        </div>
      </div>
      {error && (
        <div 
          className="text-red-400 text-center p-3 bg-red-900/20 border border-red-700 rounded" 
          role="alert"
          aria-live="polite"
        >
          <strong>Error:</strong> {error}
        </div>
      )}
      <button 
        type="submit" 
        className="btn-primary w-full mt-2 flex items-center justify-center gap-2 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900" 
        disabled={loading}
        aria-describedby={error ? "form-error" : undefined}
      >
        {loading ? (
          <>
            <LoadingSpinner size="small" />
            <span>Sending Purchase Request...</span>
            <span className="sr-only">Please wait while we process your request</span>
          </>
        ) : (
          "Submit Purchase Request"
        )}
      </button>
    </form>
  );
} 