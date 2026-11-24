# dijiOS Connect (`Dijios_discord`)

[![Ekosistem: dijiOS](https://img.shields.io/badge/Ekosistem-dijiOS%20ERP%20%2F%20SIS-002147)](https://app.dijios.com/)
[![Tasarım Sistemi: truncgil-uxigl](https://img.shields.io/badge/UI%20Engine-truncgil--uxigl%20(osGL)-457B9D)](https://uxigl.truncgil.com/demos/osgl)
[![Mimari: SOLID & <=300 LOC](https://img.shields.io/badge/Mimari-SOLID%20%7C%20Max%20300%20LOC-10B981)](./implementation_plan.md)

**dijiOS Connect**, [dijiOS Akıllı Okul İşletim Sistemi (`app.dijios.com`)](https://app.dijios.com/) için geliştirilen; öğretmenlerin, zümre başkanlarının, PDR uzmanlarının ve okul idarecilerinin **Discord mantığıyla oda oda sesli, görüntülü, ekran paylaşımlı ve yazılı** iletişim kurabildiği yeni nesil akademik işbirliği platformudur.

---

## Temel Mimari Özellikler

- **`osGL` × Apple HIG Masaüstü Deneyimi:** [`truncgil-uxigl`](https://uxigl.truncgil.com/demos/osgl) kütüphanesinin WebGL2 + WASM destekli Liquid Glass masaüstü kabuğu, çift sütunlu zümre kanal ağacı ve çoklu yüzen pencerelerle birleştirilmiştir.
- **50+ Kişilik Gerçek Zamanlı Ses, HD Video ve Ekran Paylaşımı:** Kendi sunucunuzda barındırılan (**Self-Hosted LiveKit SFU**) WebRTC altyapısı ile tek tıkla odaya bağlanma, akıllı tahta/belge odaklı 1080p ekran paylaşımı ve öğretmenler odası gürültü engelleme.
- **Tam `dijiOS` Entegrasyonu:** Kurum/Kampüs izolasyonu (Multi-Tenant), otomatik zümre odaları, canlı ders programı durumu (*"Şu an 10-A Matematik Dersinde"*) ve Öğrenci 360° / `SheetGL` / `FileManGL` akademik araç pencereleri.
- **SEO & GEO (Generative Engine Optimization) Uyumluluğu:** Geleneksel arama motorları ve yapay zeka yanıt motorları (ChatGPT, Gemini, Perplexity, Claude) için `llms.txt`, `JSON-LD Schema.org` varlık grafiği ve yüksek hızlı SSR/SSG keşif katmanı.
- **Katı Mühendislik Standartları:**
  - **SOLID & Clean Architecture:** Tam bağımlılık tersine çevirme (DIP) ve paylaşımlı TypeScript kontratları.
  - **Maksimum 300 Satır Kuralı (`<= 300 LOC`):** Hiçbir kaynak kod dosyası 300 satırı aşamaz (ESLint + CI Gate ile zorunlu).
  - **Atomik Commit Disiplini:** Her değişiklik tek sorumluluklu, Conventional Commits uyumlu atomik adımlarla ilerler.

---

## Ana Referans Belgesi

Projenin uçtan uca tüm teknik mimarisi, veritabanı şeması, WebRTC ve SSO akış diyagramları, tasarım tokenları ve Faz 0 – Faz 7 arasındaki 36 atomik görevin tamamı aşağıdaki ana referans belgesinde yer almaktadır:

👉 **[`implementation_plan.md` — Uçtan Uca Mimari ve Uygulama Referans Planı](./implementation_plan.md)**

---

## Faz Yol Haritası (Milestones)

| Faz | Milestone | Odak Alanı |
| :--- | :--- | :--- |
| **Faz 0** | `M0: Vakıf & Kalite Kapıları` | `pnpm + Turborepo`, ortak kontratlar, Docker yığını ve 300-satır CI kapısı |
| **Faz 1** | `M1: dijiOS SSO & RBAC` | NestJS Fastify API, UUIDv7 Prisma şeması, Multi-Tenant kalkanı ve okul rolleri |
| **Faz 2** | `M2: osGL × Apple HIG Kabuğu` | Liquid Glass masaüstü, yüzen pencereler, `Dock`, `⌘K` Spotlight ve mobil uyum |
| **Faz 3** | `M3: Sunucular, Zümreler & Presence` | Otomatik zümre odaları, çift sütunlu kanal ağacı ve canlı ders zili durumu |
| **Faz 4** | `M4: Gerçek Zamanlı Sohbet & Dosya` | Anlık mesajlaşma, Threads, tepkiler, MinIO güvenli dosya ve tam metin arama |
| **Faz 5** | `M5: LiveKit Ses, Video & Ekran` | Tek tıkla sesli/görüntülü odalar, 1080p ekran paylaşımı, PiP ve gürültü engelleme |
| **Faz 6** | `M6: Akademik Süper Güçler` | Canlı zümre tutanakları, `FileManGL`, `SheetGL` ve `dijiOS` Öğrenci 360° kartı |
| **Faz 7** | `M7: SEO/GEO, Tauri & Canlıya Geçiş` | `llms.txt` & JSON-LD portalı, Tauri v2 masaüstü istemcisi, E2E testler ve dağıtım |

---

## Geliştirme Süreci

Geliştirme görevleri [GitHub Issues](https://github.com/Faruk-T/Dijios_discord/issues), [Milestones](https://github.com/Faruk-T/Dijios_discord/milestones) ve **GitHub Projects Kanban** panosu üzerinden faz faz ve atomik commitlerle yürütülmektedir.
