# «Mirzo Ulugʻbek» xususiy maktabi — shaxmat turniri dasturi

Kompyuterlarda oʻynaladigan turnir. Olimpiya tizimida: yutgan keyingi bosqichga chiqadi, yutqazgan chiqib ketadi.
Oʻgʻil bolalar va qizlar alohida oʻynaydi. Qurʼani dastur tashlaydi. Oʻyinlarni taxtalarga oʻzi beradi, natijani oʻzi yozadi va gʻolibni oʻzi keyingi bosqichga oʻtkazadi.

* **Internet shart emas.** Bitta kompyuter server boʻladi, qolganlari shu tarmoqdan (Wi-Fi yoki kabel) brauzer orqali ulanadi.
* **Hech narsa oʻrnatilmaydi.** Faqat server kompyuterida Python 3.8 yoki undan yangisi boʻlishi kerak.
* Har yurishdan keyin holat `data/turnir.json` ga saqlanadi. Kompyuter oʻchib qolsa, qayta ishga tushirganda turnir oʻsha joyidan davom etadi.

## 1. Tayyorlash (bir marta)

1. Server boʻladigan kompyuterga Python oʻrnating: <https://www.python.org/downloads/>. Oʻrnatishda **«Add python.exe to PATH»** belgisini qoʻying.
2. Shu papkada `oquvchilar.txt` faylini yarating. Shakli `oquvchilar.namuna.txt` dagidek:

   ```
   [OʻGʻIL BOLALAR]
   Familiya Ism | 10
   [QIZLAR]
   Familiya Ism | 9
   ```

   > `oquvchilar.txt` va `data/` papkasi repoga **yuklanmaydi** (`.gitignore`), chunki oʻquvchilarning ismlari ochiq joyga chiqmasligi kerak.

## 2. Ishga tushirish

* Windows: `ishga-tushirish.bat` ni ikki marta bosing. Yoki terminalda `python server.py` deb yozing.
* Windows «ruxsat berasizmi?» (Firewall) deb soʻrasa, **Ruxsat berish** tugmasini bosing (xususiy tarmoq). Aks holda boshqa kompyuterlar ulana olmaydi.
* Oynada manzillar va hakam PIN kodi chiqadi. Masalan:

  ```
  Katta ekran (proyektor):  http://192.168.1.10:8000/
  Boshqaruv (hakam):        http://192.168.1.10:8000/admin      PIN: 4821
  1-taxta:  OQ  http://192.168.1.10:8000/taxta/1/oq    QORA  http://192.168.1.10:8000/taxta/1/qora
  ```

## 3. Qaysi kompyuterda nima ochiladi

| Qayerda | Manzil | Vazifasi |
|---|---|---|
| Proyektor / katta ekran | `/` | Jonli taxtalar, turnir jadvali, qurʼa animatsiyasi, gʻoliblar shohsupasi |
| Hakam kompyuteri | `/admin` | Qurʼa, boshlash, tanaffus, sozlamalar, hakam qarori |
| 1-taxta, oq donalar | `/taxta/1/oq` | Oʻquvchi oʻynaydigan ekran |
| 1-taxta, qora donalar | `/taxta/1/qora` | Qarshisida oʻtirgan oʻquvchi |
| (zaxira) bitta kompyuterda ikkalasi | `/taxta/1` | Ikki oʻquvchi bitta kompyuterda navbat bilan |

Brauzerda **F11** bosing (toʻliq ekran). Chrome yoki Edge tavsiya etiladi.

## 4. Turnir tartibi

