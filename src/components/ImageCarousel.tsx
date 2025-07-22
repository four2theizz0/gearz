"use client";
import { useState, useRef } from "react";
import Image from "next/image";

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
}

export default function ImageCarousel({ images, alt = "Product image", className = "" }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center rounded-lg ${className}`} style={{ aspectRatio: '1/1' }}>
        <span className="text-gray-400 text-4xl">🥊</span>
      </div>
    );
  }

  const goTo = (idx: number) => setCurrent(idx);
  const prev = () => setCurrent((current - 1 + images.length) % images.length);
  const next = () => setCurrent((current + 1) % images.length);

  // Touch event handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 20) {
        if (diff > 0) {
          // Swiped left
          next();
        } else {
          // Swiped right
          prev();
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className={`relative w-full ${className}`}
      style={{ aspectRatio: '1/1' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image */}
      <Image
        src={images[current]}
        alt={alt}
        width={400}
        height={400}
        className="object-cover w-full h-full rounded-lg border border-gray-700"
        style={{ aspectRatio: '1/1' }}
        draggable={false}
        unoptimized
      />
      {/* Left Arrow */}
      {images.length > 1 && (
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-900/60 hover:bg-gray-900/80 text-white rounded-full p-2 z-10"
          aria-label="Previous image"
        >
          &#8592;
        </button>
      )}
      {/* Right Arrow */}
      {images.length > 1 && (
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900/60 hover:bg-gray-900/80 text-white rounded-full p-2 z-10"
          aria-label="Next image"
        >
          &#8594;
        </button>
      )}
      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`w-3 h-3 rounded-full border border-gray-400 ${current === idx ? "bg-red-500" : "bg-gray-600"}`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 