import Link from "next/link";
import React from "react";
import { Card, RowChevron, SectionLabel } from "./ui";

export interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

/** Generic tappable-row list — used for "My Nest" and "My Next". */
export default function MenuBlock({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <section>
      <SectionLabel>{title}</SectionLabel>
      <Card className="overflow-hidden">
        {items.map((item, i) => (
          <Link
            href={item.href}
            key={item.label}
            className={`w-full flex items-center justify-between px-4 py-3 hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-inset ${
              i < items.length - 1 ? "border-b border-hairline-soft" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-muted" aria-hidden="true">{item.icon}</span>
              <span className="text-sm text-body">{item.label}</span>
            </div>
            <RowChevron />
          </Link>
        ))}
      </Card>
    </section>
  );
}
