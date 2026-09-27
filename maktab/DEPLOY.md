# DEPLOY — bosh sahifani joylash

Amaldagi yo’riqnoma: **v3, 2026-09-28**. Natija `chatgpt/maktab-astra6` branch’ida. Jonli hostingga joylash alohida qadam.

1. Release fayli: `maktab/index.html` (= `maktab/dist/index.html`, taxminan **479 KB**). Kutubxona va Manrope shrifti fayl ichida. `dist/preview-inline.html` va `dist/artifact.html` deploy uchun emas.
2. Faylni `mirzoulugbek.app/` bosh sahifasi sifatida bering. Mavjud Next.js ichki sahifalari va `/api/*` marshrutlarini saqlang. Backend o’zgarishi talab qilinmaydi.
3. Quyidagi allaqachon mavjud resurslar ochilishi kerak:
   - `/logo.png`, `/icon.png`, `/og-image.png`;
   - `/photos/history-1994.webp` (asosiy bino; fayl nomi qurilgan yil degani emas), `/photos/founder.webp`, `/photos/director.webp`;
   - `/photos/` ichidagi `grads-2324-a.webp`, `grads-2324-b.webp`, `students-2425-a.webp`, `students-2425-b.webp`, `students-2425-c.webp`, `trip-orda.webp`, `trip-a.webp`, `trip-b.webp`;
   - `/assets/video/hero.mp4` va `hero-poster.webp`: **faqat video tugmasi bosilganda yuklanadi**;
   - `storage.googleapis.com/ulugbek-perfect-edu-7b4fa-certs/…`, Telegram’ning `*.telesco.pe` / `*.cdn-telegram.org` rasm hostlari.
4. API: `POST /api/ariza`, `POST /api/chat`, `GET|POST /api/visit`, tanasiz `POST /api/track-call`, `GET /api/telegram-news`. Formaning ko’rinadigan alifbosi yangi; yuboriladigan region/grade qiymatlari asl kontraktda.
5. Joylashdan oldin `SPEC.md` dagi build va lokal QA buyruqlarini bajaring. **Jonli /api/ariza ga sinov arizasi yubormang**: egasining Telegramiga ketadi. Validatsiya, muvaffaqiyat, duplicate, 400, 429 va 60 soniya cheklovi `qa-functional.mjs` orqali mock bilan tekshiriladi.
6. Joylashdan keyin ko’rish tekshiruvi: yangi bosh sahifa, mobil menyu, suratlar, video tugmasi, sertifikat filtri va kattalashtirish, FAQ qidiruvi, mavjud ichki havolalar. Video oynasi yopilganda ijro to’xtashi kerak.

## Ma’lumotlarni yangilash

- Sertifikatlar snapshot (91 yozuv, 2026-09-28). Tasdiqlangan JSON yangilangach `node src/parts/30-yutuqlar/gen-certs.mjs`, keyin `node build.mjs --release`. Yangi server endpointi taxmin qilinmagan.
- Telegram snapshot’ini yangilash: `node src/parts/65-yangiliklar/gen-news.mjs`, so’ng build. `/api/telegram-news` yangiroq post qaytarsa interfeys uni qabul qiladi; eski route keshi yangi snapshot’ni bosib ketmaydi.
- Original MP4 taxminan 76 MB; avtomatik ochilmaydi. Ushbu ishda original media o’zgartirilmagan.
- Server qat’iy CSP qo’shsa, bitta fayldagi inline CSS/JS, `data:` shriftlar va yuqoridagi media manbalari uchun tegishli ruxsat zarur.

Natijalar va skrinshotlar: [QA.md](QA.md).
