# Kasadar — Alt Karakter Kasa Arama Motoru

MMORPG oynarken eşyalar birden fazla karakterin çantasına, kasa sekmelerine ve postasına
dağılır. Kasadar bu dağınıklığı tek bir aranabilir deftere çevirir: **"o malzeme hangi
karakterdeydi?"** sorusuna saniyeler içinde cevap verir.

- Sunucu yok, hesap yok, internet gerekmiyor — veri yalnızca senin tarayıcında durur.
- Kurulabilir uygulama (PWA): telefonda ve masaüstünde ana ekrana eklenir, çevrimdışı açılır.
- Yazım hatasına ve Türkçe karakterlere dayanıklı arama: **"iksır" yazınca "İksir" bulunur.**

---

## Kurulum

### En kolay yol: hiç kurulum yapma

`main` dalına her push'ta uygulama otomatik derlenip GitHub Pages'e yayınlanır. Bir kez
**Settings → Pages → Source: "GitHub Actions"** seçmen yeterli. Sonrasında adres:

```
https://ardacck100-rgb.github.io/Kasadar/
```

Telefonda o adresi aç → tarayıcı menüsünden **"Ana ekrana ekle"**. Artık normal bir
uygulama gibi açılır ve internet olmasa da çalışır.

### Bilgisayarda çalıştırmak istersen: iki komut

```bash
npm install
npm start
```

Terminalde "Local: http://localhost:5173/" yazısını görünce tarayıcıda o adresi aç.

Yayına hazır dosyaları üretmek için `npm run build` — çıktı `dist/` klasörüne düşer ve
göreli yollarla derlendiği için o klasörü herhangi bir statik sunucuya (ya da bir alt
klasöre) olduğu gibi koyabilirsin.

Ayar dosyası yok: Tailwind, Vite eklentisi üzerinden çalışıyor; `tailwind.config.js` ya da
`postcss.config.js` tutmuyoruz. Toplam yapılandırma tek dosya: `vite.config.js`.

---

## Neler var

**Arama** — Yazdıkça anlık sonuç. Türkçe karakterler normalize edilir (ı/i, ş/s, ğ/g, ü/u,
ö/o, ç/c), yazım hataları tolere edilir ("dmir cevherı" → *Demir Cevheri*). Sonuçlar eşya
adına göre gruplanır; bir eşya birden çok yerdeyse başlıkta **"Toplam: 340 adet, 3 yerde"**
özeti çıkar. Eşya adının yanı sıra etiket, karakter ve depo adı da aranır. Klavyeden `/`
tuşu her yerden arama kutusuna atlar.

**Envanter** — Masaüstünde sütunlu tablo, mobilde kart görünümü. Ada / adede / güncellemeye
/ konuma göre sıralama.

**Eşya ekleme** — Tek tek form ya da toplu yapıştırma. Toplu modda oyundan kopyaladığın
satırlar olduğu gibi yapıştırılır; ayrıştırıcı şu yazımların hepsini tanır:

```
Demir Cevheri x40      40x Demir Cevheri      Demir Cevheri, 40
Demir Cevheri ×40      Demir Cevheri (40)     Demir Cevheri 40
Demir Cevheri: 40      1.200 x Odun           Boş Şişe          → adet 1
Alev Tozu x12 #crafting @mor                  → satır içi etiket ve kalite
```

Yazdıkça önizleme gösterilir: hangi satır yeni kayıt olacak, hangisi mevcut kayda
eklenecek, hangisi okunamadı. "Aynı isim varsa adetleri topla" seçeneği varsayılan açıktır.

**Filtreler** — Karakter, depo tipi, kalite ve etiket. Aynı kategoride birden çok seçim
"veya", kategoriler arası "ve" demektir. Filtreler Ara ve Envanter ekranları arasında ortaktır.

