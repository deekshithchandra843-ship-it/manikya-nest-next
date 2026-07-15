// Session layer for FindWay — "one shop, one door".
// Authentication is handled by Supabase Auth; this module keeps a lightweight
// mirror of the signed-in user in localStorage so the UI (navbar, profile) can
// react across navigations without waiting on the network. The Express backend
// (PostgreSQL via Prisma) is the source of truth for the profile record and is
// kept in sync through the /auth/session endpoints.
import type { User } from "@supabase/supabase-js";
import { apiClient } from "./apiClient";
import { supabase } from "./supabase";

export type Role = "tenant" | "owner" | "agent" | "builder" | "admin";

const SESSION_KEY = "findway.session";

export interface Session {
  /** Supabase user id (UUID) — the primary key everywhere in the app. */
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  avatarUrl?: string;
  /** Accent hex for the avatar chip; follows the first enabled capability. */
  avatarColor?: string;
  /** Enabled capabilities. New members start with none and pick from the
   *  profile's capability hub. */
  roles: Role[];
  /** Active view mode. Users can switch between their Personal Profile and
   *  Business Profile, just like Instagram. */
  activeView?: "personal" | "business";
}

/** Fired on window whenever the session changes, so UI (navbar, profile)
 *  can subscribe via useSession() and update without a reload. */
export const SESSION_EVENT = "findway:session";

function notify(): void {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

function persist(session: Session): void {
  if (typeof window === "undefined") return;
  cachedSession = session;

  // Strip sensitive PII fields before writing to localStorage
  const metadataOnly = {
    id: session.id,
    roles: session.roles,
    activeView: session.activeView,
  };

  const rawMetadata = JSON.stringify(metadataOnly);
  cachedRaw = rawMetadata;
  window.localStorage.setItem(SESSION_KEY, rawMetadata);
  notify();
}

const normalizePhone = (raw: string) => raw.replace(/\D/g, "").slice(-10);

/**
 * Build a Session from a Supabase user (plus any extras collected at sign-up
 * that may not have propagated into user_metadata yet). Used by both the
 * sign-up and log-in flows so they produce an identical shape.
 */
export function sessionFromSupabaseUser(
  user: User,
  extra?: { name?: string; phone?: string; city?: string }
): Session {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    name: extra?.name?.trim() || meta.full_name || user.email?.split("@")[0] || "Member",
    email: (user.email ?? "").toLowerCase(),
    phone: normalizePhone(extra?.phone || meta.phone || user.phone || ""),
    city: extra?.city?.trim() || meta.city || "Bengaluru",
    avatarUrl: meta.avatar_url || meta.avatarUrl || undefined,
    roles: (Array.isArray(meta.roles) ? meta.roles : []) as Role[],
    activeView: "personal",
  };
}

/** Persist a session locally and notify subscribers. */
export function setSession(session: Session): void {
  persist(session);
}

/** Enable a capability on the current session (idempotent). */
export function enableRole(role: Role): Session | null {
  const current = getSession();
  if (!current) return null;
  if (current.roles.includes(role)) return current;
  const next = { ...current, roles: [...current.roles, role] };
  persist(next);

  apiClient.patch("/auth/session", { roles: next.roles }).catch((e: unknown) => {
    console.error("Error updating enabled role on backend:", e);
  });

  return next;
}

/** Disable a capability on the current session. */
export function disableRole(role: Role): Session | null {
  const current = getSession();
  if (!current) return null;
  if (!current.roles.includes(role)) return current;
  const next = { ...current, roles: current.roles.filter((r) => r !== role) };
  persist(next);

  apiClient.patch("/auth/session", { roles: next.roles }).catch((e: unknown) => {
    console.error("Error updating disabled role on backend:", e);
  });

  return next;
}

// Parsed-session cache keyed by the raw string, so getSession returns a
// stable reference while the stored value is unchanged.
let cachedRaw: string | null = null;
let cachedSession: Session | null = null;

/** Read the current session, or null if signed out. */
export function getSession(): Session | null {
  if (typeof window === "undefined") return null;

  // If we already have the full session populated in-memory, return it.
  if (cachedSession && cachedSession.name) {
    return cachedSession;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const parsed = raw ? (JSON.parse(raw) as Partial<Session>) : null;
      if (parsed) {
        if (!Array.isArray(parsed.roles)) parsed.roles = [];
        if (!parsed.activeView) parsed.activeView = "personal";
        cachedSession = {
          id: parsed.id || "",
          name: "",
          email: "",
          phone: "",
          roles: parsed.roles || [],
          activeView: parsed.activeView || "personal",
          city: "",
          avatarUrl: "",
        };
      } else {
        cachedSession = null;
      }
    } catch {
      cachedSession = null;
    }
  }
  return cachedSession;
}

/** Patch the current session (e.g. edits from the profile modal). */
export function updateSession(patch: Partial<Pick<Session, "name" | "city" | "avatarUrl">>): Session | null {
  const current = getSession();
  if (!current) return null;
  const next = { ...current, ...patch };
  persist(next);

  apiClient.patch("/auth/session", patch).catch((e: unknown) => {
    console.error("Error saving updated session to backend:", e);
  });

  return next;
}

/** Clear the current session (local mirror + Supabase Auth). */
export function signOut(): void {
  if (typeof window === "undefined") return;
  cachedSession = null;
  cachedRaw = null;
  supabase.auth.signOut().finally(() => {
    window.localStorage.removeItem(SESSION_KEY);
    notify();
  });
}

/** Switch the active profile mode between personal and business. */
export function switchProfileMode(mode: "personal" | "business"): Session | null {
  const current = getSession();
  if (!current) return null;
  const next = { ...current, activeView: mode };
  persist(next);

  apiClient.post("/auth/session/switch", { mode }).catch((e: unknown) => {
    console.error("Error saving profile mode switch to backend:", e);
  });

  return next;
}

/**
 * Reconcile the local session with Supabase + the backend on load. If Supabase
 * has no session, clear the local mirror; otherwise pull the authoritative
 * profile record from the backend.
 */
export async function syncSession(): Promise<Session | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      if (typeof window !== "undefined") {
        cachedSession = null;
        cachedRaw = null;
        if (window.localStorage.getItem(SESSION_KEY)) {
          window.localStorage.removeItem(SESSION_KEY);
          notify();
        }
      }
      return null;
    }

    const res = await apiClient.get<{ success: boolean; data: Session }>("/auth/session");
    if (res.data.success && res.data.data) {
      persist(res.data.data);
      return res.data.data;
    }
  } catch (e) {
    console.error("Error syncing session with backend:", e);
  }
  return getSession();
}

if (typeof window !== "undefined") {
  // Reconcile the local session with the backend on script mount.
  syncSession().catch(console.error);
}
