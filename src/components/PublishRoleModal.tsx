"use client";
import { useEffect, useRef } from "react";

export type ListingRole = "owner" | "agent" | "builder";

const ROLE_OPTIONS: { role: ListingRole; label: string; desc: string; glyph: React.ReactNode }[] = [
  {
    role: "owner",
    label: "Owner",
    desc: "I own this property and want to list it directly.",
    glyph: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />,
  },
  {
    role: "agent",
    label: "Agent",
    desc: "I'm a broker listing on behalf of clients.",
    glyph: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  },
  {
    role: "builder",
    label: "Builder",
    desc: "I'm a developer listing project inventory.",
    glyph: <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" />,
  },
];

/**
 * Step 1 of the publish flow: "You are listing as" → Owner / Agent / Builder.
 * Selecting a role hands it back via `onSelect`; the parent then opens the
 * auth modal. Mirrors the RespondModal chrome (backdrop click + aria-modal) and
 * adds Escape-to-close + focus moved into the dialog on open.
 */
export default function PublishRoleModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (role: ListingRole) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="publish-role-title">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full sm:max-w-[440px] bg-canvas rounded-t-[20px] sm:rounded-[20px] shadow-3d border border-hairline-soft overflow-hidden animate-fade-up outline-none"
      >
        {/* Themed brand accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rausch via-violet to-indigo" />
        <div className="p-6">
        <div className="flex items-start justify-between mb-1">
          <h2 id="publish-role-title" className="text-[19px] font-bold text-ink">You are listing as</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-ink p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm">✕</button>
        </div>
        <p className="text-sm text-muted mb-5">Pick the role that fits you. This helps seekers know who they&apos;re dealing with.</p>

        <div className="space-y-3">
          {ROLE_OPTIONS.map((o) => (
            <button
              key={o.role}
              type="button"
              onClick={() => onSelect(o.role)}
              className="group w-full flex items-center gap-4 p-4 rounded-[14px] border border-hairline text-left transition-colors hover:border-rausch hover:bg-rausch/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
            >
              <span className="shrink-0 w-11 h-11 rounded-[12px] bg-surface-soft text-ink flex items-center justify-center group-hover:bg-rausch/10 group-hover:text-rausch transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">{o.glyph}</svg>
              </span>
              <span className="min-w-0">
                <span className="block text-base font-semibold text-ink">{o.label}</span>
                <span className="block text-[13px] text-muted">{o.desc}</span>
              </span>
              <span className="ml-auto shrink-0 text-muted group-hover:text-rausch transition-colors" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 6l6 6-6 6" /></svg>
              </span>
            </button>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
