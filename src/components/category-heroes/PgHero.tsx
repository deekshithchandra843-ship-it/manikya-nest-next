"use client";

/**
 * PgHero — SPLIT layout: left = headline + eyebrow; right = frosted-glass
 * search card with area <select>, Gender segmented chip group, text input,
 * and Search button. Teal-green accent.
 */

import { useState, useCallback } from "react";
import { getCategory } from "@/lib/categories";

function scrollToResults() {
  document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
}

type Gender = "Any" | "Male" | "Female" | "Co-ed";
const GENDER_OPTIONS: Gender[] = ["Any", "Male", "Female", "Co-ed"];

export default function PgHero({ city = "Bengaluru" }: { city?: string }) {
  const cat = getCategory("pg");
  const headline = cat?.headline.replace("{city}", city) ?? `PG & hostels in ${city}`;

  const [area, setArea] = useState("");
  const [gender, setGender] = useState<Gender>("Any");
  const [query, setQuery] = useState("");

  const handleSubmit = useCallback(() => {
    console.log("[PgHero] search", { area, gender, query });
    scrollToResults();
  }, [area, gender, query]);

  return (
    <section
      aria-label={headline}
      className="relative overflow-hidden -mx-4 md:-mx-6 lg:-mx-10 mb-8"
      style={{ minHeight: "clamp(460px, 62vh, 680px)" }}
    >
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/categories/pg.jpg"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video/residential.mp4" type="video/mp4" />
      </video>

      {/* Scrim — teal-dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#11998e]/80 via-[#0d6e62]/60 to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Content — split grid */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 pt-14 md:pt-18 pb-14 md:pb-18">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10 lg:gap-16">

          {/* Left: headline */}
          <div className="flex-1 min-w-0">
            {/* Uppercase tracked eyebrow */}
            <p className="text-[11px] font-extrabold tracking-[0.25em] uppercase text-[#38ef7d] mb-4">
              Paying Guest &amp; Hostels
            </p>

            <h1
              className="text-white font-bold leading-[1.08] tracking-tight drop-shadow mb-5"
              style={{ fontSize: "clamp(32px, 5vw, 60px)" }}
            >
              {headline}
            </h1>

            <ul className="space-y-2" aria-label="Key features">
              {["1,800+ rooms available now", "Meals & Wi-Fi included", "Zero brokerage"].map((feat) => (
                <li key={feat} className="flex items-center gap-2.5 text-sm text-white/80">
                  <span className="w-4 h-4 rounded-full bg-[#38ef7d]/20 border border-[#38ef7d]/40 flex items-center justify-center shrink-0" aria-hidden="true">
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" stroke="#38ef7d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: frosted-glass search card */}
          <div className="w-full lg:w-[360px] shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-5 shadow-[rgba(0,0,0,0.2)_0_8px_32px]">
              <p className="text-sm font-bold text-white mb-4 tracking-wide">
                Find your PG
              </p>

              {/* Area select */}
              <div className="mb-3">
                <label htmlFor="pg-hero-area" className="text-[10px] font-semibold uppercase tracking-widest text-white/60 block mb-1">
                  Area
                </label>
                <select
                  id="pg-hero-area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-[10px] px-3 py-2.5 text-sm text-white outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <option value="" className="text-ink bg-white">Any area</option>
                  <option value="koramangala" className="text-ink bg-white">Koramangala</option>
                  <option value="indiranagar" className="text-ink bg-white">Indiranagar</option>
                  <option value="btm" className="text-ink bg-white">BTM Layout</option>
                  <option value="hsr" className="text-ink bg-white">HSR Layout</option>
                  <option value="whitefield" className="text-ink bg-white">Whitefield</option>
                  <option value="electronic-city" className="text-ink bg-white">Electronic City</option>
                </select>
              </div>

              {/* Gender segmented group */}
              <div className="mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-1.5">
                  Gender
                </p>
                <div role="group" aria-label="Select gender preference" className="flex gap-1.5 flex-wrap">
                  {GENDER_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      aria-pressed={gender === g}
                      onClick={() => setGender(g)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                        gender === g
                          ? "bg-[#38ef7d] text-[#0d3b35] border-[#38ef7d]"
                          : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keyword input */}
              <div className="mb-4">
                <label htmlFor="pg-hero-query" className="text-[10px] font-semibold uppercase tracking-widest text-white/60 block mb-1">
                  College / Company
                </label>
                <input
                  id="pg-hero-query"
                  type="text"
                  placeholder="Area, college or company…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full bg-white/10 border border-white/20 rounded-[10px] px-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                />
              </div>

              {/* Search button */}
              <button
                type="button"
                onClick={handleSubmit}
                aria-label="Search PGs"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#11998e] text-white rounded-[12px] font-bold text-sm hover:bg-[#0d7a71] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find PG &amp; Hostels
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
