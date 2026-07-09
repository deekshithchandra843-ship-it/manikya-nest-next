import type { Stat } from "./profileData";

/**
 * Elevated stat cards: number in the brand accent, a sublabel/trend line and
 * a hover lift. 3-up on all widths (the numbers stay legible at 390px).
 */
export default function StatGrid({ stats, accentText = "text-rausch" }: { stats: Stat[]; accentText?: string }) {
  return (
    <section aria-label="Your activity" className="grid grid-cols-3 gap-3 animate-fade-up">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-canvas border border-hairline rounded-[14px] p-3 md:p-4 text-center hover-lift hover:shadow-airbnb"
        >
          <p className={`text-2xl font-bold ${accentText}`}>{stat.value}</p>
          <p className="text-xs text-body font-medium mt-0.5">{stat.label}</p>
          <p className="text-[11px] text-muted mt-0.5 hidden sm:block">{stat.sub}</p>
        </div>
      ))}
    </section>
  );
}
