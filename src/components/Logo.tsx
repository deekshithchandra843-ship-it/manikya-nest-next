"use client";

interface LogoProps {
  /** Pixel size of the square badge mark. Default 32. */
  size?: number;
  /** Show the "FindWay" wordmark beside the mark. Default true. */
  showText?: boolean;
  className?: string;
}

/**
 * FindWay brand logo.
 *
 * The mark is a single bold "F" that doubles as a wayfinding symbol:
 *   • the stem + arms read clearly as the letter F  → "FindWay"
 *   • the upper arm rises toward a destination pin   → "find your way"
 *     to the two things FindWay pairs: a shelter and a job.
 *
 * It is interactive: on hover the badge lifts and the F nudges up-and-forward
 * while the pin "drops in", animating the moment of arriving at the destination.
 */
export default function Logo({ size = 32, showText = true, className = "" }: LogoProps) {
  return (
    <span className={`group inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="shrink-0 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:rotate-3"
      >
        <defs>
          <linearGradient id="fw-badge" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff5a76" />
            <stop offset="1" stopColor="#e00b41" />
          </linearGradient>
        </defs>

        {/* Badge */}
        <rect
          width="40"
          height="40"
          rx="11"
          fill="url(#fw-badge)"
          className="transition-[filter] duration-300 group-hover:[filter:drop-shadow(0_4px_8px_rgba(255,56,92,0.45))]"
        />

        {/* "F" wayfinder — stem + arms. Nudges toward the pin on hover. */}
        <g className="transition-transform duration-300 ease-out group-hover:translate-x-[1.5px] group-hover:-translate-y-[1.5px]">
          {/* Stem */}
          <path
            d="M14 11 L14 29"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Upper arm — rises toward the destination */}
          <path
            d="M14 12 L25.5 10"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Middle arm */}
          <path
            d="M14 20 L22.5 20"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Destination pin — the "way" you're finding. Drops in on hover. */}
        <circle
          cx="28.5"
          cy="9"
          r="2.5"
          fill="#ffffff"
          className="origin-center transition-transform duration-300 ease-out group-hover:scale-125"
        />
      </svg>

      {showText && (
        <span
          className="font-semibold tracking-tight leading-none"
          style={{ fontSize: size * 0.6 }}
        >
          <span className="text-ink">Find</span>
          <span className="text-rausch">Way</span>
          <span className="inline-block w-[0.28em] h-[0.28em] ml-[0.12em] rounded-full bg-rausch align-baseline transition-transform duration-300 group-hover:scale-150" />
        </span>
      )}
    </span>
  );
}
