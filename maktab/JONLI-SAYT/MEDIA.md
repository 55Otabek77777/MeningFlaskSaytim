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

## 6. Qulayliklar / bino suratlari — `MEDIA/qulayliklar/` (2026-09-28 qo‘shildi)

Qidirilgan manbalar: lokal disklar (`D:\DIGITAL`, `D:\ulugbek_maktab`, `D:\MyProjects`, `D:\agent`) va rasmiy kanal
`@ulugbek_rm` ning **594 ta posti (4246–4848, 2026-yil)** — 563 ta rasm ko‘rib chiqildi. Natija: ~85 % — sertifikat/natija
rasmlari; **Face ID apparati, videokuzatuv xonasi, yotoqxona, oshxona, laboratoriya, shifokor xonasi, sport maydoni
suratlari YO‘Q** (na diskda, na kanalda). Egasi telefonidan suratga olib yuborsa, shu papkaga qo‘shiladi.
Quyidagilar — egasi o‘zi ochiq e’lon qilgan (kanal) yoki sayt uchun bergan suratlar; o‘quvchi yuzi yaqin plandagi surat yo‘q.

| fayl | nima tasvirlangan | manba | qayerda ishlatish mumkin |
|---|---|---|---|
| `bino-dron-1.webp` | **1080×1920** dron kadri (vertikal): maktab hududi va Qayrog‘och qishlog‘i panoramasi, kulrang tomli asosiy bino, daraxtlar, dalalar ufqda | kanal 4623 videosidan (07.2026) kadr — `ffmpeg`, q2 | mobil hero (9:16), parallaks, «Bino» kartasi (kesib 16:9 qilish mumkin) |
| `bino-dron-2.webp` | **1080×1920** dron kadri: binoning tepadan ko‘rinishi — tom, hovli, darvoza, mashinalar; odam ko‘rinmaydi | kanal 4623 videosi | «Bino/xavfsizlik» kartasi, geografiya fon |
| `forma-orqadan.webp` | 1080×1920 kadr: maktab formasidagi (oq futbolka, «MIRZO ULUG’BEK XUSUSIY MAKTABI») o‘quvchi orqadan — yuzsiz brend detali | kanal 4623 videosi | «Maktab hayoti» detal, CTA fon |
| `sinfxona-1.webp` | Sinfxona: oq devor, katta derazalar, oq partalar, konditsioner; bir nechta o‘quvchi dars vaqtida (yon/orqa tomondan) | kanal 02.09.2026 (Telegram eksport) | «Sinfxona» kartasi |
| `sinfxona-2.webp` | Katta sinfxona, to‘liq guruh dars vaqtida (keng plan) | kanal 02.09.2026 | «Maktab hayoti» |
| `sinfxona-3.webp` | Sinfxona, o‘quvchilar yozmoqda (orqadan/yon) | kanal 02.09.2026 | «Maktab hayoti» |
| `sinfxona-daftarlar.webp` | Partadagi daftar-kitoblar to‘plami — yuzsiz detal | kanal 01.09.2026 | detal/fon, «Nega biz» |

Bino fasadi — mavjud `photos/history-1994.webp` (peshtoqli oq bino). Bitiruv/sayohat/O‘rda — mavjud `photos/*`.
Kanalda **vokzal/poyezd** (4826, 4847), **zal** (4612), **kirish zinasi** (4680) va boshqa dron kadrlari (4631, 4617, 4633) faqat **video** shaklida
va Telegram embed ularni bermaydi («not supported», hajmi katta) — preview 320px, yaroqsiz. Kerak bo‘lsa egasi asl fayllarni yuboradi.

## 7. Nazoratchi bot materiallari — `MEDIA/bot/` (2026-09-28)

Haqiqiy Telegram skrinshoti **yo‘q** (Telegram mijozi yo‘q; xiralashtirish uchun ham manba yo‘q). O‘rniga maktabning
o‘zi tayyorlagan (2026-09) **namuna kartalar va infografikalar** — shaxsiy ma’lumotsiz: namunalarda ism sifatida
egasining o‘z ismi «MASHRABOV OTABEK», surat o‘rnida «NAMUNA — haqiqiy surat emas» yozuvi. Matnlar — `MATNLAR.md → NAZORATCHI BOT`.

