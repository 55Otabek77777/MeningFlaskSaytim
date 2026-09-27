# MEDIA — jonli saytning rasm va videolari

Hammasi `MEDIA/` ichida, `public/` dagi yo‘l bilan bir xil. Jonli URL: `https://mirzoulugbek.app/<yo‘l>`
(masalan `https://mirzoulugbek.app/photos/founder.webp`) — yig‘ilgan sahifada **shu URL’lardan** foydalanish mumkin,
fayllarni bundle’ga kiritish shart emas (hammasi 200 OK, 28.09 tekshirildi).

## 1. Video

| fayl | o‘lcham | tavsif | saytda |
|---|---|---|---|
| `MEDIA/assets/video/hero.mp4` | **76.5 MB**, 1920×1080, 29.97 fps, H.264 High + **AAC stereo (ovozli)**, davomiyligi **1:40.6** | Maktabning tanishuv videosi (dron kadrlari, shahar panoramasi, maktab hayoti). Saytda avtoplay **ovozsiz**, loop; bosilsa ovoz yoqiladi. | Hero foni (`HeroVideo`). Jonli: `https://mirzoulugbek.app/assets/video/hero.mp4` |
| `MEDIA/assets/video/hero-poster.webp` | 336 KB, 1920×1080 | Videoning birinchi kadri: shahar panoramasi (baland bayroq ustuni, O‘zbekiston bayrog‘i, yashil daraxtlar, ko‘p qavatli uylar) — LCP shu rasm. | Hero poster; reduced-motion’da yolg‘iz o‘zi ko‘rinadi |

Fayl 100 MB dan kichik bo‘lgani uchun asl holida yuklandi (GitHub 50 MB dan yuqoriga ogohlantirish beradi, lekin qabul qiladi).
Yengil (web) versiya kerak bo‘lsa — egasining tomonida `imageio-ffmpeg` bilan 1280×720 / CRF 26 ga siqish mumkin; hozircha talab yo‘q.

## 2. Brend

| fayl | o‘lcham | tavsif | saytda |
|---|---|---|---|
| `MEDIA/logo.png` | 169 KB, 500×500, shaffof fon | Rangli logotip: ko‘k halqa ichida «UB» monogramma, qizil urg‘u | Header, Footer, soat siferblati, AI chat, favicon (kichik nusxa `app/icon.png`) |
| `MEDIA/og-image.png` | 112 KB, 1200×630 | Vizitka (og:image) — nom, shior, kontaktlar. ⚠️ Ichiga eski raqamlar «pishirilgan», matn sifatida o‘zgartirib bo‘lmaydi; faqat meta uchun | `<meta og:image>` |

## 3. Fotolar (`MEDIA/photos/`)

Haqiqiy fotolar `scripts/optimize-photos.mjs` bilan 1920px, WebP q82 ga keltirilgan. Odam yuzlari **bor** — bular jonli saytda ochiq turgan fotolar.

