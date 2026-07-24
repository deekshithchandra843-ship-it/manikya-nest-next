"use client";
/**
 * Home hero — skyline photograph fading into white on the left, headline +
 * trust chips, a four-field search bar, and the category/filter band seated
 * 
 * on the darker foot of the photo (mockup: WhatsApp reference image).
 */
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/apiClient";
import { JOBS } from "@/lib/jobs";
import SearchBar from "@/components/SearchBar";

const EASE = [0.16, 1, 0.3, 1] as const;

const TRUST_CHIPS = [
  {
    title: "Verified Listings",
    sub: "Quality checked",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2.9 5 5.6v5.2c0 4.6 3 8.6 7 9.9 4-1.3 7-5.3 7-9.9V5.6z" />
        <path d="m9.2 12 2 2 3.6-4" />
      </svg>
    ),
  },
  {
    title: "Direct Deals",
    sub: "Deal direct with owners",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Instant Booking",
    sub: "Book your home online",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
        <path d="M8 3v4m8-4v4M3.5 10.5h17M9.5 15l2 2 3.5-3.5" />
      </svg>
    ),
  },
];

/** "I'm looking for" options → search category slugs. */
const LOOKING_FOR = [
  { value: "rent", label: "Rent" },
  { value: "buy", label: "Buy" },
  { value: "pg", label: "PG / Hostel" },
  { value: "coliving", label: "Co-living" },
  { value: "commercial-office", label: "Commercial" },
];

const PROPERTY_TYPES_BY_CATEGORY: Record<string, { value: string; label: string }[]> = {
  rent: [
    { value: "", label: "All" },
    { value: "1", label: "1 BHK" },
    { value: "2", label: "2 BHK" },
    { value: "3", label: "3 BHK" },
  ],
  buy: [
    { value: "", label: "All" },
    { value: "1", label: "1 BHK" },
    { value: "2", label: "2 BHK" },
    { value: "3", label: "3 BHK" },
    { value: "4", label: "4 BHK" },
    { value: "villa", label: "Villa" },
    { value: "plot", label: "Plot" },
  ],
  pg: [
    { value: "", label: "All" },
    { value: "single", label: "Single Sharing" },
    { value: "double", label: "Double Sharing" },
    { value: "triple", label: "Triple Sharing" },
  ],
  coliving: [
    { value: "", label: "All" },
    { value: "private", label: "Private Room" },
    { value: "shared", label: "Shared Room" },
    { value: "studio", label: "Studio" },
  ],
  "commercial-office": [
    { value: "", label: "All" },
    { value: "office", label: "Office Space" },
    { value: "coworking", label: "Coworking Desk" },
    { value: "shop", label: "Retail Shop" },
    { value: "warehouse", label: "Warehouse" },
  ],
  homestay: [
    { value: "", label: "All" },
    { value: "room", label: "Private Room" },
    { value: "entire", label: "Entire Home" },
  ]
};

const BUDGETS_BY_CATEGORY: Record<string, { value: string; label: string }[]> = {
  rent: [
    { value: "", label: "Any budget" },
    { value: "15000", label: "Max. ₹15,000" },
    { value: "25000", label: "Max. ₹25,000" },
    { value: "50000", label: "Max. ₹50,000" },
    { value: "120000", label: "Max. ₹1.20 L" },
  ],
  buy: [
    { value: "", label: "Any budget" },
    { value: "5000000", label: "Max. ₹50 L" },
    { value: "10000000", label: "Max. ₹1 Cr" },
    { value: "20000000", label: "Max. ₹2 Cr" },
    { value: "50000000", label: "Max. ₹5 Cr" },
  ],
  pg: [
    { value: "", label: "Any budget" },
    { value: "5000", label: "Max. ₹5,000" },
    { value: "8000", label: "Max. ₹8,000" },
    { value: "12000", label: "Max. ₹12,000" },
    { value: "18000", label: "Max. ₹18,000" },
  ],
  coliving: [
    { value: "", label: "Any budget" },
    { value: "10000", label: "Max. ₹10,000" },
    { value: "15000", label: "Max. ₹15,000" },
    { value: "22000", label: "Max. ₹22,000" },
    { value: "30000", label: "Max. ₹30,000" },
  ],
  "commercial-office": [
    { value: "", label: "Any budget" },
    { value: "25000", label: "Max. ₹25,000" },
    { value: "50000", label: "Max. ₹50,000" },
    { value: "150000", label: "Max. ₹1.50 L" },
    { value: "500000", label: "Max. ₹5.00 L" },
  ],
  homestay: [
    { value: "", label: "Any budget" },
    { value: "2000", label: "Max. ₹2,000/day" },
    { value: "5000", label: "Max. ₹5,000/day" },
    { value: "10000", label: "Max. ₹10,000/day" },
  ]
};

