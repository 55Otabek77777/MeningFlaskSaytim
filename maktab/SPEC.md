# «Mirzo Ulug’bek» xususiy maktabi — bosh sahifa (qisqa SPEC)

Bitta faylli, animatsiyaga boy bosh sahifa: `dist/index.html` (= `index.html`). U `https://mirzoulugbek.app/`
ildiziga qo’yiladi; qolgan sahifalar (`/qabul`, `/yangiliklar`, `/tarix`, `/yonalishlar/<slug>`, `/yutuqlar`, `/faq` …)
va API’lar mavjud Next.js saytida qoladi. To’liq topshiriq — egasining `PROMPT.md` (15 bo’lim, faktlar, taqiqlar).

## Qat’iy qoidalar (buzilmaydi)
1. O’quvchilar soni raqam bilan yozilmaydi — faqat «Ilk minglik» (matn, sanoq emas).
2. To’lov summasi yo’q — «Aniq summani maktab menejeri aytadi — +998 97 417 37 77».
3. Shaxsiy ma’lumot yo’q; odam yuzi faqat asoschi va direktor rasmlarida.
4. Fakt o’ylab topilmaydi — faqat PROMPT §3/§9 dagi faktlar. Statistika — aynan 6 ta: 27+ (dinamik), Ilk minglik, 1560+, IELTS 8.0, 45+, 64.
5. Til — o’zbek lotin, apostrof ’ (U+2019). ʻ/ʼ ishlatilmaydi.
6. Tashqi tarmoq yo’q: kutubxonalar va shriftlar bundle ichida. Faqat `/api/ariza`, `/api/visit`, `/api/track-call` va `https://mirzoulugbek.app/...` rasmlar.
7. Nom — «Mirzo Ulug’bek»; yuridik nom («ULUGBEK PERFECT EDU») faqat litsenziya/tarix qatorida.

## Tuzilma
```
src/template.html        <title>, meta, og, favicon (icon.png)
src/base/base.css        yorug’ «kun osmoni» tokenlari (--mu-*) + logistikadan meros komponentlar
src/base/bootstrap.js    window.MU runtime (o’zgarishsiz)
src/parts/NN-nom/        part.html + *.css + *.js (build alfavit tartibida yig’adi)
  00-core  10-hero  15-ticker  20-heritage  30-yonalishlar  35-hayot  40-geografiya  45-stats
  50-rasadxona  60-qabul-jarayoni  65-ariza  70-nega-biz  80-yutuqlar  90-faq  99-footer
assets/                  jonli saytdagi 6 ta tasdiqlangan rasmning lokal nusxasi (QA va preview uchun)
```
Qo’shimcha yordamchilar (core.js): `MU.countUp`, `MU.nums(root)` (`data-num` — ming ajratkichsiz «1560+»), `MU.years()` (= yil − 1999).

## Buyruqlar
```
npm install
node build.mjs --release                 # dist/index.html + index.html
node qa.mjs --file dist/index.html --vp desktop,mobile --full   # skrinshot + xato + overflow + 15px tekshiruvi
node make-preview.mjs                    # dist/preview-inline.html (rasmlar ichida — faqat ko’rib chiqish uchun)
```
`qa.mjs` sahifani lokal HTTP’da ochadi, `mirzoulugbek.app` rasmlarini `assets/` dan beradi va `/api/*` ni mock qiladi
(`Takror…` ism → duplicate, `Kutish…` → 429).
