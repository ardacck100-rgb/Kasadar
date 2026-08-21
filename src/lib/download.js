/** Metni dosya olarak indirtir. Tarayıcı dışına hiçbir şey gönderilmez. */
export function downloadText(filename, text, type = 'application/json') {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Safari'nin indirmeyi başlatmasına zaman tanı.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Dosya okunamadı.'));
    reader.readAsText(file);
  });
}

/** kasadar-yedek-2026-08-21.json */
export function backupFileName() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `kasadar-yedek-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
}
