"use client";
import { useState } from "react";

const budgetOptions = ["Any budget", "Under ₹5k", "₹5k – ₹10k", "₹10k – ₹20k", "₹20k+"];

interface SearchBarProps {
  onSearch?: (location: string, budget: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("Any budget");

  const handleSearch = () => {
    if (onSearch) onSearch(location, budget);
  };

  return (
    <div className="w-full bg-canvas border border-hairline rounded-[32px] md:rounded-full shadow-airbnb flex flex-col md:flex-row items-stretch md:items-center md:pr-2 overflow-hidden md:overflow-visible">
      {/* Location input */}
      <div className="flex flex-col px-6 py-3 flex-1 text-left">
        <span className="text-[14px] font-medium text-ink leading-tight">Where</span>
        <input
          type="text"
          placeholder="City, locality, college or company…"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="text-sm text-body placeholder-muted outline-none bg-transparent mt-0.5"
        />
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px bg-hairline h-8" />
      <div className="md:hidden h-px bg-hairline mx-6" />

      {/* Budget dropdown */}
      <div className="flex flex-col px-6 py-3 md:min-w-[170px] text-left">
        <span className="text-[14px] font-medium text-ink leading-tight">Budget</span>
        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="text-sm text-body outline-none bg-transparent cursor-pointer mt-0.5 -ml-0.5"
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
        onClick={handleSearch}
        aria-label="Search"
        className="m-3 md:m-0 flex items-center justify-center gap-2 h-12 px-4 md:px-0 md:w-12 bg-rausch text-white rounded-full hover:bg-rausch-active transition-colors shrink-0"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="md:hidden text-sm font-medium">Search</span>
      </button>
    </div>
  );
}