| fayl | nima | ishlatish |
|---|---|---|
| `namuna-a-uyga-ketganda.webp` | Face ID xabarnoma kartasi namunasi — «UYGA JAVOB KUNI» (chiqish) | bot bloki — «xabar shunday keladi» |
| `namuna-b-uydan-kelganda.webp` | Namuna — «UYDAN — MAKTABGA QAYTDI · QAYTISH KUNI» (1-bino — o‘ng tomon apparati) | bot bloki |
| `namuna-c-odatiy-kun.webp` | Namuna — odatiy kun, «Bosh kirish» (uch kunlik kirish vaqtlari) | bot bloki |
| `infografika-apparat-javoblari.webp` | «FACE ID — APPARAT QANDAY XABAR BERADI»: 🔴 QIZIL (yuz tanilmadi) · 🟡 SARIQ (noto‘g‘ri vaqt) · 🟢 YASHIL (qabul qilindi) | Face ID bo‘limi — 3 ta rangli karta g‘oyasi |
| `infografika-apparat-ish-vaqti.webp` | «FACE ID — APPARATNING ISH VAQTLARI»: odatiy kun 03:00–06:00 / 06:00–20:00 tartibi, uyga javob kuni 03:45–08:00, uydan qaytish 09:00–20:00 | Face ID bo‘limi — vaqt jadvali |
| `infografika-apparat-tartib.webp` | «FACE ID APPARATI — qanday ishlaydi»: O‘TDI / TOPILMADI / NOTO‘G‘RI VAQT + haftalik vaqt diagrammasi | Face ID bo‘limi |
| `infografika-bot-xabarnomalar.webp` | «TELEGRAM BOTGA KELADIGAN XABARNOMALAR»: Face ID (maktabga kirdi, kechikib keldi, uyga javob berildi, uydan qaytdi, kech qaytdi, o‘tmadi) · to‘lov va hujjatlar · murojaat | bot bloki — xabar turlari ro‘yxati |
| `infografika-oquvchi-yoriqnoma.webp` | «FACE ID — O‘QUVCHILAR UCHUN YO‘RIQNOMA» (to‘liq plakat: rangli javoblar + kun tartibi) | bot/Face ID bo‘limi — plakat ko‘rinishi |

⛔ Yuklanmadi (ataylab): haftalik davomat dashbordlari va «Ota-onalarga murojaat» video kadrlari — ularda **o‘quvchilar soni** yozilgan.
Eslatma: egasining 12.09 dagi video murojaatida «6 ta Face ID apparati» deyilgan (4 ta kirish + 1 tibbiy xona + boshqa); saytdagi tasdiqlangan shakl — **«kirish joylarida 4 ta»** (SPEC §9). Ziddiyat bo‘lsa egasidan so‘raladi, hozircha 4.

## 8. Yangi bino — `MEDIA/bino/` (2026-09-28, v3.1 so‘rovi)

