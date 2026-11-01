"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import { rupees } from "@/lib/hooks";
import type { Idea, Interest } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { OWNER_NAME } from "@/lib/config";
import { Empty, Loading, useRequireLogin } from "@/components/ui";

export default function IdeaPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const requireLogin = useRequireLogin();
  const [idea, setIdea] = useState<Idea | null | undefined>(undefined);
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState("");
  useEffect(() => { db.get<Idea>("ideas", params.id).then(setIdea); }, [params.id]);
  useEffect(() => {
    if (user) db.list<Interest>("interests", { eq: { idea_id: params.id, user_id: user.id } }).then((r) => setSent(r.length > 0));
  }, [user, params.id]);

  if (idea === undefined) return <Loading />;
  if (!idea) return <Empty title="Idea not found" action={<Link className="btn-primary" href="/ideas">Back</Link>} />;
  const isBiz = idea.kind !== "content";
  const back = isBiz ? "/ideas" : "/ideas?tab=content";

  return (
    <div>
      <Link href={back} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-ink-700"><ArrowLeft size={16} /> Ideas</Link>
      <div className={`rounded-3xl p-5 text-white ${isBiz ? "bg-gradient-to-br from-sky-600 to-indigo-700" : "bg-gradient-to-br from-fuchsia-600 to-violet-700"}`}>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{idea.kind} · {idea.category}</p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight">{idea.title}</h1>
        <p className="mt-2 text-sm opacity-90">{idea.summary}</p>
      </div>

      {isBiz && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Fact label="Investment" value={`${rupees(idea.budget_min)} – ${rupees(idea.budget_max)}`} />
          <Fact label="Possible earning / month" value={idea.monthly_earning ?? "—"} />
          <Fact label="Space needed" value={idea.space ?? "—"} />
          <Fact label="Difficulty" value={idea.difficulty ?? "—"} />
        </div>
      )}

      {idea.steps && idea.steps.length > 0 && (
        <div className="card mt-4 p-4">
          <h2 className="h-section">{isBiz ? "How to get started" : "How to make it"}</h2>
          <ol className="mt-3 space-y-2.5">
            {idea.steps.map((s, i) => <li key={i} className="flex gap-3 text-sm"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{i + 1}</span>{s}</li>)}
          </ol>
        </div>
      )}

      <div className="card mt-4 p-4">
        {sent ? (
          <p className="flex items-center gap-2 text-sm font-semibold text-leaf-700"><CheckCircle2 size={18} /> You&apos;re interested. {OWNER_NAME} will reach out to help you plan it.</p>
        ) : (
          <>
            <p className="font-bold">{isBiz ? "Interested in starting this?" : "Want to make this with others?"}</p>
            <p className="mt-1 text-sm text-ink-500">{isBiz ? `${OWNER_NAME} can help you with the plan, local suppliers, location and first customers.` : "We'll connect you with people nearby who want to create too."}</p>
            <textarea className="input mt-3" rows={2} placeholder="Tell us a bit about you (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
            <button className="btn-primary mt-2 w-full" onClick={async () => {
              if (!requireLogin()) return;
              await db.insert<Interest>("interests", { idea_id: idea.id, idea_title: idea.title, user_id: user!.id, user_name: user!.name, phone: user!.phone, note });
              setSent(true);
            }}>🙋 I&apos;m interested</button>
          </>
        )}
      </div>
      {isBiz && <p className="mt-4 text-center text-[11px] text-ink-500">Figures are indicative and vary by brand and location. This is information, not financial advice.</p>}
    </div>
  );
}
const Fact = ({ label, value }: { label: string; value: string }) => (
  <div className="card p-3"><p className="text-[11px] text-ink-500">{label}</p><p className="font-bold">{value}</p></div>
);
