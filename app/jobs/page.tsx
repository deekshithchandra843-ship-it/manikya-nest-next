"use client";
import { useState } from "react";
import Link from "next/link";
import PageLayout from "../components/PageLayout";

const filters = ["All", "Full-time", "Internship", "Freelance", "Remote", "0–2 yrs", "Fresher"];

/** In-page sections — the Jobs hub is the single home for everything work-related. */
const sections = [
  { id: "roles", label: "Open roles" },
  { id: "upskill", label: "Upskill" },
  { id: "community", label: "Community" },
];

const jobsData = [
  { id: 1, title: "Frontend Developer", company: "Flipkart", location: "Koramangala, Bengaluru", type: "Full-time", skills: ["React", "TypeScript", "CSS"], salary: "₹8–12 LPA", posted: "2d ago" },
  { id: 2, title: "Product Design Intern", company: "Swiggy", location: "Outer Ring Road, Bengaluru", type: "Internship", skills: ["Figma", "UX Research"], salary: "₹25k/mo", posted: "5d ago" },
  { id: 3, title: "Data Analyst", company: "Razorpay", location: "Domlur, Bengaluru", type: "Full-time", skills: ["Python", "SQL", "Tableau"], salary: "₹6–9 LPA", posted: "1w ago" },
  { id: 4, title: "Backend Engineer", company: "Zerodha", location: "JP Nagar, Bengaluru", type: "Full-time", skills: ["Node.js", "PostgreSQL"], salary: "₹10–16 LPA", posted: "3d ago" },
  { id: 5, title: "Content Writer (Freelance)", company: "Dunzo", location: "Remote", type: "Freelance", skills: ["SEO", "Copywriting"], salary: "₹800/article", posted: "1d ago" },
];

const salaryInsights = [
  { role: "Frontend Developer", range: "₹6–14 LPA", median: "₹9.5 LPA" },
  { role: "Data Analyst", range: "₹5–11 LPA", median: "₹7 LPA" },
  { role: "Backend Engineer", range: "₹8–20 LPA", median: "₹13 LPA" },
];

const courses = [
  { title: "React for Beginners", duration: "4 weeks · Online", badge: "Free", badgeColor: "bg-green-100 text-green-700" },
  { title: "Data Science Bootcamp", duration: "12 weeks · Live", badge: "Paid", badgeColor: "bg-amber-100 text-amber-700" },
  { title: "UI/UX Design Fundamentals", duration: "6 weeks · Self-paced", badge: "Free", badgeColor: "bg-green-100 text-green-700" },
];

const events = [
  { name: "Bengaluru Startup Meetup", date: "15 Jun 2026", location: "HSR Layout, Bengaluru" },
  { name: "Women in Tech Networking", date: "22 Jun 2026", location: "Indiranagar, Bengaluru" },
  { name: "Code & Coffee Weekend", date: "28 Jun 2026", location: "Koramangala, Bengaluru" },
];

const sectionHeading = "text-[19px] md:text-[22px] font-bold tracking-tight text-ink";
const skillChip = "text-[12px] font-medium text-[#534AB7] bg-[#534AB7]/10 px-2 py-0.5 rounded-full";