Manba: **`RO'LIK YOTUBE (2).mp4`** — maktabning asl YouTube roligi (1920×1080, 20 Mbit/s, 1:40; `hero.mp4` shuning siqilgan
nusxasi), `D:\DIGITAL\SAYT UCHUN KERAKLI RASM VA VIDEO\`. Kadrlar `ffmpeg -q:v 2` bilan olindi, keskinlik bo‘yicha tanlandi.
Ikki bino farqi: **birinchi (eski) bino** — `photos/history-1994.webp`: 2 qavat, markazida ko‘tarilgan peshtoq, ko‘k eshik, oldida
archalar. **Yangi (2025) bino** — 3 qavat, 2–3-qavatlarda balkonlar, tekis tom, peshtoq lentasida «XUSUSIY MIRZO ULUG’BEK MAKTABI»,
oldida metall panjara-darvoza; kanal 4623 videosidagi tepadan ko‘rinish (`qulayliklar/bino-dron-2.webp`) ham shu bino.
⚠️ «Yangi/eski» ajratish — ko‘rinish bo‘yicha xulosa; egasining tasdig‘i so‘ralgan (taqqoslash rasmi yuborildi).

| fayl | o‘lcham | nima tasvirlangan | manba | bino |
|---|---|---|---|---|
| `yangi-bino-fasad.webp` | 1920×1080 | Oldingi fasad, pastdan yuqoriga: 3 qavat, balkonlar, «XUSUSIY MIRZO ULUG’BEK …» yozuvi, bayroqlar, kirish oldida mashina va 2 kishi (uzoqda) | rolik ≈ 0:12 | yangi |
| `yangi-bino-fasad-keng.webp` | 1920×1080 | Ko‘cha bo‘ylab keng plan: bino butun uzunligi, panjara, mashina, daraxtlar | rolik ≈ 0:07 | yangi |
| `yangi-bino-dron.webp` | 1920×1080 | Dron, qiya: kulrang tomli 3 qavatli bino, hovli, darvoza, qo‘shni tomlar | rolik ≈ 0:11 | yangi |
| `yangi-bino-dron-2.webp` | 1920×1080 | Dron, boshqa burchak: bino va hovli, atrof mahalla | rolik ≈ 0:10.5 | yangi |
| `hudud-panorama-dron.webp` | 1920×1080 | Dron panorama: maktab hududi, qishloq va dalalar ufqda (kun) | rolik ≈ 0:08.5 | ikkalasi |
| `hudud-panorama-dron-2.webp` | 1920×1080 | Dron panorama, kengroq (Uchko‘prik) — fon uchun | rolik ≈ 1:30 | — |
| `maktab-bayrogi.webp` | 1920×1080 | Osmon fonida maktab bayrog‘i («Mirzo Ulug’bek xususiy maktabi» logotipli) — detal/parallaks | rolik ≈ 0:08 | — |

Kirish qismi (yaqin plan), hovli ichkarisi, kechki yoritilgan ko‘rinish — rolikda **yo‘q**; kanal 4680 videosida kirish zinasi bor,
lekin embed bermaydi. Asl dron/kirish suratlari egasining Surface kompyuterida deyilgan: «Javas loyihasi» seansi mavjud emas,
so‘rov ROUTER’ga berildi — Surface 28.09 kechasi o‘chiq edi; ROUTER yoqilgach kalit so‘z bo‘yicha ro‘yxat oladi va **ko‘chirishga
egasidan ruxsat so‘raydi** (bolalar suratlari bo‘lishi mumkin). Kelsa — `MEDIA/bino/ASL/` → webp → shu jadvalga qo‘shiladi.

`MEDIA/qulayliklar/` ga rolikdan qo‘shildi: `vokzal-temir-yol-dron.webp` (temir yo‘l kesishmasi, avtobuslar — «vokzalga 300 m»),
`tadbir-yurish-dron.webp` (dron: bayroqli yurish, odamlar juda kichik), `tadbir-bayroqlar.webp` (bog‘da bayroqli yurish, yuzlar kichik),
`sayohat-orda-dron-1.webp` (Qo‘qon O‘rdasi — dron, gulzor va saroy, odamlar mayda), `sayohat-orda-dron-2.webp` (O‘rda zinasida saf tortgan
o‘quvchilar — dron, yuzlar ko‘rinmaydi). Hammasi 1920×1080, rolik ≈ 0:48–0:57.

## 9. DRON kadrlari va kliplari — `MEDIA/dron/` (2026-09-28, cloud so‘rovi)

**Manba — egasining fleshkasi (E: «Thinkplus», 1.9 TB)**, papka `E:.06.2026 MIRZO ULUG'BEK XUSUSIY MAKTAB SIYOMKASI\`:
- `03.DRON\` — **67 ta DJI video, 29 GB**, 2026-06-24 10:27–14:10 (bitiruv kuni s’yomkasi): 33 ta **3840×2160 50 fps**, 7 ta 1920×1080 50 fps,
  27 ta **vertikal 1512×2688** 50 fps (H.264, 60–100 Mbit/s). Syujetlar: yangi bino orbitlari (0116–0136), hovlidagi saf (0137–0142),
  vokzalgacha yurish va birinchi bino (0143–0157), temir yo‘l va dalalar (0158–0161), Qo‘qon O‘rdasi va shahar (0162–0181), bitiruv zali (0182–0185).
- `04.FOTO\` — 3 ta DJI dron fotosi 4096×2304 (JPG+DNG), O‘rda oldida guruh.
- `01.AXROR\` (169 MP4, 13 GB) va `02.ISMOILJON\` (138 MOV, 38 GB) — yerdan tushirilgan kamera videolari (o‘quvchilar yaqin planda) — ishlatilmadi.
- `RASM 2026\` — 608 ta Canon foto 6960×4640 — zal/tadbir, yuzlar yaqin — ishlatilmadi.
- `E:\Reklama uchun\` — 03.DRON dan 9 ta nusxa; `E:\HAMMA videolar\DJI_2025*` — DJI Osmo (qo‘l kamerasi, 2025-09/10), dron emas: birinchi bino
  ko‘cha darajasida, xona ichi — ishlatilmadi. `E:87.mov` (41 min 4K HEVC), `E:-avgust\…mp4` (25 min 4K60), `E:\Mirzo Ulug'bek Maktabi.mp4`
  (2 s 28 min 1080p) — namunalandi: `0707.mov` = studiyada intervyu (direktor, mikrofon), `1-avgust` = 1-avgust ochilish marosimi (yerdan,
  odamlar yaqin), master = bitiruv zali to‘liq yozuvi (yuzlar yaqin) — dron emas, ishlatilmadi.
- Lokal disklar (D:, C:) — dron videosi yo‘q; asl YouTube roligi (`RO'LIK YOTUBE (2).mp4`) §8 da ishlatilgan. Surface (ROUTER) — javob kutilmoqda.

