# Uchta chat uchun promptlar (v3)

Har bir blokni **to’liq** nusxalab, ko’rsatilgan chatga yuboring. Javoblarni menga (Claude Code cloud chatiga) qaytaring.
Tartib: **1 → 2 → 3**. 3-promptni men v3 ni push qilgach yuboring (quyida qaysi commit ekanini aytaman).

---

## 1. BAZAVIY chat uchun

```
Salom. Men «Mirzo Ulug’bek» xususiy maktabi bosh sahifasini (mirzoulugbek.app) qayta qurayotgan Claude Code cloud chatiman.
Sizdan maktab ma’lumotlari kerak. Muhim qoidalar:
- Sayt ochiq (repo ham public). Shuning uchun HECH QANDAY shaxsiy ma’lumot bermang: o’quvchi/ota-ona ismi,
  telefon, manzil, rasm, Telegram ID — yo’q.
- O’quvchilar SONI saytda raqam bilan yozilmaydi (egasining qoidasi). Shuning uchun absolyut son EMAS,
  faqat ULUSH (foiz, 1 xona aniqlikda) bering. Saytda foiz ham chiqmaydi — men uni «juda ko’p / ko’p / o’rta / kam»
  darajalariga aylantiraman va xaritani shu bo’yicha bo’yayman (koronavirus xaritalaridagi qizil/sariq/yashil
  zonalar kabi).
- Fakt o’ylab topilmasin. Bilmagan joyingizga «ma’lumot yo’q» deb yozing.

A) O’QUVCHILARNING HUDUDIY TAQSIMOTI («O’quvchilarimiz qayerdan keladi?» xaritasi uchun)
   Har bir o’quv yili uchun alohida (qaysi yillar bo’yicha arxiv bo’lsa, hammasi: 2023–2024, 2024–2025,
   2025–2026, 2026–2027):
   1. Viloyatlar kesimida ulush (%): Andijon, Buxoro, Farg’ona, Jizzax, Xorazm, Namangan, Navoiy, Qashqadaryo,
      Qoraqalpog’iston Respublikasi, Samarqand, Sirdaryo, Surxondaryo, Toshkent viloyati, Toshkent shahri,
      + «O’zbekistondan tashqari» (bo’lsa).
   2. Farg’ona, Andijon va Namangan viloyatlari uchun TUMAN/SHAHAR kesimida ulush (%)
      (masalan: Uchko’prik tumani, Qo’qon shahri, Buvayda tumani …). Tuman nomini rasmiy yozilishida bering.
   3. Qaysi sinflar bo’yicha (8, 9, 10, 11) hududiy farq sezilarlimi — 1–2 jumla bilan.
   Hisoblash asosi nima ekanini yozing (ariza, shartnoma yoki Face ID bazasi — qaysi biri).

B) NAZORATCHI BOT (@nazoratchiroobot) — saytda «reklama» blokiga
   1. Bot nimalarni qila oladi — to’liq ro’yxat (Face ID kirdi/chiqdi xabari, kechikish ogohlantirishi,
      shifokor xabarnomasi, davomat, baholar, uy vazifasi, e’lonlar … — faqat haqiqatda BORlarini).
   2. Ota-ona botga qanday ulanadi — qadam-baqadam (necha qadam, nima kerak, pullikmi/bepulmi).
   3. Har bir xabar turining NAMUNA matni (shaxsiy ma’lumotsiz, masalan «Farzandingiz 07:48 da maktabga kirdi»
      ko’rinishida) — botdagi aynan formatda, emoji bilan.
   4. Face ID: nechta apparat, qayerlarda (bosh kirish, yotoqxona, …), qachondan ishlaydi, kechikish qoidasi
      (hozir saytda: «kelish vaqti 19:30 gacha, Face ID 19:45 dan keyin ogohlantiradi» — to’g’rimi?).
   5. Shifokor xabarnomasi: «2026-yil sentabr oyidan» — ishga tushdimi? Xabarda nimalar bo’ladi?
   6. Botga ulangan ota-onalar ulushi yoki shunga o’xshash ko’rsatkich (ixtiyoriy; foizda).
   7. Botning skrinshotlari bo’lsa — ismlar/rasmlar XIRALANGAN holda (men ularni saytga qo’yaman).

C) MAKTAB QULAYLIKLARI (tasdiqlangan faktlar ro’yxati)
   Yotoqxona (xonada necha kishi, nazoratchilar), ovqatlanish (kuniga necha mahal), shifokor (ish vaqti),
   sport, kutubxona, kompyuter xonasi, laboratoriyalar, dam olish kunlari tartibi, transport — faqat BORlarini,
   har biriga 1 jumla. Narx/summa yozmang.

JAVOB FORMATI: avval qisqa matn, keyin bitta ```json``` blok:
{
  "hududlar": { "2025-2026": { "viloyat": {"Farg’ona": 71.2, "...": 0}, "tuman": {"Uchko’prik tumani": 18.4} }, "...": {} },
  "hisob_asosi": "…",
  "nazoratchi_bot": { "imkoniyatlar": ["…"], "ulanish": ["1-qadam …"], "namunalar": {"kirdi": "…"}, "face_id": {…} },
  "qulayliklar": [ {"nomi": "…", "fakt": "…"} ],
  "noaniq": ["…ma’lumot yo’q…"]
}
Rahmat!
```

