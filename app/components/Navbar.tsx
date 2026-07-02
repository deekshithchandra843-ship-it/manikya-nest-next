"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import { signOut } from "../lib/demoAuth";
import { useHydrated, useSession } from "../lib/useSession";
import { initialsOf } from "../lib/roleTheme";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/requirements", label: "Requirements" },
  { href: "/jobs", label: "Jobs" },
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

  return (
    <>
      <nav className="sticky top-0 z-50 bg-canvas border-b border-hairline">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 md:px-6 lg:px-10 h-20">
          {/* Logo */}
          <Link href="/" aria-label="FindWay home">
            <Logo size={34} />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-base font-semibold pb-1 transition-colors ${
                    isActive ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-ink rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop auth area */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/post" className="px-4 py-2.5 text-base font-medium text-ink rounded-full hover:bg-surface-soft transition-colors">
              List your property
            </Link>

            {loggedIn && session ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label="Account menu"
                  className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border transition-all hover:shadow-airbnb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
                    pathname === "/profile" ? "border-rausch ring-1 ring-rausch" : "border-hairline"
                  }`}
                >
                  <span className="w-8 h-8 rounded-full bg-rausch/10 text-rausch flex items-center justify-center text-[12px] font-bold">
                    {initialsOf(session.name)}
                  </span>
                  <span className="text-sm font-medium text-ink max-w-[120px] truncate">
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
                    className={`text-muted transition-transform ${menuOpen ? "rotate-180" : ""}`}
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
                      <p className="text-[11px] text-muted truncate">{session.email}</p>
                    </div>
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
            ) : (
              <>
                <Link href="/login" className="px-4 py-2.5 text-base font-medium text-ink rounded-[8px] hover:bg-surface-soft transition-colors">
                  Log in
                </Link>
                <Link href="/login?mode=signup" className="px-5 py-2.5 text-base font-medium text-white bg-rausch rounded-[8px] hover:bg-rausch-active transition-colors">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1 p-2"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <span className="block w-5 h-[2px] bg-ink" />
            <span className="block w-5 h-[2px] bg-ink" />
            <span className="block w-5 h-[2px] bg-ink" />
          </button>
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
                <span className="w-9 h-9 rounded-full bg-rausch/10 text-rausch flex items-center justify-center text-[13px] font-bold shrink-0">
                  {initialsOf(session.name)}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink truncate">{session.name}</span>
                  <span className="block text-[11px] text-muted truncate">{session.email}</span>
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
                    className={`px-3 py-2.5 rounded-[8px] text-base font-medium transition-colors ${
                      isActive ? "bg-surface-soft text-ink" : "text-body hover:bg-surface-soft"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 px-4 mt-4">
              <Link href="/post" onClick={() => setDrawerOpen(false)} className="w-full py-2.5 text-center text-base font-medium text-ink rounded-[8px] hover:bg-surface-soft">
                List your property
              </Link>
              {loggedIn ? (
                <>
                  <Link href="/profile" onClick={() => setDrawerOpen(false)} className="w-full py-2.5 text-center text-base font-medium text-ink border border-ink rounded-[8px]">
                    Profile
                  </Link>
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
