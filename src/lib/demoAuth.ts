// Demo authentication for the FindWay prototype — "one shop, one door".
// No backend: everyone signs up through the same door as a generic member
// (roles: []), then enables capabilities (tenant/owner/agent/builder) from
// the profile. A lightweight session is persisted in localStorage so the UI
// reflects who is logged in across navigations. Swapping in MongoDB later
// only means replacing the bodies of signUp / signIn / enableRole /
// disableRole / getSession / signOut.

export type Role = "tenant" | "owner" | "agent" | "builder";

export interface DemoAccount {
  /** Capabilities this demo account has already enabled. */
  roles: Role[];
  name: string;
  /** 10-digit mobile number (no country code) used in the OTP flow. */
  phone: string;
  /** Email for the "Continue with Email" flow. */
  email: string;
  /** Fixed password / OTP that unlocks this account. */
  password: string;
  /** Fixed 4-digit OTP for the phone flow. */
  otp: string;
  /** Short label shown on the demo-credentials card. */
  blurb: string;
  /** Home city shown on the profile hero. */
  city: string;
}

// Shared OTP/password keeps the demo easy to remember.
const OTP = "1234";
const PASSWORD = "demo1234";

export const demoAccounts: DemoAccount[] = [
  {
    roles: ["owner", "tenant"],
    name: "Ravi Sharma",
    phone: "9000000001",
    email: "ravi@findway.demo",
    password: PASSWORD,
    otp: OTP,
    blurb: "Demo account with sample activity",
    city: "Bengaluru",
  },
  {
    roles: ["agent", "builder"],
    name: "Meera Kapoor",
    phone: "9000000002",
    email: "meera@findway.demo",
    password: PASSWORD,
    otp: OTP,
    blurb: "Second demo account with sample activity",
    city: "Mumbai",
  },
];

const SESSION_KEY = "findway.demoSession";

export interface DemoSession {
  /** Placeholder id — a real backend will return its own. Demo accounts use
   *  a stable "demo-…" id so the UI can tell them apart from sign-ups. */
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  /** Accent hex for the avatar chip; follows the first enabled capability. */
  avatarColor?: string;
  /** Enabled capabilities. New members start with none and pick from the
   *  profile's capability hub. */
  roles: Role[];
  /** Active view mode. Just like Instagram, users can switch between their
   *  Personal Profile and Business Profile. */
  activeView?: "personal" | "business";
}

/** Input collected by the sign-up form. Mirrors a future backend payload. */
export interface SignUpInput {
  name: string;
  email: string;
  phone: string;
  /** Ignored in the demo (no backend) but kept so the contract is stable. */
  password: string;
  city?: string;
}

/** Fired on window whenever the session changes, so UI (navbar, profile)
 *  can subscribe via useSession() and update without a reload. */
export const SESSION_EVENT = "findway:session";

function notify(): void {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

function persist(session: DemoSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  notify();
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

/**
 * Create a member account client-side and persist its session. No role is
 * chosen here — that happens in the profile's capability hub ("one door").
 * A backend would hash the password, insert the user and return this shape.
 */
export function signUp(input: SignUpInput): DemoSession {
  const session: DemoSession = {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `user-${Date.now()}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: normalizePhone(input.phone),
    city: input.city?.trim() || undefined,
    roles: [],
    activeView: "personal",
  };
  persist(session);
  return session;
}

/** Persist a session for the given demo account. */
export function signIn(account: DemoAccount): void {
  persist({
    id: `demo-${account.phone}`,
    name: account.name,
    email: account.email,
    phone: account.phone,
    city: account.city,
    roles: [...account.roles],
    activeView: "personal",
  });
}

/** Enable a capability on the current session (idempotent). */
export function enableRole(role: Role): DemoSession | null {
  const current = getSession();
  if (!current) return null;
  if (current.roles.includes(role)) return current;
  const next = { ...current, roles: [...current.roles, role] };
  persist(next);
  return next;
}

/** Disable a capability on the current session. */
export function disableRole(role: Role): DemoSession | null {
  const current = getSession();
  if (!current) return null;
  if (!current.roles.includes(role)) return current;
  const next = { ...current, roles: current.roles.filter((r) => r !== role) };
  persist(next);
  return next;
}

// Parsed-session cache keyed by the raw string, so getSession returns a
// stable reference while the stored value is unchanged (required by
// useSyncExternalStore, and cheaper for everyone else).
let cachedRaw: string | null = null;
let cachedSession: DemoSession | null = null;

/** Read the current demo session, or null if signed out. */
export function getSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const parsed = raw ? (JSON.parse(raw) as DemoSession) : null;
      // Sessions written before the capability model lack `roles`.
      if (parsed && !Array.isArray(parsed.roles)) parsed.roles = [];
      // Set default active view if not defined.
      if (parsed && !parsed.activeView) parsed.activeView = "personal";
      cachedSession = parsed;
    } catch {
      cachedSession = null;
    }
  }
  return cachedSession;
}

/** Patch the current session (e.g. edits from the profile modal). */
export function updateSession(patch: Partial<Pick<DemoSession, "name" | "city">>): DemoSession | null {
  const current = getSession();
  if (!current) return null;
  const next = { ...current, ...patch };
  persist(next);
  return next;
}

/** Clear the current demo session. */
export function signOut(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  notify();
}

/** Switch the active profile mode between personal and business. */
export function switchProfileMode(mode: "personal" | "business"): DemoSession | null {
  const current = getSession();
  if (!current) return null;
  const next = { ...current, activeView: mode };
  persist(next);
  return next;
}
