import { useState } from 'react';

import { DEFAULT_QUALITY, QUALITIES, normalizeTags } from '../../data/schema.js';
import { useDatabase } from '../../state/DatabaseContext.jsx';
import { allTags } from '../../state/selectors.js';
import { Button } from '../ui/Button.jsx';
import { SelectField, TextAreaField, TextField } from '../ui/Fields.jsx';
import { Modal } from '../ui/Modal.jsx';
import { StoragePicker } from './StoragePicker.jsx';

export function ItemFormModal({ open, onClose, onSubmit, item, defaultStorageId }) {
  const { db } = useDatabase();
  const editing = Boolean(item);

  const [storageId, setStorageId] = useState(item?.storageId ?? defaultStorageId ?? '');
  const [name, setName] = useState(item?.name ?? '');
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 1));
  const [quality, setQuality] = useState(item?.quality ?? DEFAULT_QUALITY);
  const [tags, setTags] = useState((item?.tags ?? []).join(', '));
  const [note, setNote] = useState(item?.note ?? '');
  const [errors, setErrors] = useState({});

  const knownTags = allTags(db);

  function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = 'Eşya adı gerekli.';
    if (!storageId) nextErrors.storageId = 'Depo seçmelisin.';
    const qty = Number.parseInt(quantity, 10);
    if (!Number.isFinite(qty) || qty < 0) nextErrors.quantity = 'Adet 0 veya daha büyük olmalı.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      storageId,
      name: name.trim(),
      quantity: qty,
      quality,
      tags: normalizeTags(tags),
      note: note.trim(),
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Eşyayı düzenle' : 'Eşya ekle'}
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button variant="primary" form="item-form" type="submit">
            {editing ? 'Kaydet' : 'Ekle'}
          </Button>
        </div>
      }
    >
      <form id="item-form" onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Eşya adı"
          data-autofocus
          value={name}
          error={errors.name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Demir Cevheri"
          autoComplete="off"
          list="kasadar-item-names"
        />
        <datalist id="kasadar-item-names">
          {[...new Set(db.items.map((it) => it.name))].slice(0, 200).map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Adet"
            type="number"
            inputMode="numeric"
            min="0"
            value={quantity}
            error={errors.quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <SelectField label="Kalite" value={quality} onChange={(e) => setQuality(e.target.value)}>
            {QUALITIES.map((q) => (
              <option key={q.id} value={q.id}>
                {q.label}
              </option>
            ))}
          </SelectField>
        </div>

        <StoragePicker value={storageId} onChange={setStorageId} />
        {errors.storageId ? <p className="-mt-2 text-xs text-danger">{errors.storageId}</p> : null}

        <TextField
          label="Etiketler"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="crafting, satılık"
          hint="Virgülle ayır. Etikete tıklayınca o etiketteki her şey listelenir."
          autoComplete="off"
          list="kasadar-tags"
        />
        <datalist id="kasadar-tags">
          {knownTags.map((t) => (
            <option key={t.tag} value={t.tag} />
          ))}
        </datalist>

        <TextAreaField
          label="Not"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Lonca etkinliği için ayrıldı."
        />
      </form>
    </Modal>
  );
}
