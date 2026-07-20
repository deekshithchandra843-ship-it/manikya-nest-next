"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";

/* ------------------------------------------------------------------ *
 * Jobs hub — "Spotlight" direction.
 * A bold dark editorial hero (headline + glass search + live stats),
 * a raised spotlight for the top-matched role, then clean white cards.
 * ------------------------------------------------------------------ */

const filters = ["All", "Full-time", "Internship", "Freelance", "Remote", "0–2 yrs", "Fresher"];

const sections = [
  { id: "roles", label: "Open roles" },
  { id: "upskill", label: "Upskill" },
  { id: "community", label: "Community" },
];

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  mode: "On-site" | "Hybrid" | "Remote";
  type: string;
  experience: string;
  skills: string[];
  salary: string;
  posted: string;
  match: number;
  applicants: number;
}

const jobsData: Job[] = [
  { id: 1, title: "Frontend Developer", company: "Flipkart", location: "Koramangala, Bengaluru", mode: "Hybrid", type: "Full-time", experience: "1–3 yrs", skills: ["React", "TypeScript", "Next.js"], salary: "₹8–12 LPA", posted: "2d ago", match: 92, applicants: 48 },
  { id: 4, title: "Backend Engineer", company: "Zerodha", location: "JP Nagar, Bengaluru", mode: "On-site", type: "Full-time", experience: "2–4 yrs", skills: ["Node.js", "PostgreSQL", "Redis"], salary: "₹10–16 LPA", posted: "3d ago", match: 84, applicants: 37 },
  { id: 2, title: "Product Design Intern", company: "Swiggy", location: "Outer Ring Road, Bengaluru", mode: "On-site", type: "Internship", experience: "Fresher", skills: ["Figma", "UX Research"], salary: "₹25k/mo", posted: "5d ago", match: 78, applicants: 120 },
  { id: 3, title: "Data Analyst", company: "Razorpay", location: "Domlur, Bengaluru", mode: "Hybrid", type: "Full-time", experience: "0–2 yrs", skills: ["Python", "SQL", "Tableau"], salary: "₹6–9 LPA", posted: "1w ago", match: 71, applicants: 63 },
  { id: 5, title: "Content Writer", company: "Dunzo", location: "Remote", mode: "Remote", type: "Freelance", experience: "0–2 yrs", skills: ["SEO", "Copywriting"], salary: "₹800/article", posted: "1d ago", match: 66, applicants: 92 },
];

const salaryInsights = [
  { role: "Frontend Developer", range: "₹6–14 LPA", pct: 68 },
  { role: "Data Analyst", range: "₹5–11 LPA", pct: 50 },
  { role: "Backend Engineer", range: "₹8–20 LPA", pct: 82 },
];

const courses = [
  { title: "React for Beginners", duration: "4 weeks · Online", badge: "Free", free: true },
  { title: "Data Science Bootcamp", duration: "12 weeks · Live", badge: "Paid", free: false },
  { title: "UI/UX Design Fundamentals", duration: "6 weeks · Self-paced", badge: "Free", free: true },
];

const events = [
  { name: "Bengaluru Startup Meetup", date: "15 Jun 2026", location: "HSR Layout, Bengaluru" },
  { name: "Women in Tech Networking", date: "22 Jun 2026", location: "Indiranagar, Bengaluru" },
  { name: "Code & Coffee Weekend", date: "28 Jun 2026", location: "Koramangala, Bengaluru" },
];

const sectionHeading = "text-[19px] md:text-[22px] font-bold tracking-tight text-ink";
const skillChip = "text-[12px] font-medium text-[#534AB7] bg-[#534AB7]/10 px-2.5 py-0.5 rounded-full";

function matchStyle(score: number) {
  if (score >= 85) return "bg-emerald/10 text-emerald";
  if (score >= 70) return "bg-amber-400/15 text-amber-700";
  return "bg-surface-strong text-muted";
}

function CompanyLogo({ name, className = "w-11 h-11 text-sm rounded-[10px]" }: { name: string; className?: string }) {
  return (
    <div className={`${className} bg-surface-strong flex items-center justify-center font-bold text-ink shrink-0`} aria-hidden="true">
      {name[0]}
    </div>
  );
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return <span className="text-[12px] font-medium text-body bg-surface-soft px-2.5 py-1 rounded-full whitespace-nowrap">{children}</span>;
}

