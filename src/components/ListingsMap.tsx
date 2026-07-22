"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, ZoomControl, Marker, Popup, Polyline, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import Image from "next/image";
import { PURPLE_LINE_COORDS, GREEN_LINE_COORDS, METRO_STATIONS } from "@/lib/metroData";

// Helper component to handle Leaflet size invalidation when container visibility/dimensions change
function MapResizeObserver() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;

    // Trigger an initial size invalidation to resolve any initial render sizing issues
    map.invalidateSize();

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [map]);

  return null;
}

// Bengaluru city center (M.G. Road / Vidhana Soudha area)
const BENGALURU: [number, number] = [12.9716, 77.5946];
const DEFAULT_ZOOM = 12;

function getDistanceInMeters(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371000; // Radius of the Earth in meters
  const dLat = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const dLon = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1[0] * Math.PI) / 180) *
      Math.cos((coord2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getNearestStation(listingCoords: [number, number]) {
  if (!listingCoords || listingCoords.length !== 2) return null;
  let nearestStation = null;
  let minDistance = Infinity;

  for (const station of METRO_STATIONS) {
    const dist = getDistanceInMeters(listingCoords, station.coordinates);
    if (dist < minDistance) {
      minDistance = dist;
      nearestStation = station;
    }
  }

  return nearestStation ? { station: nearestStation, distance: minDistance } : null;
}

interface ListingsMapProps {
  listings?: any[];
}

export default function ListingsMap({ listings = [] }: ListingsMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showMetro, setShowMetro] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-neutral-100 animate-pulse flex items-center justify-center text-sm font-semibold text-neutral-400">
        Loading Map View...
      </div>
    );
  }

  // Generate deterministic mock coordinates if none exist
  const getCoords = (listing: any, index: number): [number, number] => {
    if (listing.latitude && listing.longitude) {
      const lat = Number(listing.latitude);
      const lng = Number(listing.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
      }
    }
    // Generate deterministic mock coordinates in Bengaluru spread around city center
    const baseLat = 12.9716;
    const baseLng = 77.5946;
    const angle = (index * 2 * Math.PI) / (listings.length || 1);
    const radius = 0.02 + (index * 0.004) % 0.035;
    return [baseLat + Math.sin(angle) * radius, baseLng + Math.cos(angle) * radius];
  };

  const createPriceIcon = (price: string) => {
    // E.g., "₹18,500/mo" -> "₹18,500"
    const label = price.split("/")[0].trim();

    return L.divIcon({
      className: "custom-price-marker-container",
      html: `
        <div style="
          background-color: white;
          color: #222222;
          border: 1px solid rgba(0, 0, 0, 0.15);
          font-size: 13px;
          font-weight: 800;
          padding: 5px 10px;
          border-radius: 24px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          white-space: nowrap;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
        " class="hover:bg-neutral-950 hover:text-white hover:border-neutral-950 hover:scale-105">
          ${label}
        </div>
      `,
      iconSize: [60, 28],
      iconAnchor: [30, 14],
    });
  };

  return (
    <div className="w-full h-full relative" style={{ minHeight: "350px" }}>
      {/* Metro Toggle Overlay */}
      <div className="absolute top-4 right-4 z-[999] bg-white/95 backdrop-blur-sm border border-neutral-200/80 shadow-md rounded-xl p-3 flex flex-col gap-2 max-w-[180px]">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Map Options</span>
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showMetro}
            onChange={() => setShowMetro(!showMetro)}
            className="w-4 h-4 rounded text-rausch border-neutral-300 focus:ring-rausch cursor-pointer"
          />
          <span className="text-xs font-bold text-neutral-800">Show Metro Routes</span>
        </label>
      </div>

      <MapContainer
        center={BENGALURU}
        zoom={DEFAULT_ZOOM}
        minZoom={10}
        maxZoom={18}
        scrollWheelZoom
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
        className="w-full h-full"
        maxBounds={[
          [12.6, 77.2],
          [13.3, 78.0],
        ]}
        maxBoundsViscosity={0.9}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomControl position="bottomright" />
        <MapResizeObserver />

        {/* Bengaluru Metro Routes & Stations */}
        {showMetro && (
          <>
            {/* Purple Line */}
            <Polyline
              positions={PURPLE_LINE_COORDS}
              pathOptions={{ color: "#800080", weight: 4, opacity: 0.8 }}
            />
            {/* Green Line */}
            <Polyline
              positions={GREEN_LINE_COORDS}
              pathOptions={{ color: "#008000", weight: 4, opacity: 0.8 }}
            />

            {/* Metro Stations */}
            {METRO_STATIONS.map((station) => {
              const markerColor =
                station.line === "purple"
                  ? "#800080"
                  : station.line === "green"
                  ? "#008000"
                  : "#FF8C00"; // orange/amber for interchange (Majestic)
              return (
                <CircleMarker
                  key={station.name}
                  center={station.coordinates}
                  radius={6}
                  pathOptions={{
                    fillColor: markerColor,
                    color: "#ffffff",
                    weight: 2,
                    fillOpacity: 1,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                    <div className="text-xs font-bold text-neutral-900 flex flex-col gap-0.5">
                      <span>🚇 {station.name}</span>
                      <span className="text-[9px] text-neutral-500 font-medium capitalize">
                        {station.line} Line Station
                      </span>
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}
          </>
        )}

        {listings.map((listing, index) => {
          const position = getCoords(listing, index);
          const icon = createPriceIcon(listing.price);

          return (
            <Marker key={listing.id} position={position} icon={icon}>
              <Popup className="custom-leaflet-popup">
                <div className="w-[200px] flex flex-col font-sans overflow-hidden rounded-[14px]">
                  {listing.image && (
                    <div className="relative h-28 w-full bg-neutral-100">
                      <Image
                        src={listing.image}
                        alt={listing.title}
                        fill
                        sizes="200px"
                        className="object-cover rounded-t-[14px]"
                      />
                    </div>
                  )}
                  <div className="p-3 bg-white flex flex-col gap-1 text-left">
                    <span className="text-[9px] font-extrabold text-white bg-rausch px-2 py-0.5 rounded-[4px] self-start uppercase tracking-wider">
                      {listing.badge}
                    </span>
                    <h4 className="text-sm font-bold text-neutral-900 truncate mt-1">
                      {listing.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {listing.location}
                    </p>

                    {/* Nearest Metro Station distance */}
                    {(() => {
                      const nearest = getNearestStation(position);
                      if (!nearest) return null;
                      const distText =
                        nearest.distance < 1000
                          ? `${Math.round(nearest.distance)}m`
                          : `${(nearest.distance / 1000).toFixed(1)} km`;
                      return (
                        <p className="text-[10px] text-purple-700 font-bold flex items-center gap-1.5 mt-0.5 bg-purple-50 border border-purple-100 rounded-md px-1.5 py-0.5 self-start">
                          <span>🚇</span>
                          <span>
                            {distText} to {nearest.station.name.split(" ")[0]}
                          </span>
                        </p>
                      );
                    })()}

                    <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-neutral-100">
                      <span className="text-[13px] font-extrabold text-rausch">
                        {listing.price}
                      </span>
                      <Link
                        href={`/listing/${listing.id}`}
                        className="text-[11px] font-bold text-neutral-800 hover:text-rausch transition-colors underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
