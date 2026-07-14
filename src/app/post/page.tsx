"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import PageLayout from "@/components/PageLayout";
import PublishRoleModal, { type ListingRole } from "@/components/PublishRoleModal";
import { useSession } from "@/lib/useSession";
import { World, categoriesForWorld, getCategory } from "@/lib/categories";
import { apiClient } from "@/lib/apiClient";

const cities = ["Bengaluru", "Hyderabad", "Chennai", "Mumbai", "Pune", "Delhi NCR", "Kolkata"];

// Per-world colour theme — gives the page a distinct, colourful mood depending
// on what the user is listing. Threads through the hero band AND the form
// accents (progress bar, step nav, category chips, primary button).
type Theme = {
  band: string; blobA: string; blobB: string; // hero
  accent: string; chip: string;               // text accent + solid pill
  solid: string; ring: string; bar: string; soft: string; // form accents
  barGradient: string; headerTint: string;    // form card frame
};
const WORLD_THEME: Record<World, Theme> = {
  residential: {
    band: "from-rausch/15 via-violet/10 to-indigo/15", blobA: "bg-rausch/25", blobB: "bg-violet/25",
    accent: "text-rausch", chip: "bg-rausch text-white",
    solid: "bg-rausch hover:bg-rausch-active", ring: "focus-visible:ring-rausch", bar: "bg-rausch",
    soft: "bg-rausch/10 border-rausch text-rausch",
    barGradient: "from-rausch via-violet to-indigo", headerTint: "from-rausch/8 to-violet/5",
  },
  commercial: {
    band: "from-indigo/15 via-violet/10 to-luxe/20", blobA: "bg-indigo/25", blobB: "bg-luxe/30",
    accent: "text-indigo", chip: "bg-indigo text-white",
    solid: "bg-indigo hover:opacity-90", ring: "focus-visible:ring-indigo", bar: "bg-indigo",
    soft: "bg-indigo/10 border-indigo text-indigo",
    barGradient: "from-indigo via-violet to-luxe", headerTint: "from-indigo/8 to-luxe/5",
  },
  stay: {
    band: "from-patina/20 via-violet/10 to-terracotta/15", blobA: "bg-patina/30", blobB: "bg-terracotta/25",
    accent: "text-terracotta", chip: "bg-terracotta text-white",
    solid: "bg-terracotta hover:opacity-90", ring: "focus-visible:ring-terracotta", bar: "bg-terracotta",
    soft: "bg-terracotta/10 border-terracotta text-terracotta",
    barGradient: "from-patina via-umber to-terracotta", headerTint: "from-patina/10 to-terracotta/5",
  },
};

const heroPills = ["Verified seekers", "Number stays masked", "Promoted free"];

// Amenities are specific to what's being listed — a warehouse shouldn't offer
// "Meals" and a PG doesn't need a "Loading dock".
const RESIDENTIAL_AMENITIES = ["Parking", "Lift", "Power backup", "Security", "Gym", "Swimming pool", "Clubhouse", "Gas pipeline", "Wi-Fi", "AC", "Water supply 24×7", "Children's play area"];
const OFFICE_AMENITIES = ["Lift", "Power backup", "Central AC", "Parking", "Cafeteria", "Meeting rooms", "24/7 access", "CCTV / Security", "Fire safety", "Wi-Fi / Internet", "Reception", "Pantry"];
const AMENITIES_BY_CATEGORY: Record<string, string[]> = {
  rent: RESIDENTIAL_AMENITIES,
  buy: RESIDENTIAL_AMENITIES,
  flatmate: RESIDENTIAL_AMENITIES,
  pg: ["Wi-Fi", "AC", "Meals", "Laundry", "Housekeeping", "Hot water", "CCTV / Security", "Power backup", "Attached washroom", "Fridge", "TV", "Warden"],
  coliving: ["Wi-Fi", "AC", "Meals", "Housekeeping", "Laundry", "Gym", "Community events", "Gaming zone", "Power backup", "Security", "Hot water", "Netflix / OTT"],
  "commercial-office": OFFICE_AMENITIES,
  coworking: OFFICE_AMENITIES,
  lease: OFFICE_AMENITIES,
  "commercial-shop": ["Parking", "Power backup", "Washroom", "Main road facing", "Storage room", "CCTV / Security", "Fire safety", "Lift"],
  warehouse: ["Loading dock", "Power backup", "CCTV / Security", "Fire safety", "Weighbridge", "Office cabin", "Labour quarters", "Truck parking"],
  land: ["Boundary wall", "Gated access", "Water connection", "Electricity connection", "Road access", "Drainage", "Corner plot", "Street lighting"],
  homestay: ["Wi-Fi", "Home-cooked meals", "AC", "Hot water", "Parking", "TV", "Kitchen access", "Laundry", "Pet-friendly", "Garden / Sit-out"],
  resort: ["Swimming pool", "Spa", "Restaurant", "Bar", "Gym", "Kids' play area", "Indoor games", "Bonfire", "Room service", "Wi-Fi", "Parking", "Conference hall"],
  "service-apartment": ["Wi-Fi", "Housekeeping", "Kitchen", "AC", "Washing machine", "TV", "Power backup", "Lift", "Parking", "Security", "Gym"],
  hotel: ["Wi-Fi", "Breakfast", "Room service", "AC", "Restaurant", "Swimming pool", "Gym", "Parking", "Laundry", "Bar", "Airport shuttle", "Conference hall"],
};
const amenitiesFor = (slug: string) => AMENITIES_BY_CATEGORY[slug] ?? RESIDENTIAL_AMENITIES;
const visitDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Wizard step definitions ────────────────────────────────────────────────
const WIZARD_STEPS = [
  { key: "details", label: "Property details" },
  { key: "locality", label: "Locality" },
  { key: "pricing", label: "Pricing" },
  { key: "amenities", label: "Amenities" },
  { key: "gallery", label: "Photos" },
  { key: "schedule", label: "Schedule visits" },
];

