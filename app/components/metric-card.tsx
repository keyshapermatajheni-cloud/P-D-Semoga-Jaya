export function MetricCard({
  label,
  value,
  note,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  note: string;
  tone?: "neutral" | "positive" | "warning";
}) {
  return (
    <article className="metric-card">
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <span className={`metric-note ${tone}`}>{note}</span>
    </article>
  );
}
