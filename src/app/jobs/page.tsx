"use client";
import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import JobStories from "@/components/JobStories";
import { AREAS } from "@/lib/jobs";

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

/**
 * HeroSearch and SearchBar both route site-wide job searches to
 * `/jobs?q=…`, which used to be consumed by the jobs listing page that
 * this Channels landing replaced. Rather than break that entry point,
 * a query lands here and is forwarded straight to /jobs/search, which
 * is where searching now lives. A bare /jobs still shows the channels.
 */
function SearchForwarder() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const q = params.get("q")?.trim() ?? "";
    const location = params.get("location")?.trim() ?? "";
    if (!q && !location) return;

    const next = new URLSearchParams();
    // A location that names a known area becomes a real area filter;
    // anything else is folded into the free-text query.
    const area = AREAS.find((a) => a.label.toLowerCase() === location.toLowerCase());
    if (area) next.set("area", area.slug);
    const text = [q, area ? "" : location].filter(Boolean).join(" ").trim();
    if (text) next.set("q", text);

    router.replace(`/jobs/search?${next.toString()}`);
  }, [params, router]);

  return null;
}

export default function JobsPage() {
  return (
    <main>
      {/* useSearchParams needs a boundary, and this must not block the page */}
      <Suspense fallback={null}>
        <SearchForwarder />
      </Suspense>

      {/* ── Spotlight hero (full-bleed image, no text) ───────────── */}
      <section
        aria-label="Find jobs"
        className="relative overflow-hidden w-full min-h-[62dvh] rounded-b-[28px] bg-ink"
      >
        <img
          src="/jobs-hero.jpg?v=2"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
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
