import { useMemo, useState } from 'react';

import { DEFAULT_QUALITY, QUALITIES, normalizeTags } from '../../data/schema.js';
import { parseBulkText } from '../../lib/parseBulk.js';
import { useDatabase } from '../../state/DatabaseContext.jsx';
import { planBulk } from '../../state/bulk.js';
import { Button } from '../ui/Button.jsx';
import { SelectField, TextField } from '../ui/Fields.jsx';
import { Modal } from '../ui/Modal.jsx';
import { StoragePicker } from './StoragePicker.jsx';

const PLACEHOLDER = `Demir Cevheri x40
40x Ay Çiçeği
Mithril Külçesi ×18
Küçük Şifa İksiri, 24
Ejder Pulu Zırh (1)
Kadim Parşömen: 3
Boş Şişe`;

export function BulkAddModal({ open, onClose, onSubmit, defaultStorageId }) {
  const { db } = useDatabase();

  const [storageId, setStorageId] = useState(defaultStorageId ?? '');
  const [text, setText] = useState('');
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [tagsInput, setTagsInput] = useState('');
  const [merge, setMerge] = useState(true);

  const parsed = useMemo(() => parseBulkText(text, { merge: false }), [text]);
  const plan = useMemo(
    () => planBulk({ db, storageId, rows: parsed.rows, merge }),
    [db, storageId, parsed.rows, merge],
  );

  const totalQuantity = parsed.rows.reduce((sum, r) => sum + r.quantity, 0);
  const canSubmit = Boolean(storageId) && parsed.rows.length > 0;

  function handleSubmit() {
    onSubmit({
      storageId,
      plan,
      defaultQuality: quality,
      defaultTags: normalizeTags(tagsInput),
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Toplu ekleme"
      description="Satır satır yapıştır; isim ve adedi kendisi ayırır."
      footer={
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <span className="mr-auto text-xs text-ink-faint">
            {parsed.rows.length > 0
              ? `${parsed.rows.length} satır · ${totalQuantity.toLocaleString('tr-TR')} adet`
              : 'Henüz okunabilir satır yok'}
          </span>
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button variant="primary" disabled={!canSubmit} onClick={handleSubmit}>
            {plan.increments.length > 0
              ? `${plan.additions.length} ekle · ${plan.increments.length} birleştir`
              : `${plan.additions.length} eşya ekle`}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <StoragePicker
          value={storageId}
          onChange={setStorageId}
          label="Hangi depoya eklenecek?"
        />

        <div>
          <label
            htmlFor="bulk-text"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-dim"
          >
            Satırlar
          </label>
          <textarea
            id="bulk-text"
            data-autofocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            spellCheck={false}
            placeholder={PLACEHOLDER}
            className="w-full rounded-xl border border-line-strong/60 bg-panel-2 px-3 py-2.5 font-mono text-sm leading-relaxed text-ink placeholder:text-ink-faint focus:border-brand/70 focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-ink-faint leading-relaxed">
            Desteklenen yazımlar: <code className="text-ink-dim">Ad x40</code>,{' '}
            <code className="text-ink-dim">40x Ad</code>, <code className="text-ink-dim">Ad, 40</code>,{' '}
            <code className="text-ink-dim">Ad (40)</code>, <code className="text-ink-dim">Ad 40</code>.
            Adet yazmazsan 1 sayılır. Satır içinde{' '}
            <code className="text-ink-dim">#etiket</code> ve{' '}
            <code className="text-ink-dim">@mor</code> da kullanabilirsin.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Varsayılan kalite"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            hint="Satırda @mor yazmadıysan bu kullanılır."
          >
            {QUALITIES.map((q) => (
              <option key={q.id} value={q.id}>
                {q.label}
              </option>
            ))}
          </SelectField>

          <TextField
            label="Hepsine eklenecek etiketler"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="crafting"
            hint="İsteğe bağlı, virgülle ayır."
            autoComplete="off"
          />
        </div>

        <label className="flex items-start gap-2.5 text-sm text-ink-dim">
          <input
            type="checkbox"
            checked={merge}
            onChange={(e) => setMerge(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[color:var(--color-brand)]"
          />
          <span>
            Aynı isim varsa adetleri topla
            <span className="block text-xs text-ink-faint">
              Kapalıyken her satır ayrı bir kayıt olarak eklenir.
            </span>
          </span>
        </label>

        {parsed.rows.length > 0 || parsed.skipped.length > 0 ? (
          <Preview plan={plan} skipped={parsed.skipped} />
        ) : null}
      </div>
    </Modal>
  );
}

function Preview({ plan, skipped }) {
  return (
    <div className="rounded-xl border border-line overflow-hidden">
      <div className="border-b border-line bg-panel-2/60 px-3 py-2 text-xs font-medium uppercase tracking-wide text-ink-dim">
        Önizleme
      </div>

      <ul className="max-h-56 overflow-y-auto divide-y divide-[color:var(--color-line)] text-sm">
        {plan.additions.map((row) => (
          <li key={`add-${row.key}-${row.raw}`} className="flex items-center gap-2 px-3 py-2">
            <span className="text-ok" aria-hidden="true">
              +
            </span>
            <span className="min-w-0 flex-1 truncate">{row.name}</span>
            {row.tags.map((t) => (
              <span key={t} className="text-[11px] text-ink-faint">
                #{t}
              </span>
            ))}
            <span className="tabular-nums text-ink-dim">{row.quantity.toLocaleString('tr-TR')}</span>
          </li>
        ))}

        {plan.increments.map((inc) => (
          <li key={`inc-${inc.id}`} className="flex items-center gap-2 px-3 py-2 bg-brand/5">
            <span className="text-brand" aria-hidden="true">
              ↑
            </span>
            <span className="min-w-0 flex-1 truncate">
              {inc.name}
              <span className="ml-1.5 text-[11px] text-ink-faint">mevcut kayda eklenecek</span>
            </span>
            <span className="tabular-nums text-brand">
              +{inc.amount.toLocaleString('tr-TR')}
            </span>
          </li>
        ))}

        {skipped.map((s, i) => (
          <li
            key={`skip-${i}-${s.raw}`}
            className="flex items-center gap-2 px-3 py-2 text-ink-faint"
          >
            <span aria-hidden="true">–</span>
            <span className="min-w-0 flex-1 truncate line-through">{s.raw.trim()}</span>
            <span className="text-[11px]">{s.reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
