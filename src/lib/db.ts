"use client";
/**
 * One small data API used by every screen.
 * - DEMO MODE (no Supabase keys): data lives in the browser (localStorage), pre-filled with sample data.
 * - LIVE MODE: the same calls go to your Supabase Postgres database.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { DEMO_MODE, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import type { TableName } from "./types";
import { seedCollab, seedDeals, seedHelpers, seedIdeas, seedReviews, seedShops } from "./seed";

type Row = Record<string, any> & { id: string };
export interface ListOpts { eq?: Record<string, any>; order?: { col: string; asc?: boolean }; limit?: number }

let _sb: SupabaseClient | null = null;
export function supabase() {
  if (!_sb) _sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true } });
  return _sb;
}

// ---------- local (demo) store ----------
const KEY = "pw:db:v1";
type Store = Record<TableName, Row[]>;
const empty = (): Store => ({
  profiles: [], shops: [], deals: [], helpers: [], reviews: [], ideas: [], interests: [],
  collab_posts: [], fitness_profiles: [], checkins: [], leads: [],
});
function seeded(): Store {
  const s = empty();
  s.shops = seedShops as Row[]; s.deals = seedDeals as Row[]; s.helpers = seedHelpers as Row[];
  s.reviews = seedReviews as Row[]; s.ideas = seedIdeas as Row[]; s.collab_posts = seedCollab as Row[];
  seedDemoMembers(s);
  return s;
}
/** A few sample members so the admin "Members" view isn't empty in the demo. */
function seedDemoMembers(s: Store) {
  const today = new Date();
  const day = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
  const members = [
    { id: "m1", name: "Kavya R", phone: "9000040001", goal: "Weight loss", level: "Beginner", minutes: 30, conditions: [], coaching: "active", weight_start: 72, streak: 6 },
    { id: "m2", name: "Prakash S", phone: "9000040002", goal: "Back & posture", level: "Beginner", minutes: 15, conditions: ["Back pain"], coaching: "requested", weight_start: 80, streak: 2 },
    { id: "m3", name: "Deepa N", phone: "9000040003", goal: "Stress relief", level: "Intermediate", minutes: 30, conditions: ["High BP"], coaching: "free", weight_start: 64, streak: 0 },
  ];
  for (const m of members) {
    s.profiles.push({ id: m.id, name: m.name, phone: m.phone, role: "member", area: "Sidedahalli" });
    s.fitness_profiles.push({ id: m.id, name: m.name, phone: m.phone, goal: m.goal, level: m.level, minutes: m.minutes, conditions: m.conditions, coaching: m.coaching, weight_start: m.weight_start, preferred_time: "Morning" });
    const startGap = m.streak === 0 ? 3 : 0;
    for (let i = startGap; i < startGap + Math.max(m.streak, 2); i++) {
      s.checkins.push({ id: `${m.id}-c${i}`, user_id: m.id, date: day(i), completed: ["a", "b", "c"], mood: 3 + (i % 3 === 0 ? 1 : 0), energy: 3 + (i % 2), sleep_hours: 6 + (i % 3), weight: +(m.weight_start - (m.streak - i) * 0.2).toFixed(1), note: i === startGap ? "Feeling good today" : "" });
    }
  }
  s.leads.push({ id: "l1", user_id: "m2", name: "Prakash S", phone: "9000040002", kind: "coaching", message: "Back pain since 2 months, want guided yoga.", status: "new", created_at: new Date().toISOString() });
  s.interests.push({ id: "in1", idea_id: "i1", idea_title: "Home Tiffin Service", user_id: "m3", user_name: "Deepa N", phone: "9000040003", note: "I cook well, want to start small.", created_at: new Date().toISOString() });
}

function load(): Store {
  if (typeof window === "undefined") return seeded();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...JSON.parse(raw) };
  } catch {}
  const s = seeded();
  save(s);
  return s;
}
function save(s: Store) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }
export function resetDemoData() { try { localStorage.removeItem(KEY); } catch {} }

const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

// ---------- public API ----------
export const db = {
  async list<T = Row>(table: TableName, opts: ListOpts = {}): Promise<T[]> {
    if (!DEMO_MODE) {
      let q = supabase().from(table).select("*");
      if (opts.eq) q = q.match(opts.eq);
      if (opts.order) q = q.order(opts.order.col, { ascending: opts.order.asc ?? true });
      if (opts.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as T[];
    }
    let rows = [...load()[table]];
    if (opts.eq) rows = rows.filter((r) => Object.entries(opts.eq!).every(([k, v]) => r[k] === v));
    if (opts.order) {
      const { col, asc = true } = opts.order;
      rows.sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (asc ? 1 : -1));
    }
    if (opts.limit) rows = rows.slice(0, opts.limit);
    return rows as unknown as T[];
  },

  async get<T = Row>(table: TableName, id: string): Promise<T | null> {
    if (!DEMO_MODE) {
      const { data, error } = await supabase().from(table).select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as T | null;
    }
    return (load()[table].find((r) => r.id === id) as unknown as T) ?? null;
  },

  async insert<T = Row>(table: TableName, row: Partial<T>): Promise<T> {
    const full = { id: uid(), created_at: new Date().toISOString(), ...row } as any;
    if (!DEMO_MODE) {
      const { data, error } = await supabase().from(table).insert(full).select().single();
      if (error) throw error;
      return data as T;
    }
    const s = load(); s[table].unshift(full); save(s); return full;
  },

  async upsert<T = Row>(table: TableName, row: Partial<T> & { id: string }): Promise<T> {
    if (!DEMO_MODE) {
      const { data, error } = await supabase().from(table).upsert(row as any).select().single();
      if (error) throw error;
      return data as T;
    }
    const s = load();
    const i = s[table].findIndex((r) => r.id === row.id);
    if (i >= 0) s[table][i] = { ...s[table][i], ...row };
    else s[table].unshift({ created_at: new Date().toISOString(), ...row } as Row);
    save(s);
    return (i >= 0 ? s[table][i] : s[table][0]) as unknown as T;
  },

  async update<T = Row>(table: TableName, id: string, patch: Partial<T>): Promise<void> {
    if (!DEMO_MODE) {
      const { error } = await supabase().from(table).update(patch as any).eq("id", id);
      if (error) throw error;
      return;
    }
    const s = load();
    s[table] = s[table].map((r) => (r.id === id ? { ...r, ...patch } : r));
    save(s);
  },

  async remove(table: TableName, id: string): Promise<void> {
    if (!DEMO_MODE) {
      const { error } = await supabase().from(table).delete().eq("id", id);
      if (error) throw error;
      return;
    }
    const s = load();
    s[table] = s[table].filter((r) => r.id !== id);
    save(s);
  },
};
