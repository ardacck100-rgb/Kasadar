import { normalizeTr } from '../lib/normalize.js';

/**
 * Ayrıştırılmış satırları seçili depoya yazar.
 * merge açıkken aynı isimli mevcut kaydın adedi artırılır, yeni satır açılmaz.
 */
export function planBulk({ db, storageId, rows, merge }) {
  const existingByName = new Map();
  if (merge) {
    for (const item of db.items) {
      if (item.storageId !== storageId) continue;
      existingByName.set(normalizeTr(item.name), item);
    }
  }

  const additions = [];
  const increments = [];
  const seen = new Map();

  for (const row of rows) {
    const key = normalizeTr(row.name);
    const existing = merge ? existingByName.get(key) : null;

    if (existing) {
      const already = increments.find((i) => i.id === existing.id);
      if (already) already.amount += row.quantity;
      else increments.push({ id: existing.id, amount: row.quantity, name: existing.name });
      continue;
    }

    // Aynı yapıştırmada iki kez geçen isim tek kayıtta toplanır.
    if (merge && seen.has(key)) {
      seen.get(key).quantity += row.quantity;
      continue;
    }

    const addition = { ...row, key };
    additions.push(addition);
    if (merge) seen.set(key, addition);
  }

  return { additions, increments };
}

export function commitBulk({ actions, storageId, plan, defaultQuality, defaultTags }) {
  if (plan.additions.length > 0) {
    actions.addItems(
      plan.additions.map((row) => ({
        storageId,
        name: row.name,
        quantity: row.quantity,
        quality: row.quality ?? defaultQuality,
        tags: [...defaultTags, ...row.tags],
      })),
    );
  }
  for (const inc of plan.increments) {
    actions.incrementItem(inc.id, inc.amount);
  }
  return { added: plan.additions.length, merged: plan.increments.length };
}
