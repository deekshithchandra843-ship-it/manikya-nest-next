"use client";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, ZoomControl, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { categoryMeta, jobCoords, pinLabel, type Job } from "@/lib/jobs";

const BENGALURU: [number, number] = [12.9491, 77.6392];
const DEFAULT_ZOOM = 12;

/** Salary-on-pin, weighted by job category — the jobs analogue of price-on-pin
 *  for homes. The hovered pin gets a sun ring so list↔map hover stays in
 *  sync in both directions. */
const SUN = "#fcdb32";
const NAVY = "#141d38";

function salaryIcon(job: Job, active: boolean): L.DivIcon {
  const { pinBg, pinFg } = categoryMeta(job.category);
  return L.divIcon({
    className: "jobs-map-pin",
    html: `<div style="
      background:${active ? SUN : pinBg};
      color:${active ? NAVY : pinFg};
      border:2px solid ${active ? NAVY : pinBg === "#ffffff" ? NAVY : pinBg};
      box-shadow:${active ? `0 0 0 4px rgba(252,219,50,0.35),` : ""} 0 4px 10px -2px rgba(0,0,0,0.25);
      font-size:11px;font-weight:800;padding:3px 9px;border-radius:9999px;
      white-space:nowrap;text-align:center;cursor:pointer;
      transform:${active ? "scale(1.08)" : "scale(1)"};
      transition:transform .15s ease-out;
    ">${pinLabel(job)}</div>`,
    iconSize: [56, 24],
    iconAnchor: [28, 12],
  });
}

/** Reports the ids currently inside the viewport so the list can narrow to
 *  "jobs in view" as the user pans — matching the property map behavior. */
function ViewportReporter({ jobs, onViewportChange }: { jobs: Job[]; onViewportChange: (ids: string[]) => void }) {
  const map = useMap();

  const report = () => {
    const bounds = map.getBounds();
    onViewportChange(jobs.filter((j) => bounds.contains(jobCoords(j))).map((j) => j.id));
  };

  useMapEvents({ moveend: report, zoomend: report });

  // Report once on mount and whenever the filtered set changes underneath us.
  useEffect(report, [jobs]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

interface JobsMapProps {
  jobs: Job[];
  hoveredId?: string | null;
  selectedId?: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  onViewportChange?: (ids: string[]) => void;
  /** Detail pages pass a tight center/zoom to show one job's exact spot. */
  center?: [number, number];
  zoom?: number;
  /** Mini-maps are decorative — no panning, no zooming. */
  interactive?: boolean;
}

export default function JobsMap({
  jobs,
  hoveredId = null,
  selectedId = null,
  onHover,
  onSelect,
  onViewportChange,
  center = BENGALURU,
  zoom = DEFAULT_ZOOM,
  interactive = true,
}: JobsMapProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const markers = useMemo(
    () =>
      jobs.map((job) => {
        const active = job.id === hoveredId || job.id === selectedId;
        return { job, position: jobCoords(job), icon: salaryIcon(job, active), active };
      }),
    [jobs, hoveredId, selectedId]
  );

  if (!mounted) return <div className="w-full h-full skeleton rounded-[14px]" aria-hidden="true" />;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={10}
      maxZoom={18}
      scrollWheelZoom={interactive}
      dragging={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      keyboard={interactive}
      zoomControl={false}
      style={{ height: "100%", width: "100%" }}
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
      {interactive && <ZoomControl position="bottomright" />}
      {onViewportChange && <ViewportReporter jobs={jobs} onViewportChange={onViewportChange} />}

      {markers.map(({ job, position, icon, active }) => (
        <Marker
          key={job.id}
          position={position}
          icon={icon}
          zIndexOffset={active ? 1000 : 0}
          eventHandlers={{
            mouseover: () => onHover?.(job.id),
            mouseout: () => onHover?.(null),
            click: () => onSelect?.(job.id),
          }}
        />
      ))}
    </MapContainer>
  );
}
