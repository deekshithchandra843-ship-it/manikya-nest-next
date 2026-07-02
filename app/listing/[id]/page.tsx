"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageLayout from "../../components/PageLayout";
import ListingGallery from "../../components/ListingGallery";
import { LISTINGS, getCategory, Listing } from "../../lib/categories";

const amenityIcons: Record<string, string> = {
  "Wi-Fi": "📶",
  AC: "❄️",
  Meals: "🍽️",
  Laundry: "👕",
  Security: "🔒",
  Parking: "🅿️",
  "Power backup": "⚡",
  "Hot water": "🚿",
  Gym: "🏋️",
  Pool: "🏊",
  Clubhouse: "🏠",
  "Meeting rooms": "📊",
  Cafeteria: "☕",
  "24/7 access": "🕐",
  "Loading dock": "🚛",
  "High ceiling": "📏",
  "Highway access": "🛣️",
  "Main road": "🛣️",
  Washroom: "🚻",
  Lift: "🛗",
  "Bank tenant": "🏦",
  "Long lease": "📜",
  "High yield": "📈",
  "Corner plot": "📐",
  Gated: "🚧",
};

const nearbyPlaces = [
  { name: "Metro Station", type: "Transit", dist: "800 m", icon: "🚇" },
  { name: "Forum Mall", type: "Shopping", dist: "1.2 km", icon: "🛍️" },
  { name: "City Hospital", type: "Healthcare", dist: "2.1 km", icon: "🏥" },
  { name: "Cubbon Park", type: "Park", dist: "3.5 km", icon: "🌳" },
];

const areaInsights = [
  { label: "Safety", score: "Very safe", level: 90, icon: "🛡️" },
  { label: "Transport", score: "Excellent", level: 85, icon: "🚌" },
  { label: "Schools", score: "Good", level: 70, icon: "🏫" },
];

const reviews = [
  { name: "Priya M.", date: "May 2026", rating: 5, text: "Clean, well-maintained and the owner is very responsive. Metro is a short walk away." },
  { name: "Sandeep R.", date: "Apr 2026", rating: 4, text: "Great location for techies. Good value overall for the price and amenities on offer." },
];

function StarIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

/** Build an intent-aware key-facts list from the listing + its category. */
function buildFacts(listing: Listing): { label: string; value: string }[] {
  const facts: { label: string; value: string }[] = [{ label: "Price", value: listing.price }];
  const slug = listing.category;
  const world = getCategory(slug)?.world;

  if (listing.area) facts.push({ label: world === "commercial" ? "Area" : "Carpet area", value: listing.area });

  if (listing.spec) {
    const specLabel =
      slug === "pg" ? "Sharing"
        : slug === "coliving" ? "Room"
        : slug === "flatmate" ? "Looking for"
        : slug === "buy" ? "Type"
        : world === "commercial" ? "Configuration"
        : "Details";
    facts.push({ label: specLabel, value: listing.spec });
  }

  if (listing.furnishing) facts.push({ label: "Furnishing", value: listing.furnishing });
  if (listing.availableFrom) facts.push({ label: slug === "buy" ? "Possession" : "Availability", value: listing.availableFrom });

  return facts;
}

