"use client";

/**
 * FlatmateHero — ASYMMETRIC two-column layout, playful and friendly.
 * Left: large rounded card with "Looking for" Male/Female/Any toggle +
 *   locality input + Find button.
 * Right: stat cluster floating on the video.
 * Coral-orange accent, rounded corners everywhere.
 */

import { useState, useCallback } from "react";
import { getCategory } from "@/lib/categories";

function scrollToResults() {
  document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
}

type LookingFor = "Any" | "Male" | "Female";
const LOOKING_FOR_OPTIONS: LookingFor[] = ["Any", "Male", "Female"];

export default function FlatmateHero({ city = "Bengaluru" }: { city?: string }) {
  const cat = getCategory("flatmate");
  const headline = cat?.headline.replace("{city}", city) ?? `Flatmates looking to share in ${city}`;

  const [lookingFor, setLookingFor] = useState<LookingFor>("Any");
  const [locality, setLocality] = useState("");

  const handleSubmit = useCallback(() => {
    console.log("[FlatmateHero] search", { lookingFor, locality });
    scrollToResults();
  }, [lookingFor, locality]);

  return (
    <section
      aria-label={headline}
      className="relative overflow-hidden -mx-4 md:-mx-6 lg:-mx-10 mb-8"
      style={{ minHeight: "clamp(440px, 58vh, 640px)" }}
    >
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/categories/flatmate.jpg"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video/residential.mp4" type="video/mp4" />
      </video>

      {/* Scrim — warm coral, left-heavy */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff5f6d]/75 via-[#ffc371]/35 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

      {/* Content — asymmetric two column */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 pt-12 md:pt-16 pb-12 md:pb-16">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-16">

          {/* Left: main search card — bigger column */}
          <div className="w-full lg:flex-[1.4] min-w-0">
            {/* Friendly headline */}
            <h1
              className="text-white font-extrabold leading-[1.1] mb-2 drop-shadow"
              style={{ fontSize: "clamp(28px, 4.5vw, 52px)" }}
            >
              {headline}
            </h1>

            <p className="text-white/75 text-sm md:text-base font-normal mb-7">
              640+ rooms open today · Verified profiles · No brokerage
            </p>

            {/* Search card — big rounded, white */}
            <div className="bg-white rounded-[24px] shadow-[rgba(0,0,0,0.22)_0_8px_36px] p-5 max-w-[500px]">

              {/* "Looking for" label + toggle */}
              <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-2">
                Looking for
              </p>
              <div
                role="group"
                aria-label="Looking for gender preference"
                className="flex gap-2 mb-4"
              >
                {LOOKING_FOR_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    aria-pressed={lookingFor === opt}
                    onClick={() => setLookingFor(opt)}
                    className={`flex-1 py-2 rounded-[12px] text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#ff5f6d] ${
                      lookingFor === opt
                        ? "bg-[#ff5f6d] text-white shadow-sm"
                        : "bg-surface-soft text-body hover:bg-surface-strong"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {/* Locality input */}
              <label htmlFor="flatmate-hero-locality" className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-2">
                Where
              </label>
              <div className="flex items-center gap-2 border border-hairline rounded-[14px] px-3 py-2.5 mb-4 focus-within:border-[#ff5f6d] transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-soft shrink-0" aria-hidden="true">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  id="flatmate-hero-locality"
                  type="text"
                  placeholder="Area you want to live in…"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="flex-1 text-sm text-body placeholder:text-muted-soft outline-none bg-transparent min-w-0"
                />
              </div>

              {/* Find button */}
              <button
                type="button"
                onClick={handleSubmit}
                aria-label="Find flatmates"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#ff5f6d] text-white rounded-[14px] font-bold text-sm hover:bg-[#e84a58] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ff5f6d]"
              >
                Find Flatmates
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right: floating stat cluster (desktop only) */}
          <div className="hidden lg:flex lg:flex-1 flex-col gap-4 items-start">
            {[
              { stat: "640+", desc: "Rooms open today", color: "bg-white/15" },
              { stat: "4.4★", desc: "Average rating", color: "bg-white/10" },
              { stat: "₹11K/mo", desc: "Average share rent", color: "bg-white/12" },
            ].map(({ stat, desc, color }) => (
              <div
                key={stat}
                className={`${color} backdrop-blur-sm border border-white/20 rounded-[16px] px-5 py-4 w-full max-w-[220px]`}
              >
                <p className="text-2xl font-extrabold text-white leading-none">{stat}</p>
                <p className="text-xs text-white/65 mt-1 font-medium">{desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
