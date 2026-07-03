"use client";

/**
 * CategoryHeroBase
 * Shared shell used by all 15 category hero components.
 *
 * Provides:
 *  - Looping, muted world video background
 *  - A dark gradient scrim for text contrast
 *  - A simple search input that scrolls to #results on submit
 *  - Slot-based layout so each category hero can inject its own headline,
 *    subline, visual accent, and pill row
 *
 * Individual heroes just call <CategoryHeroBase ...> with their own props;
 * no business logic lives here.
 */

import { useRef, useCallback, useState, useEffect } from "react";

export type HeroWorld = "residential" | "commercial" | "stay";

export interface CategoryHeroBaseProps {
  /** Video source path relative to /public, e.g. "/hero-video/residential.mp4" */
  videoSrc: string;
  /** Tailwind bg-gradient-to-* classes used for the overlay scrim. */
  gradientOverlay: string;
  /** Main H1 headline text. */
  headline: string;
  /** Short subline below headline. */
  subline: string;
  /** Placeholder string for the search input. */
  searchPlaceholder: string;
  /** Popular quick-search chips (max 5). */
  pills?: string[];
  /** Content rendered inside the right accent column (desktop only). */
  accentContent?: React.ReactNode;
  /** Additional className on the root <section>. */
  className?: string;
}

/** Smooth-scrolls to #results on the same page. */
function scrollToResults() {
  const el = document.getElementById("results");
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

export default function CategoryHeroBase({
  videoSrc,
  gradientOverlay,
  headline,
  subline,
  searchPlaceholder,
  pills = [],
  accentContent,
  className = "",
}: CategoryHeroBaseProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, [videoSrc]);

  const handleSubmit = useCallback(() => {
    console.log("[CategoryHero] search", { query });
    scrollToResults();
  }, [query]);

  return (
    <section
      aria-label={headline}
      className={`relative overflow-hidden -mx-4 md:-mx-6 lg:-mx-10 mb-8 ${className}`}
    >
      {/* Video background */}
      <div aria-hidden="true" className="absolute inset-0">
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        {/* Dark gradient scrim for text contrast — WCAG AA over any video frame */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradientOverlay}`}
        />
        {/* Bottom-up vignette so the headline area is always readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 pt-10 md:pt-14 pb-12 md:pb-16">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-14">
          {/* ── Left column: headline + search ── */}
          <div className="flex-1 min-w-0">
            <h1 className="text-[clamp(30px,4.5vw,54px)] font-bold text-white tracking-tight leading-[1.08] mb-3 drop-shadow-sm max-w-[680px]">
              {headline}
            </h1>

            <p className="flex items-center gap-2 text-sm md:text-base text-white/85 mb-6 font-medium">
              <span
                className="inline-block w-2 h-2 rounded-full bg-white/80 shrink-0"
                aria-hidden="true"
              />
              {subline}
            </p>

            {/* Search bar */}
            <div className="flex items-center gap-2 bg-white/95 border border-white/50 rounded-[32px] shadow-[rgba(0,0,0,0.15)_0_4px_16px] px-4 py-2 max-w-[600px]">
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
              <label htmlFor="category-hero-search" className="sr-only">
                {searchPlaceholder}
              </label>
              <input
                id="category-hero-search"
                type="text"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="flex-1 text-sm text-body placeholder-muted-soft outline-none bg-transparent py-1 min-w-0"
              />
              <button
                type="button"
                onClick={handleSubmit}
                aria-label="Search"
                className="flex items-center justify-center gap-2 h-10 px-5 bg-rausch text-white rounded-full hover:bg-rausch-active active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rausch font-semibold text-sm whitespace-nowrap"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  aria-hidden="true"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
              </button>
            </div>

            {/* Popular pills */}
            {pills.length > 0 && (
              <div
                role="group"
                aria-label="Popular searches"
                className="flex flex-wrap items-center gap-2 mt-4"
              >
                <span className="text-xs text-white/80 font-medium shrink-0">
                  Popular:
                </span>
                {pills.map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => {
                      setQuery(pill);
                      scrollToResults();
                    }}
                    className="px-3 py-1 text-xs font-medium rounded-full border border-white/40 bg-white/15 hover:bg-white/30 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right accent column (desktop only) ── */}
          {accentContent && (
            <div className="hidden lg:block lg:w-[240px] xl:w-[280px] shrink-0">
              {accentContent}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
