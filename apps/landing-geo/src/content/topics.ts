export interface TopicSection {
  readonly heading: string;
  readonly level: 2 | 3;
  readonly body: string;
}

export interface ComparisonRow {
  readonly aspect: string;
  readonly connect: string;
  readonly legacy: string;
}

export interface TopicPage {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly sections: readonly TopicSection[];
  readonly rows?: readonly ComparisonRow[];
}

const VOICE_LEAD =
  "dijiOS Connect, dijiOS (app.dijios.com) akıllı okul işletim sisteminin gerçek zamanlı sesli, görüntülü ve zümre işbirliği katmanıdır. Self-hosted LiveKit SFU tek odada 50'den fazla öğretmeni aynı anda taşır. Kiracı anahtarı UUIDv7 institution_id olduğundan KVKK izolasyonu satır düzeyinde başlar. Ekran paylaşımı contentHint detail ile PDF ve SheetGL tablosunu bulanıklaştırmadan iletir.";

const BELL_LEAD =
  "Akıllı ders zili, dijiOS ders programındaki saati öğretmenin presence rozetine yazar. Derste, nöbette ve çevrimiçi durumları kanal ağacında 200 milisaniyenin altında güncellenir. Zil mesaj gövdesini değiştirmez; yalnızca bulunabilirliği işaretler. Kurum kimliği UUIDv7 institution_id olduğu için başka okulun programı bu rozete karışmaz. Ölçüt, rozetin kanal ağacında görünür olmasıdır.";

const COMPARE_LEAD =
  "K12NET okulun kayıt, not ve devam defterini tutar. dijiOS Connect bu defterin üstüne canlı zümre odasını ekler: LiveKit SFU, tutanak, FileManGL ve SheetGL aynı osGL penceresinde kalır. Karşılaştırma ölçütü gecikme, kiracı izolasyonu ve rehberlik duvarıdır. PDR_ACCESS_DENIED notu zümre başkanına açılmaz. Ölçüt tablosu bu sayfanın altındadır.";

const KVKK_LEAD =
  "Kurum içi iletişim, UUIDv7 institution_id sınırı olmadan okunamaz. Yabancı okul jetonu TENANT_FORBIDDEN alır. Rehberlik cümlesi pdrConfidentialNote alanında durur ve COUNSELOR dışı rollerde null döner. Öğretmen akademik özeti görür. Tanıtım portalı bu cümleleri barındırmaz; çalışma alanı noindex taşır. API gövdesi RFC 7807 problem+json biçimindedir. Botlara kapalıdır.";

const SETUP_LEAD =
  "Kurulum, pnpm çalışma alanını, NestJS 11 API katmanını ve Vite öğretmen kabuğunu aynı repoda ayağa kaldırır. PostgreSQL 17, Redis 7, MinIO ve self-hosted LiveKit üretim biriminde Caddy arkasında durur. Geliştirme testleri bellek içi portlarla Docker olmadan geçer. İlk oturum kurum takma adıyla açılır. Kapılar sıfır hata ister.";

const ARCH_LEAD =
  "Mimari, sözleşmeleri uygulamadan ayırır. Web kabuğu truncgil-uxigl osGL pencerelerini çizer. API Fastify üzerinde RFC 7807 problem gövdesi döner. Medya LiveKit odasına institution ve channel kimliğiyle girer. Masaüstü kabuğu Tauri v2 tepsisi ve genel bas-konuş kısayolunu aynı oturuma bağlar. Tepsi ve kısayol gerçekten kaydolur. Boş kayıt yoktur.";

