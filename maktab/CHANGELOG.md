# CHANGELOG — «Mirzo Ulug’bek» bosh sahifasi

## 2026-09-28 — yakuniy A1: aniq va ishonchli matn
- Hero matni bilim, tarbiya va ota-ona bilan maslahatga yo’naltirildi; hero video elementi, CSS va JS o’zgarmadi.
- SEO description’da ta’lim tajribasi xususiy maktab maqomi bilan aralashtirilmaydi. Head joriy alifboda.
- Face ID doimiy joylashuv kuzatuvi kabi tasvirlanmaydi; botga ulanish sharti nazorat va tibbiy xabarnomada ochiq aytildi.
- IELTS natijasidagi umumiy sifat kafolati, barcha yo’nalishlar va darhol AI javobi kabi haddan tashqari da’volar aniq ifodaga almashtirildi.
- Sertifikatlar snapshot bo’lgani uchun ushbu sahifada avtomatik jonli uzatish va’da qilinmaydi.
- 12 aniq o’zgarish (9 fayl): oldingi/yangi matn va sabablar `review/yakuniy/matn-tuzatishlari.json` A1 guruhida.
- QA: desktop/mobil hero, nazorat, yo’nalishlar; konsol, gorizontal overflow va kichik matn xatosi 0. Ikki alifbo tugmasi, SEO, xom region qiymatlari tekshirildi.

## 2026-09-28 — yakuniy tekshiruv: Q0 (QA tayyorgarligi)
- Asos: `d32ec9b` (v3.4), yangi branch: `chatgpt/maktab-yakuniy`; agent/subagentsiz.
- `qa.mjs`: barcha jonli API va ruxsat berilmagan tarmoq so’rovlari bloklanadi; API mocklari saqlandi. `--live-media` faqat tasdiqlangan rasm GET’lariga ruxsat beradi.
- `--alifbo yangi|joriy`, o’rnatilgan Edge uchun `MU_QA_BROWSER_CHANNEL`, qat’iy 15 px, ichki scroll bilan hujjat overflow’ini farqlash, oxirgi ekran skrinshoti va QA xatosida exit code 1 qo’shildi.
- Bazaviy ko’rinish: Edge, 1440×900 va 390×844, 20 skrinshot — konsol/overflow/kichik matn xatosi 0. Animatsiyalar, video va media o’zgarmadi.
- Eski changelog’dagi jonli ariza sinovi ko’rsatmalari joriy topshiriqda qo’llanmaydi: barcha sinovlar mock bilan.

## 2026-09-28 — v3.4 (DIGITAL: fleshkadagi 24.06.2026 dron s’yomkasi — `MEDIA/dron/`, 4K; hero videoga tegilmadi)
| Qism | Nima |
|---|---|
| **52-dron** | 5 kadr, 4K manbadan (katta ekranda `@2k` 2560 px — `srcset`): **Uchko’prik tumani** (panorama) → **Qayrog’och** (mahalla ichida maktab) → **Yangi bino** → **Maktab hovlisi** (saf, to’g’ridan tepadan) → **Vokzalga ~300 m** (temir yo’l). 1-, 3- va 5-kadrda **jonli dron klipi** (7 s, 1280×720, ovozsiz): faqat faol kadrda, bo’lim ekranda, gorizontal ekranda va Save-Data/sekin tarmoq bo’lmasa o’ynaydi; o’ynay boshlaganda kadr ustiga silliq chiqadi. Telefonda (portret) — 4K **vertikal** kadrlar. |
| 50-hayot | 01: **Qo’qon O’rdasi — DJI dron FOTOSI** (4096 px manba); yangi 06: **Bitiruv marosimi — zal oldida, tepadan**; «ikkinchi uy»dagi bino — 4K vertikal kadr (`yangi-bino-vert-2`). Lenta — 11 surat. |
| 99-footer | Footer tepasida **dron panoramasi** (Qayrog’och · Uchko’prik — «Sizni maktabimizda kutamiz»), sekin parallaks, telefonda vertikal kadr. |
| DEPLOY.md | Media ro’yxati `index.html` dan avtomatik: **26 fayl** (rasmlar + 3 klip), qoida: `/media/X` → `public/media/X`. |
| make-preview | Preview’da `@2k` nusxalar inline qilinmaydi (hajm). |
Ishlatilmadi (ataylab): `qurilish-*` va `eski-bino-*` — egasining tasdig’i kutilmoqda; yuzlari yaqinroq kadrlar.

