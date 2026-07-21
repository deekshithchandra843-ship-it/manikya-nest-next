"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";

interface ListingCardProps {
  id: string | number;
  title: string;
  location: string;
  metroDistance?: string;
  price: string;
  rating: number;
  reviewCount: number;
  badge: string;
  amenities: string[];
  verified?: boolean;
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
  roomConfigurations?: any[];
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
  furnishing,
  availableFrom,
  area,
  spec,
  showCta,
  image,
  roomConfigurations,
}: ListingCardProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const toggleSaved = () => {
    const next = !saved;
    setSaved(next);
    const req = next
      ? apiClient.post("/wishlist", { listingId: String(id) })
      : apiClient.delete(`/wishlist/${id}`);
    req
      .then(() => {
        if (next) {
          apiClient.post("/events", { listingId: String(id), eventType: "wishlist_add" }).catch(() => {});
        }
      })
      .catch((err) => {
        setSaved(!next);
        if (err?.response?.status === 401) router.push("/login");
      });
  };

  const hasTags = verified || furnishing || availableFrom;

  return (
    <Link
      href={`/listing/${id}`}
      className="flex flex-col h-full group focus-visible:outline-none"
    >
      <div className="flex flex-col justify-between h-full flex-grow bg-canvas rounded-[16px] hover:-translate-y-1.5 hover:shadow-airbnb transition-all duration-300 ease-out">
        <div>
          {/* Image Container with Custom Aspect Ratio */}
          <div className="relative aspect-[16/10] w-full bg-surface-strong rounded-[16px] overflow-hidden flex items-center justify-center shadow-inner">
            {image ? (
              <>
                {!imgLoaded && <div className="absolute inset-0 skeleton" aria-hidden="true" />}
                <Image
                  src={image}
                  alt={`${title} — ${badge} in ${location}`}
                  fill
                  sizes="(max-width: 640px) 280px, (max-width: 768px) 340px, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  onLoad={() => setImgLoaded(true)}
                  loading="lazy"
                />
              </>
            ) : (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-muted-soft" aria-hidden="true">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-10h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" />
              </svg>
            )}

            {/* Glassmorphic Save button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSaved();
              }}
              className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center bg-white/80 backdrop-blur-md border border-white/20 shadow-md transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none rounded-full z-10"
              aria-label={saved ? "Remove from saved" : "Save listing"}
              aria-pressed={saved}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={saved ? "#FF5A5F" : "none"}
                stroke={saved ? "#FF5A5F" : "#222222"}
                strokeWidth="2.5"
                aria-hidden="true"
                className="transition-colors duration-200"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>

            {/* Creative Tag Overlay */}
            <span className={`absolute top-2.5 left-2.5 text-[8px] font-extrabold px-2.5 py-1 rounded-[6px] uppercase tracking-wider shadow-sm select-none z-10 ${
              badge.toLowerCase().includes("pg") || badge.toLowerCase().includes("hostel") ? "bg-rausch text-white" :
              badge.toLowerCase().includes("co-living") || badge.toLowerCase().includes("coliving") || badge.toLowerCase().includes("co-live") ? "bg-indigo-600 text-white" :
              badge.toLowerCase().includes("flat") || badge.toLowerCase().includes("apartment") || badge.toLowerCase().includes("house") || badge.toLowerCase().includes("villa") || badge.toLowerCase().includes("standalone") || badge.toLowerCase().includes("individual floor") || badge.toLowerCase().includes("rent") || badge.toLowerCase().includes("buy") ? "bg-emerald-600 text-white" :
              "bg-neutral-900 text-white"
            }`}>
              {badge}
            </span>
          </div>

          {/* Details Content */}
          <div className="pt-3 px-1 pb-2">
            {/* Row 1: Title */}
            <h3 className="text-[16px] font-bold text-neutral-950 leading-tight line-clamp-1 group-hover:text-rausch transition-colors duration-300">
              {title}
            </h3>

            {/* Row 2: Price & Rating (Top Prominence) */}
            <div className="flex items-baseline justify-between mt-2 mb-1">
              <p className="text-[16px] font-extrabold text-rausch">
                {price}
              </p>
              <div className="flex items-center gap-0.5 text-xs font-semibold text-neutral-950 shrink-0 bg-neutral-100 px-2 py-0.5 rounded-[6px]">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#EAB308" stroke="#EAB308" strokeWidth="1" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>{rating.toFixed(1)}</span>
                <span className="text-neutral-600 font-normal ml-0.5">({reviewCount})</span>
              </div>
            </div>

            {/* Row 3: Location & Metro */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-800 mt-2">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-600 shrink-0">
                <path d="M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" />
              </svg>
              <p className="truncate font-medium">
                {location}
                {metroDistance && <span className="text-neutral-500 font-normal"> · {metroDistance}</span>}
              </p>
            </div>

            {/* Row 4: Specs & Area */}
            {(spec || area) && (
              <p className="text-[12px] font-bold text-neutral-800 mt-2 bg-neutral-50 px-2.5 py-1 rounded-[8px] inline-block border border-neutral-200">
                {spec}
                {spec && area && <span className="text-neutral-500 mx-1.5">|</span>}
                {area && <span className="text-neutral-950">{area}</span>}
              </p>
            )}

            {/* PG/Co-living Availability and Pricing Breakdown */}
            {roomConfigurations && roomConfigurations.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-col gap-1.5 w-full">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 select-none">
                  🛏️ Available Beds
                </span>
                <div className="flex flex-wrap gap-1">
                  {roomConfigurations.map((rc) => {
                    const isFull = rc.availableBeds <= 0;
                    const cleanType = rc.sharingType.replace(/^\w/, (c: string) => c.toUpperCase()) + " Sharing";
                    return (
                      <span
                        key={rc.id || rc.sharingType}
                        className={`text-[9px] font-black px-2 py-0.5 rounded-[6px] border select-none ${
                          isFull
                            ? "bg-neutral-50 border-neutral-200 text-neutral-400"
                            : "bg-emerald-50 border-emerald-100 text-emerald-700"
                        }`}
                      >
                        {cleanType}: {isFull ? "Full" : `${rc.availableBeds} Bed${rc.availableBeds > 1 ? "s" : ""} Available`}
                      </span>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] font-bold text-neutral-600 mt-0.5">
                  {roomConfigurations.map((rc) => {
                    const cleanType = rc.sharingType.replace(/^\w/, (c: string) => c.toUpperCase());
                    return (
                      <span key={rc.id || rc.sharingType} className="bg-neutral-50 border border-neutral-200 rounded-[4px] px-1.5 py-0.5 shrink-0">
                        {cleanType} - <span className="text-rausch font-black">₹{rc.pricePerBed.toLocaleString("en-IN")}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Row 5: Differentiator tags */}
            {hasTags && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                {verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rausch bg-rausch/10 px-2.5 py-1 rounded-[8px]">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verified
                  </span>
                )}
                {furnishing && (
                  <span className="text-[10px] font-bold text-neutral-750 bg-neutral-100 px-2.5 py-1 rounded-[8px] border border-neutral-200/50">
                    {furnishing}
                  </span>
                )}
                {availableFrom && (
                  <span className="text-[10px] font-bold text-neutral-750 bg-neutral-100 px-2.5 py-1 rounded-[8px] border border-neutral-200/50">
                    {availableFrom}
                  </span>
                )}
              </div>
            )}

            {/* Row 6: Amenities Section */}
            <div className="flex flex-wrap gap-1 mt-2.5">
              {amenities.slice(0, 3).map((a) => (
                <span key={a} className="text-[10px] font-bold text-neutral-700 bg-neutral-100/80 px-2 py-0.5 rounded-[6px] border border-neutral-200/40">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Block — only on category listing pages */}
        {showCta && (
          <div className="mt-2 pt-2.5 px-1 border-t border-hairline flex gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex-1 py-1.5 text-[11px] font-bold text-white bg-rausch rounded-[8px] hover:bg-rausch-active active:scale-[0.97] transition-all"
            >
              Contact
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex-1 py-1.5 text-[11px] font-bold text-neutral-850 border border-neutral-200 rounded-[8px] hover:bg-surface active:scale-[0.97] transition-all"
            >
              Schedule
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}
