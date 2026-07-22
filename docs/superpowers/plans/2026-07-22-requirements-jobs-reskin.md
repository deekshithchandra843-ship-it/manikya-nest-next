# Requirements Page — Jobs Design-System Reskin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-dress the requirements page and its feed components in the jobs page's navy + sun design language, changing only visuals — no structure, state, validation, or behaviour.

**Architecture:** Pure Tailwind/class-string swap across three files. The jobs palette tokens (`job-navy`, `job-navy-lift`, `job-navy-soft`, `job-sun`, `job-sun-active`, `job-sun-soft`) already exist in `src/app/globals.css`, so no CSS/token work is needed. Each brand-voltage element that was `rausch`/`violet`/`emerald` becomes either navy (dominant) or sun (rare accent), following a strict 60/30/10 budget.

**Tech Stack:** Next.js 16 (App Router, `"use client"`), React 19, Tailwind CSS v4 (`@theme` tokens in `globals.css`).

## Global Constraints

- **Sun (`job-sun` #fcdb32) is accent-only, ~10% budget.** It may appear ONLY as: hero eyebrow chip + dot, hero headline accent phrase, one hero glow, the flowchart Step-1 tile + Step-2 icon + connector arrows, form progress bars, the "Post Requirement" CTA, and the "Send response" modal CTA. Nowhere else.
- **Sun is never text on white.** On light surfaces it appears only as a fill or bar with navy text over it.
- **Navy (`job-navy` #141d38) is the dominant mass** — dark surfaces, icon tiles, all other former-`rausch` buttons/toggles/chips, and heading text (`text-job-navy`).
- **Do NOT touch semantic state colors:** the emerald "posted!" success banner and the red `error` validation banner keep their existing classes and meaning.
- **No structural, logic, copy, or data changes.** JSX element structure, hooks, handlers, and validation stay byte-for-byte except for the class/style swaps listed here.
- **No changes to `globals.css`** — all tokens already exist.
- Verification uses `grep` (brand tokens gone / new tokens present) plus `npm run lint` and `npm run build`. Run all commands from `manikya-nest-next/`.

---

### Task 1: Reskin `RequirementCard.tsx`

The feed card. Its "Respond" button is the key discipline call — it becomes **navy, not sun** (many cards must not flood the page with yellow).

**Files:**
- Modify: `src/components/RequirementCard.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by other tasks (leaf component). Props unchanged: `RequirementCard({ req, onRespond })`.

- [ ] **Step 1: Swap the verified badge to navy-soft**

In `src/components/RequirementCard.tsx`, the verified badge (~line 13):

Replace:
```tsx
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rausch bg-rausch/10 px-2 py-0.5 rounded-full">
```
With:
```tsx
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-job-navy bg-job-navy-soft px-2 py-0.5 rounded-full">
```

- [ ] **Step 2: Swap the Respond button to navy**

Replace the button (~lines 43-46):
```tsx
        <button type="button" onClick={() => onRespond(req)}
          className="px-4 py-2 text-sm font-semibold text-white bg-rausch rounded-[8px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2">
          {isAgent ? "Contact agent" : "Respond"}
        </button>
```
With:
```tsx
        <button type="button" onClick={() => onRespond(req)}
          className="px-4 py-2 text-sm font-semibold text-white bg-job-navy rounded-[8px] hover:bg-job-navy-lift transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2">
          {isAgent ? "Contact agent" : "Respond"}
        </button>
```

- [ ] **Step 3: Verify no brand tokens remain in this file**

Run: `grep -nE "rausch|violet|emerald" src/components/RequirementCard.tsx`
Expected: no output (exit code 1). If any line prints, it was missed — fix it.

- [ ] **Step 4: Verify the new tokens are present**

Run: `grep -nE "bg-job-navy|text-job-navy|ring-job-navy" src/components/RequirementCard.tsx`
Expected: at least the 3 lines edited above print.

- [ ] **Step 5: Commit**

```bash
git add src/components/RequirementCard.tsx
git commit -m "style(requirements): reskin RequirementCard to jobs navy palette"
```

---

### Task 2: Reskin `RespondModal.tsx`

The respond modal is its own surface, so its single primary commit ("Send response") earns **sun**; the match-score badge is a stat, so it becomes **navy**.

**Files:**
- Modify: `src/components/RespondModal.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by other tasks (leaf component). Props unchanged: `RespondModal({ req, onClose, onSent })`.

- [ ] **Step 1: Swap the close-button focus ring to navy**

In `src/components/RespondModal.tsx`, the close button (~line 24):

Replace:
```tsx
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-ink p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm">✕</button>
```
With:
```tsx
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-ink p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy rounded-sm">✕</button>
```

- [ ] **Step 2: Swap the score panel + badge to navy**

Replace the score block (~lines 27-32):
```tsx
        {!isAgent && (
          <div className="flex items-center gap-3 mb-5 p-3 rounded-[14px] bg-rausch/5 border border-rausch/30">
            <span className="shrink-0 text-[15px] font-bold text-white bg-rausch rounded-full w-12 h-12 flex items-center justify-center tabular-nums">{score}%</span>
            <p className="text-sm text-body">Estimated match with your inventory. Higher means a closer fit on budget, area and type.</p>
          </div>
        )}
```
With:
```tsx
        {!isAgent && (
          <div className="flex items-center gap-3 mb-5 p-3 rounded-[14px] bg-job-navy/[.05] border border-job-navy/25">
            <span className="shrink-0 text-[15px] font-bold text-white bg-job-navy rounded-full w-12 h-12 flex items-center justify-center tabular-nums">{score}%</span>
            <p className="text-sm text-body">Estimated match with your inventory. Higher means a closer fit on budget, area and type.</p>
          </div>
        )}
```

- [ ] **Step 3: Swap the Send-response CTA to sun**

Replace the CTA button (~lines 34-38):
```tsx
        <button type="button"
          onClick={() => { onSent(req.id); onClose(); }}
          className="w-full h-12 bg-rausch text-white text-base font-semibold rounded-[8px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2">
          {isAgent ? "Contact agent" : "Send response"}
        </button>
```
With:
```tsx
        <button type="button"
          onClick={() => { onSent(req.id); onClose(); }}
          className="w-full h-12 bg-job-sun text-job-navy text-base font-semibold rounded-[8px] hover:bg-job-sun-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2">
          {isAgent ? "Contact agent" : "Send response"}
        </button>
```

- [ ] **Step 4: Verify no brand tokens remain in this file**

Run: `grep -nE "rausch|violet|emerald" src/components/RespondModal.tsx`
Expected: no output (exit code 1).

- [ ] **Step 5: Verify the new tokens are present**

Run: `grep -nE "bg-job-sun|bg-job-navy|ring-job-navy" src/components/RespondModal.tsx`
Expected: the edited lines print.

- [ ] **Step 6: Commit**

```bash
git add src/components/RespondModal.tsx
git commit -m "style(requirements): reskin RespondModal to jobs navy/sun palette"
```

---

### Task 3: Reskin the requirements hero band (`page.tsx`)

The dark editorial hero: navy gradient, navy-lift + sun glows, sun eyebrow chip, sun headline accent, and the 3-step flowchart recolored **by weight, not hue** (Step 1 solid sun / Step 2 solid navy / Step 3 pale navy).

**Files:**
- Modify: `src/app/requirements/page.tsx` (hero `<section>`, ~lines 254-342)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing (same-file Tasks 4 & 5 edit disjoint regions of this file).

- [ ] **Step 1: Swap the hero gradient to the jobs navy gradient**

In `src/app/requirements/page.tsx`, the hero section opening tag (~lines 255-258):

Replace:
```tsx
      <section
        aria-label="Post your requirement"
        className="relative overflow-hidden bg-gradient-to-br from-[#0F0C20] to-[#15102A] -mx-4 md:-mx-6 lg:-mx-10 px-4 md:px-6 lg:px-10 py-12 md:py-16 mb-8 text-white rounded-b-[24px] shadow-airbnb"
      >
```
With:
```tsx
      <section
        aria-label="Post your requirement"
        className="relative overflow-hidden -mx-4 md:-mx-6 lg:-mx-10 px-4 md:px-6 lg:px-10 py-12 md:py-16 mb-8 text-white rounded-b-[24px] shadow-airbnb"
        style={{ background: "linear-gradient(160deg,#141d38 0%,#1b2749 52%,#141d38 100%)" }}
      >
```

- [ ] **Step 2: Swap the background blobs to navy-lift + sun radial glows**

Replace the decorative blob wrapper (~lines 260-263):
```tsx
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-rausch/30 blur-[100px]" />
          <div className="absolute -bottom-28 -left-24 w-96 h-96 rounded-full bg-violet-600/30 blur-[100px]" />
        </div>
```
With:
```tsx
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle,rgba(58,84,163,.38),transparent 70%)" }} />
          <div className="absolute -bottom-28 -left-24 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle,rgba(252,219,50,.16),transparent 70%)" }} />
        </div>
```

- [ ] **Step 3: Swap the eyebrow chip to the sun accent pill**

Replace the eyebrow (~lines 268-270):
```tsx
            <span className="inline-block bg-rausch/20 text-rausch border border-rausch/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              Real-time Matchmaking
            </span>
```
With:
```tsx
            <span
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4"
              style={{ color: "#fcdb32", background: "rgba(252,219,50,.10)", border: "1px solid rgba(252,219,50,.28)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#fcdb32" }} aria-hidden="true" />
              Real-time Matchmaking
            </span>
```

- [ ] **Step 4: Land the sun accent on the headline phrase**

Replace the headline (~lines 271-273):
```tsx
            <h1 className="text-[clamp(28px,4.5vw,40px)] font-bold text-white tracking-tight leading-[1.1] mb-4">
              Requirement Matchboard
            </h1>
```
With:
```tsx
            <h1 className="text-[clamp(28px,4.5vw,40px)] font-bold text-white tracking-tight leading-[1.1] mb-4">
              Requirement <span style={{ color: "#fcdb32" }}>Matchboard</span>
            </h1>
```

- [ ] **Step 5: Recolor Step-1 flowchart tile (solid sun, navy icon)**

Replace the Step 1 icon tile (~lines 287-291):
```tsx
                <div className="w-11 h-11 rounded-xl bg-rausch/20 border border-rausch/40 text-rausch flex items-center justify-center shrink-0 shadow-lg">
```
With:
```tsx
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-lg text-job-navy" style={{ background: "#fcdb32" }}>
```

- [ ] **Step 6: Recolor connector arrow 1 to sun**

Replace (~lines 300-301, the first `animate-bounce` arrow's `<svg>`):
```tsx
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-rausch">
```
With:
```tsx
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-job-sun">
```

- [ ] **Step 7: Recolor Step-2 flowchart tile (solid navy, sun icon)**

Replace the Step 2 icon tile (~lines 307):
```tsx
                <div className="w-11 h-11 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-400 flex items-center justify-center shrink-0 shadow-lg animate-pulse">
```
With:
```tsx
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-lg animate-pulse text-job-sun" style={{ background: "#141d38" }}>
```

- [ ] **Step 8: Recolor connector arrow 2 to sun**

Replace (~lines 320-321, the second `animate-bounce` arrow's `<svg>`):
```tsx
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-violet-400">
```
With:
```tsx
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-job-sun">
```

- [ ] **Step 9: Recolor Step-3 flowchart tile (pale navy, navy icon)**

Replace the Step 3 icon tile (~lines 328):
```tsx
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg">
```
With:
```tsx
                <div className="w-11 h-11 rounded-xl bg-job-navy-soft text-job-navy flex items-center justify-center shrink-0 shadow-lg">
```

- [ ] **Step 10: Verify no brand tokens remain in the hero region**

Run: `grep -nE "rausch|violet|emerald|#0F0C20|#15102A" src/app/requirements/page.tsx`
Expected: matches ONLY from the form/feed regions below line 342 (Tasks 4-5 handle those). Confirm there are ZERO matches on lines 254-342. (If unsure, run `grep -nE "rausch|violet|emerald" src/app/requirements/page.tsx | awk -F: '$1<=342'` — expected: no output.)

- [ ] **Step 11: Commit**

```bash
git add src/app/requirements/page.tsx
git commit -m "style(requirements): reskin hero band to jobs navy/sun editorial style"
```

---

### Task 4: Reskin the form card (`page.tsx` left column)

Step badge navy-soft, progress bars sun, toggles/chips/pills navy, required asterisks navy, "Next Step" navy, and the single "Post Requirement" CTA **sun**.

**Files:**
- Modify: `src/app/requirements/page.tsx` (`renderField` pills ~line 133; form `<section>` ~lines 348-548)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing (Task 5 edits the disjoint feed region).

- [ ] **Step 1: Recolor selection pills active-state + focus ring (in `renderField`)**

In `src/app/requirements/page.tsx`, the pills branch (~lines 132-134):

Replace:
```tsx
              <button key={o} type="button" onClick={() => set(f.key, o)} aria-pressed={on}
                className={`px-4 py-2 text-sm font-medium rounded-[8px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${on ? "bg-rausch/10 border-rausch text-rausch" : "bg-canvas text-body border-hairline hover:border-ink"}`}>
```
With:
```tsx
              <button key={o} type="button" onClick={() => set(f.key, o)} aria-pressed={on}
                className={`px-4 py-2 text-sm font-medium rounded-[8px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2 ${on ? "bg-job-navy/[.08] border-job-navy text-job-navy" : "bg-canvas text-body border-hairline hover:border-ink"}`}>
```

- [ ] **Step 2: Recolor required-field asterisks to navy (all occurrences)**

There are two asterisk spellings in the file. Replace ALL occurrences of each.

Replace every occurrence of:
```tsx
<span className="text-rausch"> *</span>
```
With:
```tsx
<span className="text-job-navy"> *</span>
```

And replace every occurrence of:
```tsx
<span className="text-rausch">*</span>
```
With:
```tsx
<span className="text-job-navy">*</span>
```

(Use the editor's replace-all. This covers the `renderFieldGroup` label plus the Budget Min/Max, Preferred Localities, Name, City, and Notes labels.)

- [ ] **Step 3: Recolor the "Create Requirement" heading icon**

Replace (~line 352):
```tsx
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-rausch">
```
With:
```tsx
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-job-navy">
```

- [ ] **Step 4: Recolor the "Step X of 3" badge to navy-soft**

Replace (~lines 357-359):
```tsx
              <span className="text-xs font-bold text-rausch bg-rausch/10 px-2 py-0.5 rounded-full">
                Step {step} of 3
              </span>
```
With:
```tsx
              <span className="text-xs font-bold text-job-navy bg-job-navy-soft px-2 py-0.5 rounded-full">
                Step {step} of 3
              </span>
```

- [ ] **Step 5: Recolor the three progress bars to sun**

Replace the progress indicator block (~lines 365-369):
```tsx
          <div className="flex items-center gap-2 mb-6">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? "bg-rausch shadow-[0_0_8px_rgba(255,56,92,0.4)]" : "bg-surface-soft"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? "bg-rausch shadow-[0_0_8px_rgba(255,56,92,0.4)]" : "bg-surface-soft"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 3 ? "bg-rausch shadow-[0_0_8px_rgba(255,56,92,0.4)]" : "bg-surface-soft"}`} />
          </div>
```
With:
```tsx
          <div className="flex items-center gap-2 mb-6">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? "bg-job-sun shadow-[0_0_8px_rgba(252,219,50,0.45)]" : "bg-surface-soft"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? "bg-job-sun shadow-[0_0_8px_rgba(252,219,50,0.45)]" : "bg-surface-soft"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 3 ? "bg-job-sun shadow-[0_0_8px_rgba(252,219,50,0.45)]" : "bg-surface-soft"}`} />
          </div>
```

- [ ] **Step 6: Recolor the World toggle active state to navy**

Replace (~lines 418-419):
```tsx
                        <button key={w} type="button" onClick={() => chooseWorld(w)} aria-pressed={on}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-[8px] capitalize transition-colors ${on ? "bg-ink text-white shadow-sm" : "text-muted hover:text-ink"}`}>
```
With:
```tsx
                        <button key={w} type="button" onClick={() => chooseWorld(w)} aria-pressed={on}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-[8px] capitalize transition-colors ${on ? "bg-job-navy text-white shadow-sm" : "text-muted hover:text-ink"}`}>
```

- [ ] **Step 7: Recolor the Category chip active state to navy**

Replace (~lines 436-437):
```tsx
                        <button key={c.slug} type="button" onClick={() => { setSlug(c.slug); setErrorMsg(""); }} aria-pressed={on}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-[8px] border transition-colors ${on ? "bg-rausch text-white border-rausch shadow-sm" : "bg-canvas text-body border-hairline hover:border-ink"}`}>
```
With:
```tsx
                        <button key={c.slug} type="button" onClick={() => { setSlug(c.slug); setErrorMsg(""); }} aria-pressed={on}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-[8px] border transition-colors ${on ? "bg-job-navy text-white border-job-navy shadow-sm" : "bg-canvas text-body border-hairline hover:border-ink"}`}>
```

- [ ] **Step 8: Recolor the "Next Step" button to navy**

Replace (~lines 531-537):
```tsx
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 h-12 bg-ink text-white text-sm font-semibold rounded-xl hover:bg-ink-hover hover:shadow-md active:scale-[0.98] transition-all"
              >
                Next Step
              </button>
```
With:
```tsx
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 h-12 bg-job-navy text-white text-sm font-semibold rounded-xl hover:bg-job-navy-lift hover:shadow-md active:scale-[0.98] transition-all"
              >
                Next Step
              </button>
```

- [ ] **Step 9: Recolor the "Post Requirement" CTA to sun**

Replace (~lines 539-545):
```tsx
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 h-12 bg-rausch text-white text-sm font-bold rounded-xl hover:bg-rausch-active hover:shadow-lg active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2"
              >
                Post Requirement
              </button>
```
With:
```tsx
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 h-12 bg-job-sun text-job-navy text-sm font-bold rounded-xl hover:bg-job-sun-active hover:shadow-lg active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2"
              >
                Post Requirement
              </button>
```

- [ ] **Step 10: Verify the form region carries no brand tokens**

Run: `grep -nE "rausch" src/app/requirements/page.tsx | awk -F: '$1<=548'`
Expected: no output. (The only remaining `rausch` in the file should be inside the feed region, handled in Task 5 — and after Task 5, none at all.)

Run: `grep -nE "text-rausch|bg-rausch" src/app/requirements/page.tsx`
Expected: at most matches on lines > 548 (feed). Do NOT touch the `error`-token banner — it uses `bg-error`/`text-error`, not `rausch`, and must stay.

- [ ] **Step 11: Commit**

```bash
git add src/app/requirements/page.tsx
git commit -m "style(requirements): reskin form card to jobs navy/sun palette"
```

---

### Task 5: Reskin the feed toggle + final sweep (`page.tsx` right column)

The feed filter toggle to navy, then a whole-file verification that the reskin is complete and semantic banners are intact.

**Files:**
- Modify: `src/app/requirements/page.tsx` (feed `<section>` ~lines 551-589)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Recolor the feed filter toggle active state + focus ring to navy**

In `src/app/requirements/page.tsx`, the filter buttons (~lines 562-563):

Replace:
```tsx
                    <button key={r} type="button" onClick={() => setFilterRole(r)} aria-pressed={on}
                      className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${on ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>
```
With:
```tsx
                    <button key={r} type="button" onClick={() => setFilterRole(r)} aria-pressed={on}
                      className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy ${on ? "bg-job-navy text-white" : "text-muted hover:text-ink"}`}>
```

- [ ] **Step 2: Whole-file verification — no brand tokens remain**

Run: `grep -nE "rausch|violet|emerald|#0F0C20|#15102A" src/app/requirements/page.tsx`
Expected: no output (exit code 1).

- [ ] **Step 3: Verify semantic state banners are UNTOUCHED**

Run: `grep -nE "bg-emerald-50|border-emerald-200|text-emerald-800|bg-error|text-error|border-error" src/app/requirements/page.tsx`
Expected: the success banner (`bg-emerald-50 border-emerald-200 text-emerald-800`, ~line 372) and the error banner (`bg-error/5 border-error/25 text-error`, ~line 381) both still print. These are semantic and MUST remain.

> Note: Step 2 excludes the success banner's emerald because that banner uses `emerald-50/200/600/800` — re-run `grep -n "emerald-4\|emerald-5" src/app/requirements/page.tsx` and confirm NO output (the flowchart's `emerald-400/500` from the old Step-3 tile is gone), while the success banner's `emerald-50/200/600/800` remain from Step 3's grep. If `emerald-400` or `emerald-500` still appear, a Task 3 edit was missed.

- [ ] **Step 4: Lint the changed files**

Run: `npm run lint`
Expected: no new errors introduced by these files. (Pre-existing warnings elsewhere are out of scope; confirm none reference `requirements/page.tsx`, `RequirementCard.tsx`, or `RespondModal.tsx`.)

- [ ] **Step 5: Production build**

Run: `npm run build`
Expected: build succeeds. The `/requirements` route compiles with no type or CSS errors.

- [ ] **Step 6: Manual visual check**

Run `npm run dev`, open `http://localhost:3000/requirements`, and confirm against the spec's "sun budget audit":
- Hero is navy-dominant with a sun eyebrow pill, "Matchboard" in sun, one sun glow bottom-left.
- Flowchart tiles read solid-sun / solid-navy / pale-navy top to bottom.
- Progress bars fill sun as you advance steps.
- "Next Step" is navy; "Post Requirement" is sun with navy text.
- Feed "Respond" buttons are navy (NOT sun).
- Open a card's respond modal: score badge navy, "Send response" sun.
- Post a requirement end-to-end: success banner still green, a forced validation error still red.

- [ ] **Step 7: Commit**

```bash
git add src/app/requirements/page.tsx
git commit -m "style(requirements): reskin feed toggle; complete jobs palette reskin"
```

---

## Self-Review Notes

- **Spec coverage:** Every row of the spec's mapping tables maps to a step — hero (Task 3), form card (Task 4), feed (Task 5 step 1), `RequirementCard` (Task 1), `RespondModal` (Task 2). The "sun budget audit" is verified in Task 5 step 6. Semantic-color preservation is verified in Task 5 step 3.
- **No placeholders:** every code step shows the exact before/after string.
- **Token consistency:** navy = `bg-job-navy` / `text-job-navy` / `ring-job-navy` / `hover:bg-job-navy-lift` / `bg-job-navy-soft`; sun = `bg-job-sun` / `text-job-navy` (over sun) / `hover:bg-job-sun-active` — used identically across all five tasks. These are the exact tokens defined in `globals.css` and already used by `jobs/page.tsx`.
