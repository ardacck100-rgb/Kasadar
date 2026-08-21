import { useState } from 'react';

import { Button } from '../ui/Button.jsx';
import { TextAreaField, TextField } from '../ui/Fields.jsx';
import { Modal } from '../ui/Modal.jsx';

/**
 * Hem yeni karakter hem düzenleme için kullanılır.
 * Çağıran taraf key={character?.id ?? 'new'} vererek alanların sıfırlanmasını sağlar.
 */
export function CharacterFormModal({ open, onClose, onSubmit, character }) {
  const editing = Boolean(character);
  const [name, setName] = useState(character?.name ?? '');
  const [charClass, setCharClass] = useState(character?.charClass ?? '');
  const [server, setServer] = useState(character?.server ?? '');
  const [note, setNote] = useState(character?.note ?? '');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Karakter adı gerekli.');
      return;
    }
    onSubmit({ name: trimmed, charClass: charClass.trim(), server: server.trim(), note: note.trim() });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Karakteri düzenle' : 'Yeni karakter'}
      description={
        editing ? null : 'Eşyalarını dağıttığın karakterlerden birini ekle. Sonra depolarını tanımlarsın.'
      }
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button variant="primary" form="character-form" type="submit">
            {editing ? 'Kaydet' : 'Ekle'}
          </Button>
        </div>
      }
    >
      <form id="character-form" onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Karakter adı"
          data-autofocus
          value={name}
          error={error}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          placeholder="Zeyra"
          autoComplete="off"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Sınıf"
            value={charClass}
            onChange={(e) => setCharClass(e.target.value)}
            placeholder="Büyücü"
            autoComplete="off"
          />
          <TextField
            label="Sunucu"
            value={server}
            onChange={(e) => setServer(e.target.value)}
            placeholder="Anadolu"
            autoComplete="off"
          />
        </div>

        <TextAreaField
          label="Not"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Simya malzemeleri hep bu karakterde."
          hint="İsteğe bağlı. Karakteri hatırlaman için kısa bir açıklama."
        />
      </form>
    </Modal>
  );
}
