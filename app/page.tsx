import Link from "next/link";
import ListingCard from "./components/ListingCard";
import PageLayout from "./components/PageLayout";
import HeroSearch from "./components/HeroSearch";

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
    title: "Zero brokerage",
    sub: "Deal direct with owners",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Rated 4.6★",
    sub: "By 12,000+ users",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    title: "Housing + Jobs",
    sub: "All in one place",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const trendingListings = [
  { id: 1, title: "Green Meadows PG for Men", location: "Koramangala, Bengaluru", metroDistance: "500m from metro", price: "₹8,500/mo", rating: 4.5, reviewCount: 128, badge: "PG", amenities: ["AC", "Meals", "Wi-Fi"], verified: true, noBrokerage: true, image: "/categories/pg.jpg" },
  { id: 2, title: "Sunrise Co-living Space", location: "HSR Layout, Bengaluru", metroDistance: "1.2km from metro", price: "₹12,000/mo", rating: 4.7, reviewCount: 89, badge: "Co-living", amenities: ["AC", "Wi-Fi", "Gym"], verified: true, furnishing: "Furnished", image: "/categories/coliving.jpg" },
  { id: 3, title: "Lakeside 1BHK Rental Flat", location: "Indiranagar, Bengaluru", metroDistance: "300m from metro", price: "₹18,500/mo", rating: 4.3, reviewCount: 56, badge: "Flat", amenities: ["AC", "Parking", "Security"], noBrokerage: true, availableFrom: "Available now", image: "/categories/rent.jpg" },
  { id: 4, title: "StudyNest Girls Hostel", location: "BTM Layout, Bengaluru", metroDistance: "800m from metro", price: "₹6,200/mo", rating: 4.6, reviewCount: 204, badge: "Hostel", amenities: ["Meals", "Wi-Fi", "Laundry"], verified: true, noBrokerage: true, image: "/categories/pg.jpg" },
  { id: 5, title: "Urban Nest 2BHK", location: "Whitefield, Bengaluru", price: "₹22,000/mo", rating: 4.4, reviewCount: 42, badge: "Flat", amenities: ["AC", "Parking", "Power backup"], furnishing: "Semi-furnished", image: "/categories/rent.jpg" },
  { id: 6, title: "Cozy Homestay near MG Road", location: "MG Road, Bengaluru", metroDistance: "200m from metro", price: "₹15,000/mo", rating: 4.8, reviewCount: 31, badge: "Homestay", amenities: ["AC", "Wi-Fi", "Meals"], verified: true, noBrokerage: true, image: "/categories/homestay.jpg" },
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
    title: "Zero broker fee",
    description: "Connect directly with owners — no middlemen, no extra charges",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-rausch" aria-hidden="true">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "AI-powered match",
    description: "Our AI finds the best housing near your workplace or college",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-rausch" aria-hidden="true">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: "Flatmate finder",
    description: "Match with compatible flatmates based on lifestyle and preferences",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-rausch" aria-hidden="true">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
  return (
    <PageLayout>
      {/* Hero Section — tabbed Housing.com-style hero with search */}
      <HeroSearch />

      {/* Trust strip — proof points mirroring our core promise */}
      <section aria-label="Why renters trust FindWay" className="mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline-soft rounded-[14px] overflow-hidden border border-hairline-soft">
          {trustPoints.map((point) => (
            <div key={point.title} className="flex items-start gap-2.5 bg-canvas px-4 py-4">
              <span className="text-rausch shrink-0 mt-0.5">{point.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink leading-tight">{point.title}</p>
                <p className="text-xs text-muted mt-0.5">{point.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Listings */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[22px] md:text-[26px] font-bold tracking-tight text-ink">Trending near you</h2>
          <Link href="/explore" className="text-sm text-ink font-medium underline">
            See all
          </Link>
        </div>

        {/* Horizontal scroll on mobile, 3-col grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide">
          {trendingListings.map((listing) => (
            <div key={listing.id} className="min-w-[260px] md:min-w-0">
              <ListingCard {...listing} />
            </div>
          ))}
        </div>
      </section>

      {/* Jobs hub teaser */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[22px] md:text-[26px] font-bold tracking-tight text-ink">Grow your career</h2>
          <Link href="/jobs" className="text-sm text-ink font-medium underline">Open Jobs</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nextCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="bg-canvas border border-hairline rounded-[14px] p-5 hover:shadow-airbnb transition-shadow group"
            >
              <div className="mb-3">{card.icon}</div>
              <h3 className="text-base font-semibold text-ink mb-1">{card.title}</h3>
              <p className="text-sm text-muted mb-2">{card.subtitle}</p>
              <span className="text-sm text-rausch font-medium group-hover:underline">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Why FindWay */}
      <section className="mb-10">
        <h2 className="text-[22px] md:text-[26px] font-bold tracking-tight text-ink mb-4">Why FindWay?</h2>
        <div className="grid grid-cols-2 gap-4">
          {whyCards.map((card) => (
            <div
              key={card.title}
              className="bg-canvas border border-hairline rounded-[14px] p-5"
            >
              <div className="mb-2">{card.icon}</div>
              <h3 className="text-base font-semibold text-ink mb-1">{card.title}</h3>
              <p className="text-sm text-muted">{card.description}</p>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
