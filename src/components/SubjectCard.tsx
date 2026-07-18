import type { Subject } from "@/types/question";

type SubjectCardProps = {
  subject: Subject;
  description: string;
  skillCount: number;
};

export function SubjectCard({ subject, description, skillCount }: SubjectCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">
        {skillCount} starter skills
      </p>
      <h3 className="mt-3 text-xl font-semibold text-slate-950">{subject}</h3>
      <p className="mt-3 leading-7 text-slate-600">{description}</p>
    </article>
  );
}
