"use client";
import { useState } from "react";
import { Card, SectionLabel } from "./ui";

/** Resume upload/replace card. Upload is mocked (frontend only). */
export default function ResumeBlock({ initialUploaded }: { initialUploaded: boolean }) {
  const [uploaded, setUploaded] = useState(initialUploaded);

  return (
    <section>
      <SectionLabel>Resume</SectionLabel>
      <Card className="p-4 flex items-center gap-3">
        <span className="shrink-0 w-10 h-10 rounded-[10px] bg-rausch/10 text-rausch flex items-center justify-center" aria-hidden="true">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 12h6m-6 4h6M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5" />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          {uploaded ? (
            <>
              <p className="text-sm font-medium text-ink truncate">My_Resume.pdf</p>
              <p className="text-[11px] text-muted">Uploaded · 240 KB</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-ink">No resume yet</p>
              <p className="text-[11px] text-muted">Add one to apply faster</p>
            </>
          )}
        </div>
        <button
          onClick={() => setUploaded(true)}
          className="text-sm font-medium text-ink border border-hairline rounded-[8px] px-3 py-1.5 hover:bg-surface-soft transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
        >
          {uploaded ? "Replace" : "Upload"}
        </button>
      </Card>
    </section>
  );
}
