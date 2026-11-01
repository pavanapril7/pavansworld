"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Flame, Timer, Play, Pause, RotateCcw, Settings2, MessageCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { streakOf, todayStr, useTable } from "@/lib/hooks";
import type { Checkin, FitnessProfile } from "@/lib/types";
import { buildPlan, CONDITIONS, GOALS, LEVELS, MINUTES, type Exercise } from "@/lib/workouts";
import { OWNER_NAME, OWNER_WHATSAPP, waLink } from "@/lib/config";
import { PageTitle, Sheet, Loading, useToast } from "@/components/ui";

export default function FitPage() {
  const { user, loading } = useAuth();
  const [fp, setFp] = useState<FitnessProfile | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!user) return;
    db.get<FitnessProfile>("fitness_profiles", user.id).then(setFp);
  }, [user]);

  if (loading) return <Loading />;
  if (!user) return <FitIntro />;
  if (fp === undefined) return <Loading />;
  if (!fp || editing) return <Onboarding initial={fp} onDone={(p) => { setFp(p); setEditing(false); }} />;
  return <Dashboard fp={fp} setFp={setFp} onEdit={() => setEditing(true)} />;
}

function FitIntro() {
  return (
    <div>
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-leaf-600 to-emerald-800 p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">Fit Daily</p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight">Your personal yoga & home-workout guide</h1>
        <p className="mt-2 text-sm text-emerald-50">A fresh plan every day, made for your goal, your level and your health — with {OWNER_NAME} checking on your progress.</p>
        <Link href="/profile?next=/fit" className="btn mt-5 bg-white text-leaf-700">Start free — 2 min setup</Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {[["🧘", "Daily plan", "Yoga, home workouts & breathing"], ["🔥", "Streaks", "Stay consistent every day"], ["📈", "Progress", "Weight, energy, sleep, mood"], ["🤝", "1-on-1 coaching", `Personal follow-up by ${OWNER_NAME}`]].map(([e, t, d]) => (
          <div key={t} className="card p-4"><div className="text-2xl">{e}</div><p className="mt-1 font-bold">{t}</p><p className="text-xs text-ink-500">{d}</p></div>
        ))}
      </div>
    </div>
  );
}

