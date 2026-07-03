"use client";

/**
 * HotelHero — BOLD CENTERED
 *
 * Layout: centered column but with a deliberately PUNCHY typographic
 * treatment: headline is ALL-CAPS, black weight (900), extreme tight
 * leading (0.9), very wide letter-spacing on a smaller prefix word
 * vs compressed on the city name — conveying premium confidence.
 *
 * Star-rating chips act as the primary filter row (3★ / 4★ / 5★ toggle).
 * Search is a single-row bar: city input + a check-in chip + Search.
 * Purple gradient scrim reflects the category's gradient token.
 */

import { useState } from "react";
import { getCategory } from "@/lib/categories";

type StarFilter = "3★" | "4★" | "5★";

export default function HotelHero({ city = "Bengaluru" }: { city?: string }) {
  const cat = getCategory("hotel");
  const headline = cat?.headline.replace("{city}", city) ?? `Hotels in ${city}`;
  const subline = cat?.subtitle ?? "Budget to luxury hotels";

  const [where, setWhere] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [starFilter, setStarFilter] = useState<StarFilter | null>(null);

  const starOptions: StarFilter[] = ["3★", "4★", "5★"];

  function handleSubmit() {
    console.log("[HotelHero] search", { where, checkIn, starFilter });
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
  }

  function handleStarClick(star: StarFilter) {
    const next = starFilter === star ? null : star;
    console.log("[HotelHero] filter", { starFilter: next });
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    setStarFilter(next);
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
        poster="/categories/hotel.jpg"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video/stay.mp4" type="video/mp4" />
      </video>

      {/* Bold purple scrim */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4a0070]/80 via-[#834d9b]/60 to-[#d04ed6]/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />

      {/* Content — centered column */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 md:px-6 pt-12 md:pt-18 pb-14 md:pb-18">

        {/* Punchy headline — extreme uppercase, near-black weight */}
        <h1 className="text-[clamp(32px,6vw,74px)] font-black uppercase tracking-[0.06em] leading-[0.92] text-white drop-shadow-md mb-2 max-w-[720px]">
          {headline}
        </h1>

        {/* Subline — contrasting light weight, generous tracking */}
        <p className="text-sm md:text-base font-light tracking-[0.06em] uppercase text-white/70 mb-6">
          {subline} &nbsp;&bull;&nbsp; instant booking
        </p>

        {/* Star-rating filter row — primary interaction before search */}
        <div
          role="group"
          aria-label="Filter by star rating"
          className="flex items-center gap-3 mb-7"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/60 shrink-0">
            Stars
          </span>
          {starOptions.map((star) => {
            const active = starFilter === star;
            return (
              <button
                key={star}
                type="button"
                aria-pressed={active}
                onClick={() => handleStarClick(star)}
                className={[
                  "w-14 h-10 rounded-[10px] text-sm font-bold tracking-wide border-2 transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                  active
                    ? "bg-white text-[#834d9b] border-white shadow-[0_0_0_3px_rgba(255,255,255,0.25)]"
                    : "bg-transparent text-white border-white/40 hover:border-white/70 hover:bg-white/10",
                ].join(" ")}
              >
                {star}
              </button>
            );
          })}
        </div>

        {/* Search bar — city input + check-in chip + button */}
        <div className="w-full max-w-[600px] flex flex-col sm:flex-row gap-2 sm:gap-0 items-stretch sm:items-center bg-white/95 rounded-[14px] border border-white/40 shadow-[rgba(0,0,0,0.25)_0_8px_32px] overflow-hidden">
          {/* City input */}
          <div className="flex items-center gap-2 flex-1 px-4 py-3 sm:py-0 sm:h-14">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[#834d9b] shrink-0"
              aria-hidden="true"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <label htmlFor="hotel-city" className="sr-only">
              City, area or hotel
            </label>
            <input
              id="hotel-city"
              type="text"
              placeholder="City, area or hotel…"
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="flex-1 text-sm text-body placeholder-muted-soft outline-none bg-transparent min-w-0"
            />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-7 bg-hairline shrink-0" aria-hidden="true" />
          <div className="sm:hidden h-px bg-hairline mx-4" aria-hidden="true" />

          {/* Check-in date chip */}
          <div className="flex items-center gap-2 px-4 py-2 sm:py-0 sm:h-14 sm:w-44 shrink-0">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-soft shrink-0"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <label htmlFor="hotel-checkin" className="sr-only">
              Check-in date
            </label>
            <input
              id="hotel-checkin"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="flex-1 text-sm text-body outline-none bg-transparent min-w-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#834d9b] rounded"
              aria-label="Check-in date"
            />
          </div>

          {/* Search button */}
          <button
            type="button"
            onClick={handleSubmit}
            aria-label="Search hotels"
            className="m-1.5 sm:m-2 h-10 px-7 bg-[#834d9b] hover:bg-[#6d3d82] active:scale-95 text-white font-bold text-sm uppercase tracking-[0.08em] rounded-[10px] transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#834d9b] whitespace-nowrap"
          >
            Search
          </button>
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mt-6">
          {["1,400+ reviews", "Free cancellation options", "Best price guarantee"].map((tag) => (
            <span key={tag} className="text-[11px] text-white/60 font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
