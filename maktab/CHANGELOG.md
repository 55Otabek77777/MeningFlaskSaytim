# CHANGELOG — «Mirzo Ulug’bek» bosh sahifasi

## 2026-09-27 — v2.0 (haqiqiy materiallar bilan qayta qurildi)
Egasining fikri: v1 «multfilm bo’lib qolgan» (3D astrolyabiya, zarracha morfing, SVG illyustratsiyalar, soxta sertifikat kartalari).
v2 da hammasi DIGITAL yuklagan `JONLI-SAYT/` materiallari asosida: jonli saytdagi video, suratlar, 91 ta sertifikat,
Telegram postlari va jonli matnlar; eskirgan jumlalar o’rniga `MATNLAR.md → FARQLAR` o’ng ustuni. Animatsiya dvigateli saqlandi,
lekin «real, multfilmsiz». Agentlarsiz yozildi. `logistika/` o’zgarmagan.

### Bo’limlar (17)
| # | Qism | Nima bor |
|---|---|---|
| 00 | core | Jonli menyu (Bosh sahifa, Maktab haqida, Yo’nalishlar ▾ 6 slug + «Rus tili yo’nalishlari · yangi» + 5–7-sinflar, Qabul, Yutuqlar, Yangiliklar, FAQ, Aloqa), «Hujjat topshirish», mobil menyu, progress, `tel:` → `/api/track-call`. Yulduzli osmon olib tashlandi |
| 10 | hero | **Haqiqiy `hero.mp4` + poster**, «Ovozni yoqish / o’chirish», clip-path kinematik ochilish, scroll zoom; jonli H1/lead/CTA, «yoki qo’ng’iroq qiling», «Litsenziya № 363657 · Uchko’prik, Farg’ona»; 27+ · 1560+ · IELTS 8.0 |
| 12 | qabul | FARQLAR A: «2026–2027: sanoqli o’rinlar» + egasining aynan jumlasi (ochiq/yopiq yo’q, sanoq yo’q) |
| 20 | stats | «Nega aynan biz?» — 6 ko’rsatkich (Ilk minglik — matn) |
| 25 | meros | «Bir oilaning orzusi — bir avlodning kelajagi»: asoschi va direktor **haqiqiy suratlari**, jonli matn, 1998 → 2024 → 2025 → 2027–2028 reja vaqt chizig’i, «Maktabning asosiy binosi» (1994 yozilmaydi) |
| 30 | yutuqlar | Jonli «Aurora» panel: **91 ta haqiqiy sertifikat** (GCS URL, markaz aniq / yonlari xira), coverflow parametrlari jonli saytdagidek, faqat ±3 yuklanadi, rasm yuklanmaguncha almashmaydi; logotipli soat — sekund strelkasi urib turadi, har 3 s da keyingi sertifikat; «Vaqtingizni qadrlang»; fan bo’yicha saralash, suring/sudrang, progress scrub, klaviatura |
| 35 | yonalishlar | Jonli H2/sub «Yo’nalishlarimiz»; 5 karta + Rus tili (FARQLAR C) + 5–7-sinflar (FARQLAR B aynan matni) |
| 40 | qabul-jarayoni | «Qabul jarayoni — 5 qadam» (tasdiqlanmagan «24 soat» va’dasi olib tashlandi) |
| 45 | ariza | Xabarlar jonli AdmissionForm’dagidek: validatsiya, «Arizangiz qabul qilindi ✅» + «🤖 Rasmiy botga o’tish», «Siz allaqachon ro’yxatdan o’tgansiz» (sana bilan), 10-sinf va 11/Bitiruvchi izohlari, 429 va 60 s `localStorage["ariza_last_submit"]` cheklovi |
| 50 | hayot | «Bir maktab — minglab yorqin taqdir»: **8 ta haqiqiy guruh surati** jonli izohlar bilan — desktop’da pin + gorizontal lenta (ichki parallaks, parda ochilishi), mobil’da suriladigan lenta; «Maktab — ikkinchi uy» 4 fakt kartasi |
| 55 | geografiya | O’zgarmadi (SVG Maps, CC BY 4.0) |
| 60 | sharhlar | «Ota-onalar fikri» — 3 ta jonli sharh aynan, Google 4.9 ★ (41+ sharh) havolasi, yulduzlar to’ladi |
| 65 | yangiliklar | Telegram: 1 katta karta + 4 qator; darhol 28.09 snapshot (4846–4848), `/api/telegram-news` faqat **yangiroq** bo’lsa almashadi (route keshi eskirgan); xom matn: NFKC (𝗤𝗮𝗹𝗶𝗻 → oddiy), apostrof → ’, `pre-line`, line-clamp; rasm xatosida Telegram ikonkasi; + statik «Yangilanishlar» (FARQLAR D) |
| 70 | faq | 15 savol (o’zgarmadi) |
| 75 | kanallar | «Savolingiz bormi?» AI bot CTA + «Biz bilan bog’laning» 8 karta (bot, kanal, Instagram, YouTube, xarita, telefon, admin, menejer) + mirzolink.com |
| 98 | chat | AI yordamchi vidjeti: `POST /api/chat {message, history (8), sessionId (localStorage site_ai_session)}`, jonli xato matnlari, salomlashuvda «narxlar» yo’q (FARQLAR E), Esc / fon bosilsa yopiladi |
| 99 | footer | «Farzandingizni ishonchli maktabga bering», tagline, tezkor havolalar, ish vaqti, aloqa, «{yil} yillik an’ana. Bir oila — bir maqsad.», «Barcha huquqlar himoyalangan», tashrif hisoblagichi, mobil «Qo’ng’iroq / Hujjat topshirish» paneli |

