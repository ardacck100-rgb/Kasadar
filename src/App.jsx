import { useEffect } from 'react';

import { CharactersView } from './components/characters/CharactersView.jsx';
import { DataView } from './components/data/DataView.jsx';
import { ItemsView } from './components/items/ItemsView.jsx';
import { AppShell } from './components/layout/AppShell.jsx';
import { SearchView } from './components/search/SearchView.jsx';
import { useUi } from './state/UiContext.jsx';

export default function App() {
  const { view, setView, focusSearch } = useUi();

  // "/" her yerden arama kutusuna atlar — klavyedeki en kısa yol.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      const typing =
        el instanceof HTMLElement &&
        (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (typing) return;
      e.preventDefault();
      setView('search');
      // Görünüm değiştikten sonra odaklan.
      requestAnimationFrame(focusSearch);
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [setView, focusSearch]);

  return (
    <AppShell>
      {view === 'search' ? <SearchView /> : null}
      {view === 'items' ? <ItemsView /> : null}
      {view === 'characters' ? <CharactersView /> : null}
      {view === 'data' ? <DataView /> : null}
    </AppShell>
  );
}
