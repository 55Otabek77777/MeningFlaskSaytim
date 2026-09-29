# Fon musiqasi va ovoz effektlari — to'liq sintez (mualliflik huquqi muammosi yo'q).
# python3 sintez.py <chiqish papkasi> [musiqa davomiyligi, s]   (48 kHz, stereo WAV)
# musiqa.wav — ko'tarinki 124 BPM trek (D–A–Bm–G): bochka 4/4, qarsak, hi-hat, bas, pad (nasos effekti), arpedjio
# effektlar: whoosh (o'tish + zarba), swoosh (qisqa), hit (katta zarba), stamp, pop1-3, ding, tings (ting-ting-ting-DING),
#            coins (tangalar shovqini), kaching (kassa apparati), riser (ko'tariluvchi), sparkle (yaltirash), ticks (hisoblagich)
import sys, wave, math, numpy as np
out = sys.argv[1]; SR = 48000; WANT = float(sys.argv[2]) if len(sys.argv) > 2 else 62.0
rng = np.random.default_rng(7)
def save(name, x, peak=None):
    x = np.asarray(x, dtype=float)
    if peak: x = x / (np.abs(x).max() + 1e-9) * peak
    x = np.clip(x, -1, 1); st = x if x.ndim == 2 else np.stack([x, x], 1)
    with wave.open(f'{out}/{name}', 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
def T(d): return np.arange(int(d * SR)) / SR
def note(n): return 440.0 * 2 ** ((n - 69) / 12)          # MIDI → Hz
def env(n, a, r):                                           # attack/release (s) konvert
    e = np.ones(n); A = min(n, int(a * SR)); R = min(n, int(r * SR))
    if A: e[:A] = np.sin(np.linspace(0, np.pi / 2, A)) ** 2
    if R: e[-R:] *= np.cos(np.linspace(0, np.pi / 2, R)) ** 2
    return e
def biquad(x, kind, f, q=0.8):                              # RBJ biquad (qisqa effektlar uchun; f massiv ham bo'lishi mumkin)
    x = np.asarray(x, float); n = len(x); f = np.broadcast_to(np.asarray(f, float), (n,))
    y = np.zeros(n); x1 = x2 = y1 = y2 = 0.0
    for i in range(n):
        w0 = 2 * math.pi * min(f[i], SR * .45) / SR; al = math.sin(w0) / (2 * q); c = math.cos(w0)
        if kind == 'bp': b0, b1, b2 = al, 0, -al
        elif kind == 'hp': b0, b1, b2 = (1 + c) / 2, -(1 + c), (1 + c) / 2
        else: b0, b1, b2 = (1 - c) / 2, 1 - c, (1 - c) / 2
        a0, a1, a2 = 1 + al, -2 * c, 1 - al
        yi = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0
        x2, x1, y2, y1 = x1, x[i], y1, yi; y[i] = yi
    return y
def pan(x, p):                                              # p: 0 chap … 1 o'ng
    return np.stack([x * math.cos(p * math.pi / 2) * 1.41, x * math.sin(p * math.pi / 2) * 1.41], 1)
def place(buf, x, at):                                      # stereo buferga qo'shish
    s = int(at * SR); x = x if x.ndim == 2 else np.stack([x, x], 1); e = min(len(buf), s + len(x))
    if e > s: buf[s:e] += x[:e - s]
def bell(f, d, idx=2.2, ratio=1.4, dec=3.0):                # FM qo'ng'iroq
    t = T(d); I = idx * np.exp(-t * dec * 1.6)
    return np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * ratio * t)) * np.exp(-t * dec) * env(len(t), .002, .05)