**Etiketler** — Eşyalara serbest etiket verilir (`crafting`, `quest`, `satılık`…). Nerede
görürsen gör bir etikete tıklamak arama ekranını o etiketle açar.

**Bayat veri uyarısı** — Her depo son değiştirildiği tarihi tutar. Bir depoyu ya da
içindeki eşyaları değiştiren her işlem bu tarihi tazeler. 30 günden eski depolar listelerde
soluk gösterilir ve **"güncellenmeli"** rozeti alır; üstte kaç deponun bayatladığını
söyleyen bir şerit çıkar. Depo satırındaki `↻` düğmesi "kontrol ettim, güncel" demek için.

**Yedekleme** — Veri sekmesinden tüm veriyi tek JSON dosyası olarak indir, başka bir
cihazda geri yükle. Geri yükleme öncesi ne geleceğini (kaç karakter, kaç eşya) gösteren
bir onay çıkar.

---

## Dosya yapısı

```
index.html                Uygulama kabuğu, manifest ve ikon bağlantıları
vite.config.js            Tek yapılandırma dosyası (React + Tailwind eklentileri)
.github/workflows/        GitHub Pages'e otomatik yayın
public/
  manifest.webmanifest    PWA tanımı
  sw.js                   Service worker — çevrimdışı açılış
  icons/                  Uygulama ikonları (SVG kaynak + üretilmiş PNG'ler)
src/
  main.jsx                Giriş noktası; sağlayıcılar ve service worker kaydı
  App.jsx                 Görünüm yönlendirmesi ve "/" kısayolu
  index.css               Koyu tema, kalite renkleri, temel stiller
  lib/
    id.js                 Kimlik üretici
    date.js               Tarih biçimleme, "3 gün önce", bayatlık hesabı
    normalize.js          Türkçe normalizasyon (uzunluk korumalı)
    fuzzy.js              Yaklaşık eşleştirme, Levenshtein, puanlama
    parseBulk.js          Toplu yapıştırma ayrıştırıcısı
    download.js           JSON indirme / dosya okuma
    pwa.js                Service worker kaydı, kurulum istemi, çevrimiçi durumu
  data/
    schema.js             Veri modeli: sabitler, fabrikalar, normalizasyon
    storage.js            localStorage okuma/yazma, göç, yedek biçimi
    demo.js               Örnek veri
  search/
    searchItems.js        Filtreleme, puanlama, ada göre gruplama
  state/
    dbReducer.js          Tüm yazma işlemleri; art arda silme, tarih tazeleme
    DatabaseContext.jsx   Veri sağlayıcı + eylemler
    UiContext.jsx         Görünüm, arama metni, filtreler
    selectors.js          Türkçe sıralama, sayım, sözlükler
    bulk.js               Toplu eklemeyi planlama ve uygulama
  components/
    ui/                   Button, Fields, Modal, ConfirmDialog, EmptyState, Chips
    layout/AppShell.jsx   Üst bar + mobil alt gezinme
    search/               Arama kutusu ve sonuç grupları
    items/                Eşya formu, toplu ekleme, liste (tablo + kart)
    filters/FilterBar.jsx Karakter / depo tipi / kalite / etiket filtreleri
    characters/           Karakter listesi, detayı, formu
    storages/             Depo listesi ve formu
    data/DataView.jsx     Yedekleme, kurulum, tehlikeli işlemler
```

---

## Veri modeli

Uygulama tek bir JSON belgesi üzerinde çalışır. Bu belge aynı zamanda yedekleme
biçimidir; tarayıcıda `kasadar:db:v1` anahtarıyla saklanır.

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
    { "id": "itm_…", "storageId": "stg_…", "name": "Ay Çiçeği", "quantity": 140,
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
  çekilir, sahibi olmayan kayıtlar atılır, etiketler küçük harfe indirilip tekilleştirilir.
- Bozuk JSON silinmez; `kasadar:db:v1:bozuk:<zaman>` anahtarına taşınır.
