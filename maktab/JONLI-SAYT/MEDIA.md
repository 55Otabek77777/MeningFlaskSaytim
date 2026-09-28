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

## 5. Yangiliklar rasmlari
Telegram kanal postlarining rasmlari `https://cdn4.telesco.pe/file/...` (yoki `*.cdn-telegram.org`) URL’lari — `t.me/s/ulugbek_rm` preview’dan olinadi, muddati o‘tishi mumkin. Statik saqlanmaydi.
