"use client";
import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Sparkles, MessageCircle } from "lucide-react";
import { dayIndex } from "@/lib/workouts";
import { rupees, timeAgo, useTable } from "@/lib/hooks";
import type { CollabPost, Idea } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { waLink } from "@/lib/config";
import { Chips, Empty, Loading, PageTitle, Sheet, useRequireLogin, useToast } from "@/components/ui";

const TABS = [{ k: "business", l: "💼 Startups & Franchise" }, { k: "content", l: "🎬 Content Ideas" }, { k: "collab", l: "🤝 Collab Board" }];
const BUDGETS = ["Under ₹1L", "₹1L – ₹5L", "Above ₹5L"] as const;
const inBudget = (i: Idea, b: string) => {
  const min = i.budget_min ?? 0;
  if (b === "Under ₹1L") return min < 100000;
  if (b === "₹1L – ₹5L") return min >= 100000 && min < 500000 || (min < 500000 && (i.budget_max ?? 0) >= 100000);
  if (b === "Above ₹5L") return (i.budget_max ?? 0) >= 500000;
  return true;
};

function IdeasInner() {
  const tab = useSearchParams().get("tab") ?? "business";
  const router = useRouter();
  return (
    <div>
      <PageTitle emoji="💡" title="Ideas & Collab" subtitle="Start something, create something, grow together" />
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
        {TABS.map((t) => <button key={t.k} className={tab === t.k ? "chip-on !py-2 !text-sm" : "chip-off !py-2 !text-sm"} onClick={() => router.replace(`/ideas?tab=${t.k}`)}>{t.l}</button>)}
      </div>
      {tab === "business" && <Business />}
      {tab === "content" && <Content />}
      {tab === "collab" && <Collab />}
    </div>
  );
}

function Business() {
  const { rows, loading } = useTable<Idea>("ideas");
  const [kind, setKind] = useState<"" | "Startup" | "Franchise">("");
  const [budget, setBudget] = useState<string>("");
  const list = rows.filter((i) => i.kind !== "content")
    .filter((i) => !kind || i.kind === kind.toLowerCase())
    .filter((i) => !budget || inBudget(i, budget));
  return (
    <>
      <Chips options={["Startup", "Franchise"] as const} value={kind} onChange={setKind} all="All types" />
      <div className="mt-2"><Chips options={BUDGETS} value={budget as any} onChange={setBudget} all="Any budget" /></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {loading ? <Loading /> : list.length === 0 ? <div className="sm:col-span-2"><Empty emoji="💼" title="No ideas in this budget yet" /></div> : list.map((i) => (
          <Link key={i.id} href={`/ideas/${i.id}`} className="card block p-4 transition hover:border-brand-200">
            <div className="flex items-center justify-between">
              <span className={`badge ${i.kind === "franchise" ? "bg-violet-50 text-violet-700" : "bg-sky-50 text-sky-700"}`}>{i.kind === "franchise" ? "Franchise" : "Startup"} · {i.category}</span>
              {i.difficulty && <span className="text-[11px] font-semibold text-ink-500">{i.difficulty}</span>}
            </div>
            <p className="mt-2 font-bold leading-snug">{i.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-ink-500">{i.summary}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <Mini label="Investment" value={`${rupees(i.budget_min)}–${rupees(i.budget_max)}`} />
              <Mini label="Earning/mo" value={i.monthly_earning ?? "—"} />
              <Mini label="Space" value={i.space ?? "—"} />
            </div>
          </Link>
        ))}
      </div>
      <p className="mt-4 text-center text-[11px] text-ink-500">Figures are indicative estimates for guidance only. Verify costs and agreements yourself before investing.</p>
    </>
  );
}
const Mini = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-ink-100 px-1.5 py-1.5"><p className="text-[10px] text-ink-500">{label}</p><p className="truncate text-xs font-bold">{value}</p></div>
);

function Content() {
  const { rows, loading } = useTable<Idea>("ideas", { eq: { kind: "content" } });
  const today = rows.length ? rows[dayIndex() % rows.length] : null;
  return (
    <>
      {today && (
        <Link href={`/ideas/${today.id}`} className="block rounded-3xl bg-gradient-to-br from-fuchsia-600 to-violet-700 p-5 text-white">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-fuchsia-100"><Sparkles size={14} /> Idea of the day</p>
          <p className="mt-1 text-xl font-extrabold">{today.title}</p>
          <p className="mt-1 text-sm text-fuchsia-50">{today.summary}</p>
        </Link>
      )}
      <div className="mt-4 space-y-2">
        {loading ? <Loading /> : rows.map((i) => (
          <Link key={i.id} href={`/ideas/${i.id}`} className="card flex items-center gap-3 p-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-xl">🎬</span>
            <span className="min-w-0 flex-1">
              <b className="block truncate">{i.title}</b>
              <span className="block truncate text-xs text-ink-500">{i.category} · {i.tags?.map((t) => `#${t}`).join(" ")}</span>
            </span>
          </Link>
        ))}
      </div>
      <div className="card mt-4 p-4 text-sm">
        <p className="font-bold">Want to create content together?</p>
        <p className="mt-1 text-ink-500">Find editors, photographers and co-hosts nearby on the Collab Board.</p>
        <Link href="/ideas?tab=collab" className="btn-primary mt-3">Open Collab Board</Link>
      </div>
    </>
  );
}

