# Yakuniy yo’l — uchta prompt (tartib bilan)

| Qadam | Kimga | Qachon | Keyin |
|---|---|---|---|
| 1 | DIGITAL — dron videolari va kadrlari (fleshka, lokal disklar) | ✅ bajarildi (232d83e) → v3.4 | DIGITAL hisobotini Claude chatiga tashlaysiz → Claude kadrlarni pastki bo’limlarga qo’yadi va «ChatGPT’ga berishga tayyor» deydi |
| 2 | ChatGPT — o’zbekcha tekshiruv + chiroyli takliflar | ✅ bajarildi (7805d05) → v3.5 | ChatGPT hisobotini Claude chatiga tashlaysiz → Claude yaxshilarini qo’shadi, oxirgi commit xabarida «DEPLOYGA TAYYOR» |
| 3 | DIGITAL — deploy | Claude «DEPLOYGA TAYYOR» degach | DIGITAL hisobotini Claude chatiga tashlaysiz → Claude tekshiradi |

---

## 1-PROMPT — DIGITAL (dron videolari va kadrlari)

```
Salom, DIGITAL. Bu — Claude Code cloud chatidan (maktab bosh sahifasi). Repo: 55Otabek77777/MeningFlaskSaytim,
branch: claude/logistics-site-animation-comparison-r4scvk, papka: maktab/. Hozircha HECH NARSANI DEPLOY QILMANG.

Rahmat — MEDIA/bino/ dagi yangi bino kadrlari saytga qo’yildi («Tarix» 2025-yil, «Tashrif» kartasi, «Maktab hayoti»
va yangi «Maktabimiz — osmondan» dron lentasi). Egasi aytdi: dron kadrlari — eng kuchli kadrlar, pastdagi bo’limlarga
ko’proq qo’yilsin. Bosh sahifadagi hero videoga TEGMANG.

VAZIFA — DRON VIDEOLARI VA KADRLARI
1. Qidiring va ro’yxat bering (yo’l, hajm, davomiylik, o’lcham/fps, sana, qisqa mazmun):
   - egasi kompyuterga FLESHKA qo’ydi — undagi barcha video va rasmlar (E:, F:, G: … qaysi harf bo’lsa);
   - D:\DIGITAL\SAYT UCHUN KERAKLI RASM VA VIDEO\ va boshqa lokal papkalar;
   - nomlar: DJI_*, *.MP4, *.MOV, «dron», «drone», «maktab», «rolik», «video»; ayniqsa 4K / 2.7K ASL fayllar;
   - ROUTER orqali Surface so’rovining natijasi bo’lsa — uni ham qo’shing.
2. Har bir dron videosidan eng TINIQ kadrlarni oling (ffmpeg; keskinlik bo’yicha tanlang, harakatdan xiralashganini emas).
   Eksport: webp, sifat 85, 1920×1080 (manba 4K bo’lsa — 2560×1440 ham). Kerakli syujetlar:
   a) maktab hududi panoramasi — ayniqsa tong yoki quyosh botishi (oltin soat);
   b) yangi bino — turli burchaklardan (old, yon, tepadan, hovli bilan);
   c) birinchi (eski) bino — tepadan;
   d) hovli, sport maydoni, saf tortgan o’quvchilar yoki tadbir — tepadan (yuzlar tanilmaydigan balandlikdan);
   e) vokzal, temir yo’l, maktabgacha yo’l;
   f) Qo’qon O’rdasi va boshqa sayohatlar — dron;
   g) telefon uchun VERTIKAL (1080×1920) variantlar — eng kuchli 4–5 syujetdan.
3. Ixtiyoriy: 3–4 ta qisqa DRON KLIP — ovozsiz, 6–8 soniya, 1280×720, H.264 mp4, har biri ≤ 4 MB
   (sekin, bir tekis uchish, keskin burilishsiz) — dron lentasini video bilan jonlantirish uchun.
4. Joylash: maktab/JONLI-SAYT/MEDIA/dron/ (kadrlar) va maktab/JONLI-SAYT/MEDIA/dron/klip/ (kliplar).
   Nom: syujet-joy-raqam.webp (masalan hudud-oltin-soat-1.webp, yangi-bino-yon-1.webp, vokzal-1.webp).
   MEDIA.md ga yangi bo’lim: fayl — o’lcham — nima tasvirlangan — manba video (yo’l + vaqt kodi) — qaysi bo’limga mos.
5. Qoidalar: o’quvchi yuzi yaqin planda — yo’q; shaxsiy fayl va hujjatlar — yo’q; hero.mp4 va jonli saytga tegmang;
   .env, token, kalit — hech qachon. Shu branch’ga push qiling (faqat maktab/JONLI-SAYT ichiga).
OXIRIDA egasiga qisqa hisobot yozing (egasi uni Claude chatiga olib boradi): qaysi videolar topildi va qayerda,
nechta kadr va klip yuklandi, commit raqami, nima topilmadi.
```

---

## 2-PROMPT — ChatGPT (o’zbekcha tekshiruv + dizayn takliflari)

