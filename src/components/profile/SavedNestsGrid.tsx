"use client";
import Image from "next/image";
import Link from "next/link";
import type { SavedNest } from "./profileData";

export default function SavedNestsGrid({ nests }: { nests: SavedNest[] }) {
  if (nests.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-hairline rounded-[18px] bg-surface-soft p-8 animate-fade-up">
        <div className="w-12 h-12 rounded-full bg-rausch/10 text-rausch flex items-center justify-center mx-auto mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-ink mb-1">Your wishlist is empty</h3>
        <p className="text-sm text-muted max-w-[280px] mx-auto mb-5">
          Browse rental listings, PGs, or homes and save them to view them here later.
        </p>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-rausch text-white text-xs font-semibold rounded-full hover:bg-rausch-active transition-colors shadow-airbnb"
        >
          Explore Nests
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-ink flex items-center gap-2">
          <span>Saved Wishlist</span>
          <span className="text-xs bg-rausch/10 text-rausch px-2 py-0.5 rounded-full font-semibold">
            {nests.length} items
          </span>
        </h3>
        <Link href="/explore" className="text-xs font-semibold text-rausch hover:underline">
          Find more ›
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {nests.map((nest) => (
          <div
            key={nest.id}
            className="group bg-canvas border border-hairline rounded-[18px] overflow-hidden shadow-3d-soft hover:shadow-airbnb hover-lift transition-all duration-300 flex flex-col"
          >
            {/* Image container */}
            <div className="relative aspect-[16/10] bg-surface-strong overflow-hidden">
              <Image
                src={nest.image}
                alt={nest.title}
                fill
                sizes="(max-width: 640px) 100vw, 360px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Badge & Rating */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-white bg-rausch px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {nest.badge}
                </span>
              </div>
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-0.5 text-[11px] font-bold text-ink shadow-sm">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {nest.rating}
              </div>
            </div>

            {/* Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-ink text-sm sm:text-base leading-snug group-hover:text-rausch transition-colors line-clamp-1">
                  {nest.title}
                </h4>
                <p className="text-xs text-muted flex items-center gap-1 mt-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {nest.location}
                </p>
                <div className="mt-3">
                  <span className="text-sm font-extrabold text-ink">{nest.price}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-hairline-soft">
                <Link
                  href={`/listing/${nest.id}`}
                  className="flex-1 text-center py-2 text-xs font-semibold text-ink border border-hairline rounded-[8px] hover:bg-surface-soft transition-colors"
                >
                  View info
                </Link>
                <button className="flex-1 py-2 text-xs font-semibold text-white bg-ink rounded-[8px] hover:opacity-90 transition-opacity">
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
