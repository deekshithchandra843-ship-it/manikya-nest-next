"use client";

/**
 * BuyHero — LEFT-aligned, heavy-weight, price-forward layout.
 * Headline + price subline on the left. Search = locality input +
 * Budget <select> side-by-side inside a card. Chips below.
 */

import { useState, useCallback } from "react";
import { getCategory } from "@/lib/categories";

function scrollToResults() {
  document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
}

export default function BuyHero({ city = "Bengaluru" }: { city?: string }) {
  const cat = getCategory("buy");
  const headline = cat?.headline.replace("{city}", city) ?? `Homes for sale in ${city}`;

  const chips = ["Ready to move", "New project", "RERA approved"];

  const [locality, setLocality] = useState("");
  const [budget, setBudget] = useState("");

  const handleSubmit = useCallback(() => {
    console.log("[BuyHero] search", { locality, budget });
    scrollToResults();
  }, [locality, budget]);

  const handleChip = useCallback((chip: string) => {
    console.log("[BuyHero] chip", { chip });
    scrollToResults();
  }, []);

  return (
    <section
      aria-label={headline}
      className="relative overflow-hidden -mx-4 md:-mx-6 lg:-mx-10 mb-8"
      style={{ minHeight: "clamp(440px, 60vh, 660px)" }}
    >
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/categories/buy.jpg"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video/residential.mp4" type="video/mp4" />
      </video>

      {/* Scrim — deep navy from left, fading right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#2B5876]/90 via-[#4E4376]/60 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Content — left-aligned */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 pt-14 md:pt-20 pb-14 md:pb-18">
        <div className="max-w-[640px]">

          {/* Eyebrow */}
          <p className="text-xs font-black text-white/60 tracking-[0.2em] uppercase mb-4">
            Bengaluru Real Estate
          </p>

          {/* Headline — heavy, confident */}
          <h1
            className="text-white font-black tracking-tight leading-[1.0] mb-3 drop-shadow"
            style={{ fontSize: "clamp(34px, 5.5vw, 64px)" }}
          >
            {headline}
          </h1>

          {/* Price-forward subline */}
          <p className="text-white/85 font-semibold mb-2" style={{ fontSize: "clamp(14px, 1.8vw, 18px)" }}>
            From <span className="text-white">₹60 Lakh</span> — RERA approved, zero hassle
          </p>
          <p className="text-white/60 text-sm font-normal mb-8">
            New launches · Resale · Ready to move
          </p>

          {/* Search card — locality + budget side by side */}
          <div className="bg-white rounded-[16px] shadow-[rgba(0,0,0,0.25)_0_8px_32px] p-3 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex flex-col gap-0.5 px-2 py-1">
              <label htmlFor="buy-hero-locality" className="text-[10px] font-bold text-muted uppercase tracking-widest">
                Location
              </label>
              <input
                id="buy-hero-locality"
                type="text"
                placeholder="Project, locality or builder…"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="text-sm text-body placeholder:text-muted-soft outline-none bg-transparent py-0.5 w-full"
              />
            </div>

            <div className="w-px bg-hairline-soft self-stretch hidden sm:block" aria-hidden="true" />

            <div className="flex flex-col gap-0.5 px-2 py-1 sm:w-44">
              <label htmlFor="buy-hero-budget" className="text-[10px] font-bold text-muted uppercase tracking-widest">
                Budget
              </label>
              <select
                id="buy-hero-budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="text-sm text-body outline-none bg-transparent cursor-pointer py-0.5 w-full"
              >
                <option value="">Any budget</option>
                <option value="under-50l">Under ₹50 Lakh</option>
                <option value="50l-1cr">₹50L – ₹1 Cr</option>
                <option value="1cr-2cr">₹1 Cr – ₹2 Cr</option>
                <option value="above-2cr">Above ₹2 Cr</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              aria-label="Search properties"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2B5876] text-white rounded-[12px] hover:bg-[#1e3f57] active:scale-95 transition-all font-bold text-sm shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2B5876]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>

          {/* Chips */}
          <div
            role="group"
            aria-label="Popular property types"
            className="flex flex-wrap items-center gap-2 mt-5"
          >
            {chips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChip(chip)}
                className="px-4 py-1.5 text-xs font-semibold rounded-full border border-white/30 bg-white/10 hover:bg-white/25 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
