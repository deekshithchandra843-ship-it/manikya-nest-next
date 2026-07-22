"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/useSession";
import { World, categoriesForWorld, getCategory } from "@/lib/categories";
import { apiClient } from "@/lib/apiClient";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import type { ListingRole } from "@/components/PublishRoleModal";

const citiesList = [
  { name: "Bengaluru", emoji: "🌳", label: "Namma Ooru" },
  { name: "Hyderabad", emoji: "🕌", label: "Charminar City" },
  { name: "Chennai", emoji: "🌊", label: "Marina Coast" },
  { name: "Mumbai", emoji: "🚇", label: "Dream City" },
  { name: "Pune", emoji: "🏔️", label: "Oxford of East" },
  { name: "Delhi NCR", emoji: "🏛️", label: "Capital Region" },
  { name: "Kolkata", emoji: "🌉", label: "City of Joy" }
];

import BENGALURU_LOCALITIES_RAW from "@/data/bengaluru-localities.json";
const BENGALURU_LOCALITIES = BENGALURU_LOCALITIES_RAW.map((loc) => loc.name);


// Per-world colour theme
type Theme = {
  accent: string; chip: string;               // text accent + solid pill
  solid: string; ring: string; bar: string; soft: string; // form accents
  barGradient: string; headerTint: string;    // form card frame
};
const WORLD_THEME: Record<World, Theme> = {
  residential: {
    accent: "text-rausch", chip: "bg-rausch text-white",
    solid: "bg-rausch hover:bg-rausch-active", ring: "focus-visible:ring-rausch", bar: "bg-rausch",
    soft: "bg-rausch/10 border-rausch text-rausch",
    barGradient: "from-zinc-900 via-slate-950 to-zinc-900", headerTint: "from-rausch/8 to-violet/5",
  },
  commercial: {
    accent: "text-indigo", chip: "bg-indigo text-white",
    solid: "bg-indigo hover:opacity-90", ring: "focus-visible:ring-indigo", bar: "bg-indigo",
    soft: "bg-indigo/10 border-indigo text-indigo",
    barGradient: "from-slate-900 via-slate-950 to-slate-900", headerTint: "from-indigo/8 to-luxe/5",
  },
  stay: {
    accent: "text-terracotta", chip: "bg-terracotta text-white",
    solid: "bg-terracotta hover:opacity-90", ring: "focus-visible:ring-terracotta", bar: "bg-terracotta",
    soft: "bg-terracotta/10 border-terracotta text-terracotta",
    barGradient: "from-stone-900 via-stone-950 to-stone-900", headerTint: "from-patina/10 to-terracotta/5",
  },
};

const RESIDENTIAL_AMENITIES = ["Parking", "Lift", "Power backup", "Security", "Gym", "Swimming pool", "Clubhouse", "Gas pipeline", "Wi-Fi", "AC", "Water supply 24×7", "Children's play area"];
const OFFICE_AMENITIES = ["Lift", "Power backup", "Central AC", "Parking", "Cafeteria", "Meeting rooms", "24/7 access", "CCTV / Security", "Fire safety", "Wi-Fi / Internet", "Reception", "Pantry"];
const AMENITIES_BY_CATEGORY: Record<string, string[]> = {
  rent: RESIDENTIAL_AMENITIES,
  buy: RESIDENTIAL_AMENITIES,
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

const WIZARD_STEPS = [
  { key: "role", label: "Select role" },
  { key: "category", label: "Property category" },
  { key: "type", label: "Listing type" },
  { key: "details", label: "Property details" },
  { key: "locality", label: "Locality" },
  { key: "pricing", label: "Pricing" },
  { key: "amenities", label: "Amenities" },
  { key: "gallery", label: "Photos" },
  { key: "schedule", label: "Schedule visits" },
];

function getStepTitle(active: number, categoryLabel: string): string {
  switch (active) {
    case 0: return "How are you listing this property?";
    case 1: return "What category fits best?";
    case 2: return "Which type of listing is it?";
    case 3: return `Tell us about your ${categoryLabel || "property"}'s details`;
    case 4: return "Where is your property located?";
    case 5: return "Set your pricing structures";
    case 6: return "What amenities do you offer?";
    case 7: return "Add some photos of your place";
    case 8: return "When are you available for visits?";
    default: return "List your property";
  }
}

function getStepDescription(active: number, categoryLabel: string): string {
  switch (active) {
    case 0: return "Select your profile type to match search preferences and handle agreements correctly.";
    case 1: return "Choose residential for living, commercial for business, or stay for temporary travels.";
    case 2: return "Choose the exact sub-type of your property to show up in relevant search results.";
    case 3: return "Provide bedroom count, property type, and details to help searchers filter your listing.";
    case 4: return "Pinpoint your area. Users can search by city or explore local landmarks nearby.";
    case 5: return "Set monthly rent, deposit, maintenance, or pricing structures clearly.";
    case 6: return "Select facilities like Wi-Fi, power backup, parking, or specific utilities.";
    case 7: return "Upload high-quality images. Properties with photos get up to 5× more leads.";
    case 8: return "Specify visit timings and caretaker details for seamless offline property viewing.";
    default: return "Enter details step by step.";
  }
}

const renderStepCartoonGraphic = (active: number, selectedRole: ListingRole | null, world: World) => {
  const common = "w-32 h-32 md:w-44 md:h-44 text-ink transition-all duration-500 hover:scale-105 shrink-0 mb-6 drop-shadow-sm";
  const strokeColor = "currentColor";
  const strokeWidth = "1.5";
  
  if (active === 0) {
    return (
      <svg className={common} viewBox="0 0 100 100" fill="none">
        {/* Soft background glow */}
        <circle cx="50" cy="50" r="42" className="fill-rausch/[0.03] stroke-rausch/10" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Minimal Signature Key/Shield */}
        <path d="M50 20 L75 35 V65 L50 80 L25 65 V35 Z" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" fill="currentColor" fillOpacity="0.02" />
        <circle cx="50" cy="45" r="8" stroke={strokeColor} strokeWidth={strokeWidth} />
        <path d="M50 53 V68 M46 60 H54 M46 66 H54" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        
        {/* Floating sparkles */}
        <circle cx="22" cy="30" r="2" className="fill-rausch/40 animate-pulse" />
        <circle cx="78" cy="70" r="3" className="fill-rausch/30 animate-pulse" />
      </svg>
    );
  }

  if (active === 1) {
    return (
      <svg className={common} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="42" className="fill-rausch/[0.03] stroke-rausch/10" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Overlapping Geometric Shapes representing spaces (triangle, square, circle) */}
        <g className="opacity-80">
          {/* Residential (Triangle) */}
          <path d="M50 22 L24 64 H76 Z" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" fill="currentColor" fillOpacity="0.02" />
          {/* Commercial (Square) */}
          <rect x="36" y="44" width="28" height="28" rx="4" stroke={strokeColor} strokeWidth={strokeWidth} fill="currentColor" fillOpacity="0.04" />
          {/* Stay/Hospitality (Circle) */}
          <circle cx="50" cy="52" r="12" stroke={strokeColor} strokeWidth={strokeWidth} fill="currentColor" fillOpacity="0.06" />
        </g>
      </svg>
    );
  }

  if (active === 2) {
    return (
      <svg className={common} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="42" className="fill-rausch/[0.03] stroke-rausch/10" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Cascading cards indicating category selection */}
        <g className="animate-pulse-slow">
          <rect x="22" y="22" width="45" height="30" rx="6" stroke={strokeColor} strokeWidth={strokeWidth} fill="currentColor" fillOpacity="0.02" />
          <rect x="33" y="35" width="45" height="30" rx="6" stroke={strokeColor} strokeWidth={strokeWidth} fill="currentColor" fillOpacity="0.04" />
          <rect x="44" y="48" width="45" height="30" rx="6" stroke={strokeColor} strokeWidth={strokeWidth} fill="currentColor" fillOpacity="0.08" />
          <line x1="52" y1="58" x2="68" y2="58" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          <line x1="52" y1="66" x2="78" y2="66" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  if (active === 3) {
    return (
      <svg className={common} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="42" className="fill-rausch/[0.03] stroke-rausch/10" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Architectural layout plan (Blueprint) */}
        <g stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="24" y="24" width="52" height="52" rx="4" fill="currentColor" fillOpacity="0.02" />
          {/* Internal walls */}
          <path d="M50 24 V76 M24 50 H76 M50 50 L64 36" />
          {/* Room markers / Dotted circles */}
          <circle cx="37" cy="37" r="5" strokeDasharray="2 2" fill="none" />
          <circle cx="63" cy="63" r="5" strokeDasharray="2 2" fill="none" />
        </g>
      </svg>
    );
  }

  if (active === 4) {
    return (
      <svg className={common} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="42" className="fill-rausch/[0.03] stroke-rausch/10" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Modern Map pin & grid */}
        <g stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          {/* Grid lines */}
          <path d="M25 75 L75 75 M32 60 L68 60 M28 67 L72 67" strokeDasharray="3 3" opacity="0.5" />
          {/* Pin */}
          <path d="M50 78 C50 78 70 54 70 38 C70 26.95 61.05 18 50 18 C38.95 18 30 26.95 30 38 C30 54 50 78 50 78 Z" fill="currentColor" fillOpacity="0.04" />
          <circle cx="50" cy="38" r="7" fill="currentColor" fillOpacity="0.1" />
        </g>
      </svg>
    );
  }

  if (active === 5) {
    return (
      <svg className={common} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="42" className="fill-rausch/[0.03] stroke-rausch/10" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Dynamic Balance / Value scale representation */}
        <g stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          {/* Center pillar */}
          <line x1="50" y1="26" x2="50" y2="74" />
          <line x1="38" y1="74" x2="62" y2="74" />
          {/* Crossbeam (Tilted slightly for dynamic aesthetic) */}
          <path d="M30 38 L70 34" className="animate-pulse" />
          {/* Hanging scales */}
          <path d="M30 38 L22 62 H38 Z" fill="currentColor" fillOpacity="0.04" />
          <path d="M70 34 L62 58 H78 Z" fill="currentColor" fillOpacity="0.08" />
        </g>
      </svg>
    );
  }

  if (active === 6) {
    return (
      <svg className={common} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="42" className="fill-rausch/[0.03] stroke-rausch/10" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Geometric Grid of Amenities (Modular blocks) */}
        <g stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="25" y="25" width="20" height="20" rx="4" fill="currentColor" fillOpacity="0.02" />
          <rect x="55" y="25" width="20" height="20" rx="4" fill="currentColor" fillOpacity="0.04" />
          <rect x="25" y="55" width="20" height="20" rx="4" fill="currentColor" fillOpacity="0.06" />
          <rect x="55" y="55" width="20" height="20" rx="4" fill="currentColor" fillOpacity="0.08" />
          {/* Key micro elements */}
          <circle cx="35" cy="35" r="3" fill="currentColor" />
          <path d="M61 35 H69" />
          <path d="M31 65 H39" />
          <circle cx="65" cy="65" r="3" fill="currentColor" />
        </g>
      </svg>
    );
  }

  if (active === 7) {
    return (
      <svg className={common} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="42" className="fill-rausch/[0.03] stroke-rausch/10" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Minimalist Polaroid Frame & Camera Lens */}
        <g stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="26" y="22" width="48" height="56" rx="4" transform="rotate(-6 50 50)" fill="currentColor" fillOpacity="0.03" />
          <rect x="32" y="28" width="36" height="34" transform="rotate(-6 50 50)" fill="currentColor" fillOpacity="0.08" />
          <circle cx="50" cy="45" r="8" fill="currentColor" />
          <line x1="32" y1="68" x2="48" y2="66" />
        </g>
      </svg>
    );
  }

  if (active === 8) {
    return (
      <svg className={common} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="42" className="fill-rausch/[0.03] stroke-rausch/10" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Clock & Calendar (Visit Scheduling) */}
        <g stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          {/* Calendar sheet */}
          <rect x="25" y="30" width="50" height="46" rx="6" fill="currentColor" fillOpacity="0.02" />
          <path d="M25 44 H75" />
          <circle cx="38" cy="58" r="4" fill="currentColor" />
          <circle cx="62" cy="58" r="4" fill="currentColor" />
          <path d="M38 24 V34 M62 24 V34" strokeWidth="2" />
        </g>
      </svg>
    );
  }

  return null;
};

