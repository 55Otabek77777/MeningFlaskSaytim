# DEPLOY — DIGITAL seansi uchun

1. Fayl: `maktab/index.html` (= `maktab/dist/index.html`, ≈ 0,83 MB) — bitta fayl, tashqi CDN/shrift/analitika yo’q.
   `dist/preview-inline.html` va `dist/artifact.html` — **faqat ko’rib chiqish uchun** (rasmlar data: URI), deploy qilinmaydi.
2. Uni `mirzoulugbek.app` ildiziga bosh sahifa qilib qo’ying (Next.js: masalan `public/` ga statik fayl va `/` → shu fayl rewrite,
   yoki `app/page.tsx` o’rniga statik javob). Qolgan sahifalar va `/api/*` o’zgarmaydi.
3. Sahifa ishlatadigan resurslar (jonli saytda allaqachon bor):
   - `/logo.png`, `/icon.png`, `/og-image.png`
   - `/assets/video/hero.mp4`, `/assets/video/hero-poster.webp`
   - `/photos/founder.webp`, `/photos/director.webp`, `/photos/history-1994.webp`,
     `/photos/grads-2324-a.webp`, `/photos/grads-2324-b.webp`, `/photos/students-2425-a.webp`, `/photos/students-2425-b.webp`,
     `/photos/students-2425-c.webp`, `/photos/trip-orda.webp`, `/photos/trip-a.webp`, `/photos/trip-b.webp`
   - tashqi rasm hostlari (jonli saytdagidek): `storage.googleapis.com/ulugbek-perfect-edu-7b4fa-certs/…` (sertifikatlar), `*.telesco.pe` (Telegram)
   - API: `POST /api/ariza`, `GET|POST /api/visit`, `POST /api/track-call`, `POST /api/chat`, `GET /api/telegram-news`
4. Deploy’dan keyin tekshiruv:
   - hero video o’ynaydi, «Ovozni yoqish» ishlaydi; sertifikatlar karuselida haqiqiy rasmlar chiqadi;
   - «So’nggi yangiliklar»da 4846–4848 (yoki yangiroq) postlar; footerda «… marta tashrif buyurilgan»;
   - chat vidjeti javob beradi; ariza formasidan **bitta** sinov (`Sinov Sinovov`) → Telegram’ga keldi; «Qo’ng’iroq» → track-call.
5. Keyin Telegram kanal e’loni (alohida qadam): «Maktab saytimiz yangilandi — mirzoulugbek.app».

Snapshot’larni yangilash (ixtiyoriy, qayta build kerak):
`node src/parts/30-yutuqlar/gen-certs.mjs` (JONLI-SAYT/API/sertifikatlar.json) · `node src/parts/65-yangiliklar/gen-news.mjs`
(JONLI-SAYT/API/telegram-news-bosh-sahifa.json) · so’ng `node build.mjs --release`.
