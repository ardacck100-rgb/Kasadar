import { useEffect, useMemo, useState } from 'react';

import { useDatabase } from '../../state/DatabaseContext.jsx';
import { useUi } from '../../state/UiContext.jsx';
import { buildIndex } from '../../state/selectors.js';
import { hasActiveFilters, searchItems } from '../../search/searchItems.js';
import { FilterBar } from '../filters/FilterBar.jsx';
import { Button } from '../ui/Button.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { StaleNotice } from '../ui/StaleNotice.jsx';
import { ItemFormModal } from '../items/ItemFormModal.jsx';
import { ResultGroup } from './ResultGroup.jsx';

const CLOSED = { kind: null };

export function SearchView() {
  const { db, actions } = useDatabase();
  const { query, setQuery, filters, clearFilters, searchInputRef, setView } = useUi();
  const [dialog, setDialog] = useState(CLOSED);

  const index = useMemo(() => buildIndex(db), [db]);
  const { groups, totals } = useMemo(
    () => searchItems(db, index, query, filters),
    [db, index, query, filters],
  );

  // Uygulama açılır açılmaz imleç arama kutusunda olsun.
  useEffect(() => {
    searchInputRef.current?.focus();
  }, [searchInputRef]);

  const filtering = hasActiveFilters(filters);
  const close = () => setDialog(CLOSED);

  return (
    <div className="space-y-4">
      <SearchBox
        value={query}
        onChange={setQuery}
        inputRef={searchInputRef}
        resultText={
          query.trim() || filtering
            ? `${totals.groups} eşya · ${totals.rows} konum · ${totals.quantity.toLocaleString('tr-TR')} adet`
            : `${db.items.length} kayıt taranıyor`
        }
      />

      <StaleNotice />
      <FilterBar />

      {db.items.length === 0 ? (
        <EmptyState
          icon="🗝️"
          title="Aranacak eşya yok"
          description="Önce karakterlerinin depolarına eşya gir; sonra buradan yazım hatası yapsan bile bulabilirsin."
          action={
            <Button variant="primary" size="sm" onClick={() => setView('items')}>
              Eşya eklemeye başla
            </Button>
          }
        />
      ) : groups.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={`"${query.trim()}" bulunamadı`}
          description="Yazım hatalarını tolere ediyor ama olmayan bir şeyi bulamaz. Filtreler sonucu daraltıyor olabilir."
          action={
            filtering ? (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Filtreleri temizle
              </Button>
            ) : null
          }
        />
      ) : (
        <ul className="space-y-3">
          {groups.map((group) => (
            <ResultGroup
              key={group.key}
              group={group}
              onEdit={(item) => setDialog({ kind: 'item-edit', item })}
              onDelete={(item) => setDialog({ kind: 'item-delete', item })}
            />
          ))}
        </ul>
      )}

      <ItemFormModal
        key={dialog.kind === 'item-edit' ? `item-${dialog.item.id}` : 'item-none'}
        open={dialog.kind === 'item-edit'}
        item={dialog.kind === 'item-edit' ? dialog.item : null}
        onClose={close}
        onSubmit={(data) => actions.updateItem(dialog.item.id, data)}
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

/** Ekranın en önemli öğesi: büyük, her zaman görünür, açılışta odaklanmış. */
function SearchBox({ value, onChange, inputRef, resultText }) {
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <span
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-ink-faint"
          aria-hidden="true"
        >
          🔍
        </span>

        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && value) {
              e.preventDefault();
              onChange('');
            }
          }}
          placeholder="Ne arıyorsun?"
          aria-label="Eşya ara"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="h-14 w-full rounded-2xl border border-line-strong/70 bg-panel pl-12 pr-24 text-lg text-ink placeholder:text-ink-faint shadow-lg shadow-black/20 transition-colors focus:border-brand/70 focus:outline-none sm:h-16 sm:text-xl"
        />

        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-faint hover:bg-panel-2 hover:text-ink"
            aria-label="Aramayı temizle"
          >
            ✕
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-line px-1.5 py-0.5 text-[11px] text-ink-faint sm:block">
            /
          </kbd>
        )}
      </div>

      <p className="px-1 text-xs text-ink-faint">{resultText}</p>
    </div>
  );
}
