"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  categoriesForWorld,
  CategoryDef,
  World,
} from "../lib/categories";

/* ─── Constants ─────────────────────────────────────────────────────────── */

const CITY = "Bengaluru";

/** Jobs-mode is a special mode, not a world category. */
const JOBS_PILLS = [
  "Software Engineer",
  "Sales",
  "Data Analyst",
  "Designer",
  "Operations",
];

const WORLDS: { value: World; label: string }[] = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "stay", label: "Stays" },
];

/** slugs that get Variant B (area dropdown + gender chips) */
const VARIANT_B_SLUGS = new Set(["pg", "coliving"]);

/* ─── Inline city skyline SVG illustration ─────────────────────────────── */
function CitySkyline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
      className={className}
    >
      <rect x="0" y="85" width="60" height="35" rx="2" fill="currentColor" opacity="0.06" />
      <rect x="55" y="72" width="40" height="48" rx="2" fill="currentColor" opacity="0.07" />
      <rect x="90" y="60" width="30" height="60" rx="2" fill="currentColor" opacity="0.08" />
      <rect x="115" y="78" width="50" height="42" rx="2" fill="currentColor" opacity="0.06" />
      <rect x="160" y="45" width="28" height="75" rx="2" fill="currentColor" opacity="0.09" />
      <rect x="183" y="55" width="22" height="65" rx="2" fill="currentColor" opacity="0.07" />
      <rect x="200" y="38" width="35" height="82" rx="3" fill="currentColor" opacity="0.1" />
      <rect x="230" y="20" width="40" height="100" rx="3" fill="currentColor" opacity="0.12" />
      <rect x="246" y="8" width="8" height="16" rx="1" fill="currentColor" opacity="0.12" />
      <rect x="235" y="28" width="6" height="5" rx="1" fill="currentColor" opacity="0.08" />
      <rect x="245" y="28" width="6" height="5" rx="1" fill="currentColor" opacity="0.08" />
      <rect x="255" y="28" width="6" height="5" rx="1" fill="currentColor" opacity="0.08" />
      <rect x="235" y="40" width="6" height="5" rx="1" fill="currentColor" opacity="0.08" />
      <rect x="245" y="40" width="6" height="5" rx="1" fill="currentColor" opacity="0.08" />
      <rect x="255" y="40" width="6" height="5" rx="1" fill="currentColor" opacity="0.08" />
      <rect x="270" y="50" width="30" height="70" rx="2" fill="currentColor" opacity="0.09" />
      <rect x="295" y="65" width="45" height="55" rx="2" fill="currentColor" opacity="0.07" />
      <rect x="335" y="42" width="32" height="78" rx="3" fill="currentColor" opacity="0.1" />
      <rect x="362" y="58" width="25" height="62" rx="2" fill="currentColor" opacity="0.07" />
      <rect x="385" y="70" width="55" height="50" rx="2" fill="currentColor" opacity="0.06" />
      <rect x="435" y="58" width="35" height="62" rx="2" fill="currentColor" opacity="0.08" />
      <rect x="465" y="45" width="28" height="75" rx="2" fill="currentColor" opacity="0.09" />
      <rect x="488" y="68" width="40" height="52" rx="2" fill="currentColor" opacity="0.06" />
      <rect x="525" y="75" width="80" height="45" rx="2" fill="currentColor" opacity="0.06" />
      <rect x="600" y="62" width="50" height="58" rx="2" fill="currentColor" opacity="0.07" />
      <rect x="645" y="48" width="38" height="72" rx="2" fill="currentColor" opacity="0.09" />
      <rect x="678" y="70" width="60" height="50" rx="2" fill="currentColor" opacity="0.06" />
      <rect x="735" y="55" width="65" height="65" rx="2" fill="currentColor" opacity="0.07" />
      <rect x="0" y="118" width="800" height="2" rx="1" fill="currentColor" opacity="0.08" />
    </svg>
  );
}

/* ─── City dropdown for Variant B ───────────────────────────────────────── */
const BLR_AREAS = [
  "Koramangala",
  "HSR Layout",
  "Whitefield",
  "Electronic City",
  "Indiranagar",
];

interface CityDropdownProps {
  onSelect: (area: string) => void;
  value: string;
}

