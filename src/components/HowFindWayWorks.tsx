"use client";
import { useEffect, useRef, useState } from "react";

/**
 * "How FindWay works" story wheel + Our Mission.
 * Replicates the Captain Fresh homepage animation with FindWay's four
 * pillars: Home → Job → Skill → Community. The wheel builds wedge by
 * wedge on a looping CSS timeline once scrolled into view; the mission
 * block reveals its staggered cards on scroll.
 * Spec: docs/superpowers/specs/2026-07-14-how-findway-works-design.md
 */

const CYCLE = "12s";

const pillars = [
  {
    key: "home",
    label: "Home",
    // house
    icon: <path d="M3 11.5L12 4l9 7.5M5.5 9.8V20h13V9.8" />,
  },
  {
    key: "job",
    label: "Job",
    // briefcase
    icon: <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M4 7h16a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1zm-1 5.5c2.8 1.1 5.9 1.7 9 1.7s6.2-.6 9-1.7" />,
  },
  {
    key: "skill",
    label: "Skill",
    // graduation cap
    icon: <path d="M12 5L2.5 9.5 12 14l9.5-4.5L12 5zm-6 6.8V17c1.8 1.4 3.9 2.2 6 2.2s4.2-.8 6-2.2v-5.2M21.5 9.5V15" />,
  },
  {
    key: "community",
    label: "Community",
    // people
    icon: <path d="M9 11a3 3 0 100-6 3 3 0 000 6zm7 .5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM3 19v-1a4 4 0 014-4h4a4 4 0 014 4v1m1-5h1a3 3 0 013 3v1" />,
  },
];

/* Mission cards tell the newcomer's journey, step by step — the water
 * chain carries the story from one card to the next. */
const storySteps = [
  {
    key: "nest",
    step: "Step 1",
    title: "Find your nest",
    caption: "A verified home, zero brokerage",
    icon: pillars[0].icon,
  },
  {
    key: "job",
    step: "Step 2",
    title: "Land the job",
    caption: "Work close to where you live",
    icon: pillars[1].icon,
  },
  {
    key: "skill",
    step: "Step 3",
    title: "Level up",
    caption: "Skills that grow your career",
    icon: pillars[2].icon,
  },
  {
    key: "belong",
    step: "Step 4",
    title: "Belong",
    caption: "Flatmates, friends & your people",
    icon: pillars[3].icon,
  },
];

function usePlayOnView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setInView(true)),
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

/* Wheel geometry — single SVG so wedges, labels, arrows and icon
 * callouts stay aligned at every size. Center (360,220), radius 150. */
const wedges = [
  // top-left → top-right → bottom-right → bottom-left (clockwise build)
  { d: "M360,220 L210,220 A150,150 0 0 1 360,70 Z", fill: "#fb4d68", label: "Home", lx: 289.3, ly: 149.3, rot: -45 },
  { d: "M360,220 L360,70 A150,150 0 0 1 510,220 Z", fill: "#d90f43", label: "Job", lx: 430.7, ly: 149.3, rot: 45 },
  { d: "M360,220 L510,220 A150,150 0 0 1 360,370 Z", fill: "#e8244d", label: "Skill", lx: 430.7, ly: 290.7, rot: -45 },
  { d: "M360,220 L360,370 A150,150 0 0 1 210,220 Z", fill: "#c40837", label: "Community", lx: 289.3, ly: 290.7, rot: 45 },
];

const arrows = [
  "M339.6,91.6 A130,130 0 0 1 380.3,91.6",   // top
  "M488.4,199.7 A130,130 0 0 1 488.4,240.3", // right
  "M380.3,348.4 A130,130 0 0 1 339.6,348.4", // bottom
  "M231.6,240.3 A130,130 0 0 1 231.6,199.7", // left
];

const callouts = [
  { cx: 120, cy: 120, line: "M146,120 L195,120 L226,143" },
  { cx: 600, cy: 120, line: "M574,120 L525,120 L494,143" },
  { cx: 600, cy: 320, line: "M574,320 L525,320 L494,297" },
  { cx: 120, cy: 320, line: "M146,320 L195,320 L226,297" },
];

