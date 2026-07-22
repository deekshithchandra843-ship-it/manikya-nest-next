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
      { key: "specialities", label: "Specialities", type: "pills", options: ["Residential", "Commercial", "Luxury", "Leasing", "Stay"], required: true },
      { key: "years", label: "Years active", type: "number", placeholder: "e.g. 8", half: true, required: true },
      { key: "inventory", label: "Live properties", type: "number", placeholder: "e.g. 120", half: true, required: true },
      { key: "languages", label: "Languages", type: "text", placeholder: "English, Hindi, Kannada", required: true },
    ];
  }
  if (role === "seller") {
    return [
      { key: "bhk", label: "Configuration", type: "select", options: bhkTypes, required: true },
      { key: "area", label: "Built-up area (sq ft)", type: "number", placeholder: "e.g. 1200", half: true, required: true },
      { key: "howSoon", label: "Sell within", type: "select", options: ["ASAP", "30 days", "60 days", "3 months"], half: true, required: true },
      { key: "openToAgents", label: "Open to agents", type: "pills", options: ["Yes", "No"], required: true },
    ];
  }
  // tenant + buyer
  const isBuy = role === "buyer";
  const fields: FieldDef[] = [];
  if (slug !== "pg" && slug !== "coliving") {
    fields.push({ key: "bhk", label: "BHK type", type: "select", options: bhkTypes, required: true });
  }
  if (isBuy) {
    fields.push({ key: "possession", label: "Possession", type: "pills", options: ["Ready to move", "Under construction", "Any"], required: true });
    fields.push({ key: "loan", label: "Loan needed", type: "pills", options: ["Yes", "No"], required: true });
  } else {
    fields.push({ key: "moveIn", label: "Move-in", type: "select", options: ["Immediate", "Within 2 weeks", "Within 1 month", "Flexible"], half: true, required: true });
    fields.push({ key: "furnishing", label: "Furnishing", type: "select", options: furnishings, half: true, required: true });
    fields.push({ key: "occupancy", label: "Occupancy", type: "pills", options: ["Family", "Bachelors", "Students"], required: true });
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
  const set = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrorMsg("");
  };

  // Shared inputs
  const [name, setName] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [areas, setAreas] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState(1);

  // Feed filters + respond flow
  const [filterRole, setFilterRole] = useState<Role | "all">("all");
  const [respondTarget, setRespondTarget] = useState<Requirement | null>(null);

  // Only tenant/buyer requirements surface here — seller/agent are no longer
  // selectable, so any such items in the data are kept out of the feed too.
  const feed = requirements.filter((r) => (r.role === "tenant" || r.role === "buyer") && (filterRole === "all" || r.role === filterRole));

  const chooseRole = (r: Role) => {
    setRole(r);
    const w = getRole(r)!.worlds[0];
    setWorld(w);
    const filteredCats = categoriesForWorld(w).filter((c) => {
      if (r === "buyer") return c.slug === "buy" || (w === "commercial" && c.slug !== "coworking");
      if (r === "tenant") return c.slug !== "buy" && c.slug !== "land" && c.slug !== "lease";
      return true;
    });
    setSlug(filteredCats[0]?.slug || "");
    setForm({});
    setErrorMsg("");
  };
  const chooseWorld = (w: World) => {
    setWorld(w);
    const filteredCats = categoriesForWorld(w).filter((c) => {
      if (role === "buyer") return c.slug === "buy" || (w === "commercial" && c.slug !== "coworking");
      if (role === "tenant") return c.slug !== "buy" && c.slug !== "land" && c.slug !== "lease";
      return true;
    });
    setSlug(filteredCats[0]?.slug || "");
    setErrorMsg("");
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
                className={`px-4 py-2 text-sm font-medium rounded-[8px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2 ${on ? "bg-job-navy/[.08] border-job-navy text-job-navy" : "bg-canvas text-body border-hairline hover:border-ink"}`}>
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
          <label className={labelCls}>{f.label}{f.required && <span className="text-job-navy"> *</span>}</label>
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

  const handleNextStep = () => {
    setErrorMsg("");
    if (step === 1) {
      if (showCategory && !slug) {
        setErrorMsg("Please select a category.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const fields = requirementFields(role, slug);
      for (const f of fields) {
        if (f.required && !form[f.key]) {
          setErrorMsg(`Please fill in "${f.label}".`);
          return;
        }
      }
      if (role !== "agent") {
        if (!budgetMin || !budgetMax) {
          setErrorMsg("Please provide both minimum and maximum budget.");
          return;
        }
        if (Number(budgetMin) > Number(budgetMax)) {
          setErrorMsg("Minimum budget cannot be higher than maximum budget.");
          return;
        }
      }
      setStep(3);
    }
  };

  const handleSubmit = () => {
    setErrorMsg("");
    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (areas.length === 0) {
      setErrorMsg("Please add at least one preferred area/locality.");
      return;
    }
    if (!notes.trim()) {
      setErrorMsg("Please provide description details in notes.");
      return;
    }

    const tags = [form.occupancy, form.possession === "Ready to move" ? "Ready to move" : undefined, form.loan === "Yes" ? "Loan needed" : undefined, form.openToAgents === "Yes" ? "Open to agents" : undefined].filter(Boolean) as string[];
    const req: Requirement = {
      id: Date.now(),
      role,
      category: role === "agent" ? undefined : slug,
      name: name.trim(),
      city,
      areas,
      budgetMin: Number(budgetMin) || 0,
      budgetMax: Number(budgetMax) || 0,
      budgetLabel: role === "agent" ? (notes || "Agent profile") : fmtBudget(budgetMin, budgetMax),
      moveIn: form.moveIn,
      bhk: form.bhk,
      furnishing: form.furnishing,
      notes: notes.trim(),
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
  const worldCategories = categoriesForWorld(world).filter((c) => {
    if (role === "buyer") return c.slug === "buy" || (world === "commercial" && c.slug !== "coworking");
    if (role === "tenant") return c.slug !== "buy" && c.slug !== "land" && c.slug !== "lease";
    return true;
  });
  const showCategory = role !== "agent";

  return (
    <>
      {/* Spotlight hero — jobs-page direction: a full-bleed dark editorial
          cover that fills the screen below the sticky navbar. It lives OUTSIDE
          PageLayout so it spans the full viewport width edge-to-edge; the form
          and feed stay in the constrained container below. Navy field (60%), a
          cool navy-lift glow plus white text mass (30%), and sun as the 10%
          accent only: eyebrow, headline highlight, scroll arrow. Sun is never
          text on white here — the field is navy. */}
      <section
        aria-label="Post your requirement"
        className="relative overflow-hidden w-full min-h-[56dvh] pt-20 px-4 md:px-6 lg:px-10 flex items-center rounded-b-[28px] shadow-airbnb"
        style={{ background: "linear-gradient(160deg,#141d38 0%,#1b2749 52%,#141d38 100%)" }}
      >
        {/* 30% — supporting depth: one navy lift, one restrained pool of accent
            warmth so the field never reads flat. */}
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-20 w-[26rem] h-[26rem] rounded-full" style={{ background: "radial-gradient(circle,rgba(58,84,163,.38),transparent 70%)" }} />
        <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-16 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle,rgba(252,219,50,.16),transparent 70%)" }} />

        <div className="relative max-w-[900px] mx-auto w-full text-center flex flex-col items-center gap-5 md:gap-6 py-16 md:py-20">
          {/* 10% — accent eyebrow */}
          <span
            className="inline-flex items-center gap-2 h-7 px-3.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em]"
            style={{ color: "#fcdb32", background: "rgba(252,219,50,.10)", border: "1px solid rgba(252,219,50,.28)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#fcdb32" }} aria-hidden="true" />
            Real-time matchmaking
          </span>

          <h1 className="text-white font-extrabold tracking-tight leading-[1.1] text-[clamp(28px,5vw,50px)]">
            <span className="block">Skip the scroll.</span>
            {/* The accent lands on the one phrase that carries the promise. */}
            <span className="block" style={{ color: "#fcdb32" }}>Let owners find you.</span>
          </h1>

          <p className="text-[14px] md:text-[15.5px] text-white/65 max-w-[480px] leading-relaxed">
            Post what you want to rent, buy or lease — landlords, sellers and verified agents bring matching offers straight to you.
          </p>
        </div>

        {/* scroll hint */}
        <div aria-hidden="true" className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Post your requirement</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fcdb32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Post a requirement" }]}>
        {/* Main split dashboard layout */}
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-16">
        
        {/* Left Column: Post form (Sticky on desktop) */}
        <section className="lg:col-span-5 lg:sticky lg:top-24 bg-canvas border border-hairline rounded-[24px] p-5 sm:p-6 shadow-airbnb transition-all">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-job-navy">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create Requirement
              </h2>
              <span className="text-xs font-bold text-job-navy bg-job-navy-soft px-2 py-0.5 rounded-full">
                Step {step} of 3
              </span>
            </div>
            <p className="text-xs text-muted mt-1">{roleDef.tagline}</p>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? "bg-job-sun shadow-[0_0_8px_rgba(252,219,50,0.45)]" : "bg-surface-soft"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? "bg-job-sun shadow-[0_0_8px_rgba(252,219,50,0.45)]" : "bg-surface-soft"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 3 ? "bg-job-sun shadow-[0_0_8px_rgba(252,219,50,0.45)]" : "bg-surface-soft"}`} />
          </div>

          {submitted && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg flex items-center gap-2 animate-fade-up" role="status">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600 shrink-0">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
              </svg>
              Requirement posted! It is live on the matchboard.
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 bg-error/5 border border-error/25 text-error text-xs font-medium rounded-lg flex items-center gap-2 animate-fade-up animate-duration-200" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-error shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errorMsg}
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
                          className={`flex-1 py-1.5 text-xs font-bold rounded-[8px] capitalize transition-colors ${on ? "bg-job-navy text-white shadow-sm" : "text-muted hover:text-ink"}`}>
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
                        <button key={c.slug} type="button" onClick={() => { setSlug(c.slug); setErrorMsg(""); }} aria-pressed={on}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-[8px] border transition-colors ${on ? "bg-job-navy text-white border-job-navy shadow-sm" : "bg-canvas text-body border-hairline hover:border-ink"}`}>
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
                    <label className={labelCls}>Budget Min (₹) <span className="text-job-navy">*</span></label>
                    <input inputMode="numeric" value={budgetMin} onChange={(e) => { setBudgetMin(e.target.value); setErrorMsg(""); }} placeholder="Min budget" className={field} />
                  </div>
                  <div>
                    <label className={labelCls}>Budget Max (₹) <span className="text-job-navy">*</span></label>
                    <input inputMode="numeric" value={budgetMax} onChange={(e) => { setBudgetMax(e.target.value); setErrorMsg(""); }} placeholder="Max budget" className={field} />
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
                <label className={labelCls}>{role === "agent" ? "Coverage Areas" : "Preferred Localities"} <span className="text-job-navy">*</span></label>
                <div className="flex gap-2 mb-2">
                  <input value={areaInput} onChange={(e) => { setAreaInput(e.target.value); setErrorMsg(""); }}
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
                  <label className={labelCls}>Name <span className="text-job-navy">*</span></label>
                  <input value={name} onChange={(e) => { setName(e.target.value); setErrorMsg(""); }} placeholder="Your name" autoComplete="name" className={field} />
                </div>
                <div>
                  <label className={labelCls}>City <span className="text-job-navy">*</span></label>
                  <div className="relative">
                    <select value={city} onChange={(e) => { setCity(e.target.value); setErrorMsg(""); }} className={`${field} text-ink pr-8`}>
                      {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className={labelCls}>Tell {role === "agent" ? "clients" : "owners"} more <span className="text-job-navy">*</span></label>
                <textarea value={notes} onChange={(e) => { setNotes(e.target.value); setErrorMsg(""); }} rows={3}
                  placeholder="e.g. Seeking furnished flat with good ventilation, ready to move in ASAP." className={`${field} h-auto py-2.5 resize-none`} />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-hairline-soft">
            {step > 1 && (
              <button
                type="button"
                onClick={() => { setStep((s) => s - 1); setErrorMsg(""); }}
                className="flex-1 h-12 border border-hairline rounded-xl text-sm font-semibold text-ink hover:bg-surface-soft active:scale-95 transition-all"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 h-12 bg-job-navy text-white text-sm font-semibold rounded-xl hover:bg-job-navy-lift hover:shadow-md active:scale-[0.98] transition-all"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 h-12 bg-job-sun text-job-navy text-sm font-bold rounded-xl hover:bg-job-sun-active hover:shadow-lg active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy focus-visible:ring-offset-2"
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
                      className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-job-navy ${on ? "bg-job-navy text-white" : "text-muted hover:text-ink"}`}>
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
    </>
  );
}
