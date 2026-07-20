// Canonical generator for src/data/bengaluru-localities.json.
// 1. Fetches every named place in the Greater Bengaluru bbox from OpenStreetMap
//    (Overpass API, free, no key)  ->  ~1900 areas / sub-areas / villages.
// 2. Drops ambiguous bare fragments ("1st Block", "Sector 4", "Phase 2" ...) that
//    OSM stores without their parent area — those are useless in a flat typeahead.
// 3. Merges a curated set of parent-prefixed stages/blocks/phases/sectors so the
//    well-known layouts (Koramangala, Jayanagar, JP Nagar, BTM, HSR, Banashankari,
//    Indiranagar, Rajajinagar, Electronic City ...) are searchable by full name.
// 4. Dedupes (case-insensitive), surfaces POPULAR first, rest alphabetical.
// Run:  node scripts/build-localities.mjs
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "bengaluru-localities.json");

// Surfaced first in the empty-search dropdown.
const POPULAR = [
  "Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Jayanagar",
  "JP Nagar", "BTM Layout", "Malleshwaram", "Hebbal", "Marathahalli",
  "Bellandur", "Electronic City", "Rajajinagar", "Banashankari",
  "Kalyan Nagar", "Yelahanka", "Domlur", "Sarjapur Road", "MG Road", "Basavanagudi",
];

// Curated parent-prefixed sub-areas (stages / blocks / phases / sectors). These keep
// full, unambiguous names so "Koramangala 5th Block" is searchable even though OSM
// only stores a bare "5th Block" node.
const CURATED = [
  // BTM Layout
  ["BTM 1st Stage", 12.919, 77.60528], ["BTM 2nd Stage", 12.914, 77.61028],
  ["BTM 3rd Stage", 12.908, 77.61528], ["BTM 4th Stage", 12.902, 77.62528],
  // JP Nagar
  ["JP Nagar 1st Phase", 12.90569, 77.58261], ["JP Nagar 2nd Phase", 12.90569, 77.58661],
  ["JP Nagar 3rd Phase", 12.90569, 77.59061], ["JP Nagar 4th Phase", 12.90969, 77.58261],
  ["JP Nagar 5th Phase", 12.90969, 77.58661], ["JP Nagar 6th Phase", 12.90969, 77.59061],
  ["JP Nagar 7th Phase", 12.91369, 77.58261], ["JP Nagar 8th Phase", 12.91369, 77.58661],
  ["JP Nagar 9th Phase", 12.91369, 77.59061],
  // HSR Layout
  ["HSR Layout Sector 1", 12.90662, 77.63386], ["HSR Layout Sector 2", 12.90662, 77.63886],
  ["HSR Layout Sector 3", 12.90662, 77.64386], ["HSR Layout Sector 4", 12.91162, 77.63386],
  ["HSR Layout Sector 5", 12.91162, 77.63886], ["HSR Layout Sector 6", 12.91162, 77.64386],
  ["HSR Layout Sector 7", 12.91662, 77.63386],
  // Jayanagar
  ["Jayanagar 1st Block", 12.92527, 77.57842], ["Jayanagar 2nd Block", 12.92527, 77.58242],
  ["Jayanagar 3rd Block", 12.92527, 77.58642], ["Jayanagar 4th Block", 12.92927, 77.57842],
  ["Jayanagar 4th T Block", 12.92327, 77.58742], ["Jayanagar 5th Block", 12.92927, 77.58242],
  ["Jayanagar 6th Block", 12.92927, 77.58642], ["Jayanagar 7th Block", 12.93327, 77.57842],
  ["Jayanagar 8th Block", 12.93327, 77.58242], ["Jayanagar 9th Block", 12.93327, 77.58642],
  // Koramangala
  ["Koramangala 1st Block", 12.93274, 77.62108], ["Koramangala 2nd Block", 12.93274, 77.62408],
  ["Koramangala 3rd Block", 12.93274, 77.62708], ["Koramangala 4th Block", 12.93574, 77.62108],
  ["Koramangala 5th Block", 12.93574, 77.62408], ["Koramangala 6th Block", 12.93574, 77.62708],
  ["Koramangala 7th Block", 12.93874, 77.62108], ["Koramangala 8th Block", 12.93874, 77.62408],
  // Banashankari
  ["Banashankari 1st Stage", 12.93782, 77.56462], ["Banashankari 2nd Stage", 12.93282, 77.56062],
  ["Banashankari 3rd Stage", 12.92782, 77.55662], ["Banashankari 4th Stage", 12.92282, 77.55262],
  ["Banashankari 5th Stage", 12.91782, 77.54862], ["Banashankari 6th Stage", 12.91282, 77.54462],
  // Rajajinagar
  ["Rajajinagar 1st Block", 12.98023, 77.55888], ["Rajajinagar 2nd Block", 12.98423, 77.55688],
  ["Rajajinagar 3rd Block", 12.98823, 77.55488], ["Rajajinagar 4th Block", 12.99223, 77.55288],
  ["Rajajinagar 5th Block", 12.99623, 77.55088], ["Rajajinagar 6th Block", 13.00023, 77.54888],
  // Indiranagar
  ["Indiranagar 1st Stage", 12.97029, 77.63747], ["Indiranagar 2nd Stage", 12.97329, 77.64047],
  ["Indiranagar 3rd Stage", 12.97629, 77.64347],
  // Electronic City
  ["Electronic City Phase 1", 12.84364, 77.66868], ["Electronic City Phase 2", 12.83264, 77.68968],
  // Vijayanagar / RPC Layout / RR Nagar area stages
  ["Vijayanagar 1st Stage", 12.97162, 77.53624], ["Vijayanagar 2nd Stage", 12.96762, 77.53224],
  ["Rajarajeshwari Nagar", 12.92463, 77.51841], ["Kengeri Satellite Town", 12.90563, 77.47341],
  // Kumaraswamy Layout / Padmanabhanagar stages
  ["Kumaraswamy Layout 1st Stage", 12.90623, 77.56691], ["Kumaraswamy Layout 2nd Stage", 12.90223, 77.56291],
  // Nagarbhavi
  ["Nagarbhavi 1st Stage", 12.96741, 77.51142], ["Nagarbhavi 2nd Stage", 12.96341, 77.50742],
].map(([name, lat, lng]) => ({ name, lat, lng }));