const getAmenityIcon = (name: string, isSelected: boolean) => {
  const cls = `w-7 h-7 mb-3 transition-colors ${isSelected ? "text-white" : "text-muted group-hover:text-ink"}`;
  switch (name.toLowerCase()) {
    case "wi-fi":
    case "wi-fi / internet":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 20h.01M8.5 16.5a5 5 0 017 0M5 13a10 10 0 0114 0M1.5 9.5a15 15 0 0121 0"/></svg>;
    case "ac":
    case "central ac":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 1v22M5 12h14M18.5 5.5l-13 13M5.5 5.5l13 13"/></svg>;
    case "parking":
    case "truck parking":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9 17V7h4a3 3 0 010 6H9"/></svg>;
    case "lift":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 3H3v18h18V3zM9 10l3-3 3 3M9 14l3 3 3-3"/></svg>;
    case "power backup":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
    case "security":
    case "cctv / security":
    case "warden":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case "gym":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M6.5 6.5h11M18 4v5M6 4v5M3 6.5h3M18 6.5h3M6.5 17.5h11M18 15v5M6 15v5M3 17.5h3M18 17.5h3"/></svg>;
    case "swimming pool":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M2 6c4-1.5 8-1.5 12 0s8 1.5 12 0M2 12c4-1.5 8-1.5 12 0s8 1.5 12 0M2 18c4-1.5 8-1.5 12 0s8 1.5 12 0"/></svg>;
    case "meals":
    case "meals available":
    case "cafeteria":
    case "pantry":
    case "breakfast":
    case "breakfast included":
    case "all meals":
    case "restaurant":
    case "home-cooked meals":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2v10a4 4 0 004 4h4M9 6v1M9 14v2"/></svg>;
    case "tv":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="13" rx="2"/><path d="M17 2l-5 5-5-5"/></svg>;
    case "fridge":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M5 10h14M9 6v1M9 14v2"/></svg>;
    case "laundry":
    case "washing machine":
    case "housekeeping":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>;
    case "clubhouse":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
    case "gas pipeline":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2v20M5 12h14"/></svg>;
    case "water supply 24×7":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22a7 7 0 007-7c0-4.3-7-13-7-13s-7 8.7-7 13a7 7 0 007 7z"/></svg>;
    case "children's play area":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>;
    default:
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>;
  }
};

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
const apartmentTypes = ["Apartment", "Independent House", "Gated Villa", "Individual Floor", "Plot"];
const floorOptions = ["Ground", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];
const propertyAges = ["Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"];
const facings = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];
const furnishings = ["Fully furnished", "Semi furnished", "Unfurnished"];
const commFurnishing = ["Furnished", "Semi furnished", "Bare shell"];