**Usul:** har syujet uchun `ffmpeg` bilan t±0.6 s oralig‘ida 7 kadr olindi (`-q:v 2`), Laplas dispersiyasi (keskinlik) bo‘yicha eng tiniq
kadr tanlandi → webp q85 1920×1080; 4K manba bo‘lsa qo‘shimcha `@2k` = 2560×1440 (q82); vertikal manba → 1080×1920.
**Oltin soat yo‘q:** hamma dron kadrlari 10:27–14:10 (kunduzi, quyosh yuqorida); tong/quyosh botishi s’yomkasi fleshkada ham, diskda ham topilmadi.
**Yuzlar:** hamma kadr balanddan; odamlar yaqinroq bo‘lgan 5 ta kadr faqat 1920 da (2K nusxasi ataylab yo‘q).
Jami: **95 ta webp** (59 syujet) + **5 ta klip** = 63.9 MB.

**a) Hudud panoramasi**

| fayl | o‘lcham | nima tasvirlangan | manba video · vaqt | bo‘lim |
|---|---|---|---|---|
| `hudud-panorama-1.webp` | `1920x1080` + `2560x1440` (`@2k`), 1282 KB | Dron panorama: dalalar, mahalla, ufqda tog' tumani — maktab markazda | `DJI_20260624104203_0132_D.MP4` (3840x2160, 50 fps) · 00:01.0 | hero fon / «Maktabimiz — osmondan» lenta / geografiya |
| `hudud-panorama-2.webp` | `1920x1080` + `2560x1440` (`@2k`), 1073 KB | Panorama, dron maktab tomon yaqinlashmoqda | `DJI_20260624104203_0132_D.MP4` (3840x2160, 50 fps) · 00:04.6 | hero fon / «Maktabimiz — osmondan» lenta / geografiya |
| `hudud-panorama-3.webp` | `1920x1080`, 393 KB | Keng panorama: qishloq, teraklar, markazda maktab binosi | `DJI_20260624102800_0117_D.MP4` (1920x1080, 50 fps) · 00:22.7 | hero fon / «Maktabimiz — osmondan» lenta / geografiya |
| `hudud-panorama-4.webp` | `1920x1080` + `2560x1440` (`@2k`), 1523 KB | Mahalla panoramasi, ko'chada o'quvchilar safi (mayda) | `DJI_20260624113534_0149_D.MP4` (3840x2160, 50 fps) · 00:52.6 | hero fon / «Maktabimiz — osmondan» lenta / geografiya |
| `hudud-panorama-5.webp` | `1920x1080` + `2560x1440` (`@2k`), 868 KB | Teraklar qatori va mahalla ko'chasi — vokzal yo'li boshlanishi | `DJI_20260624115432_0158_D.MP4` (3840x2160, 50 fps) · 00:01.2 | hero fon / «Maktabimiz — osmondan» lenta / geografiya |
| `hudud-panorama-vert-1.webp` | `1080x1920`, 446 KB | VERTIKAL panorama: qishloq va dalalar, pastda maktab | `DJI_20260624103343_0123_D.MP4` (1512x2688, 50 fps) · 00:01.0 | hero fon / «Maktabimiz — osmondan» lenta / geografiya |
| `hudud-panorama-vert-2.webp` | `1080x1920`, 363 KB | VERTIKAL panorama, baland: mahalla to'ri | `DJI_20260624103533_0125_D.MP4` (1512x2688, 50 fps) · 00:11.9 | hero fon / «Maktabimiz — osmondan» lenta / geografiya |

**b) Yangi bino**