def mixl(*xs):                                              # turli uzunlikdagi signallarni qo'shish
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o
def clink(f, d=.18):                                        # tanga «jiring»i: noharmonik yuqori partiallar
    t = T(d); x = np.zeros(len(t))
    for r, a, k in ((1, 1, 26), (2.41, .6, 34), (3.87, .35, 45), (5.3, .2, 60)):
        x += a * np.sin(2 * np.pi * f * r * t + rng.uniform(0, 6.28)) * np.exp(-t * k)
    x[:int(.002 * SR)] += rng.standard_normal(int(.002 * SR)) * .5
    return x * env(len(t), .0005, .01)

# ---------------- MUSIQA ----------------
BPM = 124; BEAT = 60 / BPM; BAR = BEAT * 4
NB = math.ceil(WANT / BAR) + 1; N = int(NB * BAR * SR)
mus = np.zeros((N, 2))
CH = [[62, 66, 69, 74], [61, 64, 69, 73], [59, 62, 66, 71], [59, 62, 67, 71]]   # D, A, Bm, G
ROOT = [38, 33, 35, 31]
def kick():
    t = T(.34); ph = 2 * np.pi * np.cumsum(46 + 110 * np.exp(-t * 32)) / SR
    return (np.sin(ph) * np.exp(-t * 7.5) + rng.standard_normal(len(t)) * np.exp(-t * 400) * .25) * env(len(t), .001, .02)
def clap():
    t = T(.22); nz = rng.standard_normal(len(t)); e = np.zeros(len(t))
    for o in (0, .011, .022): e += (t >= o) * np.exp(-np.clip(t - o, 0, None) * (60 if o < .02 else 22))
    return biquad(nz * e, 'bp', 1600, .9) * 1.6 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * .3
def hat(d=.05, k=90):
    t = T(d); return biquad(rng.standard_normal(len(t)), 'hp', 7500, .7) * np.exp(-t * k)
def crash():
    t = T(2.2); return biquad(rng.standard_normal(len(t)), 'hp', 5000, .6) * np.exp(-t * 2.2) * env(len(t), .002, .3)
K, C, H, H2, CR = kick(), clap(), hat(), hat(.03, 140), crash()
pump = np.ones(N)                                            # nasos (sidechain): bochka zarbasidan keyin pad/bas pasayadi
for b in range(NB):
    lvl = 0 if b < 2 else 1
    for q in range(4):
        at = (b * 4 + q) * BEAT
        if lvl:
            place(mus, K * .9, at)
            s = int(at * SR); n = min(int(BEAT * SR), N - s); tt = np.arange(n) / SR
            pump[s:s + n] = np.minimum(pump[s:s + n], 1 - .55 * np.exp(-tt / .11))
        if b >= 4 and q in (1, 3): place(mus, pan(C * .5, .5), at)
        if b >= 2: place(mus, pan(H * .28, .62), at + BEAT / 2)
        if b >= 8:
            for s16 in (1, 3): place(mus, pan(H2 * .14, .38), at + s16 * BEAT / 4)
    if b in (2, 10, 18, 26): place(mus, pan(CR * .32, .45), b * BAR)
pad = np.zeros((N, 2)); bass = np.zeros(N); arp = np.zeros((N, 2))
for b in range(NB):
    c = CH[b % 4]; s0 = b * BAR; n = int((BAR + .3) * SR); t = np.arange(n) / SR; e = env(n, .25, .35)
    for j, m in enumerate(c):
        f = note(m)
        for d, p in ((-.003, .25), (.003, .75)):
            w = sum(np.sin(2 * np.pi * f * (1 + d) * k * t) / k ** 1.3 for k in (1, 2, 3, 4)) * e * .05
            place(pad, pan(w, p), s0)
    for q in range(8):                                       # bas: 8-lik oktava pulsi
        f = note(ROOT[b % 4] + (12 if q % 2 else 0)); n2 = int(BEAT / 2 * SR * .92); t2 = np.arange(n2) / SR
        w = (np.sin(2 * np.pi * f * t2) + .45 * np.sin(4 * np.pi * f * t2) + .2 * np.sin(6 * np.pi * f * t2)) * np.exp(-t2 * 5) * env(n2, .004, .03)
        s = int((s0 + q * BEAT / 2) * SR); e2 = min(N, s + n2); bass[s:e2] += w[:e2 - s] * (.16 if b >= 2 else .08)
    seq = [c[0], c[2], c[3], c[1] + 12, c[2], c[3], c[0] + 12, c[3]]
    for q in range(16):                                      # arpedjio: 16-lik qo'ng'iroqsimon pluck
        f = note(seq[q % 8] + 12); n3 = int(BEAT * .9 * SR); t3 = np.arange(n3) / SR
        w = (np.sin(2 * np.pi * f * t3) + .3 * np.sin(2 * np.pi * 2 * f * t3) * np.exp(-t3 * 14)) * np.exp(-t3 * 11) * env(n3, .002, .04)
        place(arp, pan(w * (.045 if b >= 1 else .025), .3 if q % 2 else .7), s0 + q * BEAT / 4)
