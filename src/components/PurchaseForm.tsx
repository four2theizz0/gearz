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
      <div className="glass-strong rounded-2xl p-8 text-center" data-testid="success-message">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-green-400 mb-4">Request Submitted!</h3>
        <p className="text-lg text-gray-300 leading-relaxed">
          Thank you! We will contact you soon about your purchase of{' '}
          <span className="font-bold text-white">{productName}</span>.
        </p>
        <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded-xl">
          <p className="text-sm text-green-300">
            📧 Check your email for confirmation details<br/>
            📞 We'll call you within 24 hours to arrange pickup
          </p>
        </div>
      </div>
    );
  }

  // Form validation helper
  function validateForm(data: Record<string, any>): string | null {
    // Clean and validate name
    if (!data.name || data.name.trim().length < 2) {
      return "Please enter a valid name (at least 2 characters)";
    }

    // Clean and validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email.trim())) {
      return "Please enter a valid email address";
    }

    // Clean and validate phone
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = data.phone.replace(/[\s\-\(\)\.]/g, '');
    if (!data.phone || cleanPhone.length < 10) {
      return "Please enter a valid phone number (at least 10 digits)";
    }

    // Validate pickup day
    if (!data.pickupDay) {
      return "Please select a pickup day";
    }
    if (data.pickupDay === "Other" && (!data.otherPickup || data.otherPickup.trim().length < 3)) {
      return "Please specify your preferred pickup time";
    }

    return null;
  }

  // Data cleaning helper
  function cleanData(data: Record<string, any>): Record<string, any> {
    return {
      ...data,
      name: data.name?.trim(),
      email: data.email?.trim().toLowerCase(),
      phone: data.phone?.trim(),
      notes: data.notes?.trim(),
      otherPickup: data.otherPickup?.trim(),
    };
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Extract and clean form data
    let data: Record<string, any> = {
      productId,
      productName,
      productPrice,
      name: formData.get("name")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      phone: formData.get("phone")?.toString() || "",
      pickupDay,
      otherPickup: pickupDay === "Other" ? otherPickup : "",
      notes,
    };

    // Clean the data
    data = cleanData(data);

    // Validate the form
    const validationError = validateForm(data);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }
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
    <div className="glass-strong rounded-2xl p-6" data-testid="purchase-form">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold mb-2">Purchase Request</h3>
        <p className="text-gray-400">Fill out the form below to request this item</p>
      </div>

      <form 
        className="space-y-6" 
        onSubmit={handleSubmit}
        noValidate
        aria-labelledby="purchase-form-title"
      >
        {/* Prefilled product info (hidden) */}
        <input type="hidden" name="productId" value={productId} />
        {/* For future: edit/cancel token */}
        <input type="hidden" name="editToken" value="" />
        
        {/* Product Summary */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Product</label>
              <div className="text-lg font-semibold text-white">{productName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Price</label>
              <div className="text-2xl font-bold text-red-400">${productPrice}</div>
            </div>
          </div>
        </div>
        {/* Customer Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">
            Contact Information
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customer-name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name <span className="text-red-400" aria-label="required">*</span>
              </label>
              <input 
                id="customer-name"
                name="name" 
                type="text"
                required 
                className="input-field w-full" 
                aria-describedby="name-error"
                autoComplete="name"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number <span className="text-red-400" aria-label="required">*</span>
              </label>
              <input 
                id="customer-phone"
                name="phone" 
                type="tel" 
                required 
                className="input-field w-full" 
                aria-describedby="phone-error"
                autoComplete="tel"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="customer-email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address <span className="text-red-400" aria-label="required">*</span>
            </label>
            <input 
              id="customer-email"
              name="email" 
              type="email" 
              required 
              className="input-field w-full" 
              aria-describedby="email-error"
              autoComplete="email"
              placeholder="your.email@example.com"
            />
          </div>
        </div>
        {/* Pickup Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">
            Pickup Schedule
          </h4>
          
          <div>
            <label htmlFor="pickup-day" className="block text-sm font-medium text-gray-300 mb-2">
              Preferred Pickup Day <span className="text-red-400" aria-label="required">*</span>
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
            <div id="pickup-instructions" className="text-xs text-gray-400 mt-1">
              💡 We'll confirm your pickup time when we contact you
            </div>
            
            {pickupDay === "Other" && (
              <div className="mt-3 p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                <label htmlFor="other-pickup" className="block text-sm font-medium text-gray-300 mb-2">
                  Specify your preferred pickup day and time
                </label>
                <input
                  id="other-pickup"
                  name="otherPickup"
                  className="input-field w-full"
                  placeholder="e.g., Saturday afternoon, Weekdays after 5pm"
                  value={otherPickup}
                  onChange={e => setOtherPickup(e.target.value)}
                  required
                  aria-describedby="other-pickup-help"
                />
                <div id="other-pickup-help" className="text-xs text-gray-400 mt-2">
                  📅 Example: "Saturday afternoon" or "Weekdays after 5pm"
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Additional Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">
            Additional Information
          </h4>
          
          <div>
            <label htmlFor="customer-notes" className="block text-sm font-medium text-gray-300 mb-2">
              Notes & Special Requests <span className="text-gray-500">(optional)</span>
            </label>
            <textarea 
              id="customer-notes"
              name="notes" 
              className="input-field w-full resize-none" 
              rows={4} 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              aria-describedby="notes-help"
              placeholder="Any questions about the product, special pickup instructions, or other requests..."
            />
            <div id="notes-help" className="text-xs text-gray-400 mt-2 flex items-center gap-2">
              <span>💬</span>
              Share any additional information, questions, or special requests
            </div>
          </div>
        </div>
        {/* Error Message */}
        {error && (
          <div 
            className="glass-strong rounded-xl p-4 border border-red-500/50 bg-red-900/20" 
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-center gap-3">
              <div className="text-red-400 text-xl">⚠️</div>
              <div>
                <div className="font-semibold text-red-400 mb-1">Request Failed</div>
                <div className="text-red-300">{error}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        <div className="pt-4">
          <button 
            type="submit" 
            className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-3 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900" 
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
              <>
                <span>🚀</span>
                <span>Submit Purchase Request</span>
              </>
            )}
          </button>
          
          <div className="text-center mt-4 text-sm text-gray-400">
            <span>🔒</span> Your information is secure and will only be used to process your request
          </div>
        </div>
      </form>
    </div>
  );
} 