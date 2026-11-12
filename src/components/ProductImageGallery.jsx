import { useEffect, useRef, useState } from "react";
import { ProductPlaceholder } from "./ProductMedia";

/**
 * Interactive multi-image gallery for the Product Details page.
 * Supports main image display, clickable thumbnail strip, prev/next arrows,
 * keyboard arrow navigation, and touch swipe on mobile.
 */
export default function ProductImageGallery({
  images = [],
  productName = "Product",
  topLeftBadge = null,
  topRightAction = null,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState({});
  const touchStartX = useRef(null);

  const imagesKey = images.join("|");
  useEffect(() => {
    setActiveIndex(0);
    setFailedUrls({});
  }, [imagesKey]);

  const safeIndex = activeIndex < images.length ? activeIndex : 0;
  const activeUrl = images[safeIndex] || "";
  const hasMultiple = images.length > 1;
  const isActiveBroken = Boolean(activeUrl && failedUrls[activeUrl]);

  function markFailed(url) {
    if (!url) return;
    setFailedUrls((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
  }

  function goPrev() {
    if (!hasMultiple) return;
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  }

  function goNext() {
    if (!hasMultiple) return;
    setActiveIndex((prev) => (prev + 1) % images.length);
  }

  function handleTouchStart(e) {
    if (!hasMultiple || !e.touches?.length) return;
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (!hasMultiple || touchStartX.current === null || !e.changedTouches?.length) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX < 0) {
      goNext();
    } else {
      goPrev();
    }
  }

  function handleKeyDown(e) {
    if (!hasMultiple) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  }

  return (
    <div className="flex flex-col space-y-3">
      {/* Main Active Image Display */}
      <div
        tabIndex={hasMultiple ? 0 : undefined}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[300px] sm:h-[420px] lg:h-[460px] rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-slate-50/60 p-3 sm:p-4 flex items-center justify-center overflow-hidden group shadow-inner focus:outline-none focus:ring-2 focus:ring-brand/30"
      >
        {activeUrl && !isActiveBroken ? (
          <img
            src={activeUrl}
            alt={
              hasMultiple
                ? `${productName} - image ${safeIndex + 1} of ${images.length}`
                : productName
            }
            draggable={false}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 select-none"
            onError={() => markFailed(activeUrl)}
          />
        ) : (
          <ProductPlaceholder
            className="rounded-2xl bg-transparent"
            iconClassName="h-16 w-16"
            label="No image available"
          />
        )}

        {/* Top-left Stock Status Pill */}
        {topLeftBadge}

        {/* Top-right Wishlist / Action */}
        {topRightAction}

        {/* Prev / Next Navigation & Counter (only when multiple images exist) */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-slate-200/90 bg-white/90 text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white hover:text-brand hover:scale-105 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-slate-200/90 bg-white/90 text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white hover:text-brand hover:scale-105 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>

            <div className="pointer-events-none absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-10 rounded-full bg-slate-900/75 px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold text-white backdrop-blur-sm">
              {safeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Clickable Thumbnail Strip (only when 2+ images exist) */}
      {hasMultiple && (
        <div
          className="no-scrollbar flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 pt-0.5"
          role="listbox"
          aria-label="Product image thumbnails"
        >
          {images.map((url, idx) => {
            const isActive = idx === safeIndex;
            const isBroken = Boolean(failedUrls[url]);

            return (
              <button
                key={`${url}-${idx}`}
                type="button"
                role="option"
                aria-selected={isActive}
                aria-label={`View image ${idx + 1} of ${images.length}`}
                onClick={() => setActiveIndex(idx)}
                className={`relative h-15 w-15 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl border-2 bg-slate-50 flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? "border-brand ring-3 ring-brand/20 shadow-md opacity-100"
                    : "border-slate-200/80 opacity-70 hover:opacity-100 hover:border-slate-300"
                }`}
              >
                {!isBroken ? (
                  <img
                    src={url}
                    alt={`${productName} thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                    onError={() => markFailed(url)}
                  />
                ) : (
                  <ProductPlaceholder iconClassName="h-6 w-6" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

