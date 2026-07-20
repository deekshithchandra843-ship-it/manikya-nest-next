"use client";

/**
 * The per-category search band.
 *
 * Writes `q` (and `gender`, for PG / co-living) into the current category URL;
 * the category page refetches whenever its search params change, and the API
 * parses the free text — locality, BHK, budget — server-side.
 */

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const GENDER_OPTIONS = [
  { value: "", label: "Anyone" },
  { value: "boys", label: "For boys" },
  { value: "girls", label: "For girls" },
  { value: "anyone", label: "Co-ed only" },
];

interface CategorySearchBandProps {
  /** Placeholder copy for this category, e.g. "Search PGs near your college". */
  placeholder: string;
  /** Show the occupancy select — PG and co-living only. */
  showGender?: boolean;
}

export default function CategorySearchBand({
  placeholder,
  showGender = false,
}: CategorySearchBandProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [gender, setGender] = useState(() => searchParams.get("gender") ?? "");

  const hasSearch = !!searchParams.get("q") || !!searchParams.get("gender");

  const pushParams = (nextQuery: string, nextGender: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = nextQuery.trim();
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    if (nextGender) params.set("gender", nextGender);
    else params.delete("gender");

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const submit = () => pushParams(query, gender);

  const clear = () => {
    setQuery("");
    setGender("");
    pushParams("", "");
  };

  return (
    <section aria-label="Search within this category" className="pt-4 pb-1">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-surface-soft border border-hairline rounded-[16px] sm:rounded-full p-2 sm:pl-4 sm:pr-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted-soft shrink-0"
            aria-hidden="true"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <label htmlFor="category-search" className="sr-only">
            {placeholder}
          </label>
          <input
            id="category-search"
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="flex-1 text-sm text-body placeholder-muted-soft outline-none bg-transparent py-2 min-w-0"
          />
        </div>

        {showGender && (
          <>
            <div className="hidden sm:block w-px bg-hairline h-6 shrink-0" aria-hidden="true" />
            <div className="relative shrink-0">
              <label htmlFor="category-gender" className="sr-only">
                Who the space is for
              </label>
              <select
                id="category-gender"
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  pushParams(query, e.target.value);
                }}
                className="appearance-none bg-canvas sm:bg-transparent border border-hairline sm:border-none rounded-[8px] sm:rounded-none pl-3 pr-7 py-2 sm:py-1 text-sm font-medium text-ink outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ink w-full"
              >
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-soft"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {hasSearch && (
            <button
              type="button"
              onClick={clear}
              className="px-3 h-10 text-sm font-medium text-muted hover:text-ink rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={submit}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 px-5 bg-rausch text-white rounded-full text-sm font-semibold hover:bg-rausch-active active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2"
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
}
