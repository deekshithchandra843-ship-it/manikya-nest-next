"use client";

/**
 * RentHero — CENTERED layout, airy and minimal.
 * Large tight clamp headline, single pill-shaped search bar,
 * quick chips row below. Warm rausch overlay.
 */

import { useState, useCallback } from "react";
import { getCategory } from "@/lib/categories";

function scrollToResults() {
  document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
}

export default function RentHero({ city = "Bengaluru" }: { city?: string }) {
  const cat = getCategory("rent");
  const headline = cat?.headline.replace("{city}", city) ?? `Flats & houses for rent in ${city}`;
  const subline = cat?.subtitle ?? "20K+ flats · zero brokerage";

  const chips = ["1 BHK", "2 BHK", "3 BHK", "Furnished", "Near metro"];

  const [query, setQuery] = useState("");

  const handleSubmit = useCallback(() => {
    console.log("[RentHero] search", { query });
    scrollToResults();
  }, [query]);

  const handleChip = useCallback((chip: string) => {
    console.log("[RentHero] chip", { chip });
    scrollToResults();
  }, []);

  return (
    <section
      aria-label={headline}
      className="relative overflow-hidden -mx-4 md:-mx-6 lg:-mx-10 mb-8"
      style={{ minHeight: "clamp(420px, 58vh, 640px)" }}
    >
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/categories/rent.jpg"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video/residential.mp4" type="video/mp4" />
      </video>

      {/* Scrim — warm rausch gradient for WCAG AA text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-rausch/40" />

      {/* Content — centered column */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 md:px-6 lg:px-10 pt-16 md:pt-20 pb-14 md:pb-18 max-w-[860px] mx-auto w-full min-h-[inherit]">

        {/* Stat badge */}
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" aria-hidden="true" />
          <span className="text-xs font-semibold text-white tracking-wide uppercase">
            20,000+ verified listings
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-white font-bold tracking-tight leading-[1.05] mb-4 drop-shadow"
          style={{ fontSize: "clamp(36px, 6vw, 68px)" }}
        >
          {headline}
        </h1>

        {/* Subline */}
        <p className="text-white/80 text-base md:text-lg font-normal mb-8 max-w-[520px]">
          {subline} &mdash; move in fast
        </p>

        {/* Pill search bar */}
        <div className="flex items-center gap-2 bg-white/95 rounded-full shadow-[rgba(0,0,0,0.2)_0_6px_24px] px-4 py-2 w-full max-w-[580px] border border-white/60">
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
          <label htmlFor="rent-hero-search" className="sr-only">
            Locality, landmark or area
          </label>
          <input
            id="rent-hero-search"
            type="text"
            placeholder="Locality, landmark or area…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 text-sm text-body placeholder:text-muted-soft outline-none bg-transparent py-1.5 min-w-0"
          />
          <button
            type="button"
            onClick={handleSubmit}
            aria-label="Search rentals"
            className="flex items-center gap-1.5 h-10 px-5 bg-rausch text-white rounded-full hover:bg-rausch-active active:scale-95 transition-all shrink-0 font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rausch"
          >
            Search
          </button>
        </div>

        {/* Quick chips */}
        <div
          role="group"
          aria-label="Popular searches"
          className="flex flex-wrap items-center justify-center gap-2 mt-5"
        >
          <span className="text-xs text-white/70 font-medium">Popular:</span>
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChip(chip)}
              className="px-3.5 py-1 text-xs font-medium rounded-full border border-white/35 bg-white/10 hover:bg-white/25 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
