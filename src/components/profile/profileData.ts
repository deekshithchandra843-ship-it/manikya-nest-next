// Profile presentation config + shared types.
// Stat labels are static UI copy; the numeric values come from the session /
// backend at render time (real members start at zero until data exists).

export interface Stat {
  value: number;
  label: string;
  sub: string;
}

export const PROPERTY_STATS: { label: string; sub: string }[] = [
  { label: "Saved nests", sub: "—" },
  { label: "Visits scheduled", sub: "—" },
  { label: "Flatmate matches", sub: "—" },
];

export const CAREER_STATS: { label: string; sub: string }[] = [
  { label: "Job applies", sub: "—" },
  { label: "Saved jobs", sub: "—" },
  { label: "Upskill courses", sub: "—" },
];

export interface SavedNest {
  id: number;
  title: string;
  location: string;
  price: string;
  image: string;
  badge: string;
  rating: number;
}
