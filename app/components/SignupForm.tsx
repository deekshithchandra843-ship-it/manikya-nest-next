"use client";
import { useState } from "react";
import { signUp, type DemoSession } from "../lib/demoAuth";

interface Errors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

/**
 * Sign-up form — the single door. No role is chosen here: everyone joins as a
 * generic member and enables capabilities from the profile's hub afterwards.
 * All submit logic lives in handleSignup so a later swap to a server action
 * is a one-spot change.
 */
export default function SignupForm({ onSuccess }: { onSuccess: (session: DemoSession) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const clearError = (key: keyof Errors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const handleSignup = () => {
    const next: Errors = {};
    if (!name.trim()) next.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email address.";
    if (phone.replace(/\D/g, "").length !== 10) next.phone = "Enter a valid 10-digit mobile number.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const session = signUp({ name, email, phone, password });
    onSuccess(session);
  };

  const fieldClass = (invalid?: string) =>
    `flex items-center gap-2.5 border rounded-[10px] h-12 px-3.5 transition-colors ${
      invalid ? "border-error" : "border-hairline focus-within:border-ink focus-within:border-2"
    }`;

  return (
    <div className="space-y-3.5">
      <h2 className="text-[19px] font-bold text-ink">Create your account</h2>

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
        className="w-full h-12 mt-1 bg-rausch text-white text-base font-medium rounded-[10px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2"
      >
        Create account
      </button>

      {/* Social sign-up (demo only — visual parity with the design) */}
      <div className="flex items-center gap-3 pt-1" aria-hidden="true">
        <span className="flex-1 h-px bg-hairline-soft" />
        <span className="text-[12px] text-muted">or sign up with</span>
        <span className="flex-1 h-px bg-hairline-soft" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          aria-label="Sign up with Google (demo only)"
          title="Demo only"
          className="h-11 border border-hairline rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.05-3.71 1.05-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0012 23z" />
            <path fill="#FBBC05" d="M5.85 14.1a6.61 6.61 0 010-4.2V7.06H2.18a11 11 0 000 9.88l3.67-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.55 4.2 1.64l3.16-3.15A11 11 0 002.18 7.06L5.85 9.9c.86-2.6 3.29-4.52 6.15-4.52z" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Sign up with LinkedIn (demo only)"
          title="Demo only"
          className="h-11 border border-hairline rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#0A66C2"
              d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .77 0 1.72v20.55C0 23.23.8 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z"
            />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Sign up with Apple (demo only)"
          title="Demo only"
          className="h-11 border border-hairline rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#000000" aria-hidden="true">
            <path d="M16.37 1.43c0 1.14-.46 2.2-1.2 3.02-.8.87-2.11 1.54-3.17 1.46a3.4 3.4 0 01-.03-.42c0-1.09.48-2.25 1.19-3.03.8-.87 2.15-1.51 3.18-1.46.02.14.03.29.03.43zM19.9 8.4c-.1.06-2.36 1.4-2.36 4.19 0 3.23 2.87 4.37 2.96 4.4-.02.07-.46 1.55-1.51 3.05-.94 1.32-1.92 2.64-3.42 2.64s-1.88-.86-3.6-.86c-1.67 0-2.27.89-3.63.89-1.37 0-2.32-1.22-3.42-2.73C3.65 18.15 2.6 15.4 2.6 12.8c0-4.18 2.72-6.4 5.4-6.4 1.42 0 2.6.94 3.5.94.85 0 2.18-1 3.8-1 .62 0 2.84.06 4.6 2.06z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
