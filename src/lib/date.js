export function nowIso() {
  return new Date().toISOString();
}

/** Geçersiz/boş tarihlerde null döner, çağıran taraf kendi metnini yazar. */
export function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function daysSince(value) {
  const d = toDate(value);
  if (!d) return Infinity;
  const diffMs = Date.now() - d.getTime();
  return Math.floor(diffMs / 86_400_000);
}

/** Kısım 4'teki "bayat veri" rozeti bu eşiği kullanacak. */
export function isStale(value, thresholdDays = 30) {
  return daysSince(value) >= thresholdDays;
}

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function formatDate(value) {
  const d = toDate(value);
  return d ? dateFormatter.format(d) : '—';
}

/** "3 gün önce", "bugün" gibi kısa ve okunur ifadeler. */
export function formatRelative(value) {
  const d = toDate(value);
  if (!d) return 'hiç güncellenmedi';

  const days = daysSince(value);
  if (days <= 0) return 'bugün';
  if (days === 1) return 'dün';
  if (days < 30) return `${days} gün önce`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ay önce`;

  const years = Math.floor(days / 365);
  return `${years} yıl önce`;
}
