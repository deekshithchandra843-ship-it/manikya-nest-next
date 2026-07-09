# Profile Redesign — Dual-Identity Premium Dashboard

**Date:** 2026-07-09
**Scope:** Frontend only (`manikya-nest-next`). No new backend endpoints.
**Status:** Approved for planning.

## Purpose

Redesign the `/profile` page into a premium, classy dual-identity dashboard
where a member switches between a **Personal Profile** and a **Business
Profile**. Inspiration: NoBroker and Housing.com account/dashboard pages. The
existing switching plumbing (`switchProfileMode`, session `activeView`, backend
`/auth/session/switch`) and the Airbnb design tokens are reused unchanged — this
is a visual/layout/UX upgrade, not a data-model change.

## Non-Goals

- No new backend routes or Prisma changes. New blocks render real data where it
  already exists (wishlist, visits, listings/mine/stats) and use polished empty
  states otherwise.
- No change to auth, session persistence, or role-enable flow logic (only its
  presentation).
- No redesign of pages other than `/profile` and its `components/profile/*`.

## Design Decisions (locked)

1. **Switch pattern:** A+C — a **morphing hero** whose theme changes with the
   active mode, containing a **segmented pill toggle** (`Personal | Business`).
2. **Layout:** Hybrid (#4) — a full-width stat/completion band under the hero,
   then a 2-column split (main + side) on desktop, single column on mobile.
3. **New blocks:** all four — completion meter, verification/trust, activity
   timeline, saved searches + alerts.
4. Both Personal and Business views receive the premium treatment so they read
   as one product.

## Theme per mode

Driven off `session.activeView`. Reuse existing tokens:

- **Personal:** `rausch` → `tab-rent` (warm red/coral) gradients and accents.
- **Business:** `violet` → `indigo` gradients and accents.

A single helper (e.g. `profileTheme(activeView)`) returns the accent class set so
every new component stays consistent. Live in `lib/roleTheme.ts` (already exists)
or a small `components/profile/theme.ts` — implementer's call, but one source.

## Components

### Reworked

- **`ProfileHeader.tsx`** — becomes the identity card host. Renders avatar,
  name, city, verified/KYC pill, and mounts `ProfileSwitch`. Morphs gradient by
  mode. The current inline "Switch to Business/Personal" button is removed in
  favor of `ProfileSwitch`; Share/Edit buttons stay.
- **`app/profile/page.tsx`** — restructured to the Hybrid layout: hero →
  top band (`StatGrid` + `CompletionMeter`) → 2-column grid. The existing
  Personal segments (Property Hub / Jobs & Career) and `BusinessDashboard`
  render *inside* the new grid rather than a single stack. Role-intake/upgrade
  banner logic is preserved, restyled to match.
- **`StatGrid.tsx`** — accent color becomes theme-aware (currently hardcoded
  `text-rausch`) so it works in Business mode too.

### New (all under `components/profile/`)

- **`ProfileSwitch.tsx`** — segmented pill with an animated sliding thumb.
  Props: `activeView`, `hasBusinessRole`, `onSwitch`. When the user has no
  business role, renders the "Activate Business" entry that opens today's
  role-intake options (logic reused from `page.tsx`).
- **`CompletionMeter.tsx`** — circular SVG progress ring + a short checklist
  (photo, phone verified, city, at least one role). Percentage derived from
  present `session` fields. Each incomplete item is a tappable prompt.
- **`VerificationCard.tsx`** — phone / email / KYC rows with verified vs pending
  states and a simple trust score summary. Uses `verified` flag already threaded
  through the header (currently hardcoded `false`); stays presentational.
- **`ActivityTimeline.tsx`** — vertical timeline of recent actions built from
  existing data (saved nests, scheduled visits). Designed empty state when none.
- **`SavedSearchesCard.tsx`** — saved-filter cards with a "new matches" count
  and an alert toggle (local UI state only). Business mode shows a lead-alert
  variant of the same card.

## Layout map

```
┌───────────────────────────────────────────────┐
│  HERO (morphing) — avatar · name · pill        │
│  [ 🏠 Personal | 💼 Business ]  · Edit · Share  │
├───────────────────────────────────────────────┤
│  TOP BAND:  StatGrid (3 stats)  |  CompletionMeter │
├──────────────────────────┬────────────────────┤
│  MAIN (≈62%)             │  SIDE (≈38%)        │
│  Personal: segments →    │  VerificationCard   │
│   SavedNests / Reqs /    │  SavedSearchesCard  │
│   ActivityTimeline       │  MenuBlock          │
│  Business: metrics +     │  NotificationsBlock │
│   listings/leads tabs    │  AccountBlock       │
└──────────────────────────┴────────────────────┘
   (single column, stacked, on mobile)
```

## Responsiveness

- Mobile-first. The 2-column split is `lg:` and up; below that everything
  stacks in a sensible reading order (hero → stats → completion → main → side).
- Segmented pill remains full-width and thumb-friendly on mobile.
- No horizontal page scroll at any width.

## Data & States

- **Real data:** saved nests (`/wishlist`), visits (`/visits/mine`), business
  listings/stats (`/listings/mine/stats`) — all already fetched in `page.tsx` /
  `BusinessDashboard`.
- **Derived-only:** completion %, trust score — computed from session fields, no
  fetch.
- **Local UI state:** saved-search alert toggles.
- Every new block ships a designed empty state (reuse `EmptyState` from
  `components/profile/ui.tsx`) and a skeleton consistent with `SectionSkeleton`.

## Accessibility

- Segmented pill is a proper `role="tablist"`/radio group, keyboard operable,
  focus-visible rings (matches existing button focus pattern).
- Progress ring has an accessible label with the numeric percentage.
- Color is never the only signal (icons + text on verified/pending states).
- Contrast checked in both Personal and Business themes.

## Testing / Verification

- Manual: run the app, log in, confirm switch animates and the whole page
  (hero + accents + content) morphs per mode; confirm role-less users see the
  activate flow; confirm empty states and populated states both render; confirm
  mobile single-column and desktop 2-column.
- Lint/typecheck must pass (`npm run lint`, `tsc`).
- No console errors; no layout shift on session hydration (skeletons preserved).

## Risks / Notes

- `next.config`/version is a modified Next.js — read `node_modules/next/dist/docs`
  before using any Next API (`AGENTS.md` rule).
- Keep the hero's `-mx` full-bleed pattern intact so it aligns with `PageLayout`.
- `verified` is currently hardcoded `false`; `VerificationCard` stays
  presentational until a real KYC source exists (out of scope).
