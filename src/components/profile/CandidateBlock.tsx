import { DEMO_EDUCATION, DEMO_EXPERIENCE, DEMO_SKILLS } from "./mockData";
import { Card, EmptyState, SectionLabel } from "./ui";

/** Skills, experience and education. */
export default function CandidateBlock({ hasData }: { hasData: boolean }) {
  return (
    <section>
      <SectionLabel>Candidate profile</SectionLabel>
      {!hasData ? (
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
      ) : (
        <Card className="p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-ink mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {DEMO_SKILLS.map((s) => (
                <span key={s} className="text-[12px] font-medium text-[#534AB7] bg-[#534AB7]/10 px-2.5 py-1 rounded-full">
                  {s}
                </span>
              ))}
              <button className="text-[12px] font-medium text-muted border border-dashed border-hairline px-2.5 py-1 rounded-full hover:border-ink hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink">
                + Add
              </button>
            </div>
          </div>
          <div className="border-t border-hairline pt-3">
            <p className="text-sm font-semibold text-ink mb-2">Experience</p>
            {DEMO_EXPERIENCE.map((e) => (
              <div key={e.role} className="flex justify-between py-1">
                <div>
                  <p className="text-sm text-ink">{e.role}</p>
                  <p className="text-[12px] text-muted">{e.org}</p>
                </div>
                <span className="text-[12px] text-muted">{e.period}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-hairline pt-3">
            <p className="text-sm font-semibold text-ink mb-2">Education</p>
            {DEMO_EDUCATION.map((e) => (
              <div key={e.degree} className="flex justify-between py-1">
                <div>
                  <p className="text-sm text-ink">{e.degree}</p>
                  <p className="text-[12px] text-muted">{e.org}</p>
                </div>
                <span className="text-[12px] text-muted">{e.period}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </section>
  );
}
