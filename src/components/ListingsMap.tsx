"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, ZoomControl, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import Image from "next/image";

// Bengaluru city center (M.G. Road / Vidhana Soudha area)
const BENGALURU: [number, number] = [12.9716, 77.5946];
const DEFAULT_ZOOM = 12;

interface ListingsMapProps {
  listings?: any[];
}

export default function ListingsMap({ listings = [] }: ListingsMapProps) {
  const [isMounted, setIsMounted] = useState(false);

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
    // E.g., "₹18,500/mo" -> "18.5k" or similar short labels
    let label = price.split("/")[0].replace("₹", "").trim();
    if (label.includes(",")) {
      const val = parseInt(label.replace(/,/g, ""));
      if (!isNaN(val) && val >= 1000) {
        label = `₹${(val / 1000).toFixed(0)}k`;
      } else {
        label = `₹${label}`;
      }
    } else {
      label = `₹${label}`;
    }

    return L.divIcon({
      className: "custom-price-marker-container",
      html: `
        <div style="
          background-color: white;
          color: #FF5A5F;
          border: 2px solid #FF5A5F;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 9999px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
          white-space: nowrap;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        " class="hover:bg-rausch hover:text-white hover:scale-105">
          ${label}
        </div>
      `,
      iconSize: [45, 24],
      iconAnchor: [22, 12],
    });
  };

  return (
    <div className="w-full h-full relative" style={{ minHeight: "350px" }}>
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
