"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import { signOut, switchProfileMode } from "@/lib/auth";
import { useHydrated, useSession } from "@/lib/useSession";
import { initialsOf } from "@/lib/roleTheme";
import NotificationBell from "./NotificationBell";

const navLinks = [
  { 
    href: "/", 
    label: "Home", 
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="transition-transform group-hover:scale-110" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ) 
  },
  { 
    href: "/explore", 
    label: "Explore", 
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="transition-transform group-hover:rotate-12 group-hover:scale-110" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ) 
  },
  { 
    href: "/requirements", 
    label: "Requirements", 
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="transition-transform group-hover:scale-110" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ) 
  },
  { 
    href: "/jobs", 
    label: "Jobs", 
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="transition-transform group-hover:scale-110 group-hover:-rotate-3" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ) 
  },
  { 
    href: "/funding", 
    label: "Funding", 
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="transition-transform group-hover:scale-110" aria-hidden="true">
        <path d="M6 4h12M6 9h12M6 4a5 5 0 0 1 0 10H6l8 7" />
      </svg>
    ) 
  },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Hydration guard: the store hook returns null on the server and the first
  // client paint, then syncs — so logged-out chrome renders until mounted.
  const session = useSession();
  const hydrated = useHydrated();
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Pages with a full-bleed dark hero that the navbar floats over (transparent
  // at rest, solid on scroll). /requirements joins these so its editorial hero
  // reads as one immersive field instead of sitting under a hard white bar.
  const isHome = pathname === "/" || pathname === "/explore" || pathname === "/jobs" || pathname === "/requirements";

  // Check scroll position and direction to dynamically adapt and show/hide navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (isHome) {
        setScrolled(currentScrollY > 40);
      } else {
        setScrolled(false);
      }

      if (currentScrollY <= 40) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down -> hide navbar
        setVisible(false);
      } else {
        // Scrolling up -> show navbar
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // Close the avatar dropdown on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    signOut();
    setMenuOpen(false);
    setDrawerOpen(false);
    router.push("/");
  };

  const loggedIn = hydrated && session;

  // Use dark text/lines for transparent navbar over light yellow backgrounds
  const isDarkTheme = isHome && !scrolled && pathname !== "/explore";

  const isJobs = pathname ? pathname.startsWith("/jobs") : false;
  const bgClass = isJobs ? "bg-canvas/95 backdrop-blur-md" : "bg-[#f6fcfd]/95 backdrop-blur-md";
  const bgSolidClass = isJobs ? "bg-canvas" : "bg-[#f6fcfd]";

  // Dynamic classes for translucent/transparent overlay styling
  const navClass = isHome
    ? `fixed top-4 left-0 right-0 mx-auto z-50 transition-all duration-300 rounded-[24px] border w-[96%] md:w-[92%] max-w-[1280px] ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-36 opacity-0 pointer-events-none"
      } ${(scrolled || pathname === "/explore")
      ? `${bgClass} border-[#5e6836]/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] py-0`
      : "bg-transparent border-transparent py-2"
    }`
    : `sticky top-4 left-0 right-0 mx-auto z-50 ${bgSolidClass} rounded-[24px] border border-[#5e6836]/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] py-0 w-[96%] md:w-[92%] max-w-[1280px] transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-36 opacity-0 pointer-events-none"
      }`;

  const navLinkClass = (isActive: boolean) => {
    if (isDarkTheme) {
      return `relative text-base font-semibold pb-1 transition-colors ${isActive ? "text-white" : "text-white/70 hover:text-white"
        }`;
    }
    return `relative text-base font-semibold pb-1 transition-colors ${isActive ? "text-ink" : "text-muted hover:text-ink"
      }`;
  };

  const activeUnderlineClass = isDarkTheme ? "bg-white" : "bg-ink";

  const listBtnClass = "group relative inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rausch to-rausch-active rounded-full shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2";

  const loginBtnClass = isDarkTheme
    ? "px-4 py-2.5 text-base font-medium text-white rounded-[8px] hover:bg-white/10 transition-colors"
    : "px-4 py-2.5 text-base font-medium text-ink rounded-[8px] hover:bg-surface-soft transition-colors";

  const signupBtnClass = isDarkTheme
    ? "px-5 py-2.5 text-base font-medium text-ink bg-white rounded-[8px] hover:bg-white/90 transition-colors"
    : "px-5 py-2.5 text-base font-medium text-white bg-rausch rounded-[8px] hover:bg-rausch-active transition-colors";

  const avatarPillClass = isDarkTheme
    ? "flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-white/20 hover:bg-white/10 text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    : `flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border transition-all hover:shadow-airbnb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${pathname === "/profile" ? "border-rausch ring-1 ring-rausch" : "border-hairline"
    } text-ink`;

  const avatarCircleClass = isDarkTheme
    ? "bg-white/20 text-white"
    : session?.activeView === "business"
      ? "bg-gradient-to-r from-rausch to-tab-rent text-white"
      : "bg-rausch/10 text-rausch";

  const avatarTextClass = isDarkTheme ? "text-white" : "text-ink";
  const arrowColorClass = isDarkTheme ? "text-white/85" : "text-muted";
  const hamburgerLineClass = isDarkTheme ? "block w-5 h-[2px] bg-white" : "block w-5 h-[2px] bg-ink";

  return (
    <>
      <nav className={navClass}>
        <div className="w-full flex items-center justify-between px-6 md:px-12 lg:px-16 h-20">
          {/* Logo */}
          <Link href="/" aria-label="FindWay home">
            <Logo size={34} lightText={isDarkTheme} />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={
                    isDarkTheme && isActive
                      ? { color: "var(--hero-accent, #ffffff)" }
                      : undefined
                  }
                  className={`${navLinkClass(isActive)} group inline-flex items-center gap-1.5`}
                >
                  <span className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">{link.icon}</span>
                  <span>{link.label}</span>
                  {isActive && (
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-colors duration-700 ${activeUnderlineClass}`}
                      style={isDarkTheme ? { backgroundColor: "var(--hero-accent, #ffffff)" } : undefined}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop auth area */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/post" className={listBtnClass}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0"><path d="M12 5v14m-7-7h14" /></svg>
              List your property
            </Link>

            {loggedIn && session ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label="Account menu"
                  className={avatarPillClass}
                >
                  {session.avatarUrl ? (
                    <Image
                      src={session.avatarUrl}
                      alt={session.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold ${avatarCircleClass}`}>
                      {initialsOf(session.name)}
                    </span>
                  )}
                  <span className={`text-sm font-medium max-w-[120px] truncate ${avatarTextClass}`}>
                    {session.name.split(" ")[0]}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    aria-hidden="true"
                    className={`${arrowColorClass} transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    aria-label="Account"
                    className="absolute right-0 top-full mt-2 w-56 bg-canvas border border-hairline rounded-[14px] shadow-airbnb py-2 animate-fade-up"
                  >
                    <div className="px-4 py-2 border-b border-hairline-soft mb-1">
                      <p className="text-sm font-semibold text-ink truncate">{session.name}</p>
                      <p className="text-[11px] text-muted truncate">
                        {session.email && !session.email.endsWith("@findway.temp") ? session.email : session.phone ? `+91 ${session.phone}` : ""}
                      </p>
                    </div>
                    {!session.roles.includes("admin") && (
                      <Link
                        href="/profile"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-body hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-inset"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                    )}
                    {session.roles.includes("admin") && (
                      <Link
                        href="/admin"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-body hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-inset text-left font-medium text-rausch"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                        </svg>
                        Admin Panel
                      </Link>
                    )}
                    {!session.roles.includes("admin") && (
                      <button
                        role="menuitem"
                        onClick={() => {
                          switchProfileMode(session.activeView === "business" ? "personal" : "business");
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-body hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-inset text-left font-medium"
                      >
                        {session.activeView === "business" ? (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                            </svg>
                            Switch to Personal
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <path d="M9 17V9l6 4-6 4z" />
                            </svg>
                            Switch to Business
                          </>
                        )}
                      </button>
                    )}
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-inset"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log out
                    </button>
                  </div>
                )}
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className={loginBtnClass}>
                  Log in
                </Link>
                <Link href="/login?mode=signup" className={signupBtnClass}>
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile: List your property CTA + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/post"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-rausch to-rausch-active rounded-full shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0"><path d="M12 5v14m-7-7h14" /></svg>
              List
            </Link>
            <button
              className="flex flex-col gap-1 p-2"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <span className={hamburgerLineClass} />
              <span className={hamburgerLineClass} />
              <span className={hamburgerLineClass} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute top-0 right-0 w-64 h-full bg-canvas shadow-airbnb animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-hairline">
              <Logo size={28} />
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="p-1 text-muted">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Signed-in identity row */}
            {loggedIn && session && (
              <Link
                href="/profile"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-4 py-3 border-b border-hairline hover:bg-surface-soft transition-colors"
              >
                {session.avatarUrl ? (
                  <Image
                    src={session.avatarUrl}
                    alt={session.name}
                    width={36}
                    height={36}
                    className="rounded-full object-cover shrink-0"
                  />
                ) : (
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 ${session.activeView === "business"
                    ? "bg-gradient-to-r from-rausch to-tab-rent text-white"
                    : "bg-rausch/10 text-rausch"
                    }`}>
                    {initialsOf(session.name)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink truncate">{session.name}</span>
                  <span className="block text-[11px] text-muted truncate">
                    {session.email && !session.email.endsWith("@findway.temp") ? session.email : session.phone ? `+91 ${session.phone}` : ""}
                  </span>
                </span>
              </Link>
            )}

            <div className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-base font-medium transition-colors ${isActive ? "bg-surface-soft text-ink" : "text-body hover:bg-surface-soft"
                      }`}
                  >
                    <span className="shrink-0 text-muted">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 px-4 mt-4">
              <Link href="/post" onClick={() => setDrawerOpen(false)} className="w-full flex items-center justify-center gap-2 py-3 text-base font-semibold text-white bg-gradient-to-r from-rausch to-[#e8385d] rounded-[10px] shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0"><path d="M12 5v14m-7-7h14" /></svg>
                List your property
              </Link>
              {loggedIn ? (
                <>
                  <Link
                    href={session.roles.includes("admin") ? "/admin" : "/profile"}
                    onClick={() => setDrawerOpen(false)}
                    className="w-full py-2.5 text-center text-base font-medium text-ink border border-ink rounded-[8px]"
                  >
                    {session.roles.includes("admin") ? "Admin Panel" : "Profile"}
                  </Link>
                  {!session.roles.includes("admin") && (
                    <button
                      onClick={() => {
                        switchProfileMode(session.activeView === "business" ? "personal" : "business");
                        setDrawerOpen(false);
                      }}
                      className="w-full py-2.5 text-center text-base font-semibold text-white bg-gradient-to-r from-rausch to-tab-rent rounded-[8px] hover:opacity-90 transition-opacity"
                    >
                      {session.activeView === "business" ? "Switch to Personal" : "Switch to Business"}
                    </button>
                  )}
                  <button onClick={handleLogout} className="w-full py-2.5 text-center text-base font-medium text-error border border-error/40 rounded-[8px] hover:bg-error/5 transition-colors">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setDrawerOpen(false)} className="w-full py-2.5 text-center text-base font-medium text-ink border border-ink rounded-[8px]">
                    Log in
                  </Link>
                  <Link href="/login?mode=signup" onClick={() => setDrawerOpen(false)} className="w-full py-2.5 text-center text-base font-medium text-white bg-rausch rounded-[8px]">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
