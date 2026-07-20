import BENGALURU_LOCALITIES from "@/data/bengaluru-localities.json";

export interface ParsedSearchFilters {
  category?: string;
  bhk?: string;
  locality?: string;
  latitude?: string;
  longitude?: string;
  radiusKm?: string;
  chips?: string;
}

// Synonyms map to category slugs
const CATEGORY_MAP: Record<string, string> = {
  pg: "pg",
  hostel: "pg",
  coliving: "coliving",
  "co-living": "coliving",
  flat: "rent",
  apartment: "rent",
  house: "rent",
  rent: "rent",
  buy: "buy",
  villa: "buy",
  plot: "buy",
  office: "commercial-office",
  shop: "commercial-shop",
  commercial: "commercial-office",
  stay: "hotel",
  resort: "resort",
};

/** Helper to get current coordinates using browser Geolocation */
export function getBrowserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported by browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

/** Parses raw natural language search string into structured API query parameters */
export async function parseQuery(queryText: string): Promise<ParsedSearchFilters> {
  const normalized = queryText.toLowerCase().trim();
  const filters: ParsedSearchFilters = {};

  // 1. Extract BHK (e.g. 2bhk, 1 bhk)
  const bhkMatch = normalized.match(/(\d)\s*bhk/i);
  if (bhkMatch) {
    filters.bhk = bhkMatch[1];
  }

  // 2. Identify Category
  for (const [key, slug] of Object.entries(CATEGORY_MAP)) {
    if (normalized.includes(key)) {
      filters.category = slug;
      break;
    }
  }

  // 3. Near Me / Location Proximity Search
  if (
    normalized.includes("near me") ||
    normalized.includes("nearby") ||
    normalized.includes("close by") ||
    normalized.includes("near my location")
  ) {
    try {
      const coords = await getBrowserLocation();
      filters.latitude = String(coords.latitude);
      filters.longitude = String(coords.longitude);
      filters.radiusKm = "5"; // Default 5km radius
      return filters; // Skip locality matching since geolocation is active
    } catch (e) {
      console.warn("Failed to get geolocation for 'near me' query, falling back to name matching", e);
    }
  }

  // 4. Match Locality/Area from JSON
  // Sort by name length descending to ensure longer layout names match first (e.g. AECS Layout A Block before AECS Layout)
  const sortedLocalities = [...BENGALURU_LOCALITIES].sort((a, b) => b.name.length - a.name.length);
  for (const loc of sortedLocalities) {
    if (normalized.includes(loc.name.toLowerCase())) {
      filters.locality = loc.name;
      filters.latitude = String(loc.lat);
      filters.longitude = String(loc.lng);
      filters.radiusKm = "5"; // 5km proximity radius around the locality center
      break;
    }
  }

  // 5. Add residual words as general chips if no locality matches
  if (!filters.locality && !filters.latitude) {
    const cleanChips = normalized
      .replace(/\b(\d\s*bhk|near\s+me|nearby)\b/gi, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !Object.keys(CATEGORY_MAP).includes(w));
    if (cleanChips.length) {
      filters.chips = cleanChips.join(",");
    }
  }

  return filters;
}
