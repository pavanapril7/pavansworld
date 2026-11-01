"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, X, MessageCircle, LayoutDashboard, HeartPulse, Tag, Store, Wrench, Lightbulb, Inbox, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { streakOf, todayStr, timeAgo, useTable, rupees } from "@/lib/hooks";
import type { Checkin, CollabPost, Deal, FitnessProfile, Helper, Idea, Interest, Lead, Shop } from "@/lib/types";
import { HELPER_CATEGORIES, OWNER_NAME, SHOP_CATEGORIES, waLink } from "@/lib/config";
import { Crud } from "@/components/admin/Crud";
import { Empty, Loading, Sheet, Verified } from "@/components/ui";

const TABS = [
  { k: "overview", l: "Overview", i: LayoutDashboard },
  { k: "members", l: "Fitness members", i: HeartPulse },
  { k: "leads", l: "Leads & interests", i: Inbox },
  { k: "deals", l: "Deals", i: Tag },
  { k: "shops", l: "Shops", i: Store },
  { k: "helpers", l: "Helpers", i: Wrench },
  { k: "ideas", l: "Ideas", i: Lightbulb },
  { k: "collab", l: "Collab posts", i: Users },
];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState("overview");
  if (loading) return <Loading />;
  if (user?.role !== "admin") return <Empty emoji="🔒" title="Admins only" text="Log in with the admin phone number to manage the app." action={<Link href="/profile?next=/admin" className="btn-primary">Log in</Link>} />;

  return (
    <div className="md:flex md:gap-6">
      <aside className="no-scrollbar -mx-4 mb-4 flex gap-1 overflow-x-auto px-4 md:sticky md:top-20 md:mx-0 md:block md:h-fit md:w-52 md:shrink-0 md:space-y-1 md:px-0">
        {TABS.map(({ k, l, i: Icon }) => (
          <button key={k} onClick={() => setTab(k)} className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold md:w-full ${tab === k ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-100"}`}>
            <Icon size={16} />{l}
          </button>
        ))}
      </aside>
      <section className="min-w-0 flex-1">
        {tab === "overview" && <Overview go={setTab} />}
        {tab === "members" && <Members />}
        {tab === "leads" && <Leads />}
        {tab === "deals" && <Deals />}
        {tab === "shops" && <Shops />}
        {tab === "helpers" && <Helpers />}
        {tab === "ideas" && <Ideas />}
        {tab === "collab" && <Collab />}
      </section>
    </div>
  );
}

