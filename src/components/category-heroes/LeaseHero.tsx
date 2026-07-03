"use client";

/**
 * LeaseHero — PREMIUM FINANCE layout.
 * Right-aligned, elegant. Yield/tenant chips on the right side.
 * Search = city input + tenant/yield chips.
 */

import { useState, useCallback } from "react";
import { getCategory } from "@/lib/categories";

const TENANT_CHIPS = ["Bank tenant", "MNC tenant", "High yield"];

const METRICS = [
  { value: "6–9%", label: "Typical yield p.a." },
  { value: "5–15 yrs", label: "Lease duration" },
  { value: "₹6.5 Cr+", label: "Asset value" },
];

function scrollToResults() {
  document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
}

export default function LeaseHero({ city = "Bengaluru" }: { city?: string }) {
  const cat = getCategory("lease");
  const headline = cat ? cat.headline.replace("{city}", city) : `Pre-leased properties in ${city}`;
  const subline = cat?.subtitle ?? "Income-generating assets";

  const [where, setWhere] = useState("");
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const handleSubmit = useCallback(() => {
    console.log("[LeaseHero] search", { where, filter: activeChip });
    scrollToResults();
  }, [where, activeChip]);

  const handleChipClick = useCallback(
    (chip: string) => {
      const next = activeChip === chip ? null : chip;
      setActiveChip(next);
      console.log("[LeaseHero] chip", { chip: next });
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
        poster="/categories/lease.jpg"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video/commercial.mp4" type="video/mp4" />
      </video>

      {/* Premium dark purple scrim — heavier on the right */}
      <div className="absolute inset-0 bg-gradient-to-l from-[#1a0a24]/90 via-[#2d1045]/70 to-[#834d9b]/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

      {/* Content — right-aligned */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 pt-12 md:pt-18 pb-12 md:pb-16 flex flex-col items-end">

        <div className="w-full max-w-[560px]">

          {/* Eyebrow — right-aligned label */}
          <div className="flex items-center justify-end gap-3 mb-5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d04ed6]">
              {subline}
            </span>
            <span className="w-8 h-px bg-[#d04ed6]/50" aria-hidden="true" />
          </div>

          {/* Headline — right-aligned, elegant medium weight */}
          <h1 className="text-[clamp(28px,4.8vw,58px)] font-semibold text-white leading-[1.08] tracking-[-0.02em] mb-4 text-right">
            {headline}
          </h1>

          <p className="text-sm text-white/60 text-right mb-8 font-light tracking-wide">
            Steady rental income from verified Grade-A assets
          </p>

          {/* Yield metrics row — right-aligned */}
          <div
            role="list"
            aria-label="Investment metrics"
            className="flex justify-end gap-6 mb-8"
          >
            {METRICS.map((m) => (
              <div key={m.label} role="listitem" className="text-right">
                <span className="block text-[22px] font-bold text-white leading-none mb-0.5">
                  {m.value}
                </span>
                <span className="block text-[10px] font-medium text-white/45 uppercase tracking-[0.16em]">
                  {m.label}
                </span>
              </div>
            ))}
          </div>

          {/* Search — city input, right-aligned */}
          <div className="flex items-center bg-white/95 rounded-[12px] shadow-[rgba(0,0,0,0.25)_0_8px_32px] px-4 py-1 mb-4">
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
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <label htmlFor="lease-city" className="sr-only">
              City or micro-market
            </label>
            <input
              id="lease-city"
              type="text"
              placeholder="City or micro-market…"
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="flex-1 text-[14px] text-body placeholder-muted-soft outline-none bg-transparent py-3 px-3 min-w-0"
            />
            <button
              type="button"
              onClick={handleSubmit}
              aria-label="Search pre-leased assets"
              className="flex items-center justify-center gap-1.5 h-10 px-5 bg-[#834d9b] text-white rounded-[9px] hover:bg-[#6b3980] active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#834d9b] font-semibold text-[13px] whitespace-nowrap"
            >
              Search
            </button>
          </div>

          {/* Tenant/yield chips — right-aligned */}
          <div
            role="group"
            aria-label="Tenant and yield filters"
            className="flex flex-wrap justify-end gap-2"
          >
            {TENANT_CHIPS.map((chip) => {
              const isActive = activeChip === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleChipClick(chip)}
                  className={`px-4 py-1.5 text-[12px] font-medium tracking-wide rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d04ed6] ${
                    isActive
                      ? "bg-[#834d9b] text-white border-[#834d9b]"
                      : "bg-white/8 text-white/75 border-white/25 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
