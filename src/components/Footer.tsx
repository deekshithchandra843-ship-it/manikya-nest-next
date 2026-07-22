"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { apiClient } from "@/lib/apiClient";
import { motion } from "framer-motion";

// SVGs for Trust Indicators (Linear-style clean outline icons)
const ShieldIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const SupportIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

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

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const trustIndicators = [
    { label: "Verified Listings", icon: <ShieldIcon />, color: "hover:text-rausch border-neutral-800/80 hover:border-rausch/30" },
    { label: "Verified Employers", icon: <BriefcaseIcon />, color: "hover:text-emerald-400 border-neutral-800/80 hover:border-emerald-500/30" },
    { label: "Verified Profiles", icon: <UserIcon />, color: "hover:text-indigo-400 border-neutral-800/80 hover:border-indigo-500/30" },
    { label: "Secure Platform", icon: <LockIcon />, color: "hover:text-violet-400 border-neutral-800/80 hover:border-violet-500/30" },
    { label: "Dedicated Support", icon: <SupportIcon />, color: "hover:text-amber-400 border-neutral-800/80 hover:border-amber-500/30" },
  ];

  // Framer Motion staggered grid variants
  const containerVariants: any = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const childVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1], // premium easeOutQuart
      },
    },
  };

  return (
    <motion.footer 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="w-full mt-28 font-sans bg-[#050505] text-[#a1a1aa] border-t border-neutral-900/60 relative overflow-hidden"
    >
      {/* Premium ambient glows (Vercel-inspired subtle color leaks) */}
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-rausch/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-indigo-500/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 pt-20 pb-12 relative z-10">
        
        {/* ROW 1: BRAND + COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16">
          
          {/* SECTION 1: Brand Column (Span 4) */}
          <motion.div variants={childVariants} className="md:col-span-4 flex flex-col gap-6">
            <Link href="/" className="inline-block self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch rounded-md" aria-label="FindWay Logo">
              <Logo size={34} lightText />
            </Link>
            <p className="text-sm leading-relaxed text-neutral-400 max-w-[320px]">
              FindWay connects people with the right homes, jobs, and locations, making relocation and daily life easier.
            </p>
            
            {/* Play Store & App Store Badges */}
            <div className="flex flex-wrap gap-3 mt-2">
              <div className="flex items-center gap-2.5 px-3.5 py-2 bg-[#121214] hover:bg-[#161619] border border-neutral-800/80 rounded-xl cursor-not-allowed select-none transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                <svg className="w-4 h-4 text-neutral-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 2.084A2.3 2.3 0 0 0 3 3.659v16.682a2.3 2.3 0 0 0 .61 1.575L12.33 12 3.609 2.084zm10.026 8.64l-2.47 2.47 2.47 2.47L19.4 12.443a1.49 1.49 0 0 0 0-2.086l-5.765-3.218a1.2 1.2 0 0 0-.001.002zM12.83 11.5L4.545 3.011A.78.78 0 0 0 4.3 3l9.026 5.04-1.496 1.46zM13.326 15.96L4.3 21a.78.78 0 0 0 .245-.011L12.83 12.5l.496.496z" />
                </svg>
                <div className="text-left leading-none">
                  <span className="text-[7.5px] text-neutral-500 uppercase tracking-widest block font-bold">GET IT ON</span>
                  <span className="text-[11px] text-white font-bold mt-0.5 block">Google Play Store</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5 px-3.5 py-2 bg-[#121214] hover:bg-[#161619] border border-neutral-800/80 rounded-xl cursor-not-allowed select-none transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                <svg className="w-4.5 h-4.5 text-neutral-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39" />
                </svg>
                <div className="text-left leading-none">
                  <span className="text-[7.5px] text-neutral-500 uppercase tracking-widest block font-bold">Download on the</span>
                  <span className="text-[11px] text-white font-bold mt-0.5 block">App Store</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* SECTION 2: Explore Properties (Span 2) */}
          <motion.div variants={childVariants} className="md:col-span-2 flex flex-col gap-4.5">
            <h3 className="text-white text-xs font-bold tracking-wider uppercase">Explore Properties</h3>
            <ul className="space-y-3 text-[14px]">
              {[
                { label: "PG", href: "/c/pg" },
                { label: "Flats", href: "/c/rent" },
                { label: "Hostels", href: "/c/pg" },
                { label: "Co-living", href: "/c/coliving" },
                { label: "Villas", href: "/c/rent" },
                { label: "Apartments", href: "/c/rent" },
                { label: "Commercial Spaces", href: "/c/commercial-office" }
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* SECTION 3: Jobs (Span 2) */}
          <motion.div variants={childVariants} className="md:col-span-2 flex flex-col gap-4.5">
            <h3 className="text-white text-xs font-bold tracking-wider uppercase">Jobs</h3>
            <ul className="space-y-3 text-[14px]">
              {[
                { label: "IT Jobs", href: "/jobs?q=IT" },
                { label: "Part-Time Jobs", href: "/jobs?type=part-time" },
                { label: "Internships", href: "/jobs?type=internship" },
                { label: "Remote Jobs", href: "/jobs?type=remote" },
                { label: "Startup Jobs", href: "/jobs?q=startup" },
                { label: "Walk-in Jobs", href: "/jobs?q=walk-in" }
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* SECTION 4: Explore by Location (Span 4) */}
          <motion.div variants={childVariants} className="md:col-span-4 flex flex-col gap-5">
            <h3 className="text-white text-xs font-bold tracking-wider uppercase">Explore by Location</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[14px]">
              {[
                "Whitefield",
                "Electronic City",
                "Koramangala",
                "HSR Layout",
                "Indiranagar",
                "Marathahalli",
                "Vijayanagar"
              ].map((loc) => (
                <Link 
                  key={loc} 
                  href={`/search?locality=${encodeURIComponent(loc)}`}
                  className="hover:text-white transition-colors duration-200 flex items-center gap-1.5"
                >
                  <span className="text-[10px] text-neutral-600">📍</span>
                  {loc}
                </Link>
              ))}
            </div>
            <Link href="/explore" className="text-xs text-rausch hover:text-rausch-active font-bold flex items-center gap-1 mt-1 hover:underline">
              View All Locations <span className="text-[10px]">→</span>
            </Link>
          </motion.div>

        </div>

        {/* ROW 2: TRUST INDICATORS & COMPANY & NEWSLETTER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-16 border-t border-neutral-900/60 items-start">
          
          {/* SECTION 7: Trust Indicators (Span 4) */}
          <motion.div variants={childVariants} className="lg:col-span-4 flex flex-col gap-5">
            <h3 className="text-white text-xs font-bold tracking-wider uppercase">Trust & Security</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {trustIndicators.map((stat) => (
                <div 
                  key={stat.label} 
                  className={`bg-[#0c0c0e] border rounded-xl p-3 flex items-center gap-3.5 shadow-sm transition-all duration-300 group ${stat.color} cursor-default`}
                >
                  <div className="shrink-0 text-neutral-400 transition-colors duration-300">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-300 group-hover:text-white transition-colors duration-300">{stat.label}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5 leading-none">Verified & secured by FindWay</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* SECTION 6: Company Links (Span 3) */}
          <motion.div variants={childVariants} className="lg:col-span-3 flex flex-col gap-4.5">
            <h3 className="text-white text-xs font-bold tracking-wider uppercase">Company</h3>
            <ul className="space-y-3 text-[14px]">
              {[
                { label: "About Us", href: "/how-it-works" },
                { label: "Careers", href: "#" },
                { label: "Blog", href: "#" },
                { label: "Contact", href: "#" },
                { label: "Help Center", href: "#" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms & Conditions", href: "#" }
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* SECTION 8: Newsletter (Span 5 - Glassmorphic minimal border card) */}
          <motion.div variants={childVariants} className="lg:col-span-5 bg-[#0a0a0c] border border-neutral-900/80 rounded-[20px] p-6 flex flex-col gap-4.5">
            <div>
              <h3 className="text-white text-sm font-bold tracking-tight">Stay Updated</h3>
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                Receive updates about new properties, jobs, city guides, and platform features.
              </p>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2.5">
              <input
                id="newsletter-email-v3"
                type="email"
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-2.5 text-sm bg-[#08080a] border border-neutral-800/85 rounded-xl focus:outline-none focus:border-rausch placeholder-neutral-500 text-white transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-rausch hover:bg-rausch-active active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Subscribe
              </button>
            </form>
          </motion.div>

        </div>

        {/* BOTTOM SECTION: SOCIAL MEDIA & LEGAL BAR */}
        <div className="pt-12 mt-12 border-t border-neutral-900/60 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* SECTION 9: Social Media Icons (Premium subtle scaling outlines) */}
          <div className="flex items-center gap-3 order-2 md:order-1">
            {[
              {
                label: "LinkedIn",
                href: "#",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                )
              },
              {
                label: "Instagram",
                href: "#",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                )
              },
              {
                label: "Facebook",
                href: "#",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                )
              },
              {
                label: "YouTube",
                href: "#",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.002 3.002 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                )
              },
              {
                label: "X",
                href: "#",
                icon: (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                )
              }
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="w-8.5 h-8.5 rounded-full bg-[#121214] border border-neutral-800/80 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 hover:scale-[1.05] transition-all duration-300"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>

          {/* BOTTOM BAR: Tagline, copyright & policy links */}
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 w-full order-1 md:order-2 md:pl-8">
            <p className="text-xs text-neutral-500 font-semibold">
              © 2026 FindWay
            </p>
            <p className="text-xs text-neutral-400 text-center font-medium max-w-[340px] sm:max-w-none">
              Helping people discover better homes, better jobs, and better locations.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <Link href="#" className="text-neutral-500 hover:text-white transition-colors">Privacy</Link>
              <span className="text-neutral-800">•</span>
              <Link href="#" className="text-neutral-500 hover:text-white transition-colors">Terms</Link>
              <span className="text-neutral-800">•</span>
              <Link href="#" className="text-neutral-500 hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>

        </div>

        {/* Back to top button */}
        <div className="w-full flex justify-end mt-8">
          <button
            type="button"
            onClick={handleScrollToTop}
            className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white font-bold transition-all duration-200 px-4 py-2 border border-neutral-800 hover:border-neutral-750 bg-[#121214] rounded-full shadow-sm active:scale-95"
          >
            Back to top
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
        </div>

      </div>
    </motion.footer>
  );
}
