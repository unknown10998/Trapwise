"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

type AuthState = { user: User | null; loading: boolean; configured: boolean; signOut: () => Promise<void> };
const AuthContext = createContext<AuthState>({ user: null, loading: true, configured: false, signOut: async () => undefined });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(isSupabaseConfigured);
  useEffect(() => { const client = getSupabaseBrowserClient(); if (!client) return; client.auth.getUser().then(({ data }) => { setUser(data.user); setLoading(false); }); const { data } = client.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); setLoading(false); }); return () => data.subscription.unsubscribe(); }, []);
  const value = useMemo(() => ({ user, loading, configured: isSupabaseConfigured(), signOut: async () => { await getSupabaseBrowserClient()?.auth.signOut(); } }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
