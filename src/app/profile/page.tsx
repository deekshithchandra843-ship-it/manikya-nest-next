"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import { signOut, switchProfileMode, enableRole, type Role } from "@/lib/auth";
import { useHydrated, useSession } from "@/lib/useSession";
import BusinessDashboard from "@/components/profile/BusinessDashboard";
import AccountBlock from "@/components/profile/AccountBlock";
import ApplicationsBlock from "@/components/profile/ApplicationsBlock";
import CandidateBlock from "@/components/profile/CandidateBlock";
import EditProfileModal from "@/components/profile/EditProfileModal";
import ShareProfileModal from "@/components/profile/ShareProfileModal";
import MenuBlock, { type MenuItem } from "@/components/profile/MenuBlock";
import NotificationsBlock from "@/components/profile/NotificationsBlock";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ResumeBlock from "@/components/profile/ResumeBlock";
import StatGrid from "@/components/profile/StatGrid";
import CompletionMeter from "@/components/profile/CompletionMeter";
import VerificationCard from "@/components/profile/VerificationCard";
import ActivityTimeline, { type ActivityItem } from "@/components/profile/ActivityTimeline";
import SavedSearchesCard from "@/components/profile/SavedSearchesCard";
import { SectionSkeleton } from "@/components/profile/ui";
import { profileTheme } from "@/components/profile/theme";
import { PROPERTY_STATS, CAREER_STATS, type SavedNest } from "@/components/profile/profileData";
import { apiClient } from "@/lib/apiClient";
import SavedNestsGrid from "@/components/profile/SavedNestsGrid";
import RequirementsBlock from "@/components/profile/RequirementsBlock";
import RecommendationsBlock from "@/components/profile/RecommendationsBlock";

const NEST_MENU: MenuItem[] = [
  { label: "Saved listings", href: "/explore", icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>) },
  { label: "Scheduled visits", href: "/explore", icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></svg>) },
];

const NEXT_MENU: MenuItem[] = [
  { label: "Saved jobs", href: "/jobs", icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21z" /></svg>) },
  { label: "My courses", href: "/jobs#upskill", icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>) },
];

