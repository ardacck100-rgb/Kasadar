import { normalizeTr, tokenize } from './normalize.js';

/**
 * Yaklaşık (fuzzy) eşleştirme.
 *
 * 0 = eşleşme yok, 1 = birebir aynı. Sıralama şu öncelikle çalışır:
 *   birebir  >  baştan eşleşme  >  kelime başı  >  içinde geçme
 *   >  harf sırası (subsequence)  >  yazım hatası toleransı (Levenshtein)
 *
 * Çok kelimeli sorguda her kelime hedefte bir karşılık bulmak zorundadır
 * ("demir cevher" → "Demir Cevheri"), puan kelimelerin ortalamasıdır.
 */

export const MATCH_THRESHOLD = 0.42;

/** Yazım hatası toleransı: kelime uzadıkça biraz daha esner. */
function maxDistanceFor(length) {
  if (length <= 3) return 0;
  if (length <= 5) return 1;
  if (length <= 9) return 2;
  return 3;
}

export function levenshtein(a, b, limit = Infinity) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  if (Math.abs(a.length - b.length) > limit) return limit + 1;

  let prev = new Array(b.length + 1);
  let curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    let rowBest = curr[0];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      if (curr[j] < rowBest) rowBest = curr[j];
    }
    if (rowBest > limit) return limit + 1;
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }
  return prev[b.length];
}

/** Sorgunun harfleri hedefte sırayla geçiyor mu? Boşluklar cezalandırılır. */
function subsequenceScore(query, target) {
  let qi = 0;
  let gaps = 0;
  let lastIndex = -1;
  for (let ti = 0; ti < target.length && qi < query.length; ti += 1) {
    if (target[ti] !== query[qi]) continue;
    if (lastIndex >= 0 && ti - lastIndex > 1) gaps += ti - lastIndex - 1;
    lastIndex = ti;
    qi += 1;
  }
  if (qi < query.length) return 0;
  const density = query.length / (query.length + gaps);
  return density;
}

/** Tek kelimelik sorgu ↔ tek kelimelik hedef puanı. */
function scoreWord(query, word) {
  if (!query || !word) return 0;
  if (word === query) return 1;
  if (word.startsWith(query)) {
    // Uzun hedefte kısa sorgu biraz daha az kesin sayılır.
    return 0.93 - Math.min(0.1, (word.length - query.length) * 0.01);
  }

  const idx = word.indexOf(query);
  if (idx > 0) return 0.8 - Math.min(0.1, idx * 0.02);

  // Yazım hatası toleransı. Sınırı önce hesapla, Levenshtein'i o sınırla çağır:
  // erken çıkış değeri (limit + 1) daha geniş bir eşikle kıyaslanırsa
  // alakasız kelimeler eşleşmiş gibi görünür.
  const allowed = maxDistanceFor(Math.max(query.length, word.length));
  if (allowed > 0) {
    const distance = levenshtein(query, word, allowed);
    if (distance <= allowed) return 0.72 - distance * 0.08;
  }

  // Harf sırası korunuyorsa (baş harfler gibi) zayıf ama geçerli bir eşleşme.
  if (query.length >= 2) {
    const sub = subsequenceScore(query, word);
    if (sub >= 0.3) return 0.45 + sub * 0.15;
  }

  return 0;
}

/**
 * Bir sorgunun bir metne (eşya adı, etiket, karakter adı...) uygunluğu.
 * Her iki taraf da ham metin olarak verilir; normalizasyon burada yapılır.
 */
export function scoreMatch(rawQuery, rawTarget) {
  const query = normalizeTr(rawQuery).trim();
  const target = normalizeTr(rawTarget).trim();
  if (!query) return 0;
  if (!target) return 0;
  if (query === target) return 1;

  // Tüm sorgu, hedefin içinde aynen geçiyorsa en güçlü sinyal budur.
  if (target.startsWith(query)) return 0.96;
  const wholeIndex = target.indexOf(query);
  if (wholeIndex > 0) {
    const atWordStart = !/[a-z0-9]/.test(target[wholeIndex - 1]);
    return atWordStart ? 0.9 : 0.82;
  }

  const queryTokens = tokenize(query);
  const targetTokens = tokenize(target);
  if (queryTokens.length === 0 || targetTokens.length === 0) return 0;

  let total = 0;
  for (const qt of queryTokens) {
    let best = 0;
    for (const tt of targetTokens) {
      const s = scoreWord(qt, tt);
      if (s > best) best = s;
      if (best === 1) break;
    }
    // Sorgu kelimesi hedefin bütününde de aranır ("demircevheri" gibi bitişik yazım).
    if (best < 0.8) {
      const joined = targetTokens.join('');
      const s = scoreWord(qt, joined) * 0.9;
      if (s > best) best = s;
    }
    if (best < MATCH_THRESHOLD) return 0; // her kelime karşılık bulmalı
    total += best;
  }

  const mean = total / queryTokens.length;
  // Sorgu hedefin tamamını kapsıyorsa küçük bir bonus.
  const coverage = queryTokens.length / Math.max(targetTokens.length, queryTokens.length);
  return Math.min(0.99, mean * (0.9 + coverage * 0.1));
}

/**
 * Vurgulama için eşleşen aralık. Normalizasyon uzunluğu koruduğu için
 * normalize edilmiş metindeki konum ham metinde de geçerlidir.
 */
export function matchRange(rawQuery, rawTarget) {
  const query = normalizeTr(rawQuery).trim();
  if (!query) return null;
  const target = normalizeTr(rawTarget);
  const index = target.indexOf(query);
  if (index >= 0) return [index, index + query.length];

  // Çok kelimeli sorguda ilk kelimenin konumunu vurgula.
  const first = tokenize(query)[0];
  if (!first) return null;
  const i = target.indexOf(first);
  return i >= 0 ? [i, i + first.length] : null;
}
