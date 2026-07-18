type MistakeTwinCardProps = {
  title?: string;
  summary: string;
  patterns: string[];
};

export function MistakeTwinCard({ title = "Mistake Twin preview", summary, patterns }: MistakeTwinCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-normal text-emerald-300">{title}</p>
      <p className="mt-4 text-lg leading-8 text-slate-100">{summary}</p>
      <ul className="mt-5 grid gap-3">
        {patterns.map((pattern) => (
          <li key={pattern} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
            {pattern}
          </li>
        ))}
      </ul>
    </article>
  );
}
