# Videoni yig'ish: kadrlar (render/out) + asl klip ovozi + ovoz effektlari + musiqa (+ diktor ovozi, bo'lsa).
# PYTHONPATH=<numpy> python3 yig.py <render papkasi> <audio papkasi> <asl video> <chiqish.mp4> [diktor papkasi: 01.wav…15.wav (ovoz-tayyorla.py)]
# Effektlar timing.json dagi «sfx» ro'yxatidan olinadi (ssenariy.src.html har animatsiyaga bog'lab yozadi) — ovoz va tasvir bir xil vaqtda.
import json, os, subprocess, sys, wave
import numpy as np
render, audio, src, out = sys.argv[1:5]; vo = sys.argv[5] if len(sys.argv) > 5 else None
FF = os.environ.get('FFMPEG', 'ffmpeg'); SR = 48000
T = json.load(open(os.path.join(render, 'timing.json')))   # render.mjs yozadi: gaplar boshlanishi (V), uzunligi (VD), D, sfx
D = T['D']
def run(args): r = subprocess.run([FF, '-hide_banner', '-loglevel', 'error', '-y', *args]); assert r.returncode == 0, args
def rd(f):
    with wave.open(f) as w:
        assert w.getframerate() == SR and w.getnchannels() == 2, f
        return np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2) / 32768.0
def wr(f, x):
    with wave.open(f, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())
tmp = os.path.join(render, 'mix'); os.makedirs(tmp, exist_ok=True)

# 1) effektlar qatlami
bed = np.zeros((int((D + 3) * SR), 2)); cache = {}
for at, name, vol in T['sfx']:
    x = cache.setdefault(name, rd(os.path.join(audio, name + '.wav'))); s = int(at * SR)
    bed[s:s + len(x)] += x[:len(bed) - s] * vol
bed = bed[:int(D * SR)]
print('effektlar:', len(T['sfx']), 'ta ·', ', '.join(sorted(cache)))
wr(os.path.join(tmp, 'sfx.wav'), bed * .9)

# 2) aralashtirish (ffmpeg): asl ovoz 0–30.3 s, musiqa 29.6 s dan (diktor gapirganda pasayadi), effektlar, diktor
inputs = ['-i', src, '-i', f'{audio}/musiqa.wav', '-i', os.path.join(tmp, 'sfx.wav')]
fc = ['[0:a]atrim=0:30.3,asetpts=N/SR/TB,aresample=48000,loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=out:st=29.2:d=1.1[o]',
      '[1:a]adelay=29600|29600,volume=%s[m0]' % ('0.5' if vo else '0.72'), '[2:a]anull[fx]']
mixin = '[o][fx]'
if vo:
    parts = []
    for i, a in enumerate(T['V'], 1):
        f = os.path.join(vo, f'{i:02d}.wav'); inputs += ['-i', f]; parts.append((len(inputs) // 2 - 1, a))
    for k, (idx, a) in enumerate(parts):
        fc.append(f'[{idx}:a]adelay={int(a * 1000)}|{int(a * 1000)}[v{k}]')
    fc.append(''.join(f'[v{k}]' for k in range(len(parts))) + f'amix=inputs={len(parts)}:normalize=0,asplit=2[vo][vosc]')
    fc.append('[m0][vosc]sidechaincompress=threshold=0.03:ratio=5:attack=30:release=380:makeup=1[m]')  # diktor gapirganda musiqa pasayadi
    mixin += '[m][vo]'; n = 4
else:
    fc.append('[m0]anull[m]'); mixin += '[m]'; n = 3
fc.append(f'{mixin}amix=inputs={n}:normalize=0,apad,atrim=0:{D},alimiter=limit=0.9:attack=3:release=60[aout]')
wav = os.path.join(tmp, 'audio.wav')
run([*inputs, '-filter_complex', ';'.join(fc), '-map', '[aout]', '-ar', '48000', '-ac', '2', wav])
run(['-framerate', '30', '-i', os.path.join(render, 'out', '%05d.jpg'), '-i', wav, '-c:v', 'libx264', '-preset', 'slow', '-crf', '19',
     '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out])
print('✔', out, round(os.path.getsize(out) / 1048576, 1), 'MB')