Olib tashlandi: 15-ticker, 50-rasadxona (3D), 70-nega-biz bento, heritage zarrachalari, Three.js (bundle 1,39 MB → 0,83 MB).
`<head>`: jonli title «— Uchko’prik, Farg’ona», description, JSON-LD `EducationalOrganization` (jonli saytdagi ma’lumotlar).

### QA natijasi (v2)
- `node build.mjs --release` — xatosiz; `dist/index.html` ≈ 0,83 MB.
- 1440×900 va 390×844, to’liq sahifa: konsol xatosi 0, gorizontal overflow yo’q, 390 px da 15 px dan kichik matn yo’q.
- Mock sinovlar: forma (validatsiya, ok, 60 s cheklov — so’rov yuborilmaydi, duplicate, 429), chat (javob, sessionId, Esc), yangiliklar (yangi id kelsa almashadi, sana «27-sentabr, 2026»).
- Audit: ʻ/ʼ — 0; «qabul ochiq/boshlandi», «bino ochildi», «5 ta apparat», «hamma ota-ona», «2026-sentabr», narx/summa, o’quvchi soni raqami — 0; «1994» faqat fayl nomida.

### Ochiq masalalar / TODO(egasi)
- **Jonli `POST /api/ariza` sinovi** hali qilinmadi (konteynerdan domen yopiq) — deploy’dan keyin bitta: `Sinov Sinovov`.
- Sertifikat (storage.googleapis.com) va Telegram rasmlari (telesco.pe) konteynerdan ko’rinmaydi — QA placeholder bilan qilindi; brauzerda jonli yuklanadi.
- `/api/telegram-news` keshi yangilansa, sahifa avtomatik jonli oqimga o’tadi; snapshot’ni yangilash: `node src/parts/65-yangiliklar/gen-news.mjs`.
- Sertifikatlar snapshot (91 ta): yangilash — `node src/parts/30-yutuqlar/gen-certs.mjs`; kelajakda `GET /api/certificates` qo’shilsa, fetch’ga o’tkazish oson.

## 2026-09-27 — v1.0 (yangi kinematik bosh sahifa)
Logistika saytining animatsiya tizimi (GSAP + ScrollTrigger + SplitText, Lenis, tree-shaken Three.js) asosida,
yorug’ «kun osmoni» mavzusida qurildi. Agentlarsiz, bitta qo’lda yozildi. `logistika/` o’zgarmagan.