const stepIcon = (key: string) => {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7 } as const;
  switch (key) {
    case "details":
      return <svg {...common}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path d="M9 22V12h6v10" /></svg>;
    case "locality":
      return <svg {...common}><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>;
    case "pricing":
      return <svg {...common}><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>;
    case "amenities":
      return <svg {...common}><path d="M20 7h-9M14 17H5M17 17a3 3 0 100-6 3 3 0 000 6zM7 13a3 3 0 100-6 3 3 0 000 6z" /></svg>;
    case "gallery":
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>;
    case "schedule":
      return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
    default:
      return null;
  }
};

// ─── Category-specific field configs ────────────────────────────────────────
type FieldDef = {
  key: string;
  label: string;
  required?: boolean;
  half?: boolean;
} & (
  | { type: "text" | "number" | "date"; placeholder?: string }
  | { type: "select"; options: string[] }
  | { type: "pills"; options: string[] }
);

const bhkTypes = ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];
const apartmentTypes = ["Apartment", "Independent House / Villa", "Gated Community Villa", "Standalone Building"];
const floorOptions = ["Ground", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];
const propertyAges = ["Under construction", "Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"];
const facings = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];
const furnishings = ["Fully furnished", "Semi furnished", "Unfurnished"];
const commFurnishing = ["Furnished", "Semi furnished", "Bare shell"];

