import { nowIso } from '../lib/date.js';
import { createEmptyDatabase, normalizeDatabase } from '../data/schema.js';

/**
 * Tüm veri değişiklikleri buradan geçer. Kural:
 *  - Bir depoyu ya da içindeki eşyaları değiştiren her işlem deponun
 *    updatedAt alanını tazeler (bayat veri uyarısı buna bakacak).
 *  - Karakter silinince depoları, depo silinince eşyaları da silinir.
 */
export function dbReducer(db, action) {
  switch (action.type) {
    /* ------------------------------- Veritabanı ------------------------------- */

    case 'db/replace':
      return stamp(normalizeDatabase(action.db));

    case 'db/reset':
      return createEmptyDatabase();

    /* -------------------------------- Karakter -------------------------------- */

    case 'character/add':
      return stamp({
        ...db,
        characters: [...db.characters, action.character],
      });

    case 'character/update':
      return stamp({
        ...db,
        characters: db.characters.map((c) =>
          c.id === action.id ? { ...c, ...action.patch, id: c.id, updatedAt: nowIso() } : c,
        ),
      });

    case 'character/remove': {
      const doomedStorageIds = new Set(
        db.storages.filter((s) => s.characterId === action.id).map((s) => s.id),
      );
      return stamp({
        ...db,
        characters: db.characters.filter((c) => c.id !== action.id),
        storages: db.storages.filter((s) => s.characterId !== action.id),
        items: db.items.filter((it) => !doomedStorageIds.has(it.storageId)),
      });
    }

    /* ---------------------------------- Depo ---------------------------------- */

    case 'storage/add':
      return stamp({
        ...db,
        storages: [...db.storages, action.storage],
      });

    case 'storage/update':
      return stamp({
        ...db,
        storages: db.storages.map((s) =>
          s.id === action.id
            ? { ...s, ...action.patch, id: s.id, characterId: s.characterId, updatedAt: nowIso() }
            : s,
        ),
      });

    case 'storage/remove':
      return stamp({
        ...db,
        storages: db.storages.filter((s) => s.id !== action.id),
        items: db.items.filter((it) => it.storageId !== action.id),
      });

    case 'storage/touch':
      return stamp({
        ...db,
        storages: db.storages.map((s) =>
          s.id === action.id ? { ...s, updatedAt: nowIso() } : s,
        ),
      });

    default:
      return db;
  }
}

function stamp(next) {
  return { ...next, updatedAt: nowIso() };
}
