"use client";
import { useState } from "react";
import Link from "next/link";
import PageLayout from "../../components/PageLayout";

const amenities = [
  { label: "Wi-Fi", icon: "📶" },
  { label: "AC", icon: "❄️" },
  { label: "Meals", icon: "🍽️" },
  { label: "Laundry", icon: "👕" },
  { label: "Security", icon: "🔒" },
  { label: "Parking", icon: "🅿️" },
  { label: "Power backup", icon: "⚡" },
  { label: "Hot water", icon: "🚿" },
];

const nearbyPlaces = [
  { name: "Koramangala Metro", type: "Transit", dist: "800 m", icon: "🚇" },
  { name: "Forum Mall", type: "Shopping", dist: "1.2 km", icon: "🛍️" },
  { name: "St. John's Hospital", type: "Healthcare", dist: "2.1 km", icon: "🏥" },
  { name: "Cubbon Park", type: "Park", dist: "3.5 km", icon: "🌳" },
];

const areaInsights = [
  { label: "Safety", score: "Very safe", level: 90, icon: "🛡️" },
  { label: "Transport", score: "Excellent", level: 85, icon: "🚌" },
  { label: "Schools", score: "Good", level: 70, icon: "🏫" },
];

const reviews = [
  { name: "Priya M.", date: "May 2026", rating: 5, text: "Clean rooms, tasty home-style meals and the owner is very responsive. Metro is a short walk away." },
  { name: "Sandeep R.", date: "Apr 2026", rating: 4, text: "Great location for techies. Wi-Fi could be faster but overall good value for the price." },
];

export default function ListingDetail() {
  const [saved, setSaved] = useState(false);

  return (
    <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Find Nest", href: "/find-nest" }, { label: "Green Meadows PG" }]}>
      {/* Photo Gallery */}
      <section className="mb-4">
        <div className="h-[280px] bg-[#f7f7f7] rounded-xl flex items-center justify-center mb-2 relative">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1">
            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-10h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" />
          </svg>
          <button
            onClick={() => setSaved(!saved)}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/90"
            aria-label="Save listing"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "#ff385c" : "none"} stroke={saved ? "#ff385c" : "#6B7280"} strokeWidth="2">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[50px] md:h-[60px] bg-[#f7f7f7] rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BFBFBF" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          ))}
        </div>
      </section>

      {/* Detail Body */}
      <section className="mb-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-lg font-medium text-gray-900">Green Meadows PG for Men</h1>
            <p className="text-xs text-gray-500">Koramangala 4th Block, Bengaluru</p>
          </div>
          <span className="text-xl font-semibold text-[#ff385c]">₹8,500<span className="text-xs font-normal text-gray-400">/mo</span></span>
        </div>

        {/* Badge row */}
        <div className="flex items-center gap-2 mb-3 mt-2">
          <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">PG</span>
          <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">Triple sharing</span>
          <div className="flex items-center gap-0.5 text-xs text-gray-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#222222" stroke="#222222" strokeWidth="1">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="font-medium">4.5</span>
            <span className="text-gray-400">(128 reviews)</span>
          </div>
        </div>

        <hr className="border-gray-200 mb-3" style={{ borderTopWidth: "0.5px" }} />

        {/* Amenities grid */}
        <h2 className="text-sm font-medium text-gray-900 mb-2">Amenities</h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {amenities.map((a) => (
            <div key={a.label} className="flex items-center gap-2 text-xs text-gray-600 py-1.5">
              <span className="text-base">{a.icon}</span>
              <span>{a.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* AI Nest Insight Card */}
      <section className="mb-4">
        <div className="bg-[#ff385c]/5 border border-[#ff385c]/40 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff385c" strokeWidth="2">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z" />
            </svg>
            <span className="text-sm font-medium text-[#ff385c]">AI nest insight</span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed mb-2">
            This PG is 12 min from 3 companies hiring for your profile. Metro station is 800m away. 4 flatmate matches found in your network.
          </p>
          <Link href="#" className="text-xs text-[#ff385c] font-medium hover:underline">
            View matches →
          </Link>
        </div>
      </section>

      {/* Area Insights */}
      <section className="mb-4">
        <h2 className="text-sm font-medium text-gray-900 mb-2">Area insights</h2>
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
      <section className="mb-4">
        <h2 className="text-sm font-medium text-gray-900 mb-2">What&apos;s nearby</h2>
        <div className="bg-white border border-hairline rounded-[14px] divide-y divide-hairline">
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
      <section className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-gray-900">Reviews</h2>
          <div className="flex items-center gap-1 text-sm text-ink">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#222222" stroke="#222222" strokeWidth="1">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="font-semibold">4.5</span>
            <span className="text-muted">· 128 reviews</span>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {reviews.map((r) => (
            <div key={r.name} className="bg-white border border-hairline rounded-[14px] p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-full bg-surface-strong flex items-center justify-center text-[11px] font-semibold text-muted">
                  {r.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink leading-tight">{r.name}</p>
                  <p className="text-[11px] text-muted">{r.date}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#222222" stroke="#222222" strokeWidth="1">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-[13px] text-body leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
        <button className="text-xs text-ink font-medium underline mt-3">Show all 128 reviews</button>
      </section>

      {/* Owner Contact */}
      <section className="mb-24 md:mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4" style={{ borderWidth: "0.5px" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#ff385c]/10 flex items-center justify-center text-sm font-semibold text-[#ff385c]">
              RK
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-900">Rajesh Kumar</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff385c" stroke="#ff385c" strokeWidth="0">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[11px] text-gray-400">Verified owner · Responds in ~1 hr</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 text-sm font-medium text-[#ff385c] border border-[#ff385c] rounded-lg hover:bg-[#ff385c]/5 transition-colors">
              Chat
            </button>
            <button className="flex-1 py-2 text-sm font-medium text-white bg-[#ff385c] rounded-lg hover:bg-[#e00b41] transition-colors">
              Call
            </button>
          </div>
          {/* WhatsApp contact */}
          <a
            href="https://wa.me/919876543210?text=Hi%2C%20I%27m%20interested%20in%20Green%20Meadows%20PG"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-white bg-[#25D366] rounded-lg hover:brightness-95 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-.609zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            WhatsApp
          </a>
          <button className="mt-3 w-full flex items-center justify-center gap-1.5 text-[12px] text-muted hover:text-error transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21v-4m0 0V5a2 2 0 012-2h6l1 2h7l-3 5 3 5h-8l-1-2H5a2 2 0 00-2 2z" />
            </svg>
            Report this listing
          </button>
        </div>
      </section>

      {/* Sticky CTA bar (mobile) */}
      <div
        className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between z-40 md:hidden"
        style={{ borderTopWidth: "0.5px" }}
      >
        <span className="text-lg font-semibold text-[#ff385c]">₹8,500<span className="text-xs font-normal text-gray-400">/mo</span></span>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-xs font-medium text-[#ff385c] border border-[#ff385c] rounded-lg">
            Chat with owner
          </button>
          <button className="px-4 py-2 text-xs font-medium text-white bg-[#ff385c] rounded-lg">
            Schedule visit
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
