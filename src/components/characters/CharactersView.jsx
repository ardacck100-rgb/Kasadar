import { useEffect, useMemo, useState } from 'react';

import { buildDemoDatabase } from '../../data/demo.js';
import { useDatabase } from '../../state/DatabaseContext.jsx';
import { sortCharacters, storagesOfCharacter } from '../../state/selectors.js';
import { Button } from '../ui/Button.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { StorageFormModal } from '../storages/StorageFormModal.jsx';
import { StorageList } from '../storages/StorageList.jsx';
import { CharacterDetail } from './CharacterDetail.jsx';
import { CharacterList } from './CharacterList.jsx';
import { CharacterFormModal } from './CharacterFormModal.jsx';

const CLOSED = { kind: null };

export function CharactersView() {
  const { db, actions } = useDatabase();

  const characters = useMemo(() => sortCharacters(db.characters), [db.characters]);
  const [selectedId, setSelectedId] = useState(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [dialog, setDialog] = useState(CLOSED);

  const selected = characters.find((c) => c.id === selectedId) ?? null;

  // Seçili karakter silindiyse ya da hiç seçim yoksa ilk karaktere düş.
  useEffect(() => {
    if (!selected && characters.length > 0) {
      setSelectedId(characters[0].id);
    }
    if (characters.length === 0 && selectedId !== null) {
      setSelectedId(null);
      setMobileDetail(false);
    }
  }, [selected, characters, selectedId]);

  const storages = useMemo(
    () => (selected ? storagesOfCharacter(db, selected.id) : []),
    [db, selected],
  );

  const close = () => setDialog(CLOSED);

  function handleSelect(id) {
    setSelectedId(id);
    setMobileDetail(true);
  }

  if (characters.length === 0) {
    return (
      <>
        <EmptyState
          icon="🧝"
          title="Henüz karakter yok"
          description="Önce karakterlerini ekle, sonra her birinin çanta/kasa/posta depolarını tanımla. Eşyalar Kısım 2'de bu depolara girecek."
          className="mt-6"
          action={
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="primary" onClick={() => setDialog({ kind: 'character-new' })}>
                Karakter ekle
              </Button>
              <Button
                variant="ghost"
                onClick={() => actions.replaceDatabase(buildDemoDatabase())}
              >
                Örnek veriyi yükle
              </Button>
            </div>
          }
        />
        <CharacterFormModal
          key="new"
          open={dialog.kind === 'character-new'}
          onClose={close}
          onSubmit={(data) => {
            const created = actions.addCharacter(data);
            setSelectedId(created.id);
          }}
        />
      </>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-6 lg:items-start">
      <div className={mobileDetail ? 'hidden lg:block' : 'block'}>
        <CharacterList
          characters={characters}
          selectedId={selectedId}
          onSelect={handleSelect}
          onAdd={() => setDialog({ kind: 'character-new' })}
        />
      </div>

      <div className={`${mobileDetail ? 'block' : 'hidden lg:block'} mt-6 lg:mt-0`}>
        {selected ? (
          <CharacterDetail
            character={selected}
            onBack={() => setMobileDetail(false)}
            onEdit={() => setDialog({ kind: 'character-edit', character: selected })}
            onDelete={() => setDialog({ kind: 'character-delete', character: selected })}
          >
            <StorageList
              storages={storages}
              onAdd={() => setDialog({ kind: 'storage-new' })}
              onEdit={(storage) => setDialog({ kind: 'storage-edit', storage })}
              onDelete={(storage) => setDialog({ kind: 'storage-delete', storage })}
            />
          </CharacterDetail>
        ) : null}
      </div>

      {/* ------------------------------ Diyaloglar ------------------------------ */}

      <CharacterFormModal
        key={dialog.kind === 'character-edit' ? `edit-${dialog.character.id}` : 'new'}
        open={dialog.kind === 'character-new' || dialog.kind === 'character-edit'}
        character={dialog.kind === 'character-edit' ? dialog.character : null}
        onClose={close}
        onSubmit={(data) => {
          if (dialog.kind === 'character-edit') {
            actions.updateCharacter(dialog.character.id, data);
          } else {
            const created = actions.addCharacter(data);
            setSelectedId(created.id);
            setMobileDetail(true);
          }
        }}
      />

      <StorageFormModal
        key={dialog.kind === 'storage-edit' ? `stg-${dialog.storage.id}` : 'stg-new'}
        open={dialog.kind === 'storage-new' || dialog.kind === 'storage-edit'}
        storage={dialog.kind === 'storage-edit' ? dialog.storage : null}
        characterName={selected?.name}
        onClose={close}
        onSubmit={(data) => {
          if (dialog.kind === 'storage-edit') {
            actions.updateStorage(dialog.storage.id, data);
          } else if (selected) {
            actions.addStorage({ ...data, characterId: selected.id });
          }
        }}
      />

      <ConfirmDialog
        open={dialog.kind === 'character-delete'}
        onClose={close}
        title="Karakteri sil"
        confirmLabel="Karakteri sil"
        description={
          dialog.kind === 'character-delete'
            ? `"${dialog.character.name}" karakteri, tüm depoları ve o depolardaki eşya kayıtları silinecek. Bu işlem geri alınamaz.`
            : undefined
        }
        onConfirm={() => {
          actions.removeCharacter(dialog.character.id);
          setMobileDetail(false);
        }}
      />

      <ConfirmDialog
        open={dialog.kind === 'storage-delete'}
        onClose={close}
        title="Depoyu sil"
        confirmLabel="Depoyu sil"
        description={
          dialog.kind === 'storage-delete'
            ? `"${dialog.storage.name}" deposu ve içindeki eşya kayıtları silinecek. Bu işlem geri alınamaz.`
            : undefined
        }
        onConfirm={() => actions.removeStorage(dialog.storage.id)}
      />
    </div>
  );
}
