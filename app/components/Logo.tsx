"use client";

interface LogoProps {
  /** Pixel size of the square badge mark. Default 32. */
  size?: number;
  /** Show the "NestNext" wordmark beside the mark. Default true. */
  showText?: boolean;
  className?: string;
}

/**
 * NestNext brand logo.
 *
 * The mark fuses the two halves of the brand into one symbol:
 *   • a roof / nest peak  → "Nest"  (home, belonging)
 *   • a rising forward arrow → "Next" (career growth, the journey ahead)
 *
 * It is interactive: on hover the badge lifts and the arrow "takes off"
 * up-and-forward, animating the move from home to what's next.
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
          <linearGradient id="nn-badge" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff5a76" />
            <stop offset="1" stopColor="#e00b41" />
          </linearGradient>
        </defs>

        {/* Badge */}
        <rect
          width="40"
          height="40"
          rx="11"
          fill="url(#nn-badge)"
          className="transition-[filter] duration-300 group-hover:[filter:drop-shadow(0_4px_8px_rgba(255,56,92,0.45))]"
        />

        {/* Roof / nest peak — "Nest" */}
        <path
          d="M8.5 19.5 L20 10 L31.5 19.5"
          stroke="#ffffff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Rising forward arrow — "Next". Lifts off on hover. */}
        <g className="transition-transform duration-300 ease-out group-hover:translate-x-[2px] group-hover:-translate-y-[2.5px]">
          <path
            d="M13 28 L25 16"
            stroke="#ffffff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.5 16 L25 16 L25 21.5"
            stroke="#ffffff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      {showText && (
        <span
          className="font-semibold tracking-tight leading-none"
          style={{ fontSize: size * 0.6 }}
        >
          <span className="text-ink">Nest</span>
          <span className="text-rausch">Next</span>
          <span className="inline-block w-[0.28em] h-[0.28em] ml-[0.12em] rounded-full bg-rausch align-baseline transition-transform duration-300 group-hover:scale-150" />
        </span>
      )}
    </span>
  );
}
