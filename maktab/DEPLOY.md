# DEPLOY — DIGITAL seansi uchun

1. Fayl: `maktab/index.html` (= `maktab/dist/index.html`) — bitta fayl, tashqi CDN yo’q.
2. Uni `mirzoulugbek.app` ildiziga bosh sahifa qilib qo’ying (Next.js: masalan `public/` ga statik fayl va `/` → shu fayl rewrite,
   yoki `app/page.tsx` o’rniga statik javob). Qolgan sahifalar va `/api/*` o’zgarmaydi.
3. Sahifa ishlatadigan resurslar (hammasi shu domenda bo’lishi kerak):
   - `/logo.png`, `/icon.png`, `/og-image.png`, `/photos/founder.webp`, `/photos/director.webp`, `/photos/history-1994.webp`
   - `POST /api/ariza`, `GET|POST /api/visit`, `POST /api/track-call`
4. Deploy’dan keyin tekshiruv: bosh sahifa ochiladi → footerda «… marta tashrif buyurilgan» chiqadi → ariza formasidan
   bitta sinov (`Sinov Sinovov`) → Telegram’ga keldi → «Qo’ng’iroq» bosilganda track-call yoziladi.
5. Keyin Telegram kanal e’loni (alohida qadam): «Maktab saytimiz yangilandi — mirzoulugbek.app».
