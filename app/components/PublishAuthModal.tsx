"use client";
import { useEffect, useRef } from "react";
import LoginForm from "./LoginForm";
import type { ListingRole } from "./PublishRoleModal";

const ROLE_LABEL: Record<ListingRole, string> = {
  owner: "Owner",
  agent: "Agent",
  builder: "Builder",
};

/**
 * Step 2 of the publish flow: log in / sign up to publish the listing.
 * Reuses the shared LoginForm (and therefore the demoAuth rules). The chosen
 * listing role is shown as context only — it is listing metadata and is kept
 * separate from the demo auth roles (owner/employer/admin). On a successful
 * login the parent closes the modal and marks the listing published.
 */
export default function PublishAuthModal({
  listingRole,
  onBack,
  onClose,
  onSuccess,
}: {
  listingRole: ListingRole;
  onBack: () => void;
  onClose: () => void;
  onSuccess: () => void;
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
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="publish-auth-title">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full sm:max-w-[420px] bg-canvas rounded-t-[20px] sm:rounded-[20px] shadow-3d border border-hairline-soft overflow-hidden animate-fade-up outline-none"
      >
        {/* Themed brand accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rausch via-violet to-indigo" />
        <div className="p-6">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={onBack} aria-label="Back to role" className="shrink-0 text-muted hover:text-ink p-1 -ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <h2 id="publish-auth-title" className="text-[19px] font-bold text-ink truncate">Log in to publish</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="shrink-0 text-muted hover:text-ink p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm">✕</button>
        </div>
        <p className="text-sm text-muted mb-4">
          Listing as <span className="font-medium text-ink">{ROLE_LABEL[listingRole]}</span>. Verify your number or email to put it live.
        </p>

        <LoginForm onSuccess={() => onSuccess()} />
        </div>
      </div>
    </div>
  );
}
