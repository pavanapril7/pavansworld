"use client";
import { useCallback, useEffect, useState } from "react";
import { db, type ListOpts } from "./db";
import type { TableName } from "./types";

export function useTable<T>(table: TableName, opts: ListOpts = {}, enabled = true) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const key = JSON.stringify(opts);
  const reload = useCallback(async () => {
    if (!enabled) { setLoading(false); return; }
    setLoading(true);
    try { setRows(await db.list<T>(table, JSON.parse(key))); setError(null); }
    catch (e: any) { setError(e?.message ?? "Failed to load"); }
    setLoading(false);
  }, [table, key, enabled]);
  useEffect(() => { reload(); }, [reload]);
  return { rows, loading, error, reload, setRows };
}

export const todayStr = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

/** Consecutive days (ending today or yesterday) with a check-in. */
export function streakOf(dates: string[]) {
  const set = new Set(dates);
  const d = new Date();
  const fmt = (x: Date) => new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  if (!set.has(fmt(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(fmt(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export const rupees = (n?: number) =>
  n == null ? "" : n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 ? 1 : 0)}L` : `₹${(n / 1000).toFixed(0)}k`;

export const daysLeft = (date: string) => Math.ceil((new Date(date).getTime() - new Date(todayStr()).getTime()) / 864e5);

export const timeAgo = (iso?: string) => {
  if (!iso) return "";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
