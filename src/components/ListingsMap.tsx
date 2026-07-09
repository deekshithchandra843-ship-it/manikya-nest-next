"use client";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Bengaluru city center (M.G. Road / Vidhana Soudha area) and a zoom that
// frames the whole metro area where FindWay lists.
const BENGALURU: [number, number] = [12.9716, 77.5946];
const DEFAULT_ZOOM = 11;

/**
 * The map surface for the category page's "Map view".
 * For now this just renders the Bengaluru map inside its container; listing
 * pins/zones get layered on next. The parent supplies the rounded, fixed-height
 * frame, so the map fills 100% of it.
 */
export default function ListingsMap() {
  return (
    <MapContainer
      center={BENGALURU}
      zoom={DEFAULT_ZOOM}
      minZoom={10}
      maxZoom={18}
      scrollWheelZoom
      zoomControl={false}
      style={{ height: "100%", width: "100%" }}
      className="rounded-[14px]"
      // Keep the map inside greater Bengaluru so users can't pan off to sea.
      maxBounds={[
        [12.7, 77.3],
        [13.25, 77.9],
      ]}
      maxBoundsViscosity={0.9}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
}
