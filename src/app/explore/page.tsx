"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import ListingCard from "@/components/ListingCard";
import PageLayout from "@/components/PageLayout";
import { apiClient } from "@/lib/apiClient";
import {
  World,
  CategoryDef,
  categoriesForWorld,
  getCategory,
  LISTINGS,
  Listing,
} from "@/lib/categories";

// Trust proof-points — mirrors the home page strip so Explore feels of-a-piece.
const trustPoints = [
  {
    title: "Verified listings",
    sub: "Checked by our team",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Direct deals",
    sub: "Deal direct with owners",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
  },
  {
    title: "Rated 4.6★",
    sub: "By 12,000+ users",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    title: "Housing + Jobs",
    sub: "All in one place",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const WORLDS: { value: World; label: string }[] = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "stay", label: "Stays" },
];

function CategoryTile({ cat, count }: { cat: CategoryDef; count: number }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  return (
    <Link
      href={`/c/${cat.slug}`}
      className="group relative block w-full aspect-[4/3] rounded-[14px] overflow-hidden hover-lift hover:shadow-airbnb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
      aria-label={`${cat.label} — ${count} ${cat.resultNoun}`}
    >
      {/* Background Image */}
      {cat.image ? (
        <>
          {!imgLoaded && <div className="absolute inset-0 skeleton" aria-hidden="true" />}
          <Image
            src={cat.image}
            alt={cat.label}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover photo-enhance transition-transform duration-500 ease-out group-hover:scale-105"
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient}`} />
      )}

      {/* Dark gradient scrim for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      {/* Content overlayed on the bottom */}
      <div className="absolute inset-x-0 bottom-0 p-3.5 flex flex-col justify-end text-left">
        <h3 className="text-sm font-semibold text-white tracking-tight leading-tight group-hover:underline">
          {cat.label}
        </h3>
        <p className="text-[10px] text-white/75 mt-0.5 line-clamp-1 leading-normal">
          {cat.subtitle}
        </p>
        <div className="mt-2 flex">
          <span className="inline-block bg-white/20 backdrop-blur-[2px] text-white text-[9px] font-semibold px-2 py-0.5 rounded-full border border-white/10 shadow-airbnb">
            {count} {cat.resultNoun}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ExplorePage() {
  const [world, setWorld] = useState<World>("residential");
  const [listings, setListings] = useState<Listing[]>(LISTINGS);

  // Force muted autoplay on mount — React doesn't reliably apply the `muted`
  // property on first render, which makes browsers block autoplay.
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => { });
  }, []);

  useEffect(() => {
    apiClient.get("/listings")
      .then((res) => {
        if (res.data && res.data.success && res.data.data.length > 0) {
          setListings(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch listings for explore page:", err);
      });
  }, []);

  const getCount = (slug: string) => {
    return listings.filter((l) => l.category === slug).length;
  };

  const tiles = categoriesForWorld(world);

  // Compute popular listings dynamically
  const popular = useMemo(() => {
    const popularIds = ["6", "9", "1", "13", "16", "11"];
    const matched = listings.filter((l) => popularIds.includes(String(l.id)));
    if (matched.length > 0) return matched.slice(0, 6);
    return listings.slice(0, 6);
  }, [listings]);

  return (
    <>
      {/* SVG filter definition for the line-art effect */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <filter id="line-art">
          {/* Step 1: Grayscale conversion */}
          <feColorMatrix
            type="matrix"
            values="0.2126 0.7152 0.0722 0 0
                    0.2126 0.7152 0.0722 0 0
                    0.2126 0.7152 0.0722 0 0
                    0      0      0      1 0"
          />
          {/* Step 2: Smooth out noise */}
          <feGaussianBlur stdDeviation="0.8" result="blurred" />
          {/* Step 3: Edge detection (doubled strength to make lines thicker) */}
          <feConvolveMatrix
            order="3"
            kernelMatrix="-2 -2 -2
                          -2 16 -2
                          -2 -2 -2"
            preserveAlpha="true"
            in="blurred"
            result="edges"
          />
          {/* Step 4: Increase contrast and thickness of lines */}
          <feComponentTransfer in="edges">
            <feFuncR type="linear" slope="4.5" intercept="-0.1" />
            <feFuncG type="linear" slope="4.5" intercept="-0.1" />
            <feFuncB type="linear" slope="4.5" intercept="-0.1" />
          </feComponentTransfer>
        </filter>
      </svg>

      {/* Full-bleed hero video — rendered as dark line-art on a warm light yellow background */}
      <section
        aria-label="Explore FindWay"
        className="relative overflow-hidden w-full h-[78vh] min-h-[480px]"
        style={{ backgroundColor: "#FFFDD0" }}
      >
        <video
          ref={videoRef}
          src="/videos/explore-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 w-full h-full object-cover bg-transparent"
          style={{ filter: "url(#line-art) invert(1) contrast(200%)", mixBlendMode: "multiply", opacity: 0.95 }}
        />
        {/* Soft warm scrim so the bottom transition is seamless and clean */}
        <div 
          aria-hidden="true" 
          className="absolute inset-0 pointer-events-none" 
          style={{ backgroundImage: "linear-gradient(to top, #FFFDD0 0%, rgba(255, 253, 208, 0.2) 60%, transparent 100%)" }}
        />
        {/* Search bar inside the video frame, hugging its bottom edge */}
        <div className="absolute inset-x-0 bottom-3 md:bottom-4 z-10 px-4 md:px-6 lg:px-10">
          <div className="max-w-[680px] mx-auto">
            <SearchBar hideTabs glass dropdownUp />
          </div>
        </div>
      </section>

      <PageLayout>
      {/* Residential | Commercial | Stays segmented toggle */}
      <div className="flex justify-center pt-7 mb-6">
        <div
          role="group"
          aria-label="Choose property world"
          className="inline-flex items-center gap-1 bg-surface-soft border border-hairline-soft rounded-full p-1"
        >
          {WORLDS.map((w) => {
            const active = world === w.value;
            return (
              <button
                key={w.value}
                type="button"
                onClick={() => setWorld(w.value)}
                aria-pressed={active}
                className={`px-4 sm:px-5 md:px-6 py-2 text-sm font-semibold rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
                  active ? "bg-ink text-white scale-105 shadow-md" : "text-muted hover:text-ink hover:scale-102 hover:bg-surface-soft"
                }`}
              >
                {w.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category tiles — re-keyed on world so the grid re-animates on toggle */}
      <section aria-label={`${world} categories`} className="mb-12">
        <div
          key={world}
          className="flex flex-wrap justify-center gap-4 animate-fade-up"
        >
          {tiles.map((cat) => (
            <div key={cat.slug} className="w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)] xl:w-[190px] shrink-0">
              <CategoryTile cat={cat} count={getCount(cat.slug)} />
            </div>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section aria-label="Why renters trust FindWay" className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline-soft rounded-[14px] overflow-hidden border border-hairline-soft">
          {trustPoints.map((point) => (
            <div key={point.title} className="flex items-start gap-2.5 bg-canvas px-4 py-4 hover:bg-surface-soft hover:scale-[1.01] transition-all duration-300 group cursor-default">
              <span className="text-rausch shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300">{point.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink leading-tight group-hover:text-rausch transition-colors duration-300">{point.title}</p>
                <p className="text-xs text-muted mt-0.5">{point.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular near you — horizontal ListingCard rail */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[22px] md:text-[26px] font-bold tracking-tight text-ink">Popular near you</h2>
          <Link href="/c/rent" className="text-sm text-ink font-medium underline underline-offset-2">
            See all
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide">
          {popular.map((listing) => (
            <div key={listing.id} className="min-w-[260px] md:min-w-0">
              <ListingCard {...listing} image={listing.image || getCategory(listing.category)?.image} />
            </div>
          ))}
        </div>
      </section>
      </PageLayout>
    </>
  );
}
