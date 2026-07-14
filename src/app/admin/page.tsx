"use client";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/apiClient";

/* ------------------------------------------------------------------ *
 * FindWay — Listing Control Center
 * The moderation gate between "submitted" and "live". Reviews the
 * pending_review queue with automated pre-checks (risk flags), search,
 * filters and bulk actions, then approves / rejects / deletes via the API.
 * Access control + shell live in admin/layout.tsx.
 * ------------------------------------------------------------------ */

interface PendingListing {
  id: string;
  title: string;
  category: string;
  world: string;
  price: string;
  priceValue?: number;
  location: string;
  image: string;
  status: string;
  noBrokerage?: boolean;
  spec?: string;
  area?: string;
  furnishing?: string;
  availableFrom?: string;
  metroDistance?: string;
  amenities?: string[];
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  createdAt?: string;
}

type Flag = { id: string; label: string; tone: "danger" | "warn" };
type WorldFilter = "all" | "residential" | "commercial" | "stay";
type SortKey = "risk" | "oldest" | "newest" | "price_desc" | "price_asc";

const PLACEHOLDER = "/listings/placeholder.jpg";
const norm = (s?: string) => (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");

/**
 * Automated pre-checks — the first layer of the moderation pipeline.
 * Lightweight client-side heuristics (the seed of a real server-side risk
 * engine): duplicate detection, price outliers and completeness.
 */
function computeFlags(item: PendingListing, all: PendingListing[]): Flag[] {
  const flags: Flag[] = [];

  const dupe = all.some(
    (o) =>
      o.id !== item.id &&
      (norm(o.title) === norm(item.title) ||
        (norm(o.location) === norm(item.location) && o.price === item.price))
  );
  if (dupe) flags.push({ id: "dupe", label: "Possible duplicate", tone: "danger" });

  const peers = all
    .filter((o) => o.category === item.category && (o.priceValue ?? 0) > 0)
    .map((o) => o.priceValue as number)
    .sort((a, b) => a - b);
  if (peers.length >= 4 && item.priceValue) {
    const median = peers[Math.floor(peers.length / 2)];
    if (item.priceValue > median * 3) flags.push({ id: "hi", label: "Price looks high", tone: "warn" });
    else if (item.priceValue < median / 3) flags.push({ id: "lo", label: "Price looks low", tone: "warn" });
  }

  if (!item.image || item.image === PLACEHOLDER) flags.push({ id: "img", label: "No photo", tone: "warn" });
  if (!item.ownerPhone) flags.push({ id: "phone", label: "No contact number", tone: "warn" });
  if (!item.spec && !item.area) flags.push({ id: "spec", label: "Missing specs", tone: "warn" });

  return flags;
}

function FlagPill({ flag }: { flag: Flag }) {
  const styles =
    flag.tone === "danger"
      ? "bg-rausch/10 text-rausch border-rausch/20"
      : "bg-amber-400/10 text-amber-700 border-amber-400/30";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles}`}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      {flag.label}
    </span>
  );
}

function StatTile({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-canvas border border-hairline rounded-[14px] p-4 shadow-3d-soft">
      <p className={`text-2xl font-extrabold tracking-tight ${accent ?? "text-ink"}`}>{value}</p>
      <p className="text-[11px] font-semibold text-muted mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminControlCenter() {
  const [listings, setListings] = useState<PendingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [worldFilter, setWorldFilter] = useState<WorldFilter>("all");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("risk");

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<{ success: boolean; data: PendingListing[] }>("/listings/pending");
      if (res.data?.success) setListings(res.data.data);
    } catch (err) {
      console.error("Failed to fetch pending listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const flagsById = useMemo(() => {
    const map = new Map<string, Flag[]>();
    for (const item of listings) map.set(item.id, computeFlags(item, listings));
    return map;
  }, [listings]);

  const stats = useMemo(() => {
    let flagged = 0,
      danger = 0,
      zeroBrokerage = 0;
    for (const item of listings) {
      const f = flagsById.get(item.id) ?? [];
      if (f.length) flagged++;
      if (f.some((x) => x.tone === "danger")) danger++;
      if (item.noBrokerage) zeroBrokerage++;
    }
    return { total: listings.length, flagged, danger, zeroBrokerage };
  }, [listings, flagsById]);

  const visible = useMemo(() => {
    const q = norm(query);
    const filtered = listings.filter((item) => {
      if (worldFilter !== "all" && item.world !== worldFilter) return false;
      if (flaggedOnly && !(flagsById.get(item.id)?.length)) return false;
      if (q && !norm(`${item.title} ${item.location} ${item.ownerName ?? ""}`).includes(q)) return false;
      return true;
    });
    const riskScore = (item: PendingListing) => {
      const f = flagsById.get(item.id) ?? [];
      return f.reduce((n, x) => n + (x.tone === "danger" ? 2 : 1), 0);
    };
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "risk":
          return riskScore(b) - riskScore(a);
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "price_desc":
          return (b.priceValue || 0) - (a.priceValue || 0);
        case "price_asc":
          return (a.priceValue || 0) - (b.priceValue || 0);
      }
    });
  }, [listings, flagsById, query, worldFilter, flaggedOnly, sortBy]);

  const removeFromQueue = (id: string) => {
    setListings((prev) => prev.filter((x) => x.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const withBusy = async (id: string, fn: () => Promise<void>) => {
    setBusy((prev) => new Set(prev).add(id));
    try {
      await fn();
    } finally {
      setBusy((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const review = (id: string, action: "approve" | "reject") =>
    withBusy(id, async () => {
      try {
        const res = await apiClient.patch(`/listings/${id}/review`, { action });
        if (res.data?.success) removeFromQueue(id);
        else alert(`Failed to ${action} listing.`);
      } catch (err) {
        console.error(`Error during review (${action}):`, err);
        alert("Error processing review request.");
      }
    });

  const remove = (id: string) =>
    withBusy(id, async () => {
      try {
        const res = await apiClient.delete(`/listings/${id}`);
        if (res.data?.success) removeFromQueue(id);
        else alert("Failed to delete listing.");
      } catch (err) {
        console.error("Error deleting listing:", err);
        alert("Error deleting listing.");
      }
    });

  const reviewSelected = async (action: "approve" | "reject") => {
    const ids = [...selected];
    if (!ids.length) return;
    if (action === "reject" && !confirm(`Reject ${ids.length} listing(s)?`)) return;
    await Promise.all(ids.map((id) => review(id, action)));
  };

  const deleteSelected = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    if (!confirm(`Permanently delete ${ids.length} listing(s)? This cannot be undone.`)) return;
    await Promise.all(ids.map((id) => remove(id)));
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allVisibleSelected = visible.length > 0 && visible.every((i) => selected.has(i.id));
  const toggleSelectAll = () =>
    setSelected(() => (allVisibleSelected ? new Set() : new Set(visible.map((i) => i.id))));

  const worldTabs: { value: WorldFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "stay", label: "Stays" },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">Listing Control Center</h1>
          <p className="text-sm text-muted mt-1.5">
            Review submitted listings before they go live. Automated pre-checks flag risky posts for you.
          </p>
        </div>
        <button
          onClick={fetchPending}
          className="self-start md:self-auto inline-flex items-center gap-1.5 text-sm font-semibold text-ink bg-canvas border border-hairline rounded-[8px] px-3.5 py-2 hover:bg-surface-soft transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatTile label="Pending review" value={stats.total} />
        <StatTile label="Flagged by checks" value={stats.flagged} accent="text-amber-600" />
        <StatTile label="High-risk (duplicate)" value={stats.danger} accent="text-rausch" />
        <StatTile label="Zero brokerage" value={stats.zeroBrokerage} accent="text-emerald" />
      </div>

      {/* Toolbar */}
      <div className="bg-canvas border border-hairline rounded-[14px] p-3 mb-5 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, location or lister…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-surface-soft border border-hairline rounded-[8px] outline-none focus:border-rausch transition-colors"
          />
        </div>
        <div className="inline-flex items-center gap-1 bg-surface-soft border border-hairline rounded-full p-1 shrink-0">
          {worldTabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setWorldFilter(t.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                worldFilter === t.value ? "bg-ink text-white" : "text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setFlaggedOnly((v) => !v)}
          aria-pressed={flaggedOnly}
          className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-[8px] border transition-colors ${
            flaggedOnly ? "bg-rausch/10 border-rausch/30 text-rausch" : "bg-surface-soft border-hairline text-muted hover:text-ink"
          }`}
        >
          Flagged only
        </button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="shrink-0 bg-surface-soft border border-hairline rounded-[8px] px-3 py-2 text-xs font-bold text-ink outline-none focus:border-rausch cursor-pointer"
        >
          <option value="risk">Sort: Riskiest first</option>
          <option value="oldest">Date: Oldest first</option>
          <option value="newest">Date: Newest first</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="price_asc">Price: Low to High</option>
        </select>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="sticky top-16 z-30 mb-4 flex items-center justify-between gap-3 bg-ink text-white rounded-[12px] px-4 py-3 shadow-airbnb">
          <span className="text-sm font-semibold">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => reviewSelected("approve")}
              className="inline-flex items-center gap-1.5 bg-emerald hover:brightness-95 text-white text-xs font-bold px-3.5 py-2 rounded-[8px] transition"
            >
              Approve
            </button>
            <button
              onClick={() => reviewSelected("reject")}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-[8px] transition"
            >
              Reject
            </button>
            <button
              onClick={deleteSelected}
              className="inline-flex items-center gap-1.5 bg-rausch hover:bg-rausch-active text-white text-xs font-bold px-3.5 py-2 rounded-[8px] transition"
            >
              Delete
            </button>
            <button onClick={() => setSelected(new Set())} className="text-white/60 hover:text-white text-xs font-semibold px-2">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Select-all row */}
      {!loading && visible.length > 0 && (
        <label className="flex items-center gap-2 text-xs font-semibold text-muted mb-3 cursor-pointer select-none">
          <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} className="accent-rausch w-4 h-4" />
          Select all {visible.length} shown
        </label>
      )}

      {/* Queue */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-rausch border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-muted">Loading review queue…</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-canvas border border-hairline rounded-[20px] p-12 text-center shadow-3d-soft">
          <span className="inline-flex w-16 h-16 rounded-full bg-emerald/10 text-emerald items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <h3 className="text-xl font-bold text-ink">{listings.length === 0 ? "All caught up!" : "No matches"}</h3>
          <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
            {listings.length === 0
              ? "There are no listings awaiting review right now."
              : "No listings match your current filters. Try clearing search or filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((item) => {
            const flags = flagsById.get(item.id) ?? [];
            const isBusy = busy.has(item.id);
            const isOpen = expanded === item.id;
            const isSel = selected.has(item.id);
            return (
              <div
                key={item.id}
                className={`bg-canvas border rounded-[16px] overflow-hidden shadow-3d-soft transition-all ${
                  isSel ? "border-rausch ring-1 ring-rausch/30" : "border-hairline hover:shadow-airbnb"
                }`}
              >
                <div className="p-4 flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex items-start gap-3 shrink-0">
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => toggleSelect(item.id)}
                      className="mt-1 accent-rausch w-4 h-4 shrink-0"
                      aria-label={`Select ${item.title}`}
                    />
                    <div className="relative w-full md:w-32 h-24 bg-surface-soft rounded-[12px] overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image || PLACEHOLDER} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-bold bg-surface border border-hairline px-1.5 py-0.5 rounded text-muted uppercase tracking-wide">
                        {item.world}
                      </span>
                      {item.noBrokerage && (
                        <span className="bg-rausch/10 text-rausch text-[9px] font-bold px-1.5 py-0.5 rounded">Zero Brokerage</span>
                      )}
                      {flags.map((f) => (
                        <FlagPill key={f.id} flag={f} />
                      ))}
                    </div>
                    <p className="text-base font-bold text-ink truncate mt-1.5" title={item.title}>
                      {item.title}
                    </p>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="text-lg font-extrabold text-ink">{item.price}</p>
                      <p className="text-[11px] text-muted truncate flex items-center gap-0.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {item.location}
                      </p>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
                      <span>
                        By <span className="font-bold text-ink">{item.ownerName || "Unknown"}</span>
                      </span>
                      {item.ownerPhone && (
                        <span>
                          Phone <span className="font-semibold text-ink">+91 {item.ownerPhone}</span>
                        </span>
                      )}
                      {item.createdAt && (
                        <span>
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                      <button
                        onClick={() => setExpanded(isOpen ? null : item.id)}
                        className="font-semibold text-rausch hover:underline underline-offset-2"
                      >
                        {isOpen ? "Hide details" : "View details"}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs bg-surface-soft border border-hairline rounded-[10px] p-3">
                        <Detail label="Spec" value={item.spec} />
                        <Detail label="Area" value={item.area} />
                        <Detail label="Furnishing" value={item.furnishing} />
                        <Detail label="Available" value={item.availableFrom} />
                        <Detail label="Metro" value={item.metroDistance} />
                        <Detail label="Email" value={item.ownerEmail} />
                        {item.amenities && item.amenities.length > 0 && (
                          <div className="col-span-full">
                            <span className="text-muted">Amenities:</span>{" "}
                            <span className="font-semibold text-ink">{item.amenities.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-36">
                    <button
                      onClick={() => review(item.id, "approve")}
                      disabled={isBusy}
                      className="flex-1 h-9 bg-emerald hover:brightness-95 text-white text-xs font-bold rounded-[8px] transition disabled:opacity-50"
                    >
                      {isBusy ? "…" : "Accept & Publish"}
                    </button>
                    <button
                      onClick={() => review(item.id, "reject")}
                      disabled={isBusy}
                      className="flex-1 h-9 bg-surface border border-hairline hover:bg-surface-soft text-ink text-xs font-bold rounded-[8px] transition disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Permanently delete this listing? This cannot be undone.")) remove(item.id);
                      }}
                      disabled={isBusy}
                      className="flex-1 h-9 inline-flex items-center justify-center gap-1 bg-rausch/5 border border-rausch/20 hover:bg-rausch/10 text-rausch text-xs font-bold rounded-[8px] transition disabled:opacity-50"
                      aria-label="Delete listing"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span className="text-muted">{label}:</span> <span className="font-semibold text-ink">{value || "—"}</span>
    </div>
  );
}
