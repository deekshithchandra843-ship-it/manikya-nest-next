"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { updateSession, type Session } from "@/lib/auth";

const compressImage = (base64Str: string, maxWidth = 200, maxHeight = 200): Promise<string> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

/**
 * Edit-profile modal — same chrome as the original, but writes through
 * updateSession, which notifies the session store; every subscriber
 * (profile page, navbar chip) re-renders with the new name/city.
 */
export default function EditProfileModal({
  session,
  onClose,
}: {
  session: Session;
  onClose: () => void;
}) {
  const [name, setName] = useState(session.name);
  const [city, setCity] = useState(session.city ?? "");
  const [avatarUrl, setAvatarUrl] = useState(session.avatarUrl ?? "");
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
    updateSession({
      name: name.trim(),
      city: city.trim() || undefined,
      avatarUrl: avatarUrl || undefined,
    });
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

        {/* Profile Photo Upload */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile Preview"
                width={80}
                height={80}
                className="rounded-full object-cover border border-hairline shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-rausch/10 text-rausch flex items-center justify-center font-bold text-xl uppercase border border-hairline shadow-sm">
                {name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "B"}
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-2">
            <label className="cursor-pointer text-xs font-semibold text-rausch hover:text-rausch-active transition-colors">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const rawBase64 = reader.result as string;
                      compressImage(rawBase64).then((compressed) => {
                        setAvatarUrl(compressed);
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
            </label>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl("")}
                className="text-xs font-semibold text-error hover:text-error-hover transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>

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
