/* ------------------------------------------------------------------ *
 * Jobs — frontend mock data.
 * Stands in for the backend until the jobs API lands. Shapes mirror the
 * FindWay Jobs template deck (category / salary / shift / area / distance).
 * ------------------------------------------------------------------ */

export type JobCategory = "part-time" | "it" | "non-it";

/** Salary is stored in rupees-per-month so every job sorts on one axis.
 *  `display` carries the human form (LPA, per-day, per-hour) from the deck. */
export interface Job {
  id: string;
  slug: string;
  title: string;
  company: string;
  logo: string;
  area: string;
  areaLabel: string;
  category: JobCategory;
  salaryMin: number;
  salaryMax: number;
  salaryDisplay: string;
  shift: "morning" | "evening" | "night" | "weekend" | "flexible";
  shiftLabel: string;
  distanceKm: number;
  postedHoursAgo: number;
  tags: string[];
  requirement: string;
  walkIn: boolean;
  workFromHome: boolean;
  noExperience: boolean;
  urgent: boolean;
}

/* The jobs palette is navy + sun only, so the three categories are told
 * apart by *weight* rather than by hue: pale sun, solid navy, pale navy.
 * Map pins invert the same three treatments. Raw hex lives here and in the
 * globals.css @theme block; components take these values or the tokens. */
export interface CategoryMeta {
  id: JobCategory;
  label: string;
  short: string;
  tagline: string;
  /** Chip foreground / background. */
  color: string;
  tint: string;
  /** Map-pin fill / label. */
  pinBg: string;
  pinFg: string;
}

const NAVY = "#141d38";
const SUN = "#fcdb32";

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "part-time",
    label: "Part-time & gigs",
    short: "Part-time",
    tagline: "Delivery, retail, cafes, events, tutoring — flexible shifts",
    color: NAVY,
    tint: "#fef6cc",
    pinBg: SUN,
    pinFg: NAVY,
  },
  {
    id: "it",
    label: "IT jobs",
    short: "IT",
    tagline: "Developers, QA, support, data — startups to MNCs",
    color: "#ffffff",
    tint: NAVY,
    pinBg: NAVY,
    pinFg: "#ffffff",
  },
  {
    id: "non-it",
    label: "Non-IT jobs",
    short: "Non-IT",
    tagline: "Sales, ops, HR, accounts, drivers, healthcare",
    color: NAVY,
    tint: "#eceef4",
    pinBg: "#ffffff",
    pinFg: NAVY,
  },
];