export default function UserProfile() {
  const router = useRouter();
  const session = useSession();
  const hydrated = useHydrated();
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState<"property" | "career">("property");
  const [savedNests, setSavedNests] = useState<SavedNest[]>([]);
  const [visitCount, setVisitCount] = useState(0);

  const sessionId = session?.id;
  useEffect(() => {
    if (!sessionId) return;
    apiClient.get("/wishlist").then((res) => {
      if (res.data?.success) {
        setSavedNests(res.data.data.map((l: { id: string; title: string; location: string; price: string; image: string; badge: string; rating: number }) => ({ id: l.id, title: l.title, location: l.location, price: l.price, image: l.image, badge: l.badge, rating: l.rating })));
      }
    }).catch(() => {});
    apiClient.get("/visits/mine").then((res) => {
      if (res.data?.success) {
        setVisitCount(res.data.data.filter((v: { status: string }) => v.status !== "cancelled").length);
      }
    }).catch(() => {});
  }, [sessionId]);

  const hadSession = useRef(false);
  useEffect(() => {
    if (session) { hadSession.current = true; return; }
    if (hydrated && !hadSession.current) router.replace("/login");
  }, [session, hydrated, router]);

  const isAdmin = session?.roles?.includes("admin");
  useEffect(() => {
    if (hydrated && session && isAdmin) {
      router.replace("/admin");
    }
  }, [session, hydrated, isAdmin, router]);

  const handleLogout = () => { signOut(); router.push("/"); };

  if (!session) {
    return (
      <PageLayout>
        <div className="pt-8 pb-6" aria-busy="true" aria-label="Loading profile">
          <div className="flex items-center gap-4 mb-6">
            <div className="skeleton w-16 h-16 md:w-20 md:h-20 rounded-full shrink-0" />
            <div className="space-y-2"><div className="skeleton h-5 w-40 rounded-full" /><div className="skeleton h-3.5 w-24 rounded-full" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">{[0, 1, 2].map((i) => (<div key={i} className="skeleton h-[88px] rounded-[14px]" />))}</div>
          <SectionSkeleton />
          <SectionSkeleton rows={2} />
        </div>
      </PageLayout>
    );
  }

  const verified = false;
  const hasBusinessRole = session.roles?.includes("owner") || session.roles?.includes("agent") || session.roles?.includes("builder");
  const isBusiness = session.activeView === "business";
  const theme = profileTheme(session.activeView);

  const activeStatsDef = activeSegment === "property" ? PROPERTY_STATS : CAREER_STATS;
  const statValues: Record<string, number> = { "Saved nests": savedNests.length, "Visits scheduled": visitCount };
  const stats = activeStatsDef.map((s) => ({ ...s, value: statValues[s.label] ?? 0 }));

  // Build the activity feed from data already fetched.
  const activity: ActivityItem[] = [
    ...savedNests.slice(0, 3).map((n) => ({ id: `saved-${n.id}`, kind: "saved" as const, text: `Saved “${n.title}” in ${n.location}`, time: "Recently" })),
    ...(visitCount > 0 ? [{ id: "visits", kind: "visit" as const, text: `You have ${visitCount} scheduled visit${visitCount > 1 ? "s" : ""}`, time: "Upcoming" }] : []),
  ];

  const handleSwitch = (mode: "personal" | "business") => switchProfileMode(mode);
  const handleActivate = (role: Role) => { enableRole(role); switchProfileMode("business"); };

  return (
    <PageLayout>
      <ProfileHeader
        session={session}
        verified={verified}
        hasBusinessRole={hasBusinessRole}
        onEdit={() => setEditOpen(true)}
        onShare={() => setShareOpen(true)}
        onSwitch={handleSwitch}
        onActivate={handleActivate}
      />

      <div className="max-w-[1080px] mx-auto">
        {/* Top band: stats + completion */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 mb-6">
          <StatGrid stats={stats} accentText={theme.accentText} />
          <div className="lg:w-[380px]"><CompletionMeter session={session} verified={verified} onEdit={() => setEditOpen(true)} /></div>
        </div>

        {isBusiness ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            <div className="min-w-0"><BusinessDashboard session={session} /></div>
            <aside className="space-y-2">
              <VerificationCard session={session} verified={verified} />
              <SavedSearchesCard variant="business" />
              <NotificationsBlock />
              <AccountBlock />
            </aside>
          </div>
        ) : (
          <>
            {/* Segment selector */}
            <div className="flex border-b border-hairline mb-6 gap-6">
              <button onClick={() => setActiveSegment("property")} className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 ${activeSegment === "property" ? "text-ink font-bold" : "text-muted hover:text-ink"}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                <span>My Property Hub</span>
                {activeSegment === "property" && <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-rausch rounded-full" />}
              </button>
              <button onClick={() => setActiveSegment("career")} className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 ${activeSegment === "career" ? "text-ink font-bold" : "text-muted hover:text-ink"}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span>My Jobs &amp; Career</span>
                {activeSegment === "career" && <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-rausch rounded-full" />}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
              <div className="min-w-0 space-y-6">
                {activeSegment === "property" ? (
                  <>
                    <SavedNestsGrid nests={savedNests} />
                    <RecommendationsBlock segment="property" userCity={session.city || "Bengaluru"} />
                    <RequirementsBlock userName={session.name} seekerId={session.id} />
                    <ActivityTimeline items={activity} />
                    <MenuBlock title="My Nest" items={NEST_MENU} />
                  </>
                ) : (
                  <>
                    <RecommendationsBlock segment="career" userCity={session.city || "Bengaluru"} />
                    <ResumeBlock initialUploaded={false} />
                    <CandidateBlock />
                    <ApplicationsBlock />
                    <MenuBlock title="My Next" items={NEXT_MENU} />
                  </>
                )}
              </div>
              <aside className="space-y-2">
                <VerificationCard session={session} verified={verified} />
                <SavedSearchesCard variant="personal" />
                <NotificationsBlock />
                <AccountBlock />
              </aside>
            </div>
          </>
        )}

        <button onClick={handleLogout} className="w-full py-2.5 mt-8 mb-8 text-sm font-medium text-error border border-error/40 rounded-[8px] hover:bg-error/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2">
          Log out
        </button>
      </div>

      {editOpen && <EditProfileModal session={session} onClose={() => setEditOpen(false)} />}
      {shareOpen && <ShareProfileModal session={session} onClose={() => setShareOpen(false)} />}
    </PageLayout>
  );
}
