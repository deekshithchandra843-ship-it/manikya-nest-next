"use client";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 * Job stories — a rummy hand, played out on scroll.
 *
 * Three states, in the order a player actually handles cards:
 *   1. SHUFFLED  a squared-up pile, cards riffled slightly out of true
 *   2. FANNED    opened into an arc, the way you hold a hand to read it
 *   3. LAID OUT  every card set down singly, none overlapping
 *
 * Once laid out each card is two-sided: hover or tap flips it to a second
 * review. Cards are a fixed size — both faces must share one footprint,
 * and a fan only reads as a fan if the cards match.
 *
 * Below xl the whole thing is dropped for a plain stacked list; twelve
 * overlapping cards on a 390px screen is unreadable, not charming.
 * ------------------------------------------------------------------ */

interface Face {
  name: string;
  quote: string;
}

interface Story {
  /** Corner index, as on a playing card. */
  rank: string;
  suit: string;
  front: Face;
  back: Face;
  /** Resting slot, as % offsets from the stage centre. */
  x: number;
  y: number;
  /** Resting tilt — hands are laid down by people, not machines. */
  r: number;
}

/* Slots form a 5×3 grid with the middle three omitted, which leaves the
   centre clear for the headline and guarantees no two cards touch:
   columns are 19-21% apart against a card 16.8% wide, rows 30% apart
   against a card 19% tall. */
const STORIES: Story[] = [
  {
    rank: "A", suit: "♠", x: -40, y: -30, r: -3,
    front: { name: "Priya R.", quote: "Found a delivery shift 2 km from home. Started the same week." },
    back: { name: "Kavya M.", quote: "Three interviews in one afternoon, all in the same area." },
  },
  {
    rank: "2", suit: "♠", x: -21, y: -30, r: 2,
    front: { name: "Imran S.", quote: "No resume, no cover letter. I applied with my profile in one tap." },
    back: { name: "Faisal K.", quote: "Set up my profile on the bus. Applied before my stop." },
  },
  {
    rank: "3", suit: "♠", x: 0, y: -30, r: -2,
    front: { name: "Ananya K.", quote: "I wanted weekends only, between classes. The filter had that." },
    back: { name: "Meera J.", quote: "Evening shifts only, so college mornings stayed free." },
  },
  {
    rank: "7", suit: "♥", x: 21, y: -30, r: 3,
    front: { name: "Santosh K.", quote: "The salary on the card was the salary they paid. No surprises." },
    back: { name: "Deepak V.", quote: "Pay was posted upfront. Nothing changed at the interview." },
  },
  {
    rank: "8", suit: "♥", x: 40, y: -30, r: -3,
    front: { name: "Thanga Prakash", quote: "HR called the same afternoon. Walk-in the next morning." },
    back: { name: "Sunil B.", quote: "Applied at noon, had the job by Friday." },
  },
  {
    rank: "9", suit: "♥", x: -40, y: 0, r: 2,
    front: { name: "Rakesh Mehta", quote: "Applied to six jobs in ten minutes, sitting on the bus." },
    back: { name: "Harish N.", quote: "One profile, six applications. No forms to retype." },
  },
  {
    rank: "J", suit: "♣", x: 40, y: 0, r: -2,
    front: { name: "Saurabh L.", quote: "I could see how far the store was before applying." },
    back: { name: "Ritu A.", quote: "Distance on every card meant no wasted travel." },
  },
  {
    rank: "Q", suit: "♣", x: -40, y: 30, r: 3,
    front: { name: "T. Sugasini", quote: "Freshers OK was not a lie. Zero experience, and I got hired." },
    back: { name: "Lakshmi P.", quote: "First job ever. Nobody asked for experience I did not have." },
  },
  {
    rank: "K", suit: "♣", x: -21, y: 30, r: -3,
    front: { name: "Abhishek Goyal", quote: "Every listing had a real company behind it." },
    back: { name: "Nikhil D.", quote: "The verified badge is why I trusted the first one." },
  },
  {
    rank: "4", suit: "♦", x: 0, y: 30, r: 2,
    front: { name: "Shaina & Arihant", quote: "Evening shifts only, and still forty roles to pick from in HSR." },
    back: { name: "Zoya R.", quote: "More night-shift roles near me than I expected." },
  },
  {
    rank: "5", suit: "♦", x: 21, y: 30, r: -2,
    front: { name: "Nandini B.", quote: "I hire six part-time pickers a month. All within 4 km." },
    back: { name: "Arjun T.", quote: "As an employer, local applicants actually turn up." },
  },
  {
    rank: "6", suit: "♦", x: 40, y: 30, r: 3,
    front: { name: "Vinod & Latha", quote: "Both of us found work in Koramangala in the same week." },
    back: { name: "Ramesh & Uma", quote: "We searched together and both started the same month." },
  },
];

