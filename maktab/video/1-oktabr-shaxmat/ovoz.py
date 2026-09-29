# Diktor ovozi — o'zbek erkak ovozi (Microsoft Edge TTS: uz-UZ-SardorNeural), internet kerak.
# DIGITAL: pip install edge-tts  →  python maktab/video/1-oktabr-shaxmat/ovoz.py
# Natija: ovoz/A/01.mp3 … 15.mp3 (energik) va ovoz/B/… (juda energik) — har gap alohida fayl,
# shunda videoda har summa aytilgan lahzada «ting-ting — DING», tangalar va kassa ovozi aniq tushadi.
# Asl klipdagi diktor ovozi ≈160–195 Hz, ko'tarinki — ikkala variant ham shunga yaqin, tezroq va balandroq tonda.
import asyncio, os, edge_tts
HERE = os.path.dirname(os.path.abspath(__file__))
VOICE = 'uz-UZ-SardorNeural'
LINES = [
    "Endi navbat — o'quvchilarimizda!",
    "Olimpiada darajasida bo'lmasa ham, «Mirzo Ulug'bek» xususiy maktabi o'quvchilari ham mukofot yutib olish imkoniyatiga ega!",
    "Hurmatli ota-onalar! Maktabimiz shaxmat musobaqasini tashkil etmoqda!",
    "Musobaqa birinchi oktabr kuni bo'lib o'tkaziladi — bu o'quvchilarimiz uchun haqiqiy aql mashqi!",
    "Shaxmatga qiziqadigan o'quvchilarimiz qatnashadi: qizlar va o'g'il bolalar alohida bellashadi!",
    "Har bir guruhda — pul mukofotlari!",
    "Birinchi o'ringa — besh yuz ming so'm!",
    "Ikkinchi o'ringa — uch yuz ming so'm!",
    "Uchinchi o'ringa — ikki yuz ming so'm!",
    "Qizlarga jami — bir million so'm!",
    "O'g'il bolalarga jami — bir million so'm!",
    "Umumiy mukofot jamg'armasi —",
    "Ikki million so'm!",
    "Musobaqa jarayonlarini ijtimoiy tarmoqlarimizda — Instagram, Yutub va Telegramda yoritib boramiz!",
    "Shaxmatga qiziqadigan barcha o'quvchilarimizni qo'llab-quvvatlaymiz! «Mirzo Ulug'bek» xususiy maktabi!",
]
VARIANTS = {'A': dict(rate='+10%', pitch='+8Hz'), 'B': dict(rate='+15%', pitch='+14Hz')}

async def main():
    for v, prm in VARIANTS.items():
        d = os.path.join(HERE, 'ovoz', v); os.makedirs(d, exist_ok=True)
        for i, text in enumerate(LINES, 1):
            f = os.path.join(d, f'{i:02d}.mp3')
            await edge_tts.Communicate(text, VOICE, rate=prm['rate'], pitch=prm['pitch']).save(f)
            print(v, f'{i:02d}', os.path.getsize(f), 'bayt')
    print('tayyor:', os.path.join(HERE, 'ovoz'), '—', len(LINES), 'ta gap ×', len(VARIANTS), 'variant')

asyncio.run(main())
