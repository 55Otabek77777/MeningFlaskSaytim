# MATNLAR — bosh sahifa (https://mirzoulugbek.app/) ekrandagi tartibda

Manba: `app/page.tsx` + `app/layout.tsx` + komponentlar (2026-09-28 holati). `{yil}` = `new Date().getFullYear() - 1999`
(2026 da **27**). Apostrof hamma joyda **’** (U+2019). Ranglar: `--primary #1e3a8a` (brand), `--accent #dc2626`,
`--bg-soft #f8fafc` (mist), matn `#0f172a`; dark rejim bor (`.dark`), lekin default — yorug‘.

## 0. `<head>`
- `<title>`: **«Mirzo Ulug’bek» xususiy maktabi — Uchko’prik, Farg’ona**
- description: **{yil} yildan buyon Uchko’prik tumani, Farg’ona viloyatida faoliyat yuritayotgan xususiy maktab. 2025–2026 o’quv yilida 1560+ sertifikat, IELTS 8.0. Qabul 1-avgustdan.**
- Layout default title: `Mirzo Ulug’bek xususiy maktabi — Uchko’prik, Farg’ona | {yil} yillik tajriba`; sahifa shabloni `%s — «Mirzo Ulug’bek» xususiy maktabi`
- OG image: `/og-image.png` (1200×630). Favicon: `app/icon.png`.
- JSON-LD `EducationalOrganization`: name «Mirzo Ulug’bek» xususiy maktabi; alternateName «ULUGBEK PERFECT EDU» Nodavlat ta’lim muassasasi; foundingDate 1998; founder Jabborov A’zamjon Mashrabovich; telephone +998974173777, +998945953777; email mirzoulugbekxususiymaktabi@gmail.com; address Nihol MFY, Qayrog’och qishlog’i, 45-uy, Uchko’prik tumani, Farg’ona viloyati; geo 40.6182794, 70.9805234; ish vaqti Du–Yak 07:00–21:30; aggregateRating 4.9 (41 sharh); sameAs: t.me/ulugbek_rm, instagram.com/mirzoulugbekmaktabi, youtube.com/@ulugbek_xm, maps.app.goo.gl/n7HcCtnK3KU1ZUWh9, maps.google.com/?cid=18054142510786065278, wikidata Q140421588, mirzolink.com.

## 1. Scroll progress (`ScrollProgress`)
Ekran tepasida 4px qizil (`accent`) o‘qish-progress chizig‘i.

## 2. Header (`Header`, sticky, oq/95 + blur)
- Logotip `/logo.png` (40×40) + **MIRZO ULUG’BEK** / kichik: **xususiy maktabi**
- Menyu: **Bosh sahifa** (/) · **Maktab haqida** (/maktab-haqida) · **Yo’nalishlar** (dropdown ▾) · **Qabul** (/qabul) · **Yutuqlar** (/yutuqlar) · **Yangiliklar** (/yangiliklar) · **FAQ** (/faq) · **Aloqa** (/aloqa)
- Dropdown (6 ta): Kimyo–Biologiya · Ingliz tili · Matematika–Fizika · Matematika–Ingliz tili · Ona tili–Adabiyot · 5–7-sinflar (→ `/yonalishlar/<slug>`)
- CTA tugma (qizil, `btn-beam` — chegarada aylanuvchi yorug‘ chiziq): **Hujjat topshirish** → /qabul
- Mavzu tugmasi aria: «Tungi rejimga o’tish» / «Yorug’ rejimga o’tish»
- Mobil: hamburger (aria «Menyuni ochish» / «Menyuni yopish») → to‘liq menyu + **Hujjat topshirish**