function Collab() {
  const { user } = useAuth();
  const requireLogin = useRequireLogin();
  const { toast, el } = useToast();
  const { rows, loading, reload } = useTable<CollabPost>("collab_posts", { order: { col: "created_at", asc: false } });
  const [type, setType] = useState<"" | "Looking for" | "Offering">("");
  const [open, setOpen] = useState(false);
  const list = useMemo(() => rows.filter((p) => p.status === "open" || p.user_id === user?.id)
    .filter((p) => !type || (type === "Looking for" ? p.type === "looking" : p.type === "offering")), [rows, type, user]);
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <Chips options={["Looking for", "Offering"] as const} value={type} onChange={setType} />
        <button className="btn-primary shrink-0 !px-3 !py-2 !text-xs" onClick={() => requireLogin() && setOpen(true)}><Plus size={14} /> Post</button>
      </div>
      <div className="mt-3 space-y-2">
        {loading ? <Loading /> : list.length === 0 ? <Empty emoji="🤝" title="No posts yet" text="Be the first to post." /> : list.map((p) => (
          <div key={p.id} className="card p-4">
            <div className="flex items-center justify-between">
              <span className={`badge ${p.type === "looking" ? "bg-amber-50 text-amber-800" : "bg-leaf-50 text-leaf-700"}`}>{p.type === "looking" ? "🔎 Looking for" : "🙋 Offering"}</span>
              <span className="text-[11px] text-ink-500">{p.user_name} · {timeAgo(p.created_at)}</span>
            </div>
            <p className="mt-2 font-bold">{p.title}</p>
            <p className="mt-1 text-sm text-ink-700">{p.body}</p>
            {p.skills && <p className="mt-2 flex flex-wrap gap-1">{p.skills.split(",").map((s) => <span key={s} className="badge bg-ink-100 text-ink-700">{s.trim()}</span>)}</p>}
            <div className="mt-3 flex items-center justify-between">
              {p.status === "closed" ? <span className="text-xs font-semibold text-ink-500">Closed</span> : <span />}
              {p.user_id === user?.id ? (
                p.status === "open" && <button className="btn-ghost !py-1.5 !text-xs" onClick={async () => { await db.update("collab_posts", p.id, { status: "closed" }); reload(); }}>Mark as closed</button>
              ) : (
                <a className="btn-green !py-1.5 !text-xs" target="_blank" rel="noreferrer" href={waLink(p.contact, `Hi ${p.user_name}, I saw your post "${p.title}" on Pavan's World.`)}><MessageCircle size={14} /> Connect</a>
              )}
            </div>
          </div>
        ))}
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} title="New collab post">
        <form className="space-y-3" onSubmit={async (e) => {
          e.preventDefault();
          const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
          await db.insert<CollabPost>("collab_posts", { user_id: user!.id, user_name: user!.name || "Member", type: f.type as any, title: f.title, body: f.body, skills: f.skills, contact: user!.phone, status: "open" });
          setOpen(false); reload(); toast("Posted!");
        }}>
          <div className="flex gap-2">
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-ink-300 p-3 text-sm"><input type="radio" name="type" value="looking" defaultChecked /> I&apos;m looking for</label>
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-ink-300 p-3 text-sm"><input type="radio" name="type" value="offering" /> I&apos;m offering</label>
          </div>
          <div><label className="label">Title</label><input name="title" className="input" required placeholder="e.g. Need a reels editor" /></div>
          <div><label className="label">Details</label><textarea name="body" className="input" rows={3} required /></div>
          <div><label className="label">Skills (comma separated)</label><input name="skills" className="input" placeholder="Editing, Photography" /></div>
          <p className="text-xs text-ink-500">People will contact you on WhatsApp at +91 {user?.phone}.</p>
          <button className="btn-primary w-full">Publish</button>
        </form>
      </Sheet>
      {el}
    </>
  );
}

export default function IdeasPage() { return <Suspense><IdeasInner /></Suspense>; }
