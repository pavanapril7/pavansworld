"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEMO_ADMIN_PHONE, DEMO_MODE, DEMO_OTP } from "./config";
import { db, supabase } from "./db";
import type { Profile } from "./types";

interface AuthCtx {
  user: Profile | null;
  loading: boolean;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<Profile>;
  logout: () => Promise<void>;
  saveProfile: (patch: Partial<Profile>) => Promise<void>;
}
const Ctx = createContext<AuthCtx | null>(null);
const SESSION_KEY = "pw:session";
const norm = (p: string) => p.replace(/\D/g, "").slice(-10);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (id: string, phone: string) => {
    let p = await db.get<Profile>("profiles", id);
    if (!p) p = await db.upsert<Profile>("profiles", { id, phone, name: "", role: DEMO_MODE && phone === DEMO_ADMIN_PHONE ? "admin" : "member" });
    setUser(p);
    return p;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (DEMO_MODE) {
          const raw = localStorage.getItem(SESSION_KEY);
          if (raw) { const { id, phone } = JSON.parse(raw); await loadProfile(id, phone); }
        } else {
          const { data } = await supabase().auth.getSession();
          const u = data.session?.user;
          if (u) await loadProfile(u.id, norm(u.phone || ""));
        }
      } catch {}
      setLoading(false);
    })();
  }, [loadProfile]);

  const sendOtp = async (phone: string) => {
    const p = norm(phone);
    if (p.length !== 10) throw new Error("Enter a valid 10-digit mobile number");
    if (DEMO_MODE) return;
    const { error } = await supabase().auth.signInWithOtp({ phone: "+91" + p });
    if (error) throw error;
  };

  const verifyOtp = async (phone: string, otp: string) => {
    const p = norm(phone);
    if (DEMO_MODE) {
      if (otp !== DEMO_OTP) throw new Error(`Wrong OTP. In demo mode use ${DEMO_OTP}`);
      const id = "u-" + p;
      localStorage.setItem(SESSION_KEY, JSON.stringify({ id, phone: p }));
      return loadProfile(id, p);
    }
    const { data, error } = await supabase().auth.verifyOtp({ phone: "+91" + p, token: otp, type: "sms" });
    if (error || !data.user) throw error ?? new Error("Verification failed");
    return loadProfile(data.user.id, p);
  };

  const logout = async () => {
    if (DEMO_MODE) localStorage.removeItem(SESSION_KEY);
    else await supabase().auth.signOut();
    setUser(null);
  };

  const saveProfile = async (patch: Partial<Profile>) => {
    if (!user) return;
    const { role, ...safe } = patch; // role can only be changed by admin in the database
    await db.update<Profile>("profiles", user.id, safe);
    setUser({ ...user, ...safe });
  };

  return <Ctx.Provider value={{ user, loading, sendOtp, verifyOtp, logout, saveProfile }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
}
