import { STALE_AFTER_DAYS } from '../../data/schema.js';
import { isStale } from '../../lib/date.js';
import { useDatabase } from '../../state/DatabaseContext.jsx';
import { useUi } from '../../state/UiContext.jsx';

/**
 * 30 günden eski depolar için tek satırlık uyarı.
 * Eski depoların içeriği oyunda çoktan değişmiş olabilir; listede soluk gösterilir.
 */
export function StaleNotice() {
  const { db } = useDatabase();
  const { setView } = useUi();

  const staleStorages = db.storages.filter((s) => isStale(s.updatedAt, STALE_AFTER_DAYS));
  if (staleStorages.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-brand/25 bg-brand/8 px-3 py-2 text-xs text-brand">
      <span aria-hidden="true">⏳</span>
      <span>
        <strong className="font-semibold">{staleStorages.length} depo</strong> {STALE_AFTER_DAYS}{' '}
        günden uzun süredir güncellenmedi. İçerikleri artık doğru olmayabilir.
      </span>
      <button
        type="button"
        onClick={() => setView('characters')}
        className="underline underline-offset-2 hover:text-ink"
      >
        depoları gözden geçir
      </button>
    </div>
  );
}