function detailFields(slug: string): FieldDef[] {
  switch (slug) {
    case "pg":
      return [
        { key: "pgName", label: "PG / Hostel name", type: "text", placeholder: "e.g. Green Meadows PG", required: true },
        { key: "totalBeds", label: "Total beds", type: "number", placeholder: "e.g. 24", required: true, half: true },
        { key: "sharing", label: "Sharing", type: "select", options: ["Single", "Double", "Triple", "Four+"], half: true },
        { key: "pgFor", label: "PG is for", type: "pills", options: ["Girls", "Boys", "Anyone"], required: true },
        { key: "suitedFor", label: "Best suited for", type: "pills", options: ["Students", "Professionals", "Both"] },
        { key: "meals", label: "Meals available", type: "pills", options: ["Yes", "No"] },
      ];
    case "coliving":
      return [
        { key: "spaceName", label: "Space name", type: "text", placeholder: "e.g. Sunrise Co-living", required: true },
        { key: "roomType", label: "Room type", type: "select", options: ["Single room", "Twin sharing", "Studio"], required: true, half: true },
        { key: "furnishing", label: "Furnishing", type: "select", options: furnishings, half: true },
        { key: "suitedFor", label: "Best suited for", type: "pills", options: ["Students", "Professionals", "Both"] },
        { key: "meals", label: "Meals available", type: "pills", options: ["Yes", "No"] },
      ];
    case "commercial-office":
    case "coworking":
    case "lease":
      return [
        { key: "area", label: "Built-up area (sq ft)", type: "number", placeholder: "e.g. 3200", required: true, half: true },
        { key: "seats", label: "Seats / workstations", type: "number", placeholder: "e.g. 45", half: true },
        { key: "floor", label: "Floor", type: "select", options: floorOptions, half: true },
        { key: "totalFloors", label: "Total floors", type: "select", options: floorOptions, half: true },
        { key: "furnishing", label: "Furnishing", type: "select", options: commFurnishing, required: true },
        { key: "washrooms", label: "Washrooms", type: "pills", options: ["Private", "Shared"] },
      ];
    case "commercial-shop":
      return [
        { key: "area", label: "Built-up area (sq ft)", type: "number", placeholder: "e.g. 1800", required: true, half: true },
        { key: "frontage", label: "Frontage (ft)", type: "number", placeholder: "e.g. 20", half: true },
        { key: "floor", label: "Floor", type: "select", options: floorOptions, half: true },
        { key: "locationType", label: "Location", type: "pills", options: ["High street", "Mall", "Standalone"] },
        { key: "washroom", label: "Washroom", type: "pills", options: ["Yes", "No"] },
      ];
    case "warehouse":
      return [
        { key: "area", label: "Built-up area (sq ft)", type: "number", placeholder: "e.g. 18000", required: true, half: true },
        { key: "ceiling", label: "Ceiling height (ft)", type: "number", placeholder: "e.g. 24", half: true },
        { key: "docks", label: "Loading docks", type: "number", placeholder: "e.g. 2", half: true },
        { key: "power", label: "Power load (kVA)", type: "number", placeholder: "e.g. 100", half: true },
        { key: "highway", label: "Highway access", type: "pills", options: ["Yes", "No"] },
      ];
    case "land":
      return [
        { key: "plotArea", label: "Plot area (sq ft)", type: "number", placeholder: "e.g. 6000", required: true, half: true },
        { key: "dimensions", label: "Dimensions (ft)", type: "text", placeholder: "e.g. 60 × 100", half: true },
        { key: "approved", label: "Approved use", type: "select", options: ["Commercial", "Mixed-use", "Industrial"] },
        { key: "corner", label: "Corner plot", type: "pills", options: ["Yes", "No"] },
        { key: "boundary", label: "Boundary wall", type: "pills", options: ["Yes", "No"] },
      ];
    case "homestay":
      return [
        { key: "stayName", label: "Homestay name", type: "text", placeholder: "e.g. Hillside Homestay", required: true },
        { key: "stayType", label: "Guests get", type: "pills", options: ["Entire place", "Private room", "Shared room"], required: true },
        { key: "maxGuests", label: "Max guests", type: "number", placeholder: "e.g. 4", half: true },
        { key: "rooms", label: "Rooms available", type: "number", placeholder: "e.g. 2", half: true },
        { key: "meals", label: "Meals available", type: "pills", options: ["Yes", "No"] },
      ];
    case "resort":
      return [
        { key: "resortName", label: "Resort name", type: "text", placeholder: "e.g. Misty Hills Resort", required: true },
        { key: "resortType", label: "Resort type", type: "select", options: ["Beach", "Hill", "Lakefront", "Wildlife", "City"], required: true, half: true },
        { key: "totalRooms", label: "Total rooms / cottages", type: "number", placeholder: "e.g. 32", half: true },
        { key: "mealPlan", label: "Meal plan", type: "pills", options: ["Room only", "Breakfast included", "All meals"] },
      ];
    case "service-apartment":
      return [
        { key: "saName", label: "Property name", type: "text", placeholder: "e.g. Skyline Serviced Stays", required: true },
        { key: "unitType", label: "Unit type", type: "select", options: ["Studio", "1 BHK", "2 BHK", "3 BHK"], required: true, half: true },
        { key: "area", label: "Built-up area (sq ft)", type: "number", placeholder: "e.g. 650", half: true },
        { key: "housekeeping", label: "Housekeeping", type: "pills", options: ["Daily", "Weekly", "On request"] },
      ];
    case "hotel":
      return [
        { key: "hotelName", label: "Hotel name", type: "text", placeholder: "e.g. The Grand Central", required: true },
        { key: "starRating", label: "Star rating", type: "select", options: ["Budget", "3 star", "4 star", "5 star"], required: true, half: true },
        { key: "totalRooms", label: "Total rooms", type: "number", placeholder: "e.g. 60", half: true },
        { key: "roomTypes", label: "Room types offered", type: "pills", options: ["Standard", "Deluxe", "Suite"] },
      ];
    default:
      // rent, buy, homestay, flatmate — residential unit
      return [
        { key: "apartmentType", label: "Property type", type: "select", options: apartmentTypes, required: true },
        { key: "bhk", label: "BHK type", type: "select", options: bhkTypes, required: true },
        { key: "floor", label: "Floor", type: "select", options: floorOptions, half: true },
        { key: "totalFloors", label: "Total floors", type: "select", options: floorOptions, half: true },
        { key: "age", label: "Property age", type: "select", options: propertyAges, half: true },
        { key: "facing", label: "Facing", type: "select", options: facings, half: true },
        { key: "area", label: "Built-up area (sq ft)", type: "number", placeholder: "e.g. 1200" },
      ];
  }
}

