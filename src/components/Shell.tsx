"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, HeartPulse, Tag, Wrench, Lightbulb, UserCircle2, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { APP_NAME, DEMO_MODE, HOME_AREA } from "@/lib/config";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/fit", label: "Fit Daily", icon: HeartPulse },
  { href: "/deals", label: "Deals", icon: Tag },
  { href: "/helpers", label: "Helpers", icon: Wrench },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { user } = useAuth();
  const isAdmin = path.startsWith("/admin");
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/90 backdrop-blur">
        <div className={`mx-auto flex h-14 items-center justify-between px-4 ${isAdmin ? "max-w-6xl" : "max-w-3xl"}`}>
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-extrabold text-white">P</span>
            <span className="leading-tight">
              <span className="block text-[15px] font-extrabold tracking-tight">{APP_NAME}</span>
              <span className="block text-[10px] font-medium text-ink-500">📍 {HOME_AREA} & 10 km around</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${active(n.href) ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-ink-100"}`}>{n.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user?.role === "admin" && (
              <Link href="/admin" className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${isAdmin ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-900"}`}><Shield size={14} /> Admin</Link>
            )}
            <Link href="/profile" aria-label="Profile" className="text-ink-700"><UserCircle2 size={28} strokeWidth={1.6} /></Link>
          </div>
        </div>
        {DEMO_MODE && (
          <div className="bg-amber-50 py-1 text-center text-[11px] font-medium text-amber-800">Demo mode · sample data · login OTP is 123456</div>
        )}
      </header>

      <main className={`mx-auto px-4 pb-28 pt-4 md:pb-12 ${isAdmin ? "max-w-6xl" : "max-w-3xl"}`}>{children}</main>

      {!isAdmin && (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-100 bg-white/95 backdrop-blur md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div className="mx-auto grid max-w-3xl grid-cols-5">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${active(href) ? "text-brand-600" : "text-ink-500"}`}>
                <Icon size={22} strokeWidth={active(href) ? 2.4 : 1.8} />
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
