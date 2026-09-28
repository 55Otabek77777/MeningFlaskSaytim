# DEPLOY — DIGITAL seansi uchun

1. Fayl: `maktab/index.html` (= `maktab/dist/index.html`, ≈ 1,49 MB, gzip ≈ 0,47 MB) — **v3.5, DEPLOYGA TAYYOR** — bitta fayl, tashqi CDN/shrift/analitika yo’q.
   `dist/preview-inline.html` va `dist/artifact.html` — **faqat ko’rib chiqish uchun** (rasmlar data: URI), deploy qilinmaydi.
2. Uni `mirzoulugbek.app` ildiziga bosh sahifa qilib qo’ying (Next.js: masalan `public/` ga statik fayl va `/` → shu fayl rewrite,
   yoki `app/page.tsx` o’rniga statik javob). Qolgan sahifalar va `/api/*` o’zgarmaydi.
3. Sahifa ishlatadigan resurslar (jonli saytda allaqachon bor):
   - `/logo.png`, `/icon.png`, `/og-image.png`
   - `/assets/video/hero.mp4`, `/assets/video/hero-poster.webp`
   - `/photos/founder.webp`, `/photos/director.webp`, `/photos/history-1994.webp`,
     `/photos/grads-2324-a.webp`, `/photos/grads-2324-b.webp`, `/photos/students-2425-a.webp`, `/photos/students-2425-b.webp`,
     `/photos/students-2425-c.webp`, `/photos/trip-orda.webp`, `/photos/trip-a.webp`, `/photos/trip-b.webp`
   - **v3 da yangi — 26 ta fayl** (rasm + 3 ta dron klipi). Qoida: `index.html` dagi har bir `https://mirzoulugbek.app/media/X` →
     saytning `public/media/X` (manba: `maktab/JONLI-SAYT/MEDIA/X`). Deploy’dan keyin birortasi ham 404 bermasin:
     - `JONLI-SAYT/MEDIA/bino/` → `public/media/bino/`: `yangi-bino-fasad-keng.webp`, `yangi-bino-fasad.webp`
     - `JONLI-SAYT/MEDIA/bot/` → `public/media/bot/`: `namuna-c-odatiy-kun.webp`
     - `JONLI-SAYT/MEDIA/dron/` → `public/media/dron/`: `bitiruv-zal-tashqi-1.webp`, `hovli-tadbir-2.webp`, `hovli-tadbir-2@2k.webp`, `hudud-panorama-1.webp`, `hudud-panorama-1@2k.webp`, `hudud-panorama-2.webp`, `hudud-panorama-2@2k.webp`, `hudud-panorama-vert-1.webp`, `hudud-panorama-vert-2.webp`, `orda-foto-1.webp`, `vokzal-1.webp`, `vokzal-1@2k.webp`, `yangi-bino-uzoqdan-1.webp`, `yangi-bino-uzoqdan-1@2k.webp`, `yangi-bino-vert-2.webp`, `yangi-bino-vert-3.webp`, `yangi-bino-yon-1.webp`
     - `JONLI-SAYT/MEDIA/dron/klip/` → `public/media/dron/klip/`: `hudud-panorama.mp4`, `vokzal-temir-yol.mp4`, `yangi-bino-orbit.mp4`
     - `JONLI-SAYT/MEDIA/qulayliklar/` → `public/media/qulayliklar/`: `sinfxona-1.webp`, `sinfxona-2.webp`, `tadbir-bayroqlar.webp`
     Klip (`.mp4`) — faqat kompyuterda, faol kadrda o’ynaydi; `public/` dan oddiy statik fayl sifatida beriladi (Range so’rovlari — Vercel’da o’zi ishlaydi).
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

v3 qo’shimcha:
- Alifbo: sahifa yangi alifboda (Ş Ç Ö Ğ), sarlavhada «Ö / O‘» tugmasi. Joriy alifboda build: `node build.mjs --release --alifbo joriy`.
- Hududiy daraja: `node src/parts/55-geografiya/gen-hudud.mjs <hududlar.json>` — barcha yillar birlashtiriladi, faqat tartib va 1…10 daraja yoziladi
  (foizli fayl repoga qo’yilmaydi); osmon: `27-rasadxona/gen-sky.mjs`.
- Vercel: o’chirilgan Anthropic kaliti env’da qolgan bo’lsa, olib tashlash tavsiya etiladi (build loglaridagi 401 lar yo’qoladi).
