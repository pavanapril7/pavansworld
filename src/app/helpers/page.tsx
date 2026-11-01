"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Siren, UserPlus, MapPin, Briefcase, Languages } from "lucide-react";
import { useTable } from "@/lib/hooks";
import type { Helper, Review } from "@/lib/types";
import { EMERGENCY, HELPER_CATEGORIES, telLink } from "@/lib/config";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ContactButtons, Empty, Loading, PageTitle, Sheet, Stars, Verified, useRequireLogin, useToast } from "@/components/ui";

function HelpersInner() {
  const initialCat = useSearchParams().get("cat") ?? "";
  const { rows: helpers, loading } = useTable<Helper>("helpers", { eq: { active: true } });
  const { rows: reviews, reload: reloadReviews } = useTable<Review>("reviews", { order: { col: "created_at", asc: false } });
  const [cat, setCat] = useState(initialCat);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Helper | null>(null);
  const [suggest, setSuggest] = useState(false);
  const requireLogin = useRequireLogin();
  const { toast, el } = useToast();

  const rating = (id: string) => {
    const r = reviews.filter((x) => x.helper_id === id);
    return { avg: r.length ? r.reduce((a, x) => a + x.rating, 0) / r.length : 0, count: r.length };
  };
  const list = useMemo(() => helpers
    .filter((h) => !cat || h.category === cat)
    .filter((h) => !q || `${h.name} ${h.category} ${h.area}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(b.verified) - Number(a.verified) || rating(b.id).avg - rating(a.id).avg),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [helpers, reviews, cat, q]);

  return (
    <div>
      <PageTitle emoji="🛠️" title="Household Helpers" subtitle="Trusted local people, rated by your neighbours"
        action={<button className="btn-outline !px-3 !text-xs" onClick={() => requireLogin() && setSuggest(true)}><UserPlus size={14} /> Suggest</button>} />

      <details className="card mb-4 overflow-hidden">
        <summary className="flex cursor-pointer items-center gap-2 bg-red-50 p-3 text-sm font-bold text-red-700"><Siren size={18} /> Emergency numbers</summary>
        <div className="grid grid-cols-2 gap-2 p-3">
          {EMERGENCY.map((e) => (
            <a key={e.phone} href={telLink(e.phone)} className="flex items-center justify-between rounded-xl bg-ink-100 px-3 py-2 text-sm">
              <span>{e.name}</span><b className="text-red-700">{e.phone}</b>
            </a>
          ))}
        </div>
      </details>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
        <input className="input !pl-9" placeholder="Search plumber, electrician, area…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {HELPER_CATEGORIES.map((c) => (
          <button key={c.key} onClick={() => setCat(cat === c.key ? "" : c.key)}
            className={`flex flex-col items-center gap-1 rounded-2xl border p-2 text-center text-[11px] font-semibold leading-tight ${cat === c.key ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-100 bg-white"}`}>
            <span className="text-2xl">{c.emoji}</span>{c.key}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {loading ? <Loading /> : list.length === 0 ? <Empty emoji="🧰" title="No one listed here yet" text="Know someone good? Suggest them." /> : list.map((h) => {
          const r = rating(h.id);
          const emoji = HELPER_CATEGORIES.find((c) => c.key === h.category)?.emoji ?? "🧰";
          return (
            <div key={h.id} className="card p-3">
              <button className="flex w-full items-start gap-3 text-left" onClick={() => setOpen(h)}>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-2xl">{emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5"><b>{h.name}</b>{h.verified && <Verified />}</span>
                  <span className="block text-xs text-ink-500">{h.category} · {h.area}{h.experience_years ? ` · ${h.experience_years} yrs` : ""}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs">
                    {r.count ? <><Stars value={r.avg} size={12} /><span className="text-ink-500">{r.avg.toFixed(1)} ({r.count})</span></> : <span className="text-ink-500">No reviews yet</span>}
                    {h.rate_note && <span className="ml-1 rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-700">{h.rate_note}</span>}
                  </span>
                </span>
              </button>
              <div className="mt-2.5 flex justify-end"><ContactButtons compact phone={h.phone} whatsapp={h.whatsapp} message={`Hi ${h.name}, I got your number from Pavan's World. I need help with:`} /></div>
            </div>
          );
        })}
      </div>

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ""}>
        {open && <HelperDetail h={open} reviews={reviews.filter((r) => r.helper_id === open.id)} onReviewed={async () => { await reloadReviews(); toast("Thanks for your review!"); }} />}
      </Sheet>
      <Sheet open={suggest} onClose={() => setSuggest(false)} title="Suggest a helper">
        <SuggestForm onDone={() => { setSuggest(false); toast("Thanks! We'll verify and add them."); }} />
      </Sheet>
      {el}
    </div>
  );
}

function HelperDetail({ h, reviews, onReviewed }: { h: Helper; reviews: Review[]; onReviewed: () => void }) {
  const { user } = useAuth();
  const requireLogin = useRequireLogin();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge bg-brand-50 text-brand-700">{h.category}</span>
        {h.verified ? <Verified /> : <span className="badge bg-ink-100 text-ink-500">Not yet verified</span>}
      </div>
      {h.about && <p className="mt-3 text-sm">{h.about}</p>}
      <div className="mt-3 space-y-1 text-sm text-ink-700">
        <p className="flex items-center gap-2"><MapPin size={14} /> {h.area}</p>
        {h.experience_years && <p className="flex items-center gap-2"><Briefcase size={14} /> {h.experience_years} years experience</p>}
        {h.languages && <p className="flex items-center gap-2"><Languages size={14} /> {h.languages}</p>}
        {h.rate_note && <p className="flex items-center gap-2">💰 {h.rate_note}</p>}
      </div>
      <div className="mt-4"><ContactButtons phone={h.phone} whatsapp={h.whatsapp} message={`Hi ${h.name}, I got your number from Pavan's World. I need help with:`} /></div>

      <h4 className="mt-6 flex items-center gap-2 text-sm font-bold">Reviews {reviews.length > 0 && <><Stars value={avg} /> <span className="font-normal text-ink-500">{avg.toFixed(1)} · {reviews.length}</span></>}</h4>
      <div className="mt-2 space-y-2">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl bg-ink-100 p-3 text-sm">
            <p className="flex items-center justify-between"><b>{r.user_name}</b><Stars value={r.rating} size={12} /></p>
            {r.comment && <p className="mt-1 text-ink-700">{r.comment}</p>}
          </div>
        ))}
        {reviews.length === 0 && <p className="text-sm text-ink-500">Be the first to review.</p>}
      </div>

      <div className="mt-4 rounded-2xl border border-ink-100 p-3">
        <p className="text-sm font-semibold">Used their service? Rate them</p>
        <div className="mt-2"><Stars value={rating} onChange={setRating} size={26} /></div>
        <input className="input mt-2" placeholder="Short comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
        <button className="btn-primary mt-2 w-full" disabled={!rating} onClick={async () => {
          if (!requireLogin()) return;
          await db.insert<Review>("reviews", { helper_id: h.id, user_id: user!.id, user_name: user!.name || "Neighbour", rating, comment });
          setRating(0); setComment(""); onReviewed();
        }}>Submit review</button>
      </div>
    </div>
  );
}

function SuggestForm({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  return (
    <form className="space-y-3" onSubmit={async (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
      await db.insert("leads", { user_id: user?.id, name: f.name, phone: f.phone, kind: "helper", message: `${f.category} · ${f.area}. ${f.note}`, status: "new" });
      onDone();
    }}>
      <div><label className="label">Their name</label><input name="name" className="input" required /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="label">Phone</label><input name="phone" className="input" inputMode="numeric" required /></div>
        <div><label className="label">Area</label><input name="area" className="input" required /></div>
      </div>
      <div><label className="label">Service</label><select name="category" className="input">{HELPER_CATEGORIES.map((c) => <option key={c.key}>{c.key}</option>)}</select></div>
      <div><label className="label">Why do you recommend them?</label><textarea name="note" className="input" rows={2} /></div>
      <button className="btn-primary w-full">Send suggestion</button>
    </form>
  );
}

export default function HelpersPage() { return <Suspense><HelpersInner /></Suspense>; }
