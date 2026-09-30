// «Mirzo Ulugʻbek» xususiy maktabi — shaxmat turniri serveri: server.py mantiqining JavaScript nusxasi.
// Brauzerda ham, Node 18+ da ham ishlaydi (DOM yoki Node API ishlatilmaydi).
// server.py dagi har bir funksiya satrma-satr koʻchirilgan; Python semantikasi (butun sonlar, truthiness,
// xato turlari va matnlari, dict tartibi) saqlangan. Fayl oʻrniga: onSave(json), initialState.

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
export const GROUP_NAMES = { B: 'Oʻgʻil bolalar', G: 'Qizlar' };
export const PRIZES = { 1: 500000, 2: 300000, 3: 200000 };
export const REASONS = {
  mate: 'mat', resign: 'taslim boʻldi', time: 'vaqt tugadi', stalemate: 'pat', repetition: 'uch marta takrorlanish',
  fifty: '50 yurish qoidasi', material: 'mat qilish uchun kuch yetarli emas', agreement: 'kelishuv',
  admin: 'hakam qarori'
};

// ---------------- Python semantikasi uchun yordamchilar ----------------
class PyErr extends Error {
  constructor(type, msg = '') { super(msg); this.pyType = type; }
}
const VE = msg => new PyErr('ValueError', msg);
const hasOwn = (o, k) => o !== null && typeof o === 'object' && Object.prototype.hasOwnProperty.call(o, k);
const isDict = v => v !== null && typeof v === 'object' && !Array.isArray(v);

function pyTypeName(v) {
  if (v === null || v === undefined) return 'NoneType';
  if (typeof v === 'boolean') return 'bool';
  if (typeof v === 'number') return Number.isInteger(v) ? 'int' : 'float';
  if (typeof v === 'string') return 'str';
  if (Array.isArray(v)) return 'list';
  return 'dict';
}

function pyTruthy(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;                 // NaN — Python da True
  if (typeof v === 'string') return v.length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return true;
}

function pyFloatRepr(x) {
  if (Number.isNaN(x)) return 'nan';
  if (x === Infinity) return 'inf';
  if (x === -Infinity) return '-inf';
  if (Number.isInteger(x) && Math.abs(x) < 1e16) return x.toFixed(1);
  const ax = Math.abs(x);
  if (ax !== 0 && (ax < 1e-4 || ax >= 1e16)) {
    let s = x.toExponential();                             // eng qisqa raqamlar
    s = s.replace(/e([+-])(\d)$/, 'e$10$2');               // Python: e-05
    return s;
  }
  return String(x);
}

function pyStrRepr(s) {
  const q = s.includes("'") && !s.includes('"') ? '"' : "'";
  let out = q;
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (ch === '\\') out += '\\\\';
    else if (ch === q) out += '\\' + q;
    else if (ch === '\n') out += '\\n';
    else if (ch === '\r') out += '\\r';
    else if (ch === '\t') out += '\\t';
    else if (c < 0x20 || (c >= 0x7f && c <= 0xa0)) out += '\\x' + c.toString(16).padStart(2, '0');
    else out += ch;
  }
  return out + q;
}

function pyRepr(v) {
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : pyFloatRepr(v);   // JSON butun son — int
  if (typeof v === 'string') return pyStrRepr(v);
  if (Array.isArray(v)) return '[' + v.map(pyRepr).join(', ') + ']';
  return '{' + Object.entries(v).map(([k, x]) => pyStrRepr(k) + ': ' + pyRepr(x)).join(', ') + '}';
}
const pyStr = v => (typeof v === 'string' ? v : pyRepr(v));                               // str(x)

const PY_WS = '\\t\\n\\x0b\\x0c\\r\\x1c\\x1d\\x1e\\x1f \\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000';
const RE_STRIP = new RegExp(`^[${PY_WS}]+|[${PY_WS}]+$`, 'g');
const RE_WS = new RegExp(`[${PY_WS}]+`);
const pyStrip = s => s.replace(RE_STRIP, '');
const pySplit = s => { const t = pyStrip(s); return t ? t.split(RE_WS) : []; };      // str.split()
const cpSlice = (s, n) => Array.from(s).slice(0, n).join('');                         // s[:n] (kod nuqtalari)

function pySplitlines(s) {
  const out = [];
  let i = 0, start = 0;
  while (i < s.length) {
    const c = s[i];
    if ('\n\r\x0b\x0c\x1c\x1d\x1e\x85  '.includes(c)) {
      out.push(s.slice(start, i));
      if (c === '\r' && s[i + 1] === '\n') i++;
      i++;
      start = i;
    } else i++;
  }
  if (start < s.length) out.push(s.slice(start));
  return out;
}

const RE_ND = /\p{Nd}/u;
function digitValue(ch) {                                  // Unicode: oʻnlik raqamlar 0..9 ketma-ket bloklarda
  let cp = ch.codePointAt(0), start = cp;
  while (RE_ND.test(String.fromCodePoint(start - 1))) start--;
  return (cp - start) % 10;
}

function pyInt(v) {                                        // int(x)
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'number') {
    if (Number.isNaN(v)) throw VE('cannot convert float NaN to integer');
    if (!Number.isFinite(v)) throw new PyErr('OverflowError', 'cannot convert float infinity to integer');
    const t = Math.trunc(v);
    return t === 0 ? 0 : t;
  }
  if (typeof v === 'string') {
    const m = /^([+-]?)(\p{Nd}+(?:_\p{Nd}+)*)$/u.exec(pyStrip(v));
    if (!m) throw VE(`invalid literal for int() with base 10: ${pyStrRepr(v)}`);
    const digits = Array.from(m[2].replace(/_/g, '')).map(ch => (ch >= '0' && ch <= '9' ? ch : String(digitValue(ch)))).join('');
    const n = Number(digits);
    return m[1] === '-' && n !== 0 ? -n : n;
  }
  throw new PyErr('TypeError', `int() argument must be a string, a bytes-like object or a real number, not '${pyTypeName(v)}'`);
}