export function categoryMeta(id: JobCategory): CategoryMeta {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export const AREAS = [
  { slug: "koramangala", label: "Koramangala" },
  { slug: "hsr-layout", label: "HSR Layout" },
  { slug: "btm-layout", label: "BTM Layout" },
  { slug: "indiranagar", label: "Indiranagar" },
  { slug: "whitefield", label: "Whitefield" },
  { slug: "electronic-city", label: "Electronic City" },
  { slug: "marathahalli", label: "Marathahalli" },
  { slug: "jayanagar", label: "Jayanagar" },
  { slug: "hebbal", label: "Hebbal" },
  { slug: "domlur", label: "Domlur" },
];

export const SHIFTS = [
  { id: "morning", label: "Morning" },
  { id: "evening", label: "Evening" },
  { id: "night", label: "Night" },
  { id: "weekend", label: "Weekend only" },
] as const;

export type SortKey = "nearest" | "newest" | "highest-pay";

export const SORTS: { id: SortKey; label: string }[] = [
  { id: "nearest", label: "Nearest" },
  { id: "newest", label: "Newest" },
  { id: "highest-pay", label: "Highest pay" },
];

function job(j: Job): Job {
  return j;
}

export const JOBS: Job[] = [
  job({
    id: "8412",
    slug: "delivery-executive-zepto-koramangala-8412",
    title: "Delivery Executive — Evening",
    company: "Zepto",
    logo: "Z",
    area: "koramangala",
    areaLabel: "Koramangala 5th Block",
    category: "part-time",
    salaryMin: 18000,
    salaryMax: 22000,
    salaryDisplay: "₹18–22k/mo",
    shift: "evening",
    shiftLabel: "6–10 pm",
    distanceKm: 0.8,
    postedHoursAgo: 2,
    tags: ["Urgent"],
    requirement: "Own bike",
    walkIn: false,
    workFromHome: false,
    noExperience: true,
    urgent: true,
  }),
  job({
    id: "8413",
    slug: "cafe-staff-barista-third-wave-koramangala-8413",
    title: "Cafe Staff / Barista",
    company: "Third Wave Coffee",
    logo: "T",
    area: "koramangala",
    areaLabel: "Koramangala 4th Block",
    category: "part-time",
    salaryMin: 15000,
    salaryMax: 18000,
    salaryDisplay: "₹15–18k/mo",
    shift: "flexible",
    shiftLabel: "Flexible shifts",
    distanceKm: 1.1,
    postedHoursAgo: 5,
    tags: ["Walk-in"],
    requirement: "No experience",
    walkIn: true,
    workFromHome: false,
    noExperience: true,
    urgent: false,
  }),
  job({
    id: "8414",
    slug: "weekend-event-promoter-urban-events-koramangala-8414",
    title: "Weekend Event Promoter",
    company: "Urban Events Co",
    logo: "U",
    area: "koramangala",
    areaLabel: "Forum Mall",
    category: "part-time",
    salaryMin: 20000,
    salaryMax: 20000,
    salaryDisplay: "₹800/day",
    shift: "weekend",
    shiftLabel: "Sat–Sun",
    distanceKm: 1.6,
    postedHoursAgo: 24,
    tags: [],
    requirement: "Kannada + English",
    walkIn: false,
    workFromHome: false,
    noExperience: true,
    urgent: false,
  }),
  job({
    id: "8415",
    slug: "home-tutor-maths-learnly-hsr-8415",
    title: "Home Tutor — Class 8–10 Maths",
    company: "Learnly",
    logo: "L",
    area: "hsr-layout",
    areaLabel: "HSR / Koramangala",
    category: "part-time",
    salaryMin: 24000,
    salaryMax: 30000,
    salaryDisplay: "₹400–600/hr",
    shift: "evening",
    shiftLabel: "2h evenings",
    distanceKm: 2.3,
    postedHoursAgo: 26,
    tags: [],
    requirement: "Graduate",
    walkIn: false,
    workFromHome: false,
    noExperience: false,
    urgent: false,
  }),
  job({
    id: "8416",
    slug: "store-picker-zepto-koramangala-8416",
    title: "Store Picker — Morning",
    company: "Zepto",
    logo: "Z",
    area: "koramangala",
    areaLabel: "Koramangala 5th Block",
    category: "part-time",
    salaryMin: 16000,
    salaryMax: 19000,
    salaryDisplay: "₹16–19k/mo",
    shift: "morning",
    shiftLabel: "7 am – 1 pm",
    distanceKm: 0.8,
    postedHoursAgo: 8,
    tags: ["Walk-in"],
    requirement: "No experience",
    walkIn: true,
    workFromHome: false,
    noExperience: true,
    urgent: false,
  }),
  job({
    id: "8417",
    slug: "night-warehouse-associate-blinkit-hsr-8417",
    title: "Night Warehouse Associate",
    company: "Blinkit",
    logo: "B",
    area: "hsr-layout",
    areaLabel: "HSR Layout Sector 2",
    category: "part-time",
    salaryMin: 19000,
    salaryMax: 23000,
    salaryDisplay: "₹19–23k/mo",
    shift: "night",
    shiftLabel: "10 pm – 6 am",
    distanceKm: 2.9,
    postedHoursAgo: 30,
    tags: ["Urgent"],
    requirement: "Age 18–35",
    walkIn: true,
    workFromHome: false,
    noExperience: true,
    urgent: true,
  }),
  job({
    id: "9101",
    slug: "react-developer-razorstack-domlur-9101",
    title: "React Developer (2y)",
    company: "Razorstack",
    logo: "R",
    area: "domlur",
    areaLabel: "Domlur",
    category: "it",
    salaryMin: 75000,
    salaryMax: 116000,
    salaryDisplay: "₹9–14 LPA",
    shift: "morning",
    shiftLabel: "Full-time · Hybrid",
    distanceKm: 3,
    postedHoursAgo: 6,
    tags: ["Hybrid"],
    requirement: "2y experience",
    walkIn: false,
    workFromHome: true,
    noExperience: false,
    urgent: false,
  }),
  job({
    id: "9102",
    slug: "qa-engineer-innovex-koramangala-9102",
    title: "QA Engineer",
    company: "Innovex",
    logo: "I",
    area: "koramangala",
    areaLabel: "Koramangala",
    category: "it",
    salaryMin: 50000,
    salaryMax: 75000,
    salaryDisplay: "₹6–9 LPA",
    shift: "morning",
    shiftLabel: "Full-time",
    distanceKm: 1.4,
    postedHoursAgo: 12,
    tags: [],
    requirement: "Automation testing",
    walkIn: false,
    workFromHome: false,
    noExperience: false,
    urgent: false,
  }),
  job({
    id: "9103",
    slug: "backend-developer-blubyte-hsr-9103",
    title: "Backend Developer",
    company: "BluByte",
    logo: "B",
    area: "hsr-layout",
    areaLabel: "HSR Layout",
    category: "it",
    salaryMin: 100000,
    salaryMax: 150000,
    salaryDisplay: "₹12–18 LPA",
    shift: "morning",
    shiftLabel: "Full-time · Remote OK",
    distanceKm: 3.2,
    postedHoursAgo: 20,
    tags: ["Work from home"],
    requirement: "Node + Postgres",
    walkIn: false,
    workFromHome: true,
    noExperience: false,
    urgent: false,
  }),
  job({
    id: "9104",
    slug: "support-engineer-cloudpeak-whitefield-9104",
    title: "Technical Support Engineer",
    company: "CloudPeak",
    logo: "C",
    area: "whitefield",
    areaLabel: "Whitefield",
    category: "it",
    salaryMin: 33000,
    salaryMax: 50000,
    salaryDisplay: "₹4–6 LPA",
    shift: "night",
    shiftLabel: "US shift",
    distanceKm: 12.4,
    postedHoursAgo: 40,
    tags: ["Freshers OK"],
    requirement: "Freshers OK",
    walkIn: false,
    workFromHome: false,
    noExperience: true,
    urgent: false,
  }),
  job({
    id: "9105",
    slug: "data-analyst-metricly-electronic-city-9105",
    title: "Data Analyst",
    company: "Metricly",
    logo: "M",
    area: "electronic-city",
    areaLabel: "Electronic City Phase 1",
    category: "it",
    salaryMin: 58000,
    salaryMax: 83000,
    salaryDisplay: "₹7–10 LPA",
    shift: "morning",
    shiftLabel: "Full-time",
    distanceKm: 14.1,
    postedHoursAgo: 50,
    tags: [],
    requirement: "SQL + Python",
    walkIn: false,
    workFromHome: false,
    noExperience: false,
    urgent: false,
  }),
  job({
    id: "7201",
    slug: "field-sales-executive-medlife-cv-raman-nagar-7201",
    title: "Field Sales Executive",
    company: "Medlife Pharma",
    logo: "M",
    area: "indiranagar",
    areaLabel: "CV Raman Nagar",
    category: "non-it",
    salaryMin: 22000,
    salaryMax: 28000,
    salaryDisplay: "₹22–28k/mo",
    shift: "morning",
    shiftLabel: "Full-time",
    distanceKm: 4.5,
    postedHoursAgo: 9,
    tags: [],
    requirement: "Bike needed",
    walkIn: false,
    workFromHome: false,
    noExperience: false,
    urgent: false,
  }),
  job({
    id: "7202",
    slug: "store-manager-maxretail-btm-7202",
    title: "Store Manager",
    company: "MaxRetail",
    logo: "M",
    area: "btm-layout",
    areaLabel: "BTM Layout",
    category: "non-it",
    salaryMin: 30000,
    salaryMax: 35000,
    salaryDisplay: "₹30–35k/mo",
    shift: "morning",
    shiftLabel: "Full-time",
    distanceKm: 2.9,
    postedHoursAgo: 18,
    tags: ["Urgent"],
    requirement: "3y retail",
    walkIn: false,
    workFromHome: false,
    noExperience: false,
    urgent: true,
  }),
  job({
    id: "7203",
    slug: "telecaller-finease-jayanagar-7203",
    title: "Telecaller — Loans",
    company: "FinEase",
    logo: "F",
    area: "jayanagar",
    areaLabel: "Jayanagar 4th Block",
    category: "non-it",
    salaryMin: 16000,
    salaryMax: 20000,
    salaryDisplay: "₹16–20k/mo",
    shift: "morning",
    shiftLabel: "Day shift",
    distanceKm: 5.6,
    postedHoursAgo: 22,
    tags: ["Walk-in"],
    requirement: "Kannada + Hindi",
    walkIn: true,
    workFromHome: false,
    noExperience: true,
    urgent: false,
  }),
  job({
    id: "7204",
    slug: "accounts-executive-shreeco-hebbal-7204",
    title: "Accounts Executive",
    company: "ShreeCo",
    logo: "S",
    area: "hebbal",
    areaLabel: "Hebbal",
    category: "non-it",
    salaryMin: 25000,
    salaryMax: 32000,
    salaryDisplay: "₹25–32k/mo",
    shift: "morning",
    shiftLabel: "Full-time",
    distanceKm: 9.2,
    postedHoursAgo: 34,
    tags: [],
    requirement: "Tally + GST",
    walkIn: false,
    workFromHome: false,
    noExperience: false,
    urgent: false,
  }),
  job({
    id: "7205",
    slug: "customer-support-nova-marathahalli-7205",
    title: "Customer Support — Voice",
    company: "Nova BPO",
    logo: "N",
    area: "marathahalli",
    areaLabel: "Marathahalli",
    category: "non-it",
    salaryMin: 18000,
    salaryMax: 24000,
    salaryDisplay: "₹18–24k/mo",
    shift: "evening",
    shiftLabel: "2–11 pm",
    distanceKm: 8.4,
    postedHoursAgo: 44,
    tags: ["Work from home"],
    requirement: "Freshers OK",
    walkIn: false,
    workFromHome: true,
    noExperience: true,
    urgent: false,
  }),
];

/** Approximate centers for the mock areas. Real per-job lat/lng arrives with
 *  the backend; until then each job is nudged off its area center by a stable
 *  offset derived from its id, so pins spread out instead of stacking. */
const AREA_COORDS: Record<string, [number, number]> = {
  koramangala: [12.9352, 77.6245],
  "hsr-layout": [12.9116, 77.6389],
  "btm-layout": [12.9166, 77.6101],
  indiranagar: [12.9784, 77.6408],
  whitefield: [12.9698, 77.75],
  "electronic-city": [12.8452, 77.6602],
  marathahalli: [12.9591, 77.6974],
  jayanagar: [12.925, 77.5938],
  hebbal: [13.0358, 77.597],
  domlur: [12.9606, 77.6386],
};

const BENGALURU: [number, number] = [12.9716, 77.5946];

export function jobCoords(job: Job): [number, number] {
  const [lat, lng] = AREA_COORDS[job.area] ?? BENGALURU;
  const n = Number(job.id);
  return [lat + ((n % 7) - 3) * 0.0035, lng + ((n % 5) - 2) * 0.0042];
}

/** Compact salary for a map pin — "₹18–22k/mo" reads as "₹18–22k". */
export function pinLabel(job: Job): string {
  return job.salaryDisplay.replace(/\/(mo|day|hr)$/, "");
}

/** Counts shown on the home tiles and the filter rail. */
export function countByCategory(id: JobCategory): number {
  return JOBS.filter((j) => j.category === id).length;
}

/* ------------------------------------------------------------------ *
 * Detail-page fields.
 * Only the jobs drawn in the template deck carry hand-written copy; the
 * rest derive plausible values from what the card already knows, so every
 * job has a complete detail page without 16 blocks of invented prose.
 * ------------------------------------------------------------------ */

export interface JobDetail {
  about: string;
  requirements: string[];
  benefits: string[];
  address: string;
  experience: string;
  openings: number;
  verified: boolean;
  applicants: number;
  closesInDays: number;
}

const DETAIL_OVERRIDES: Record<string, Partial<JobDetail>> = {
  "8412": {
    about:
      "Deliver grocery orders from the Koramangala 5th Block dark store to customers within a 3 km radius. Evening shift only — pick up your assigned orders at the store, and the app routes you door to door. Weekly payouts, no monthly waiting.",
    requirements: [
      "Own two-wheeler with valid DL",
      "Android phone · basic English or Kannada",
      "Age 18–35 · available 6 days/week",
    ],
    benefits: ["₹18,000 base + ₹4,000 incentives · weekly payout", "Fuel allowance · accident insurance"],
    address: "80 Feet Rd, Koramangala 5th Block",
    experience: "Freshers OK",
    openings: 12,
    applicants: 46,
    closesInDays: 7,
  },
  "9101": {
    about:
      "Join a six-person product team building the customer-facing web app. You will own features end to end — from design handoff through release — working in React, TypeScript and Next.js. Hybrid: three days a week in the Domlur office.",
    requirements: ["2+ years with React and TypeScript", "Comfortable with REST APIs and Git", "Portfolio or GitHub link"],
    benefits: ["₹9–14 LPA based on experience", "Health insurance for you and dependents", "Annual learning budget"],
    address: "100 Feet Rd, Domlur",
    experience: "2 years",
    openings: 2,
  },
};

export function jobDetail(job: Job): JobDetail {
  const n = Number(job.id);
  const base: JobDetail = {
    about: `${job.company} is hiring a ${job.title} in ${job.areaLabel}. This is a ${
      job.category === "part-time" ? "flexible-shift" : "full-time"
    } role — ${job.shiftLabel.toLowerCase()}, ${job.distanceKm} km from you.`,
    requirements: [job.requirement, job.noExperience ? "No prior experience needed" : "Relevant experience preferred"],
    benefits: [`${job.salaryDisplay} · paid on time, every cycle`],
    address: job.areaLabel,
    experience: job.noExperience ? "Freshers OK" : job.requirement,
    openings: (n % 8) + 1,
    verified: true,
    applicants: (n % 60) + 6,
    closesInDays: (n % 20) + 3,
  };
  return { ...base, ...DETAIL_OVERRIDES[job.id] };
}

/** Detail pages are reached by SEO slug; ids still resolve for older links. */
export function findJob(slugOrId: string): Job | undefined {
  return JOBS.find((j) => j.slug === slugOrId) ?? JOBS.find((j) => j.id === slugOrId);
}

/** "Similar jobs nearby" — same category first, closest by distance. */
export function similarJobs(job: Job, limit = 3): Job[] {
  return JOBS.filter((j) => j.id !== job.id && j.category === job.category)
    .sort((a, b) => Math.abs(a.distanceKm - job.distanceKm) - Math.abs(b.distanceKm - job.distanceKm))
    .slice(0, limit);
}

export function formatPosted(hours: number): string {
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
