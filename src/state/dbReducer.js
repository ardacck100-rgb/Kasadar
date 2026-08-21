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
      return stamp(touchStorages(db, [action.id]));

    /* ---------------------------------- Eşya ---------------------------------- */

    case 'item/add':
      return stamp(
        touchStorages({ ...db, items: [...db.items, action.item] }, [action.item.storageId]),
      );

    case 'item/addMany': {
      if (action.items.length === 0) return db;
      return stamp(
        touchStorages(
          { ...db, items: [...db.items, ...action.items] },
          action.items.map((it) => it.storageId),
        ),
      );
    }

    case 'item/update': {
      const target = db.items.find((it) => it.id === action.id);
      if (!target) return db;
      const nextStorageId = action.patch.storageId ?? target.storageId;
      return stamp(
        touchStorages(
          {
            ...db,
            items: db.items.map((it) =>
              it.id === action.id ? { ...it, ...action.patch, id: it.id, updatedAt: nowIso() } : it,
            ),
          },
          // Eşya başka depoya taşındıysa iki depo da tazelenir.
          [target.storageId, nextStorageId],
        ),
      );
    }

    /** Aynı depodaki aynı isimli kaydın adedini artırır (toplu ekleme birleştirmesi). */
    case 'item/increment': {
      const target = db.items.find((it) => it.id === action.id);
      if (!target) return db;
      return stamp(
        touchStorages(
          {
            ...db,
            items: db.items.map((it) =>
              it.id === action.id
                ? { ...it, quantity: it.quantity + action.amount, updatedAt: nowIso() }
                : it,
            ),
          },
          [target.storageId],
        ),
      );
    }

    case 'item/remove': {
      const target = db.items.find((it) => it.id === action.id);
      if (!target) return db;
      return stamp(
        touchStorages(
          { ...db, items: db.items.filter((it) => it.id !== action.id) },
          [target.storageId],
        ),
      );
    }

    default:
      return db;
  }
}

/** Verilen depoların updatedAt alanını tazeler; bayat veri uyarısı buna bakar. */
function touchStorages(db, storageIds) {
  const ids = new Set(storageIds.filter(Boolean));
  if (ids.size === 0) return db;
  const ts = nowIso();
  return {
    ...db,
    storages: db.storages.map((s) => (ids.has(s.id) ? { ...s, updatedAt: ts } : s)),
  };
}

function stamp(next) {
  return { ...next, updatedAt: nowIso() };
}
