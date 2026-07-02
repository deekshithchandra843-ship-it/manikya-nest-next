# PROMPT — "Post Your Requirements" (demand-side) feature

## Goal

Add a new **demand-side** experience to NestNext: instead of owners posting properties,
*seekers post what they want* and owners/agents come to them. It is the inverse of the
existing listing flow.

Build **one adaptive "Post a requirement" form** that changes its fields by role
(**Tenant / Buyer / Seller / Agent**), a **browseable feed** of posted requirements, and a
**respond/contact flow** with match badges and a response counter.

**Scope for this build:** mock data + local React state only. No backend. Structure the
data layer so a Supabase fetch can replace the in-file arrays later without touching JSX
(mirror how `app/lib/categories.ts` is written).

## Before you write code

This is a modified Next.js — read `node_modules/next/dist/docs/` for any API you touch
(per `AGENTS.md`). Follow existing conventions; do not introduce new libraries.

## Patterns to reuse (do not reinvent)

- **`app/lib/categories.ts`** — single source of truth pattern. `World` type,
  `CATEGORIES` record, `categoriesForWorld()`, `getCategory()`, mock `LISTINGS` array +
  helpers. Mirror this exactly in a new `app/lib/requirements.ts`.
- **`app/post/page.tsx`** — the field-config engine: `FieldDef` type, `detailFields(slug)` /
  `pricingFields(slug)`, `renderField()` / `renderFieldGroup()`, the segmented
  Owner/Broker toggle, world toggle, and category chips. Reuse the `field` and `labelCls`
  style strings and the `pills`/`select`/`text` renderer verbatim.
- **`app/explore/page.tsx`** — the world segmented toggle, the tile/card grid, the trust
  strip, and `ListingCard` usage. The requirements feed should feel like this page.
- **`app/components/ListingCard.tsx`** — base for the new `RequirementCard`.
- **`app/components/Navbar.tsx`** — add the new nav tab to `navLinks`.
- Design tokens: Rausch `#ff385c`, `bg-canvas`, `text-ink/body/muted`, `border-hairline`,
  rounded `[8px]/[14px]`, `shadow-airbnb`. No raw hex outside the existing gradient strings.

## Routes & navigation

- New route: **`/requirements`** (the form + a "recent requirements" rail).
- New route: **`/requirements/browse`** (the full feed with filters) — or render the feed
  on the same page below the form; pick whichever keeps each file focused.
- Add `{ href: "/requirements", label: "Requirements" }` to `navLinks` in `Navbar.tsx`
  (desktop + mobile drawer).

## Data model — `app/lib/requirements.ts`

Create this file mirroring `categories.ts`. Define:

```ts
export type Role = "tenant" | "buyer" | "seller" | "agent";

export interface RoleDef {
  role: Role;
  label: string;        // "Tenant", "Buyer", "Seller", "Agent"
  tagline: string;      // one-line framing for the card / header
  glyph: "key" | "rupee" | "tag" | "badge";
  /** Which CATEGORIES worlds/slugs this role can target (reuse categories.ts). */
  worlds: World[];
  /** Verb shown on the feed card, e.g. "Looking to rent", "Wants to buy". */
  intentVerb: string;
}

export interface Requirement {
  id: number;
  role: Role;
  category?: string;        // CategoryDef.slug when role is tenant/buyer/seller
  name: string;             // poster display name (masked contact in UI)
  city: string;
  areas: string[];          // preferred localities (multi-select)
  budgetMin: number;
  budgetMax: number;
  budgetLabel: string;      // display string, e.g. "₹25k–35k/mo" or "₹1.1–1.5 Cr"
  moveIn?: string;          // tenant/buyer: "Within 1 month", date, etc.
  bhk?: string;
  furnishing?: string;
  notes?: string;           // free-text "tell owners more"
  tags: string[];           // "Family", "Bachelors", "Pet-friendly", "Loan needed", ...
  postedAt: string;         // relative display string, e.g. "2h ago"
  responseCount: number;    // increments when an owner/agent responds
  verified?: boolean;
}

export const ROLES: Record<Role, RoleDef> = { /* ... */ };
export const REQUIREMENTS: Requirement[] = [ /* ~10-14 realistic Bengaluru seed rows across all 4 roles */ ];

export function roleList(): RoleDef[];
export function requirementsForRole(role: Role): Requirement[];
export function getRole(role: Role): RoleDef | undefined;
```