function detailFields(slug: string, apartmentType?: string): FieldDef[] {
  switch (slug) {
    case "pg":
      return [
        { key: "pgName", label: "PG / Hostel name", type: "text", placeholder: "e.g. Green Meadows PG", required: true },
        { key: "pgFor", label: "PG is for", type: "pills", options: ["Girls", "Boys", "Anyone"], required: true },
        { key: "suitedFor", label: "Best suited for", type: "pills", options: ["Students", "Professionals", "Both"] },
        { key: "meals", label: "Meals available", type: "pills", options: ["Yes", "No"] },
      ];
    case "coliving":
      return [
        { key: "spaceName", label: "Space name", type: "text", placeholder: "e.g. Sunrise Co-living", required: true },
        { key: "furnishing", label: "Furnishing status", type: "select", options: furnishings, half: true },
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
        { key: "furnishing", label: "Furnishing status", type: "select", options: commFurnishing, required: true },
        { key: "washrooms", label: "Washrooms", type: "pills", options: ["Private", "Shared"] },
      ];
    case "commercial-shop":
      return [
        { key: "area", label: "Built-up area (sq ft)", type: "number", placeholder: "e.g. 1800", required: true, half: true },
        { key: "frontage", label: "Frontage (ft)", type: "number", placeholder: "e.g. 20", half: true },
        { key: "floor", label: "Floor", type: "select", options: floorOptions, half: true },
        { key: "locationType", label: "Location profile", type: "pills", options: ["High street", "Mall", "Standalone"] },
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
        { key: "housekeeping", label: "Housekeeping service", type: "pills", options: ["Daily", "Weekly", "On request"] },
      ];
    case "hotel":
      return [
        { key: "hotelName", label: "Hotel name", type: "text", placeholder: "e.g. The Grand Central", required: true },
        { key: "starRating", label: "Star rating", type: "select", options: ["Budget", "3 star", "4 star", "5 star"], required: true, half: true },
        { key: "totalRooms", label: "Total rooms", type: "number", placeholder: "e.g. 60", half: true },
        { key: "roomTypes", label: "Room types offered", type: "pills", options: ["Standard", "Deluxe", "Suite"] },
      ];
    default: {
      const baseFields: FieldDef[] = [
        { key: "apartmentType", label: "Property type", type: "select", options: apartmentTypes, required: true },
      ];

      if (apartmentType === "Plot") {
        return [
          ...baseFields,
          { key: "dimensions", label: "Dimensions (ft) (e.g. 30 × 40)", type: "text", placeholder: "e.g. 30 × 40", required: true, half: true },
          { key: "landArea", label: "Plot area (sq ft)", type: "number", placeholder: "Calculated automatically", required: true, half: true },
          { key: "facing", label: "Facing direction", type: "select", options: facings, half: true },
        ] as FieldDef[];
      }

      const showFloor = apartmentType === "Apartment" || apartmentType === "Individual Floor";
      const showLandArea = apartmentType === "Independent House" || apartmentType === "Gated Villa";

      return [
        ...baseFields,
        { key: "bhk", label: "BHK type", type: "select", options: bhkTypes, required: true },
        ...(showFloor ? [
          { key: "floor", label: "Floor", type: "select", options: floorOptions, half: true } as FieldDef,
        ] : []),
        { key: "totalFloors", label: "Total floors", type: "select", options: floorOptions, half: showFloor },
        { key: "age", label: "Property age", type: "select", options: propertyAges, half: true },
        { key: "facing", label: "Facing direction", type: "select", options: facings, half: true },
        { key: "area", label: "Built-up area (sq ft)", type: "number", placeholder: "e.g. 1200", half: showLandArea },
        ...(showLandArea ? [
          { key: "landArea", label: "Land area (sq ft)", type: "number", placeholder: "e.g. 1500", half: true } as FieldDef,
        ] : []),
      ] as FieldDef[];
    }
  }
}

