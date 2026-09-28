# Yakuniy yo’l — uchta prompt (tartib bilan)

| Qadam | Kimga | Qachon | Keyin |
|---|---|---|---|
| 1 | DIGITAL — yangi bino suratlari | hozir | DIGITAL hisobotini Claude chatiga tashlaysiz → Claude suratlarni qo’yadi va «ChatGPT’ga berishga tayyor» deydi |
| 2 | ChatGPT — o’zbekcha tekshiruv + chiroyli takliflar | Claude «ChatGPT’ga berishga tayyor» degach | ChatGPT hisobotini Claude chatiga tashlaysiz → Claude yaxshilarini qo’shadi, oxirgi commit xabarida «DEPLOYGA TAYYOR» |
| 3 | DIGITAL — deploy | Claude «DEPLOYGA TAYYOR» degach | DIGITAL hisobotini Claude chatiga tashlaysiz → Claude tekshiradi |

---

## 1-PROMPT — DIGITAL (yangi bino suratlari)

```
Salom, DIGITAL. Bu — Claude Code cloud chatidan (maktab bosh sahifasi). Repo: 55Otabek77777/MeningFlaskSaytim,
branch: claude/logistics-site-animation-comparison-r4scvk, papka: maktab/. Hozircha HECH NARSANI DEPLOY QILMANG.

VAZIYAT
- photos/history-1994.webp — maktabning ESKI (birinchi) binosi: oq, ikki qavatli, peshtoqida «MIRZO ULUG’BEK».
- Egasi aytdi: YANGI maktab binosi bor va uning suratlari bor. Saytda yangi bino 2 joyda turadi:
  «Tarix» bo’limida 2025-yil «Kengayish — yangi bino» va «Maktabga tashrif buyuring» kartasi.
- Hozir u yerda siz yuklagan qulayliklar/bino-dron-2.webp turibdi (kanal 4623 videosidan kadr): tepadan olingan,
  uch qavatli oq bino, peshtoqida «XUSUSIY MIRZO ULUG’BEK MAKTABI». Kadr vertikal (1080×1920), sifati o’rtacha —
  oldidan olingan yaxshi surat kerak.

VAZIFALAR
1. Tasdiqlang: bino-dron-1 va bino-dron-2 dagi uch qavatli bino — 2025-yilda qo’shilgan YANGI binomi? (ha/yo’q + izoh)
2. Yangi bino suratlarini qidiring:
   - lokal: D:\DIGITAL, D:\ulugbek_maktab, D:\MyProjects, D:\agent, Pictures, Downloads, Telegram Desktop;
     kalit so’zlar: bino, yangi, maktab, fasad, mirzo, ulugbek, dron, drone, DJI_, IMG_, 2025, 2026;
   - rasmiy kanal @ulugbek_rm (2025–2026), jonli sayt, maktab Instagram/YouTube.
   Kerak: yangi binoning oldingi FASADI (gorizontal, ≥1600 px), kirish, hovli, kechki ko’rinish, tiniq dron kadrlari.
3. Topilmasa — router orqali «Javas loyihasi» chatiga shu xabarni yuboring:
   «Salom. DIGITAL chatidan (maktab sayti uchun). Egasining eski Surface kompyuterida, ekran stolida (Desktop)
   qaysidir papkalar ichida «Mirzo Ulug’bek» xususiy maktabining YANGI binosi suratlari bor. Iltimos, Desktop va
   uning ichki papkalarida (hamda Pictures, Downloads, Telegram Desktop) .jpg .jpeg .png .heic .webp .mp4 .mov
   fayllarni qidiring (nomida yoki papka nomida: bino, yangi, maktab, fasad, mirzo, ulugbek, dron, drone, DJI_, IMG_;
   sanasi 2024–2026). Eski bino (oq, ikki qavatli, oldida archalar) kerak EMAS — kerak yangi, uch qavatli bino.
   Ro’yxat bering (yo’l, o’lcham, sana, nima tasvirlangan) va eng yaxshi 5–10 tasini ASL holida router orqali
   DIGITAL chatiga yuboring. O’quvchi yuzi yaqin plandagi suratlar, shaxsiy fayllar, hujjatlar, parollar — kerak emas.
   Rahmat!»
4. Suratlarni maktab/JONLI-SAYT/MEDIA/bino/ ga webp (sifat 82–85, uzun tomoni ≤1920 px) qilib qo’ying:
   yangi-bino-fasad.webp (asosiy, gorizontal), yangi-bino-kirish.webp, yangi-bino-hovli.webp, yangi-bino-dron.webp …
   MEDIA.md ga har biri uchun 1 qator: fayl — o’lcham — nima tasvirlangan — manba — qaysi bino (yangi/birinchi).
5. Yanada zo’r suratlar («Maktab hayoti» uchun): kanal videolarining ASL fayllari (4631, 4617, 4633 — dron;
   4612 — zal; 4680 — kirish zinasi; 4826, 4847 — vokzal) dan tiniq kadrlar; sinfxona, tadbir, bitiruv, sayohat
   suratlarining ≥1600 px asl nusxalari → maktab/JONLI-SAYT/MEDIA/qulayliklar/ (MEDIA.md ga izoh bilan).
   O’quvchi yuzi yaqin planda — yo’q.
6. Bitta commit bilan shu branch’ga push qiling (faqat maktab/JONLI-SAYT ichiga). .env, token, kalit — hech qachon.
OXIRIDA egasiga qisqa hisobot yozing (egasi uni Claude chatiga olib boradi): nima topildi va qayerdan, qaysi fayllar
yuklandi, commit raqami, nima topilmadi, Javas chatiga yozildimi va u nima dedi.
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
Salom, DIGITAL. Bu — Claude Code cloud chatidan. Maktab bosh sahifasi (v3) deployga tayyor.
Vazifa: uni mirzoulugbek.app ga deploy qilish (Next.js 15 sayt, Vercel — mirzo-digital-sayt).

0. TEKSHIRING: repo 55Otabek77777/MeningFlaskSaytim, branch claude/logistics-site-animation-comparison-r4scvk.
   Branch’ning ENG OXIRGI commit xabarida «DEPLOYGA TAYYOR» yozuvi bo’lishi SHART. Bo’lmasa — deploy qilmang,
   egasiga «Claude hali deployga tayyor demagan» deb ayting va to’xtang.
1. O’qing: shu commit’dagi maktab/DEPLOY.md — undagi ro’yxat (fayllar, resurslar, tekshiruvlar) asosiy qo’llanma.
2. ZAXIRA: deploy’dan oldin jonli saytning hozirgi production deployment’ini va mirzo-digital-sayt repo’sidagi
   oxirgi commit’ni yozib qo’ying (orqaga qaytarish uchun). Alohida branch’da ishlang.
3. MEDIA: DEPLOY.md da sanalgan yangi fayllarni saytning public/ ichiga ko’chiring (URL bir xil qolsin):
   maktab/JONLI-SAYT/MEDIA/qulayliklar/… → public/media/qulayliklar/, MEDIA/bot/… → public/media/bot/,
   MEDIA/bino/… → public/media/bino/.
4. BOSH SAHIFA: maktab/index.html (bitta fayl, ~1,4 MB) ni public/ ga qo’ying (masalan public/bosh.html) va
   faqat «/» ni shu faylga yo’naltiring — next.config.ts da rewrites → beforeFiles:
   { source: '/', destination: '/bosh.html' } (yoki v2 da ishlatgan usulingiz). app/page.tsx ni o’chirmang
   (orqaga qaytish oson bo’lsin). Boshqa sahifalar (/yutuqlar, /tarix, /qabul …) va /api/* o’zgarmaydi.
   index.html ichini qo’lda o’zgartirmang.
5. Avval PREVIEW deploy. Preview URL’da tekshiring (kompyuter + telefon):
   - bosh sahifa ochiladi, konsolda xato yo’q; hero video o’ynaydi, «Ovozni yoqish» ishlaydi;
   - barcha suratlar chiqadi (yangi bino, qulayliklar, bot namunasi) — 404 yo’q;
   - sertifikatlar karuseli, «So’nggi yangiliklar» (/api/telegram-news), footerdagi tashriflar (/api/visit),
     chat vidjeti (/api/chat) ishlaydi; «Ö / O’» alifbo tugmasi ishlaydi;
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
