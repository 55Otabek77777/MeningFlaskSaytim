# Yakuniy QA dalillari

[To’liq egaga hisobot](../../YAKUNIY-HISOBOT.md) · [111 qatorli A jadvali](A-MATN-JADVALI.md) · [xom tahrir reyestri](matn-tuzatishlari.json).

Asos d32ec9b; branch chatgpt/maktab-yakuniy. Full QA — 4cdd6b4; undan keyingi B5 mobil menyu — 5b4d0ea da alohida oddiy/reduced rejimlarda tekshirilgan. JSON natijalar reports/ ichida. Konsol/overflow/15 px tekshiruvlari, 33 ssenariy guruhi va jonli media natijalari alohida.

To’liq ikki alifbo tekshiruvida 200 scroll skrinshoti olingan. Ular katta hajm sabab lokal qa/release-* papkalarida; bu yerda muhim oldin/keyin kadrlar saqlangan. Standart QA’da faqat tashqi sertifikat/Telegram rasmlari placeholder bilan, maktab surat va videolari esa repodagi haqiqiy fayllar bilan beriladi. b4-news-keyin.png haqiqiy Telegram preview’lari bilan olingan. Hero videosi davom etgani uchun uning oldin/keyin kadri bir xil lahza bo’lishi shart emas.

| Bo’lim | Oldin | Keyin |
|---|---|---|
| Yo’nalishlar — desktop | [Skrinshot](screenshots/b1-desktop-oldin.png) | [Skrinshot](screenshots/b1-desktop-keyin.png) |
| Yo’nalishlar — mobil | [Skrinshot](screenshots/b1-mobile-oldin.png) | [Skrinshot](screenshots/b1-mobile-keyin.png) |
| Maktab hayoti — desktop | — | [Skrinshot](screenshots/b2-desktop-keyin.png) |
| Maktab hayoti — mobil | — | [Skrinshot](screenshots/b2-mobile-keyin.png) |
| Dron — desktop | [Skrinshot](screenshots/b3-desktop-oldin.png) | [Skrinshot](screenshots/b3-desktop-keyin.png) |
| Dron — mobil | [Skrinshot](screenshots/b3-mobile-oldin.png) | [Skrinshot](screenshots/b3-mobile-keyin.png) |
| Telegram rasmlari / sarlavhalar | — | [Skrinshot](screenshots/b4-news-keyin.png) |
| Mobil menyu | [Skrinshot](screenshots/b5-menu-oldin.png) | [Skrinshot](screenshots/menu-joriy.png) |

Alifbo ko’rinishi: [joriy hero](screenshots/a-mobile-hero-joriy.png), [yangi hero](screenshots/a-mobile-hero-yangi.png), [yangi menyu](screenshots/menu-yangi.png).

400/429 mock javoblari bilan ataylab hosil qilingan HTTP xatolari api.json ichida; reduced-motion yoki reload’da to’xtatilgan video ERR_ABORTED alohida cancelledMedia diagnostikasida. Oddiy sahifa QA’da konsol/runtime xatolari yo’q.
