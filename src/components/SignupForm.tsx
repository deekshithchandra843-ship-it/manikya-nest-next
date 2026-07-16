"use client";
import { useState } from "react";
import { sessionFromSupabaseUser, setSession, syncSession, type Session } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/apiClient";

type Banner = { type: "error" | "info"; text: string };

export default function SignupForm({ onSuccess }: { onSuccess: (session: Session) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; password?: string }>({});
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(false);

  const clearError = (key: string) =>
    setErrors((prev) => ({ ...prev, [key]: undefined }));

  const handleSignup = async () => {
    setBanner(null);
    const next: { name?: string; phone?: string; password?: string } = {};
    if (!name.trim()) next.name = "Enter your full name.";
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) next.phone = "Enter a valid 10-digit mobile number.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const virtualEmail = `phone-${cleanPhone}@findway.temp`;

      const { data, error: supabaseError } = await supabase.auth.signUp({
        email: virtualEmail,
        password,
        options: {
          data: {
            full_name: name.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (supabaseError) {
        const msg = supabaseError.message.toLowerCase();
        if (msg.includes("already registered") || msg.includes("user already exists")) {
          setErrors({ phone: "An account with this number already exists. Try logging in." });
        } else if (msg.includes("password")) {
          setErrors({ password: supabaseError.message });
        } else {
          setBanner({ type: "error", text: supabaseError.message });
        }
        return;
      }

      if (!data.user) {
        setBanner({ type: "error", text: "We couldn't create your account. Please try again." });
        return;
      }

      // Persist the profile record in PostgreSQL via Express
      try {
        await apiClient.post("/auth/signup", {
          id: data.user.id,
          email: virtualEmail,
          name: name.trim(),
          phone: phone.trim(),
        });
      } catch (dbErr) {
        console.error("Failed to persist profile to backend:", dbErr);
      }

      if (data.session) {
        const session = sessionFromSupabaseUser(data.user, { name: name.trim(), phone: phone.trim() });
        setSession(session);
        // Sync with backend immediately to get the latest database fields (avatarUrl, city, roles)
        try {
          const synced = await syncSession();
          if (synced) {
            onSuccess(synced);
            return;
          }
        } catch (syncErr) {
          console.error("Error syncing session on signup:", syncErr);
        }
        onSuccess(session);
      } else {
        setBanner({
          type: "info",
          text: "Account created! You can now log in with your mobile number and password.",
        });
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setBanner({ type: "error", text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (invalid?: string) =>
    `flex items-center gap-2 border rounded-[10px] h-11 px-3 transition-all duration-200 bg-canvas ${
      invalid
        ? "border-error focus-within:ring-4 focus-within:ring-error/10"
        : "border-hairline focus-within:border-rausch focus-within:ring-4 focus-within:ring-rausch/10"
    }`;

  return (
    <div className="space-y-3">
      {banner && (
        <div
          role={banner.type === "error" ? "alert" : "status"}
          className={`flex items-start gap-2 rounded-[10px] border px-3 py-2 text-[12px] animate-fade-up ${
            banner.type === "error"
              ? "border-error/30 bg-error/5 text-error"
              : "border-green-600/30 bg-green-50 text-green-800"
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5" aria-hidden="true">
            {banner.type === "error" ? (
              <>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4m0 4h.01" />
              </>
            ) : (
              <>
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </>
            )}
          </svg>
          <p className="leading-snug">{banner.text}</p>
        </div>
      )}

      <div>
        <label htmlFor="signup-name" className="text-[11px] text-muted block mb-1 font-semibold uppercase tracking-wider">
          Full name
        </label>
        <div className={fieldClass(errors.name)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted shrink-0" aria-hidden="true">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="Aditya Sharma"
            value={name}
            onChange={(e) => { setName(e.target.value); clearError("name"); }}
            aria-invalid={!!errors.name}
            className="flex-1 min-w-0 text-sm text-ink placeholder-muted/60 outline-none bg-transparent"
          />
        </div>
        {errors.name && <p className="text-[11px] text-error mt-0.5">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="signup-phone" className="text-[11px] text-muted block mb-1 font-semibold uppercase tracking-wider">
          Mobile number
        </label>
        <div className={fieldClass(errors.phone)}>
          <span className="flex items-center gap-1 text-[14px] font-semibold text-muted pr-2 border-r border-hairline shrink-0 select-none">
            +91
          </span>
          <input
            id="signup-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); clearError("phone"); }}
            aria-invalid={!!errors.phone}
            className="flex-1 min-w-0 text-sm text-ink placeholder-muted/60 outline-none bg-transparent pl-2"
          />
        </div>
        {errors.phone && <p className="text-[11px] text-error mt-0.5">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="signup-password" className="text-[11px] text-muted block mb-1 font-semibold uppercase tracking-wider">
          Password
        </label>
        <div className={fieldClass(errors.password)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted shrink-0" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 118 0v4" />
          </svg>
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
            onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            aria-invalid={!!errors.password}
            className="flex-1 min-w-0 text-sm text-ink placeholder-muted/60 outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="text-muted hover:text-ink transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm"
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            )}
          </button>
        </div>
        {errors.password && <p className="text-[11px] text-error mt-0.5">{errors.password}</p>}
      </div>

      <button
        onClick={handleSignup}
        disabled={loading}
        className="w-full h-11 mt-1 bg-rausch hover:bg-rausch-active text-white text-sm font-semibold rounded-[10px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Creating account...</span>
          </>
        ) : (
          <span>Create account</span>
        )}
      </button>
    </div>
  );
}
