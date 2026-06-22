"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/find-nest", label: "Find Nest" },
  { href: "/jobs", label: "Jobs" },
  { href: "/whats-next", label: "What's Next" },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="sticky top-0 z-50 bg-canvas border-b border-hairline">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 md:px-6 lg:px-10 h-20">
          {/* Logo */}
          <Link href="/" aria-label="NestNext home">
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

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/post" className="px-4 py-2.5 text-base font-medium text-ink rounded-full hover:bg-surface-soft transition-colors">
              List your property
            </Link>
            <Link href="/login" className="px-4 py-2.5 text-base font-medium text-ink rounded-[8px] hover:bg-surface-soft transition-colors">
              Log in
            </Link>
            <Link href="/login" className="px-5 py-2.5 text-base font-medium text-white bg-rausch rounded-[8px] hover:bg-rausch-active transition-colors">
              Sign up
            </Link>
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
              <Link href="/login" onClick={() => setDrawerOpen(false)} className="w-full py-2.5 text-center text-base font-medium text-ink border border-ink rounded-[8px]">
                Log in
              </Link>
              <Link href="/login" onClick={() => setDrawerOpen(false)} className="w-full py-2.5 text-center text-base font-medium text-white bg-rausch rounded-[8px]">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
