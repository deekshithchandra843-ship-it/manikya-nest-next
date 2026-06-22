"use client";
import { useState } from "react";
import Link from "next/link";
import PageLayout from "../components/PageLayout";

const cities = ["Bengaluru", "Hyderabad", "Chennai", "Mumbai", "Pune", "Delhi NCR", "Kolkata"];
const propertyKinds = ["Residential", "Commercial", "Land/Plot"];
const adTypes = ["Rent", "Resale", "PG/Hostel", "Flatmates"];

const benefits = [
  { title: "Zero brokerage", desc: "List free — connect directly with tenants, no middlemen." },
  { title: "Faster tenants", desc: "Verified, ready-to-move seekers reach out within days." },
  { title: "10 lakh+ connections", desc: "Tap into a large pool of tenants and buyers across India." },
];

// ---- Wizard field options ----
const apartmentTypes = ["Apartment", "Independent House / Villa", "Gated Community Villa", "Standalone Building"];
const bhkTypes = ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];
const floorOptions = ["Ground", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];
const propertyAges = ["Under construction", "Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"];
const facings = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];
const furnishings = ["Fully furnished", "Semi furnished", "Unfurnished"];
const tenantPrefs = ["Anyone", "Family", "Bachelors", "Company"];
const parkingOptions = ["None", "Bike", "Car", "Bike & Car"];
const amenityOptions = ["Wi-Fi", "AC", "Meals", "Laundry", "Security", "Parking", "Power backup", "Hot water", "Gym", "Housekeeping", "Lift", "Gas pipeline"];
const visitDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const wizardSteps = [
  { key: "property", label: "Property Details" },
  { key: "locality", label: "Locality Details" },
  { key: "rental", label: "Rental Details" },
  { key: "amenities", label: "Amenities" },
  { key: "gallery", label: "Gallery" },
  { key: "schedule", label: "Schedule" },
];

const ownerPerks = [
  { title: "Privacy", desc: "Your number stays masked" },
  { title: "Promoted listing", desc: "Show up higher in search" },
  { title: "Social marketing", desc: "Promoted across channels" },
  { title: "Price consultation", desc: "Get the right rent advice" },
];

const stepIcon = (key: string) => {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7 } as const;
  switch (key) {
    case "property":
      return <svg {...common}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path d="M9 22V12h6v10" /></svg>;
    case "locality":
      return <svg {...common}><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>;
    case "rental":
      return <svg {...common}><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>;
    case "amenities":
      return <svg {...common}><path d="M20 7h-9M14 17H5M17 17a3 3 0 100-6 3 3 0 000 6zM7 13a3 3 0 100-6 3 3 0 000 6z" /></svg>;
    case "gallery":
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>;
    case "schedule":
      return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
    default:
      return null;
  }
};

