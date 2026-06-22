"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageLayout from "../../components/PageLayout";

const jobs: Record<string, {
  title: string; company: string; location: string; type: string;
  salary: string; posted: string; skills: string[]; about: string; resp: string[];
}> = {
  "1": { title: "Frontend Developer", company: "Flipkart", location: "Koramangala, Bengaluru", type: "Full-time", salary: "₹8–12 LPA", posted: "2 days ago", skills: ["React", "TypeScript", "CSS", "Next.js"], about: "Flipkart is India's leading e-commerce marketplace. We're looking for a frontend developer to build delightful shopping experiences.", resp: ["Build responsive UI with React & TypeScript", "Collaborate with designers and backend engineers", "Optimise web performance and accessibility", "Write clean, testable, maintainable code"] },
};

export default function JobDetail() {
  const params = useParams();
  const id = String(params.id);
  const job = jobs[id] ?? jobs["1"];
  const [applyOpen, setApplyOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Jobs", href: "/jobs" }, { label: job.title }]}>
      <div className="max-w-[720px]">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4 pt-2">
          <div className="w-14 h-14 bg-surface-strong rounded-[12px] flex items-center justify-center text-lg font-bold text-muted shrink-0">
            {job.company[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] font-bold text-ink leading-tight">{job.title}</h1>
            <Link href="/companies" className="text-base text-body hover:underline">{job.company}</Link>
            <p className="text-sm text-muted">{job.location} · {job.posted}</p>
          </div>
          <button onClick={() => setSaved(!saved)} aria-label="Save job" className="hover:scale-110 transition-transform">
            <svg width="22" height="22" viewBox="0 0 24 24" fill={saved ? "#ff385c" : "none"} stroke={saved ? "#ff385c" : "#6a6a6a"} strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <span className="text-sm text-ink font-semibold bg-surface-soft px-3 py-1 rounded-full">{job.salary}</span>
          <span className="text-sm text-muted bg-surface-soft px-3 py-1 rounded-full">{job.type}</span>
        </div>

        <hr className="border-hairline mb-5" />

        <h2 className="text-[18px] font-bold text-ink mb-2">About the role</h2>
        <p className="text-base text-body leading-relaxed mb-5">{job.about}</p>

        <h2 className="text-[18px] font-bold text-ink mb-2">What you&apos;ll do</h2>
        <ul className="list-disc pl-5 space-y-1.5 mb-5 text-base text-body">
          {job.resp.map((r) => <li key={r}>{r}</li>)}
        </ul>

        <h2 className="text-[18px] font-bold text-ink mb-2">Skills</h2>
        <div className="flex flex-wrap gap-2 mb-8">
          {job.skills.map((s) => (
            <span key={s} className="text-sm font-medium text-[#534AB7] bg-[#534AB7]/10 px-3 py-1 rounded-full">{s}</span>
          ))}
        </div>
      </div>

      {/* Apply bar */}
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 bg-canvas border-t border-hairline px-4 py-3 z-40">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <span className="text-base font-semibold text-ink">{job.salary}</span>
          <button
            onClick={() => !applied && setApplyOpen(true)}
            disabled={applied}
            className={`px-6 h-11 text-base font-medium rounded-[8px] transition-colors ${
              applied ? "bg-rausch-disabled text-white" : "bg-rausch text-white hover:bg-rausch-active"
            }`}
          >
            {applied ? "Applied ✓" : "Apply now"}
          </button>
        </div>
      </div>

      {/* Apply modal */}
      {applyOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setApplyOpen(false)}>
          <div className="bg-canvas rounded-[14px] w-full max-w-[440px] p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[18px] font-bold text-ink mb-4">Apply to {job.title}</h2>
            <label className="text-[13px] text-muted block mb-1.5">Resume</label>
            <div className="flex items-center justify-between border border-hairline rounded-[8px] px-3 py-2.5 mb-4">
              <span className="text-sm text-body">Aditya_Sharma_Resume.pdf</span>
              <button className="text-sm text-rausch font-medium">Change</button>
            </div>
            <label className="text-[13px] text-muted block mb-1.5">Cover note (optional)</label>
            <textarea rows={3} placeholder="Why are you a great fit?" className="w-full border border-hairline rounded-[8px] px-3 py-2.5 text-sm text-ink outline-none focus:border-ink focus:border-2 resize-none mb-5 bg-canvas" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setApplyOpen(false)} className="text-sm text-muted hover:text-ink">Cancel</button>
              <button
                onClick={() => { setApplied(true); setApplyOpen(false); }}
                className="px-6 py-2 text-sm font-medium text-white bg-rausch rounded-[8px] hover:bg-rausch-active transition-colors"
              >
                Submit application
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
