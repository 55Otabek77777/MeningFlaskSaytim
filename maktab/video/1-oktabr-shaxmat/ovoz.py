# Diktor ovozi — o'zbek erkak ovozi (Microsoft Edge TTS: uz-UZ-SardorNeural), internet kerak.
# DIGITAL: pip install edge-tts  →  python maktab/video/1-oktabr-shaxmat/ovoz.py
# Natija: ovoz/A/01.mp3 … 08.mp3 (tantanali: marosim diktori toniga yaqin) va ovoz/B/… (tabiiy).
# Asl klipdagi diktor ovozi ≈160–195 Hz, ko'tarinki — A varianti shunga moslangan (ton +10 Hz, temp +6%).
import asyncio, os, edge_tts
HERE = os.path.dirname(os.path.abspath(__file__))
VOICE = 'uz-UZ-SardorNeural'
LINES = [
    "Endi navbat — o'quvchilarimizda!",
    "Olimpiada darajasida bo'lmasa ham, «Mirzo Ulug'bek» xususiy maktabi o'quvchilari ham mukofot yutib olish imkoniyatiga ega!",
    "Hurmatli ota-onalar! Maktabimiz birinchi oktabr kuni shaxmat musobaqasini tashkil etmoqda.",
    "Bu — birinchi oktabr tadbirimizning bir qismi va o'quvchilarimiz uchun haqiqiy aql mashqi.",
    "Shaxmatga qiziqadigan o'quvchilarimiz qatnashadi: qizlar va o'g'il bolalar alohida bellashadi.",
    "Har bir guruhda: birinchi o'ringa — besh yuz ming so'm, ikkinchi o'ringa — uch yuz ming so'm, uchinchi o'ringa — ikki yuz ming so'm pul mukofoti!",
    "Qizlarga jami — bir million so'm, o'g'il bolalarga jami — bir million so'm. Umumiy mukofot jamg'armasi — ikki million so'm!",
    "Shaxmatga qiziqadigan barcha o'quvchilarimizni qo'llab-quvvatlaymiz! «Mirzo Ulug'bek» xususiy maktabi.",
]
VARIANTS = {'A': dict(rate='+6%', pitch='+10Hz'), 'B': dict(rate='+0%', pitch='+4Hz')}

async def main():
    for v, prm in VARIANTS.items():
        d = os.path.join(HERE, 'ovoz', v); os.makedirs(d, exist_ok=True)
        for i, text in enumerate(LINES, 1):
            f = os.path.join(d, f'{i:02d}.mp3')
            await edge_tts.Communicate(text, VOICE, rate=prm['rate'], pitch=prm['pitch']).save(f)
            print(v, f'{i:02d}', os.path.getsize(f), 'bayt')
    print('tayyor:', os.path.join(HERE, 'ovoz'))

asyncio.run(main())
