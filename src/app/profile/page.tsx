"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogOut, Shield, RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { DEMO_ADMIN_PHONE, DEMO_MODE, DEMO_OTP, OWNER_NAME, OWNER_WHATSAPP, waLink } from "@/lib/config";
import { resetDemoData } from "@/lib/db";
import { PageTitle, useToast } from "@/components/ui";

const AREAS = ["Sidedahalli", "Nagasandra", "Bagalagunte", "Shettihalli", "Chikkasandra", "Abbigere", "T Dasarahalli", "Chikkabanavara", "Jalahalli", "Other (within 10 km)"];

function ProfileInner() {
  const { user, loading, sendOtp, verifyOtp, logout, saveProfile } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const { toast, el } = useToast();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [name, setName] = useState("");
  const [area, setArea] = useState("");

  if (loading) return null;

  if (!user) {
    return (
      <div className="mx-auto max-w-sm pt-6">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-extrabold text-white">P</div>
          <h1 className="text-2xl font-extrabold">Welcome to Pavan&apos;s World</h1>
          <p className="mt-1 text-sm text-ink-500">Your neighbourhood, all in one app.</p>
        </div>
        <form className="card space-y-3 p-5" onSubmit={async (e) => {
          e.preventDefault(); setErr(""); setBusy(true);
          try {
            if (step === "phone") { await sendOtp(phone); setStep("otp"); }
            else {
              const p = await verifyOtp(phone, otp);
              router.replace(p.name ? next : `/profile?next=${encodeURIComponent(next)}`);
            }
          } catch (e: any) { setErr(e.message || "Something went wrong"); }
          setBusy(false);
        }}>
          {step === "phone" ? (
            <div>
              <label className="label">Mobile number</label>
              <div className="flex gap-2">
                <span className="input !w-16 text-center text-ink-500">+91</span>
                <input className="input" inputMode="numeric" maxLength={10} placeholder="10-digit number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} autoFocus />
              </div>
            </div>
          ) : (
            <div>
              <label className="label">Enter the 6-digit OTP sent to +91 {phone}</label>
              <input className="input text-center text-lg tracking-[.5em]" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} autoFocus />
              <button type="button" className="mt-2 text-xs font-semibold text-brand-600" onClick={() => { setStep("phone"); setOtp(""); }}>Change number</button>
            </div>
          )}
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button className="btn-primary w-full" disabled={busy || (step === "phone" ? phone.length !== 10 : otp.length !== 6)}>
            {busy ? "Please wait…" : step === "phone" ? "Send OTP" : "Verify & continue"}
          </button>
        </form>
        {DEMO_MODE && (
          <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
            <b>Demo mode:</b> use any number with OTP <b>{DEMO_OTP}</b>. Log in as <b>{DEMO_ADMIN_PHONE}</b> to open the Admin panel.
          </div>
        )}
      </div>
    );
  }

  const needsName = !user.name;
  return (
    <div className="mx-auto max-w-md">
      <PageTitle title={needsName ? "One last step" : "My profile"} subtitle={`+91 ${user.phone}`} />
      <form className="card space-y-3 p-5" onSubmit={async (e) => {
        e.preventDefault();
        await saveProfile({ name: name || user.name, area: area || user.area });
        toast("Profile saved");
        if (needsName) router.replace(next);
      }}>
        <div>
          <label className="label">Your name</label>
          <input className="input" required defaultValue={user.name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kavya" />
        </div>
        <div>
          <label className="label">Your area</label>
          <select className="input" defaultValue={user.area || ""} onChange={(e) => setArea(e.target.value)} required>
            <option value="" disabled>Select area</option>
            {AREAS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
        <button className="btn-primary w-full">{needsName ? "Continue" : "Save"}</button>
      </form>

      {!needsName && (
        <div className="mt-4 space-y-2">
          <Link href="/fit" className="card flex items-center justify-between p-4 text-sm font-semibold">🧘 My fitness plan & progress <span>›</span></Link>
          <a href={waLink(OWNER_WHATSAPP, `Hi ${OWNER_NAME}, I'm ${user.name} from Pavan's World.`)} target="_blank" rel="noreferrer" className="card flex items-center justify-between p-4 text-sm font-semibold">💬 Talk to {OWNER_NAME} on WhatsApp <span>›</span></a>
          {user.role === "admin" && <Link href="/admin" className="card flex items-center justify-between p-4 text-sm font-semibold"><span className="flex items-center gap-2"><Shield size={16} /> Admin panel</span> <span>›</span></Link>}
          <button onClick={async () => { await logout(); router.replace("/"); }} className="btn-ghost w-full"><LogOut size={16} /> Log out</button>
          {DEMO_MODE && (
            <button onClick={() => { resetDemoData(); location.reload(); }} className="btn w-full text-xs text-ink-500"><RotateCcw size={14} /> Reset demo data</button>
          )}
        </div>
      )}
      {el}
    </div>
  );
}

export default function ProfilePage() {
  return <Suspense><ProfileInner /></Suspense>;
}