1. **Hakam → «Qurʼa tashlash».** Katta ekranda juftliklar animatsiya bilan chiqadi. Ishtirokchilar soni 2 ning darajasiga (8, 16, 32, 64) teng boʻlmasa, qurʼa bilan bir nechta oʻquvchi birinchi bosqichni oʻtkazib, toʻgʻridan-toʻgʻri keyingi bosqichga chiqadi. Qurʼani qayta tashlash mumkin (turnir boshlanguncha).
2. **«Turnirni boshlash».** Dastur boʻsh taxtaga navbatdagi juftlikni beradi. Ikkala oʻquvchi ekranda ismini koʻradi va **TAYYORMAN** tugmasini bosadi, shunda soat yuradi.
3. Oʻyin **mat, taslim, vaqt tugashi, pat, uch marta takrorlanish, 50 yurish qoidasi** yoki **kelishilgan durang** bilan tugaydi. Natijani dastur oʻzi yozadi.
4. **Durang boʻlsa**, oʻsha juftlik ranglarni almashtirib yana oʻynaydi. Yana durang boʻlsa, **armageddon**: oqda 5 daqiqa, qorada 4 daqiqa, durang boʻlsa qora gʻolib. Vaqtlarni sozlamalarda oʻzgartirish mumkin.
5. Yarim finalda yutqazganlar **3-oʻrin** uchun oʻynaydi.
6. Oxirida katta ekranda shohsupa chiqadi: 1-oʻrin 500 000, 2-oʻrin 300 000, 3-oʻrin 200 000 soʻm (oʻgʻil bolalar va qizlar alohida).

## 5. Hakam imkoniyatlari (`/admin`)

* **Tanaffus**: yangi oʻyinlar berilmaydi, boshlangan oʻyinlar davom etadi.
* **Taxtalar soni**: istalgan payt qoʻshish yoki kamaytirish mumkin. Har taxta = 2 kompyuter. Taxta qancha koʻp boʻlsa, turnir shuncha tez tugaydi (sahifada taxminiy vaqt koʻrsatiladi).
* **Vaqt nazorati**: daqiqa va har yurishga qoʻshimcha soniya (standart 5 + 3).
* Taxta kartochkasida:
  * **Boshlash**: oʻquvchi «Tayyorman»ni bosa olmasa, oʻyinni hakam boshlaydi.
  * **Qayta boshlash**: oʻyin notoʻgʻri boshlangan boʻlsa (masalan, oʻquvchilar joyini adashtirgan).
  * **Gʻolib: oq / qora**: hakam qarori.
* Oʻyinlar jadvalida istalgan juftlik uchun hakam qarori.
* **Natijalar (CSV)**: barcha oʻyinlar Excelda ochiladigan jadvalda.
* Qurʼagacha oʻquvchilar roʻyxatini shu sahifada tahrirlash mumkin.
* **Turnirni tozalash**: hammasini boshidan boshlash. Eski holat `data/` ga zaxira qilib saqlanadi.

## 6. Muammo boʻlsa

* **Boshqa kompyuter ulanmayapti.** Hamma kompyuterlar bitta tarmoqda ekanini tekshiring. Windows Firewall Python uchun ruxsat berganini tekshiring. Manzilni server oynasidagidek aniq yozing.
* **Server oynasi yopilib qoldi.** Qayta ishga tushiring. Turnir saqlangan joyidan davom etadi, ekranlar oʻzi qayta ulanadi.
* **8000-port band.** Boshqa port bilan ishga tushiring: `set PORT=8080` va `python server.py`.
* **Roʻyxatni fayldan qaytadan oʻqitish kerak.** Serverni yoping, `data` papkasini oʻchiring, qayta ishga tushiring.
* PIN kodni `data/pin.txt` faylida koʻrish mumkin. Oʻzingiz tanlash uchun: `set ADMIN_PIN=1234`.

## Litsenziyalar

* Taxta: [Chessground](https://github.com/lichess-org/chessground) (lichess.org), GPL-3.0. Matni: `static/vendor/CHESSGROUND-LICENSE.txt`.
* Qoidalar: [chess.js](https://github.com/jhlywa/chess.js), BSD-2-Clause. Matni: `static/vendor/CHESSJS-LICENSE.txt`.
* Shriftlar: Unbounded, Baloo 2, JetBrains Mono (SIL Open Font License).
