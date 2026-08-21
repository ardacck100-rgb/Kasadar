# Kasadar — Alt Karakter Kasa Arama Motoru

MMORPG oynarken eşyalar birden fazla karakterin çantasına, kasa sekmelerine ve postasına
dağılır. Kasadar bu dağınıklığı tek bir aranabilir deftere çevirir: **"o malzeme hangi
karakterdeydi?"** sorusuna saniyeler içinde cevap verir.

- Backend yok — tüm veri tarayıcıdaki `localStorage` içinde durur.
- React + Vite + Tailwind CSS.
- Koyu tema, masaüstünde iki sütunlu görünüm, mobilde dokunmatik dostu kartlar.

## Kurulum

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ klasörüne üretim çıktısı
npm run preview  # üretim çıktısını yerelde dene
```

## Dosya yapısı

```
index.html                Uygulama kabuğu, meta etiketleri
vite.config.js            Vite + React + Tailwind eklentileri
src/
  main.jsx                Giriş noktası, DatabaseProvider'ı bağlar
  App.jsx                 Görünüm (Ara / Envanter / Karakterler) yönlendirmesi
  index.css               Tailwind teması: renkler, koyu zemin, kalite renkleri
  lib/
    id.js                 Çakışmayan kısa kimlik üretici
    date.js               Tarih biçimleme, "3 gün önce", bayatlık hesabı
  data/
    schema.js             Veri modeli: sabitler, fabrikalar, normalizasyon
    storage.js            localStorage okuma/yazma, göç, yedek JSON yardımcıları
    demo.js               "Örnek veriyi yükle" için başlangıç seti
  state/
    dbReducer.js          Tüm yazma işlemleri (ekle/güncelle/sil, art arda silme)
    DatabaseContext.jsx   Veriyi sağlayan React context'i + eylemler
    selectors.js          Türkçe sıralama, sayım ve arama yardımcıları
  components/
    ui/                   Button, Fields, Modal, ConfirmDialog, EmptyState
    layout/               AppShell (üst bar + mobil alt gezinme), ComingSoon
    characters/           Karakter listesi, detayı ve formu
    storages/             Depo listesi ve formu
```

## Veri modeli

Uygulama tek bir JSON belgesi üzerinde çalışır; bu belge aynı zamanda yedekleme
formatıdır (`kasadar:db:v1` anahtarıyla saklanır).

```jsonc
{
  "schemaVersion": 1,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z",

  "characters": [
    { "id": "chr_…", "name": "Zeyra", "charClass": "Büyücü", "server": "Anadolu",
      "note": "", "createdAt": "…", "updatedAt": "…" }
  ],

  "storages": [
    { "id": "stg_…", "characterId": "chr_…",
      "type": "canta | kasa | posta | lonca_kasasi",
      "name": "Kasa 1 — Simya", "note": "", "createdAt": "…", "updatedAt": "…" }
  ],

  "items": [
    { "id": "itm_…", "storageId": "stg_…", "name": "Demir Cevheri", "quantity": 40,
      "quality": "gri | yesil | mavi | mor | turuncu",
      "tags": ["crafting"], "note": "", "createdAt": "…", "updatedAt": "…" }
  ]
}
```

Kurallar:

- Bir karakter silinince depoları, bir depo silinince eşyaları da silinir.
- Bir depoyu ya da içeriğini değiştiren her işlem deponun `updatedAt` alanını tazeler;
  bayat veri uyarısı bu alana bakar.
- Dışarıdan gelen veri (`localStorage` ya da içe aktarılan dosya) `normalizeDatabase`
  ile süzülür: eksik alanlar tamamlanır, tanınmayan tip/kalite değerleri varsayılana
  çekilir, sahibi olmayan kayıtlar atılır.

## Yol haritası

| Kısım | Kapsam | Durum |
|-------|--------|-------|
| 1 | Proje kurulumu, veri modeli, localStorage katmanı, karakter + depo yönetimi | ✅ tamam |
| 2 | Eşya ekleme (tekli + toplu yapıştırma) ve eşya listesi | ⏳ sırada |
| 3 | Arama motoru, fuzzy eşleşme, Türkçe normalizasyon, filtreler | ⏳ |
| 4 | Etiketler, bayat veri uyarısı, JSON yedekleme, PWA yapılandırması | ⏳ |