---

## 2. DIGITAL chat uchun

```
Salom, DIGITAL. Bu — Claude Code cloud chati (maktab bosh sahifasi). Muhim: v2 (commit 229ea27) ni
HALI DEPLOY QILMANG — egasi v3 ni so’radi (yangi alifbo, Face ID + Nazoratchi bot bloki, professional
rasadxona, hududiy xarita). v3 ni push qilgach, commit raqamini egasi orqali yuboraman.

Hozircha sizdan (lokal fayllar va jonli saytdan) kerak:

1. SURATLAR → maktab/JONLI-SAYT/MEDIA/qulayliklar/ ga yuklang (webp yoki jpg, uzun tomoni ≤ 1920 px):
   - Face ID apparatlari (kirish joyidagi terminal), videokuzatuv/monitoring xonasi
   - yotoqxona xonasi, oshxona, sinfxona, laboratoriya, shifokor xonasi, sport maydoni, bino tashqi ko’rinishi
   Faqat maktabda bor va egasi ruxsat bergan suratlar; o’quvchi yuzi yaqin plandagi suratlarni qo’ymang.
   Har bir fayl uchun MEDIA.md ga 1 qator: fayl nomi — nima tasvirlangan — qayerda ishlatilishi mumkin.
2. NAZORATCHI BOT skrinshotlari (@nazoratchiroobot) → maktab/JONLI-SAYT/MEDIA/bot/ — ismlar, rasmlar,
   telefonlar XIRALANGAN. Bo’lsa: botning /start matni va menyu tugmalari matni (MATNLAR.md ga yangi bo’lim).
3. Jonli saytning boshqa sahifalaridagi xavfsizlik/qulaylik matnlari (/maktab-haqida, /qabul, /faq) —
   MATNLAR.md ga «Boshqa sahifalar» bo’limi sifatida (aynan matn).
4. Yangi alifbo qonuni: lex.uz yoki rasmiy manbadan tekshiring — Prezident imzoladimi (sana, raqam)?
   Tutuq belgisi uchun rasmiy belgi qaysi (’ U+2019 yoki ʼ U+02BC)? Natijani README.md ga 3–4 qator.
5. Hammasini bitta commit bilan shu branch’ga push qiling:
   claude/logistics-site-animation-comparison-r4scvk (maktab/JONLI-SAYT ichiga). .env, token, Firebase kaliti —
   hech qachon.
Oxirida egasiga qisqa hisobot bering: nima yuklandi, nima topilmadi.
```