QA: desktop + mobil, 19 bo’lim — konsol xatosi 0 (headless’da faqat H.264 video yuklanmaydi — hero va kliplar), overflow yo’q, kichik matn yo’q.

## 2026-09-28 — v3.3 (egasi: «dron kadrlari — eng kuchli kadr, pastdagi bo’limlarga»; hero videoga tegilmadi)
| Qism | Nima |
|---|---|
| **52-dron** (yangi) | «Maktabimiz — osmondan»: «Maktab hayoti» va «Geografiya» orasida to’liq ekranli dron lentasi. Skroll bilan kadrlar «oldinga uchib» almashadi (Ken Burns: joriy kadr yaqinlashib ketadi, keyingisi ustidan chiqadi — qorong’i o’tishsiz): **Uchko’prik tumani → Qayrog’och qishlog’i → yangi bino va hovli → temir yo’l (vokzalga ~300 m)**, so’ng sahifa «qayerdan keladi?» xaritasiga o’tadi. Kamera ramkasi, «● DRON» belgisi, 01/04 hisoblagich va progress. Telefonda (portret) 2- va 3-kadrlar **vertikal** dron kadrlari (`bino-dron-1/2`). Reduced-motion’da — 2×2 statik galereya. Kadrlar: `MEDIA/bino/hudud-panorama-dron{,-2}`, `yangi-bino-dron`, `qulayliklar/vokzal-temir-yol-dron`. |
| DEPLOY.md | Media ro’yxati 13 faylga yangilandi — `index.html` dagi har bir `mirzoulugbek.app/media/…` havolasi ro’yxatda bor (skript bilan tekshirildi). |

QA: desktop + mobil to’liq sahifa, 19 bo’lim — konsol xatosi 0, overflow yo’q, kichik matn yo’q; reduced-motion mobil — statik galereya.

## 2026-09-28 — v3.2 (DIGITAL’ning yangi bino suratlari)
| Qism | Nima |
|---|---|
| 25-meros | 2025 «Kengayish — yangi bino»: **`bino/yangi-bino-fasad.webp`** (asl YouTube rolikidan 1920×1080: peshtoqida «XUSUSIY MIRZO ULUG’BEK MAKTABI») — endi 2024 (birinchi bino) bilan yonma-yon solishtiriladi. |
| 75-kanallar | Tashrif kartasi: **`bino/yangi-bino-fasad-keng.webp`** — ko’chadan ko’rinish (kelganda tanib olish oson). |
| 50-hayot | Lenta 8 → **10 surat**: boshida **Qo’qon O’rdasi — dron kadri** (o’quvchilar saroy zinasida), 5-o’rinda **tadbir — bayroqlar bilan**. |
| DEPLOY.md | `public/media/` ro’yxati `index.html` dagi havolalar bilan aynan moslandi (8 fayl; `bino-dron-2` endi ishlatilmaydi). |

