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
  const [sharedFeedback, setSharedFeedback] = useState(false);

  const handleShare = () => {
    if (typeof window === "undefined") return;
    const shareUrl = `${window.location.origin}/listing/${id}`;
    if (navigator.share) {
      navigator.share({
        title: title,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setSharedFeedback(true);
      setTimeout(() => setSharedFeedback(false), 2000);
    }
  };

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
      <div className="flex flex-col justify-between h-full flex-grow bg-white border border-neutral-200/70 rounded-[20px] p-3 shadow-[0_3px_10px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:border-neutral-300/80 transition-all duration-300 ease-out">
        <div>
          {/* Image Container with Custom Aspect Ratio */}
          <div className="relative aspect-[16/10] w-full bg-surface-strong rounded-[14px] overflow-hidden flex items-center justify-center shadow-inner">
            {image ? (
              <>
                {!imgLoaded && <div className="absolute inset-0 skeleton" aria-hidden="true" />}
                <Image
                  src={image}
                  alt={`${title} — ${badge} in ${location}`}
                  fill
                  sizes="(max-width: 640px) 280px, (max-width: 768px) 340px, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onLoad={() => setImgLoaded(true)}
                  loading="lazy"
                />
              </>
            ) : (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-muted-soft" aria-hidden="true">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-10h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" />
              </svg>
            )}

            {/* Glassmorphic Share button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleShare();
              }}
              className="absolute top-2.5 right-10 w-7 h-7 flex items-center justify-center bg-white/80 backdrop-blur-md border border-white/20 shadow-md transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none rounded-full z-10"
              aria-label="Share listing"
            >
              {sharedFeedback ? (
                <span className="text-[9px] font-bold text-emerald-600">✓</span>
              ) : (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#222222"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              )}
            </button>

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
          <div className="pt-3 px-1.5 pb-2">
            {/* Row 1: Title & Rating Inline */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[14px] font-bold text-neutral-900 leading-snug line-clamp-1 group-hover:text-rausch transition-colors duration-300">
                {title}
              </h3>
              <div className="flex items-center gap-0.5 text-xs font-bold text-neutral-900 shrink-0 mt-0.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#EAB308" stroke="#EAB308" strokeWidth="1" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>{rating.toFixed(1)}</span>
                <span className="text-neutral-400 font-normal ml-0.5">({reviewCount})</span>
              </div>
            </div>

            {/* Row 2: Location & Metro */}
            <div className="text-[12.5px] text-neutral-500 font-medium space-y-0.5 mt-1.5">
              <p className="truncate flex items-center gap-1">
                <span>{location}</span>
                {metroDistance && <span className="text-neutral-300 font-normal">&middot;</span>}
                {metroDistance && <span className="text-neutral-500 font-normal">{metroDistance.replace("from metro", "").trim()} from metro</span>}
              </p>
              
              {/* Row 3: Specs & Area inline */}
              {(spec || area) && (
                <p className="truncate text-neutral-400 font-normal text-[12px]">
                  {spec}
                  {spec && area && <span className="mx-1">&middot;</span>}
                  {area && <span>{area}</span>}
                </p>
              )}
            </div>

            {/* PG/Co-living Availability and Pricing Breakdown */}
            {roomConfigurations && roomConfigurations.length > 0 && (() => {
              const totalBeds = roomConfigurations.reduce((acc, rc) => acc + (rc.availableBeds || 0), 0);
              const uniqueTypes = Array.from(new Set(roomConfigurations.map(rc => rc.sharingType.toLowerCase().replace(" sharing", ""))));
              const formattedTypes = uniqueTypes
                .map(t => t.charAt(0).toUpperCase() + t.slice(1))
                .reduce((acc, curr, index, arr) => {
                  if (index === 0) return curr;
                  if (index === arr.length - 1) return acc + " & " + curr;
                  return acc + ", " + curr;
                }, "");

              if (totalBeds === 0) {
                return (
                  <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-neutral-450">Fully Booked</span>
                    <span className="text-neutral-400">Join Waitlist</span>
                  </div>
                );
              }

              return (
                <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] font-semibold text-neutral-600">
                  <span className="truncate pr-2">
                    {formattedTypes} Sharing
                  </span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-[4px] shrink-0 border border-emerald-100/60 text-[10px] font-bold">
                    {totalBeds} bed{totalBeds > 1 ? "s" : ""} left
                  </span>
                </div>
              );
            })()}

            {/* Row 4: Price & Differentiator tags */}
            <div className="mt-2.5 pt-2 border-t border-neutral-100/80 flex items-center justify-between">
              <p className="text-[15px] font-black text-neutral-900">
                {price}
              </p>

              {hasTags && (
                <div className="flex items-center gap-1.5">
                  {verified && (
                    <span className="text-[9px] font-extrabold text-rausch bg-rausch/5 px-2 py-0.5 rounded-[4px] border border-rausch/10 uppercase tracking-wider">
                      Verified
                    </span>
                  )}
                  {furnishing && (
                    <span className="text-[9px] font-extrabold text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded-[4px] border border-neutral-200/60 uppercase tracking-wider">
                      {furnishing.replace("furnished", "").trim()}
                    </span>
                  )}
                </div>
              )}
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
