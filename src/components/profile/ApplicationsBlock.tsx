import { Card, EmptyState, SectionLabel } from "./ui";

/**
 * Job application tracker. Real applications will be wired from the backend
 * (GET /jobs?applied=me); until then every member sees the empty state.
 */
export default function ApplicationsBlock() {
  return (
    <section>
      <SectionLabel>My applications</SectionLabel>
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
    </section>
  );
}