function CityDropdown({ onSelect, value }: CityDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open]);

  const handleListKeyDown = useCallback((e: React.KeyboardEvent<HTMLUListElement>) => {
    const items = listRef.current?.querySelectorAll<HTMLElement>("[role='option']");
    if (!items) return;
    const idx = Array.from(items).findIndex((el) => el === document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    }
  }, []);

  return (
    <div ref={containerRef} className="relative flex-shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select area in Bengaluru"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-soft border border-hairline rounded-[8px] text-sm font-medium text-ink hover:bg-surface-strong transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1 whitespace-nowrap"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {value || "Bengaluru"}
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-56 bg-canvas rounded-[14px] shadow-airbnb border border-hairline-soft z-50 overflow-hidden animate-fade-up">
          <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-muted uppercase tracking-wider">
            Popular Areas
          </p>
          <ul ref={listRef} role="listbox" aria-label="Popular areas in Bengaluru" onKeyDown={handleListKeyDown} className="pb-2">
            {BLR_AREAS.map((area) => (
              <li key={area} role="option" aria-selected={value === area}>
                <button
                  type="button"
                  tabIndex={0}
                  onClick={() => { onSelect(area); setOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:bg-surface-soft ${
                    value === area ? "text-ink font-semibold bg-surface-soft" : "text-body hover:bg-surface-soft"
                  }`}
                >
                  {area}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─── Shared search button ───────────────────────────────────────────────── */
interface SearchButtonProps {
  onClick: () => void;
  label?: string;
}

function SearchButton({ onClick, label = "Search" }: SearchButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex items-center justify-center gap-2 h-11 px-5 bg-white text-ink rounded-full hover:bg-surface-soft active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink font-semibold text-sm whitespace-nowrap shadow-airbnb"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span>{label}</span>
    </button>
  );
}

/* ─── Variant A: magnifier + full-width input + Search ──────────────────── */
interface VariantAProps {
  placeholder: string;
  onSubmit: (payload: Record<string, string>) => void;
}

function VariantA({ placeholder, onSubmit }: VariantAProps) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex items-center gap-2 bg-white/95 border border-white/50 rounded-[32px] shadow-airbnb px-4 py-2">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-soft shrink-0" aria-hidden="true">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <label htmlFor="hero-search-a" className="sr-only">
        {placeholder}
      </label>
      <input
        id="hero-search-a"
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit({ query })}
        className="flex-1 text-sm text-body placeholder-muted-soft outline-none bg-transparent py-1 min-w-0"
      />
      <SearchButton onClick={() => onSubmit({ query })} />
    </div>
  );
}

/* ─── Variant B: city dropdown + input + gender chips ───────────────────── */
interface VariantBProps {
  onSubmit: (payload: Record<string, string>) => void;
}

const GENDER_CHIPS = ["Any", "Male", "Female", "Co-ed"] as const;
type GenderChip = (typeof GENDER_CHIPS)[number];

function VariantB({ onSubmit }: VariantBProps) {
  const [area, setArea] = useState("");
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState<GenderChip>("Any");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/95 border border-white/50 rounded-[20px] sm:rounded-[32px] shadow-airbnb p-2 sm:px-4 sm:py-2">
        <CityDropdown value={area} onSelect={setArea} />
        <div className="hidden sm:block w-px bg-hairline h-6 self-center" />
        <label htmlFor="hero-search-b" className="sr-only">
          Search locality or area in Bengaluru
        </label>
        <input
          id="hero-search-b"
          type="text"
          placeholder="Search locality or area"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit({ area, query, gender })}
          className="flex-1 text-sm text-body placeholder-muted-soft outline-none bg-transparent px-2 py-1.5 sm:py-1 min-w-0"
        />
        <SearchButton onClick={() => onSubmit({ area, query, gender })} label="Search PGs" />
      </div>

      <div role="group" aria-label="Filter by gender preference" className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-white/80">For:</span>
        {GENDER_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            aria-pressed={gender === chip}
            onClick={() => setGender(chip)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 ${
              gender === chip
                ? "bg-white text-ink border-transparent"
                : "bg-white/20 text-white border-white/40 hover:bg-white/30"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Variant C: jobs search ─────────────────────────────────────────────── */
interface VariantCProps {
  onSubmit: (payload: Record<string, string>) => void;
}

function VariantC({ onSubmit }: VariantCProps) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex items-center gap-2 bg-white/95 border border-white/50 rounded-[32px] shadow-airbnb px-4 py-2">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-soft shrink-0" aria-hidden="true">
        <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <label htmlFor="hero-search-c" className="sr-only">
        Job title, skill, or company
      </label>
      <input
        id="hero-search-c"
        type="text"
        placeholder="Job title, skill, or company"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit({ query, location: CITY })}
        className="flex-1 text-sm text-body placeholder-muted-soft outline-none bg-transparent py-1 min-w-0"
      />
      <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-surface-soft rounded-full text-xs font-medium text-muted shrink-0">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {CITY}
      </span>
      <SearchButton onClick={() => onSubmit({ query, location: CITY })} label="Find Jobs" />
    </div>
  );
}

/* ─── Search-bar dispatcher ──────────────────────────────────────────────── */
interface SearchBarDispatchProps {
  isJobs: boolean;
  category: CategoryDef | null;
  onSubmit: (payload: Record<string, string>) => void;
}

function SearchBarDispatch({ isJobs, category, onSubmit }: SearchBarDispatchProps) {
  const variantMap: Record<string, ReactElement> = {
    C: <VariantC onSubmit={onSubmit} />,
    B: <VariantB onSubmit={onSubmit} />,
    A: (
      <VariantA
        placeholder={category?.searchPlaceholder ?? "Search locality, area, or landmark"}
        onSubmit={onSubmit}
      />
    ),
  };

  let key: string;
  if (isJobs) {
    key = "C";
  } else if (category && VARIANT_B_SLUGS.has(category.slug)) {
    key = "B";
  } else {
    key = "A";
  }

  return variantMap[key];
}

/* ─── Main exported component ────────────────────────────────────────────── */
export default function HeroSearch() {
  const router = useRouter();

  /* ── State ── */
  const [mode, setMode] = useState<"world" | "jobs">("world");
  const [world, setWorld] = useState<World>("residential");
  const [activeSlug, setActiveSlug] = useState<string>(
    () => categoriesForWorld("residential")[0].slug
  );
  /** Incremented on any navigation action to re-key the panel and replay fade-up */
  const [animKey, setAnimKey] = useState(0);

  const bumpAnim = useCallback(() => setAnimKey((k) => k + 1), []);

  /* ── Looping hero background video (home page only) ── */
  const videoRef = useRef<HTMLVideoElement>(null);

  // Force muted autoplay on mount. React doesn't reliably apply the `muted`
  // property on first render, which makes browsers block autoplay.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  /* ── Derived ── */
  const isJobs = mode === "jobs";
  const worldCategories = categoriesForWorld(world);
  const activeCategory = isJobs ? null : (worldCategories.find((c) => c.slug === activeSlug) ?? worldCategories[0]);

  /* ── Headline / subline ── */
  const headline = isJobs
    ? `Jobs in ${CITY}`
    : (activeCategory?.headline.replace("{city}", CITY) ?? "");
  const subline = isJobs
    ? "12K+ openings near homes"
    : (activeCategory?.subtitle ?? "");

  /* ── Pills ── */
  const pills = isJobs
    ? JOBS_PILLS
    : (activeCategory?.chips.slice(0, 5) ?? []);

  /* ── Submit route ── */
  const submitHref = isJobs ? "/jobs" : `/c/${activeSlug}`;

  /* ── Handlers ── */
  const handleWorldChange = useCallback(
    (newWorld: World) => {
      const cats = categoriesForWorld(newWorld);
      setMode("world");
      setWorld(newWorld);
      setActiveSlug(cats[0].slug);
      bumpAnim();
    },
    [bumpAnim]
  );

  const handleCategoryChange = useCallback(
    (slug: string) => {
      setMode("world");
      setActiveSlug(slug);
      bumpAnim();
    },
    [bumpAnim]
  );

  const handleJobsClick = useCallback(() => {
    setMode("jobs");
    bumpAnim();
  }, [bumpAnim]);

  const handleSubmit = useCallback(
    (payload: Record<string, string>) => {
      const fullPayload = {
        mode,
        ...(isJobs ? {} : { world, category: activeSlug }),
        ...payload,
      };
      console.log("[HeroSearch] submit", fullPayload);
      router.push(submitHref);
    },
    [mode, isJobs, world, activeSlug, submitHref, router]
  );

  return (
    <section
      aria-label="Search for housing and jobs"
      className="relative overflow-hidden -mx-4 md:-mx-6 lg:-mx-10 px-4 md:px-6 lg:px-10 pt-0 md:pt-10 pb-10 md:pb-12 mb-6 bg-ink transition-[background] duration-300 md:flex md:flex-col md:justify-center md:min-h-[560px]"
    >
      {/* Looping hero video (home page only). The 16:9 clip is shown two ways:
          • Mobile: a full-bleed 16:9 frame at the top so the whole video is
            visible without cropping; the search content sits below it.
          • Desktop (md+): an absolute background the content overlays.
          One element, repositioned responsively, so it loads once.
          Autoplay is forced muted in the effect above. */}
      <video
        ref={videoRef}
        src="/hero-home.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="pointer-events-none w-screen max-w-none relative left-1/2 -translate-x-1/2 aspect-video object-cover bg-ink mb-6 md:w-full md:left-0 md:translate-x-0 md:mb-0 md:absolute md:inset-0 md:h-full md:aspect-auto"
      />

      {/* Mobile-only content backdrop — neutral dark fade beginning where the
          16:9 video ends, blending out of the video's bottom edge into the
          search area (no colour tint). */}
      <div
        aria-hidden="true"
        className="md:hidden pointer-events-none absolute -left-4 -right-4 bottom-0 top-[calc(56.25vw_-_2rem)] bg-gradient-to-b from-transparent via-black/45 to-black/85"
      />

      {/* Desktop-only overlays (the video is a background there). On mobile the
          video has its own frame above, so these would needlessly dim it. */}
      {/* Dark scrim — kept light so the video reads; weighted to the bottom. */}
      <div aria-hidden="true" className="hidden md:block pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/15" />

      {/* Decorative blob. */}
      <div aria-hidden="true" className="hidden md:block pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* City skyline illustration. */}
      <div aria-hidden="true" className="hidden md:block pointer-events-none absolute bottom-0 left-0 right-0 text-white/15">
        <CitySkyline className="w-full h-28 md:h-36" />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto">

        {/* ── Row 1: World toggle + Jobs button ── */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* World toggle — translucent pill track, white active pill */}
          <div
            role="group"
            aria-label="Choose property world"
            className="inline-flex items-center gap-0.5 bg-black/20 backdrop-blur-sm rounded-full p-1"
          >
            {WORLDS.map((w) => {
              const active = mode === "world" && world === w.value;
              return (
                <button
                  key={w.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleWorldChange(w.value)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-transparent ${
                    active
                      ? "bg-white text-ink shadow-airbnb"
                      : "text-white/90 hover:text-white hover:bg-white/15"
                  }`}
                >
                  {w.label}
                </button>
              );
            })}
          </div>

          {/* Separator */}
          <span aria-hidden="true" className="hidden sm:block w-px h-5 bg-white/30" />

          {/* Jobs special-mode button */}
          <button
            type="button"
            aria-pressed={isJobs}
            onClick={handleJobsClick}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-transparent ${
              isJobs
                ? "bg-white text-ink shadow-airbnb"
                : "bg-black/20 backdrop-blur-sm text-white/90 hover:text-white hover:bg-white/15"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Jobs
          </button>
        </div>

        {/* ── Row 2: Category tab bar (world mode only) ── */}
        {!isJobs && (
          <div
            role="tablist"
            aria-label={`${world} categories`}
            className="flex items-end gap-1 overflow-x-auto scrollbar-hide mb-5 -mx-1 px-1"
          >
            {worldCategories.map((cat) => {
              const isActive = cat.slug === activeSlug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`hero-panel-${cat.slug}`}
                  id={`hero-tab-${cat.slug}`}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-semibold rounded-t-[12px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-transparent ${
                    isActive
                      ? "bg-white/95 backdrop-blur-sm text-ink pb-3 shadow-airbnb"
                      : "bg-white/20 text-white hover:bg-white/35"
                  }`}
                >
                  {cat.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-4 right-4 h-[3px] bg-ink rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Hero content panel ── */}
        <div
          id={isJobs ? "hero-panel-jobs" : `hero-panel-${activeSlug}`}
          role="tabpanel"
          aria-label={isJobs ? "Jobs search" : `${activeCategory?.label ?? ""} search`}
          key={animKey}
          className="animate-fade-up"
        >
          <div>
            {/* Headline + subline + search + pills
                The text column sits on a localized bottom-up scrim so white
                text passes AA contrast even after the hero is softened. */}
            <div className="min-w-0 text-left relative">
              {/* No boxy scrim — the video shows through. Headline/subline stay
                  legible via their own text shadows. */}
              <h1 className="relative text-[clamp(28px,4.5vw,52px)] font-bold text-white tracking-tight leading-[1.08] mb-2 max-w-[680px] [text-shadow:0_2px_16px_rgba(0,0,0,0.75)]">
                {headline}
              </h1>

              <p className="relative flex items-center gap-2 text-sm md:text-base text-white/90 mb-6 font-medium [text-shadow:0_1px_10px_rgba(0,0,0,0.7)]">
                <span className="inline-block w-2 h-2 rounded-full bg-white/80 shrink-0" aria-hidden="true" />
                {subline}
              </p>

              {/* Search bar */}
              <div className="relative">
                <SearchBarDispatch
                  isJobs={isJobs}
                  category={activeCategory}
                  onSubmit={handleSubmit}
                />
              </div>

              {/* Popular-search pills */}
              {pills.length > 0 && (
                <div className="relative flex flex-wrap items-center gap-2 mt-4">
                  <span className="text-xs text-white/80 font-medium shrink-0">Popular:</span>
                  {pills.map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => handleSubmit({ query: pill })}
                      className="px-3 py-1 text-xs font-medium rounded-full border border-white/40 bg-white/15 hover:bg-white/30 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