## 3. Hero (`HeroVideo` + matn) — `min-h-[100svh]`, desktopda 88vh
- Fon: **video** `/assets/video/hero.mp4` (poster `/assets/video/hero-poster.webp`, alt ««Mirzo Ulug’bek» xususiy maktabi — tanishuv videosidan lavha»). Avtoplay, ovozsiz, loop; videoga bosilsa ovoz yoqiladi. Tugma (chap-past, qora/55 pill): **Ovozni yoqish** ↔ **Ovozni o’chirish** (aria «Videoni ovozli tinglash uchun bosing»). Reduced-motion — faqat poster.
- Gradient: mobil — pastdan oq; desktop — chapdan oq (matn o‘qilishi uchun).
- H1 (`hero-fadein`): **Biz nafaqat dars beramiz —** `<span brand>`**farzandingiz kelajagini yaratamiz.**`</span>`
- Lead: **Yillar davomida sinovdan o’tgan tajriba va zamonaviy ta’lim muhiti. Farzandingiz uchun to’g’ri tanlov — aynan shu yerda.**
- CTA (qizil gradient `cta-gradient`, katta): **Birinchi qadamni tashlang — hujjat topshiring** → /qabul
- Ostida: **yoki qo’ng’iroq qiling:** **+998 97 417 37 77** (`tel:+998974173777`)
- Kichik: **Litsenziya № 363657 · Uchko’prik, Farg’ona**

## 4. Qabul banneri (`QabulCountdown`, `.cd-midnight` — tun-ko‘k, qizil urg‘u, `Bebas Neue` raqamlar)
- Eyebrow (qizil, uppercase): **2026–2027 o’quv yili**
- **1-avgust 07:00 gacha (COUNTDOWN_FROM = 2026-08-01T07:00:00+05:00):**
  - H2: **Qabul boshlanishiga qoldi**
  - Sanoq: `Kun : Soat : Daqiqa : Soniya` (raqam almashganda pastga sirg‘alib almashadi — `cd-out`/`cd-in`)
  - Chiplar: **📅 1-avgust** · **🕖 soat 07:00** · **🎓 8–11-sinflar** · **🎯 Birinchi bo’lib joy band qiling** (hover’da «Birinchi» → «Birinchilardan»)
  - Tugmalar: **Hoziroq ariza qoldiring** (→ /qabul, `btn-shimmer`) · 📞 **+998 97 417 37 77**
- **1-avgustdan keyin (HOZIR jonli saytda shu ko‘rinadi):**
  - Konfetti (canvas, brend ranglar) + H2: **Qabul boshlandi! 🎉**
  - Matn: **2026–2027 o’quv yili qabuli ochiq. Joylar soni cheklangan — hoziroq qabul uchun murojaat qiling.**
  - Katta tugma: 🎓 **Qabul uchun murojaat qiling** → https://mirzolink.com · ostida **mirzolink.com**
  - `?qabul=preview` bilan oldindan ko‘rish mumkin.
  - ⚠️ **Eskirgan** — pastdagi FARQLAR §A ga qarang.

## 5. «Nega aynan biz?» (`AnimatedCounters`, `bg-mist`)
- H2: **Nega aynan biz?**
- 6 karta (yuqorida qizil chiziq, gradient raqam, ikonka, hover’da ko‘tariladi; raqamlar ko‘ringanda 1.4s sanaladi):

| qiymat | ikonka | izoh (label) |
|---|---|---|
| **{yil}+** | award | o’quv markazi va ta’lim sohasidagi yillik tajriba |
| **Ilk minglik** (matn) | users | 2025–2026 o’quv yilida o’quvchilarimiz soni ilk minglik davriga qadam qo’ydi |
| **1560+** | scroll | 2025–2026 o’quv yili davomida o’quvchilarimiz qo’lga kiritgan milliy va xalqaro sertifikatlar soni |
| **IELTS 8.0** (matn) | globe | o’qituvchimizning shaxsiy natijasi — ta’lim sifati kafolati |
| **45+** | briefcase | tajribali va pedagogik mahoratli o’qituvchilar |
| **64** | camera | hudud bo’ylab videokuzatuv kameralari; yotoqxonalarda maxsus nazoratchilar |

