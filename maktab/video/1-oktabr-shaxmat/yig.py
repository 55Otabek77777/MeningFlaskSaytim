# Videoni yig'ish: kadrlar (render/out) + asl klip ovozi + effektlar + musiqa (+ diktor ovozi, bo'lsa).
# python3 yig.py <render papkasi> <audio papkasi> <asl video> <chiqish.mp4> [ovoz papkasi (01.mp3…08.mp3)]
import json, os, re, subprocess, sys
render, audio, src, out = sys.argv[1:5]; vo = sys.argv[5] if len(sys.argv) > 5 else None
FF = os.environ.get('FFMPEG', 'ffmpeg')
T = json.load(open(os.path.join(render, 'timing.json')))   # render.mjs yozadi: gaplar boshlanishi (V), uzunligi (VD), D
D = T['D']; SLOTS = [(v, v + d + 0.3) for v, d in zip(T['V'], T['VD'])]
def run(args): r = subprocess.run([FF, '-hide_banner', '-loglevel', 'error', '-y', *args]); assert r.returncode == 0, args
def dur(f):
    e = subprocess.run([FF, '-hide_banner', '-i', f], capture_output=True, text=True).stderr
    h, m, s = re.search(r'Duration: (\d+):(\d+):([\d.]+)', e).groups(); return int(h) * 3600 + int(m) * 60 + float(s)
tmp = os.path.join(render, 'mix'); os.makedirs(tmp, exist_ok=True)
inputs = ['-i', src, '-i', f'{audio}/hit.wav', '-i', f'{audio}/whoosh.wav', '-i', f'{audio}/musiqa.wav']
fc = ['[0:a]atrim=0:30.3,asetpts=N/SR/TB,aresample=48000,loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=out:st=29.2:d=1.1[o]',
      '[1:a]adelay=10450|10450,volume=0.45[h]', '[2:a]adelay=28950|28950,volume=0.7[w]',
      '[3:a]adelay=29600|29600,volume=%s[m0]' % ('0.55' if vo else '0.8')]
mixin = '[o][h][w]'
if vo:
    # diktor: har gap o'z vaqtiga; sig'masa — atempo (≤1.12); marosim akustikasi (EQ + kompressor + yengil zal)
    parts = []
    for i, (a, b) in enumerate(SLOTS, 1):
        f = os.path.join(vo, f'{i:02d}.mp3'); d = dur(f); slot = b - a - 0.08
        tempo = min(1.12, max(1.0, d / slot)); fit = d / tempo
        print(f'{i:02d}: {d:.2f}s → slot {slot:.2f}s, atempo {tempo:.3f} → {fit:.2f}s' + ('  ⚠ SIG\'MAYDI' if fit > slot + 0.05 else ''))
        g = os.path.join(tmp, f'vo{i:02d}.wav')
        run(['-i', f, '-af', f'aresample=48000,atempo={tempo:.4f},highpass=f=90,equalizer=f=160:t=q:w=1:g=2,equalizer=f=3200:t=q:w=1.2:g=3,acompressor=threshold=-20dB:ratio=3:attack=8:release=120,aecho=0.8:0.55:38|76:0.18|0.10,loudnorm=I=-15:TP=-1.5', '-ac', '2', g])
        inputs += ['-i', g]; parts.append((len(inputs) // 2 - 1, a))
    for k, (idx, a) in enumerate(parts):
        fc.append(f'[{idx}:a]adelay={int(a * 1000)}|{int(a * 1000)}[v{k}]')
    fc.append(''.join(f'[v{k}]' for k in range(len(parts))) + f'amix=inputs={len(parts)}:normalize=0,asplit=2[vo][vosc]')
    fc.append('[m0][vosc]sidechaincompress=threshold=0.04:ratio=6:attack=40:release=450:makeup=1[m]')  # diktor gapirganda musiqa pasayadi
    mixin += '[m][vo]'; n = 5
else:
    fc.append('[m0]anull[m]'); mixin += '[m]'; n = 4
fc.append(f'{mixin}amix=inputs={n}:normalize=0,apad,atrim=0:{D},alimiter=limit=0.9[aout]')
wav = os.path.join(tmp, 'audio.wav')
run([*inputs, '-filter_complex', ';'.join(fc), '-map', '[aout]', '-ar', '48000', '-ac', '2', wav])
run(['-framerate', '30', '-i', os.path.join(render, 'out', '%05d.jpg'), '-i', wav, '-c:v', 'libx264', '-preset', 'slow', '-crf', '19',
     '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out])
print('✔', out, round(os.path.getsize(out) / 1048576, 1), 'MB')
