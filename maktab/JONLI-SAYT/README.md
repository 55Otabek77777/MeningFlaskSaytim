# JONLI-SAYT — mirzoulugbek.app bosh sahifasining HAQIQIY materiallari

Yig‘ilgan sana: **2026-09-28**. Manba: jonli saytning Next.js 15 manba kodi
(`mirzo-digital-sayt`, Vercel’da `https://mirzoulugbek.app`), `public/` papkasi va
jonli API javoblari. Hamma narsa **borligicha** — hech narsa o‘ylab topilmagan.

Maqsad: `maktab/` dagi kinematik bosh sahifani «multfilm» emas, **haqiqiy maktab**
ko‘rinishida qayta qurish — jonli saytdagi haqiqiy video, fotolar, sertifikatlar,
yangiliklar oqimi va matnlar bilan. Ish tartibi, dizayn yo‘nalishi, fakt qoidalari —
oldin berilgan ULKAN PROMPT’da (`maktab/SPEC.md`). Bu papka unga **material** beradi.

## Papka tuzilmasi

| yo‘l | nima |
|---|---|
| `MATNLAR.md` | Bosh sahifadagi HAR BIR sarlavha, matn, tugma — ekrandagi tartibda (+ eskirgan joylar ro‘yxati) |
| `MEDIA.md` | Rasm/video ro‘yxati: fayl · nima tasvirlangan · saytda qayerda ishlatiladi |
| `MEDIA/` | `public/` dan ko‘chirilgan fayllar: `logo.png`, `og-image.png`, `assets/video/hero.mp4` (+poster), `photos/*` |
| `MEDIA/bino/` | **(28.09, v3.1)** yangi (3 qavatli) bino: fasad ×2, dron ×2, hudud panoramasi ×2, bayroq — 7 ta webp 1920×1080, asl YouTube rolikidan (MEDIA.md §8; «yangi» — ko‘rinish bo‘yicha, egasi tasdiqlashi kerak) |
| `MEDIA/qulayliklar/` | **(28.09)** dron kadrlari (1080×1920), sinfxona ×3, daftarlar, forma, temir yo‘l (dron), tadbir yurishlari — 10 ta webp; Face ID/yotoqxona/oshxona/lab/shifokor/sport suratlari topilmadi (MEDIA.md §6) |
| `MEDIA/bot/` | **(28.09)** nazoratchi bot xabarnoma **namunalari** (soxta ism) va Face ID infografikalari — 8 ta webp; haqiqiy skrinshot yo‘q (MEDIA.md §7) |
| `MATNLAR.md` → «BOSHQA SAHIFALAR», «NAZORATCHI BOT» | **(28.09)** /maktab-haqida, /qabul, /faq, /tarix, /aloqa matnlari aynan; bot /start, menyu tugmalari, Face ID va shifokor xabarnoma shablonlari |
| `API.md` | Bosh sahifa chaqiradigan endpointlar, JSON namunalari, Firestore kolleksiyalari, ma’lumot oqimi |
| `API/sertifikatlar.json` | Jonli sahifadagi 91 ta sertifikat yozuvi (ochiq rasm URL’lari bilan) |
| `API/telegram-news-namuna.json` | `GET /api/telegram-news` javobi (qisqartirilgan namuna, iyul postlari — route keshi eskirgan) |
| `API/telegram-news-bosh-sahifa.json` | Bosh sahifa 28.09 da ko‘rsatgan **yangi** 5 post (HTML’dan ajratilgan; matn xom — AI silliqlash o‘chiq) |
| `API/visit-namuna.json` | `GET /api/visit` javobi |
| `YOUTUBE-TELEGRAM.md` | YouTube/Telegram: qaysi havolalar saytda, qaysi turdagi postlar saytga chiqadi |
| `MANBA-KOD/` | Next.js manbasi: `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, bosh sahifa komponentlari, `lib/`, API route’lar, konfiglar |

## MANBA-KOD nimani o‘z ichiga oladi

- `app/page.tsx` — bosh sahifa (bo‘limlar tartibi shu yerda), `app/layout.tsx` (Header/Footer/AI chat/JSON-LD), `app/globals.css` (tokenlar, animatsiyalar, `.ach-panel`, `.cd-midnight`).
- `components/` — bosh sahifa ishlatadigan **hamma** komponent: `HeroVideo`, `QabulCountdown` (+`Confetti`), `AnimatedCounters`, `LegacyBlock`, `AchievementsCarousel` (+`AchievementsClock` — «Vaqtingizni qadrlang» soati), `YonalishlarGrid` (+`YonalishIcon`), `QabulSteps`, `TestimonialsCarousel`, `TelegramNewsCard`/`NewsCard`, `GallerySection`/`GalleryCarousel` («Maktab hayoti»), `SocialLinks`, `Header`, `Footer` (+`VisitorCounter`), `MobileStickyBar`, `ScrollProgress`, `ThemeProvider`/`ThemeToggle`, `AOSInit`, `AiChat`. Qo‘shimcha: `AdmissionForm` (/qabul formasi — API kontraktining jonli namunasi), `CertificateGallery` (/yutuqlar).
- `lib/` — `site.ts` (faktlar manbai), `yonalishlar.ts`, `qabul.ts`, `certificates*.ts`, `cert-caption.ts`, `gcp-rest.ts` (Firestore/Storage REST), `firebase.ts`, `news.ts`, `telegram-news.ts`, `ai-rewrite.ts`, `use-second-tick.ts`.
- `app/api/` — `ariza`, `visit`, `track-call`, `telegram-news`, `chat`, `telegram-webhook` route’lari.
- `next.config.ts`, `package.json`, `postcss.config.mjs`, `tsconfig.json`, `firestore.rules`, `scripts/optimize-photos.mjs`, `scripts/generate-placeholders.mjs`.

**Ataylab kiritilmadi:** `.env*` (hech qanday token/kalit yo‘q — hammasi `process.env.*` orqali), `lib/owners.ts` (admin Telegram ID’lari), `lib/bot-handler.ts`/`telegram-bot.ts`/`system-health.ts`/`anthropic.ts`/`ai-usage.ts` (bot ichki mantiqi), `/bot-admin`, `/demo`, `/ekran` sahifalari, `node_modules`. Bu kod **tailwind v4 + next/image** ga tayanadi — `maktab/` bundle’ida u kutubxonalar yo‘q; matn, tartib va effektlarni **ko‘chirib yozish** kerak, importlab emas.

## Yangi alifbo qonuni — holat (2026-09-28 da tekshirildi)
- **Hali imzolanmagan.** Qonunchilik palatasi 07.07.2026 da qabul qilgan, Senat 10.09.2026 (19-yalpi majlis) da ma’qullab Prezidentga yuborgan; lex.uz’da 2026-yilgi yangi tahrir **yo‘q** (faqat 931-XII 02.09.1993 va 71-I 06.05.1995). Matbuot: imzo 21-oktabr (O‘zbek tili bayrami) gacha kutilmoqda. Manbalar: [gazeta.uz 10.09](https://www.gazeta.uz/oz/2026/09/10/uzb-alphabet/), [spot.uz 10.09](https://www.spot.uz/oz/2026/09/10/uzbek-alphabet), [kun.uz 07.07](https://kun.uz/news/2026/07/07/ozbekistonda-alifbo-islohoti-boyicha-qonun-qabul-qilindi-4cf07b), [kun.uz dayjest 13.09](https://kun.uz/news/2026/09/13/maqullangan-alifbo-ozgarishi-va-kambagallikni-tugatish-vazifasi-hafta-dayjesti).
- Mazmuni: 26 harf + 3 birikma o‘rniga **28 harf + 1 tutuq belgisi**; Oʻ→**Ö**, Gʻ→**Ğ**, Sh→**Ş**, Ch→**Ç**; «Ng» alifbodan chiqariladi. Eski yozuvdagi hujjatlar va peshtoqlar o‘tish davrida kuchda qoladi; aniq kuchga kirish sanasi e’lon qilinmagan.
- **Tutuq belgisi kod nuqtasi qonunda ko‘rsatilmagan** («bitta apostrof» deyilgan, xolos); Raqamli texnologiyalar vazirligi «yagona texnik standart» ishlab chiqmoqda ([spot.uz](https://www.spot.uz/oz/2026/09/10/alphabet-technical-solution)). Unicode tavsiyasi — harf-apostrof **ʼ U+02BC**; amalda saytlar ko‘pincha **’ U+2019** ishlatadi ([uz.wikipedia](https://uz.wikipedia.org/wiki/%CA%BC_(belgi))).
- **Sayt uchun qaror:** hozircha hech narsa o‘zgarmaydi — jonli sayt va bu papka **’ (U+2019)** bilan izchil; yangi harflar (Ö Ğ Ş Ç) qonun imzolanib, texnik standart chiqqach, alohida topshiriq bilan kiritiladi.

## Eslatmalar (buzilmasin)

1. O‘quvchilar soni raqam bilan **hech qayerda** yo‘q — faqat «Ilk minglik» (matn). Bu jonli saytda ham shunday (`lib/site.ts:59`).
2. To‘lov summasi yo‘q. (Telegram kanal postlarida narx uchrashi mumkin — bu dinamik oqim; **statik** matnga narx yozilmaydi.)
3. Apostrof — ’ (U+2019), jonli sayt bilan bir xil.
4. `MEDIA/photos/` dagi guruh fotolarida o‘quvchi yuzlari bor, `API/sertifikatlar.json` dagi rasmlarda ism/shaxsiy kod/ba’zida foto bor — bularning bari **jonli saytda allaqachon ochiq** (egasi shunday qo‘ygan). Shu materiallar bilan ishlang; yangi shaxsiy ma’lumot qo‘shmang.
5. Jonli saytdagi ba’zi jumlalar **eskirgan** (qabul «ochiq», 5–7-sinf «2026-sentabr» va h.k.) — `MATNLAR.md` oxiridagi «FARQLAR» jadvaliga qarang; u yerda egasining 27.09 dagi tasdiqlangan shakli yozilgan. Ziddiyat bo‘lsa — egasining shakli to‘g‘ri.
