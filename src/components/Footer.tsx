"use client";

import Link from "next/link";
import Logo from "./Logo";

const companyLinks = [
  { label: "About us", href: "#" },
  { label: "How it works", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Contact", href: "#" },
];

const quickLinks = [
  { label: "Find PG/Hostel", href: "/c/pg" },
  { label: "Find Rental Flat", href: "/c/rent" },
  { label: "Jobs & Internships", href: "/jobs" },
  { label: "Upskilling", href: "/whats-next" },
];

const cities = ["Bengaluru", "Mumbai", "Hyderabad", "Pune", "Delhi"];

export default function Footer() {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-surface-soft text-ink border-t border-hairline mt-16 w-full">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {/* Brand Column */}
          <div className="flex flex-col">
            <Link href="/" className="inline-block self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch rounded-md" aria-label="NestNext Logo">
              <Logo size={32} className="mb-4" />
            </Link>
            <p className="text-sm leading-relaxed text-muted mb-6 max-w-[260px]">
              NestNext is a clean housing-first platform for students and professionals. Find verified listings near work, plan your daily commute, and search matching jobs with zero brokerage.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4 mt-auto">
              {/* Twitter */}
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-canvas border border-hairline-soft flex items-center justify-center text-muted hover:text-rausch hover:border-rausch hover:scale-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch"
                aria-label="Twitter X link"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-canvas border border-hairline-soft flex items-center justify-center text-muted hover:text-rausch hover:border-rausch hover:scale-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch"
                aria-label="LinkedIn link"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-canvas border border-hairline-soft flex items-center justify-center text-muted hover:text-rausch hover:border-rausch hover:scale-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch"
                aria-label="Instagram link"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-ink text-sm font-semibold tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-block text-sm text-body hover:text-rausch transition-all duration-200 hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch rounded-sm px-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links Column */}
          <div>
            <h3 className="text-ink text-sm font-semibold tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-block text-sm text-body hover:text-rausch transition-all duration-200 hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch rounded-sm px-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-ink text-sm font-semibold tracking-wider uppercase mb-4">Stay Updated</h3>
            <p className="text-sm text-muted mb-4 leading-relaxed">
              Subscribe to get notified about zero-brokerage listings in your neighborhood.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="your@email.com"
                required
                className="w-full px-3 py-2 text-sm bg-canvas border border-hairline rounded-[8px] focus:outline-none focus:border-rausch placeholder-muted-soft text-ink"
              />
              <button
                type="submit"
                className="w-full py-2 bg-rausch hover:bg-rausch-active active:scale-[0.98] text-white text-xs font-semibold rounded-[8px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Legal band */}
      <div className="border-t border-hairline bg-canvas">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-center sm:justify-start">
            <p className="text-xs text-muted">
              © {new Date().getFullYear()} NestNext, Inc. All rights reserved.
            </p>
            <Link href="#" className="text-xs text-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch rounded-sm">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch rounded-sm">
              Terms of Service
            </Link>
          </div>

          {/* Back to top button */}
          <button
            type="button"
            onClick={handleScrollToTop}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-rausch font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch rounded-sm px-2 py-1 border border-hairline hover:border-rausch bg-canvas shadow-sm active:scale-95"
          >
            Back to top
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
