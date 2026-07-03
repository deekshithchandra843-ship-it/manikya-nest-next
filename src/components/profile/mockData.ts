// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — frontend only. Everything below is placeholder content shown for
// the demo accounts; the later backend swap replaces this module wholesale.
// Fresh sign-ups intentionally get EMPTY lists so the designed empty states
// (and the eventual real API behaviour) are visible from day one.
// ─────────────────────────────────────────────────────────────────────────────

export interface Stat {
  value: number;
  label: string;
  sub: string;
}

export const PROPERTY_STATS: { label: string; sub: string }[] = [
  { label: "Saved nests", sub: "+2 this week" },
  { label: "Visits scheduled", sub: "next on Sat" },
  { label: "Flatmate matches", sub: "3 new profiles" },
];

export const DEMO_PROPERTY_STAT_VALUES = [12, 3, 5];

export const CAREER_STATS: { label: string; sub: string }[] = [
  { label: "Job applies", sub: "1 in interview" },
  { label: "Saved jobs", sub: "+3 active roles" },
  { label: "Upskill courses", sub: "1 in progress" },
];

export const DEMO_CAREER_STAT_VALUES = [5, 8, 2];

export interface MockSavedNest {
  id: number;
  title: string;
  location: string;
  price: string;
  image: string;
  badge: string;
  rating: number;
}

export const DEMO_SAVED_NESTS: MockSavedNest[] = [
  {
    id: 1,
    title: "Green Meadows PG for Men",
    location: "Koramangala, Bengaluru",
    price: "₹8,500/mo",
    image: "/categories/pg.jpg",
    badge: "PG",
    rating: 4.5,
  },
  {
    id: 2,
    title: "Lakeside 1BHK Rental Flat",
    location: "Indiranagar, Bengaluru",
    price: "₹18,500/mo",
    image: "/categories/rent.jpg",
    badge: "Flat",
    rating: 4.3,
  },
];

export interface MockApplication {
  role: string;
  company: string;
  stage: "Applied" | "Shortlisted" | "Interview";
}

export const DEMO_APPLICATIONS: MockApplication[] = [
  { role: "Frontend Developer", company: "Flipkart", stage: "Interview" },
  { role: "Data Analyst", company: "Razorpay", stage: "Applied" },
  { role: "Product Design Intern", company: "Swiggy", stage: "Shortlisted" },
];

export const DEMO_SKILLS = ["React", "TypeScript", "Tailwind", "Figma", "SQL"];

export const DEMO_EXPERIENCE = [
  { role: "Frontend Developer", org: "Razorpay", period: "2024 – Present" },
  { role: "Web Dev Intern", org: "Unacademy", period: "2023 – 2024" },
];

export const DEMO_EDUCATION = [
  { degree: "B.E. Computer Science", org: "RV College of Engineering", period: "2019 – 2023" },
];