function pricingFields(slug: string): FieldDef[] {
  const isSale = slug === "buy" || slug === "land" || slug === "lease";
  if (isSale) {
    return [
      { key: "price", label: "Expected price (₹)", type: "number", placeholder: "e.g. 11500000", required: true },
      { key: "negotiable", label: "Price negotiable", type: "pills", options: ["Yes", "No"] },
      { key: "possession", label: "Possession timeline", type: "select", options: ["Ready to move", "Within 3 months", "Within 6 months", "Under construction"] },
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

// Helper component to edit room sharing configurations
function RoomConfigurationEditor({
  roomConfigurations,
  setRoomConfigurations,
}: {
  roomConfigurations: any[];
  setRoomConfigurations: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const sharingOptions = [
    { type: "single", label: "Single Sharing", beds: 1 },
    { type: "double", label: "Double Sharing", beds: 2 },
    { type: "triple", label: "Triple Sharing", beds: 3 },
    { type: "four", label: "Four Sharing", beds: 4 },
    { type: "five", label: "Five Sharing", beds: 5 },
  ];

  const handleAddField = (type: string) => {
    if (roomConfigurations.some((rc) => rc.sharingType === type)) return;
    const option = sharingOptions.find((o) => o.type === type);
    if (!option) return;

    setRoomConfigurations((prev) => [
      ...prev,
      {
        sharingType: type,
        numberOfRooms: 1,
        bedsPerRoom: option.beds,
        totalBeds: option.beds,
        occupiedBeds: 0,
        availableBeds: option.beds,
        pricePerBed: 0,
        pricePerRoom: undefined,
      },
    ]);
  };

  const handleRemoveField = (type: string) => {
    setRoomConfigurations((prev) => prev.filter((rc) => rc.sharingType !== type));
  };

  const handleUpdateField = (type: string, key: string, value: number) => {
    setRoomConfigurations((prev) =>
      prev.map((rc) => {
        if (rc.sharingType !== type) return rc;
        const nextRc = { ...rc, [key]: value };

        if (key === "numberOfRooms") {
          nextRc.totalBeds = value * rc.bedsPerRoom;
        }

        nextRc.availableBeds = nextRc.totalBeds - nextRc.occupiedBeds;

        return nextRc;
      })
    );
  };

  const availableToAdd = sharingOptions.filter(
    (o) => !roomConfigurations.some((rc) => rc.sharingType === o.type)
  );

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between border-b border-hairline pb-2 mb-4">
        <h3 className="text-sm font-semibold text-ink">Room Configuration & Availability</h3>
        {availableToAdd.length > 0 && (
          <div className="relative inline-block">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleAddField(e.target.value);
                  e.target.value = "";
                }
              }}
              aria-label="Add Room Sharing Type"
              className="text-xs font-bold text-rausch bg-rausch/5 border border-rausch/20 rounded-[8px] px-2.5 py-1.5 cursor-pointer hover:bg-rausch/10 outline-none"
            >
              <option value="" disabled>+ Add Sharing Type</option>
              {availableToAdd.map((o) => (
                <option key={o.type} value={o.type}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {roomConfigurations.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-10 px-4 border border-dashed border-hairline rounded-[14px] bg-surface-soft">
          <span className="text-2xl mb-2">🛏️</span>
          <p className="text-xs font-bold text-ink mb-1">No room sharing types added yet</p>
          <p className="text-[11px] text-muted mb-3">Add at least one room configuration card to specify PG beds and pricing.</p>
          {availableToAdd.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {availableToAdd.map((o) => (
                <button
                  key={o.type}
                  type="button"
                  onClick={() => handleAddField(o.type)}
                  className="text-xs font-semibold bg-canvas border border-hairline hover:border-ink hover:scale-102 transition-all px-3 py-1.5 rounded-full text-body animate-fade-up"
                >
                  + {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 max-h-[50vh] overflow-y-auto pr-1">
          {roomConfigurations.map((rc) => {
            const label = sharingOptions.find((o) => o.type === rc.sharingType)?.label || rc.sharingType;
            const hasError = rc.occupiedBeds > rc.totalBeds;
            const isFull = rc.availableBeds <= 0;
            const isLimited = rc.availableBeds > 0 && rc.availableBeds <= 2;

            return (
              <div
                key={rc.sharingType}
                className={`relative bg-canvas border ${
                  hasError ? "border-error ring-1 ring-error/20" : "border-hairline-soft"
                } rounded-[14px] p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3.5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🛏️</span>
                    <span className="font-extrabold text-sm text-ink">{label}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        hasError
                          ? "bg-error/10 text-error"
                          : isFull
                          ? "bg-neutral-100 text-neutral-500"
                          : isLimited
                          ? "bg-amber-100 text-amber-600"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}
                    >
                      {hasError ? "Overfilled" : isFull ? "Full" : isLimited ? "Limited" : "Available"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveField(rc.sharingType)}
                    className="text-xs text-muted hover:text-error font-semibold flex items-center gap-1 transition-colors px-2 py-1 rounded-[6px] hover:bg-error/5"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                      No. of Rooms
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full border border-hairline rounded-[8px] px-2.5 h-9 text-xs text-ink bg-canvas focus:border-ink focus:ring-1 focus:ring-ink outline-none"
                      value={rc.numberOfRooms || ""}
                      onChange={(e) =>
                        handleUpdateField(rc.sharingType, "numberOfRooms", Math.max(0, parseInt(e.target.value) || 0))
                      }
                      placeholder="e.g. 5"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                      Beds per Room
                    </label>
                    <input
                      type="number"
                      disabled
                      className="w-full border border-hairline rounded-[8px] px-2.5 h-9 text-xs text-muted bg-surface-soft outline-none"
                      value={rc.bedsPerRoom}
                      aria-label="Beds per Room"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                      Total Beds
                    </label>
                    <div className="w-full border border-hairline rounded-[8px] px-2.5 h-9 text-xs text-muted bg-surface-soft flex items-center font-semibold">
                      {rc.totalBeds}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                      Occupied Beds
                    </label>
                    <input
                      type="number"
                      min="0"
                      className={`w-full border rounded-[8px] px-2.5 h-9 text-xs bg-canvas outline-none focus:border-ink focus:ring-1 focus:ring-ink ${
                        hasError ? "border-error" : "border-hairline"
                      }`}
                      value={rc.occupiedBeds === 0 ? "0" : rc.occupiedBeds || ""}
                      onChange={(e) =>
                        handleUpdateField(rc.sharingType, "occupiedBeds", Math.max(0, parseInt(e.target.value) || 0))
                      }
                      placeholder="e.g. 3"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                      Available Beds
                    </label>
                    <div
                      className={`w-full border rounded-[8px] px-2.5 h-9 text-xs flex items-center font-bold ${
                        hasError
                          ? "bg-error/5 border-error text-error"
                          : isFull
                          ? "bg-neutral-50 border-hairline text-neutral-400"
                          : "bg-emerald-50/50 border-hairline text-emerald-600"
                      }`}
                    >
                      {hasError ? "Error" : rc.availableBeds}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                      Price per Bed (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full border border-hairline rounded-[8px] px-2.5 h-9 text-xs text-ink bg-canvas focus:border-ink focus:ring-1 focus:ring-ink outline-none font-bold"
                      value={rc.pricePerBed || ""}
                      onChange={(e) =>
                        handleUpdateField(rc.sharingType, "pricePerBed", Math.max(0, parseInt(e.target.value) || 0))
                      }
                      placeholder="e.g. 12000"
                      required
                    />
                  </div>
                </div>

                {rc.sharingType === "single" && (
                  <div className="pt-2 border-t border-hairline-soft flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[10px] text-muted font-bold uppercase tracking-wider">
                      Entire Room Price (Optional)
                    </span>
                    <div className="relative w-full sm:w-44">
                      <input
                        type="number"
                        min="0"
                        className="w-full border border-hairline rounded-[8px] px-2.5 h-8 text-xs text-ink bg-canvas focus:border-ink focus:ring-1 focus:ring-ink outline-none"
                        value={rc.pricePerRoom || ""}
                        onChange={(e) =>
                          handleUpdateField(
                            rc.sharingType,
                            "pricePerRoom",
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
                        placeholder="e.g. 15000"
                      />
                    </div>
                  </div>
                )}

                {hasError && (
                  <p className="text-[10px] text-error font-semibold leading-tight">
                    ⚠️ Occupied beds cannot exceed total beds ({rc.totalBeds}).
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PostListing() {
  const [world, setWorld] = useState<World>("residential");
  const [slug, setSlug] = useState("rent");
  const session = useSession();

  // Wizard state
  const [active, setActive] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({});
  const [amenities, setAmenities] = useState<string[]>(["Wi-Fi"]);
  const [days, setDays] = useState<string[]>(["Sat", "Sun"]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [roomConfigurations, setRoomConfigurations] = useState<any[]>([]);

  // Listing role selection state
  const [selectedRole, setSelectedRole] = useState<ListingRole | null>(null);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [published, setPublished] = useState(false);

  // Locality suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Geolocation lookup state
  const [detecting, setDetecting] = useState(false);

  const lastPushedStepRef = useRef<number>(0);

  useEffect(() => {
    window.history.replaceState({ step: 0 }, "");
    lastPushedStepRef.current = 0;
  }, []);

  useEffect(() => {
    if (active !== lastPushedStepRef.current) {
      window.history.pushState({ step: active }, "");
      lastPushedStepRef.current = active;
    }
  }, [active]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && typeof event.state.step === "number") {
        lastPushedStepRef.current = event.state.step;
        setActive(event.state.step);
      } else {
        lastPushedStepRef.current = 0;
        setActive(0);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const isStepValid = (stepIndex: number) => {
    if (stepIndex === 0) return selectedRole !== null;
    if (stepIndex === 1) return true;
    if (stepIndex === 2) return true;
    if (stepIndex === 3) {
      const fields = detailFields(slug, form.apartmentType);
      return fields.filter((f) => f.required).every((f) => form[f.key] && form[f.key].trim() !== "");
    }
    if (stepIndex === 4) {
      return !!(form.city && form.city.trim() && form.locality && form.locality.trim());
    }
    if (stepIndex === 5) {
      if (slug === "pg" || slug === "coliving") {
        const activeConfigs = roomConfigurations.filter((rc) => rc.numberOfRooms > 0);
        return activeConfigs.length > 0 && activeConfigs.every((rc) => 
          rc.pricePerBed > 0 &&
          rc.occupiedBeds >= 0 &&
          rc.occupiedBeds <= rc.totalBeds
        );
      }
      const fields = pricingFields(slug);
      return fields.filter((f) => f.required).every((f) => form[f.key] && form[f.key].trim() !== "");
    }
    if (stepIndex === 6) return true;
    if (stepIndex === 7) return images.length >= 1;
    if (stepIndex === 8) return true;
    return true;
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Maintain visual clarity but cap max dimensions to 1600px to reduce file size
          const MAX_DIM = 1600;
          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file); // Fallback to raw file if canvas context is missing
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file); // Fallback
              }
            },
            "image/jpeg",
            0.82 // 82% quality yields 75-80% file size reduction with zero human-noticeable clarity loss
          );
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const uploadFiles = async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    setUploading(true);

    try {
      for (const file of imageFiles) {
        // Compress the image client-side first
        const compressedBlob = await compressImage(file);
        const formData = new FormData();
        // Keep original file name but swap extension to .jpg
        const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
        formData.append("image", compressedBlob, cleanName);

        const res = await apiClient.post("/listings/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data && res.data.success && res.data.url) {
          setImages((p) => [...p, res.data.url]);
        } else {
          alert("Upload failed: " + (res.data.error || "Unknown error"));
        }
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Failed to upload image to the server.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(Array.from(files));
    // Reset so picking the same file again re-triggers onChange
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Ignore leave events fired when moving over child elements
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (uploading) return;
    uploadFiles(Array.from(e.dataTransfer.files));
  };

  const [submitting, setSubmitting] = useState(false);

  const publishListing = async (role: ListingRole) => {
    if (submitting) return;
    setSubmitting(true);

    try {
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

      const isSale = slug === "buy" || slug === "land" || slug === "lease";
      const isPG = slug === "pg" || slug === "coliving";
      const rawPrice = isSale ? form.price : isStay ? form.tariff : form.rent;
      let numericPrice = parseInt(rawPrice || "0", 10) || 0;

      let priceStr = "";
      const activeConfigs = roomConfigurations.filter((rc) => rc.numberOfRooms > 0);
      if (isPG && activeConfigs.length > 0) {
        const prices = activeConfigs.map((rc) => Number(rc.pricePerBed)).filter(Boolean);
        if (prices.length > 0) {
          numericPrice = Math.min(...prices);
        }
      }

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

      const fullAddress = [
        form.houseNo,
        form.project,
        form.street,
        form.locality,
        form.city || "Bengaluru"
      ].filter(Boolean).join(", ");

      const payload = {
        title,
        location: fullAddress,
        price: priceStr,
        priceValue: numericPrice,
        image: images[0],
        images,
        badge: slug === "pg"
          ? "PG"
          : slug === "coliving"
          ? "Co-living"
          : isStay
          ? getCategory(slug)?.label ?? "Stay"
          : form.apartmentType || "Flat",
        rating: 5.0,
        category: slug,
        // Sent explicitly — deriving these from the address string put the
        // house number in `locality` and left `bhk` unset, so neither the
        // locality nor the BHK filter could ever match a posted listing.
        locality: form.locality || undefined,
        city: form.city || "Bengaluru",
        // "1 RK" is not a 1 BHK, so only real BHK values set the column.
        bhk: /^(\d+)\+?\s*BHK$/i.test(form.bhk ?? "")
          ? parseInt(String(form.bhk), 10)
          : undefined,
        gender: form.pgFor || undefined,
        metroDistance: "300m from metro",
        reviewCount: 0,
        amenities: amenities,
        verified: true,
        noBrokerage: true,
        furnishing: form.furnishing || "Semi furnished",
        availableFrom: form.available || "Available now",
        area: form.area ? `${form.area} sq ft` : undefined,
        landArea: form.landArea ? `${form.landArea} sq ft` : undefined,
        description: form.description,
        spec: form.bhk || undefined,
        roomTypes: [],
        roomConfigurations: isPG ? activeConfigs : undefined,
        listedBy: role,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      };

      const res = await apiClient.post("/listings", payload);
      if (res.data && res.data.success) {
        setPublished(true);
      } else {
        alert("Failed to publish listing: " + (res.data.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Error publishing listing:", err);
      alert("Failed to connect to the backend server to publish listing.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            
            let city = addr.city || addr.town || addr.village || addr.state_district || "Bengaluru";
            if (city.toLowerCase().includes("bangalore")) {
              city = "Bengaluru";
            }
            
            const locality = addr.suburb || addr.neighbourhood || addr.neighborhood || addr.quarter || "";
            const project = addr.building || addr.construction || addr.amenity || addr.shop || addr.tourism || "";
            const street = addr.road || addr.residential || "";
            const houseNo = addr.house_number || "";
            const landmark = addr.point_of_interest || addr.monument || "";

            setForm((prev) => ({
              ...prev,
              city: city,
              locality: locality,
              project: project,
              street: street,
              houseNo: houseNo,
              landmark: landmark,
              latitude: latitude.toString(),
              longitude: longitude.toString(),
            }));
            
            alert(`Location detected successfully: ${locality || project || street || city}`);
          } else {
            alert("No address results found for this location.");
          }
        } catch (err) {
          console.error("Geocoding failed:", err);
          alert("Unable to fetch address details. Please fill in the details manually.");
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        console.error("Geolocation failed:", error);
        alert(`Location detection failed: ${error.message}. Please input details manually.`);
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const category = getCategory(slug);
  const worldCategories = categoriesForWorld(world).filter(
    (c) => c.slug !== "buy"
  );
  const theme = WORLD_THEME[world];

  const set = (k: string, v: string) => {
    setForm((p) => {
      const nextForm = { ...p, [k]: v };
      if (k === "apartmentType") {
        if (v === "Plot") {
          delete nextForm.bhk;
          delete nextForm.floor;
          delete nextForm.totalFloors;
          delete nextForm.age;
          delete nextForm.area;
        } else {
          delete nextForm.dimensions;
          if (v === "Apartment" || v === "Individual Floor") {
            delete nextForm.landArea;
          } else if (v === "Independent House" || v === "Gated Villa") {
            delete nextForm.floor;
          }
        }
      }

      if (k === "dimensions" && nextForm.apartmentType === "Plot") {
        const match = v.match(/(\d+(?:\.\d+)?)\s*[*xX×]\s*(\d+(?:\.\d+)?)/);
        if (match) {
          const wVal = parseFloat(match[1]);
          const hVal = parseFloat(match[2]);
          if (!isNaN(wVal) && !isNaN(hVal)) {
            nextForm.landArea = Math.round(wVal * hVal).toString();
          }
        }
      }
      return nextForm;
    });
  };
  const toggleAmenity = (a: string) =>
    setAmenities((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]));
  const toggleDay = (d: string) =>
    setDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));

  const chooseSlug = (s: string) => {
    setSlug(s);
    const allowed = amenitiesFor(s);
    setAmenities((p) => p.filter((a) => allowed.includes(a)));
    if (s === "pg" || s === "coliving") {
      setRoomConfigurations([
        { sharingType: "single", numberOfRooms: 0, bedsPerRoom: 1, totalBeds: 0, occupiedBeds: 0, availableBeds: 0, pricePerBed: 0, pricePerRoom: undefined },
        { sharingType: "double", numberOfRooms: 0, bedsPerRoom: 2, totalBeds: 0, occupiedBeds: 0, availableBeds: 0, pricePerBed: 0, pricePerRoom: undefined },
        { sharingType: "triple", numberOfRooms: 0, bedsPerRoom: 3, totalBeds: 0, occupiedBeds: 0, availableBeds: 0, pricePerBed: 0, pricePerRoom: undefined },
        { sharingType: "four", numberOfRooms: 0, bedsPerRoom: 4, totalBeds: 0, occupiedBeds: 0, availableBeds: 0, pricePerBed: 0, pricePerRoom: undefined },
      ]);
    }
  };

  const chooseWorld = (w: World) => {
    setWorld(w);
    chooseSlug(categoriesForWorld(w)[0].slug);
  };

  const progressIndex = selectedRole === "builder"
    ? (active >= 3 ? active - 1 : active)
    : active;
  const maxProgressIndex = selectedRole === "builder"
    ? WIZARD_STEPS.length - 2
    : WIZARD_STEPS.length - 1;
  const progress = Math.round((progressIndex / maxProgressIndex) * 100);
  const last = active === WIZARD_STEPS.length - 1;

  const labelCls = "text-[12px] font-semibold text-ink block mb-1";
  const field = "w-full border border-hairline rounded-[8px] px-3 h-11 text-sm text-ink outline-none focus:border-ink focus:border-2 transition-colors bg-canvas";

  // Helper to pick input fields icons
  const getFieldIcon = (key: string) => {
    const iconClass = "text-muted shrink-0 mr-2.5";
    switch (key) {
      case "pgName":
      case "spaceName":
      case "stayName":
      case "resortName":
      case "saName":
      case "hotelName":
      case "project":
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>;
      case "totalBeds":
      case "seats":
      case "maxGuests":
      case "rooms":
      case "totalRooms":
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>;
      case "area":
      case "landArea":
      case "plotArea":
      case "frontage":
      case "dimensions":
      case "ceiling":
      case "docks":
      case "power":
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}><path d="M4 19h16M4 5h16M12 5v14" /></svg>;
      case "locality":
      case "landmark":
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>;
      case "rent":
      case "deposit":
      case "maintenance":
      case "price":
      case "tariff":
      case "monthlyTariff":
        return <span className="text-muted font-bold text-sm shrink-0 mr-2.5 select-none">₹</span>;
      case "available":
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
      default:
        return null;
    }
  };

  const renderField = (f: FieldDef) => {
    const isFieldDisabled = f.key === "floor" && form.apartmentType === "Independent House";

    if (f.type === "select" || f.type === "pills") {
      return (
        <div className={`flex flex-wrap gap-2 ${isFieldDisabled ? "opacity-50 pointer-events-none" : ""}`}>
          {f.options.map((o) => {
            const on = form[f.key] === o;
            return (
              <button
                key={o}
                type="button"
                disabled={isFieldDisabled}
                onClick={() => set(f.key, o)}
                aria-pressed={on}
                className={`px-3.5 py-2 text-xs font-semibold rounded-[8px] border text-center transition-all ${
                  on ? theme.chip + " border-transparent scale-[1.01] shadow-sm" : "bg-canvas text-ink border-hairline hover:border-ink hover:scale-[1.01]"
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
      <div className={`relative flex items-center border border-hairline rounded-[8px] h-11 px-3 bg-canvas transition-all focus-within:border-ink focus-within:ring-1 focus-within:ring-ink ${isFieldDisabled ? "opacity-50 pointer-events-none" : ""}`}>
        {getFieldIcon(f.key)}
        <input
          type={f.type === "number" ? "text" : f.type}
          inputMode={f.type === "number" ? "numeric" : undefined}
          disabled={isFieldDisabled}
          value={form[f.key] ?? ""}
          onChange={(e) => set(f.key, e.target.value)}
          placeholder={"placeholder" in f ? f.placeholder : undefined}
          className={`flex-1 min-w-0 text-sm text-ink placeholder-muted outline-none bg-transparent ${f.type === "date" && !form[f.key] ? "text-muted" : ""}`}
        />
      </div>
    );
  };

  const renderFieldGroup = (fields: FieldDef[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
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

  // Success screen
  if (published) {
    return (
      <div className="h-dvh w-screen flex flex-col justify-between overflow-hidden bg-canvas">
        <style dangerouslySetInnerHTML={{ __html: `
          body > nav, body > footer, .bottom-nav { display: none !important; }
          body > .flex-1 { height: 100vh !important; height: 100dvh !important; max-height: 100vh !important; max-height: 100dvh !important; overflow: hidden !important; }
        `}} />
        {/* Header */}
        <header className="h-16 px-6 md:px-10 flex items-center justify-between border-b border-hairline bg-canvas shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-extrabold text-rausch text-lg tracking-tight">findway.</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-semibold px-4 py-2 border border-hairline rounded-full hover:border-ink transition-colors">
              Home
            </Link>
            <Link href="/explore" className="text-xs font-semibold px-4 py-2 border border-hairline rounded-full hover:border-ink transition-colors">
              Exit
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6 bg-canvas overflow-y-auto">
          <div className="max-w-[480px] w-full text-center py-6">
            <span className="inline-flex w-14 h-14 rounded-full bg-rausch/10 text-rausch items-center justify-center mb-4" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6L9 17l-5-5" /></svg>
            </span>
            <h1 className="text-[24px] font-bold text-ink tracking-tight mb-2">Submitted for review</h1>
            <p className="text-sm text-body mb-6">
              Posted as <span className="font-medium text-ink">{selectedRole ? selectedRole[0].toUpperCase() + selectedRole.slice(1) : "you"}</span>.
              Our team will review it shortly — once approved, it goes live and seekers can find it.
              We&apos;ll notify you on WhatsApp when it&apos;s published and when seekers respond.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/explore" className="h-11 px-5 inline-flex items-center justify-center bg-rausch text-white text-sm font-semibold rounded-[8px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2">
                Browse listings
              </Link>
              <button
                type="button"
                onClick={() => { setPublished(false); setActive(0); setForm({}); setImages([]); setSelectedRole(null); }}
                className="h-11 px-5 inline-flex items-center justify-center border border-hairline text-ink text-sm font-medium rounded-[8px] hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                List another property
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const showSidebar = active > 2;
  const localitySuggestions = (() => {
    if (form.city !== "Bengaluru") return [];
    const q = (form.locality || "").trim().toLowerCase();
    const matches = q
      ? BENGALURU_LOCALITIES.filter((loc) => loc.toLowerCase().includes(q))
      : BENGALURU_LOCALITIES;
    // Rank names that start with the query above ones that merely contain it.
    if (q) {
      matches.sort((a, b) => {
        const as = a.toLowerCase().startsWith(q) ? 0 : 1;
        const bs = b.toLowerCase().startsWith(q) ? 0 : 1;
        return as - bs;
      });
    }
    return matches.slice(0, 50); // cap DOM nodes; list is ~1700 entries
  })();

  return (
    <div className="h-dvh w-screen flex flex-col justify-between overflow-hidden bg-canvas">
      {/* CSS overrides to hide layout wrapper's Navbar, Footer, and BottomNav */}
      <style dangerouslySetInnerHTML={{ __html: `
        body > nav, body > footer, .bottom-nav { display: none !important; }
        body > .flex-1 { height: 100vh !important; height: 100dvh !important; max-height: 100vh !important; max-height: 100dvh !important; overflow: hidden !important; }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(0.97); }
        }
        .animate-bounce-slow {
          animation: bounceSlow 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulseSlow 4s ease-in-out infinite;
        }
      `}} />

      {/* Top Header */}
      <header className="h-16 px-6 md:px-10 flex items-center justify-between border-b border-hairline bg-canvas shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-extrabold text-rausch text-lg tracking-tight">findway.</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <Link href="/" className="text-xs font-semibold px-4 py-2 border border-hairline rounded-full hover:border-ink hover:bg-surface-soft transition-all">
            Home
          </Link>
          <Link href="/explore" className="text-xs font-semibold px-4 py-2 border border-hairline rounded-full hover:border-ink hover:bg-surface-soft transition-all">
            Save & exit
          </Link>
        </div>
      </header>

      {/* Main Workspace split */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-canvas">
        {/* Left pane: dynamic descriptive contextual help in light theme */}
        <div className="w-full md:w-5/12 bg-surface-soft border-b md:border-b-0 md:border-r border-hairline p-4 md:p-12 flex flex-col items-center justify-center text-ink shrink-0">
          <div key={active} className="w-full flex flex-col items-center justify-center animate-fade-up">
            <div className="hidden md:block">
              {renderStepCartoonGraphic(active, selectedRole, world)}
            </div>
            <div className="text-center md:text-left w-full max-w-[340px]">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-70 mb-1 md:mb-2 block">
                {selectedRole === "builder"
                  ? `Step ${active >= 3 ? active : active + 1} of ${WIZARD_STEPS.length - 1}`
                  : `Step ${active + 1} of ${WIZARD_STEPS.length}`}
              </span>
              <h2 className="text-lg md:text-3.5xl font-extrabold leading-tight tracking-tight mb-1 md:mb-4 text-ink">
                {getStepTitle(active, category?.label ?? "Property")}
              </h2>
              <p className="text-xs md:text-base opacity-85 leading-relaxed text-body hidden md:block">
                {getStepDescription(active, category?.label ?? "Property")}
              </p>
            </div>
          </div>
        </div>

        {/* Right pane: center-aligned scrollable workspace area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 flex items-center justify-center bg-canvas">
          <div key={active} className="w-full max-w-[620px] py-4 animate-fade-up">
            {/* Step 0: Choose Listing Role & Auth */}
            {active === 0 && (
              <div className="space-y-5">
                <p className="text-xs text-body text-center mb-1">How are you listing this property?</p>
                
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { value: "owner", title: "Owner", desc: "List your own home", emoji: "🏠" },
                    { value: "builder", title: "Builder", desc: "List developer projects", emoji: "🏗️" },
                    { value: "agent", title: "Agent", desc: "List on client behalf", emoji: "💼" }
                  ] as const).map((r) => {
                    const isSelected = selectedRole === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => {
                          setSelectedRole(r.value);
                          if (r.value === "owner" && slug === "buy") {
                            setSlug("rent");
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-4 rounded-[14px] border-2 transition-all ${
                          isSelected
                            ? "border-rausch bg-rausch/5 shadow-airbnb scale-[1.01]"
                            : "border-hairline hover:border-ink hover:scale-[1.01]"
                        }`}
                      >
                        <span className="text-2xl mb-1.5">{r.emoji}</span>
                        <span className="font-bold text-ink text-xs">{r.title}</span>
                        <span className="text-[10px] text-muted text-center mt-0.5 leading-tight hidden sm:block">{r.desc}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedRole && (
                  <div className="animate-fade-up">
                    {session ? (
                      <div className="text-center py-4">
                        <p className="text-xs text-ink mb-3">Logged in as <span className="font-semibold">{session.name}</span></p>
                        <button
                          type="button"
                          onClick={() => setActive(1)}
                          className="w-full max-w-[240px] h-11 bg-rausch text-white font-semibold rounded-[10px] hover:bg-rausch-active transition-colors shadow-airbnb"
                        >
                          Continue
                        </button>
                      </div>
                    ) : (
                      <div className="mt-6 border-t border-hairline pt-4 max-w-[360px] mx-auto">
                        <p className="text-[11px] text-muted text-center mb-3">Please log in or register to continue listing as {selectedRole}</p>
                        <div role="tablist" aria-label="Auth modes" className="flex gap-1 p-1 bg-surface-soft rounded-[10px] mb-4">
                          {(["login", "signup"] as const).map((m) => (
                            <button
                              key={m}
                              role="tab"
                              aria-selected={authTab === m}
                              onClick={() => setAuthTab(m)}
                              className={`relative flex-1 h-9 text-xs font-medium rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                                authTab === m ? "bg-canvas text-ink shadow-airbnb" : "text-muted hover:text-ink"
                              }`}
                            >
                              {m === "login" ? "Log in" : "Sign up"}
                            </button>
                          ))}
                        </div>

                        <div key={authTab} className="animate-fade-up">
                          {authTab === "login" ? (
                            <LoginForm onSuccess={() => setActive(1)} />
                          ) : (
                            <SignupForm onSuccess={() => setActive(1)} />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Choose Property Category */}
            {active === 1 && (
              <div className="space-y-5">
                <p className="text-xs text-body text-center mb-1">What kind of property is it?</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {([
                    { key: "residential", title: "Residential", desc: "Flats, Villas, PGs, Co-living", emoji: "🏘️" },
                    { key: "commercial", title: "Commercial", desc: "Offices, Shops, Warehouses, Lands", emoji: "🏢" },
                    { key: "stay", title: "Stay / Hospitality", desc: "Homestays, Resorts, Hotels", emoji: "🏖️" }
                  ] as const).map((w) => {
                    const isSelected = world === w.key;
                    return (
                      <button
                        key={w.key}
                        type="button"
                        onClick={() => {
                          chooseWorld(w.key);
                          setActive(selectedRole === "builder" ? 3 : 2);
                        }}
                        className={`flex flex-col items-center justify-center p-5 rounded-[16px] border-2 text-center transition-all ${
                          isSelected
                            ? "border-rausch bg-rausch/5 shadow-airbnb scale-[1.01]"
                            : "border-hairline hover:border-ink hover:scale-[1.01]"
                        }`}
                      >
                        <span className="text-3xl mb-2">{w.emoji}</span>
                        <span className="font-bold text-ink text-sm mb-0.5">{w.title}</span>
                        <span className="text-[11px] text-muted leading-tight">{w.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Choose Listing Type */}
            {active === 2 && (
              <div className="space-y-5">
                <p className="text-xs text-body text-center mb-1">Select the listing type for your {world} property</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {worldCategories.map((c) => {
                    const isSelected = slug === c.slug;
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => {
                          chooseSlug(c.slug);
                          setActive(3);
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-[12px] border-2 text-center transition-all ${
                          isSelected
                            ? theme.chip + " border-transparent scale-[1.01] shadow-sm"
                            : "bg-canvas text-ink border-hairline hover:border-ink hover:scale-[1.01]"
                        }`}
                      >
                        <span className="font-bold text-xs mb-0.5">{c.label}</span>
                        <span className={`text-[9px] ${isSelected ? "text-white/80" : "text-muted"} leading-tight`}>{c.subtitle}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {active === 3 && (
              <div className="space-y-4">
                {renderFieldGroup(detailFields(slug, form.apartmentType))}
              </div>
            )}

            {/* Step 4: Locality (Advanced UI) */}
            {active === 4 && (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Select City<span className="text-rausch"> *</span></label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                    {citiesList.map((c) => {
                      const isSelected = form.city === c.name;
                      const isDisabled = c.name !== "Bengaluru";
                      return (
                        <button
                          key={c.name}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            set("city", c.name);
                            set("locality", "");
                          }}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-[10px] border-2 transition-all ${
                            isSelected
                              ? "border-rausch bg-rausch/5 shadow-airbnb scale-[1.01]"
                              : isDisabled
                              ? "border-hairline opacity-40 cursor-not-allowed pointer-events-none"
                              : "border-hairline hover:border-ink hover:scale-[1.01]"
                          }`}
                        >
                          <span className="text-xl mb-1">{c.emoji}</span>
                          <span className="font-bold text-ink text-[11px]">{c.name}</span>
                          <span className="text-[8px] text-muted mt-0.5">{c.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-hairline-soft relative" ref={suggestionsRef}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[12px] font-semibold text-ink">Locality / Area<span className="text-rausch"> *</span></label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={detecting}
                      className="text-xs font-semibold text-rausch hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rausch rounded-[4px] px-1.5 py-0.5 disabled:opacity-50"
                    >
                      {detecting ? (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full border border-rausch border-t-transparent animate-spin inline-block mr-1" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <span>🎯</span> Locate Me
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="relative flex items-center border border-hairline rounded-[8px] h-11 px-3 bg-canvas transition-all focus-within:border-ink focus-within:ring-1 focus-within:ring-ink">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted shrink-0 mr-2.5">
                      <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <input
                      className="flex-1 text-sm text-ink placeholder-muted outline-none bg-transparent"
                      placeholder={form.city === "Bengaluru" ? "Search Bengaluru localities (e.g. Indiranagar)" : "e.g. Koramangala"}
                      value={form.locality ?? ""}
                      onFocus={() => setShowSuggestions(true)}
                      onChange={(e) => {
                        set("locality", e.target.value);
                        setShowSuggestions(true);
                      }}
                    />
                  </div>
                  
                  {form.city === "Bengaluru" && showSuggestions && localitySuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 z-55 mt-1 max-h-48 overflow-y-auto bg-canvas border border-hairline rounded-[8px] shadow-airbnb py-1 animate-fade-up">
                      {localitySuggestions.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            set("locality", loc);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-ink hover:bg-surface-soft transition-colors flex items-center gap-1.5"
                        >
                          <span>📍</span>
                          <span className="font-medium">{loc}</span>
                          <span className="text-[9px] text-muted ml-auto">Bengaluru</span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {!form.locality && <p className="text-[10px] text-error mt-1">Please specify a valid locality</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>House / Flat / Block No.</label>
                    <div className="relative flex items-center border border-hairline rounded-[8px] h-11 px-3 bg-canvas transition-all focus-within:border-ink focus-within:ring-1 focus-within:ring-ink">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted shrink-0 mr-2.5">
                        <path d="M3 9l9-7 9 7v11a2 2 0 002 2h10a2 2 0 002-2V9l-9-7-9 7z" />
                      </svg>
                      <input
                        className="flex-1 text-sm text-ink placeholder-muted outline-none bg-transparent"
                        placeholder="e.g. Flat 402, Block B"
                        value={form.houseNo ?? ""}
                        onChange={(e) => set("houseNo", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Apartment / Society / Building Name</label>
                    <div className="relative flex items-center border border-hairline rounded-[8px] h-11 px-3 bg-canvas transition-all focus-within:border-ink focus-within:ring-1 focus-within:ring-ink">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted shrink-0 mr-2.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
                      </svg>
                      <input
                        className="flex-1 text-sm text-ink placeholder-muted outline-none bg-transparent"
                        placeholder="e.g. Prestige Shantiniketan"
                        value={form.project ?? ""}
                        onChange={(e) => set("project", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Street / Road / Lane</label>
                  <div className="relative flex items-center border border-hairline rounded-[8px] h-11 px-3 bg-canvas transition-all focus-within:border-ink focus-within:ring-1 focus-within:ring-ink">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted shrink-0 mr-2.5">
                      <path d="M4 19h16M4 5h16M12 5v14" />
                    </svg>
                    <input
                      className="flex-1 text-sm text-ink placeholder-muted outline-none bg-transparent"
                      placeholder="e.g. 100 Feet Road"
                      value={form.street ?? ""}
                      onChange={(e) => set("street", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Nearby Landmark</label>
                  <div className="relative flex items-center border border-hairline rounded-[8px] h-11 px-3 bg-canvas transition-all focus-within:border-ink focus-within:ring-1 focus-within:ring-ink">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted shrink-0 mr-2.5">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                    </svg>
                    <input
                      className="flex-1 text-sm text-ink placeholder-muted outline-none bg-transparent"
                      placeholder="e.g. Near Forum Mall"
                      value={form.landmark ?? ""}
                      onChange={(e) => set("landmark", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Pricing */}
            {active === 5 && (
              slug === "pg" || slug === "coliving" ? (
                <RoomConfigurationEditor
                  roomConfigurations={roomConfigurations}
                  setRoomConfigurations={setRoomConfigurations}
                />
              ) : (
                renderFieldGroup(pricingFields(slug))
              )
            )}

            {/* Step 6: Amenities (Airbnb-style Grid) */}
            {active === 6 && (
              <div className="space-y-4">
                <p className="text-xs text-body text-center mb-2">Select the amenities available for your listing</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenitiesFor(slug).map((a) => {
                    const isSelected = amenities.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAmenity(a)}
                        aria-pressed={isSelected}
                        className={`group flex flex-col items-start p-4 rounded-[12px] border-2 text-left transition-all ${
                          isSelected
                            ? theme.chip + " border-transparent scale-[1.01] shadow-sm"
                            : "bg-canvas text-ink border-hairline hover:border-ink hover:scale-[1.01]"
                        }`}
                      >
                        {getAmenityIcon(a, isSelected)}
                        <span className="font-bold text-xs mt-1 leading-tight">{a}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 7: Photos (Airbnb Grid Layout) */}
            {active === 7 && (
              <div className="space-y-4" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                <p className="text-xs text-body text-center mb-1">Upload at least 3 photos of your property</p>

                {images.length === 0 ? (
                  /* Zero State: Large drag-and-drop / upload card area */
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={uploading}
                    className={`w-full h-64 border-2 border-dashed rounded-[16px] flex flex-col items-center justify-center transition-all group ${
                      dragActive ? "border-ink bg-surface" : "border-hairline bg-surface-soft hover:bg-surface hover:border-ink"
                    }`}
                  >
                    {uploading ? (
                      <span className="text-sm font-semibold text-body">Uploading...</span>
                    ) : (
                      <>
                        <svg className="w-10 h-10 text-muted group-hover:text-ink mb-3 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        <span className="font-bold text-sm text-ink mb-0.5">Drag your photos here</span>
                        <span className="text-xs text-muted">or click to browse from your device</span>
                      </>
                    )}
                  </button>
                ) : (
                  /* Uploaded State: Airbnb style Grid */
                  <div className="grid grid-cols-3 gap-3 aspect-[4/3] w-full rounded-[16px] overflow-hidden border border-hairline bg-surface-soft">
                    {/* Main Cover Image (First one) */}
                    <div className="col-span-2 row-span-2 relative bg-surface-strong group overflow-hidden">
                      <img src={images[0]} alt="Property cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <span className="absolute top-3 left-3 bg-ink/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-full select-none">Cover photo</span>
                      <button type="button" onClick={() => setImages((p) => p.filter((_, idx) => idx !== 0))} className="absolute top-3 right-3 w-6 h-6 rounded-full bg-ink/80 text-white text-xs flex items-center justify-center hover:bg-ink focus-visible:outline-none" aria-label="Remove cover photo">✕</button>
                    </div>

                    {/* Small grid on the right (Images 2, 3, etc.) */}
                    <div className="col-span-1 row-span-2 grid grid-rows-2 gap-3 h-full">
                      {/* Image 2 */}
                      <div className="relative bg-surface-strong overflow-hidden group">
                        {images[1] ? (
                          <>
                            <img src={images[1]} alt="Property interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <button type="button" onClick={() => setImages((p) => p.filter((_, idx) => idx !== 1))} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-ink/80 text-white text-[10px] flex items-center justify-center hover:bg-ink" aria-label="Remove photo 2">✕</button>
                          </>
                        ) : (
                          <button type="button" onClick={handleUploadClick} disabled={uploading} className="w-full h-full flex flex-col items-center justify-center border border-dashed border-hairline hover:bg-surface hover:border-ink transition-colors">
                            {uploading ? <span className="text-[10px] font-semibold">Uploading...</span> : <span className="text-xs text-muted font-bold">+ Add Photo</span>}
                          </button>
                        )}
                      </div>

                      {/* Image 3 */}
                      <div className="relative bg-surface-strong overflow-hidden group">
                        {images[2] ? (
                          <>
                            <img src={images[2]} alt="Property view" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <button type="button" onClick={() => setImages((p) => p.filter((_, idx) => idx !== 2))} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-ink/80 text-white text-[10px] flex items-center justify-center hover:bg-ink" aria-label="Remove photo 3">✕</button>
                          </>
                        ) : (
                          <button type="button" onClick={handleUploadClick} disabled={uploading} className="w-full h-full flex flex-col items-center justify-center border border-dashed border-hairline hover:bg-surface hover:border-ink transition-colors">
                            {uploading ? <span className="text-[10px] font-semibold">Uploading...</span> : <span className="text-xs text-muted font-bold">+ Add Photo</span>}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional uploaded photos slider/row if there are more than 3 */}
                {images.length >= 3 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-ink">Additional photos ({images.length - 3} uploaded)</label>
                      {images.length < 8 && (
                        <button type="button" onClick={handleUploadClick} disabled={uploading} className="text-xs font-semibold text-rausch hover:underline">
                          {uploading ? "Uploading..." : "+ Upload more"}
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {images.slice(3).map((img, i) => (
                        <div key={img} className="relative aspect-square bg-surface-strong rounded-[8px] overflow-hidden group">
                          <img src={img} alt={`Extra property photo ${i + 1}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setImages((p) => p.filter((_, idx) => idx !== i + 3))} className="absolute top-1 right-1 w-4 h-4 rounded-full bg-ink/80 text-white text-[9px] flex items-center justify-center hover:bg-ink" aria-label={`Remove additional photo ${i + 1}`}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                <p className="text-[11px] text-muted">Properties with high-quality photos get up to 5× more leads.</p>
                {images.length < 1 && (
                  <p className="text-[11px] text-error mt-2 font-semibold">
                    ⚠️ Please add at least 1 photo to continue (added: {images.length}/1)
                  </p>
                )}
              </div>
            )}

            {/* Step 8: Visit Schedule */}
            {active === 8 && (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Available days for visits</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {visitDays.map((d) => (
                      <button key={d} type="button" onClick={() => toggleDay(d)} aria-pressed={days.includes(d)} className={`px-2.5 py-1 text-xs rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${days.includes(d) ? "bg-ink text-white border-ink" : "bg-canvas border-hairline text-body hover:border-ink"}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className={labelCls}>If you want to say more about the property?</label>
                  <textarea
                    value={form.description ?? ""}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="e.g. Spacious balcony, friendly neighbours, close to parks..."
                    className="w-full border border-hairline rounded-[8px] p-3 text-sm text-ink outline-none focus:border-ink focus:border-2 transition-colors bg-canvas h-24 resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Progress & Nav Footer */}
      <footer className="h-20 border-t border-hairline bg-canvas px-6 md:px-10 flex flex-col justify-center shrink-0">
        <div className="w-full mb-3">
          <div className="h-1 bg-surface-strong w-full rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-300 ${theme.bar}`} style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActive((i) => {
              const prev = i - 1;
              if (prev === 2 && selectedRole === "builder") {
                return 1;
              }
              return Math.max(0, prev);
            })}
            disabled={active === 0}
            className="px-4 h-10 border border-hairline text-ink text-xs font-semibold rounded-[8px] hover:bg-surface-soft disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            ← Back
          </button>
          
          <div className="flex items-center gap-2">
            {active > 2 && (
              <button className="px-3.5 h-10 border border-rausch text-rausch text-xs font-semibold rounded-[8px] hover:bg-rausch/5 transition-colors">
                Preview
              </button>
            )}
            
            {!(active === 0 && !session) && (
              <button
                disabled={!isStepValid(active)}
                onClick={() => {
                  if (last) {
                    publishListing(selectedRole || "owner");
                  } else {
                    setActive((i) => {
                      const next = i + 1;
                      if (next === 2 && selectedRole === "builder") {
                        return 3;
                      }
                      return next;
                    });
                  }
                }}
                className={`px-5 h-10 text-white text-xs font-semibold rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.solid} ${theme.ring} disabled:opacity-50`}
              >
                {last ? "Publish listing" : "Save & continue"}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
