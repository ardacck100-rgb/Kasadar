import { getQuality, getStorageType } from '../../data/schema.js';

/** Etiket rozeti. Tıklanabilir olduğunda o etiketteki her şeyi listeler. */
export function TagChip({ tag, onClick, active = false, count }) {
  const className = [
    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors',
    active
      ? 'border-brand/50 bg-brand/15 text-brand'
      : 'border-line-strong/60 bg-panel-2 text-ink-dim hover:text-ink hover:border-line-strong',
  ].join(' ');

  if (!onClick) {
    return (
      <span className={className}>
        #{tag}
        {count != null ? <span className="text-ink-faint">{count}</span> : null}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        onClick(tag);
      }}
      title={`"${tag}" etiketli her şeyi göster`}
    >
      #{tag}
      {count != null ? <span className="text-ink-faint">{count}</span> : null}
    </button>
  );
}

/** Kalite noktası + adı. Renk kodu tüm uygulamada aynı. */
export function QualityBadge({ quality, showLabel = true }) {
  const meta = getQuality(quality);
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${meta.text}`}>
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} aria-hidden="true" />
      {showLabel ? meta.label : null}
    </span>
  );
}

export function StorageTypeChip({ type }) {
  const meta = getStorageType(type);
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-line px-1.5 py-0.5 text-[11px] text-ink-faint">
      <span aria-hidden="true">{meta.icon}</span>
      {meta.label}
    </span>
  );
}

/** 30 günden eski depolar için uyarı rozeti. */
export function StaleBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 text-[11px] text-brand ${className}`}
      title="Bu depo 30 günden uzun süredir güncellenmedi, içeriği değişmiş olabilir."
    >
      ⏳ güncellenmeli
    </span>
  );
}