function Onboarding({ initial, onDone }: { initial: FitnessProfile | null; onDone: (p: FitnessProfile) => void }) {
  const { user } = useAuth();
  const [f, setF] = useState({
    goal: initial?.goal ?? "", level: initial?.level ?? "Beginner", minutes: initial?.minutes ?? 15,
    conditions: initial?.conditions ?? [] as string[], age: initial?.age ?? "", weight_start: initial?.weight_start ?? "", preferred_time: initial?.preferred_time ?? "Morning",
  });
  const toggle = (c: string) => setF({ ...f, conditions: f.conditions.includes(c) ? f.conditions.filter((x) => x !== c) : [...f.conditions, c] });
  const save = async () => {
    const p = await db.upsert<FitnessProfile>("fitness_profiles", {
      id: user!.id, name: user!.name, phone: user!.phone, goal: f.goal, level: f.level as FitnessProfile["level"], minutes: Number(f.minutes),
      conditions: f.conditions, age: f.age ? Number(f.age) : undefined, weight_start: f.weight_start ? Number(f.weight_start) : undefined,
      preferred_time: f.preferred_time, coaching: initial?.coaching ?? "free",
    });
    onDone(p);
  };
  return (
    <div>
      <PageTitle emoji="🧘" title={initial ? "Update your plan" : "Let's build your plan"} subtitle="Answer a few questions. Your plan changes every day." />
      <div className="space-y-5">
        <Q n={1} q="What's your main goal?">
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((g) => <button key={g} className={`rounded-xl border p-3 text-left text-sm font-semibold ${f.goal === g ? "border-leaf-600 bg-leaf-50 text-leaf-700" : "border-ink-300 bg-white"}`} onClick={() => setF({ ...f, goal: g })}>{g}</button>)}
          </div>
        </Q>
        <Q n={2} q="Your current fitness level">
          <div className="flex gap-2">{LEVELS.map((l) => <button key={l} className={f.level === l ? "chip-on" : "chip-off"} onClick={() => setF({ ...f, level: l })}>{l}</button>)}</div>
        </Q>
        <Q n={3} q="How much time can you give daily?">
          <div className="flex gap-2">{MINUTES.map((m) => <button key={m} className={f.minutes === m ? "chip-on" : "chip-off"} onClick={() => setF({ ...f, minutes: m })}>{m} min</button>)}</div>
        </Q>
        <Q n={4} q="Any health conditions? (select all that apply)">
          <div className="flex flex-wrap gap-2">{CONDITIONS.map((c) => <button key={c} className={f.conditions.includes(c) ? "chip-on" : "chip-off"} onClick={() => toggle(c)}>{c}</button>)}</div>
          {f.conditions.length > 0 && (
            <p className="mt-2 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900"><AlertTriangle size={16} className="shrink-0" />We&apos;ll skip poses that aren&apos;t safe for these. Please check with your doctor before starting, and stop if anything hurts.</p>
          )}
        </Q>
        <Q n={5} q="A little about you (optional)">
          <div className="grid grid-cols-3 gap-2">
            <input className="input" placeholder="Age" inputMode="numeric" value={f.age} onChange={(e) => setF({ ...f, age: e.target.value })} />
            <input className="input" placeholder="Weight kg" inputMode="decimal" value={f.weight_start} onChange={(e) => setF({ ...f, weight_start: e.target.value })} />
            <select className="input" value={f.preferred_time} onChange={(e) => setF({ ...f, preferred_time: e.target.value })}>
              {["Morning", "Afternoon", "Evening"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </Q>
        <button className="btn-green w-full !py-3 text-base" disabled={!f.goal} onClick={save}>{initial ? "Save changes" : "Create my plan"}</button>
      </div>
    </div>
  );
}
const Q = ({ n, q, children }: { n: number; q: string; children: React.ReactNode }) => (
  <div><p className="mb-2 text-sm font-bold"><span className="mr-1 text-leaf-600">{n}.</span>{q}</p>{children}</div>
);

function Dashboard({ fp, setFp, onEdit }: { fp: FitnessProfile; setFp: (p: FitnessProfile) => void; onEdit: () => void }) {
  const { user } = useAuth();
  const { toast, el } = useToast();
  const today = todayStr();
  const plan = useMemo(() => buildPlan(fp), [fp]);
  const { rows: checkins, reload } = useTable<Checkin>("checkins", { eq: { user_id: user!.id }, order: { col: "date", asc: false } });
  const todayCi = checkins.find((c) => c.date === today);
  const done = todayCi?.completed ?? [];
  const streak = streakOf(checkins.filter((c) => (c.completed?.length ?? 0) > 0 || c.mood).map((c) => c.date));
  const pct = Math.round((done.filter((d) => plan.some((p) => p.id === d)).length / Math.max(plan.length, 1)) * 100);
  const [open, setOpen] = useState<Exercise | null>(null);

  const saveCi = async (patch: Partial<Checkin>) => {
    await db.upsert<Checkin>("checkins", { id: `${user!.id}-${today}`, user_id: user!.id, date: today, completed: done, ...todayCi, ...patch });
    await reload();
  };
  const toggleDone = async (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    await saveCi({ completed: next });
    if (next.length === plan.length) toast("🎉 Today's plan complete! Great work.");
  };

  const requestCoaching = async () => {
    await db.insert("leads", { user_id: user!.id, name: user!.name, phone: user!.phone, kind: "coaching", message: `Goal: ${fp.goal}, ${fp.level}, ${fp.minutes} min. Conditions: ${fp.conditions.join(", ") || "none"}`, status: "new" });
    const p = { ...fp, coaching: "requested" as const };
    await db.update("fitness_profiles", fp.id, { coaching: "requested" });
    setFp(p);
    window.open(waLink(OWNER_WHATSAPP, `Hi ${OWNER_NAME}, I'm ${user!.name}. I'd like 1-on-1 fitness coaching. My goal: ${fp.goal}.`), "_blank");
  };

  return (
    <div>
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-leaf-600 to-emerald-800 p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-100">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</p>
            <h1 className="mt-0.5 text-2xl font-extrabold">Today&apos;s plan</h1>
            <p className="text-sm text-emerald-50">{fp.goal} · {fp.level} · {fp.minutes} min</p>
          </div>
          <button onClick={onEdit} className="rounded-full bg-white/15 p-2" aria-label="Edit plan"><Settings2 size={18} /></button>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Ring pct={pct} />
          <div className="flex-1 space-y-1 text-sm">
            <p className="flex items-center gap-1.5 font-bold"><Flame size={18} className="text-amber-300" /> {streak}-day streak</p>
            <p className="text-emerald-50">{done.length}/{plan.length} done · {plan.reduce((a, e) => a + e.minutes, 0)} min total</p>
          </div>
        </div>
      </div>

      {fp.conditions.length > 0 && (
        <p className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900"><AlertTriangle size={15} className="shrink-0" />Plan adjusted for: {fp.conditions.join(", ")}. Go slow and stop if you feel pain or dizziness.</p>
      )}

      {/* Plan */}
      <div className="mt-4 space-y-2">
        {plan.map((e, i) => {
          const isDone = done.includes(e.id);
          return (
            <div key={e.id} className={`card flex items-center gap-3 p-3 ${isDone ? "opacity-70" : ""}`}>
              <button onClick={() => setOpen(e)} className="flex flex-1 items-center gap-3 text-left">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-leaf-50 text-2xl">{e.emoji}</span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500">{i + 1}. {e.phase === "warmup" ? "Warm-up" : e.phase === "cooldown" ? "Cool-down" : e.kind}</span>
                  <span className={`block truncate font-bold ${isDone ? "line-through" : ""}`}>{e.name}</span>
                  <span className="block text-xs text-ink-500">{e.alt ? `${e.alt} · ` : ""}{e.reps ?? `${e.minutes} min`}</span>
                </span>
              </button>
              <button onClick={() => toggleDone(e.id)} aria-label="Mark done"
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 ${isDone ? "border-leaf-600 bg-leaf-600 text-white" : "border-ink-300 text-transparent"}`}>
                <Check size={18} strokeWidth={3} />
              </button>
            </div>
          );
        })}
      </div>

      <CheckinCard ci={todayCi} onSave={async (p) => { await saveCi(p); toast("Check-in saved ✅"); }} />
      <Progress checkins={checkins} start={fp.weight_start} />

      {/* Coaching */}
      <div className="card mt-4 overflow-hidden">
        <div className="bg-brand-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Personal coaching</p>
          {fp.coaching === "free" && (<>
            <p className="mt-1 font-bold">Want {OWNER_NAME} to guide you personally?</p>
            <p className="mt-1 text-sm text-ink-700">Daily follow-up on WhatsApp, a plan built around your body, and live corrections.</p>
            <button onClick={requestCoaching} className="btn-primary mt-3"><MessageCircle size={16} /> Request 1-on-1 coaching</button>
          </>)}
          {fp.coaching === "requested" && <p className="mt-1 text-sm">✅ Request sent. {OWNER_NAME} will message you on WhatsApp soon.</p>}
          {fp.coaching === "active" && (<>
            <p className="mt-1 font-bold">Your coach: {OWNER_NAME}</p>
            <a href={waLink(OWNER_WHATSAPP, `Hi ${OWNER_NAME}, quick update on today's workout:`)} target="_blank" rel="noreferrer" className="btn-green mt-3"><MessageCircle size={16} /> Message your coach</a>
          </>)}
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-ink-500">Guidance here is general fitness advice, not medical treatment. Consult a doctor for any health condition.</p>

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ""}>
        {open && <ExerciseDetail e={open} done={done.includes(open.id)} onDone={async () => { await toggleDone(open.id); setOpen(null); }} />}
      </Sheet>
      {el}
    </div>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 30, c = 2 * Math.PI * r;
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0">
      <circle cx="38" cy="38" r={r} stroke="rgba(255,255,255,.2)" strokeWidth="8" fill="none" />
      <circle cx="38" cy="38" r={r} stroke="#FDE68A" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 38 38)" style={{ transition: "stroke-dashoffset .5s" }} />
      <text x="38" y="43" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff">{pct}%</text>
    </svg>
  );
}

function ExerciseDetail({ e, done, onDone }: { e: Exercise; done: boolean; onDone: () => void }) {
  const total = e.minutes * 60;
  const [left, setLeft] = useState(total);
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!run) return;
    const t = setInterval(() => setLeft((l) => (l <= 1 ? (setRun(false), 0) : l - 1)), 1000);
    return () => clearInterval(t);
  }, [run]);
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  return (
    <div>
      <div className="grid h-36 place-items-center rounded-2xl bg-leaf-50 text-7xl">{e.emoji}</div>
      <p className="mt-3 text-sm text-ink-500">{e.alt && <b className="text-ink-700">{e.alt} · </b>}{e.kind} · {e.reps ?? `${e.minutes} min`}</p>
      <p className="mt-2 text-sm">{e.benefit}</p>
      <h4 className="mt-4 text-sm font-bold">How to do it</h4>
      <ol className="mt-2 space-y-2">
        {e.steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf-100 text-xs font-bold text-leaf-700">{i + 1}</span>{s}</li>
        ))}
      </ol>
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-ink-100 p-3">
        <span className="flex items-center gap-2 font-mono text-2xl font-bold"><Timer size={20} />{mm}:{ss}</span>
        <div className="flex gap-2">
          <button className="btn-outline !px-3" onClick={() => { setRun(false); setLeft(total); }} aria-label="Reset"><RotateCcw size={16} /></button>
          <button className="btn-primary" onClick={() => setRun(!run)}>{run ? <><Pause size={16} />Pause</> : <><Play size={16} />Start</>}</button>
        </div>
      </div>
      <button className={`${done ? "btn-ghost" : "btn-green"} mt-3 w-full`} onClick={onDone}>{done ? "Mark as not done" : "✓ Mark as done"}</button>
    </div>
  );
}

