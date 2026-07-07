"use client";
import { useEffect, useRef, useState } from "react";
import type { Session } from "@/lib/auth";

export default function ShareProfileModal({
  session,
  onClose,
}: {
  session: Session;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Dynamic public share URL
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/profile/share/${session.id}`
    : `/profile/share/${session.id}`;

  // Close on Escape key press
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  // Derive initials
  const initials = session.name
    ? session.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "B";

  // Public activity metrics for share card (non-sensitive).
  // TODO: populate from the backend once listing/lead endpoints exist.
  const activeListingsCount = 0;
  const totalLeads = 0;
  const satisfactionRate = "—";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-profile-title"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-canvas rounded-[20px] w-full max-w-[420px] p-6 shadow-airbnb border border-hairline-soft animate-fade-up outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="share-profile-title" className="text-base font-bold text-ink">
            Share Business Profile
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink transition-colors p-1.5 rounded-full hover:bg-surface-soft focus:outline-none"
            aria-label="Close dialog"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-muted mb-4">
          Share your public professional card. Sensitive records (email, phone, client names) will be hidden.
        </p>

        {/* Tactile Card Preview */}
        <div className="bg-gradient-to-br from-surface-soft to-canvas border border-hairline rounded-[16px] p-5 mb-5 shadow-3d-soft relative overflow-hidden">
          {/* Subtle themed light effects */}
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-rausch/5 blur-xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-tab-rent/5 blur-xl pointer-events-none" />

          <div className="flex items-center gap-3.5 mb-4">
            {session.avatarUrl ? (
              <img
                src={session.avatarUrl}
                alt={session.name}
                className="w-12 h-12 rounded-full object-cover shadow-sm select-none shrink-0"
              />
            ) : (
              <span className="w-12 h-12 rounded-full bg-gradient-to-r from-rausch to-tab-rent text-white flex items-center justify-center text-sm font-bold shadow-sm select-none shrink-0">
                {initials}
              </span>
            )}
            <div>
              <h3 className="font-bold text-ink text-base flex items-center gap-1.5 leading-tight">
                {session.name}
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rausch bg-rausch/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="shrink-0">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Verified
                </span>
              </h3>
              <p className="text-xs text-muted mt-0.5 capitalize">
                {session.roles?.join(" · ") || "Partner"}
              </p>
            </div>
          </div>

          <div className="border-t border-hairline-soft my-4" />

          {/* Non-sensitive Accomplishments Grid */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-canvas border border-hairline-soft rounded-[10px] py-2 px-1">
              <p className="text-base font-extrabold text-ink leading-tight">{activeListingsCount}</p>
              <p className="text-[9px] font-semibold text-muted uppercase tracking-wider mt-0.5">Active Listings</p>
            </div>
            <div className="bg-canvas border border-hairline-soft rounded-[10px] py-2 px-1">
              <p className="text-base font-extrabold text-ink leading-tight">{totalLeads}</p>
              <p className="text-[9px] font-semibold text-muted uppercase tracking-wider mt-0.5">Total Deals</p>
            </div>
            <div className="bg-canvas border border-hairline-soft rounded-[10px] py-2 px-1">
              <p className="text-base font-extrabold text-ink leading-tight">{satisfactionRate}</p>
              <p className="text-[9px] font-semibold text-muted uppercase tracking-wider mt-0.5">Match Rate</p>
            </div>
          </div>
        </div>

        {/* Copy Link Input Bar */}
        <div className="space-y-1.5">
          <label htmlFor="share-profile-url" className="text-[10px] font-bold uppercase tracking-wider text-muted block">
            Profile Link
          </label>
          <div className="flex items-center gap-2 bg-surface-soft border border-hairline rounded-[10px] p-1.5 pl-3">
            <input
              id="share-profile-url"
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent border-none text-xs text-ink w-full focus:outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-1.5 text-xs font-bold text-white rounded-[8px] transition-all shrink-0 ${
                copied ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rausch hover:bg-rausch-active"
              }`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