```
Vazifa: «Mirzo Ulug’bek» xususiy maktabi (mirzoulugbek.app) yangi bosh sahifasini yakuniy tekshirish:
A) o’zbek tili va o’zbek oilalariga mosligi; B) dizayn va animatsiyani yanada chiroyli qilish.
Agent/sub-agent ISHLATMANG — hammasini o’zingiz qiling.

FAYLLAR
- GitHub (public): https://github.com/55Otabek77777/MeningFlaskSaytim
  branch: claude/logistics-site-animation-comparison-r4scvk, papka: maktab/ (branch’ning oxirgi commit’i)
  ZIP: https://github.com/55Otabek77777/MeningFlaskSaytim/archive/refs/heads/claude/logistics-site-animation-comparison-r4scvk.zip
- Ishga tushirish: cd maktab && npm install && node build.mjs --release → maktab/index.html ni brauzerda oching
  (rasmlar mirzoulugbek.app dan keladi). QA: node qa.mjs --file index.html --out qa/x --vp desktop,mobile --full
- Matnlar: maktab/src/parts/NN-nom/part.html (+ 65-yangiliklar/a-news.js, 30-yutuqlar/a-certs.js, 98-chat/*.js);
  <head>/SEO/JSON-LD: maktab/src/template.html. Faktlar: maktab/SPEC.md, JONLI-SAYT/MATNLAR.md, CHANGELOG.md.
- Qanday qurilgan: maktab/SPEC.md, CHANGELOG.md; runtime: src/base/bootstrap.js (window.MU, GSAP, Lenis, Three.js).

ALIFBO MEXANIZMI (muhim)
Manba matnlar JORIY lotin alifbosida (O’, G’, Sh, Ch, tutuq ’ = U+2019). Build ularni avtomatik YANGI alifboga
(Ö, Ğ, Ş, Ç) o’giradi; saytdagi «Ö / O’» tugmasi joriy alifboga qaytaradi. Shuning uchun tuzatishlarni manbada
JORIY alifboda yozing (Ş/Ç/Ö/Ğ ni qo’lda yozmang). O’girilmasligi kerak joylar data-raw bilan belgilangan.
Ikkala rejimni ham ko’ring.

A) O’ZBEKCHA TEKSHIRUV
1. Imlo, grammatika, tinish belgilari; sana («2026-yil 1-avgust»), vaqt (06:00 — 21:30), telefon (+998 94 595 37 77).
2. Tabiiylik: tarjimaga o’xshab qolgan (rus/ingliz kalkasi) jumlalar, sun’iy yoki haddan ortiq reklama ohangi.
   Ota-onaga «Siz» deb hurmat bilan murojaat izchilmi? O’zbek ota-onasi o’qiganda ishonch uyg’otadimi?
3. Atamalar izchilligi: o’quvchi/farzand, ota-ona, o’quv yili, sinf, yotoqxona, Face ID, Nazoratchi bot,
   yo’nalishlar, joy nomlari (Farg’ona viloyati, Uchko’prik tumani, Qayrog’och qishlog’i).
4. Yangi alifbo natijasi: g’alati o’girilgan so’z bormi; inglizcha so’z/brend/qisqartma (IELTS, SAT, Face ID,
   Telegram, START…) noto’g’ri o’girilmaganmi?
5. Madaniy moslik: suratlar, ranglar, ohang, murojaat — o’zbek oilasi qadriyatlariga (hurmat, odob, xavfsizlik,
   farzand kelajagi) mosmi? Noqulay yoki noto’g’ri tushunilishi mumkin joy bormi?
6. Mobil (390 px): uzun so’zlar qatorni buzmaydimi, tugmalar sig’adimi?
7. SEO: <title>, description, JSON-LD o’zbekcha to’g’ri va tabiiymi (head ataylab joriy alifboda).

B) DIZAYN VA ANIMATSIYA
Qaysi bo’limni yanada chiroyli, jonli, professional qilish mumkin bo’lsa — qiling. Shartlar:
- Mavjud animatsiyalarni olib tashlamang va soddalashtirmang (egasi oldin «o’ta sodda bo’lib qoldi» degan);
  «multfilm»ga o’xshamasin — professional daraja.
- Yangi kutubxona/CDN yo’q — faqat mavjud GSAP (ScrollTrigger, SplitText, Flip…), Lenis, Three.js va window.MU.
- Telefonda silliq ishlasin; prefers-reduced-motion hurmat qilinsin; konsol xatosi 0; gorizontal overflow yo’q;
  390 px da matn ≥ 15 px.
- Har bir o’zgarish alohida commit bo’lsin (keyin eng chiroylilarini tanlab olamiz).

QOIDALAR (buzilmasin)
- Fakt o’ylab topilmaydi va o’zgartirilmaydi (faqat SPEC.md / JONLI-SAYT / CHANGELOG dagi faktlar).
- O’quvchilar soni hech qayerda raqam bilan yozilmaydi (faqat «Ilk minglik»); narx/summa yo’q; shaxsiy ma’lumot yo’q.
- /api/* kontraktlari (JONLI-SAYT/API.md) o’zgarmaydi; jonli /api/ariza ga sinov yuborilmaydi.
- Tashqi CDN/shrift/analitika qo’shilmaydi; .env/token — hech qachon.

NATIJA
1. Hammasini ALOHIDA branch’ga push qiling: chatgpt/maktab-yakuniy (boshqa branch’ga push QILMANG).
   A (matn) va B (dizayn) o’zgarishlari alohida commit’larda.
2. Hisobot: (a) A jadvali — № · fayl:qator · hozirgi matn · taklif · sabab · muhimlik (yuqori/o’rta/past);
   (b) B ro’yxati — har bir commit: nima qilindi, qaysi bo’lim, nega chiroyliroq; (c) QA natijasi;
   (d) umumiy baho (10 ballik) va eng muhim 5 ta tuzatish.
Bu hisobotni egasi Claude chatiga olib boradi — aniq va to’liq yozing.
```

