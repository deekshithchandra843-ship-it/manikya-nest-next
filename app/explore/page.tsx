"use client";
import { useState } from "react";
import Link from "next/link";
import SearchBar from "../components/SearchBar";
import ListingCard from "../components/ListingCard";
import PageLayout from "../components/PageLayout";
import {
  World,
  CategoryDef,
  categoriesForWorld,
  categoryCount,
  getCategory,
  LISTINGS,
} from "../lib/categories";

// Trust proof-points — mirrors the home page strip so Explore feels of-a-piece.
const trustPoints = [
  {
    title: "Verified listings",
    sub: "Checked by our team",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Zero brokerage",
    sub: "Deal direct with owners",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
  },
  {
    title: "Rated 4.6★",
    sub: "By 12,000+ users",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    title: "Housing + Jobs",
    sub: "All in one place",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

// A small set of cross-category listings to surface as "Popular near you".
const popularIds = [6, 9, 1, 13, 16, 11];
const popular = popularIds
  .map((id) => LISTINGS.find((l) => l.id === id))
  .filter((l): l is (typeof LISTINGS)[number] => Boolean(l));

const WORLDS: { value: World; label: string }[] = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "stay", label: "Stays" },
];

// Sketch SVG props shared across all illustrations
const sketchProps = {
  width: 48,
  height: 48,
  viewBox: "0 0 48 48",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

function CategorySketch({ slug }: { slug: string }) {
  switch (slug) {
    // Rent — house with a dangling key tag
    case "rent":
      return (
        <svg {...sketchProps}>
          {/* House outline */}
          <path d="M8 22 L24 8 L40 22" />
          <path d="M12 22 L12 40 L22 40 L22 30 L26 30 L26 40 L36 40 L36 22" />
          {/* Door */}
          <rect x="20" y="30" width="8" height="10" rx="1" />
          {/* Chimney */}
          <path d="M30 15 L30 10 L34 10 L34 16" />
          {/* Key tag hanging from eave */}
          <circle cx="37" cy="28" r="2.5" />
          <path d="M37 30.5 L37 35" />
          <path d="M35 33 L39 33" />
          {/* "FOR RENT" label hint — tiny rectangle */}
          <rect x="13" y="27" width="7" height="4" rx="1" />
          <path d="M14 29 L19 29" />
        </svg>
      );

    // Buy — house with a price tag / sold badge
    case "buy":
      return (
        <svg {...sketchProps}>
          {/* House */}
          <path d="M7 22 L24 7 L41 22" />
          <path d="M11 22 L11 40 L21 40 L21 30 L27 30 L27 40 L37 40 L37 22" />
          {/* Door */}
          <rect x="21" y="30" width="6" height="10" rx="1" />
          {/* Rupee symbol inside house */}
          <path d="M20 18 L28 18M20 21 L28 21M24 21 L24 27M20 18 Q20 23 24 23" />
          {/* Price tag shape on corner */}
          <path d="M34 10 L41 10 L41 17 L37.5 20 L34 17 Z" />
          <circle cx="37" cy="13" r="1" />
        </svg>
      );

    // PG / Hostel — bunk beds
    case "pg":
      return (
        <svg {...sketchProps}>
          {/* Left bunk */}
          {/* Bottom bed frame */}
          <rect x="5" y="28" width="16" height="6" rx="1" />
          {/* Top bed frame */}
          <rect x="5" y="16" width="16" height="6" rx="1" />
          {/* Ladder posts */}
          <path d="M5 34 L5 14" />
          <path d="M21 34 L21 14" />
          {/* Ladder rungs */}
          <path d="M21 25 L25 25" />
          <path d="M21 20 L25 20" />
          {/* Mattress suggestion */}
          <path d="M6 29.5 L20 29.5" />
          <path d="M6 17.5 L20 17.5" />
          {/* Pillow blobs */}
          <ellipse cx="9" cy="29" rx="2.5" ry="1" />
          <ellipse cx="9" cy="17" rx="2.5" ry="1" />
          {/* Right single bed */}
          <rect x="28" y="28" width="15" height="6" rx="1" />
          <path d="M28 34 L28 38 M43 34 L43 38" />
          <ellipse cx="32" cy="28" rx="2.5" ry="1" />
          {/* ZZZ sleep hint */}
          <path d="M34 20 L38 20 L34 25 L38 25" />
        </svg>
      );

    // Co-living — sofa + two people silhouettes
    case "coliving":
      return (
        <svg {...sketchProps}>
          {/* Sofa body */}
          <path d="M8 32 Q8 26 12 26 L36 26 Q40 26 40 32 L40 38 L8 38 Z" />
          {/* Sofa back */}
          <path d="M12 26 L12 22 L36 22 L36 26" />
          {/* Sofa arms */}
          <path d="M8 32 L8 38" />
          <path d="M40 32 L40 38" />
          {/* Sofa seat divider */}
          <path d="M24 26 L24 38" />
          {/* Left person head */}
          <circle cx="17" cy="14" r="3.5" />
          {/* Left person shoulder/body */}
          <path d="M13 22 Q17 19 21 22" />
          {/* Right person head */}
          <circle cx="31" cy="14" r="3.5" />
          {/* Right person shoulder/body */}
          <path d="M27 22 Q31 19 35 22" />
        </svg>
      );

    // Homestay — cozy house with a plant and sun
    case "homestay":
      return (
        <svg {...sketchProps}>
          {/* House */}
          <path d="M9 23 L24 10 L39 23" />
          <path d="M13 23 L13 40 L35 40 L35 23" />
          {/* Door */}
          <path d="M20 40 L20 32 Q24 29 28 32 L28 40" />
          {/* Window */}
          <rect x="15" y="25" width="5" height="5" rx="0.5" />
          <path d="M17.5 25 L17.5 30 M15 27.5 L20 27.5" />
          {/* Sun rays upper right */}
          <circle cx="37" cy="10" r="3" />
          <path d="M37 5.5 L37 4 M40.6 6.4 L41.7 5.3 M42 10 L43.5 10 M40.6 13.6 L41.7 14.7" />
          {/* Potted plant left of door */}
          <path d="M10 40 L10 36" />
          <ellipse cx="10" cy="35" rx="3" ry="2" />
          <path d="M10 35 Q8 30 10 28 M10 35 Q12 30 10 28" />
        </svg>
      );

    // Flatmate — two people + a door / handshake
    case "flatmate":
      return (
        <svg {...sketchProps}>
          {/* Door frame */}
          <rect x="18" y="16" width="12" height="20" rx="1" />
          {/* Door knob */}
          <circle cx="27" cy="27" r="1" />
          {/* Door arch */}
          <path d="M18 16 Q24 10 30 16" />
          {/* Left person */}
          <circle cx="10" cy="14" r="3.5" />
          <path d="M6 26 Q10 20 14 26 L14 32 L6 32 Z" />
          {/* Right person */}
          <circle cx="38" cy="14" r="3.5" />
          <path d="M34 26 Q38 20 42 26 L42 32 L34 32 Z" />
          {/* Handshake in doorway */}
          <path d="M18 29 Q24 32 30 29" />
          <path d="M20 27 L28 31" />
        </svg>
      );

    // Commercial office — multi-window tower + desk hint
    case "commercial-office":
      return (
        <svg {...sketchProps}>
          {/* Main tower */}
          <rect x="12" y="8" width="16" height="34" rx="1" />
          {/* Side wing */}
          <rect x="28" y="18" width="8" height="24" rx="1" />
          {/* Ground line */}
          <path d="M8 42 L40 42" />
          {/* Windows grid — main tower */}
          <rect x="15" y="12" width="3" height="3" />
          <rect x="21" y="12" width="3" height="3" />
          <rect x="15" y="18" width="3" height="3" />
          <rect x="21" y="18" width="3" height="3" />
          <rect x="15" y="24" width="3" height="3" />
          <rect x="21" y="24" width="3" height="3" />
          {/* Windows — side wing */}
          <rect x="30" y="21" width="3" height="3" />
          <rect x="30" y="27" width="3" height="3" />
          {/* Desk hint at base */}
          <path d="M13 42 L13 38 L27 38" />
          <path d="M16 38 L16 36 L26 36" />
        </svg>
      );

    // Commercial shop — shopfront with awning
    case "commercial-shop":
      return (
        <svg {...sketchProps}>
          {/* Building box */}
          <rect x="8" y="16" width="32" height="26" rx="1" />
          {/* Awning */}
          <path d="M6 16 Q24 10 42 16" />
          <path d="M8 16 L8 20 M16 16 L14 20 M24 16 L24 20 M32 16 L30 20 M40 16 L40 20" />
          {/* Shop window */}
          <rect x="11" y="22" width="12" height="10" rx="0.5" />
          {/* Door */}
          <rect x="27" y="30" width="9" height="12" rx="0.5" />
          <circle cx="29" cy="37" r="0.8" />
          {/* Sign board */}
          <rect x="13" y="17" width="8" height="3" rx="0.5" />
          {/* Open sign in window */}
          <path d="M13 26 L21 26" />
          <path d="M13 29 L19 29" />
        </svg>
      );

    // Co-working — desk with laptop + open-plan hint
    case "coworking":
      return (
        <svg {...sketchProps}>
          {/* Desk surface */}
          <path d="M6 28 L42 28" />
          <path d="M10 28 L10 38 M38 28 L38 38" />
          {/* Laptop screen */}
          <rect x="16" y="18" width="16" height="10" rx="1" />
          {/* Laptop base */}
          <path d="M13 28 L35 28" />
          {/* Hinge line */}
          <path d="M16 28 L32 28" />
          {/* Screen content lines */}
          <path d="M19 21 L29 21 M19 23.5 L26 23.5" />
          {/* Second desk hint (background) */}
          <path d="M6 36 L42 36" strokeOpacity="0.4" />
          {/* Plant on desk */}
          <path d="M38 28 L38 24" />
          <path d="M38 26 Q36 22 38 20 M38 26 Q40 22 38 20" />
          {/* Chair suggestion */}
          <path d="M20 38 L28 38 M24 38 L24 42" />
          <path d="M18 42 L30 42" />
        </svg>
      );

    // Warehouse — big shed with roller door + boxes
    case "warehouse":
      return (
        <svg {...sketchProps}>
          {/* Main shed outline */}
          <path d="M5 20 L5 42 L43 42 L43 20" />
          {/* Roof arc */}
          <path d="M3 20 Q24 6 45 20" />
          {/* Ridge line */}
          <path d="M24 6 L24 42" strokeOpacity="0.2" />
          {/* Roller door */}
          <rect x="13" y="26" width="14" height="16" rx="0.5" />
          {/* Roller door horizontal slats */}
          <path d="M13 29 L27 29 M13 32 L27 32 M13 35 L27 35 M13 38 L27 38" />
          {/* Side window */}
          <rect x="31" y="26" width="8" height="7" rx="0.5" />
          {/* Boxes stacked */}
          <rect x="31" y="35" width="5" height="4" />
          <rect x="36" y="37" width="4" height="2" />
          <path d="M31 37 L36 37 M33 35 L33 39" />
        </svg>
      );

    // Land / Plot — plot outline with survey pegs + trees
    case "land":
      return (
        <svg {...sketchProps}>
          {/* Ground / horizon */}
          <path d="M4 36 L44 36" />
          {/* Plot boundary (irregular quadrilateral) */}
          <path d="M10 36 L8 20 L38 18 L42 36" />
          {/* Survey pegs at corners */}
          <path d="M8 20 L8 16 M38 18 L38 14" />
          <circle cx="8" cy="16" r="1" />
          <circle cx="38" cy="14" r="1" />
          {/* Dimension arrow */}
          <path d="M10 38 L42 38" />
          <path d="M10 37 L10 39 M42 37 L42 39" />
          {/* Tree left */}
          <path d="M14 36 L14 28" />
          <path d="M11 30 Q14 24 17 30 Z" />
          {/* Tree right */}
          <path d="M32 36 L32 27" />
          <path d="M29 29 Q32 23 35 29 Z" />
          {/* Center cross-hatch survey mark */}
          <path d="M23 25 L25 27 M25 25 L23 27" />
        </svg>
      );

    // Pre-leased — building with document/contract mark
    case "lease":
      return (
        <svg {...sketchProps}>
          {/* Office building */}
          <rect x="8" y="12" width="20" height="30" rx="1" />
          {/* Ground */}
          <path d="M5 42 L43 42" />
          {/* Building windows */}
          <rect x="11" y="16" width="4" height="4" />
          <rect x="19" y="16" width="4" height="4" />
          <rect x="11" y="24" width="4" height="4" />
          <rect x="19" y="24" width="4" height="4" />
          {/* Entrance */}
          <path d="M14 42 L14 36 L22 36 L22 42" />
          {/* Document / contract — overlapping building */}
          <rect x="26" y="20" width="14" height="18" rx="1" />
          {/* Document fold corner */}
          <path d="M36 20 L40 24 L36 24 Z" />
          <path d="M36 20 L36 24 L40 24" />
          {/* Document lines */}
          <path d="M29 27 L37 27 M29 30 L37 30 M29 33 L34 33" />
          {/* Pen / signature */}
          <path d="M29 35 Q31 33 33 35" />
        </svg>
      );

    // Resort — palm tree + sun over a pool/lounger
    case "resort":
      return (
        <svg {...sketchProps}>
          {/* Sun */}
          <circle cx="36" cy="11" r="3.5" />
          <path d="M36 4 L36 6 M42 7 L40.5 8.5 M43 11 L41 11" />
          {/* Palm trunk */}
          <path d="M14 40 Q12 28 13 20" />
          {/* Palm fronds */}
          <path d="M13 20 Q6 17 4 21 M13 20 Q9 13 13 11 M13 20 Q20 16 23 20 M13 20 Q16 13 12 11" />
          {/* Ground / water line */}
          <path d="M5 40 L43 40" />
          {/* Pool ripples */}
          <path d="M24 36 Q27 34 30 36 T36 36 M24 39 Q27 37 30 39 T36 39" />
          {/* Sun lounger */}
          <path d="M20 36 L28 31 M21 34 L21 40 M27 32 L27 36" />
        </svg>
      );

    // Service apartment — building with a service/bell tag
    case "service-apartment":
      return (
        <svg {...sketchProps}>
          {/* Apartment tower */}
          <rect x="10" y="8" width="20" height="34" rx="1" />
          <path d="M6 42 L38 42" />
          {/* Window grid */}
          <rect x="13" y="12" width="4" height="4" />
          <rect x="20" y="12" width="4" height="4" />
          <rect x="13" y="19" width="4" height="4" />
          <rect x="20" y="19" width="4" height="4" />
          <rect x="13" y="26" width="4" height="4" />
          <rect x="20" y="26" width="4" height="4" />
          {/* Entrance */}
          <path d="M16 42 L16 35 L24 35 L24 42" />
          {/* Service bell */}
          <path d="M32 32 Q32 27 36 27 Q40 27 40 32 Z" />
          <path d="M30 32 L42 32 M36 27 L36 25" />
          <circle cx="36" cy="35" r="1" />
        </svg>
      );

    // Hotel — building with awning + "H" sign + star
    case "hotel":
      return (
        <svg {...sketchProps}>
          {/* Hotel block */}
          <rect x="9" y="14" width="30" height="28" rx="1" />
          <path d="M6 42 L42 42" />
          {/* Sign board on top */}
          <rect x="18" y="8" width="12" height="6" rx="1" />
          <path d="M22.5 9.5 L22.5 12.5 M22.5 11 L25.5 11 M25.5 9.5 L25.5 12.5" />
          {/* Star above sign */}
          <path d="M24 3 L25 5.2 L27.3 5.4 L25.5 7 L26 9.2 L24 8 L22 9.2 L22.5 7 L20.7 5.4 L23 5.2 Z" />
          {/* Window rows */}
          <path d="M13 20 L35 20 M13 26 L35 26 M13 32 L35 32" />
          <path d="M18 18 L18 34 M24 18 L24 34 M30 18 L30 34" />
          {/* Door */}
          <path d="M21 42 L21 37 L27 37 L27 42" />
        </svg>
      );

    default:
      return (
        <svg {...sketchProps}>
          <path d="M8 22 L24 8 L40 22 M12 22 L12 40 L36 40 L36 22" />
        </svg>
      );
  }
}

function CategoryTile({ cat }: { cat: CategoryDef }) {
  const count = categoryCount(cat.slug);
  return (
    <Link
      href={`/c/${cat.slug}`}
      className="group flex flex-col items-center text-center bg-gradient-to-b from-parchment to-parchment-deep border border-umber/30 rounded-[14px] p-3 hover-lift hover:shadow-airbnb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sepia focus-visible:ring-offset-2 transition-colors hover:border-umber/50"
      aria-label={`${cat.label} — ${count} ${cat.resultNoun}`}
    >
      {/* Sketch illustration — sepia ink on aged parchment */}
      <span
        className="flex items-center justify-center w-14 h-14 rounded-[10px] bg-parchment-deep border border-umber/20 text-sepia mb-2.5 shrink-0"
        aria-hidden="true"
      >
        <CategorySketch slug={cat.slug} />
      </span>

      {/* Label + subtitle */}
      <h3 className="text-[13px] font-semibold text-sepia leading-tight tracking-tight">{cat.label}</h3>
      <p className="text-[11px] text-umber mt-0.5 leading-snug line-clamp-1">{cat.subtitle}</p>

      {/* Live count chip */}
      <span className="mt-2 inline-block bg-parchment-deep text-umber border border-umber/20 text-[10px] font-medium px-2 py-0.5 rounded-full">
        {count} {cat.resultNoun}
      </span>
    </Link>
  );
}

export default function ExplorePage() {
  const [world, setWorld] = useState<World>("residential");
  const tiles = categoriesForWorld(world);

  return (
    <PageLayout>
      {/* Hero search band */}
      <section className="relative overflow-hidden bg-gradient-to-br from-surface-soft via-violet/10 to-violet/25 -mx-4 md:-mx-6 lg:-mx-10 px-4 md:px-6 lg:px-10 pt-8 md:pt-12 pb-8 md:pb-10 mb-7 rounded-b-[32px] md:rounded-b-none">
        {/* Decorative themed background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-violet/25 blur-3xl" />
          <div className="absolute -bottom-28 -right-20 w-80 h-80 rounded-full bg-indigo/20 blur-3xl" />
          <div className="absolute top-10 left-1/4 w-20 h-20 rounded-[20px] rotate-12 bg-violet/15" />
          <div className="absolute bottom-8 right-1/4 w-14 h-14 rounded-full border border-violet/30" />
        </div>
        <div className="relative z-10 max-w-[900px] mx-auto text-center mb-6">
          <h1 className="text-[clamp(28px,4.5vw,44px)] font-bold text-ink tracking-tight leading-[1.08] mb-3">
            Explore homes & spaces near you
          </h1>
          <p className="text-base text-body max-w-[560px] mx-auto">
            Pick what you&apos;re looking for — rentals, PGs, offices and more.
            Verified listings, zero brokerage, jobs and commute built in.
          </p>
        </div>
        <div className="relative z-10 max-w-[820px] mx-auto">
          <SearchBar />
        </div>
      </section>

      {/* Residential | Commercial | Stays segmented toggle */}
      <div className="flex justify-center mb-6">
        <div
          role="group"
          aria-label="Choose property world"
          className="inline-flex items-center gap-1 bg-surface-soft border border-hairline-soft rounded-full p-1"
        >
          {WORLDS.map((w) => {
            const active = world === w.value;
            return (
              <button
                key={w.value}
                type="button"
                onClick={() => setWorld(w.value)}
                aria-pressed={active}
                className={`px-4 sm:px-5 md:px-6 py-2 text-sm font-semibold rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
                  active ? "bg-ink text-white" : "text-muted hover:text-ink"
                }`}
              >
                {w.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category tiles — re-keyed on world so the grid re-animates on toggle */}
      <section aria-label={`${world} categories`} className="mb-12">
        <div
          key={world}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 animate-fade-up"
        >
          {tiles.map((cat) => (
            <CategoryTile key={cat.slug} cat={cat} />
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section aria-label="Why renters trust FindWay" className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline-soft rounded-[14px] overflow-hidden border border-hairline-soft">
          {trustPoints.map((point) => (
            <div key={point.title} className="flex items-start gap-2.5 bg-canvas px-4 py-4">
              <span className="text-rausch shrink-0 mt-0.5">{point.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink leading-tight">{point.title}</p>
                <p className="text-xs text-muted mt-0.5">{point.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular near you — horizontal ListingCard rail */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[22px] md:text-[26px] font-bold tracking-tight text-ink">Popular near you</h2>
          <Link href="/c/rent" className="text-sm text-ink font-medium underline underline-offset-2">
            See all
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide">
          {popular.map((listing) => (
            <div key={listing.id} className="min-w-[260px] md:min-w-0">
              <ListingCard {...listing} image={getCategory(listing.category)?.image} />
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