// Ambiguous bare fragments OSM stores without a parent area — unsearchable in a flat list.
const AMBIGUOUS = /^(\d+(st|nd|rd|th)?\s+)?(block|phase|stage|sector|cross|main|main road|cross road|a block|b block|c block|d block|e block)$/i;
const isJunk = (name) =>
  AMBIGUOUS.test(name) ||
  /^(sector|phase|stage|block)\s*\d+$/i.test(name) ||   // "Sector 4", "Phase 2"
  name.length < 3;

const query = `
[out:json][timeout:120];
(
  node["place"~"^(suburb|neighbourhood|quarter|hamlet|town|village|locality)$"](12.70,77.35,13.25,77.85);
);
out body;`;

const endpoints = [
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

let data = null;
for (const url of endpoints) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "manikya-locality-export/2.0" },
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

// ASCII-named, trimmed, junk-free.
const osm = data.elements
  .filter((e) => e.tags && e.tags.name && /^[\x00-\x7F ]+$/.test(e.tags.name))
  .map((e) => ({ name: e.tags.name.trim(), lat: +e.lat.toFixed(5), lng: +e.lon.toFixed(5) }))
  .filter((r) => !isJunk(r.name));

// Dedupe by lowercased name; curated entries win over OSM.
const seen = new Set();
const unique = [];
for (const r of [...CURATED, ...osm]) {
  const k = r.name.toLowerCase();
  if (seen.has(k)) continue;
  seen.add(k);
  unique.push(r);
}

const popularSet = new Set(POPULAR.map((n) => n.toLowerCase()));
const byName = new Map(unique.map((r) => [r.name.toLowerCase(), r]));
const head = POPULAR.map((n) => byName.get(n.toLowerCase())).filter(Boolean);
const tail = unique
  .filter((r) => !popularSet.has(r.name.toLowerCase()))
  .sort((a, b) => a.name.localeCompare(b.name));
const finalOut = [...head, ...tail];

writeFileSync(OUT, JSON.stringify(finalOut, null, 2) + "\n");
console.log(`wrote ${finalOut.length} localities (${osm.length} from OSM, ${CURATED.length} curated) -> ${OUT}`);