## 6. Meros (`LegacyBlock`, oq fon, 2 ustun)
- Chap: 2 ta foto-karta (`photo-card`, hover’da zoom + caption): `/photos/founder.webp` — caption **Jabborov A’zamjon Mashrabovich — asoschi**; `/photos/director.webp` (biroz pastroq) — caption **Mashrabjonov Ulug’bek A’zamjon o’g’li — direktor**
- H2: **Bir oilaning orzusi —** `<span brand>`**bir avlodning kelajagi**`</span>`
- Matn: **{yil} yil avval Jabborov A’zamjon Mashrabovich Uchko’prikda kichik bir orzu bilan ish boshladi: qishloq bolalari ham dunyo darajasidagi ta’lim olsin. Bugun bu orzuni o’g’li — Mashrabjonov Ulug’bek A’zamjon o’g’li davom ettirmoqda. Ikki avlod, bitta maqsad — farzandingizning kelajagi.**
- Tugma (navy kontur): **Tariximiz bilan tanishing →** → /tarix

## 7. Yutuqlar karuseli (`AchievementsCarousel`, `.ach-panel` — «Aurora Depth» tun-ko‘k panel, oltin hairline, 30s sekin drift)
- Eyebrow (amber, uppercase): **Yutuqlarimiz**
- H2: **Natijalar o’zi gapiradi**
- Matn: **«Mirzo Ulug’bek» xususiy maktabi o’quvchilari 2025–2026 o’quv yilida 1560+ milliy va xalqaro sertifikat qo’lga kiritdi. Quyida — ana shu natijalardan namunalar; ular maktabimizning rasmiy Telegram kanalidan bot orqali avtomatik saytga uzatiladi.**
- **Soat** (`AchievementsClock`, 200px, oq siferblat, ko‘k halo, to‘q-ko‘k millar, to‘q sariq soniya mili, siferblatda `/logo.png` va yozuv **Mirzo Ulug’bek** / **xususiy maktabi**). Soniya mili har soniyada «tik» etadi; **har 3 soniyada** bitta sertifikat oldinga o‘tadi (`useSecondTick(cb, 3)`).
- Soat ostida: **Vaqtingizni qadrlang** · **Har lahza — kelajagingiz uchun bir qadam** · **Ushbu kelajagingizni «Mirzo Ulug’bek» bilan birga yarating**
- Coverflow (perspective 1600px; ±3 karta): `translateX(pos·38%) scale([1,.66,.48,.36]) rotateY(pos·−13°)`, opacity `[1,.5,.24,.08]`, **blur `[0,2,3.6,5.5]px`** — ya’ni markaz aniq, yon kartalar xira. Bosilsa → /yutuqlar. Rasm sifati: o‘rtadagi 500px balandlikda (mobil 330px), oq ramka, soya.
- Strelkalar aria: **Oldingi** / **Keyingi**
- Sarlavha (caption): **{name}** / **{subject} · {grade} daraja** (masalan «Kimyo · A+ daraja»)
- Progress chizig‘i (amber, sudralib o‘tkaziladi) + **{i} / {total}** (jonli: 91 ta)
- CTA: **Barcha yutuqlarni ko’rish →** (/yutuqlar, oq) · ✈ **Telegram kanalimizda kuzatish** (t.me/ulugbek_rm, kontur)

