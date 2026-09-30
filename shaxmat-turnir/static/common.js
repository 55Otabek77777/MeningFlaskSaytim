// Umumiy yordamchilar: server bilan aloqa, jonli yangilanish, soat, ovozlar
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const money = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export async function api(path, body, pin) {
  const r = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...(pin ? { 'X-Pin': pin } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `Xato (${r.status})`);
  return data;
}

/* Uzun so'rov: server holati o'zgarishi bilan darhol yangi ma'lumot keladi; aloqa uzilsa — qayta ulanadi */
export function live(url, onData, onLink) {
  let rev = 0, stop = false;
  (async function loop() {
    while (!stop) {
      try {
        const r = await fetch(`${url}?rev=${rev}`, { cache: 'no-store' });
        if (!r.ok) throw new Error(r.status);
        const d = await r.json();
        d._recv = performance.now();
        rev = d.rev;
        onLink && onLink(true);
        onData(d);
      } catch (e) {
        onLink && onLink(false);
        await new Promise(res => setTimeout(res, 1500));
      }
    }
  })();
  return { refresh() { rev = 0; }, stop() { stop = true; } };
}

export function fmtClock(ms) {
  ms = Math.max(0, ms);
  if (ms < 10000) return `0:0${Math.floor(ms / 1000)}.${Math.floor(ms % 1000 / 100)}`;
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

let toastTimer;
export function toast(msg, err = false) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.className = 'toast' + (err ? ' err' : '');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 3500);
}

/* Ovozlar (WebAudio — fayl kerak emas) */
let ac;
function tone(freq, dur, type = 'sine', vol = .18, at = 0) {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + .02);
  } catch (e) { /* ovoz bo'lmasa ham ishlayveradi */ }
}
export const sound = {
  unlock() { tone(1, .01, 'sine', 0.0001); },
  move() { tone(520, .09, 'triangle', .22); },
  capture() { tone(300, .12, 'square', .12); tone(620, .08, 'triangle', .15, .03); },
  check() { tone(880, .12, 'square', .1); tone(660, .16, 'square', .08, .1); },
  start() { [523, 659, 784].forEach((f, i) => tone(f, .18, 'triangle', .2, i * .11)); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, .28, 'triangle', .22, i * .13)); },
  lose() { [392, 330, 262].forEach((f, i) => tone(f, .3, 'sine', .18, i * .16)); },
  low() { tone(1200, .05, 'square', .06); }
};

export const COLOR = { w: 'white', b: 'black' };
export const RANG = { w: 'OQ', b: 'QORA' };