| fayl | o‘lcham | nima tasvirlangan | manba video · vaqt | bo‘lim |
|---|---|---|---|---|
| `yangi-bino-fasad-saf-1.webp` | `1920x1080` + `2560x1440` (`@2k`), 1131 KB | Yangi bino fasadi va oldida saf tortgan o'quvchilar (balanddan, yuzlar ko'rinmaydi) | `DJI_20260624104428_0134_D.MP4` (3840x2160, 50 fps) · 00:11.9 | Tarix 2025 / Tashrif kartasi / dron lenta |
| `yangi-bino-hovli-1.webp` | `1920x1080` + `2560x1440` (`@2k`), 1395 KB | Yangi bino va hovli, yonidagi qatorlar | `DJI_20260624104029_0130_D.MP4` (3840x2160, 50 fps) · 00:25.6 | Tarix 2025 / Tashrif kartasi / dron lenta |
| `yangi-bino-hovli-2.webp` | `1920x1080` + `2560x1440` (`@2k`), 1151 KB | Yangi bino + hovli to'ri (tepadan-qiya) | `DJI_20260624104109_0131_D.MP4` (3840x2160, 50 fps) · 00:00.4 | Tarix 2025 / Tashrif kartasi / dron lenta |
| `yangi-bino-old-1.webp` | `1920x1080` + `2560x1440` (`@2k`), 1246 KB | Yangi bino old fasad tepadan-qiya: peshtoq yozuvi, ko'cha | `DJI_20260624104109_0131_D.MP4` (3840x2160, 50 fps) · 00:13.9 | Tarix 2025 / Tashrif kartasi / dron lenta |
| `yangi-bino-old-2.webp` | `1920x1080` + `2560x1440` (`@2k`), 1474 KB | Yangi bino old fasad, boshqa burchak | `DJI_20260624104109_0131_D.MP4` (3840x2160, 50 fps) · 00:32.8 | Tarix 2025 / Tashrif kartasi / dron lenta |
| `yangi-bino-tepadan-1.webp` | `1920x1080`, 518 KB | Yangi bino tepadan yaqin: kulrang tom, hovli, darvoza, mashinalar | `DJI_20260624102703_0116_D.MP4` (1920x1080, 50 fps) · 00:01.0 | Tarix 2025 / Tashrif kartasi / dron lenta |
| `yangi-bino-tepadan-2.webp` | `1920x1080` + `2560x1440` (`@2k`), 1211 KB | Yangi bino to'g'ridan tepadan (4K): tom va hovli | `DJI_20260624104251_0133_D.MP4` (3840x2160, 50 fps) · 00:00.8 | Tarix 2025 / Tashrif kartasi / dron lenta |
| `yangi-bino-uzoqdan-1.webp` | `1920x1080` + `2560x1440` (`@2k`), 1164 KB | Yangi bino mahalla ichida, uzoqdan (panorama → bino) | `DJI_20260624104203_0132_D.MP4` (3840x2160, 50 fps) · 00:23.2 | Tarix 2025 / Tashrif kartasi / dron lenta |
| `yangi-bino-vert-1.webp` | `1080x1920`, 451 KB | VERTIKAL: yangi bino tepadan, ko'cha | `DJI_20260624103813_0128_D.MP4` (1512x2688, 50 fps) · 00:00.4 | Tarix 2025 / Tashrif kartasi / dron lenta |
| `yangi-bino-vert-2.webp` | `1080x1920`, 549 KB | VERTIKAL: yangi bino yaqin, tom va fasad | `DJI_20260624103941_0129_D.MP4` (1512x2688, 50 fps) · 00:11.6 | Tarix 2025 / Tashrif kartasi / dron lenta |
| `yangi-bino-vert-3.webp` | `1080x1920`, 520 KB | VERTIKAL: yangi bino mahalla ichida | `DJI_20260624103631_0126_D.MP4` (1512x2688, 50 fps) · 00:29.0 | Tarix 2025 / Tashrif kartasi / dron lenta |
| `yangi-bino-vert-4.webp` | `1080x1920`, 479 KB | VERTIKAL: yangi bino tepadan, hovli | `DJI_20260624103736_0127_D.MP4` (1512x2688, 50 fps) · 00:27.9 | Tarix 2025 / Tashrif kartasi / dron lenta |
| `yangi-bino-yon-1.webp` | `1920x1080`, 567 KB | Yangi bino yon burchakdan — orbit, 3 qavat, balkonlar | `DJI_20260624103149_0121_D.MP4` (1920x1080, 50 fps) · 00:20.6 | Tarix 2025 / Tashrif kartasi / dron lenta |
| `yangi-bino-yon-2.webp` | `1920x1080`, 550 KB | Yangi bino orqa-yon burchak, qo'shni tomlar | `DJI_20260624103149_0121_D.MP4` (1920x1080, 50 fps) · 00:33.5 | Tarix 2025 / Tashrif kartasi / dron lenta |
| `yangi-bino-yon-3.webp` | `1920x1080`, 503 KB | Yangi bino yon tomondan, ko'cha va teraklar | `DJI_20260624103243_0122_D.MP4` (1920x1080, 50 fps) · 00:07.5 | Tarix 2025 / Tashrif kartasi / dron lenta |

**c) Birinchi (eski) bino va qurilish**

