"use client";

/**
 * CoworkingHero — MODERN SPLIT layout.
 * Left column: headline + subline. Right column: floating search card with
 * locality input + desk-type chips. Modern teal-to-dark palette.
 */

import { useState, useCallback } from "react";
import { getCategory } from "@/lib/categories";

type DeskType = "Hot desk" | "Dedicated desk" | "Private cabin";

const DESK_OPTIONS: { type: DeskType; price: string }[] = [
  { type: "Hot desk", price: "from ₹5,000/mo" },
  { type: "Dedicated desk", price: "from ₹8,000/mo" },
  { type: "Private cabin", price: "from ₹18,000/mo" },
];

function scrollToResults() {
  document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
}

export default function CoworkingHero({ city = "Bengaluru" }: { city?: string }) {
  const cat = getCategory("coworking");
  const headline = cat ? cat.headline.replace("{city}", city) : `Co-working spaces in ${city}`;
  const subline = cat?.subtitle ?? "Desks & private cabins";

  const [locality, setLocality] = useState("");
  const [deskType, setDeskType] = useState<DeskType | null>(null);

  const handleSubmit = useCallback(() => {
    console.log("[CoworkingHero] search", { locality, deskType });
    scrollToResults();
  }, [locality, deskType]);

  const handleDeskClick = useCallback(
    (type: DeskType) => {
      const next = deskType === type ? null : type;
      setDeskType(next);
      console.log("[CoworkingHero] deskType", { deskType: next });
      scrollToResults();
    },
    [deskType]
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
        poster="/categories/coworking.jpg"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video/commercial.mp4" type="video/mp4" />
      </video>

      {/* Scrim */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F2027]/88 via-[#0F2027]/70 to-[#2C5364]/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Two-column layout */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 pt-10 md:pt-16 pb-12 md:pb-16">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10 lg:gap-16">

          {/* Left — headline block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-6 h-px bg-[#2C5364]" aria-hidden="true" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
                {subline}
              </span>
            </div>

            <h1 className="text-[clamp(30px,5vw,60px)] font-bold text-white leading-[1.05] tracking-[-0.02em] mb-6 max-w-[520px]">
              {headline}
            </h1>

            {/* Feature list */}
            <ul className="space-y-2" aria-label="Key features">
              {["24/7 access", "Meeting rooms included", "High-speed Wi-Fi", "Cafeteria & lounge"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white/75">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#2C5364] shrink-0" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — floating search card */}
          <div className="w-full lg:w-[360px] shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6 shadow-[rgba(0,0,0,0.3)_0_12px_40px]">
            <p className="text-[13px] font-bold text-white uppercase tracking-[0.14em] mb-4">
              Find your workspace
            </p>

            {/* Locality input */}
            <div className="flex items-center bg-white rounded-[10px] px-3 mb-4 shadow-sm">
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
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <label htmlFor="cw-locality" className="sr-only">
                Area or tech park
              </label>
              <input
                id="cw-locality"
                type="text"
                placeholder="Area or tech park…"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="flex-1 text-[13px] text-body placeholder-muted-soft outline-none bg-transparent py-3 px-2 min-w-0"
              />
            </div>

            {/* Desk type chips */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60 mb-3">
              Desk type
            </p>
            <div
              role="group"
              aria-label="Desk type"
              className="flex flex-col gap-2 mb-5"
            >
              {DESK_OPTIONS.map(({ type, price }) => {
                const isActive = deskType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleDeskClick(type)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-[8px] border text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      isActive
                        ? "bg-white text-ink border-white font-semibold"
                        : "bg-white/10 text-white/85 border-white/25 hover:bg-white/20 font-medium"
                    }`}
                  >
                    <span>{type}</span>
                    <span className={`text-[11px] ${isActive ? "text-muted" : "text-white/50"}`}>
                      {price}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              aria-label="Search co-working spaces"
              className="w-full py-3 bg-rausch text-white font-bold text-sm rounded-[10px] hover:bg-rausch-active active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rausch"
            >
              Search Spaces
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
