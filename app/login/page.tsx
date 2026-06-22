"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "../components/Logo";
import {
  demoAccounts,
  findAccountByPhone,
  verifyEmailLogin,
  signIn,
  type DemoAccount,
} from "../lib/demoAuth";

type Mode = "phone" | "email";
type Step = "phone" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("phone");
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const enter = (account: DemoAccount) => {
    signIn(account);
    router.push(account.dashboard);
  };

  // One-tap demo login from the credentials card.
  const quickLogin = (account: DemoAccount) => {
    setError("");
    enter(account);
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
    enter(account);
  };

  const loginWithEmail = () => {
    setError("");
    const account = verifyEmailLogin(email, password);
    if (!account) {
      setError("Invalid email or password. Use a demo account below.");
      return;
    }
    enter(account);
  };

  return (
    <main className="max-w-[420px] mx-auto px-4 pt-12 pb-24 md:pb-12">
      <div className="flex flex-col items-center mb-8">
        <Logo size={40} />
        <p className="text-sm text-muted mt-3">Find Your Home. Find Your Opportunity.</p>
      </div>

      <div className="bg-canvas border border-hairline rounded-[14px] p-6 shadow-airbnb">
        <h1 className="text-[21px] font-bold text-ink mb-1">Log in or sign up</h1>

        {/* Phone / Email toggle */}
        <div className="flex gap-1 p-1 bg-surface-soft rounded-[10px] my-4">
          {(["phone", "email"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setStep("phone");
                setError("");
              }}
              className={`flex-1 h-9 text-sm font-medium rounded-[8px] capitalize transition-colors ${
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
              className="w-full h-12 mt-5 bg-rausch text-white text-base font-medium rounded-[8px] hover:bg-rausch-active transition-colors"
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
              className="w-full h-12 bg-rausch text-white text-base font-medium rounded-[8px] hover:bg-rausch-active transition-colors"
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
              placeholder="owner@nestnext.demo"
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
              className="w-full h-12 mt-5 bg-rausch text-white text-base font-medium rounded-[8px] hover:bg-rausch-active transition-colors"
            >
              Log in
            </button>
          </>
        )}

        {error && <p className="text-[13px] text-rausch mt-4 text-center">{error}</p>}
      </div>

      {/* Demo credentials card */}
      <div className="bg-surface-soft border border-hairline rounded-[14px] p-5 mt-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide bg-ink text-white rounded-full px-2 py-0.5">
            Demo
          </span>
          <p className="text-sm font-semibold text-ink">Quick login</p>
        </div>
        <p className="text-[13px] text-muted mb-4">
          One tap to explore a role, or sign in manually with the credentials below.
        </p>
        <div className="space-y-2">
          {demoAccounts.map((a) => (
            <button
              key={a.role}
              onClick={() => quickLogin(a)}
              className="w-full flex items-center justify-between text-left bg-canvas border border-hairline rounded-[10px] px-4 py-3 hover:border-ink transition-colors group"
            >
              <span>
                <span className="block text-sm font-semibold text-ink capitalize">{a.role}</span>
                <span className="block text-[12px] text-muted">{a.blurb}</span>
                <span className="block text-[11px] text-muted mt-1">
                  +91 {a.phone} · {a.email} · pwd/OTP {a.password} / {a.otp}
                </span>
              </span>
              <span className="text-sm text-rausch font-medium shrink-0 ml-3 group-hover:underline">
                Enter →
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-[12px] text-muted text-center mt-6 leading-relaxed">
        By continuing you agree to NestNext&apos;s{" "}
        <Link href="#" className="text-legal-link">Terms</Link> and{" "}
        <Link href="#" className="text-legal-link">Privacy Policy</Link>.
      </p>
    </main>
  );
}
