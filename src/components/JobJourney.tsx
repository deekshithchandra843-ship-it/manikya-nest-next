"use client";
import { useEffect, useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 * Job journey — two lines telling one story.
 *
 * A flat, steady line (with FindWay) against a volatile one (on your
 * own). Both draw left to right as the section plays, with milestone
 * labels hanging off each line on stalks and a marker riding the leading
 * edge. One journey per job type; the tabs restart the animation.
 *
 * Label positions are authored in viewBox units rather than derived, so
 * the layout is guaranteed collision-free at every width — the chart
 * scales as one unit instead of reflowing.
 *
 * Below lg the chart is replaced by a two-column contrast list: a
 * 1000-unit-wide chart scaled to a phone renders 4px type.
 * ------------------------------------------------------------------ */

const NAVY = "#141d38";
const SUN = "#fcdb32";
const FAINT = "#a2a9bb";

/* Plot box inside the 1000×440 viewBox. The bands above and below the
   plot are reserved for milestone labels. */
const PLOT = { left: 96, right: 946, top: 70, bottom: 330 };
const px = (t: number) => PLOT.left + t * (PLOT.right - PLOT.left);
const py = (v: number) => PLOT.bottom - v * (PLOT.bottom - PLOT.top);

interface Milestone {
  /** Index into the series' point list that this label hangs from. */
  at: number;
  lines: string[];
  /** Authored label-box centre, in viewBox units. */
  lx: number;
  ly: number;
}

interface Series {
  /** [t, v] pairs, both normalised 0–1. */
  pts: [number, number][];
  milestones: Milestone[];
}

interface Journey {
  id: string;
  tab: string;
  yAxis: string;
  xAxis: string;
  headline: string;
  rough: Series;
  steady: Series;
}

/* The volatile shape is shared — the story differs, the shape of a bad
   search does not: a slow start, a false high, a collapse, a retry. */
const ROUGH_SHAPE: [number, number][] = [
  [0, 0.3],
  [0.13, 0.3],
  [0.26, 0.72],
  [0.4, 0.22],
  [0.53, 0.14],
  [0.66, 0.68],
  [0.79, 0.68],
  [1, 0.1],
];

const STEADY_SHAPE: [number, number][] = [
  [0.02, 0.85],
  [1, 0.85],
];

const STEADY_LABEL_Y = 30;

const JOURNEYS: Journey[] = [
  {
    id: "part-time",
    tab: "Part-time",
    yAxis: "EARNINGS",
    xAxis: "WEEKS",
    headline: "A shift you can count on, not one you chase.",
    rough: {
      pts: ROUGH_SHAPE,
      milestones: [
        { at: 0, lines: ["Ask around", "the area"], lx: 110, ly: 372 },
        { at: 2, lines: ["Got a shift!"], lx: 317, ly: 210 },
        { at: 4, lines: ["Shift cancelled,", "start again"], lx: 546, ly: 392 },
        { at: 5, lines: ["Found another"], lx: 657, ly: 222 },
        { at: 7, lines: ["Owner stopped", "calling"], lx: 894, ly: 376 },
      ],
    },
    steady: {
      pts: STEADY_SHAPE,
      milestones: [
        { at: 0, lines: ["Filter: evening, 3 km"], lx: 152, ly: STEADY_LABEL_Y },
        { at: 1, lines: ["Applied in one tap"], lx: 372, ly: STEADY_LABEL_Y },
        { at: 1, lines: ["Walk-in confirmed"], lx: 600, ly: STEADY_LABEL_Y },
        { at: 1, lines: ["Steady weekly payout"], lx: 858, ly: STEADY_LABEL_Y },
      ],
    },
  },
  {
    id: "it",
    tab: "IT",
    yAxis: "OFFERS",
    xAxis: "MONTHS",
    headline: "Fewer applications, and the salary known upfront.",
    rough: {
      pts: ROUGH_SHAPE,
      milestones: [
        { at: 0, lines: ["Spray resumes", "on job boards"], lx: 116, ly: 372 },
        { at: 2, lines: ["One callback!"], lx: 317, ly: 210 },
        { at: 4, lines: ["Role was already", "filled"], lx: 546, ly: 392 },
        { at: 5, lines: ["Round 5 interview"], lx: 657, ly: 222 },
        { at: 7, lines: ["Offer below", "the ask"], lx: 894, ly: 376 },
      ],
    },
    steady: {
      pts: STEADY_SHAPE,
      milestones: [
        { at: 0, lines: ["Matched to 12 roles"], lx: 152, ly: STEADY_LABEL_Y },
        { at: 1, lines: ["Verified employers"], lx: 372, ly: STEADY_LABEL_Y },
        { at: 1, lines: ["Salary shown upfront"], lx: 600, ly: STEADY_LABEL_Y },
        { at: 1, lines: ["Offer in three weeks"], lx: 858, ly: STEADY_LABEL_Y },
      ],
    },
  },
  {
    id: "non-it",
    tab: "Non-IT",
    yAxis: "CALLBACKS",
    xAxis: "WEEKS",
    headline: "Work near home, so the commute never eats the pay.",
    rough: {
      pts: ROUGH_SHAPE,
      milestones: [
        { at: 0, lines: ["Walk in", "and ask"], lx: 108, ly: 372 },
        { at: 2, lines: ["Manager says", "come back"], lx: 317, ly: 206 },
        { at: 4, lines: ["Position filled,", "try next area"], lx: 546, ly: 392 },
        { at: 5, lines: ["Another maybe"], lx: 657, ly: 222 },
        { at: 7, lines: ["Travel eats", "the pay"], lx: 894, ly: 376 },
      ],
    },
    steady: {
      pts: STEADY_SHAPE,
      milestones: [
        { at: 0, lines: ["Roles within 5 km"], lx: 152, ly: STEADY_LABEL_Y },
        { at: 1, lines: ["Walk-in slots listed"], lx: 372, ly: STEADY_LABEL_Y },
        { at: 1, lines: ["HR calls you back"], lx: 600, ly: STEADY_LABEL_Y },
        { at: 1, lines: ["Hired near home"], lx: 858, ly: STEADY_LABEL_Y },
      ],
    },
  },
];

const DURATION_MS = 5200;
/** How long the completed story rests on screen before the loop restarts. */
const HOLD_MS = 2600;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/* ── Polyline maths ──────────────────────────────────────────────── */

interface Geometry {
  d: string;
  /** Screen-space points. */
  xy: [number, number][];
  /** Normalised distance along the path at each point. */
  at: number[];
  pointAt: (p: number) => [number, number];
}

function geometry(pts: [number, number][]): Geometry {
  const xy = pts.map(([t, v]) => [px(t), py(v)] as [number, number]);
  const segs: number[] = [];
  let total = 0;
  for (let i = 1; i < xy.length; i++) {
    const len = Math.hypot(xy[i][0] - xy[i - 1][0], xy[i][1] - xy[i - 1][1]);
    segs.push(len);
    total += len;
  }
  const at = [0];
  let run = 0;
  for (const s of segs) {
    run += s;
    at.push(run / total);
  }
  const pointAt = (p: number): [number, number] => {
    const target = clamp01(p) * total;
    let acc = 0;
    for (let i = 1; i < xy.length; i++) {
      const len = segs[i - 1];
      if (acc + len >= target) {
        const f = len === 0 ? 0 : (target - acc) / len;
        return [xy[i - 1][0] + (xy[i][0] - xy[i - 1][0]) * f, xy[i - 1][1] + (xy[i][1] - xy[i - 1][1]) * f];
      }
      acc += len;
    }
    return xy[xy.length - 1];
  };
  return { d: xy.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" "), xy, at, pointAt };
}

