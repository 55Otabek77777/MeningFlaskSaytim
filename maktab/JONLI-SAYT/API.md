# API — bosh sahifa nimani chaqiradi, qanday javob oladi

Domen: `https://mirzoulugbek.app`. Yangi sahifa shu domen ildizida turadi → hamma yo‘l **nisbiy** (`/api/...`), CORS yo‘q.
Namunalar 2026-09-28 da jonli saytdan olingan (`API/*.json`).

## 1. Brauzer chaqiradigan endpointlar (bosh sahifa)

### 1.1 `GET | POST /api/visit` — tashrif hisoblagichi (footer)
- `POST` — hisobni +1 qiladi va yangi qiymatni qaytaradi; `GET` — faqat o‘qiydi.
- Mantiq (`VisitorCounter`): `sessionStorage["mu_visit_counted"] === "1"` bo‘lsa `GET`, aks holda `POST`, muvaffaqiyatdan keyin `"1"` yoziladi. `total <= 0` bo‘lsa hech narsa ko‘rsatilmaydi.
- POST IP bo‘yicha 4 ta/daqiqa; limitdan oshsa xato **emas** — shunchaki hozirgi total qaytadi.
- Javob: `{"total": 2330}` (`API/visit-namuna.json`). Ko‘rinish: `total.toLocaleString("uz-UZ")` + « marta tashrif buyurilgan».
- Saqlanadi: Firestore `public_meta/visits.count` (server-side, service account) + kunlik `bot_meta_daily/{YYYY-MM-DD}` (private).

### 1.2 `POST /api/track-call` — «Qo‘ng‘iroq» bosilishi
- Tanasiz POST, fire-and-forget (`fetch(...).catch(() => undefined)`), `tel:` navigatsiyani bloklamaydi. Javob doim `{"ok": true}`.
- IP bo‘yicha 4/daqiqa. Saqlanadi: `bot_meta/call_clicks.count` (private, admin panelda ko‘rinadi).

### 1.3 `POST /api/ariza` — ariza (forma `/qabul` da; bosh sahifadagi barcha «ariza» tugmalari o‘sha sahifaga olib boradi)
So‘rov:
```json
{ "fullName": "Ism Familiya", "region": "Farg’ona viloyati", "grade": "9-sinf", "phone": "+998901234567", "website": "" }
```
- `fullName` 3–120 belgi · `region` — aynan `lib/site.ts` `REGIONS` ro‘yxatidan (14 ta, apostrof ’) · `grade` — aynan `ACTIVE_GRADES`: `8-sinf`, `9-sinf`, `10-sinf`, `11-sinf`, `Bitiruvchi (11-sinfni tugatgan)` · `phone` — `^\+998\d{9}$` · `website` — honeypot (yashirin, bo‘sh).
- Javoblar: `200 {"ok":true}` · `200 {"ok":true,"duplicate":true,"createdAt":"2026-..."}` (shu telefon+ism avval yuborgan) · `400 {"ok":false,"error":"invalid"|"bad_json"}` · `429 {"ok":false,"error":"rate_limited"}` (IP: 3 ta / 10 daqiqa).
- Server: Telegram’ga xabar («Ota onalar ro‘yxati» bot chati) + private `bot_arizalar` kolleksiyasiga yozadi. Klient tomonda ham 60 s throttle (`localStorage["ariza_last_submit"]`).
- ⚠️ Haqiqiy POST egasining Telegramiga boradi — sinovni mock bilan qiling; jonli yuborish **bitta**, ism `Sinov Sinovov`.

### 1.4 `POST /api/chat` — AI yordamchi (o‘ng-pastdagi vidjet)
So‘rov: `{"message": "…", "history": [{"role":"user|assistant","content":"…"}], "sessionId": "<uuid, localStorage site_ai_session>"}`
- `message` 1–1000 belgi; `history` oxirgi 8 ta.
- Javob: `{"reply": "…", "deferred": false}`; limit/byudjet/xato bo‘lsa ham 200 va `deferred: true` bilan «menejer» matni (`MANAGER_REPLY`). `400 {"error":"invalid_json"|"invalid_message"}`.
- IP 10 ta/daqiqa. Model: Claude (haiku). Narx aytmaydi, o‘quvchi sonini aytmaydi.

## 2. Ommaviy JSON (ixtiyoriy foydalanish)

### 2.1 `GET /api/telegram-news` — kanal oqimi
`{"ok": true, "channel": "https://t.me/ulugbek_rm", "count": 12, "posts": [ {"id":"ulugbek_rm/4672","text":"…","photo":"https://cdn4.telesco.pe/file/…"|null,"date":"2026-07-26T01:25:46+00:00"|null,"link":"https://t.me/ulugbek_rm/4672"}, … ]}`
- Manba: `https://t.me/s/ulugbek_rm` HTML’i (cheerio) → oxirgi 12 post, yangisi birinchi → matn Claude bilan silliqlanadi va `public_news_rewritten/{id}` da abadiy keshlanadi. 1 soat ISR kesh. Xato bo‘lsa `[]`.
- Bosh sahifa buni **HTTP orqali emas**, server komponentda to‘g‘ridan-to‘g‘ri chaqiradi (`fetchTelegramPosts(5)`), lekin statik sahifa uchun shu endpoint **same-origin fetch** bilan ishlatish mumkin.
- Namunalar: `API/telegram-news-namuna.json` (route javobi, 4 post; narx yozilgan post kiritilmadi) va `API/telegram-news-bosh-sahifa.json` (bosh sahifa 28.09 da ko‘rsatgan **yangi** 5 post — 1 katta karta + 4 qator).
- ⚠️ AI silliqlash hozir **ishlamayapti** (Anthropic API kaliti 27–28.09 da o‘chirildi → `rewritePostText` `null` qaytaradi) — kartalarda kanal matni **xom** holda: unicode qalin harflar (𝗗𝗢𝗧𝗔), emoji, hashteglar, `\n`. Yangi sahifa matnni shu holatda ham chiroyli ko‘rsatishi kerak (line-clamp, `white-space: pre-line`, uzun so‘zlarga `overflow-wrap`).
- ⚠️ Kuzatuv (28.09): `GET /api/telegram-news` **eskirgan kesh** qaytardi (eng yangi post `4672`, 26-iyul), holbuki bosh sahifaning o‘zi (`revalidate = 300`) shu paytda `4846`–`4848` (25–27-sentabr) postlarini ko‘rsatyapti. Ya’ni route’ning ISR keshi yangilanmayapti — egasining tomonida tuzatiladi. Yangi sahifa uchun xulosa: agar jonli oqim kerak bo‘lsa, shu endpointga tayaning, lekin **kesh yangilanishi tuzatilgach**; hozircha dizayn `API/telegram-news-bosh-sahifa.json` dagi yangi namunalar bilan qilinadi.

