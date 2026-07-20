"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import PageLayout from "@/components/PageLayout";


// Leaflet touches `window`, so the map must never render on the server.
const ListingsMap = dynamic(() => import("@/components/ListingsMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full skeleton rounded-[14px]" aria-hidden="true" />,
});
import ListingCard from "@/components/ListingCard";
import CategorySearchBand from "@/components/CategorySearchBand";
import FiltersDrawer from "@/components/FiltersDrawer";
import { apiClient } from "@/lib/apiClient";
import {
  getCategory,
  listingsForCategory,
  Listing,
} from "@/lib/categories";

const CITY = "Bengaluru";

function formatBudget(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2).replace(/\.00$/, "")} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

const SORT_PARAM: Record<string, string> = {
  "Price: Low to High": "price_asc",
  "Price: High to Low": "price_desc",
  Rating: "rating",
};

/** Translates chip/budget/sort UI state into API query params (matching is server-side now). */
function buildQuery(slug: string, selected: string[], budget: number, maxBudget: number, sortBy: string, baseParams: URLSearchParams): string {
  const params = new URLSearchParams(baseParams);
  params.set("category", slug);
  const chips: string[] = [];

  const baseChips = params.get("chips")?.split(",").map(c => c.trim()).filter(Boolean) || [];

  for (const chip of selected) {
    if (chip.toLowerCase() === "near metro") params.set("nearMetro", "true");
    else chips.push(chip);
  }

  const allChips = [...baseChips, ...chips];
  if (allChips.length) params.set("chips", allChips.join(","));
  else params.delete("chips");

  if (budget > 0 && budget < maxBudget) params.set("maxPrice", String(budget));
  if (SORT_PARAM[sortBy]) params.set("sort", SORT_PARAM[sortBy]);
  return params.toString();
}

