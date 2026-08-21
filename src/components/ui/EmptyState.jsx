export function EmptyState({ icon = '📦', title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center text-center gap-3 px-6 py-12 rounded-2xl border border-dashed border-line-strong/50 ${className}`}
    >
      <div className="text-3xl opacity-70" aria-hidden="true">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-ink">{title}</h3>
        {description ? (
          <p className="text-sm text-ink-dim max-w-sm leading-relaxed">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
