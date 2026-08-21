import { uid } from '../lib/id.js';
import { nowIso } from '../lib/date.js';

/* ==================================================================
 * Kasadar veri şeması
 *
 * Tüm uygulama tek bir JSON belgesi üzerinde çalışır:
 *
 * {
 *   schemaVersion: 1,
 *   createdAt: ISO tarih,
 *   updatedAt: ISO tarih,
 *   characters: [ { id, name, charClass, server, note, createdAt, updatedAt } ],
 *   storages:   [ { id, characterId, type, name, note, createdAt, updatedAt } ],
 *   items:      [ { id, storageId, name, quantity, quality, tags[], note,
 *                   createdAt, updatedAt } ]
 * }
 *
 * Bu tek belge aynı zamanda dışa/içe aktarma (yedekleme) formatıdır.
 * ================================================================== */

export const SCHEMA_VERSION = 1;
export const APP_NAME = 'Kasadar';

/** Bir depo bu kadar gün güncellenmediyse "bayat" sayılır (Kısım 4). */
export const STALE_AFTER_DAYS = 30;

/* ------------------------------- Depo tipleri ------------------------------- */

export const STORAGE_TYPES = [
  {
    id: 'canta',
    label: 'Çanta',
    icon: '🎒',
    description: 'Karakterin üzerinde taşıdığı çanta',
  },
  {
    id: 'kasa',
    label: 'Kasa',
    icon: '🏦',
    description: 'Banka / kasa sekmesi',
  },
  {
    id: 'posta',
    label: 'Posta',
    icon: '✉️',
    description: 'Postada bekleyen, henüz alınmamış eşyalar',
  },
  {
    id: 'lonca_kasasi',
    label: 'Lonca Kasası',
    icon: '🛡️',
    description: 'Loncanın ortak kasa sekmesi',
  },
];

export const STORAGE_TYPE_IDS = STORAGE_TYPES.map((t) => t.id);
export const DEFAULT_STORAGE_TYPE = 'kasa';

export function getStorageType(id) {
  return STORAGE_TYPES.find((t) => t.id === id) ?? STORAGE_TYPES[1];
}

/* -------------------------------- Kaliteler -------------------------------- */
/*
 * Tailwind'in sınıfları üretebilmesi için sınıf adları burada tam metin
 * olarak yazılıdır (text-q-mor gibi parçalı birleştirme yapılmaz).
 */
export const QUALITIES = [
  {
    id: 'gri',
    label: 'Sıradan',
    text: 'text-q-gri',
    bg: 'bg-q-gri/12',
    border: 'border-q-gri/35',
    dot: 'bg-q-gri',
  },
  {
    id: 'yesil',
    label: 'Sıradışı',
    text: 'text-q-yesil',
    bg: 'bg-q-yesil/12',
    border: 'border-q-yesil/35',
    dot: 'bg-q-yesil',
  },
  {
    id: 'mavi',
    label: 'Nadir',
    text: 'text-q-mavi',
    bg: 'bg-q-mavi/12',
    border: 'border-q-mavi/35',
    dot: 'bg-q-mavi',
  },
  {
    id: 'mor',
    label: 'Destansı',
    text: 'text-q-mor',
    bg: 'bg-q-mor/12',
    border: 'border-q-mor/35',
    dot: 'bg-q-mor',
  },
  {
    id: 'turuncu',
    label: 'Efsanevi',
    text: 'text-q-turuncu',
    bg: 'bg-q-turuncu/12',
    border: 'border-q-turuncu/35',
    dot: 'bg-q-turuncu',
  },
];

export const QUALITY_IDS = QUALITIES.map((q) => q.id);
export const DEFAULT_QUALITY = 'gri';

export function getQuality(id) {
  return QUALITIES.find((q) => q.id === id) ?? QUALITIES[0];
}

/* -------------------------------- Fabrikalar -------------------------------- */

export function createEmptyDatabase() {
  const ts = nowIso();
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: ts,
    updatedAt: ts,
    characters: [],
    storages: [],
    items: [],
  };
}

export function createCharacter(data = {}) {
  const ts = nowIso();
  return {
    id: data.id || uid('chr'),
    name: str(data.name),
    charClass: str(data.charClass),
    server: str(data.server),
    note: str(data.note),
    createdAt: data.createdAt || ts,
    updatedAt: ts,
  };
}

export function createStorage(data = {}) {
  const ts = nowIso();
  return {
    id: data.id || uid('stg'),
    characterId: str(data.characterId),
    type: STORAGE_TYPE_IDS.includes(data.type) ? data.type : DEFAULT_STORAGE_TYPE,
    name: str(data.name),
    note: str(data.note),
    createdAt: data.createdAt || ts,
    updatedAt: ts,
  };
}

export function createItem(data = {}) {
  const ts = nowIso();
  return {
    id: data.id || uid('itm'),
    storageId: str(data.storageId),
    name: str(data.name),
    quantity: toQuantity(data.quantity),
    quality: QUALITY_IDS.includes(data.quality) ? data.quality : DEFAULT_QUALITY,
    tags: normalizeTags(data.tags),
    note: str(data.note),
    createdAt: data.createdAt || ts,
    updatedAt: ts,
  };
}

/* ------------------------------ Normalizasyon ------------------------------ */

function str(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toQuantity(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.max(0, Math.floor(n));
}

export function normalizeTags(value) {
  const list = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  const seen = new Set();
  const out = [];
  for (const raw of list) {
    const tag = str(raw).toLocaleLowerCase('tr');
    if (!tag) continue;
    if (seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
  }
  return out;
}

/**
 * Dışarıdan gelen (localStorage / içe aktarılan dosya) veriyi güvenli hale getirir:
 * eksik alanları tamamlar, tanımsız enum değerlerini varsayılana çeker,
 * sahibi silinmiş depo/eşya kayıtlarını (öksüz kayıtlar) atar.
 */
export function normalizeDatabase(raw) {
  const base = createEmptyDatabase();
  if (!raw || typeof raw !== 'object') return base;

  const characters = asArray(raw.characters)
    .filter((c) => c && typeof c === 'object')
    .map((c, i) => {
      const created = createCharacter({ ...c, id: str(c.id) || uid('chr') });
      return {
        ...created,
        // Adı boş kalan karakterler listede kaybolmasın diye yer tutucu ad alır.
        name: created.name || `Karakter ${i + 1}`,
        updatedAt: str(c.updatedAt) || created.updatedAt,
      };
    });

  const characterIds = new Set(characters.map((c) => c.id));

  const storages = asArray(raw.storages)
    .filter((s) => s && typeof s === 'object' && characterIds.has(str(s.characterId)))
    .map((s) => {
      const created = createStorage({ ...s, id: str(s.id) || uid('stg') });
      return { ...created, updatedAt: str(s.updatedAt) || created.updatedAt };
    });

  const storageIds = new Set(storages.map((s) => s.id));

  const items = asArray(raw.items)
    .filter((it) => it && typeof it === 'object' && storageIds.has(str(it.storageId)))
    .map((it) => {
      const created = createItem({ ...it, id: str(it.id) || uid('itm') });
      return { ...created, updatedAt: str(it.updatedAt) || created.updatedAt };
    });

  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: str(raw.createdAt) || base.createdAt,
    updatedAt: str(raw.updatedAt) || base.updatedAt,
    characters,
    storages,
    items,
  };
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}
