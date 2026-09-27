# YOUTUBE / TELEGRAM — saytda nima ko‘rinadi

## 1. YouTube
- Rasmiy kanal: **https://www.youtube.com/@ulugbek_xm** (`lib/site.ts` → `CONTACTS.youtube`).
- Saytda **birorta YouTube video joylashtirilmagan** (iframe/embed yo‘q). Kanal faqat havola sifatida: Footer ikonkasi («YouTube kanalimiz»), «Biz bilan bog‘laning» kartasi (**YouTube**, #FF0000), `/aloqa` sahifasidagi qator (`@ulugbek_xm`), JSON-LD `sameAs`.
- Hero videosi YouTube emas — o‘z serverdagi `assets/video/hero.mp4` (qarang `MEDIA.md`).
- `next.config.ts` da `i.ytimg.com` ruxsati bor (lite-embed thumbnail uchun tayyorlangan), lekin kodda ishlatilmaydi.
- Yagona iframe saytda — `/aloqa` dagi Google Maps: `https://www.google.com/maps?q=40.6182794,70.9805234&z=17&output=embed`.

## 2. Telegram

### 2.1 Rasmiy kanal — `@ulugbek_rm` (https://t.me/ulugbek_rm)
- Ochiq kanal. Bosh sahifadagi «So‘nggi yangiliklar» — shu kanalning **oxirgi 5 posti** (`/yangiliklar` sahifasida 12 ta), `https://t.me/s/ulugbek_rm` preview sahifasidan o‘qiladi (API kalitsiz).
- **Qaysi postlar saytga chiqadi:** matni bo‘lgan **yoki** rasm/video preview’i bo‘lgan har qanday post. Chiqmaydi: matnsiz va rasmsiz (masalan, faqat ovozli xabar, stiker). Post turi bo‘yicha filtr **yo‘q**.
- Matn Claude bilan «silliqlanadi» (buzilgan belgilar olib tashlanadi, 2–3 jumlali xulosa; ovozli xabar haqida bo‘lsa «🎙 Kanalimizga muhim ovozli xabar joylandi — …» uslubi). Natija `public_news_rewritten` da abadiy keshlanadi. ⚠️ 28.09 holati: API kaliti o‘chirilgani uchun silliqlash **o‘chiq** — sahifada kanal matni xom (unicode qalin harflar, emoji, hashteglar) ko‘rinadi; iyuldagi eski postlar esa keshdan silliq holda chiqadi. Yangi sahifa ikkala holatga ham chidashi kerak.
- Kartada: rasm (bo‘lsa), sana («22-iyul, 2026»), sarlavha = birinchi qator (≤80 belgi), matn (3 qator), **Telegramda o’qish →** → `https://t.me/ulugbek_rm/<id>`.
- 28.09 da ko‘rilgan post turlari: qabul e’lonlari; yangi ustozlar bilan tanishtiruv (foto); bitiruvchilarga xabarnoma (matn); tabriklar (foto); sentabrda — kelish vaqti qoidasi (19:30 gacha, Face ID 19:45 dan ogohlantiradi), asoschining 60 yillik yubileyi (8-sentabr), natijalar. Kanaldagi eng yangi post id’lari: `4845` (13.09), `4846` (25.09), `4847` (26.09), `4848` (27.09).
- ⚠️ Kanal postlarida **to‘lov summasi** uchraydi — bu dinamik oqim; yangi sahifaning **statik** matnida narx yozilmaydi.

### 2.2 Rasmiy bot — `@mirzorasmiybot` (https://t.me/mirzorasmiybot?start=web)
- Saytdagi «🤖 Botda savol berish», «Rasmiy bot (AI yordamchi)», ariza muvaffaqiyat ekranidagi «Rasmiy botga o‘tish» — hammasi shu botga.
- Vazifalari: ota-onalar uchun AI yordamchi (private chat), **sertifikat sinxronizatsiyasi** (arxiv guruhidagi rasmli postlar → sayt), admin mini-app (`/bot-admin`, faqat egasi/direktor).

### 2.3 Sertifikatlar qayerdan keladi
Natijalar **arxiv guruhi** (yopiq; `TELEGRAM_ARXIV_GROUP_ID`) — egasi u yerga sertifikat rasmini caption bilan tashlaydi → bot webhook → GCS + Firestore → bosh sahifa karuseli va `/yutuqlar` 5 daqiqa ichida yangilanadi. Caption shakli (erkin): `▶ Ism Familiya`, fan nomi, `Daraja: A+` / `CEFR: B2` / `Level: C1`; IELTS bo‘lsa fan = Ingliz tili. Ochiq kanalga chiqarilgan natija e’loni arxivga **forward** qilinsa ham rasm bo‘lgani uchun sertifikat sifatida olinadi.

### 2.4 Boshqa rasmiy havolalar (saytda ko‘rinadi)
- Admin: https://t.me/MirzoUlugbekMaktabi_Admin
- Menejer: https://t.me/Otabek_Mashrabov (AI chat «menejerga yo‘naltirish» matnlarida ham)
- Instagram: https://www.instagram.com/mirzoulugbekmaktabi
- Barcha havolalar (QR ekotizimi): https://mirzolink.com
- Xarita: https://maps.app.goo.gl/n7HcCtnK3KU1ZUWh9 · Google reviews: https://maps.google.com/?cid=18054142510786065278 (4.9 ★, 41+)
- Wikidata: https://www.wikidata.org/wiki/Q140421588
- Ariza xabarnomalari boshqa botga (**«Ota onalar ro‘yxati»**) boradi — sayt ko‘rsatmaydi, faqat serverda.