## 2026-09-28 — v3.1 (egasining v3 izohlari bo’yicha)
| Qism | Nima |
|---|---|
| Ish vaqti | Hamma joyda **06:00 — 21:30** (menyu, qabul kartasi, FAQ, tashrif kartasi, footer, JSON-LD `opens`). FAQ’dagi «qabul 07:00 dan boshlangan» — boshqa fakt, o’zgarmadi. |
| **25-meros** | 2024: eski bino surati endi **«Maktabning birinchi binosi»**. 2025 «Kengayish — yangi bino»: **yangi binoning surati** (`qulayliklar/bino-dron-2.webp` — kanal 4623 videosidan dron kadri: uch qavatli bino, peshtoqida «Xususiy Mirzo Ulug’bek maktabi»). Ikkala surat bir xil balandlikda, 16:10 kesim. |
| 75-kanallar | «Maktabga tashrif buyuring» kartasida eski bino o’rniga **yangi bino** (+ «Maktabning yangi binosi» yozuvi). |
| 50-hayot | Uchinchi surat: bino takrorlanmasin deb **`bino-dron-1.webp`** (maktab va Qayrog’och — tepadan panorama). |
| **55-geografiya** (qayta ishlandi) | **Barcha o’quv yillari birlashtirildi** (2022–2023, 2024–2025, 2025–2026, 2026–2027 — viloyat ulushlari o’rtachasi; yil tugmalari yo’q). Rang — **o’quvchilar soniga qarab** uzluksiz shkala (yashil → sariq → to’q sariq → qizil) va to’qlik; «kam / o’rta / ko’p / juda ko’p» so’zlari **olib tashlandi** — o’rniga so’zsiz shkala (bir kishi ↔ ko’p kishi belgisi). Nurlar qalinligi va oqimdagi tomchilar soni ham shu bo’yicha. Yangi animatsiya: konturlar → **maktabdan to’lqin** (hudud to’lqin yetgan lahzada bo’yaladi) → kamera → nurlar → yorliqlar. Yorliqlar endi **hudud yonida** (qisqa chiziqcha, bo’sh tomonga), bir-birini va «Uchko’prik» yozuvini bosmaydi. Legend/hudud/yorliq/nur — hover’da bir-biriga bog’langan. |
| Olib tashlandi | **Farg’ona vodiysi — tumanlar kesimida** xaritasi to’liq (`a-tuman.js`, `gen-tuman.mjs`, OCHA/geoBoundaries krediti). |
| `gen-hudud.mjs` | Yillarni birlashtiradi (yilda `jami` bo’lsa — o’quvchilar soni bilan tortiladi); `a-hudud.js` da faqat **tartib va 1…10 daraja** — foiz ham, son ham yo’q. |
| `PROMPTLAR-2.md` | DIGITAL (yangi bino suratlari; topilmasa router orqali «Javas loyihasi» chatiga — eski Surface kompyuter ekran stoli) va ChatGPT (yakuniy «o’zbeklarga mosligi» tekshiruvi) uchun promptlar. |

QA: desktop 1440 + mobil 390 to’liq sahifa — konsol xatosi 0, gorizontal overflow yo’q, 15 px dan kichik matn yo’q (headless’da faqat `hero.mp4` ERR_ABORTED).
Audit: `index.html` da foiz/son yo’q, «07:00 — 21:30» yo’q, ʻ/ʼ yo’q, «asosiy binosi» yo’q.

## 2026-09-28 — v3.0 (uchinchi versiya: yangi alifbo, Face ID + Nazoratchi bot, professional rasadxona, hududiy zona xaritasi)
Manbalar: egasining izohlari; **bazaviy chat** (maktab bazasidan: hududiy ulushlar, bot imkoniyatlari va haqiqiy xabar matnlari, Face ID,
qulayliklar, «19:30/19:45» xatosi); **DIGITAL** (`ff844d2`: sinfxona/bino suratlari, Face ID infografikalari, bot namunalari, alifbo qonuni holati);
**ChatGPT (Astra 6)** `chatgpt/maktab-astra6` (`c2073f7`) — foydali yechimlari ko’chirildi (pastda). Agentlarsiz. `logistika/` o’zgarmagan.