## 8. Yo‘nalishlar (`YonalishlarGrid`, id=`yonalishlar`)
- H2: **Yo’nalishlarimiz**
- Sub: **Oliy o’quv yurtiga kirish uchun kerak bo’ladigan barcha yo’nalishlar maktabimizda mavjud. Har bir o’quvchi o’z maqsadiga mos fanlar juftligini tanlaydi.**
- 6 karta (`card-glow` — hover’da qizil nur; ikonka aylanadi), har birida **Batafsil →**:
  1. **Kimyo–Biologiya** — Tibbiyot va farmatsevtikaga tayyorlov: chuqurlashtirilgan kimyo va biologiya, laboratoriya amaliyoti, milliy sertifikatga yo’naltirilgan dastur. (`/yonalishlar/kimyo-biologiya`, ikonka `pulse`)
  2. **Ingliz tili** — Kuchli til bazasi va xalqaro imtihonlarga tayyorlov. Tajribali o’qituvchilar jamoasi bilan natijaga yo’naltirilgan darslar. (`ingliz-tili`, `globe`)
  3. **Matematika–Fizika** — Texnik oliygohlarga poydevor: olimpiada, sertifikat va kirish imtihonlariga tizimli tayyorlov. (`matematika-fizika`, `sigma`)
  4. **Matematika–Ingliz tili** — Eng ko’p talab qilinadigan juftlik: iqtisod, IT va xalqaro dasturlar uchun. (`matematika-ingliz`, `calcglobe`)
  5. **Ona tili–Adabiyot** — Milliy sertifikat natijalari va filologiya yo’nalishlariga tayyorlov. (`ona-tili-adabiyot`, `book`)
  6. **5–7-sinflar** — Hozirda maktabimizda 8–11-sinflar ta’lim oladi. 5-sinfdan 7-sinfgacha bo’lgan o’quvchilar uchun zamon talablariga mos yangi bino qurilmoqda — ochilishi 2026-yil sentabrga rejalashtirilgan. (`5-7-sinflar`, `seedling`) ⚠️ eskirgan — FARQLAR §B
- (Jonli saytda hali **Rus tili yo’nalishlari** kartasi yo‘q — SPEC §3 №7 bo‘yicha qo‘shiladi.)

## 9. Qabul jarayoni (`QabulSteps`, `bg-brand` ko‘k, oq matn)
- H2: **Qabul jarayoni — 3 qadam**
- 1 **Ariza qoldiring** — Saytda 1 daqiqalik forma yoki telefon orqali.
- 2 **Suhbat va tanishuv** — Maktabga tashrif buyurasiz, savollarga javob olasiz.
- 3 **Shartnoma va o’qish boshlanishi** — Hujjatlar rasmiylashtiriladi — farzandingiz o’qishni boshlaydi.
- Tugma (qizil): **Hozir ariza qoldirish** → /qabul

## 10. Ota-onalar fikri (`TestimonialsCarousel`, Swiper, 6s autoplay, `bg-mist`)
- H2: **Ota-onalar fikri**
- 3 karta (5 yulduz, qizil badge, «iqtibos», ism, rol):
  1. badge **Milliy sertifikat A** — «Farzandim kimyo-biologiya yo’nalishida o’qiydi. O’qituvchilarning e’tibori va tizimli darslar natijasida milliy sertifikatni yuqori ball bilan topshirdi.» — **Dilnoza X.**, ona
  2. badge **5 yillik ishonch** — «Maktabda intizom va nazorat juda kuchli. Yotoqxona sharoitlari yaxshi, farzandim xavfsizligidan doim xotirjamman.» — **Bahodir A.**, ota
  3. badge **2 farzand** — «Ikkinchi farzandimni ham shu maktabga berdim. Ustozlarning fidoyiligi va natijaga yo’naltirilgan ta’lim — bizni shu yerda ushlab turgan narsa.» — **Mavluda R.**, ona
- Ostida: **Google’da** **4.9 ★ (41+ sharh)** → https://maps.google.com/?cid=18054142510786065278
- (Bu 3 sharh jonli saytda 2026-iyuldan beri turibdi — shu matnlar ishlatilsin, yangisi o‘ylab topilmaydi.)

## 11. So‘nggi yangiliklar (oq fon)
- H2: **So’nggi yangiliklar** · o‘ngda **Barchasi →** (/yangiliklar)
- Manba tartibi: (1) Telegram kanal `t.me/s/ulugbek_rm` dan oxirgi **5** post (AI bilan silliqlangan matn) → (2) bo‘lmasa Firestore `public_news` dan 3 ta → (3) bo‘lmasa bo‘sh holat.
- Telegram ko‘rinishi («Oxford» tartibi): chapda **1 katta karta** (`TelegramNewsCard`: 16:9 rasm, sana `{kun}-{oy}, {yil}` masalan «22-iyul, 2026», sarlavha = postning birinchi qatori ≤80 belgi, matn 3 qator, **Telegramda o’qish →** → post havolasi), o‘ngda **4 ta qator** (`TelegramNewsRow`: 96×64 rasm yoki Telegram ikonkasi, sarlavha ≤70 belgi, sana).
- Firestore ko‘rinishi (`NewsCard`): rasm, sana, sarlavha, 140 belgi matn, **O’qish →** (→ `/yangiliklar/{slug}`).
- Bo‘sh holat: **Yangiliklar Telegram kanalimizda** + tugma **@ulugbek_rm** (t.me/ulugbek_rm).
- 28.09 da jonli sahifadagi 5 post — `API/telegram-news-bosh-sahifa.json` (matn xom, AI silliqlash o‘chiq — API.md §2.1).

