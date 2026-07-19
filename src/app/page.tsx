import Link from "next/link";
import { MistakeTwinCard } from "@/components/MistakeTwinCard";
import { SubjectCard } from "@/components/SubjectCard";
import { DailyPracticeCard } from "@/components/DailyPracticeCard";
import { DemoControls } from "@/components/DemoControls";
import { HomeLearningStatus } from "@/components/HomeLearningStatus";

const steps = [
  ["Practice", "Start with a diagnostic or a short daily set."],
  ["Detect", "See the distractor pattern behind a missed answer."],
  ["Train", "Use a verified follow-up to practice the exact weakness."],
  ["Weaken", "Confirm the pattern in Trap Forge and track the change."],
];

export default function Home() {
  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:items-center lg:px-8 lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">Trapwise</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
              See the trap. Learn the pattern. Beat the test.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Most test-prep apps show students what they got wrong. Trapwise discovers why by building a Mistake Twin that learns the traps a student falls for, then trains them to defeat those patterns.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/diagnostic"
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Start Diagnostic
              </Link>
              <Link
                href="/results"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50"
              >
                View Sample Results
              </Link>
              <Link
                href="/progress#question-formats"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50"
              >
                Question Formats
              </Link>
            </div>
            <DemoControls />
          </div>
          <MistakeTwinCard
            summary="Your Mistake Twin tracks the traps you tend to fall for, then turns those patterns into focused practice."
            patterns={[
              "Solved for the discount amount instead of final price",
              "Chose a claim without enough text evidence",
              "Used the right equation but answered the wrong value",
            ]}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <div><p className="text-sm font-semibold uppercase tracking-normal text-indigo-700">Judge Quick Test</p><h2 className="mt-2 text-2xl font-bold text-slate-950">See the full Mistake Twin loop in 3–5 minutes.</h2><ol className="mt-4 grid gap-1 text-sm text-slate-700 sm:grid-cols-2"><li>1. Load the fictional demo profile</li><li>2. Take the short diagnostic</li><li>3. Reveal the Mistake Twin</li><li>4. Complete the targeted follow-up</li><li>5. Try Trap Forge</li><li>6. View your progress</li></ol></div>
          <Link href="/diagnostic?judgeDemo=1" className="inline-flex min-h-12 items-center justify-center rounded-md bg-indigo-700 px-5 py-3 font-semibold text-white">Start Judge Flow</Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <HomeLearningStatus />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <DailyPracticeCard />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:px-8"><p className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600"><strong className="text-slate-950">Free local mode:</strong> the diagnostic, Mistake Twin, verified local follow-up, Trap Forge, Daily Practice, and demo progress work without an account, Supabase, or an API key. Optional AI Enhanced feedback is always learner-triggered; verified local answers remain the source of truth.</p></section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          <SubjectCard
            subject="Math"
            skillCount={3}
            description="Practice linear equations, percents, expression evaluation, and the reasoning traps that make simple questions feel slippery."
          />
          <SubjectCard
            subject="Reading and Writing"
            skillCount={2}
            description="Build sharper evidence habits for transitions, central ideas, vocabulary in context, and answer choices that sound right too quickly."
          />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">How it works</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">Practice the pattern, not just the question.</h2>
          </div>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([title, detail], index) => (
              <li key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="mt-4 text-lg font-semibold text-slate-950">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="max-w-3xl text-sm leading-6 text-slate-500">
          Trapwise is an independent SAT-style educational project. It is not affiliated with or endorsed by the College Board.
          All demo questions are original and should not be copied from official SAT exams or paid preparation materials.
        </p>
      </section>
    </main>
  );
}
