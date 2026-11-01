"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Phone, MessageCircle, Star, X, BadgeCheck, ChevronRight } from "lucide-react";
import { telLink, waLink } from "@/lib/config";
import { useAuth } from "@/lib/auth";

export function PageTitle({ title, subtitle, emoji, action }: { title: string; subtitle?: string; emoji?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{emoji && <span className="mr-1.5">{emoji}</span>}{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionHead({ title, href, linkText = "See all" }: { title: string; href?: string; linkText?: string }) {
  return (
    <div className="mb-2 mt-6 flex items-center justify-between">
      <h2 className="h-section">{title}</h2>
      {href && <Link href={href} className="flex items-center text-xs font-semibold text-brand-600">{linkText}<ChevronRight size={14} /></Link>}
    </div>
  );
}

export function Chips<T extends string>({ options, value, onChange, all = "All" }: { options: readonly T[]; value: T | ""; onChange: (v: T | "") => void; all?: string | null }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {all !== null && <button className={value === "" ? "chip-on" : "chip-off"} onClick={() => onChange("")}>{all}</button>}
      {options.map((o) => (
        <button key={o} className={value === o ? "chip-on" : "chip-off"} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

export function ContactButtons({ phone, whatsapp, message, compact }: { phone?: string; whatsapp?: string; message?: string; compact?: boolean }) {
  if (!phone && !whatsapp) return null;
  return (
    <div className="flex gap-2">
      {phone && (
        <a href={telLink(phone)} className={`btn-outline ${compact ? "!px-3 !py-1.5 !text-xs" : ""}`} onClick={(e) => e.stopPropagation()}>
          <Phone size={compact ? 14 : 16} /> Call
        </a>
      )}
      {(whatsapp || phone) && (
        <a href={waLink(whatsapp || phone!, message)} target="_blank" rel="noreferrer" className={`btn-green ${compact ? "!px-3 !py-1.5 !text-xs" : ""}`} onClick={(e) => e.stopPropagation()}>
          <MessageCircle size={compact ? 14 : 16} /> WhatsApp
        </a>
      )}
    </div>
  );
}

export function Stars({ value, onChange, size = 14 }: { value: number; onChange?: (n: number) => void; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} onClick={onChange ? () => onChange(n) : undefined}
          className={`${n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-ink-300"} ${onChange ? "cursor-pointer" : ""}`} />
      ))}
    </span>
  );
}

export const Verified = () => (
  <span className="badge bg-leaf-50 text-leaf-700"><BadgeCheck size={12} /> Verified</span>
);

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink-100" aria-label="Close"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Empty({ emoji = "🔍", title, text, action }: { emoji?: string; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-10 text-center">
      <div className="text-4xl">{emoji}</div>
      <p className="mt-2 font-semibold">{title}</p>
      {text && <p className="mt-1 text-sm text-ink-500">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Loading() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-ink-100" />)}
    </div>
  );
}

export function Toast({ msg, onDone }: { msg: string | null; onDone: () => void }) {
  useEffect(() => { if (msg) { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); } }, [msg, onDone]);
  if (!msg) return null;
  return <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg md:bottom-8">{msg}</div>;
}
export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  return { toast: setMsg, el: <Toast msg={msg} onDone={() => setMsg(null)} /> };
}

/** Wrap actions that need a logged-in user. */
export function LoginPrompt({ text = "Log in with your mobile number to continue." }: { text?: string }) {
  return (
    <Empty emoji="🔐" title="Please log in" text={text}
      action={<Link href={`/profile?next=${typeof window !== "undefined" ? encodeURIComponent(location.pathname) : "/"}`} className="btn-primary">Log in with OTP</Link>} />
  );
}

export function useRequireLogin() {
  const { user } = useAuth();
  return () => {
    if (user) return true;
    location.href = `/profile?next=${encodeURIComponent(location.pathname)}`;
    return false;
  };
}