---

## 3. ChatGPT (Astra 6) uchun

```
Vazifa: «Mirzo Ulug’bek» xususiy maktabi (mirzoulugbek.app) bosh sahifasini YANADA professional qilish.
Agent/sub-agent ISHLATMANG — hammasini o’zingiz, bitta suhbatda qiling.

FAYLLAR QAYERDA:
- GitHub (public): https://github.com/55Otabek77777/MeningFlaskSaytim
  branch: claude/logistics-site-animation-comparison-r4scvk , papka: maktab/
  ZIP: https://github.com/55Otabek77777/MeningFlaskSaytim/archive/refs/heads/claude/logistics-site-animation-comparison-r4scvk.zip
- O’z ishingizni ALOHIDA branch’da qiling: chatgpt/maktab-astra6 (boshqa branch’ga push QILMANG).

TUZILISH (avval shularni o’qing):
- maktab/SPEC.md, maktab/CHANGELOG.md, maktab/DEPLOY.md — nima qurilgan, qoidalar
- maktab/JONLI-SAYT/README.md, MATNLAR.md (jonli sayt matnlari + «FARQLAR» jadvali — o’ng ustun majburiy),
  MEDIA.md (suratlar), API.md (API kontraktlari), API/*.json (sertifikatlar, Telegram postlari namunasi)
- maktab/src/template.html — <head>; maktab/src/base/{base.css,bootstrap.js} — dizayn tokenlari va runtime (window.MU)
- maktab/src/parts/NN-nom/{part.html,*.css,*.js} — har bir bo’lim alohida papkada, NN tartib raqami
- maktab/build.mjs — hammasini bitta faylga yig’adi: node build.mjs --release → maktab/index.html
- maktab/qa.mjs — Playwright QA: node qa.mjs --file dist/index.html --out qa/x --vp desktop,mobile --full

ISHGA TUSHIRISH: cd maktab && npm install && node build.mjs --release && node qa.mjs --file dist/index.html --out qa/x --vp desktop,mobile --full
(qa.mjs mirzoulugbek.app rasmlarini JONLI-SAYT/MEDIA dan, /api/* ni mock bilan beradi)

QOIDALAR (buzilmasin):
- Sayt matni YANGI o’zbek alifbosida (Ş, Ç, Ö, Ğ; tutuq belgisi ’). Manba matnlar joriy alifboda yozilgan,
  build/runtime transliteratsiya qiladi — mavjud mexanizmdan foydalaning.
- O’quvchilar soni hech qayerda raqam bilan yozilmaydi (faqat «Ilk minglik» matni). Narx/summa yo’q.
- Shaxsiy ma’lumot yo’q (jonli saytda bor narsadan tashqari). Fakt o’ylab topilmaydi — faqat JONLI-SAYT va SPEC’dagi faktlar.
- Tashqi CDN/shrift/analitika chaqiruvi yo’q; faqat /api/* va mirzoulugbek.app, sertifikat (storage.googleapis.com),
  Telegram rasm hostlari. .env/token — hech qachon.
- /api/ariza, /api/chat, /api/visit, /api/track-call, /api/telegram-news kontraktlarini buzmang (API.md).
- Jonli /api/ariza ga sinov yubormang (egasining Telegramiga boradi).
- 390 px mobil: matn ≥ 15 px, gorizontal overflow yo’q; konsol xatosi 0.

NIMA QILISH KERAK: bo’limlarni ko’rib chiqib, saytga nima qo’shish kerak bo’lsa qo’shing va yaxshilang
(professional daraja, «multfilm»siz; haqiqiy suratlar/video/sertifikatlar ishlatilsin). Har bir o’zgarishni
CHANGELOG.md ga yozing, QA skrinshotlari bilan tekshiring, chatgpt/maktab-astra6 branch’iga push qiling va
oxirida egasiga hisobot bering: nima qo’shildi, qaysi fayllar o’zgardi, QA natijasi.
```
