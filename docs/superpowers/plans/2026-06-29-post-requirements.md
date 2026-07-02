# Post Your Requirements (demand-side) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a demand-side "Post Your Requirements" feature where seekers post what they want (one adaptive form across Tenant/Buyer/Seller/Agent roles), browse a feed of requirements, and respond with a computed match score — all on mock data + local state.

**Architecture:** Mirror the existing `app/lib/categories.ts` single-source-of-truth pattern in a new `app/lib/requirements.ts` (types, role config, seed array, pure helpers including `matchScore`). Build the UI by reusing the field-config engine and toggles from `app/post/page.tsx`, the world toggle/grid from `app/explore/page.tsx`, and a new `RequirementCard` adapted from `ListingCard`. No backend; data flows through the lib module so a Supabase fetch can replace the arrays later without touching JSX.

**Tech Stack:** Next.js 16.2.7 (App Router, modified — read `node_modules/next/dist/docs/` before using any API), React 19.2.4, Tailwind v4, TypeScript 5. Client components (`"use client"`).

## Global Constraints

- **No new dependencies.** Only `next`, `react`, `react-dom` are allowed (see `package.json`).
- **No test runner exists.** The verification loop for every task is: `npx tsc --noEmit` (types) → `npx next build` (build gate) → documented manual behavioral checks in `next dev` at **390px and 1280px**. Treat a failing build as a failing test.
- **This is a modified Next.js.** Read the relevant guide under `node_modules/next/dist/docs/` before writing any code that touches a Next API (per `AGENTS.md`).
- **Design tokens only:** Rausch `#ff385c` via `bg-rausch`/`text-rausch`; `bg-canvas`, `text-ink`/`text-body`/`text-muted`, `border-hairline`, `shadow-airbnb`, radii `rounded-[8px]`/`rounded-[14px]`. No raw hex outside existing gradient strings.
- **Accessibility parity:** every interactive control is keyboard-focusable with a visible focus ring (`focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2`), and toggles use `aria-pressed` — matching the rest of the app.
- **Data discipline:** no requirement data hardcoded in JSX; everything reads from `app/lib/requirements.ts`.
- **Commit after every task** with a `feat:`/`chore:` message.

---

### Task 1: Data layer — `app/lib/requirements.ts`

**Files:**
- Create: `nestnext-main/app/lib/requirements.ts`

**Interfaces:**
- Consumes: `World`, `CategoryDef` from `app/lib/categories.ts` (existing).
- Produces:
  - `type Role = "tenant" | "buyer" | "seller" | "agent"`
  - `interface RoleDef { role: Role; label: string; tagline: string; intentVerb: string; worlds: World[] }`
  - `interface Requirement { id: number; role: Role; category?: string; name: string; city: string; areas: string[]; budgetMin: number; budgetMax: number; budgetLabel: string; moveIn?: string; bhk?: string; furnishing?: string; notes?: string; tags: string[]; postedAt: string; responseCount: number; verified?: boolean }`
  - `const ROLES: Record<Role, RoleDef>`
  - `const REQUIREMENTS: Requirement[]` (seed)
  - `function roleList(): RoleDef[]`
  - `function getRole(role: Role): RoleDef | undefined`
  - `function requirementsForRole(role: Role): Requirement[]`
  - `interface MatchCriteria { category?: string; budgetMin?: number; budgetMax?: number; areas?: string[]; bhk?: string }`
  - `function matchScore(req: Requirement, c: MatchCriteria): number` — integer 0–100.

- [ ] **Step 1: Write the type definitions and role config**

```ts
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
  return (["tenant", "buyer", "seller", "agent"] as Role[]).map((r) => ROLES[r]);
}

export function getRole(role: Role): RoleDef | undefined {
  return ROLES[role];
}
```

- [ ] **Step 2: Add the `Requirement` type and seed array**

