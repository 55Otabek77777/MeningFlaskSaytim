# Diktor fayllarini tayyorlash: boshidagi/oxiridagi jimlikni kesadi, energik ovoz ishlovi (EQ + kompressor + yengil zal),
# 48 kHz stereo WAV qilib yozadi va uzunliklarni chiqaradi — ular make.mjs --vo-dur ga beriladi (sahnalar ovozga moslanadi).
# python3 ovoz-tayyorla.py <kirish papkasi: 01.mp3…15.mp3> <chiqish papkasi>
import os, re, subprocess, sys
src, dst = sys.argv[1:3]; os.makedirs(dst, exist_ok=True)
FF = os.environ.get('FFMPEG', 'ffmpeg')
TRIM = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04,areverse'
CHAIN = ('highpass=f=80,equalizer=f=200:t=q:w=1:g=1.5,equalizer=f=3000:t=q:w=1.2:g=3.5,equalizer=f=8000:t=q:w=1.5:g=2,'
         'acompressor=threshold=-22dB:ratio=4:attack=5:release=80:makeup=2,aecho=0.8:0.6:26:0.07,loudnorm=I=-14:TP=-1.5')
files = sorted(f for f in os.listdir(src) if re.fullmatch(r'\d\d\.(mp3|wav)', f))
durs = []
for f in files:
    o = os.path.join(dst, f[:2] + '.wav')
    r = subprocess.run([FF, '-hide_banner', '-loglevel', 'error', '-y', '-i', os.path.join(src, f), '-af', f'aresample=48000,{TRIM},{CHAIN}', '-ar', '48000', '-ac', '2', o])
    assert r.returncode == 0, f
    e = subprocess.run([FF, '-hide_banner', '-i', o], capture_output=True, text=True).stderr
    h, m, s = re.search(r'Duration: (\d+):(\d+):([\d.]+)', e).groups(); d = int(h) * 3600 + int(m) * 60 + float(s)
    durs.append(round(d, 2)); print(f[:2], f'{d:.2f} s')
print('--vo-dur', ','.join(map(str, durs)))