function ContactCard({
  listing,
  saved,
  onToggleSave,
}: {
  listing: Listing;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const isCommercial = getCategory(listing.category)?.world === "commercial";
  const ownerLabel = isCommercial ? "Verified agent" : "Verified owner";
  return (
    <div className="bg-canvas border border-hairline rounded-[14px] p-5 shadow-airbnb">
      {/* Price + rating */}
      <div className="flex items-baseline justify-between mb-4">
        <p className="text-2xl font-bold text-ink">{listing.price}</p>
        <div className="flex items-center gap-1 text-sm text-ink">
          <span className="text-ink"><StarIcon size={13} /></span>
          <span className="font-semibold">{listing.rating}</span>
          <span className="text-muted">· {listing.reviewCount}</span>
        </div>
      </div>

      {/* Owner */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-hairline-soft">
        <div className="w-10 h-10 rounded-full bg-rausch/10 flex items-center justify-center text-sm font-semibold text-rausch shrink-0">
          RK
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-ink truncate">Rajesh Kumar</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-rausch shrink-0" aria-hidden="true">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[11px] text-muted">{ownerLabel} · Responds in ~1 hr</p>
        </div>
      </div>

      {/* Primary action */}
      <button
        type="button"
        className="w-full py-2.5 text-sm font-semibold text-white bg-rausch rounded-[8px] hover:bg-rausch-active active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2"
      >
        {isCommercial ? "Contact agent" : "Contact owner"}
      </button>

      {/* Secondary actions */}
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          className="flex-1 py-2 text-sm font-medium text-ink border border-hairline rounded-[8px] hover:bg-surface-soft active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          Schedule visit
        </button>
        <button
          type="button"
          className="flex-1 py-2 text-sm font-medium text-ink border border-hairline rounded-[8px] hover:bg-surface-soft active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          Call
        </button>
      </div>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi, I'm interested in ${listing.title}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-white bg-[#25D366] rounded-[8px] hover:brightness-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-.609zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
        WhatsApp
      </a>

      {/* Secondary utility row */}
      <div className="flex items-center justify-between mt-3 text-[12px]">
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          className="inline-flex items-center gap-1.5 text-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm px-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={saved ? "text-rausch" : ""} aria-hidden="true">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {saved ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-muted hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error rounded-sm px-1"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 21v-4m0 0V5a2 2 0 012-2h6l1 2h7l-3 5 3 5h-8l-1-2H5a2 2 0 00-2 2z" />
          </svg>
          Report
        </button>
      </div>
    </div>
  );
}

export default function ListingDetail() {
  const params = useParams();
  const id = Number(params.id);
  const listing = LISTINGS.find((l) => l.id === id) ?? LISTINGS[0];
  const category = getCategory(listing.category);
  const facts = buildFacts(listing);
  const [saved, setSaved] = useState(false);

  const galleryImages = useMemo(() => {
    if (!category) return [];
    const world = category.world;
    const pool =
      world === "residential"
        ? [
            "/categories/rent.jpg",
            "/categories/buy.jpg",
            "/categories/pg.jpg",
            "/categories/coliving.jpg",
            "/categories/flatmate.jpg",
          ]
        : world === "commercial"
        ? [
            "/categories/commercial-office.jpg",
            "/categories/commercial-shop.jpg",
            "/categories/coworking.jpg",
            "/categories/warehouse.jpg",
            "/categories/lease.jpg",
          ]
        : [
            "/categories/homestay.jpg",
            "/categories/resort.jpg",
            "/categories/service-apartment.jpg",
            "/categories/hotel.jpg",
            "/categories/rent.jpg",
          ];
    const unique = [category.image, ...pool.filter((img) => img !== category.image)];
    return unique.slice(0, 5);
  }, [category]);

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Explore", href: "/explore" },
        ...(category ? [{ label: category.label, href: `/c/${category.slug}` }] : []),
        { label: listing.title },
      ]}
    >
      {/* Photo Gallery */}
      <ListingGallery
        images={galleryImages}
        alt={`${listing.title} — ${category?.label ?? ""} in ${listing.location}`}
        saved={saved}
        onToggleSave={() => setSaved(!saved)}
      />

      {/* Two-column: content + sticky contact card */}
      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:items-start">
        {/* Main content */}
        <div>
          {/* Header */}
          <section className="mb-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h1 className="text-2xl font-bold text-ink tracking-tight">{listing.title}</h1>
                <p className="text-sm text-muted mt-0.5">{listing.location}</p>
              </div>
              <span className="text-2xl font-bold text-ink shrink-0 lg:hidden">{listing.price}</span>
            </div>

            {/* Badge row */}
            <div className="flex flex-wrap items-center gap-2">
              {listing.verified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rausch bg-rausch/10 px-2 py-0.5 rounded-full">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified
                </span>
              )}
              {listing.noBrokerage && (
                <span className="text-[11px] font-medium text-ink bg-surface-soft px-2 py-0.5 rounded-full">No brokerage</span>
              )}
              <span className="text-[11px] font-medium text-muted bg-surface-soft px-2 py-0.5 rounded-full">
                {category?.label ?? listing.badge}
                {listing.spec && ` · ${listing.spec}`}
              </span>
              <div className="flex items-center gap-0.5 text-xs text-ink">
                <span className="text-ink"><StarIcon size={12} /></span>
                <span className="font-semibold">{listing.rating}</span>
                <span className="text-muted">({listing.reviewCount} reviews)</span>
              </div>
            </div>
          </section>

          {/* Key facts — intent-aware row reflecting the category */}
          <section className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline-soft rounded-[14px] overflow-hidden border border-hairline-soft">
              {facts.map((f) => (
                <div key={f.label} className="bg-canvas px-4 py-3">
                  <p className="text-[11px] text-muted">{f.label}</p>
                  <p className="text-sm font-semibold text-ink mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Amenities — from this listing */}
          <section className="mb-6 pb-6 border-b border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-3">Amenities</h2>
            <div className="grid grid-cols-2 gap-2">
              {listing.amenities.map((a) => (
                <div key={a} className="flex items-center gap-2 text-sm text-body py-1.5">
                  <span className="text-base">{amenityIcons[a] ?? "✅"}</span>
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </section>

          {/* AI Nest Insight Card — the housing × jobs differentiator */}
          <section className="mb-6">
            <div className="bg-rausch/5 border border-rausch/40 rounded-[14px] p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rausch" aria-hidden="true">
                  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z" />
                </svg>
                <span className="text-sm font-semibold text-rausch">AI nest insight</span>
              </div>
              <p className="text-sm text-body leading-relaxed mb-2">
                This {category?.label.toLowerCase() ?? "place"} is 12 min from 3 companies hiring for your profile.
                {listing.metroDistance ? ` ${listing.metroDistance}.` : ""} Plan your commute and explore roles nearby.
              </p>
              <Link href="/jobs" className="text-sm text-rausch font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch rounded-sm">
                View matches →
              </Link>
            </div>
          </section>

          {/* Area Insights */}
          <section className="mb-6">
            <h2 className="text-lg font-bold text-ink mb-3">Area insights</h2>
            <div className="grid grid-cols-3 gap-2">
              {areaInsights.map((a) => (
                <div key={a.label} className="bg-surface-soft rounded-[14px] p-3 text-center">
                  <div className="text-xl mb-1">{a.icon}</div>
                  <p className="text-xs font-medium text-ink">{a.label}</p>
                  <p className="text-[11px] text-muted mb-1.5">{a.score}</p>
                  <div className="h-1.5 bg-surface-strong rounded-full overflow-hidden">
                    <div className="h-full bg-rausch rounded-full" style={{ width: `${a.level}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Nearby Places */}
          <section className="mb-6">
            <h2 className="text-lg font-bold text-ink mb-3">What&apos;s nearby</h2>
            <div className="bg-canvas border border-hairline rounded-[14px] divide-y divide-hairline-soft">
              {nearbyPlaces.map((p) => (
                <div key={p.name} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-base">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{p.name}</p>
                    <p className="text-[11px] text-muted">{p.type}</p>
                  </div>
                  <span className="text-xs text-muted shrink-0">{p.dist}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews & Ratings */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-ink">Reviews</h2>
              <div className="flex items-center gap-1 text-sm text-ink">
                <span className="text-ink"><StarIcon size={14} /></span>
                <span className="font-semibold">{listing.rating}</span>
                <span className="text-muted">· {listing.reviewCount} reviews</span>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {reviews.map((r) => (
                <div key={r.name} className="bg-canvas border border-hairline rounded-[14px] p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-8 h-8 rounded-full bg-surface-strong flex items-center justify-center text-[11px] font-semibold text-muted">
                      {r.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink leading-tight">{r.name}</p>
                      <p className="text-[11px] text-muted">{r.date}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5 text-ink">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <StarIcon key={i} size={11} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[13px] text-body leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="text-sm text-ink font-medium underline underline-offset-2 mt-3 hover:text-rausch transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm"
            >
              Show all {listing.reviewCount} reviews
            </button>
          </section>

          {/* Contact card — inline below lg breakpoint */}
          <section className="mb-24 lg:hidden">
            <ContactCard listing={listing} saved={saved} onToggleSave={() => setSaved(!saved)} />
          </section>
        </div>

        {/* Sticky contact card — desktop */}
        <aside className="hidden lg:block">
          <div className="lg:sticky lg:top-24">
            <ContactCard listing={listing} saved={saved} onToggleSave={() => setSaved(!saved)} />
          </div>
        </aside>
      </div>

      {/* Sticky CTA bar (mobile) */}
      <div className="fixed bottom-14 left-0 right-0 bg-canvas border-t border-hairline px-4 py-3 flex items-center justify-between gap-3 z-40 md:hidden">
        <div>
          <p className="text-lg font-bold text-ink leading-tight">{listing.price}</p>
          <p className="text-[11px] text-muted">{listing.noBrokerage ? "Zero brokerage" : category?.label ?? "Listing"}</p>
        </div>
        <button
          type="button"
          className="px-6 py-2.5 text-sm font-semibold text-white bg-rausch rounded-[8px] hover:bg-rausch-active active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2"
        >
          {getCategory(listing.category)?.world === "commercial" ? "Contact agent" : "Contact owner"}
        </button>
      </div>
    </PageLayout>
  );
}
