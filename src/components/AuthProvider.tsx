"use client";

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { DataScope } from "@/lib/storage";
import { resetGuestAccount as clearGuestAccount } from "@/lib/guestAccount";

const GUEST_SESSION_KEY = "guest-session-v1";
const guestListeners = new Set<() => void>();
const subscribeGuestSession = (listener: () => void) => { guestListeners.add(listener); return () => guestListeners.delete(listener); };
const getGuestSession = () => typeof window !== "undefined" && window.localStorage.getItem(GUEST_SESSION_KEY) === "active";
const getServerGuestSession = () => false;
function setGuestSession(active: boolean) {
  if (active) window.localStorage.setItem(GUEST_SESSION_KEY, "active");
  else window.localStorage.removeItem(GUEST_SESSION_KEY);
  guestListeners.forEach((listener) => listener());
}
type AuthState = { user: User | null; loading: boolean; configured: boolean; guestMode: boolean; dataScope: DataScope; continueAsGuest: () => void; resetGuestAccount: () => void; signOut: () => Promise<void> };
const AuthContext = createContext<AuthState>({ user: null, loading: true, configured: false, guestMode: false, dataScope: "guest", continueAsGuest: () => undefined, resetGuestAccount: () => undefined, signOut: async () => undefined });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const guestMode = useSyncExternalStore(subscribeGuestSession, getGuestSession, getServerGuestSession);
  const [loading, setLoading] = useState(isSupabaseConfigured());

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return;
    }
    client.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        setGuestSession(false);
      }
    }).catch(() => {
      setUser(null);
    }).finally(() => setLoading(false));
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        setGuestSession(false);
      }
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    configured: isSupabaseConfigured(),
    guestMode,
    dataScope: user ? `user:${user.id}` as const : "guest" as const,
    continueAsGuest: () => {
      setGuestSession(true);
    },
    resetGuestAccount: () => {
      clearGuestAccount();
      setGuestSession(false);
    },
    signOut: async () => {
      setGuestSession(false);
      await getSupabaseBrowserClient()?.auth.signOut();
    },
  }), [user, loading, guestMode]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