/** FindWay's differentiator — surfaces jobs/commute next to the homes. */
function CrossSellCard() {
  return (
    <div className="rounded-[14px] border border-hairline-soft bg-gradient-to-br from-rausch/5 to-luxe/5 p-5">
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-10 h-10 rounded-full bg-rausch/10 text-rausch flex items-center justify-center" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </span>
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-ink">Only on FindWay</h3>
          <p className="text-sm text-muted mt-0.5">
            See the homes alongside the work that pays for them — and how you&apos;ll get there.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-rausch rounded-[8px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2"
            >
              Jobs near these homes
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-[14px]">
          <div className="h-44 rounded-[14px] skeleton" />
          <div className="pt-3 space-y-2">
            <div className="h-4 w-2/3 rounded-full skeleton" />
            <div className="h-3 w-1/2 rounded-full skeleton" />
            <div className="h-3 w-1/4 rounded-full skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = String(params.category);
  const category = getCategory(slug);

  const [baseListings, setBaseListings] = useState<Listing[]>([]);
  const isPg = slug === "pg";
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isPg) {
      const v = videoRef.current;
      if (v) {
        v.muted = true;
        v.play().catch(() => {});
      }
    }
  }, [category, isPg]);
  const [loading, setLoading] = useState(true);
  // Slider bounds come from the initial unfiltered load and stay fixed while
  // filtering, so narrowing the budget doesn't shrink the slider's own range.
  const [bounds, setBounds] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    setLoading(true);
    setBounds([0, 0]);

    const query = new URLSearchParams(searchParams.toString());
    query.set("category", slug);

    const endpoint = query.has("q") ? "/search" : "/listings";
    apiClient.get(`${endpoint}?${query.toString()}`)
      .then((res) => {
        if (res.data && res.data.success) {
          const data: Listing[] = res.data.data;
          setBaseListings(data);
          if (data.length > 0) {
            const prices = data.map((l) => l.priceValue);
            setBounds([Math.min(...prices), Math.max(...prices)]);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch listings for category page, using fallback:", err);
        const fallback = listingsForCategory(slug);
        setBaseListings(fallback);
        if (fallback.length > 0) {
          const prices = fallback.map((l) => l.priceValue);
          setBounds([Math.min(...prices), Math.max(...prices)]);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, searchParams]);

  const [minBudget, maxBudget] = bounds;

  const [selected, setSelected] = useState<string[]>([]);
  const [budget, setBudget] = useState(0);
  const [sortBy, setSortBy] = useState("Relevance");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedSearch, setSavedSearch] = useState(false);

  // Refetch with server-side filters whenever chips/budget/sort change.
  // Also refetches once, unfiltered, when the last filter is cleared.
  const filtersActive =
    selected.length > 0 || (budget > 0 && maxBudget > 0 && budget < maxBudget) || sortBy !== "Relevance";
  const wasActiveRef = useRef(false);
  useEffect(() => {
    if (!filtersActive && !wasActiveRef.current) return;
    wasActiveRef.current = filtersActive;

    const baseParams = new URLSearchParams(searchParams.toString());
    const query = filtersActive
      ? buildQuery(slug, selected, budget, maxBudget, sortBy, baseParams)
      : (() => {
          const q = new URLSearchParams(searchParams.toString());
          q.set("category", slug);
          return q.toString();
        })();

    const endpoint = new URLSearchParams(query).has("q") ? "/search" : "/listings";

    const timer = setTimeout(() => {
      apiClient.get(`${endpoint}?${query}`)
        .then((res) => {
          if (res.data && res.data.success) {
            setBaseListings(res.data.data);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch filtered listings:", err);
        });
    }, 250); // debounce the budget slider
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, budget, sortBy, searchParams]);

  const router = useRouter();

  // Reset filters during render when the category changes (React's recommended
  // pattern over an effect — avoids cascading re-renders).
  const [prevSlug, setPrevSlug] = useState(slug);
  if (prevSlug !== slug) {
    setPrevSlug(slug);
    setSelected([]);
    setBudget(0);
    setSortBy("Relevance");
    setViewMode("list");
    setSavedSearch(false);
  }

  // Update budget when maxBudget changes (loaded async) or when URL contains maxPrice
  useEffect(() => {
    const urlMaxPrice = searchParams.get("maxPrice");
    if (urlMaxPrice) {
      setBudget(Number(urlMaxPrice));
    } else if (maxBudget > 0 && budget === 0) {
      setBudget(maxBudget);
    }
  }, [maxBudget, searchParams, budget]);

  const toggleFilter = (chip: string) =>
    setSelected((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );

  const clearAll = () => {
    setSelected([]);
    setBudget(maxBudget);
    router.push(`/c/${slug}`);
  };

  const budgetActive = budget > 0 && budget < maxBudget;
  const hasAppliedFilters = selected.length > 0 || budgetActive;

  // Filtering and sorting are done server-side; the API response is the result set.
  const filtered = baseListings;

  // Unknown category — friendly fallback.
  if (!category) {
    return (
      <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Explore", href: "/explore" }, { label: "Not found" }]}>
        <div className="flex flex-col items-center justify-center text-center py-20 px-6">
          <h1 className="text-xl font-bold text-ink mb-2">That category doesn&apos;t exist</h1>
          <p className="text-sm text-muted mb-5">Browse all the ways to find your next space.</p>
          <Link
            href="/explore"
            className="px-4 py-2 text-sm font-semibold text-white bg-rausch rounded-[8px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2"
          >
            Back to Explore
          </Link>
        </div>
      </PageLayout>
    );
  }

  const noun = category.resultNoun;
  const showBottomCrossSell = filtered.length > 0 && filtered.length <= 6;

  return (
    <>
      {/* Per-category search band placed above the Map */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 mt-4">
        <CategorySearchBand
          placeholder={category.searchPlaceholder ?? `Search ${noun} by locality, budget or BHK`}
          showGender={slug === "pg" || slug === "coliving"}
        />
      </div>

      {/* Split Hero Section: 30% Info with watermark image, 70% Map */}
      {/* Full-width Map Hero Section with Floating Category Hub Card (Airbnb Style) */}
      <section 
        aria-label="Category Hero Map Header" 
        className={`w-full relative border-b border-hairline-soft bg-canvas overflow-hidden z-10 transition-all duration-300 ${
          viewMode === "map" ? "h-[500px] md:h-[450px] block" : "h-0 md:h-[450px] border-b-0 md:border-b hidden md:block"
        }`}
      >
        {/* Full 100% Map */}
        <div className="absolute inset-0 w-full h-full z-0">
          <ListingsMap listings={filtered} />
        </div>

        {/* Floating Category Hub Pill (Desktop Only - Compact Form) */}
        <div className="hidden md:flex absolute top-4 left-6 z-10 bg-white/95 backdrop-blur-md border border-hairline-soft/80 shadow-airbnb rounded-full px-5 py-2.5 items-center gap-3 animate-fade-in">
          <span className="text-xs font-black text-neutral-950 tracking-tight">{category.label}</span>
          <div className="w-[1px] h-3 bg-neutral-200" />
          <span className="text-[10px] font-extrabold text-rausch bg-rausch/10 px-2.5 py-0.5 rounded-full">
            {filtered.length} Nest{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </section>

      {/* Mobile Info Header (Static, Mobile Only) */}
      <div className={`block md:hidden bg-canvas p-5 border-b border-hairline-soft ${viewMode === "map" ? "hidden" : "block"}`}>
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-rausch mb-1 block">
          Category Hub
        </span>
        <h1 className="text-xl font-extrabold text-neutral-950 tracking-tight leading-tight">
          {category.label}
        </h1>
        <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
          {category.subtitle || `Find premium verified ${category.label.toLowerCase()} listings nearby.`}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center bg-surface-soft border border-hairline text-neutral-900 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
            {filtered.length} Nest{filtered.length !== 1 ? "s" : ""} Available
          </span>
          <span className="inline-flex items-center bg-rausch text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
            Verified
          </span>
        </div>
      </div>

      <PageLayout
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Explore", href: "/explore" },
          { label: category.label },
        ]}
        className="max-w-[1200px] ml-0 mr-auto px-4 md:px-6 lg:px-10 pb-20 md:pb-8"
      >

      {/* Context header — result count + save search (h1 is now in the hero) */}
      <header className="pt-1 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted">
              <span className="font-semibold text-ink">{filtered.length}</span>{" "}
              {filtered.length === 1 ? noun.replace(/s$/, "") : noun} · {CITY}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSavedSearch((s) => !s)}
            aria-pressed={savedSearch}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-[8px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
              savedSearch ? "border-rausch text-rausch bg-rausch/5" : "border-hairline text-ink hover:bg-surface-soft"
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={savedSearch ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
            <span className="hidden sm:inline">{savedSearch ? "Search saved" : "Save this search"}</span>
          </button>
        </div>
      </header>

      {/* Sticky filter bar */}
      <div className="sticky top-20 z-30 -mx-4 md:-mx-6 lg:-mx-10 px-4 md:px-6 lg:px-10 bg-canvas/90 backdrop-blur-md border-b border-hairline-soft mb-4">
        {/* Chips */}
        <div className="flex gap-2 overflow-x-auto pt-1 pb-3 scrollbar-hide" role="group" aria-label={`Filter ${noun}`}>
          {category.chips.map((chip) => {
            const active = selected.includes(chip);
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

        {/* Controls row */}
        <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-hide">
          {/* Budget */}
          <label className="flex items-center gap-2 text-sm text-muted shrink-0">
            <span className="whitespace-nowrap">
              Up to <span className="font-semibold text-ink">{formatBudget(budget)}</span>
            </span>
            <input
              type="range"
              min={minBudget}
              max={maxBudget}
              step={Math.max(500, Math.round((maxBudget - minBudget) / 100) || 500)}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              aria-label="Maximum budget"
              className="w-24 md:w-32 accent-rausch cursor-pointer"
            />
          </label>

          {/* Sort */}
          <label className="flex items-center gap-1.5 text-sm text-muted shrink-0">
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

          {/* More filters */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-ink border border-hairline rounded-[8px] px-3 py-1.5 hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            More filters
            {selected.length > 0 && (
              <span className="ml-0.5 text-[11px] font-semibold text-white bg-rausch rounded-full px-1.5 py-0.5 leading-none">
                {selected.length}
              </span>
            )}
          </button>

          {/* List/Map toggle */}
          <div className="shrink-0 flex md:hidden border border-hairline rounded-[8px] overflow-hidden ml-auto" role="group" aria-label="Switch between list and map">
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
          {selected.map((f) => (
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
              onClick={() => setBudget(maxBudget)}
              className="inline-flex items-center gap-1.5 bg-surface-soft text-ink text-xs font-medium pl-3 pr-2 py-1.5 rounded-full hover:bg-surface-strong transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              aria-label="Remove budget filter"
            >
              Up to {formatBudget(budget)}
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

      {/* Results Deck */}
      <div id="results" className={`mt-4 ${viewMode === "map" ? "hidden md:block" : "block"}`}>
        {loading ? (
          <ListSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-hairline-soft rounded-[14px] bg-surface-soft">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-muted-soft mb-3" aria-hidden="true">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-base font-semibold text-ink mb-1">No {noun} match these filters</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filtered.map((listing, i) => (
              <div key={listing.id} className="contents">
                <ListingCard {...listing} showCta image={listing.image || category.image} />
                {i === 5 && <CrossSellCard />}
              </div>
            ))}
            {showBottomCrossSell && <CrossSellCard />}
          </div>
        )}
      </div>

      {/* More filters drawer */}
      <FiltersDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        chips={category.chips}
        selected={selected}
        onToggle={toggleFilter}
        budget={budget}
        minBudget={minBudget}
        maxBudget={maxBudget}
        onBudget={setBudget}
        resultCount={filtered.length}
        resultNoun={noun}
        onApply={() => setDrawerOpen(false)}
        onClearAll={clearAll}
      />
    </PageLayout>
    </>
  );
}
