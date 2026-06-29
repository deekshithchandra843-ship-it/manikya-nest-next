"use client";
import { Requirement, matchScore, getRole } from "../lib/requirements";

export default function RespondModal({ req, onClose, onSent }: { req: Requirement; onClose: () => void; onSent: (id: number) => void }) {
  const isAgent = req.role === "agent";
  // Demo responder: an owner with matching inventory in the same area/category/budget.
  const score = isAgent ? 100 : matchScore(req, {
    category: req.category,
    areas: req.areas,
    budgetMin: req.budgetMin,
    budgetMax: req.budgetMax,
    bhk: req.bhk,
  });

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Respond to requirement">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-[420px] bg-canvas rounded-t-[20px] sm:rounded-[20px] shadow-airbnb border border-hairline-soft p-6 animate-fade-up">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[17px] font-bold text-ink">{getRole(req.role)!.intentVerb}</p>
            <p className="text-sm text-muted">{req.areas.join(", ") || req.city} · {req.budgetLabel}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-ink p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm">✕</button>
        </div>

        {!isAgent && (
          <div className="flex items-center gap-3 mb-5 p-3 rounded-[14px] bg-rausch/5 border border-rausch/30">
            <span className="shrink-0 text-[15px] font-bold text-white bg-rausch rounded-full w-12 h-12 flex items-center justify-center tabular-nums">{score}%</span>
            <p className="text-sm text-body">Estimated match with your inventory. Higher means a closer fit on budget, area and type.</p>
          </div>
        )}

        <button type="button"
          onClick={() => { onSent(req.id); onClose(); }}
          className="w-full h-12 bg-rausch text-white text-base font-semibold rounded-[8px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2">
          {isAgent ? "Contact agent" : "Send response"}
        </button>
        <p className="text-[12px] text-muted text-center mt-3">They&apos;ll reach out on WhatsApp. Your number stays masked until you both connect.</p>
      </div>
    </div>
  );
}
