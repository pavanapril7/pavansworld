"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, ArrowRight, Siren, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rupees, streakOf, todayStr, useTable } from "@/lib/hooks";
import type { Checkin, CollabPost, Deal, FitnessProfile, Idea, Shop } from "@/lib/types";
import { buildPlan, dayIndex } from "@/lib/workouts";
import { HELPER_CATEGORIES, OWNER_NAME, OWNER_WHATSAPP, waLink } from "@/lib/config";
import { SectionHead } from "@/components/ui";

export default function Home() {
  const { user } = useAuth();
  const { rows: deals } = useTable<Deal>("deals", { eq: { status: "approved" } });
  const { rows: shops } = useTable<Shop>("shops");
  const { rows: ideas } = useTable<Idea>("ideas");
  const { rows: posts } = useTable<CollabPost>("collab_posts", { order: { col: "created_at", asc: false }, limit: 3 });
  const [fp, setFp] = useState<FitnessProfile | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);

  useEffect(() => {
    if (!user) return;
    db.get<FitnessProfile>("fitness_profiles", user.id).then(setFp);
    db.list<Checkin>("checkins", { eq: { user_id: user.id } }).then(setCheckins);
  }, [user]);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const liveDeals = deals.filter((d) => d.valid_till >= todayStr()).slice(0, 8);
  const contentIdeas = ideas.filter((i) => i.kind === "content");
  const ideaOfDay = contentIdeas.length ? contentIdeas[dayIndex() % contentIdeas.length] : null;
  const bizIdeas = ideas.filter((i) => i.kind !== "content").slice(0, 4);

  return (
    <div>
      <p className="text-sm text-ink-500">{greet}{user?.name ? "," : ""}</p>
      <h1 className="text-2xl font-extrabold tracking-tight">{user?.name ? `Namaskara, ${user.name.split(" ")[0]} 🙏` : "Namaskara 🙏 Welcome!"}</h1>
      <p className="mt-0.5 text-sm text-ink-500">Everything you need around Sidedahalli, in one place.</p>

      <FitCard fp={fp} checkins={checkins} loggedIn={!!user} />

      {/* Quick help */}
      <SectionHead title="Need help at home?" href="/helpers" />
      <div className="grid grid-cols-4 gap-2">
        {HELPER_CATEGORIES.slice(0, 7).map((c) => (
          <Link key={c.key} href={`/helpers?cat=${encodeURIComponent(c.key)}`} className="flex flex-col items-center gap-1 rounded-2xl border border-ink-100 bg-white p-2 text-center text-[11px] font-semibold leading-tight shadow-card">
            <span className="text-2xl">{c.emoji}</span>{c.key.replace(" & Appliance Repair", " Repair")}
          </Link>
        ))}
        <Link href="/helpers" className="flex flex-col items-center gap-1 rounded-2xl border border-red-100 bg-red-50 p-2 text-center text-[11px] font-semibold leading-tight text-red-700">
          <Siren size={24} className="my-0.5" />Emergency
        </Link>
      </div>

      {/* Deals */}
      <SectionHead title="🏷️ Deals near you" href="/deals" />
      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
        {liveDeals.map((d) => {
          const shop = shops.find((s) => s.id === d.shop_id);
          return (
            <Link key={d.id} href="/deals" className="card w-56 shrink-0 snap-start overflow-hidden">
              <div className="flex items-center justify-between bg-gradient-to-br from-brand-500 to-brand-700 px-4 py-3 text-white">
                <span className="text-xl font-extrabold">{d.discount_label}</span><span className="text-2xl">{shop?.emoji ?? "🏪"}</span>
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-bold leading-snug">{d.title}</p>
                <p className="mt-1 truncate text-xs text-ink-500">{d.shop_name} · {d.area}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Ideas */}
      <SectionHead title="💡 Ideas to start & create" href="/ideas" />
      {ideaOfDay && (
        <Link href={`/ideas/${ideaOfDay.id}`} className="block rounded-2xl bg-gradient-to-br from-fuchsia-600 to-violet-700 p-4 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-fuchsia-100">Content idea of the day</p>
          <p className="mt-0.5 font-bold">{ideaOfDay.title}</p>
          <p className="mt-0.5 line-clamp-1 text-sm text-fuchsia-50">{ideaOfDay.summary}</p>
        </Link>
      )}
      <div className="mt-2 grid grid-cols-2 gap-2">
        {bizIdeas.map((i) => (
          <Link key={i.id} href={`/ideas/${i.id}`} className="card p-3">
            <span className={`badge ${i.kind === "franchise" ? "bg-violet-50 text-violet-700" : "bg-sky-50 text-sky-700"}`}>{i.kind === "franchise" ? "Franchise" : "Startup"}</span>
            <p className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug">{i.title}</p>
            <p className="mt-1 text-xs text-ink-500">from {rupees(i.budget_min)}</p>
          </Link>
        ))}
      </div>

      {/* Collab */}
      {posts.length > 0 && (
        <>
          <SectionHead title="🤝 Latest collabs" href="/ideas?tab=collab" />
          <div className="space-y-2">
            {posts.map((p) => (
              <Link key={p.id} href="/ideas?tab=collab" className="card flex items-center gap-3 p-3">
                <span className="text-xl">{p.type === "looking" ? "🔎" : "🙋"}</span>
                <span className="min-w-0 flex-1"><b className="block truncate text-sm">{p.title}</b><span className="text-xs text-ink-500">{p.user_name}</span></span>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Community */}
      <div className="mt-6 rounded-3xl bg-ink-900 p-5 text-white">
        <p className="flex items-center gap-2 text-sm font-semibold text-brand-200"><Users size={16} /> Our community</p>
        <p className="mt-1 text-lg font-extrabold">Meet your neighbours. Share. Celebrate.</p>
        <p className="mt-1 text-sm text-ink-300">Join the Pavan&apos;s World WhatsApp group for weekend yoga in the park, meetups and local news.</p>
        <a href={waLink(OWNER_WHATSAPP, `Hi ${OWNER_NAME}, please add me to the Pavan's World community group.`)} target="_blank" rel="noreferrer" className="btn mt-4 bg-white text-ink-900">Join the community <ArrowRight size={16} /></a>
      </div>
    </div>
  );
}

function FitCard({ fp, checkins, loggedIn }: { fp: FitnessProfile | null; checkins: Checkin[]; loggedIn: boolean }) {
  if (!fp) {
    return (
      <Link href="/fit" className="mt-4 block overflow-hidden rounded-3xl bg-gradient-to-br from-leaf-600 to-emerald-800 p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">Fit Daily · Free</p>
        <p className="mt-1 text-xl font-extrabold leading-tight">Get your personal yoga & home workout plan</p>
        <p className="mt-1 text-sm text-emerald-50">Made for your goal and health. New plan every day. {loggedIn ? "2-minute setup." : ""}</p>
        <span className="btn mt-4 bg-white text-leaf-700">{loggedIn ? "Create my plan" : "Start now"} <ArrowRight size={16} /></span>
      </Link>
    );
  }
  const plan = buildPlan(fp);
  const today = checkins.find((c) => c.date === todayStr());
  const done = (today?.completed ?? []).filter((id) => plan.some((p) => p.id === id)).length;
  const streak = streakOf(checkins.filter((c) => (c.completed?.length ?? 0) > 0 || c.mood).map((c) => c.date));
  return (
    <Link href="/fit" className="mt-4 block rounded-3xl bg-gradient-to-br from-leaf-600 to-emerald-800 p-5 text-white">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">Today&apos;s workout</p>
        <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold"><Flame size={14} className="text-amber-300" />{streak} {streak === 1 ? "day" : "days"}</span>
      </div>
      <p className="mt-1 text-xl font-extrabold">{done === plan.length ? "All done today! 🎉" : `${plan.length - done} exercises left`}</p>
      <p className="text-sm text-emerald-50">{plan.slice(0, 3).map((e) => e.name).join(" · ")}…</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-amber-300" style={{ width: `${(done / plan.length) * 100}%` }} /></div>
      <span className="btn mt-4 bg-white text-leaf-700">{done ? "Continue" : "Start today's plan"} <ArrowRight size={16} /></span>
    </Link>
  );
}
