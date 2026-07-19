import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">Trapwise</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-950">That page is not here.</h1>
      <p className="mt-3 max-w-xl leading-7 text-slate-600">Return to the home page to start a guest diagnostic, continue Daily Practice, or load the fictional judge demo.</p>
      <Link href="/" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white">Return home</Link>
    </main>
  );
}
