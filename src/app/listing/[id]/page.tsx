"use client";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import ListingGallery from "@/components/ListingGallery";
import RoomTypesPricing from "@/components/RoomTypesPricing";
import { LISTINGS, getCategory, Listing } from "@/lib/categories";
import { apiClient } from "@/lib/apiClient";
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
  onScheduleVisit,
  onWhatsAppClick,
  currentRating,
  currentReviewsCount,
}: {
  listing: any;
  saved: boolean;
  onToggleSave: () => void;
  onScheduleVisit: () => void;
  onWhatsAppClick: () => void;
  currentRating: number;
  currentReviewsCount: number;
}) {
  const isCommercial = getCategory(listing.category)?.world === "commercial";

  // Dynamic listedBy role badge
  const role = listing.listedBy || (isCommercial ? "agent" : "owner");
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const roleBadgeStyle =
    role === "owner"
      ? "bg-rausch/10 border-rausch/20 text-rausch"
      : role === "builder"
      ? "bg-indigo/10 border-indigo/20 text-indigo"
      : "bg-emerald-600/10 border-emerald-600/20 text-emerald-700";

  const ownerName = listing.owner?.name || "Rajesh Kumar";
  const initials = ownerName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const ownerPhone = listing.owner?.phone || "9876543210";
  const ownerId = listing.owner?.id;

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
        {ownerId ? (
          <Link href={`/profile/${ownerId}`} className="shrink-0 group">
            {listing.owner?.avatarUrl ? (
              <img src={listing.owner.avatarUrl} alt={ownerName} className="w-10 h-10 rounded-full object-cover border border-hairline group-hover:opacity-90" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-rausch/10 flex items-center justify-center text-sm font-semibold text-rausch border border-rausch/20 group-hover:bg-rausch/20 transition-colors">
                {initials}
              </div>
            )}
          </Link>
        ) : (
          <div className="w-10 h-10 rounded-full bg-rausch/10 flex items-center justify-center text-sm font-semibold text-rausch shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {ownerId ? (
              <Link href={`/profile/${ownerId}`} className="text-sm font-semibold text-ink truncate hover:underline hover:text-rausch transition-colors">
                {ownerName}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-ink truncate">{ownerName}</span>
            )}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-rausch shrink-0" aria-hidden="true">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${roleBadgeStyle} uppercase tracking-wider`}>
              {roleLabel}
            </span>
            <p className="text-[10px] text-muted">Responds in ~1 hr</p>
          </div>
        </div>
      </div>

      {/* Primary action */}
      {ownerId && (
        <Link
          href={`/profile/${ownerId}`}
          className="w-full mb-3 inline-flex items-center justify-center py-2 text-xs font-semibold text-ink border border-hairline rounded-[8px] hover:bg-surface-soft active:scale-[0.98] transition-all"
        >
          View Profile &amp; Listings
        </Link>
      )}

      <button
        type="button"
        className="w-full py-2.5 text-sm font-semibold text-white bg-rausch rounded-[8px] hover:bg-rausch-active active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2"
      >
        {role === "agent" ? "Contact agent" : role === "builder" ? "Contact builder" : "Contact owner"}
      </button>

      {/* Secondary actions */}
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={onScheduleVisit}
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
        href={`https://wa.me/91${ownerPhone}?text=${encodeURIComponent(`Hi, I'm interested in ${listing.title}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onWhatsAppClick}
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

  const getAvatarBg = (name: string) => {
    const charCode = name.charCodeAt(0) || 0;
    const colors = [
      "bg-orange-50 text-orange-600 border-orange-100",
      "bg-emerald-50 text-emerald-600 border-emerald-100",
      "bg-blue-50 text-blue-600 border-blue-100",
      "bg-indigo-50 text-indigo-600 border-indigo-100",
      "bg-rose-50 text-rose-600 border-rose-100",
      "bg-purple-50 text-purple-600 border-purple-100",
    ];
    return colors[charCode % colors.length];
  };

  return (
    <section className="bg-canvas border border-hairline rounded-[24px] p-5 sm:p-6 shadow-sm w-full transition-all duration-300 mb-8">
      {/* Custom keyframes for tap interactions */}
      <style>{`
        @keyframes heart-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .animate-pop { animation: heart-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>

      {/* Header and stats */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-hairline-soft">
        <div>
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            Resident Reviews
            <span className="text-xs font-bold text-muted bg-surface-soft px-2 py-0.5 rounded-full">
              {totalReviewsCount}
            </span>
          </h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-rausch"><StarIcon size={12} /></span>
            <span className="text-sm font-bold text-ink">{averageRating}</span>
            <span className="text-xs text-muted">average score</span>
          </div>
        </div>

        {!showWriteForm && (
          <button
            type="button"
            onClick={() => setShowWriteForm(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-rausch rounded-xl hover:bg-rausch-active hover:shadow-md active:scale-95 transition-all"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Write Review Form */}
      {showWriteForm && (
        <form onSubmit={handleFormSubmit} className="mb-6 p-4 bg-surface-soft border border-hairline-soft rounded-2xl animate-fade-up">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-hairline-soft">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Share your experience</h3>
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
              <p className="text-sm font-bold text-ink mb-0.5">Review Submitted!</p>
              <p className="text-xs text-muted">Thank you for sharing your experience.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] text-muted font-bold uppercase tracking-wider block mb-1">Your Rating</label>
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
                <div>
                  <label htmlFor="reviewer-name" className="text-[10px] text-muted font-bold uppercase tracking-wider block mb-1">Name</label>
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

              <div>
                <label htmlFor="reviewer-text" className="text-[10px] text-muted font-bold uppercase tracking-wider block mb-1">Review Comments</label>
                <textarea
                  id="reviewer-text"
                  rows={3}
                  placeholder="Tell us about the cleanliness, location, host, or commute convenience..."
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
                className="w-full py-2 bg-rausch hover:bg-rausch-active active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all"
              >
                Submit Review
              </button>
            </div>
          )}
        </form>
      )}

      {/* Filter Options: Combined into modern horizontal pills */}
      <div className="flex flex-col gap-3.5 mb-5 bg-surface-soft/60 border border-hairline-soft rounded-2xl p-4">
        {/* Rating selection pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-muted font-semibold mr-1">Filter rating:</span>
          <button
            onClick={() => setSelectedRatingFilter(null)}
            className={`px-3 py-1 rounded-full border transition-all ${
              selectedRatingFilter === null
                ? "bg-ink text-white border-ink font-semibold"
                : "bg-canvas text-body border-hairline hover:border-ink"
            }`}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map((stars) => {
            const isSelected = selectedRatingFilter === stars;
            return (
              <button
                key={stars}
                onClick={() => setSelectedRatingFilter(isSelected ? null : stars)}
                className={`px-3 py-1 rounded-full border transition-all flex items-center gap-1 ${
                  isSelected
                    ? "bg-rausch text-white border-rausch font-semibold shadow-sm"
                    : "bg-canvas text-body border-hairline hover:border-ink"
                }`}
              >
                {stars} <StarIcon size={9} />
              </button>
            );
          })}
        </div>

        {/* Topics selection pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-muted font-semibold mr-1">Topic tags:</span>
          {popularTags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(isSelected ? null : tag)}
                className={`px-3 py-1 rounded-full border transition-all ${
                  isSelected
                    ? "bg-rausch text-white border-rausch font-semibold shadow-sm"
                    : "bg-canvas text-body border-hairline hover:border-ink"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Search & Sort controllers */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-hairline-soft">
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search comments..."
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
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted font-medium">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-canvas border border-hairline rounded-[8px] px-2 py-1.5 focus:outline-none focus:border-rausch text-ink font-semibold"
            >
              <option value="recent">Newest</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter status banner */}
      {(selectedRatingFilter !== null || selectedTag || searchQuery) && (
        <div className="flex items-center justify-between text-xs bg-rausch/5 border border-rausch/10 rounded-xl px-3.5 py-2 mb-4 text-ink animate-fade-up">
          <p>Found <span className="font-bold text-rausch">{filteredReviews.length}</span> matching reviews</p>
          <button
            onClick={() => {
              setSelectedRatingFilter(null);
              setSelectedTag(null);
              setSearchQuery("");
            }}
            className="text-xs text-rausch font-bold hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Reviews list slider */}
      <div className="flex flex-row gap-4 overflow-x-auto pb-4 pt-1 pr-1.5 scrollbar-thin snap-x snap-mandatory">
        {filteredReviews.length === 0 ? (
          <div className="w-full text-center py-12 border border-hairline border-dashed rounded-2xl bg-surface-soft/30">
            <p className="text-sm text-muted">No reviews match your filter parameters.</p>
            <button
              onClick={() => {
                setSelectedRatingFilter(null);
                setSelectedTag(null);
                setSearchQuery("");
              }}
              className="text-xs text-rausch font-bold mt-2 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredReviews.map((r) => {
            const hasVoted = votedReviews[r.id];
            return (
              <div
                key={r.id}
                className="bg-canvas border border-hairline rounded-2xl p-4 transition-all hover:shadow-sm w-[285px] sm:w-[330px] shrink-0 snap-start flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    {/* User profile avatar */}
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-extrabold shrink-0 shadow-sm ${getAvatarBg(r.name)}`}>
                      {r.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-ink leading-tight truncate flex items-center gap-1">
                        {r.name}
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Verified stay" />
                      </p>
                      <p className="text-[10px] text-muted mt-0.5">{r.date}</p>
                    </div>
                    {/* Rating stars */}
                    <div className="ml-auto flex gap-0.5 text-rausch shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < r.rating ? "text-rausch" : "text-muted-soft opacity-20"}>
                          <StarIcon size={9} />
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-body leading-relaxed mb-4 line-clamp-4">{r.text}</p>
                </div>

                {/* Retentive interaction footer */}
                <div className="flex items-center justify-between border-t border-hairline-soft pt-3 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleHelpfulClick(r.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all active:scale-90 ${
                      hasVoted
                        ? "bg-rausch/10 border-rausch/20 text-rausch font-bold animate-pop"
                        : "bg-surface-soft border-hairline-soft text-muted hover:text-ink"
                    }`}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill={hasVoted ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                    Helpful {r.helpfulCount > 0 ? `(${r.helpfulCount})` : ""}
                  </button>
                  
                  <span className="text-[10px] text-muted-soft bg-surface-soft px-2 py-0.5 rounded font-medium">
                    Verified Resident
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function ScheduleVisitModal({
  open,
  onClose,
  listingId,
  onUnauthorized,
}: {
  open: boolean;
  onClose: () => void;
  listingId: string;
  onUnauthorized: () => void;
}) {
  // Default slot: tomorrow at 10:30 local time.
  const defaultTime = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 30, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, []);
  const [visitTime, setVisitTime] = useState(defaultTime);
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  if (!open) return null;

  const submit = () => {
    setState("saving");
    apiClient.post("/visits", { listingId, visitTime: new Date(visitTime).toISOString() })
      .then(() => setState("done"))
      .catch((err) => {
        if (err?.response?.status === 401) {
          onClose();
          onUnauthorized();
          return;
        }
        setState("error");
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <div className="relative w-full max-w-sm bg-canvas rounded-[14px] shadow-airbnb p-5">
        {state === "done" ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-rausch/10 text-rausch flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-ink mb-1">Visit requested</h3>
            <p className="text-sm text-muted mb-4">The owner will confirm your slot. Track it from your profile.</p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-white bg-rausch rounded-[8px] hover:bg-rausch-active transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-base font-bold text-ink mb-1">Schedule a visit</h3>
            <p className="text-sm text-muted mb-4">Pick a date and time that works for you.</p>
            <input
              type="datetime-local"
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              aria-label="Visit date and time"
              className="w-full text-sm text-ink border border-hairline rounded-[8px] px-3 py-2.5 bg-canvas outline-none focus-visible:ring-2 focus-visible:ring-ink mb-4"
            />
            {state === "error" && (
              <p className="text-xs text-error mb-3">Could not schedule the visit. Please try again.</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 text-sm font-medium text-ink border border-hairline rounded-[8px] hover:bg-surface-soft transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={state === "saving"}
                className="flex-1 py-2 text-sm font-semibold text-white bg-rausch rounded-[8px] hover:bg-rausch-active transition-colors disabled:opacity-60"
              >
                {state === "saving" ? "Scheduling…" : "Confirm visit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ListingDetail() {
  const params = useParams();
  const router = useRouter();
  const idStr = String(params.id);

  // Use local mock as initial fallback
  const initialListing = useMemo(() => {
    return LISTINGS.find((l) => String(l.id) === idStr) ?? LISTINGS[0];
  }, [idStr]);

  const [listing, setListing] = useState<any>(initialListing);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/listings/${idStr}`)
      .then((res) => {
        if (res.data && res.data.success) {
          setListing(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch listing detail from database:", err);
      })
      .finally(() => {
        setLoading(false);
      });
    // Record a unique page view for the owner's analytics (fire-and-forget).
    const viewedKey = `viewed_${idStr}`;
    if (typeof window !== "undefined" && !sessionStorage.getItem(viewedKey)) {
      apiClient
        .post("/events", { listingId: idStr, eventType: "view" })
        .then(() => {
          sessionStorage.setItem(viewedKey, "true");
        })
        .catch(() => {});
    }
  }, [idStr]);

  const category = getCategory(listing.category);
  const facts = buildFacts(listing);
  const [saved, setSaved] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);

  // Optimistic wishlist toggle backed by the API; 401 → login.
  const toggleSaved = () => {
    const next = !saved;
    setSaved(next);
    const req = next
      ? apiClient.post("/wishlist", { listingId: idStr })
      : apiClient.delete(`/wishlist/${idStr}`);
    req
      .then(() => {
        if (next) {
          apiClient.post("/events", { listingId: idStr, eventType: "wishlist_add" }).catch(() => {});
        }
      })
      .catch((err) => {
        setSaved(!next);
        if (err?.response?.status === 401) router.push("/login");
      });
  };

  const trackWhatsApp = () => {
    apiClient.post("/events", { listingId: idStr, eventType: "whatsapp_click" }).catch(() => {});
  };
  const [reviewsList, setReviewsList] = useState<Review[]>(DEFAULT_REVIEWS);

  const currentReviewsCount = reviewsList.length;
  const currentRating = useMemo(() => {
    if (reviewsList.length === 0) return 0;
    const total = reviewsList.reduce((acc, r) => acc + r.rating, 0);
    return Number((total / reviewsList.length).toFixed(1));
  }, [reviewsList]);

  const renderNearbyPlaces = () => (
    <div className="bg-canvas border border-hairline rounded-[14px] p-4 shadow-sm">
      <h3 className="text-sm font-bold text-ink mb-3">What&apos;s nearby</h3>
      <div className="divide-y divide-hairline-soft">
        {nearbyPlaces.map((p) => (
          <div key={p.name} className="flex items-center gap-3 py-2.5">
            <span className="text-base shrink-0">{p.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-ink truncate">{p.name}</p>
              <p className="text-[10px] text-muted">{p.type}</p>
            </div>
            <span className="text-xs text-muted shrink-0">{p.dist}</span>
          </div>
        ))}
      </div>
    </div>
  );

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
    const primaryImage = listing.image || category.image;
    const unique = [primaryImage, ...pool.filter((img) => img !== primaryImage)];
    return unique.slice(0, 5);
  }, [category, listing]);

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
        onToggleSave={toggleSaved}
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
            <div className="flex flex-wrap gap-3">
              {facts.map((f) => (
                <div key={f.label} className="bg-canvas border border-hairline rounded-[12px] px-4 py-3 flex-1 min-w-[130px] hover:shadow-airbnb hover:border-rausch/20 hover:-translate-y-0.5 transition-all duration-300">
                  <p className="text-[11px] text-muted font-medium uppercase tracking-wider">{f.label}</p>
                  <p className="text-sm font-semibold text-ink mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Amenities — from this listing */}
          <section className="mb-6 pb-6 border-b border-hairline-soft">
            <h2 className="text-lg font-bold text-ink mb-4">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {listing.amenities.map((a: string) => {
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
            <div className="bg-gradient-to-r from-rausch/[0.04] to-tab-rent/[0.04] border border-rausch/20 rounded-[14px] p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rausch/10 to-tab-rent/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              <div className="flex items-center gap-1.5 mb-2 relative z-10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-rausch animate-pulse" aria-hidden="true">
                  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                </svg>
                <span className="text-sm font-bold text-rausch tracking-wide uppercase">AI nest insight</span>
              </div>
              <p className="text-sm text-body leading-relaxed mb-3 relative z-10 font-medium">
                This {category?.label.toLowerCase() ?? "place"} is <span className="text-ink font-bold">12 min</span> from 3 companies hiring for your profile.
                {listing.metroDistance ? ` ${listing.metroDistance}.` : ""} Plan your commute and explore roles nearby.
              </p>
              <Link href="/jobs" className="inline-flex items-center gap-1 text-sm text-rausch font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch rounded-sm relative z-10">
                View matches <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">→</span>
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

          {/* Reviews & Ratings */}
          <ReviewsSection reviewsList={reviewsList} setReviewsList={setReviewsList} />

          {/* Contact card — inline below lg breakpoint */}
          <section className="mb-24 lg:hidden space-y-4">
            <ContactCard
              listing={listing}
              saved={saved}
              onToggleSave={toggleSaved}
              onScheduleVisit={() => setVisitOpen(true)}
              onWhatsAppClick={trackWhatsApp}
              currentRating={currentRating}
              currentReviewsCount={currentReviewsCount}
            />
            {renderNearbyPlaces()}
          </section>
        </div>

        {/* Sticky contact card — desktop */}
        <aside className="hidden lg:block space-y-4 lg:sticky lg:top-24">
          <ContactCard
            listing={listing}
            saved={saved}
            onToggleSave={toggleSaved}
            onScheduleVisit={() => setVisitOpen(true)}
            onWhatsAppClick={trackWhatsApp}
            currentRating={currentRating}
            currentReviewsCount={currentReviewsCount}
          />
          {renderNearbyPlaces()}
        </aside>
      </div>

      {/* Sticky CTA bar (mobile) */}
      <div className="fixed bottom-[72px] left-4 right-4 bg-canvas/90 backdrop-blur-md border border-hairline/80 px-5 py-3 rounded-full flex items-center justify-between gap-3 z-40 md:hidden shadow-airbnb">
        <div className="min-w-0">
          <p className="text-lg font-bold text-ink leading-tight">{listing.price}</p>
          <p className="text-[10px] text-muted truncate">{listing.noBrokerage ? "Zero brokerage" : category?.label ?? "Listing"}</p>
        </div>
        <button
          type="button"
          className="px-5 py-2.5 text-xs font-bold text-white bg-rausch rounded-full hover:bg-rausch-active active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2 shrink-0 shadow-sm"
        >
          {getCategory(listing.category)?.world === "commercial" ? "Contact agent" : "Contact owner"}
        </button>
      </div>

      {/* Schedule visit modal */}
      <ScheduleVisitModal
        open={visitOpen}
        onClose={() => setVisitOpen(false)}
        listingId={idStr}
        onUnauthorized={() => router.push("/login")}
      />
    </PageLayout>
  );
}
