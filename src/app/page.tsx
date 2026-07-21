"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import PageLayout from "@/components/PageLayout";
import HeroSearch from "@/components/HeroSearch";
import HowFindWayWorks from "@/components/HowFindWayWorks";
import ReviewsSection from "@/components/ReviewsSection";
import { apiClient } from "@/lib/apiClient";

const trustPoints = [
  {
    title: "Verified listings",
    sub: "Checked by our team",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Direct deals",
    sub: "Deal direct with owners",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Job-nest mapping",
    sub: "See jobs near your home",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Commute helper",
    sub: "Built-in travel times",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];


const whyCards = [
  {
    title: "Verified listings",
    description: "Every property is verified by our team before going live",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-rausch" aria-hidden="true">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Commute match",
    description: "Our AI finds the best housing near your workplace or college",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-rausch" aria-hidden="true">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: "Community groups",
    description: "Connect with flatmates, find local events, and build your circle",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-rausch" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87m-4-5.63a4 4 0 110 8" />
      </svg>
    ),
  },
];

const nextCards = [
  {
    title: "Jobs",
    subtitle: "Find roles near your nest with top companies",
    href: "/jobs#roles",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-rausch" aria-hidden="true">
        <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Upskill",
    subtitle: "Free and paid courses to grow your career",
    href: "/jobs#upskill",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-rausch" aria-hidden="true">
        <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");

  useEffect(() => {
    apiClient.get("/listings")
      .then((res) => {
        if (res.data && res.data.success) {
          setListings(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch trending listings:", err);
      });
  }, []);

  const filteredListings = listings.filter((l) => {
    if (selectedTab === "all") return true;
    const badgeLower = l.badge?.toLowerCase() || "";
    const catLower = l.category?.toLowerCase() || "";
    if (selectedTab === "flat") {
      return badgeLower.includes("flat") || badgeLower.includes("rent") || catLower.includes("rent") || catLower.includes("flat");
    }
    if (selectedTab === "pg") {
      return badgeLower.includes("pg") || badgeLower.includes("hostel") || catLower.includes("pg") || catLower.includes("hostel");
    }
    if (selectedTab === "coliving") {
      return badgeLower.includes("co-living") || badgeLower.includes("coliving") || catLower.includes("coliving") || catLower.includes("co-living");
    }
    return true;
  });

  const displayedListings = filteredListings.slice(0, 9);

  return (
    <>
      {/* Hero Section — tabbed Housing.com-style hero with search */}
      <HeroSearch />

      <PageLayout className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 pb-0">

      {/* Trust strip — proof points mirroring our core promise */}
      <section aria-label="Why renters trust FindWay" className="mt-10 md:mt-16 mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline-soft rounded-[14px] overflow-hidden border border-hairline-soft">
          {trustPoints.map((point) => (
            <div key={point.title} className="flex items-start gap-2.5 bg-canvas px-4 py-4 hover:bg-surface-soft hover:scale-[1.01] transition-all duration-300 group cursor-default">
              <span className="text-rausch shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300">{point.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink leading-tight group-hover:text-rausch transition-colors duration-300">{point.title}</p>
                <p className="text-xs text-muted mt-0.5">{point.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Listings */}
      <section className="mb-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[22px] md:text-[28px] font-extrabold tracking-tight text-ink">Trending Properties</h2>
            <p className="text-sm text-muted mt-1">Explore our most popular and verified nests near you</p>
          </div>
          
          {/* Category Tabs */}
          <div className="flex gap-1.5 bg-neutral-100 p-1 rounded-full self-start md:self-auto overflow-x-auto max-w-full scrollbar-hide border border-neutral-200/50">
            {[
              { id: "all", label: "All Nests" },
              { id: "flat", label: "Flats" },
              { id: "pg", label: "PG & Hostels" },
              { id: "coliving", label: "Co-living" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap active:scale-95 ${
                  selectedTab === tab.id
                    ? "bg-white text-rausch shadow-sm border border-neutral-200/20"
                    : "text-neutral-500 hover:text-neutral-850"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Equal-Height Grid or Empty State */}
        {displayedListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-canvas border border-hairline border-dashed rounded-[20px] text-center px-4">
            <p className="text-sm font-semibold text-ink">No trending properties found</p>
            <p className="text-xs text-muted mt-1 max-w-xs">Be the first to list a property in this category.</p>
            <Link href="/post" className="mt-4 bg-rausch hover:bg-rausch/90 text-white font-semibold text-xs px-6 py-2.5 rounded-full shadow-sm transition-all">
              Post a Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {displayedListings.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        )}
      </section>
    </PageLayout>

    {/* Rummy Deck Reviews Section */}
    <ReviewsSection />

    <PageLayout>
      <HowFindWayWorks />

      {/* Jobs hub teaser */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[22px] md:text-[28px] font-extrabold tracking-tight text-ink">Grow your career</h2>
            <p className="text-sm text-muted mt-1">Discover opportunities and level up your skills</p>
          </div>
          <Link href="/jobs" className="text-sm font-semibold text-rausch hover:underline flex items-center gap-1 transition-all">
            Open Jobs <span className="text-xs">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nextCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="relative bg-canvas border-2 border-hairline rounded-[18px] p-6 hover:-translate-y-1.5 hover:shadow-airbnb hover:border-rausch transition-all duration-300 ease-out group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-muted/10 text-muted rounded-[12px] group-hover:bg-rausch/10 group-hover:text-rausch transition-all duration-300">
                    {card.icon}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted group-hover:text-rausch transition-colors">
                    {card.title === "Jobs" ? "New Openings" : "Learn"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-ink mb-1.5 group-hover:text-rausch transition-colors duration-300">
                  {card.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  {card.subtitle}
                </p>
              </div>
              <div className="pt-2 border-t border-hairline group-hover:border-rausch/20 transition-colors duration-300">
                <span className="text-xs font-semibold text-rausch flex items-center gap-1">
                  Explore {card.title} <span className="inline-block group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why FindWay */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-[22px] md:text-[28px] font-extrabold tracking-tight text-ink">Why FindWay?</h2>
          <p className="text-sm text-muted mt-1">What makes us the best platform for your journey</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyCards.map((card) => (
            <div
              key={card.title}
              className="bg-canvas border-2 border-hairline rounded-[18px] p-6 hover:-translate-y-1.5 hover:shadow-airbnb hover:border-rausch/30 transition-all duration-300 group"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-muted/10 text-rausch rounded-[12px] mb-4 group-hover:bg-rausch group-hover:text-white transition-all duration-300">
                {card.icon}
              </div>
              <h3 className="text-base font-bold text-ink mb-1.5 group-hover:text-rausch transition-colors duration-300">{card.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
    </>
  );
}
