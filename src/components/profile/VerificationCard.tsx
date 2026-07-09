"use client";
import type { Session } from "@/lib/auth";
import { SectionLabel } from "./ui";

interface Row { label: string; done: boolean; hint: string }

export default function VerificationCard({
  session,
  verified,
}: {
  session: Session;
  verified: boolean;
}) {
  const rows: Row[] = [
    { label: "Phone", done: Boolean(session.phone), hint: session.phone ? "Verified" : "Add number" },
    { label: "Email", done: Boolean(session.email), hint: session.email ? "Verified" : "Add email" },
    { label: "Identity (KYC)", done: verified, hint: verified ? "Verified" : "Pending" },
  ];
  const score = Math.round((rows.filter((r) => r.done).length / rows.length) * 100);

  return (
    <div>
      <SectionLabel>Trust &amp; verification</SectionLabel>
      <div className="bg-canvas border border-hairline rounded-[14px] p-4 shadow-3d-soft space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-ink">Trust score</span>
          <span className="text-sm font-extrabold text-ink">{score}%</span>
        </div>
        <div className="h-2 rounded-full bg-surface-strong overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500" style={{ width: `${score}%` }} />
        </div>
        <ul className="pt-1 space-y-2">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[13px] text-body">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center ${r.done ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {r.done ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M12 8v5m0 3h.01" /></svg>
                  )}
                </span>
                {r.label}
              </span>
              <span className={`text-[11px] font-semibold ${r.done ? "text-green-700" : "text-amber-700"}`}>{r.hint}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