const MOODS = ["😫", "😕", "😐", "🙂", "😄"];
function CheckinCard({ ci, onSave }: { ci?: Checkin; onSave: (p: Partial<Checkin>) => void }) {
  const [mood, setMood] = useState(ci?.mood ?? 0);
  const [energy, setEnergy] = useState(ci?.energy ?? 0);
  const [sleep, setSleep] = useState(ci?.sleep_hours?.toString() ?? "");
  const [weight, setWeight] = useState(ci?.weight?.toString() ?? "");
  const [note, setNote] = useState(ci?.note ?? "");
  useEffect(() => { setMood(ci?.mood ?? 0); setEnergy(ci?.energy ?? 0); setSleep(ci?.sleep_hours?.toString() ?? ""); setWeight(ci?.weight?.toString() ?? ""); setNote(ci?.note ?? ""); }, [ci?.id]);
  return (
    <div className="card mt-4 p-4">
      <h2 className="h-section">Daily check-in {ci?.mood ? <span className="badge ml-1 bg-leaf-50 text-leaf-700">Saved</span> : null}</h2>
      <p className="text-xs text-ink-500">Takes 20 seconds. Helps track how you&apos;re really doing.</p>
      <p className="mt-3 text-xs font-semibold text-ink-700">How do you feel today?</p>
      <div className="mt-1 flex justify-between">
        {MOODS.map((m, i) => <button key={i} onClick={() => setMood(i + 1)} className={`grid h-11 w-11 place-items-center rounded-xl text-2xl ${mood === i + 1 ? "bg-brand-100 ring-2 ring-brand-500" : "bg-ink-100"}`}>{m}</button>)}
      </div>
      <p className="mt-3 text-xs font-semibold text-ink-700">Energy level</p>
      <div className="mt-1 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setEnergy(n)} className={`h-8 flex-1 rounded-lg text-xs font-bold ${n <= energy ? "bg-leaf-500 text-white" : "bg-ink-100 text-ink-500"}`}>{n}</button>)}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div><label className="label">Sleep (hours)</label><input className="input" inputMode="decimal" value={sleep} onChange={(e) => setSleep(e.target.value)} placeholder="7" /></div>
        <div><label className="label">Weight (kg)</label><input className="input" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="optional" /></div>
      </div>
      <div className="mt-2"><label className="label">Anything to share with your coach?</label><input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. slight knee pain today" /></div>
      <button className="btn-primary mt-3 w-full" disabled={!mood} onClick={() => onSave({ mood, energy: energy || undefined, sleep_hours: sleep ? +sleep : undefined, weight: weight ? +weight : undefined, note })}>Save check-in</button>
    </div>
  );
}

