"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import {
  AREAS,
  CATEGORIES,
  JOBS,
  SHIFTS,
  SORTS,
  categoryMeta,
  formatPosted,
  type Job,
  type JobCategory,
  type SortKey,
} from "@/lib/jobs";

// Leaflet touches `window`, so the map must never render on the server.
const JobsMap = dynamic(() => import("@/components/JobsMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full skeleton rounded-[14px]" aria-hidden="true" />,
});

const PAGE_SIZE = 6;
/** Rail shows a short area list; the rest hide behind "+ N more areas". */
const AREAS_VISIBLE = 3;

/** Per-category card theming — a distinct accent so each job box reads as a
 *  coloured, glassy card (like the property listing cards). Kept separate from
 *  categoryMeta, whose chip palette inverts for IT (dark tile). */
const CARD_THEME: Record<JobCategory, { accent: string; glow: string; tile: string; tileText: string }> = {
  "part-time": { accent: "#f59e0b", glow: "rgba(245,158,11,0.13)", tile: "#fef3c7", tileText: "#b45309" },
  it: { accent: "#4f46e5", glow: "rgba(79,70,229,0.13)", tile: "#e0e7ff", tileText: "#4338ca" },
  "non-it": { accent: "#0d9488", glow: "rgba(13,148,136,0.13)", tile: "#ccfbf1", tileText: "#0f766e" },
};
const cardTheme = (c: JobCategory) => CARD_THEME[c] ?? CARD_THEME["part-time"];
const SALARY_FLOOR = 10000;
const SALARY_CEIL = 60000;

/* ── Small shared pieces ─────────────────────────────────────────── */

function CategoryChip({ category }: { category: JobCategory }) {
  const meta = categoryMeta(category);
  return (
    <span
      className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full"
      style={{ color: meta.color, background: meta.tint }}
    >
      {meta.short}
    </span>
  );
}

function TagChip({ label }: { label: string }) {
  const urgent = label === "Urgent";
  return (
    <span
      className={`text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full ${
        urgent ? "text-job-navy bg-job-sun" : "text-body bg-surface-soft"
      }`}
    >
      {label}
    </span>
  );
}

/** Removable chip in the applied-filters bar. */
function AppliedChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 h-8 pl-3 pr-2.5 text-[13px] font-semibold text-white bg-job-navy rounded-full hover:bg-job-navy-lift transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2"
    >
      {label}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  );
}