## 3. Server tomonda o‘qiladigan ma’lumot (HTTP endpoint YO‘Q)

| nima | qayerdan | qanday |
|---|---|---|
| Sertifikatlar (karusel, /yutuqlar) | Firestore `public_certificates` (sayt loyihasi) | `lib/certificates-data.ts` → `fsList` (REST + service-account JWT), `year` kamayish, `sort` o‘sish bo‘yicha; `image_url` bo‘shlari tashlanadi; 5 daqiqa ISR |
| Firestore yangiliklar (fallback) | `public_news` | `firebase/firestore/lite` web SDK (NEXT_PUBLIC_* config), `publishedAt desc`, `hidden != true` |

Statik sahifa bularni o‘qiy olmaydi (kalit yo‘q). Yechim: **`API/sertifikatlar.json` snapshot** (91 ta, 2026-09-28) — jonli sahifa aynan shu ro‘yxatni ko‘rsatyapti. Kerak bo‘lsa keyin egasining tomonida `GET /api/certificates` qo‘shiladi.

### 3.1 `public_certificates` hujjat shakli
```json
{ "name": "Kendjaboyev Sunnatulla", "subject": "Kimyo", "grade": "A+", "year": "2025-2026",
  "image_url": "https://storage.googleapis.com/ulugbek-perfect-edu-7b4fa-certs/certificates/cert-9df99a1ea03a5657.webp",
  "date": null, "sort": 1, "width": 1420, "height": 2000,
  "source": "telegram", "telegram_message_id": 123, "created_at": "2026-..." }
```
`subject` kanonik qiymatlari (`SUBJECT_ORDER`): Kimyo · Biologiya · Matematika · Fizika · Ingliz tili · Ona tili va adabiyot · Tarix. `grade`: A+, A, B2, C1 (CEFR yoki milliy). `certificateAlt(c)` = `"{name} — {subject} fanidan {grade} darajali sertifikat"`.

### 3.2 Sertifikat oqimi (avtomatik)
Natijalar **arxiv guruhi** (yopiq supergroup) → `@mirzorasmiybot` webhook `POST /api/telegram-webhook` (`x-telegram-bot-api-secret-token`) → rasm (document original yoki eng katta photo) → GCS bucket `ulugbek-perfect-edu-7b4fa-certs` ga `certificates/tg-<message_id>.<ext>` (publicRead) → caption’dan `parseCaption` (ism «▶/✎/✍️/👤» belgidan keyin; fan; `CEFR|Level|Daraja: X`) → `public_certificates` (year `2026-2027`, dedupe `telegram_message_id`, FIFO 2000) → `revalidatePath("/")`, `/yutuqlar`, `/ekran`. Rasmsiz forward — `bot_channel_posts` (faqat AI kontekst, saytga chiqmaydi).

## 4. Firestore kolleksiyalari (sayt loyihasi `ulugbek-perfect-edu-7b4fa`) — `firestore.rules`

| kolleksiya | klient ruxsati | kim yozadi |
|---|---|---|
| `public_news` | read | Telegram sync xizmati |
| `public_certificates` | read | webhook |
| `public_settings` | read | server |
| `public_news_rewritten` | read, create-once (`text`≤2000, `createdAt`) | `lib/ai-rewrite.ts` |
| `public_ai_usage/{YYYY-MM}` | read; `spent_usd` faqat +≤0.1 | `lib/ai-usage.ts` |
| `public_unanswered_questions` | create-only | `/api/chat` (menejerga yo‘naltirilgan savollar) |
| `public_admissions` | yopiq | — (o‘rniga `/api/ariza`) |
| boshqa hamma narsa | **deny** | server (service account): `public_meta/visits`, `bot_meta/call_clicks`, `bot_meta_daily/*`, `bot_arizalar`, `site_ai_questions`, `bot_channel_posts` |

Klient `firebase.ts` dagi `ALLOWED_COLLECTIONS` ro‘yxatidan tashqarisiga umuman murojaat qila olmaydi (`assertPublicCollection`).

## 5. Rasm hostlari (`next.config.ts` → `images.remotePatterns`)
`firebasestorage.googleapis.com`, `*.firebasestorage.app`, `storage.googleapis.com` (sertifikatlar), `*.cdn-telegram.org`, `*.telesco.pe` (Telegram preview), `i.ytimg.com` (YouTube thumbnail — hozircha ishlatilmaydi).

## 6. Xavfsizlik sarlavhalari (har javobda)
`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`, `X-Frame-Options: SAMEORIGIN` (bot-admin’dan tashqari). CSP yo‘q — inline script’lar ishlaydi (yig‘ilgan bitta-faylli sahifa uchun muammo yo‘q).
