"use client";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";

const companies = [
  { name: "Flipkart", industry: "E-commerce", location: "Bengaluru", size: "10,000+", rating: 4.2, openRoles: 24, about: "India's leading e-commerce marketplace." },
  { name: "Swiggy", industry: "Food & Delivery", location: "Bengaluru", size: "5,000+", rating: 4.0, openRoles: 12, about: "On-demand food delivery and quick commerce." },
  { name: "Razorpay", industry: "Fintech", location: "Bengaluru", size: "2,500+", rating: 4.4, openRoles: 18, about: "Payments and banking platform for businesses." },
  { name: "Zerodha", industry: "Fintech", location: "Bengaluru", size: "1,200+", rating: 4.5, openRoles: 8, about: "India's largest retail stockbroker." },
];

export default function CompaniesPage() {
  return (
    <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Companies" }]}>
      <h1 className="text-[21px] font-bold text-ink mb-1 pt-2">Companies hiring in Bengaluru</h1>
      <p className="text-sm text-muted mb-6">Explore employer profiles, culture, and open roles.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map((c) => (
          <div key={c.name} className="bg-canvas border border-hairline rounded-[14px] p-5 hover:shadow-airbnb transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 bg-surface-strong rounded-[12px] flex items-center justify-center text-base font-bold text-muted shrink-0">
                {c.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-ink">{c.name}</h2>
                  <div className="flex items-center gap-0.5 text-[13px] text-ink">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#222222" stroke="#222222" strokeWidth="1">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {c.rating}
                  </div>
                </div>
                <p className="text-[13px] text-muted">{c.industry} · {c.location} · {c.size} employees</p>
              </div>
            </div>
            <p className="text-sm text-body mb-4">{c.about}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-rausch">{c.openRoles} open roles</span>
              <Link href="/jobs" className="text-sm font-medium text-ink border border-ink rounded-[8px] px-4 py-1.5 hover:bg-surface-soft transition-colors">
                View jobs
              </Link>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
