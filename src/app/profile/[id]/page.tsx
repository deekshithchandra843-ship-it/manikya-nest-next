"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import ListingCard from "@/components/ListingCard";
import { apiClient } from "@/lib/apiClient";

interface PublicUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  avatarUrl: string | null;
  roles: string[];
  createdAt: string;
}

export default function PublicProfile() {
  const { id } = useParams() as { id: string };
  const [user, setUser] = useState<PublicUser | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    // Fetch public user profile
    apiClient
      .get(`/users/${id}`)
      .then((res) => {
        if (res.data?.success) {
          setUser(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user details:", err);
      });

    // Fetch user's active listings
    apiClient
      .get(`/listings?ownerId=${id}`)
      .then((res) => {
        if (res.data?.success) {
          setListings(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user listings:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-[1080px] mx-auto py-10 px-4" aria-busy="true">
          <div className="flex flex-col md:flex-row gap-8 items-start animate-pulse">
            <div className="w-full md:w-1/3 bg-surface-soft border border-hairline rounded-2xl p-6 h-80" />
            <div className="flex-1 w-full space-y-4">
              <div className="h-6 bg-surface-strong rounded w-1/4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-48 bg-surface-strong rounded-xl" />
                <div className="h-48 bg-surface-strong rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <div className="max-w-[1080px] mx-auto py-16 px-4 text-center">
          <span className="text-4xl">👤</span>
          <h1 className="text-xl font-bold text-ink mt-4">Profile Not Found</h1>
          <p className="text-sm text-body mt-1">The requested user profile does not exist or has been disabled.</p>
        </div>
      </PageLayout>
    );
  }

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <PageLayout>
      <div className="max-w-[1080px] mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left panel: Profile Card */}
          <div className="w-full md:w-1/3 bg-canvas border border-hairline rounded-2xl p-6 shadow-airbnb flex flex-col items-center text-center">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || "User profile"}
                className="w-24 h-24 rounded-full object-cover border-2 border-hairline mb-4 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-rausch/10 flex items-center justify-center text-2xl font-bold text-rausch mb-4 border-2 border-rausch/20 shadow-inner">
                {initials}
              </div>
            )}
            
            <h1 className="text-xl font-extrabold text-ink tracking-tight flex items-center gap-1.5 justify-center">
              {user.name || "Anonymous Member"}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-rausch shrink-0" aria-label="Verified member">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </h1>
            <p className="text-xs text-muted mt-0.5">Joined in {joinDate}</p>

            {/* Roles Badges */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-4 w-full">
              {user.roles.map((r) => {
                const isOwner = r.toLowerCase() === "owner";
                const isBuilder = r.toLowerCase() === "builder";
                const isAgent = r.toLowerCase() === "agent";
                const badgeStyle = isOwner
                  ? "bg-rausch/10 border-rausch/20 text-rausch"
                  : isBuilder
                  ? "bg-indigo/10 border-indigo/20 text-indigo"
                  : isAgent
                  ? "bg-emerald-600/10 border-emerald-600/20 text-emerald-700"
                  : "bg-surface-soft border-hairline text-body";

                return (
                  <span
                    key={r}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${badgeStyle}`}
                  >
                    {r}
                  </span>
                );
              })}
            </div>

            <div className="w-full border-t border-hairline-soft mt-6 pt-5 space-y-3.5 text-left">
              <div className="flex items-center gap-2.5 text-xs text-ink">
                <span className="text-muted">📍</span>
                <div>
                  <p className="font-bold">Location</p>
                  <p className="text-body">{user.city || "Bengaluru"}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2.5 text-xs text-ink">
                  <span className="text-muted">📞</span>
                  <div>
                    <p className="font-bold">Phone</p>
                    <p className="text-body">{user.phone}</p>
                  </div>
                </div>
              )}
              {user.email && (
                <div className="flex items-center gap-2.5 text-xs text-ink">
                  <span className="text-muted">✉️</span>
                  <div>
                    <p className="font-bold">Email</p>
                    <p className="text-body truncate max-w-[200px]">{user.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Active listings */}
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-ink tracking-tight">
                Active Listings ({listings.length})
              </h2>
            </div>

            {listings.length === 0 ? (
              <div className="bg-canvas border border-hairline rounded-2xl p-10 text-center text-muted">
                <span className="text-3xl block mb-2">🏘️</span>
                <p className="text-sm font-semibold text-ink">No properties listed yet</p>
                <p className="text-xs text-muted mt-0.5">This member hasn&apos;t published any live listings on findway.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {listings.map((l) => (
                  <ListingCard
                    key={l.id}
                    id={l.id}
                    title={l.title}
                    location={l.location}
                    price={l.price}
                    image={l.image}
                    badge={l.badge}
                    rating={l.rating}
                    metroDistance={l.metroDistance}
                    reviewCount={l.reviewCount}
                    amenities={l.amenities}
                    verified={l.verified}
                    furnishing={l.furnishing}
                    availableFrom={l.availableFrom}
                    area={l.area}
                    spec={l.spec}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
