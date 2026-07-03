"use client";

/**
 * CommercialShopHero — BOLD RETAIL layout.
 * Centered, very high-contrast oversized headline. Single wide input + chips.
 */

import { useState, useCallback } from "react";
import { getCategory } from "@/lib/categories";

const RETAIL_CHIPS = ["High street", "Mall", "Ground floor", "Main road"];

function scrollToResults() {
  document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
}

export default function CommercialShopHero({ city = "Bengaluru" }: { city?: string }) {
  const cat = getCategory("commercial-shop");
  const headline = cat ? cat.headline.replace("{city}", city) : `Shops & showrooms in ${city}`;
  const subline = cat?.subtitle ?? "Retail & showroom space";

  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const handleSubmit = useCallback(() => {
    console.log("[CommercialShopHero] search", { query, filter: activeChip });
    scrollToResults();
  }, [query, activeChip]);

  const handleChipClick = useCallback(
    (chip: string) => {
      const next = activeChip === chip ? null : chip;
      setActiveChip(next);
      console.log("[CommercialShopHero] chip", { chip: next });
      scrollToResults();
    },
    [activeChip]
  );

  return (
    <section
      aria-label={headline}
      className="relative overflow-hidden -mx-4 md:-mx-6 lg:-mx-10 mb-8"
    >
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/categories/commercial-shop.jpg"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video/commercial.mp4" type="video/mp4" />
      </video>

      {/* Heavy centered scrim for maximum headline contrast */}
      <div className="absolute inset-0 bg-[#1a0a0a]/75" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#c94b4b]/40 via-transparent to-[#4b134f]/55" />

      {/* Content — centered column */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 pt-12 md:pt-20 pb-14 md:pb-22 flex flex-col items-center text-center">

        {/* Eyebrow */}
        <span className="inline-block text-[11px] font-bold uppercase tracking-[0.28em] text-[#c94b4b] bg-white/10 border border-[#c94b4b]/40 rounded-full px-4 py-1 mb-6">
          {subline}
        </span>

        {/* Oversized headline — very bold, high contrast */}
        <h1 className="text-[clamp(36px,7vw,88px)] font-black text-white leading-[0.9] tracking-tight mb-6 max-w-[800px]">
          {headline}
        </h1>

        {/* Mock stat line */}
        <p className="text-base md:text-lg font-medium text-white/70 mb-10">
          ₹60,000 – ₹2.5L/mo &nbsp;·&nbsp; 800+ retail spaces &nbsp;·&nbsp; Ground to 3rd floor
        </p>

        {/* Wide single search input */}
        <div className="w-full max-w-[680px] flex items-center bg-white rounded-[50px] shadow-[rgba(0,0,0,0.3)_0_8px_32px] px-5 py-2 mb-6">
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
          <label htmlFor="cs-search" className="sr-only">
            Market, high street or area
          </label>
          <input
            id="cs-search"
            type="text"
            placeholder="Market, high street or area…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 text-[15px] text-body placeholder-muted-soft outline-none bg-transparent py-2 px-3 min-w-0"
          />
          <button
            type="button"
            onClick={handleSubmit}
            aria-label="Search shops"
            className="flex items-center justify-center gap-2 h-11 px-7 bg-[#c94b4b] text-white rounded-full hover:bg-[#b03030] active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#c94b4b] font-bold text-sm"
          >
            Find Space
          </button>
        </div>

        {/* Chips row */}
        <div
          role="group"
          aria-label="Retail type filters"
          className="flex flex-wrap justify-center gap-3"
        >
          {RETAIL_CHIPS.map((chip) => {
            const isActive = activeChip === chip;
            return (
              <button
                key={chip}
                type="button"
                aria-pressed={isActive}
                onClick={() => handleChipClick(chip)}
                className={`px-5 py-2 text-sm font-semibold rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  isActive
                    ? "bg-white text-[#c94b4b] border-white"
                    : "bg-white/10 text-white border-white/35 hover:bg-white/25"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
