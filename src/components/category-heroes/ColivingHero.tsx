"use client";

/**
 * ColivingHero — FULL-BLEED centered, light-weight headline with wide tracking.
 * Single slim search bar + community chips below. Modern, spacious feel.
 * Deep purple gradient overlay.
 */

import { useState, useCallback } from "react";
import { getCategory } from "@/lib/categories";

function scrollToResults() {
  document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
}

export default function ColivingHero({ city = "Bengaluru" }: { city?: string }) {
  const cat = getCategory("coliving");
  const headline = cat?.headline.replace("{city}", city) ?? `Co-living spaces in ${city}`;

  const communityChips = ["All-inclusive", "Twin sharing", "Gym"];

  const [query, setQuery] = useState("");

  const handleSubmit = useCallback(() => {
    console.log("[ColivingHero] search", { query });
    scrollToResults();
  }, [query]);

  const handleChip = useCallback((chip: string) => {
    console.log("[ColivingHero] chip", { chip });
    scrollToResults();
  }, []);

  return (
    <section
      aria-label={headline}
      className="relative overflow-hidden -mx-4 md:-mx-6 lg:-mx-10 mb-8"
      style={{ minHeight: "clamp(500px, 65vh, 720px)" }}
    >
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/categories/coliving.jpg"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video/residential.mp4" type="video/mp4" />
      </video>

      {/* Scrim — deep purple full-bleed */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#4A00E0]/80 via-[#8E2DE2]/50 to-black/30" />

      {/* Content — full-bleed centered */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[inherit] px-4 md:px-6 lg:px-10 py-20">

        {/* Overline — pill label */}
        <div className="inline-flex items-center gap-3 mb-8">
          <div className="h-px w-8 bg-white/40" aria-hidden="true" />
          <span className="text-[11px] font-medium text-white/70 tracking-[0.3em] uppercase">
            Managed Living
          </span>
          <div className="h-px w-8 bg-white/40" aria-hidden="true" />
        </div>

        {/* Headline — light weight, very wide tracking */}
        <h1
          className="text-white font-light tracking-[0.04em] leading-[1.12] mb-6 drop-shadow max-w-[820px]"
          style={{ fontSize: "clamp(34px, 5.8vw, 72px)" }}
        >
          {headline}
        </h1>

        {/* Subline — airy, spaced */}
        <p
          className="text-white/65 font-light tracking-wide max-w-[480px] mb-10"
          style={{ fontSize: "clamp(13px, 1.6vw, 18px)" }}
        >
          {cat?.subtitle} &mdash; vibrant community, zero hassle
        </p>

        {/* Slim single-line search */}
        <div className="flex items-center gap-0 bg-white/12 backdrop-blur-sm border border-white/25 rounded-[10px] shadow-[rgba(0,0,0,0.2)_0_4px_20px] w-full max-w-[540px] overflow-hidden">
          <label htmlFor="coliving-hero-search" className="sr-only">
            Search co-living spaces
          </label>
          <input
            id="coliving-hero-search"
            type="text"
            placeholder="Neighbourhood or area…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 text-sm text-white placeholder:text-white/45 outline-none bg-transparent px-4 py-3.5 min-w-0"
          />
          <button
            type="button"
            onClick={handleSubmit}
            aria-label="Search co-living"
            className="flex items-center gap-1.5 h-full px-5 py-3.5 bg-[#8E2DE2] text-white font-semibold text-sm hover:bg-[#7a28c2] active:scale-[0.98] transition-all border-l border-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 whitespace-nowrap"
          >
            Explore
          </button>
        </div>

        {/* Community chips — spaced, outline style */}
        <div
          role="group"
          aria-label="Community features"
          className="flex flex-wrap items-center justify-center gap-3 mt-7"
        >
          {communityChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChip(chip)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-[8px] border border-white/25 bg-white/8 hover:bg-white/15 text-white/85 hover:text-white tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Spacer stat row */}
        <div className="flex items-center gap-6 mt-10">
          {[
            { value: "800+", label: "Spaces" },
            { value: "4.7★", label: "Avg rating" },
            { value: "All-incl.", label: "Bills zero" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-base font-semibold text-white">{value}</p>
              <p className="text-[11px] text-white/50 uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
