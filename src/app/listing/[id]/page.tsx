"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import ListingGallery from "@/components/ListingGallery";
import RoomTypesPricing from "@/components/RoomTypesPricing";
import { LISTINGS, getCategory, Listing } from "@/lib/categories";
import {
  Wifi,
  Wind,
  Utensils,
  Shirt,
  Shield,
  Car,
  Zap,
  Flame,
  Dumbbell,
  Compass,
  Home,
  Briefcase,
  Coffee,
  Clock,
  Truck,
  ArrowUpDown,
  Navigation,
  Milestone,
  DoorOpen,
  ArrowUpCircle,
  Building,
  FileText,
  TrendingUp,
  Maximize,
  Grid,
  HelpCircle,
} from "lucide-react";

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

const amenityLucideIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Wi-Fi": Wifi,
  "AC": Wind,
  "Meals": Utensils,
  "Laundry": Shirt,
  "Security": Shield,
  "Parking": Car,
  "Power backup": Zap,
  "Hot water": Flame,
  "Gym": Dumbbell,
  "Pool": Compass,
  "Clubhouse": Home,
  "Meeting rooms": Briefcase,
  "Cafeteria": Coffee,
  "24/7 access": Clock,
  "Loading dock": Truck,
  "High ceiling": ArrowUpDown,
  "Highway access": Navigation,
  "Main road": Milestone,
  "Washroom": DoorOpen,
  "Lift": ArrowUpCircle,
  "Bank tenant": Building,
  "Long lease": FileText,
  "High yield": TrendingUp,
  "Corner plot": Maximize,
  "Gated": Grid,
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

interface Review {
  id: number;
  name: string;
  date: string;
  rating: number;
  text: string;
  helpfulCount: number;
}

