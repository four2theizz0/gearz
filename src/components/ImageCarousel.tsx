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
  const carouselId = `carousel-${Math.random().toString(36).substr(2, 9)}`;

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

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(images.length - 1);
    }
  };

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
      if (Math.abs(diff) > 50) { // Increased threshold for more reliable swipe detection
        if (diff > 0) {
          // Swiped left (show next)
          next();
        } else {
          // Swiped right (show previous)
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
      style={{ 
        aspectRatio: '1/1',
        touchAction: 'pan-y pinch-zoom' // Allow vertical scrolling while enabling horizontal swipe
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={`Image carousel with ${images.length} images. Use arrow keys to navigate.`}
      aria-live="polite"
      aria-describedby={`${carouselId}-instructions`}
    >
      {/* Image */}
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        <Image
          src={images[current]}
          alt={`${alt} - Image ${current + 1} of ${images.length}`}
          width={400}
          height={400}
          className="object-cover w-full h-full border border-gray-700 transition-transform duration-300 hover:scale-105"
          style={{ aspectRatio: '1/1' }}
          draggable={false}
          unoptimized
          aria-describedby={`${carouselId}-current`}
        />
      </div>
      {/* Left Arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }}
          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 focus:bg-black/80 focus:ring-2 focus:ring-red-500 text-white rounded-full p-1.5 sm:p-2 z-20 transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label={`Previous image. Currently showing image ${current + 1} of ${images.length}`}
          type="button"
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {/* Right Arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }}
          className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 focus:bg-black/80 focus:ring-2 focus:ring-red-500 text-white rounded-full p-1.5 sm:p-2 z-20 transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label={`Next image. Currently showing image ${current + 1} of ${images.length}`}
          type="button"
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2 z-20 bg-black/40 px-2 py-1 rounded-full">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); goTo(idx); }}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 focus:ring-1 focus:ring-red-400 focus:outline-none ${
                current === idx 
                  ? "bg-red-500 scale-110" 
                  : "bg-gray-400 hover:bg-gray-300 hover:scale-110"
              }`}
              aria-label={`Go to image ${idx + 1}${current === idx ? ' (current)' : ''}`}
              aria-current={current === idx ? 'true' : 'false'}
              type="button"
            />
          ))}
        </div>
      )}
      
      {/* Screen reader instructions and current status */}
      <div className="sr-only">
        <div id={`${carouselId}-instructions`}>
          Use arrow keys to navigate between images. Press Home to go to first image, End for last image.
        </div>
        <div id={`${carouselId}-current`} aria-live="polite">
          Currently viewing image {current + 1} of {images.length}
        </div>
      </div>
    </div>
  );
} 