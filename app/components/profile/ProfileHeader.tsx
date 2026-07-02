"use client";
import type { DemoSession } from "../../lib/demoAuth";
import { initialsOf } from "../../lib/roleTheme";

/**
 * Profile hero — full-bleed soft brand band (same -mx bleed pattern as the
 * /post landing hero) holding a gradient-ring avatar with initials, name,
 * city and a verification pill. One common look for every member.
 */
export default function ProfileHeader({
  session,
  verified,
  onEdit,
}: {
  session: DemoSession;
  verified: boolean;
  onEdit: () => void;
}) {
  return (
    <section
      aria-label="Profile"
      className="relative overflow-hidden -mx-4 md:-mx-6 lg:-mx-10 px-4 md:px-6 lg:px-10 pt-8 pb-7 mb-4 rounded-b-[32px] bg-gradient-to-br from-rausch/15 via-rausch/5 to-transparent animate-fade-up"
    >
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {/* Avatar — gradient ring around initials */}
          <div className="shrink-0 p-[3px] rounded-full bg-gradient-to-br from-rausch to-tab-rent">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-canvas flex items-center justify-center">
              <span className="text-xl md:text-2xl font-bold text-rausch">
                {initialsOf(session.name)}
              </span>
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-ink truncate">{session.name}</h1>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {verified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                    <path d="M12 8v4m0 4h.01M12 3l9 4v5c0 5-4 8-9 9-5-1-9-4-9-9V7z" />
                  </svg>
                  KYC pending
                </span>
              )}
            </div>
            {session.city && (
              <p className="flex items-center gap-1 text-[13px] text-muted mt-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <circle cx="12" cy="11" r="3" />
                </svg>
                {session.city}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onEdit}
          aria-label="Edit profile"
          className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink bg-canvas border border-hairline rounded-full px-3.5 py-2 shadow-airbnb hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="hidden sm:inline">Edit</span>
        </button>
      </div>
    </section>
  );
}
