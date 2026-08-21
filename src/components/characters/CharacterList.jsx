import { characterStats } from '../../state/selectors.js';
import { useDatabase } from '../../state/DatabaseContext.jsx';
import { Button } from '../ui/Button.jsx';

export function CharacterList({ characters, selectedId, onSelect, onAdd }) {
  const { db } = useDatabase();

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-dim">
          Karakterler
          <span className="ml-2 text-ink-faint font-normal normal-case tracking-normal">
            {characters.length}
          </span>
        </h2>
        <Button size="sm" variant="primary" className="ml-auto" onClick={onAdd}>
          + Yeni
        </Button>
      </div>

      <ul className="space-y-2">
        {characters.map((character) => {
          const stats = characterStats(db, character.id);
          const active = character.id === selectedId;

          return (
            <li key={character.id}>
              <button
                type="button"
                onClick={() => onSelect(character.id)}
                aria-current={active ? 'true' : undefined}
                className={[
                  'w-full text-left rounded-xl border p-3 transition-colors',
                  active
                    ? 'bg-panel-3 border-brand/40'
                    : 'bg-panel border-line hover:border-line-strong/70 hover:bg-panel-2',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{character.name}</span>
                  {active ? (
                    <span className="ml-auto text-brand text-xs shrink-0" aria-hidden="true">
                      ●
                    </span>
                  ) : null}
                </div>

                <p className="mt-0.5 text-xs text-ink-dim truncate">
                  {[character.charClass, character.server].filter(Boolean).join(' · ') ||
                    'sınıf / sunucu girilmemiş'}
                </p>

                <p className="mt-1.5 text-[11px] text-ink-faint">
                  {stats.storageCount} depo · {stats.rows} eşya kaydı
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
