"use client";

/**
 * CommercialOfficeHero — STAT-LED layout.
 * A condensed uppercase left-aligned headline with tight tracking, topped by a
 * stats strip. Search = business-district text input + Size <select>.
 */

import { useState, useCallback } from "react";
import { getCategory } from "@/lib/categories";

const STATS = [
  { value: "₹85/sqft", label: "avg rent" },
  { value: "1,200+", label: "offices" },
  { value: "6", label: "micro-markets" },
];

function scrollToResults() {
  document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
}

export default function CommercialOfficeHero({ city = "Bengaluru" }: { city?: string }) {
  const cat = getCategory("commercial-office");
  const headline = cat ? cat.headline.replace("{city}", city) : `Office spaces in ${city}`;
  const subline = cat ? cat.subtitle : "Lease an office";

  const [district, setDistrict] = useState("");
  const [size, setSize] = useState("");

  const handleSubmit = useCallback(() => {
    console.log("[CommercialOfficeHero] search", { district, size });
    scrollToResults();
  }, [district, size]);

  const handlePillClick = useCallback(
    (pill: string) => {
      console.log("[CommercialOfficeHero] pill", { pill });
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
        poster="/categories/commercial-office.jpg"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video/commercial.mp4" type="video/mp4" />
      </video>

      {/* Scrim — heavy left fade for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1F1C2C]/90 via-[#1F1C2C]/70 to-[#928DAB]/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 pt-10 md:pt-16 pb-12 md:pb-18">

        {/* Stats strip */}
        <div
          role="list"
          aria-label="Market statistics"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-8"
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              role="listitem"
              className="flex items-center gap-3"
            >
              <div>
                <span className="block text-[11px] font-bold text-white/50 uppercase tracking-[0.18em]">
                  {s.label}
                </span>
                <span className="block text-[22px] font-black text-white leading-none tracking-tight">
                  {s.value}
                </span>
              </div>
              {i < STATS.length - 1 && (
                <span className="w-px h-8 bg-white/20 shrink-0" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>

        {/* Condensed uppercase headline */}
        <h1 className="text-[clamp(28px,5.5vw,68px)] font-black text-white uppercase tracking-[-0.01em] leading-[0.92] mb-3 max-w-[640px]">
          {headline}
        </h1>

        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60 mb-8">
          {subline}
        </p>

        {/* Search row — district input + size select */}
        <div className="flex flex-col sm:flex-row gap-2 max-w-[620px]">
          {/* District input */}
          <div className="flex items-center flex-1 bg-white/95 rounded-[6px] px-3 py-0 shadow-[rgba(0,0,0,0.2)_0_4px_16px]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-soft shrink-0"
              aria-hidden="true"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <label htmlFor="co-district" className="sr-only">
              Business district or micro-market
            </label>
            <input
              id="co-district"
              type="text"
              placeholder="Business district or micro-market…"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="flex-1 text-[13px] font-medium text-body placeholder-muted-soft outline-none bg-transparent py-3 px-2 min-w-0"
            />
          </div>

          {/* Size select */}
          <div className="relative shrink-0">
            <label htmlFor="co-size" className="sr-only">
              Office size
            </label>
            <select
              id="co-size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="appearance-none h-full sm:h-auto bg-white/95 text-[13px] font-semibold text-ink rounded-[6px] px-4 py-3 pr-8 shadow-[rgba(0,0,0,0.2)_0_4px_16px] outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer w-full sm:w-auto"
            >
              <option value="">Any size</option>
              <option value="lt1000">&lt; 1,000 sq ft</option>
              <option value="1000-5000">1,000 – 5,000 sq ft</option>
              <option value="gt5000">5,000+ sq ft</option>
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-soft"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>

          {/* Search button */}
          <button
            type="button"
            onClick={handleSubmit}
            aria-label="Search offices"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-rausch text-white text-[13px] font-bold uppercase tracking-[0.1em] rounded-[6px] hover:bg-rausch-active active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rausch whitespace-nowrap shrink-0"
          >
            Search
          </button>
        </div>

        {/* Quick-filter pills */}
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
              className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] rounded-[4px] border border-white/30 bg-white/10 hover:bg-white/25 text-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {pill}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
