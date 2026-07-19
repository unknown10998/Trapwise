"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ThemeSettings } from "@/components/ThemeSettings";
import trapwiseLogo from "../../logo.png";

const learningLinks = [["/diagnostic", "Diagnostic"], ["/daily", "Daily Practice"], ["/trap-forge", "Trap Forge"]] as const;
const progressLinks = [["/progress", "Progress"], ["/leaderboard", "Leaderboard"]] as const;

export function Header() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showGlint, setShowGlint] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => setShowGlint(false), 500); return () => window.clearTimeout(timer); }, []);

  const linkClass = (href: string) => `rounded-md px-2.5 py-2 transition-colors ${pathname === href ? "bg-emerald-50 font-bold text-emerald-800" : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"}`;
  return <header className="site-header relative z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
    {showGlint && <span aria-hidden className="navbar-glint" />}
    <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <Link href="/" className="brand-mark flex items-center gap-2 text-xl font-semibold tracking-normal text-slate-950" aria-label="Trapwise home">
        <span className="relative h-9 w-7 shrink-0 overflow-hidden rounded-lg" aria-hidden><Image src={trapwiseLogo} alt="" priority className="brand-logo-image absolute left-0 top-1/2 h-14 w-auto max-w-none -translate-y-1/2 object-left" /></span>
        <span>Trapwise</span>
      </Link>
      <nav aria-label="Primary navigation" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
        <div className="nav-group">{learningLinks.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={linkClass(href)}>{label}</Link>)}</div>
        <div className="nav-group nav-group-separated">{progressLinks.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={linkClass(href)}>{label}</Link>)}</div>
        <div className="nav-group nav-group-separated">
          {!loading && (user ? <><Link href="/profile" className={linkClass("/profile")}>Profile</Link><button type="button" onClick={() => void signOut().then(() => router.push("/"))} className={linkClass("/sign-out")}>Sign out</button></> : <><Link href="/login" className={linkClass("/login")}>Log in</Link><Link href="/sign-up" className="rounded-md bg-emerald-600 px-3 py-2 text-white">Sign up</Link></>)}
          <ThemeSettings />
        </div>
      </nav>
    </div>
  </header>;
}
