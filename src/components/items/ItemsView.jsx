import { useMemo, useState } from 'react';

import { STALE_AFTER_DAYS } from '../../data/schema.js';
import { isStale } from '../../lib/date.js';
import { commitBulk } from '../../state/bulk.js';
import { useDatabase } from '../../state/DatabaseContext.jsx';
import { useUi } from '../../state/UiContext.jsx';
import { buildIndex } from '../../state/selectors.js';
import { filterEntries, hasActiveFilters } from '../../search/searchItems.js';
import { FilterBar } from '../filters/FilterBar.jsx';
import { Button } from '../ui/Button.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { SelectField } from '../ui/Fields.jsx';
import { StaleNotice } from '../ui/StaleNotice.jsx';
import { BulkAddModal } from './BulkAddModal.jsx';
import { ItemFormModal } from './ItemFormModal.jsx';
import { ItemList } from './ItemList.jsx';
import { NoStorageNotice } from './StoragePicker.jsx';

const SORTS = {
  name: { label: 'Ada göre (A→Z)', compare: (a, b) => a.item.name.localeCompare(b.item.name, 'tr') },
  quantity: { label: 'Adede göre (çok→az)', compare: (a, b) => b.item.quantity - a.item.quantity },
  updated: {
    label: 'Güncellemeye göre (yeni→eski)',
    compare: (a, b) => (b.storage.updatedAt > a.storage.updatedAt ? 1 : -1),
  },
  place: {
    label: 'Konuma göre',
    compare: (a, b) =>
      (a.character?.name ?? '').localeCompare(b.character?.name ?? '', 'tr') ||
      a.storage.name.localeCompare(b.storage.name, 'tr') ||
      a.item.name.localeCompare(b.item.name, 'tr'),
  },
};

const CLOSED = { kind: null };

export function ItemsView() {
  const { db, actions } = useDatabase();
  const { filters, setView, clearFilters } = useUi();
  const [sort, setSort] = useState('name');
  const [dialog, setDialog] = useState(CLOSED);

  const index = useMemo(() => buildIndex(db), [db]);
  const entries = useMemo(() => {
    const list = filterEntries(db, index, filters);
    return list.sort(SORTS[sort].compare);
  }, [db, index, filters, sort]);

  const totalQuantity = entries.reduce((sum, e) => sum + e.item.quantity, 0);
  const close = () => setDialog(CLOSED);
  const noStorages = db.storages.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-semibold tracking-tight">Envanter</h1>
        <span className="text-sm text-ink-faint">
          {entries.length} kayıt · {totalQuantity.toLocaleString('tr-TR')} adet
        </span>

        <div className="ml-auto flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={noStorages}
            onClick={() => setDialog({ kind: 'bulk' })}
          >
            ⇥ Toplu ekle
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={noStorages}
            onClick={() => setDialog({ kind: 'item-new' })}
          >
            + Eşya ekle
          </Button>
        </div>
      </div>

      {noStorages ? <NoStorageNotice onGoToCharacters={() => setView('characters')} /> : null}

      <StaleNotice />
      <FilterBar />

      {entries.length > 0 ? (
        <div className="flex justify-end">
          <div className="w-full sm:w-64">
            <SelectField
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sıralama"
            >
              {Object.entries(SORTS).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.label}
                </option>
              ))}
            </SelectField>
          </div>
        </div>
      ) : null}

      {entries.length === 0 ? (
        <EmptyState
          icon="📦"
          title={
            hasActiveFilters(filters)
              ? 'Bu filtrelerle eşleşen eşya yok'
              : db.items.length === 0
                ? 'Envanter boş'
                : 'Gösterilecek eşya yok'
          }
          description={
            hasActiveFilters(filters)
              ? 'Filtreleri gevşetmeyi dene.'
              : 'Eşyaları tek tek ekleyebilir ya da oyundan kopyaladığın listeyi toplu olarak yapıştırabilirsin.'
          }
          action={
            hasActiveFilters(filters) ? (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Filtreleri temizle
              </Button>
            ) : noStorages ? null : (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="primary" size="sm" onClick={() => setDialog({ kind: 'item-new' })}>
                  Eşya ekle
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setDialog({ kind: 'bulk' })}>
                  Toplu yapıştır
                </Button>
              </div>
            )
          }
        />
      ) : (
        <ItemList
          entries={entries}
          onEdit={(item) => setDialog({ kind: 'item-edit', item })}
          onDelete={(item) => setDialog({ kind: 'item-delete', item })}
        />
      )}

      {/* ------------------------------ Diyaloglar ------------------------------ */}

      <ItemFormModal
        key={dialog.kind === 'item-edit' ? `item-${dialog.item.id}` : 'item-new'}
        open={dialog.kind === 'item-new' || dialog.kind === 'item-edit'}
        item={dialog.kind === 'item-edit' ? dialog.item : null}
        defaultStorageId={defaultStorageId(db, filters)}
        onClose={close}
        onSubmit={(data) => {
          if (dialog.kind === 'item-edit') actions.updateItem(dialog.item.id, data);
          else actions.addItem(data);
        }}
      />

      <BulkAddModal
        key={dialog.kind === 'bulk' ? 'bulk-open' : 'bulk-closed'}
        open={dialog.kind === 'bulk'}
        defaultStorageId={defaultStorageId(db, filters)}
        onClose={close}
        onSubmit={({ storageId, plan, defaultQuality, defaultTags }) =>
          commitBulk({ actions, storageId, plan, defaultQuality, defaultTags })
        }
      />

      <ConfirmDialog
        open={dialog.kind === 'item-delete'}
        onClose={close}
        title="Eşyayı sil"
        confirmLabel="Sil"
        description={
          dialog.kind === 'item-delete'
            ? `"${dialog.item.name}" kaydı silinecek. Bu işlem geri alınamaz.`
            : undefined
        }
        onConfirm={() => actions.removeItem(dialog.item.id)}
      />
    </div>
  );
}

/** Karakter filtresi açıksa o karakterin ilk deposunu, yoksa en son güncellenen depoyu öner. */
function defaultStorageId(db, filters) {
  const candidates = filters.characterIds.length
    ? db.storages.filter((s) => filters.characterIds.includes(s.characterId))
    : db.storages;

  if (candidates.length === 0) return '';

  const fresh = candidates.filter((s) => !isStale(s.updatedAt, STALE_AFTER_DAYS));
  const pool = fresh.length > 0 ? fresh : candidates;
  return pool.reduce((best, s) => (s.updatedAt > best.updatedAt ? s : best), pool[0]).id;
}
