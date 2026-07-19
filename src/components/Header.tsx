"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { startRouteLoadingGlint } from "@/components/RouteLoadingGlint";
import { ThemeSettings } from "@/components/ThemeSettings";
import trapwiseLogo from "../../logo.png";

const learningLinks = [["/diagnostic", "Diagnostic"], ["/daily", "Daily Practice"], ["/trap-forge", "Trap Forge"]] as const;
const progressLinks = [["/progress", "Progress"], ["/achievements", "Achievements"], ["/leaderboard", "Leaderboard"]] as const;

export function Header() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const menu = menuRef.current;
    const menuButton = menuButtonRef.current;
    const focusable = () => Array.from(menu?.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])') ?? []).filter((element) => !element.hasAttribute("disabled"));
    focusable()[0]?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); setMobileOpen(false); return; }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0]; const last = items.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => { window.removeEventListener("keydown", onKeyDown); menuButton?.focus(); };
  }, [mobileOpen]);

  function requestPageGlint(href?: string) {
    if (href === pathname) return;
    startRouteLoadingGlint();
  }
  function navigateFromMenu(href: string) { requestPageGlint(href); setMobileOpen(false); }
  const linkClass = (href: string) => `rounded-md px-2.5 py-2 transition-colors ${pathname === href ? "bg-emerald-50 font-bold text-emerald-800" : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"}`;
  const mobileLinkClass = (href: string) => `flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm font-semibold ${pathname === href ? "bg-emerald-50 text-emerald-900" : "text-slate-700 hover:bg-slate-100"}`;

  return <header className="site-header relative z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
    <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
      <Link href="/" className="brand-mark flex items-center gap-2 text-xl font-semibold tracking-normal text-slate-950" aria-label="Trapwise home">
        <span className="relative h-9 w-7 shrink-0 overflow-hidden rounded-lg" aria-hidden><Image src={trapwiseLogo} alt="" priority className="brand-logo-image absolute left-0 top-1/2 h-14 w-auto max-w-none -translate-y-1/2 object-left" /></span>
        <span>Trapwise</span>
      </Link>
      <nav aria-label="Primary navigation" className="hidden items-center gap-x-5 gap-y-2 text-sm font-medium lg:flex">
        <div className="nav-group">{learningLinks.map(([href, label]) => <Link key={href} href={href} onClick={() => requestPageGlint(href)} aria-current={pathname === href ? "page" : undefined} className={linkClass(href)}>{label}</Link>)}</div>
        <div className="nav-group nav-group-separated">{progressLinks.map(([href, label]) => <Link key={href} href={href} onClick={() => requestPageGlint(href)} aria-current={pathname === href ? "page" : undefined} className={linkClass(href)}>{label}</Link>)}</div>
        <div className="nav-group nav-group-separated">
          {!loading && (user ? <><Link href="/profile" onClick={() => requestPageGlint("/profile")} aria-current={pathname === "/profile" ? "page" : undefined} className={linkClass("/profile")}>Profile</Link><button type="button" onClick={() => { requestPageGlint(); void signOut().then(() => router.push("/")); }} className={linkClass("/sign-out")}>Sign out</button></> : <><Link href="/profile" onClick={() => requestPageGlint("/profile")} aria-current={pathname === "/profile" ? "page" : undefined} className={linkClass("/profile")}>Profile</Link><Link href="/login" onClick={() => requestPageGlint("/login")} className={linkClass("/login")}>Log in</Link><Link href="/sign-up" onClick={() => requestPageGlint("/sign-up")} className="rounded-md bg-emerald-600 px-3 py-2 text-white">Sign up</Link></>)}
          <ThemeSettings />
        </div>
      </nav>
      <div className="flex items-center gap-2 lg:hidden"><ThemeSettings /><button ref={menuButtonRef} type="button" aria-label="Open navigation menu" aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen(true)} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-slate-800"><span aria-hidden className="text-xl leading-none">☰</span></button></div>
    </div>
    {mobileOpen && <><button type="button" aria-label="Close navigation menu" className="fixed inset-0 z-40 bg-slate-950/45" onClick={() => setMobileOpen(false)} /><aside ref={menuRef} id="mobile-navigation" className="fixed inset-y-0 right-0 z-50 flex w-[min(86vw,22rem)] flex-col border-l border-slate-200 bg-white p-5 shadow-2xl" role="dialog" aria-modal="true" aria-label="Navigation menu"><div className="flex items-center justify-between gap-4"><p className="font-bold text-slate-950">Navigate Trapwise</p><button type="button" onClick={() => setMobileOpen(false)} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-slate-300 text-slate-700" aria-label="Close navigation menu">×</button></div><nav className="mt-6 grid gap-1" aria-label="Mobile primary navigation"><p className="px-3 pb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Practice</p>{learningLinks.map(([href, label]) => <Link key={href} href={href} onClick={() => navigateFromMenu(href)} aria-current={pathname === href ? "page" : undefined} className={mobileLinkClass(href)}>{label}</Link>)}<p className="mt-5 px-3 pb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Progress</p>{progressLinks.map(([href, label]) => <Link key={href} href={href} onClick={() => navigateFromMenu(href)} aria-current={pathname === href ? "page" : undefined} className={mobileLinkClass(href)}>{label}</Link>)}<p className="mt-5 px-3 pb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Account</p>{!loading && (user ? <><Link href="/profile" onClick={() => navigateFromMenu("/profile")} aria-current={pathname === "/profile" ? "page" : undefined} className={mobileLinkClass("/profile")}>Profile</Link><button type="button" onClick={() => { requestPageGlint(); setMobileOpen(false); void signOut().then(() => router.push("/")); }} className="flex min-h-11 items-center rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">Sign out</button></> : <><Link href="/profile" onClick={() => navigateFromMenu("/profile")} aria-current={pathname === "/profile" ? "page" : undefined} className={mobileLinkClass("/profile")}>Profile</Link><Link href="/login" onClick={() => navigateFromMenu("/login")} className={mobileLinkClass("/login")}>Log in</Link><Link href="/sign-up" onClick={() => navigateFromMenu("/sign-up")} className="mt-2 flex min-h-11 items-center justify-center rounded-md bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white">Sign up</Link></>)}</nav></aside></>}
  </header>;
}