function SaveButton({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? "Unsave job" : "Save job"}
      aria-pressed={saved}
      className="shrink-0 p-1.5 rounded-full hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "#ff385c" : "none"} stroke={saved ? "#ff385c" : "currentColor"} strokeWidth="2" className="text-muted">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
    </button>
  );
}

/* ── Regular job card (grid) ──────────────────────────────────────── */
function JobCard({ job, saved, applied, onSave, onApply }: {
  job: Job; saved: boolean; applied: boolean; onSave: () => void; onApply: () => void;
}) {
  return (
    <div className="group bg-canvas border border-hairline rounded-[16px] p-5 hover:shadow-airbnb hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start gap-3">
        <CompanyLogo name={job.company} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/jobs/${job.id}`} className="min-w-0 focus-visible:outline-none">
              <h3 className="text-[15px] font-semibold text-ink truncate group-hover:underline">{job.title}</h3>
              <p className="text-[13px] text-muted truncate">{job.company} · {job.location}</p>
            </Link>
            <SaveButton saved={saved} onClick={onSave} />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${matchStyle(job.match)}`}>● {job.match}% match</span>
            <MetaChip>{job.type}</MetaChip>
            <MetaChip>{job.mode}</MetaChip>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {job.skills.map((s) => <span key={s} className={skillChip}>{s}</span>)}
          </div>
          <div className="flex items-center justify-between mt-4">
            <div>
              <span className="text-[15px] font-semibold text-ink">{job.salary}</span>
              <span className="text-[12px] text-muted ml-2">{job.posted}</span>
            </div>
            <button
              type="button"
              onClick={onApply}
              disabled={applied}
              className="text-sm font-semibold text-white bg-rausch rounded-[9px] px-4 py-1.5 hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {applied ? "Applied ✓" : "Apply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Every word typed must appear somewhere on the job. */
function jobMatchesQuery(job: Job, query: string): boolean {
  const terms = query.toLowerCase().split(/[\s,]+/).filter((t) => t.length > 1);
  if (!terms.length) return true;
  const haystack = [
    job.title, job.company, job.location, job.mode, job.type, job.experience, ...job.skills,
  ].join(" ").toLowerCase();
  return terms.every((t) => haystack.includes(t));
}

function jobMatchesLocation(job: Job, place: string): boolean {
  const p = place.trim().toLowerCase();
  if (!p) return true;
  // Remote roles are location-agnostic, so they always qualify.
  return job.mode === "Remote" || job.location.toLowerCase().includes(p);
}

function JobsPageContent() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState("All");
  const [saved, setSaved] = useState<number[]>([]);
  const [applied, setApplied] = useState<number[]>([]);
  const [alertOn, setAlertOn] = useState(false);
  // Seeded from the URL so the home-page search box actually lands on results.
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [place, setPlace] = useState(() => searchParams.get("location") ?? "Bengaluru");
  const [submitted, setSubmitted] = useState(() => ({
    query: searchParams.get("q") ?? "",
    place: searchParams.get("location") ?? "Bengaluru",
  }));

  const runSearch = () => setSubmitted({ query, place });

  const shown = useMemo(
    () =>
      jobsData
        .filter((j) => active === "All" || j.type === active || (active === "Remote" && j.mode === "Remote"))
        .filter((j) => jobMatchesQuery(j, submitted.query))
        .filter((j) => jobMatchesLocation(j, submitted.place)),
    [active, submitted]
  );

  // Spotlight = the strongest match in the current set; the rest fill the grid.
  const spotlight = useMemo(() => (shown.length ? [...shown].sort((a, b) => b.match - a.match)[0] : null), [shown]);
  const rest = useMemo(() => shown.filter((j) => j.id !== spotlight?.id), [shown, spotlight]);

  const toggleSave = (id: number) =>
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const apply = (id: number) =>
    setApplied((prev) => (prev.includes(id) ? prev : [...prev, id]));

  return (
    <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Jobs" }]}>
      {/* ── Spotlight hero ───────────────────────────────────────── */}
      <section
        aria-label="Find jobs"
        className="relative overflow-hidden -mx-4 md:-mx-6 lg:-mx-10 px-4 md:px-6 lg:px-10 pt-10 md:pt-12 pb-24 md:pb-28 rounded-b-[28px]"
        style={{ background: "linear-gradient(135deg,#1a1720 0%,#2a1e29 45%,#3a1f2b 100%)" }}
      >
        {/* brand glow */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-10 w-72 h-72 rounded-full" style={{ background: "radial-gradient(circle,rgba(255,56,92,.45),transparent 70%)" }} />
        <div className="relative max-w-[900px] mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "#f6b8c2" }}>Work near your nest</p>
          <h1 className="text-white font-extrabold tracking-tight leading-[1.05] mt-2.5 text-[clamp(28px,5vw,42px)] max-w-[18ch] text-balance">
            Land a role a short commute from home
          </h1>
          <p className="text-[14px] md:text-[15px] mt-2.5" style={{ color: "#d9cdd4" }}>
            Bengaluru’s jobs, matched to where you live — with the pay and skills up front.
          </p>

          {/* Glass search */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2 max-w-[560px] bg-white/10 border border-white/20 backdrop-blur-md rounded-[14px] p-2">
            <div className="relative flex-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" aria-hidden="true">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="w-full h-11 pl-10 pr-3 rounded-[10px] bg-transparent text-white text-sm placeholder:text-white/55 outline-none focus:bg-white/10 transition-colors"
                placeholder="Role, company or skill"
                aria-label="Search role, company or skill"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
              />
            </div>
            <input
              className="sm:w-40 h-11 px-3 rounded-[10px] bg-transparent text-white text-sm placeholder:text-white/55 outline-none focus:bg-white/10 transition-colors"
              placeholder="Location"
              aria-label="Location"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
            />
            <button
              type="button"
              onClick={runSearch}
              className="h-11 px-6 bg-rausch text-white text-sm font-semibold rounded-[10px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Search
            </button>
          </div>

          {/* Live stats */}
          <div className="flex gap-7 md:gap-9 mt-6">
            {[
              { n: jobsData.length * 26, l: "open roles" },
              { n: 15, l: "companies hiring" },
              { n: `${spotlight?.match ?? 0}%`, l: "top match today" },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-white text-[20px] md:text-[22px] font-extrabold tabular-nums">{s.n}</p>
                <p className="text-[11px]" style={{ color: "#b9adb4" }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Raised spotlight job ─────────────────────────────────── */}
      {spotlight && (
        <div className="relative z-10 -mt-14 md:-mt-16 mb-2 max-w-[900px] mx-auto">
          <div className="bg-canvas border border-hairline rounded-[18px] shadow-airbnb p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rausch bg-rausch/10 px-2.5 py-1 rounded-full">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                Spotlight
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${matchStyle(spotlight.match)}`}>● {spotlight.match}% match</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <CompanyLogo name={spotlight.company} className="w-14 h-14 text-xl rounded-[14px]" />
              <div className="flex-1 min-w-0">
                <Link href={`/jobs/${spotlight.id}`}>
                  <h2 className="text-[18px] md:text-[20px] font-bold text-ink tracking-tight hover:underline">{spotlight.title}</h2>
                </Link>
                <p className="text-[13.5px] text-muted mt-0.5">{spotlight.company} · {spotlight.location} · {spotlight.mode}</p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {spotlight.skills.map((s) => <span key={s} className={skillChip}>{s}</span>)}
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 justify-between">
                <span className="text-[18px] font-extrabold text-ink">{spotlight.salary}</span>
                <div className="flex items-center gap-2">
                  <SaveButton saved={saved.includes(spotlight.id)} onClick={() => toggleSave(spotlight.id)} />
                  <button
                    type="button"
                    onClick={() => apply(spotlight.id)}
                    disabled={applied.includes(spotlight.id)}
                    className="h-10 px-6 text-sm font-semibold text-white bg-rausch rounded-[10px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {applied.includes(spotlight.id) ? "Applied ✓" : "Apply now"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section nav */}
      <nav aria-label="Jobs sections" className="flex gap-2 overflow-x-auto scrollbar-hide py-4 mb-2">
        {sections.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="whitespace-nowrap px-4 py-1.5 text-sm font-semibold rounded-full bg-surface-soft text-ink hover:bg-rausch hover:text-white transition-colors">
            {s.label}
          </a>
        ))}
      </nav>

      {/* ── Open roles ───────────────────────────────────────────── */}
      <section id="roles" className="scroll-mt-24 mb-12">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              aria-pressed={active === f}
              className={`whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                active === f ? "bg-rausch/10 border-rausch text-rausch" : "bg-canvas border-hairline text-muted hover:border-ink"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Alerts banner */}
        <div className="flex items-center justify-between bg-surface-soft rounded-[14px] px-4 py-3 mb-5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg shrink-0" aria-hidden="true">🔔</span>
            <p className="text-sm text-body truncate">Get notified about new {active !== "All" ? active.toLowerCase() : ""} jobs in Bengaluru</p>
          </div>
          <button
            onClick={() => setAlertOn(!alertOn)}
            aria-pressed={alertOn}
            className={`shrink-0 text-sm font-medium px-4 py-1.5 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
              alertOn ? "bg-rausch text-white border-rausch" : "border-ink text-ink hover:bg-canvas"
            }`}
          >
            {alertOn ? "Alert on ✓" : "Create alert"}
          </button>
        </div>

        <p className="text-[13px] text-muted mb-4"><span className="font-semibold text-ink">{shown.length}</span> {shown.length === 1 ? "role" : "roles"} · Bengaluru</p>

        {shown.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-hairline-soft rounded-[14px] bg-surface-soft">
            <p className="text-base font-semibold text-ink mb-1">No roles match your search</p>
            <p className="text-sm text-muted mb-4">Try a different keyword, location, or filter to see more openings.</p>
            <button
              onClick={() => {
                setActive("All");
                setQuery("");
                setPlace("");
                setSubmitted({ query: "", place: "" });
              }}
              className="px-4 py-2 text-sm font-semibold text-white bg-rausch rounded-[8px] hover:bg-rausch-active transition-colors"
            >
              Show all roles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {rest.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                saved={saved.includes(job.id)}
                applied={applied.includes(job.id)}
                onSave={() => toggleSave(job.id)}
                onApply={() => apply(job.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Salary insights */}
      <section aria-label="Salary insights" className="mb-12">
        <h2 className={`${sectionHeading} mb-4`}>Salary insights · Bengaluru</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {salaryInsights.map((s) => (
            <div key={s.role} className="bg-canvas border border-hairline rounded-[14px] p-4">
              <p className="text-sm font-semibold text-ink">{s.role}</p>
              <p className="text-[13px] text-muted mt-0.5">{s.range}</p>
              <div className="h-1.5 bg-surface-strong rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-rausch rounded-full transition-all duration-500" style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Upskill ──────────────────────────────────────────────── */}
      <section id="upskill" className="scroll-mt-24 mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className={sectionHeading}>Upskill this week</h2>
          <Link href="#" className="text-sm text-rausch font-medium hover:underline">Browse all</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.title} className="bg-canvas border border-hairline rounded-[14px] p-5 hover:shadow-airbnb transition-shadow">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${course.free ? "bg-emerald/10 text-emerald" : "bg-amber-400/15 text-amber-700"}`}>{course.badge}</span>
              <h3 className="text-base font-semibold text-ink mt-2.5 mb-1">{course.title}</h3>
              <p className="text-[13px] text-muted mb-4">{course.duration}</p>
              <button className="w-full h-10 text-sm font-semibold text-white bg-rausch rounded-[8px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2">Enroll</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Community ────────────────────────────────────────────── */}
      <section id="community" className="scroll-mt-24 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className={sectionHeading}>Your city network</h2>
          <Link href="#" className="text-sm text-rausch font-medium hover:underline">See all events</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div key={event.name} className="bg-canvas border border-hairline rounded-[14px] p-5 hover:shadow-airbnb transition-shadow">
              <h3 className="text-base font-semibold text-ink mb-1">{event.name}</h3>
              <p className="text-[13px] text-muted">{event.date}</p>
              <p className="text-[13px] text-muted mb-4">{event.location}</p>
              <button className="px-4 h-9 text-sm font-medium text-ink border border-ink rounded-[8px] hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink">Join</button>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading jobs...</div>}>
      <JobsPageContent />
    </Suspense>
  );
}