function Progress({ checkins, start }: { checkins: Checkin[]; start?: number }) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const s = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const c = checkins.find((x) => x.date === s);
    return { s, label: d.toLocaleDateString("en-IN", { weekday: "narrow" }), active: !!c && ((c.completed?.length ?? 0) > 0 || !!c.mood) };
  });
  const weights = [...checkins].filter((c) => c.weight).sort((a, b) => (a.date > b.date ? 1 : -1)).map((c) => c.weight!) ;
  const latest = weights.at(-1);
  const avgSleep = checkins.slice(0, 7).filter((c) => c.sleep_hours).reduce((a, c, _, arr) => a + c.sleep_hours! / arr.length, 0);
  return (
    <div className="card mt-4 p-4">
      <h2 className="h-section">Last 14 days</h2>
      <div className="mt-3 grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1">
        {days.map((d) => (
          <div key={d.s} className="text-center">
            <div className={`mx-auto h-6 w-full max-w-[22px] rounded-md ${d.active ? "bg-leaf-500" : "bg-ink-100"}`} title={d.s} />
            <span className="text-[10px] text-ink-500">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Active days" value={`${days.filter((d) => d.active).length}/14`} />
        <Stat label="Weight" value={latest ? `${latest} kg` : "—"} sub={latest && start ? `${(latest - start > 0 ? "+" : "")}${(latest - start).toFixed(1)} kg` : undefined} />
        <Stat label="Avg sleep" value={avgSleep ? `${avgSleep.toFixed(1)} h` : "—"} />
      </div>
      {weights.length > 1 && <Spark values={weights} />}
    </div>
  );
}
const Stat = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="rounded-xl bg-ink-100 p-2.5"><p className="text-[11px] text-ink-500">{label}</p><p className="font-bold">{value}</p>{sub && <p className="text-[10px] text-ink-500">{sub}</p>}</div>
);
function Spark({ values }: { values: number[] }) {
  const w = 300, h = 60, min = Math.min(...values) - 0.5, max = Math.max(...values) + 0.5;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / (max - min)) * h}`).join(" ");
  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold text-ink-500">Weight trend</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 h-16 w-full" preserveAspectRatio="none">
        <polyline points={pts} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