function dget(d, key, dflt = null) {                       // d.get(key, dflt)
  if (!isDict(d)) throw new PyErr('AttributeError', `'${pyTypeName(d)}' object has no attribute 'get'`);
  return hasOwn(d, key) ? d[key] : dflt;
}
function bodyItem(d, key) {                                // body[key] (key — matn)
  if (isDict(d)) {
    if (hasOwn(d, key)) return d[key];
    throw new PyErr('KeyError', pyStrRepr(key));
  }
  if (Array.isArray(d)) throw new PyErr('TypeError', 'list indices must be integers or slices, not str');
  if (typeof d === 'string') throw new PyErr('TypeError', 'string indices must be integers');
  throw new PyErr('TypeError', `'${pyTypeName(d)}' object is not subscriptable`);
}
function pyIn(key, c) {                                    // key in c  (key — matn)
  if (isDict(c)) return hasOwn(c, key);
  if (Array.isArray(c)) return c.some(x => x === key);
  if (typeof c === 'string') return c.includes(key);
  throw new PyErr('TypeError', `argument of type '${pyTypeName(c)}' is not iterable`);
}
function checkHashable(k) {
  if (Array.isArray(k)) throw new PyErr('TypeError', "unhashable type: 'list'");
  if (isDict(k)) throw new PyErr('TypeError', "unhashable type: 'dict'");
}
function getItem(d, k) {                                   // S['games'][k] kabi — kalitlar doim matn
  checkHashable(k);
  if (typeof k === 'string' && hasOwn(d, k)) return d[k];
  throw new PyErr('KeyError', pyRepr(k));
}
function dictHas(d, k) {                                   // k in dict
  checkHashable(k);
  return typeof k === 'string' && hasOwn(d, k);
}

function bitLength(x) {
  let n = 0;
  while (x > 0) { x = Math.floor(x / 2); n++; }
  return n;
}
const clone = o => (o === undefined ? undefined : JSON.parse(JSON.stringify(o)));
const tupleLess = (a, b) => {
  for (let i = 0; i < a.length; i++) {
    if (a[i] < b[i]) return true;
    if (a[i] > b[i]) return false;
  }
  return false;
};

// ---------------- URL (urllib.parse.urlparse / parse_qs) ----------------
function urlparse(url) {
  let scheme = '', netloc = '', query = '', fragment = '', params = '';
  const i = url.indexOf(':');
  if (i > 0 && /^[A-Za-z]/.test(url) && /^[A-Za-z0-9+\-.]+$/.test(url.slice(0, i))) {
    scheme = url.slice(0, i).toLowerCase();
    url = url.slice(i + 1);
  }
  if (url.startsWith('//')) {
    let end = url.length;
    for (const c of '/?#') { const w = url.indexOf(c, 2); if (w >= 0) end = Math.min(end, w); }
    netloc = url.slice(2, end);
    url = url.slice(end);
  }
  let h = url.indexOf('#');
  if (h >= 0) { fragment = url.slice(h + 1); url = url.slice(0, h); }
  h = url.indexOf('?');
  if (h >= 0) { query = url.slice(h + 1); url = url.slice(0, h); }
  if (url.includes(';')) {                                  // urlparse: oxirgi segmentdan ;params
    const j = url.includes('/') ? url.indexOf(';', url.lastIndexOf('/')) : url.indexOf(';');
    if (j >= 0) { params = url.slice(j + 1); url = url.slice(0, j); }
  }
  return { scheme, netloc, path: url, params, query, fragment };
}

function pyUnquote(s) {
  if (!s.includes('%')) return s;
  let out = '', bytes = [];
  const flush = () => { if (bytes.length) { out += new TextDecoder('utf-8').decode(new Uint8Array(bytes)); bytes = []; } };
  for (let i = 0; i < s.length;) {
    if (s[i] === '%' && /^[0-9A-Fa-f]{2}$/.test(s.slice(i + 1, i + 3))) { bytes.push(parseInt(s.slice(i + 1, i + 3), 16)); i += 3; }
    else { flush(); out += s[i]; i++; }
  }
  flush();
  return out;
}

function parseQs(qs) {
  const out = {};
  for (const nameValue of qs.split('&')) {
    if (!nameValue) continue;
    const eq = nameValue.indexOf('=');
    if (eq < 0) continue;                                    // keep_blank_values=False
    const val = nameValue.slice(eq + 1);
    if (!val.length) continue;
    const name = pyUnquote(nameValue.slice(0, eq).replace(/\+/g, ' '));
    (out[name] = out[name] || []).push(pyUnquote(val.replace(/\+/g, ' ')));
  }
  return out;
}

export function urlPath(url) { return urlparse(url).path; }
export const rstripSlash = s => s.replace(/\/+$/, '');

