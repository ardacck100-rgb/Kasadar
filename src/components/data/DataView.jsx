import { useRef, useState } from 'react';

import { buildDemoDatabase } from '../../data/demo.js';
import { STALE_AFTER_DAYS } from '../../data/schema.js';
import { STORAGE_KEY, parseBackupJson, toBackupJson } from '../../data/storage.js';
import { formatDate, isStale } from '../../lib/date.js';
import { backupFileName, downloadText, readFileAsText } from '../../lib/download.js';
import { useInstallPrompt, useOnlineStatus } from '../../lib/pwa.js';
import { useDatabase } from '../../state/DatabaseContext.jsx';
import { Button } from '../ui/Button.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';

export function DataView() {
  const { db, actions, persistence } = useDatabase();
  const fileInputRef = useRef(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [message, setMessage] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const { canInstall, installed, install } = useInstallPrompt();
  const online = useOnlineStatus();

  const staleCount = db.storages.filter((s) => isStale(s.updatedAt, STALE_AFTER_DAYS)).length;
  const approxSize = new Blob([JSON.stringify(db)]).size;

  function handleExport() {
    downloadText(backupFileName(), toBackupJson(db));
    setMessage({ tone: 'ok', text: 'Yedek indirildi.' });
  }

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const text = await readFileAsText(file);
      const result = parseBackupJson(text);
      if (!result.ok) {
        setMessage({ tone: 'error', text: result.error });
        return;
      }
      setPendingImport({ db: result.db, fileName: file.name });
    } catch {
      setMessage({ tone: 'error', text: 'Dosya okunamadı.' });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold tracking-tight">Veri</h1>

      {message ? (
        <p
          className={`rounded-xl border px-3 py-2 text-sm ${
            message.tone === 'error'
              ? 'border-danger/30 bg-danger-dim/25 text-danger'
              : 'border-ok/30 bg-ok/10 text-ok'
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <section className="panel p-4 sm:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-dim">Özet</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Karakter" value={db.characters.length} />
          <Stat label="Depo" value={db.storages.length} />
          <Stat label="Eşya kaydı" value={db.items.length} />
          <Stat
            label="Bayat depo"
            value={staleCount}
            hint={staleCount > 0 ? `${STALE_AFTER_DAYS} günden eski` : 'hepsi güncel'}
          />
        </dl>
        <p className="mt-3 border-t border-line pt-3 text-xs text-ink-faint">
          Son değişiklik {formatDate(db.updatedAt)} · yaklaşık {(approxSize / 1024).toFixed(1)} KB ·
          tarayıcı anahtarı <code className="text-ink-dim">{STORAGE_KEY}</code>
          {persistence !== 'ok' ? ' · ⚠️ kalıcı kayıt çalışmıyor' : ''}
        </p>
      </section>

      <section className="panel p-4 sm:p-5 space-y-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-dim">Yedekleme</h2>
          <p className="mt-1 text-sm text-ink-dim leading-relaxed">
            Bütün veri yalnızca bu tarayıcıda duruyor. Tarayıcı verisini temizlersen ya da başka
            bir cihaza geçersen kaybolur — arada bir yedek al.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="primary" onClick={handleExport}>
            ⭳ Yedeği indir (JSON)
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            ⭱ Yedekten geri yükle
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      </section>

      <section className="panel p-4 sm:p-5 space-y-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-dim">Uygulama</h2>
          <p className="mt-1 text-sm text-ink-dim leading-relaxed">
            Kasadar kurulabilir bir uygulamadır: ana ekrana ekleyince tarayıcı çubuğu olmadan,
            internet olmadan da açılır.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {installed ? (
            <span className="rounded-lg border border-ok/30 bg-ok/10 px-3 py-1.5 text-sm text-ok">
              ✓ Uygulama olarak kurulu
            </span>
          ) : canInstall ? (
            <Button variant="primary" onClick={install}>
              ⤓ Uygulamayı yükle
            </Button>
          ) : (
            <span className="text-sm text-ink-faint">
              Tarayıcı menüsünden “Ana ekrana ekle” / “Uygulamayı yükle” ile kurabilirsin.
            </span>
          )}

          <span className="ml-auto text-xs text-ink-faint">
            {online ? '🌐 çevrimiçi' : '📴 çevrimdışı — veriye yine erişebilirsin'}
          </span>
        </div>
      </section>

      <section className="panel p-4 sm:p-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-dim">Tehlikeli bölge</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="secondary" onClick={() => setConfirm('demo')}>
            Örnek veriyi yükle
          </Button>
          <Button variant="danger" onClick={() => setConfirm('reset')}>
            Tüm veriyi sil
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={pendingImport !== null}
        onClose={() => setPendingImport(null)}
        title="Yedeği geri yükle"
        confirmLabel="Geri yükle"
        description={
          pendingImport
            ? `"${pendingImport.fileName}" içinde ${pendingImport.db.characters.length} karakter, ${pendingImport.db.storages.length} depo ve ${pendingImport.db.items.length} eşya kaydı var. Şu anki veri tamamen değiştirilecek.`
            : undefined
        }
        onConfirm={() => {
          actions.replaceDatabase(pendingImport.db);
          setMessage({ tone: 'ok', text: 'Yedek geri yüklendi.' });
          setPendingImport(null);
        }}
      />

      <ConfirmDialog
        open={confirm === 'demo'}
        onClose={() => setConfirm(null)}
        title="Örnek veriyi yükle"
        confirmLabel="Yükle"
        danger={false}
        description="Şu anki veri örnek veriyle değiştirilecek. Önce yedek almak isteyebilirsin."
        onConfirm={() => {
          actions.replaceDatabase(buildDemoDatabase());
          setMessage({ tone: 'ok', text: 'Örnek veri yüklendi.' });
        }}
      />

      <ConfirmDialog
        open={confirm === 'reset'}
        onClose={() => setConfirm(null)}
        title="Tüm veriyi sil"
        confirmLabel="Her şeyi sil"
        description="Bütün karakterler, depolar ve eşya kayıtları silinecek. Bu işlem geri alınamaz."
        onConfirm={() => {
          actions.resetDatabase();
          setMessage({ tone: 'ok', text: 'Tüm veri silindi.' });
        }}
      />
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums">{value}</dd>
      {hint ? <p className="text-[11px] text-ink-faint">{hint}</p> : null}
    </div>
  );
}