## 12. Maktab hayoti (`GallerySection` → `GalleryCarousel`, Swiper coverflow, 5s, hover’da pauza)
- Yuklanguncha skelet sarlavhasi: **Maktab hayotidan lavhalar**
- Eyebrow: **Maktab hayoti**
- H2: **Bir maktab — minglab yorqin taqdir**
- Sub: **«Mirzo Ulug’bek» xususiy maktabining turli yillardagi bitiruvchilari, o’quvchilari va unutilmas bilim sayohatlaridan lavhalar — maktabimiz bilan yaqindan tanishing.**
- 8 slayd (4:3, `photo-card` caption pastdan gradient bilan):
  1. `grads-2324-a.webp` — **2023–2024 o’quv yili bitiruvchilari — o’g’il bolalar**
  2. `grads-2324-b.webp` — **2023–2024 o’quv yili bitiruvchilari — qizlar**
  3. `students-2425-a.webp` — **2024–2025 o’quv yili o’quvchilari**
  4. `students-2425-b.webp` — **2024–2025 o’quv yili — jamoamiz**
  5. `trip-orda.webp` — **Qo’qon O’rdasiga bilim sayohati**
  6. `students-2425-c.webp` — **Maktab hayotidan lavhalar**
  7. `trip-a.webp` — **Bitiruvchilar sayohatidan lavha**
  8. `trip-b.webp` — **Unutilmas sayohat kunlari**

## 13. AI yordamchi CTA (oq fon, ichida navy→ko‘k gradient karta)
- H2: **💬 Savolingiz bormi?**
- Matn: **Rasmiy botimizdagi sun’iy intellekt yordamchisi qabul, yo’nalishlar va natijalar bo’yicha savollaringizga darhol javob beradi.**
- Tugma (oq): **🤖 Botda savol berish** → https://t.me/mirzorasmiybot?start=web

