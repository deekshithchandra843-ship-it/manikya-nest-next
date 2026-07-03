"use client";
import { useSyncExternalStore } from "react";
import { getSession, SESSION_EVENT, type DemoSession } from "./demoAuth";

function subscribe(onChange: () => void): () => void {
  // Same-tab changes fire SESSION_EVENT; "storage" covers other tabs.
  window.addEventListener(SESSION_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SESSION_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const getServerSnapshot = () => null;

/**
 * Subscribe to the localStorage demo session. Hydration-safe: the server (and
 * first client paint) sees null, then React syncs to the real value — so
 * always render the logged-out/skeleton state until useHydrated() is true.
 */
export function useSession(): DemoSession | null {
  return useSyncExternalStore(subscribe, getSession, getServerSnapshot);
}

const emptySubscribe = () => () => {};

/** False during SSR/hydration, true afterwards — without setState-in-effect. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
