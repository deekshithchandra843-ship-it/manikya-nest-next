"use client";
import { useState } from "react";
import Link from "next/link";
import type { Session } from "@/lib/auth";

interface Listing {
  id: string;
  title: string;
  type: string;
  locality: string;
  price: string;
  views: number;
  leads: number;
  status: "Live" | "Under Review" | "Paused";
  postedDate: string;
}

interface Lead {
  id: string;
  name: string;
  interest: string;
  phone: string;
  matchScore: number;
  time: string;
  status: "new" | "contacted" | "closed";
}

export default function BusinessDashboard({ session: _session }: { session: Session }) {
  const [activeTab, setActiveTab] = useState<"listings" | "leads" | "analytics">("listings");

  // TODO: wire these to the backend (GET /listings?owner=me, GET /leads).
  // Until those endpoints exist, every real user starts from an empty state.
  const listings: Listing[] = [];
  const leads: Lead[] = [];

  // Derived metrics
  const totalViews = listings.reduce((sum, item) => sum + item.views, 0);
  const totalLeads = leads.length;
  const activeListings = listings.filter((item) => item.status === "Live").length;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-canvas border border-hairline p-5 rounded-[16px] shadow-3d-soft hover:shadow-airbnb transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Active Listings</span>
            <span className="w-8 h-8 rounded-full bg-rausch/10 text-rausch flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </span>
          </div>
          <p className="text-2xl font-extrabold text-ink">{activeListings}</p>
          <p className="text-xs text-muted mt-1">{listings.length - activeListings} pending review</p>
        </div>

        <div className="bg-canvas border border-hairline p-5 rounded-[16px] shadow-3d-soft hover:shadow-airbnb transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Total Views</span>
            <span className="w-8 h-8 rounded-full bg-indigo/10 text-indigo flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
          </div>
          <p className="text-2xl font-extrabold text-ink">{totalViews}</p>
          <p className="text-xs text-muted mt-1">+12% this week</p>
        </div>

        <div className="bg-canvas border border-hairline p-5 rounded-[16px] shadow-3d-soft hover:shadow-airbnb transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">New Leads</span>
            <span className="w-8 h-8 rounded-full bg-green-50 text-green-700 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" />
              </svg>
            </span>
          </div>
          <p className="text-2xl font-extrabold text-ink">{totalLeads}</p>
          <p className="text-xs text-muted mt-1">{leads.filter(l => l.status === "new").length} unread leads</p>
        </div>

        <div className="bg-canvas border border-hairline p-5 rounded-[16px] shadow-3d-soft hover:shadow-airbnb transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Match Score</span>
            <span className="w-8 h-8 rounded-full bg-violet/10 text-violet flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
              </svg>
            </span>
          </div>
          <p className="text-2xl font-extrabold text-ink">—</p>
          <p className="text-xs text-muted mt-1">Avg matching accuracy</p>
        </div>
      </div>

      {/* Tabs Controller */}
      <div className="border-b border-hairline flex items-center justify-between">
        <div className="flex gap-6">
          {(["listings", "leads", "analytics"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-all relative ${activeTab === tab ? "text-ink font-bold" : "text-muted hover:text-ink"
                }`}
            >
              {tab === "listings" ? "My Listings" : tab === "leads" ? "Leads & Enquiries" : "Performance"}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-ink rounded-full" />
              )}
            </button>
          ))}
        </div>

        <Link
          href="/post"
          className="mb-2 text-xs font-semibold text-white bg-ink rounded-full px-4 py-2 hover:opacity-90 transition-all shadow-airbnb flex items-center gap-1"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Property
        </Link>
      </div>

      {/* Tab Contents */}
      <div className="pt-2">
        {activeTab === "listings" && (
          <div className="space-y-4">
            {listings.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-hairline rounded-[18px] bg-surface-soft p-8">
                <div className="w-12 h-12 rounded-full bg-rausch/10 text-rausch flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-ink mb-1">No property listed yet</h3>
                <p className="text-sm text-muted max-w-[320px] mx-auto mb-6">
                  List your first property to receive verified tenant leads and match scores instantly.
                </p>
                <Link
                  href="/post"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-rausch text-white text-sm font-semibold rounded-[8px] hover:bg-rausch-active transition-colors shadow-airbnb"
                >
                  List your property
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {listings.map((item) => (
                  <div
                    key={item.id}
                    className="bg-canvas border border-hairline rounded-[16px] p-5 shadow-3d-soft hover:shadow-airbnb transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-semibold text-white bg-rausch px-2 py-0.5 rounded-full capitalize">
                          {item.type}
                        </span>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${item.status === "Live"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                            }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-ink">{item.title}</h3>
                      <p className="text-xs text-muted mt-0.5">{item.locality}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                        <span>Rent: <strong className="text-ink">{item.price}</strong></span>
                        <span>Posted on: {item.postedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-      center gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-hairline-soft justify-between">
                      <div className="text-center">
                        <p className="text-sm font-bold text-ink">{item.views}</p>
                        <p className="text-[11px] text-muted">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-ink">{item.leads}</p>
                        <p className="text-[11px] text-muted">Leads</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3.5 py-2 text-xs font-semibold text-ink border border-hairline rounded-[8px] hover:bg-surface-soft transition-all">
                          Edit
                        </button>
                        <button className="px-3.5 py-2 text-xs font-semibold text-white bg-ink rounded-[8px] hover:opacity-90 transition-all">
                          View leads
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "leads" && (
          <div className="space-y-4">
            {leads.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-hairline rounded-[18px] bg-surface-soft p-8">
                <div className="w-12 h-12 rounded-full bg-indigo/10 text-indigo flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-ink mb-1">No enquiries yet</h3>
                <p className="text-sm text-muted max-w-[320px] mx-auto">
                  Seekers will reach out to you once your property is verified and listed on our explorer feed.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-canvas border border-hairline rounded-[16px] p-5 shadow-3d-soft hover:shadow-airbnb transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-rausch/10 text-rausch flex items-center justify-center font-bold text-sm shrink-0">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-ink text-sm sm:text-base">{lead.name}</h4>
                          <span className="text-[11px] text-muted">{lead.time}</span>
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                          Interested in: <strong className="text-ink font-medium">{lead.interest}</strong>
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                            {lead.matchScore}% Match Score
                          </span>
                          <span className="text-[10px] font-medium text-muted">
                            {lead.status === "new" ? "● New response" : "● Contacted"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-hairline-soft">
                      <a
                        href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-[8px] transition-all flex items-center gap-1.5"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.459 3.479 1.332 5.003L2 22l5.176-1.359c1.478.807 3.136 1.233 4.832 1.233 5.506 0 9.992-4.486 9.992-9.988 0-2.66-1.035-5.159-2.915-7.039C17.18 3.03 14.675 2 12.012 2zM8.337 7.747c.218-.009.432-.014.613-.014.18 0 .423.067.644.549.221.482.753 1.834.819 1.97.067.135.111.293.022.473-.089.18-.135.293-.27.451-.135.158-.283.351-.405.473-.122.122-.252.256-.108.503.144.247.64 1.053 1.371 1.704.941.84 1.737 1.1 1.983 1.226.247.126.391.104.536-.063.144-.167.622-.725.789-.973.167-.247.333-.207.563-.122.23.085 1.458.687 1.71 1.218v.002c.078.163.078.694-.144 1.32-.222.626-1.306 1.22-1.802 1.258-.496.038-.988.167-3.13-.676-2.58-1.017-4.22-3.626-4.346-3.793-.126-.167-.991-1.316-.991-2.512.001-1.196.626-1.784.847-2.022z" />
                        </svg>
                        WhatsApp
                      </a>
                      <button className="px-3.5 py-2 text-xs font-semibold text-ink border border-hairline rounded-[8px] hover:bg-surface-soft transition-all">
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="border border-hairline bg-surface-soft p-6 rounded-[18px] text-center space-y-4">
            <h3 className="text-base font-bold text-ink">Analytics and Performance</h3>
            <p className="text-sm text-muted max-w-[420px] mx-auto">
              Get details on listing impressions, click-through rates, and average response speed over time.
            </p>
            <p className="text-xs text-muted pt-4">Available once you list properties and receive visits.</p>
          </div>
        )}
      </div>
    </div>
  );
}