function Overview({ go }: { go: (t: string) => void }) {
  const { rows: members } = useTable<FitnessProfile>("fitness_profiles");
  const { rows: checkins } = useTable<Checkin>("checkins");
  const { rows: deals } = useTable<Deal>("deals");
  const { rows: leads } = useTable<Lead>("leads");
  const { rows: interests } = useTable<Interest>("interests");
  const { rows: helpers } = useTable<Helper>("helpers");
  const { rows: shops } = useTable<Shop>("shops");
  const today = todayStr();
  const activeToday = new Set(checkins.filter((c) => c.date === today).map((c) => c.user_id)).size;
  const pending = deals.filter((d) => d.status === "pending");
  const newLeads = leads.filter((l) => l.status === "new");
  const missed = members.filter((m) => !checkins.some((c) => c.user_id === m.id && c.date >= daysAgo(2)));

  const stats = [
    { l: "Fitness members", v: members.length, t: "members" }, { l: "Checked in today", v: activeToday, t: "members" },
    { l: "Pending deals", v: pending.length, t: "deals", warn: pending.length > 0 }, { l: "New leads", v: newLeads.length + interests.length, t: "leads", warn: newLeads.length > 0 },
    { l: "Shops", v: shops.length, t: "shops" }, { l: "Helpers", v: helpers.length, t: "helpers" },
  ];
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Hi {OWNER_NAME} 👋</h1>
      <p className="text-sm text-ink-500">Here&apos;s what needs your attention today.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <button key={s.l} onClick={() => go(s.t)} className={`card p-4 text-left ${s.warn ? "border-brand-200 bg-brand-50" : ""}`}>
            <p className="text-xs text-ink-500">{s.l}</p><p className="text-3xl font-extrabold">{s.v}</p>
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h3 className="font-bold">⚠️ Members to follow up ({missed.length})</h3>
          <p className="text-xs text-ink-500">No check-in for 2+ days</p>
          <div className="mt-3 space-y-2">
            {missed.length === 0 && <p className="text-sm text-ink-500">Everyone is on track 🎉</p>}
            {missed.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl bg-ink-100 px-3 py-2 text-sm">
                <span><b>{m.name}</b> <span className="text-ink-500">· {m.goal}</span></span>
                <a className="btn-green !px-2.5 !py-1 !text-xs" target="_blank" rel="noreferrer" href={waLink(m.phone ?? "", `Hi ${m.name?.split(" ")[0]}, ${OWNER_NAME} here 🙏 Missed you on Fit Daily! Today's plan is just ${m.minutes} minutes — shall we do it together?`)}><MessageCircle size={13} /> Nudge</a>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4">
          <h3 className="font-bold">🏷️ Deals waiting for approval ({pending.length})</h3>
          <div className="mt-3 space-y-2">
            {pending.length === 0 && <p className="text-sm text-ink-500">All caught up.</p>}
            {pending.map((d) => (
              <button key={d.id} onClick={() => go("deals")} className="flex w-full items-center justify-between rounded-xl bg-ink-100 px-3 py-2 text-left text-sm">
                <span><b>{d.shop_name}</b> · {d.title}</span><span className="text-xs font-semibold text-brand-600">Review ›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };

const MOOD = ["", "😫", "😕", "😐", "🙂", "😄"];
function Members() {
  const { rows: members, loading, reload } = useTable<FitnessProfile>("fitness_profiles");
  const { rows: checkins } = useTable<Checkin>("checkins", { order: { col: "date", asc: false } });
  const [open, setOpen] = useState<FitnessProfile | null>(null);
  if (loading) return <Loading />;
  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">Fitness members <span className="text-sm font-normal text-ink-500">({members.length})</span></h2>
      {members.length === 0 ? <Empty emoji="🧘" title="No members yet" text="Share the app link — members appear here after they create a plan." /> : (
        <div className="grid gap-3 lg:grid-cols-2">
          {members.map((m) => {
            const cis = checkins.filter((c) => c.user_id === m.id);
            const last = cis[0];
            const streak = streakOf(cis.map((c) => c.date));
            return (
              <div key={m.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{m.name || "Member"} <span className="text-xs font-normal text-ink-500">+91 {m.phone}</span></p>
                    <p className="text-xs text-ink-500">{m.goal} · {m.level} · {m.minutes} min · {m.preferred_time}</p>
                    {m.conditions?.length > 0 && <p className="mt-1 text-xs font-semibold text-amber-700">⚠ {m.conditions.join(", ")}</p>}
                  </div>
                  <span className={`badge ${m.coaching === "active" ? "bg-leaf-50 text-leaf-700" : m.coaching === "requested" ? "bg-brand-100 text-brand-700" : "bg-ink-100 text-ink-500"}`}>
                    {m.coaching === "active" ? "Coaching" : m.coaching === "requested" ? "Wants coaching" : "Free plan"}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-ink-100 p-2"><p className="text-ink-500">Streak</p><b>🔥 {streak}</b></div>
                  <div className="rounded-lg bg-ink-100 p-2"><p className="text-ink-500">Last check-in</p><b>{last ? (last.date === todayStr() ? "Today" : last.date.slice(5)) : "—"}</b></div>
                  <div className="rounded-lg bg-ink-100 p-2"><p className="text-ink-500">Mood / Wt</p><b>{last?.mood ? MOOD[last.mood] : "—"} {last?.weight ? `${last.weight}kg` : ""}</b></div>
                </div>
                {last?.note && <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900">💬 “{last.note}”</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <a className="btn-green !px-3 !py-1.5 !text-xs" target="_blank" rel="noreferrer" href={waLink(m.phone ?? "", `Hi ${m.name?.split(" ")[0]} 🙏 ${OWNER_NAME} here. How did today's session go?`)}><MessageCircle size={13} /> Follow up</a>
                  {m.coaching !== "active" && <button className="btn-outline !px-3 !py-1.5 !text-xs" onClick={async () => { await db.update("fitness_profiles", m.id, { coaching: "active" }); reload(); }}>Start coaching</button>}
                  <button className="btn-ghost !px-3 !py-1.5 !text-xs" onClick={() => setOpen(m)}>History</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Sheet open={!!open} onClose={() => setOpen(null)} title={`${open?.name ?? ""} – check-ins`}>
        <div className="space-y-2">
          {checkins.filter((c) => c.user_id === open?.id).map((c) => (
            <div key={c.id} className="rounded-xl bg-ink-100 p-3 text-sm">
              <p className="flex justify-between"><b>{c.date}</b><span>{c.mood ? MOOD[c.mood] : ""} {c.energy ? `⚡${c.energy}` : ""} {c.sleep_hours ? `😴${c.sleep_hours}h` : ""} {c.weight ? `⚖️${c.weight}` : ""}</span></p>
              <p className="text-xs text-ink-500">{c.completed?.length ?? 0} exercises done</p>
              {c.note && <p className="mt-1 text-xs">💬 {c.note}</p>}
            </div>
          ))}
        </div>
      </Sheet>
    </div>
  );
}

function Leads() {
  const { rows: leads, reload } = useTable<Lead>("leads", { order: { col: "created_at", asc: false } });
  const { rows: interests, reload: reloadI } = useTable<Interest>("interests", { order: { col: "created_at", asc: false } });
  const label = { coaching: "🧘 Coaching request", shop: "🏪 Shop", helper: "🛠️ Helper suggestion", other: "📩 Other" };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-lg font-bold">Leads <span className="text-sm font-normal text-ink-500">({leads.length})</span></h2>
        <div className="space-y-2">
          {leads.length === 0 && <p className="text-sm text-ink-500">No leads yet.</p>}
          {leads.map((l) => (
            <div key={l.id} className="card flex flex-wrap items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink-500">{label[l.kind]} · {timeAgo(l.created_at)}</p>
                <p className="font-bold">{l.name} <span className="text-xs font-normal text-ink-500">+91 {l.phone}</span></p>
                {l.message && <p className="text-sm text-ink-700">{l.message}</p>}
              </div>
              <select className="input !w-32 !py-1.5 !text-xs" value={l.status} onChange={async (e) => { await db.update("leads", l.id, { status: e.target.value }); reload(); }}>
                <option value="new">🆕 New</option><option value="contacted">📞 Contacted</option><option value="done">✅ Done</option>
              </select>
              <a className="btn-green !px-3 !py-1.5 !text-xs" target="_blank" rel="noreferrer" href={waLink(l.phone, `Hi ${l.name}, ${OWNER_NAME} from Pavan's World here.`)}><MessageCircle size={13} /> WhatsApp</a>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-lg font-bold">Interested in ideas <span className="text-sm font-normal text-ink-500">({interests.length})</span></h2>
        <div className="space-y-2">
          {interests.length === 0 && <p className="text-sm text-ink-500">No one yet.</p>}
          {interests.map((i) => (
            <div key={i.id} className="card flex flex-wrap items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink-500">💡 {i.idea_title} · {timeAgo(i.created_at)}</p>
                <p className="font-bold">{i.user_name} <span className="text-xs font-normal text-ink-500">+91 {i.phone}</span></p>
                {i.note && <p className="text-sm text-ink-700">{i.note}</p>}
              </div>
              <a className="btn-green !px-3 !py-1.5 !text-xs" target="_blank" rel="noreferrer" href={waLink(i.phone, `Hi ${i.user_name}, ${OWNER_NAME} here. Saw you're interested in "${i.idea_title}" — happy to help you plan it!`)}><MessageCircle size={13} /> WhatsApp</a>
              <button className="text-xs text-ink-500 hover:text-red-600" onClick={async () => { await db.remove("interests", i.id); reloadI(); }}>Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Deals() {
  const { rows: shops } = useTable<Shop>("shops");
  return (
    <Crud<Deal> table="deals" title="Deals"
      defaults={{ status: "approved", category: "Grocery" } as Partial<Deal>}
      search={(d) => `${d.title} ${d.shop_name} ${d.status}`}
      fields={[
        { key: "shop_name", label: "Shop name", required: true, full: true },
        { key: "shop_id", label: "Link to shop", type: "select", options: shops.map((s) => ({ value: s.id, label: s.name })) },
        { key: "area", label: "Area" },
        { key: "title", label: "Offer title", required: true, full: true },
        { key: "discount_label", label: "Discount label", required: true, placeholder: "20% OFF" },
        { key: "code", label: "Coupon code" },
        { key: "category", label: "Category", type: "select", options: SHOP_CATEGORIES, required: true },
        { key: "valid_till", label: "Valid till", type: "date", required: true },
        { key: "status", label: "Status", type: "select", options: ["pending", "approved", "rejected"] },
        { key: "description", label: "Details", type: "textarea" },
      ]}
      columns={[
        { label: "Offer", render: (d) => <><b>{d.discount_label}</b> · {d.title}<p className="text-xs text-ink-500">{d.shop_name} · {d.area}</p></> },
        { label: "Valid till", render: (d) => <span className={d.valid_till < todayStr() ? "text-red-600" : ""}>{d.valid_till}</span> },
        { label: "Status", render: (d) => <span className={`badge ${d.status === "approved" ? "bg-leaf-50 text-leaf-700" : d.status === "pending" ? "bg-brand-100 text-brand-700" : "bg-red-50 text-red-700"}`}>{d.status}</span> },
      ]}
      rowActions={(d, reload) => d.status === "pending" && (
        <>
          <button title="Approve" className="rounded-lg p-1.5 text-leaf-600 hover:bg-leaf-50" onClick={async () => { await db.update("deals", d.id, { status: "approved" }); reload(); }}><Check size={16} /></button>
          <button title="Reject" className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" onClick={async () => { await db.update("deals", d.id, { status: "rejected" }); reload(); }}><X size={16} /></button>
        </>
      )}
    />
  );
}

function Shops() {
  return (
    <Crud<Shop> table="shops" title="Shops" defaults={{ active: true, emoji: "🏪", distance_km: 1 } as Partial<Shop>}
      fields={[
        { key: "name", label: "Shop name", required: true, full: true },
        { key: "category", label: "Category", type: "select", options: SHOP_CATEGORIES, required: true },
        { key: "emoji", label: "Emoji icon" },
        { key: "area", label: "Area", required: true }, { key: "distance_km", label: "Distance (km)", type: "number" },
        { key: "address", label: "Address", full: true },
        { key: "phone", label: "Phone", required: true }, { key: "whatsapp", label: "WhatsApp" },
        { key: "maps_url", label: "Google Maps link", full: true },
        { key: "about", label: "About", type: "textarea" }, { key: "active", label: "Show in app", type: "checkbox" },
      ]}
      columns={[
        { label: "Shop", render: (s) => <><b>{s.emoji} {s.name}</b><p className="text-xs text-ink-500">{s.category}</p></> },
        { label: "Area", render: (s) => `${s.area} · ${s.distance_km} km` },
        { label: "Phone", render: (s) => s.phone },
        { label: "Live", render: (s) => (s.active ? "✅" : "—") },
      ]}
    />
  );
}

function Helpers() {
  return (
    <Crud<Helper> table="helpers" title="Helpers" defaults={{ active: true, verified: false } as Partial<Helper>}
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "category", label: "Service", type: "select", options: HELPER_CATEGORIES.map((c) => c.key), required: true },
        { key: "phone", label: "Phone", required: true }, { key: "whatsapp", label: "WhatsApp" },
        { key: "area", label: "Area", required: true }, { key: "experience_years", label: "Experience (yrs)", type: "number" },
        { key: "rate_note", label: "Charges", placeholder: "Visit ₹200" }, { key: "languages", label: "Languages" },
        { key: "about", label: "About", type: "textarea" },
        { key: "verified", label: "Verified by me", type: "checkbox" }, { key: "active", label: "Show in app", type: "checkbox" },
      ]}
      columns={[
        { label: "Name", render: (h) => <><b>{h.name}</b> {h.verified && <Verified />}<p className="text-xs text-ink-500">{h.category}</p></> },
        { label: "Area", render: (h) => h.area },
        { label: "Phone", render: (h) => h.phone },
        { label: "Charges", render: (h) => h.rate_note ?? "—" },
      ]}
    />
  );
}

function Ideas() {
  return (
    <Crud<Idea> table="ideas" title="Ideas" defaults={{ kind: "startup", difficulty: "Easy" } as Partial<Idea>}
      fields={[
        { key: "title", label: "Title", required: true, full: true },
        { key: "kind", label: "Type", type: "select", options: ["startup", "franchise", "content"], required: true },
        { key: "category", label: "Category" },
        { key: "summary", label: "Summary", type: "textarea", required: true },
        { key: "budget_min", label: "Budget from (₹)", type: "number" }, { key: "budget_max", label: "Budget to (₹)", type: "number" },
        { key: "monthly_earning", label: "Earning / month", placeholder: "₹30k–₹80k" }, { key: "space", label: "Space needed" },
        { key: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Medium", "Hard"] },
        { key: "steps", label: "Steps to start", type: "list" }, { key: "tags", label: "Tags", type: "list" },
      ]}
      columns={[
        { label: "Idea", render: (i) => <><b>{i.title}</b><p className="text-xs text-ink-500">{i.kind} · {i.category}</p></> },
        { label: "Budget", render: (i) => (i.budget_min ? `${rupees(i.budget_min)}–${rupees(i.budget_max)}` : "—") },
        { label: "Difficulty", render: (i) => i.difficulty ?? "—" },
      ]}
    />
  );
}

function Collab() {
  return (
    <Crud<CollabPost> table="collab_posts" title="Collab posts" defaults={{ type: "looking", status: "open", user_id: "admin", user_name: OWNER_NAME } as Partial<CollabPost>}
      fields={[
        { key: "title", label: "Title", required: true, full: true },
        { key: "type", label: "Type", type: "select", options: ["looking", "offering"] },
        { key: "status", label: "Status", type: "select", options: ["open", "closed"] },
        { key: "user_name", label: "Posted by" }, { key: "contact", label: "Contact phone" },
        { key: "skills", label: "Skills", full: true }, { key: "body", label: "Details", type: "textarea" },
      ]}
      columns={[
        { label: "Post", render: (p) => <><b>{p.title}</b><p className="text-xs text-ink-500">{p.type} · {p.user_name}</p></> },
        { label: "Status", render: (p) => p.status },
        { label: "Posted", render: (p) => timeAgo(p.created_at) },
      ]}
    />
  );
}
