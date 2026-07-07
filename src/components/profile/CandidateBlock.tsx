import { Card, EmptyState, SectionLabel } from "./ui";

/**
 * Skills, experience and education. Real candidate data will be wired from the
 * backend; until then every member sees the "build your profile" empty state.
 */
export default function CandidateBlock() {
  return (
    <section>
      <SectionLabel>Candidate profile</SectionLabel>
      <Card>
        <EmptyState
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 14l9-5-9-5-9 5 9 5zm0 0v7m-6.16-3.42A12 12 0 0012 21a12 12 0 006.16-3.42" />
            </svg>
          }
          title="Build your candidate profile"
          hint="Add skills, experience and education so employers can find you."
          cta="Add skills"
          accentText="text-rausch"
          accentBgSoft="bg-rausch/10"
        />
      </Card>
    </section>
  );
}