mus += pad * pump[:, None] + np.stack([bass * pump, bass * pump], 1) + arp
mus = mus[:int(WANT * SR)]; mus *= env(len(mus), .3, 2.5)[:, None]
mus = np.tanh(mus * 1.4) / np.tanh(1.4)                      # yengil to'yinish — «issiq», zich ovoz
save('musiqa.wav', mus, .72)

# ---------------- EFFEKTLAR ----------------
# whoosh: ko'tariluvchi shovqin (1.25 s) + zarba (shaxmat taxtasi o'tishi)
t = T(1.6); nz = rng.standard_normal(len(t))
y = biquad(nz, 'bp', 300 + 5200 * np.clip(t / 1.25, 0, 1) ** 2, 1.6)
y *= np.clip(t / 1.25, 0, 1) ** 1.5 * np.where(t < 1.25, 1, np.exp(-(t - 1.25) * 18))
bt = np.clip(t - 1.25, 0, None); boom = np.sin(2 * np.pi * np.cumsum(38 + 80 * np.exp(-bt * 14)) / SR) * np.exp(-bt * 5) * (t >= 1.25)
wh = y / np.abs(y).max() * .5 + boom * .6
save('whoosh.wav', np.stack([wh * .9, wh], 1))
# swoosh: qisqa havo shamoli (sahna/wipe o'tishi), chapdan o'ngga
t = T(.55); u = t / .55; y = biquad(rng.standard_normal(len(t)), 'bp', 500 + 3800 * np.sin(np.pi * u) ** 1.5, 1.2)
y *= np.sin(np.pi * u) ** 2
save('swoosh.wav', np.stack([y * (1.2 - u), y * (.2 + u)], 1), .8)
# hit: katta zarba (past «boom» + shovqin)
t = T(1.8); boom = np.sin(2 * np.pi * np.cumsum(34 + 90 * np.exp(-t * 10)) / SR) * np.exp(-t * 2.6)
save('hit.wav', (boom * .8 + rng.standard_normal(len(t)) * np.exp(-t * 22) * .25) / 1.1)
# stamp: kalendar muhri — qisqa to'q zarba + qog'oz shitirlashi
t = T(.45); th = np.sin(2 * np.pi * np.cumsum(70 + 140 * np.exp(-t * 40)) / SR) * np.exp(-t * 14)
slap = biquad(rng.standard_normal(len(t)), 'bp', 1800, .7) * np.exp(-t * 55)
save('stamp.wav', th * .9 + slap * .8, .85)
# pop1-3: yumshoq «pop» (kartochkalar, ikonkalar) — uch xil balandlikda
for k, f0 in enumerate((620, 780, 940), 1):
    t = T(.16); ph = 2 * np.pi * np.cumsum(f0 * (1 + 1.4 * np.exp(-t * 60))) / SR
    save(f'pop{k}.wav', np.sin(ph) * np.exp(-t * 26) * env(len(t), .001, .02), .7)
