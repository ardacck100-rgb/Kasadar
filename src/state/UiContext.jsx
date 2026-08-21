import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { EMPTY_FILTERS } from '../search/searchItems.js';

/**
 * Görünümler arası küçük durum: hangi sekmedeyiz, arama metni, filtreler.
 * Filtreler Ara ve Envanter ekranları arasında ortaktır; bir etikete
 * tıklayınca arama ekranına o filtreyle geçebilmeyi bu sağlar.
 */
const UiContext = createContext(null);

export function UiProvider({ children }) {
  const [view, setView] = useState('search');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const searchInputRef = useRef(null);

  const focusSearch = useCallback(() => {
    const input = searchInputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, []);

  const toggleFilter = useCallback((kind, value) => {
    setFilters((current) => {
      const list = current[kind];
      return {
        ...current,
        [kind]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  }, []);

  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  /** Bir etikete tıklandığında: arama ekranına geç, yalnızca o etiketi göster. */
  const openTag = useCallback((tag) => {
    setQuery('');
    setFilters({ ...EMPTY_FILTERS, tags: [tag] });
    setView('search');
  }, []);

  /** Bir karakterin envanterini aç. */
  const openCharacter = useCallback((characterId) => {
    setQuery('');
    setFilters({ ...EMPTY_FILTERS, characterIds: [characterId] });
    setView('items');
  }, []);

  const value = useMemo(
    () => ({
      view,
      setView,
      query,
      setQuery,
      filters,
      setFilters,
      toggleFilter,
      clearFilters,
      openTag,
      openCharacter,
      searchInputRef,
      focusSearch,
    }),
    [view, query, filters, toggleFilter, clearFilters, openTag, openCharacter, focusSearch],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi yalnızca <UiProvider> içinde kullanılabilir.');
  return ctx;
}