| fayl | o‘lcham | nima tasvirlangan | manba video · vaqt | bo‘lim |
|---|---|---|---|---|
| `eski-bino-hovli-1.webp` | `1920x1080` + `2560x1440` (`@2k`), 1337 KB | Birinchi bino yonidagi yashil tomli bino va bog' (maktab hududi), saf o'tmoqda | `DJI_20260624113245_0145_D.MP4` (3840x2160, 50 fps) · 00:26.6 | Tarix 2024 («birinchi bino») / dron lenta |
| `eski-bino-tepadan-1.webp` | `1920x1080` + `2560x1440` (`@2k`), 1235 KB | Birinchi (eski) bino tepadan: oq 2 qavat, yashil tom, markaziy peshtoq, oldida o'quvchilar safi, teraklar | `DJI_20260624113245_0145_D.MP4` (3840x2160, 50 fps) · 00:29.4 | Tarix 2024 («birinchi bino») / dron lenta |
| `eski-bino-tepadan-2.webp` | `1920x1080` + `2560x1440` (`@2k`), 1215 KB | Birinchi bino old tomondan tepadan-qiya, ko'chada saf, mashinalar | `DJI_20260624113245_0145_D.MP4` (3840x2160, 50 fps) · 00:34.6 | Tarix 2024 («birinchi bino») / dron lenta |
| `eski-bino-tepadan-3.webp` | `1920x1080` + `2560x1440` (`@2k`), 1227 KB | Birinchi bino va chap tomonda qurilish maydoni (tepadan) | `DJI_20260624113245_0145_D.MP4` (3840x2160, 50 fps) · 00:39.4 | Tarix 2024 («birinchi bino») / dron lenta |
| `qurilish-1.webp` | `1920x1080`, 389 KB | Qurilayotgan yangi bino — g'isht devorlar, yonidan o'quvchilar safi (2026-iyun holati) — faqat 1920 (odamlar yaqinroq) | `DJI_20260624113345_0146_D.MP4` (3840x2160, 50 fps) · 00:08.4 | Tarix 2027–2028 (reja) — «qurilmoqda» (egasi tasdiqlasin) |
| `qurilish-2.webp` | `1920x1080`, 559 KB | Qurilish maydoni va bayroqli saf, avtobus (tepadan) — faqat 1920 (odamlar yaqinroq) | `DJI_20260624113345_0146_D.MP4` (3840x2160, 50 fps) · 00:13.1 | Tarix 2027–2028 (reja) — «qurilmoqda» (egasi tasdiqlasin) |

**d) Hovli, tadbir, yurish (tepadan)**

| fayl | o‘lcham | nima tasvirlangan | manba video · vaqt | bo‘lim |
|---|---|---|---|---|
| `hovli-tadbir-1.webp` | `1920x1080` + `2560x1440` (`@2k`), 879 KB | Hovlida o'quvchilar safi — balanddan, oq formalar | `DJI_20260624110757_0137_D.MP4` (3840x2160, 50 fps) · 00:21.2 | Maktab hayoti / xavfsizlik (saf, hovli) |
| `hovli-tadbir-2.webp` | `1920x1080` + `2560x1440` (`@2k`), 734 KB | Hovli to'g'ridan tepadan: saf, belgilangan chiziqlar (yuzlar yo'q) | `DJI_20260624110931_0139_D.MP4` (3840x2160, 50 fps) · 00:04.6 | Maktab hayoti / xavfsizlik (saf, hovli) |
| `hovli-tadbir-3.webp` | `1920x1080`, 417 KB | Fasad oldida yig'ilgan o'quvchilar, bayroqlar (balanddan) — faqat 1920 (odamlar yaqinroq) | `DJI_20260624111148_0141_D.MP4` (3840x2160, 50 fps) · 00:09.4 | Maktab hayoti / xavfsizlik (saf, hovli) |
| `hovli-tadbir-4.webp` | `1920x1080`, 432 KB | Hovli va saf, bino bo'ylab — faqat 1920 (odamlar yaqinroq) | `DJI_20260624110837_0138_D.MP4` (3840x2160, 50 fps) · 00:12.9 | Maktab hayoti / xavfsizlik (saf, hovli) |
| `yurish-tepadan-1.webp` | `1920x1080` + `2560x1440` (`@2k`), 1279 KB | Vokzal sari yurish boshlanishi — maktab yonidan (tepadan) | `DJI_20260624113104_0143_D.MP4` (3840x2160, 50 fps) · 00:14.1 | Maktab hayoti / tadbirlar |
| `yurish-tepadan-2.webp` | `1920x1080` + `2560x1440` (`@2k`), 1288 KB | Yurish yashil tomli bino yonidan (tepadan) | `DJI_20260624113245_0145_D.MP4` (3840x2160, 50 fps) · 00:17.3 | Maktab hayoti / tadbirlar |
| `yurish-tepadan-3.webp` | `1920x1080` + `2560x1440` (`@2k`), 1261 KB | Yurish mahalla ko'chasi bo'ylab (tepadan) | `DJI_20260624113416_0147_D.MP4` (3840x2160, 50 fps) · 00:06.1 | Maktab hayoti / tadbirlar |
| `yurish-tepadan-4.webp` | `1920x1080` + `2560x1440` (`@2k`), 1190 KB | Yurish — uzun saf, omborlar yonidan (balanddan) | `DJI_20260624113534_0149_D.MP4` (3840x2160, 50 fps) · 00:18.3 | Maktab hayoti / tadbirlar |
| `yurish-vert-1.webp` | `1080x1920`, 395 KB | VERTIKAL: ko'chada saf, avtobuslar | `DJI_20260624114004_0154_D.MP4` (1512x2688, 50 fps) · 00:15.5 | Maktab hayoti / tadbirlar |
| `yurish-vert-2.webp` | `1080x1920`, 361 KB | VERTIKAL: avtobuslar va o'quvchilar tepadan | `DJI_20260624114104_0155_D.MP4` (1512x2688, 50 fps) · 00:00.8 | Maktab hayoti / tadbirlar |

**e) Vokzal, temir yo‘l, yo‘l**