const styles = `
  .fw-seg, .fw-callout, .fw-core { opacity: 0; animation-duration: ${CYCLE}; animation-iteration-count: infinite; animation-play-state: paused; }
  .fw-play .fw-seg, .fw-play .fw-callout, .fw-play .fw-core { animation-play-state: running; }
  /* Origin must be the wheel center (360,220) in user units: percentage
   * origins break on the mobile crop because Chrome ignores the viewBox
   * min-x/min-y offset when resolving them. */
  .fw-seg { transform-box: view-box; transform-origin: 360px 220px; }
  .fw-seg-1 { animation-name: fw-seg-1; } .fw-callout-1 { animation-name: fw-fade-1; }
  .fw-seg-2 { animation-name: fw-seg-2; } .fw-callout-2 { animation-name: fw-fade-2; }
  .fw-seg-3 { animation-name: fw-seg-3; } .fw-callout-3 { animation-name: fw-fade-3; }
  .fw-seg-4 { animation-name: fw-seg-4; } .fw-callout-4 { animation-name: fw-fade-4; }
  .fw-core { animation-name: fw-core; }
  .fw-ring { opacity: 0; transform-box: view-box; transform-origin: 360px 220px; animation: fw-core ${CYCLE} infinite paused, fw-spin 9s linear infinite paused; }
  .fw-play .fw-ring { animation-play-state: running, running; }
  @keyframes fw-spin { to { transform: rotate(360deg); } }
  @keyframes fw-seg-1 { 0%,2% { opacity:0; transform:scale(.55) rotate(-16deg); } 9% { opacity:1; transform:scale(1) rotate(0deg); } 95% { opacity:1; } 100% { opacity:0; } }
  @keyframes fw-seg-2 { 0%,10% { opacity:0; transform:scale(.55) rotate(-16deg); } 17% { opacity:1; transform:scale(1) rotate(0deg); } 95% { opacity:1; } 100% { opacity:0; } }
  @keyframes fw-seg-3 { 0%,18% { opacity:0; transform:scale(.55) rotate(-16deg); } 25% { opacity:1; transform:scale(1) rotate(0deg); } 95% { opacity:1; } 100% { opacity:0; } }
  @keyframes fw-seg-4 { 0%,26% { opacity:0; transform:scale(.55) rotate(-16deg); } 33% { opacity:1; transform:scale(1) rotate(0deg); } 95% { opacity:1; } 100% { opacity:0; } }
  @keyframes fw-fade-1 { 0%,4% { opacity:0; } 11% { opacity:1; } 95% { opacity:1; } 100% { opacity:0; } }
  @keyframes fw-fade-2 { 0%,12% { opacity:0; } 19% { opacity:1; } 95% { opacity:1; } 100% { opacity:0; } }
  @keyframes fw-fade-3 { 0%,20% { opacity:0; } 27% { opacity:1; } 95% { opacity:1; } 100% { opacity:0; } }
  @keyframes fw-fade-4 { 0%,28% { opacity:0; } 35% { opacity:1; } 95% { opacity:1; } 100% { opacity:0; } }
  @keyframes fw-core { 0%,36% { opacity:0; } 44% { opacity:1; } 95% { opacity:1; } 100% { opacity:0; } }
  .fw-card { opacity: 0; transform: translateY(24px); transition: opacity .6s ease, transform .6s ease; }
  .fw-reveal .fw-card { opacity: 1; transform: translateY(0); }
  .fw-reveal .fw-card-2 { transition-delay: .15s; } .fw-reveal .fw-card-3 { transition-delay: .3s; } .fw-reveal .fw-card-4 { transition-delay: .45s; }
  .fw-links { opacity: 0; transition: opacity .8s ease .6s; }
  .fw-reveal .fw-links { opacity: 1; }
  /* water flows down the chain: Home fills link 1, reaches Job, then
   * link 2 to Skill, then link 3 to Community — then the loop restarts.
   * Flow paths use pathLength=1, so dashoffset 1→0 draws start-to-end. */
  .fw-flow { stroke-dasharray: 1; stroke-dashoffset: 1; animation-duration: 6s; animation-timing-function: linear; animation-iteration-count: infinite; animation-delay: 1s; animation-play-state: paused; }
  .fw-reveal .fw-flow { animation-play-state: running; }
  .fw-flow-1 { animation-name: fw-flow-1; }
  .fw-flow-2 { animation-name: fw-flow-2; }
  .fw-flow-3 { animation-name: fw-flow-3; }
  @keyframes fw-flow-1 { 0%, 5% { stroke-dashoffset: 1; opacity: 1; } 20% { stroke-dashoffset: 0; } 88% { stroke-dashoffset: 0; opacity: 1; } 92% { opacity: 0; } 93%, 100% { stroke-dashoffset: 1; opacity: 0; } }
  @keyframes fw-flow-2 { 0%, 30% { stroke-dashoffset: 1; opacity: 1; } 45% { stroke-dashoffset: 0; } 88% { stroke-dashoffset: 0; opacity: 1; } 92% { opacity: 0; } 93%, 100% { stroke-dashoffset: 1; opacity: 0; } }
  @keyframes fw-flow-3 { 0%, 55% { stroke-dashoffset: 1; opacity: 1; } 70% { stroke-dashoffset: 0; } 88% { stroke-dashoffset: 0; opacity: 1; } 92% { opacity: 0; } 93%, 100% { stroke-dashoffset: 1; opacity: 0; } }
  /* the pulse travels with the current: one card at a time zooms + blinks
   * (Home → Job → Skill → Community), the rest stay static */
  @keyframes fw-pulse {
    0% { transform: scale(1); filter: brightness(1); box-shadow: 0 6px 16px rgba(255,56,92,.18); }
    8% { transform: scale(1.07); filter: brightness(1.12); box-shadow: 0 14px 34px rgba(255,56,92,.4); }
    12% { transform: scale(1.03); filter: brightness(1.06); }
    18%, 100% { transform: scale(1); filter: brightness(1); box-shadow: 0 6px 16px rgba(255,56,92,.18); }
  }
  .fw-reveal .fw-card { animation: fw-pulse 6s ease-in-out infinite; }
  .fw-reveal .fw-card-1 { animation-delay: 1s; }
  .fw-reveal .fw-card-2 { animation-delay: 2.5s; }
  .fw-reveal .fw-card-3 { animation-delay: 4s; }
  .fw-reveal .fw-card-4 { animation-delay: 5.5s; }
  @media (prefers-reduced-motion: reduce) {
    .fw-seg, .fw-callout, .fw-core, .fw-ring, .fw-flow { animation: none !important; opacity: 1; }
    .fw-flow { stroke-dashoffset: 0; }
    .fw-card { opacity: 1; transform: none; transition: none; animation: none !important; }
  }
`;

