import { useMemo, useState } from 'react';

import { QUALITIES, STORAGE_TYPES } from '../../data/schema.js';
import { hasActiveFilters } from '../../search/searchItems.js';
import { useDatabase } from '../../state/DatabaseContext.jsx';
import { useUi } from '../../state/UiContext.jsx';
import { allTags, sortCharacters } from '../../state/selectors.js';

/**
 * Karakter / depo tipi / kalite / etiket filtreleri.
 * Aynı kategoride birden çok seçim "veya", kategoriler arası "ve" demektir.
 */
export function FilterBar() {
  const { db } = useDatabase();
  const { filters, toggleFilter, clearFilters } = useUi();
  const [open, setOpen] = useState(false);

  const characters = useMemo(() => sortCharacters(db.characters), [db.characters]);
  const tags = useMemo(() => allTags(db), [db]);

  const activeCount =
    filters.characterIds.length +
    filters.storageTypes.length +
    filters.qualities.length +
    filters.tags.length;

  const active = hasActiveFilters(filters);

  return (
    <section className="panel bg-panel/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-ink-dim hover:text-ink"
      >
        <span aria-hidden="true">⚙</span>
        Filtreler
        {activeCount > 0 ? (
          <span className="rounded-full bg-brand/20 px-2 py-0.5 text-[11px] text-brand">
            {activeCount}
          </span>
        ) : null}
        <span className={`ml-auto text-xs transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>

      {active && !open ? (
        <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3">
          <ActiveSummary />
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-ink-faint underline underline-offset-2 hover:text-ink"
          >
            temizle
          </button>
        </div>
      ) : null}

      {open ? (
        <div className="space-y-4 border-t border-line px-4 py-4">
          <ChipRow
            label="Karakter"
            empty="Önce karakter ekle."
            options={characters.map((c) => ({ value: c.id, label: c.name }))}
            selected={filters.characterIds}
            onToggle={(v) => toggleFilter('characterIds', v)}
          />

          <ChipRow
            label="Depo tipi"
            options={STORAGE_TYPES.map((t) => ({ value: t.id, label: `${t.icon} ${t.label}` }))}
            selected={filters.storageTypes}
            onToggle={(v) => toggleFilter('storageTypes', v)}
          />

          <ChipRow
            label="Kalite"
            options={QUALITIES.map((q) => ({ value: q.id, label: q.label, dot: q.dot }))}
            selected={filters.qualities}
            onToggle={(v) => toggleFilter('qualities', v)}
          />

          <ChipRow
            label="Etiket"
            empty="Eşyalara etiket ekleyince burada listelenir."
            options={tags.map((t) => ({ value: t.tag, label: `#${t.tag}`, count: t.count }))}
            selected={filters.tags}
            onToggle={(v) => toggleFilter('tags', v)}
          />

          {active ? (
            <div className="pt-1">
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-ink-faint underline underline-offset-2 hover:text-ink"
              >
                Tüm filtreleri temizle
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function ActiveSummary() {
  const { db } = useDatabase();
  const { filters, toggleFilter } = useUi();

  const parts = [
    ...filters.characterIds.map((id) => ({
      kind: 'characterIds',
      value: id,
      label: db.characters.find((c) => c.id === id)?.name ?? '?',
    })),
    ...filters.storageTypes.map((t) => ({
      kind: 'storageTypes',
      value: t,
      label: STORAGE_TYPES.find((s) => s.id === t)?.label ?? t,
    })),
    ...filters.qualities.map((q) => ({
      kind: 'qualities',
      value: q,
      label: QUALITIES.find((x) => x.id === q)?.label ?? q,
    })),
    ...filters.tags.map((t) => ({ kind: 'tags', value: t, label: `#${t}` })),
  ];

  return parts.map((p) => (
    <button
      key={`${p.kind}-${p.value}`}
      type="button"
      onClick={() => toggleFilter(p.kind, p.value)}
      className="inline-flex items-center gap-1 rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 text-xs text-brand hover:bg-brand/20"
      title="Bu filtreyi kaldır"
    >
      {p.label}
      <span aria-hidden="true">✕</span>
    </button>
  ));
}

function ChipRow({ label, options, selected, onToggle, empty }) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
        {label}
      </div>
      {options.length === 0 ? (
        <p className="text-xs text-ink-faint">{empty ?? '—'}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {options.map((o) => {
            const on = selected.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={on}
                onClick={() => onToggle(o.value)}
                className={[
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors',
                  on
                    ? 'border-brand/50 bg-brand/15 text-brand'
                    : 'border-line-strong/60 bg-panel-2 text-ink-dim hover:text-ink hover:border-line-strong',
                ].join(' ')}
              >
                {o.dot ? <span className={`h-2 w-2 rounded-full ${o.dot}`} aria-hidden="true" /> : null}
                {o.label}
                {o.count != null ? <span className="text-ink-faint">{o.count}</span> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