// ---------------- o'quvchilar ro'yxati (read_names_file, matndan) ----------------
const normHead = s => s.toLowerCase().replace(/[ʻʼ'’‘`]/g, '');

export function parseNames(text) {
  const out = { B: [], G: [] };
  if (text == null) return out;
  if (text.startsWith('﻿')) text = text.slice(1);
  let grp = null;
  for (const raw of text.split(/\r\n|\r|\n/)) {
    const line = pyStrip(raw);
    if (!line || line.startsWith('//')) continue;
    const h = normHead(line);
    if (line.startsWith('[') || line.startsWith('#')) {
      if (h.includes('qiz')) grp = 'G';
      else if (h.includes('ogil') || h.includes('bola')) grp = 'B';
      continue;
    }
    if (grp === null) continue;
    const bar = line.indexOf('|');
    let name = bar >= 0 ? line.slice(0, bar) : line;
    const sinf = bar >= 0 ? line.slice(bar + 1) : '';
    name = pySplit(name).join(' ');
    if (name) out[grp].push({ name, sinf: pyStrip(sinf) });
  }
  return out;
}

const ERROR_PAGE = (code, message, explain) => '<!DOCTYPE HTML>\n<html lang="en">\n    <head>\n        <meta charset="utf-8">\n        <title>Error response</title>\n    </head>\n    <body>\n        <h1>Error response</h1>\n        <p>Error code: ' +
  code + '</p>\n        <p>Message: ' + message + '.</p>\n        <p>Error code explanation: ' + code + ' - ' + explain + '.</p>\n    </body>\n</html>\n';
export const errorPage = ERROR_PAGE;

const RE_ADMIN = /^\/api\/admin\/([\p{L}\p{N}_]+)$/u;
const RE_GAME = /^\/api\/game\/([\p{L}\p{N}_-]+)\/([\p{L}\p{N}_]+)$/u;
const RE_TAXTA = /^\/api\/taxta\/(\p{Nd}+)$/u;
export function isApiGet(p) {                              // do_GET da API ga tegishli yoʻllar (p — rstrip qilingan)
  return p === '/api/state' || RE_TAXTA.test(p) || p === '/api/natijalar.csv' || p === '/api/admin/check';
}

// =====================================================================================
export function createServer(opts = {}) {
  const {
    pin = '1234', resultHold = 12, players = { B: [], G: [] }, initialState = null, onSave = null,
    autoTick = true, tickMs = 250, longPollMs = 15000, now = () => Date.now(), random = Math.random, lan = []
  } = opts;
  const RESULT_HOLD = Number(resultHold);
  const PIN = String(pin);
  const nowMs = () => Math.floor(now());
  const randbelow = n => Math.min(n - 1, Math.floor(random() * n));
  const shuffle = x => {                                   // random.shuffle
    for (let i = x.length - 1; i > 0; i--) {
      const j = randbelow(i + 1);
      [x[i], x[j]] = [x[j], x[i]];
    }
  };
  const choice = seq => seq[randbelow(seq.length)];

  let S = null;
  let waiters = new Set();
  let timer = null, stopped = false;

  function makePlayers(lists) {
    const out = {};
    for (const g of ['B', 'G']) {
      const arr = (lists && hasOwn(lists, g)) ? lists[g] : [];
      arr.forEach((p, idx) => {
        const pid = g + String(idx + 1).padStart(2, '0');
        const sinf = hasOwn(p, 'sinf') ? p.sinf : '';
        out[pid] = { id: pid, g, name: pyStrip(String(p.name)), sinf: pyStrip(String(sinf)) };
      });
    }
    return out;
  }

  // ---------------- holat ----------------
  function newState() {
    return {
      v: 1, rev: 1, phase: 'setup', paused: false,
      config: { boards: 2, tc_min: 5, tc_inc: 3, arm_w: 5, arm_b: 4 },
      players: makePlayers(players),
      matches: {}, rounds: { B: [], G: [] }, bronze: {}, games: {},
      boards: [0, 1].map(i => ({ id: i + 1, on: true, game: null, hold_until: 0 })),
      drawn_at: null, started_at: null, finished_at: null, log: []
    };
  }

  function save() {
    if (!onSave) return;
    try { onSave(JSON.stringify(S)); } catch (e) { console.error('saqlash xatosi:', e); }
  }

  function notify() {
    const ws = waiters;
    waiters = new Set();
    for (const w of ws) { clearTimeout(w.t); w.res(); }
  }

  function changed(msg = null) {
    S.rev += 1;
    if (msg) {
      S.log.push([nowMs(), msg]);
      S.log = S.log.slice(-300);
    }
    save();
    notify();
  }

  function pname(pid) {
    const p = pyTruthy(pid) && typeof pid === 'string' && hasOwn(S.players, pid) ? S.players[pid] : null;
    return p ? p.name : '—';
  }

  // ---------------- jerebyovka va jadval (olimpiya tizimi) ----------------
  function roundTitle(g, r) {
    const total = S.rounds[g].length;
    const left = total - r;
    if (left === 1) return 'Final';
    if (left === 2) return 'Yarim final';
    if (left === 3) return 'Chorak final';
    if (r === 0 && S.rounds[g][0].some(mid => pyTruthy(S.matches[mid].bye))) return 'Saralash bosqichi';
    return `1/${2 ** (left - 1)} final`;
  }

  function buildBracket(g) {
    const ids = Object.entries(S.players).filter(([, p]) => p.g === g).map(([pid]) => pid);
    const n = ids.length;
    S.rounds[g] = [];
    delete S.bronze[g];
    if (n < 2) return;
    let size = 1;
    while (size < n) size *= 2;
    const R = bitLength(size) - 1;
    const order = ids.slice();
    shuffle(order);
    const first = Math.floor(size / 2);
    const byes = size - n;
    const bits = Math.max(1, bitLength(first - 1));
    const rev = i => parseInt(i.toString(2).padStart(bits, '0').split('').reverse().join(''), 2);
    const spread = Array.from({ length: first }, (_, i) => i).sort((a, b) => rev(a) - rev(b));
    const byeSet = new Set(spread.slice(0, byes));          // bo'sh juftliklar jadval bo'ylab tekis taqsimlanadi
    for (let r = 0; r < R; r++) {
      const col = [];
      for (let s = 0; s < (size >> (r + 1)); s++) {
        const mid = `${g}${r + 1}-${String(s + 1).padStart(2, '0')}`;
        S.matches[mid] = { id: mid, g, r, s, p: [null, null], winner: null, loser: null,
          status: 'wait', games: [], bye: false, bronze: false, note: '' };
        col.push(mid);
      }
      S.rounds[g].push(col);
    }
    if (R >= 2) {
      const mid = `${g}-3orin`;
      S.matches[mid] = { id: mid, g, r: R - 1, s: 1, p: [null, null], winner: null, loser: null,
        status: 'wait', games: [], bye: false, bronze: true, note: '' };
      S.bronze[g] = mid;
    }
    let k = 0;
    S.rounds[g][0].forEach((mid, s) => {
      const m = S.matches[mid];
      if (byeSet.has(s)) {
        m.p = [order[k++], null];
        m.bye = true;
      } else {
        m.p = [order[k++], order[k++]];
      }
    });
  }

  function setResult(m, winner, note = '') {
    m.winner = winner;
    m.loser = m.p[0] === winner ? m.p[1] : m.p[0];
    m.status = 'done';
    if (note) m.note = note;
    if (pyTruthy(m.bronze)) return;
    const { g, r, s } = m;
    const rounds = S.rounds[g];
    if (r + 1 < rounds.length) {
      const nxt = S.matches[rounds[r + 1][Math.floor(s / 2)]];
      nxt.p[s % 2] = winner;
    }
    if (r === rounds.length - 2 && hasOwn(S.bronze, g) && pyTruthy(m.loser)) {
      S.matches[S.bronze[g]].p[s % 2] = m.loser;
    }
  }

  function resolve() {
    let again = true;
    while (again) {
      again = false;
      for (const m of Object.values(S.matches)) {
        if (m.status !== 'wait') continue;
        if (pyTruthy(m.bye) && pyTruthy(m.p[0])) {
          setResult(m, m.p[0], 'avtomatik oʻtdi');
          m.status = 'bye';
          again = true;
        } else if (pyTruthy(m.p[0]) && pyTruthy(m.p[1])) {
          m.status = 'ready';
          again = true;
        }
      }
    }
    checkFinished();
  }

  function checkFinished() {
    if (S.phase !== 'running') return;
    for (const g of ['B', 'G']) {
      if (!S.rounds[g].length) continue;
      const fin = S.matches[S.rounds[g][S.rounds[g].length - 1][0]];
      if (fin.status !== 'done') return;
      if (hasOwn(S.bronze, g) && S.matches[S.bronze[g]].status !== 'done') return;
    }
    S.phase = 'finished';
    S.finished_at = nowMs();
  }

  function standings(g) {
    const rg = hasOwn(S.rounds, g) ? S.rounds[g] : null;
    if (!pyTruthy(rg)) return [];
    const fin = S.matches[rg[rg.length - 1][0]];
    const out = [];
    if (fin.status === 'done') out.push({ place: 1, id: fin.winner }, { place: 2, id: fin.loser });
    const b = hasOwn(S.bronze, g) ? S.bronze[g] : null;
    if (pyTruthy(b) && S.matches[b].status === 'done') out.push({ place: 3, id: S.matches[b].winner });
    for (const o of out) {
      o.name = pname(o.id);
      o.prize = PRIZES[o.place];
    }
    return out;
  }

  // ---------------- o'yinlar va taxtalar ----------------
  const ACTIVE = st => st === 'pending' || st === 'playing';

  function schedule() {
    if (S.phase !== 'running' || pyTruthy(S.paused)) return;
    const t = nowMs();
    for (const b of S.boards) {
      if (!pyTruthy(b.on)) continue;
      if (pyTruthy(b.game)) {
        const gm = getItem(S.games, b.game);
        if (ACTIVE(gm.status) || t < b.hold_until) continue;
        b.game = null;
      }
      const m = pickMatch();
      if (!m) return;
      startGame(m, b);
    }
  }

  function queueOrder(limit = 12) {
    const reserved = new Set(S.boards.filter(b => pyTruthy(b.replay)).map(b => b.replay));
    let ready = Object.values(S.matches).filter(m => m.status === 'ready' && !reserved.has(m.id));
    const busy = { B: 0, G: 0 };
    for (const b of S.boards) {
      if (pyTruthy(b.game) && ACTIVE(getItem(S.games, b.game).status)) busy[getItem(S.games, b.game).g] += 1;
    }
    const key = m => {
      const isFinal = !pyTruthy(m.bronze) && m.r === S.rounds[m.g].length - 1;
      return [m.games.length ? 0 : 1, m.r, isFinal ? 1 : 0, busy[m.g], m.g === 'G' ? 0 : 1, m.s];
    };
    const out = [];
    while (ready.length && out.length < limit) {
      let best = ready[0], bk = key(best);
      for (let i = 1; i < ready.length; i++) {
        const k = key(ready[i]);
        if (tupleLess(k, bk)) { best = ready[i]; bk = k; }
      }
      out.push(best);
      ready.splice(ready.indexOf(best), 1);
      busy[best.g] += 1;
    }
    return out;
  }

  function pickMatch() {
    const q = queueOrder(1);
    return q.length ? q[0] : null;
  }

  function startGame(m, board, white = null) {
    const n = m.games.length;
    if (white === null || white === undefined) {
      if (n === 0) white = choice(m.p);
      else white = S.games[m.games[m.games.length - 1]].black;    // qayta o'yinda ranglar almashadi
    }
    const black = white === m.p[0] ? m.p[1] : m.p[0];
    const arm = n >= 2;
    const c = S.config;
    const clock = { w: (arm ? c.arm_w : c.tc_min) * 60000, b: (arm ? c.arm_b : c.tc_min) * 60000 };
    S.seq = (hasOwn(S, 'seq') ? S.seq : 0) + 1;
    const gid = `${m.id}-${S.seq}`;                         // har bir o'yin id si yagona (bekor qilinganlar ham)
    S.games[gid] = {
      id: gid, match: m.id, g: m.g, board: board.id, no: n + 1, armageddon: arm,
      white, black, moves: [], fen: START_FEN, last: null,
      clock, inc: arm ? 0 : c.tc_inc * 1000, turn: 'w', turn_at: null,
      status: 'pending', ready: { w: false, b: false }, draw_offer: null,
      result: null, reason: null, created: nowMs(), started: null, ended: null, winner: null
    };
    m.games.push(gid);
    m.status = 'playing';
    board.game = gid;
    board.hold_until = 0;
    S.log.push([nowMs(), `${board.id}-taxta: ${pname(white)} (oq) — ${pname(black)} (qora)`]);
  }

  function begin(gm) {
    gm.status = 'playing';
    gm.started = gm.turn_at = nowMs();
  }

  function remaining(gm, color) {
    let left = gm.clock[color];
    if (gm.status === 'playing' && gm.turn === color && pyTruthy(gm.turn_at)) left -= nowMs() - gm.turn_at;
    return left;
  }

  function loneKing(fen, color) {
    const parts = pySplit(String(fen));
    if (!parts.length) throw new PyErr('IndexError', 'list index out of range');
    const pieces = Array.from(parts[0]).filter(ch => /\p{L}/u.test(ch));
    const mine = pieces.filter(ch => (color === 'w' ? /\p{Uppercase}/u.test(ch) : /\p{Lowercase}/u.test(ch)));
    return mine.length === 1;
  }

  function finish(gm, result, reason) {
    gm.status = 'done';
    gm.result = result;
    gm.reason = reason;
    gm.ended = nowMs();
    gm.draw_offer = null;
    if (pyTruthy(gm.turn_at) && (gm.turn === 'w' || gm.turn === 'b')) {
      gm.clock[gm.turn] = Math.max(0, remaining({ ...gm, status: 'playing' }, gm.turn));
    }
    const m = getItem(S.matches, gm.match);
    let winner = null;
    if (result === '1-0') winner = gm.white;
    else if (result === '0-1') winner = gm.black;
    else if (pyTruthy(gm.armageddon)) winner = gm.black;   // armageddon: durang — qora donalar g'alabasi
    gm.winner = winner;
    for (const b of S.boards) {
      if (b.game === gm.id) b.hold_until = nowMs() + RESULT_HOLD * 1000;
    }
    if (pyTruthy(winner)) {
      setResult(m, winner);
      resolve();
    } else {
      m.status = 'ready';                                  // durang — qayta o'yin (ranglar almashadi), o'sha taxtada
      for (const b of S.boards) {
        if (b.game === gm.id) b.replay = m.id;
      }
    }
  }

  function tick() {
    let dirty = false;
    for (const gm of Object.values(S.games)) {
      if (gm.status === 'playing' && remaining(gm, gm.turn) <= 0) {
        const loser = gm.turn;
        const other = loser === 'w' ? 'b' : 'w';
        if (loneKing(gm.fen, other)) finish(gm, '1/2-1/2', 'material');
        else finish(gm, loser === 'w' ? '0-1' : '1-0', 'time');
        dirty = true;
      }
    }
    const before = S.boards.map(b => b.game);
    const t = nowMs();
    for (const b of S.boards) {                            // durangdan keyin qayta o'yin — o'sha taxtada
      const rid = b.replay;
      if (pyTruthy(rid) && t >= b.hold_until && S.phase === 'running' && !pyTruthy(S.paused)) {
        const m = getItem(S.matches, rid);
        b.replay = null;
        if (m.status === 'ready') {
          startGame(m, b);
          dirty = true;
        }
      }
    }
    schedule();
    const after = S.boards.map(b => b.game);
    if (dirty || before.length !== after.length || before.some((x, i) => x !== after[i])) changed();
  }

  // ---------------- ekranlar uchun ma'lumot ----------------
  const matchTitle = m => (pyTruthy(m.bronze) ? '3-oʻrin uchun' : roundTitle(m.g, m.r));
  const reasonText = r => (typeof r === 'string' && hasOwn(REASONS, r) ? REASONS[r] : (pyTruthy(r) ? r : ''));
  const sinfOf = pid => (typeof pid === 'string' && hasOwn(S.players, pid) && hasOwn(S.players[pid], 'sinf') ? S.players[pid].sinf : '');

  function gameView(gm, withMoves = true) {
    if (!pyTruthy(gm)) return null;
    const m = S.matches[gm.match];
    const v = {};
    for (const k of ['id', 'match', 'g', 'board', 'no', 'armageddon', 'fen', 'last', 'turn', 'status', 'ready',
      'draw_offer', 'result', 'reason', 'winner', 'inc', 'white', 'black']) v[k] = gm[k];
    v.moves = withMoves ? gm.moves : gm.moves.slice(-1);
    v.ply = gm.moves.length;
    v.clock = { w: remaining(gm, 'w'), b: remaining(gm, 'b') };
    v.names = { w: pname(gm.white), b: pname(gm.black) };
    v.sinf = { w: sinfOf(gm.white), b: sinfOf(gm.black) };
    v.round = matchTitle(m);
    v.group = GROUP_NAMES[gm.g];
    v.reason_text = reasonText(gm.reason);
    v.match_winner = m.winner;
    v.match_status = m.status;
    return v;
  }

  function publicState() {
    const matches = {};
    for (const [mid, m] of Object.entries(S.matches)) {
      const o = {};
      for (const k of ['id', 'g', 'r', 's', 'p', 'winner', 'status', 'games', 'bye', 'bronze', 'note']) o[k] = m[k];
      o.title = matchTitle(m);
      matches[mid] = o;
    }
    const games = {};
    for (const [gid, gm] of Object.entries(S.games)) {
      const o = {};
      for (const k of ['id', 'match', 'g', 'board', 'no', 'white', 'black', 'status', 'result', 'reason', 'winner', 'armageddon', 'fen', 'last', 'turn']) o[k] = gm[k];
      games[gid] = o;
    }
    for (const [gid, v] of Object.entries(games)) {
      v.clock = { w: remaining(S.games[gid], 'w'), b: remaining(S.games[gid], 'b') };
      v.plies = S.games[gid].moves.length;
    }
    const boards = [];
    for (const b of S.boards) {
      const gm = pyTruthy(b.game) && typeof b.game === 'string' && hasOwn(S.games, b.game) ? S.games[b.game] : null;
      boards.push({ id: b.id, on: b.on, game: pyTruthy(gm) ? gameView(gm, false) : null });
    }
    return {
      rev: S.rev, now: nowMs(), phase: S.phase, paused: S.paused, config: S.config,
      players: S.players, matches, rounds: S.rounds, bronze: S.bronze, games,
      queue: queueOrder(12).map(m => m.id),
      boards, standings: { B: standings('B'), G: standings('G') }, groups: GROUP_NAMES, prizes: PRIZES,
      drawn_at: S.drawn_at, started_at: S.started_at, finished_at: S.finished_at, log: S.log.slice(-40)
    };
  }

  function boardView(bid) {
    const b = S.boards.find(x => x.id === bid);
    if (!b) return null;
    const gm = pyTruthy(b.game) && typeof b.game === 'string' && hasOwn(S.games, b.game) ? S.games[b.game] : null;
    const upcoming = [];
    for (const m of queueOrder(6)) {
      upcoming.push({ title: matchTitle(m), group: GROUP_NAMES[m.g], a: pname(m.p[0]), b: pname(m.p[1]) });
    }
    return { rev: S.rev, now: nowMs(), phase: S.phase, paused: S.paused, board: bid, on: b.on,
      game: gameView(gm), upcoming: upcoming.slice(0, 6), hold_until: b.hold_until };
  }

  // ---------------- boshqaruv (admin) ----------------
  function resizeBoards(n) {
    n = Math.max(1, Math.min(12, pyInt(n)));
    const cur = S.boards;
    if (n > cur.length) {
      const add = [];
      for (let i = cur.length; i < n; i++) add.push({ id: i + 1, on: true, game: null, hold_until: 0 });
      cur.push(...add);
    } else {
      for (const b of cur.slice(n)) {
        if (pyTruthy(b.game) && ACTIVE(getItem(S.games, b.game).status)) {
          throw VE(`${b.id}-taxtada oʻyin ketmoqda — avval uni yakunlang`);
        }
      }
      cur.splice(n);
    }
    S.config.boards = n;
  }

  function adminAction(act, body) {
    const ph = S.phase;
    if (act === 'players') {
      if (ph !== 'setup' && ph !== 'drawn') throw VE('Turnir boshlangan — roʻyxatni oʻzgartirib boʻlmaydi');
      const lists = {};
      for (const g of ['B', 'G']) {
        const txt = dget(body, g, '');
        if (typeof txt !== 'string') throw new PyErr('AttributeError', `'${pyTypeName(txt)}' object has no attribute 'splitlines'`);
        lists[g] = pySplitlines(txt).filter(x => pyStrip(x)).map(x => ({
          name: pyStrip(x.split('|')[0]), sinf: x.includes('|') ? pyStrip(x.split('|')[1]) : ''
        }));
      }
      S.players = makePlayers(lists);
      S.matches = {}; S.rounds = { B: [], G: [] }; S.bronze = {}; S.games = {};
      S.phase = 'setup';
      return 'Roʻyxat saqlandi';
    }
    if (act === 'config') {
      const c = S.config;
      for (const k of ['tc_min', 'tc_inc', 'arm_w', 'arm_b']) {
        if (pyIn(k, body)) c[k] = Math.max(0, Math.min(90, pyInt(bodyItem(body, k))));
      }
      if (pyIn('boards', body)) resizeBoards(bodyItem(body, 'boards'));
      return 'Sozlamalar saqlandi';
    }
    if (act === 'draw') {
      if (ph !== 'setup' && ph !== 'drawn') throw VE('Turnir boshlangan — qayta qur’a tashlab boʻlmaydi');
      S.matches = {}; S.rounds = { B: [], G: [] }; S.bronze = {}; S.games = {};
      for (const g of ['B', 'G']) buildBracket(g);
      S.phase = 'drawn';
      S.drawn_at = nowMs();
      resolve();
      return 'Qur’a tashlandi';
    }
    if (act === 'start') {
      if (ph !== 'drawn') throw VE('Avval qur’a tashlang');
      S.phase = 'running';
      S.started_at = nowMs();
      resolve();
      schedule();
      return 'Turnir boshlandi';
    }
    if (act === 'pause') {
      S.paused = pyTruthy(dget(body, 'on'));
      return S.paused ? 'Pauza' : 'Davom etmoqda';
    }
    if (act === 'board') {
      let b = null;
      for (const x of S.boards) {
        if (x.id === pyInt(bodyItem(body, 'id'))) { b = x; break; }
      }
      if (!b) throw new PyErr('StopIteration', '');
      b.on = pyTruthy(dget(body, 'on'));
      return `${b.id}-taxta ${b.on ? 'yoqildi' : 'oʻchirildi'}`;
    }
    if (act === 'force_start') {
      const gm = getItem(S.games, bodyItem(body, 'game'));
      if (gm.status === 'pending') begin(gm);
      return 'Oʻyin boshlandi';
    }
    if (act === 'abort') {                                 // o'yinni bekor qilish — juftlik qaytadan o'ynaydi
      const gm = getItem(S.games, bodyItem(body, 'game'));
      if (!ACTIVE(gm.status)) throw VE('Bu oʻyin allaqachon tugagan');
      gm.status = 'aborted';
      gm.ended = nowMs();
      const m = getItem(S.matches, gm.match);
      const i = m.games.indexOf(gm.id);
      if (i < 0) throw VE('list.remove(x): x not in list');
      m.games.splice(i, 1);
      m.status = 'ready';
      for (const b of S.boards) {
        if (b.game === gm.id) b.game = null;
      }
      return 'Oʻyin bekor qilindi — juftlik qayta oʻynaydi';
    }
    if (act === 'winner') {                                // hakam qarori (kelmadi, texnik nosozlik va h.k.)
      const m = getItem(S.matches, bodyItem(body, 'match'));
      const w = bodyItem(body, 'player');
      if (!m.p.includes(w)) throw VE('Bu oʻquvchi juftlikda yoʻq');
      if (m.status === 'done') throw VE('Juftlik natijasi allaqachon bor');
      for (const gid of m.games) {
        const gm = getItem(S.games, gid);
        if (ACTIVE(gm.status)) {
          gm.status = 'done';
          gm.result = gm.white === w ? '1-0' : '0-1';
          gm.reason = 'admin';
          gm.winner = w;
          gm.ended = nowMs();
          for (const b of S.boards) {
            if (b.game === gid) b.hold_until = nowMs() + RESULT_HOLD * 1000;
          }
        }
      }
      setResult(m, w, 'hakam qarori');
      resolve();
      return `Gʻolib: ${pname(w)}`;
    }
    if (act === 'reset') {
      if (dget(body, 'confirm') !== 'TOZALASH') throw VE('Tasdiqlash soʻzi notoʻgʻri');
      const keepP = S.players, keepC = S.config;               // (fayl zaxirasi brauzer versiyasida yoʻq)
      S = newState();
      S.players = keepP;
      S.config = keepC;
      S.boards = Array.from({ length: pyInt(S.config.boards) }, (_, i) => ({ id: i + 1, on: true, game: null, hold_until: 0 }));
      return 'Turnir tozalandi (zaxira nusxa saqlandi)';
    }
    throw VE('Nomaʼlum buyruq');
  }

  // ---------------- o'yinchi harakatlari ----------------
  function playerAction(gid, act, body) {
    const gm = hasOwn(S.games, gid) ? S.games[gid] : null;
    if (!pyTruthy(gm)) throw VE('Oʻyin topilmadi');
    const color = dget(body, 'color');
    if (color !== 'w' && color !== 'b') throw VE('Rang notoʻgʻri');
    if (act === 'ready') {
      if (gm.status === 'pending') {
        gm.ready[color] = true;
        if (pyTruthy(gm.ready.w) && pyTruthy(gm.ready.b)) begin(gm);
      }
      return;
    }
    if (gm.status !== 'playing') throw VE('Oʻyin davom etmayapti');
    if (act === 'move') {
      if (gm.turn !== color) throw VE('Hozir sizning navbatingiz emas');
      if (pyInt(dget(body, 'ply', -1)) !== gm.moves.length) throw VE('Yurish tartibi mos emas — sahifa yangilanadi');
      const left = remaining(gm, color);
      if (left <= 0) {
        tick();
        throw VE('Vaqt tugagan');
      }
      const san = cpSlice(pyStr(bodyItem(body, 'san')), 12), fen = cpSlice(pyStr(bodyItem(body, 'fen')), 100);
      gm.clock[color] = left + gm.inc;
      gm.moves.push(san);
      gm.fen = fen;
      gm.last = [cpSlice(pyStr(dget(body, 'from', '')), 2), cpSlice(pyStr(dget(body, 'to', '')), 2)];
      gm.turn = color === 'w' ? 'b' : 'w';
      gm.turn_at = nowMs();
      if (pyTruthy(gm.draw_offer) && gm.draw_offer !== color) gm.draw_offer = null;   // raqib taklifiga javoban yurish — rad etilgan
      const over = dget(body, 'over');
      if (pyTruthy(over)) {
        const res = dget(over, 'result'), why = dget(over, 'reason');
        if (['1-0', '0-1', '1/2-1/2'].includes(res) && dictHas(REASONS, why)) finish(gm, res, why);
      }
      return;
    }
    if (act === 'resign') {
      finish(gm, color === 'w' ? '0-1' : '1-0', 'resign');
      return;
    }
    if (act === 'draw') {
      const a = dget(body, 'action');
      const other = color === 'w' ? 'b' : 'w';
      if (a === 'offer') gm.draw_offer = color;
      else if (a === 'accept' && gm.draw_offer === other) finish(gm, '1/2-1/2', 'agreement');
      else if (a === 'decline' && gm.draw_offer === other) gm.draw_offer = null;
      return;
    }
    throw VE('Nomaʼlum harakat');
  }

  // ---------------- natijalar (CSV) ----------------
  function csvField(v) {
    const s = v === null || v === undefined ? '' : typeof v === 'number' ? (Number.isInteger(v) ? String(v) : pyFloatRepr(v)) : String(v);
    return /[,"\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function csvRow(fields) {
    if (fields.length === 1 && csvField(fields[0]) === '') return '""\r\n';
    return fields.map(csvField).join(',') + '\r\n';
  }

  function exportCsv() {
    let out = csvRow(['Guruh', 'Bosqich', 'Taxta', 'Oq', 'Qora', 'Natija', 'Sabab', 'Yurishlar']);
    const games = Object.values(S.games).slice().sort((a, b) => a.created - b.created);
    for (const gm of games) {
      if (gm.status === 'aborted') continue;
      const m = getItem(S.matches, gm.match);
      out += csvRow([GROUP_NAMES[gm.g], matchTitle(m), gm.board, pname(gm.white), pname(gm.black),
        pyTruthy(gm.result) ? gm.result : '', typeof gm.reason === 'string' && hasOwn(REASONS, gm.reason) ? REASONS[gm.reason] : '', gm.moves.join(' ')]);
    }
    out += '\r\n';                                          // writerow([])
    for (const g of ['B', 'G']) {
      for (const s of standings(g)) {
        const prize = String(s.prize).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        out += csvRow([GROUP_NAMES[g], `${s.place}-oʻrin`, '', s.name, '', `${prize} soʻm`]);
      }
    }
    return '﻿' + out;
  }

  // ---------------- HTTP (do_GET / do_POST) ----------------
  const JSON_CT = 'application/json; charset=utf-8';
  const json = (obj, status = 200) => ({ status, contentType: JSON_CT, headers: { 'Cache-Control': 'no-store' }, body: clone(obj) });
  function header(headers, name) {
    if (!headers) return null;
    const want = name.toLowerCase();
    if (typeof headers.get === 'function' && typeof headers.has === 'function') return headers.has(name) ? headers.get(name) : null;
    for (const k of Object.keys(headers)) {
      if (k.toLowerCase() === want) {
        const v = headers[k];
        return Array.isArray(v) ? v[0] : v;
      }
    }
    return null;
  }

  function waitRev(q) {
    let rev;
    try {
      rev = pyInt(hasOwn(q, 'rev') ? q.rev[0] : '0');
    } catch (e) {
      if (e instanceof PyErr && e.pyType === 'ValueError') rev = 0;
      else throw e;
    }
    if (rev && rev === S.rev && !stopped) {
      return new Promise(res => {
        const w = { res };
        w.t = setTimeout(() => { waiters.delete(w); res(); }, longPollMs);
        waiters.add(w);
      });
    }
    return null;
  }

  async function handle(method, url, body, headers) {
    const u = urlparse(String(url));
    if (method === 'GET') {
      const q = parseQs(u.query);
      const p = rstripSlash(u.path) || '/';
      if (p === '/api/state') {
        const w = waitRev(q);
        if (w) await w;
        return json(publicState());
      }
      const mt = RE_TAXTA.exec(p);
      if (mt) {
        const w = waitRev(q);
        if (w) await w;
        const v = boardView(pyInt(mt[1]));
        return json(v || { error: 'Taxta topilmadi' }, v ? 200 : 404);
      }
      if (p === '/api/natijalar.csv') {
        return { status: 200, contentType: 'text/csv; charset=utf-8',
          headers: { 'Content-Disposition': 'attachment; filename="shaxmat-natijalar.csv"' }, body: exportCsv() };
      }
      if (p === '/api/admin/check') {
        const ok = header(headers, 'X-Pin') === PIN;
        return json({ ok, lan: ok ? lan.slice() : [] });
      }
      return json({ error: 'Topilmadi' }, 404);             // statik fayllar — harness / brauzer qobigʻi ishi
    }
    if (method === 'POST') {
      const p = rstripSlash(u.path);
      if (body === undefined) body = {};
      const ma = RE_ADMIN.exec(p);
      if (ma) {
        if (header(headers, 'X-Pin') !== PIN) return json({ error: 'PIN notoʻgʻri' }, 403);
        let msg;
        try {
          msg = adminAction(ma[1], body);
        } catch (e) {
          if (e instanceof PyErr && ['ValueError', 'KeyError', 'StopIteration'].includes(e.pyType)) return json({ error: e.message || 'Xato' }, 400);
          throw e;
        }
        changed(msg);
        return json({ ok: true, message: msg });
      }
      const mg = RE_GAME.exec(p);
      if (mg) {
        try {
          playerAction(mg[1], mg[2], body);
        } catch (e) {
          if (e instanceof PyErr && ['ValueError', 'KeyError'].includes(e.pyType)) return json({ error: e.message || 'Xato' }, 409);
          throw e;
        }
        changed();
        tick();
        return json({ ok: true });
      }
      return json({ error: 'Topilmadi' }, 404);
    }
    return { status: 501, contentType: 'text/html;charset=utf-8', headers: {},
      body: ERROR_PAGE(501, `Unsupported method (${pyStrRepr(String(method))})`, 'Server does not support this operation') };
  }

  async function request(method, url, body, headers = {}) {
    try {
      return await handle(String(method || 'GET').toUpperCase(), url, body, headers);
    } catch (e) {
      // Python da bu holatda (TypeError, AttributeError ...) ulanish javobsiz uziladi
      console.error('server xatosi:', e && e.pyType ? `${e.pyType}: ${e.message}` : e);
      return { status: 500, contentType: JSON_CT, headers: {}, body: { error: 'Server xatosi' }, crash: true, crashType: (e && (e.pyType || e.name)) || 'Error' };
    }
  }

  // ---------------- ishga tushirish (load) ----------------
  if (initialState !== null && initialState !== undefined) {
    S = typeof initialState === 'string' ? JSON.parse(initialState) : clone(initialState);
  } else {
    S = newState();
    save();
  }

  function safeTick() {
    try { tick(); } catch (e) { console.error('tick xatosi:', e && e.pyType ? `${e.pyType}: ${e.message}` : e); }   // ticker hech qachon to'xtamasin
  }
  if (autoTick) timer = setInterval(safeTick, tickMs);

  return {
    request,
    tick: safeTick,
    rev: () => S.rev,
    exportState: () => JSON.stringify(S),
    stop() {
      stopped = true;
      if (timer) { clearInterval(timer); timer = null; }
      notify();
    }
  };
}
