import Link from "next/link";

export function DashboardAction({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link className="dashboard-action" href={href}>
      <strong>{title}</strong>
      <span>{description}</span>
    </Link>
  );
}
