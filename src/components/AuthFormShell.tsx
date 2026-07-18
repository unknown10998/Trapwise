import Link from "next/link";

export function AuthFormShell({ title, children }: { title: string; children: React.ReactNode }) {
  return <main className="mx-auto max-w-md px-4 py-12"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase text-emerald-700">Trapwise account</p><h1 className="mt-2 text-3xl font-bold text-slate-950">{title}</h1>{children}</section><p className="mt-5 text-center text-sm text-slate-600"><Link href="/" className="font-semibold text-emerald-700 hover:underline">Continue studying without an account</Link></p></main>;
}