Seed `REQUIREMENTS` with believable Bengaluru data spanning all four roles and a mix of
worlds (rent, buy, pg, office, land, etc.), reusing the same localities/idioms as
`LISTINGS` (Indiranagar, Koramangala, HSR, Whitefield, Electronic City…).

## Role → field mapping (the adaptive form)

The form opens on a **role selector** — 4 segmented tabs styled like the Owner/Broker
toggle in `post/page.tsx`. Selecting a role sets which `FieldDef[]` config renders. Reuse a
`requirementFields(role, world, slug)` helper analogous to `detailFields(slug)`.

| Role | Targets | Fields shown |
|------|---------|--------------|
| **Tenant** | rent, pg, coliving, flatmate, stay | world+category chips → **budget range** (min/max), preferred areas (multi), move-in, BHK, furnishing, occupancy (Family / Bachelors / Students), pets, veg-only, notes |
| **Buyer** | buy, land, lease | category chips → budget range, areas, BHK / plot size, ready-vs-under-construction, possession timeline, loan needed (Yes/No), notes |
| **Seller** | the property they hold | property type + BHK/area, asking price, how-soon, "open to agents?" (Yes/No), notes — framed as "find me buyers/agents" |
| **Agent** | a service profile (no single property) | coverage areas (multi), specialities (Residential/Commercial/Luxury…), years active, current inventory count, languages, notes — this is a **profile**, not a property |

Budget is a **range** (two numeric inputs or a min/max), not the single price field used in
listings. Areas are **multi-select** chips, not a single locality input.

On submit: build a `Requirement`, prepend to local `REQUIREMENTS` state, show a success
state, and scroll to / reveal it at the top of the feed. No network call.

## Feed — `RequirementCard` + filters

- New `app/components/RequirementCard.tsx`, adapted from `ListingCard`. Card shows: role
  badge + `intentVerb` (e.g. "Looking to rent · 2 BHK"), city + areas, budget label,
  key tags, `postedAt`, a `responseCount` ("4 owners responded"), and a **Respond** CTA.
  Agent cards read differently (coverage + specialities, "Contact agent").
- Filter bar above the feed: role tabs (All / Tenant / Buyer / Seller / Agent), world,
  and a budget range — reuse the segmented-toggle and pill patterns. Pure client-side
  filtering over `REQUIREMENTS` state.

## Respond / contact flow

- **Respond** opens a lightweight modal (no new dependency — a fixed overlay like the
  Navbar mobile drawer). Inside: a **match badge** computed client-side and a masked
  contact reveal.
- **Match score** = simple deterministic logic, no AI: e.g. budget overlap (40%) +
  area match (35%) + category/BHK match (25%) → "85% match" pill. Put this in a small
  pure helper `matchScore(req, viewerCriteria)` in `requirements.ts` so it is unit-testable
  and Supabase-portable.
- On confirm, increment that requirement's `responseCount` in local state and show
  "Response sent · owner will reach out on WhatsApp" (reuse the `wa.me` deep-link idiom
  already in `post/page.tsx`).

## Acceptance criteria

1. `Requirements` tab appears in desktop nav and mobile drawer and routes to `/requirements`.
2. Role selector switches the form's fields live across all 4 roles.
3. Submitting a requirement prepends it to the feed without a page reload.
4. Feed filters (role / world / budget) work client-side.
5. Respond flow shows a computed match %, increments the response counter, and confirms.
6. All data flows through `app/lib/requirements.ts`; no JSX hardcodes requirement data.
7. Responsive and legible at 390px and 1280px; keyboard-focusable controls with visible
   focus rings, matching the rest of the app.
8. `npx next build` passes clean.

## Out of scope (do NOT build now)

- Supabase / auth / persistence (next phase — but keep the data layer swap-ready).
- AI matching (Phase 4). The match score stays simple deterministic logic.
- Editing/deleting requirements after posting; notifications/alerts.
