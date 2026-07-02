"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "../components/SearchBar";
import ListingCard from "../components/ListingCard";
import PageLayout from "../components/PageLayout";
import {
  World,
  CategoryDef,
  categoriesForWorld,
  categoryCount,
  getCategory,
  LISTINGS,
} from "../lib/categories";

// Trust proof-points — mirrors the home page strip so Explore feels of-a-piece.
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
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
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

// A small set of cross-category listings to surface as "Popular near you".
const popularIds = [6, 9, 1, 13, 16, 11];
const popular = popularIds
  .map((id) => LISTINGS.find((l) => l.id === id))
  .filter((l): l is (typeof LISTINGS)[number] => Boolean(l));

const WORLDS: { value: World; label: string }[] = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "stay", label: "Stays" },
];



function CategoryTile({ cat }: { cat: CategoryDef }) {
  const count = categoryCount(cat.slug);
  const [imgLoaded, setImgLoaded] = useState(false);
  return (
    <Link
      href={`/c/${cat.slug}`}
      className="group relative block w-full aspect-[4/3] rounded-[14px] overflow-hidden hover-lift hover:shadow-airbnb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
      aria-label={`${cat.label} — ${count} ${cat.resultNoun}`}
    >
      {/* Background Image */}
      {cat.image ? (
        <>
          {!imgLoaded && <div className="absolute inset-0 skeleton" aria-hidden="true" />}
          <Image
            src={cat.image}
            alt={cat.label}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover photo-enhance transition-transform duration-500 ease-out group-hover:scale-105"
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient}`} />
      )}

      {/* Dark gradient scrim for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      {/* Content overlayed on the bottom */}
      <div className="absolute inset-x-0 bottom-0 p-3.5 flex flex-col justify-end text-left">
        <h3 className="text-sm font-semibold text-white tracking-tight leading-tight group-hover:underline">
          {cat.label}
        </h3>
        <p className="text-[10px] text-white/75 mt-0.5 line-clamp-1 leading-normal">
          {cat.subtitle}
        </p>
        <div className="mt-2 flex">
          <span className="inline-block bg-white/20 backdrop-blur-[2px] text-white text-[9px] font-semibold px-2 py-0.5 rounded-full border border-white/10 shadow-airbnb">
            {count} {cat.resultNoun}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ExplorePage() {
  const [world, setWorld] = useState<World>("residential");
  const tiles = categoriesForWorld(world);

  return (
    <PageLayout>
      {/* Hero search band */}
      <section className="relative overflow-hidden bg-gradient-to-br from-surface-soft via-violet/10 to-violet/25 -mx-4 md:-mx-6 lg:-mx-10 px-4 md:px-6 lg:px-10 pt-8 md:pt-12 pb-8 md:pb-10 mb-7 rounded-b-[32px] md:rounded-b-none">
        {/* Decorative themed background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-violet/25 blur-3xl" />
          <div className="absolute -bottom-28 -right-20 w-80 h-80 rounded-full bg-indigo/20 blur-3xl" />
          <div className="absolute top-10 left-1/4 w-20 h-20 rounded-[20px] rotate-12 bg-violet/15" />
          <div className="absolute bottom-8 right-1/4 w-14 h-14 rounded-full border border-violet/30" />
        </div>
        <div className="relative z-10 max-w-[900px] mx-auto text-center mb-6">
          <h1 className="text-[clamp(28px,4.5vw,44px)] font-bold text-ink tracking-tight leading-[1.08] mb-3">
            Explore homes & spaces near you
          </h1>
          <p className="text-base text-body max-w-[560px] mx-auto">
            Pick what you&apos;re looking for — rentals, PGs, offices and more.
            Verified listings, zero brokerage, jobs and commute built in.
          </p>
        </div>
        <div className="relative z-10 max-w-[820px] mx-auto">
          <SearchBar />
        </div>
      </section>

      {/* Residential | Commercial | Stays segmented toggle */}
      <div className="flex justify-center mb-6">
        <div
          role="group"
          aria-label="Choose property world"
          className="inline-flex items-center gap-1 bg-surface-soft border border-hairline-soft rounded-full p-1"
        >
          {WORLDS.map((w) => {
            const active = world === w.value;
            return (
              <button
                key={w.value}
                type="button"
                onClick={() => setWorld(w.value)}
                aria-pressed={active}
                className={`px-4 sm:px-5 md:px-6 py-2 text-sm font-semibold rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
                  active ? "bg-ink text-white" : "text-muted hover:text-ink"
                }`}
              >
                {w.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category tiles — re-keyed on world so the grid re-animates on toggle */}
      <section aria-label={`${world} categories`} className="mb-12">
        <div
          key={world}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-fade-up"
        >
          {tiles.map((cat) => (
            <CategoryTile key={cat.slug} cat={cat} />
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section aria-label="Why renters trust FindWay" className="mb-12">
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

      {/* Popular near you — horizontal ListingCard rail */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[22px] md:text-[26px] font-bold tracking-tight text-ink">Popular near you</h2>
          <Link href="/c/rent" className="text-sm text-ink font-medium underline underline-offset-2">
            See all
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide">
          {popular.map((listing) => (
            <div key={listing.id} className="min-w-[260px] md:min-w-0">
              <ListingCard {...listing} image={getCategory(listing.category)?.image} />
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