### Asosiy o’zgarishlar
| Qism | Nima |
|---|---|
| **Yangi alifbo** (`src/base/alifbo.js`, `build.mjs`) | Senat 10.09.2026 da ma’qullagan shakl: Sh→**Ş**, Ch→**Ç**, O‘→**Ö**, G‘→**Ğ**, tutuq belgisi **’**. Build statik matnni o’giradi; MutationObserver dinamik matnni (yangiliklar, chat, forma, sertifikat) moslaydi. URL, @handle, email, #xeshteg va `[data-raw]` o’zgarmaydi; forma `value`lari API uchun joriy alifboda. Sarlavhada **«Ö / O‘»** tugmasi (joriy alifboga qaytish, localStorage). `<head>` (SEO) joriy alifboda. `--alifbo joriy` bilan eski alifboda build. Shriftlarga Ğ ğ Ş ş qo’shildi (`vendor/gen-fonts-uz.mjs`, ≈8 KB). Qonun Prezident imzosini kutmoqda (DIGITAL: 21-oktabrgacha) — tugma shuning uchun. |
| **22-nazorat** (yangi) | «Farzandingiz qayerda — siz doim bilasiz»: Face ID terminali (yuz nuqtalari skaneri) → Telegram telefoni; xabarlar — maktab tizimining **haqiqiy shablonlari** (kirdi, tibbiy xona, uydan qaytdi) + maktabning namuna kartasi; 5 imkoniyat (surat bilan xabar, kechikish/o’tmadi, uyga javob va qaytish, tibbiy xona, bot menyusi); YASHIL/SARIQ/QIZIL apparat javoblari (maktab infografikasi); **ulanish — 3 qadam, bepul**; admin havolasi. |
| **27-rasadxona** (yangi, professional) | Samarqand (39°40′ sh.k.) osmoni: **Yale BSC’dan 2769 ta haqiqiy yulduz** va yulduz turkumlari, hozirgi **mahalliy yulduz vaqti** bo’yicha aylanadi; jez **armillyar sfera** (PBR metall, ufq/meridian, ekvator, ekliptika 23°30′17″, kolurlar, tropiklar) osmon bilan sinxron; 5 bob: rasadxona → 1018 yulduz («Ziji Ko’ragoniy») → yil uzunligi → ekliptika og’ishi/Faxriy sekstanti → yo’nalishlar orbitasi. |
| **55-geografiya** | Chiziqcha (leader line) bilan ulangan rangli yorliqlar; bazaviy chat ulushlaridan **faqat darajalar** (kam / o’rta / ko’p / juda ko’p — raqamsiz), **4 o’quv yili** tugmalari; yangi **Farg’ona vodiysi tumanlari zona xaritasi** (47 tuman, OCHA ROCCA/geoBoundaries CC BY 3.0 IGO). Foizli kirish fayli repoga qo’yilmadi. |
| Faktlar tuzatildi | «19:30 gacha / 19:45 dan keyin» **olib tashlandi** (tizimda yo’q); dars 06:00 da boshlanadi; ovqat kuniga 2 mahal + non, choy; Face ID: 4 ta kirishda + tibbiy xonada 1; shifokor xabarnomasi 2026-yil sentabrdan ishlamoqda. |
| 50-hayot | Haqiqiy sinfxona va bino (dron) suratlari; «Kun va ovqat» kartasi; suratlarni bosib kattalashtirish. |
| 65-yangiliklar | Rasm yo’q bo’lsa **maktab logotipi**; «Yangilanishlar»da Face ID + Nazoratchi bot tepada, bot havolasi bilan. |
| Olib tashlandi | «Ota-onalar fikri» (egasi: shart emas). |

### ChatGPT (Astra 6) dan ko’chirilgan yechimlar (bizning animatsiyali tuzilmaga moslab)
Yo’nalishlar **filtri** (Tibbiyot / Texnika va IT / Tillar, GSAP Flip bilan) · **FAQ qidiruvi** (ikkala alifboda: «shartnoma» = «şartnoma») ·
**surat ko’rish oynasi** (sertifikat markazida — «Barcha yutuqlar» havolasi bilan; galereya) · sertifikatlarda **pauza/davom** tugmasi va fokusda to’xtash ·
**«Asosiy mazmunga o’tish»** havolasi + `<main>` landmark + sarlavha ostida qolmaydigan anchorlar · mobil menyuda fokus boshqaruvi ·
telefon maydoniga **+998 bilan joylashtirish** xatosi tuzatildi, `aria-invalid` · chat **25 s timeout** · yangiliklar rasm/havola hostlari
`URL.hostname` bilan aniq tekshiriladi (o’xshash domen o’tmaydi) · Save-Data/sekin tarmoqda hero video o’zi yuklanmaydi · **Tashrif kartasi**
(bino surati, manzil, ish vaqti, xarita, qo’ng’iroq) · ishlatilmaydigan 5 ta GSAP plagini olib tashlandi (≈76 KB).
Ko’chirilmadi (ataylab): animatsiyalarni (reveal/split/pin/parallax) olib tashlash va soddalashtirish — egasi «o’ta sodda bo’lib qoldi» degan.

### QA (v3)
- `node build.mjs --release` — `index.html` ≈ 1,43 MB (Three.js rasadxona uchun ≈ 0,54 MB; server gzip bilan ~0,45 MB).
- 1440×900 va 390×844 to’liq sahifa: konsol xatosi 0, gorizontal overflow 0, 390 px da 15 px dan kichik matn 0.
- Funksional: filtr, FAQ qidiruvi (2 alifbo), lightbox (Esc), pauza, forma (ok, 60 s, duplicate, 429, +998 joylashtirish), chat, yangiliklar almashuvi, alifbo tugmasi, mobil menyu fokusi — hammasi o’tdi.
- Audit: ʻ/ʼ 0; «19:30/19:45», «qabul ochiq», narx, o’quvchi soni/foizi — 0.

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