function WheelSvg({ idSuffix, withCallouts, viewBox }: { idSuffix: string; withCallouts: boolean; viewBox: string }) {
  const markerId = `fw-arrowhead-${idSuffix}`;
  return (
    <svg viewBox={viewBox} role="img" aria-label="FindWay cycle: Home, Job, Skill and Community connected in one loop" className="w-full h-auto max-w-[820px] mx-auto">
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="#ffffff" />
        </marker>
      </defs>

      {wedges.map((w, i) => (
        <g key={w.label} className={`fw-seg fw-seg-${i + 1}`}>
          <path d={w.d} fill={w.fill} />
          <text
            x={w.lx}
            y={w.ly}
            transform={`rotate(${w.rot} ${w.lx} ${w.ly})`}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="15"
            fontWeight="700"
            letterSpacing="2.5"
            style={{ textTransform: "uppercase" }}
          >
            {w.label.toUpperCase()}
          </text>
        </g>
      ))}

      {/* cycle arrows spin automatically around the core */}
      <g className="fw-ring">
        {arrows.map((d) => (
          <path key={d} d={d} fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" markerEnd={`url(#${markerId})`} />
        ))}
      </g>
      <g className="fw-core">
        <circle cx="360" cy="220" r="62" fill="#ffffff" />
        <text x="360" y="228" textAnchor="middle" fill="#ff385c" fontSize="24" fontWeight="800" letterSpacing="-0.5">
          findway.
        </text>
      </g>

      {/* icon callouts */}
      {withCallouts &&
        callouts.map((c, i) => (
          <g key={pillars[i].key} className={`fw-callout fw-callout-${i + 1}`}>
            <path d={c.line} fill="none" stroke="#e8244d" strokeWidth="1.5" opacity="0.55" />
            <circle cx={c.cx} cy={c.cy} r="24" fill="#d90f43" />
            <g transform={`translate(${c.cx - 12}, ${c.cy - 12})`} stroke="#ffffff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {pillars[i].icon}
            </g>
          </g>
        ))}
    </svg>
  );
}

