"use client";
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import RequirementCard from "@/components/RequirementCard";
import RespondModal from "@/components/RespondModal";
import { Role, roleList, getRole, Requirement, REQUIREMENTS } from "@/lib/requirements";
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
    setRequirements((p) => [req, ...p]);
    setSubmitted(true);
    setFilterRole("all");
    if (typeof document !== "undefined") {
      document.getElementById("requirements-feed")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const roleDef = getRole(role)!;
  const worldCategories = categoriesForWorld(world);
  const showCategory = role !== "agent";

  return (
    <PageLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Post a requirement" }]}>
      {/* Themed hero band — demand-side, mirrors the /post hero pattern */}
      <section
        aria-label="Post your requirement"
        className="relative overflow-hidden bg-gradient-to-br from-surface-soft via-rausch/5 to-violet/20 -mx-4 md:-mx-6 lg:-mx-10 px-4 md:px-6 lg:px-10 pt-8 md:pt-12 pb-8 md:pb-10 mb-8 rounded-b-[32px]"
      >
        {/* Decorative themed background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-rausch/10 blur-3xl" />
          <div className="absolute -bottom-28 -left-24 w-80 h-80 rounded-full bg-violet/20 blur-3xl" />
          <div className="absolute top-12 right-1/4 w-24 h-24 rounded-[20px] rotate-12 bg-violet/15" />
          <div className="absolute bottom-10 left-1/3 w-16 h-16 rounded-full border border-violet/30" />
        </div>
        <div className="relative z-10 max-w-[760px] mx-auto">
          <p className="text-sm font-semibold text-rausch uppercase tracking-wider mb-3">Demand-side · Seekers post first</p>
          <h1 className="text-[clamp(26px,4vw,40px)] font-bold text-ink tracking-tight mb-2">Post your requirement</h1>
          <p className="text-base text-body max-w-[520px]">{roleDef.tagline}</p>
        </div>
      </section>

      <section className="max-w-[760px] mx-auto">
        {submitted && (
          <p className="text-sm font-medium text-rausch mb-4" role="status">Requirement posted — see it in the feed below.</p>
        )}

        {/* Role selector */}
        <div role="group" aria-label="Your role" className="flex items-center bg-surface-soft rounded-[8px] p-1 mb-6">
          {roleList().map((rd) => {
            const on = role === rd.role;
            return (
              <button key={rd.role} type="button" onClick={() => chooseRole(rd.role)} aria-pressed={on}
                className={`flex-1 py-2 text-sm font-semibold rounded-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${on ? "bg-ink text-white shadow-airbnb" : "text-muted hover:text-ink"}`}>
                {rd.label}
              </button>
            );
          })}
        </div>

        {/* World toggle (hidden for single-world cases) */}
        {roleDef.worlds.length > 1 && (
          <>
            <label className={labelCls}>Property type</label>
            <div role="group" aria-label="Property world" className="inline-flex items-center gap-1 bg-surface-soft border border-hairline-soft rounded-full p-1 mb-5 w-full">
              {roleDef.worlds.map((w) => {
                const on = world === w;
                return (
                  <button key={w} type="button" onClick={() => chooseWorld(w)} aria-pressed={on}
                    className={`flex-1 py-2 text-sm font-semibold rounded-full capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${on ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>
                    {w}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Category chips */}
        {showCategory && (
          <>
            <label className={labelCls}>{role === "seller" ? "What are you selling/renting out?" : "What are you looking for?"}</label>
            <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Category">
              {worldCategories.map((c) => {
                const on = slug === c.slug;
                return (
                  <button key={c.slug} type="button" onClick={() => setSlug(c.slug)} aria-pressed={on}
                    className={`px-3 py-1.5 text-sm font-medium rounded-[8px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${on ? "bg-rausch text-white border-rausch" : "bg-canvas text-body border-hairline hover:border-ink"}`}>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Category-aware fields */}
        <div className="mb-6">{renderFieldGroup(requirementFields(role, slug))}</div>

        {/* Budget range (not for agents) */}
        {role !== "agent" && (
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className={labelCls}>Budget min (₹)</label>
              <input inputMode="numeric" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="e.g. 25000" className={field} />
            </div>
            <div>
              <label className={labelCls}>Budget max (₹)</label>
              <input inputMode="numeric" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="e.g. 35000" className={field} />
            </div>
          </div>
        )}

        {/* Preferred areas (multi) */}
        <label className={labelCls}>{role === "agent" ? "Coverage areas" : "Preferred areas"}</label>
        <div className="flex gap-2 mb-2">
          <input value={areaInput} onChange={(e) => setAreaInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addArea(); } }}
            placeholder="e.g. Koramangala" className={field} />
          <button type="button" onClick={addArea} className="px-4 h-12 shrink-0 border border-hairline rounded-[8px] text-sm font-medium text-ink hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink">Add</button>
        </div>
        <div className="flex flex-wrap gap-2 mb-5" aria-label="Selected areas">
          {areas.map((a) => (
            <span key={a} className="inline-flex items-center gap-1 text-sm bg-surface-soft text-ink px-3 py-1 rounded-full">
              {a}
              <button type="button" onClick={() => setAreas((p) => p.filter((x) => x !== a))} aria-label={`Remove ${a}`} className="text-muted hover:text-ink">✕</button>
            </span>
          ))}
        </div>

        {/* Name + city */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className={labelCls}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" className={field} />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className={`${field} text-ink`}>
              {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <label className={labelCls}>Tell {role === "agent" ? "clients" : "owners"} more</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          placeholder="Anything that helps them respond better" className={`${field} h-auto py-2.5 resize-none mb-6`} />

        <button type="button" onClick={handleSubmit}
          className="w-full h-12 bg-rausch text-white text-base font-semibold rounded-[8px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2">
          Post requirement
        </button>
      </section>

      <section id="requirements-feed" className="max-w-[1100px] mx-auto mt-14">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-[22px] md:text-[26px] font-bold tracking-tight text-ink">Recent requirements</h2>
          <div role="group" aria-label="Filter by role" className="inline-flex items-center gap-1 bg-surface-soft border border-hairline-soft rounded-full p-1">
            {(["all", "tenant", "buyer"] as const).map((r) => {
              const on = filterRole === r;
              return (
                <button key={r} type="button" onClick={() => setFilterRole(r)} aria-pressed={on}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-full capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${on ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>
                  {r === "all" ? "All" : roleList().find((x) => x.role === r)!.label}
                </button>
              );
            })}
          </div>
        </div>

        {feed.length === 0 ? (
          <p className="text-sm text-muted py-10 text-center">No requirements match this filter yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {feed.map((r) => (<RequirementCard key={r.id} req={r} onRespond={setRespondTarget} />))}
          </div>
        )}
      </section>

      {respondTarget && (
        <RespondModal
          req={respondTarget}
          onClose={() => setRespondTarget(null)}
          onSent={(id) => setRequirements((p) => p.map((r) => (r.id === id ? { ...r, responseCount: r.responseCount + 1 } : r)))}
        />
      )}
    </PageLayout>
  );
}
