import { getQuality, getStorageType } from '../../data/schema.js';
import { formatRelative } from '../../lib/date.js';
import { useUi } from '../../state/UiContext.jsx';
import { IconButton } from '../ui/Button.jsx';
import { QualityBadge, StaleBadge, TagChip } from '../ui/Chips.jsx';
import { Highlight } from './Highlight.jsx';

/**
 * Aynı veriyi iki biçimde gösterir:
 *  - masaüstünde sütunlu tablo,
 *  - mobilde dokunmatik dostu kartlar.
 */
export function ItemList({ entries, onEdit, onDelete }) {
  return (
    <>
      <div className="hidden md:block panel overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-2.5 font-medium">Eşya</th>
              <th className="px-3 py-2.5 font-medium text-right">Adet</th>
              <th className="px-3 py-2.5 font-medium">Kalite</th>
              <th className="px-3 py-2.5 font-medium">Etiketler</th>
              <th className="px-3 py-2.5 font-medium">Konum</th>
              <th className="px-3 py-2.5 font-medium">Güncelleme</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <Row key={entry.item.id} entry={entry} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>

      <ul className="md:hidden space-y-2">
        {entries.map((entry) => (
          <Card key={entry.item.id} entry={entry} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </ul>
    </>
  );
}

function Row({ entry, onEdit, onDelete }) {
  const { item, storage, character, stale, range } = entry;
  const quality = getQuality(item.quality);
  const { openTag } = useUi();

  return (
    <tr className={`border-b border-line last:border-0 hover:bg-panel-2/50 ${stale ? 'opacity-55' : ''}`}>
      <td className="px-4 py-2.5">
        <span className={`font-medium ${quality.text}`}>
          <Highlight text={item.name} range={range} />
        </span>
        {item.note ? <div className="text-xs text-ink-faint">{item.note}</div> : null}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">{item.quantity.toLocaleString('tr-TR')}</td>
      <td className="px-3 py-2.5">
        <QualityBadge quality={item.quality} />
      </td>
      <td className="px-3 py-2.5">
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <TagChip key={tag} tag={tag} onClick={openTag} />
          ))}
        </div>
      </td>
      <td className="px-3 py-2.5 text-ink-dim">
        <div className="flex items-center gap-1.5">
          <span aria-hidden="true">{getStorageType(storage.type).icon}</span>
          <span>
            {character?.name ?? '?'} <span className="text-ink-faint">·</span> {storage.name}
          </span>
        </div>
      </td>
      <td className="px-3 py-2.5 text-ink-faint whitespace-nowrap">
        {stale ? <StaleBadge /> : formatRelative(storage.updatedAt)}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex justify-end gap-0.5">
          <IconButton label="Düzenle" onClick={() => onEdit(item)}>
            ✎
          </IconButton>
          <IconButton label="Sil" className="hover:text-danger" onClick={() => onDelete(item)}>
            ✕
          </IconButton>
        </div>
      </td>
    </tr>
  );
}

function Card({ entry, onEdit, onDelete }) {
  const { item, storage, character, stale, range } = entry;
  const quality = getQuality(item.quality);
  const { openTag } = useUi();

  return (
    <li className={`panel bg-panel-2/50 p-3 ${stale ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${quality.dot}`} aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className={`font-medium break-words ${quality.text}`}>
              <Highlight text={item.name} range={range} />
            </span>
            <span className="ml-auto shrink-0 tabular-nums font-semibold">
              {item.quantity.toLocaleString('tr-TR')}
            </span>
          </div>

          <p className="mt-0.5 text-xs text-ink-dim">
            <span aria-hidden="true">{getStorageType(storage.type).icon}</span>{' '}
            {character?.name ?? '?'} · {storage.name}
          </p>

          {item.note ? <p className="mt-1 text-xs text-ink-faint">{item.note}</p> : null}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {item.tags.map((tag) => (
              <TagChip key={tag} tag={tag} onClick={openTag} />
            ))}
            {stale ? <StaleBadge /> : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-0.5 self-start">
          <IconButton label="Düzenle" onClick={() => onEdit(item)}>
            ✎
          </IconButton>
          <IconButton label="Sil" className="hover:text-danger" onClick={() => onDelete(item)}>
            ✕
          </IconButton>
        </div>
      </div>
    </li>
  );
}
