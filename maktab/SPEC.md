# «Mirzo Ulug’bek» xususiy maktabi — bosh sahifa SPEC

Amaldagi versiya: **v3, 2026-09-28**. Professional, haqiqiy maktab materiallariga tayangan bosh sahifa. Natija: `index.html` va unga aynan teng `dist/index.html`. Manzil: `mirzoulugbek.app/`; mavjud ichki sahifalar va server API’lari saqlanadi.

## Manbalar va ustuvorlik

Joriy topshiriq → `JONLI-SAYT/MATNLAR.md` dagi **FARQLAR o’ng ustuni** → `JONLI-SAYT/README.md`, `MEDIA.md`, `API.md`, `API/*.json`. Eski `PROMPT.md` va CHANGELOG tarixidagi dizayn, yuzlar yoki jonli sinov haqidagi zid ko’rsatmalar qo’llanmaydi.

## Qat’iy qoidalar

1. O’quvchilar soni faqat **Ilk minglik** matni bilan. To’lov summasi ko’rsatilmaydi; savol menejerga yo’naltiriladi.
2. Faktlar faqat yuqoridagi manbalardan. Asosiy statistika aynan oltita: dinamik 27+ (yil − 1999), Ilk minglik, 1560+, IELTS 8.0, 45+, 64.
3. Faqat jonli saytda e’lon qilingan haqiqiy surat, video, sertifikat, ism va sharhlar. Qo’shimcha shaxsiy ma’lumot olinmaydi. Sertifikatlarning xom rasmlari repoga ko’chirilmaydi.
4. Ko’rinadigan interfeys **Ş, Ç, Ö, Ğ** va **’ (U+2019)** bilan. Manba matnlari joriy alifboda; build/runtime umumiy transliteratsiyadan foydalanadi. Foydalanuvchi kiritgan ism, chat xabari, API qiymati, URL va @username o’zgartirilmaydi.
5. Kutubxona va shrift HTML ichida. CDN, tashqi shrift va analitika yo’q. Ruxsat: nisbiy `/api/*`, `mirzoulugbek.app` media, `storage.googleapis.com` sertifikatlari, Telegram rasm hostlari. Ijtimoiy tarmoq va xarita — foydalanuvchi ochadigan havolalar, embed emas.
6. Barcha beshta API kontrakti `JONLI-SAYT/API.md` bo’yicha. **Jonli /api/ariza ga sinov yuborilmaydi**; barcha avtomatik sinovlar lokal mock bilan.
7. 390 px mobil: ko’rinadigan matn kamida 15 px, hujjat gorizontal siljimaydi, odatiy ishlashda konsol xatosi yo’q. Klaviatura, aniq fokus, Escape, modal ichida fokus va reduced-motion qo’llanadi.
8. Qabul 2026–2027: asosiy qabul yakunlangan, ayrim sinflarda sanoqli o’rinlar. 5–7-sinflar 2027–2028 uchun reja. Rus yo’nalishlari 9–11-sinflar. Face ID to’rtta; xabar faqat botga ulangan ota-onaga. Shifokor xabarnomasi 2026-yil sentabrdan.

## Tuzilma

```
src/template.html             head, meta, schema, rasm preload
src/base/base.css             dizayn tokenlari va umumiy komponentlar
src/base/bootstrap.js         window.MU, GSAP/Lenis runtime
src/base/alphabet.mjs          build/runtime uchun umumiy toLatin()
src/base/alphabet.js           dinamik interfeys transliteratsiyasi
src/parts/NN-nom/              part.html + bo’lim css/js
build.mjs                     bitta HTML yig’ish va release
qa.mjs                        skrinshot, overflow, matn, konsol tekshiruvi
qa-functional.mjs             21 ta funksional tekshiruv
review/                       tanlangan QA rasmlari va JSON hisobotlar
QA.md                         egasiga hisobot, sinovlar va cheklovlar
```

18 qism: 00-core, 10-hero, 12-qabul, 20-stats, 25-meros, 30-yutuqlar, 35-yonalishlar, 40-qabul-jarayoni, 45-ariza, 50-hayot, 55-geografiya, **58-tashrif**, 60-sharhlar, 65-yangiliklar, 70-faq, 75-kanallar, 98-chat, 99-footer.

Header/footer tashqarida, asosiy kontent `<main>` ichida. `MU.years()` tajriba yilini hisoblaydi. Video faqat foydalanuvchi ochganda yuklanadi. Sertifikatlar 91 yozuvli tasdiqlangan snapshot; yangi sertifikat API’si qo’shilmagan.

## Buyruqlar

```sh
npm install
npx playwright install chromium
node build.mjs --release
node qa.mjs --file dist/index.html --out qa/release --vp desktop,mobile --full
node qa.mjs --file dist/index.html --out qa/reduced --vp desktop,mobile --shots hero,yutuqlar,ariza,hayot,faq,footer --reduced
node qa-functional.mjs
```

QA maktab rasmlarini `JONLI-SAYT/MEDIA/` dan, API’larni lokal mockdan beradi. Standart rejimda tashqi sertifikat/Telegram rasmlariga QA placeholder ishlatiladi. `--live-media` faqat tasdiqlangan tashqi rasm GET so’rovlariga ruxsat beradi; **API’lar baribir mock**. H.264 video uchun o’rnatilgan Edge: PowerShell’da `$env:MU_QA_BROWSER_CHANNEL='msedge'`, so’ng `node qa-functional.mjs`. Oddiy Chromium kodek bo’lmasa tushunarli xato va original video havolasini tekshiradi.