/** Quick toggle chip (Walk-in, Work from home) — outlined until active. */
function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-8 px-3.5 text-[13px] font-medium rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2 ${
        active ? "bg-job-navy text-white border-job-navy" : "bg-canvas text-body border-hairline hover:border-job-navy"
      }`}
    >
      {label}
    </button>
  );
}

function CheckMark() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

/** Custom checkbox row — hidden native input, styled box, hover highlight. */
function Checkbox({
  label,
  count,
  checked,
  onChange,
  accent,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
  accent?: string;
}) {
  const on = accent ?? "#141d38";
  return (
    <label className="flex items-center gap-2.5 px-2 -mx-2 py-1.5 rounded-[9px] cursor-pointer hover:bg-surface-soft transition-colors group">
      <span
        className="relative grid place-items-center w-[18px] h-[18px] rounded-[6px] border border-hairline shrink-0 transition-all group-hover:border-job-navy/40"
        style={checked ? { background: on, borderColor: on } : undefined}
      >
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
        {checked && <CheckMark />}
      </span>
      <span className={`flex-1 text-[13px] transition-colors ${checked ? "font-semibold text-job-navy" : "text-body group-hover:text-job-navy"}`}>
        {label}
      </span>
      {count !== undefined && (
        <span className="text-[11px] font-semibold text-muted tabular-nums">{count}</span>
      )}
    </label>
  );
}

/** Category selector row — colour swatch + count badge, tinted when active. */
function CategoryRow({
  label,
  count,
  checked,
  accent,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  accent: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      style={checked ? { background: `${accent}14`, borderColor: `${accent}59` } : undefined}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] border text-left transition-all ${
        checked ? "" : "border-transparent hover:bg-surface-soft"
      }`}
    >
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white shadow-sm"
        style={{ background: accent }}
        aria-hidden="true"
      />
      <span className={`flex-1 text-[13px] ${checked ? "font-semibold text-job-navy" : "font-medium text-body"}`}>
        {label}
      </span>
      {count !== undefined && (
        <span
          className="text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded-full"
          style={{ color: accent, background: `${accent}1f` }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ── Left filter rail ────────────────────────────────────────────── */

interface Filters {
  categories: JobCategory[];
  salaryMin: number;
  shifts: string[];
  walkIn: boolean;
  workFromHome: boolean;
  noExperience: boolean;
  areas: string[];
}

const EMPTY_FILTERS: Filters = {
  categories: [],
  salaryMin: SALARY_FLOOR,
  shifts: [],
  walkIn: false,
  workFromHome: false,
  noExperience: false,
  areas: [],
};

function RailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-hairline-soft pt-5 mt-5 first:border-0 first:pt-0 first:mt-0">
      <legend className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted mb-2.5">{title}</legend>
      {children}
    </fieldset>
  );
}

/* The same controls drive the desktop rail and the mobile sheet — filtering
   must not be desktop-only, and two copies would drift apart. */
function FilterControls({
  filters,
  setFilters,
  counts,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  counts: Record<JobCategory, number>;
}) {
  const [allAreas, setAllAreas] = useState(false);
  /* Salary reads in LPA once IT is the only category selected — an IT seeker
     thinks in lakhs per annum, everyone else in rupees per month. */
  const lpaMode = filters.categories.length === 1 && filters.categories[0] === "it";

  const toggle = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters({ ...filters, [key]: value });

  const toggleIn = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const shownAreas = allAreas ? AREAS : AREAS.slice(0, AREAS_VISIBLE);

  return (
      <div>
        <RailSection title="Category">
          <div className="flex flex-col gap-0.5">
            {CATEGORIES.map((c) => (
              <CategoryRow
                key={c.id}
                label={c.short}
                count={counts[c.id]}
                checked={filters.categories.includes(c.id)}
                accent={cardTheme(c.id).accent}
                onChange={() => toggle("categories", toggleIn(filters.categories, c.id) as JobCategory[])}
              />
            ))}
          </div>
        </RailSection>

        <RailSection title={lpaMode ? "Salary / year" : "Salary / month"}>
          <div className="flex justify-center mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-job-navy text-white text-[13px] font-bold tabular-nums">
              {lpaMode
                ? `₹${((filters.salaryMin * 12) / 100000).toFixed(1)}L+`
                : `₹${Math.round(filters.salaryMin / 1000)}k+`}
            </span>
          </div>
          <input
            type="range"
            min={SALARY_FLOOR}
            max={SALARY_CEIL}
            step={1000}
            value={filters.salaryMin}
            onChange={(e) => toggle("salaryMin", Number(e.target.value))}
            aria-label="Minimum salary"
            className="w-full accent-job-navy cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] font-medium text-muted mt-1.5">
            <span>{lpaMode ? "₹1.2L" : "₹10k"}</span>
            <span>{lpaMode ? "₹7.2L+" : "₹60k+"}</span>
          </div>
        </RailSection>

        <RailSection title="Shift">
          {SHIFTS.map((s) => (
            <Checkbox
              key={s.id}
              label={s.label}
              checked={filters.shifts.includes(s.id)}
              onChange={() => toggle("shifts", toggleIn(filters.shifts, s.id))}
            />
          ))}
        </RailSection>

        <RailSection title="Job type">
          <Checkbox label="Walk-in interview" checked={filters.walkIn} onChange={() => toggle("walkIn", !filters.walkIn)} />
          <Checkbox label="Work from home" checked={filters.workFromHome} onChange={() => toggle("workFromHome", !filters.workFromHome)} />
          <Checkbox label="No experience needed" checked={filters.noExperience} onChange={() => toggle("noExperience", !filters.noExperience)} />
        </RailSection>

        <RailSection title="Area">
          {shownAreas.map((a) => (
            <Checkbox
              key={a.slug}
              label={a.label}
              checked={filters.areas.includes(a.slug)}
              onChange={() => toggle("areas", toggleIn(filters.areas, a.slug))}
            />
          ))}
          {AREAS.length > AREAS_VISIBLE && (
            <button
              type="button"
              onClick={() => setAllAreas(!allAreas)}
              className="text-[12px] font-semibold text-job-navy hover:underline mt-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy rounded-sm"
            >
              {allAreas ? "− Show fewer areas" : `+ ${AREAS.length - AREAS_VISIBLE} more areas`}
            </button>
          )}
        </RailSection>
      </div>
  );
}

/** ③ Desktop rail. */
function FilterRail(props: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  counts: Record<JobCategory, number>;
}) {
  return (
    <aside aria-label="Filters" className="hidden lg:block w-[212px] shrink-0">
      <div className="sticky top-[86px] rounded-[16px] border border-hairline bg-canvas p-4 shadow-[0_4px_22px_-14px_rgba(20,29,56,0.35)]">
        <div className="flex items-center gap-2 pb-3.5 mb-1 border-b border-hairline-soft">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="text-job-navy" aria-hidden="true">
            <path d="M3 6h18M6 12h12M10 18h4" />
          </svg>
          <h2 className="text-[13px] font-bold text-job-navy tracking-tight">Filters</h2>
        </div>
        <FilterControls {...props} />
      </div>
    </aside>
  );
}