export default function JobsPage() {
  const [active, setActive] = useState("All");
  const [saved, setSaved] = useState<number[]>([]);
  const [alertOn, setAlertOn] = useState(false);

  const toggleSave = (id: number) =>
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const shown = active === "All" ? jobsData : jobsData.filter((j) => j.type === active || (active === "Remote" && j.location === "Remote"));

  return (
    <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Jobs" }]}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-1 pt-2">
        <div>
          <h1 className="text-[24px] md:text-[28px] font-bold tracking-tight text-ink">Jobs near your nest</h1>
          <p className="text-sm text-muted mt-0.5">Roles, upskilling and your city network — all in one place.</p>
        </div>
        <Link href="/post" className="shrink-0 text-sm text-ink font-medium underline">Post a job</Link>
      </div>

      {/* Section nav — jump to any part of the Jobs hub */}
      <nav aria-label="Jobs sections" className="flex gap-2 overflow-x-auto scrollbar-hide py-4 mb-2">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="whitespace-nowrap px-4 py-1.5 text-sm font-semibold rounded-full bg-surface-soft text-ink hover:bg-rausch hover:text-white transition-colors"
          >
            {s.label}
          </a>
        ))}
      </nav>

      {/* ── Open roles ───────────────────────────────────────────── */}
      <section id="roles" className="scroll-mt-24 mb-12">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input className="flex-1 border border-hairline rounded-[8px] h-12 px-4 text-sm text-ink outline-none focus:border-ink focus:border-2 bg-canvas" placeholder="Role, company or skill" />
          <input className="sm:w-56 border border-hairline rounded-[8px] h-12 px-4 text-sm text-ink outline-none focus:border-ink focus:border-2 bg-canvas" placeholder="Location" defaultValue="Bengaluru" />
          <button className="h-12 px-6 bg-rausch text-white text-sm font-medium rounded-[8px] hover:bg-rausch-active transition-colors">Search</button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                active === f ? "bg-rausch/10 border-rausch text-rausch" : "bg-canvas border-hairline text-muted hover:border-ink"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Job alerts banner */}
        <div className="flex items-center justify-between bg-surface-soft rounded-[14px] px-4 py-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔔</span>
            <p className="text-sm text-body">Get notified about new {active !== "All" ? active.toLowerCase() : ""} jobs in Bengaluru</p>
          </div>
          <button
            onClick={() => setAlertOn(!alertOn)}
            className={`shrink-0 text-sm font-medium px-4 py-1.5 rounded-full border transition-colors ${
              alertOn ? "bg-rausch text-white border-rausch" : "border-ink text-ink hover:bg-canvas"
            }`}
          >
            {alertOn ? "Alert on ✓" : "Create alert"}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Job list */}
          <div className="md:col-span-2 grid grid-cols-1 gap-4">
            {shown.map((job) => (
              <div key={job.id} className="bg-canvas border border-hairline rounded-[14px] p-4 hover:shadow-airbnb transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 bg-surface-strong rounded-[10px] flex items-center justify-center text-sm font-bold text-muted shrink-0">
                    {job.company[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/jobs/${job.id}`} className="min-w-0">
                        <h3 className="text-base font-semibold text-ink truncate hover:underline">{job.title}</h3>
                        <p className="text-sm text-muted">{job.company} · {job.location}</p>
                      </Link>
                      <button onClick={() => toggleSave(job.id)} aria-label="Save job" className="shrink-0 hover:scale-110 transition-transform">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={saved.includes(job.id) ? "#ff385c" : "none"} stroke={saved.includes(job.id) ? "#ff385c" : "#6a6a6a"} strokeWidth="2">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-[12px] text-muted bg-surface-soft px-2 py-0.5 rounded-full">{job.type}</span>
                      {job.skills.map((s) => (
                        <span key={s} className={skillChip}>{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[15px] font-semibold text-ink">{job.salary}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] text-muted">{job.posted}</span>
                        <Link href={`/jobs/${job.id}`} className="text-sm font-medium text-white bg-rausch rounded-[8px] px-4 py-1.5 hover:bg-rausch-active transition-colors">Apply</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Salary insights sidebar */}
          <aside className="hidden md:block">
            <div className="bg-canvas border border-hairline rounded-[14px] p-4 sticky top-24">
              <h2 className="text-base font-semibold text-ink mb-1">Salary insights</h2>
              <p className="text-[13px] text-muted mb-4">Bengaluru · 0–3 yrs experience</p>
              <div className="space-y-4">
                {salaryInsights.map((s) => (
                  <div key={s.role}>
                    <p className="text-sm font-medium text-ink">{s.role}</p>
                    <div className="flex items-center justify-between text-[13px] text-muted">
                      <span>{s.range}</span>
                      <span className="text-rausch font-medium">med {s.median}</span>
                    </div>
                    <div className="h-1.5 bg-surface-strong rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-rausch rounded-full" style={{ width: "60%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
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
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${course.badgeColor}`}>{course.badge}</span>
              <h3 className="text-base font-semibold text-ink mt-2.5 mb-1">{course.title}</h3>
              <p className="text-[13px] text-muted mb-4">{course.duration}</p>
              <button className="w-full h-10 text-sm font-medium text-white bg-rausch rounded-[8px] hover:bg-rausch-active transition-colors">Enroll</button>
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
              <button className="px-4 h-9 text-sm font-medium text-ink border border-ink rounded-[8px] hover:bg-surface-soft transition-colors">Join</button>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
