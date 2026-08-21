import { useMemo } from 'react';

import { getStorageType } from '../../data/schema.js';
import { useDatabase } from '../../state/DatabaseContext.jsx';
import { storageOptionGroups } from '../../state/selectors.js';
import { SelectField } from '../ui/Fields.jsx';

/** Karaktere göre gruplanmış depo seçimi. */
export function StoragePicker({ value, onChange, label = 'Depo', hint }) {
  const { db } = useDatabase();
  const groups = useMemo(() => storageOptionGroups(db), [db]);

  return (
    <SelectField
      label={label}
      hint={hint}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
        Depo seç…
      </option>
      {groups.map(({ character, storages }) =>
        storages.length === 0 ? null : (
          <optgroup key={character.id} label={character.name}>
            {storages.map((s) => (
              <option key={s.id} value={s.id}>
                {getStorageType(s.type).icon} {s.name}
              </option>
            ))}
          </optgroup>
        ),
      )}
    </SelectField>
  );
}

/** Uygulamada hiç depo yoksa formlar yerine bu uyarı gösterilir. */
export function NoStorageNotice({ onGoToCharacters }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong/60 p-4 text-sm text-ink-dim">
      Eşya eklemek için önce bir karakter ve o karaktere ait bir depo (çanta, kasa sekmesi,
      posta) tanımlaman gerekiyor.
      <button
        type="button"
        onClick={onGoToCharacters}
        className="mt-2 block text-brand underline underline-offset-2"
      >
        Karakterler ekranına git
      </button>
    </div>
  );
}