function pricingFields(slug: string): FieldDef[] {
  const isSale = slug === "buy" || slug === "land" || slug === "lease";
  if (isSale) {
    return [
      { key: "price", label: "Expected price (₹)", type: "number", placeholder: "e.g. 11500000", required: true },
      { key: "negotiable", label: "Price negotiable", type: "pills", options: ["Yes", "No"] },
      { key: "possession", label: "Possession", type: "select", options: ["Ready to move", "Within 3 months", "Within 6 months", "Under construction"] },
    ];
  }
  if (getCategory(slug)?.world === "stay") {
    return [
      { key: "tariff", label: "Tariff per night (₹)", type: "number", placeholder: "e.g. 3500", required: true, half: true },
      { key: "monthlyTariff", label: "Monthly / long-stay rate (₹)", type: "number", placeholder: "e.g. 45000", half: true },
      { key: "available", label: "Open for bookings from", type: "date", half: true },
    ];
  }
  const isBed = slug === "pg" || slug === "coliving";
  return [
    { key: "rent", label: isBed ? "Rent per bed / mo (₹)" : "Expected rent / mo (₹)", type: "number", placeholder: "e.g. 18500", required: true, half: true },
    { key: "deposit", label: "Security deposit (₹)", type: "number", placeholder: "e.g. 50000", required: true, half: true },
    { key: "available", label: "Available from", type: "date", half: true },
    { key: "maintenance", label: "Maintenance / mo (₹)", type: "number", placeholder: "e.g. 2000", half: true },
  ];
}

