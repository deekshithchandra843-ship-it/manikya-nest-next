"use client";
import Link from "next/link";
import JobStories from "@/components/JobStories";

/* ------------------------------------------------------------------ *
 * Jobs hub — "Channels" direction.
 * A bold dark editorial hero, then three raised channel cards:
 * IT, Non-IT and Part-time.
 *
 * Palette follows 60/30/10:
 *   60% INK_NAVY  — the hero field and icon tiles, the dominant mass
 *   30% supporting — lifted navy for gradient depth, plus white text
 *   10% SUN       — accent only: headline highlight, arrows, rules
 * SUN is never used as text on white (yellow-on-white fails contrast);
 * on light surfaces it appears as a bar or fill with navy text over it.
 * ------------------------------------------------------------------ */

const INK_NAVY = "#141d38";
const SUN = "#fcdb32";

interface Channel {
  id: string;
  title: string;
  tagline: string;
  count: string;
  tags: string[];
  /* With only two hues available, the three channels are told apart by
     weight rather than colour: solid navy, pale navy, solid sun. This
     matches the category chips on the search and detail pages. */
  tile: string;
  iconColor: string;
  glow: string;
  icon: React.ReactNode;
}

const channels: Channel[] = [
  {
    id: "it",
    title: "IT Jobs",
    tagline: "Software, data, design & product roles",
    count: "120+ roles",
    tags: ["Developer", "Data", "Design"],
    tile: INK_NAVY,
    iconColor: SUN,
    glow: "rgba(20,29,56,.20)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
      </svg>
    ),
  },
  {
    id: "non-it",
    title: "Non-IT Jobs",
    tagline: "Sales, operations, finance & support roles",
    count: "85+ roles",
    tags: ["Sales", "Ops", "Finance"],
    tile: "#eceef4",
    iconColor: INK_NAVY,
    glow: "rgba(20,29,56,.12)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
      </svg>
    ),
  },
  {
    id: "part-time",
    title: "Part-time Jobs",
    tagline: "Weekend, evening & flexible gig work",
    count: "60+ roles",
    tags: ["Weekend", "Evening", "Gig"],
    tile: SUN,
    iconColor: INK_NAVY,
    glow: "rgba(252,219,50,.34)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
];

function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <Link
      href={`/jobs/search?category=${channel.id}`}
      aria-label={`Explore ${channel.title}`}
      className="group relative block text-left bg-canvas border border-hairline rounded-[20px] p-5 md:p-6 shadow-airbnb overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2"
    >
      {/* corner glow that blooms on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500"
        style={{ background: `radial-gradient(circle,${channel.glow},transparent 70%)` }}
      />

      <div className="relative">
        {/* icon tile — weight, not hue, distinguishes the three channels */}
        <div
          className="w-12 h-12 rounded-[14px] flex items-center justify-center shadow-md group-hover:scale-105 group-hover:rotate-[-4deg] transition-transform duration-300"
          style={{ background: channel.tile, color: channel.iconColor }}
        >
          {channel.icon}
        </div>

        <h2 className="text-[18px] md:text-[19px] font-bold tracking-tight text-job-navy mt-4">{channel.title}</h2>
        <p className="text-[13px] text-muted mt-1 leading-snug">{channel.tagline}</p>

        <div className="flex flex-wrap gap-1.5 mt-3.5">
          {channel.tags.map((t) => (
            <span key={t} className="text-[11.5px] font-medium text-body bg-surface-soft px-2.5 py-0.5 rounded-full">{t}</span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-hairline-soft">
          <span className="text-[13px] font-semibold text-job-navy tabular-nums">{channel.count}</span>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: INK_NAVY }}>
            Explore
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function JobsPage() {
  return (
    <main>
      {/* ── Spotlight hero (full-screen cover) ───────────────────── */}
      <section
        aria-label="Find jobs"
        className="relative overflow-hidden w-full min-h-[62dvh] px-4 md:px-6 lg:px-10 flex items-center rounded-b-[28px]"
        style={{ background: `linear-gradient(160deg,${INK_NAVY} 0%,#1b2749 52%,${INK_NAVY} 100%)` }}
      >
        {/* 30% — supporting depth: a cool navy lift, and one restrained
            pool of accent warmth so the field never reads flat. */}
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-20 w-[26rem] h-[26rem] rounded-full" style={{ background: "radial-gradient(circle,rgba(58,84,163,.38),transparent 70%)" }} />
        <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-16 w-80 h-80 rounded-full" style={{ background: `radial-gradient(circle,rgba(252,219,50,.16),transparent 70%)` }} />

        <div className="relative max-w-[900px] mx-auto w-full text-center flex flex-col items-center gap-5 md:gap-6 pt-24 md:pt-28 pb-16">
          {/* 10% — accent eyebrow */}
          <span
            className="inline-flex items-center gap-2 h-7 px-3.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em]"
            style={{ color: SUN, background: "rgba(252,219,50,.10)", border: "1px solid rgba(252,219,50,.28)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: SUN }} aria-hidden="true" />
            Area-wise hiring
          </span>

          <h1 className="text-white font-extrabold tracking-tight leading-[1.1] text-[clamp(28px,5vw,50px)]">
            <span className="block">Jobs in</span>
            {/* The accent lands on the one phrase that carries the promise. */}
            <span className="block" style={{ color: SUN }}>
              Namma Bengaluru
            </span>
          </h1>

          <p className="text-[14px] md:text-[15.5px] text-white/65 max-w-[460px] leading-relaxed">
            Part-time gigs, IT roles and non-IT careers — area by area.
          </p>
        </div>

        {/* scroll hint */}
        <div aria-hidden="true" className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Explore channels</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SUN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ── Job channels ─────────────────────────────────────────── */}
      <section aria-label="Browse jobs by channel" className="max-w-[980px] mx-auto px-4 md:px-6 lg:px-10 py-16 md:py-20">
        <div className="text-center mb-9 md:mb-11">
          {/* On white, the accent carries as a bar rather than as text —
              yellow type on white would fail contrast. */}
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: INK_NAVY }}>
            <span className="w-6 h-[3px] rounded-full" style={{ background: SUN }} aria-hidden="true" />
            Job channels
            <span className="w-6 h-[3px] rounded-full" style={{ background: SUN }} aria-hidden="true" />
          </p>
          <h2 className="text-[24px] md:text-[30px] font-bold tracking-tight text-job-navy mt-2">Pick your lane</h2>
          <p className="text-[14px] text-muted mt-1.5">Three curated channels — every role in Bengaluru lives in one of them.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
          {channels.map((c) => (
            <ChannelCard key={c.id} channel={c} />
          ))}
        </div>
      </section>

      {/* ── Stories ──────────────────────────────────────────────── */}
      <JobStories />
    </main>
  );
}
