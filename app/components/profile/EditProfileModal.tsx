"use client";
import { useEffect, useRef, useState } from "react";
import { updateSession, type DemoSession } from "../../lib/demoAuth";

/**
 * Edit-profile modal — same chrome as the original, but writes through
 * updateSession, which notifies the session store; every subscriber
 * (profile page, navbar chip) re-renders with the new name/city.
 */
export default function EditProfileModal({
  session,
  onClose,
}: {
  session: DemoSession;
  onClose: () => void;
}) {
  const [name, setName] = useState(session.name);
  const [city, setCity] = useState(session.city ?? "");
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSave = () => {
    if (!name.trim()) {
      setError("Name can't be empty.");
      return;
    }
    updateSession({ name: name.trim(), city: city.trim() || undefined });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-canvas rounded-[14px] w-full max-w-[400px] p-6 shadow-airbnb animate-fade-up outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="edit-profile-title" className="text-base font-semibold text-ink mb-4">
          Edit profile
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="text-xs text-muted block mb-1">
              Name
            </label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className="w-full border border-hairline rounded-[8px] px-3 py-2 text-sm text-ink outline-none focus:border-ink focus:border-2 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="edit-city" className="text-xs text-muted block mb-1">
              City
            </label>
            <input
              id="edit-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Bengaluru"
              className="w-full border border-hairline rounded-[8px] px-3 py-2 text-sm text-ink placeholder-muted outline-none focus:border-ink focus:border-2 transition-colors"
            />
          </div>
        </div>

        {error && <p className="text-[13px] text-error mt-3">{error}</p>}

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="text-sm text-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm px-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm font-medium text-white bg-rausch rounded-[8px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