## 14. Biz bilan bog‘laning (`SocialLinks`, `bg-mist`)
- H2: **Biz bilan bog’laning**
- Sub: **Barcha rasmiy sahifalarimiz va aloqa kanallarimiz**
- 8 karta (ikonka rangli, hover’da `icon-pop`):
  **Rasmiy bot (AI yordamchi)** → t.me/mirzorasmiybot?start=web (#3b5bdb) · **Telegram kanal** → t.me/ulugbek_rm (#229ED9) · **Instagram** → instagram.com/mirzoulugbekmaktabi (#E1306C) · **YouTube** → youtube.com/@ulugbek_xm (#FF0000) · **Manzil (Google Maps)** → maps.app.goo.gl/n7HcCtnK3KU1ZUWh9 (#34A853) · **Telefon** → tel:+998974173777 (#1E3A8A) · **Admin** → t.me/MirzoUlugbekMaktabi_Admin · **Menejer** → t.me/Otabek_Mashrabov
- 9-karta (shtrixli chegara): **Barcha havolalar bir sahifada →** → https://mirzolink.com

## 15. Aloqa CTA (`bg-brand`)
- H2: **Farzandingizni ishonchli maktabga bering**
- Matn: **Savollaringiz bo’lsa, qo’ng’iroq qiling yoki ariza qoldiring — tez orada bog’lanamiz.**
- Tugmalar: **Ariza qoldirish** (oq, → /qabul) · **+998 97 417 37 77** (oq kontur, tel:)

## 16. Footer (`Footer`, `#0f172a` to‘q fon)
- Logotip (oq fonli kvadrat) + **MIRZO ULUG’BEK** / **xususiy maktabi**
- Matn: **Uchko’prik tumanida sifatli ta’lim — tajribali jamoa va bitta maqsad: farzandingizning kelajagi.**
- **TEZKOR HAVOLALAR**: Maktab haqida · Tarix · Qabul · Yutuqlar · Yangiliklar · FAQ · Aloqa
- Ish vaqti: **Dushanba — Yakshanba** · **07:00 — 21:30**
- **ALOQA**: **+998 97 417 37 77** · **+998 94 595 37 77** · **Farg’ona viloyati, Uchko’prik tumani, Nihol MFY, Qayrog’och qishlog’i, 45-uy**
- Ikonkalar (aria): **Telegram kanalimiz** · **Instagram sahifamiz** · **YouTube kanalimiz** · **Xaritada manzilimiz**
- **🤖 Rasmiy bot (AI yordamchi) →** · **Barcha havolalar bir sahifada →** (mirzolink.com)
- Pastki qator: **{yil} yillik an’ana. Bir oila — bir maqsad.** · **© {yil} «Mirzo Ulug’bek» xususiy maktabi. Barcha huquqlar himoyalangan.**
- Tashrif hisoblagichi (`VisitorCounter`, 👁): **2 330 marta tashrif buyurilgan** (jonli, 28.09; `toLocaleString("uz-UZ")`)

## 17. Mobil yopishqoq panel (`MobileStickyBar`, faqat <md)
**Qo’ng’iroq** (tel:+998974173777, bosilganda `POST /api/track-call`) · **Hujjat topshirish** (qizil, → /qabul)

## 18. AI chat vidjeti (`AiChat`, o‘ng-pastda logotipli dumaloq tugma, qizil pulsatsiya halqa)
- Launcher aria: **Yordamchi bilan suhbat**
- Header: **Mirzo Ulug’bek yordamchisi** · **Odatda darhol javob beradi**
- Salomlashuv: **Assalomu alaykum! 👋 Men Mirzo Ulug’bek maktabining yordamchisiman. Qabul, yo’nalishlar, narxlar yoki maktab haqida savolingiz bo’lsa — bemalol so’rang!** (eslatma: bot narx **aytmaydi**, menejerga yo‘naltiradi)
- Placeholder: **Savolingizni yozing…** · Yuborish aria **Yuborish** · Yopish aria **Yopish**
- Xato holatlari: «Kechirasiz, hozir javob bera olmadim. Iltimos, menejerimizga yozing: @Otabek_Mashrabov» / «Aloqa uzildi. Iltimos, menejerimizga yozing: @Otabek_Mashrabov yoki +998 97 417 37 77»
- Server tomon «menejer» javobi: «Hozircha ko’p savollarga javob berdim 😊 Aniq ma’lumot uchun menejerimiz bilan bog’laning: Telegram @Otabek_Mashrabov yoki qo’ng’iroq: +998 97 417 37 77. Ular sizga to’liq yordam beradi!»

## 19. /qabul formasi matnlari (`AdmissionForm` — bosh sahifadagi hamma «ariza» tugmasi shu yerga olib boradi)
- Maydonlar: **Ism-familiya*** (placeholder «Masalan: Mashrabov Otabek») · **Viloyat*** («Viloyatni tanlang», 14 ta) · **Sinf*** («Sinfni tanlang»; 8-sinf · 9-sinf · 10-sinf · 11-sinf · Bitiruvchi (11-sinfni tugatgan); o‘chirilgan: 5-sinf (tez orada), 6-sinf (tez orada), 7-sinf (tez orada)) · **Telefon*** («+998 90 123 45 67», maska)
- Havola **5–7-sinflar haqida?** → izoh: «Ushbu sinflarimiz uchun tez orada yangi bino qurib bitkaziladi. Admin va menejerlarimiz sizga xabar beradi. Telegram kanallarimizda batafsil kuzatib boring.»
- 10-sinf tanlansa: «10-sinf uchun qabul qisman sinov va suhbat asosida amalga oshiriladi.» · 11/Bitiruvchi tanlansa: «⚠️ Diqqat: 11-sinf o’quvchilari va bitiruvchilar uchun qabul o’z yo’nalishi bo’yicha sertifikat mavjudligiga bog’liq — barcha nomzodlar ham qabul qilinavermaydi. Aniq ma’lumot uchun mas’ul menejerlar bilan bog’laning: +998 97 417 37 77 / @MirzoUlugbekMaktabi_Admin.»
- Tugma: **Ariza yuborish** → **Yuborilmoqda…**
- Xatolar: «Ism-familiyani to’liq kiriting.» · «Viloyatni tanlang.» · «Sinfni tanlang.» · «Telefon raqamni to’liq kiriting: +998 90 123 45 67» · «Xatolik yuz berdi. Iltimos, qayta urinib ko’ring yoki telefon orqali bog’laning.» · «Iltimos, bir daqiqadan so’ng qayta urinib ko’ring.»
- Muvaffaqiyat: **Arizangiz qabul qilindi ✅** · «Tez orada menejerlarimiz siz bilan bog’lanadi.» · «So’nggi yangiliklar, natijalar va savollaringizga javob olish uchun rasmiy botimizga o’ting 👇» · **🤖 Rasmiy botga o’tish**
- Takror: **Siz allaqachon ro’yxatdan o’tgansiz** · «Arizangiz avval, {sana}da qabul qilingan. Qayta yuborish shart emas — menejerlarimiz bilan bog’lanasiz.» · «Ma’lumotlaringizni to’g’rilash kerak bo’lsa yoki xabarnomalarni kuzatib borish uchun rasmiy botimizga o’ting 👇» · «Savol bo’lsa: +998 97 417 37 77»

---

## FARQLAR — jonli saytda eskirgan, egasi 27.09.2026 da yangilagan joylar
Yangi sahifada **o‘ng ustun** ishlatiladi (SPEC.md bilan bir xil).

| § | jonli saytda hozir | egasining tasdiqlangan shakli |
|---|---|---|
| A. Qabul banneri | «Qabul boshlandi! 🎉 … qabuli ochiq. Joylar soni cheklangan…» | **«2026–2027 o’quv yiliga asosiy qabul yakunlangan. Ayrim sinflarda — masalan, 8–9-sinflarda — sanoqli o’rinlar qoldi. Joy bor-yo’qligini bir qo’ng’iroqda aniqlang: +998 97 417 37 77.»** Sarlavha: «2026–2027: sanoqli o’rinlar». «Ochiq»/«yopiq» so‘zi yo‘q, sanoq yo‘q. |
| B. 5–7-sinflar | «ochilishi 2026-yil sentabrga rejalashtirilgan» / «tez orada» | **«5–7-sinflar uchun yangi bino qurilmoqda. 2027–2028 o’quv yilidan bu sinflarga qabul ochish rejalashtirilgan.»** («ochildi/boshlandi» yozilmaydi) |
| C. Yo‘nalishlar soni | 6 karta | 7 karta: + **Rus tili yo’nalishlari** (yangi, 9–11-sinflar): Rus tili–Ingliz tili · Rus tili–Ona tili · Rus tili–Tarix → `/qabul` yoki `#ariza` |
| D. Yangiliklar | faqat Telegram oqimi | + statik «yangilanishlar» (SPEC §9): Face ID 4 apparat (botga ulangan ota-onalar), shifokor xabarnomasi «2026-yil sentabr oyidan», Rus tili yo‘nalishlari, 8-sentabr — asoschining 60 yillik yubileyi |
| E. AI chat salomlashuvi | «…narxlar yoki maktab haqida…» | «narxlar» so‘zini olib tashlash mumkin — bot narx aytmaydi |
| F. O‘quvchi soni | «Ilk minglik» (matn) | o‘zgarmaydi — raqam yo‘q |
| G. 1560+ | «2025–2026 … 1560+» | o‘zgarmaydi — egasi tasdiqladi |
