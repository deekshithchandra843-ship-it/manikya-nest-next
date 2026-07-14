"use client";
import { useState, useEffect, useRef } from "react";
import { useTypewriterPlaceholder } from "@/hooks/useTypewriter";

const propertyTabs = ["PG/Hostel", "Rental flat", "Co-living", "Jobs"];
const budgetOptions = ["Any budget", "Under ₹5k", "₹5k – ₹10k", "₹10k – ₹20k", "₹20k+"];
const salaryOptions = ["Any salary", "Under ₹25k", "₹25k – ₹50k", "₹50k – ₹1L", "₹1L+"];

const RENT_WORDS = [
  "Search 2 BHK in HSR Layout...",
  "Search flats near Indiranagar...",
  "Search bachelors apartments...",
  "Search pet-friendly homes...",
  "Search apartments near Metro..."
];

const PG_WORDS = [
  "Search single room PG in Koramangala...",
  "Search girls hostel near BTM Layout...",
  "Search boys PG near Electronic City...",
  "Search sharing rooms with food..."
];

const COLIVING_WORDS = [
  "Search co-living spaces in HSR...",
  "Search twin sharing in Koramangala...",
  "Search managed co-living for women..."
];

const JOBS_WORDS = [
  "Search Software Engineer roles...",
  "Search Product Manager jobs...",
  "Search sales jobs in Bengaluru...",
  "Search remote developer work..."
];

const DEFAULT_WORDS = [
  "Search locality, college, or company...",
  "Search properties near you..."
];

interface SearchBarProps {
  onSearch?: (location: string, budget: string, propertyType: string) => void;
  /** White tab text for placement over dark/video backgrounds. */
  lightText?: boolean;
  /** Hide the property-type tabs (PG/Hostel, Rental flat, etc.) */
  hideTabs?: boolean;
  /** Apply premium glassmorphic transparent background. */
  glass?: boolean;
  /** Force the dropdown menu to open upwards (useful when placed near container bottoms) */
  dropdownUp?: boolean;
}

export default function SearchBar({ onSearch, lightText = false, hideTabs = false, glass = false, dropdownUp = false }: SearchBarProps) {
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("Any budget");
  const [propertyType, setPropertyType] = useState("PG/Hostel");
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const isJobs = propertyType === "Jobs";
  const options = isJobs ? salaryOptions : budgetOptions;

  let words = DEFAULT_WORDS;
  if (isJobs) words = JOBS_WORDS;
  else if (propertyType === "Rental flat") words = RENT_WORDS;
  else if (propertyType === "PG/Hostel") words = PG_WORDS;
  else if (propertyType === "Co-living") words = COLIVING_WORDS;

  const typewriterPlaceholder = useTypewriterPlaceholder(words);

  // Sync selected default when mode switches between Jobs and Housing
  useEffect(() => {
    setBudget(isJobs ? "Any salary" : "Any budget");
  }, [isJobs]);

  // Click outside to close dropdown
  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  // Escape key to close
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleSearch = () => {
    if (onSearch) onSearch(location, budget, propertyType);
  };

  return (
    <div className="w-full">
      {/* Property-type tabs — controlled, ink underline like the navbar */}
      {!hideTabs && (
      <div
        role="tablist"
        aria-label="What are you looking for"
        className="flex items-center justify-center md:justify-start gap-1 mb-3 overflow-x-auto scrollbar-hide"
      >
        {propertyTabs.map((tab) => {
          const active = propertyType === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setPropertyType(tab)}
              className={`relative whitespace-nowrap px-3 py-2 text-sm font-medium rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                lightText
                  ? `focus-visible:ring-white focus-visible:ring-offset-transparent [text-shadow:0_1px_8px_rgba(0,0,0,0.6)] ${active ? "text-white" : "text-white/75 hover:text-white"}`
                  : `focus-visible:ring-ink focus-visible:ring-offset-surface-soft ${active ? "text-ink" : "text-muted hover:text-ink"}`
              }`}
            >
              {tab}
              {active && (
                <span className={`absolute -bottom-0.5 left-3 right-3 h-[2px] rounded-full ${lightText ? "bg-white" : "bg-ink"}`} />
              )}
            </button>
          );
        })}
      </div>
      )}

      {/* The search bar */}
      <div className={`w-full border rounded-[32px] md:rounded-full flex flex-col md:flex-row items-stretch md:items-center md:pr-2 transition-all duration-300 ${
        glass
          ? "bg-white/85 backdrop-blur-md border-white/30 shadow-2xl focus-within:bg-white/95 focus-within:border-white/50 focus-within:scale-[1.01]"
          : "bg-canvas border-hairline shadow-airbnb"
      }`}>
        {/* Location input */}
        <div className="flex flex-col px-6 py-3 flex-1 text-left transition-colors focus-within:bg-surface-soft rounded-t-[30px] md:rounded-t-none md:rounded-l-full">
          <label htmlFor="search-where" className="text-[14px] font-medium text-ink leading-tight">
            Where
          </label>
          <input
            id="search-where"
            type="text"
            placeholder={
              typewriterPlaceholder || (isJobs ? "Role, company or area…" : "City, locality, college or company…")
            }
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="text-sm text-body placeholder-muted outline-none bg-transparent mt-0.5 rounded-sm focus-visible:ring-2 focus-visible:ring-ink/40"
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-hairline h-8 shrink-0" aria-hidden="true" />
        <div className="md:hidden h-px bg-hairline mx-6" aria-hidden="true" />

        {/* Budget dropdown */}
        <div ref={containerRef} className="relative flex flex-col px-6 py-3 md:min-w-[200px] text-left transition-colors focus-within:bg-surface-soft rounded-b-[30px] md:rounded-b-none">
          <label id="search-budget-label" className="text-[14px] font-medium text-ink leading-tight">
            {isJobs ? "Expected salary" : "Monthly budget"}
          </label>
          <button
            id="search-budget"
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-labelledby="search-budget-label search-budget"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center justify-between text-sm text-body font-normal outline-none bg-transparent cursor-pointer mt-0.5 -ml-0.5 rounded-sm focus-visible:ring-2 focus-visible:ring-ink/40 text-left min-w-0"
          >
            <span className="truncate">{budget}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
              className={`ml-2 shrink-0 transition-transform text-muted ${open ? "rotate-180" : ""}`}
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className={`absolute left-0 right-0 md:left-auto md:right-0 w-full md:w-60 bg-canvas rounded-[16px] shadow-airbnb border border-hairline-soft z-50 py-1.5 overflow-hidden animate-fade-up ${
              dropdownUp ? "bottom-full mb-2" : "top-full mt-2"
            }`}>
              <ul role="listbox" aria-labelledby="search-budget-label" className="flex flex-col">
                {options.map((opt) => {
                  const active = budget === opt;
                  return (
                    <li key={opt} role="option" aria-selected={active}>
                      <button
                        type="button"
                        onClick={() => {
                          setBudget(opt);
                          setOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between hover:bg-surface-soft focus-visible:bg-surface-soft focus-visible:outline-none ${
                          active ? "text-rausch font-semibold bg-surface-soft/60" : "text-ink"
                        }`}
                      >
                        <span>{opt}</span>
                        {active && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-rausch shrink-0">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Search orb */}
        <button
          type="button"
          onClick={handleSearch}
          aria-label={isJobs ? "Search jobs" : "Search homes"}
          className="m-3 md:m-0 flex items-center justify-center gap-2 h-12 px-4 md:px-0 md:w-12 bg-rausch text-white rounded-full hover:bg-rausch-active active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="md:hidden text-sm font-medium">Search</span>
        </button>
      </div>
    </div>
  );
}
