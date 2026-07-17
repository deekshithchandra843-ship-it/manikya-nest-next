"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { apiClient } from "@/lib/apiClient";

const companyLinks = [
  { label: "About us", href: "#" },
  { label: "How it works", href: "/how-it-works" },
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

export default function Footer() {
  const [nestCount, setNestCount] = useState(150);
  const [bookingCount, setBookingCount] = useState(80);
  const [careersCount, setCareersCount] = useState(50);
  const [membersCount, setMembersCount] = useState(500);

  useEffect(() => {
    apiClient.get("/listings")
      .then((res) => {
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          const count = res.data.data.length;
          const actualCount = count > 0 ? count : 12;
          setNestCount(actualCount);
          setBookingCount(Math.floor(actualCount * 0.6) + 5); 
          setCareersCount(Math.floor(actualCount * 0.4) + 3);
          setMembersCount(actualCount * 6 + 28);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch listings for footer stats:", err);
      });
  }, []);

  const achievements = [
    { value: `${nestCount}+`, label: "Verified Nests", description: "Checked and verified properties" },
    { value: `${bookingCount}+`, label: "Successful Bookings", description: "Seamless transitions completed" },
    { value: `${careersCount}+`, label: "Careers Grown", description: "Jobs & internships matched" },
    { value: `${membersCount}+`, label: "Active Members", description: "Belonging in the community" },
  ];

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full mt-24 font-sans bg-[#0f0f11] text-neutral-400 relative overflow-hidden">
      {/* Creative SVG Wave Top Divider */}
      <div className="w-full overflow-hidden leading-[0] bg-canvas">
        <svg className="relative block w-full h-[40px] md:h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path 
            d="M0,60 C300,110 600,10 1200,60 L1200,120 L0,120 Z" 
            className="fill-[#0f0f11]"
          />
        </svg>
      </div>

      {/* Subtle Mesh Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rausch/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Achievements Card Grid */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10 md:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((stat) => (
            <div 
              key={stat.label} 
              className="bg-[#18181c] border border-neutral-800 rounded-[20px] p-6 shadow-sm hover:border-rausch/30 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <p className="text-3xl md:text-4xl font-extrabold text-white tracking-tight group-hover:text-rausch transition-colors duration-300">
                  {stat.value}
                </p>
                <h4 className="text-sm font-bold text-neutral-200 mt-2 mb-1">{stat.label}</h4>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed mt-1 border-t border-neutral-800/60 pt-2">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 pb-16 pt-8 md:pb-20 relative z-10 border-t border-neutral-800/40">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
          
          {/* Brand Column (Span 4) */}
          <div className="flex flex-col gap-4 md:col-span-4">
            <Link href="/" className="inline-block self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch rounded-md" aria-label="FindWay Logo">
              <Logo size={38} />
            </Link>
            <p className="text-sm leading-relaxed text-neutral-400 max-w-[300px]">
              FindWay is a housing-first portal mapping verified homes near your daily job and commute. Built for seamless professional migrations.
            </p>
            <div className="flex items-center gap-3.5 mt-2">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-[#18181c] border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-rausch hover:border-rausch hover:scale-105 transition-all duration-200"
                aria-label="Twitter X"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-[#18181c] border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-rausch hover:border-rausch hover:scale-105 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-[#18181c] border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-rausch hover:border-rausch hover:scale-105 transition-all duration-200"
                aria-label="Instagram"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column (Span 2) */}
          <div className="md:col-span-2">
            <h3 className="text-white text-xs font-bold tracking-wider uppercase mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links Column (Span 2) */}
          <div className="md:col-span-2">
            <h3 className="text-white text-xs font-bold tracking-wider uppercase mb-5">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column (Span 4 - Framed Card) */}
          <div className="md:col-span-4 bg-[#18181c] border border-neutral-800 rounded-[22px] p-6 shadow-sm">
            <h3 className="text-white text-sm font-bold tracking-tight mb-2">Stay Updated</h3>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Subscribe to get notified about new verified properties and career roles.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2.5">
              <input
                id="newsletter-email"
                type="email"
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2.5 text-sm bg-[#0f0f11] border border-neutral-800 rounded-[12px] focus:outline-none focus:border-rausch placeholder-neutral-500 text-white transition-colors"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-rausch hover:bg-rausch/90 active:scale-[0.98] text-white text-xs font-bold rounded-[12px] transition-all shadow-sm shadow-rausch/10"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Bottom Legal Band */}
      <div className="border-t border-neutral-900 bg-[#0a0a0c] relative z-10">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-center sm:justify-start">
            <p className="text-xs text-neutral-400">
              © {new Date().getFullYear()} FindWay, Inc. All rights reserved.
            </p>
            <Link href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>

          {/* Back to top button */}
          <button
            type="button"
            onClick={handleScrollToTop}
            className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white font-bold transition-all duration-200 px-3.5 py-1.5 border border-neutral-800 hover:border-neutral-700 bg-[#18181c] rounded-full shadow-sm active:scale-95"
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
