import { STALE_AFTER_DAYS } from '../data/schema.js';
import { MATCH_THRESHOLD, matchRange, scoreMatch } from '../lib/fuzzy.js';
import { isStale } from '../lib/date.js';
import { normalizeTr } from '../lib/normalize.js';
import { locate } from '../state/selectors.js';

export const EMPTY_FILTERS = {
  characterIds: [],
  storageTypes: [],
  qualities: [],
  tags: [],
};

export function hasActiveFilters(filters) {
  return (
    filters.characterIds.length > 0 ||
    filters.storageTypes.length > 0 ||
    filters.qualities.length > 0 ||
    filters.tags.length > 0
  );
}

/**
 * Filtreler: her kategorinin içinde "veya", kategoriler arasında "ve".
 * (Mavi VEYA mor kalite) VE (crafting etiketli) gibi.
 */
export function filterEntries(db, index, filters) {
  const out = [];
  for (const item of db.items) {
    const entry = locate(index, item);
    if (!entry.storage) continue;

    if (filters.characterIds.length && !filters.characterIds.includes(entry.storage.characterId)) {
      continue;
    }
    if (filters.storageTypes.length && !filters.storageTypes.includes(entry.storage.type)) {
      continue;
    }
    if (filters.qualities.length && !filters.qualities.includes(item.quality)) {
      continue;
    }
    if (filters.tags.length && !filters.tags.every((t) => item.tags.includes(t))) {
      continue;
    }

    out.push({ ...entry, stale: isStale(entry.storage.updatedAt, STALE_AFTER_DAYS) });
  }
  return out;
}

/**
 * Arama: eşya adı birincil, etiket ve depo/karakter adı ikincil ağırlıkta.
 * Sonuçlar eşya adına göre gruplanır; her grup "kaç adet, kaç yerde" özetini taşır.
 */
export function searchItems(db, index, query, filters) {
  const trimmed = query.trim();
  const base = filterEntries(db, index, filters);

  let matched;
  if (!trimmed) {
    matched = base.map((entry) => ({ ...entry, score: 0, range: null }));
  } else {
    matched = [];
    for (const entry of base) {
      const nameScore = scoreMatch(trimmed, entry.item.name);

      let bestTag = 0;
      for (const tag of entry.item.tags) {
        const s = scoreMatch(trimmed, tag);
        if (s > bestTag) bestTag = s;
      }

      const placeScore = Math.max(
        scoreMatch(trimmed, entry.character?.name ?? ''),
        scoreMatch(trimmed, entry.storage.name),
      );

      // Ağırlıklar: ada göre bulmak esas iş; etiket ve konum destekleyici.
      const score = Math.max(nameScore, bestTag * 0.85, placeScore * 0.7);
      if (score < MATCH_THRESHOLD) continue;

      matched.push({ ...entry, score, range: matchRange(trimmed, entry.item.name) });
    }
  }

  return groupByName(matched, Boolean(trimmed));
}

function groupByName(entries, scored) {
  const groups = new Map();

  for (const entry of entries) {
    const key = normalizeTr(entry.item.name);
    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        name: entry.item.name,
        entries: [],
        totalQuantity: 0,
        locationCount: 0,
        characterCount: 0,
        score: 0,
        anyStale: false,
      };
      groups.set(key, group);
    }
    group.entries.push(entry);
    group.totalQuantity += entry.item.quantity;
    group.score = Math.max(group.score, entry.score);
    group.anyStale = group.anyStale || entry.stale;
  }

  const list = [...groups.values()];
  for (const group of list) {
    group.locationCount = group.entries.length;
    group.characterCount = new Set(group.entries.map((e) => e.character?.id)).size;
    // Grup içinde: taze depolar üstte, aynı tazelikte çok adetli üstte.
    group.entries.sort(
      (a, b) => Number(a.stale) - Number(b.stale) || b.item.quantity - a.item.quantity,
    );
  }

  list.sort((a, b) => {
    if (scored && b.score !== a.score) return b.score - a.score;
    if (b.totalQuantity !== a.totalQuantity) return b.totalQuantity - a.totalQuantity;
    return a.name.localeCompare(b.name, 'tr');
  });

  const totals = list.reduce(
    (acc, g) => {
      acc.quantity += g.totalQuantity;
      acc.rows += g.entries.length;
      return acc;
    },
    { quantity: 0, rows: 0, groups: list.length },
  );

  return { groups: list, totals };
}
