# Fon musiqasi va effektlar — to'liq sintez (mualliflik huquqi muammosi yo'q).
# python3 sintez.py <chiqish papkasi> [musiqa davomiyligi, s]  → musiqa.wav, whoosh.wav, hit.wav  (48 kHz, stereo)
import sys, wave, math, numpy as np
out = sys.argv[1]; SR = 48000; WANT = float(sys.argv[2]) if len(sys.argv) > 2 else 38.4
def save(name, x):
    x = np.clip(x, -1, 1); st = x if x.ndim == 2 else np.stack([x, x], 1)
    with wave.open(f'{out}/{name}', 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
def note(n): return 440.0 * 2 ** ((n - 69) / 12)          # MIDI → Hz
def env(n, a, r):                                           # attack/release (s) konvert
    e = np.ones(n); A = int(a * SR); R = int(r * SR)
    if A: e[:A] = np.sin(np.linspace(0, np.pi / 2, A)) ** 2
    if R: e[-R:] *= np.cos(np.linspace(0, np.pi / 2, R)) ** 2
    return e
BAR = 2.4; BEAT = BAR / 4; LOOPS = math.ceil(WANT / (BAR * 4)); DUR = BAR * 4 * LOOPS    # 100 BPM, 4 taktli sikl
N = int(DUR * SR); t = np.arange(N) / SR
L = np.zeros(N); Rr = np.zeros(N)
# akkordlar: D – Bm – G – A (MIDI)
CH = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]]
ROOT = [38, 35, 43 - 12, 45 - 12]
for k in range(4 * LOOPS):
    c = CH[k % 4]; s0 = int(k * BAR * SR); n = int((BAR + .45) * SR); n = min(n, N - s0); tt = np.arange(n) / SR
    e = env(n, .35, .5)
    lvl = 0.6 + 0.4 * min(1, k / 6)                          # asta-sekin ko'tariladi
    for j, m in enumerate(c):                                # pad: yumshoq garmonikalar + detune (xor effekti)
        f = note(m + 12)
        for d, pan in ((-0.0015, .35), (0.0015, .65)):
            w = np.sin(2 * np.pi * f * (1 + d) * tt) + .28 * np.sin(4 * np.pi * f * (1 + d) * tt) + .12 * np.sin(6 * np.pi * f * (1 + d) * tt)
            L[s0:s0 + n] += w * e * .028 * lvl * (1 - pan) * 2; Rr[s0:s0 + n] += w * e * .028 * lvl * pan * 2
    for b in range(4):                                       # bas: har zarbda yumshoq impuls
        bs = s0 + int(b * BEAT * SR); bn = min(int(BEAT * SR * .95), N - bs); bt = np.arange(bn) / SR
        f = note(ROOT[k % 4]); w = (np.sin(2 * np.pi * f * bt) + .35 * np.sin(4 * np.pi * f * bt)) * np.exp(-bt * 3.2) * env(bn, .008, .05)
        L[bs:bs + bn] += w * .16 * lvl; Rr[bs:bs + bn] += w * .16 * lvl
    arp = [c[0] + 24, c[1] + 24, c[2] + 24, c[3] + 24, c[2] + 24, c[1] + 24, c[3] + 24, c[2] + 24]
    if k >= 2:                                               # qo'ng'iroqsimon arpedjio (8-lik), 3-taktdan
        for q, m in enumerate(arp):
            qs = s0 + int(q * BEAT / 2 * SR); qn = min(int(BEAT * 1.6 * SR), N - qs); qt = np.arange(qn) / SR
            f = note(m); w = (np.sin(2 * np.pi * f * qt) + .2 * np.sin(2 * np.pi * 2.76 * f * qt) * np.exp(-qt * 9)) * np.exp(-qt * 4.5) * env(qn, .004, .08)
            pan = .3 if q % 2 else .7
            L[qs:qs + qn] += w * .05 * (1 - pan) * 2; Rr[qs:qs + qn] += w * .05 * pan * 2
    if k >= 4:                                               # yengil zarb: 1 va 3-zarbda (5-taktdan)
        for b in (0, 2):
            ks = s0 + int(b * BEAT * SR); kn = min(int(.35 * SR), N - ks); kt = np.arange(kn) / SR
            ph = 2 * np.pi * np.cumsum(45 + 75 * np.exp(-kt * 30)) / SR
            w = np.sin(ph) * np.exp(-kt * 9)
            L[ks:ks + kn] += w * .22; Rr[ks:ks + kn] += w * .22
mix = np.stack([L, Rr], 1)[:int(WANT * SR)]; N = len(mix)
mix *= env(N, .8, 2.2)[:, None]
# oddiy past chastota filtri (bir qutbli) — yumshoqroq tembr
a = np.exp(-2 * np.pi * 5200 / SR)
for ch in range(2):
    y = np.empty(N); prev = 0.0; x = mix[:, ch]
    for i in range(0, N, 4096):                              # vektorlashgan bo'lak-bo'lak filtr
        seg = x[i:i + 4096]; from_prev = prev
        out_seg = np.empty_like(seg)
        for j2 in range(len(seg)):
            from_prev = (1 - a) * seg[j2] + a * from_prev; out_seg[j2] = from_prev
        y[i:i + 4096] = out_seg; prev = from_prev
    mix[:, ch] = y
mix /= np.abs(mix).max() / .7
save('musiqa.wav', mix)
# whoosh: ko'tariluvchi shovqin (1.3 s) + zarba
n = int(1.6 * SR); tt = np.arange(n) / SR; rng = np.random.default_rng(7); nz = rng.standard_normal(n)
fc = 300 + 5200 * (tt / 1.25) ** 2                           # «rezonans» — shovqinni tebranuvchi filtr bilan bo'yash
y = np.zeros(n); v = 0.0; p = 0.0
for i in range(n):
    w0 = 2 * np.pi * min(fc[i], 9000) / SR; alpha = .12
    v += w0 * (nz[i] - p - alpha * v); p += w0 * v
    y[i] = v
y *= np.clip(tt / 1.25, 0, 1) ** 1.5 * np.where(tt < 1.25, 1, np.exp(-(tt - 1.25) * 18))
bt = np.clip(tt - 1.25, 0, None); boom = np.sin(2 * np.pi * np.cumsum(38 + 80 * np.exp(-bt * 14)) / SR) * np.exp(-bt * 5) * (tt >= 1.25)
wh = y / np.abs(y).max() * .5 + boom * .6
save('whoosh.wav', np.stack([wh * .9, wh], 1))
# hook zarbasi: past «boom» + qisqa shovqin
n = int(1.8 * SR); tt = np.arange(n) / SR
boom = np.sin(2 * np.pi * np.cumsum(34 + 90 * np.exp(-tt * 10)) / SR) * np.exp(-tt * 2.6)
hiss = rng.standard_normal(n) * np.exp(-tt * 22) * .25
save('hit.wav', (boom * .8 + hiss) / 1.1)
print('ok', DUR)
