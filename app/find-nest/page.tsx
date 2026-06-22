"use client";
import { useState } from "react";
import Link from "next/link";
import SearchBar from "../components/SearchBar";
import ListingCard from "../components/ListingCard";
import PageLayout from "../components/PageLayout";

const filterChips = [
  "All", "PG/Hostel", "1 BHK", "2 BHK", "Co-living", "Homestay",
  "Under ₹8k", "Furnished", "Near metro", "Wi-Fi", "Meals",
];

const listings = [
  { id: 1, title: "Green Meadows PG for Men", location: "Koramangala, Bengaluru", metroDistance: "500m from metro", price: "₹8,500/mo", rating: 4.5, reviewCount: 128, badge: "PG", amenities: ["AC", "Meals", "Wi-Fi"] },
  { id: 2, title: "Sunrise Co-living Space", location: "HSR Layout, Bengaluru", metroDistance: "1.2km from metro", price: "₹12,000/mo", rating: 4.7, reviewCount: 89, badge: "Co-living", amenities: ["AC", "Wi-Fi", "Gym"] },
  { id: 3, title: "Lakeside 1BHK Rental Flat", location: "Indiranagar, Bengaluru", metroDistance: "300m from metro", price: "₹18,500/mo", rating: 4.3, reviewCount: 56, badge: "Flat", amenities: ["AC", "Parking", "Security"] },
  { id: 4, title: "StudyNest Girls Hostel", location: "BTM Layout, Bengaluru", metroDistance: "800m from metro", price: "₹6,200/mo", rating: 4.6, reviewCount: 204, badge: "Hostel", amenities: ["Meals", "Wi-Fi", "Laundry"] },
  { id: 5, title: "Urban Nest 2BHK", location: "Whitefield, Bengaluru", price: "₹22,000/mo", rating: 4.4, reviewCount: 42, badge: "Flat", amenities: ["AC", "Parking", "Power backup"] },
  { id: 6, title: "Cozy Homestay near MG Road", location: "MG Road, Bengaluru", metroDistance: "200m from metro", price: "₹15,000/mo", rating: 4.8, reviewCount: 31, badge: "Homestay", amenities: ["AC", "Wi-Fi", "Meals"] },
  { id: 7, title: "TechPark PG – Triple Sharing", location: "Electronic City, Bengaluru", metroDistance: "1km from metro", price: "₹5,800/mo", rating: 4.2, reviewCount: 176, badge: "PG", amenities: ["Meals", "Wi-Fi", "Laundry"] },
  { id: 8, title: "Elite Co-living Studio", location: "Marathahalli, Bengaluru", price: "₹14,500/mo", rating: 4.6, reviewCount: 63, badge: "Co-living", amenities: ["AC", "Gym", "Wi-Fi"] },
];

export default function FindNest() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [sortBy, setSortBy] = useState("Relevance");

  return (
    <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Find Nest" }]}>
      {/* Search bar */}
      <div className="mb-4">
        <SearchBar />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-4">
        {filterChips.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveFilter(chip)}
            className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              activeFilter === chip
                ? "bg-[#ff385c]/10 border-[#ff385c] text-[#ff385c]"
                : "bg-white border-gray-300 text-gray-500 hover:border-gray-400"
            }`}
            style={{ borderWidth: "0.5px" }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-500">124 properties in Koramangala, Bengaluru</p>
        <div className="flex items-center gap-2">
          {/* List/Map toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden" style={{ borderWidth: "0.5px" }}>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 ${viewMode === "list" ? "bg-[#ff385c] text-white" : "bg-white text-gray-500"}`}
              aria-label="List view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`p-1.5 ${viewMode === "map" ? "bg-[#ff385c] text-white" : "bg-white text-gray-500"}`}
              aria-label="Map view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>
          </div>
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs text-gray-600 border border-gray-300 rounded-lg px-2 py-1.5 outline-none bg-white"
            style={{ borderWidth: "0.5px" }}
          >
            <option>Relevance</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Rating</option>
          </select>
        </div>
      </div>

      {/* Map placeholder */}
      {viewMode === "map" && (
        <div className="h-[220px] bg-gray-100 rounded-xl flex items-center justify-center gap-2 mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm text-gray-400">Map view — integrate Google Maps API here</span>
        </div>
      )}

      {/* Listing results */}
      {viewMode === "list" && (
        <div className="space-y-0">
          {listings.map((listing) => (
            <Link href={`/listing/${listing.id}`} key={listing.id} className="block">
              <div
                className="flex gap-3 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors px-1 -mx-1 rounded"
                style={{ borderBottomWidth: "0.5px" }}
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 bg-[#f7f7f7] rounded-lg flex-shrink-0 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.2">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-10h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" />
                  </svg>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{listing.title}</h3>
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
                          {listing.badge}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{listing.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {listing.amenities.map((a) => (
                          <span key={a} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{a}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-sm font-semibold text-[#ff385c]">{listing.price}</span>
                      <div className="flex items-center gap-0.5 text-xs text-gray-500">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#222222" stroke="#222222" strokeWidth="1">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span>{listing.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Grid view for desktop with cards */}
      {viewMode === "list" && (
        <div className="hidden md:grid md:grid-cols-3 gap-4 mt-6">
          {listings.map((listing) => (
            <ListingCard key={`grid-${listing.id}`} {...listing} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
