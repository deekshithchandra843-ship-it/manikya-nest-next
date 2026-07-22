"use client";
import { Requirement, getRole } from "@/lib/requirements";

export default function RequirementCard({ req, onRespond }: { req: Requirement; onRespond: (req: Requirement) => void }) {
  const roleDef = getRole(req.role)!;
  const isAgent = req.role === "agent";

  return (
    <div className="bg-canvas border border-hairline rounded-[14px] p-4 hover-lift hover:shadow-airbnb">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold text-ink bg-surface-soft px-2.5 py-1 rounded-full">{roleDef.label}</span>
        {req.verified && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-job-navy bg-job-navy-soft px-2 py-0.5 rounded-full">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Verified
          </span>
        )}
      </div>

      <p className="text-[15px] font-semibold text-ink mt-2 line-clamp-1">
        {roleDef.intentVerb}{req.bhk ? ` · ${req.bhk}` : ""}
      </p>
      <p className="text-sm text-muted mt-0.5 line-clamp-1">
        {req.areas.length ? req.areas.join(", ") : req.city} · {req.city}
      </p>

      <p className="text-[15px] text-ink font-semibold mt-2">{req.budgetLabel}</p>

      {req.notes && <p className="text-[13px] text-body mt-2 line-clamp-2">{req.notes}</p>}

      {req.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {req.tags.slice(0, 4).map((t) => (
            <span key={t} className="text-[12px] text-muted bg-surface-soft px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-hairline">
        <span className="text-[12px] text-muted">
          {req.postedAt}{!isAgent && req.responseCount > 0 ? ` · ${req.responseCount} responded` : ""}
        </span>
        <button type="button" onClick={() => onRespond(req)}
          className="px-4 py-2 text-sm font-semibold text-white bg-job-navy rounded-[8px] hover:bg-job-navy-lift transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2">
          {isAgent ? "Contact agent" : "Respond"}
        </button>
      </div>
    </div>
  );
}
