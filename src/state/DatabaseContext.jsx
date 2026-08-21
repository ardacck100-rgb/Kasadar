import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';

import { createCharacter, createStorage } from '../data/schema.js';
import {
  isPersistenceAvailable,
  loadDatabase,
  saveDatabase,
  subscribeToExternalChanges,
} from '../data/storage.js';
import { dbReducer } from './dbReducer.js';

const DatabaseContext = createContext(null);

export function DatabaseProvider({ children }) {
  // İlk durum doğrudan localStorage'dan okunur; boş ekran yanıp sönmesi olmaz.
  const [db, dispatch] = useReducer(dbReducer, undefined, loadDatabase);
  const [persistence, setPersistence] = useState(() =>
    isPersistenceAvailable() ? 'ok' : 'unavailable',
  );

  // Her değişiklikten sonra diske yaz.
  useEffect(() => {
    const result = saveDatabase(db);
    if (result.ok) {
      setPersistence('ok');
    } else if (result.error === 'no-storage') {
      setPersistence('unavailable');
    } else if (result.error === 'quota') {
      setPersistence('quota');
    } else {
      setPersistence('error');
    }
  }, [db]);

  // Başka bir sekme veriyi değiştirdiyse buraya da yansıt.
  useEffect(
    () => subscribeToExternalChanges((incoming) => dispatch({ type: 'db/replace', db: incoming })),
    [],
  );

  const actions = useMemo(
    () => ({
      addCharacter(data) {
        const character = createCharacter(data);
        dispatch({ type: 'character/add', character });
        return character;
      },
      updateCharacter(id, patch) {
        dispatch({ type: 'character/update', id, patch });
      },
      removeCharacter(id) {
        dispatch({ type: 'character/remove', id });
      },

      addStorage(data) {
        const storage = createStorage(data);
        dispatch({ type: 'storage/add', storage });
        return storage;
      },
      updateStorage(id, patch) {
        dispatch({ type: 'storage/update', id, patch });
      },
      removeStorage(id) {
        dispatch({ type: 'storage/remove', id });
      },
      touchStorage(id) {
        dispatch({ type: 'storage/touch', id });
      },

      replaceDatabase(next) {
        dispatch({ type: 'db/replace', db: next });
      },
      resetDatabase() {
        dispatch({ type: 'db/reset' });
      },
    }),
    [],
  );

  const value = useMemo(() => ({ db, actions, persistence }), [db, actions, persistence]);

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

export function useDatabase() {
  const ctx = useContext(DatabaseContext);
  if (!ctx) throw new Error('useDatabase yalnızca <DatabaseProvider> içinde kullanılabilir.');
  return ctx;
}

/** Sık kullanılan kısayol: sadece veriye ihtiyaç duyan bileşenler için. */
export function useDb() {
  return useDatabase().db;
}

/** Aynı seçici mantığını her yerde tekrarlamamak için küçük yardımcı. */
export function useSelector(selector) {
  const { db } = useDatabase();
  const stable = useCallback(selector, [selector]);
  return useMemo(() => stable(db), [db, stable]);
}
