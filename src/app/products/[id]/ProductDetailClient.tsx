"use client";
import { useState } from 'react';
import Link from 'next/link';
import ProductContactForm from '@/components/ProductContactForm';

interface ProductDetailClientProps {
  productId: string;
  productName: string;
  productPrice: number;
  onHold: boolean;
}

export default function ProductDetailClient({ 
  productId, 
  productName, 
  productPrice, 
  onHold 
}: ProductDetailClientProps) {
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  return (
    <>
      <div className="space-y-4">
        {!onHold ? (
          <>
            <Link 
              href={`/purchase/${productId}`} 
              className="btn-primary w-full text-center text-lg py-4 flex items-center justify-center gap-2"
            >
              <span>🛒</span>
              Request to Purchase
            </Link>
            
            <button 
              onClick={() => setShowQuestionForm(true)}
              className="btn-secondary w-full text-center text-lg py-4 flex items-center justify-center gap-2"
            >
              <span>❓</span>
              Ask a Question
            </button>
          </>
        ) : (
          <div className="w-full text-center text-lg py-4 bg-gray-700/50 rounded-xl text-gray-400 cursor-not-allowed flex items-center justify-center gap-2">
            <span>🔒</span>
            Currently On Hold
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {showQuestionForm && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowQuestionForm(false);
            }
          }}
        >
          <div 
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <ProductContactForm
              productId={productId}
              productName={productName}
              productPrice={productPrice}
              formType="question"
              onClose={() => setShowQuestionForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}