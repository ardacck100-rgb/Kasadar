import { getQuality, getStorageType } from '../../data/schema.js';
import { formatRelative } from '../../lib/date.js';
import { useUi } from '../../state/UiContext.jsx';
import { IconButton } from '../ui/Button.jsx';
import { QualityBadge, StaleBadge, TagChip } from '../ui/Chips.jsx';
import { Highlight } from '../items/Highlight.jsx';

/**
 * Bir eşya adı = bir grup. Başlıkta "kaç adet, kaç yerde" özeti,
 * altında o eşyanın bulunduğu her konum ayrı satır olarak listelenir.
 */
export function ResultGroup({ group, onEdit, onDelete }) {
  const { openTag } = useUi();
  const quality = getQuality(group.entries[0]?.item.quality);
  const multiple = group.locationCount > 1;

  return (
    <li className="panel overflow-hidden">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line bg-panel-2/50 px-4 py-3">
        <h3 className={`text-base font-semibold ${quality.text}`}>
          <Highlight text={group.name} range={group.entries[0]?.range} />
        </h3>

        <p
          className={
            multiple
              ? 'text-sm font-medium text-brand'
              : 'text-sm text-ink-dim'
          }
        >
          {multiple ? 'Toplam: ' : ''}
          <span className="tabular-nums">{group.totalQuantity.toLocaleString('tr-TR')}</span> adet,{' '}
          <span className="tabular-nums">{group.locationCount}</span> yerde
          {multiple && group.characterCount > 1 ? ` (${group.characterCount} karakter)` : ''}
        </p>

        {group.anyStale ? <StaleBadge className="ml-auto" /> : null}
      </header>

      <ul className="divide-y divide-[color:var(--color-line)]">
        {group.entries.map((entry) => (
          <Entry key={entry.item.id} entry={entry} onEdit={onEdit} onDelete={onDelete} onTag={openTag} />
        ))}
      </ul>
    </li>
  );
}

function Entry({ entry, onEdit, onDelete, onTag }) {
  const { item, storage, character, stale } = entry;
  const type = getStorageType(storage.type);

  return (
    <li
      className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-2.5 hover:bg-panel-2/40 ${
        stale ? 'opacity-55' : ''
      }`}
    >
      <span className="text-lg leading-none" aria-hidden="true">
        {type.icon}
      </span>

      <div className="min-w-0 flex-1">
        <div className="text-sm">
          <span className="font-medium">{character?.name ?? '?'}</span>
          <span className="text-ink-faint"> · </span>
          <span className="text-ink-dim">{storage.name}</span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-faint">
          <span>{type.label}</span>
          <span aria-hidden="true">·</span>
          <span title={storage.updatedAt}>güncelleme {formatRelative(storage.updatedAt)}</span>
          <QualityBadge quality={item.quality} />
          {item.tags.map((tag) => (
            <TagChip key={tag} tag={tag} onClick={onTag} />
          ))}
        </div>
        {item.note ? <p className="mt-1 text-xs text-ink-faint">{item.note}</p> : null}
      </div>

      <span className="ml-auto shrink-0 text-base font-semibold tabular-nums">
        {item.quantity.toLocaleString('tr-TR')}
      </span>

      <div className="flex shrink-0 gap-0.5">
        <IconButton label="Düzenle" onClick={() => onEdit(item)}>
          ✎
        </IconButton>
        <IconButton label="Sil" className="hover:text-danger" onClick={() => onDelete(item)}>
          ✕
        </IconButton>
      </div>
    </li>
  );
}
