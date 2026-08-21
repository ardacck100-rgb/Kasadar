import { getStorageType } from '../../data/schema.js';
import { formatRelative } from '../../lib/date.js';
import { storageStats } from '../../state/selectors.js';
import { useDatabase } from '../../state/DatabaseContext.jsx';
import { Button, IconButton } from '../ui/Button.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';

export function StorageList({ storages, onAdd, onEdit, onDelete }) {
  const { db, actions } = useDatabase();

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-dim">
          Depolar
          <span className="ml-2 text-ink-faint font-normal normal-case tracking-normal">
            {storages.length}
          </span>
        </h3>
        <Button size="sm" variant="secondary" className="ml-auto" onClick={onAdd}>
          + Depo ekle
        </Button>
      </div>

      {storages.length === 0 ? (
        <EmptyState
          icon="🏦"
          title="Bu karakterin henüz deposu yok"
          description="Çanta, kasa sekmeleri ve posta kutusunu ayrı depolar olarak ekle. Eşyaları Kısım 2'de bu depolara koyacağız."
          action={
            <Button variant="primary" size="sm" onClick={onAdd}>
              İlk depoyu ekle
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {storages.map((storage) => {
            const type = getStorageType(storage.type);
            const stats = storageStats(db, storage.id);

            return (
              <li
                key={storage.id}
                className="panel bg-panel-2/60 p-3 sm:p-4 flex items-start gap-3 transition-colors hover:border-line-strong/70"
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-panel-3 border border-line text-lg"
                  aria-hidden="true"
                >
                  {type.icon}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium break-words">{storage.name}</span>
                    <span className="rounded-md border border-line px-1.5 py-0.5 text-[11px] text-ink-faint">
                      {type.label}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-ink-faint">
                    {stats.rows} kayıt · {stats.quantity.toLocaleString('tr-TR')} adet ·{' '}
                    <span title={storage.updatedAt}>güncelleme {formatRelative(storage.updatedAt)}</span>
                  </p>

                  {storage.note ? (
                    <p className="mt-1.5 text-xs text-ink-dim leading-relaxed">{storage.note}</p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-0.5">
                  <IconButton
                    label="Güncel olarak işaretle"
                    onClick={() => actions.touchStorage(storage.id)}
                  >
                    ↻
                  </IconButton>
                  <IconButton label="Depoyu düzenle" onClick={() => onEdit(storage)}>
                    ✎
                  </IconButton>
                  <IconButton
                    label="Depoyu sil"
                    className="hover:text-danger"
                    onClick={() => onDelete(storage)}
                  >
                    ✕
                  </IconButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
