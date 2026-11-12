import { useEffect, useState } from "react";
import { getProductImages } from "../utils/images";

/**
 * Clean fallback placeholder rendered when a product has no images or an image fails to load.
 */
export function ProductPlaceholder({ className = "", iconClassName = "h-10 w-10", label = "" }) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-300 select-none ${className}`}
      aria-label={label || "No product image"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconClassName}
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
      {label ? (
        <span className="mt-2 text-xs font-medium text-slate-400">{label}</span>
      ) : null}
    </div>
  );
}

/**
 * Single thumbnail image with automatic fallback to `ProductPlaceholder` on empty or failed URL.
 */
export function ProductThumbnail({
  src,
  alt,
  className = "h-full w-full object-cover",
  placeholderIconClassName = "h-6 w-6",
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return <ProductPlaceholder iconClassName={placeholderIconClassName} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

/**
 * Product card image display showing the primary image (`image_urls[0] || image_url`),
 * optional hover preview of the second image (`image_urls[1]`), and a subtle multi-photo indicator.
 */
export function ProductCardImage({
  product,
  imgClassName = "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
  placeholderIconClassName = "h-12 w-12",
}) {
  const images = getProductImages(product);
  const primaryUrl = images[0] || "";
  const secondaryUrl = images[1] || "";

  const [primaryError, setPrimaryError] = useState(false);
  const [secondaryError, setSecondaryError] = useState(false);

  useEffect(() => {
    setPrimaryError(false);
    setSecondaryError(false);
  }, [primaryUrl, secondaryUrl]);

  const hasPrimary = Boolean(primaryUrl) && !primaryError;
  const hasSecondary = Boolean(secondaryUrl) && !secondaryError && hasPrimary;

  return (
    <>
      {hasPrimary ? (
        <>
          <img
            src={primaryUrl}
            alt={product?.name || "Product"}
            className={imgClassName}
            onError={() => setPrimaryError(true)}
          />
          {hasSecondary && (
            <img
              src={secondaryUrl}
              alt={`${product?.name || "Product"} alternate view`}
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              onError={() => setSecondaryError(true)}
            />
          )}
        </>
      ) : (
        <ProductPlaceholder iconClassName={placeholderIconClassName} />
      )}

      {images.length > 1 && hasPrimary && (
        <>
          {/* Subtle multi-image dots */}
          <div
            className="pointer-events-none absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-slate-900/45 px-2 py-1 backdrop-blur-xs"
            aria-hidden="true"
          >
            {images.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === 0
                    ? hasSecondary
                      ? "w-3 bg-white group-hover:w-1.5 group-hover:bg-white/55"
                      : "w-3 bg-white"
                    : idx === 1 && hasSecondary
                      ? "w-1.5 bg-white/55 group-hover:w-3 group-hover:bg-white"
                      : "w-1.5 bg-white/55"
                }`}
              />
            ))}
          </div>

          {/* Photo count badge */}
          <span
            className="pointer-events-none absolute bottom-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-slate-900/65 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs"
            title={`${images.length} photos`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="14" height="14" rx="2" />
              <path d="M7 3h12a2 2 0 0 1 2 2v12" />
            </svg>
            <span>{images.length}</span>
          </span>
        </>
      )}
    </>
  );
}