export default function PostListing() {
  // Property-type selector (now lives at the top of the wizard's first step)
  const [world, setWorld] = useState<World>("residential");
  const [slug, setSlug] = useState("rent");

  const session = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Auto show registration prompt after 5 seconds if not logged in
  useEffect(() => {
    if (!session) {
      const timer = setTimeout(() => {
        setShowAuthModal(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [session]);

  // Wizard state
  const [active, setActive] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({});
  const [amenities, setAmenities] = useState<string[]>(["Wi-Fi"]);
  const [days, setDays] = useState<string[]>(["Sat", "Sun"]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Publish flow: role picker → published (no login/OTP gate)
  const [publishStage, setPublishStage] = useState<null | "role">(null);
  const [listingRole, setListingRole] = useState<ListingRole | null>(null);
  const [published, setPublished] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await apiClient.post("/listings/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data && res.data.success && res.data.url) {
        setImages((p) => [...p, res.data.url]);
      } else {
        alert("Upload failed: " + (res.data.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Failed to upload image to the server.");
    } finally {
      setUploading(false);
    }
  };

  // Track submission state to prevent duplicate listings from rapid multi-clicks
  const [submitting, setSubmitting] = useState(false);

  const publishListing = async (role: ListingRole) => {
    // If a request is already in progress, reject subsequent clicks
    if (submitting) return;
    setSubmitting(true);

    try {
      // Determine title based on category config
      const isStay = getCategory(slug)?.world === "stay";
      let title = "";
      if (slug === "pg") {
        title = form.pgName || "Premium PG Stay";
      } else if (slug === "coliving") {
        title = form.spaceName || "Premium Co-living Space";
      } else if (isStay) {
        title =
          form.stayName || form.resortName || form.saName || form.hotelName ||
          `${getCategory(slug)?.label ?? "Stay"} in ${form.locality || form.city || "Bengaluru"}`;
      } else {
        const typeStr = form.apartmentType || getCategory(slug)?.label || "Property";
        const bhkStr = form.bhk ? `${form.bhk} ` : "";
        title = `${bhkStr}${typeStr} in ${form.locality || form.city || "Bengaluru"}`;
      }

      // Determine price and label
      const isSale = slug === "buy" || slug === "land" || slug === "lease";
      const rawPrice = isSale ? form.price : isStay ? form.tariff : form.rent;
      const numericPrice = parseInt(rawPrice || "0", 10) || 0;

      let priceStr = "";
      if (isSale) {
        if (numericPrice >= 10000000) {
          priceStr = `₹${(numericPrice / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
        } else if (numericPrice >= 100000) {
          priceStr = `₹${(numericPrice / 100000).toFixed(2).replace(/\.00$/, "")} L`;
        } else {
          priceStr = `₹${numericPrice.toLocaleString("en-IN")}`;
        }
      } else {
        priceStr = `₹${numericPrice.toLocaleString("en-IN")}${isStay ? "/night" : "/mo"}`;
      }

      const defaultImage = `/categories/${slug}.jpg`;

      // Build payload matching backend requirements and JSON details column
      const payload = {
        title,
        location: `${form.locality || ""}, ${form.city || "Bengaluru"}`,
        price: priceStr,
        priceValue: numericPrice,
        image: images.length > 0 ? images[0] : defaultImage,
        images: images.length > 0 ? images : [defaultImage],
        badge: slug === "pg" || slug === "coliving" ? "PG" : isStay ? getCategory(slug)?.label ?? "Stay" : "Flat",
        rating: 5.0,
        category: slug,
        metroDistance: "300m from metro",
        reviewCount: 0,
        amenities: amenities,
        verified: true,
        noBrokerage: true,
        furnishing: form.furnishing || "Semi furnished",
        availableFrom: form.available || "Available now",
        area: form.area ? `${form.area} sq ft` : undefined,
        spec: form.bhk || undefined,
        roomTypes: []
      };

      const res = await apiClient.post("/listings", payload);
      if (res.data && res.data.success) {
        setListingRole(role);
        setPublishStage(null);
        setPublished(true);
      } else {
        alert("Failed to publish listing: " + (res.data.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Error publishing listing:", err);
      alert("Failed to connect to the backend server to publish listing.");
    } finally {
      // Release submission lock after request completes
      setSubmitting(false);
    }
  };

  // Urgency countdown (kicks off as soon as the wizard loads)
  const [secondsLeft, setSecondsLeft] = useState(120);
  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => (s <= 0 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const category = getCategory(slug);
  const worldCategories = categoriesForWorld(world);
  const theme = WORLD_THEME[world];
  const heroSrc = category?.image ?? "/categories/rent.jpg";

  // Hero photo loading
  const [heroLoadedSrc, setHeroLoadedSrc] = useState<string | null>(null);
  const heroLoaded = heroLoadedSrc === heroSrc;

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const toggleAmenity = (a: string) =>
    setAmenities((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]));
  const toggleDay = (d: string) =>
    setDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));

  const chooseSlug = (s: string) => {
    setSlug(s);
    const allowed = amenitiesFor(s);
    setAmenities((p) => p.filter((a) => allowed.includes(a)));
  };

  const chooseWorld = (w: World) => {
    setWorld(w);
    chooseSlug(categoriesForWorld(w)[0].slug);
  };

  const progress = Math.round((active / (WIZARD_STEPS.length - 1)) * 100);
  const last = active === WIZARD_STEPS.length - 1;

  const field =
    "w-full border border-hairline rounded-[8px] px-3 h-12 text-sm text-ink outline-none focus:border-ink focus:border-2 transition-colors bg-canvas";
  const labelCls = "text-[13px] font-medium text-ink block mb-1.5";

  const renderField = (f: FieldDef) => {
    if (f.type === "select") {
      return (
        <select value={form[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} className={`${field} ${form[f.key] ? "text-ink" : "text-muted"}`}>
          <option value="">Select</option>
          {f.options.map((o) => (<option key={o} value={o} className="text-ink">{o}</option>))}
        </select>
      );
    }
    if (f.type === "pills") {
      return (
        <div className="flex flex-wrap gap-2">
          {f.options.map((o) => {
            const on = form[f.key] === o;
            return (
              <button
                key={o}
                type="button"
                onClick={() => set(f.key, o)}
                aria-pressed={on}
                className={`px-4 py-2 text-sm font-medium rounded-[8px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
                  on ? "bg-rausch/10 border-rausch text-rausch" : "bg-canvas text-body border-hairline hover:border-ink"
                }`}
              >
                {o}
              </button>
            );
          })}
        </div>
      );
    }
    return (
      <input
        type={f.type === "number" ? "text" : f.type}
        inputMode={f.type === "number" ? "numeric" : undefined}
        value={form[f.key] ?? ""}
        onChange={(e) => set(f.key, e.target.value)}
        placeholder={"placeholder" in f ? f.placeholder : undefined}
        className={`${field} ${f.type === "date" && !form[f.key] ? "text-muted" : ""}`}
      />
    );
  };

  const renderFieldGroup = (fields: FieldDef[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
      {fields.map((f) => (
        <div key={f.key} className={f.half ? "col-span-1" : "col-span-1 sm:col-span-2"}>
          <label className={labelCls}>
            {f.label}
            {f.required && <span className="text-rausch"> *</span>}
          </label>
          {renderField(f)}
        </div>
      ))}
    </div>
  );

  // ─── Published success state ──────────────────────────────────────────────
  if (published) {
    return (
      <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "List your property", href: "/post" }, { label: "Published" }]}>
        <div className="max-w-[480px] mx-auto text-center py-16">
          <span className="inline-flex w-16 h-16 rounded-full bg-rausch/10 text-rausch items-center justify-center mb-5" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6L9 17l-5-5" /></svg>
          </span>
          <h1 className="text-[26px] font-bold text-ink tracking-tight mb-2">Submitted for review</h1>
          <p className="text-base text-body mb-8">
            Posted as <span className="font-medium text-ink">{listingRole ? listingRole[0].toUpperCase() + listingRole.slice(1) : "you"}</span>.
            Our team will review it shortly — once approved, it goes live and seekers can find it.
            We&apos;ll notify you on WhatsApp when it&apos;s published and when seekers respond.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/explore" className="h-12 px-6 inline-flex items-center justify-center bg-rausch text-white text-sm font-semibold rounded-[8px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2">
              Browse listings
            </Link>
            <button
              type="button"
              onClick={() => { setPublished(false); setActive(0); setForm({}); setImages([]); setListingRole(null); }}
              className="h-12 px-6 inline-flex items-center justify-center border border-hairline text-ink text-sm font-medium rounded-[8px] hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              List another property
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // ─── STEP 2: Multi-step wizard ────────────────────────────────────────────
  const mm = String(Math.floor(secondsLeft / 60)).padStart(1, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "List your property", href: "/post" }, { label: category?.label ?? "Post" }]}>
      {/* ── Colourful, world-themed hero band ── full-bleed, with a live category photo */}
      <section
        aria-label="List your property"
        className={`relative overflow-hidden -mx-4 md:-mx-6 lg:-mx-10 px-4 md:px-6 lg:px-10 pt-8 md:pt-10 pb-8 md:pb-9 mb-6 rounded-b-[32px] bg-gradient-to-br ${theme.band} transition-colors duration-500`}
      >
        {/* Decorative themed blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className={`absolute -top-24 -right-12 w-72 h-72 rounded-full blur-3xl transition-colors duration-500 ${theme.blobA}`} />
          <div className={`absolute -bottom-28 -left-20 w-72 h-72 rounded-full blur-3xl transition-colors duration-500 ${theme.blobB}`} />
          <div className="absolute top-10 right-1/3 w-20 h-20 rounded-[18px] rotate-12 bg-white/25" />
          <div className="absolute bottom-8 left-1/4 w-12 h-12 rounded-full border border-white/40" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,360px)] gap-6 lg:gap-10 items-center max-w-[1100px] mx-auto">
          {/* Left: headline + trust pills */}
          <div>
            <p className={`text-sm font-semibold uppercase tracking-wider mb-3 ${theme.accent}`}>Free listing · Direct deals</p>
            <h1 className="text-[clamp(26px,4vw,42px)] font-bold text-ink tracking-tight leading-[1.1] mb-3">
              List your property <span className={theme.accent}>in minutes</span>
            </h1>
            <p className="text-base text-body max-w-[460px] mb-5 leading-relaxed">
              Reach verified tenants and buyers across India. Add details, photos and visiting hours — we&apos;ll do the rest.
            </p>
            <div className="flex flex-wrap gap-2">
              {heroPills.map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink bg-white/70 backdrop-blur-sm border border-white/60 rounded-full px-3 py-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={theme.accent} aria-hidden="true"><path d="M5 12l4 4L19 7" /></svg>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: live category photo (updates as the user picks a type) */}
          <div className="hidden lg:block">
            <div className="relative aspect-[4/3] rounded-[20px] overflow-hidden shadow-airbnb border border-white/60">
              {!heroLoaded && <div className="absolute inset-0 skeleton" aria-hidden="true" />}
              <Image
                key={heroSrc}
                src={heroSrc}
                alt={`${category?.label ?? "Property"} listing preview`}
                fill
                sizes="360px"
                className="object-cover photo-enhance"
                onLoad={() => setHeroLoadedSrc(heroSrc)}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className={`inline-block text-[11px] font-semibold capitalize rounded-full px-2.5 py-1 mb-1.5 ${theme.chip}`}>{world}</span>
                <p className="text-white text-lg font-bold leading-tight drop-shadow-sm">{category?.label}</p>
                <p className="text-white/85 text-[13px]">{category?.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Urgency strip */}
      <div className="flex items-center gap-3 mb-5 px-4 py-2.5 rounded-[14px] bg-rausch/5 border border-rausch/30">
        <span className="shrink-0 w-8 h-8 rounded-full bg-rausch/10 text-rausch flex items-center justify-center" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>
        </span>
        <p className="text-sm text-body flex-1 min-w-0">
          {secondsLeft > 0 ? (
            <>Get <span className="font-semibold text-ink">2 extra enquiries</span> if you list your property now.</>
          ) : (
            <>Timer&apos;s up — but you&apos;ll still get <span className="font-semibold text-ink">3 free enquiries</span>. Just finish posting!</>
          )}
        </p>
        {secondsLeft > 0 && (
          <span className="shrink-0 text-[13px] font-semibold text-white bg-rausch rounded-full px-2.5 py-1 tabular-nums" aria-label={`${secondsLeft} seconds left`}>
            {mm}:{ss}
          </span>
        )}
      </div>

      {/* Top bar: progress + preview */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="h-1.5 bg-surface-strong rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-300 ${theme.bar}`} style={{ width: `${progress}%` }} />
          </div>
        </div>
        <span className="shrink-0 text-[13px] font-medium text-muted">{progress}% done</span>
        <button className="shrink-0 px-4 h-9 border border-rausch text-rausch text-sm font-medium rounded-[8px] hover:bg-rausch/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch">Preview</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Left: step nav — matching elevated 3D frame */}
        <nav className="hidden lg:block relative bg-canvas border border-hairline-soft rounded-[18px] overflow-hidden shadow-3d-soft h-fit lg:sticky lg:top-24" aria-label="Posting steps">
          <div className={`h-1.5 w-full bg-gradient-to-r ${theme.barGradient} transition-colors duration-500`} />
          <div className="p-2">
          {WIZARD_STEPS.map((s, i) => {
            const isActive = i === active;
            const done = i < active;
            return (
              <button
                key={s.key}
                onClick={() => {
                  if (!session) {
                    setShowAuthModal(true);
                    return;
                  }
                  setActive(i);
                }}
                aria-current={isActive ? "step" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-[10px] text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                  isActive ? "bg-surface-soft text-ink" : "text-muted hover:bg-surface-soft hover:text-ink"
                }`}
              >
                <span className={isActive || done ? theme.accent : ""}>
                  {done ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
                  ) : (
                    stepIcon(s.key)
                  )}
                </span>
                <span className={`text-sm font-medium ${isActive ? "text-ink" : ""}`}>{s.label}</span>
                {isActive && <span className={`ml-auto w-1.5 h-6 rounded-full ${theme.bar}`} />}
              </button>
            );
          })}

          {/* WhatsApp helper */}
          <div className="mt-2 p-3 rounded-[10px] bg-surface-soft">
            <p className="text-[12px] text-body leading-snug">
              <span className="font-semibold text-ink">Need help?</span> Now you can post directly via{" "}
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-rausch font-medium hover:underline">WhatsApp ›</a>
            </p>
          </div>
          </div>
        </nav>

        {/* Middle: form — elevated 3D frame with a themed accent */}
        <div className="relative rounded-[18px] bg-canvas border border-hairline-soft overflow-hidden min-h-[440px] shadow-3d">
          {/* Themed top accent bar */}
          <div className={`h-1.5 w-full bg-gradient-to-r ${theme.barGradient} transition-colors duration-500`} />
          <div className="p-6">
            {/* Tinted header band — bleeds to the card edges under the accent bar */}
            <div className={`flex items-center justify-between -mx-6 -mt-6 mb-6 px-6 py-4 border-b border-hairline bg-gradient-to-r ${theme.headerTint} transition-colors duration-500`}>
              <h2 className="text-[19px] font-bold text-ink">{WIZARD_STEPS[active].label}</h2>
              <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full transition-colors duration-300 ${theme.chip}`}>{category?.label}</span>
            </div>

          {/* Step: property-type selector + category-aware details */}
          {active === 0 && (
            <div className="space-y-6">
              {/* Residential | Commercial */}
              <div>
                <label className={labelCls}>Property category</label>
                <div role="group" aria-label="Property category" className="inline-flex items-center gap-1 bg-surface-soft border border-hairline-soft rounded-full p-1 w-full">
                  {(["residential", "commercial", "stay"] as World[]).map((w) => {
                    const on = world === w;
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => chooseWorld(w)}
                        aria-pressed={on}
                        className={`flex-1 py-2 text-sm font-semibold rounded-full capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
                          on ? "bg-ink text-white" : "text-muted hover:text-ink"
                        }`}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* What are you listing? */}
              <div>
                <label className={labelCls}>What are you listing?</label>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Listing category">
                  {worldCategories.map((c) => {
                    const on = slug === c.slug;
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => chooseSlug(c.slug)}
                        aria-pressed={on}
                        className={`px-3 py-1.5 text-sm font-medium rounded-[8px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
                          on ? `${theme.chip} border-transparent` : "bg-canvas text-body border-hairline hover:border-ink"
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category-aware detail fields */}
              <div className="pt-2 border-t border-hairline">
                {renderFieldGroup(detailFields(slug))}
              </div>
            </div>
          )}

          {/* Step: locality */}
          {active === 1 && (
            <div className="space-y-5">
              <div>
                <label className={labelCls}>City<span className="text-rausch"> *</span></label>
                <select value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} className={`${field} ${form.city ? "text-ink" : "text-muted"}`}>
                  <option value="">Select city</option>
                  {cities.map((c) => (<option key={c} value={c} className="text-ink">{c}</option>))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Locality / Area<span className="text-rausch"> *</span></label>
                <input className={field} placeholder="e.g. Koramangala" value={form.locality ?? ""} onChange={(e) => set("locality", e.target.value)} />
                {!form.locality && <p className="text-[12px] text-error mt-1.5">Please select a valid locality</p>}
              </div>
              <div><label className={labelCls}>Project / Society name</label><input className={field} placeholder="e.g. Prestige Shantiniketan" value={form.project ?? ""} onChange={(e) => set("project", e.target.value)} /></div>
              <div><label className={labelCls}>Street / Landmark</label><input className={field} placeholder="Near Forum Mall" value={form.landmark ?? ""} onChange={(e) => set("landmark", e.target.value)} /></div>
            </div>
          )}

          {/* Step: category-aware pricing */}
          {active === 2 && renderFieldGroup(pricingFields(slug))}

          {/* Step: amenities */}
          {active === 3 && (
            <div>
              <label className={labelCls}>Select the amenities available for your {category?.label ?? "property"} listing</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {amenitiesFor(slug).map((a) => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)} aria-pressed={amenities.includes(a)} className={`px-3 py-1.5 text-sm rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${amenities.includes(a) ? "bg-rausch/10 border-rausch text-rausch" : "bg-canvas border-hairline text-body hover:border-ink"}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: photos */}
          {active === 4 && (
            <div>
              <label className={labelCls}>Add photos of your property</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
                {images.map((img) => (
                  <div key={img} className="relative aspect-square bg-surface-strong rounded-[14px] overflow-hidden">
                    <img src={img} alt="Uploaded property photo" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages((p) => p.filter((x) => x !== img))} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ink/80 backdrop-blur-sm text-white text-xs flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink" aria-label="Remove photo">✕</button>
                  </div>
                ))}
                {images.length < 8 && (
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={uploading}
                    className="aspect-square border-2 border-dashed border-hairline rounded-[14px] flex flex-col items-center justify-center text-muted hover:border-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                  >
                    {uploading ? (
                      <span className="text-[11px] font-semibold">Uploading...</span>
                    ) : (
                      <>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                        <span className="text-[11px] mt-1">Upload</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </div>
              <p className="text-[12px] text-muted mt-3">Properties with photos get up to 5× more responses.</p>
            </div>
          )}

          {/* Step: schedule */}
          {active === 5 && (
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Available days for visits</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {visitDays.map((d) => (
                    <button key={d} type="button" onClick={() => toggleDay(d)} aria-pressed={days.includes(d)} className={`px-3 py-1.5 text-sm rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${days.includes(d) ? "bg-ink text-white border-ink" : "bg-canvas border-hairline text-body hover:border-ink"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Visit starts</label><input type="time" className={field} value={form.from ?? ""} onChange={(e) => set("from", e.target.value)} /></div>
                <div><label className={labelCls}>Visit ends</label><input type="time" className={field} value={form.to ?? ""} onChange={(e) => set("to", e.target.value)} /></div>
              </div>
              <div>
                <label className={labelCls}>Who shows the property?</label>
                <select value={form.caretaker ?? ""} onChange={(e) => set("caretaker", e.target.value)} className={`${field} ${form.caretaker ? "text-ink" : "text-muted"}`}>
                  <option value="">Select</option>
                  {["I show personally", "Caretaker", "Tenant", "Security"].map((o) => (<option key={o} value={o} className="text-ink">{o}</option>))}
                </select>
              </div>
            </div>
          )}

          {/* Footer nav */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-hairline">
            <button
              onClick={() => setActive((i) => Math.max(0, i - 1))}
              disabled={active === 0}
              className="text-sm font-medium text-muted hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => {
                if (!session) {
                  setShowAuthModal(true);
                  return;
                }
                if (last) {
                  setPublishStage("role");
                } else {
                  setActive((i) => i + 1);
                }
              }}
              className={`px-6 h-11 text-white text-sm font-semibold rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.solid} ${theme.ring}`}
            >
              {last ? "Publish listing" : "Save & continue"}
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Publish flow — choose listing role, then publish directly */}
      {publishStage === "role" && (
        <PublishRoleModal
          onClose={() => setPublishStage(null)}
          onSelect={(role) => publishListing(role)}
        />
      )}

      {/* Unregistered Prompt Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
          <div className="bg-canvas border border-hairline rounded-[24px] max-w-[420px] w-full p-6 shadow-3d animate-scale-up relative">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-ink p-1 rounded-full hover:bg-surface-soft transition-colors"
              aria-label="Close dialog"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-14 h-14 rounded-full bg-rausch/10 flex items-center justify-center text-rausch mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6M23 11h-6" /></svg>
              </div>
              <h3 id="auth-modal-title" className="text-xl font-bold text-ink tracking-tight mb-2">Registration Required</h3>
              <p className="text-sm text-body leading-relaxed mb-6">
                You must first get registered for listing the property on FindWay. Creating an account takes less than a minute!
              </p>
              <div className="flex flex-col w-full gap-2.5">
                <Link
                  href="/login?mode=signup"
                  className="w-full h-12 flex items-center justify-center bg-rausch text-white text-base font-semibold rounded-[12px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2 shadow-sm"
                >
                  Register Now
                </Link>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="w-full h-12 flex items-center justify-center border border-hairline text-ink text-sm font-medium rounded-[12px] hover:bg-surface-soft transition-colors"
                >
                  Explore fields first
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
