"use client";
import { useState } from "react";
import Link from "next/link";
import PageLayout from "../../components/PageLayout";

interface Listing {
  id: number; title: string; price: string; status: "Active" | "Pending" | "Paused"; views: number; leads: number;
}

const initial: Listing[] = [
  { id: 1, title: "Green Meadows PG for Men", price: "₹8,500/mo", status: "Active", views: 1240, leads: 18 },
  { id: 5, title: "Urban Nest 2BHK", price: "₹22,000/mo", status: "Pending", views: 0, leads: 0 },
  { id: 8, title: "Elite Co-living Studio", price: "₹14,500/mo", status: "Paused", views: 320, leads: 4 },
];

const leads = [
  { name: "Priya M.", listing: "Green Meadows PG", when: "2h ago", note: "Is the room available from 1st July?" },
  { name: "Arjun K.", listing: "Green Meadows PG", when: "Yesterday", note: "Can I schedule a visit this weekend?" },
];

const statusStyle: Record<Listing["status"], string> = {
  Active: "text-green-700 bg-green-100",
  Pending: "text-amber-700 bg-amber-100",
  Paused: "text-muted bg-surface-strong",
};

export default function OwnerDashboard() {
  const [listings, setListings] = useState(initial);

  const remove = (id: number) => setListings((p) => p.filter((l) => l.id !== id));

  return (
    <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Owner dashboard" }]}>
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-[21px] font-bold text-ink">Owner dashboard</h1>
        <Link href="/post" className="text-sm font-medium text-white bg-rausch rounded-[8px] px-4 py-2 hover:bg-rausch-active transition-colors">
          + Add listing
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { value: listings.length, label: "Listings" },
          { value: listings.filter((l) => l.status === "Active").length, label: "Active" },
          { value: listings.reduce((s, l) => s + l.views, 0).toLocaleString("en-IN"), label: "Total views" },
          { value: listings.reduce((s, l) => s + l.leads, 0), label: "Leads" },
        ].map((s) => (
          <div key={s.label} className="bg-surface-soft rounded-[14px] p-4">
            <p className="text-2xl font-bold text-ink">{s.value}</p>
            <p className="text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* My listings */}
      <h2 className="text-[18px] font-bold text-ink mb-3">My listings</h2>
      <div className="space-y-3 mb-8">
        {listings.map((l) => (
          <div key={l.id} className="bg-canvas border border-hairline rounded-[14px] p-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-surface-strong rounded-[10px] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-ink truncate">{l.title}</h3>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusStyle[l.status]}`}>{l.status}</span>
              </div>
              <p className="text-sm text-muted">{l.price} · {l.views.toLocaleString("en-IN")} views · {l.leads} leads</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/listing/${l.id}`} className="text-sm font-medium text-ink border border-hairline rounded-[8px] px-3 py-1.5 hover:bg-surface-soft transition-colors">Edit</Link>
              <button onClick={() => remove(l.id)} className="text-sm font-medium text-error border border-hairline rounded-[8px] px-3 py-1.5 hover:bg-surface-soft transition-colors">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Leads */}
      <h2 className="text-[18px] font-bold text-ink mb-3">Recent enquiries</h2>
      <div className="space-y-3">
        {leads.map((ld, i) => (
          <div key={i} className="bg-canvas border border-hairline rounded-[14px] p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-ink">{ld.name} <span className="font-normal text-muted">· {ld.listing}</span></p>
              <span className="text-[12px] text-muted">{ld.when}</span>
            </div>
            <p className="text-sm text-body mb-3">{ld.note}</p>
            <button className="text-sm font-medium text-white bg-rausch rounded-[8px] px-4 py-1.5 hover:bg-rausch-active transition-colors">Reply</button>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
