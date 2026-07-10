"use client";
import { useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";
import RequirementCard from "@/components/RequirementCard";
import RespondModal from "@/components/RespondModal";
import { Role, roleList, getRole, Requirement, REQUIREMENTS, fetchRequirementsApi, createRequirementApi, updateRequirementApi } from "@/lib/requirements";
import { World, categoriesForWorld } from "@/lib/categories";

const cities = ["Bengaluru", "Hyderabad", "Chennai", "Mumbai", "Pune", "Delhi NCR", "Kolkata"];
const field = "w-full border border-hairline rounded-[8px] px-3 h-12 text-sm text-ink outline-none focus:border-ink focus:border-2 transition-colors bg-canvas";
const labelCls = "text-[13px] font-medium text-ink block mb-1.5";

type FieldDef = {
  key: string;
  label: string;
  required?: boolean;
  half?: boolean;
} & (
  | { type: "text" | "number" | "date"; placeholder?: string }
  | { type: "select"; options: string[] }
  | { type: "pills"; options: string[] }
);

const bhkTypes = ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4+ BHK"];
const furnishings = ["Fully furnished", "Semi furnished", "Unfurnished"];

function requirementFields(role: Role, slug: string): FieldDef[] {
  if (role === "agent") {
    return [
      { key: "specialities", label: "Specialities", type: "pills", options: ["Residential", "Commercial", "Luxury", "Leasing", "Stay"] },
      { key: "years", label: "Years active", type: "number", placeholder: "e.g. 8", half: true },
      { key: "inventory", label: "Live properties", type: "number", placeholder: "e.g. 120", half: true },
      { key: "languages", label: "Languages", type: "text", placeholder: "English, Hindi, Kannada" },
    ];
  }
  if (role === "seller") {
    return [
      { key: "bhk", label: "Configuration", type: "select", options: bhkTypes },
      { key: "area", label: "Built-up area (sq ft)", type: "number", placeholder: "e.g. 1200", half: true },
      { key: "howSoon", label: "Sell within", type: "select", options: ["ASAP", "30 days", "60 days", "3 months"], half: true },
      { key: "openToAgents", label: "Open to agents", type: "pills", options: ["Yes", "No"] },
    ];
  }
  // tenant + buyer
  const isBuy = role === "buyer";
  const fields: FieldDef[] = [];
  if (slug !== "pg" && slug !== "coliving") {
    fields.push({ key: "bhk", label: "BHK type", type: "select", options: bhkTypes });
  }
  if (isBuy) {
    fields.push({ key: "possession", label: "Possession", type: "pills", options: ["Ready to move", "Under construction", "Any"] });
    fields.push({ key: "loan", label: "Loan needed", type: "pills", options: ["Yes", "No"] });
  } else {
    fields.push({ key: "moveIn", label: "Move-in", type: "select", options: ["Immediate", "Within 2 weeks", "Within 1 month", "Flexible"], half: true });
    fields.push({ key: "furnishing", label: "Furnishing", type: "select", options: furnishings, half: true });
    fields.push({ key: "occupancy", label: "Occupancy", type: "pills", options: ["Family", "Bachelors", "Students"] });
  }
  return fields;
}

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>(REQUIREMENTS);

  useEffect(() => {
    fetchRequirementsApi().then(setRequirements);
  }, []);

  const [role, setRole] = useState<Role>("tenant");
  const [world, setWorld] = useState<World>("residential");
  const [slug, setSlug] = useState("rent");

  // Category-aware field values
  const [form, setForm] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  // Shared inputs
  const [name, setName] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [areas, setAreas] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);

  // Feed filters + respond flow
  const [filterRole, setFilterRole] = useState<Role | "all">("all");
  const [respondTarget, setRespondTarget] = useState<Requirement | null>(null);

  const feed = requirements.filter((r) => filterRole === "all" || r.role === filterRole);

  const chooseRole = (r: Role) => {
    setRole(r);
    const w = getRole(r)!.worlds[0];
    setWorld(w);
    setSlug(categoriesForWorld(w)[0].slug);
    setForm({});
  };
  const chooseWorld = (w: World) => {
    setWorld(w);
    setSlug(categoriesForWorld(w)[0].slug);
  };

  const addArea = () => {
    const a = areaInput.trim();
    if (a && !areas.includes(a)) setAreas((p) => [...p, a]);
    setAreaInput("");
  };

  const renderField = (f: FieldDef) => {
    if (f.type === "select") {
      return (
        <select value={form[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} className={`${field} ${form[f.key] ? "text-ink" : "text-muted"}`}>
          <option value="">Select</option>
          {f.options.map((o) => (<option key={o} value={o} className="text-ink">{o}</option>))}
        </select>
      );
    }
    if (f.type === "pills") {
      return (
        <div className="flex flex-wrap gap-2">
          {f.options.map((o) => {
            const on = form[f.key] === o;
            return (
              <button key={o} type="button" onClick={() => set(f.key, o)} aria-pressed={on}
                className={`px-4 py-2 text-sm font-medium rounded-[8px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${on ? "bg-rausch/10 border-rausch text-rausch" : "bg-canvas text-body border-hairline hover:border-ink"}`}>
                {o}
              </button>
            );
          })}
        </div>
      );
    }
    return (
      <input type={f.type === "number" ? "text" : f.type} inputMode={f.type === "number" ? "numeric" : undefined}
        value={form[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)}
        placeholder={"placeholder" in f ? f.placeholder : undefined} className={field} />
    );
  };

  const renderFieldGroup = (fields: FieldDef[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
      {fields.map((f) => (
        <div key={f.key} className={f.half ? "col-span-1" : "col-span-1 sm:col-span-2"}>
          <label className={labelCls}>{f.label}{f.required && <span className="text-rausch"> *</span>}</label>
          {renderField(f)}
        </div>
      ))}
    </div>
  );

  const fmtBudget = (min: string, max: string) => {
    const n = (v: string) => Number(v) || 0;
    const lakh = (v: number) => (v >= 10000000 ? `${(v / 10000000).toFixed(1)} Cr` : v >= 100000 ? `${Math.round(v / 100000)} L` : `${Math.round(v / 1000)}k`);
    if (role === "tenant") return `₹${lakh(n(min))}–${lakh(n(max))}/mo`;
    return `₹${lakh(n(min))}–${lakh(n(max))}`;
  };

  const handleSubmit = () => {
    const tags = [form.occupancy, form.possession === "Ready to move" ? "Ready to move" : undefined, form.loan === "Yes" ? "Loan needed" : undefined, form.openToAgents === "Yes" ? "Open to agents" : undefined].filter(Boolean) as string[];
    const req: Requirement = {
      id: Date.now(),
      role,
      category: role === "agent" ? undefined : slug,
      name: name || "You",
      city,
      areas,
      budgetMin: Number(budgetMin) || 0,
      budgetMax: Number(budgetMax) || 0,
      budgetLabel: role === "agent" ? (notes || "Agent profile") : fmtBudget(budgetMin, budgetMax),
      moveIn: form.moveIn,
      bhk: form.bhk,
      furnishing: form.furnishing,
      notes,
      tags,
      postedAt: "Just now",
      responseCount: 0,
    };
    createRequirementApi(req).then((savedReq) => {
      setRequirements((prev) => [savedReq, ...prev]);
      setSubmitted(true);
      setFilterRole("all");
      setStep(1);
      // Reset inputs
      setName("");
      setForm({});
      setAreas([]);
      setBudgetMin("");
      setBudgetMax("");
      setNotes("");
      if (typeof document !== "undefined") {
        document.getElementById("requirements-feed")?.scrollIntoView({ behavior: "smooth" });
      }
    });
  };

  const roleDef = getRole(role)!;
  const worldCategories = categoriesForWorld(world);
  const showCategory = role !== "agent";

  return (
    <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Post a requirement" }]}>
      {/* Themed hero band — demand-side, split layout with animated vector art */}
      <section
        aria-label="Post your requirement"
        className="relative overflow-hidden bg-gradient-to-br from-[#0F0C20] to-[#15102A] -mx-4 md:-mx-6 lg:-mx-10 px-4 md:px-6 lg:px-10 py-12 md:py-16 mb-8 text-white rounded-b-[24px] shadow-airbnb"
      >
        {/* Decorative background blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-rausch/30 blur-[100px]" />
          <div className="absolute -bottom-28 -left-24 w-96 h-96 rounded-full bg-violet-600/30 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Text Column: Onboarding steps */}
          <div className="md:col-span-7 flex flex-col items-start text-left">
            <span className="inline-block bg-rausch/20 text-rausch border border-rausch/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              Real-time Matchmaking
            </span>
            <h1 className="text-[clamp(28px,4.5vw,40px)] font-bold text-white tracking-tight leading-[1.1] mb-4">
              Requirement Matchboard
            </h1>
            <p className="text-sm md:text-base text-white/80 max-w-[550px] mb-6 leading-relaxed">
              Post what you want to rent, buy, or lease. Skip scrolling through listings — let landlords, sellers, and verified agents come to you with matching offers.
            </p>

            {/* 3 Step onboarding list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm">
                <span className="w-6 h-6 rounded-full bg-rausch text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <h3 className="text-xs font-bold text-white">Post Details</h3>
                  <p className="text-[10px] text-white/60 mt-0.5">Specify configuration, budget, and areas.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm">
                <span className="w-6 h-6 rounded-full bg-violet-500 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <h3 className="text-xs font-bold text-white">Instant Alert</h3>
                  <p className="text-[10px] text-white/60 mt-0.5">Matching owners get notified instantly.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <h3 className="text-xs font-bold text-white">Direct Deals</h3>
                  <p className="text-[10px] text-white/60 mt-0.5">Compare matching offers and seal the deal.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Vector Illustration Column */}
          <div className="md:col-span-5 flex justify-center items-center relative h-[220px] md:h-[260px] overflow-visible">
            <div className="absolute w-[200px] h-[200px] md:w-[240px] md:h-[240px] rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center">
              {/* Pulsing ring 1 */}
              <div className="absolute inset-4 rounded-full border border-rausch/20 animate-ping opacity-60" style={{ animationDuration: '3s' }} />
              {/* Pulsing ring 2 */}
              <div className="absolute inset-12 rounded-full border border-violet-500/20 animate-ping opacity-60" style={{ animationDuration: '4.5s' }} />
              
              {/* Central radar core */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rausch to-violet-600 shadow-lg flex items-center justify-center z-10 border border-white/20 animate-pulse">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-white">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>

              {/* Custom CSS Style Injection for smooth float animations */}
              <style>{`
                @keyframes float-slow {
                  0%, 100% { transform: translateY(0) rotate(0deg); }
                  50% { transform: translateY(-12px) rotate(1.5deg); }
                }
                .float-bubble-1 { animation: float-slow 4.5s ease-in-out infinite; }
                .float-bubble-2 { animation: float-slow 5.5s ease-in-out infinite; animation-delay: 0.8s; }
                .float-bubble-3 { animation: float-slow 5s ease-in-out infinite; animation-delay: 0.4s; }
                .float-bubble-4 { animation: float-slow 6s ease-in-out infinite; animation-delay: 1.2s; }
              `}</style>

              {/* Floating Match Bubble 1 */}
              <div className="absolute top-0 -left-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs md:text-sm font-semibold text-white shadow-airbnb float-bubble-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rausch animate-pulse" />
                Rent 2BHK
              </div>

              {/* Floating Match Bubble 2 */}
              <div className="absolute bottom-4 -left-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs md:text-sm font-semibold text-white shadow-airbnb float-bubble-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Owner Matched!
              </div>

              {/* Floating Match Bubble 3 */}
              <div className="absolute top-10 -right-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs md:text-sm font-semibold text-white shadow-airbnb float-bubble-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                Koramangala
              </div>

              {/* Floating Match Bubble 4 */}
              <div className="absolute bottom-8 -right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs md:text-sm font-semibold text-white shadow-airbnb float-bubble-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                ₹25k Budget
              </div>

              {/* Floating Match Bubble 5 */}
              <div className="absolute -top-10 left-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs md:text-sm font-semibold text-white shadow-airbnb float-bubble-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                1 BHK Flatmate
              </div>

              {/* Floating Match Bubble 6 */}
              <div className="absolute -bottom-10 left-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs md:text-sm font-semibold text-white shadow-airbnb float-bubble-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Office in HSR
              </div>

              {/* Floating Match Bubble 7 */}
              <div className="absolute top-[40%] -left-28 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs md:text-sm font-semibold text-white shadow-airbnb float-bubble-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
                DevOps Job
              </div>

              {/* Floating Match Bubble 8 */}
              <div className="absolute top-[40%] -right-28 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs md:text-sm font-semibold text-white shadow-airbnb float-bubble-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Verified Buyer
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main split dashboard layout */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-16">
        
        {/* Left Column: Post form (Sticky on desktop) */}
        <section className="lg:col-span-5 lg:sticky lg:top-24 bg-canvas border border-hairline rounded-[24px] p-5 sm:p-6 shadow-airbnb transition-all">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-rausch">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create Requirement
              </h2>
              <span className="text-xs font-bold text-rausch bg-rausch/10 px-2 py-0.5 rounded-full">
                Step {step} of 3
              </span>
            </div>
            <p className="text-xs text-muted mt-1">{roleDef.tagline}</p>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? "bg-rausch shadow-[0_0_8px_rgba(255,56,92,0.4)]" : "bg-surface-soft"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? "bg-rausch shadow-[0_0_8px_rgba(255,56,92,0.4)]" : "bg-surface-soft"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 3 ? "bg-rausch shadow-[0_0_8px_rgba(255,56,92,0.4)]" : "bg-surface-soft"}`} />
          </div>

          {submitted && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg flex items-center gap-2 animate-fade-up" role="status">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600 shrink-0">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
              </svg>
              Requirement posted! It is live on the matchboard.
            </div>
          )}

          {/* Step 1: Role & Category Selector */}
          {step === 1 && (
            <div className="animate-fade-up">
              {/* Role selector */}
              <div className="mb-5">
                <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-2">My Profile Role</label>
                <div role="group" aria-label="Your role" className="flex items-center bg-surface-soft rounded-xl p-1">
                  {roleList().map((rd) => {
                    const on = role === rd.role;
                    return (
                      <button key={rd.role} type="button" onClick={() => chooseRole(rd.role)} aria-pressed={on}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-[8px] transition-all ${on ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
                        {rd.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* World toggle (hidden for single-world cases) */}
              {roleDef.worlds.length > 1 && (
                <div className="mb-5">
                  <label className={labelCls}>Property Type</label>
                  <div role="group" aria-label="Property world" className="flex items-center bg-surface-soft border border-hairline-soft rounded-xl p-1 w-full">
                    {roleDef.worlds.map((w) => {
                      const on = world === w;
                      return (
                        <button key={w} type="button" onClick={() => chooseWorld(w)} aria-pressed={on}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-[8px] capitalize transition-colors ${on ? "bg-ink text-white shadow-sm" : "text-muted hover:text-ink"}`}>
                          {w}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category chips */}
              {showCategory && (
                <div className="mb-5">
                  <label className={labelCls}>{role === "seller" ? "Select Category" : "What category?"}</label>
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category">
                    {worldCategories.map((c) => {
                      const on = slug === c.slug;
                      return (
                        <button key={c.slug} type="button" onClick={() => setSlug(c.slug)} aria-pressed={on}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-[8px] border transition-colors ${on ? "bg-rausch text-white border-rausch shadow-sm" : "bg-canvas text-body border-hairline hover:border-ink"}`}>
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Configuration & Budget */}
          {step === 2 && (
            <div className="animate-fade-up">
              {/* Category-aware fields */}
              <div className="mb-5">{renderFieldGroup(requirementFields(role, slug))}</div>

              {/* Budget range (not for agents) */}
              {role !== "agent" && (
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <label className={labelCls}>Budget Min (₹)</label>
                    <input inputMode="numeric" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="Min budget" className={field} />
                  </div>
                  <div>
                    <label className={labelCls}>Budget Max (₹)</label>
                    <input inputMode="numeric" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="Max budget" className={field} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Location & Details */}
          {step === 3 && (
            <div className="animate-fade-up">
              {/* Preferred areas (multi) */}
              <div className="mb-5">
                <label className={labelCls}>{role === "agent" ? "Coverage Areas" : "Preferred Localities"}</label>
                <div className="flex gap-2 mb-2">
                  <input value={areaInput} onChange={(e) => setAreaInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addArea(); } }}
                    placeholder="Type area (e.g. Koramangala)" className={field} />
                  <button type="button" onClick={addArea} className="px-4 h-12 shrink-0 border border-hairline rounded-[8px] text-sm font-semibold text-ink hover:bg-surface-soft active:scale-95 transition-all">Add</button>
                </div>
                {areas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-surface-soft rounded-[8px] border border-hairline-soft" aria-label="Selected areas">
                    {areas.map((a) => (
                      <span key={a} className="inline-flex items-center gap-1.5 text-xs bg-canvas text-ink px-2.5 py-1 rounded-md border border-hairline shadow-sm">
                        {a}
                        <button type="button" onClick={() => setAreas((p) => p.filter((x) => x !== a))} aria-label={`Remove ${a}`} className="text-muted hover:text-error transition-colors font-semibold">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Name + city */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <label className={labelCls}>Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" className={field} />
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <div className="relative">
                    <select value={city} onChange={(e) => setCity(e.target.value)} className={`${field} text-ink pr-8`}>
                      {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className={labelCls}>Tell {role === "agent" ? "clients" : "owners"} more</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  placeholder="e.g. Seeking furnished flat with good ventilation, ready to move in ASAP." className={`${field} h-auto py-2.5 resize-none`} />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-hairline-soft">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 h-12 border border-hairline rounded-xl text-sm font-semibold text-ink hover:bg-surface-soft active:scale-95 transition-all"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="flex-1 h-12 bg-ink text-white text-sm font-semibold rounded-xl hover:bg-ink-hover hover:shadow-md active:scale-[0.98] transition-all"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 h-12 bg-rausch text-white text-sm font-bold rounded-xl hover:bg-rausch-active hover:shadow-lg active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2"
              >
                Post Requirement
              </button>
            )}
          </div>
        </section>

        {/* Right Column: Requirements Feed */}
        <section id="requirements-feed" className="lg:col-span-7">
          <div className="bg-canvas border border-hairline rounded-[24px] p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3 pb-4 border-b border-hairline-soft">
              <div>
                <h2 className="text-lg font-bold text-ink">Matchboard Feed</h2>
                <p className="text-xs text-muted mt-0.5">Showing recent seeker requirements in {city}</p>
              </div>
              <div role="group" aria-label="Filter by role" className="inline-flex items-center gap-1 bg-surface-soft border border-hairline-soft rounded-full p-1">
                {(["all", "tenant", "buyer"] as const).map((r) => {
                  const on = filterRole === r;
                  return (
                    <button key={r} type="button" onClick={() => setFilterRole(r)} aria-pressed={on}
                      className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${on ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>
                      {r === "all" ? "All" : roleList().find((x) => x.role === r)!.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {feed.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-muted-soft mb-3">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
                <p className="text-sm font-semibold text-ink">No requirements found</p>
                <p className="text-xs text-muted mt-1">Try changing the filter or post your own to start matchmaking.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {feed.map((r) => (
                  <div key={r.id} className="animate-fade-up">
                    <RequirementCard req={r} onRespond={setRespondTarget} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {respondTarget && (
        <RespondModal
          req={respondTarget}
          onClose={() => setRespondTarget(null)}
          onSent={(id) => {
            const target = requirements.find((r) => r.id === id);
            if (target) {
              const updated = { ...target, responseCount: target.responseCount + 1 };
              updateRequirementApi(updated).then((ok) => {
                if (ok) {
                  setRequirements((prev) => prev.map((r) => (r.id === id ? updated : r)));
                }
              });
            }
          }}
        />
      )}
    </PageLayout>
  );
}
