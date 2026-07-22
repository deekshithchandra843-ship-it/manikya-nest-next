"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Requirement, fetchRequirementsApi, deleteRequirementApi } from "@/lib/requirements";

export default function RequirementsBlock({ userName, seekerId }: { userName: string; seekerId?: string }) {
  const [requirements, setRequirements] = useState<Requirement[]>([]);

  useEffect(() => {
    fetchRequirementsApi().then((all) => {
      setRequirements(all.filter((r) => (seekerId && r.seekerId === seekerId) || r.name === userName));
    });
  }, [userName, seekerId]);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to close this requirement? You will stop receiving responses.")) {
      deleteRequirementApi(id).then((ok) => {
        if (ok) {
          setRequirements((prev) => prev.filter((r) => r.id !== id));
        }
      });
    }
  };

  if (requirements.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-hairline rounded-[18px] bg-surface-soft p-8 animate-fade-up">
        <div className="w-12 h-12 rounded-full bg-rausch/10 text-rausch flex items-center justify-center mx-auto mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-ink mb-1">No active requirements</h3>
        <p className="text-sm text-muted max-w-[280px] mx-auto mb-5">
          Tell owners and agents what you want and have them reach out to you directly.
        </p>
        <Link
          href="/requirements"
          className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-rausch text-white text-xs font-semibold rounded-full hover:bg-rausch-active transition-colors shadow-airbnb"
        >
          Post a Requirement
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-ink flex items-center gap-2">
          <span>My Posted Requirements</span>
          <span className="text-xs bg-rausch/10 text-rausch px-2 py-0.5 rounded-full font-semibold">
            {requirements.length} active
          </span>
        </h3>
        <Link href="/requirements" className="text-xs font-semibold text-rausch hover:underline">
          Post new +
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requirements.map((req) => (
          <div
            key={req.id}
            className="bg-canvas border border-hairline rounded-[18px] p-5 shadow-3d-soft hover:shadow-airbnb hover-lift transition-all duration-300 flex flex-col md:flex-row justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-white bg-ink px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {req.role}
                </span>
                {req.category && (
                  <span className="text-[10px] font-bold text-rausch bg-rausch/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {req.category}
                  </span>
                )}
                {req.verified && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-extrabold text-ink text-base">
                  {req.budgetLabel}
                </h4>
                <p className="text-xs text-muted flex items-center gap-1 mt-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {req.city} &middot; {req.areas.join(", ")}
                </p>
                {req.notes && (
                  <p className="text-xs text-muted italic mt-2 border-l-2 border-hairline pl-2">
                    &ldquo;{req.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Tags */}
              {req.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {req.tags.map((t) => (
                    <span key={t} className="text-[10px] text-muted bg-surface-soft border border-hairline-soft px-2 py-0.5 rounded-[4px]">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-hairline/60">
              <div className="text-left md:text-right shrink-0">
                <p className="text-base md:text-lg font-black text-ink">{req.responseCount}</p>
                <p className="text-[10px] md:text-[11px] text-muted">Responses received</p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleDelete(req.id)}
                  className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold text-error border border-error/20 rounded-[8px] hover:bg-error/5 transition-all text-center"
                >
                  Close Req
                </button>
                <Link
                  href="/requirements"
                  className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold text-white bg-ink rounded-[8px] hover:opacity-90 transition-all text-center"
                >
                  View Feed
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