const DEFAULT_REVIEWS: Review[] = [
  { id: 1, name: "Priya M.", date: "May 2026", rating: 5, text: "Clean, well-maintained and the owner is very responsive. Metro is a short walk away.", helpfulCount: 4 },
  { id: 2, name: "Sandeep R.", date: "Apr 2026", rating: 4, text: "Great location for techies. Good value overall for the price and amenities on offer.", helpfulCount: 2 },
  { id: 3, name: "Amit K.", date: "Mar 2026", rating: 5, text: "Absolutely loved the connectivity. Safe neighborhood with lots of green spaces nearby.", helpfulCount: 5 },
  { id: 4, name: "Jessica D.", date: "Jan 2026", rating: 3, text: "Decent place, but power backup takes a couple of minutes to kick in. Otherwise quite comfortable.", helpfulCount: 1 }
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
  currentRating,
  currentReviewsCount,
}: {
  listing: Listing;
  saved: boolean;
  onToggleSave: () => void;
  currentRating: number;
  currentReviewsCount: number;
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
          <span className="font-semibold">{currentRating}</span>
          <span className="text-muted">· {currentReviewsCount} reviews</span>
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

function ReviewsSection({
  reviewsList,
  setReviewsList,
}: {
  reviewsList: Review[];
  setReviewsList: React.Dispatch<React.SetStateAction<Review[]>>;
}) {
  const [votedReviews, setVotedReviews] = useState<Record<number, boolean>>({});
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest">("recent");

  const [showWriteForm, setShowWriteForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Popular keyword tags for quick filtering
  const popularTags = ["Clean", "Location", "Owner", "Metro", "Value"];

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsList.forEach((r) => {
      const rating = Math.min(5, Math.max(1, Math.round(r.rating))) as 5 | 4 | 3 | 2 | 1;
      counts[rating]++;
    });
    return counts;
  }, [reviewsList]);

  const totalReviewsCount = reviewsList.length;

  const averageRating = useMemo(() => {
    if (totalReviewsCount === 0) return 0;
    const total = reviewsList.reduce((acc, r) => acc + r.rating, 0);
    return Number((total / totalReviewsCount).toFixed(1));
  }, [reviewsList, totalReviewsCount]);

  const filteredReviews = useMemo(() => {
    let result = [...reviewsList];

    if (selectedRatingFilter !== null) {
      result = result.filter((r) => Math.round(r.rating) === selectedRatingFilter);
    }

    if (selectedTag) {
      const tagLower = selectedTag.toLowerCase();
      result = result.filter((r) => r.text.toLowerCase().includes(tagLower));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => r.text.toLowerCase().includes(q) || r.name.toLowerCase().includes(q));
    }

    if (sortBy === "recent") {
      result.sort((a, b) => b.id - a.id);
    } else if (sortBy === "highest") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "lowest") {
      result.sort((a, b) => a.rating - b.rating);
    }

    return result;
  }, [reviewsList, selectedRatingFilter, selectedTag, searchQuery, sortBy]);

  const handleHelpfulClick = (id: number) => {
    if (votedReviews[id]) {
      setReviewsList((prev) =>
        prev.map((r) => (r.id === id ? { ...r, helpfulCount: Math.max(0, r.helpfulCount - 1) } : r))
      );
      setVotedReviews((prev) => ({ ...prev, [id]: false }));
    } else {
      setReviewsList((prev) =>
        prev.map((r) => (r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
      );
      setVotedReviews((prev) => ({ ...prev, [id]: true }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newText.trim()) {
      setFormError("Please enter your name and review comments.");
      return;
    }
    const newReview: Review = {
      id: Date.now(),
      name: newName.trim(),
      date: "Jul 2026",
      rating: newRating,
      text: newText.trim(),
      helpfulCount: 0,
    };
    setReviewsList((prev) => [newReview, ...prev]);
    setIsSubmitted(true);
    setFormError("");
    setNewName("");
    setNewText("");
    setNewRating(5);
    setTimeout(() => {
      setShowWriteForm(false);
      setIsSubmitted(false);
    }, 1500);
  };

  // Helper to generate dynamic colored avatar backgrounds
  const getAvatarBg = (name: string) => {
    const charCode = name.charCodeAt(0) || 0;
    const colors = [
      "bg-orange-100 text-orange-600",
      "bg-emerald-100 text-emerald-600",
      "bg-blue-100 text-blue-600",
      "bg-indigo-100 text-indigo-600",
      "bg-rose-100 text-rose-600",
      "bg-purple-100 text-purple-600",
    ];
    return colors[charCode % colors.length];
  };

  return (
    <section className="bg-canvas border border-hairline rounded-[16px] p-6 shadow-airbnb w-full transition-all duration-300 mb-6">
      {/* Header and Summary stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-hairline-soft pb-4">
        <div>
          <h2 className="text-xl font-bold text-ink mb-1 flex items-center gap-2">
            Reviews
            <span className="text-sm font-medium text-muted bg-surface-soft px-2.5 py-0.5 rounded-full">
              {totalReviewsCount}
            </span>
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            Ratings & comments from verified residents.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-ink leading-none">{averageRating}</p>
            <p className="text-[10px] text-muted font-medium uppercase tracking-wider mt-1">Average rating</p>
          </div>
          <div className="flex flex-col gap-0.5 text-rausch">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} size={14} />
              ))}
            </div>
            <p className="text-[10px] text-muted text-right">Out of 5 stars</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 min-w-0">
        {/* Left pane: Filtering & breakdown */}
        <div className="flex flex-col gap-5 lg:border-r lg:border-hairline-soft lg:pr-6">
          {/* Star breakdown */}
          <div>
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">Rating Breakdown</h3>
            <div className="flex flex-col gap-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingCounts[stars as 5 | 4 | 3 | 2 | 1];
                const pct = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
                const isSelected = selectedRatingFilter === stars;
                return (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setSelectedRatingFilter(isSelected ? null : stars)}
                    className={`flex items-center gap-2 text-xs w-full text-left p-1.5 rounded-md hover:bg-surface-soft active:scale-[0.98] transition-all group ${
                      isSelected ? "bg-surface-soft font-semibold text-rausch" : "text-body"
                    }`}
                  >
                    <span className="w-3 text-muted">{stars}</span>
                    <span className={isSelected ? "text-rausch" : "text-muted-soft opacity-75 group-hover:text-rausch"}><StarIcon size={10} /></span>
                    <div className="flex-1 h-2 bg-surface-strong rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSelected ? "bg-rausch" : "bg-muted-soft group-hover:bg-rausch/75"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-muted-soft text-[10px] font-medium shrink-0">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Popular tags */}
          <div>
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider mb-2.5">Popular topics</h3>
            <div className="flex flex-wrap gap-1.5">
              {popularTags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all active:scale-95 ${
                      isSelected
                        ? "bg-rausch text-white border-rausch shadow-sm"
                        : "bg-canvas text-body border-hairline hover:border-ink"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right pane: list, search, sort, write review */}
        <div className="flex flex-col gap-4 min-w-0">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-soft/60 border border-hairline-soft rounded-[12px] p-3">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-canvas border border-hairline rounded-[8px] focus:outline-none focus:border-rausch placeholder-muted-soft text-ink"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-soft">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-[10px] font-semibold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted font-medium">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-canvas border border-hairline rounded-[8px] px-2 py-1.5 focus:outline-none focus:border-rausch text-ink font-medium select-none"
              >
                <option value="recent">Newest</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          {/* Filter Status Badge */}
          {(selectedRatingFilter !== null || selectedTag || searchQuery) && (
            <div className="flex items-center justify-between text-xs bg-rausch/5 border border-rausch/10 rounded-[10px] px-3 py-2 text-ink animate-fade-up">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-rausch">Active Filter:</span>
                <span className="text-body">
                  Found {filteredReviews.length} match{filteredReviews.length === 1 ? "" : "es"}
                  {selectedRatingFilter !== null && ` · ${selectedRatingFilter} Star`}
                  {selectedTag && ` · "${selectedTag}"`}
                  {searchQuery && ` · "${searchQuery}"`}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedRatingFilter(null);
                  setSelectedTag(null);
                  setSearchQuery("");
                }}
                className="text-xs text-rausch font-bold hover:underline shrink-0"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Write Review Trigger & Form */}
          {!showWriteForm ? (
            <button
              type="button"
              onClick={() => {
                setShowWriteForm(true);
                setIsSubmitted(false);
                setFormError("");
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold text-ink border border-hairline border-dashed rounded-[10px] hover:border-rausch hover:text-rausch hover:bg-rausch/5 active:scale-[0.99] transition-all focus:outline-none"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Share your experience — Write a review
            </button>
          ) : (
            <form onSubmit={handleFormSubmit} className="bg-surface-soft border border-hairline-soft rounded-[12px] p-4 animate-fade-up">
              <div className="flex items-center justify-between mb-3 border-b border-hairline-soft pb-2">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Write a review</h3>
                <button
                  type="button"
                  onClick={() => setShowWriteForm(false)}
                  className="text-muted hover:text-ink text-xs font-medium"
                >
                  Cancel
                </button>
              </div>

              {isSubmitted ? (
                <div className="text-center py-6">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mb-2 animate-bounce">
                    ✓
                  </span>
                  <p className="text-sm font-semibold text-ink mb-1">Review Submitted!</p>
                  <p className="text-xs text-muted">Thank you for sharing your valuable review.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted font-bold uppercase tracking-wider block">Your Rating</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className={`transition-transform hover:scale-110 active:scale-95 ${
                            star <= newRating ? "text-rausch" : "text-muted-soft opacity-40"
                          }`}
                        >
                          <StarIcon size={20} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="reviewer-name" className="text-[10px] text-muted font-bold uppercase tracking-wider block">Name</label>
                      <input
                        id="reviewer-name"
                        type="text"
                        placeholder="e.g. Rahul S."
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full text-xs bg-canvas border border-hairline rounded-[8px] px-3 py-2 focus:outline-none focus:border-rausch text-ink placeholder-muted-soft"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="reviewer-text" className="text-[10px] text-muted font-bold uppercase tracking-wider block">Review Comments</label>
                    <textarea
                      id="reviewer-text"
                      rows={3}
                      placeholder="Tell us about the cleanliness, location, host, amenities, or commute convenience..."
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      className="w-full text-xs bg-canvas border border-hairline rounded-[8px] px-3 py-2 focus:outline-none focus:border-rausch text-ink resize-none placeholder-muted-soft"
                    />
                  </div>

                  {formError && (
                    <p className="text-xs text-error font-medium">{formError}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2 bg-rausch hover:bg-rausch-active active:scale-[0.98] text-white text-xs font-semibold rounded-[8px] transition-all focus:outline-none"
                  >
                    Submit Review
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Reviews List — Horizontal Scroll Slider */}
          <div className="flex flex-row gap-4 overflow-x-auto pb-4 pt-1 pr-1.5 scrollbar-thin snap-x snap-mandatory">
            {filteredReviews.length === 0 ? (
              <div className="w-full text-center py-10 border border-hairline border-dashed rounded-[12px] bg-surface-soft/30 shrink-0">
                <p className="text-sm text-muted">No reviews match your filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRatingFilter(null);
                    setSelectedTag(null);
                    setSearchQuery("");
                  }}
                  className="text-xs text-rausch font-semibold mt-1.5 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredReviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-canvas border border-hairline rounded-[12px] p-4 transition-all duration-200 hover:border-hairline hover:shadow-sm w-[280px] sm:w-[320px] shrink-0 snap-start flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    {/* Dynamic colored avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarBg(r.name)}`}>
                      {r.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-ink leading-tight truncate">{r.name}</p>
                      <p className="text-[10px] text-muted mt-0.5">{r.date}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5 text-rausch shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < r.rating ? "text-rausch" : "text-muted-soft opacity-30"}>
                          <StarIcon size={10} />
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-body leading-relaxed mb-3.5 whitespace-pre-line">{r.text}</p>
                  
                  {/* Footer actions */}
                  <div className="flex items-center justify-between border-t border-hairline-soft pt-2.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleHelpfulClick(r.id)}
                      className={`flex items-center gap-1.5 font-medium transition-all active:scale-90 focus:outline-none ${
                        votedReviews[r.id] ? "text-rausch font-bold" : "text-muted hover:text-ink"
                      }`}
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill={votedReviews[r.id] ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="transition-transform duration-200"
                      >
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                      Helpful {r.helpfulCount > 0 ? `(${r.helpfulCount})` : ""}
                    </button>
                    <button type="button" className="text-muted hover:text-error transition-colors focus:outline-none">
                      Report
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ListingDetail() {
  const params = useParams();
  const id = Number(params.id);
  const listing = LISTINGS.find((l) => l.id === id) ?? LISTINGS[0];
  const category = getCategory(listing.category);
  const facts = buildFacts(listing);
  const [saved, setSaved] = useState(false);
  const [reviewsList, setReviewsList] = useState<Review[]>(DEFAULT_REVIEWS);

  const currentReviewsCount = reviewsList.length;
  const currentRating = useMemo(() => {
    if (reviewsList.length === 0) return 0;
    const total = reviewsList.reduce((acc, r) => acc + r.rating, 0);
    return Number((total / reviewsList.length).toFixed(1));
  }, [reviewsList]);

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
        <div className="min-w-0">
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
                <span className="font-semibold">{currentRating}</span>
                <span className="text-muted">({currentReviewsCount} reviews)</span>
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
            <h2 className="text-lg font-bold text-ink mb-4">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {listing.amenities.map((a) => {
                const IconComponent = amenityLucideIcons[a] || HelpCircle;
                return (
                  <div
                    key={a}
                    className="flex items-center gap-3 p-3 bg-surface-soft/60 border border-hairline-soft rounded-[12px] hover:bg-rausch/5 hover:border-rausch/30 hover:scale-[1.02] hover:shadow-sm transition-all duration-300 group cursor-default"
                  >
                    <div className="w-8 h-8 rounded-lg bg-canvas border border-hairline-soft flex items-center justify-center text-muted group-hover:text-rausch group-hover:border-rausch/30 transition-colors shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-body group-hover:text-ink transition-colors truncate">
                      {a}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Room types & pricing — visible for lodging-style listings and any explicit room type data */}
          {(["pg", "coliving", "flatmate", "homestay", "service-apartment", "hotel"].includes(listing.category) || (listing.roomTypes?.length ?? 0) > 0) && (
            <div className="mb-6">
              <RoomTypesPricing roomTypes={listing.roomTypes} />
            </div>
          )}

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
          <ReviewsSection reviewsList={reviewsList} setReviewsList={setReviewsList} />

          {/* Contact card — inline below lg breakpoint */}
          <section className="mb-24 lg:hidden">
            <ContactCard
              listing={listing}
              saved={saved}
              onToggleSave={() => setSaved(!saved)}
              currentRating={currentRating}
              currentReviewsCount={currentReviewsCount}
            />
          </section>
        </div>

        {/* Sticky contact card — desktop */}
        <aside className="hidden lg:block">
          <div className="lg:sticky lg:top-24">
            <ContactCard
              listing={listing}
              saved={saved}
              onToggleSave={() => setSaved(!saved)}
              currentRating={currentRating}
              currentReviewsCount={currentReviewsCount}
            />
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
