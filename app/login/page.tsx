"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "../components/Logo";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";

type AuthMode = "login" | "signup";

/**
 * Inner card reads ?mode=signup, so it must sit inside a <Suspense> boundary
 * (useSearchParams opts the tree into client-side rendering during prerender).
 * The URL is the single source of truth for the active tab —
 * history.replaceState syncs into useSearchParams (Next 16 native History API
 * integration), so toggling needs no component state.
 */
function AuthCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode: AuthMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  const switchMode = (m: AuthMode) => {
    window.history.replaceState(null, "", m === "signup" ? "/login?mode=signup" : "/login");
  };

  return (
    <div className="bg-canvas rounded-[24px] p-6 shadow-3d border border-hairline-soft">
      {/* Brand header */}
      <div className="flex flex-col items-center mb-5">
        <Logo size={40} />
        <p className="text-[13px] text-muted mt-2.5 text-center leading-snug">
          One Platform. Two Worlds.
          <br />
          Better Living. Better Careers.
        </p>
      </div>

      {/* Log in / Sign up toggle */}
      <div role="tablist" aria-label="Log in or sign up" className="flex gap-1 p-1 bg-surface-soft rounded-[12px] mb-5">
        {(["login", "signup"] as AuthMode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchMode(m)}
            className={`relative flex-1 h-10 text-sm font-medium rounded-[9px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
              mode === m ? "bg-canvas text-ink shadow-airbnb" : "text-muted hover:text-ink"
            }`}
          >
            {m === "login" ? "Log in" : "Sign up"}
            {mode === m && (
              <span aria-hidden="true" className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-9 h-[3px] bg-rausch rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div key={mode} className="animate-fade-up">
        {mode === "login" ? (
          <>
            <h2 className="text-[19px] font-bold text-ink mb-4">Welcome back</h2>
            <LoginForm onSuccess={() => router.push("/profile")} />
            <p className="text-[13px] text-muted text-center mt-5">
              New to FindWay?{" "}
              <button onClick={() => switchMode("signup")} className="text-rausch font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch rounded-sm">
                Create an account
              </button>
            </p>
          </>
        ) : (
          <>
            <SignupForm onSuccess={() => router.push("/profile")} />
            <p className="text-[13px] text-muted text-center mt-4">
              Already have an account?{" "}
              <button onClick={() => switchMode("login")} className="text-rausch font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch rounded-sm">
                Log in
              </button>
            </p>
          </>
        )}
      </div>

      <p className="text-[11px] text-muted text-center mt-4 leading-relaxed">
        By continuing you agree to FindWay&apos;s{" "}
        <Link href="#" className="text-legal-link">Terms</Link> and{" "}
        <Link href="#" className="text-legal-link">Privacy Policy</Link>.
      </p>
    </div>
  );
}

function AuthCardFallback() {
  return (
    <div className="bg-canvas rounded-[24px] p-6 shadow-3d border border-hairline-soft" aria-busy="true">
      <div className="flex flex-col items-center mb-5">
        <div className="skeleton w-10 h-10 rounded-[11px]" />
        <div className="skeleton h-3.5 w-44 rounded-full mt-3" />
      </div>
      <div className="skeleton h-12 rounded-[12px] mb-5" />
      <div className="space-y-4">
        <div className="skeleton h-12 rounded-[10px]" />
        <div className="skeleton h-12 rounded-[10px]" />
        <div className="skeleton h-12 rounded-[10px]" />
        <div className="skeleton h-12 rounded-[10px]" />
      </div>
    </div>
  );
}

const FEATURES = [
  {
    title: "Secure & Reliable",
    desc: "Your data is protected with top security",
    chip: "border-rausch/25 bg-rausch/5 text-rausch",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 3l8 3.5v5c0 4.5-3.4 7.6-8 9.5-4.6-1.9-8-5-8-9.5v-5z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "24/7 Support",
    desc: "We're here to help anytime, anywhere",
    chip: "border-tab-jobs/25 bg-tab-jobs/5 text-tab-jobs",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M4 13a8 8 0 0116 0" />
        <path d="M3 15a2 2 0 012-2h1v5H5a2 2 0 01-2-2v-1zm18 0a2 2 0 00-2-2h-1v5h1a2 2 0 002-2v-1z" />
        <path d="M19 18v1a2 2 0 01-2 2h-3" />
      </svg>
    ),
  },
  {
    title: "Quick & Easy",
    desc: "Simple steps to find what you need",
    chip: "border-violet/25 bg-violet/5 text-violet",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M13 2L4.5 13.5H11l-1 8.5L18.5 10.5H12z" />
      </svg>
    ),
  },
  {
    title: "Trusted by Thousands",
    desc: "Join our growing community",
    chip: "border-[#0f766e]/25 bg-[#0f766e]/5 text-[#0f766e]",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="9" r="5.5" />
        <path d="M9 13.5L7.5 21l4.5-2.5L16.5 21 15 13.5" />
      </svg>
    ),
  },
];

export default function LoginPage() {
  return (
    <main className="relative pb-20 md:pb-0 bg-canvas">
      {/* ── Hero: the split Home/Job artwork with the single-door auth card.
             Desktop (lg+): artwork is a full-bleed backdrop behind the centred
             card; min-height is pinned to the TALLEST tab (sign up) so
             switching tabs never resizes the section — the backdrop stays
             perfectly static. Mobile: object-cover would crop the wide artwork
             down to its centre seam, hiding the theme — so the FULL artwork
             renders as a banner at its natural aspect ratio with the card
             overlapping it below. ── */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/login-hero.png"
          alt=""
          aria-hidden="true"
          className="hidden lg:block absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="lg:min-h-[max(calc(100vh-80px),960px)] lg:flex lg:items-center lg:justify-center lg:px-4 lg:py-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/login-hero.png"
            alt=""
            aria-hidden="true"
            className="lg:hidden w-full h-auto"
          />
          <div className="relative w-full max-w-[400px] mx-auto -mt-14 px-4 pb-4 lg:mt-0 lg:px-0 lg:pb-0">
            <Suspense fallback={<AuthCardFallback />}>
              <AuthCard />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ── Trust feature bar ── */}
      <div className="relative max-w-[1120px] mx-auto px-4 md:px-6 mt-4 lg:-mt-12 pb-8">
        <div className="bg-canvas rounded-[20px] shadow-airbnb border border-hairline-soft px-2 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-5">
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`flex items-center gap-3 px-5 ${i > 0 ? "lg:border-l lg:border-hairline-soft" : ""}`}>
              <span className={`shrink-0 w-11 h-11 rounded-full border flex items-center justify-center ${f.chip}`} aria-hidden="true">
                {f.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-ink">{f.title}</p>
                <p className="text-[12px] text-muted leading-snug mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Signature strip ── */}
      <div className="relative bg-canvas py-5 flex items-center justify-center gap-2 text-sm text-muted">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-rausch" aria-hidden="true">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        Connecting Dreams to Doors &amp; Careers
      </div>
    </main>
  );
}