const WORLDS = [
  { id: "residential", label: "Residential" },
  { id: "commercial", label: "Commercial" },
  { id: "stays", label: "Stays" },
] as const;

const RESIDENTIAL_SUBS = [
  { value: "rent", label: "Rent" },
  { value: "buy", label: "Buy" },
  { value: "pg", label: "PG / Hostel" },
  { value: "coliving", label: "Co-living" },
];

const QUICK_FILTERS_BY_CATEGORY: Record<string, { label: string; href: string }[]> = {
  rent: [
    { label: "1 BHK", href: "/search?category=rent&bhk=1" },
    { label: "2 BHK", href: "/search?category=rent&bhk=2" },
    { label: "3 BHK", href: "/search?category=rent&bhk=3" },
    { label: "Furnished", href: "/search?category=rent&q=furnished" },
    { label: "Semi-furnished", href: "/search?category=rent&q=semi-furnished" },
  ],
  buy: [
    { label: "2 BHK", href: "/search?category=buy&bhk=2" },
    { label: "3 BHK", href: "/search?category=buy&bhk=3" },
    { label: "Villa", href: "/search?category=buy&bhk=villa" },
    { label: "Plots", href: "/search?category=buy&bhk=plot" },
    { label: "New Projects", href: "/search?category=buy&q=new" },
  ],
  pg: [
    { label: "Single Sharing", href: "/search?category=pg&bhk=single" },
    { label: "Double Sharing", href: "/search?category=pg&bhk=double" },
    { label: "With Food", href: "/search?category=pg&q=food" },
    { label: "AC PG", href: "/search?category=pg&q=ac" },
    { label: "Girls PG", href: "/search?category=pg&q=girls" },
  ],
  coliving: [
    { label: "Private Room", href: "/search?category=coliving&bhk=private" },
    { label: "Shared Room", href: "/search?category=coliving&bhk=shared" },
    { label: "Studio Flat", href: "/search?category=coliving&bhk=studio" },
    { label: "Co-working space", href: "/search?category=coliving&q=coworking" },
  ],
  "commercial-office": [
    { label: "Office Space", href: "/search?category=commercial-office&bhk=office" },
    { label: "Coworking", href: "/search?category=commercial-office&bhk=coworking" },
    { label: "Retail Shop", href: "/search?category=commercial-office&bhk=shop" },
    { label: "Warehouse", href: "/search?category=commercial-office&bhk=warehouse" },
  ],
  homestay: [
    { label: "Private Room", href: "/search?category=homestay&bhk=room" },
    { label: "Entire Home", href: "/search?category=homestay&bhk=entire" },
    { label: "Pet Friendly", href: "/search?category=homestay&q=pet" },
    { label: "With Pool", href: "/search?category=homestay&q=pool" },
  ],
};

