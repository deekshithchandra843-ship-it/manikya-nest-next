"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import ListingCard from "@/components/ListingCard";
import PageLayout from "@/components/PageLayout";
import { apiClient } from "@/lib/apiClient";
import dynamic from "next/dynamic";

const ListingsMap = dynamic(() => import("@/components/ListingsMap"), {
  ssr: false,
});

const filterChips = [
  "Rental flat", "PG/Hostel", "Co-living", "1 BHK", "2 BHK", "Homestay",
  "Furnished", "Near metro", "Wi-Fi", "Meals",
];

interface Listing {
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
  noBrokerage?: boolean;
  furnishing?: string;
  availableFrom?: string;
  image?: string;
}

const listings: Listing[] = [
  { id: 1, title: "Green Meadows PG for Men", location: "Koramangala, Bengaluru", metroDistance: "500m from metro", price: "₹8,500/mo", rating: 4.5, reviewCount: 128, badge: "PG", amenities: ["AC", "Meals", "Wi-Fi"], verified: true, noBrokerage: true, image: "/categories/pg.jpg" },
  { id: 2, title: "Sunrise Co-living Space", location: "HSR Layout, Bengaluru", metroDistance: "1.2km from metro", price: "₹12,000/mo", rating: 4.7, reviewCount: 89, badge: "Co-living", amenities: ["AC", "Wi-Fi", "Gym"], verified: true, furnishing: "Furnished", image: "/categories/coliving.jpg" },
  { id: 3, title: "Lakeside 1BHK Rental Flat", location: "Indiranagar, Bengaluru", metroDistance: "300m from metro", price: "₹18,500/mo", rating: 4.3, reviewCount: 56, badge: "Flat", amenities: ["AC", "Parking", "Security"], noBrokerage: true, furnishing: "Furnished", availableFrom: "Available now", image: "/categories/rent.jpg" },
  { id: 4, title: "StudyNest Girls Hostel", location: "BTM Layout, Bengaluru", metroDistance: "800m from metro", price: "₹6,200/mo", rating: 4.6, reviewCount: 204, badge: "Hostel", amenities: ["Meals", "Wi-Fi", "Laundry"], verified: true, noBrokerage: true, image: "/categories/pg.jpg" },
  { id: 5, title: "Urban Nest 2BHK", location: "Whitefield, Bengaluru", price: "₹22,000/mo", rating: 4.4, reviewCount: 42, badge: "Flat", amenities: ["AC", "Parking", "Power backup"], furnishing: "Semi-furnished", image: "/categories/rent.jpg" },
  { id: 6, title: "Cozy Homestay near MG Road", location: "MG Road, Bengaluru", metroDistance: "200m from metro", price: "₹15,000/mo", rating: 4.8, reviewCount: 31, badge: "Homestay", amenities: ["AC", "Wi-Fi", "Meals"], verified: true, noBrokerage: true, image: "/categories/homestay.jpg" },
  { id: 7, title: "TechPark PG – Triple Sharing", location: "Electronic City, Bengaluru", metroDistance: "1km from metro", price: "₹5,800/mo", rating: 4.2, reviewCount: 176, badge: "PG", amenities: ["Meals", "Wi-Fi", "Laundry"], noBrokerage: true, image: "/categories/pg.jpg" },
  { id: 8, title: "Elite Co-living Studio", location: "Marathahalli, Bengaluru", price: "₹14,500/mo", rating: 4.6, reviewCount: 63, badge: "Co-living", amenities: ["AC", "Gym", "Wi-Fi"], verified: true, furnishing: "Furnished", image: "/categories/coliving.jpg" },
];

const MAX_BUDGET = 30000;

const SORT_PARAM: Record<string, string> = {
  "Price: Low to High": "price_asc",
  "Price: High to Low": "price_desc",
  Rating: "rating",
};

// Chips that map to whole categories rather than listing attributes.
const CATEGORY_CHIPS: Record<string, string> = {
  "Rental flat": "rent",
  "PG/Hostel": "pg",
  "Co-living": "coliving",
  Homestay: "homestay",
};
const AMENITY_CHIPS = ["Wi-Fi", "Meals"];

