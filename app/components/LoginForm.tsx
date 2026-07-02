"use client";
import { useState } from "react";
import {
  demoAccounts,
  findAccountByPhone,
  verifyEmailLogin,
  signIn,
  type DemoAccount,
} from "../lib/demoAuth";

type Mode = "phone" | "email";
type Step = "phone" | "otp";

/**
 * Shared log in / sign up form (phone+OTP and email tabs).
 *
 * Owns all auth state + validation and reuses the demoAuth helpers so the rules
 * live in exactly one place. On success it persists the session via `signIn`
 * and hands the account back through `onSuccess` — callers decide what happens
 * next (the login page routes home; the publish modal closes + marks published).
 */
export default function LoginForm({ onSuccess }: { onSuccess: (account: DemoAccount) => void }) {
  const [mode, setMode] = useState<Mode>("phone");
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Single entry point for a successful login — the later swap to a server
  // action / MongoDB happens here and nowhere else.
  const handleLogin = (account: DemoAccount) => {
    signIn(account);
    onSuccess(account);
  };

  const sendOtp = () => {
    setError("");
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    const account = findAccountByPhone(phone);
    if (!account) {
      setError("No demo account for this number. Try a demo number below.");
      return;
    }
    setStep("otp");
  };

  const verifyOtp = () => {
    setError("");
    const account = findAccountByPhone(phone);
    if (!account) {
      setError("No demo account for this number.");
      return;
    }
    if (otp.join("") !== account.otp) {
      setError(`Incorrect OTP. The demo OTP is ${account.otp}.`);
      return;
    }
    handleLogin(account);
  };

  const loginWithEmail = () => {
    setError("");
    const account = verifyEmailLogin(email, password);
    if (!account) {
      setError("Invalid email or password. Use a demo account below.");
      return;
    }
    handleLogin(account);
  };

  return (
    <>
      {/* Phone / Email toggle */}
      <div className="flex gap-1 p-1 bg-surface-soft rounded-[10px] mb-4">
        {(["phone", "email"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setStep("phone");
              setError("");
            }}
            className={`flex-1 h-9 text-sm font-medium rounded-[8px] capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
              mode === m ? "bg-canvas text-ink shadow-airbnb" : "text-muted hover:text-ink"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === "phone" && step === "phone" && (
        <>
          <label className="text-[13px] text-muted block mb-1.5">Mobile number</label>
          <div className="flex items-center border border-hairline rounded-[8px] h-14 px-3 focus-within:border-ink focus-within:border-2 transition-colors">
            <span className="text-ink text-base pr-2 border-r border-hairline mr-2">+91</span>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="90000 00001"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendOtp()}
              className="flex-1 text-base text-ink placeholder-muted outline-none bg-transparent"
            />
          </div>
          <button
            onClick={sendOtp}
            className="w-full h-12 mt-5 bg-rausch text-white text-base font-medium rounded-[8px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2"
          >
            Send OTP
          </button>
        </>
      )}

      {mode === "phone" && step === "otp" && (
        <>
          <p className="text-sm text-muted mb-5">
            Sent to +91 {phone}.{" "}
            <button
              onClick={() => {
                setStep("phone");
                setError("");
              }}
              className="text-rausch font-medium hover:underline"
            >
              Change
            </button>
          </p>
          <div className="flex justify-between gap-3 mb-5">
            {otp.map((d, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  const next = [...otp];
                  next[i] = v;
                  setOtp(next);
                  if (v && i < 3) document.getElementById(`otp-${i + 1}`)?.focus();
                }}
                className="w-14 h-14 text-center text-2xl font-semibold text-ink border border-hairline rounded-[8px] outline-none focus:border-ink focus:border-2"
              />
            ))}
          </div>
          <button
            onClick={verifyOtp}
            className="w-full h-12 bg-rausch text-white text-base font-medium rounded-[8px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2"
          >
            Verify &amp; continue
          </button>
          <p className="text-[13px] text-muted text-center mt-4">
            Demo OTP is <span className="font-semibold text-ink">1234</span>.
          </p>
        </>
      )}

      {mode === "email" && (
        <>
          <label className="text-[13px] text-muted block mb-1.5">Email</label>
          <input
            type="email"
            placeholder="ravi@findway.demo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-hairline rounded-[8px] h-14 px-3 text-base text-ink placeholder-muted outline-none focus:border-ink focus:border-2 transition-colors mb-4"
          />
          <label className="text-[13px] text-muted block mb-1.5">Password</label>
          <input
            type="password"
            placeholder="demo1234"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loginWithEmail()}
            className="w-full border border-hairline rounded-[8px] h-14 px-3 text-base text-ink placeholder-muted outline-none focus:border-ink focus:border-2 transition-colors"
          />
          <button
            onClick={loginWithEmail}
            className="w-full h-12 mt-5 bg-rausch text-white text-base font-medium rounded-[8px] hover:bg-rausch-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch focus-visible:ring-offset-2"
          >
            Log in
          </button>
        </>
      )}

      {error && <p className="text-[13px] text-rausch mt-4 text-center">{error}</p>}

      {/* Demo credentials — one fixed account per role */}
      <div className="mt-5 pt-4 border-t border-hairline-soft">
        <p className="text-[11px] uppercase text-muted-soft tracking-wider font-medium mb-2">Demo accounts</p>
        <ul className="space-y-1.5">
          {demoAccounts.map((a) => (
            <li key={a.phone} className="text-[12px] text-muted">
              <span className="font-semibold text-body">{a.name}</span> · {a.phone} · {a.email}
              <span className="block text-[11px] text-muted-soft">{a.blurb}</span>
            </li>
          ))}
        </ul>
        <p className="text-[12px] text-muted mt-1.5">
          OTP <span className="font-semibold text-ink">1234</span> · password{" "}
          <span className="font-semibold text-ink">demo1234</span>
        </p>
      </div>
    </>
  );
}