/** Mobile equivalent — the deck's bottom sheet. */
function FiltersSheet({
  open,
  onClose,
  resultCount,
  onClearAll,
  ...props
}: {
  open: boolean;
  onClose: () => void;
  resultCount: number;
  onClearAll: () => void;
  filters: Filters;
  setFilters: (f: Filters) => void;
  counts: Record<JobCategory, number>;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
      <button type="button" aria-label="Close filters" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-x-0 bottom-0 max-h-[86dvh] rounded-t-[20px] bg-canvas flex flex-col animate-slide-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline-soft shrink-0">
          <h2 className="text-base font-bold text-job-navy">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="p-1.5 -mr-1.5 text-muted hover:text-job-navy rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <FilterControls {...props} />
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-hairline-soft shrink-0">
          <button
            type="button"
            onClick={onClearAll}
            className="text-sm font-semibold text-job-navy underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy rounded-sm px-1"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-job-navy bg-job-sun rounded-[8px] hover:bg-job-sun-active active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2"
          >
            Show {resultCount} {resultCount === 1 ? "job" : "jobs"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Result row card ─────────────────────────────────────────────── */

function Meta({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[12.5px] text-muted whitespace-nowrap">
      <span aria-hidden="true">{icon}</span>
      {children}
    </span>
  );
}

function JobRow({ job }: { job: Job }) {
  const [applied, setApplied] = useState(false);
  const theme = cardTheme(job.category);

  return (
    /* Phones stack: details first, then salary and Apply on their own row —
       side-by-side leaves the title about 110px on a 320px screen. */
    <article
      style={{
        background: `linear-gradient(135deg, ${theme.glow} 0%, rgba(255,255,255,0.6) 58%)`,
        borderColor: theme.glow,
      }}
      className="group relative flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-3.5 backdrop-blur-xl border rounded-[16px] p-4 pl-5 ring-1 ring-black/[0.03] shadow-[0_6px_22px_-10px_rgba(20,29,56,0.25)] hover:shadow-[0_14px_38px_-12px_rgba(20,29,56,0.38)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* coloured accent spine */}
      <span
        aria-hidden="true"
        style={{ background: theme.accent }}
        className="absolute inset-y-0 left-0 w-[4px] rounded-l-[16px]"
      />
      <div
        style={{ background: theme.tile, color: theme.tileText }}
        className="hidden sm:flex w-10 h-10 rounded-[11px] items-center justify-center text-[13px] font-bold shrink-0 shadow-sm"
      >
        {job.logo}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="flex items-start gap-2.5 text-[15px] font-bold text-job-navy leading-snug">
          {/* The logo rides the title on phones, where a separate column
              would cost width the title needs. */}
          <span
            style={{ background: theme.tile, color: theme.tileText }}
            className="sm:hidden w-8 h-8 rounded-[8px] flex items-center justify-center text-[12px] font-bold shrink-0"
          >
            {job.logo}
          </span>
          <Link href={`/jobs/${job.slug}`} className="focus-visible:outline-none focus-visible:underline">
            {/* Stretched link makes the whole row clickable without nesting
                the Apply button inside an anchor. */}
            <span className="absolute inset-0 rounded-[16px]" aria-hidden="true" />
            {job.title}
          </Link>
        </h3>
        <p className="text-[13px] text-muted mt-0.5 truncate">
          {job.company} · {job.areaLabel}
        </p>

        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 mt-2">
          <Meta icon="⏱">{job.shiftLabel}</Meta>
          <Meta icon="📍">{job.distanceKm} km</Meta>
          <Meta icon="🎓">{job.requirement}</Meta>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2.5">
          <CategoryChip category={job.category} />
          {job.tags.map((t) => (
            <TagChip key={t} label={t} />
          ))}
        </div>
      </div>

      <div className="flex flex-row-reverse items-center justify-between gap-1.5 border-t border-hairline-soft pt-3 sm:border-0 sm:pt-0 sm:flex-col sm:items-end sm:shrink-0 sm:self-stretch">
        <div className="text-right">
          <p className="text-[15px] font-bold" style={{ color: "#141d38" }}>
            {job.salaryDisplay}
          </p>
          <p className="text-[11.5px] text-muted mt-0.5">{formatPosted(job.postedHoursAgo)}</p>
        </div>
        <button
          type="button"
          onClick={() => setApplied(true)}
          disabled={applied}
          className={`relative z-10 h-8 px-4 text-[13px] font-semibold text-job-navy rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2 ${
            applied ? "bg-job-sun-soft" : "bg-job-sun hover:bg-job-sun-active"
          }`}
        >
          {applied ? "Applied ✓" : "Apply"}
        </button>
      </div>
    </article>
  );
}

/* ── Map-view pieces ─────────────────────────────────────────────── */

/** Condensed card for the map column — the same job-card DNA at half height,
 *  because the map takes the other half of the screen. */
function JobMiniCard({
  job,
  active,
  onHover,
  onSelect,
}: {
  job: Job;
  active: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const theme = cardTheme(job.category);

  return (
    <article
      onMouseEnter={() => onHover(job.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(job.id)}
      style={{
        background: `linear-gradient(135deg, ${theme.glow} 0%, rgba(255,255,255,0.6) 58%)`,
        borderColor: active ? theme.accent : theme.glow,
      }}
      className={`relative flex items-start gap-3 backdrop-blur-xl border rounded-[16px] p-3.5 pl-4 cursor-pointer transition-all ${
        active
          ? "shadow-[0_12px_32px_-12px_rgba(20,29,56,0.4)]"
          : "shadow-[0_5px_18px_-10px_rgba(20,29,56,0.25)] hover:shadow-[0_12px_30px_-12px_rgba(20,29,56,0.35)]"
      }`}
    >
      <span
        aria-hidden="true"
        style={{ background: theme.accent }}
        className="absolute inset-y-0 left-0 w-[4px] rounded-l-[16px]"
      />
      <div
        style={{ background: theme.tile, color: theme.tileText }}
        className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[12px] font-bold shrink-0 shadow-sm"
      >
        {job.logo}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] font-bold text-job-navy leading-snug truncate">{job.title}</h3>
        <p className="text-[12.5px] text-muted mt-0.5 truncate">
          {job.company} · {job.areaLabel}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <CategoryChip category={job.category} />
          <span className="text-[12px] text-muted">📍 {job.distanceKm} km</span>
        </div>
      </div>
      <p className="text-[14px] font-bold shrink-0" style={{ color: "#141d38" }}>
        {job.salaryDisplay}
      </p>
    </article>
  );
}

/** Preview card that slides up over the map when a pin is clicked. */
function MapPreview({ job, onClose }: { job: Job; onClose: () => void }) {
  return (
    <div className="absolute left-3 right-3 bottom-3 z-[500] flex items-center gap-3 bg-canvas rounded-[14px] shadow-airbnb border border-hairline-soft p-3">
      <div className="w-9 h-9 rounded-[9px] bg-surface-strong flex items-center justify-center text-[13px] font-bold text-muted shrink-0">
        {job.logo}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] font-bold text-job-navy truncate">
          {job.title} — {job.company}
        </h3>
        <p className="text-[12.5px] text-muted truncate">
          {job.areaLabel} · <span className="font-semibold" style={{ color: "#141d38" }}>{job.salaryDisplay}</span> · {job.distanceKm} km
        </p>
      </div>
      <Link
        href={`/jobs/${job.slug}`}
        className="shrink-0 h-8 px-4 flex items-center text-[13px] font-semibold text-job-navy bg-job-sun rounded-full hover:bg-job-sun-active transition-colors"
      >
        Apply
      </Link>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="shrink-0 p-1 text-muted hover:text-job-navy rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ── Sort menu ───────────────────────────────────────────────────── */

function SortMenu({ sort, onSort }: { sort: SortKey; onSort: (s: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const active = SORTS.find((s) => s.id === sort) ?? SORTS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-medium text-body bg-canvas border border-hairline rounded-full hover:border-job-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2"
      >
        Sort: <span className="font-semibold text-job-navy">{active.label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close sort menu" className="fixed inset-0 z-20 cursor-default" onClick={() => setOpen(false)} />
          <ul role="listbox" className="absolute right-0 top-11 z-30 w-[168px] bg-canvas border border-hairline-soft rounded-[12px] shadow-airbnb py-1.5">
            {SORTS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={s.id === sort}
                  onClick={() => {
                    onSort(s.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-[13px] hover:bg-surface-soft transition-colors ${
                    s.id === sort ? "font-semibold text-job-navy" : "text-body"
                  }`}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */

function SearchResults() {
  const params = useSearchParams();
  const initialCategory = params.get("category") as JobCategory | null;
  const initialArea = params.get("area");

  const [what, setWhat] = useState(params.get("q") ?? "");
  const [where, setWhere] = useState(
    AREAS.find((a) => a.slug === initialArea)?.label ?? ""
  );
  const [filters, setFilters] = useState<Filters>({
    ...EMPTY_FILTERS,
    categories: initialCategory && CATEGORIES.some((c) => c.id === initialCategory) ? [initialCategory] : [],
    areas: initialArea && AREAS.some((a) => a.slug === initialArea) ? [initialArea] : [],
  });
  const [sort, setSort] = useState<SortKey>("nearest");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"list" | "map">(params.get("view") === "map" ? "map" : "list");
  /* Hover is shared both ways: a hovered list card rings its pin, a hovered
     pin rings its card. Selection is separate — it drives the preview card. */
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /* null until the map reports its first viewport, so the list isn't empty
     for the frame before the map mounts. */
  const [viewportIds, setViewportIds] = useState<string[] | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const switchView = (next: "list" | "map") => {
    setView(next);
    setSelectedId(null);
    const qs = new URLSearchParams(Array.from(params.entries()));
    if (next === "map") qs.set("view", "map");
    else qs.delete("view");
    const query = qs.toString();
    window.history.replaceState(null, "", query ? `/jobs/search?${query}` : "/jobs/search");
  };

  /* Any filter change resets to page 1 — otherwise a narrowed result set can
     strand the user on a page that no longer exists. */
  useEffect(() => {
    setPage(1);
  }, [filters, sort, what]);

  const counts = useMemo(
    () =>
      CATEGORIES.reduce(
        (acc, c) => ({ ...acc, [c.id]: JOBS.filter((j) => j.category === c.id).length }),
        {} as Record<JobCategory, number>
      ),
    []
  );

  const results = useMemo(() => {
    const q = what.trim().toLowerCase();
    const matched = JOBS.filter((j) => {
      if (filters.categories.length && !filters.categories.includes(j.category)) return false;
      if (filters.areas.length && !filters.areas.includes(j.area)) return false;
      if (filters.shifts.length && !filters.shifts.includes(j.shift)) return false;
      if (j.salaryMin < filters.salaryMin) return false;
      if (filters.walkIn && !j.walkIn) return false;
      if (filters.workFromHome && !j.workFromHome) return false;
      if (filters.noExperience && !j.noExperience) return false;
      if (q && !`${j.title} ${j.company} ${j.areaLabel}`.toLowerCase().includes(q)) return false;
      return true;
    });

    return matched.sort((a, b) => {
      if (sort === "newest") return a.postedHoursAgo - b.postedHoursAgo;
      if (sort === "highest-pay") return b.salaryMax - a.salaryMax;
      return a.distanceKm - b.distanceKm;
    });
  }, [filters, sort, what]);

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* Map view narrows the list to what the viewport covers. */
  const inView = viewportIds === null ? results : results.filter((j) => viewportIds.includes(j.id));
  const selectedJob = results.find((j) => j.id === selectedId) ?? null;

  /* Applied-filter chips mirror the rail; removing a chip clears that filter. */
  const chips: { label: string; remove: () => void }[] = [
    ...filters.categories.map((c) => ({
      label: categoryMeta(c).short,
      remove: () => setFilters({ ...filters, categories: filters.categories.filter((x) => x !== c) }),
    })),
    ...filters.areas.map((a) => ({
      label: AREAS.find((x) => x.slug === a)?.label ?? a,
      remove: () => setFilters({ ...filters, areas: filters.areas.filter((x) => x !== a) }),
    })),
    ...filters.shifts.map((s) => ({
      label: `${SHIFTS.find((x) => x.id === s)?.label ?? s} shift`,
      remove: () => setFilters({ ...filters, shifts: filters.shifts.filter((x) => x !== s) }),
    })),
    ...(filters.salaryMin > SALARY_FLOOR
      ? [{ label: `₹${Math.round(filters.salaryMin / 1000)}k+`, remove: () => setFilters({ ...filters, salaryMin: SALARY_FLOOR }) }]
      : []),
    ...(filters.noExperience
      ? [{ label: "No experience", remove: () => setFilters({ ...filters, noExperience: false }) }]
      : []),
  ];

  /* Badge on the mobile Filters button, so a phone user can tell at a
     glance that a filter is narrowing their results. */
  const activeFilterCount =
    filters.categories.length +
    filters.areas.length +
    filters.shifts.length +
    (filters.salaryMin > SALARY_FLOOR ? 1 : 0) +
    (filters.walkIn ? 1 : 0) +
    (filters.workFromHome ? 1 : 0) +
    (filters.noExperience ? 1 : 0);

  const headline = (() => {
    /* Keep the label's own casing — "IT" and "Non-IT" are acronyms, and
       lowercasing them produced "5 it jobs". */
    const cat = filters.categories.length === 1 ? `${categoryMeta(filters.categories[0]).short} ` : "";
    const area = filters.areas.length === 1 ? ` in ${AREAS.find((a) => a.slug === filters.areas[0])?.label}` : "";
    return `${results.length} ${cat}job${results.length === 1 ? "" : "s"}${area}`;
  })();

  return (
    <div className="min-h-dvh bg-canvas">
      {/* ① Compact nav search — the hero search collapsed into the header */}
      <header className="sticky top-0 z-40 bg-canvas border-b border-hairline-soft">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 h-16 flex items-center gap-3 md:gap-4">
          <Link href="/jobs" aria-label="FindWay Jobs home" className="shrink-0">
            <Logo size={26} />
          </Link>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex-1 md:max-w-[420px] flex items-center h-11 bg-canvas border border-hairline rounded-full shadow-airbnb pl-4 pr-1.5 min-w-0"
          >
            <input
              value={what}
              onChange={(e) => setWhat(e.target.value)}
              placeholder="Job title, skill or company"
              aria-label="What — job title, skill or company"
              className="flex-1 min-w-0 text-[13px] text-job-navy bg-transparent outline-none placeholder:text-muted-soft"
            />
            {/* The Where field is dropped on phones — two inputs plus a
                button cannot share a 390px row. Area stays filterable
                through the sheet. */}
            <span className="hidden sm:block w-px h-5 bg-hairline mx-2.5 shrink-0" aria-hidden="true" />
            <input
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              placeholder="Area"
              aria-label="Where — area"
              className="hidden sm:block w-[92px] shrink-0 text-[13px] text-job-navy bg-transparent outline-none placeholder:text-muted-soft"
            />
            <button
              type="submit"
              aria-label="Search"
              className="shrink-0 h-8 w-8 sm:w-auto sm:px-4 flex items-center justify-center text-[13px] font-semibold text-job-navy bg-job-sun rounded-full hover:bg-job-sun-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2"
            >
              <span className="hidden sm:inline">Search</span>
              <svg className="sm:hidden" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </button>
          </form>

          <Link
            href="/post"
            className="hidden md:inline-flex ml-auto shrink-0 items-center h-9 px-4 text-[13px] font-semibold text-job-navy border border-hairline rounded-full hover:border-job-navy transition-colors"
          >
            Post a job
          </Link>
        </div>

        {/* ② Applied-filter chip bar */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {/* The rail is desktop-only, so phones reach every filter here. */}
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="lg:hidden shrink-0 inline-flex items-center gap-1.5 h-8 px-3.5 text-[13px] font-bold rounded-full border border-job-navy text-job-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M3 6h18M6 12h12M10 18h4" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 min-w-[17px] h-[17px] px-1 grid place-items-center text-[10.5px] font-bold rounded-full bg-job-navy text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {chips.map((c) => (
            <AppliedChip key={c.label} label={c.label} onRemove={c.remove} />
          ))}
          <ToggleChip label="Walk-in" active={filters.walkIn} onClick={() => setFilters({ ...filters, walkIn: !filters.walkIn })} />
          <ToggleChip
            label="Work from home"
            active={filters.workFromHome}
            onClick={() => setFilters({ ...filters, workFromHome: !filters.workFromHome })}
          />
          {(chips.length > 0 || filters.walkIn || filters.workFromHome) && (
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="ml-auto pl-3 shrink-0 text-[13px] font-semibold text-job-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy rounded-sm"
            >
              Clear all
            </button>
          )}
        </div>
      </header>

      {/* pb-20 clears the fixed BottomNav on phones */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-5 pb-20 md:pb-8 flex gap-7">
        {/* ③ Left filter rail */}
        <FilterRail filters={filters} setFilters={setFilters} counts={counts} />

        <div className="flex-1 min-w-0">
          {/* Result count + ⑤ list/map toggle + ⑥ sort */}
          {/* Heading, sort and the view toggle together overflow a phone
              row, so below sm they stack and the controls share their own
              line. */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-4">
            <h1 className="text-[16px] sm:text-[17px] font-bold text-job-navy">
              {view === "map" ? `Showing ${inView.length} job${inView.length === 1 ? "" : "s"} in view` : headline}
            </h1>
            <div className="flex items-center justify-between sm:justify-end gap-2.5">
              <SortMenu sort={sort} onSort={setSort} />
              <div className="flex p-0.5 bg-surface-soft rounded-full" role="tablist" aria-label="Results view">
                {(["list", "map"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="tab"
                    aria-selected={view === v}
                    onClick={() => switchView(v)}
                    className={`h-8 px-4 text-[13px] font-semibold rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy ${
                      view === v ? "text-white bg-job-navy" : "text-body hover:text-job-navy"
                    }`}
                  >
                    {v === "list" ? "List" : "Map"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="border border-dashed border-hairline rounded-[14px] py-16 text-center">
              <p className="text-[15px] font-semibold text-job-navy">No jobs match these filters</p>
              <p className="text-[13px] text-muted mt-1">Try widening the salary range or clearing an area.</p>
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="mt-4 h-9 px-5 text-[13px] font-semibold text-job-navy bg-job-sun rounded-full hover:bg-job-sun-active transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : view === "list" ? (
            <>
              {/* ④ Row cards */}
              <div className="flex flex-col gap-3.5">
                {visible.map((j) => (
                  <JobRow key={j.id} job={j} />
                ))}
              </div>

              {/* Pagination */}
              {pageCount > 1 && (
                <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 mt-7">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      aria-current={p === page ? "page" : undefined}
                      className={`w-8 h-8 text-[13px] font-semibold rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2 ${
                        p === page ? "bg-job-navy text-white" : "text-body hover:bg-surface-soft"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </nav>
              )}
            </>
          ) : (
            /* ── Split map view — list column scrolls, map fills the rest ── */
            /* Phones stack map over list at natural height; only from md
               does the split become two side-by-side scroll panes. */
            <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-4 md:h-[calc(100dvh-190px)] md:min-h-[460px]">
              <div className="md:overflow-y-auto flex flex-col gap-2.5 md:pr-1">
                {inView.length > 0 ? (
                  inView.map((j) => (
                    <JobMiniCard
                      key={j.id}
                      job={j}
                      active={j.id === hoveredId || j.id === selectedId}
                      onHover={setHoveredId}
                      onSelect={setSelectedId}
                    />
                  ))
                ) : (
                  <p className="text-[13px] text-muted py-8 text-center">
                    No jobs in this part of the map — pan or zoom out.
                  </p>
                )}
              </div>

              <div className="relative rounded-[14px] overflow-hidden border border-hairline h-[46dvh] md:h-auto md:min-h-[300px]">
                <JobsMap
                  jobs={results}
                  hoveredId={hoveredId}
                  selectedId={selectedId}
                  onHover={setHoveredId}
                  onSelect={setSelectedId}
                  onViewportChange={setViewportIds}
                />
                {selectedJob && <MapPreview job={selectedJob} onClose={() => setSelectedId(null)} />}
              </div>
            </div>
          )}
        </div>
      </div>

      <FiltersSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        setFilters={setFilters}
        counts={counts}
        resultCount={results.length}
        onClearAll={() => setFilters(EMPTY_FILTERS)}
      />
    </div>
  );
}

export default function JobsSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-canvas" />}>
      <SearchResults />
    </Suspense>
  );
}
