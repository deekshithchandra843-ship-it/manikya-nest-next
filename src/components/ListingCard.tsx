"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ListingCardProps {
  id: number;
  title: string;
  location: string;
  metroDistance?: string;
  price: string;
  rating: number;
  reviewCount: number;
  badge: string;
  amenities: string[];
  verified?: boolean;
  noBrokerage?: boolean;
  furnishing?: string;
  availableFrom?: string;
  /** Carpet/built-up area, e.g. "650 sq ft" — emphasised for BHK & commercial. */
  area?: string;
  /** Intent-specific spec line, e.g. "Triple sharing · Men" or "Bank tenant". */
  spec?: string;
  /** Render the owner-contact CTA row (used on category listing pages). */
  showCta?: boolean;
  /** Representative category photo. When provided, replaces the icon placeholder. */
  image?: string;
}

export default function ListingCard({
  id,
  title,
  location,
  metroDistance,
  price,
  rating,
  reviewCount,
  badge,
  amenities,
  verified,
  noBrokerage,
  furnishing,
  availableFrom,
  area,
  spec,
  showCta,
  image,
}: ListingCardProps) {
  const [saved, setSaved] = useState(false);
  // imgLoaded tracks when next/image fires onLoad; until then the skeleton shows.
  const [imgLoaded, setImgLoaded] = useState(false);

  const hasTags = verified || noBrokerage || furnishing || availableFrom;

  return (
    <Link
      href={`/listing/${id}`}
      className="block group rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
    >
      <div className="bg-canvas rounded-[14px] hover-lift hover:shadow-airbnb">
        {/* Image area — real photo when available, skeleton → icon otherwise */}
        <div className="relative aspect-[4/3] md:aspect-none md:h-48 lg:h-52 w-full bg-surface-strong rounded-[14px] overflow-hidden flex items-center justify-center">
          {image ? (
            <>
              {!imgLoaded && <div className="absolute inset-0 skeleton" aria-hidden="true" />}
              <Image
                src={image}
                alt={`${title} — ${badge} in ${location}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover photo-enhance transition-transform duration-500 ease-out group-hover:scale-105"
                onLoad={() => setImgLoaded(true)}
                loading="lazy"
              />
            </>
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-muted-soft" aria-hidden="true">
              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-10h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" />
            </svg>
          )}
          {/* Save icon */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSaved(!saved);
            }}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canvas rounded-full"
            aria-label={saved ? "Remove from saved" : "Save listing"}
            aria-pressed={saved}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="#ffffff"
              strokeWidth="2"
              aria-hidden="true"
              className={saved ? "text-rausch" : "text-ink/50"}
            >
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          {/* Category badge */}
          <span className="absolute top-3 left-3 bg-canvas text-[11px] font-semibold text-ink px-2.5 py-1 rounded-full shadow-airbnb">
            {badge}
          </span>
        </div>

        {/* Content */}
        <div className="pt-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-semibold text-ink line-clamp-1">
              {title}
            </h3>
            <div className="flex items-center gap-0.5 text-sm text-ink shrink-0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#222222" stroke="#222222" strokeWidth="1" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>{rating}</span>
              <span className="text-muted">({reviewCount})</span>
            </div>
          </div>
          <p className="text-sm text-muted mt-0.5 line-clamp-1">
            {location}
            {metroDistance && <span> · {metroDistance}</span>}
          </p>

          {/* Intent fields — spec (sharing/tenant/floor) + area, emphasised */}
          {(spec || area) && (
            <p className="text-[13px] font-medium text-body mt-1 line-clamp-1">
              {spec}
              {spec && area && <span className="text-muted-soft"> · </span>}
              {area && <span>{area}</span>}
            </p>
          )}

          {/* Differentiator tags */}
          {hasTags && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {verified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rausch bg-rausch/10 px-2 py-0.5 rounded-full">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified
                </span>
              )}
              {noBrokerage && (
                <span className="text-[11px] font-medium text-ink bg-surface-soft px-2 py-0.5 rounded-full">
                  No brokerage
                </span>
              )}
              {furnishing && (
                <span className="text-[11px] text-muted bg-surface-soft px-2 py-0.5 rounded-full">
                  {furnishing}
                </span>
              )}
              {availableFrom && (
                <span className="text-[11px] text-muted bg-surface-soft px-2 py-0.5 rounded-full">
                  {availableFrom}
                </span>
              )}
            </div>
          )}

          {/* Amenity pills */}
          <div className="flex flex-wrap gap-1 mt-2">
            {amenities.slice(0, 3).map((a) => (
              <span key={a} className="text-[12px] text-muted bg-surface-soft px-2 py-0.5 rounded-full">
                {a}
              </span>
            ))}
          </div>

          {/* Price */}
          <p className="mt-2 text-[15px] text-ink">
            <span className="font-semibold">{price}</span>
          </p>

          {/* Contact CTA — only on category listing pages */}
          {showCta && (
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex-1 py-2 text-sm font-semibold text-white bg-rausch rounded-[8px] hover:bg-rausch-active active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2"
              >
                Contact owner
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex-1 py-2 text-sm font-medium text-ink border border-hairline rounded-[8px] hover:bg-surface-soft active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                Schedule visit
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
