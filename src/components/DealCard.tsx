"use client";
import { MapPin, Clock } from "lucide-react";
import { daysLeft } from "@/lib/hooks";
import type { Deal, Shop } from "@/lib/types";

export function DealCard({ d, shop, onOpen }: { d: Deal; shop?: Shop; onOpen: () => void }) {
  const left = daysLeft(d.valid_till);
  return (
    <button onClick={onOpen} className="card flex gap-3 p-3 text-left transition hover:border-brand-200">
      <div className="grid w-20 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-2 text-center">
        <span className="text-[15px] font-extrabold leading-tight text-white">{d.discount_label}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-ink-500">{shop?.emoji ?? "🏪"} {d.shop_name}</p>
        <p className="line-clamp-2 font-bold leading-snug">{d.title}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-ink-500">
          <span className="flex items-center gap-0.5"><MapPin size={11} />{d.area}{shop ? ` · ${shop.distance_km} km` : ""}</span>
          <span className={`flex items-center gap-0.5 ${left <= 3 ? "font-semibold text-red-600" : ""}`}><Clock size={11} />{left <= 0 ? "Ends today" : `${left} days left`}</span>
        </p>
      </div>
    </button>
  );
}

