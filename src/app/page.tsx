import Link from "next/link";
import { MistakeTwinCard } from "@/components/MistakeTwinCard";
import { SubjectCard } from "@/components/SubjectCard";
import { DailyPracticeCard } from "@/components/DailyPracticeCard";
import { DemoControls } from "@/components/DemoControls";

const steps = [
  "Answer a diagnostic question",
  "Discover the trap behind your mistake",
  "Practice against your Mistake Twin",
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
              Trapwise is an adaptive SAT-style practice app that helps students understand why
              they miss questions, recognize recurring mistake patterns, and practice with more
              intention.
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
            </div>
            <div className="mt-4"><DemoControls /></div>
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

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <DailyPracticeCard />
      </section>

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
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="mt-4 text-lg font-semibold text-slate-950">{step}</p>
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
