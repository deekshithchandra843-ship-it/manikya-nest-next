"use client";
import { useState } from "react";
import { Card, SectionLabel } from "./ui";

const TOGGLES = [
  { label: "New nests in my areas", defaultOn: true },
  { label: "Job alerts", defaultOn: true },
  { label: "Push notifications", defaultOn: false },
];

/** Notification toggles — one common set for every member. */
export default function NotificationsBlock() {
  const [on, setOn] = useState<boolean[]>(TOGGLES.map((t) => t.defaultOn));

  return (
    <section>
      <SectionLabel>Notifications</SectionLabel>
      <Card className="overflow-hidden">
        {TOGGLES.map((t, i) => (
          <div
            key={t.label}
            className={`w-full flex items-center justify-between px-4 py-3 ${
              i < TOGGLES.length - 1 ? "border-b border-hairline-soft" : ""
            }`}
          >
            <span className="text-sm text-body">{t.label}</span>
            <button
              role="switch"
              aria-checked={on[i]}
              aria-label={t.label}
              onClick={() => setOn((prev) => prev.map((v, j) => (j === i ? !v : v)))}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
                on[i] ? "bg-rausch" : "bg-surface-strong"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  on[i] ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        ))}
      </Card>
    </section>
  );
}
