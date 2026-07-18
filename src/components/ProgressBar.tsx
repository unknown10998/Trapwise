type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const boundedTotal = Math.max(total, 1);
  const boundedCurrent = Math.min(Math.max(current, 0), boundedTotal);
  const percentage = Math.round((boundedCurrent / boundedTotal) * 100);

  return (
    <div aria-label={`Progress ${percentage}%`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} role="progressbar">
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
