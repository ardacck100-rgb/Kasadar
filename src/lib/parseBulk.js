import { QUALITIES, QUALITY_IDS } from '../data/schema.js';
import { normalizeTr } from './normalize.js';

/**
 * Toplu yapıştırma ayrıştırıcısı.
 *
 * Oyunun sohbet/kasa penceresinden kopyalanan satırlar tek tipte gelmez.
 * Desteklenen biçimler:
 *
 *   Demir Cevheri x40        40x Demir Cevheri      Demir Cevheri 40
 *   Demir Cevheri ×40        Demir Cevheri, 40      Demir Cevheri (40)
 *   Demir Cevheri - 40       Demir Cevheri	40      Demir Cevheri [40]
 *   Demir Cevheri            → adet 1
 *   1.200 x Ay Çiçeği        → 1200 adet
 *
 * Satır içi ek bilgi:
 *   #crafting #satılık   → etiket
 *   @mor / @destansı     → kalite
 */

const BULLET = /^[-–—•·*+>]\s+/;
const SEPARATORS = '[\\s,;:·|\\-–—]';

export function parseQuantity(raw) {
  // "1.200" ve "1,200" binlik ayraçlıdır; eşya adedi tam sayıdır.
  const digits = String(raw).replace(/[.,\s]/g, '');
  const n = Number.parseInt(digits, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function matchQuality(token) {
  const needle = normalizeTr(token);
  if (QUALITY_IDS.includes(needle)) return needle;
  const byLabel = QUALITIES.find((q) => normalizeTr(q.label) === needle);
  return byLabel ? byLabel.id : null;
}

/** @returns {{ok: true, name, quantity, tags, quality, raw} | {ok: false, raw, reason}} */
export function parseBulkLine(rawLine) {
  const raw = String(rawLine);
  let rest = raw.trim();
  if (!rest) return { ok: false, raw, reason: 'boş satır' };

  rest = rest.replace(BULLET, '');

  const tags = [];
  let quality = null;

  rest = rest.replace(/(^|\s)#([^\s#@]+)/g, (_m, _p, tag) => {
    tags.push(tag);
    return ' ';
  });

  rest = rest.replace(/(^|\s)@([^\s#@]+)/g, (match, _p, token) => {
    const found = matchQuality(token);
    if (!found) return match;
    quality = found;
    return ' ';
  });

  rest = rest.replace(/\s+/g, ' ').trim();
  if (!rest) return { ok: false, raw, reason: 'eşya adı yok' };

  const patterns = [
    // 40x Demir Cevheri  /  40 × Demir Cevheri
    { re: /^(\d[\d.,]*)\s*[x×*]\s*(.+)$/i, name: 2, qty: 1 },
    // Demir Cevheri x40  /  Demir Cevheri, x 40
    { re: new RegExp(`^(.+?)${SEPARATORS}*[x×*]\\s*(\\d[\\d.,]*)$`, 'i'), name: 1, qty: 2 },
    // Demir Cevheri (40)  /  Demir Cevheri [40]
    { re: /^(.+?)\s*[([{](\d[\d.,]*)[)\]}]$/, name: 1, qty: 2 },
    // Demir Cevheri 40  /  Demir Cevheri - 40  /  Demir Cevheri: 40
    { re: new RegExp(`^(.+?)${SEPARATORS}+(\\d[\\d.,]*)$`), name: 1, qty: 2 },
  ];

  for (const { re, name, qty } of patterns) {
    const m = rest.match(re);
    if (!m) continue;
    const quantity = parseQuantity(m[qty]);
    const itemName = cleanName(m[name]);
    if (quantity === null || !itemName) continue;
    return { ok: true, raw, name: itemName, quantity, tags, quality };
  }

  const only = cleanName(rest);
  if (!only) return { ok: false, raw, reason: 'eşya adı yok' };

  // Satırın tamamı sayıysa eşya adı olarak kabul edilemez.
  if (/^[\d.,]+$/.test(only)) return { ok: false, raw, reason: 'sadece sayı' };

  return { ok: true, raw, name: only, quantity: 1, tags, quality };
}

function cleanName(value) {
  return String(value)
    .replace(/^[\s,;:·|\-–—]+/, '')
    .replace(/[\s,;:·|\-–—]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Metnin tamamını ayrıştırır.
 * @param {string} text
 * @param {{ merge?: boolean }} options merge: aynı isimli satırların adetlerini topla
 */
export function parseBulkText(text, { merge = true } = {}) {
  const lines = String(text ?? '').split(/\r?\n/);
  const parsed = [];
  const skipped = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const result = parseBulkLine(line);
    if (result.ok) parsed.push(result);
    else skipped.push(result);
  }

  if (!merge) return { rows: parsed, skipped };

  const byName = new Map();
  for (const row of parsed) {
    const key = normalizeTr(row.name);
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, { ...row, tags: [...row.tags], mergedFrom: 1 });
      continue;
    }
    existing.quantity += row.quantity;
    existing.mergedFrom += 1;
    existing.quality = existing.quality ?? row.quality;
    for (const tag of row.tags) if (!existing.tags.includes(tag)) existing.tags.push(tag);
  }

  return { rows: [...byName.values()], skipped };
}