/** Translates the chip/budget/sort UI state into API query params. */
function buildQuery(activeFilters: string[], budget: number, sortBy: string): string {
  const params = new URLSearchParams();
  const categories: string[] = [];
  const amenities: string[] = [];
  const chips: string[] = [];

  for (const chip of activeFilters) {
    if (CATEGORY_CHIPS[chip]) categories.push(CATEGORY_CHIPS[chip]);
    else if (AMENITY_CHIPS.includes(chip)) amenities.push(chip);
    else if (chip === "Near metro") params.set("nearMetro", "true");
    else if (chip === "Furnished") params.set("furnishing", "furnished");
    else chips.push(chip);
  }

  if (categories.length) params.set("category", categories.join(","));
  if (amenities.length) params.set("amenities", amenities.join(","));
  if (chips.length) params.set("chips", chips.join(","));
  if (budget < MAX_BUDGET) params.set("maxPrice", String(budget));
  if (SORT_PARAM[sortBy]) params.set("sort", SORT_PARAM[sortBy]);
  return params.toString();
}

export default function FindNest() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [budget, setBudget] = useState(MAX_BUDGET);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [sortBy, setSortBy] = useState("Relevance");
  const [dbListings, setDbListings] = useState<Listing[]>(listings);

  // Filtering and sorting now happen server-side; refetch when they change.
  useEffect(() => {
    const query = buildQuery(activeFilters, budget, sortBy);
    const timer = setTimeout(() => {
      apiClient.get(`/listings${query ? `?${query}` : ""}`)
        .then((res) => {
          if (res.data && res.data.success) {
            setDbListings(res.data.data);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch listings for find-nest page:", err);
        });
    }, 250); // debounce the budget slider
    return () => clearTimeout(timer);
  }, [activeFilters, budget, sortBy]);

  const toggleFilter = (chip: string) =>
    setActiveFilters((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );

  const clearAll = () => {
    setActiveFilters([]);
    setBudget(MAX_BUDGET);
  };

  const budgetActive = budget < MAX_BUDGET;
  const hasAppliedFilters = activeFilters.length > 0 || budgetActive;

  const filtered = dbListings;

  return (
    <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Find Nest" }]}>
      {/* Discovery hub CTA */}
      <Link
        href="/explore"
        className="flex items-center justify-between gap-3 mb-4 rounded-[14px] border border-hairline-soft bg-surface-soft px-4 py-3 hover:bg-surface-strong transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        <span className="text-sm text-ink">
          <span className="font-semibold">Browse by category</span>
          <span className="text-muted"> — rent, buy, PG, offices &amp; more</span>
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-rausch shrink-0">
          Explore
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </Link>

      {/* Search bar */}
      <div className="mb-4">
        <SearchBar />
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-20 z-30 -mx-4 md:-mx-6 lg:-mx-10 px-4 md:px-6 lg:px-10 bg-canvas/90 backdrop-blur-md border-b border-hairline-soft mb-4">
        <div className="flex gap-2 overflow-x-auto pt-1 pb-3 scrollbar-hide" role="group" aria-label="Filter listings">
          {filterChips.map((chip) => {
            const active = activeFilters.includes(chip);
            return (
              <button
                key={chip}
                type="button"
                onClick={() => toggleFilter(chip)}
                aria-pressed={active}
                className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-medium rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
                  active
                    ? "bg-rausch/10 border-rausch text-rausch"
                    : "bg-canvas border-hairline text-body hover:border-ink"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls row: count + budget range + sort + (mobile) view toggle */}
      <div className="flex flex-col gap-3 mb-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted">
          <span className="font-semibold text-ink">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "home" : "homes"} in Koramangala, Bengaluru
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {/* Budget range */}
          <label className="flex items-center gap-2 text-sm text-muted">
            <span className="whitespace-nowrap">
              Up to <span className="font-semibold text-ink">₹{budget.toLocaleString("en-IN")}</span>
            </span>
            <input
              type="range"
              min={3000}
              max={MAX_BUDGET}
              step={500}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              aria-label="Maximum monthly budget"
              className="w-28 md:w-36 accent-rausch cursor-pointer"
            />
          </label>

          {/* Sort */}
          <label className="flex items-center gap-1.5 text-sm text-muted">
            <span className="sr-only md:not-sr-only">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort listings"
              className="text-sm text-body border border-hairline rounded-[8px] px-2.5 py-1.5 bg-canvas outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ink"
            >
              <option>Relevance</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating</option>
            </select>
          </label>

          {/* List/Map toggle (mobile only — desktop shows both) */}
          <div className="flex md:hidden border border-hairline rounded-[8px] overflow-hidden" role="group" aria-label="Switch between list and map">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-pressed={viewMode === "list"}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-ink text-white" : "bg-canvas text-muted hover:text-ink"}`}
              aria-label="List view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              aria-pressed={viewMode === "map"}
              className={`p-2 transition-colors ${viewMode === "map" ? "bg-ink text-white" : "bg-canvas text-muted hover:text-ink"}`}
              aria-label="Map view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Applied filters */}
      {hasAppliedFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {activeFilters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => toggleFilter(f)}
              className="inline-flex items-center gap-1.5 bg-surface-soft text-ink text-xs font-medium pl-3 pr-2 py-1.5 rounded-full hover:bg-surface-strong transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              aria-label={`Remove ${f} filter`}
            >
              {f}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          ))}
          {budgetActive && (
            <button
              type="button"
              onClick={() => setBudget(MAX_BUDGET)}
              className="inline-flex items-center gap-1.5 bg-surface-soft text-ink text-xs font-medium pl-3 pr-2 py-1.5 rounded-full hover:bg-surface-strong transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              aria-label="Remove budget filter"
            >
              Up to ₹{budget.toLocaleString("en-IN")}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-rausch hover:text-rausch-active underline underline-offset-2 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch rounded-sm"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Split layout: list (left) + map (right) on desktop */}
      <div className="md:grid md:grid-cols-[1fr_minmax(0,40%)] lg:grid-cols-[1fr_minmax(0,440px)] md:gap-6 md:items-start">
        {/* List column */}
        <div className={viewMode === "map" ? "hidden md:block" : "block"}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-hairline-soft rounded-[14px] bg-surface-soft">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-muted-soft mb-3" aria-hidden="true">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-base font-semibold text-ink mb-1">No homes match these filters</p>
              <p className="text-sm text-muted mb-4">Try widening your budget or removing a filter.</p>
              <button
                type="button"
                onClick={clearAll}
                className="px-4 py-2 text-sm font-medium text-white bg-rausch rounded-[8px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-hairline-soft">
              {filtered.map((listing) => (
                <li key={listing.id}>
                  <Link
                    href={`/listing/${listing.id}`}
                    className="group flex gap-3 py-3 px-2 -mx-2 rounded-[14px] hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                  >
                    {/* Thumbnail */}
                    <div className="w-24 h-24 bg-surface-strong rounded-[14px] shrink-0 overflow-hidden relative">
                      {listing.image ? (
                        <Image
                          src={listing.image}
                          alt={`${listing.title} thumbnail`}
                          fill
                          sizes="96px"
                          className="object-cover photo-enhance transition-transform duration-500 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-muted-soft" aria-hidden="true">
                            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-10h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-ink truncate">{listing.title}</h3>
                            <span className="text-[10px] font-medium text-muted bg-surface-soft px-1.5 py-0.5 rounded-full shrink-0">
                              {listing.badge}
                            </span>
                          </div>
                          <p className="text-xs text-muted mt-0.5 truncate">
                            {listing.location}
                            {listing.metroDistance && <span> · {listing.metroDistance}</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 text-xs text-ink shrink-0">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="#222222" stroke="#222222" strokeWidth="1" aria-hidden="true">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span>{listing.rating}</span>
                        </div>
                      </div>

                      {/* Differentiator tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {listing.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rausch bg-rausch/10 px-2 py-0.5 rounded-full">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Verified
                          </span>
                        )}

                        {listing.furnishing && (
                          <span className="text-[10px] text-muted bg-surface-soft px-2 py-0.5 rounded-full">{listing.furnishing}</span>
                        )}
                      </div>

                      <span className="text-sm font-semibold text-ink mt-auto pt-1.5">{listing.price}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* Desktop grid of full cards below the list for richer browsing */}
          {filtered.length > 0 && (
            <div className="hidden lg:grid lg:grid-cols-2 gap-4 mt-6">
              {filtered.map((listing) => (
                <ListingCard key={`grid-${listing.id}`} {...listing} image={listing.image} />
              ))}
            </div>
          )}
        </div>

        {/* Map column */}
        <div className={`${viewMode === "list" ? "hidden md:block" : "block"} w-full md:w-auto`}>
          <div className="md:sticky md:top-40 h-[320px] md:h-[calc(100vh-12rem)] border border-hairline-soft rounded-[14px] overflow-hidden bg-surface-soft shadow-sm">
            <ListingsMap listings={dbListings} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