| fayl | o‘lcham | nima tasvirlangan | manba video · vaqt | bo‘lim |
|---|---|---|---|---|
| `vokzal-1.webp` | `1920x1080` + `2560x1440` (`@2k`), 1490 KB | Temir yo'l kesishmasi, avtobuslar kutmoqda — vokzal yo'li | `DJI_20260624115528_0159_D.MP4` (3840x2160, 50 fps) · 00:08.8 | «Vokzalga 300 m» / transport kartasi |
| `vokzal-2.webp` | `1920x1080` + `2560x1440` (`@2k`), 1437 KB | Temir yo'l va avtobuslar, boshqa burchak | `DJI_20260624115528_0159_D.MP4` (3840x2160, 50 fps) · 00:24.4 | «Vokzalga 300 m» / transport kartasi |
| `vokzal-yol-1.webp` | `1920x1080` + `2560x1440` (`@2k`), 1289 KB | Dalalar orasidagi yo'l, avtobuslar karvoni (tepadan) | `DJI_20260624115601_0160_D.MP4` (3840x2160, 50 fps) · 00:13.9 | «Vokzalga 300 m» / transport kartasi |
| `vokzal-yol-2.webp` | `1920x1080` + `2560x1440` (`@2k`), 1293 KB | Temir yo'l va bug'doy dalalari — maktabgacha yo'l | `DJI_20260624115632_0161_D.MP4` (3840x2160, 50 fps) · 00:21.5 | «Vokzalga 300 m» / transport kartasi |
| `yol-mahalla-1.webp` | `1920x1080` + `2560x1440` (`@2k`), 974 KB | Mahalla ko'chasi, avtobuslar, teraklar | `DJI_20260624115432_0158_D.MP4` (3840x2160, 50 fps) · 00:20.8 | transport / geografiya |

**f) Qo‘qon O‘rdasi va shahar**

