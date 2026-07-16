import React from "react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export default function PageLayout({ children, breadcrumbs, className }: PageLayoutProps) {
  return (
    <main className={className || "max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 pb-20 md:pb-8"}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 py-3 text-xs text-muted">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-hairline" aria-hidden="true">/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-ink font-medium" aria-current="page">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      {children}
    </main>
  );
}
