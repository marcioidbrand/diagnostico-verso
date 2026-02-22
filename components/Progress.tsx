type ProgressProps = {
  current: number;
  total: number;
};

export function Progress({ current, total }: ProgressProps) {
  const normalized = Math.max(1, Math.min(current, total));
  const percentage = (normalized / total) * 100;

  return (
    <div>
      <div className="progress-row">
        <span>Progresso</span>
        <strong>{normalized}/{total}</strong>
      </div>
      <div className="progress-track" aria-hidden>
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
