"use client";
import Image from "next/image";

interface ListingGalleryProps {
  images: string[];
  alt: string;
  saved: boolean;
  onToggleSave: () => void;
}

export default function ListingGallery({
  images,
  alt,
  saved,
  onToggleSave,
}: ListingGalleryProps) {
  // We want exactly 5 images. If we have fewer, we pad with the first image.
  const displayImages = [...images];
  while (displayImages.length < 5 && displayImages.length > 0) {
    displayImages.push(displayImages[0]);
  }

  if (displayImages.length === 0) {
    return (
      <div className="h-[280px] md:h-[360px] bg-surface-soft rounded-[16px] overflow-hidden flex items-center justify-center relative">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-soft" aria-hidden="true">
          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-10h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" />
        </svg>
      </div>
    );
  }

  return (
    <section className="mb-6">
      <div className="relative rounded-[16px] overflow-hidden bg-surface-soft shadow-airbnb">
        {/* Desktop 5-image grid layout */}
        <div className="hidden md:grid md:grid-cols-4 md:grid-rows-2 md:gap-2 h-[380px] lg:h-[450px]">
          {/* Left Column — 1 Large Image (spans 2 cols, 2 rows) */}
          <div className="col-span-2 row-span-2 relative overflow-hidden group/main">
            <Image
              src={displayImages[0]}
              alt={`${alt} — Main view`}
              fill
              sizes="50vw"
              className="object-cover photo-enhance transition-transform duration-700 ease-out group-hover/main:scale-105 cursor-pointer"
              priority
            />
          </div>

          {/* Right Column Grid — 4 smaller images */}
          {displayImages.slice(1, 5).map((img, i) => (
            <div key={i} className="relative overflow-hidden group/thumb cursor-pointer">
              <Image
                src={img}
                alt={`${alt} — view ${i + 2}`}
                fill
                sizes="25vw"
                className="object-cover photo-enhance transition-all duration-500 group-hover/thumb:scale-105"
                style={{ opacity: 0.85 + i * 0.03, filter: `brightness(${0.95 - i * 0.04})` }}
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Mobile single image container */}
        <div className="block md:hidden relative aspect-[4/3] w-full group/mobile">
          <Image
            src={displayImages[0]}
            alt={`${alt} — mobile view`}
            fill
            sizes="100vw"
            className="object-cover photo-enhance"
            priority
          />
        </div>

        {/* Save button overlay (fits both layouts because it's absolute to the parent) */}
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-canvas/90 shadow-airbnb hover:scale-105 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink z-10"
          aria-label={saved ? "Remove from saved" : "Save listing"}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            className={saved ? "text-rausch" : "text-muted"}
            aria-hidden="true"
          >
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </section>
  );
}