const NAVY = "#141d38";
const CARD_W = 208;
const CARD_H = 156;
/* Small screens run the same shuffle-fan-layout with the cards shrunk to
   fit. The compact hand is three columns 32% apart, so a card may be at
   most ~29% of the stage before neighbours touch — sizing it from the
   stage rather than fixing it in px keeps 320px phones working too. */
const SM_CARD_RATIO = 0.29;
const SM_CARD_MIN = 88;
const SM_CARD_MAX = 116;
/** Six cards means only two rows, so each can be far taller than it is
 *  wide — which is both more card-like and enough room to read a quote. */
const SM_CARD_ASPECT = 1.42;

/** Phones show six of the twelve. Two rows of three leaves real space
 *  between the cards and a wide clear band for the headline. */
const SM_COUNT = 6;

const SM_SLOTS: { x: number; y: number; r: number }[] = [
  { x: -32, y: -30, r: -3 },
  { x: 0, y: -30, r: 2 },
  { x: 32, y: -30, r: -2 },
  { x: -32, y: 30, r: 3 },
  { x: 0, y: 30, r: -3 },
  { x: 32, y: 30, r: 2 },
];

/** Below xl the hand is dealt at the small size. */
function useCompact() {
  const [compact, setCompact] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const sync = () => setCompact(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return compact;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface Placement {
  x: number;
  y: number;
  rot: number;
  scale: number;
}

/** The three states a card passes through, blended by scroll position. */
function placeCard(s: Story, i: number, n: number, p: number, compact: boolean): Placement {
  // 1 · SHUFFLED — squared pile, each card knocked a little out of true.
  const jitter = ((i * 37) % 9) - 4;
  const shuffled: Placement = { x: jitter * 0.22, y: jitter * 0.3, rot: jitter * 0.9, scale: 0.82 };

  // 2 · FANNED — an arc pivoting below the stage, as a hand is held.
  const spread = ((i - (n - 1) / 2) / ((n - 1) / 2)) * 34;
  const rad = (spread * Math.PI) / 180;
  const fanned: Placement = {
    // A narrow stage needs a tighter arc or the ends run off-screen.
    x: Math.sin(rad) * (compact ? 34 : 47),
    y: (1 - Math.cos(rad)) * (compact ? 34 : 52) - 4,
    rot: spread,
    scale: 0.94,
  };

  // 3 · LAID OUT — one card per slot, nothing overlapping.
  const slot = compact ? SM_SLOTS[i] : s;
  const laid: Placement = { x: slot.x, y: slot.y, rot: slot.r, scale: 1 };

  // The shuffle holds briefly, then opens; the layout resolves after.
  const toFan = easeOut(clamp01(p / 0.46));
  const toLaid = easeOut(clamp01((p - 0.52) / 0.48));

  const blend = (k: keyof Placement) => lerp(lerp(shuffled[k], fanned[k], toFan), laid[k], toLaid);

  return { x: blend("x"), y: blend("y"), rot: blend("rot"), scale: blend("scale") };
}

/* ── One face of a card ──────────────────────────────────────────── */

function CardFace({
  face,
  rank,
  suit,
  back,
  hidden,
  compact,
}: {
  face: Face;
  rank: string;
  suit: string;
  back?: boolean;
  hidden: boolean;
  compact: boolean;
}) {
  return (
    <div
      aria-hidden={hidden}
      /* Navy-tinted shadow — pure black goes muddy against saturated yellow. */
      className={`absolute inset-0 shadow-[0_10px_26px_-12px_rgba(20,29,56,0.32)] flex flex-col text-left ${compact ? "rounded-[10px] px-2.5 py-2" : "rounded-[14px] px-4 py-3.5"}`}
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        /* The front needs an explicit transform too: without one, mobile
           WebKit gives it no 3D context and it bleeds through the back. */
        transform: back ? "rotateY(180deg)" : "rotateY(0deg)",
        background: back ? "#fffdf2" : "#ffffff",
      }}
    >
      <span
        aria-hidden="true"
        className={`absolute font-bold leading-none tracking-tight ${
          compact ? "top-1.5 right-2 text-[9px]" : "top-2.5 right-3 text-[11px]"
        }`}
        style={{ color: "rgba(20,29,56,0.22)" }}
      >
        {rank}
        {suit}
      </span>
      <p className={`font-semibold text-muted ${compact ? "text-[9px] mb-0.5 pr-5" : "text-[11px] mb-1 pr-7"}`}>
        {face.name}
      </p>
      <p
        className={`font-semibold leading-snug ${compact ? "text-[10.5px]" : "text-[13.5px]"}`}
        style={{ color: NAVY }}
      >
        {face.quote}
      </p>
      {/* No room for the hint on a small card — the corner index carries it */}
      {!compact && (
        <span
          aria-hidden="true"
          className="mt-auto text-[10px] font-bold uppercase tracking-[0.1em]"
          style={{ color: "rgba(20,29,56,0.3)" }}
        >
          {back ? "↺ back" : "↻ flip"}
        </span>
      )}
    </div>
  );
}

