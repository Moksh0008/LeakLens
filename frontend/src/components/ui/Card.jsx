// Card.jsx — the base panel used by every dashboard section.
// Subtle border, moderate radius, restrained shadow, optional hover lift.
// semantic <section> by default; pass `as="div"` where a section is wrong.

export default function Card({
  as: Tag = "section",
  hover = false,
  className = "",
  children,
  ...props
}) {
  return (
    <Tag
      className={`rounded-card border border-border bg-surface shadow-[var(--shadow-card)] ${
        hover ? "transition-colors duration-150 hover:border-border-strong" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

/** Standard card header: title + optional subtitle on the left, action on the right. */
export function CardHeader({ title, subtitle, action, className = "" }) {
  return (
    <header
      className={`flex items-start justify-between gap-3 border-b border-border px-5 pb-3 pt-4 ${className}`}
    >
      <div className="min-w-0">
        <h2 className="text-section font-semibold text-text-primary">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-small text-text-muted">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