export default function HowFindWayWorks() {
  const wheel = usePlayOnView<HTMLDivElement>();
  const mission = usePlayOnView<HTMLDivElement>();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Story wheel */}
      <section aria-label="How FindWay works" className="mb-10">
        <div
          ref={wheel.ref}
          className={`py-6 md:py-8 ${wheel.inView ? "fw-play" : ""}`}
        >
          <h2 className="text-center text-neutral-900 text-[26px] md:text-[38px] font-extrabold tracking-tight leading-tight max-w-[640px] mx-auto mb-8 md:mb-10">
            One City. One App. Your Whole Journey, Sorted.
          </h2>
          <div className="rounded-[20px] bg-[#fdeef1] shadow-airbnb px-2 py-4 md:px-6 md:py-6">
            {/* Desktop: wide canvas with icon callouts. Mobile: tight crop so
              * the wheel fills the phone width instead of shrinking. */}
            <div className="hidden sm:block">
              <WheelSvg idSuffix="d" withCallouts viewBox="0 0 720 440" />
            </div>
            <div className="sm:hidden">
              <WheelSvg idSuffix="m" withCallouts={false} viewBox="200 60 320 320" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section aria-label="Our mission" className="mb-12">
        <div
          ref={mission.ref}
          className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center ${mission.inView ? "fw-reveal" : ""}`}
        >
          {/* staggered pillar cards, chained with connector lines like the reference */}
          <div className="relative grid grid-cols-2 gap-4 sm:gap-5 max-w-[420px] mx-auto md:mx-0 w-full">
            <svg
              className="fw-links absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* Home → Job → Skill → Community elbow links; a rausch "current" flows over the pink pipe */}
              {["M46,20 L50,20 L50,32 L54,32", "M54,46 L50,46 L50,60 L46,60", "M46,76 L50,76 L50,82 L54,82"].map((d, i) => (
                <g key={d}>
                  <path d={d} vectorEffect="non-scaling-stroke" fill="none" stroke="#222222" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" />
                  <path d={d} pathLength={1} className={`fw-flow fw-flow-${i + 1}`} vectorEffect="non-scaling-stroke" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
                </g>
              ))}
            </svg>
            <div className="flex flex-col gap-4 sm:gap-5">
              {[storySteps[0], storySteps[2]].map((s, col) => (
                <div
                  key={s.key}
                  className={`fw-card fw-card-${col === 0 ? 1 : 3} h-[170px] md:h-[190px] rounded-[22px] bg-gradient-to-br from-[#fb4d68] to-[#c40837] shadow-airbnb flex flex-col items-center justify-center gap-2 px-4 text-center`}
                >
                  <span className="text-white/70 text-[10px] font-bold uppercase tracking-[2px]">{s.step}</span>
                  <span className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {s.icon}
                    </svg>
                  </span>
                  <span className="text-white font-bold text-base leading-tight">{s.title}</span>
                  <span className="text-white/85 text-xs leading-snug">{s.caption}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4 sm:gap-5 pt-10 sm:pt-12">
              {[storySteps[1], storySteps[3]].map((s, col) => (
                <div
                  key={s.key}
                  className={`fw-card fw-card-${col === 0 ? 2 : 4} h-[170px] md:h-[190px] rounded-[22px] bg-gradient-to-br from-[#fb4d68] to-[#c40837] shadow-airbnb flex flex-col items-center justify-center gap-2 px-4 text-center`}
                >
                  <span className="text-white/70 text-[10px] font-bold uppercase tracking-[2px]">{s.step}</span>
                  <span className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {s.icon}
                    </svg>
                  </span>
                  <span className="text-white font-bold text-base leading-tight">{s.title}</span>
                  <span className="text-white/85 text-xs leading-snug">{s.caption}</span>
                </div>
              ))}
            </div>
          </div>

          {/* mission copy */}
          <div className="flex flex-col items-start space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rausch/10 text-rausch text-xs font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-rausch animate-pulse"></span>
              Our Mission
            </div>
            
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-ink leading-tight">
              Connect Every New Beginning in the City —{" "}
              <span className="bg-gradient-to-r from-rausch to-[#c40837] bg-clip-text text-transparent">
                Home, Work, and Beyond
              </span>
            </h3>
            
            <div className="relative pl-6 border-l-2 border-rausch/20 py-1">
              <p className="text-base md:text-lg text-body leading-relaxed font-medium mb-3">
                Moving to a new city is fragmented and overwhelming — finding a trusted home, a nearby
                job, the right skills, and people you belong with all happen in different places.
              </p>
              <p className="text-sm md:text-base text-body/80 leading-relaxed">
                FindWay brings them together on one platform, so every newcomer to Bengaluru can settle
                in with verified listings, zero brokerage, and a community that has their back.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
