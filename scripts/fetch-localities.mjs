// One-time / occasional export of Bengaluru localities from OpenStreetMap.
// Data source: OSM via the free Overpass API (place=suburb|neighbourhood|quarter|town|village)
// inside the Greater Bengaluru bounding box. Re-run to refresh:  node scripts/fetch-localities.mjs
// Output: src/data/bengaluru-localities.json  ->  [{ name, lat, lng }]
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "bengaluru-localities.json");

// Curated "popular" areas surfaced first in the empty-search dropdown (UX parity with old list).
const POPULAR = [
  "Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Jayanagar",
  "JP Nagar", "BTM Layout", "Malleshwaram", "Hebbal", "Marathahalli",
  "Bellandur", "Electronic City", "Rajajinagar", "Banashankari",
  "Kalyan Nagar", "Yelahanka", "Domlur", "Sarjapur Road", "MG Road", "Basavanagudi",
];

const query = `
[out:json][timeout:120];
(
  node["place"~"^(suburb|neighbourhood|quarter|town|village)$"](12.70,77.35,13.25,77.85);
);
out body;`;

const endpoints = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

let data = null;
for (const url of endpoints) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "manikya-locality-export/1.0" },
      body: "data=" + encodeURIComponent(query),
    });
    const text = await res.text();
    if (!text.trim().startsWith("{")) { console.error("bad response from", url, res.status); continue; }
    data = JSON.parse(text);
    console.log("fetched from", url);
    break;
  } catch (e) { console.error("error from", url, e.message); }
}
if (!data) { console.error("all Overpass endpoints failed"); process.exit(1); }

// ASCII-named nodes only (keeps the typeahead English); trim + round coords.
const rows = data.elements
  .filter((e) => e.tags && e.tags.name && /^[\x00-\x7F ]+$/.test(e.tags.name))
  .map((e) => ({ name: e.tags.name.trim(), lat: +e.lat.toFixed(5), lng: +e.lon.toFixed(5) }));

// Dedupe by lowercased name (first occurrence wins).
const seen = new Set();
const unique = [];
for (const r of rows) {
  const k = r.name.toLowerCase();
  if (seen.has(k)) continue;
  seen.add(k);
  unique.push(r);
}

// Popular first (in listed order), then the rest alphabetically.
const popularSet = new Set(POPULAR.map((n) => n.toLowerCase()));
const byName = new Map(unique.map((r) => [r.name.toLowerCase(), r]));
const head = POPULAR.map((n) => byName.get(n.toLowerCase())).filter(Boolean);
const tail = unique
  .filter((r) => !popularSet.has(r.name.toLowerCase()))
  .sort((a, b) => a.name.localeCompare(b.name));
const out = [...head, ...tail];

writeFileSync(OUT, JSON.stringify(out) + "\n");
console.log(`wrote ${out.length} localities -> ${OUT}`);
