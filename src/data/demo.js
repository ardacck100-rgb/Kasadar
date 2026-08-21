import { createCharacter, createItem, createStorage } from './schema.js';

/**
 * "Örnek veriyi yükle" butonu için küçük bir başlangıç seti.
 * Üç karakter, altı depo ve birkaç eşya — uygulamayı boş ekranla
 * tanımak yerine dolu haliyle görmek için.
 */
export function buildDemoDatabase() {
  const zeyra = createCharacter({
    name: 'Zeyra',
    charClass: 'Büyücü',
    server: 'Anadolu',
    note: 'Ana karakter. Simya malzemeleri hep burada.',
  });
  const korkut = createCharacter({
    name: 'Korkut',
    charClass: 'Savaşçı',
    server: 'Anadolu',
    note: 'Madencilik ve demircilik alt karakteri.',
  });
  const ilkay = createCharacter({
    name: 'İlkay',
    charClass: 'Okçu',
    server: 'Bozkır',
    note: 'Satılık eşya deposu.',
  });

  const characters = [zeyra, korkut, ilkay];

  const storages = [
    createStorage({ characterId: zeyra.id, type: 'canta', name: 'Çanta' }),
    createStorage({ characterId: zeyra.id, type: 'kasa', name: 'Kasa 1 — Simya' }),
    createStorage({ characterId: korkut.id, type: 'kasa', name: 'Kasa 1 — Cevherler' }),
    createStorage({ characterId: korkut.id, type: 'kasa', name: 'Kasa 2 — Zırhlar' }),
    createStorage({ characterId: ilkay.id, type: 'posta', name: 'Posta' }),
    createStorage({ characterId: ilkay.id, type: 'lonca_kasasi', name: 'Lonca Kasası — Sekme 3' }),
  ];

  const [zeyraCanta, zeyraKasa, korkutCevher, korkutZirh, ilkayPosta, lonca] = storages;

  const items = [
    createItem({ storageId: zeyraCanta.id, name: 'Küçük Şifa İksiri', quantity: 24, quality: 'yesil', tags: ['sarf'] }),
    createItem({ storageId: zeyraKasa.id, name: 'Ay Çiçeği', quantity: 140, quality: 'gri', tags: ['crafting'] }),
    createItem({ storageId: zeyraKasa.id, name: 'Büyük Mana İksiri', quantity: 60, quality: 'mavi', tags: ['sarf'] }),
    createItem({ storageId: korkutCevher.id, name: 'Demir Cevheri', quantity: 240, quality: 'gri', tags: ['crafting'] }),
    createItem({ storageId: korkutCevher.id, name: 'Mithril Külçesi', quantity: 18, quality: 'mavi', tags: ['crafting', 'satılık'] }),
    createItem({ storageId: korkutZirh.id, name: 'Ejder Pulu Zırh', quantity: 1, quality: 'mor', tags: ['ekipman'] }),
    createItem({ storageId: ilkayPosta.id, name: 'Demir Cevheri', quantity: 80, quality: 'gri', tags: ['crafting'] }),
    createItem({ storageId: ilkayPosta.id, name: 'Gölge Yayı', quantity: 1, quality: 'turuncu', tags: ['ekipman', 'satılık'] }),
    createItem({ storageId: lonca.id, name: 'Demir Cevheri', quantity: 20, quality: 'gri', tags: ['crafting'] }),
    createItem({ storageId: lonca.id, name: 'Kadim Parşömen', quantity: 3, quality: 'mor', tags: ['quest'] }),
  ];

  return { characters, storages, items };
}
