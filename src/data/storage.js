import { createEmptyDatabase, normalizeDatabase, SCHEMA_VERSION } from './schema.js';

/**
 * localStorage okuma/yazma katmanı.
 *
 * Uygulamanın geri kalanı localStorage'ı doğrudan hiç görmez; sadece bu
 * modüldeki fonksiyonları çağırır. Böylece ileride IndexedDB'ye ya da bir
 * sunucuya geçmek istenirse tek dosya değişir.
 */

export const STORAGE_KEY = 'kasadar:db:v1';

/* --------------------------- Depolama erişilebilirliği --------------------------- */

let memoryFallback = null;

function getBackend() {
  try {
    const probe = '__kasadar_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    // Gizli sekme, kısıtlı iframe veya kapatılmış site verisi.
    return null;
  }
}

/** Kalıcı depolama gerçekten çalışıyor mu? Arayüzde uyarı göstermek için. */
export function isPersistenceAvailable() {
  return getBackend() !== null;
}

/* -------------------------------- Okuma / yazma -------------------------------- */

export function loadDatabase() {
  const backend = getBackend();

  let raw;
  if (backend) {
    raw = backend.getItem(STORAGE_KEY);
  } else {
    raw = memoryFallback;
  }

  if (!raw) return createEmptyDatabase();

  try {
    return migrate(JSON.parse(raw));
  } catch {
    // Bozuk JSON: veriyi silmek yerine kenara ayır, kullanıcı kurtarmak isteyebilir.
    if (backend) {
      try {
        backend.setItem(`${STORAGE_KEY}:bozuk:${Date.now()}`, raw);
      } catch {
        /* yedeklenemedi, yapacak bir şey yok */
      }
    }
    return createEmptyDatabase();
  }
}

/** @returns {{ ok: boolean, error?: string }} */
export function saveDatabase(db) {
  const payload = JSON.stringify(db);
  const backend = getBackend();

  if (!backend) {
    memoryFallback = payload;
    return { ok: false, error: 'no-storage' };
  }

  try {
    backend.setItem(STORAGE_KEY, payload);
    return { ok: true };
  } catch (err) {
    const quotaExceeded =
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014);
    return { ok: false, error: quotaExceeded ? 'quota' : 'unknown' };
  }
}

export function clearDatabase() {
  memoryFallback = null;
  const backend = getBackend();
  if (backend) backend.removeItem(STORAGE_KEY);
}

/* --------------------------------- Sürüm göçü --------------------------------- */

/**
 * Eski sürümde yazılmış veriyi güncel şemaya taşır.
 * Şu an tek sürüm var; ileride "if (version < 2) { ... }" adımları buraya eklenecek.
 */
export function migrate(raw) {
  const version = Number(raw?.schemaVersion) || 0;

  if (version > SCHEMA_VERSION) {
    // Daha yeni bir sürümle yazılmış veri: tanımadığımız alanları koruyamayız,
    // ama normalize ederek en azından okunabilir kısmı gösteririz.
    return normalizeDatabase(raw);
  }

  return normalizeDatabase(raw);
}

/* ----------------------------- Sekmeler arası eşitleme ----------------------------- */

/**
 * Aynı tarayıcıda ikinci bir sekme veriyi değiştirdiğinde haber verir.
 * @param {(db: object) => void} onChange
 * @returns {() => void} aboneliği bırakan fonksiyon
 */
export function subscribeToExternalChanges(onChange) {
  if (typeof window === 'undefined') return () => {};

  const handler = (event) => {
    if (event.key !== STORAGE_KEY) return;
    if (!event.newValue) {
      onChange(createEmptyDatabase());
      return;
    }
    try {
      onChange(migrate(JSON.parse(event.newValue)));
    } catch {
      /* diğer sekme bozuk veri yazdıysa yok say */
    }
  };

  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

/* ------------------------------ Yedekleme yardımcıları ------------------------------ */
/* Butonları Kısım 4'te bağlanacak; format bugünden sabit. */

export function toBackupJson(db) {
  return JSON.stringify(
    { ...db, exportedAt: new Date().toISOString(), app: 'kasadar' },
    null,
    2,
  );
}

/** @returns {{ ok: true, db: object } | { ok: false, error: string }} */
export function parseBackupJson(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Dosya geçerli bir JSON değil.' };
  }

  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.characters)) {
    return { ok: false, error: 'Dosya bir Kasadar yedeğine benzemiyor.' };
  }

  return { ok: true, db: migrate(parsed) };
}
