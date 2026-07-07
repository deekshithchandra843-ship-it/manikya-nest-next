"use client";
import { useState } from "react";
import { sessionFromSupabaseUser, setSession, type Session } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/apiClient";

interface Errors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

type Banner = { type: "error" | "info"; text: string };

/**
 * Translate a raw Supabase Auth error into a clear, actionable message and
 * decide whether it belongs to a specific field or the top-level banner.
 */
function mapSignupError(message: string): { banner?: Banner; field?: Partial<Errors> } {
  const msg = (message || "").toLowerCase();

  if (msg.includes("rate limit") || msg.includes("over_email_send")) {
    return {
      banner: {
        type: "error",
        text: "Too many sign-up attempts right now. Please wait a few minutes and try again — email verification is temporarily rate-limited.",
      },
    };
  }
  if (msg.includes("already registered") || msg.includes("already been registered") || msg.includes("user already exists")) {
    return { field: { email: "An account with this email already exists. Try logging in instead." } };
  }
  if (msg.includes("password")) {
    return { field: { password: message } };
  }
  if (msg.includes("email")) {
    return { field: { email: message } };
  }
  return { banner: { type: "error", text: message || "We couldn't create your account. Please try again." } };
}

export default function SignupForm({ onSuccess }: { onSuccess: (session: Session) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(false);

  const clearError = (key: keyof Errors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const handleSignup = async () => {
    setBanner(null);
    const next: Errors = {};
    if (!name.trim()) next.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email address.";
    if (phone.replace(/\D/g, "").length !== 10) next.phone = "Enter a valid 10-digit mobile number.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const { data, error: supabaseError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (supabaseError) {
        const { banner: b, field } = mapSignupError(supabaseError.message);
        if (field) setErrors(field);
        if (b) setBanner(b);
        return;
      }

      if (!data.user) {
        setBanner({ type: "error", text: "We couldn't create your account. Please try again." });
        return;
      }

      // Persist the profile record in PostgreSQL via Express immediately.
      try {
        await apiClient.post("/auth/signup", {
          id: data.user.id,
          email: email.trim().toLowerCase(),
          name: name.trim(),
          phone: phone.trim(),
        });
      } catch (dbErr) {
        // Auth succeeded but the profile write failed — don't hard-block the
        // user; the backend re-provisions on first authenticated request.
        console.error("Failed to persist profile to backend:", dbErr);
      }

      if (data.session) {
        // Immediate session (email confirmation disabled) → log the user in.
        const session = sessionFromSupabaseUser(data.user, { name: name.trim(), phone: phone.trim() });
        setSession(session);
        onSuccess(session);
      } else {
        // Email confirmation required → account exists but isn't active yet.
        setBanner({
          type: "info",
          text: "Account created! We've sent a verification link to your email. Please confirm it, then log in.",
        });
      }
    } catch (err: any) {
      setBanner({ type: "error", text: err?.message || "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (invalid?: string) =>
    `flex items-center gap-2.5 border rounded-[10px] h-12 px-3.5 transition-colors ${
      invalid ? "border-error" : "border-hairline focus-within:border-ink focus-within:border-2"
    }`;

  return (
    <div className="space-y-3.5">
      <h2 className="text-[19px] font-bold text-ink">Create your account</h2>

      {banner && (
        <div
          role={banner.type === "error" ? "alert" : "status"}
          className={`flex items-start gap-2.5 rounded-[10px] border px-3.5 py-3 text-[13px] ${
            banner.type === "error"
              ? "border-error/30 bg-error/5 text-error"
              : "border-green-600/30 bg-green-50 text-green-800"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5" aria-hidden="true">
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
        <label htmlFor="signup-name" className="text-[13px] text-muted block mb-1.5">
          Full name
        </label>
        <div className={fieldClass(errors.name)}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted shrink-0" aria-hidden="true">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="Aditya Sharma"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError("name");
            }}
            aria-invalid={!!errors.name}
            className="flex-1 min-w-0 text-[15px] text-ink placeholder-muted outline-none bg-transparent"
          />
        </div>
        {errors.name && <p className="text-[12px] text-error mt-1">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="signup-email" className="text-[13px] text-muted block mb-1.5">
          Email
        </label>
        <div className={fieldClass(errors.email)}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted shrink-0" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError("email");
            }}
            aria-invalid={!!errors.email}
            className="flex-1 min-w-0 text-[15px] text-ink placeholder-muted outline-none bg-transparent"
          />
        </div>
        {errors.email && <p className="text-[12px] text-error mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="signup-phone" className="text-[13px] text-muted block mb-1.5">
          Mobile number
        </label>
        <div className={fieldClass(errors.phone)}>
          <span className="flex items-center gap-1 text-[15px] text-ink pr-2.5 border-r border-hairline shrink-0">
            +91
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
          <input
            id="signup-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              clearError("phone");
            }}
            aria-invalid={!!errors.phone}
            className="flex-1 min-w-0 text-[15px] text-ink placeholder-muted outline-none bg-transparent"
          />
        </div>
        {errors.phone && <p className="text-[12px] text-error mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="signup-password" className="text-[13px] text-muted block mb-1.5">
          Password
        </label>
        <div className={fieldClass(errors.password)}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted shrink-0" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 118 0v4" />
          </svg>
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError("password");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            aria-invalid={!!errors.password}
            className="flex-1 min-w-0 text-[15px] text-ink placeholder-muted outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="text-muted hover:text-ink transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm"
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && <p className="text-[12px] text-error mt-1">{errors.password}</p>}
      </div>

      <button
        onClick={handleSignup}
        disabled={loading}
        className="w-full h-12 mt-1 bg-rausch text-white text-base font-medium rounded-[10px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2 disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
    </div>
  );
}