export default function PostListing() {
  const [step, setStep] = useState<"landing" | "wizard">("landing");

  // Landing lead-capture state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState(true);
  const [kind, setKind] = useState("Residential");
  const [adType, setAdType] = useState("Rent");

  // Wizard state
  const [active, setActive] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({});
  const [amenities, setAmenities] = useState<string[]>(["Wi-Fi"]);
  const [days, setDays] = useState<string[]>(["Sat", "Sun"]);
  const [images, setImages] = useState<string[]>([]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const toggleAmenity = (a: string) =>
    setAmenities((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]));
  const toggleDay = (d: string) =>
    setDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));
  const addImage = () => setImages((p) => [...p, `Photo ${p.length + 1}`].slice(0, 8));

  const progress = Math.round((active / (wizardSteps.length - 1)) * 100);
  const last = active === wizardSteps.length - 1;

  const field =
    "w-full border border-hairline rounded-[8px] px-3 h-12 text-sm text-ink outline-none focus:border-ink focus:border-2 transition-colors bg-canvas";
  const label = "text-[13px] font-medium text-ink block mb-1.5";

  const renderSelect = (name: string, options: string[], placeholder = "Select") => (
    <select
      value={form[name] ?? ""}
      onChange={(e) => set(name, e.target.value)}
      className={`${field} ${form[name] ? "text-ink" : "text-muted"}`}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o} className="text-ink">{o}</option>
      ))}
    </select>
  );

  // ---------- STEP 1: Landing ----------
  if (step === "landing") {
    return (
      <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "List your property" }]}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6 pt-2">
          <h1 className="text-[26px] font-bold text-ink leading-tight">
            Sell or rent your property <span className="text-rausch">for free</span>
          </h1>
          <p className="text-sm text-muted">
            Looking for a home?{" "}
            <Link href="/find-nest" className="text-ink font-semibold underline">Find a nest</Link>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          <aside className="space-y-4">
            <div className="bg-canvas border border-hairline rounded-[14px] p-5">
              <p className="text-base font-semibold text-ink mb-4">Why post through us?</p>
              <ul className="space-y-4">
                {benefits.map((b) => (
                  <li key={b.title} className="flex gap-3">
                    <span className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-rausch/10 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff385c" strokeWidth="2.2"><path d="M5 12l4 4L19 7" /></svg>
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink">{b.title}</span>
                      <span className="block text-[13px] text-muted">{b.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-surface-soft border border-hairline rounded-[14px] p-5">
              <p className="text-base font-semibold text-ink mb-2">30 lakh+ owners trust us</p>
              <p className="text-[13px] text-body leading-relaxed mb-3">
                &ldquo;I posted my flat on NestNext and despite my busy schedule they reached out at the right times and found a great tenant as per my needs.&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-ink">Aldrin · Bengaluru</span>
                <span className="text-rausch text-sm" aria-label="5 star rating">★★★★★</span>
              </div>
            </div>
          </aside>

          <div className="bg-canvas border border-hairline rounded-[14px] p-6 shadow-airbnb">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={label}>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Your name" />
              </div>
              <div>
                <label className={label}>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className={field} placeholder="name@gmail.com" />
              </div>
              <div>
                <label className={label}>Mobile number</label>
                <div className="flex items-center border border-hairline rounded-[8px] h-12 px-3 focus-within:border-ink focus-within:border-2 transition-colors bg-canvas">
                  <span className="text-ink text-sm pr-2 border-r border-hairline mr-2">+91</span>
                  <input type="tel" inputMode="numeric" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="98765 43210" className="flex-1 text-sm text-ink placeholder-muted outline-none bg-transparent" />
                </div>
              </div>
              <div>
                <label className={label}>City</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className={`${field} ${city ? "text-ink" : "text-muted"}`}>
                  <option value="">Select city</option>
                  {cities.map((c) => (<option key={c} value={c} className="text-ink">{c}</option>))}
                </select>
              </div>
            </div>

            <button type="button" onClick={() => setWhatsapp((w) => !w)} className="flex items-center gap-2.5 mb-6">
              <span className={`relative w-10 h-6 rounded-full transition-colors ${whatsapp ? "bg-rausch" : "bg-surface-strong"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${whatsapp ? "translate-x-4" : ""}`} />
              </span>
              <span className="text-sm text-body">Get updates on WhatsApp</span>
            </button>

            <p className="text-base font-semibold text-ink mb-2">Property type</p>
            <div className="flex border-b border-hairline mb-5">
              {propertyKinds.map((k) => (
                <button key={k} onClick={() => setKind(k)} className={`relative px-4 pb-2 text-sm font-medium transition-colors ${kind === k ? "text-ink" : "text-muted hover:text-ink"}`}>
                  {k}
                  {kind === k && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-rausch rounded-full" />}
                </button>
              ))}
            </div>

            <p className="text-base font-semibold text-ink mb-2">Ad type</p>
            <div className="flex flex-wrap gap-2 mb-7">
              {adTypes.map((a) => (
                <button key={a} onClick={() => setAdType(a)} className={`px-4 py-2 text-sm font-medium rounded-[8px] border transition-colors ${adType === a ? "bg-rausch text-white border-rausch" : "bg-canvas text-body border-hairline hover:border-ink"}`}>
                  {a}
                </button>
              ))}
            </div>

            <button onClick={() => { setStep("wizard"); setActive(0); }} className="w-full h-12 bg-rausch text-white text-base font-semibold rounded-[8px] hover:bg-rausch-active transition-colors">
              Start posting your ad for free
            </button>
            <p className="text-[12px] text-muted text-center mt-3">Free forever · No brokerage · Listings reviewed before going live.</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // ---------- STEP 2: Multi-step wizard ----------
  return (
    <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "List your property", href: "/post" }, { label: wizardSteps[active].label }]}>
      {/* Top bar: home + progress + preview */}
      <div className="flex items-center gap-4 mb-6 pt-1">
        <button onClick={() => setStep("landing")} className="shrink-0 text-muted hover:text-ink transition-colors" aria-label="Back to start">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path d="M9 22V12h6v10" /></svg>
        </button>
        <div className="flex-1">
          <div className="h-1.5 bg-surface-strong rounded-full overflow-hidden">
            <div className="h-full bg-rausch rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <span className="shrink-0 text-[13px] font-medium text-muted">{progress}% Done</span>
        <button className="shrink-0 px-4 h-9 border border-rausch text-rausch text-sm font-medium rounded-[8px] hover:bg-rausch/5 transition-colors">Preview</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_240px] gap-6">
        {/* Left: step nav */}
        <nav className="bg-canvas border border-hairline rounded-[14px] p-2 h-fit lg:sticky lg:top-24">
          {wizardSteps.map((s, i) => {
            const isActive = i === active;
            const done = i < active;
            return (
              <button
                key={s.key}
                onClick={() => setActive(i)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-[10px] text-left transition-colors ${
                  isActive ? "bg-surface-soft text-ink" : "text-muted hover:bg-surface-soft hover:text-ink"
                }`}
              >
                <span className={`relative ${isActive ? "text-rausch" : done ? "text-rausch" : ""}`}>
                  {done ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff385c" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                  ) : (
                    stepIcon(s.key)
                  )}
                </span>
                <span className={`text-sm font-medium ${isActive ? "text-ink" : ""}`}>{s.label}</span>
                {isActive && <span className="ml-auto w-1.5 h-6 bg-rausch rounded-full" />}
              </button>
            );
          })}
        </nav>

        {/* Middle: form */}
        <div className="bg-canvas border border-hairline rounded-[14px] p-6 min-h-[420px]">
          <h2 className="text-[19px] font-bold text-ink pb-4 mb-6 border-b border-hairline">{wizardSteps[active].label}</h2>

          {active === 0 && (
            <div className="space-y-5">
              <div><label className={label}>Apartment Type<span className="text-rausch">*</span></label>{renderSelect("apartmentType", apartmentTypes)}</div>
              <div><label className={label}>BHK Type<span className="text-rausch">*</span></label>{renderSelect("bhk", bhkTypes)}</div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={label}>Floor<span className="text-rausch">*</span></label>{renderSelect("floor", floorOptions)}</div>
                <div><label className={label}>Total Floors<span className="text-rausch">*</span></label>{renderSelect("totalFloors", floorOptions)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={label}>Property Age<span className="text-rausch">*</span></label>{renderSelect("age", propertyAges)}</div>
                <div><label className={label}>Facing</label>{renderSelect("facing", facings)}</div>
              </div>
              <div><label className={label}>Built-up Area (sq.ft)</label><input className={field} inputMode="numeric" placeholder="e.g. 1200" value={form.area ?? ""} onChange={(e) => set("area", e.target.value)} /></div>
            </div>
          )}

          {active === 1 && (
            <div className="space-y-5">
              <div><label className={label}>City<span className="text-rausch">*</span></label>{renderSelect("city", cities, "Select city")}</div>
              <div><label className={label}>Locality / Area<span className="text-rausch">*</span></label><input className={field} placeholder="e.g. Koramangala" value={form.locality ?? ""} onChange={(e) => set("locality", e.target.value)} /></div>
              <div><label className={label}>Project / Society name</label><input className={field} placeholder="e.g. Prestige Shantiniketan" value={form.project ?? ""} onChange={(e) => set("project", e.target.value)} /></div>
              <div><label className={label}>Street / Landmark</label><input className={field} placeholder="Near Forum Mall" value={form.landmark ?? ""} onChange={(e) => set("landmark", e.target.value)} /></div>
            </div>
          )}

          {active === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={label}>Expected Rent (₹)<span className="text-rausch">*</span></label><input className={field} inputMode="numeric" placeholder="18500" value={form.rent ?? ""} onChange={(e) => set("rent", e.target.value)} /></div>
                <div><label className={label}>Deposit (₹)<span className="text-rausch">*</span></label><input className={field} inputMode="numeric" placeholder="50000" value={form.deposit ?? ""} onChange={(e) => set("deposit", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={label}>Available From</label><input type="date" className={`${field} ${form.available ? "text-ink" : "text-muted"}`} value={form.available ?? ""} onChange={(e) => set("available", e.target.value)} /></div>
                <div><label className={label}>Furnishing</label>{renderSelect("furnishing", furnishings)}</div>
              </div>
              <div><label className={label}>Preferred Tenants</label>{renderSelect("tenants", tenantPrefs)}</div>
              <div><label className={label}>Parking</label>{renderSelect("parking", parkingOptions)}</div>
            </div>
          )}

          {active === 3 && (
            <div>
              <label className={label}>Select the amenities available</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {amenityOptions.map((a) => (
                  <button key={a} onClick={() => toggleAmenity(a)} className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${amenities.includes(a) ? "bg-rausch/10 border-rausch text-rausch" : "bg-canvas border-hairline text-body hover:border-ink"}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {active === 4 && (
            <div>
              <label className={label}>Add photos of your property</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
                {images.map((img) => (
                  <div key={img} className="relative aspect-square bg-surface-strong rounded-[14px] flex items-center justify-center text-[11px] text-muted">
                    {img}
                    <button onClick={() => setImages((p) => p.filter((x) => x !== img))} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink text-white text-xs flex items-center justify-center" aria-label="Remove photo">✕</button>
                  </div>
                ))}
                {images.length < 8 && (
                  <button onClick={addImage} className="aspect-square border-2 border-dashed border-hairline rounded-[14px] flex flex-col items-center justify-center text-muted hover:border-ink transition-colors">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" /></svg>
                    <span className="text-[11px] mt-1">Upload</span>
                  </button>
                )}
              </div>
              <p className="text-[12px] text-muted mt-3">Properties with photos get up to 5× more responses.</p>
            </div>
          )}

          {active === 5 && (
            <div className="space-y-5">
              <div>
                <label className={label}>Available days for visits</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {visitDays.map((d) => (
                    <button key={d} onClick={() => toggleDay(d)} className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${days.includes(d) ? "bg-ink text-white border-ink" : "bg-canvas border-hairline text-body hover:border-ink"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={label}>Visit starts</label><input type="time" className={field} value={form.from ?? ""} onChange={(e) => set("from", e.target.value)} /></div>
                <div><label className={label}>Visit ends</label><input type="time" className={field} value={form.to ?? ""} onChange={(e) => set("to", e.target.value)} /></div>
              </div>
              <div><label className={label}>Who shows the property?</label>{renderSelect("caretaker", ["I show personally", "Caretaker", "Tenant", "Security"])}</div>
            </div>
          )}

          {/* Footer nav */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-hairline">
            <button
              onClick={() => setActive((i) => Math.max(0, i - 1))}
              disabled={active === 0}
              className="text-sm font-medium text-muted hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => (last ? undefined : setActive((i) => i + 1))}
              className="px-6 h-11 bg-rausch text-white text-sm font-semibold rounded-[8px] hover:bg-rausch-active transition-colors"
            >
              {last ? "Publish listing" : "Save & Continue"}
            </button>
          </div>
        </div>

        {/* Right: owner perks rail */}
        <aside className="hidden lg:block h-fit lg:sticky lg:top-24">
          <div className="bg-surface-soft border border-hairline rounded-[14px] p-5">
            <p className="text-base font-semibold text-ink leading-snug mb-1">Get tenants faster</p>
            <p className="text-[12px] text-muted mb-4">Subscribe to an owner plan and find tenants quickly.</p>
            <ul className="space-y-3">
              {ownerPerks.map((p) => (
                <li key={p.title} className="flex gap-3 items-start">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-rausch/10 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff385c" strokeWidth="2"><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4L12 17l-6.3 4.4L8 14 2 9.4h7.6z" /></svg>
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold text-ink">{p.title}</span>
                    <span className="block text-[12px] text-muted">{p.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
            <button className="w-full h-10 mt-4 bg-ink text-white text-sm font-medium rounded-[8px] hover:opacity-90 transition-opacity">Show interest</button>
          </div>
        </aside>
      </div>
    </PageLayout>
  );
}
