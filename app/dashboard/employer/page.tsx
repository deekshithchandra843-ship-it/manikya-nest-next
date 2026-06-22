"use client";
import { useState } from "react";
import PageLayout from "../../components/PageLayout";

interface Post { id: number; title: string; applicants: number; status: "Open" | "Closed"; posted: string; }

const initialPosts: Post[] = [
  { id: 1, title: "Frontend Developer", applicants: 32, status: "Open", posted: "2d ago" },
  { id: 4, title: "Backend Engineer", applicants: 17, status: "Open", posted: "3d ago" },
  { id: 9, title: "QA Intern", applicants: 8, status: "Closed", posted: "3w ago" },
];

const applicants = [
  { name: "Aditya Sharma", role: "Frontend Developer", exp: "2 yrs", match: 92, stage: "New" },
  { name: "Neha Reddy", role: "Frontend Developer", exp: "3 yrs", match: 87, stage: "Shortlisted" },
  { name: "Rahul Verma", role: "Backend Engineer", exp: "1 yr", match: 74, stage: "New" },
];

const stageStyle: Record<string, string> = {
  New: "text-[#534AB7] bg-[#534AB7]/10",
  Shortlisted: "text-green-700 bg-green-100",
};

export default function EmployerDashboard() {
  const [posts, setPosts] = useState(initialPosts);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  const addPost = () => {
    if (!title.trim()) return;
    setPosts((p) => [{ id: Date.now(), title, applicants: 0, status: "Open", posted: "just now" }, ...p]);
    setTitle("");
    setOpen(false);
  };

  return (
    <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Employer dashboard" }]}>
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-[21px] font-bold text-ink">Employer dashboard</h1>
        <button onClick={() => setOpen(true)} className="text-sm font-medium text-white bg-rausch rounded-[8px] px-4 py-2 hover:bg-rausch-active transition-colors">
          + Post a job
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { value: posts.filter((p) => p.status === "Open").length, label: "Open roles" },
          { value: posts.reduce((s, p) => s + p.applicants, 0), label: "Applicants" },
          { value: applicants.filter((a) => a.stage === "Shortlisted").length, label: "Shortlisted" },
        ].map((s) => (
          <div key={s.label} className="bg-surface-soft rounded-[14px] p-4">
            <p className="text-2xl font-bold text-ink">{s.value}</p>
            <p className="text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-[18px] font-bold text-ink mb-3">My job posts</h2>
      <div className="space-y-3 mb-8">
        {posts.map((p) => (
          <div key={p.id} className="bg-canvas border border-hairline rounded-[14px] p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-ink">{p.title}</h3>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${p.status === "Open" ? "text-green-700 bg-green-100" : "text-muted bg-surface-strong"}`}>{p.status}</span>
              </div>
              <p className="text-sm text-muted">{p.applicants} applicants · {p.posted}</p>
            </div>
            <button className="text-sm font-medium text-ink border border-hairline rounded-[8px] px-3 py-1.5 hover:bg-surface-soft transition-colors">View</button>
          </div>
        ))}
      </div>

      <h2 className="text-[18px] font-bold text-ink mb-3">Candidate discovery</h2>
      <div className="space-y-3">
        {applicants.map((a, i) => (
          <div key={i} className="bg-canvas border border-hairline rounded-[14px] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rausch/10 flex items-center justify-center text-sm font-semibold text-rausch shrink-0">
              {a.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-ink">{a.name}</p>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${stageStyle[a.stage]}`}>{a.stage}</span>
              </div>
              <p className="text-[13px] text-muted">{a.role} · {a.exp}</p>
            </div>
            <span className="text-sm font-semibold text-rausch shrink-0">{a.match}% match</span>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="bg-canvas rounded-[14px] w-full max-w-[420px] p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[18px] font-bold text-ink mb-4">Post a job</h2>
            <label className="text-[13px] text-muted block mb-1.5">Job title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Frontend Developer" className="w-full border border-hairline rounded-[8px] px-3 h-12 text-sm text-ink outline-none focus:border-ink focus:border-2 mb-4 bg-canvas" />
            <label className="text-[13px] text-muted block mb-1.5">Description</label>
            <textarea rows={3} placeholder="Role summary…" className="w-full border border-hairline rounded-[8px] px-3 py-2.5 text-sm text-ink outline-none focus:border-ink focus:border-2 resize-none mb-5 bg-canvas" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setOpen(false)} className="text-sm text-muted hover:text-ink">Cancel</button>
              <button onClick={addPost} className="px-6 py-2 text-sm font-medium text-white bg-rausch rounded-[8px] hover:bg-rausch-active transition-colors">Publish</button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
