"use client";

/**
 * ServiceApartmentHero — CLEAN MODERN SPLIT
 *
 * Layout: strict left/right split on desktop. Left column holds the
 * structured copy (small-caps eyebrow, normal-case headline in a heavier
 * weight, a terse data grid of selling-point stats). Right column (desktop
 * only) contains the search form as a self-standing white card that floats
 * above the video. On mobile both columns stack, form first (below headline).
 *
 * Typography: sentence-case, tight tracking, sharp weight contrast between
 * the stat numbers and their labels. No uppercase headlines — this is
 * corporate-clean rather than expressive-loud.
 *
 * Search: area text input + a Stay-duration segmented control + Search button.
 */

import { useState } from "react";
import { getCategory } from "@/lib/categories";

type StayDuration = "Short stay" | "Long stay";

export default function ServiceApartmentHero({ city = "Bengaluru" }: { city?: string }) {
  const cat = getCategory("service-apartment");
  const headline = cat?.headline.replace("{city}", city) ?? `Service apartments in ${city}`;
  const subline = cat?.subtitle ?? "Fully serviced stays";

  const [area, setArea] = useState("");
  const [duration, setDuration] = useState<StayDuration>("Short stay");

  function handleSubmit() {
    console.log("[ServiceApartmentHero] search", { area, duration });
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
  }

  const durations: StayDuration[] = ["Short stay", "Long stay"];

  const stats = [
    { value: "280+", label: "Apartments" },
    { value: "24 hr", label: "Check-in" },
    { value: "4.6★", label: "Avg rating" },
  ];

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
        poster="/categories/service-apartment.jpg"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video/stay.mp4" type="video/mp4" />
      </video>

      {/* Scrim — strong left-to-right gradient so left text column is always readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a2a4a]/90 via-[#1a2a4a]/55 to-[#1a2a4a]/15" />
      {/* Fallback bottom vignette for mobile */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1a2a4a]/50 md:hidden" />

      {/* Content */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 pt-12 md:pt-16 pb-12 md:pb-16">
        <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16">

          {/* LEFT column — copy */}
          <div className="flex-1 min-w-0 max-w-[560px]">
            {/* Eyebrow — small-caps style via uppercase + tight tracking */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7ab8f5] mb-4">
              {subline}
            </p>

            {/* Headline — sentence case, heavy, tight leading */}
            <h1 className="text-[clamp(26px,3.8vw,50px)] font-bold text-white leading-[1.1] tracking-[-0.02em] mb-5">
              {headline}
            </h1>

            {/* Body copy — structured single sentence */}
            <p className="text-sm md:text-[15px] text-white/75 font-normal leading-relaxed mb-8 max-w-[460px]">
              Hotel-grade services in a full apartment — housekeeping, fast Wi-Fi, and a
              fully equipped kitchen included with every stay.
            </p>

            {/* Stats row — structured data grid */}
            <div className="flex gap-6 md:gap-10">
              {stats.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-[22px] md:text-[28px] font-bold text-white leading-none tracking-tight">
                    {value}
                  </p>
                  <p className="text-[11px] text-white/55 uppercase tracking-widest mt-1">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT column — search card (floats on desktop, stacks on mobile) */}
          <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0">
            <div className="bg-white rounded-[16px] shadow-[rgba(0,0,0,0.22)_0_12px_40px] p-5 md:p-6">
              {/* Card headline */}
              <p className="text-sm font-semibold text-ink mb-4">
                Find your apartment
              </p>

              {/* Area input */}
              <div className="mb-4">
                <label htmlFor="sa-area" className="block text-[11px] font-semibold uppercase tracking-widest text-muted mb-1.5">
                  Area or neighbourhood
                </label>
                <div className="flex items-center gap-2 border border-hairline rounded-[10px] px-3 h-11 focus-within:border-[#3a7bd5] focus-within:ring-1 focus-within:ring-[#3a7bd5] transition-all">
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
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                  </svg>
                  <input
                    id="sa-area"
                    type="text"
                    placeholder="Indiranagar, Whitefield…"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="flex-1 text-sm text-body placeholder-muted-soft outline-none bg-transparent min-w-0"
                  />
                </div>
              </div>

              {/* Stay duration segmented control */}
              <div className="mb-5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-1.5">
                  Stay duration
                </p>
                <div
                  role="group"
                  aria-label="Stay duration"
                  className="flex rounded-[10px] border border-hairline overflow-hidden"
                >
                  {durations.map((d) => (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={duration === d}
                      onClick={() => setDuration(d)}
                      className={[
                        "flex-1 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3a7bd5]",
                        duration === d
                          ? "bg-[#3a7bd5] text-white"
                          : "bg-white text-body hover:bg-surface-soft",
                      ].join(" ")}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search button */}
              <button
                type="button"
                onClick={handleSubmit}
                aria-label="Search service apartments"
                className="w-full h-11 bg-[#3a7bd5] hover:bg-[#2d6bc0] active:scale-[0.98] text-white font-semibold text-sm rounded-[10px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3a7bd5]"
              >
                Search apartments
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
