"use client";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import PageLayout from "@/components/PageLayout";

const ListingsMap = dynamic(() => import("@/components/ListingsMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full skeleton rounded-[14px]" aria-hidden="true" />,
});
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
    <div className="bg-canvas border border-hairline rounded-[16px] p-4 shadow-airbnb">
      {/* Price + rating inline */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xl font-extrabold text-ink">{listing.price}</p>
        <div className="flex items-center gap-1 text-xs text-ink">
          <span className="text-rausch"><StarIcon size={11} /></span>
          <span className="font-bold">{currentRating}</span>
          <span className="text-muted">· {currentReviewsCount} reviews</span>
        </div>
      </div>

      {/* Owner Info & View Profile inline */}
      <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-hairline-soft">
        {ownerId ? (
          <Link href={`/profile/${ownerId}`} className="shrink-0 group">
            {listing.owner?.avatarUrl ? (
              <img src={listing.owner.avatarUrl} alt={ownerName} className="w-8.5 h-8.5 rounded-full object-cover border border-hairline group-hover:opacity-90" />
            ) : (
              <div className="w-8.5 h-8.5 rounded-full bg-rausch/10 flex items-center justify-center text-xs font-bold text-rausch border border-rausch/20 group-hover:bg-rausch/20 transition-colors">
                {initials}
              </div>
            )}
          </Link>
        ) : (
          <div className="w-8.5 h-8.5 rounded-full bg-rausch/10 flex items-center justify-center text-xs font-bold text-rausch shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 justify-between">
            <div className="flex items-center gap-1 truncate">
              {ownerId ? (
                <Link href={`/profile/${ownerId}`} className="text-xs font-bold text-ink truncate hover:underline hover:text-rausch transition-colors">
                  {ownerName}
                </Link>
              ) : (
                <span className="text-xs font-bold text-ink truncate">{ownerName}</span>
              )}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-rausch shrink-0" aria-hidden="true">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {ownerId && (
              <Link href={`/profile/${ownerId}`} className="text-[10px] font-bold text-rausch hover:underline shrink-0">
                View Profile
              </Link>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded border ${roleBadgeStyle} uppercase tracking-wider`}>
              {roleLabel}
            </span>
            <p className="text-[9px] text-muted">Responds in ~1 hr</p>
          </div>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="space-y-1.5">
        <a
          href={`tel:${ownerPhone}`}
          className="flex justify-center items-center w-full py-2 text-xs font-bold text-white bg-rausch rounded-[8px] hover:bg-rausch-active transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch"
        >
          {role === "agent" ? "Contact Agent" : role === "builder" ? "Contact Builder" : "Contact Owner"}
        </a>

        <div className="grid grid-cols-3 gap-1.5">
          <a
            href={`tel:${ownerPhone}`}
            className="flex items-center justify-center py-1.5 text-[11px] font-bold text-ink border border-hairline rounded-[8px] hover:bg-surface-soft active:scale-[0.98] transition-all"
          >
            Call
          </a>
          <a
            href={`https://wa.me/91${ownerPhone}?text=${encodeURIComponent(`Hi, I'm interested in ${listing.title}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onWhatsAppClick}
            className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold text-white bg-[#25D366] rounded-[8px] hover:brightness-95 transition-all"
          >
            WhatsApp
          </a>
          <button
            type="button"
            onClick={onScheduleVisit}
            className="py-1.5 text-[11px] font-bold text-ink border border-hairline rounded-[8px] hover:bg-surface-soft active:scale-[0.98] transition-all"
          >
            Visit
          </button>
        </div>
      </div>

      {/* Save & Report inline */}
      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-hairline-soft text-[10px]">
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          className="inline-flex items-center gap-1 text-muted hover:text-ink transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={saved ? "text-rausch" : ""} aria-hidden="true">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {saved ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => alert("Thank you for reporting this listing. Our trust & safety team will review it shortly.")}
          className="inline-flex items-center gap-1 text-muted hover:text-error transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 21v-4m0 0V5a2 2 0 012-2h6l1 2h7l-3 5 3 5h-8l-1-2H5a2 2 0 00-2 2z" />
          </svg>
          Report listing
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
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalReviewsCount = reviewsList.length;

  const averageRating = useMemo(() => {
    if (totalReviewsCount === 0) return 0;
    const total = reviewsList.reduce((acc, r) => acc + r.rating, 0);
    return Number((total / totalReviewsCount).toFixed(1));
  }, [reviewsList, totalReviewsCount]);

  const ratingCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 stars
    reviewsList.forEach((r) => {
      const idx = 5 - Math.round(r.rating);
      if (idx >= 0 && idx < 5) counts[idx]++;
    });
    return counts;
  }, [reviewsList]);

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
    <section className="bg-canvas border border-hairline rounded-[20px] p-5 sm:p-6 shadow-sm w-full mb-8">
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-8 items-start">
        {/* Left column: Score breakdown (Google Style) */}
        <div className="flex flex-col gap-4 border-b md:border-b-0 md:border-r border-hairline-soft pb-5 md:pb-0 md:pr-6 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-ink">User Ratings</h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-ink">{averageRating}</span>
              <span className="text-xs text-muted">out of 5</span>
            </div>
            <div className="flex gap-0.5 text-rausch mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < Math.round(averageRating) ? "text-rausch" : "text-muted-soft opacity-20"}>
                  <StarIcon size={12} />
                </span>
              ))}
            </div>
            <p className="text-[11px] text-muted mt-1">{totalReviewsCount} resident reviews</p>
          </div>

          {/* Vertical Distribution Bars */}
          <div className="space-y-1.5 mt-2">
            {[5, 4, 3, 2, 1].map((stars, i) => {
              const count = ratingCounts[i];
              const percentage = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-2 text-muted font-semibold">{stars}</span>
                  <div className="flex-1 h-2 bg-surface-soft border border-hairline-soft rounded-full overflow-hidden">
                    <div className="h-full bg-rausch rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="w-6 text-right text-muted text-[10px] font-medium">{count}</span>
                </div>
              );
            })}
          </div>

          {!showWriteForm && (
            <button
              type="button"
              onClick={() => setShowWriteForm(true)}
              className="w-full mt-4 py-2 text-xs font-bold text-white bg-rausch rounded-[8px] hover:bg-rausch-active transition-all text-center"
            >
              Write Review
            </button>
          )}
        </div>

        {/* Right column: Reviews feed */}
        <div className="min-w-0">
          {/* Write Form */}
          {showWriteForm && (
            <form onSubmit={handleFormSubmit} className="mb-5 p-4 bg-surface-soft border border-hairline-soft rounded-[12px] transition-all">
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
                <div className="text-center py-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 mb-1 font-bold">✓</span>
                  <p className="text-xs font-bold text-ink">Review Submitted!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider block mb-1">Your Rating</label>
                    <div className="flex gap-1 text-rausch">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="hover:scale-110 active:scale-95 transition-transform"
                        >
                          <span className={star <= newRating ? "text-rausch" : "text-muted-soft opacity-40"}>
                            <StarIcon size={16} />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="reviewer-name" className="text-[9px] text-muted font-bold uppercase tracking-wider block mb-1">Name</label>
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
                    <label htmlFor="reviewer-text" className="text-[9px] text-muted font-bold uppercase tracking-wider block mb-1">Review Comments</label>
                    <textarea
                      id="reviewer-text"
                      rows={2}
                      placeholder="Share details about cleanliness, host, location, or wifi speed..."
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      className="w-full text-xs bg-canvas border border-hairline rounded-[8px] px-3 py-2 focus:outline-none focus:border-rausch text-ink resize-none placeholder-muted-soft"
                    />
                  </div>

                  {formError && (
                    <p className="text-[10px] text-error font-medium">{formError}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2 bg-rausch hover:bg-rausch-active text-white text-xs font-bold rounded-[8px] transition-all"
                  >
                    Submit Review
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Clean Vertical Reviews List */}
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {reviewsList.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">No reviews yet. Be the first to write one!</p>
            ) : (
              reviewsList.map((r) => (
                <div
                  key={r.id}
                  className="bg-canvas border border-hairline rounded-xl p-3.5 transition-all hover:border-rausch/10"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-7.5 h-7.5 rounded-full border flex items-center justify-center text-[10px] font-extrabold shrink-0 ${getAvatarBg(r.name)}`}>
                      {r.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-ink leading-tight flex items-center gap-1">
                        {r.name}
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Verified stay" />
                      </p>
                      <p className="text-[9px] text-muted mt-0.5">{r.date}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5 text-rausch shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < r.rating ? "text-rausch" : "text-muted-soft opacity-20"}>
                          <StarIcon size={8} />
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-body leading-relaxed mb-3">{r.text}</p>

                  <div className="flex items-center justify-between border-t border-hairline-soft pt-2 text-[9px]">
                    <button
                      type="button"
                      onClick={() => handleHelpfulClick(r.id)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                        votedReviews[r.id]
                          ? "bg-rausch/10 text-rausch font-bold"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      Helpful {r.helpfulCount > 0 ? `(${r.helpfulCount})` : ""}
                    </button>
                    <span className="text-[9px] text-muted-soft bg-surface-soft px-1.5 py-0.5 rounded font-semibold">
                      Verified Resident
                    </span>
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
        setListing(null);
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

  const category = listing ? getCategory(listing.category) : null;
  const facts = listing ? buildFacts(listing) : [];
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
        {nearbyPlaces.map((p) => {
          const distance = p.name === "Metro Station" && listing?.metroDistance
            ? listing.metroDistance.replace(/\s*from\s+metro/i, "")
            : p.dist;
          return (
            <div key={p.name} className="flex items-center gap-3 py-2.5">
              <span className="text-base shrink-0">{p.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-ink truncate">{p.name}</p>
                <p className="text-[10px] text-muted">{p.type}</p>
              </div>
              <span className="text-xs text-muted shrink-0">{distance}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const galleryImages = useMemo(() => {
    // Only the photos actually uploaded for this listing — never stock/category images.
    const uploaded: string[] = (listing?.images ?? []).filter(Boolean);
    if (uploaded.length > 0) return uploaded.slice(0, 5);
    if (listing?.image) return [listing.image];
    return [];
  }, [listing]);

  if (loading) {
    return (
      <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Explore", href: "/explore" }, { label: "Loading..." }]}>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rausch"></div>
          <p className="mt-4 text-muted text-sm font-semibold">Loading listing details...</p>
        </div>
      </PageLayout>
    );
  }

  if (!listing) {
    return (
      <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Explore", href: "/explore" }, { label: "Not Found" }]}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-bold text-ink text-center">Property Not Found</h2>
          <p className="mt-2 text-muted text-sm max-w-xs text-center">The property listing you are trying to view does not exist or has been deleted.</p>
          <button onClick={() => router.push("/explore")} className="mt-6 bg-rausch hover:bg-rausch/90 text-white font-semibold text-xs px-6 py-2.5 rounded-full shadow-sm transition-all">
            Back to Explore
          </button>
        </div>
      </PageLayout>
    );
  }

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
        category={listing.category}
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

          {/* Room Configuration & Availability Section */}
          {listing.roomConfigurations && listing.roomConfigurations.length > 0 && (
            <section className="mb-6 pb-6 border-b border-hairline-soft animate-fade-up">
              <h2 className="text-[17px] font-extrabold text-ink mb-4">Room Configuration & Availability</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listing.roomConfigurations.map((rc: any) => {
                  const isFull = rc.availableBeds <= 0;
                  const isLimited = rc.availableBeds > 0 && rc.availableBeds <= 2;
                  const typeLabel = rc.sharingType.charAt(0).toUpperCase() + rc.sharingType.slice(1) + " Sharing";
                  return (
                    <div
                      key={rc.id}
                      className="bg-canvas border border-hairline-soft rounded-[14px] p-4 shadow-sm flex flex-col justify-between hover:shadow-airbnb hover:border-rausch/15 transition-all duration-300"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg">🛏️</span>
                            <span className="font-extrabold text-sm text-ink">{typeLabel}</span>
                          </div>
                          <span
                            className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              isFull
                                ? "bg-neutral-100 text-neutral-500"
                                : isLimited
                                ? "bg-amber-100 text-amber-600"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            }`}
                          >
                            {isFull ? "Full" : isLimited ? "Limited" : "Available"}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-muted mb-4">
                          <p className="flex justify-between">
                            <span>Total Rooms:</span>
                            <span className="font-bold text-ink">{rc.numberOfRooms}</span>
                          </p>
                          <p className="flex justify-between">
                            <span>Total Beds:</span>
                            <span className="font-bold text-ink">{rc.totalBeds} ({rc.bedsPerRoom} beds/room)</span>
                          </p>
                          <p className="flex justify-between">
                            <span>Occupied Beds:</span>
                            <span className="font-semibold text-ink">{rc.occupiedBeds}</span>
                          </p>
                          <p className="flex justify-between border-t border-hairline-soft pt-1.5">
                            <span>Available Beds:</span>
                            <span className={`font-extrabold ${isFull ? "text-neutral-400" : "text-emerald-600"}`}>
                              {isFull ? "None" : rc.availableBeds}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-hairline-soft pt-3 mt-auto flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1.5">
                        <div>
                          <p className="text-[9px] font-bold text-muted uppercase tracking-wide">Price per bed</p>
                          <p className="text-[16px] font-black text-rausch font-sans">₹{rc.pricePerBed.toLocaleString("en-IN")}<span className="text-[10px] font-normal text-muted">/mo</span></p>
                        </div>
                        {rc.pricePerRoom && (
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-muted uppercase tracking-wide">Full Room Price</p>
                            <p className="text-xs font-bold text-ink font-sans">₹{rc.pricePerRoom.toLocaleString("en-IN")}<span className="text-[9px] font-normal text-muted">/mo</span></p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* About the property Description section */}
          <section className="mb-6 pb-6 border-b border-hairline-soft">
            <h2 className="text-[17px] font-bold text-ink mb-3">About this property</h2>
            <p className="text-xs text-body leading-relaxed font-medium">
              {listing.description || listing.details?.description || (
                `Welcome to ${listing.title}, a premier ${category?.label.toLowerCase() ?? "property"} situated in the vibrant neighborhood of ${listing.location.split(",")[0]}. This space offers excellent layout efficiency with a ${listing.furnishing?.toLowerCase() ?? "semi-furnished"} interior structure. Designed for modern living and convenience, the property features top-tier utility standards, prompt maintenance responses, and direct access to essential services. Ideal for occupants looking for a reliable, well-connected, and premium residence.`
              )}
            </p>
          </section>

          {/* Amenities — from this listing, grouped professionally */}
          <section className="mb-6 pb-6 border-b border-hairline-soft">
            <h2 className="text-[17px] font-bold text-ink mb-4">Amenities & Facilities</h2>
            <div className="space-y-5">
              {[
                {
                  group: "Services & Comfort",
                  items: listing.amenities.filter((a: string) =>
                    ["Wi-Fi", "AC", "Power backup", "Lift", "Hot water"].includes(a)
                  ),
                },
                {
                  group: "Food & Lifestyle",
                  items: listing.amenities.filter((a: string) =>
                    ["Meals", "Cafeteria", "Gym", "Pool", "Clubhouse"].includes(a)
                  ),
                },
                {
                  group: "Safety & Conveniences",
                  items: listing.amenities.filter((a: string) =>
                    ["Security", "Parking", "Laundry", "24/7 access", "Gated", "Highway access", "Main road", "Corner plot"].includes(a)
                  ),
                },
                {
                  group: "Other Features",
                  items: listing.amenities.filter((a: string) =>
                    !["Wi-Fi", "AC", "Power backup", "Lift", "Hot water", "Meals", "Cafeteria", "Gym", "Pool", "Clubhouse", "Security", "Parking", "Laundry", "24/7 access", "Gated", "Highway access", "Main road", "Corner plot"].includes(a)
                  ),
                },
              ]
                .filter((cat) => cat.items.length > 0)
                .map((cat) => (
                  <div key={cat.group}>
                    <h3 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2.5">
                      {cat.group}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {cat.items.map((a: string) => {
                        const IconComponent = amenityLucideIcons[a] || HelpCircle;
                        return (
                          <div
                            key={a}
                            className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-md border border-neutral-200/60 rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:border-neutral-400 hover:bg-white/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-default"
                          >
                            <div className="w-8 h-8 rounded-[10px] bg-neutral-100/55 border border-neutral-200/30 flex items-center justify-center text-neutral-700 group-hover:text-rausch group-hover:bg-rausch/10 group-hover:border-rausch/20 transition-all shrink-0">
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="text-[12.5px] font-bold text-neutral-800 group-hover:text-neutral-950 transition-colors truncate">
                              {a}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* Room types & pricing — visible for lodging-style listings and any explicit room type data */}
          {(!["pg", "coliving"].includes(listing.category) && (["homestay", "service-apartment", "hotel"].includes(listing.category) || (listing.roomTypes?.length ?? 0) > 0)) && (
            <div className="mb-6">
              <RoomTypesPricing roomTypes={listing.roomTypes} />
            </div>
          )}

          {/* Reviews & Ratings */}
          <ReviewsSection reviewsList={reviewsList} setReviewsList={setReviewsList} />

          {/* Location Map Section */}
          <section className="mb-8 pt-6 border-t border-neutral-200/60">
            <h3 className="text-[17px] font-bold text-neutral-900 mb-1">Where you&apos;ll be</h3>
            <p className="text-xs text-neutral-500 font-medium mb-4">{listing.location}</p>
            <div className="w-full h-[280px] sm:h-[350px] rounded-[20px] overflow-hidden border border-neutral-200 shadow-inner">
              <ListingsMap listings={[listing]} />
            </div>
            <p className="text-xs text-neutral-500 mt-3 font-normal leading-relaxed">
              Find local highlights, public transit links, and commute times directly in the map area. exact neighborhood boundaries and navigation details are available upon confirmation.
            </p>
          </section>

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
          <p className="text-[10px] text-muted truncate">{category?.label ?? "Listing"}</p>
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
