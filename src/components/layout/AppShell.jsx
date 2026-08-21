import { useDatabase } from '../../state/DatabaseContext.jsx';
import { useUi } from '../../state/UiContext.jsx';

export const VIEWS = [
  { id: 'search', label: 'Ara', icon: '🔍' },
  { id: 'items', label: 'Envanter', icon: '📦' },
  { id: 'characters', label: 'Karakterler', icon: '🧝' },
  { id: 'data', label: 'Veri', icon: '💾' },
];

const PERSISTENCE_MESSAGES = {
  unavailable:
    'Tarayıcı depolaması kapalı (gizli sekme olabilir). Girdiğin veriler sekmeyi kapatınca kaybolur.',
  quota: 'Tarayıcı depolama alanı doldu. Son değişiklik kaydedilemedi.',
  error: 'Veri kaydedilemedi. Tarayıcı ayarlarını kontrol et.',
};

export function AppShell({ children }) {
  const { db, persistence } = useDatabase();
  const { view, setView } = useUi();

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="mx-auto w-full max-w-6xl px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setView('search')}
            className="flex items-center gap-2.5 min-w-0 text-left"
            title="Aramaya dön"
          >
            <span
              className="grid h-8 w-8 place-items-center rounded-lg bg-brand/15 border border-brand/25 text-base"
              aria-hidden="true"
            >
              🗝️
            </span>
            <div className="min-w-0 leading-tight">
              <div className="font-semibold tracking-tight truncate">Kasadar</div>
              <div className="text-[11px] text-ink-faint truncate hidden sm:block">
                alt karakter kasa arama motoru
              </div>
            </div>
          </button>

          <nav className="ml-auto hidden md:flex items-center gap-1" aria-label="Ana gezinme">
            {VIEWS.map((v) => (
              <TabButton
                key={v.id}
                active={view === v.id}
                onClick={() => setView(v.id)}
                icon={v.icon}
                label={v.label}
              />
            ))}
          </nav>

          <div className="ml-auto md:ml-0 text-right text-[11px] text-ink-faint leading-tight hidden sm:block">
            <div>
              {db.characters.length} karakter · {db.storages.length} depo
            </div>
            <div>{db.items.length} eşya kaydı</div>
          </div>
        </div>
      </header>

      {persistence !== 'ok' ? (
        <div className="border-b border-danger/25 bg-danger-dim/25">
          <p className="mx-auto w-full max-w-6xl px-4 py-2 text-xs text-danger">
            ⚠️ {PERSISTENCE_MESSAGES[persistence] ?? PERSISTENCE_MESSAGES.error}
          </p>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 pb-28 md:pb-10">{children}</main>

      {/* Mobil: alt gezinme çubuğu — başparmakla ulaşılabilir mesafede */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-line bg-panel/95 backdrop-blur-md [padding-bottom:env(safe-area-inset-bottom)]"
        aria-label="Ana gezinme"
      >
        <div className="grid grid-cols-4">
          {VIEWS.map((v) => {
            const active = view === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex flex-col items-center justify-center gap-0.5 h-16 text-[11px] transition-colors',
                  active ? 'text-brand' : 'text-ink-faint hover:text-ink-dim',
                ].join(' ')}
              >
                <span className="text-lg leading-none" aria-hidden="true">
                  {v.icon}
                </span>
                {v.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={[
        'inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm transition-colors',
        active
          ? 'bg-panel-3 text-ink border border-line-strong/60'
          : 'text-ink-dim hover:text-ink hover:bg-panel-2 border border-transparent',
      ].join(' ')}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}
