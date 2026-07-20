import Image from "next/image";
import Link from "next/link";
import trapwiseLogo from "../../logo.png";

export function BrandFooter() {
  return <footer className="mt-16 border-t border-slate-200 px-4 py-8 sm:px-6 lg:px-8">
    <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Link href="/" className="brand-mark flex items-center gap-2 text-lg font-semibold" aria-label="Trapwise home">
        <span className="relative h-8 w-6 shrink-0 overflow-hidden rounded-md" aria-hidden><Image src={trapwiseLogo} alt="" className="brand-logo-image absolute left-0 top-1/2 h-12 w-auto max-w-none -translate-y-1/2 object-left" /></span>
        <span>Trapwise</span>
      </Link>
      <p className="max-w-xl text-sm leading-6 text-slate-600">See the trap. Learn the pattern. Beat the test.</p>
    </div>
  </footer>;
}
