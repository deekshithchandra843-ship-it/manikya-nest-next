# Requirements page — jobs design-system reskin

**Date:** 2026-07-22
**Scope:** Visual reskin only. Keep all structure, state, validation, the 3-step
wizard flow, and the form-left / feed-right split layout exactly as they are.

## Goal

Re-dress the requirements page (`src/app/requirements/page.tsx`) and its feed
components in the **jobs page design language** (`src/app/jobs/page.tsx`,
`JobStories.tsx`): the navy + sun palette applied on a strict 60/30/10 split.

No behaviour, copy, data, or layout structure changes. This is a token/aesthetic
swap done with discipline, not a find-and-replace.

## The governing rule (why this isn't a simple swap)

The jobs system is built on 60/30/10:

- **60% `job-navy` (#141d38)** — the dominant field: hero, icon tiles, dark
  surfaces, and the primary text mass (`text-job-navy`).
- **30% supporting** — `job-navy-lift` (#1b2749) for gradient depth, plus the
  white/ink text mass on light surfaces.
- **10% `job-sun` (#fcdb32)** — accent ONLY. Never text on white
  (yellow-on-white fails contrast). On light surfaces it appears as a **fill or
  bar** with navy text over it.

The current page uses `rausch` red freely (hero chip, progress bars, category
chips, every Respond button, the Post button). A blind `rausch → job-sun` swap
would flood the page with yellow and break the system. The mapping below keeps
sun rare.

**Sun is reserved for: the single primary commit action of a surface, plus
narrow accent bars/eyebrows/highlights.** Everything that was `rausch` and is
NOT that single commit action becomes **navy**.

All tokens already exist in `src/app/globals.css` (`--color-job-navy`,
`-lift`, `-soft`, `--color-job-sun`, `-active`, `-soft`). No new CSS needed.

## Semantic colors are NOT touched

The emerald "posted!" success banner and the red `error` validation banner are
functional state colors, not brand voltage. They keep their current meaning and
styling. The jobs system does not forbid semantic greens/reds.

## Section-by-section mapping

### Hero band (`requirements/page.tsx` ~L254–342)

| Element | From | To |
|---|---|---|
| Gradient | `from-[#0F0C20] to-[#15102A]` | `linear-gradient(160deg,#141d38 0%,#1b2749 52%,#141d38 100%)` (jobs hero) |
| Blob 1 | `bg-rausch/30 blur` | navy-lift glow `radial-gradient(circle,rgba(58,84,163,.38),transparent 70%)` |
| Blob 2 | `bg-violet-600/30 blur` | restrained sun glow `radial-gradient(circle,rgba(252,219,50,.16),transparent 70%)` |
| Eyebrow chip | `bg-rausch/20 text-rausch border-rausch/30` | sun accent chip: `text-job-sun`, `background rgba(252,219,50,.10)`, `border rgba(252,219,50,.28)`, with a small sun dot (mirrors jobs "Area-wise hiring" pill) |
| Headline | plain white "Requirement Matchboard" | white "Requirement" + accent phrase "Matchboard" in `job-sun` (mirrors "Jobs in **Namma Bengaluru**") |

**3-step flowchart nodes** — recolored **by weight, not hue** (the jobs
channel-card principle: three tiles told apart by solid-navy / pale-navy / solid-sun):

- Step 1 tile: solid **sun** bg, **navy** icon.
- Step 2 tile: solid **navy** bg, **sun** icon.
- Step 3 tile: **pale-navy** (`job-navy-soft`) bg, **navy** icon.
- Connecting dashed path + arrows: recolor `rausch`/`violet` → navy/sun to match
  their adjacent tiles. Keep the existing animations.

### Form card — left column (~L348–548)

| Element | From | To |
|---|---|---|
| "Step X of 3" badge | `text-rausch bg-rausch/10` | navy: `text-job-navy bg-job-navy-soft` |
| Progress bars (completed) | `bg-rausch` + rausch glow shadow | `bg-job-sun` (bar-as-fill on white is the one allowed sun-on-white use); incomplete stay `bg-surface-soft` |
| Heading "+" icon | `text-rausch` | `text-job-navy` |
| World toggle active | `bg-ink text-white` | `bg-job-navy text-white` |
| Category chip active | `bg-rausch text-white border-rausch` | `bg-job-navy text-white border-job-navy` |
| Selection pills active (`renderField` pills) | `bg-rausch/10 border-rausch text-rausch` | `bg-job-navy/[.08] border-job-navy text-job-navy` |
| Required-field asterisks (`text-rausch`) | `text-rausch` | `text-job-navy` |
| "Next Step" / "Back" / "Add" buttons | `bg-ink` / borders | `bg-job-navy` / navy borders |
| **"Post Requirement" CTA** | `bg-rausch text-white` | **`bg-job-sun text-job-navy`** (the surface's single primary commit — the one big 10% moment) |
| Focus rings | `ring-rausch` / `ring-ink` | `ring-job-navy` |

### Feed — right column (~L551–589)

| Element | From | To |
|---|---|---|
| Filter toggle active | `bg-ink text-white` | `bg-job-navy text-white` |
| Focus rings | `ring-ink` | `ring-job-navy` |

### `RequirementCard.tsx`

| Element | From | To |
|---|---|---|
| Verified badge | `text-rausch bg-rausch/10` | navy-soft chip: `text-job-navy bg-job-navy-soft` |
| **"Respond" / "Contact agent" button** | `bg-rausch` | **`bg-job-navy text-white`** (many cards → NOT sun; keeps 10% budget intact) |
| Focus ring | `ring-rausch` | `ring-job-navy` |

### `RespondModal.tsx`

The modal is its own surface, so its single primary commit action earns sun.

| Element | From | To |
|---|---|---|
| Match-score badge | `bg-rausch text-white` | `bg-job-navy text-white` (a stat = dominant, not accent) |
| Score panel tint | `bg-rausch/5 border-rausch/30` | `bg-job-navy/[.05] border-job-navy/25` |
| **"Send response" / "Contact agent" CTA** | `bg-rausch text-white` | **`bg-job-sun text-job-navy`** (modal's single primary commit) |
| Focus rings | `ring-rausch` / `ring-ink` | `ring-job-navy` |

## Sun budget audit (final)

After the reskin, `job-sun` appears only as:

1. Hero eyebrow chip + dot
2. Hero headline accent phrase ("Matchboard")
3. One restrained hero glow
4. Step-1 flowchart tile + Step-2 icon
5. Form progress bars (completed segments)
6. "Post Requirement" CTA (page surface's primary commit)
7. "Send response" CTA (modal surface's primary commit)

Everything else that carried brand voltage is navy. That holds the 60/30/10
discipline.

## Files touched

- `src/app/requirements/page.tsx`
- `src/components/RequirementCard.tsx`
- `src/components/RespondModal.tsx`

No changes to `globals.css` (tokens already present), no logic/lib changes.

## Verification

- Visual: load `/requirements`, confirm the page reads as the jobs system —
  navy-dominant, sun only at the accents listed above, no yellow text on white.
- Walk the 3-step wizard and post a requirement; confirm the success/error
  banners still render (semantic colors unchanged) and the flow is unchanged.
- Open the respond modal from a feed card; confirm score badge is navy and the
  send CTA is sun.
- `npm run build` / lint passes (no new tokens, no structural changes).
