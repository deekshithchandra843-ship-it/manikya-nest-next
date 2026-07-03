"use client";

/**
 * HomestayHero — COSY / WARM
 *
 * Layout: fully centered, stacked column. Headline is mid-weight at a
 * generous but not aggressive size, with relaxed line-height to feel
 * inviting rather than loud. Search bar is extra-rounded (pill) with a
 * soft amber accent button. Chips sit below as a friendly "filter row".
 * A warm amber+yellow scrim keeps the video visible but the text safe.
 */

import { useState } from "react";
import { getCategory } from "@/lib/categories";

export default function HomestayHero({ city = "Bengaluru" }: { city?: string }) {
  const cat = getCategory("homestay");
  const headline = cat?.headline.replace("{city}", city) ?? `Homestays in ${city}`;
  const subline = cat?.subtitle ?? "Cosy homestays & B&Bs";

  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState(1);
  const [activeChips, setActiveChips] = useState<Set<string>>(new Set());

  const chips = ["Entire place", "Meals", "Pet-friendly"];

  function toggleChip(chip: string) {
    setActiveChips((prev) => {
      const next = new Set(prev);
      if (next.has(chip)) next.delete(chip);
      else next.add(chip);
      return next;
    });
  }

  function handleSubmit() {
    console.log("[HomestayHero] search", {
      location,
      guests,
      filters: [...activeChips],
    });
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
  }

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
        poster="/categories/homestay.jpg"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video/stay.mp4" type="video/mp4" />
      </video>

      {/* Warm amber scrim — leaves plenty of video visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f7971e]/55 via-[#ffd200]/30 to-black/65" />

      {/* Content — fully centered column */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 md:px-6 pt-14 md:pt-20 pb-14 md:pb-20">
        {/* Eyebrow label */}
        <span className="inline-block mb-4 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
          Stay with a local host
        </span>

        {/* Headline — warm, inviting, medium weight, relaxed leading */}
        <h1 className="text-[clamp(28px,5vw,60px)] font-semibold text-white leading-[1.18] tracking-[-0.01em] max-w-[640px] drop-shadow-sm mb-3">
          {headline}
        </h1>

        {/* Subline — soft, roomy */}
        <p className="text-sm md:text-base text-white/80 font-normal mb-8 max-w-[440px] leading-relaxed">
          {subline} &mdash; homemade meals, local tips, and a real neighbourhood welcome.
        </p>

        {/* Search bar — very rounded, two-field (location + guests stepper) */}
        <div className="w-full max-w-[560px] bg-white/95 rounded-[40px] shadow-[rgba(0,0,0,0.18)_0_6px_24px] flex flex-col sm:flex-row items-stretch sm:items-center overflow-hidden border border-white/50">
          {/* Location field */}
          <div className="flex items-center gap-2 flex-1 px-5 py-3 sm:py-0 sm:h-14">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[#f7971e] shrink-0"
              aria-hidden="true"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>
            <label htmlFor="homestay-location" className="sr-only">
              City or locality
            </label>
            <input
              id="homestay-location"
              type="text"
              placeholder="City or locality…"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="flex-1 text-sm text-body placeholder-muted-soft outline-none bg-transparent min-w-0"
            />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-7 bg-hairline shrink-0" aria-hidden="true" />
          <div className="sm:hidden h-px bg-hairline mx-4" aria-hidden="true" />

          {/* Guests stepper */}
          <div className="flex items-center gap-2 px-5 py-3 sm:py-0 sm:h-14 sm:w-40 shrink-0">
            <span className="text-sm text-muted-soft shrink-0">Guests</span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                aria-label="Remove a guest"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                disabled={guests <= 1}
                className="w-7 h-7 rounded-full border border-hairline flex items-center justify-center text-ink hover:border-border-strong disabled:opacity-30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7971e]"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14" /></svg>
              </button>
              <span className="text-sm font-semibold text-ink w-4 text-center" aria-live="polite">
                {guests}
              </span>
              <button
                type="button"
                aria-label="Add a guest"
                onClick={() => setGuests((g) => Math.min(16, g + 1))}
                disabled={guests >= 16}
                className="w-7 h-7 rounded-full border border-hairline flex items-center justify-center text-ink hover:border-border-strong disabled:opacity-30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7971e]"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              </button>
            </div>
          </div>

          {/* Search button */}
          <button
            type="button"
            onClick={handleSubmit}
            aria-label="Search homestays"
            className="m-1.5 sm:m-2 h-10 sm:h-10 px-6 bg-[#f7971e] hover:bg-[#e8860d] active:scale-95 text-white font-semibold text-sm rounded-full transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#f7971e] whitespace-nowrap"
          >
            Search
          </button>
        </div>

        {/* Chip filters — friendly toggle row */}
        <div
          role="group"
          aria-label="Stay type filters"
          className="flex flex-wrap justify-center gap-2.5 mt-5"
        >
          {chips.map((chip) => {
            const active = activeChips.has(chip);
            return (
              <button
                key={chip}
                type="button"
                aria-pressed={active}
                onClick={() => toggleChip(chip)}
                className={[
                  "px-4 py-1.5 rounded-full text-[13px] font-medium border transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1",
                  active
                    ? "bg-white text-[#f7971e] border-white"
                    : "bg-white/15 text-white border-white/35 hover:bg-white/25",
                ].join(" ")}
              >
                {chip}
              </button>
            );
          })}
        </div>

        {/* Social proof — subtle trust signal */}
        <p className="mt-6 text-[12px] text-white/65 font-normal">
          240+ verified hosts &nbsp;&middot;&nbsp; 4.8 avg rating &nbsp;&middot;&nbsp; Monthly stays welcome
        </p>
      </div>
    </section>
  );
}
