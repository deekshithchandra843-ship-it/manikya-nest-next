"use client";

/**
 * LandHero — WIDE CINEMATIC MINIMAL layout.
 * Centered, lots of whitespace, light refined headline with thin weight.
 * Search = city input + Area <select>. Minimal decor lines.
 */

import { useState, useCallback } from "react";
import { getCategory } from "@/lib/categories";

function scrollToResults() {
  document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
}

export default function LandHero({ city = "Bengaluru" }: { city?: string }) {
  const cat = getCategory("land");
  const headline = cat ? cat.headline.replace("{city}", city) : `Commercial land & plots in ${city}`;
  const subline = cat?.subtitle ?? "Commercial plots";

  const [where, setWhere] = useState("");
  const [plotArea, setPlotArea] = useState("");

  const handleSubmit = useCallback(() => {
    console.log("[LandHero] search", { where, plotArea });
    scrollToResults();
  }, [where, plotArea]);

  const handlePillClick = useCallback(
    (pill: string) => {
      console.log("[LandHero] pill", { pill });
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
        poster="/categories/land.jpg"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video/commercial.mp4" type="video/mp4" />
      </video>

      {/* Light cinematic scrim — green-tinted */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1a0d]/70 via-[#0d1a0d]/55 to-[#0d1a0d]/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#56ab2f]/10 to-transparent" />

      {/* Decorative horizontal rules */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/10" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" aria-hidden="true" />

      {/* Content — centered, generous vertical breathing room */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 pt-16 md:pt-24 pb-16 md:pb-24 flex flex-col items-center text-center">

        {/* Thin decorative eyebrow with flanking lines */}
        <div className="flex items-center gap-4 mb-8">
          <span className="w-12 h-px bg-white/25" aria-hidden="true" />
          <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/50">
            {subline}
          </span>
          <span className="w-12 h-px bg-white/25" aria-hidden="true" />
        </div>

        {/* Light-weight refined headline */}
        <h1 className="text-[clamp(32px,6vw,76px)] font-light text-white leading-[1.05] tracking-[-0.01em] mb-5 max-w-[720px]">
          <span className="font-extralight">Commercial land &amp; plots in </span>
          <span className="font-semibold">{city}</span>
        </h1>

        {/* Mock stat */}
        <p className="text-[13px] font-light tracking-[0.18em] uppercase text-white/50 mb-12">
          RERA approved&nbsp;&nbsp;·&nbsp;&nbsp;Clear title&nbsp;&nbsp;·&nbsp;&nbsp;From 2,400 sq ft
        </p>

        {/* Minimal search bar */}
        <div className="w-full max-w-[640px] flex flex-col sm:flex-row gap-2 mb-8">
          {/* City input */}
          <div className="flex items-center flex-1 bg-white/[0.08] border border-white/20 backdrop-blur-sm rounded-[10px] px-4">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-white/40 shrink-0"
              aria-hidden="true"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <label htmlFor="land-city" className="sr-only">
              City or development zone
            </label>
            <input
              id="land-city"
              type="text"
              placeholder="City or development zone…"
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="flex-1 text-[14px] font-light text-white placeholder-white/35 outline-none bg-transparent py-3.5 px-2 min-w-0"
            />
          </div>

          {/* Area select */}
          <div className="relative shrink-0">
            <label htmlFor="land-area" className="sr-only">
              Plot area range
            </label>
            <select
              id="land-area"
              value={plotArea}
              onChange={(e) => setPlotArea(e.target.value)}
              className="appearance-none bg-white/[0.08] border border-white/20 backdrop-blur-sm text-[14px] font-light text-white rounded-[10px] px-4 pr-8 py-3.5 outline-none focus-visible:ring-2 focus-visible:ring-white/40 cursor-pointer w-full sm:w-auto"
            >
              <option value="" className="text-ink bg-white">Any area</option>
              <option value="lt5000" className="text-ink bg-white">&lt; 5,000 sq ft</option>
              <option value="5000-15000" className="text-ink bg-white">5,000 – 15,000 sq ft</option>
              <option value="gt15000" className="text-ink bg-white">15,000+ sq ft</option>
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>

          {/* Search button */}
          <button
            type="button"
            onClick={handleSubmit}
            aria-label="Search land plots"
            className="px-7 py-3.5 bg-white text-ink text-[13px] font-semibold rounded-[10px] hover:bg-white/90 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent whitespace-nowrap shrink-0"
          >
            Search Plots
          </button>
        </div>

        {/* Minimal chips — refined, spaced */}
        <div
          role="group"
          aria-label="Plot filters"
          className="flex flex-wrap justify-center gap-3"
        >
          {(cat?.chips ?? []).map((pill) => (
            <button
              key={pill}
              type="button"
              aria-pressed="false"
              onClick={() => handlePillClick(pill)}
              className="px-4 py-1.5 text-[12px] font-light tracking-[0.1em] rounded-full border border-white/20 bg-transparent hover:bg-white/10 text-white/60 hover:text-white/85 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {pill}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
