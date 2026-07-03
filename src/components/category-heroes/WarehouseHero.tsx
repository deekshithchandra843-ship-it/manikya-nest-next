"use client";

/**
 * WarehouseHero — INDUSTRIAL layout.
 * Left-aligned, oversized numeric accent ("20,000+ sq ft"), utilitarian
 * condensed type. Search = area text input + size-range <select>.
 */

import { useState, useCallback } from "react";
import { getCategory } from "@/lib/categories";

function scrollToResults() {
  document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
}

export default function WarehouseHero({ city = "Bengaluru" }: { city?: string }) {
  const cat = getCategory("warehouse");
  const headline = cat ? cat.headline.replace("{city}", city) : `Warehouses & godowns in ${city}`;
  const subline = cat?.subtitle ?? "Godown & storage";

  const [area, setArea] = useState("");
  const [sizeRange, setSizeRange] = useState("");

  const handleSubmit = useCallback(() => {
    console.log("[WarehouseHero] search", { area, sizeRange });
    scrollToResults();
  }, [area, sizeRange]);

  const handlePillClick = useCallback(
    (pill: string) => {
      console.log("[WarehouseHero] pill", { pill });
      scrollToResults();
    },
    []
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
        poster="/categories/warehouse.jpg"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video/commercial.mp4" type="video/mp4" />
      </video>

      {/* Industrial dark scrim */}
      <div className="absolute inset-0 bg-[#1c1f24]/80" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#373B44]/60 via-transparent to-[#4286f4]/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 pt-10 md:pt-14 pb-12 md:pb-16">

        {/* Oversized numeric accent */}
        <div className="mb-4 leading-none select-none" aria-hidden="true">
          <span className="text-[clamp(64px,12vw,160px)] font-black text-white/[0.06] tracking-tighter">
            20,000+
          </span>
        </div>

        {/* Headline sits visually over the number on larger screens */}
        <div className="-mt-[clamp(40px,6vw,80px)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#4286f4] mb-3">
            {subline}
          </p>

          <h1 className="text-[clamp(26px,4.5vw,54px)] font-black text-white leading-[1.0] tracking-[-0.01em] mb-2 max-w-[580px]">
            {headline}
          </h1>

          <p className="text-[13px] font-medium text-white/50 uppercase tracking-[0.12em] mb-8">
            Loading docks&nbsp;·&nbsp;High ceilings&nbsp;·&nbsp;Highway access
          </p>
        </div>

        {/* Search row — industrial squared inputs */}
        <div className="flex flex-col sm:flex-row gap-0 max-w-[600px] border border-white/20 rounded-[4px] overflow-hidden shadow-[rgba(0,0,0,0.3)_0_8px_24px]">
          {/* Area input */}
          <div className="flex items-center flex-1 bg-white/95 border-b sm:border-b-0 sm:border-r border-hairline-soft px-3">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-soft shrink-0"
              aria-hidden="true"
            >
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <label htmlFor="wh-area" className="sr-only">
              Industrial area or highway
            </label>
            <input
              id="wh-area"
              type="text"
              placeholder="Industrial area or highway…"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="flex-1 text-[13px] font-medium text-body placeholder-muted-soft outline-none bg-transparent py-3.5 px-2 min-w-0"
            />
          </div>

          {/* Size range select */}
          <div className="relative bg-white/95 shrink-0">
            <label htmlFor="wh-size" className="sr-only">
              Warehouse size range
            </label>
            <select
              id="wh-size"
              value={sizeRange}
              onChange={(e) => setSizeRange(e.target.value)}
              className="appearance-none h-full bg-transparent text-[13px] font-semibold text-ink px-4 pr-8 py-3.5 outline-none focus-visible:ring-2 focus-visible:ring-[#4286f4] focus-visible:ring-inset cursor-pointer w-full"
            >
              <option value="">All sizes</option>
              <option value="lt5000">&lt; 5,000 sq ft</option>
              <option value="5000-20000">5,000 – 20,000 sq ft</option>
              <option value="gt20000">20,000+ sq ft</option>
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-soft"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>

          {/* Search button — flush */}
          <button
            type="button"
            onClick={handleSubmit}
            aria-label="Search warehouses"
            className="flex items-center justify-center px-7 py-3.5 bg-[#4286f4] text-white text-[13px] font-black uppercase tracking-[0.12em] hover:bg-[#2d72e0] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4286f4] focus-visible:ring-inset shrink-0 whitespace-nowrap"
          >
            Search
          </button>
        </div>

        {/* Quick-filter pills — utilitarian */}
        <div
          role="group"
          aria-label="Quick filters"
          className="flex flex-wrap gap-2 mt-5"
        >
          {(cat?.chips ?? []).slice(0, 5).map((pill) => (
            <button
              key={pill}
              type="button"
              aria-pressed="false"
              onClick={() => handlePillClick(pill)}
              className="px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-[0.08em] rounded-[2px] border border-white/25 bg-white/8 hover:bg-white/20 text-white/75 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {pill}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
