import { DEMO_APPLICATIONS, type MockApplication } from "./mockData";
import { Card, EmptyState, SectionLabel } from "./ui";

const STAGE_STYLE: Record<MockApplication["stage"], string> = {
  Interview: "text-[#534AB7] bg-[#534AB7]/10",
  Shortlisted: "text-green-700 bg-green-100",
  Applied: "text-muted bg-surface-strong",
};

/** Job application tracker. */
export default function ApplicationsBlock({ hasData }: { hasData: boolean }) {
  return (
    <section>
      <SectionLabel>My applications</SectionLabel>
      {!hasData ? (
        <Card>
          <EmptyState
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            title="No applications yet"
            hint="Jobs you apply to will be tracked here."
            cta="Browse jobs"
            ctaHref="/jobs"
            accentText="text-rausch"
            accentBgSoft="bg-rausch/10"
          />
        </Card>
      ) : (
        <Card className="divide-y divide-hairline overflow-hidden">
          {DEMO_APPLICATIONS.map((a) => (
            <div key={a.role} className="flex items-center justify-between px-4 py-3 hover:bg-surface-soft transition-colors">
              <div>
                <p className="text-sm font-medium text-ink">{a.role}</p>
                <p className="text-[12px] text-muted">{a.company}</p>
              </div>
              <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${STAGE_STYLE[a.stage]}`}>
                {a.stage}
              </span>
            </div>
          ))}
        </Card>
      )}
    </section>
  );
}
