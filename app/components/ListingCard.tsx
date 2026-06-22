"use client";
import { useState } from "react";
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
}: ListingCardProps) {
  const [saved, setSaved] = useState(false);

  return (
    <Link href={`/listing/${id}`} className="block group">
      <div className="bg-canvas rounded-[14px] transition-shadow hover:shadow-airbnb">
        {/* Image placeholder */}
        <div className="relative h-44 bg-surface-strong rounded-[14px] overflow-hidden flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#929292" strokeWidth="1.2">
            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-10h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" />
          </svg>
          {/* Save icon */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSaved(!saved);
            }}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-transform hover:scale-110"
            aria-label="Save listing"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill={saved ? "#ff385c" : "rgba(0,0,0,0.5)"}
              stroke="#ffffff"
              strokeWidth="2"
            >
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          {/* Guest-favorite style badge */}
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
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#222222" stroke="#222222" strokeWidth="1">
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
        </div>
      </div>
    </Link>
  );
}
