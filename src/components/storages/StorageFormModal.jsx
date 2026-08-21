import { useState } from 'react';

import { DEFAULT_STORAGE_TYPE, STORAGE_TYPES, getStorageType } from '../../data/schema.js';
import { Button } from '../ui/Button.jsx';
import { SelectField, TextAreaField, TextField } from '../ui/Fields.jsx';
import { Modal } from '../ui/Modal.jsx';

export function StorageFormModal({ open, onClose, onSubmit, storage, characterName }) {
  const editing = Boolean(storage);
  const [type, setType] = useState(storage?.type ?? DEFAULT_STORAGE_TYPE);
  const [name, setName] = useState(storage?.name ?? '');
  const [note, setNote] = useState(storage?.note ?? '');

  const typeMeta = getStorageType(type);

  function handleSubmit(e) {
    e.preventDefault();
    // Ad boş bırakıldıysa depo tipinin adını kullan: "Kasa", "Posta" gibi.
    const finalName = name.trim() || typeMeta.label;
    onSubmit({ type, name: finalName, note: note.trim() });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Depoyu düzenle' : 'Yeni depo'}
      description={
        characterName
          ? `${characterName} karakterinin bir çantası, kasa sekmesi ya da postası.`
          : undefined
      }
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button variant="primary" form="storage-form" type="submit">
            {editing ? 'Kaydet' : 'Ekle'}
          </Button>
        </div>
      }
    >
      <form id="storage-form" onSubmit={handleSubmit} className="space-y-4">
        <SelectField
          label="Depo tipi"
          value={type}
          data-autofocus
          onChange={(e) => setType(e.target.value)}
          hint={typeMeta.description}
        >
          {STORAGE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.icon} {t.label}
            </option>
          ))}
        </SelectField>

        <TextField
          label="Sekme adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`${typeMeta.label} 1 — Cevherler`}
          hint="Boş bırakırsan depo tipinin adı kullanılır."
          autoComplete="off"
        />

        <TextAreaField
          label="Not"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Sadece crafting malzemesi koyuyorum."
          rows={2}
        />
      </form>
    </Modal>
  );
}
