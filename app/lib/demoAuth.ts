// Demo authentication for the NestNext prototype.
// No backend — these are fixed demo accounts that map to roles + dashboards.
// A lightweight "session" is persisted in localStorage so the UI can reflect
// who is logged in across page navigations.

export type Role = "owner" | "employer" | "admin";

export interface DemoAccount {
  role: Role;
  name: string;
  /** 10-digit mobile number (no country code) used in the OTP flow. */
  phone: string;
  /** Email for the "Continue with Email" flow. */
  email: string;
  /** Fixed password / OTP that unlocks this account. */
  password: string;
  /** Fixed 4-digit OTP for the phone flow. */
  otp: string;
  /** Where this account lands after login. */
  dashboard: string;
  /** Short label shown on the demo-credentials card. */
  blurb: string;
}

// Shared OTP/password keeps the demo easy to remember.
const OTP = "1234";
const PASSWORD = "demo1234";

export const demoAccounts: DemoAccount[] = [
  {
    role: "owner",
    name: "Ravi Owner",
    phone: "9000000001",
    email: "owner@nestnext.demo",
    password: PASSWORD,
    otp: OTP,
    dashboard: "/dashboard/owner",
    blurb: "Property owner — manage listings & leads",
  },
  {
    role: "employer",
    name: "Asha Employer",
    phone: "9000000002",
    email: "employer@nestnext.demo",
    password: PASSWORD,
    otp: OTP,
    dashboard: "/dashboard/employer",
    blurb: "Employer — post jobs & view applicants",
  },
  {
    role: "admin",
    name: "Dev Admin",
    phone: "9000000003",
    email: "admin@nestnext.demo",
    password: PASSWORD,
    otp: OTP,
    dashboard: "/dashboard/admin",
    blurb: "Admin — moderate listings & users",
  },
];

const SESSION_KEY = "nestnext.demoSession";

export interface DemoSession {
  role: Role;
  name: string;
  email: string;
  phone: string;
}

const normalizePhone = (raw: string) => raw.replace(/\D/g, "").slice(-10);

/** Find a demo account by phone number (any formatting allowed). */
export function findAccountByPhone(phone: string): DemoAccount | undefined {
  const p = normalizePhone(phone);
  return demoAccounts.find((a) => a.phone === p);
}

/** Find a demo account by email (case-insensitive). */
export function findAccountByEmail(email: string): DemoAccount | undefined {
  const e = email.trim().toLowerCase();
  return demoAccounts.find((a) => a.email === e);
}

/** Validate an email + password pair. Returns the account on success. */
export function verifyEmailLogin(email: string, password: string): DemoAccount | undefined {
  const account = findAccountByEmail(email);
  if (account && account.password === password) return account;
  return undefined;
}

/** Persist a session for the given account. */
export function signIn(account: DemoAccount): void {
  if (typeof window === "undefined") return;
  const session: DemoSession = {
    role: account.role,
    name: account.name,
    email: account.email,
    phone: account.phone,
  };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** Read the current demo session, or null if signed out. */
export function getSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as DemoSession) : null;
  } catch {
    return null;
  }
}

/** Clear the current demo session. */
export function signOut(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}