/* ── A two-sided card ────────────────────────────────────────────── */

/** True only on pointers that can actually hover. Touch reports no hover,
 *  and hover-to-flip there is what broke tapping: focus fired first and
 *  flipped the card, then the click toggled it straight back. */
function useHoverCapable() {
  const [can, setCan] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCan(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return can;
}

function StoryCard({ story, style, compact }: { story: Story; style?: React.CSSProperties; compact: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const hoverCapable = useHoverCapable();

  return (
    <div style={{ ...style, perspective: 900 }}>
      <button
        type="button"
        aria-pressed={flipped}
        aria-label={`Review from ${story.front.name}. Flip for a review from ${story.back.name}.`}
        onMouseEnter={hoverCapable ? () => setFlipped(true) : undefined}
        onMouseLeave={hoverCapable ? () => setFlipped(false) : undefined}
        /* Click alone drives touch and keyboard — Enter and Space on a
           button both fire click, so no separate focus handling is needed. */
        onClick={() => setFlipped((f) => !f)}
        className="relative block w-full h-full transition-transform duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <CardFace face={story.front} rank={story.rank} suit={story.suit} hidden={flipped} compact={compact} />
        <CardFace face={story.back} rank={story.rank} suit={story.suit} back hidden={!flipped} compact={compact} />
      </button>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────────────── */

export default function JobStories() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [stageW, setStageW] = useState(390);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Show the laid-out hand rather than dealing it.
      setProgress(1);
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const el = sectionRef.current;
      if (!el) return;
      const { top, height, width } = el.getBoundingClientRect();
      /* The stage is sticky and one viewport tall, so the scrollable
         travel is (height - viewport). Progress runs 0→1 across it. */
      const travel = Math.max(1, height - window.innerHeight);
      setProgress(clamp01(-top / travel));
      setStageW(Math.min(1240, width));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const compact = useCompact();
  /* Phones deal a shorter hand — six cards, so each one can be big enough
     to read. Desktop lays out all twelve. */
  const hand = compact ? STORIES.slice(0, SM_COUNT) : STORIES;
  const n = hand.length;

  /* Card size is derived from the stage on small screens so the three
     columns never touch, right down to a 320px phone. */
  const cardW = compact
    ? Math.round(Math.min(SM_CARD_MAX, Math.max(SM_CARD_MIN, stageW * SM_CARD_RATIO)))
    : CARD_W;
  const cardH = compact ? Math.round(cardW * SM_CARD_ASPECT) : CARD_H;

  /* Cards only accept a flip once they have stopped moving. */
  const settled = progress > 0.9;

  /* One stage at every width — phones get the same shuffle, fan and
     lay-out, dealt with smaller cards into a 3×4 grid instead of 5×3. */
  return (
    <section
      ref={sectionRef}
      aria-label="Stories from job seekers"
      className="relative h-[200vh] xl:h-[240vh]"
      style={{ background: "#fcdb32" }}
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        <div className="relative w-full h-full max-w-[1240px] mx-auto">
          {hand.map((s, i) => {
            const { x, y, rot, scale } = placeCard(s, i, n, progress, compact);
            return (
              <StoryCard
                key={s.rank + s.suit}
                story={s}
                compact={compact}
                style={{
                  position: "absolute",
                  /* left/top in % resolve against the stage, so the hand
                     scales with the viewport instead of drifting. */
                  left: `${50 + x}%`,
                  top: `${50 + y}%`,
                  width: cardW,
                  height: cardH,
                  transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${scale})`,
                  /* Fanned cards must overlap in dealing order, so the
                     stacking follows the hand, not the DOM. */
                  zIndex: i,
                  pointerEvents: settled ? "auto" : "none",
                }}
              />
            );
          })}

          {/* The pile and the fan both occupy the centre, so the headline
              only comes up once the cards have cleared it — otherwise it
              would print straight over the cards' own text. */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 px-6"
            style={{ opacity: clamp01((progress - 0.5) / 0.28) }}
          >
            <h2
              className="text-center font-extrabold tracking-tight leading-[1.08] text-[clamp(22px,6vw,58px)]"
              style={{ color: NAVY }}
            >
              <span className="block">Words that</span>
              <span className="block italic">got people hired</span>
            </h2>
            <p className="text-[12px] xl:text-[13.5px] mt-3 xl:mt-4 text-center max-w-[300px] xl:max-w-[420px] text-job-navy/70">
              Real hires across Bengaluru — {compact ? "tap" : "hover"} a card for another.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
