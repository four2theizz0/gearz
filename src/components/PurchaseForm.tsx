"use client";
import { useState } from "react";

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
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to send email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
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
        <label className="block text-sm font-medium mb-1">Name</label>
        <input name="name" required className="input-field w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input name="email" type="email" required className="input-field w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input name="phone" type="tel" required className="input-field w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Preferred Pickup Day</label>
        <select
          name="pickupDay"
          className="input-field w-full"
          value={pickupDay}
          onChange={e => setPickupDay(e.target.value)}
        >
          <option value="Today">{today}</option>
          <option value="Tomorrow">{tomorrow}</option>
          <option value="Other">Other</option>
        </select>
        {pickupDay === "Other" && (
          <input
            name="otherPickup"
            className="input-field w-full mt-2"
            placeholder="Please specify your preferred pickup day/time"
            value={otherPickup}
            onChange={e => setOtherPickup(e.target.value)}
            required
          />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notes (optional)</label>
        <textarea name="notes" className="input-field w-full" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      {error && <div className="text-red-400 text-center">{error}</div>}
      <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
        {loading ? "Sending..." : "Submit"}
      </button>
    </form>
  );
} 