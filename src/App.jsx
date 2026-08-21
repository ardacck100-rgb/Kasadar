import { useState } from 'react';

import { CharactersView } from './components/characters/CharactersView.jsx';
import { AppShell } from './components/layout/AppShell.jsx';
import { ComingSoon } from './components/layout/ComingSoon.jsx';

export default function App() {
  // Kısım 1'de çalışan tek ekran karakter yönetimi olduğu için varsayılan o.
  const [view, setView] = useState('characters');

  return (
    <AppShell view={view} onViewChange={setView}>
      {view === 'characters' ? <CharactersView /> : null}

      {view === 'search' ? (
        <ComingSoon
          icon="🔍"
          title="Arama motoru henüz bağlı değil"
          part="Kısım 3"
          description="Uygulama açılır açılmaz imlecin içinde olacağı arama kutusu burada duracak."
          bullets={[
            'Yazdıkça anlık sonuç',
            'Yazım hatasına dayanıklı yaklaşık (fuzzy) eşleşme',
            'Türkçe karakter normalizasyonu: "iksır" → "İksir"',
            'Karakter / depo tipi / kalite / etiket filtreleri',
          ]}
        />
      ) : null}

      {view === 'items' ? (
        <ComingSoon
          icon="📦"
          title="Eşya listesi henüz bağlı değil"
          part="Kısım 2"
          description="Depolara eşya girme ve envanteri görme ekranı bir sonraki adımda geliyor."
          bullets={[
            'Tek tek eşya ekleme formu',
            'Toplu yapıştırma modu: "Demir Cevheri x40" satırlarını ayrıştırır',
            'Masaüstünde tablo, mobilde kart görünümü',
          ]}
        />
      ) : null}
    </AppShell>
  );
}
