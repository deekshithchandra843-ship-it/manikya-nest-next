// Demand-side single source of truth. Mirrors categories.ts so a Supabase
// fetch can later replace REQUIREMENTS without touching any JSX.
import { World } from "./categories";
import { apiClient } from "./apiClient";

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

/** Roles a seeker can post as. Only demand-side roles are offered here — the
 *  seller/agent supply-side roles still exist in ROLES so existing feed items
 *  resolve, but they are not selectable on the requirements page. */
export function roleList(): RoleDef[] {
  return (["tenant", "buyer"] as Role[]).map((r) => ROLES[r]);
}

export function getRole(role: Role): RoleDef | undefined {
  return ROLES[role];
}

export interface Requirement {
  id: number;
  seekerId?: string;
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
  { id: 7, role: "tenant", category: "commercial-office", name: "Ananya Tech Corp", city: "Bengaluru", areas: ["HSR Layout"], budgetMin: 40000, budgetMax: 50000, budgetLabel: "₹40k–50k/mo", notes: "Needs 20+ seats, plug and play setup near HSR metro.", tags: ["Office", "IT Setup"], postedAt: "4h ago", responseCount: 0, verified: true },
  { id: 8, role: "tenant", category: "pg", name: "Karan Johar", city: "Bengaluru", areas: ["HSR Layout"], budgetMin: 10000, budgetMax: 14000, budgetLabel: "₹10k–14k/mo", moveIn: "Immediate", notes: "Single sharing or double sharing with AC in HSR.", tags: ["AC", "Bachelors"], postedAt: "10h ago", responseCount: 2 },
  { id: 9, role: "tenant", category: "rent", name: "Sanya Malhotra", city: "Bengaluru", areas: ["Koramangala", "HSR Layout"], budgetMin: 15000, budgetMax: 20000, budgetLabel: "₹15k–20k/mo", moveIn: "Within 2 weeks", bhk: "1 BHK", furnishing: "Fully furnished", notes: "Working professional, close to main road.", tags: ["Furnished", "Single"], postedAt: "1d ago", responseCount: 1 },
  { id: 10, role: "seller", category: "buy", name: "Rajesh Kumar", city: "Bengaluru", areas: ["HSR Layout"], budgetMin: 8500000, budgetMax: 9500000, budgetLabel: "₹85–95 L", bhk: "2 BHK", notes: "Looking for direct buyers or RERA agents in HSR.", tags: ["Direct Seller", "Clear Title"], postedAt: "3h ago", responseCount: 0 },
  { id: 11, role: "agent", name: "Kiran Real Estate", city: "Bengaluru", areas: ["Koramangala", "HSR Layout"], budgetMin: 0, budgetMax: 0, budgetLabel: "8 years exp · 120 properties", notes: "Specialist in residential leasing and luxury flats.", tags: ["Residential", "Leasing"], postedAt: "5h ago", responseCount: 12 },
  { id: 12, role: "tenant", category: "rent", name: "Ravi Sharma", city: "Bengaluru", areas: ["HSR Layout"], budgetMin: 15000, budgetMax: 22000, budgetLabel: "₹15k–22k/mo", moveIn: "Immediate", bhk: "1 BHK", furnishing: "Semi-furnished", notes: "Vegetarian preferred, single occupancy near Sector 2.", tags: ["Veg-only", "Immediate"], postedAt: "1d ago", responseCount: 3 }
];

const REQUIREMENTS_KEY = "findway.requirements";

export function getStoredRequirements(): Requirement[] {
  if (typeof window === "undefined") return REQUIREMENTS;
  const raw = window.localStorage.getItem(REQUIREMENTS_KEY);
  if (!raw) {
    window.localStorage.setItem(REQUIREMENTS_KEY, JSON.stringify(REQUIREMENTS));
    return REQUIREMENTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return REQUIREMENTS;
  }
}

export function addStoredRequirement(req: Requirement): Requirement[] {
  const current = getStoredRequirements();
  const next = [req, ...current];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(REQUIREMENTS_KEY, JSON.stringify(next));
  }
  return next;
}

export function deleteStoredRequirement(id: number): Requirement[] {
  const current = getStoredRequirements();
  const next = current.filter((r) => r.id !== id);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(REQUIREMENTS_KEY, JSON.stringify(next));
  }
  return next;
}

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

export async function fetchRequirementsApi(): Promise<Requirement[]> {
  try {
    const res = await apiClient.get<{ success: boolean; data: Requirement[] }>("/requirements");
    return res.data.data;
  } catch (e) {
    console.error("Error fetching requirements from backend, using fallback:", e);
    return getStoredRequirements();
  }
}

export async function createRequirementApi(req: Omit<Requirement, "id">): Promise<Requirement> {
  try {
    const res = await apiClient.post<{ success: boolean; data: Requirement }>("/requirements", req);
    return res.data.data;
  } catch (e) {
    console.error("Error posting requirement to backend, using fallback:", e);
    const next = addStoredRequirement(req as Requirement);
    return next[0];
  }
}

export async function deleteRequirementApi(id: number): Promise<boolean> {
  try {
    const res = await apiClient.delete<{ success: boolean }>(`/requirements/${id}`);
    return res.data.success;
  } catch (e) {
    console.error("Error deleting requirement on backend, using fallback:", e);
    deleteStoredRequirement(id);
    return true;
  }
}

export async function updateRequirementApi(req: Requirement): Promise<boolean> {
  try {
    const res = await apiClient.put<{ success: boolean }>(`/requirements/${req.id}`, req);
    return res.data.success;
  } catch (e) {
    console.error("Error updating requirement on backend:", e);
    return false;
  }
}
