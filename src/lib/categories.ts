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
  flatmate: {
    slug: "flatmate",
    world: "residential",
    label: "Flatmate",
    subtitle: "Find someone to share with",
    gradient: "from-[#ff5f6d] to-[#ffc371]",
    glyph: "people",
    chips: ["Male", "Female", "Working professional", "Student", "Vegetarian", "Non-smoker", "Pet-friendly"],
    searchPlaceholder: "Area you want to live in…",
    resultNoun: "flatmates",
    headline: "Flatmates looking to share in {city}",
    image: "/categories/flatmate.jpg",
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

export const RESIDENTIAL_ORDER = ["rent", "buy", "pg", "coliving", "flatmate"];
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
  id: number;
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
  roomTypes?: any[];
}

export const LISTINGS: Listing[] = [
  // --- Residential: rent ---
  { id: 1, category: "rent", title: "Lakeside 1BHK Rental Flat", location: "Indiranagar, Bengaluru", metroDistance: "300m from metro", price: "₹18,500/mo", priceValue: 18500, rating: 4.3, reviewCount: 56, badge: "Flat", amenities: ["AC", "Parking", "Security"], noBrokerage: true, furnishing: "Furnished", availableFrom: "Available now", area: "650 sq ft", spec: "1 BHK" },
  { id: 2, category: "rent", title: "Urban Nest 2BHK", location: "Whitefield, Bengaluru", price: "₹22,000/mo", priceValue: 22000, rating: 4.4, reviewCount: 42, badge: "Flat", amenities: ["AC", "Parking", "Power backup"], furnishing: "Semi-furnished", area: "1,050 sq ft", spec: "2 BHK" },
  { id: 3, category: "rent", title: "Skyline 3BHK with Balcony", location: "HSR Layout, Bengaluru", metroDistance: "1.2km from metro", price: "₹34,000/mo", priceValue: 34000, rating: 4.6, reviewCount: 38, badge: "Flat", amenities: ["AC", "Gym", "Parking"], verified: true, furnishing: "Furnished", area: "1,480 sq ft", spec: "3 BHK" },

  // --- Residential: buy ---
  { id: 4, category: "buy", title: "Prestige Lakeview 2BHK", location: "Marathahalli, Bengaluru", price: "₹1.15 Cr", priceValue: 11500000, rating: 4.5, reviewCount: 22, badge: "Apartment", amenities: ["Clubhouse", "Pool", "Parking"], verified: true, availableFrom: "Ready to move", area: "1,180 sq ft", spec: "2 BHK · Resale" },
  { id: 5, category: "buy", title: "Brigade New Project 3BHK", location: "Sarjapur Road, Bengaluru", price: "₹1.85 Cr", priceValue: 18500000, rating: 4.7, reviewCount: 14, badge: "New project", amenities: ["Clubhouse", "Pool", "Gym"], verified: true, noBrokerage: true, availableFrom: "Dec 2027", area: "1,650 sq ft", spec: "3 BHK · RERA approved" },

  // --- Residential: pg ---
  { id: 6, category: "pg", title: "Green Meadows PG for Men", location: "Koramangala, Bengaluru", metroDistance: "500m from metro", price: "₹8,500/mo", priceValue: 8500, rating: 4.5, reviewCount: 128, badge: "PG", amenities: ["AC", "Meals", "Wi-Fi"], verified: true, noBrokerage: true, spec: "Triple sharing · Men" },
  { id: 7, category: "pg", title: "StudyNest Girls Hostel", location: "BTM Layout, Bengaluru", metroDistance: "800m from metro", price: "₹6,200/mo", priceValue: 6200, rating: 4.6, reviewCount: 204, badge: "Hostel", amenities: ["Meals", "Wi-Fi", "Laundry"], verified: true, noBrokerage: true, spec: "Double sharing · Women" },
  { id: 8, category: "pg", title: "TechPark PG – Triple Sharing", location: "Electronic City, Bengaluru", metroDistance: "1km from metro", price: "₹5,800/mo", priceValue: 5800, rating: 4.2, reviewCount: 176, badge: "PG", amenities: ["Meals", "Wi-Fi", "Laundry"], noBrokerage: true, spec: "Triple sharing · Men" },

  // --- Residential: coliving ---
  { id: 9, category: "coliving", title: "Sunrise Co-living Space", location: "HSR Layout, Bengaluru", metroDistance: "1.2km from metro", price: "₹12,000/mo", priceValue: 12000, rating: 4.7, reviewCount: 89, badge: "Co-living", amenities: ["AC", "Wi-Fi", "Gym"], verified: true, furnishing: "Furnished", spec: "Single room · All-inclusive" },
  { id: 10, category: "coliving", title: "Elite Co-living Studio", location: "Marathahalli, Bengaluru", price: "₹14,500/mo", priceValue: 14500, rating: 4.6, reviewCount: 63, badge: "Co-living", amenities: ["AC", "Gym", "Wi-Fi"], verified: true, furnishing: "Furnished", spec: "Studio · Community" },

  // --- Residential: homestay ---
  { id: 11, category: "homestay", title: "Cozy Homestay near MG Road", location: "MG Road, Bengaluru", metroDistance: "200m from metro", price: "₹15,000/mo", priceValue: 15000, rating: 4.8, reviewCount: 31, badge: "Homestay", amenities: ["AC", "Wi-Fi", "Meals"], verified: true, noBrokerage: true, spec: "Private room" },

  // --- Residential: flatmate ---
  { id: 12, category: "flatmate", title: "Flatmate wanted – 2BHK Indiranagar", location: "Indiranagar, Bengaluru", price: "₹11,000/mo", priceValue: 11000, rating: 4.4, reviewCount: 18, badge: "Flatmate", amenities: ["Wi-Fi", "Furnished", "Parking"], noBrokerage: true, spec: "Working professional · Non-smoker" },

  // --- Commercial: office ---
  { id: 13, category: "commercial-office", title: "Grade-A Office, Embassy Tech", location: "Outer Ring Road, Bengaluru", price: "₹1.2L/mo", priceValue: 120000, rating: 4.6, reviewCount: 12, badge: "Office", amenities: ["Furnished", "Parking", "Power backup"], verified: true, area: "3,200 sq ft", spec: "Furnished · 45 seats" },
  { id: 14, category: "commercial-office", title: "Bare-Shell Office Floor", location: "Whitefield, Bengaluru", price: "₹85,000/mo", priceValue: 85000, rating: 4.3, reviewCount: 8, badge: "Office", amenities: ["Parking", "Power backup", "Lift"], noBrokerage: true, area: "2,400 sq ft", spec: "Bare shell · 6th floor" },

  // --- Commercial: shop ---
  { id: 15, category: "commercial-shop", title: "High-Street Showroom", location: "Jayanagar 4th Block, Bengaluru", price: "₹95,000/mo", priceValue: 95000, rating: 4.5, reviewCount: 9, badge: "Showroom", amenities: ["Washroom", "Parking", "Main road"], verified: true, area: "1,800 sq ft", spec: "Ground floor · High street" },

  // --- Commercial: coworking ---
  { id: 16, category: "coworking", title: "WeNest Co-working – Dedicated Desk", location: "Koramangala, Bengaluru", metroDistance: "600m from metro", price: "₹9,500/mo", priceValue: 9500, rating: 4.7, reviewCount: 54, badge: "Co-working", amenities: ["24/7 access", "Meeting rooms", "Cafeteria"], verified: true, spec: "Dedicated desk" },

  // --- Commercial: warehouse ---
  { id: 17, category: "warehouse", title: "Logistics Warehouse, Hoskote", location: "Hoskote, Bengaluru", price: "₹2.4L/mo", priceValue: 240000, rating: 4.2, reviewCount: 5, badge: "Warehouse", amenities: ["Loading dock", "High ceiling", "Highway access"], noBrokerage: true, area: "18,000 sq ft", spec: "Loading dock · 24ft ceiling" },

  // --- Commercial: land ---
  { id: 18, category: "land", title: "Corner Commercial Plot", location: "Devanahalli, Bengaluru", price: "₹3.2 Cr", priceValue: 32000000, rating: 4.4, reviewCount: 3, badge: "Plot", amenities: ["Corner plot", "Main road", "Gated"], verified: true, area: "6,000 sq ft", spec: "Corner · Clear title" },

  // --- Commercial: lease ---
  { id: 19, category: "lease", title: "Pre-Leased Bank Branch", location: "MG Road, Bengaluru", price: "₹6.5 Cr", priceValue: 65000000, rating: 4.6, reviewCount: 4, badge: "Pre-leased", amenities: ["Bank tenant", "Long lease", "High yield"], verified: true, area: "4,500 sq ft", spec: "Bank tenant · 9yr lease" },

  // --- Stay: resort ---
  { id: 20, category: "resort", title: "Misty Hills Resort & Spa", location: "Nandi Hills, Bengaluru", price: "₹6,500/night", priceValue: 6500, rating: 4.7, reviewCount: 212, badge: "Resort", amenities: ["Pool", "Spa", "Restaurant"], verified: true, spec: "Hill resort · Breakfast included" },
  { id: 21, category: "resort", title: "Lakeside Leisure Resort", location: "Hesaraghatta, Bengaluru", price: "₹4,200/night", priceValue: 4200, rating: 4.4, reviewCount: 98, badge: "Resort", amenities: ["Pool", "Restaurant", "Parking"], spec: "Lakefront · Family-friendly" },

  // --- Stay: service-apartment ---
  { id: 22, category: "service-apartment", title: "Skyline Serviced Studio", location: "Indiranagar, Bengaluru", metroDistance: "400m from metro", price: "₹3,200/night", priceValue: 3200, rating: 4.6, reviewCount: 74, badge: "Serviced", amenities: ["Wi-Fi", "Housekeeping", "Kitchen"], verified: true, area: "520 sq ft", spec: "Studio · Daily housekeeping" },
  { id: 23, category: "service-apartment", title: "Executive 2BHK Service Apartment", location: "Whitefield, Bengaluru", price: "₹5,800/night", priceValue: 5800, rating: 4.5, reviewCount: 51, badge: "Serviced", amenities: ["Wi-Fi", "Kitchen", "Gym"], area: "1,100 sq ft", spec: "2 BHK · Long stay" },

  // --- Stay: hotel ---
  { id: 24, category: "hotel", title: "The Grand Central Hotel", location: "MG Road, Bengaluru", metroDistance: "200m from metro", price: "₹4,900/night", priceValue: 4900, rating: 4.6, reviewCount: 1340, badge: "Hotel", amenities: ["Breakfast", "Pool", "Gym"], verified: true, spec: "4 star · Business" },
  { id: 25, category: "hotel", title: "Cozy Stay Budget Hotel", location: "Majestic, Bengaluru", price: "₹1,800/night", priceValue: 1800, rating: 4.1, reviewCount: 560, badge: "Hotel", amenities: ["Wi-Fi", "Breakfast", "Parking"], spec: "Budget · Free Wi-Fi" },
];

export function listingsForCategory(slug: string): Listing[] {
  return LISTINGS.filter((l) => l.category === slug);
}

/** Pull the count of live listings for a category (for tile chips). */
export function categoryCount(slug: string): number {
  return listingsForCategory(slug).length;
}