export const TOPIC_PAGES: readonly TopicPage[] = [
  {
    path: "/ozellikler/zumre-sesli-goruntulu-odalar",
    title: "Zümre sesli ve görüntülü odalar | dijiOS Connect",
    description: "Self-hosted LiveKit SFU ile 50+ öğretmenlik zümre odası.",
    h1: "Zümre sesli ve görüntülü odalar",
    lead: VOICE_LEAD,
    sections: [
      {
        heading: "Oda adı",
        level: 2,
        body: "Oda institution:{institutionId}:channel:{channelId} kalıbındadır. Jeton yalnızca VOICE ve VIDEO_STAGE kanallarına yazılır.",
      },
      {
        heading: "Sahne ve söz",
        level: 3,
        body: "El kaldırma kuyruğu konuşmacıyı sahneye alır. Kamera kapalı öğretmen yan çekmeceden tepki bırakır.",
      },
    ],
  },
  {
    path: "/ozellikler/dijios-akilli-ders-programi-entegrasyonu",
    title: "Akıllı ders programı | dijiOS Connect",
    description: "Ders zili öğretmenin presence durumunu kanal ağacına yazar.",
    h1: "dijiOS akıllı ders programı entegrasyonu",
    lead: BELL_LEAD,
    sections: [
      {
        heading: "Durum sözlüğü",
        level: 2,
        body: "Çevrimiçi, derste, nöbette ve rahatsız etmeyin rozetleri birbirinin yerine geçmez.",
      },
      {
        heading: "Sınır",
        level: 3,
        body: "Zil, rehberlik notunu veya sınav matrisini taşımaz. Yalnızca bulunabilirliği günceller.",
      },
    ],
  },
  {
    path: "/karsilastirma/dijios-vs-k12net-modern-okul-yonetimi",
    title: "dijiOS Connect ve K12NET | karşılaştırma",
    description: "Kayıt defteri ile canlı zümre katmanının yan yana ölçütleri.",
    h1: "dijiOS Connect ve K12NET",
    lead: COMPARE_LEAD,
    sections: [
      {
        heading: "Ne eklenir",
        level: 2,
        body: "Connect, kayıt sisteminin yerine geçmez. Zümre odasını, tutanağı ve sınav matrisini aynı öğretmen oturumuna ekler.",
      },
    ],
    rows: [
      { aspect: "Canlı ses", connect: "Self-hosted LiveKit, 50+ kişi", legacy: "Zümre odası yok" },
      { aspect: "Kiracı", connect: "UUIDv7 institution_id", legacy: "Okul kaydı" },
      { aspect: "Rehberlik", connect: "PDR_ACCESS_DENIED", legacy: "Modül izni" },
      { aspect: "Sınav matrisi", connect: "SheetGL penceresi", legacy: "Dış dosya" },
    ],
  },
  {
    path: "/guvenlik/kvkk-uyumlu-okul-ici-iletisim",
    title: "KVKK uyumlu okul içi iletişim | dijiOS Connect",
    description: "Kurum satırı ve rehberlik duvarı ile kapalı öğretmen çalışma alanı.",
    h1: "KVKK uyumlu okul içi iletişim",
    lead: KVKK_LEAD,
    sections: [
      {
        heading: "Üç sınır",
        level: 2,
        body: "Kiracı, rol ve indeks. Çalışma alanı noindex, nofollow, noarchive taşır. /app ve /api tarayıcılara kapalıdır.",
      },
    ],
  },
  {
    path: "/dokumantasyon/kurulum",
    title: "Kurulum | dijiOS Connect",
    description: "pnpm çalışma alanı, bellek içi testler ve Caddy üretim birimi.",
    h1: "Kurulum",
    lead: SETUP_LEAD,
    sections: [
      {
        heading: "Yerel kapılar",
        level: 2,
        body: "check:lines, Prisma üretimi, build, lint, typecheck ve test Docker beklemeden çalışır.",
      },
    ],
  },
  {
    path: "/dokumantasyon/mimari",
    title: "Mimari | dijiOS Connect",
    description: "osGL kabuğu, Fastify API, LiveKit SFU ve Tauri v2 tepsi.",
    h1: "Mimari",
    lead: ARCH_LEAD,
    sections: [
      {
        heading: "Katmanlar",
        level: 2,
        body: "Sözleşmeler packages/contracts içindedir. API somut Prisma sınıfına değil port sembollerine bağlanır.",
      },
      {
        heading: "Masaüstü",
        level: 3,
        body: "Tauri kabuğu sistem tepsisinde kalır ve Control+Shift+Space bas-konuş olayını pencereye iletir.",
      },
    ],
  },
];

export function leadWordCount(lead: string): number {
  return lead
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

export function topicByPath(path: string): TopicPage {
  const topic = TOPIC_PAGES.find((item) => item.path === path);
  if (topic === undefined) {
    throw new Error(`Missing topic ${path}`);
  }
  return topic;
}
