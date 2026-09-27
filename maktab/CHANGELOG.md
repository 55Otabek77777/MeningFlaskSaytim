# CHANGELOG — «Mirzo Ulug’bek» bosh sahifasi

## 2026-09-27 — v1.0 (yangi kinematik bosh sahifa)
Logistika saytining animatsiya tizimi (GSAP + ScrollTrigger + SplitText, Lenis, tree-shaken Three.js) asosida,
yorug’ «kun osmoni» mavzusida qurildi. Agentlarsiz, bitta qo’lda yozildi. `logistika/` o’zgarmagan.

### Bo’limlar (15)
| # | Qism | Nima bor |
|---|---|---|
| 00 | core | Shisha header (logo.png), faol bo’lim indikatori, mobil to’liq ekran menyu, scroll progress, ambient yulduzlar, `tel:` bosilganda `POST /api/track-call` |
| 10 | hero | Three.js astrolyabiya + armillyar halqalar (navy/oltin), retro-grid, so’zma-so’z sarlavha, yo’nalish slot-so’zi, qabul kartasi («2026–2027: sanoqli o’rinlar», border-beam), 27+ / 1560+ / IELTS 8.0 |
| 15 | ticker | Ikki kesishuvchi marquee (fanlar / maktab hayoti), scroll tezligiga qarab |
| 20 | heritage | Zarracha morfing: yulduz turkumi → kitob va qalam → bino → ikkinchi bino → 2027–2028 reja binosi; 5 nuqtali vaqt chizig’i, asoschi va direktor rasmlari, «Maktabning birinchi binosi» |
| 30 | yonalishlar | 5 faol + «Rus tili yo’nalishlari» (Yangi · 2026–2027, 3 juftlik) + «5–7-sinflar» (qulf, «2027–2028 dan reja»); jonli ikonkalar, spotlight, border beam |
| 35 | hayot | Pinned gorizontal 4 panel: Yotoqxona (2 haftalik kalendar), Xavfsizlik (Face ID skaneri + Telegram xabar **namunasi**), Salomatlik (EKG + shifokor xabarnomasi), Kun tartibi (24 soatlik soat 07:00–21:30, vokzal 300 m) |
| 40 | geografiya | O’zbekiston xaritasi (SVG Maps, CC BY 4.0): chegaralar chiziladi, 6 hudud yoritiladi, kamera sharqqa zoom, hududlardan Uchko’prikka nurlar, «Oliygoh sari» uchqun — raqam yo’q |
| 45 | stats | Aynan 6 ta ko’rsatkich: 27+ (dinamik), Ilk minglik (matn), 1560+, IELTS 8.0 (8/9 o’lchagich), 45+, 64 (8×8 kamera to’ri) |
| 50 | rasadxona | Three.js armillyar sfera: scroll bilan halqalar ochiladi, 5 yo’nalish orbitaga chiqadi; sudrab aylantirish |
| 60 | qabul-jarayoni | 5 bosqich: Ariza → Aloqa (24 soat) → Suhbat/sinov → Rasmiylashtirish → O’qish boshlanadi |
| 65 | ariza | `POST /api/ariza` kontrakti: fullName/region (14 hudud, ’ bilan)/grade (5 variant, 5–7 bloklangan)/phone (+998 maska)/website (honeypot); jonli varaqa, muhr, konfetti; duplicate / 429 / tarmoq xatosi holatlari |
| 70 | nega-biz | 9 afzallik bento (har birida mikro-animatsiya) + «Yangilanishlar» (Face ID 4 apparat, shifokor xabarnomasi sentabr oyidan, rus tili yo’nalishlari, 8-sentabr yubiley, kelish vaqti) |
| 80 | yutuqlar | 3D sertifikat kartalari dastasi (fan + daraja turi, ism yo’q), 1560+, «Namunalarni ko’ring» → /yutuqlar |
| 90 | faq | 15 savol akkordeon, javoblar faqat faktlardan; «To’lov qancha?» → menejer |
| 99 | footer | Kontaktlar, xarita havolasi, ish vaqti + uyga ruxsat izohi, ijtimoiy tarmoqlar, mirzolink.com, tashrif hisoblagichi (`/api/visit`, sessionStorage `mu_visit_counted`), © yil, litsenziya, mobil yopishqoq «Qo’ng’iroq / Ariza» paneli |

### QA natijasi
- `node build.mjs --release` — xatosiz; `dist/index.html` ≈ 1,39 MB (≤ 2,2 MB).
- 1440×900 va 390×844: konsol xatosi 0, gorizontal overflow yo’q, 390 px da 15 px dan kichik o’qiladigan matn yo’q.
- `prefers-reduced-motion` — hisoblagichlar yakuniy qiymatda, hamma matn ko’rinadi.
- Fakt auditi: 974/791/1149/1303 — 0; «ming» faqat «Ilk minglik»; «qabul boshlandi / bino ochildi / qabul ochiq / 5 ta apparat / hamma ota-ona / 2026-sentabr» — 0; ʻ/ʼ — 0.
- Ariza formasi mock bilan sinaldi: bo’sh, noto’g’ri telefon, to’g’ri (ok), duplicate, 429, honeypot.

### Ochiq masalalar / TODO(egasi)
- **Jonli `POST /api/ariza` sinovi qilinmadi**: cloud konteynerdan `mirzoulugbek.app` ga tarmoq ruxsati yo’q. Deploy’dan keyin bitta sinov: ism `Sinov Sinovov`.
- `photos/hero.webp` ishlatilmadi (fayl berilmagan; hero’da 3D astrolyabiya).
- Xarita ma’lumoti: `@svg-maps/uzbekistan` (CC BY 4.0, Victor Cazanave) — footerda manba ko’rsatilgan.
