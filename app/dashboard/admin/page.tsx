"use client";
import { useState } from "react";
import PageLayout from "../../components/PageLayout";

interface Pending { id: number; title: string; type: string; owner: string; submitted: string; }

const initialPending: Pending[] = [
  { id: 5, title: "Urban Nest 2BHK", type: "Rental flat", owner: "Rajesh Kumar", submitted: "1h ago" },
  { id: 10, title: "Skyline Co-living", type: "Co-living", owner: "Meena S.", submitted: "4h ago" },
  { id: 11, title: "Budget PG near Manyata", type: "PG/Hostel", owner: "Imran A.", submitted: "Yesterday" },
];

const reports = [
  { id: 3, title: "Lakeside 1BHK Rental Flat", reason: "Suspected fake photos", reporter: "user_8821" },
  { id: 7, title: "TechPark PG", reason: "Misleading price", reporter: "user_4410" },
];

export default function AdminDashboard() {
  const [pending, setPending] = useState(initialPending);
  const resolve = (id: number) => setPending((p) => p.filter((x) => x.id !== id));

  return (
    <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Admin" }]}>
      <h1 className="text-[21px] font-bold text-ink mb-6 pt-2">Admin dashboard</h1>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { value: pending.length, label: "Pending approvals" },
          { value: reports.length, label: "Reported listings" },
          { value: "1,240", label: "Live listings" },
        ].map((s) => (
          <div key={s.label} className="bg-surface-soft rounded-[14px] p-4">
            <p className="text-2xl font-bold text-ink">{s.value}</p>
            <p className="text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-[18px] font-bold text-ink mb-3">Listing approvals</h2>
      <div className="space-y-3 mb-8">
        {pending.length === 0 && <p className="text-sm text-muted">All caught up — no listings awaiting review. 🎉</p>}
        {pending.map((p) => (
          <div key={p.id} className="bg-canvas border border-hairline rounded-[14px] p-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-surface-strong rounded-[10px] shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-ink truncate">{p.title}</h3>
              <p className="text-sm text-muted">{p.type} · {p.owner} · {p.submitted}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => resolve(p.id)} className="text-sm font-medium text-white bg-rausch rounded-[8px] px-3 py-1.5 hover:bg-rausch-active transition-colors">Approve</button>
              <button onClick={() => resolve(p.id)} className="text-sm font-medium text-error border border-hairline rounded-[8px] px-3 py-1.5 hover:bg-surface-soft transition-colors">Reject</button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-[18px] font-bold text-ink mb-3">Reported listings</h2>
      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="bg-canvas border border-hairline rounded-[14px] p-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-ink">{r.title}</h3>
              <p className="text-sm text-muted">{r.reason} · reported by {r.reporter}</p>
            </div>
            <button className="text-sm font-medium text-ink border border-hairline rounded-[8px] px-3 py-1.5 hover:bg-surface-soft transition-colors">Review</button>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