| fayl | o‘lcham | nima tasvirlangan | manba video · vaqt | bo‘lim |
|---|---|---|---|---|
| `orda-1.webp` | `1920x1080` + `2560x1440` (`@2k`), 999 KB | Qo'qon O'rdasi (Xudoyorxon saroyi) — keng plan, gulzor, o'quvchilar yo'lakda | `DJI_20260624124234_0162_D.MP4` (3840x2160, 50 fps) · 00:39.8 | Maktab hayoti — sayohatlar |
| `orda-2.webp` | `1920x1080` + `2560x1440` (`@2k`), 1084 KB | O'rda uzoqdan, Qo'qon shahri fonida | `DJI_20260624124324_0163_D.MP4` (3840x2160, 50 fps) · 00:04.7 | Maktab hayoti — sayohatlar |
| `orda-3.webp` | `1920x1080` + `2560x1440` (`@2k`), 1060 KB | O'rda old tomondan, gulzor | `DJI_20260624124324_0163_D.MP4` (3840x2160, 50 fps) · 00:20.1 | Maktab hayoti — sayohatlar |
| `orda-4.webp` | `1920x1080` + `2560x1440` (`@2k`), 1532 KB | O'rda zinasi va yo'lakda saf (balanddan) | `DJI_20260624124404_0164_D.MP4` (3840x2160, 50 fps) · 00:17.3 | Maktab hayoti — sayohatlar |
| `orda-5.webp` | `1920x1080` + `2560x1440` (`@2k`), 1154 KB | O'rda keng plan, park | `DJI_20260624124451_0165_D.MP4` (3840x2160, 50 fps) · 00:09.9 | Maktab hayoti — sayohatlar |
| `orda-6.webp` | `1920x1080` + `2560x1440` (`@2k`), 1325 KB | O'rda odamsiz — saroy va gulzor (tepadan-qiya) | `DJI_20260624125602_0177_D.MP4` (3840x2160, 50 fps) · 00:08.1 | Maktab hayoti — sayohatlar |
| `orda-7.webp` | `1920x1080` + `2560x1440` (`@2k`), 1284 KB | O'rda odamsiz, boshqa burchak | `DJI_20260624125602_0177_D.MP4` (3840x2160, 50 fps) · 00:19.9 | Maktab hayoti — sayohatlar |
| `orda-foto-1.webp` | `1920x1080`, 616 KB | Qo'qon O'rdasi — dron FOTOSI: saroy, gulzor, yo'lakda o'quvchilar safi, oldinda guruh (yuzlar mayda) — faqat 1920 (odamlar yaqinroq) | `DJI_20260624124544_0167_D.JPG` (4096x2304 (foto), 50 fps) · 12:45 (foto) | Maktab hayoti — sayohatlar |
| `orda-vert-1.webp` | `1080x1920`, 410 KB | VERTIKAL: O'rda uzoqdan | `DJI_20260624124636_0169_D.MP4` (1512x2688, 50 fps) · 00:32.0 | Maktab hayoti — sayohatlar |
| `orda-vert-2.webp` | `1080x1920`, 381 KB | VERTIKAL: O'rda va gulzor | `DJI_20260624124723_0170_D.MP4` (1512x2688, 50 fps) · 00:05.5 | Maktab hayoti — sayohatlar |
| `orda-vert-3.webp` | `1080x1920`, 537 KB | VERTIKAL: O'rda diagonal, yo'lakda saf | `DJI_20260624124750_0171_D.MP4` (1512x2688, 50 fps) · 00:21.4 | Maktab hayoti — sayohatlar |
| `orda-vert-4.webp` | `1080x1920`, 381 KB | VERTIKAL: O'rda parki | `DJI_20260624125807_0181_D.MP4` (1512x2688, 50 fps) · 00:18.1 | Maktab hayoti — sayohatlar |
| `qoqon-shahar-1.webp` | `1920x1080` + `2560x1440` (`@2k`), 817 KB | Qo'qon shahri panoramasi, bayroq | `DJI_20260624125522_0176_D.MP4` (3840x2160, 50 fps) · 00:05.6 | sayohatlar / geografiya |
| `qoqon-shahar-2.webp` | `1920x1080` + `2560x1440` (`@2k`), 675 KB | Qo'qon — park va shahar tomlari | `DJI_20260624125410_0174_D.MP4` (3840x2160, 50 fps) · 00:13.0 | sayohatlar / geografiya |
| `qoqon-vert-1.webp` | `1080x1920`, 288 KB | VERTIKAL: Qo'qon shahri, bayroq | `DJI_20260624125701_0179_D.MP4` (1512x2688, 50 fps) · 00:00.6 | sayohatlar / geografiya |

**g) Bitiruv zali**

| fayl | o‘lcham | nima tasvirlangan | manba video · vaqt | bo‘lim |
|---|---|---|---|---|
| `bitiruv-zal-tashqi-1.webp` | `1920x1080` + `2560x1440` (`@2k`), 1071 KB | Bitiruv marosimi zali (oq-ko'k bino), avtobuslar, o'quvchilar (tepadan) | `DJI_20260624131141_0182_D.MP4` (3840x2160, 50 fps) · 00:22.6 | Maktab hayoti — bitiruv |

**Kliplar — `MEDIA/dron/klip/`** (ovozsiz, 1280×720, 25 fps, H.264 High, `+faststart`)

| fayl | davomiyligi | hajm | mazmun | manba · vaqt |
|---|---|---|---|---|
| `yangi-bino-orbit.mp4` | 7 s | 2173 KB | Yangi bino atrofida sekin orbit (yon → old) | `DJI_20260624103149_0121_D.MP4` · 00:14.0 |
| `hudud-panorama.mp4` | 7 s | 1636 KB | Dalalar ustidan maktab tomon sekin uchish | `DJI_20260624104203_0132_D.MP4` · 00:00.5 |
| `vokzal-temir-yol.mp4` | 7 s | 2795 KB | Temir yo'l kesishmasi, avtobuslar — tepadan sekin o'tish | `DJI_20260624115528_0159_D.MP4` · 00:07.0 |
| `orda-yaqinlashish.mp4` | 7 s | 1377 KB | Qo'qon O'rdasiga shahar ustidan yaqinlashish | `DJI_20260624124324_0163_D.MP4` · 00:00.5 |
| `yangi-bino-tepadan.mp4` | 7 s | 1218 KB | Yangi bino tepadan, sekin uzoqlashish | `DJI_20260624102703_0116_D.MP4` · 00:00.5 |


## 5. Yangiliklar rasmlari
Telegram kanal postlarining rasmlari `https://cdn4.telesco.pe/file/...` (yoki `*.cdn-telegram.org`) URL’lari — `t.me/s/ulugbek_rm` preview’dan olinadi, muddati o‘tishi mumkin. Statik saqlanmaydi.
