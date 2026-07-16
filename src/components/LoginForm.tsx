"use client";
import { useState } from "react";
import { sessionFromSupabaseUser, setSession, syncSession, type Session } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function LoginForm({ onSuccess }: { onSuccess: (session: Session) => void }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    const cleanPhone = phone.trim().replace(/\D/g, "");

    if (!cleanPhone || cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const virtualEmail = `phone-${cleanPhone}@findway.temp`;
      const res = await supabase.auth.signInWithPassword({ email: virtualEmail, password });

      if (res.error) {
        setError(res.error.message);
        return;
      }

      if (res.data.user) {
        const session = sessionFromSupabaseUser(res.data.user, { phone: cleanPhone });
        setSession(session);
        // Sync with backend immediately to get the latest database fields (avatarUrl, city, roles)
        try {
          const synced = await syncSession();
          if (synced) {
            onSuccess(synced);
            return;
          }
        } catch (syncErr) {
          console.error("Error syncing session on login:", syncErr);
        }
        onSuccess(session);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[13px] text-muted block mb-1.5 font-semibold uppercase tracking-wider text-[10px]">
          Mobile number
        </label>
        <div className="flex items-center border border-hairline rounded-[12px] h-13 px-3.5 transition-all duration-200 bg-canvas focus-within:border-rausch focus-within:ring-4 focus-within:ring-rausch/10">
          <span className="flex items-center gap-1 text-[15px] font-semibold text-muted pr-2.5 border-r border-hairline shrink-0 select-none">
            +91
          </span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="flex-1 min-w-0 text-base text-ink placeholder-muted/60 outline-none bg-transparent pl-3"
          />
        </div>
      </div>

      <div>
        <label className="text-[13px] text-muted block mb-1.5 font-semibold uppercase tracking-wider text-[10px]">
          Password
        </label>
        <div className="relative flex items-center border border-hairline rounded-[12px] h-13 px-3.5 transition-all duration-200 bg-canvas focus-within:border-rausch focus-within:ring-4 focus-within:ring-rausch/10 gap-2.5">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted shrink-0" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 118 0v4" />
          </svg>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="flex-1 min-w-0 text-base text-ink placeholder-muted/60 outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="text-muted hover:text-ink focus-visible:outline-none shrink-0"
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            )}
          </button>
        </div>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full h-12 mt-2 bg-rausch hover:bg-rausch-active text-white text-base font-semibold rounded-[12px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Logging in...</span>
          </>
        ) : (
          <span>Log in</span>
        )}
      </button>

      {error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-[12px] border border-error/30 bg-error/5 px-3.5 py-3 text-[13px] text-error animate-fade-up">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4m0 4h.01" />
          </svg>
          <p className="leading-snug">{error}</p>
        </div>
      )}
    </div>
  );
}