---

## 3-PROMPT — DIGITAL (deploy)

```
Salom, DIGITAL. Bu — Claude Code cloud chatidan. Maktab bosh sahifasi (v3.5) deployga tayyor.
Vazifa: uni mirzoulugbek.app ga deploy qilish (Next.js 15 sayt, Vercel — mirzo-digital-sayt).

0. TEKSHIRING: repo 55Otabek77777/MeningFlaskSaytim, branch claude/logistics-site-animation-comparison-r4scvk.
   Branch’ning ENG OXIRGI commit xabarida «DEPLOYGA TAYYOR» yozuvi bo’lishi SHART. Bo’lmasa — deploy qilmang,
   egasiga «Claude hali deployga tayyor demagan» deb ayting va to’xtang.
1. O’qing: shu commit’dagi maktab/DEPLOY.md — undagi ro’yxat (fayllar, resurslar, tekshiruvlar) asosiy qo’llanma.
2. ZAXIRA: deploy’dan oldin jonli saytning hozirgi production deployment’ini va mirzo-digital-sayt repo’sidagi
   oxirgi commit’ni yozib qo’ying (orqaga qaytarish uchun). Alohida branch’da ishlang.
3. MEDIA: DEPLOY.md da sanalgan yangi fayllarni (26 ta: rasmlar + 3 ta dron klipi) saytning public/ ichiga
   ko’chiring, URL bir xil qolsin. Qoida: index.html dagi har bir https://mirzoulugbek.app/media/X →
   public/media/X (manba: maktab/JONLI-SAYT/MEDIA/X) — papkalar: bino/, bot/, dron/, dron/klip/, qulayliklar/.
4. BOSH SAHIFA: maktab/index.html (bitta fayl, ~1,5 MB) ni public/ ga qo’ying (masalan public/bosh.html) va
   faqat «/» ni shu faylga yo’naltiring — next.config.ts da rewrites → beforeFiles:
   { source: '/', destination: '/bosh.html' } (yoki v2 da ishlatgan usulingiz). app/page.tsx ni o’chirmang
   (orqaga qaytish oson bo’lsin). Boshqa sahifalar (/yutuqlar, /tarix, /qabul …) va /api/* o’zgarmaydi.
   index.html ichini qo’lda o’zgartirmang. maktab/review/, maktab/qa/, dist/preview-* — deploy qilinmaydi.
5. Avval PREVIEW deploy. Preview URL’da tekshiring (kompyuter + telefon):
   - bosh sahifa ochiladi, konsolda xato yo’q; hero video o’ynaydi, «Ovozni yoqish» ishlaydi;
   - barcha suratlar va dron kliplari chiqadi (yangi bino, «Maktabimiz — osmondan», footer panoramasi) — 404 yo’q;
   - sertifikatlar karuseli, «So’nggi yangiliklar» (/api/telegram-news), footerdagi tashriflar (/api/visit),
     chat vidjeti (/api/chat) ishlaydi; «Ö / O’» alifbo tugmasi ishlaydi; yo’nalishlar filtri, «Maktab hayoti»
     tugmalari, dron kadrlarini tanlash paneli va mobil menyu (ochish/yopish) ishlaydi;
   - boshqa sahifalar va menyu havolalari ishlaydi.
6. Hammasi joyida bo’lsa — PRODUCTION ga chiqaring va o’sha tekshiruvni mirzoulugbek.app da takrorlang.
   Ariza formasidan FAQAT BITTA sinov: ism «Sinov Sinovov» → egasining Telegramiga kelganini tasdiqlang.
   «Qo’ng’iroq» tugmasi → /api/track-call.
7. Muammo bo’lsa — darhol oldingi production deployment’ga qaytaring (Vercel: Rollback/Promote) va egasiga ayting.
8. Telegram kanalga e’lon — faqat egasi ruxsat bersa (o’zingiz yubormang).
.env, token, kalitlar — hech qachon commit qilmang va chatga yozmang.
OXIRIDA egasiga hisobot (egasi uni Claude chatiga olib boradi): qaysi commit deploy qilindi, Vercel deployment
URL’i, har bir tekshiruv natijasi (✅/❌), sinov arizasi keldimi, qanday muammolar bo’ldi.
```
