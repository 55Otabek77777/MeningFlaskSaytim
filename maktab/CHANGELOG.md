# CHANGELOG — «Mirzo Ulug’bek» bosh sahifasi

## 2026-09-28 — v3.0 (professional ko’rinish va qulay foydalanish)

Asos: `claude/logistics-site-animation-comparison-r4scvk`, commit `229ea27`. Ish faqat `chatgpt/maktab-astra6` branch’ida, agent/subagentsiz bajarildi. Faktlar `JONLI-SAYT` va FARQLAR o’ng ustunidan; boshqa loyiha papkalari o’zgarmadi.

### Dizayn, bo’limlar va foydalanish

| Fayl / papka | O’zgarish |
|---|---|
| `src/base/base.css` | Oq/iliq fon, to’q ko’k va qizil rang, Manrope, tartibli sarlavha va intervallar. Kichikroq radiuslar, sokin tugmalar. 390 px da matn kamida 15 px. |
| `src/parts/*/part.html` | Matnni yashiradigan generic reveal/split/scramble/tilt/parallax atributlari olib tashlandi. Kontent darhol ko’rinadi. |
| `00-core/{part.html,core.css,core.js}` | Soddalashtirilgan header, mazmunga o’tish havolasi, desktop dropdown, native dialog mobil menyu; Tab/Shift+Tab fokus chegarasi, Escape, yopilganda fokus qaytishi. Umumiy surat ko’rish dialogi qo’shildi. Telefon tracking saqlandi. |
| `10-hero/{part.html,hero.css,hero.js}`, `src/template.html` | Birinchi ekranda haqiqiy asosiy bino surati va aniq CTA. Bino rasmi preload. Video alohida tugma orqali dialogda, boshqaruvlari bilan ochiladi; src/poster bosilguncha belgilanmaydi. Yopilganda/to’liq yashirilganda ijro to’xtaydi; video xatosida original havola bor. |
| `12-qabul/{part.html,qabul.css}` | Qabulning tasdiqlangan joriy holati aniq to’q ko’k blokda, chalg’ituvchi animatsiyalarsiz. |
| `20-stats/{part.html,stats.css,stats.js}` | Oltita asl ko’rsatkich tartibli jadvalda. Sun’iy o’sib boruvchi sanoq, canvas va bezaklar olib tashlandi; Ilk minglik matni saqlandi. |
| `25-meros/{part.html,meros.css,meros.js}` | Asoschi/direktor haqiqiy suratlari, o’qiladigan izohlar va sodda tarix chizig’i. Takroriy bino tasviri yashirildi, parallax olib tashlandi. |
| `30-yutuqlar/{part.html,yutuqlar.css,yutuqlar.js}` | 91 haqiqiy sertifikat, fan filtri va soat saqlandi. Tinchroq fon, yaqin sertifikatlarnigina yuklash; markazdagi rasmni kattalashtirish. Aniq pauza/davom tugmasi, fokus/hover/yashirin sahifa/dialogda pauza; reduced-motion’da avtomatik almashish boshlanmaydi. Yon kartalar klaviatura fokusidan chiqarildi. |
| `35-yonalishlar/{part.html,yonalishlar.css,yonalishlar.js}` | 6 faol yo’nalish kartasi: barcha / tibbiyot / texnika va IT / tillar filtrlari, e’lon qilinadigan natija holati. 5–7-sinf rejasi alohida. Rus yo’nalishlari 9–11-sinflar uchun. Mavjud ichki URL’lar saqlandi. |
| `40-qabul-jarayoni/{part.html,part.js,process.css}` | 5 qadamli ixcham tushuntirish. 8–9, 10 va 11/bitiruvchilar qabulidagi farqlar asl faktlar bilan; katta dekorativ panellar olib tashlandi. |
| `45-ariza/{part.html,ariza.css,ariza.js}` | Doim o’qiladigan yorliqlar, aria-invalid, xatoga fokus. To’liq +998 telefon raqamini joylashtirish tuzatildi. Konfetti olib tashlandi; muvaffaqiyat/duplicate/429/60 soniya cheklovi saqlandi. Ism va API qiymatlari transliteratsiya qilinmaydi. |
| `50-hayot/{part.html,hayot.css,hayot.js}` | 8 haqiqiy surat: odatiy gorizontal lenta, scroll-snap, oldingi/keyingi va klaviatura boshqaruvi, joriy indeks, kattalashtirish. Desktop sahifani ushlab turadigan pin olib tashlandi. Yotoqxona, xavfsizlik, shifokor va kun tartibi faktlari tartiblandi. |
| `55-geografiya/{part.html,geografiya.js}` | Asl SVG xarita va haqiqiy hududlar saqlandi. Animatsion nurlar va oliygoh yo’li olib tashlandi; Farg’ona hududi tushunarli izohlandi. |
| **`58-tashrif/{part.html,tashrif.css}`** | **Yangi bo’lim:** haqiqiy bino, manbada berilgan to’liq manzil, har kungi 07:00–21:30 ish vaqti, telefon va mavjud Google Maps havolasi. |
| `60-sharhlar/{part.html,sharhlar.css}` | Asl 3 sharh va Google bahosi saqlandi. Sokin kartalar; mobil’da har biri alohida to’liq o’qiladi. |
| `65-yangiliklar/{part.html,yangiliklar.css,yangiliklar.js}` | Yangiliklar o’qilishi va uzun matnlar ko’rinishi yaxshilandi; eski keshni rad etish saqlandi. Rasm hosti URL.hostname bilan aniq tekshiriladi; o’xshash zararli domen qabul qilinmaydi. |
| `70-faq/{part.html,faq.css,faq.js}` | **Yangi qidiruv:** ikkala o’zbek alifbosidagi so’zlar bilan; topilmasa aniq holat va menejerga yo’l. Asl 15 savol/javob saqlandi. |
| `75-kanallar/{part.html,kanallar.css}`, `99-footer/{part.html,footer.css,footer.js}` | Aloqa va footer tartiblandi. Barcha aloqa/ichki yo’llar, sessiya tashrif hisoblagichi saqlandi; meteor/marquee bezaklari olib tashlandi. |
| `98-chat/{part.html,chat.css,chat.js}` | Native modal, fokusni saqlash, Escape, aniq yopish. 25 soniya timeout. Javoblar yangi alifboda, foydalanuvchi matni aslida; history/session kontrakti saqlandi. |