### Bo’limlar (15)
| # | Qism | Nima bor |
|---|---|---|
| 00 | core | Shisha header (logo.png), faol bo’lim indikatori, mobil to’liq ekran menyu, scroll progress, ambient yulduzlar, `tel:` bosilganda `POST /api/track-call` |
| 10 | hero | Three.js astrolyabiya + armillyar halqalar (navy/oltin), retro-grid, so’zma-so’z sarlavha, yo’nalish slot-so’zi, qabul kartasi («2026–2027: sanoqli o’rinlar», border-beam), 27+ / 1560+ / IELTS 8.0 |
| 15 | ticker | Ikki kesishuvchi marquee (fanlar / maktab hayoti), scroll tezligiga qarab |
| 20 | heritage | Zarracha morfing: yulduz turkumi → kitob va qalam → bino → ikkinchi bino → 2027–2028 reja binosi; 5 nuqtali vaqt chizig’i, asoschi va direktor rasmlari, «Maktabning birinchi binosi» |
| 30 | yonalishlar | 5 faol + «Rus tili yo’nalishlari» (Yangi · 2026–2027, 3 juftlik) + «5–7-sinflar» (qulf, «2027–2028 dan reja»); jonli ikonkalar, spotlight, border beam |
| 35 | hayot | Pinned gorizontal 4 panel: Yotoqxona (2 haftalik kalendar), Xavfsizlik (Face ID skaneri + Telegram xabar **namunasi**), Salomatlik (EKG + shifokor xabarnomasi), Kun tartibi (24 soatlik soat 07:00–21:30, vokzal 300 m) |
| 40 | geografiya | O’zbekiston xaritasi (SVG Maps, CC BY 4.0): chegaralar chiziladi, 6 hudud yoritiladi, kamera sharqqa zoom, hududlardan Uchko’prikka nurlar, «Oliygoh sari» uchqun — raqam yo’q |
| 45 | stats | Aynan 6 ta ko’rsatkich: 27+ (dinamik), Ilk minglik (matn), 1560+, IELTS 8.0 (8/9 o’lchagich), 45+, 64 (8×8 kamera to’ri) |
| 50 | rasadxona | Three.js armillyar sfera: scroll bilan halqalar ochiladi, 5 yo’nalish orbitaga chiqadi; sudrab aylantirish |
| 60 | qabul-jarayoni | 5 bosqich: Ariza → Aloqa (24 soat) → Suhbat/sinov → Rasmiylashtirish → O’qish boshlanadi |
| 65 | ariza | `POST /api/ariza` kontrakti: fullName/region (14 hudud, ’ bilan)/grade (5 variant, 5–7 bloklangan)/phone (+998 maska)/website (honeypot); jonli varaqa, muhr, konfetti; duplicate / 429 / tarmoq xatosi holatlari |
| 70 | nega-biz | 9 afzallik bento (har birida mikro-animatsiya) + «Yangilanishlar» (Face ID 4 apparat, shifokor xabarnomasi sentabr oyidan, rus tili yo’nalishlari, 8-sentabr yubiley, kelish vaqti) |
| 80 | yutuqlar | 3D sertifikat kartalari dastasi (fan + daraja turi, ism yo’q), 1560+, «Namunalarni ko’ring» → /yutuqlar |
| 90 | faq | 15 savol akkordeon, javoblar faqat faktlardan; «To’lov qancha?» → menejer |
| 99 | footer | Kontaktlar, xarita havolasi, ish vaqti + uyga ruxsat izohi, ijtimoiy tarmoqlar, mirzolink.com, tashrif hisoblagichi (`/api/visit`, sessionStorage `mu_visit_counted`), © yil, litsenziya, mobil yopishqoq «Qo’ng’iroq / Ariza» paneli |

### QA natijasi
- `node build.mjs --release` — xatosiz; `dist/index.html` ≈ 1,39 MB (≤ 2,2 MB).
- 1440×900 va 390×844: konsol xatosi 0, gorizontal overflow yo’q, 390 px da 15 px dan kichik o’qiladigan matn yo’q.
- `prefers-reduced-motion` — hisoblagichlar yakuniy qiymatda, hamma matn ko’rinadi.
- Fakt auditi: 974/791/1149/1303 — 0; «ming» faqat «Ilk minglik»; «qabul boshlandi / bino ochildi / qabul ochiq / 5 ta apparat / hamma ota-ona / 2026-sentabr» — 0; ʻ/ʼ — 0.
- Ariza formasi mock bilan sinaldi: bo’sh, noto’g’ri telefon, to’g’ri (ok), duplicate, 429, honeypot.

### Ochiq masalalar / TODO(egasi)
- **Jonli `POST /api/ariza` sinovi qilinmadi**: cloud konteynerdan `mirzoulugbek.app` ga tarmoq ruxsati yo’q. Deploy’dan keyin bitta sinov: ism `Sinov Sinovov`.
- `photos/hero.webp` ishlatilmadi (fayl berilmagan; hero’da 3D astrolyabiya).
- Xarita ma’lumoti: `@svg-maps/uzbekistan` (CC BY 4.0, Victor Cazanave) — footerda manba ko’rsatilgan.