/** Custom dropdown component with Framer Motion animations */
function CustomDropdown({
  options,
  value,
  onChange,
  isOpen,
  onClose,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30 cursor-default" onClick={(e) => { e.stopPropagation(); onClose(); }} />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-full mt-2 z-40 bg-white border border-slate-200/80 rounded-[16px] shadow-[0_12px_36px_rgba(15,23,42,0.12)] py-2 overflow-hidden w-[220px]"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt.value);
                    onClose();
                  }}
                  className={`w-full text-left px-4 py-2.5 text-[13.5px] font-semibold transition-colors flex items-center justify-between ${isSelected
                      ? "text-rausch bg-rausch-soft"
                      : "text-ink hover:bg-surface-soft"
                    }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-rausch">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Field wrapper — icon tile + label + control, mockup style. */
function Field({
  label,
  icon,
  children,
  onClick,
  dropdown,
  isInput = false,
  isActive = false,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  dropdown?: React.ReactNode;
  isInput?: boolean;
  isActive?: boolean;
}) {
  const Container = isInput ? "label" : "div";
  return (
    <Container
      onClick={onClick}
      className={`relative flex items-center gap-2.5 px-3.5 lg:px-4 py-3 min-w-0 cursor-pointer select-none group transition-all duration-150 ${isActive ? "z-30 bg-slate-50 lg:bg-transparent" : "z-10"
        }`}
    >
      <span className="w-9 h-9 shrink-0 flex items-center justify-center rounded-[10px] bg-surface-soft text-ink group-hover:bg-rausch-soft group-hover:text-rausch transition-colors duration-200 pointer-events-none" aria-hidden="true">
        {icon}
      </span>
      <span className="flex flex-col min-w-0 flex-1 pointer-events-none">
        <span className="text-[11px] font-medium text-muted whitespace-nowrap">{label}</span>
        {children}
      </span>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-muted-soft shrink-0 group-hover:text-ink transition-colors duration-200 pointer-events-none" aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
      </svg>
      {dropdown}
    </Container>
  );
}

export default function HomeHero({
  activeWorld,
  onWorldChange,
}: {
  activeWorld?: "residential" | "commercial" | "stays";
  onWorldChange?: (id: "residential" | "commercial" | "stays") => void;
}) {
  const router = useRouter();
  const reduced = useReducedMotion();

  const [where, setWhere] = useState("Bengaluru");
  const [category, setCategory] = useState("rent");
  const [bhk, setBhk] = useState("");
  const [budget, setBudget] = useState("");
  const [localWorld, setLocalWorld] = useState<"residential" | "commercial" | "stays">("residential");
  const world = activeWorld ?? localWorld;
  const setWorld = onWorldChange ?? setLocalWorld;
  const [activeDropdown, setActiveDropdown] = useState<"category" | "bhk" | "budget" | null>(null);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setBhk("");
    setBudget("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (where.trim() && where.trim().toLowerCase() !== "bengaluru") params.set("q", where.trim());
    params.set("category", category);
    if (bhk) params.set("bhk", bhk);
    if (budget) params.set("maxPrice", budget);
    router.push(`/search?${params.toString()}`);
  };

  const pickWorld = (id: (typeof WORLDS)[number]["id"]) => {
    setWorld(id);
    if (id === "commercial") handleCategoryChange("commercial-office");
    else if (id === "stays") handleCategoryChange("homestay");
    else handleCategoryChange("rent");
  };

  const enter = (delay: number) =>
    reduced
      ? {}
      : {
        initial: { opacity: 0, y: 22 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, delay, ease: EASE },
      };

  return (
    <header className="relative overflow-hidden bg-[#f5faf7]" aria-label="Find your perfect space">
      {/* Daylight aerial on the right, dissolving into the mint canvas on the
          left — per the reference mockup. On phones the photo sits behind a
          near-solid wash so the copy stays readable. */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/hero-day.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_45%]"
        />
        <div className="absolute inset-0 bg-[#f5faf7]/92 lg:bg-transparent lg:bg-gradient-to-r lg:from-[#f5faf7] lg:via-[#f5faf7]/96 lg:to-transparent lg:w-[62%]" />
      </div>

      <div className="relative max-w-[1560px] mx-auto px-4 md:px-8 lg:px-10 pt-24 md:pt-28 pb-10">
        {/* Badge */}
        <motion.div
          {...enter(0)}
          className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#e2f2ec] text-rausch font-extrabold text-[11px] tracking-[0.08em] mb-5"
        >
          SMART SEARCH. BETTER LIVING.
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...enter(0.06)}
          className="text-[36px] md:text-[48px] lg:text-[56px] font-bold leading-[1.06] tracking-[-0.02em] text-ink max-w-[620px]"
        >
          Find your perfect
          <br />
          space in <span className="text-rausch">Bengaluru</span>
        </motion.h1>
        <motion.p {...enter(0.12)} className="mt-4 text-[15.5px] md:text-[17px] leading-relaxed text-body max-w-[440px]">
          Verified homes, PGs, commercial spaces and jobs —
          <br className="hidden md:block" /> all in one place. Live closer, travel less.
        </motion.p>

        {/* Universal search — one Airbnb-style pill: free text + category tabs
            + budget, covering homes, PGs, co-living and jobs. */}
        <motion.div {...enter(0.24)} className="mt-8 lg:max-w-[820px] relative z-20">
          <SearchBar />
        </motion.div>

        {/* Popular searches */}
        <motion.div {...enter(0.3)} className="mt-6">
          <p className="text-[13px] font-medium text-muted mb-2.5">Popular searches:</p>
          <div className="flex flex-nowrap sm:flex-wrap gap-2.5 overflow-x-auto sm:overflow-visible scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 [&>*]:shrink-0">
            {["Whitefield", "HSR Layout", "Koramangala", "Electronic City", "Indiranagar"].map((s) => (
              <Link
                key={s}
                href={`/search?q=${encodeURIComponent(s)}`}
                className="px-4 py-2 rounded-full bg-[#e2f2ec] text-[13px] font-semibold text-rausch hover:bg-rausch hover:text-white transition-colors"
              >
                {s}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Trust strip — one white card row at the hero's foot */}
        <motion.div
          {...enter(0.38)}
          className="mt-10 inline-flex flex-nowrap sm:flex-wrap max-w-full gap-0 bg-white/90 backdrop-blur-md rounded-[18px] border border-hairline-soft shadow-[0_6px_24px_-10px_rgba(15,23,42,0.14)] divide-x divide-hairline-soft overflow-x-auto scrollbar-hide [&>*]:shrink-0"
        >
          {TRUST_CHIPS.map((chip) => (
            <div key={chip.title} className="flex items-center gap-3 px-5 py-3.5">
              <span className="w-10 h-10 flex items-center justify-center rounded-[12px] bg-rausch-soft text-rausch shrink-0">
                {chip.icon}
              </span>
              <span>
                <span className="block text-[13.5px] font-bold text-ink leading-tight">{chip.title}</span>
                <span className="block text-[11.5px] text-muted mt-0.5">{chip.sub}</span>
              </span>
            </div>
          ))}
        </motion.div>

        {/* Right side — floating insight cards over the photo */}
        <HeroArt />
      </div>
    </header>
  );
}

/**
 * Floating cards + central home pin over the hero photo — every card is a
 * REAL doorway into the app with LIVE counts from the listings API and the
 * jobs catalog. No invented city stats. Desktop only; phones get the clean
 * copy column.
 */
function HeroArt() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    apiClient
      .get("/listings")
      .then((res) => {
        const rows = res.data?.success ? res.data.data : null;
        if (!Array.isArray(rows)) return;
        const byCat: Record<string, number> = {};
        for (const row of rows) {
          const c = row.category || "other";
          byCat[c] = (byCat[c] || 0) + 1;
        }
        setCounts({
          homes: (byCat.rent || 0) + (byCat.buy || 0),
          pg: byCat.pg || 0,
          coliving: byCat.coliving || 0,
          commercial:
            (byCat["commercial-office"] || 0) +
            (byCat["commercial-shop"] || 0) +
            (byCat.coworking || 0) +
            (byCat.warehouse || 0),
        });
      })
      .catch(() => {
        /* leave counts null — cards fall back to "Explore" labels */
      });
  }, []);

  const n = (key: string, noun: string) =>
    counts && counts[key] > 0 ? `${counts[key]} ${noun}` : "Explore →";

  const cards = [
    { top: "6%", left: "38%", tint: "bg-purple-100 text-purple-600", title: "Jobs", sub: `${JOBS.length} openings`, href: "/jobs", icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></> },
    { top: "30%", left: "6%", tint: "bg-[#e2f2ec] text-rausch", title: "Homes", sub: n("homes", "verified listings"), href: "/search?category=rent", icon: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5M10 21v-6h4v6" /> },
    { top: "34%", left: "74%", tint: "bg-amber-100 text-amber-600", title: "PG & Hostels", sub: n("pg", "PGs listed"), href: "/search?category=pg", icon: <path d="M3 18V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10M3 14h18M7 14v-3h5v3M3 18v2m18-2v2" /> },
    { top: "60%", left: "12%", tint: "bg-blue-100 text-blue-600", title: "Co-living", sub: n("coliving", "spaces"), href: "/search?category=coliving", icon: <><circle cx="9" cy="8" r="3" /><circle cx="16.5" cy="9.5" r="2.5" /><path d="M3 20v-1a6 6 0 0 1 6-6 6 6 0 0 1 6 6v1M16 13.5a5 5 0 0 1 5 5V20" /></> },
    { top: "64%", left: "70%", tint: "bg-rose-100 text-rose-500", title: "Commercial", sub: n("commercial", "spaces"), href: "/search?category=commercial-office", icon: <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h3a1 1 0 0 1 1 1v11M2 21h20M8 7h2m-2 4h2m-2 4h2" /> },
    { top: "86%", left: "40%", tint: "bg-violet-100 text-violet-600", title: "Metro-aware", sub: "Nearest metro on every listing", href: "/explore", icon: <><rect x="4" y="3" width="16" height="13" rx="2" /><path d="M8 21l2-3h4l2 3M8 10h8" /></> },
  ];

  return (
    <div className="hidden lg:block absolute right-[2%] top-28 bottom-[4%] w-[500px] xl:w-[560px] z-10">
      <div className="relative w-full h-full pointer-events-none">
        {/* Dashed connectors from the pin to each card */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" aria-hidden="true">
          {[
            "M50 46 L44 12", "M50 46 L14 34", "M50 46 L78 38",
            "M50 46 L18 64", "M50 46 L74 68", "M50 46 L46 88",
          ].map((d) => (
            <path key={d} d={d} stroke="#ffffff" strokeWidth="0.5" strokeDasharray="1.6 1.6" opacity="0.9" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
          ))}
        </svg>

        {/* Central home pin */}
        <div className="absolute top-[46%] left-[50%] -translate-x-1/2 -translate-y-full" aria-hidden="true">
          <div className="w-[58px] h-[58px] rounded-[18px] rounded-br-[4px] rotate-45 bg-rausch border-4 border-white shadow-[0_10px_28px_rgba(14,138,106,0.45)] flex items-center justify-center">
            <svg className="-rotate-45" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M12 3.5 20 10.5V21h-5.5v-5h-5v5H4V10.5z" />
            </svg>
          </div>
        </div>

        {/* Real doorways into the app */}
        {cards.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            style={{ top: c.top, left: c.left }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex items-center gap-3 bg-white/90 backdrop-blur-md rounded-2xl py-2.5 pl-2.5 pr-5 shadow-[0_10px_30px_-8px_rgba(15,23,42,0.25)] border border-white hover:-translate-y-[calc(50%+4px)] hover:shadow-[0_16px_38px_-8px_rgba(15,23,42,0.3)] transition-all duration-200"
          >
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.tint}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {c.icon}
              </svg>
            </span>
            <span>
              <span className="block text-[13px] font-bold text-ink leading-tight">{c.title}</span>
              <span className="block text-[11px] text-muted leading-tight mt-0.5">{c.sub}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
