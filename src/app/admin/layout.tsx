"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, useHydrated } from "@/lib/useSession";
import { signOut } from "@/lib/auth";

/**
 * Standalone shell for the admin console. Provides its own top bar (no public
 * navbar/profile) and centralises the admin-only access guard, so every page
 * under /admin is protected and framed consistently.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const hydrated = useHydrated();
  const router = useRouter();
  const isAdmin = !!session && session.roles.includes("admin");

  useEffect(() => {
    if (hydrated && !isAdmin) router.push("/");
  }, [hydrated, isAdmin, router]);

  // While hydrating or for non-admins (about to be redirected), show a bare loader.
  if (!hydrated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-soft">
        <div className="animate-pulse flex space-x-2">
          <div className="w-3 h-3 bg-muted rounded-full" />
          <div className="w-3 h-3 bg-muted rounded-full" />
          <div className="w-3 h-3 bg-muted rounded-full" />
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col">
      {/* Admin top bar */}
      <header className="sticky top-0 z-40 bg-ink text-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex w-8 h-8 rounded-[8px] bg-white/10 items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight">FindWay Admin</p>
              <p className="text-[10px] text-white/50 -mt-0.5">Control Center</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <span className="hidden sm:inline text-xs text-white/70">
              {session.name}
            </span>
            <Link
              href="/"
              className="text-xs font-semibold text-white/80 hover:text-white transition-colors px-2 py-1"
            >
              View site
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-[8px] px-3 py-1.5 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>
    </div>
  );
}
