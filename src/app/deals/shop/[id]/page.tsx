"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { todayStr, useTable, daysLeft } from "@/lib/hooks";
import type { Deal, Shop } from "@/lib/types";
import { ContactButtons, Empty, Loading } from "@/components/ui";

export default function ShopPage({ params }: { params: { id: string } }) {
  const [shop, setShop] = useState<Shop | null | undefined>(undefined);
  const { rows: deals } = useTable<Deal>("deals", { eq: { shop_id: params.id, status: "approved" } });
  useEffect(() => { db.get<Shop>("shops", params.id).then(setShop); }, [params.id]);
  if (shop === undefined) return <Loading />;
  if (!shop) return <Empty title="Shop not found" action={<Link href="/deals" className="btn-primary">Back to deals</Link>} />;
  const live = deals.filter((d) => d.valid_till >= todayStr());
  return (
    <div>
      <Link href="/deals" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-ink-700"><ArrowLeft size={16} /> Deals</Link>
      <div className="card p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-3xl">{shop.emoji ?? "🏪"}</span>
          <div>
            <h1 className="text-xl font-extrabold">{shop.name}</h1>
            <p className="text-sm text-ink-500">{shop.category} · {shop.area} · {shop.distance_km} km</p>
          </div>
        </div>
        {shop.about && <p className="mt-3 text-sm text-ink-700">{shop.about}</p>}
        <p className="mt-2 flex items-center gap-1 text-sm text-ink-500"><MapPin size={14} />{shop.address}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ContactButtons phone={shop.phone} whatsapp={shop.whatsapp} message="Hi, I found your shop on Pavan's World." />
          <a className="btn-outline" target="_blank" rel="noreferrer" href={shop.maps_url || `https://www.google.com/maps/search/${encodeURIComponent(`${shop.name} ${shop.area} Bengaluru`)}`}><MapPin size={16} /> Directions</a>
        </div>
      </div>
      <h2 className="h-section mb-2 mt-6">Current offers</h2>
      {live.length === 0 ? <Empty emoji="🏷️" title="No active offers right now" /> : (
        <div className="space-y-2">
          {live.map((d) => (
            <div key={d.id} className="card flex items-center gap-3 p-3">
              <span className="rounded-lg bg-brand-500 px-2.5 py-2 text-sm font-extrabold text-white">{d.discount_label}</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{d.title}</p>
                <p className="text-xs text-ink-500">{d.description} {d.code && <>· Code <b className="font-mono text-brand-700">{d.code}</b></>} · {daysLeft(d.valid_till)} days left</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
