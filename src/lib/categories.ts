// Single source of truth for the property-discovery experience.
// Adding a new intent = one entry in CATEGORIES + (optionally) listings below.
// Structured so a Supabase fetch can later replace the in-file arrays without
// touching any JSX.

export type World = "residential" | "commercial" | "stay";

export interface CategoryDef {
  slug: string;
  world: World;
  label: string;
  subtitle: string;
  /** Tailwind gradient classes used as the tile background until real photos exist. */
  gradient: string;
  /** "house" | "building" | "shop" | "store" | "land" — picks an inline SVG. */
  glyph: "house" | "building" | "shop" | "store" | "land" | "people";
  /** Intent-specific quick-filter chips shown in the sticky filter bar. */
  chips: string[];
  /** Placeholder for the "Where" search input on the category page. */
  searchPlaceholder: string;
  /** Plural noun for the result count, e.g. "homes", "offices". */
  resultNoun: string;
  /** Headline template; {city} is replaced at render time. */
  headline: string;
  /** Representative photo for this category, served from /public. */
  image: string;
}

export const CATEGORIES: Record<string, CategoryDef> = {
  rent: {
    slug: "rent",
    world: "residential",
    label: "Rent",
    subtitle: "Flats & houses on rent",
    gradient: "from-rausch/80 to-rausch-active",
    glyph: "house",
    chips: ["1 BHK", "2 BHK", "3 BHK", "Furnished", "Semi-furnished", "Family", "Bachelors", "Pet-friendly", "Near metro"],
    searchPlaceholder: "City, locality or landmark…",
    resultNoun: "homes",
    headline: "Flats & houses for rent in {city}",
    image: "/categories/rent.jpg",
  },
  buy: {
    slug: "buy",
    world: "residential",
    label: "Buy",
    subtitle: "New & resale homes",
    gradient: "from-[#2B5876] to-[#4E4376]",
    glyph: "house",
    chips: ["1 BHK", "2 BHK", "3 BHK", "Ready to move", "Under construction", "New project", "Resale", "RERA approved"],
    searchPlaceholder: "City, locality or project…",
    resultNoun: "properties",
    headline: "Homes for sale in {city}",
    image: "/categories/buy.jpg",
  },
  pg: {
    slug: "pg",
    world: "residential",
    label: "PG / Hostel",
    subtitle: "Paying guest & hostels",
    gradient: "from-[#11998e] to-[#38ef7d]",
    glyph: "people",
    chips: ["For men", "For women", "Single", "Double", "Triple", "Meals", "Wi-Fi", "AC", "No curfew"],
    searchPlaceholder: "Area, college or company…",
    resultNoun: "PGs",
    headline: "PG & hostels in {city}",
    image: "/categories/pg.jpg",
  },
  coliving: {
    slug: "coliving",
    world: "residential",
    label: "Co-living",
    subtitle: "Managed, all-inclusive",
    gradient: "from-[#8E2DE2] to-[#4A00E0]",
    glyph: "people",
    chips: ["Furnished", "All-inclusive", "Community", "Single room", "Twin sharing", "Short stay", "Gym"],
    searchPlaceholder: "Area or neighbourhood…",
    resultNoun: "spaces",
    headline: "Co-living spaces in {city}",
    image: "/categories/coliving.jpg",
  },
  homestay: {
    slug: "homestay",
    world: "stay",
    label: "Homestay",
    subtitle: "Cosy homestays & B&Bs",
    gradient: "from-[#f7971e] to-[#ffd200]",
    glyph: "house",
    chips: ["Entire place", "Private room", "Meals", "Wi-Fi", "Pet-friendly", "Monthly"],
    searchPlaceholder: "City or locality…",
    resultNoun: "stays",
    headline: "Homestays in {city}",
    image: "/categories/homestay.jpg",
  },
  resort: {
    slug: "resort",
    world: "stay",
    label: "Resort",
    subtitle: "Getaway & leisure resorts",
    gradient: "from-[#0cebeb] to-[#20e3b2]",
    glyph: "house",
    chips: ["Beach", "Hill", "Pool", "Spa", "All-inclusive", "Family", "Pet-friendly"],
    searchPlaceholder: "Destination or resort…",
    resultNoun: "resorts",
    headline: "Resorts near {city}",
    image: "/categories/resort.jpg",
  },
  "service-apartment": {
    slug: "service-apartment",
    world: "stay",
    label: "Service apartment",
    subtitle: "Fully serviced stays",
    gradient: "from-[#3a7bd5] to-[#3a6073]",
    glyph: "building",
    chips: ["Studio", "1 BHK", "2 BHK", "Housekeeping", "Kitchen", "Long stay", "Wi-Fi"],
    searchPlaceholder: "Area or neighbourhood…",
    resultNoun: "apartments",
    headline: "Service apartments in {city}",
    image: "/categories/service-apartment.jpg",
  },
  hotel: {
    slug: "hotel",
    world: "stay",
    label: "Hotel",
    subtitle: "Budget to luxury hotels",
    gradient: "from-[#834d9b] to-[#d04ed6]",
    glyph: "building",
    chips: ["Budget", "3 star", "4 star", "5 star", "Breakfast", "Pool", "Business"],
    searchPlaceholder: "City, area or hotel…",
    resultNoun: "hotels",
    headline: "Hotels in {city}",
    image: "/categories/hotel.jpg",
  },

  "commercial-office": {
    slug: "commercial-office",
    world: "commercial",
    label: "Office space",
    subtitle: "Lease an office",
    gradient: "from-[#1F1C2C] to-[#928DAB]",
    glyph: "building",
    chips: ["< 1000 sq ft", "1000–5000 sq ft", "5000+ sq ft", "Furnished", "Bare shell", "Parking", "Power backup"],
    searchPlaceholder: "Business district or area…",
    resultNoun: "offices",
    headline: "Office spaces in {city}",
    image: "/categories/commercial-office.jpg",
  },
  "commercial-shop": {
    slug: "commercial-shop",
    world: "commercial",
    label: "Shop / Showroom",
    subtitle: "Retail & showroom space",
    gradient: "from-[#c94b4b] to-[#4b134f]",
    glyph: "shop",
    chips: ["High street", "Mall", "Ground floor", "Main road", "Washroom", "Parking"],
    searchPlaceholder: "Market or high-street area…",
    resultNoun: "shops",
    headline: "Shops & showrooms in {city}",
    image: "/categories/commercial-shop.jpg",
  },
  coworking: {
    slug: "coworking",
    world: "commercial",
    label: "Co-working",
    subtitle: "Desks & private cabins",
    gradient: "from-[#0F2027] to-[#2C5364]",
    glyph: "building",
    chips: ["Hot desk", "Dedicated desk", "Private cabin", "Meeting rooms", "24/7 access", "Cafeteria"],
    searchPlaceholder: "Area or tech park…",
    resultNoun: "spaces",
    headline: "Co-working spaces in {city}",
    image: "/categories/coworking.jpg",
  },
  warehouse: {
    slug: "warehouse",
    world: "commercial",
    label: "Warehouse",
    subtitle: "Godown & storage",
    gradient: "from-[#373B44] to-[#4286f4]",
    glyph: "store",
    chips: ["< 5000 sq ft", "5000–20000 sq ft", "20000+ sq ft", "Loading dock", "High ceiling", "Highway access"],
    searchPlaceholder: "Industrial area or highway…",
    resultNoun: "warehouses",
    headline: "Warehouses & godowns in {city}",
    image: "/categories/warehouse.jpg",
  },
  land: {
    slug: "land",
    world: "commercial",
    label: "Land / Plot",
    subtitle: "Commercial plots",
    gradient: "from-[#56ab2f] to-[#a8e063]",
    glyph: "land",
    chips: ["Corner plot", "Main road", "Gated", "RERA approved", "Clear title"],
    searchPlaceholder: "City or development zone…",
    resultNoun: "plots",
    headline: "Commercial land & plots in {city}",
    image: "/categories/land.jpg",
  },
  lease: {
    slug: "lease",
    world: "commercial",
    label: "Pre-leased",
    subtitle: "Income-generating assets",
    gradient: "from-[#834d9b] to-[#d04ed6]",
    glyph: "building",
    chips: ["Bank tenant", "MNC tenant", "Long lease", "High yield", "RERA approved"],
    searchPlaceholder: "City or micro-market…",
    resultNoun: "assets",
    headline: "Pre-leased properties in {city}",
    image: "/categories/lease.jpg",
  },
};

