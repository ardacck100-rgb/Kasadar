import { EmptyState } from '../ui/EmptyState.jsx';

/** Henüz yazılmamış bölümler için dürüst yer tutucu. */
export function ComingSoon({ icon, title, part, description, bullets = [] }) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={
        <div className="w-full max-w-sm space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs text-brand">
            {part}
          </span>
          {bullets.length ? (
            <ul className="text-left text-sm text-ink-dim space-y-1.5">
              {bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="text-ink-faint">–</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      }
    />
  );
}