# ding: yorqin qo'ng'iroq
d = mixl(bell(1568, 1.6, 2.4, 1.4, 2.6), .5 * bell(3136, 1.2, 1.2, 1.4, 4), .25 * bell(4699, .8, .8, 1.4, 6))
save('ding.wav', np.stack([d, np.roll(d, 90)], 1), .8)
# tings: «ting-ting-ting-ting — DING» (ko'tariluvchi pentatonika + katta qo'ng'iroq)
buf = np.zeros((int(2.0 * SR), 2))
for k, m in enumerate((84, 86, 88, 91, 93)):
    place(buf, pan(bell(note(m), .5, 1.6, 3.5, 7) * .55, .3 + .1 * k), k * .075)
place(buf, pan(mixl(bell(note(96), 1.6, 2.6, 1.4, 2.4), .4 * bell(note(103), 1.1, 1, 1.4, 4)), .55), .4)
save('tings.wav', buf, .8)
# coins: tangalar sochilishi (≈1.3 s, tasodifiy «jiring»lar, zichligi so'nadi)
buf = np.zeros((int(1.6 * SR), 2)); tm = 0.0
while tm < 1.25:
    place(buf, pan(clink(rng.uniform(2600, 6200)) * rng.uniform(.3, 1) * (1 - tm / 1.4), rng.uniform(.15, .85)), tm)
    tm += rng.exponential(.018 + .05 * tm)
save('coins.wav', buf, .75)
# kaching: kassa apparati — mexanik «chak» + tortma + «jiring» (ikki qo'ng'iroq) + tangalar
buf = np.zeros((int(2.0 * SR), 2)); t = T(.09)
place(buf, biquad(rng.standard_normal(len(t)), 'bp', 2600, 1.5) * np.exp(-t * 70) * 1.2, 0)
t = T(.25); place(buf, np.sin(2 * np.pi * 120 * t) * np.exp(-t * 25) + biquad(rng.standard_normal(len(t)), 'bp', 900, 1) * np.exp(-t * 30) * .6, .06)
place(buf, pan(bell(2637, 1.5, 2.2, 1.4, 2.4), .4) + pan(bell(3136, 1.5, 2.2, 1.4, 2.4), .6), .13)
for k in range(10): place(buf, pan(clink(rng.uniform(3000, 6000)) * .4, rng.uniform(.2, .8)), .25 + k * rng.uniform(.03, .07))
save('kaching.wav', buf, .85)
# riser: 2.2 s ko'tariluvchi (shovqin + sweep + tebranish) — katta raqam oldidan
t = T(2.2); u = t / 2.2
nzr = biquad(rng.standard_normal(len(t)), 'bp', 400 + 6000 * u ** 2, 1.3)
sw = np.sin(2 * np.pi * np.cumsum(180 + 1400 * u ** 2) / SR) * (.5 + .5 * np.sin(2 * np.pi * np.cumsum(4 + 22 * u) / SR))
save('riser.wav', (nzr / np.abs(nzr).max() * .6 + sw * .35) * u ** 2 * env(len(t), .05, .02), .7)
# sparkle: yaltirash (oltin raqam/logotip)
buf = np.zeros((int(1.6 * SR), 2))
for k in range(14): place(buf, pan(bell(rng.uniform(3000, 6500), .6, 1, 3.5, 8) * (1 - k / 16), rng.uniform(.1, .9)), k * .06 + rng.uniform(0, .03))
save('sparkle.wav', buf, .6)
# ticks: hisoblagich (1.1 s, power2.out — avval tez, keyin sekin; 18 «chiq»)
buf = np.zeros(int(1.3 * SR)); tk = clink(5200, .02) * .6
for k in range(1, 19): place_at = (1 - math.sqrt(1 - k / 18)) * 1.1; s = int(place_at * SR); buf[s:s + len(tk)] += tk[:len(buf) - s]
save('ticks.wav', buf, .5)
print('ok: musiqa', round(len(mus) / SR, 1), 's + 14 effekt')
