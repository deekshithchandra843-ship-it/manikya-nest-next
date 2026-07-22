"use client";
import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import {
  categoryMeta,
  findJob,
  jobCoords,
  jobDetail,
  similarJobs,
  formatPosted,
  JOBS,
  type Job,
} from "@/lib/jobs";

// Leaflet touches `window`, so the map must never render on the server.
const JobsMap = dynamic(() => import("@/components/JobsMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full skeleton" aria-hidden="true" />,
});

/** Salary and the verified tick read in navy — the palette's ink. */
const SALARY_INK = "#141d38";
const SUN = "#fcdb32";

/** The salary figure already carries its unit; this spells it out beneath. */
function salaryPeriod(job: Job): string {
  if (job.salaryDisplay.endsWith("/day")) return "per day";
  if (job.salaryDisplay.endsWith("/hr")) return "per hour";
  if (job.salaryDisplay.includes("LPA")) return "per year, cost to company";
  return "per month";
}

/* ── Pieces ──────────────────────────────────────────────────────── */

/** ① Facts strip — the four questions every seeker asks, above the fold. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 min-w-[130px] bg-surface-soft rounded-[12px] px-3.5 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">{label}</p>
      <p className="text-[14px] font-bold text-job-navy mt-0.5">{value}</p>
    </div>
  );
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  if (!verified) {
    return (
      <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-error">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
        </svg>
        Employer not yet verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold" style={{ color: SALARY_INK }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" />
      </svg>
      Verified employer
    </span>
  );
}

function Chip({ label, tone }: { label: string; tone?: "category" | "urgent" }) {
  const cls =
    tone === "urgent"
      ? "text-job-navy bg-job-sun"
      : tone === "category"
      ? ""
      : "text-body bg-surface-soft";
  return <span className={`text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

/** ⑤ Similar jobs rail — keeps seekers in the funnel if this role is filled. */
function SimilarJob({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="block py-3 border-b border-hairline-soft last:border-0 group focus-visible:outline-none focus-visible:bg-surface-soft rounded-[6px]"
    >
      <p className="text-[13.5px] font-bold text-job-navy group-hover:text-job-navy transition-colors truncate">
        {job.title} — {job.company}
      </p>
      <p className="text-[12px] text-muted mt-0.5 truncate">
        {job.areaLabel} · {job.salaryDisplay} · {job.distanceKm} km
      </p>
    </Link>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */

export default function JobDetailPage() {
  const params = useParams();
  const key = String(params.id);
  /* Falls back to the deck's hero job so a stale link still renders a page. */
  const job = findJob(key) ?? JOBS[0];
  const detail = jobDetail(job);
  const meta = categoryMeta(job.category);
  const coords = jobCoords(job);

  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);

  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`;

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Jobs", href: "/jobs" },
        { label: meta.short, href: `/jobs/search?category=${job.category}` },
        { label: job.areaLabel },
        { label: job.title },
      ]}
    >
      {/* On phones the sticky apply bar (~68px) sits above the BottomNav
          (56px), so 112px of padding left content underneath both. */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-7 items-start pb-32 md:pb-28 lg:pb-8">
        {/* ── Main column ─────────────────────────────────────────── */}
        <div className="min-w-0">
          {/* Cover band — colour and type only, no photography. Kept slim so
              the facts strip stays above the fold; salary and shift are what
              this page exists to answer first. */}
          <div
            className="relative h-[120px] md:h-[140px] rounded-[16px] overflow-hidden"
            style={{ background: `linear-gradient(120deg,${SALARY_INK} 0%,#1b2749 58%,${SALARY_INK} 100%)` }}
          >
            {/* Fine diagonal ruling gives the flat field texture at close
                range without reading as a pattern from a distance. */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: "repeating-linear-gradient(115deg,rgba(252,219,50,.09) 0 2px,transparent 2px 15px)" }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-16 w-64 h-64 rounded-full"
              style={{ background: "radial-gradient(circle,rgba(252,219,50,.24),transparent 70%)" }}
            />
            {/* The category set as an oversized ghost word — the graphic that
                replaces the photo, and it still tells you what this role is. */}
            <span
              aria-hidden="true"
              className="absolute -right-2 top-1/2 -translate-y-1/2 font-extrabold uppercase leading-none tracking-tight text-white/[0.07] text-[clamp(52px,11vw,96px)] select-none"
            >
              {meta.short}
            </span>

            <p className="absolute left-4 bottom-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/85">
              <span className="inline-block w-5 h-[3px] rounded-full align-middle mr-2" style={{ background: SUN }} aria-hidden="true" />
              Where you&apos;ll work · {job.areaLabel}
            </p>
          </div>

          <div className="flex items-start gap-4 -mt-7 relative">
            <div className="w-14 h-14 rounded-[14px] bg-canvas ring-4 ring-canvas flex items-center justify-center text-[20px] font-bold text-muted shrink-0 shadow-airbnb">
              {job.logo}
            </div>
            <div className="min-w-0 pt-8">
              <h1 className="text-[22px] md:text-[25px] font-bold text-job-navy leading-tight">{job.title}</h1>
              <p className="text-[14px] text-body mt-1">
                {job.company} · {job.areaLabel} · <VerifiedBadge verified={detail.verified} />
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3.5">
            <span
              className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full"
              style={{ color: meta.color, background: meta.tint }}
            >
              {meta.short}
            </span>
            {job.urgent && <Chip label="Urgent hiring" tone="urgent" />}
            {job.walkIn && <Chip label="Walk-in OK" />}
            {job.workFromHome && <Chip label="Work from home" />}
          </div>

          {/* ① Facts strip */}
          <div className="flex flex-wrap gap-2.5 mt-5">
            <Fact label="Salary" value={job.salaryDisplay} />
            <Fact label="Shift" value={job.shiftLabel} />
            <Fact label="Experience" value={detail.experience} />
            <Fact label="Openings" value={`${detail.openings} position${detail.openings === 1 ? "" : "s"}`} />
          </div>

          <section className="mt-7">
            <h2 className="text-[17px] font-bold text-job-navy mb-2">About this job</h2>
            <p className="text-[14.5px] text-body leading-relaxed">{detail.about}</p>
          </section>

          <section className="mt-6">
            <h2 className="text-[17px] font-bold text-job-navy mb-2">Requirements</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-[14.5px] text-body">
              {detail.requirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-[17px] font-bold text-job-navy mb-2">Pay &amp; benefits</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-[14.5px] text-body">
              {detail.benefits.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>

          {/* ④ Mini-map + directions */}
          <section className="mt-6">
            <h2 className="text-[17px] font-bold text-job-navy mb-2">Location</h2>
            <div className="h-[220px] rounded-[14px] overflow-hidden border border-hairline">
              <JobsMap jobs={[job]} center={coords} zoom={15} interactive={false} />
            </div>
            <p className="text-[13px] text-muted mt-2">
              {detail.address} · {job.distanceKm} km from you ·{" "}
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-job-navy hover:underline"
              >
                Get directions
              </a>
            </p>
          </section>

          {/* ⑤ Similar jobs — sidebar on desktop, inline section on mobile */}
          <section className="lg:hidden mt-7">
            <h2 className="text-[17px] font-bold text-job-navy mb-1">Similar jobs nearby</h2>
            {similarJobs(job).map((j) => (
              <SimilarJob key={j.id} job={j} />
            ))}
          </section>
        </div>

        {/* ── ② Sticky apply card (desktop) ───────────────────────── */}
        <div className="hidden lg:block sticky top-6 space-y-4">
          <div className="border border-hairline rounded-[16px] p-5 shadow-airbnb">
            <p className="text-[24px] font-bold" style={{ color: SALARY_INK }}>
              {job.salaryDisplay}
            </p>
            <p className="text-[12.5px] text-muted mt-0.5">{salaryPeriod(job)}</p>

            <button
              type="button"
              onClick={() => setApplied(true)}
              disabled={applied}
              className={`w-full h-12 mt-4 text-[15px] font-bold text-job-navy rounded-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2 ${
                applied ? "bg-job-sun-soft" : "bg-job-sun hover:bg-job-sun-active"
              }`}
            >
              {applied ? "Applied ✓" : "Apply now — 1 tap"}
            </button>

            <a
              href="tel:+918000000000"
              className="w-full h-11 mt-2.5 flex items-center justify-center gap-2 text-[14px] font-semibold text-job-navy border border-hairline rounded-[10px] hover:border-job-navy transition-colors"
            >
              📞 Call HR
            </a>

            <button
              type="button"
              onClick={() => setSaved(!saved)}
              aria-pressed={saved}
              className="w-full h-11 mt-2.5 flex items-center justify-center gap-2 text-[14px] font-semibold text-job-navy border border-hairline rounded-[10px] hover:border-job-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy"
            >
              {saved ? "♥ Saved" : "♡ Save for later"}
            </button>

            <p className="text-[11.5px] text-muted text-center mt-3.5 leading-relaxed">
              Your profile is shared only when you apply.
              <br />
              Posted {formatPosted(job.postedHoursAgo)} · {detail.applicants} applicants · closes in{" "}
              {detail.closesInDays}d
            </p>
          </div>

          <div className="border border-hairline rounded-[16px] p-5">
            <h2 className="text-[15px] font-bold text-job-navy mb-1">Similar jobs nearby</h2>
            {similarJobs(job).map((j) => (
              <SimilarJob key={j.id} job={j} />
            ))}
          </div>
        </div>
      </div>

      {/* ── ③ Sticky apply bar (mobile) ───────────────────────────── */}
      <div className="lg:hidden fixed bottom-14 md:bottom-0 left-0 right-0 bg-canvas border-t border-hairline px-4 py-3 z-40">
        <div className="max-w-[1200px] mx-auto flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-[15px] font-bold truncate" style={{ color: SALARY_INK }}>
              {job.salaryDisplay}
            </p>
            <p className="text-[11px] text-muted">{detail.applicants} applicants</p>
          </div>
          <a
            href="tel:+918000000000"
            className="ml-auto shrink-0 h-11 px-4 flex items-center gap-1.5 text-[14px] font-semibold text-job-navy border border-hairline rounded-[10px]"
          >
            📞 Call
          </a>
          <button
            type="button"
            onClick={() => setApplied(true)}
            disabled={applied}
            className={`shrink-0 h-11 px-6 text-[14px] font-bold text-job-navy rounded-[10px] transition-colors ${
              applied ? "bg-job-sun-soft" : "bg-job-sun hover:bg-job-sun-active"
            }`}
          >
            {applied ? "Applied ✓" : "Apply now"}
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