/* ── Label ───────────────────────────────────────────────────────── */

function Label({
  m,
  anchor,
  tone,
  shown,
}: {
  m: Milestone;
  anchor: [number, number];
  tone: "navy" | "faint";
  shown: boolean;
}) {
  const w = Math.max(96, Math.max(...m.lines.map((l) => l.length)) * 6.7 + 26);
  const h = 18 + m.lines.length * 15;
  const above = m.ly < anchor[1];
  // Stalk runs from the line to the nearer edge of the label box.
  const stalkFrom = anchor[1];
  const stalkTo = above ? m.ly + h / 2 : m.ly - h / 2;
  const color = tone === "navy" ? NAVY : FAINT;

  return (
    <g style={{ opacity: shown ? 1 : 0, transition: "opacity .45s ease-out" }}>
      <line x1={anchor[0]} y1={stalkFrom} x2={anchor[0]} y2={stalkTo} stroke={color} strokeWidth={1} opacity={0.45} />
      <circle cx={anchor[0]} cy={stalkTo} r={3} fill="#fff" stroke={color} strokeWidth={1.5} />
      <rect
        x={m.lx - w / 2}
        y={m.ly - h / 2}
        width={w}
        height={h}
        rx={7}
        fill="#ffffff"
        fillOpacity={tone === "navy" ? 1 : 0.66}
        stroke={tone === "navy" ? NAVY : "transparent"}
        strokeWidth={tone === "navy" ? 1.2 : 0}
      />
      {m.lines.map((line, i) => (
        <text
          key={line}
          x={m.lx}
          y={m.ly - h / 2 + 15 + i * 15}
          textAnchor="middle"
          fontSize={12.5}
          fontWeight={600}
          fill={tone === "navy" ? NAVY : "#6a6a6a"}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

/* ── Avatar ──────────────────────────────────────────────────────── */

/** The person walking each path. Photos are cropped from the existing
 *  jobs-hero banners already in `public/`, so no new imagery is
 *  introduced. The FindWay walker gets the sun ring and full colour; the
 *  one going it alone is desaturated, which carries the contrast the
 *  reference got from two different expressions. */
const AVATARS = {
  steady: "/avatars/seeker-findway.jpg",
  rough: "/avatars/seeker-solo.jpg",
} as const;

function Avatar({ x, y, tone }: { x: number; y: number; tone: "steady" | "rough" }) {
  const steady = tone === "steady";
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={18} fill="#ffffff" />
      <image
        href={AVATARS[tone]}
        x={-16}
        y={-16}
        width={32}
        height={32}
        clipPath="url(#avatar-clip)"
        preserveAspectRatio="xMidYMid slice"
        filter={steady ? undefined : "url(#avatar-mute)"}
      />
      <circle
        r={16.5}
        fill="none"
        stroke={steady ? SUN : "#cbd0dc"}
        strokeWidth={3}
      />
    </g>
  );
}

/* ── Chart ───────────────────────────────────────────────────────── */

function Chart({ journey, p }: { journey: Journey; p: number }) {
  const rough = useMemo(() => geometry(journey.rough.pts), [journey]);
  const steady = useMemo(() => geometry(journey.steady.pts), [journey]);

  const roughHead = rough.pointAt(p);
  const steadyHead = steady.pointAt(p);

  return (
    <svg viewBox="0 0 1000 440" className="w-full h-auto" role="img" aria-label={journey.headline}>
      {/* Field — a soft wash of the brand yellow, warm enough to sit apart
          from the white page without competing with the two lines. */}
      <defs>
        <linearGradient id="journey-field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffdf4" />
          <stop offset="100%" stopColor="#fdf3cd" />
        </linearGradient>
        {/* Rounds the avatar photos into their rings */}
        <clipPath id="avatar-clip">
          <circle cx={0} cy={0} r={16} />
        </clipPath>
        {/* Drains the colour from the walker on the volatile path */}
        <filter id="avatar-mute">
          <feColorMatrix type="saturate" values="0.12" />
        </filter>
      </defs>
      <rect x={0} y={0} width={1000} height={440} rx={14} fill="url(#journey-field)" />

      {/* Baselines — warmed to match the field, or they read as grey scum */}
      {[0, 0.5, 1].map((v) => (
        <line key={v} x1={PLOT.left - 20} y1={py(v)} x2={PLOT.right} y2={py(v)} stroke="#ece4c6" strokeWidth={1} />
      ))}

      {/* Axes */}
      <text
        x={-((PLOT.top + PLOT.bottom) / 2)}
        y={38}
        transform="rotate(-90)"
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        letterSpacing={1.4}
        fill="#9aa1b4"
      >
        {journey.yAxis}
      </text>
      <text x={(PLOT.left + PLOT.right) / 2} y={434} textAnchor="middle" fontSize={11} fontWeight={700} letterSpacing={1.4} fill="#9aa1b4">
        {journey.xAxis}
      </text>

      {/* The volatile path — faint and dashed, the story you don't want */}
      <path
        d={rough.d}
        fill="none"
        stroke={FAINT}
        strokeWidth={2.5}
        strokeDasharray="5 4"
        pathLength={1}
        style={{ strokeDasharray: "1", strokeDashoffset: 1 - p }}
      />
      {/* Redrawn dashed on top so the dash pattern survives the reveal */}
      <path
        d={rough.d}
        fill="none"
        stroke={FAINT}
        strokeWidth={2.5}
        strokeLinejoin="round"
        style={{ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}
        strokeDasharray="6 5"
      />

      {/* The steady path — solid navy, the FindWay line */}
      <path
        d={steady.d}
        fill="none"
        stroke={NAVY}
        strokeWidth={3.5}
        strokeLinecap="round"
        pathLength={1}
        style={{ strokeDasharray: "1", strokeDashoffset: 1 - p }}
      />

      {/* Milestones */}
      {journey.rough.milestones.map((m) => (
        <Label key={m.lines.join()} m={m} anchor={rough.xy[m.at]} tone="faint" shown={p >= rough.at[m.at] - 0.01} />
      ))}
      {journey.steady.milestones.map((m, i) => {
        const t = (i + 0.6) / journey.steady.milestones.length;
        return (
          <Label
            key={m.lines.join()}
            m={m}
            anchor={[m.lx, py(0.85)]}
            tone="navy"
            shown={p >= t - 0.12}
          />
        );
      })}

      {/* Whoever is walking each path, riding its leading edge */}
      <Avatar x={roughHead[0]} y={roughHead[1]} tone="rough" />
      <Avatar x={steadyHead[0]} y={steadyHead[1]} tone="steady" />
    </svg>
  );
}

/* ── Section ─────────────────────────────────────────────────────── */

interface JobJourneyProps {
  /** Pin the journey to one job type and drop the tabs. Search results
   *  already know the category, so choosing it again would be noise. */
  category?: string | null;
  /** "hero" is the compact form that sits above search results: smaller,
   *  and collapsible so it can never stand between a seeker and the list. */
  variant?: "section" | "hero";
}

export default function JobJourney({ category = null, variant = "section" }: JobJourneyProps) {
  const pinnedIndex = JOURNEYS.findIndex((j) => j.id === category);
  const pinned = pinnedIndex >= 0;

  const [active, setActive] = useState(pinned ? pinnedIndex : 0);
  const [p, setP] = useState(0);
  const [open, setOpen] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const hero = variant === "hero";

  // Following the category filter is the whole point of the pinned form.
  useEffect(() => {
    if (pinned) setActive(pinnedIndex);
  }, [pinned, pinnedIndex]);

  const journey = JOURNEYS[active];

  /* Loops on its own: draws over DURATION_MS, holds the finished story for
     HOLD_MS so it can be read, then starts over. It only runs while the
     chart is actually on screen — an off-screen or collapsed chart burns
     frames for nobody. Restarts when the tab changes. */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setP(1);
      return;
    }

    const CYCLE = DURATION_MS + HOLD_MS;
    let raf = 0;
    let t0 = 0;

    const step = (ts: number) => {
      if (!t0) t0 = ts;
      // Past DURATION_MS the ratio clamps to 1, which is the hold.
      setP(clamp01(((ts - t0) % CYCLE) / DURATION_MS));
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (raf) return;
      t0 = 0;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => (entries[0].isIntersecting ? start() : stop()), {
      threshold: 0.2,
    });
    io.observe(el);

    return () => {
      io.disconnect();
      stop();
    };
  }, [active, open]);

  return (
    <section
      aria-label="How a job search goes"
      className={hero ? "bg-canvas pt-4" : "bg-canvas py-16 md:py-20"}
    >
      <div className={hero ? "max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10" : "max-w-[1100px] mx-auto px-4 md:px-6 lg:px-10"}>
        {/* Header. The hero form carries no title or standfirst — on a
            results page that text is chrome between the seeker and the
            list, so the chart starts immediately and its one explanatory
            line moves below. Only the legend and the toggle stay up top,
            because both are needed to read or dismiss the chart. */}
        {!hero && (
          <div className="text-center">
            <p
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: NAVY }}
            >
              <span className="w-6 h-[3px] rounded-full" style={{ background: SUN }} aria-hidden="true" />
              The difference
              <span className="w-6 h-[3px] rounded-full" style={{ background: SUN }} aria-hidden="true" />
            </p>
            <h2 className="font-bold tracking-tight text-[24px] md:text-[32px] mt-2" style={{ color: NAVY }}>
              How the search actually goes
            </h2>
            <p className="text-[14px] text-muted max-w-[520px] mx-auto mt-2">{journey.headline}</p>
          </div>
        )}

        {/* Tabs — only when the category is not already decided for us */}
        {!pinned && (
          <div role="tablist" aria-label="Job type" className="flex justify-center gap-2 mt-7">
            {JOURNEYS.map((j, i) => (
              <button
                key={j.id}
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className={`h-10 px-5 text-[13.5px] font-bold rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2 ${
                  i === active ? "text-white border-transparent" : "text-job-navy border-hairline hover:border-job-navy"
                }`}
                style={i === active ? { background: NAVY } : undefined}
              >
                {j.tab}
              </button>
            ))}
          </div>
        )}

        {/* Legend, with the toggle riding the same row in hero form */}
        <div className={`flex items-center gap-6 ${hero ? "" : "justify-center mt-7"}`}>
          <span
            className={`inline-flex items-center gap-2 text-[12.5px] font-semibold ${hero && !open ? "hidden" : ""}`}
            style={{ color: NAVY }}
          >
            <span className="w-7 h-[3.5px] rounded-full" style={{ background: NAVY }} aria-hidden="true" />
            With FindWay
          </span>
          <span className={`inline-flex items-center gap-2 text-[12.5px] font-semibold text-muted ${hero && !open ? "hidden" : ""}`}>
            <span
              className="w-7 h-0 border-t-[2.5px] border-dashed"
              style={{ borderColor: FAINT }}
              aria-hidden="true"
            />
            On your own
          </span>

          {hero && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="ml-auto shrink-0 h-8 px-3.5 text-[12.5px] font-semibold rounded-full border border-hairline hover:border-job-navy transition-colors text-job-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2"
            >
              {open ? "Hide" : "How the search goes"}
            </button>
          )}
        </div>

        {/* Chart — desktop */}
        <div
          ref={ref}
          className={`hidden lg:block rounded-[18px] overflow-hidden border border-[#f0e6c2] w-full ${
            hero ? "mt-2.5" : "mt-4"
          } ${hero && !open ? "lg:hidden" : ""}`}
        >
          <Chart journey={journey} p={p} />
        </div>

        {/* The one explanatory line, moved beneath the chart it explains */}
        {hero && open && (
          <p className="hidden lg:block text-[13px] text-muted mt-2.5">{journey.headline}</p>
        )}

        {/* Contrast list — mobile */}
        <div className={`lg:hidden grid grid-cols-1 gap-4 ${hero ? "mt-5" : "mt-8"} ${hero && !open ? "hidden" : ""}`}>
          <div className="rounded-[16px] border border-hairline p-4">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted mb-3">On your own</p>
            <ul className="space-y-2">
              {journey.rough.milestones.map((m) => (
                <li key={m.lines.join()} className="flex gap-2.5 text-[13.5px] text-body">
                  <span aria-hidden="true" className="text-muted-soft">
                    ✕
                  </span>
                  {m.lines.join(" ")}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[16px] border-2 p-4" style={{ borderColor: NAVY }}>
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: NAVY }}>
              With FindWay
            </p>
            <ul className="space-y-2">
              {journey.steady.milestones.map((m) => (
                <li key={m.lines.join()} className="flex gap-2.5 text-[13.5px] font-semibold" style={{ color: NAVY }}>
                  <span aria-hidden="true">✓</span>
                  {m.lines.join(" ")}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
