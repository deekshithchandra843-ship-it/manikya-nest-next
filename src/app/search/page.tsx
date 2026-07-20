"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import ListingCard from "@/components/ListingCard";
import SearchBar from "@/components/SearchBar";
import { apiClient } from "@/lib/apiClient";

/** Params the search API understands; anything else in the URL is ignored. */
const API_PARAMS = ["q", "category", "locality", "bhk", "gender", "minPrice", "maxPrice", "sort"];

const GENDER_LABEL: Record<string, string> = {
  boys: "For boys",
  girls: "For girls",
  anyone: "Co-ed",
};

const CATEGORY_LABEL: Record<string, string> = {
  pg: "PG / Hostel",
  rent: "Rental",
  buy: "For sale",
  coliving: "Co-living",
  "commercial-office": "Office",
  "commercial-shop": "Shop",
  coworking: "Co-working",
  warehouse: "Warehouse",
  land: "Land / Plot",
  lease: "Lease",
  hotel: "Hotel",
  resort: "Resort",
  homestay: "Homestay",
  "service-apartment": "Service apartment",
};

const inr = (v: string) => `₹${Number(v).toLocaleString("en-IN")}`;

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  // Everything the API cares about, in a stable string we can depend on.
  const apiQuery = (() => {
    const params = new URLSearchParams();
    for (const key of API_PARAMS) {
      const value = searchParams.get(key);
      if (value && value.trim()) params.set(key, value.trim());
    }
    return params.toString();
  })();

  // Human-readable summary of the active filters.
  const activeFilters: string[] = [];
  const cat = searchParams.get("category");
  if (cat) activeFilters.push(CATEGORY_LABEL[cat] ?? cat);
  const bhkParam = searchParams.get("bhk");
  if (bhkParam) activeFilters.push(`${bhkParam} BHK`);
  const genderParam = searchParams.get("gender");
  if (genderParam) activeFilters.push(GENDER_LABEL[genderParam] ?? genderParam);
  const minP = searchParams.get("minPrice");
  const maxP = searchParams.get("maxPrice");
  if (minP && maxP) activeFilters.push(`${inr(minP)} – ${inr(maxP)}`);
  else if (maxP) activeFilters.push(`under ${inr(maxP)}`);
  else if (minP) activeFilters.push(`${inr(minP)}+`);
  const localityParam = searchParams.get("locality");
  if (localityParam) activeFilters.push(localityParam);

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiQuery) {
      setListings([]);
      return;
    }

    setLoading(true);
    setError(null);
    apiClient
      .get(`/search?${apiQuery}`)
      .then((res) => {
        if (res.data && res.data.success) {
          setListings(res.data.data);
        } else {
          setError(res.data.error || "Failed to search listings.");
        }
      })
      .catch((err) => {
        console.error("Error searching listings:", err);
        setError(
          err?.response?.data?.error || "Unable to connect to search service."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [apiQuery]);

  return (
    <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Search Results" }]}>
      {/* Search input hub */}
      <div className="max-w-[700px] mx-auto mb-8">
        <SearchBar hideTabs glass initialQuery={query} />
      </div>

      <div className="border-b border-hairline-soft pb-4 mb-6">
        <h1 className="text-xl md:text-2xl font-extrabold text-ink leading-tight">
          Smart Search Results
        </h1>
        {apiQuery ? (
          <p className="text-sm text-muted mt-1">
            {query && (
              <>
                Showing results for{" "}
                <span className="font-semibold text-ink">&ldquo;{query}&rdquo;</span>
              </>
            )}
            {!query && "Showing results for your filters"}
          </p>
        ) : (
          <p className="text-sm text-muted mt-1">
            Enter a search query in the box above.
          </p>
        )}

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {activeFilters.map((f) => (
              <span
                key={f}
                className="px-2.5 py-1 text-xs font-medium rounded-full border border-hairline-soft bg-surface-soft text-ink"
              >
                {f}
              </span>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-[14px]">
              <div className="h-44 rounded-[14px] skeleton" />
              <div className="pt-3 space-y-2">
                <div className="h-4 w-2/3 rounded-full skeleton" />
                <div className="h-3 w-1/2 rounded-full skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 border border-hairline-soft rounded-[14px] bg-surface-soft animate-fade-up">
          <p className="text-base font-semibold text-error mb-1">Search Error</p>
          <p className="text-sm text-muted mb-4">{error}</p>
        </div>
      ) : !apiQuery ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-hairline-soft rounded-[14px] bg-surface-soft">
          <p className="text-base font-semibold text-ink mb-1">No search query specified</p>
          <p className="text-sm text-muted">Type something like &ldquo;2bhk under 25000 in HSR Layout&rdquo; in the box above.</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-hairline-soft rounded-[14px] bg-surface-soft animate-fade-up">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-muted-soft mb-3" aria-hidden="true">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-base font-semibold text-ink mb-1">No matching listings found</p>
          <p className="text-sm text-muted">Try using different keywords or typing a simpler query (e.g. &ldquo;2bhk in Indiranagar&rdquo;).</p>
        </div>
      ) : (
        <div className="animate-fade-up">
          <p className="text-xs text-muted mb-4">
            Found <span className="font-semibold text-ink">{listings.length}</span> matching spaces
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} {...listing} showCta image={listing.image} />
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading search results...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
