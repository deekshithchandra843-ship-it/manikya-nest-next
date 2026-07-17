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

const BENGALURU_LOCALITIES = [
  "Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Jayanagar",
  "JP Nagar", "BTM Layout", "Malleshwaram", "Hebbal", "Marathahalli",
  "Bellandur", "Electronic City", "Rajajinagar", "Banashankari",
  "Kalyan Nagar", "Yelahanka", "Sadashivanagar", "Domlur", "Kaggadasapura",
  "Sarjapur Road", "Richmond Town", "MG Road", "Basavanagudi", "Vasanth Nagar",
  "Vidyaranyapura", "RT Nagar", "Sanjay Nagar", "Bannerghatta Road", "Brookefield",
  "Kanakapura Road", "Hennur Road", "OMBR Layout", "HRBR Layout", "Banaswadi"
];

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
  const common = "w-32 h-32 md:w-44 md:h-44 text-ink opacity-90 transition-all duration-700 hover:scale-105 shrink-0 mb-6";
  const lineStroke = "2";
  
  if (active === 0) {
    if (selectedRole === "builder") {
      return (
        <svg className={`${common} animate-bounce-slow`} viewBox="0 0 100 100" fill="none">
          {/* Cartoon Crane & Builder Tower */}
          <rect x="25" y="40" width="30" height="50" rx="6" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth={lineStroke} />
          <line x1="35" y1="50" x2="45" y2="50" stroke="currentColor" strokeWidth={lineStroke} strokeLinecap="round" />
          <line x1="35" y1="65" x2="45" y2="65" stroke="currentColor" strokeWidth={lineStroke} strokeLinecap="round" />
          <line x1="35" y1="80" x2="45" y2="80" stroke="currentColor" strokeWidth={lineStroke} strokeLinecap="round" />
          {/* Crane */}
          <path d="M65 90 V25 H85 M65 35 L80 15" stroke="currentColor" strokeWidth={lineStroke} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="85" cy="25" r="4" fill="currentColor" />
          <circle cx="65" cy="90" r="6" stroke="currentColor" strokeWidth={lineStroke} />
        </svg>
      );
    }
    if (selectedRole === "agent") {
      return (
        <svg className={`${common} animate-pulse-slow`} viewBox="0 0 100 100" fill="none">
          {/* Handshake & Deal Illustration */}
          <rect x="20" y="25" width="60" height="50" rx="10" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth={lineStroke} />
          <circle cx="50" cy="50" r="14" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth={lineStroke} />
          <path d="M42 50l6 5 10-10" stroke="currentColor" strokeWidth={lineStroke} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 45h10M75 45h10M50 15v10" stroke="currentColor" strokeWidth={lineStroke} strokeLinecap="round" />
        </svg>
      );
    }
    return (
      <svg className={`${common} animate-bounce-slow`} viewBox="0 0 100 100" fill="none">
        {/* Cartoon Owner House & Key */}
        <path d="M20 50 L50 20 L80 50 V85 H20 Z" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth={lineStroke} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M42 85 V62 H58 V85" stroke="currentColor" strokeWidth={lineStroke} />
        <circle cx="50" cy="38" r="7" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth={lineStroke} />
        <g className="animate-pulse-slow">
          <circle cx="75" cy="25" r="8" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth={lineStroke} />
          <path d="M75 33v20h-8v-6h8" stroke="currentColor" strokeWidth={lineStroke} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    );
  }

  if (active === 1) {
    if (world === "commercial") {
      return (
        <svg className={`${common} animate-pulse-slow`} viewBox="0 0 100 100" fill="none">
          {/* Corporate/Commercial Cartoon Office Tower */}
          <rect x="30" y="15" width="40" height="75" rx="8" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth={lineStroke} />
          <rect x="40" y="25" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth={lineStroke} />
          <rect x="52" y="25" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth={lineStroke} />
          <rect x="40" y="40" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth={lineStroke} />
          <rect x="52" y="40" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth={lineStroke} />
          <rect x="40" y="55" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth={lineStroke} />
          <rect x="52" y="55" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth={lineStroke} />
          <rect x="46" y="74" width="8" height="16" stroke="currentColor" strokeWidth={lineStroke} />
        </svg>
      );
    }
    if (world === "stay") {
      return (
        <svg className={`${common} animate-bounce-slow`} viewBox="0 0 100 100" fill="none">
          {/* Cartoon Beach Hospitality / Homestay */}
          <path d="M15 85h70" stroke="currentColor" strokeWidth={lineStroke} strokeLinecap="round" />
          <path d="M50 20 L20 48 h60 Z" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth={lineStroke} strokeLinejoin="round" />
          <rect x="30" y="48" width="40" height="37" fill="currentColor" fillOpacity="0.02" stroke="currentColor" strokeWidth={lineStroke} />
          {/* Palm Tree */}
          <path d="M80 85c-2-15-8-25-18-28" stroke="currentColor" strokeWidth={lineStroke} />
          <path d="M62 57c-2-8-8-12-14-6 2 8 8 10 14 6z M62 57c8-2 12-8 6-14-8 2-10 8-6 14z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth={lineStroke} />
        </svg>
      );
    }
    return (
      <svg className={`${common} animate-bounce-slow`} viewBox="0 0 100 100" fill="none">
        {/* Residential Cozy Homes */}
        <path d="M15 52 L40 28 L65 52 V85 H15 Z" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth={lineStroke} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M50 50 L72 30 L94 52 V85 H50 Z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth={lineStroke} strokeLinecap="round" strokeLinejoin="round" />
        <rect x="28" y="60" width="12" height="25" stroke="currentColor" strokeWidth={lineStroke} />
        <circle cx="40" cy="42" r="5" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth={lineStroke} />
      </svg>
    );
  }

  if (active === 2) {
    return (
      <svg className={`${common} animate-pulse-slow`} viewBox="0 0 100 100" fill="none">
        {/* Cartoon Checklist / Option selection */}
        <rect x="15" y="15" width="70" height="70" rx="12" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth={lineStroke} />
        <circle cx="35" cy="35" r="6" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth={lineStroke} />
        <path d="M50 35h25" stroke="currentColor" strokeWidth={lineStroke} strokeLinecap="round" />
        <circle cx="35" cy="55" r="6" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth={lineStroke} />
        <path d="M50 55h25" stroke="currentColor" strokeWidth={lineStroke} strokeLinecap="round" />
        <circle cx="35" cy="70" r="6" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth={lineStroke} />
        <path d="M50 70h15" stroke="currentColor" strokeWidth={lineStroke} strokeLinecap="round" />
      </svg>
    );
  }

  if (active === 3) {
    return (
      <svg className={`${common} animate-bounce-slow`} viewBox="0 0 100 100" fill="none">
        {/* Cartoon specs / details sheet */}
        <rect x="20" y="15" width="60" height="75" rx="8" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth={lineStroke} />
        <path d="M35 30h30M35 45h30M35 60h20M35 75h30" stroke="currentColor" strokeWidth={lineStroke} strokeLinecap="round" />
        {/* Cute cartoon star */}
        <path d="M72 15l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth={lineStroke} />
      </svg>
    );
  }

  if (active === 4) {
    return (
      <svg className={`${common} animate-bounce-slow`} viewBox="0 0 100 100" fill="none">
        {/* Map pin / locating art */}
        <circle cx="50" cy="85" r="15" fill="none" stroke="currentColor" strokeWidth={lineStroke} strokeDasharray="6 6" />
        <path d="M50 15c-15 0-27 12-27 27c0 22 27 45 27 45s27-23 27-45c0-15-12-27-27-27z" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth={lineStroke} strokeLinejoin="round" />
        <circle cx="50" cy="42" r="10" fill="currentColor" />
      </svg>
    );
  }

  if (active === 5) {
    return (
      <svg className={`${common} animate-pulse-slow`} viewBox="0 0 100 100" fill="none">
        {/* Cute Piggy bank pricing art */}
        <circle cx="50" cy="55" r="30" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth={lineStroke} />
        <circle cx="40" cy="48" r="3.5" fill="currentColor" />
        {/* Snout */}
        <rect x="15" y="50" width="10" height="12" rx="4" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth={lineStroke} />
        {/* Ears */}
        <path d="M35 28l-8-12 12 4z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth={lineStroke} />
        {/* Slot */}
        <rect x="46" y="10" width="8" height="18" rx="2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth={lineStroke} />
      </svg>
    );
  }

  if (active === 6) {
    return (
      <svg className={`${common} animate-bounce-slow`} viewBox="0 0 100 100" fill="none">
        {/* Cartoon amenities - Gift package / Sparkles */}
        <rect x="25" y="35" width="50" height="50" rx="8" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth={lineStroke} />
        <path d="M25 50h50M50 35v50" stroke="currentColor" strokeWidth={lineStroke} />
        {/* Ribbon */}
        <path d="M50 35c-10-10-20 0-10 10 10-10 20 0 10-10z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth={lineStroke} />
        <path d="M15 25l4 4-4 4M85 25l-4 4 4 4" stroke="currentColor" strokeWidth={lineStroke} strokeLinecap="round" />
      </svg>
    );
  }

  if (active === 7) {
    return (
      <svg className={`${common} rotate-3 hover:rotate-0`} viewBox="0 0 100 100" fill="none">
        {/* Polaroid photo / Camera artwork */}
        <rect x="20" y="20" width="60" height="65" rx="6" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth={lineStroke} />
        <rect x="28" y="28" width="44" height="40" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth={lineStroke} />
        {/* Cartoon sun in photo */}
        <circle cx="60" cy="38" r="5" fill="currentColor" />
        {/* Mountain in photo */}
        <path d="M28 68l15-20 12 14 10-12 7 18z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth={lineStroke} strokeLinejoin="round" />
      </svg>
    );
  }

  if (active === 8) {
    return (
      <svg className={`${common} animate-pulse-slow`} viewBox="0 0 100 100" fill="none">
        {/* Cartoon calendar/clock schedule */}
        <rect x="20" y="25" width="60" height="60" rx="8" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth={lineStroke} />
        <rect x="20" y="25" width="60" height="18" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth={lineStroke} />
        <circle cx="35" cy="55" r="4" fill="currentColor" />
        <circle cx="50" cy="55" r="4" fill="currentColor" />
        <circle cx="65" cy="55" r="4" fill="currentColor" />
        <circle cx="35" cy="70" r="4" fill="currentColor" />
        <circle cx="50" cy="70" r="4" fill="currentColor" />
        <circle cx="65" cy="70" r="4" fill="currentColor" />
        {/* Spiral bindings */}
        <path d="M35 15v15M65 15v15" stroke="currentColor" strokeWidth={lineStroke} strokeLinecap="round" />
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
const apartmentTypes = ["Apartment", "Independent House", "Gated Villa", "Standalone"];
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
        { key: "sharing", label: "Sharing type", type: "select", options: ["Single", "Double", "Triple", "Four+"], half: true },
        { key: "pgFor", label: "PG is for", type: "pills", options: ["Girls", "Boys", "Anyone"], required: true },
        { key: "suitedFor", label: "Best suited for", type: "pills", options: ["Students", "Professionals", "Both"] },
        { key: "meals", label: "Meals available", type: "pills", options: ["Yes", "No"] },
      ];
    case "coliving":
      return [
        { key: "spaceName", label: "Space name", type: "text", placeholder: "e.g. Sunrise Co-living", required: true },
        { key: "roomType", label: "Room type", type: "select", options: ["Single room", "Twin sharing", "Studio"], required: true, half: true },
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
    default:
      return [
        { key: "apartmentType", label: "Property type", type: "select", options: apartmentTypes, required: true },
        { key: "bhk", label: "BHK type", type: "select", options: bhkTypes, required: true },
        { key: "floor", label: "Floor", type: "select", options: floorOptions, half: true },
        { key: "totalFloors", label: "Total floors", type: "select", options: floorOptions, half: true },
        { key: "age", label: "Property age", type: "select", options: propertyAges, half: true },
        { key: "facing", label: "Facing direction", type: "select", options: facings, half: true },
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listing role selection state
  const [selectedRole, setSelectedRole] = useState<ListingRole | null>(null);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [published, setPublished] = useState(false);

  // Locality suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Geolocation lookup state
  const [detecting, setDetecting] = useState(false);

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
      const fields = detailFields(slug);
      return fields.filter((f) => f.required).every((f) => form[f.key] && form[f.key].trim() !== "");
    }
    if (stepIndex === 4) {
      return !!(form.city && form.city.trim() && form.locality && form.locality.trim());
    }
    if (stepIndex === 5) {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
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
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Failed to upload image to the server.");
    } finally {
      setUploading(false);
    }
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
        roomTypes: [],
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
  const worldCategories = categoriesForWorld(world);
  const theme = WORLD_THEME[world];

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
    if (f.type === "select" || f.type === "pills") {
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
      <div className="relative flex items-center border border-hairline rounded-[8px] h-11 px-3 bg-canvas transition-all focus-within:border-ink focus-within:ring-1 focus-within:ring-ink">
        {getFieldIcon(f.key)}
        <input
          type={f.type === "number" ? "text" : f.type}
          inputMode={f.type === "number" ? "numeric" : undefined}
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
  const localitySuggestions = form.city === "Bengaluru"
    ? BENGALURU_LOCALITIES.filter((loc) =>
        loc.toLowerCase().includes((form.locality || "").toLowerCase())
      )
    : [];

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
          <div className="hidden md:block">
            {renderStepCartoonGraphic(active, selectedRole, world)}
          </div>
          <div className="text-center md:text-left w-full max-w-[340px]">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-70 mb-1 md:mb-2 block">Step {active + 1} of {WIZARD_STEPS.length}</span>
            <h2 className="text-lg md:text-3.5xl font-extrabold leading-tight tracking-tight mb-1 md:mb-4 text-ink">
              {getStepTitle(active, category?.label ?? "Property")}
            </h2>
            <p className="text-xs md:text-base opacity-85 leading-relaxed text-body hidden md:block">
              {getStepDescription(active, category?.label ?? "Property")}
            </p>
          </div>
        </div>

        {/* Right pane: center-aligned scrollable workspace area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 flex items-center justify-center bg-canvas">
          <div className="w-full max-w-[620px] py-4">
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
                        onClick={() => setSelectedRole(r.value)}
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
                          setActive(2);
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
                {renderFieldGroup(detailFields(slug))}
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
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            set("city", c.name);
                            set("locality", "");
                          }}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-[10px] border-2 transition-all ${
                            isSelected
                              ? "border-rausch bg-rausch/5 shadow-airbnb scale-[1.01]"
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
            {active === 5 && renderFieldGroup(pricingFields(slug))}

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
              <div className="space-y-4">
                <p className="text-xs text-body text-center mb-1">Upload at least 3 photos of your property</p>

                {images.length === 0 ? (
                  /* Zero State: Large drag-and-drop / upload card area */
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={uploading}
                    className="w-full h-64 border-2 border-dashed border-hairline rounded-[16px] flex flex-col items-center justify-center bg-surface-soft hover:bg-surface hover:border-ink transition-all group"
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
            onClick={() => setActive((i) => Math.max(0, i - 1))}
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
                    setActive((i) => i + 1);
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
