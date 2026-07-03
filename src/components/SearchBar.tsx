"use client";
import { useState } from "react";

const propertyTabs = ["PG/Hostel", "Rental flat", "Co-living", "Jobs"];
const budgetOptions = ["Any budget", "Under ₹5k", "₹5k – ₹10k", "₹10k – ₹20k", "₹20k+"];

interface SearchBarProps {
  onSearch?: (location: string, budget: string, propertyType: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("Any budget");
  const [propertyType, setPropertyType] = useState("PG/Hostel");

  const isJobs = propertyType === "Jobs";

  const handleSearch = () => {
    if (onSearch) onSearch(location, budget, propertyType);
  };

  return (
    <div className="w-full">
      {/* Property-type tabs — controlled, ink underline like the navbar */}
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
              className={`relative whitespace-nowrap px-3 py-2 text-sm font-medium rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-surface-soft ${
                active ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {tab}
              {active && (
                <span className="absolute -bottom-0.5 left-3 right-3 h-[2px] bg-ink rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* The search bar */}
      <div className="w-full bg-canvas border border-hairline rounded-[32px] md:rounded-full shadow-airbnb flex flex-col md:flex-row items-stretch md:items-center md:pr-2 overflow-hidden md:overflow-visible">
        {/* Location input */}
        <div className="flex flex-col px-6 py-3 flex-1 text-left transition-colors focus-within:bg-surface-soft md:rounded-l-full">
          <label htmlFor="search-where" className="text-[14px] font-medium text-ink leading-tight">
            Where
          </label>
          <input
            id="search-where"
            type="text"
            placeholder={
              isJobs ? "Role, company or area…" : "City, locality, college or company…"
            }
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="text-sm text-body placeholder-muted outline-none bg-transparent mt-0.5 rounded-sm focus-visible:ring-2 focus-visible:ring-ink/40"
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-hairline h-8" />
        <div className="md:hidden h-px bg-hairline mx-6" />

        {/* Budget dropdown */}
        <div className="flex flex-col px-6 py-3 md:min-w-[180px] text-left transition-colors focus-within:bg-surface-soft">
          <label htmlFor="search-budget" className="text-[14px] font-medium text-ink leading-tight">
            {isJobs ? "Expected salary" : "Monthly budget"}
          </label>
          <select
            id="search-budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="text-sm text-body outline-none bg-transparent cursor-pointer mt-0.5 -ml-0.5 rounded-sm focus-visible:ring-2 focus-visible:ring-ink/40"
          >
            {budgetOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
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
