"use client";

/**
 * ResortHero — IMMERSIVE / FULL-BLEED
 *
 * Layout: content anchored to the BOTTOM-LEFT corner of a tall viewport-
 * spanning section. Headline is very large, UPPERCASE with wide tracking
 * — maximum airy presence. Scrim is extremely light (only bottom vignette)
 * so the video is the experience. Search sits as a compact strip close to
 * the headline, not a tall box. Destination chips float left below.
 */

import { useState } from "react";
import { getCategory } from "@/lib/categories";

export default function ResortHero({ city = "Bengaluru" }: { city?: string }) {
  const cat = getCategory("resort");
  const headline = cat?.headline.replace("{city}", city) ?? `Resorts near ${city}`;
  const subline = cat?.subtitle ?? "Getaway & leisure resorts";

  const [destination, setDestination] = useState("");
  const [guests, setGuests] = useState<string>("2");

  function handleSubmit() {
    console.log("[ResortHero] search", { destination, guests });
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
  }

  const quickDestinations = ["Nandi Hills", "Coorg", "Chikmagalur", "Sakleshpur"];

  return (
    <section
      aria-label={headline}
      className="relative overflow-hidden -mx-4 md:-mx-6 lg:-mx-10 mb-8 min-h-[520px] md:min-h-[640px]"
    >
      {/* Video background — full bleed, hero of the page */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/categories/resort.jpg"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video/stay.mp4" type="video/mp4" />
      </video>

      {/* Minimal scrim — only a bottom-up dark vignette; top stays transparent */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      {/* Very subtle side vignette to anchor the text column */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

      {/* Content — bottom-left anchored */}
      <div className="relative z-10 flex flex-col justify-end h-full min-h-[520px] md:min-h-[640px] px-4 md:px-8 lg:px-12 pb-10 md:pb-14">
        <div className="max-w-[680px]">
          {/* Subline above headline — uppercase label style */}
          <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.2em] text-[#20e3b2] mb-3">
            {subline}
          </p>

          {/* Headline — massive, airy uppercase, wide tracking */}
          <h1 className="text-[clamp(36px,6.5vw,80px)] font-extrabold uppercase tracking-[0.04em] leading-[0.95] text-white drop-shadow mb-7">
            {headline}
          </h1>

          {/* Compact search strip */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-stretch max-w-[560px]">
            <div className="flex items-center gap-2 flex-1 bg-white/10 border border-white/25 backdrop-blur-md rounded-[12px] sm:rounded-r-none sm:rounded-l-[12px] px-4 h-12">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/60 shrink-0"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <label htmlFor="resort-destination" className="sr-only">
                Destination or resort
              </label>
              <input
                id="resort-destination"
                type="text"
                placeholder="Destination or resort…"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="flex-1 text-sm text-white placeholder-white/50 outline-none bg-transparent min-w-0"
              />
            </div>

            {/* Guests select */}
            <div className="flex items-center bg-white/10 border border-white/25 border-t-0 sm:border-t sm:border-l-0 backdrop-blur-md sm:rounded-none px-3 h-12 gap-1 rounded-[12px] sm:rounded-none">
              <label htmlFor="resort-guests" className="text-xs text-white/60 shrink-0 whitespace-nowrap">
                Guests
              </label>
              <select
                id="resort-guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="bg-transparent text-white text-sm outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[#20e3b2] min-w-[3rem]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((n) => (
                  <option key={n} value={String(n)} className="text-ink bg-white">
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Search button */}
            <button
              type="button"
              onClick={handleSubmit}
              aria-label="Search resorts"
              className="h-12 px-7 bg-[#0cebeb] hover:bg-[#0dd6d6] active:scale-95 text-ink font-bold text-sm tracking-wide uppercase rounded-[12px] sm:rounded-l-none sm:rounded-r-[12px] transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0cebeb] whitespace-nowrap"
            >
              Find
            </button>
          </div>

          {/* Quick-destination chips */}
          <div
            role="group"
            aria-label="Popular destinations"
            className="flex flex-wrap gap-2 mt-4"
          >
            <span className="text-[11px] text-white/55 font-medium self-center shrink-0 uppercase tracking-widest mr-1">
              Nearby
            </span>
            {quickDestinations.map((dest) => (
              <button
                key={dest}
                type="button"
                aria-pressed={destination === dest}
                onClick={() => {
                  setDestination(dest);
                  console.log("[ResortHero] chip", { destination: dest, guests });
                  document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-3 py-1 text-[12px] font-medium rounded-md border border-white/25 bg-white/10 hover:bg-white/20 text-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20e3b2] focus-visible:ring-offset-1"
              >
                {dest}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
