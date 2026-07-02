// Demand-side single source of truth. Mirrors categories.ts so a Supabase
// fetch can later replace REQUIREMENTS without touching any JSX.
import { World } from "./categories";

export type Role = "tenant" | "buyer" | "seller" | "agent";

export interface RoleDef {
  role: Role;
  label: string;
  tagline: string;
  /** Verb shown on the feed card, e.g. "Looking to rent". */
  intentVerb: string;
  /** Which CATEGORIES worlds this role can target. */
  worlds: World[];
}

export const ROLES: Record<Role, RoleDef> = {
  tenant: { role: "tenant", label: "Tenant", tagline: "Tell owners what you want to rent", intentVerb: "Looking to rent", worlds: ["residential", "stay"] },
  buyer: { role: "buyer", label: "Buyer", tagline: "Let sellers & agents reach you", intentVerb: "Wants to buy", worlds: ["residential", "commercial"] },
  seller: { role: "seller", label: "Seller", tagline: "Find buyers and agents for your property", intentVerb: "Selling — wants buyers", worlds: ["residential", "commercial"] },
  agent: { role: "agent", label: "Agent", tagline: "Publish your coverage and get leads", intentVerb: "Agent — open for leads", worlds: ["residential", "commercial", "stay"] },
};

export function roleList(): RoleDef[] {
  return (["tenant", "buyer"] as Role[]).map((r) => ROLES[r]);
}

export function getRole(role: Role): RoleDef | undefined {
  return ROLES[role];
}

export interface Requirement {
  id: number;
  role: Role;
  category?: string;        // CategoryDef.slug for tenant/buyer/seller
  name: string;
  city: string;
  areas: string[];
  budgetMin: number;
  budgetMax: number;
  budgetLabel: string;      // e.g. "₹25k–35k/mo" or "₹1.1–1.5 Cr"
  moveIn?: string;
  bhk?: string;
  furnishing?: string;
  notes?: string;
  tags: string[];
  postedAt: string;         // relative display string
  responseCount: number;
  verified?: boolean;
}

export const REQUIREMENTS: Requirement[] = [
  { id: 1, role: "tenant", category: "rent", name: "Aarav S.", city: "Bengaluru", areas: ["Indiranagar", "HSR Layout"], budgetMin: 25000, budgetMax: 35000, budgetLabel: "₹25k–35k/mo", moveIn: "Within 1 month", bhk: "2 BHK", furnishing: "Semi-furnished", notes: "Working couple, no pets.", tags: ["Family", "Non-smoker"], postedAt: "2h ago", responseCount: 4, verified: true },
  { id: 2, role: "tenant", category: "pg", name: "Meera R.", city: "Bengaluru", areas: ["Koramangala"], budgetMin: 7000, budgetMax: 10000, budgetLabel: "₹7k–10k/mo", moveIn: "Immediate", notes: "Women's PG with meals.", tags: ["Women", "Meals"], postedAt: "5h ago", responseCount: 9 },
  { id: 3, role: "tenant", category: "coliving", name: "Dev P.", city: "Bengaluru", areas: ["Whitefield", "Marathahalli"], budgetMin: 12000, budgetMax: 16000, budgetLabel: "₹12k–16k/mo", moveIn: "Within 2 weeks", furnishing: "Furnished", tags: ["Professionals", "All-inclusive"], postedAt: "1d ago", responseCount: 3 },
  { id: 4, role: "buyer", category: "buy", name: "Nikhil & Priya", city: "Bengaluru", areas: ["Sarjapur Road", "HSR Layout"], budgetMin: 11000000, budgetMax: 15000000, budgetLabel: "₹1.1–1.5 Cr", bhk: "3 BHK", notes: "Ready to move, loan pre-approved.", tags: ["Ready to move", "Loan needed"], postedAt: "3h ago", responseCount: 6, verified: true },
  { id: 5, role: "buyer", category: "buy", name: "Rohit K.", city: "Bengaluru", areas: ["Electronic City"], budgetMin: 6000000, budgetMax: 8000000, budgetLabel: "₹60–80 L", bhk: "2 BHK", tags: ["Under construction", "Investor"], postedAt: "6h ago", responseCount: 2 },
  { id: 6, role: "buyer", category: "land", name: "Sunil Traders", city: "Bengaluru", areas: ["Devanahalli"], budgetMin: 25000000, budgetMax: 35000000, budgetLabel: "₹2.5–3.5 Cr", notes: "Commercial corner plot near airport road.", tags: ["Corner plot", "Clear title"], postedAt: "2d ago", responseCount: 1 },
];

export function requirementsForRole(role: Role): Requirement[] {
  return REQUIREMENTS.filter((r) => r.role === role);
}

export interface MatchCriteria {
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  areas?: string[];
  bhk?: string;
}

/**
 * Deterministic 0–100 match between a requirement and a responder's offering.
 * Budget overlap 40, area overlap 35, category 15, BHK 10. Pure — no AI.
 */
export function matchScore(req: Requirement, c: MatchCriteria): number {
  let score = 0;

  // Budget overlap (40). Full marks when ranges overlap at all; partial by closeness.
  if (c.budgetMin != null && c.budgetMax != null && req.budgetMax > 0) {
    const overlap = Math.min(req.budgetMax, c.budgetMax) - Math.max(req.budgetMin, c.budgetMin);
    if (overlap >= 0) score += 40;
    else {
      const gap = -overlap;
      const span = Math.max(req.budgetMax - req.budgetMin, c.budgetMax - c.budgetMin, 1);
      score += Math.max(0, Math.round(40 * (1 - gap / span)));
    }
  }

  // Area overlap (35).
  if (c.areas && c.areas.length && req.areas.length) {
    const set = new Set(req.areas.map((a) => a.toLowerCase()));
    const hit = c.areas.some((a) => set.has(a.toLowerCase()));
    if (hit) score += 35;
  }

  // Category (15).
  if (c.category && req.category && c.category === req.category) score += 15;

  // BHK (10).
  if (c.bhk && req.bhk && c.bhk === req.bhk) score += 10;

  return Math.min(100, score);
}
