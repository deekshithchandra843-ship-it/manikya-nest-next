"use client";
import { useEffect } from "react";

interface FiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Category-specific quick filters. */
  chips: string[];
  selected: string[];
  onToggle: (chip: string) => void;
  /** Budget slider, expressed in the category's numeric price units. */
  budget: number;
  minBudget: number;
  maxBudget: number;
  onBudget: (value: number) => void;
  /** Number of results that would show with the current selection. */
  resultCount: number;
  resultNoun: string;
  onApply: () => void;
  onClearAll: () => void;
}

function formatBudget(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2).replace(/\.00$/, "")} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function FiltersDrawer({
  open,
  onClose,
  chips,
  selected,
  onToggle,
  budget,
  minBudget,
  maxBudget,
  onBudget,
  resultCount,
  resultNoun,
  onApply,
  onClearAll,
}: FiltersDrawerProps) {
  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
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
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="More filters">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      {/* Panel: bottom sheet on mobile, right slide-over on desktop */}
      <div
        className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-[20px] md:rounded-t-none md:rounded-l-[20px] md:inset-y-0 md:right-0 md:left-auto md:w-[420px] md:max-h-none bg-canvas shadow-airbnb flex flex-col animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline-soft shrink-0">
          <h2 className="text-base font-bold text-ink">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="p-1.5 -mr-1.5 text-muted hover:text-ink rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Budget */}
          <fieldset>
            <legend className="text-sm font-semibold text-ink mb-3">Budget</legend>
            <div className="flex items-center justify-between text-sm text-muted mb-2">
              <span>{formatBudget(minBudget)}</span>
              <span className="font-semibold text-ink">Up to {formatBudget(budget)}</span>
            </div>
            <input
              type="range"
              min={minBudget}
              max={maxBudget}
              step={Math.max(500, Math.round((maxBudget - minBudget) / 100))}
              value={budget}
              onChange={(e) => onBudget(Number(e.target.value))}
              aria-label="Maximum budget"
              className="w-full accent-rausch cursor-pointer"
            />
          </fieldset>

          {/* Quick filters */}
          <fieldset>
            <legend className="text-sm font-semibold text-ink mb-3">Quick filters</legend>
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => {
                const active = selected.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => onToggle(chip)}
                    aria-pressed={active}
                    className={`px-3.5 py-1.5 text-sm font-medium rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
                      active
                        ? "bg-rausch/10 border-rausch text-rausch"
                        : "bg-canvas border-hairline text-body hover:border-ink"
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-hairline-soft shrink-0">
          <button
            type="button"
            onClick={onClearAll}
            className="text-sm font-semibold text-ink underline underline-offset-2 hover:text-rausch transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm px-1"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onApply}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-rausch rounded-[8px] hover:bg-rausch-active active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2"
          >
            Show {resultCount} {resultCount === 1 ? resultNoun.replace(/s$/, "") : resultNoun}
          </button>
        </div>
      </div>
    </div>
  );
}
