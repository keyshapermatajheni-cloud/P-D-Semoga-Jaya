import { AppShell, type UserRole } from "./app-shell";

export function RoutePage({
  role,
  title,
  subtitle,
  activeHref,
  columns,
  rows,
  emptyMessage,
}: {
  role: UserRole;
  title: string;
  subtitle: string;
  activeHref: string;
  columns: string[];
  rows: string[][];
  emptyMessage: string;
}) {
  const gridTemplateColumns = columns.map(() =>
    `minmax(${Math.max(110, Math.floor(760 / columns.length))}px, 1fr)`,
  ).join(" ");

  return (
    <AppShell role={role} title={title} subtitle={subtitle} activeHref={activeHref}>
      <section className="route-page-card" aria-label={title}>
        <div
          className="route-table"
          role="table"
        >
          <div
            className="route-table-row route-table-header"
            style={{ gridTemplateColumns }}
            role="row"
          >
            {columns.map((column) => (
              <span role="columnheader" key={column}>{column}</span>
            ))}
          </div>
          {rows.map((row, rowIndex) => (
            <div
              className="route-table-row"
              style={{ gridTemplateColumns }}
              role="row"
              key={rowIndex}
            >
              {row.map((cell, cellIndex) => (
                <span role="cell" key={cellIndex}>{cell}</span>
              ))}
            </div>
          ))}
        </div>
        {rows.length === 0 && <p className="route-empty">{emptyMessage}</p>}
      </section>
    </AppShell>
  );
}
