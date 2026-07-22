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
    title: "Verified Landlords",
    sub: "Deal with trusted hosts",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1" />
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
      className="group flex flex-col w-full bg-white border border-neutral-200/70 rounded-[20px] overflow-hidden shadow-[0_3px_10px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:border-neutral-300/80 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      aria-label={`${cat.label} — ${count} ${cat.resultNoun}`}
    >
      {/* Category Image Header */}
      <div className="relative aspect-[16/10] w-full bg-surface-strong overflow-hidden flex items-center justify-center shadow-inner">
        {cat.image ? (
          <>
            {!imgLoaded && <div className="absolute inset-0 skeleton" aria-hidden="true" />}
            <Image
              src={cat.image}
              alt={cat.label}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              onLoad={() => setImgLoaded(true)}
              loading="lazy"
            />
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient}`} />
        )}

        {/* Floating Count Badge */}
        <span className="absolute top-2.5 left-2.5 bg-neutral-900/90 backdrop-blur-sm text-white text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-[6px] shadow-sm">
          {count} Nest{count !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Details Container */}
      <div className="p-3 text-left bg-white border-t border-neutral-100">
        <h3 className="text-[13px] font-bold text-neutral-900 leading-tight tracking-tight group-hover:text-rausch transition-colors duration-300">
          {cat.label}
        </h3>
        <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1 font-medium leading-normal">
          {cat.subtitle}
        </p>
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
        if (res.data && res.data.success) {
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

  // Compute category-specific popular listings dynamically
  const popularFlats = useMemo(() => {
    return listings.filter((l) => ["rent", "buy", "coliving"].includes(l.category)).slice(0, 6);
  }, [listings]);

  const popularPGs = useMemo(() => {
    return listings.filter((l) => ["pg", "hostel"].includes(l.category)).slice(0, 6);
  }, [listings]);

  const popularOffices = useMemo(() => {
    return listings.filter((l) => ["commercial-office", "coworking"].includes(l.category)).slice(0, 6);
  }, [listings]);

  const popularRetail = useMemo(() => {
    return listings.filter((l) => ["commercial-shop", "warehouse", "land"].includes(l.category)).slice(0, 6);
  }, [listings]);

  const popularHomestays = useMemo(() => {
    return listings.filter((l) => ["homestay", "resort"].includes(l.category)).slice(0, 6);
  }, [listings]);

  const popularHotels = useMemo(() => {
    return listings.filter((l) => ["hotel", "service-apartment"].includes(l.category)).slice(0, 6);
  }, [listings]);

  return (
    <div className="bg-[#f6fcfd] w-full min-h-screen">
      <PageLayout className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 pt-24 md:pt-28 pb-20 md:pb-8">
      {/* Residential | Commercial | Stays segmented toggle */}
      <div className="flex justify-center pt-7 mb-6">
        <div
          role="group"
          aria-label="Choose property world"
          className="inline-flex items-center gap-1 bg-white border border-neutral-200/80 rounded-full p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
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
                  active ? "bg-neutral-900 text-white scale-105 shadow-md" : "text-neutral-500 hover:text-neutral-950 hover:scale-[1.02] hover:bg-neutral-50"
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
            <div key={cat.slug} className="w-full sm:w-[calc(50%-10px)] md:w-[calc(33.333%-12px)] lg:w-[calc(25%-14px)] xl:w-[280px] shrink-0">
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

      {/* Dynamic Popular listings sections based on selected world */}
      {world === "residential" && (
        <>
          {/* Popular Flats & Apartments */}
          {popularFlats.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[22px] md:text-[26px] font-bold tracking-tight text-ink">Popular Flats & Apartments</h2>
                <Link
                  href="/c/rent"
                  className="group inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-rausch bg-rausch/5 border border-rausch/10 hover:bg-rausch hover:text-white rounded-full transition-all duration-300 shadow-sm hover:shadow active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch"
                >
                  <span>See all</span>
                  <svg
                    className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide">
                {popularFlats.map((listing) => (
                  <div key={listing.id} className="min-w-[260px] md:min-w-0">
                    <ListingCard {...listing} image={listing.image || getCategory(listing.category)?.image} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Popular PGs & Hostels */}
          {popularPGs.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[22px] md:text-[26px] font-bold tracking-tight text-ink">Popular PGs & Hostels</h2>
                <Link
                  href="/c/pg"
                  className="group inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-rausch bg-rausch/5 border border-rausch/10 hover:bg-rausch hover:text-white rounded-full transition-all duration-300 shadow-sm hover:shadow active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch"
                >
                  <span>See all</span>
                  <svg
                    className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide">
                {popularPGs.map((listing) => (
                  <div key={listing.id} className="min-w-[260px] md:min-w-0">
                    <ListingCard {...listing} image={listing.image || getCategory(listing.category)?.image} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {world === "commercial" && (
        <>
          {/* Popular Offices & Co-working */}
          {popularOffices.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[22px] md:text-[26px] font-bold tracking-tight text-ink">Popular Offices & Co-working</h2>
                <Link
                  href="/c/coworking"
                  className="group inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-rausch bg-rausch/5 border border-rausch/10 hover:bg-rausch hover:text-white rounded-full transition-all duration-300 shadow-sm hover:shadow active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch"
                >
                  <span>See all</span>
                  <svg
                    className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide">
                {popularOffices.map((listing) => (
                  <div key={listing.id} className="min-w-[260px] md:min-w-0">
                    <ListingCard {...listing} image={listing.image || getCategory(listing.category)?.image} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Popular Retail, Plots & Storage */}
          {popularRetail.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[22px] md:text-[26px] font-bold tracking-tight text-ink">Popular Shops & Warehouses</h2>
                <Link
                  href="/c/commercial-shop"
                  className="group inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-rausch bg-rausch/5 border border-rausch/10 hover:bg-rausch hover:text-white rounded-full transition-all duration-300 shadow-sm hover:shadow active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch"
                >
                  <span>See all</span>
                  <svg
                    className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide">
                {popularRetail.map((listing) => (
                  <div key={listing.id} className="min-w-[260px] md:min-w-0">
                    <ListingCard {...listing} image={listing.image || getCategory(listing.category)?.image} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {world === "stay" && (
        <>
          {/* Popular Homestays & Resorts */}
          {popularHomestays.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[22px] md:text-[26px] font-bold tracking-tight text-ink">Popular Homestays & Resorts</h2>
                <Link
                  href="/c/homestay"
                  className="group inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-rausch bg-rausch/5 border border-rausch/10 hover:bg-rausch hover:text-white rounded-full transition-all duration-300 shadow-sm hover:shadow active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch"
                >
                  <span>See all</span>
                  <svg
                    className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide">
                {popularHomestays.map((listing) => (
                  <div key={listing.id} className="min-w-[260px] md:min-w-0">
                    <ListingCard {...listing} image={listing.image || getCategory(listing.category)?.image} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Popular Hotels & Service Apartments */}
          {popularHotels.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[22px] md:text-[26px] font-bold tracking-tight text-ink">Popular Hotels & Serviced Suites</h2>
                <Link
                  href="/c/hotel"
                  className="group inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-rausch bg-rausch/5 border border-rausch/10 hover:bg-rausch hover:text-white rounded-full transition-all duration-300 shadow-sm hover:shadow active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch"
                >
                  <span>See all</span>
                  <svg
                    className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide">
                {popularHotels.map((listing) => (
                  <div key={listing.id} className="min-w-[260px] md:min-w-0">
                    <ListingCard {...listing} image={listing.image || getCategory(listing.category)?.image} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
      </PageLayout>
    </div>
  );
}
