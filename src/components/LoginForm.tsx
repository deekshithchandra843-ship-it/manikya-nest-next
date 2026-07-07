"use client";
import { useState } from "react";
import { sessionFromSupabaseUser, setSession, type Session } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function LoginForm({ onSuccess }: { onSuccess: (session: Session) => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginWithEmailOrPhone = async () => {
    setError("");
    const inputVal = identifier.trim();

    if (!inputVal || !password) {
      setError("Please enter both email/phone and password.");
      return;
    }

    setLoading(true);
    try {
      const isEmail = inputVal.includes("@");
      const res = isEmail
        ? await supabase.auth.signInWithPassword({ email: inputVal.toLowerCase(), password })
        : await (async () => {
            const cleanPhone = inputVal.replace(/\D/g, "");
            const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;
            return supabase.auth.signInWithPassword({ phone: formattedPhone, password });
          })();

      if (res.error) {
        setError(
          /email not confirmed/i.test(res.error.message)
            ? "Please verify your email address before logging in. Check your inbox for the confirmation link."
            : res.error.message
        );
        return;
      }

      if (res.data.user) {
        const session = sessionFromSupabaseUser(res.data.user);
        setSession(session);
        onSuccess(session);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[13px] text-muted block mb-1.5 font-medium">
          Email or Mobile number
        </label>
        <input
          type="text"
          placeholder="you@example.com or 90000 00001"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loginWithEmailOrPhone()}
          className="w-full border border-hairline rounded-[10px] h-14 px-3.5 text-base text-ink placeholder-muted outline-none focus:border-ink focus:border-2 transition-colors"
        />
      </div>

      <div>
        <label className="text-[13px] text-muted block mb-1.5 font-medium">
          Password
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loginWithEmailOrPhone()}
          className="w-full border border-hairline rounded-[10px] h-14 px-3.5 text-base text-ink placeholder-muted outline-none focus:border-ink focus:border-2 transition-colors"
        />
      </div>

      <button
        onClick={loginWithEmailOrPhone}
        disabled={loading}
        className="w-full h-12 mt-2 bg-rausch text-white text-base font-medium rounded-[10px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2 disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Log in"}
      </button>

      {error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-[10px] border border-error/30 bg-error/5 px-3.5 py-3 text-[13px] text-error">
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
