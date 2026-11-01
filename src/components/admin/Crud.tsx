"use client";
import { useState } from "react";
import { Pencil, Plus, Trash2, Search } from "lucide-react";
import { db } from "@/lib/db";
import { useTable } from "@/lib/hooks";
import type { TableName } from "@/lib/types";
import { Sheet } from "@/components/ui";

export interface Field {
  key: string; label: string;
  type?: "text" | "number" | "select" | "checkbox" | "textarea" | "date" | "list";
  options?: (string | { value: string; label: string })[]; required?: boolean; placeholder?: string; full?: boolean;
}
interface Props<T> {
  table: TableName; title: string; fields: Field[];
  columns: { label: string; render: (row: T) => React.ReactNode }[];
  defaults?: Partial<T>; search?: (row: T) => string; rowActions?: (row: T, reload: () => void) => React.ReactNode;
}

export function Crud<T extends { id: string }>({ table, title, fields, columns, defaults = {}, search, rowActions }: Props<T>) {
  const { rows, loading, reload } = useTable<T>(table);
  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const [q, setQ] = useState("");
  const list = rows.filter((r) => !q || (search ? search(r) : JSON.stringify(r)).toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{title} <span className="text-sm font-normal text-ink-500">({rows.length})</span></h2>
        <div className="flex gap-2">
          <div className="relative"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-500" /><input className="input !w-44 !py-2 !pl-8" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <button className="btn-primary !py-2" onClick={() => setEditing({ ...defaults })}><Plus size={16} /> Add</button>
        </div>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 bg-ink-100/60 text-xs text-ink-500">
            <tr>{columns.map((c) => <th key={c.label} className="px-3 py-2 font-semibold">{c.label}</th>)}<th className="px-3 py-2" /></tr>
          </thead>
          <tbody>
            {loading && <tr><td className="p-4 text-ink-500" colSpan={99}>Loading…</td></tr>}
            {!loading && list.length === 0 && <tr><td className="p-4 text-ink-500" colSpan={99}>Nothing here yet.</td></tr>}
            {list.map((r) => (
              <tr key={r.id} className="border-b border-ink-100 last:border-0 hover:bg-ink-100/40">
                {columns.map((c) => <td key={c.label} className="px-3 py-2.5 align-top">{c.render(r)}</td>)}
                <td className="whitespace-nowrap px-3 py-2 text-right">
                  {rowActions?.(r, reload)}
                  <button className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100" aria-label="Edit" onClick={() => setEditing(r)}><Pencil size={15} /></button>
                  <button className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete" onClick={async () => { if (confirm("Delete this item?")) { await db.remove(table, r.id); reload(); } }}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing && (editing as any).id ? `Edit ${title.replace(/s$/, "")}` : `Add ${title.replace(/s$/, "")}`}>
        {editing && <EditForm fields={fields} value={editing} onSave={async (v) => {
          if ((v as any).id) await db.update(table, (v as any).id, v); else await db.insert(table, v);
          setEditing(null); reload();
        }} />}
      </Sheet>
    </div>
  );
}

function EditForm<T>({ fields, value, onSave }: { fields: Field[]; value: Partial<T>; onSave: (v: Partial<T>) => void }) {
  const [v, setV] = useState<any>(value);
  const set = (k: string, val: any) => setV((p: any) => ({ ...p, [k]: val }));
  return (
    <form className="grid grid-cols-2 gap-3" onSubmit={(e) => { e.preventDefault(); onSave(v); }}>
      {fields.map((f) => (
        <div key={f.key} className={f.full || f.type === "textarea" || f.type === "list" ? "col-span-2" : ""}>
          {f.type === "checkbox" ? (
            <label className="flex items-center gap-2 pt-5 text-sm font-semibold"><input type="checkbox" checked={!!v[f.key]} onChange={(e) => set(f.key, e.target.checked)} /> {f.label}</label>
          ) : (
            <>
              <label className="label">{f.label}{f.type === "list" && " (one per line)"}</label>
              {f.type === "select" ? (
                <select className="input" required={f.required} value={v[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)}>
                  <option value="" disabled>Select</option>{f.options!.map((o) => typeof o === "string" ? <option key={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : f.type === "textarea" ? (
                <textarea className="input" rows={3} required={f.required} value={v[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
              ) : f.type === "list" ? (
                <textarea className="input" rows={4} value={(v[f.key] ?? []).join("\n")} onChange={(e) => set(f.key, e.target.value.split("\n"))} onBlur={(e) => set(f.key, e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />
              ) : (
                <input className="input" type={f.type ?? "text"} required={f.required} placeholder={f.placeholder} value={v[f.key] ?? ""}
                  onChange={(e) => set(f.key, f.type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)} />
              )}
            </>
          )}
        </div>
      ))}
      <button className="btn-primary col-span-2 mt-1">Save</button>
    </form>
  );
}