### Build, alifbo va hajm

- `build.mjs`: parse5 yordamida matn/ko’rinadigan atributlarni xavfsiz transliteratsiya, haqiqiy `<main>` landmark. Asl option qiymatlari oldindan saqlanadi; URL/script/style/API qiymatiga tegilmaydi.
- **`src/base/alphabet.mjs`, `alphabet.js`**: umumiy build/runtime `toLatin`, `MU.t`, `MU.translate`, dinamik matn kuzatuvchisi. Tekshirilgan asos branch’da bu mexanizm bo’lmagani uchun qo’shildi. Ş, Ç, Ö, Ğ va ’ chiqadi; user input, @username va havolalar saqlanadi.
- `src/base/bootstrap.js`: anchor offset va bo’limga klaviatura fokusi.
- `package.json`, `package-lock.json`: parse5 va lokal Manrope; `qa:functional` buyrug’i. `vendor/Manrope-OFL.txt` litsenziya.
- Ishlatilmaydigan GSAP plaginlari bundle’dan chiqarildi. Lokal Manrope latin/latin-ext ichiga joylandi; shrift uchun tarmoq so’rovi yo’q.
- Release `index.html` va `dist/index.html`: **832 846 → 490 408 bayt (813,3 → 478,9 KiB)**, **41,1% kam**. Bu HTML hajmi; original media alohida. 76 MB video boshlang’ich yuklanishdan chiqarildi.

### QA va hujjatlar

- `qa.mjs`: tashqi tarmoq standart yopiq, barcha API mock; `--live-media` faqat tasdiqlangan rasm GET’lari; brauzer kanali tanlash. 15 px chegarasi, gorizontal lenta bilan hujjat overflow’ini farqlash, sahifaning oxirgi qoldiq ekranini ham olish. Xato topilsa jarayon muvaffaqiyatsiz tugaydi.
- **`qa-functional.mjs`**: 21 muvaffaqiyatli tekshiruv — forma/telefon/kontrakt/limit, chat, menyu/fokus, yo’nalish, FAQ, galereya, sertifikat va video, tashrif/qo’ng’iroq, yangilik va moslashuv.
- 1440×900 va 390×844 to’liq QA: **62 skrinshot**, konsol xatosi **0**, gorizontal overflow **0**, 390 px da 15 px dan kichik matn **0**.
- Reduced-motion: 12 skrinshot, ikkala o’lchamda yuqoridagi xatolar **0**. Jonli GCS/Telegram rasm tekshiruvi ham o’tdi. Edge’da haqiqiy MP4 ijrosi va yopilganda to’xtashi tekshirildi.
- Sun’iy 400/429 sinovlarida kutilgan HTTP resurs xabarlari qayd etiladi; JavaScript runtime xatosi yo’q. **Jonli /api/ariza ga sinov yuborilmadi.**
- **`QA.md`, `review/`**: egasiga hisobot, tanlangan ko’rinishlar va mashina o’qiydigan natijalar. To’liq fayl ro’yxati `review/CHANGED-FILES.txt`.
- `SPEC.md` va `DEPLOY.md` joriy tuzilma/qoidalarga moslandi. `JONLI-SAYT/API.md` dagi eski jonli ariza sinovi ko’rsatmasi joriy taqiq bilan almashtirildi; kontrakt o’zgarmadi.
- `.gitattributes`: maktab matn fayllari uchun LF; `.gitignore`: brauzer debug.log fayli chiqarildi.

**Tarixiy qayd:** pastdagi v1/v2 yozuvlar tarix sifatida saqlangan. U yerdagi «jonli bitta ariza sinovi» ko’rsatmalari bekor; joriy topshiriqda jonli sinov yuborish taqiqlangan. Sertifikatlar snapshotligicha qoladi; yangi backend yoki avtomatik sertifikat endpointi qo’shilmadi. Telegram route keshi backend tomonda eski bo’lsa, tasdiqlangan yangi snapshot saqlanadi.

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
