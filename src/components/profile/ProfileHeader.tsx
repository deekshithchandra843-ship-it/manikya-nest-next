"use client";
import Image from "next/image";
import type { Role, Session } from "@/lib/auth";
import { initialsOf } from "@/lib/roleTheme";
import { profileTheme } from "./theme";
import ProfileSwitch from "./ProfileSwitch";

/**
 * Identity card hero — full-bleed soft brand band that morphs its theme with
 * the active mode. Hosts the Personal/Business segmented switch.
 */
export default function ProfileHeader({
  session,
  verified,
  hasBusinessRole,
  onEdit,
  onShare,
  onSwitch,
  onActivate,
}: {
  session: Session;
  verified: boolean;
  hasBusinessRole: boolean;
  onEdit: () => void;
  onShare?: () => void;
  onSwitch: (mode: "personal" | "business") => void;
  onActivate: (role: Role) => void;
}) {
  const theme = profileTheme(session.activeView);
  const isBusiness = theme.isBusiness;

  return (
    <section
      aria-label="Profile"
      className={`relative overflow-hidden -mx-4 md:-mx-6 lg:-mx-10 px-4 md:px-6 lg:px-10 pt-8 pb-7 mb-6 rounded-b-[32px] bg-gradient-to-br transition-all duration-500 animate-fade-up ${theme.heroGradient}`}
    >
      <div className="relative flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <div className={`p-[3px] rounded-full bg-gradient-to-br transition-all duration-500 ${theme.ringGradient}`}>
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-canvas flex items-center justify-center overflow-hidden">
                  {session.avatarUrl ? (
                    <Image
                      src={session.avatarUrl}
                      alt={session.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className={`text-xl md:text-2xl font-bold transition-colors duration-500 ${theme.accentText}`}>
                      {initialsOf(session.name)}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-6 h-6 md:w-7 md:h-7 rounded-full text-white flex items-center justify-center shadow-md border-2 border-canvas ${
                  isBusiness ? `bg-gradient-to-br ${theme.ringGradient}` : "bg-ink"
                }`}
                title={isBusiness ? "Business workspace active" : "Personal workspace active"}
              >
                {isBusiness ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                )}
              </span>
            </div>

            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-ink truncate">{session.name}</h1>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-gradient-to-r ${theme.pillGradient} px-2.5 py-0.5 rounded-full uppercase tracking-wider`}>
                  {isBusiness ? "Business Profile" : "Personal Profile"}
                </span>
                {verified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M12 8v4m0 4h.01M12 3l9 4v5c0 5-4 8-9 9-5-1-9-4-9-9V7z" /></svg>
                    KYC pending
                  </span>
                )}
              </div>
              {session.city && (
                <p className="flex items-center gap-1 text-[13px] text-muted mt-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="11" r="3" /></svg>
                  {session.city}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isBusiness && onShare && (
              <button
                onClick={onShare}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink bg-canvas border border-hairline rounded-full px-4 py-2.5 shadow-airbnb hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" /></svg>
                <span className="hidden sm:inline">Share</span>
              </button>
            )}
            <button
              onClick={onEdit}
              aria-label="Edit profile"
              className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink bg-canvas border border-hairline rounded-full px-3.5 py-2.5 shadow-airbnb hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              <span className="hidden sm:inline">Edit</span>
            </button>
          </div>
        </div>

        {/* The morphing A+C switch lives inside the hero */}
        <div className="w-full sm:w-auto">
          <ProfileSwitch
            activeView={session.activeView}
            hasBusinessRole={hasBusinessRole}
            onSwitch={onSwitch}
            onActivate={onActivate}
          />
        </div>
      </div>
    </section>
  );
}
