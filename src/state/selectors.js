import { getStorageType } from '../data/schema.js';

const collator = new Intl.Collator('tr', { sensitivity: 'base', numeric: true });

export function sortCharacters(characters) {
  return [...characters].sort((a, b) => collator.compare(a.name, b.name));
}

/** Depolar önce tipe (çanta → kasa → posta → lonca), sonra ada göre sıralanır. */
export function sortStorages(storages) {
  const order = ['canta', 'kasa', 'posta', 'lonca_kasasi'];
  return [...storages].sort((a, b) => {
    const byType = order.indexOf(a.type) - order.indexOf(b.type);
    if (byType !== 0) return byType;
    return collator.compare(a.name, b.name);
  });
}

export function storagesOfCharacter(db, characterId) {
  return sortStorages(db.storages.filter((s) => s.characterId === characterId));
}

export function itemsOfStorage(db, storageId) {
  return db.items.filter((it) => it.storageId === storageId);
}

export function storageStats(db, storageId) {
  let rows = 0;
  let quantity = 0;
  for (const it of db.items) {
    if (it.storageId !== storageId) continue;
    rows += 1;
    quantity += it.quantity;
  }
  return { rows, quantity };
}

export function characterStats(db, characterId) {
  const storageIds = new Set(
    db.storages.filter((s) => s.characterId === characterId).map((s) => s.id),
  );

  let rows = 0;
  let quantity = 0;
  for (const it of db.items) {
    if (!storageIds.has(it.storageId)) continue;
    rows += 1;
    quantity += it.quantity;
  }

  const lastUpdatedAt = db.storages
    .filter((s) => s.characterId === characterId)
    .reduce((acc, s) => (!acc || s.updatedAt > acc ? s.updatedAt : acc), '');

  return { storageCount: storageIds.size, rows, quantity, lastUpdatedAt };
}

export function findCharacter(db, id) {
  return db.characters.find((c) => c.id === id) ?? null;
}

export function findStorage(db, id) {
  return db.storages.find((s) => s.id === id) ?? null;
}

/** "Zeyra · Kasa 2" gibi tek satırlık konum etiketi (Kısım 3'teki sonuç listesi için). */
export function storageLabel(db, storageId) {
  const storage = findStorage(db, storageId);
  if (!storage) return '—';
  const character = findCharacter(db, storage.characterId);
  const type = getStorageType(storage.type);
  return `${character?.name ?? '?'} · ${storage.name || type.label}`;
}

/* ------------------------------- Hızlı erişim ------------------------------- */

/** Listeleri her satırda tek tek taramamak için tek seferlik sözlükler. */
export function buildIndex(db) {
  const charById = new Map(db.characters.map((c) => [c.id, c]));
  const storageById = new Map(db.storages.map((s) => [s.id, s]));
  return { charById, storageById };
}

/** Bir eşyayı deposu ve karakteriyle birlikte döndürür. */
export function locate(index, item) {
  const storage = index.storageById.get(item.storageId) ?? null;
  const character = storage ? (index.charById.get(storage.characterId) ?? null) : null;
  return { item, storage, character };
}

/** Kullanımdaki tüm etiketler, çok kullanılandan aza doğru. */
export function allTags(db) {
  const counts = new Map();
  for (const item of db.items) {
    for (const tag of item.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || collator.compare(a.tag, b.tag));
}

/** Aynı depoda aynı isimli kayıt var mı? (toplu eklemede adet toplamak için) */
export function findItemInStorage(db, storageId, normalizedName, normalizer) {
  return (
    db.items.find(
      (it) => it.storageId === storageId && normalizer(it.name) === normalizedName,
    ) ?? null
  );
}

/** Depoları karaktere göre gruplayıp seçim kutusu için hazırlar. */
export function storageOptionGroups(db) {
  return sortCharacters(db.characters).map((character) => ({
    character,
    storages: storagesOfCharacter(db, character.id),
  }));
}
