"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPin, Clock, Store, Copy } from "lucide-react";
import { useTable, daysLeft, todayStr } from "@/lib/hooks";
import type { Deal, Shop } from "@/lib/types";
import { SHOP_CATEGORIES } from "@/lib/config";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DealCard } from "@/components/DealCard";
import { Chips, ContactButtons, Empty, Loading, PageTitle, Sheet, useRequireLogin, useToast } from "@/components/ui";

export default function DealsPage() {
  const { rows: deals, loading } = useTable<Deal>("deals", { eq: { status: "approved" }, order: { col: "valid_till", asc: true } });
  const { rows: shops } = useTable<Shop>("shops");
  const [cat, setCat] = useState<string>("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Deal | null>(null);
  const [submit, setSubmit] = useState(false);
  const requireLogin = useRequireLogin();
  const { toast, el } = useToast();

  const shopOf = (d: Deal) => shops.find((s) => s.id === d.shop_id);
  const list = useMemo(() => deals
    .filter((d) => d.valid_till >= todayStr())
    .filter((d) => !cat || d.category === cat)
    .filter((d) => !q || `${d.title} ${d.shop_name} ${d.area}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (shopOf(a)?.distance_km ?? 99) - (shopOf(b)?.distance_km ?? 99)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [deals, shops, cat, q]);

  return (
    <div>
      <PageTitle emoji="🏷️" title="Local Deals" subtitle="Exclusive offers from shops near you"
        action={<button className="btn-outline !px-3 !text-xs" onClick={() => requireLogin() && setSubmit(true)}><Store size={14} /> List your offer</button>} />
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
        <input className="input !pl-9" placeholder="Search shops, offers, areas…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Chips options={SHOP_CATEGORIES} value={cat} onChange={setCat} />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {loading ? <Loading /> : list.length === 0 ? <div className="sm:col-span-2"><Empty emoji="🛍️" title="No deals here yet" text="Try another category." /></div> :
          list.map((d) => <DealCard key={d.id} d={d} shop={shopOf(d)} onOpen={() => setOpen(d)} />)}
      </div>

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.shop_name ?? ""}>
        {open && <DealDetail d={open} shop={shopOf(open)} onCopy={() => toast("Code copied")} />}
      </Sheet>
      <Sheet open={submit} onClose={() => setSubmit(false)} title="List your shop's offer">
        <SubmitDeal shops={shops} onDone={() => { setSubmit(false); toast("Sent for approval. We'll publish it soon!"); }} />
      </Sheet>
      {el}
    </div>
  );
}

function DealDetail({ d, shop, onCopy }: { d: Deal; shop?: Shop; onCopy: () => void }) {
  const [shown, setShown] = useState(false);
  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white">
        <p className="text-3xl font-extrabold">{d.discount_label}</p>
        <p className="mt-1 font-semibold">{d.title}</p>
        {d.description && <p className="mt-1 text-sm text-brand-100">{d.description}</p>}
        <p className="mt-3 text-xs text-brand-100">Valid till {new Date(d.valid_till).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
      </div>
      {d.code && (
        <div className="mt-4 rounded-2xl border-2 border-dashed border-brand-400 p-4 text-center">
          <p className="text-xs font-semibold text-ink-500">Show this code at the counter</p>
          {shown ? (
            <button className="mt-1 inline-flex items-center gap-2 font-mono text-2xl font-extrabold tracking-widest text-brand-700" onClick={() => { navigator.clipboard?.writeText(d.code!); onCopy(); }}>{d.code} <Copy size={16} /></button>
          ) : (
            <button className="btn-primary mt-2" onClick={() => setShown(true)}>Reveal coupon code</button>
          )}
        </div>
      )}
      <div className="mt-4 rounded-2xl bg-ink-100 p-4">
        <p className="font-bold">{shop?.emoji} {d.shop_name}</p>
        {shop && <p className="text-sm text-ink-700">{shop.address}, {shop.area} · {shop.distance_km} km away</p>}
        {shop?.about && <p className="mt-1 text-sm text-ink-500">{shop.about}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <ContactButtons phone={shop?.phone ?? d.shop_phone} whatsapp={shop?.whatsapp} message={`Hi, I saw your offer "${d.title}" on Pavan's World.`} />
          {shop && <a className="btn-outline" target="_blank" rel="noreferrer" href={shop.maps_url || `https://www.google.com/maps/search/${encodeURIComponent(`${shop.name} ${shop.area} Bengaluru`)}`}><MapPin size={16} /> Directions</a>}
        </div>
        {shop && <Link href={`/deals/shop/${shop.id}`} className="mt-3 block text-sm font-semibold text-brand-600">View shop & all offers ›</Link>}
      </div>
    </div>
  );
}

function SubmitDeal({ shops, onDone }: { shops: Shop[]; onDone: () => void }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  return (
    <form className="space-y-3" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true);
      const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
      const shop = shops.find((s) => s.name.toLowerCase() === f.shop_name.trim().toLowerCase());
      await db.insert<Deal>("deals", {
        shop_id: shop?.id ?? null, shop_name: f.shop_name, shop_phone: f.shop_phone, area: f.area, title: f.title, description: f.description,
        discount_label: f.discount_label, code: f.code || undefined, category: f.category, valid_till: f.valid_till, status: "pending", submitted_by: user?.id,
      });
      setBusy(false); onDone();
    }}>
      <p className="text-sm text-ink-500">Shop owners: post a discount for people in the area. Every offer is checked before going live.</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2"><label className="label">Shop name</label><input name="shop_name" className="input" required /></div>
        <div><label className="label">Shop phone</label><input name="shop_phone" className="input" inputMode="numeric" required /></div>
        <div><label className="label">Area</label><input name="area" className="input" required placeholder="e.g. Nagasandra" /></div>
        <div className="col-span-2"><label className="label">Offer title</label><input name="title" className="input" required placeholder="e.g. 20% off on all sarees" /></div>
        <div><label className="label">Discount label</label><input name="discount_label" className="input" required placeholder="20% OFF" maxLength={10} /></div>
        <div><label className="label">Category</label><select name="category" className="input">{SHOP_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label className="label">Coupon code (optional)</label><input name="code" className="input" /></div>
        <div><label className="label">Valid till</label><input name="valid_till" type="date" className="input" required min={todayStr()} /></div>
        <div className="col-span-2"><label className="label">Details / conditions</label><textarea name="description" className="input" rows={2} /></div>
      </div>
      <button className="btn-primary w-full" disabled={busy}>Submit for approval</button>
    </form>
  );
}
