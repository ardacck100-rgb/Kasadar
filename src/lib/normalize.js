/**
 * Türkçe duyarlı normalizasyon.
 *
 * Kural: uzunluk korunur. Her karakter tam olarak bir karaktere dönüşür.
 * Böylece normalize edilmiş metinde bulunan eşleşme konumu, ham metinde de
 * aynı konuma denk gelir ve sonuçlarda vurgulama (highlight) yapabiliriz.
 *
 * "İksir" → "iksir",  "iksır" → "iksir",  "Ağaç" → "agac"
 */
const CHAR_MAP = {
  İ: 'i', I: 'i', ı: 'i', i: 'i',
  Ş: 's', ş: 's',
  Ğ: 'g', ğ: 'g',
  Ü: 'u', ü: 'u',
  Ö: 'o', ö: 'o',
  Ç: 'c', ç: 'c',
  Â: 'a', â: 'a',
  Î: 'i', î: 'i',
  Û: 'u', û: 'u',
  Ê: 'e', ê: 'e',
  Ô: 'o', ô: 'o',
};

export function normalizeTr(value) {
  if (!value) return '';
  let out = '';
  for (const ch of String(value)) {
    const mapped = CHAR_MAP[ch];
    if (mapped) {
      out += mapped;
      continue;
    }
    const lower = ch.toLowerCase();
    // Bazı diller küçük harfe çevirirken uzunluk değiştirir; uzunluğu koru.
    out += lower.length === 1 ? lower : ch;
  }
  return out;
}

/** Kelimelere ayırır: harf/rakam dışındaki her şey ayraç sayılır. */
export function tokenize(normalized) {
  return normalized.split(/[^a-z0-9]+/).filter(Boolean);
}

/** Normalize edip kelimelere ayırır. */
export function normalizeTokens(value) {
  return tokenize(normalizeTr(value));
}