export const RESIDENTIAL_ORDER = ["rent", "buy", "pg", "coliving"];
export const COMMERCIAL_ORDER = ["commercial-office", "commercial-shop", "coworking", "warehouse", "land", "lease"];
export const STAY_ORDER = ["homestay", "resort", "service-apartment", "hotel"];

const ORDER_BY_WORLD: Record<World, string[]> = {
  residential: RESIDENTIAL_ORDER,
  commercial: COMMERCIAL_ORDER,
  stay: STAY_ORDER,
};

export function categoriesForWorld(world: World): CategoryDef[] {
  return ORDER_BY_WORLD[world].map((slug) => CATEGORIES[slug]);
}

export function getCategory(slug: string): CategoryDef | undefined {
  return CATEGORIES[slug];
}

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

export interface Listing {
  id: string | number;
  category: string; // CategoryDef.slug
  title: string;
  location: string;
  metroDistance?: string;
  price: string; // display string, e.g. "₹8,500/mo" or "₹1.2 Cr"
  priceValue: number; // numeric, for sort/filter (monthly rent or total price)
  rating: number;
  reviewCount: number;
  badge: string;
  amenities: string[];
  verified?: boolean;
  noBrokerage?: boolean;
  furnishing?: string;
  availableFrom?: string;
  /** Carpet/built-up area for residential BHK & all commercial. */
  area?: string;
  /** Secondary spec line tailored to the intent (e.g. "Triple sharing", "Bank tenant"). */
  spec?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  roomTypes?: any[];
  image?: string;
  /** All uploaded photos; `image` is just the cover (first entry). */
  images?: string[];
}

export const LISTINGS: Listing[] = [];

export function listingsForCategory(slug: string): Listing[] {
  return LISTINGS.filter((l) => l.category === slug);
}

/** Pull the count of live listings for a category (for tile chips). */
export function categoryCount(slug: string): number {
  return listingsForCategory(slug).length;
}