Append to the same file. Seed **12 rows** spanning all four roles and a mix of worlds, reusing `LISTINGS` localities (Indiranagar, Koramangala, HSR, Whitefield, Electronic City, Marathahalli, BTM). Each row must be internally consistent (`budgetLabel` matches `budgetMin`/`budgetMax`; `category` belongs to a world in that role's `worlds`).

```ts
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
  { id: 7, role: "seller", category: "rent", name: "Lakshmi N.", city: "Bengaluru", areas: ["Jayanagar"], budgetMin: 28000, budgetMax: 28000, budgetLabel: "₹28k/mo asking", bhk: "2 BHK", furnishing: "Furnished", notes: "Available from next month, prefer family.", tags: ["Open to agents", "Family only"], postedAt: "4h ago", responseCount: 5 },
  { id: 8, role: "seller", category: "buy", name: "George M.", city: "Bengaluru", areas: ["Indiranagar"], budgetMin: 18500000, budgetMax: 18500000, budgetLabel: "₹1.85 Cr asking", bhk: "3 BHK", notes: "Resale, RERA project. Sell within 60 days.", tags: ["Open to agents", "Resale"], postedAt: "1d ago", responseCount: 7, verified: true },
  { id: 9, role: "seller", category: "commercial-shop", name: "Anil Stores", city: "Bengaluru", areas: ["Jayanagar 4th Block"], budgetMin: 95000, budgetMax: 95000, budgetLabel: "₹95k/mo asking", notes: "High-street showroom, ground floor.", tags: ["High street"], postedAt: "3d ago", responseCount: 2 },
  { id: 10, role: "agent", name: "Bengaluru Homes Co.", city: "Bengaluru", areas: ["Indiranagar", "Koramangala", "HSR Layout"], budgetMin: 0, budgetMax: 0, budgetLabel: "Residential rentals & resale", notes: "8 yrs · 120+ live properties · English, Hindi, Kannada.", tags: ["Residential", "Luxury"], postedAt: "2h ago", responseCount: 0, verified: true },
  { id: 11, role: "agent", name: "Prime Commercial", city: "Bengaluru", areas: ["Outer Ring Road", "Whitefield"], budgetMin: 0, budgetMax: 0, budgetLabel: "Office & warehouse leasing", notes: "12 yrs · Grade-A office specialist.", tags: ["Commercial", "Leasing"], postedAt: "1d ago", responseCount: 0 },
  { id: 12, role: "agent", name: "StayWise Rentals", city: "Bengaluru", areas: ["MG Road", "Indiranagar"], budgetMin: 0, budgetMax: 0, budgetLabel: "Service apartments & homestays", notes: "5 yrs · short & long stay.", tags: ["Stay", "Furnished"], postedAt: "2d ago", responseCount: 0 },
];

export function requirementsForRole(role: Role): Requirement[] {
  return REQUIREMENTS.filter((r) => r.role === role);
}
```

- [ ] **Step 3: Add the pure `matchScore` helper**

```ts
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
```

- [ ] **Step 4: Typecheck and verify the seed data by inspection**

Run: `npx tsc --noEmit`
Expected: no errors.

Manual data check (read the array): every `category` value exists as a slug in `CATEGORIES` (categories.ts), and for each row `getRole(row.role).worlds` includes `getCategory(row.category)?.world`. Agent rows have no `category`. Confirm all 12 rows pass before continuing.

- [ ] **Step 5: Commit**

```bash
git add nestnext-main/app/lib/requirements.ts
git commit -m "feat: add requirements data layer (roles, seed, matchScore)"
```

---

### Task 2: Navbar tab + `/requirements` route with role selector + adaptive form

**Files:**
- Modify: `nestnext-main/app/components/Navbar.tsx` (the `navLinks` array, ~line 7)
- Create: `nestnext-main/app/requirements/page.tsx`

**Interfaces:**
- Consumes: `roleList`, `getRole`, `ROLES`, `Role`, `Requirement`, `REQUIREMENTS` from Task 1; `World`, `categoriesForWorld`, `getCategory` from `categories.ts`.
- Produces: a client page exporting default `RequirementsPage`; holds `requirements` state (`useState<Requirement[]>(REQUIREMENTS)`) that Task 3/5/6 extend. Exposes the role selector + form shell.

- [ ] **Step 1: Add the nav tab**

In `app/components/Navbar.tsx`, change the `navLinks` array to include Requirements after Explore:

```tsx
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/requirements", label: "Requirements" },
  { href: "/jobs", label: "Jobs" },
  { href: "/whats-next", label: "What's Next" },
];
```

- [ ] **Step 2: Scaffold the page with role selector and form shell**

Create `app/requirements/page.tsx`. Reuse the `field`/`labelCls` style strings and the segmented-toggle markup from `app/post/page.tsx`. The role selector is 4 tabs styled like the Owner/Broker toggle; selecting a role resets `world` to the first of `getRole(role).worlds` and `slug` to the first category of that world.

```tsx
"use client";
import { useState } from "react";
import PageLayout from "../components/PageLayout";
import { Role, roleList, getRole, Requirement, REQUIREMENTS } from "../lib/requirements";
import { World, categoriesForWorld } from "../lib/categories";

const cities = ["Bengaluru", "Hyderabad", "Chennai", "Mumbai", "Pune", "Delhi NCR", "Kolkata"];
const field = "w-full border border-hairline rounded-[8px] px-3 h-12 text-sm text-ink outline-none focus:border-ink focus:border-2 transition-colors bg-canvas";
const labelCls = "text-[13px] font-medium text-ink block mb-1.5";

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>(REQUIREMENTS);
  const [role, setRole] = useState<Role>("tenant");
  const [world, setWorld] = useState<World>("residential");
  const [slug, setSlug] = useState("rent");

  const chooseRole = (r: Role) => {
    setRole(r);
    const w = getRole(r)!.worlds[0];
    setWorld(w);
    setSlug(categoriesForWorld(w)[0].slug);
  };
  const chooseWorld = (w: World) => {
    setWorld(w);
    setSlug(categoriesForWorld(w)[0].slug);
  };

  const roleDef = getRole(role)!;
  const worldCategories = categoriesForWorld(world);
  const showCategory = role !== "agent";

  return (
    <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Post a requirement" }]}>
      <section className="max-w-[760px] mx-auto">
        <h1 className="text-[clamp(26px,4vw,40px)] font-bold text-ink tracking-tight mb-2">Post your requirement</h1>
        <p className="text-base text-body mb-6">{roleDef.tagline}</p>

        {/* Role selector */}
        <div role="group" aria-label="Your role" className="flex items-center bg-surface-soft rounded-[8px] p-1 mb-6">
          {roleList().map((rd) => {
            const on = role === rd.role;
            return (
              <button key={rd.role} type="button" onClick={() => chooseRole(rd.role)} aria-pressed={on}
                className={`flex-1 py-2 text-sm font-semibold rounded-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${on ? "bg-ink text-white shadow-airbnb" : "text-muted hover:text-ink"}`}>
                {rd.label}
              </button>
            );
          })}
        </div>

        {/* World toggle (hidden for single-world cases) */}
        {roleDef.worlds.length > 1 && (
          <>
            <label className={labelCls}>Property type</label>
            <div role="group" aria-label="Property world" className="inline-flex items-center gap-1 bg-surface-soft border border-hairline-soft rounded-full p-1 mb-5 w-full">
              {roleDef.worlds.map((w) => {
                const on = world === w;
                return (
                  <button key={w} type="button" onClick={() => chooseWorld(w)} aria-pressed={on}
                    className={`flex-1 py-2 text-sm font-semibold rounded-full capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${on ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>
                    {w}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Category chips */}
        {showCategory && (
          <>
            <label className={labelCls}>{role === "seller" ? "What are you selling/renting out?" : "What are you looking for?"}</label>
            <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Category">
              {worldCategories.map((c) => {
                const on = slug === c.slug;
                return (
                  <button key={c.slug} type="button" onClick={() => setSlug(c.slug)} aria-pressed={on}
                    className={`px-3 py-1.5 text-sm font-medium rounded-[8px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${on ? "bg-rausch text-white border-rausch" : "bg-canvas text-body border-hairline hover:border-ink"}`}>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Form fields injected in Task 3 */}
        <div id="requirement-fields" className="text-sm text-muted">Form fields added in Task 3.</div>
      </section>
    </PageLayout>
  );
}
```

> Note: `cities`, `field`, `labelCls` are declared now because Task 3 uses them. If your linter flags them as unused before Task 3, that is expected and resolved by Task 3.

- [ ] **Step 3: Build and verify**

Run: `npx tsc --noEmit && npx next build`
Expected: build passes (route `/requirements` listed in output).

Manual (`npm run dev`, open `/requirements`): the Requirements tab is highlighted in nav; clicking Tenant/Buyer/Seller/Agent changes the tagline and the category chips; Agent hides the category chips and world toggle collapses appropriately. Check at 390px and 1280px.

- [ ] **Step 4: Commit**

```bash
git add nestnext-main/app/components/Navbar.tsx nestnext-main/app/requirements/page.tsx
git commit -m "feat: add requirements route with role selector and form shell"
```

---

### Task 3: Adaptive field config + form rendering + submit

**Files:**
- Modify: `nestnext-main/app/requirements/page.tsx`

**Interfaces:**
- Consumes: page state from Task 2 (`role`, `world`, `slug`, `requirements`, `setRequirements`).
- Produces: `requirementFields(role, slug)` returning a `FieldDef[]`; a `renderField`/`renderFieldGroup` pair (ported from `post/page.tsx`); a `handleSubmit` that builds a `Requirement` and prepends it to `requirements`. Exposes `submitted` boolean state for the success view (used by Task 5 feed scroll).

- [ ] **Step 1: Add the `FieldDef` type and `requirementFields` helper**

Port the `FieldDef` type from `post/page.tsx` (lines 56–65) verbatim, then add a role/category-aware config. Add near the top of the file (module scope):

```tsx
type FieldDef = {
  key: string;
  label: string;
  required?: boolean;
  half?: boolean;
} & (
  | { type: "text" | "number" | "date"; placeholder?: string }
  | { type: "select"; options: string[] }
  | { type: "pills"; options: string[] }
);

const bhkTypes = ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4+ BHK"];
const furnishings = ["Fully furnished", "Semi furnished", "Unfurnished"];

function requirementFields(role: Role, slug: string): FieldDef[] {
  if (role === "agent") {
    return [
      { key: "specialities", label: "Specialities", type: "pills", options: ["Residential", "Commercial", "Luxury", "Leasing", "Stay"] },
      { key: "years", label: "Years active", type: "number", placeholder: "e.g. 8", half: true },
      { key: "inventory", label: "Live properties", type: "number", placeholder: "e.g. 120", half: true },
      { key: "languages", label: "Languages", type: "text", placeholder: "English, Hindi, Kannada" },
    ];
  }
  if (role === "seller") {
    return [
      { key: "bhk", label: "Configuration", type: "select", options: bhkTypes },
      { key: "area", label: "Built-up area (sq ft)", type: "number", placeholder: "e.g. 1200", half: true },
      { key: "howSoon", label: "Sell within", type: "select", options: ["ASAP", "30 days", "60 days", "3 months"], half: true },
      { key: "openToAgents", label: "Open to agents", type: "pills", options: ["Yes", "No"] },
    ];
  }
  // tenant + buyer
  const isBuy = role === "buyer";
  const fields: FieldDef[] = [];
  if (slug !== "pg" && slug !== "coliving") {
    fields.push({ key: "bhk", label: "BHK type", type: "select", options: bhkTypes });
  }
  if (isBuy) {
    fields.push({ key: "possession", label: "Possession", type: "pills", options: ["Ready to move", "Under construction", "Any"] });
    fields.push({ key: "loan", label: "Loan needed", type: "pills", options: ["Yes", "No"] });
  } else {
    fields.push({ key: "moveIn", label: "Move-in", type: "select", options: ["Immediate", "Within 2 weeks", "Within 1 month", "Flexible"], half: true });
    fields.push({ key: "furnishing", label: "Furnishing", type: "select", options: furnishings, half: true });
    fields.push({ key: "occupancy", label: "Occupancy", type: "pills", options: ["Family", "Bachelors", "Students"] });
  }
  return fields;
}
```

- [ ] **Step 2: Add field state and the renderer (ported from post/page.tsx)**

Inside the component, add state and the renderer functions (port `renderField`/`renderFieldGroup` from `post/page.tsx` lines 214–269, adjusting only the local `form`/`set` names):

```tsx
const [form, setForm] = useState<Record<string, string>>({});
const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

// Shared inputs
const [name, setName] = useState("");
const [city, setCity] = useState("Bengaluru");
const [areas, setAreas] = useState<string[]>([]);
const [areaInput, setAreaInput] = useState("");
const [budgetMin, setBudgetMin] = useState("");
const [budgetMax, setBudgetMax] = useState("");
const [notes, setNotes] = useState("");

const addArea = () => {
  const a = areaInput.trim();
  if (a && !areas.includes(a)) setAreas((p) => [...p, a]);
  setAreaInput("");
};

const renderField = (f: FieldDef) => {
  if (f.type === "select") {
    return (
      <select value={form[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} className={`${field} ${form[f.key] ? "text-ink" : "text-muted"}`}>
        <option value="">Select</option>
        {f.options.map((o) => (<option key={o} value={o} className="text-ink">{o}</option>))}
      </select>
    );
  }
  if (f.type === "pills") {
    return (
      <div className="flex flex-wrap gap-2">
        {f.options.map((o) => {
          const on = form[f.key] === o;
          return (
            <button key={o} type="button" onClick={() => set(f.key, o)} aria-pressed={on}
              className={`px-4 py-2 text-sm font-medium rounded-[8px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${on ? "bg-rausch/10 border-rausch text-rausch" : "bg-canvas text-body border-hairline hover:border-ink"}`}>
              {o}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <input type={f.type === "number" ? "text" : f.type} inputMode={f.type === "number" ? "numeric" : undefined}
      value={form[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)}
      placeholder={"placeholder" in f ? f.placeholder : undefined} className={field} />
  );
};

const renderFieldGroup = (fields: FieldDef[]) => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-5">
    {fields.map((f) => (
      <div key={f.key} className={f.half ? "col-span-1" : "col-span-2"}>
        <label className={labelCls}>{f.label}{f.required && <span className="text-rausch"> *</span>}</label>
        {renderField(f)}
      </div>
    ))}
  </div>
);
```

- [ ] **Step 3: Build the budget + areas + identity block and replace the Task 2 placeholder**

Replace the `<div id="requirement-fields">…</div>` placeholder with the real form, a budget range (two inputs), an area multi-add, name/city, notes, and a submit button. Agent rows skip budget.

```tsx
{/* Category-aware fields */}
<div className="mb-6">{renderFieldGroup(requirementFields(role, slug))}</div>

{/* Budget range (not for agents) */}
{role !== "agent" && (
  <div className="grid grid-cols-2 gap-4 mb-5">
    <div>
      <label className={labelCls}>Budget min (₹)</label>
      <input inputMode="numeric" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="e.g. 25000" className={field} />
    </div>
    <div>
      <label className={labelCls}>Budget max (₹)</label>
      <input inputMode="numeric" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="e.g. 35000" className={field} />
    </div>
  </div>
)}

{/* Preferred areas (multi) */}
<label className={labelCls}>{role === "agent" ? "Coverage areas" : "Preferred areas"}</label>
<div className="flex gap-2 mb-2">
  <input value={areaInput} onChange={(e) => setAreaInput(e.target.value)}
    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addArea(); } }}
    placeholder="e.g. Koramangala" className={field} />
  <button type="button" onClick={addArea} className="px-4 h-12 shrink-0 border border-hairline rounded-[8px] text-sm font-medium text-ink hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink">Add</button>
</div>
<div className="flex flex-wrap gap-2 mb-5" aria-label="Selected areas">
  {areas.map((a) => (
    <span key={a} className="inline-flex items-center gap-1 text-sm bg-surface-soft text-ink px-3 py-1 rounded-full">
      {a}
      <button type="button" onClick={() => setAreas((p) => p.filter((x) => x !== a))} aria-label={`Remove ${a}`} className="text-muted hover:text-ink">✕</button>
    </span>
  ))}
</div>

{/* Name + city */}
<div className="grid grid-cols-2 gap-4 mb-5">
  <div>
    <label className={labelCls}>Name</label>
    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" className={field} />
  </div>
  <div>
    <label className={labelCls}>City</label>
    <select value={city} onChange={(e) => setCity(e.target.value)} className={`${field} text-ink`}>
      {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
    </select>
  </div>
</div>

{/* Notes */}
<label className={labelCls}>Tell {role === "agent" ? "clients" : "owners"} more</label>
<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
  placeholder="Anything that helps them respond better" className={`${field} h-auto py-2.5 resize-none mb-6`} />

<button type="button" onClick={handleSubmit}
  className="w-full h-12 bg-rausch text-white text-base font-semibold rounded-[8px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2">
  Post requirement
</button>
```

- [ ] **Step 4: Add `handleSubmit` building a `Requirement` and prepending it**

Add inside the component above the `return`:

```tsx
const [submitted, setSubmitted] = useState(false);

const fmtBudget = (min: string, max: string) => {
  const n = (v: string) => Number(v) || 0;
  const lakh = (v: number) => (v >= 10000000 ? `${(v / 10000000).toFixed(1)} Cr` : v >= 100000 ? `${Math.round(v / 100000)} L` : `${Math.round(v / 1000)}k`);
  if (role === "tenant") return `₹${lakh(n(min))}–${lakh(n(max))}/mo`;
  return `₹${lakh(n(min))}–${lakh(n(max))}`;
};

const handleSubmit = () => {
  const tags = [form.occupancy, form.possession === "Ready to move" ? "Ready to move" : undefined, form.loan === "Yes" ? "Loan needed" : undefined, form.openToAgents === "Yes" ? "Open to agents" : undefined].filter(Boolean) as string[];
  const req: Requirement = {
    id: Date.now(),
    role,
    category: role === "agent" ? undefined : slug,
    name: name || "You",
    city,
    areas,
    budgetMin: Number(budgetMin) || 0,
    budgetMax: Number(budgetMax) || 0,
    budgetLabel: role === "agent" ? (notes || "Agent profile") : fmtBudget(budgetMin, budgetMax),
    moveIn: form.moveIn,
    bhk: form.bhk,
    furnishing: form.furnishing,
    notes,
    tags,
    postedAt: "Just now",
    responseCount: 0,
  };
  setRequirements((p) => [req, ...p]);
  setSubmitted(true);
};
```

- [ ] **Step 5: Build and verify**

Run: `npx tsc --noEmit && npx next build`
Expected: build passes; no unused-variable errors remain.

Manual: fill the form as a Tenant (budget 25000–35000, add "Koramangala", pick 2 BHK), click **Post requirement** — `submitted` flips true (verify by temporarily rendering `{submitted && "posted"}`; the visible feed comes in Task 5). Switch to Agent: budget block disappears, fields become specialities/years/inventory/languages.

- [ ] **Step 6: Commit**

```bash
git add nestnext-main/app/requirements/page.tsx
git commit -m "feat: adaptive requirement form fields and submit"
```

---

### Task 4: `RequirementCard` component

**Files:**
- Create: `nestnext-main/app/components/RequirementCard.tsx`

**Interfaces:**
- Consumes: `Requirement`, `getRole` from Task 1.
- Produces: `export default function RequirementCard({ req, onRespond }: { req: Requirement; onRespond: (req: Requirement) => void })`.

- [ ] **Step 1: Write the component**

Adapt the structure/idioms from `ListingCard.tsx` (badge, tag pills, focus rings, tokens). No image; this is a demand card.

```tsx
"use client";
import { Requirement, getRole } from "../lib/requirements";

export default function RequirementCard({ req, onRespond }: { req: Requirement; onRespond: (req: Requirement) => void }) {
  const roleDef = getRole(req.role)!;
  const isAgent = req.role === "agent";

  return (
    <div className="bg-canvas border border-hairline rounded-[14px] p-4 hover-lift hover:shadow-airbnb">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold text-ink bg-surface-soft px-2.5 py-1 rounded-full">{roleDef.label}</span>
        {req.verified && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rausch bg-rausch/10 px-2 py-0.5 rounded-full">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Verified
          </span>
        )}
      </div>

      <p className="text-[15px] font-semibold text-ink mt-2 line-clamp-1">
        {roleDef.intentVerb}{req.bhk ? ` · ${req.bhk}` : ""}
      </p>
      <p className="text-sm text-muted mt-0.5 line-clamp-1">
        {req.areas.length ? req.areas.join(", ") : req.city} · {req.city}
      </p>

      <p className="text-[15px] text-ink font-semibold mt-2">{req.budgetLabel}</p>

      {req.notes && <p className="text-[13px] text-body mt-2 line-clamp-2">{req.notes}</p>}

      {req.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {req.tags.slice(0, 4).map((t) => (
            <span key={t} className="text-[12px] text-muted bg-surface-soft px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-hairline">
        <span className="text-[12px] text-muted">
          {req.postedAt}{!isAgent && req.responseCount > 0 ? ` · ${req.responseCount} responded` : ""}
        </span>
        <button type="button" onClick={() => onRespond(req)}
          className="px-4 py-2 text-sm font-semibold text-white bg-rausch rounded-[8px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2">
          {isAgent ? "Contact agent" : "Respond"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npx tsc --noEmit && npx next build`
Expected: build passes.

- [ ] **Step 3: Commit**

```bash
git add nestnext-main/app/components/RequirementCard.tsx
git commit -m "feat: add RequirementCard component"
```

---

### Task 5: Feed + filters on `/requirements`

**Files:**
- Modify: `nestnext-main/app/requirements/page.tsx`

**Interfaces:**
- Consumes: `requirements` state (Task 2/3), `RequirementCard` (Task 4), `roleList` (Task 1).
- Produces: a filtered feed section below the form; `respondTarget` state (`useState<Requirement | null>(null)`) and an `onRespond` handler stub that Task 6 fills.

- [ ] **Step 1: Add filter state and derived list**

Add to the component:

```tsx
const [filterRole, setFilterRole] = useState<Role | "all">("all");
const [respondTarget, setRespondTarget] = useState<Requirement | null>(null);

const feed = requirements.filter((r) => filterRole === "all" || r.role === filterRole);
```

- [ ] **Step 2: Render the feed below the form section**

After the closing `</section>` of the form, add:

```tsx
<section className="max-w-[1100px] mx-auto mt-14">
  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
    <h2 className="text-[22px] md:text-[26px] font-bold tracking-tight text-ink">Recent requirements</h2>
    <div role="group" aria-label="Filter by role" className="inline-flex items-center gap-1 bg-surface-soft border border-hairline-soft rounded-full p-1">
      {(["all", "tenant", "buyer", "seller", "agent"] as const).map((r) => {
        const on = filterRole === r;
        return (
          <button key={r} type="button" onClick={() => setFilterRole(r)} aria-pressed={on}
            className={`px-3 py-1.5 text-sm font-semibold rounded-full capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${on ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>
            {r === "all" ? "All" : roleList().find((x) => x.role === r)!.label}
          </button>
        );
      })}
    </div>
  </div>

  {feed.length === 0 ? (
    <p className="text-sm text-muted py-10 text-center">No requirements match this filter yet.</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {feed.map((r) => (<RequirementCard key={r.id} req={r} onRespond={setRespondTarget} />))}
    </div>
  )}
</section>
```

Add the import at the top: `import RequirementCard from "../components/RequirementCard";`

- [ ] **Step 3: Make submit reveal the new card in the feed**

In `handleSubmit` (Task 3), after `setSubmitted(true)`, set the role filter so the new post is visible and scroll to the feed:

```tsx
setFilterRole("all");
if (typeof document !== "undefined") {
  document.getElementById("requirements-feed")?.scrollIntoView({ behavior: "smooth" });
}
```

Add `id="requirements-feed"` to the feed `<section>` opening tag.

- [ ] **Step 4: Build and verify**

Run: `npx tsc --noEmit && npx next build`
Expected: build passes.

Manual: feed shows 12 seed cards; role filter narrows them; posting a new requirement prepends a card and scrolls to it. Check grid reflows 1→2→3 columns across 390px / 768px / 1280px.

- [ ] **Step 5: Commit**

```bash
git add nestnext-main/app/requirements/page.tsx
git commit -m "feat: requirements feed with role filter"
```

---

### Task 6: Respond modal with match badge + counter increment

**Files:**
- Create: `nestnext-main/app/components/RespondModal.tsx`
- Modify: `nestnext-main/app/requirements/page.tsx`

**Interfaces:**
- Consumes: `Requirement`, `matchScore`, `getRole` from Task 1; `respondTarget`/`setRespondTarget`/`setRequirements` from the page.
- Produces: `export default function RespondModal({ req, onClose, onSent }: { req: Requirement; onClose: () => void; onSent: (id: number) => void })`.

- [ ] **Step 1: Write the modal**

Use a fixed overlay like the Navbar mobile drawer (no new dependency). Compute a match using `matchScore` against a small responder criteria derived from the requirement itself (demo: an owner whose inventory matches the same category/area/budget → high score). On send, call `onSent(req.id)`.

```tsx
"use client";
import { Requirement, matchScore, getRole } from "../lib/requirements";

export default function RespondModal({ req, onClose, onSent }: { req: Requirement; onClose: () => void; onSent: (id: number) => void }) {
  const isAgent = req.role === "agent";
  // Demo responder: an owner with matching inventory in the same area/category/budget.
  const score = isAgent ? 100 : matchScore(req, {
    category: req.category,
    areas: req.areas,
    budgetMin: req.budgetMin,
    budgetMax: req.budgetMax,
    bhk: req.bhk,
  });

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Respond to requirement">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-[420px] bg-canvas rounded-t-[20px] sm:rounded-[20px] shadow-airbnb border border-hairline-soft p-6 animate-fade-up">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[17px] font-bold text-ink">{getRole(req.role)!.intentVerb}</p>
            <p className="text-sm text-muted">{req.areas.join(", ") || req.city} · {req.budgetLabel}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-ink p-1">✕</button>
        </div>

        {!isAgent && (
          <div className="flex items-center gap-3 mb-5 p-3 rounded-[14px] bg-rausch/5 border border-rausch/30">
            <span className="shrink-0 text-[15px] font-bold text-white bg-rausch rounded-full w-12 h-12 flex items-center justify-center tabular-nums">{score}%</span>
            <p className="text-sm text-body">Estimated match with your inventory. Higher means a closer fit on budget, area and type.</p>
          </div>
        )}

        <button type="button"
          onClick={() => { onSent(req.id); onClose(); }}
          className="w-full h-12 bg-rausch text-white text-base font-semibold rounded-[8px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2">
          {isAgent ? "Contact agent" : "Send response"}
        </button>
        <p className="text-[12px] text-muted text-center mt-3">They'll reach out on WhatsApp. Your number stays masked until you both connect.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire the modal into the page**

In `app/requirements/page.tsx`, add the import and render the modal when `respondTarget` is set; increment that requirement's `responseCount` on send.

```tsx
import RespondModal from "../components/RespondModal";

// ...inside the component, before the closing </PageLayout>:
{respondTarget && (
  <RespondModal
    req={respondTarget}
    onClose={() => setRespondTarget(null)}
    onSent={(id) => setRequirements((p) => p.map((r) => (r.id === id ? { ...r, responseCount: r.responseCount + 1 } : r)))}
  />
)}
```

- [ ] **Step 3: Build and verify**

Run: `npx tsc --noEmit && npx next build`
Expected: build passes.

Manual: click **Respond** on the seed Tenant row #1 (`rent`, Indiranagar/HSR, ₹25k–35k, 2 BHK) — modal shows a match badge. Because the demo responder criteria are derived from the requirement itself, the score is **100%** for non-agent rows (full budget/area/category/BHK match); confirm the badge renders an integer with `%`. Click **Send response** — modal closes and the card's "responded" count increases by 1. Agent rows show "Contact agent" with no match badge.

- [ ] **Step 4: Commit**

```bash
git add nestnext-main/app/components/RespondModal.tsx nestnext-main/app/requirements/page.tsx
git commit -m "feat: respond modal with match badge and response counter"
```

---

### Task 7: Responsive + a11y polish and final verification

**Files:**
- Modify: `nestnext-main/app/requirements/page.tsx` (only if checks surface issues)

**Interfaces:**
- Consumes: everything above. Produces: no new exports.

- [ ] **Step 1: Remove the temporary `submitted` debug render**

If you added a temporary `{submitted && "posted"}` indicator in Task 3, replace it with a real inline success note above the form:

```tsx
{submitted && (
  <p className="text-sm font-medium text-rausch mb-4" role="status">Requirement posted — see it in the feed below.</p>
)}
```

- [ ] **Step 2: Full manual sweep**

Run `npm run dev`. For each role (Tenant, Buyer, Seller, Agent): the form fields change correctly; you can post a requirement; it appears in the feed; Respond/Contact works and increments the counter. At **390px**: role selector, world toggle, chips, budget inputs, and feed are all usable and not clipped; modal docks to the bottom. At **1280px**: feed is a 3-column grid; form is centered and readable.

- [ ] **Step 3: Lint + typecheck + build gate**

Run: `npx eslint app/requirements app/components/RequirementCard.tsx app/components/RespondModal.tsx`
Expected: no errors (warnings acceptable if pre-existing in the codebase style).

Run: `npx tsc --noEmit && npx next build`
Expected: build passes; `/requirements` route present in the output (14 routes total).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: polish requirements responsive + a11y"
```

---

## Self-Review Notes (for the implementer)

- **Spec coverage:** Roles/adaptive form (Tasks 2–3), feed + filters (Task 5), respond + match + counter (Task 6), nav tab (Task 2), data layer mirroring `categories.ts` (Task 1), `matchScore` as pure deterministic logic (Task 1) — all mapped. Out-of-scope items (Supabase, AI, edit/delete, alerts) are intentionally not present.
- **Type consistency:** `matchScore(req, criteria)`, `RequirementCard({ req, onRespond })`, `RespondModal({ req, onClose, onSent })`, and the `Requirement` fields are referenced identically across tasks.
- **Adaptation note:** Because the repo has no test runner, TDD's red/green loop is realized as typecheck + build + concrete documented manual checks. If a test runner is later added, the `matchScore` helper is the first thing to cover with real unit tests (it is pure and side-effect-free by design).
