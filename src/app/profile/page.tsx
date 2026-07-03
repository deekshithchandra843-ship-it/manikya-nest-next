"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import { signOut, switchProfileMode } from "@/lib/demoAuth";
import { useHydrated, useSession } from "@/lib/useSession";
import BusinessDashboard from "@/components/profile/BusinessDashboard";
import AccountBlock from "@/components/profile/AccountBlock";
import ApplicationsBlock from "@/components/profile/ApplicationsBlock";
import CandidateBlock from "@/components/profile/CandidateBlock";
import EditProfileModal from "@/components/profile/EditProfileModal";
import MenuBlock, { type MenuItem } from "@/components/profile/MenuBlock";
import NotificationsBlock from "@/components/profile/NotificationsBlock";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ResumeBlock from "@/components/profile/ResumeBlock";
import StatGrid from "@/components/profile/StatGrid";
import { SectionSkeleton } from "@/components/profile/ui";
import {
  PROPERTY_STATS,
  DEMO_PROPERTY_STAT_VALUES,
  CAREER_STATS,
  DEMO_CAREER_STAT_VALUES,
  DEMO_SAVED_NESTS,
} from "@/components/profile/mockData";
import SavedNestsGrid from "@/components/profile/SavedNestsGrid";

const NEST_MENU: MenuItem[] = [
  {
    label: "Saved listings",
    href: "/explore",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    label: "Scheduled visits",
    href: "/explore",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </svg>
    ),
  },
  {
    label: "Flatmate matches",
    href: "/c/flatmate",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

const NEXT_MENU: MenuItem[] = [
  {
    label: "Saved jobs",
    href: "/jobs",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21z" />
      </svg>
    ),
  },
  {
    label: "My courses",
    href: "/jobs#upskill",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

/**
 * ONE common profile for every member. Everything comes from getSession();
 * demo accounts show mock activity, fresh sign-ups get the designed empty
 * states. While the session is read (client-only) the layout renders
 * skeletons so the later backend swap has no layout shift.
 */
export default function UserProfile() {
  const router = useRouter();
  const session = useSession();
  const hydrated = useHydrated();
  const [editOpen, setEditOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState<"property" | "career">("property");

  // Visitors who arrive without a session go to /login. Users who HAD a
  // session (i.e. just logged out) are routed by the logout handler instead,
  // so the two navigations never race.
  const hadSession = useRef(false);
  useEffect(() => {
    if (session) {
      hadSession.current = true;
      return;
    }
    if (hydrated && !hadSession.current) router.replace("/login");
  }, [session, hydrated, router]);

  // Single mutation point — the later swap to a server action lands here.
  const handleLogout = () => {
    signOut();
    router.push("/");
  };

  if (!session) {
    return (
      <PageLayout>
        <div className="pt-8 pb-6" aria-busy="true" aria-label="Loading profile">
          <div className="flex items-center gap-4 mb-6">
            <div className="skeleton w-16 h-16 md:w-20 md:h-20 rounded-full shrink-0" />
            <div className="space-y-2">
              <div className="skeleton h-5 w-40 rounded-full" />
              <div className="skeleton h-3.5 w-24 rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-[88px] rounded-[14px]" />
            ))}
          </div>
          <SectionSkeleton />
          <SectionSkeleton rows={2} />
        </div>
      </PageLayout>
    );
  }


  // Demo accounts carry a stable "demo-…" id and show sample activity;
  // sign-ups get a UUID, start fresh and see real empty states.
  const isDemo = session.id.startsWith("demo-");

  const activeStatsDef = activeSegment === "property" ? PROPERTY_STATS : CAREER_STATS;
  const activeStatValues = activeSegment === "property" ? DEMO_PROPERTY_STAT_VALUES : DEMO_CAREER_STAT_VALUES;

  const stats = activeStatsDef.map((s, i) => ({
    ...s,
    value: isDemo ? activeStatValues[i] : 0,
    sub: isDemo ? s.sub : "—",
  }));

  const handleSwitchMode = (mode: "personal" | "business") => {
    switchProfileMode(mode);
  };

  return (
    <PageLayout>
      <ProfileHeader
        session={session}
        verified={isDemo}
        onEdit={() => setEditOpen(true)}
        onSwitchMode={handleSwitchMode}
      />

      <div className="max-w-[720px] mx-auto">
        {session.activeView === "business" ? (
          <BusinessDashboard session={session} />
        ) : (
          <>
            {/* Promo banner for Business Profile */}
            <div className="mb-6 p-5 rounded-[16px] border border-hairline bg-gradient-to-r from-rausch/10 via-violet/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-3d-soft">
              <div className="space-y-1">
                <h3 className="font-bold text-ink text-sm sm:text-base flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rausch animate-pulse" />
                  List property & find tenants?
                </h3>
                <p className="text-xs sm:text-sm text-muted max-w-[480px]">
                  Switch to your Business Profile to list spaces, access matching leads, and view performance insights.
                </p>
              </div>
              <button
                onClick={() => handleSwitchMode("business")}
                className="shrink-0 text-xs font-semibold text-white bg-ink rounded-full px-4 py-2 hover:opacity-90 transition-all shadow-airbnb"
              >
                Switch to Business
              </button>
            </div>

            {/* Hub Workspace Selector Segment Controls */}
            <div className="flex border-b border-hairline mb-6 gap-6 justify-center sm:justify-start">
              <button
                onClick={() => setActiveSegment("property")}
                className={`pb-3 text-sm font-semibold capitalize transition-all relative flex items-center gap-2 ${activeSegment === "property" ? "text-ink font-bold" : "text-muted hover:text-ink"
                  }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <span>My Property Hub</span>
                {activeSegment === "property" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-rausch rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveSegment("career")}
                className={`pb-3 text-sm font-semibold capitalize transition-all relative flex items-center gap-2 ${activeSegment === "career" ? "text-ink font-bold" : "text-muted hover:text-ink"
                  }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
                  <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>My Jobs & Career</span>
                {activeSegment === "career" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-rausch rounded-full" />
                )}
              </button>
            </div>

            {/* Conditional Workspace Renders */}
            {activeSegment === "property" ? (
              <div className="space-y-6">
                <StatGrid stats={stats} />
                <SavedNestsGrid nests={isDemo ? DEMO_SAVED_NESTS : []} />
                <MenuBlock title="My Nest" items={NEST_MENU} />
                <NotificationsBlock />
                <AccountBlock />
              </div>
            ) : (
              <div className="space-y-6">
                <StatGrid stats={stats} />
                <ResumeBlock initialUploaded={isDemo} />
                <CandidateBlock hasData={isDemo} />
                <ApplicationsBlock hasData={isDemo} />
                <MenuBlock title="My Next" items={NEXT_MENU} />
                <NotificationsBlock />
                <AccountBlock />
              </div>
            )}
          </>
        )}

        <button
          onClick={handleLogout}
          className="w-full py-2.5 mt-6 mb-8 text-sm font-medium text-error border border-error/40 rounded-[8px] hover:bg-error/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2"
        >
          Log out
        </button>
      </div>

      {editOpen && <EditProfileModal session={session} onClose={() => setEditOpen(false)} />}
    </PageLayout>
  );
}
