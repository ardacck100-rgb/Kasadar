/**
 * Çakışma ihtimali pratikte sıfır olan kısa kimlikler.
 * crypto.randomUUID yoksa (eski tarayıcı / güvensiz origin) yedek üretici devreye girer.
 */
export function uid(prefix = '') {
  let raw;
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    raw = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  } else {
    raw =
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8) +
      Math.random().toString(36).slice(2, 6);
  }
  return prefix ? `${prefix}_${raw}` : raw;
}
