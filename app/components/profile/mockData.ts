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

export const PROFILE_STATS: { label: string; sub: string }[] = [
  { label: "Saved nests", sub: "+2 this week" },
  { label: "Job applies", sub: "1 in interview" },
  { label: "Visits scheduled", sub: "next on Sat" },
];

export const DEMO_STAT_VALUES = [12, 5, 3];

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
