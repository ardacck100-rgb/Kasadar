import { characterStats } from '../../state/selectors.js';
import { useDatabase } from '../../state/DatabaseContext.jsx';
import { Button } from '../ui/Button.jsx';

export function CharacterDetail({ character, onEdit, onDelete, onBack, children }) {
  const { db } = useDatabase();
  const stats = characterStats(db, character.id);

  return (
    <section className="space-y-5">
      <div className="panel p-4 sm:p-5">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="lg:hidden mb-3 -ml-1 inline-flex items-center gap-1.5 text-sm text-ink-dim hover:text-ink"
          >
            <span aria-hidden="true">←</span> Karakterler
          </button>
        ) : null}

        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold tracking-tight truncate">{character.name}</h2>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {character.charClass ? <Chip>{character.charClass}</Chip> : null}
              {character.server ? <Chip>{character.server}</Chip> : null}
              {!character.charClass && !character.server ? (
                <span className="text-xs text-ink-faint">sınıf / sunucu girilmemiş</span>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button size="sm" variant="secondary" onClick={onEdit}>
              Düzenle
            </Button>
            <Button size="sm" variant="danger" onClick={onDelete}>
              Sil
            </Button>
          </div>
        </div>

        {character.note ? (
          <p className="mt-3 text-sm text-ink-dim leading-relaxed border-l-2 border-line-strong/60 pl-3">
            {character.note}
          </p>
        ) : null}

        <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3">
          <Stat label="Depo" value={stats.storageCount} />
          <Stat label="Eşya kaydı" value={stats.rows} />
          <Stat label="Toplam adet" value={stats.quantity.toLocaleString('tr-TR')} />
        </dl>
      </div>

      {children}
    </section>
  );
}

function Chip({ children }) {
  return (
    <span className="rounded-md border border-line bg-panel-2 px-2 py-0.5 text-xs text-ink-dim">
      {children}
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