| fayl | o‘lcham | tavsif | saytda |
|---|---|---|---|
| `founder.webp` | 97 KB, 1920×1280 | Asoschi Jabborov A’zamjon Mashrabovich — portret | Meros bloki (bosh sahifa), /tarix, /maktab-haqida |
| `director.webp` | 33 KB, 640×640 | Direktor Mashrabjonov Ulug’bek A’zamjon o’g’li — portret (kvadrat) | Meros bloki, /tarix |
| `history-1994.webp` | 190 KB, 1280×686 | **Maktabning asosiy (hozirgi) binosi** — oq ikki qavatli bino, peshtoqida «MIRZO ULUG‘BEK XUSUSIY MAKTABI», logotip, bayroqlar, kirish oldida archa. ⚠️ Nomidagi «1994» yil **noto‘g‘ri** — bu zamonaviy bino; /tarix da 2024-yil bo‘limida «Maktabning birinchi binosi» sifatida turadi. 1994 yilini hech qayerda yozmang | /tarix, /maktab-haqida |
| `grads-2324-a.webp` | 493 KB, 1280×960 | 2023–2024 bitiruvchilari — o‘g‘il bolalar guruh fotosi | Maktab hayoti galereyasi №1 |
| `grads-2324-b.webp` | 465 KB, 1280×960 | 2023–2024 bitiruvchilari — qizlar guruh fotosi | Galereya №2 |
| `students-2425-a.webp` | 341 KB, 1920×1281 | 2024–2025 o‘quvchilari — katta guruh fotosi (eng katta guruh fotosi) | Galereya №3; sitemap’da rasm sifatida |
| `students-2425-b.webp` | 277 KB, 1920×1280 | 2024–2025 — jamoa | Galereya №4 |
| `students-2425-c.webp` | 389 KB, 1920×1280 | Maktab hayotidan lavha | Galereya №6 |
| `trip-orda.webp` | 364 KB, 1920×1280 | **Qo‘qon O‘rdasi** (Xudoyorxon saroyi) oldida yuzlab o‘quvchi va ustozlar — oq brendli futbolkalar, maktab va O‘zbekiston bayroqlari | Galereya №5 |
| `trip-a.webp` | 244 KB, 1280×853 | Bitiruvchilar sayohatidan lavha | Galereya №7 |
| `trip-b.webp` | 249 KB, 1280×853 | Sayohat kunlari | Galereya №8 |
| `hero.webp` | 341 KB, 1920×1281 | `students-2425-a.webp` ning **aynan nusxasi** (bayt-ba-bayt bir xil) — eski hero uchun tanlangan | Hozir bosh sahifada ishlatilmaydi (video keldi); jonli URL mavjud |

### Placeholder (bo‘sh joy) fayllar — haqiqiy foto EMAS
`scripts/generate-placeholders.mjs` yaratgan kulrang «foto» belgili kvadratlar. Bosh sahifada **ishlatilmaydi**; faqat to‘liqlik uchun ko‘chirildi.

| fayl | o‘lcham | izoh |
|---|---|---|
| `hero.jpg` | 11 KB, 1600×1000 | placeholder «Maktab foto» |
| `g1.jpg … g8.jpg` | 4 KB, 800×600 | placeholder «Lavha 1…8» |
| `team-1.jpg … team-8.jpg` | 4 KB, 600×800 | placeholder «Foto» |
| `video-poster.webp` | 62 KB, 1920×1080 | eski poster; kodda ishlatilmaydi |

## 4. Sertifikat rasmlari — fayl emas, URL

Bosh sahifadagi karusel va /yutuqlar **Google Cloud Storage** dagi ochiq bucket’dan rasm oladi:
`https://storage.googleapis.com/ulugbek-perfect-edu-7b4fa-certs/certificates/<nom>.webp` (yangilari `tg-<message_id>.jpg|png`).
Jonli sahifadagi **91 ta** yozuv (nom, fan, daraja, URL, o‘lcham) — `API/sertifikatlar.json`.

- Rasm o‘lchamlari: asosan 1414×2000 yoki 1811×2560 (A4 portret), 0.7–2 MB. Fanlar: Ingliz tili 26 · Kimyo 17 · Ona tili va adabiyot 17 · Biologiya 13 · Tarix 8 · Matematika 7 · Fizika 3. Darajalar: A 54 · B2 25 · A+ 11 · C1 1. Hammasi `year: 2025-2026`.
- **«Xiralashtirish» qayerda:** rasm fayllarining o‘zi xira emas — ularda to‘liq ism, shaxsiy kod, ba’zilarida foto bor (bu egasining Telegram kanalidagi ochiq e’lonlari). Saytdagi «xira» ko‘rinish — `AchievementsCarousel` da yon kartalarga CSS `filter: blur(2 / 3.6 / 5.5px)` + `opacity .5/.24/.08` berilgani; markazdagi karta aniq. Yangi sahifada ham shu yondashuv: markaz aniq, yonlar xira.
- Rasm fayllari ataylab repoga ko‘chirilmadi (shaxsiy ma’lumotni yana bir ommaviy joyga nusxalamaslik uchun) — sayt qilganidek **URL bilan** ishlating; `next.config.ts` da shu host uchun `remotePatterns` bor.

## 5. Yangiliklar rasmlari
Telegram kanal postlarining rasmlari `https://cdn4.telesco.pe/file/...` (yoki `*.cdn-telegram.org`) URL’lari — `t.me/s/ulugbek_rm` preview’dan olinadi, muddati o‘tishi mumkin. Statik saqlanmaydi.
