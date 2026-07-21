import { GuestAccessLink } from "@/components/GuestAccessLink";

export default function PracticePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">Practice</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">Practice shell</h1>
      <p className="mt-4 leading-7 text-slate-600">
        Focused practice against Mistake Twin patterns is planned for a later version. For now,
        use the diagnostic shell to test the first sample question and local answer selection.
      </p>
      <GuestAccessLink
        href="/diagnostic"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
      >
        Start Diagnostic
      </GuestAccessLink>
    </main>
  );
}
