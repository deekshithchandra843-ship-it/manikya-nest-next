import React from "react";
import Link from "next/link";

/** Uppercase tracked section label — matches the app-wide pattern. */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] uppercase text-muted-soft tracking-wider px-1 pt-4 pb-2 font-medium">
      {children}
    </p>
  );
}

/** Standard white card wrapper: 14px radius, hairline border. */
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-canvas border border-hairline rounded-[14px] ${className}`}>{children}</div>
  );
}

/** Designed empty state: icon chip + one line + an accent CTA. */
export function EmptyState({
  icon,
  title,
  hint,
  cta,
  ctaHref,
  accentText,
  accentBgSoft,
  onCta,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  cta?: string;
  ctaHref?: string;
  accentText: string;
  accentBgSoft: string;
  onCta?: () => void;
}) {
  const ctaClasses = `inline-flex items-center gap-1.5 mt-3 text-[13px] font-semibold ${accentText} ${accentBgSoft} px-3.5 py-2 rounded-full hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2`;
  return (
    <div className="flex flex-col items-center text-center px-6 py-8">
      <span className={`w-11 h-11 rounded-[12px] ${accentBgSoft} ${accentText} flex items-center justify-center mb-3`} aria-hidden="true">
        {icon}
      </span>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="text-[13px] text-muted mt-0.5 max-w-[280px]">{hint}</p>
      {cta && ctaHref && (
        <Link href={ctaHref} className={ctaClasses}>
          {cta}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Link>
      )}
      {cta && !ctaHref && (
        <button type="button" onClick={onCta} className={ctaClasses}>
          {cta}
        </button>
      )}
    </div>
  );
}

/** Lightweight skeleton block — mirrors a section (label + card) so the
 *  session-loading pass has zero layout shift when real content lands. */
export function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-hidden="true">
      <div className="skeleton h-3 w-24 rounded-full mt-5 mb-3 mx-1" />
      <div className="bg-canvas border border-hairline rounded-[14px] p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton w-9 h-9 rounded-[10px] shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3.5 w-2/3 rounded-full" />
              <div className="skeleton h-3 w-1/3 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Chevron used at the end of tappable rows. */
export function RowChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-soft shrink-0" aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}
