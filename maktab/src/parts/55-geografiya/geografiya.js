/* Geografiya: O’zbekiston xaritasi → konturlar chiziladi → maktabdan to’lqin tarqalib hududlar bo’yaladi →
   kamera o’quvchilar keladigan hududlarga yaqinlashadi → har bir hududdan maktabga nur oqadi, chiziqcha (leader line)
   bilan ulangan nom yorlig’i chiqadi. window.muGeoData (gen-hudud.mjs) — barcha o’quv yillari JAMLANGAN:
   rang va nur qalinligi o’quvchilar soniga qarab (raqamsiz, «kam/ko’p» so’zlarisiz). */
MU.part('geografiya', {
  init(root) {
    const { gsap } = MU;
    const data = window.muUzMap; if (!data) return;
    const GEO = window.muGeoData && window.muGeoData.order ? window.muGeoData : null;
    const NS = 'http://www.w3.org/2000/svg';
    const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
    const COLORS = { fergana: '#dc2626', namangan: '#2563eb', andijan: '#7c3aed', 'tashkent-region': '#0891b2', 'tashkent-city': '#ea580c', jizzakh: '#16a34a' };
    const FACT = ['fergana', 'namangan', 'andijan', 'tashkent-region', 'tashkent-city', 'jizzakh'];
    /* issiqlik shkalasi: yashil → sariq → to’q sariq → qizil */
    const HEAT = [[0, [34, 197, 94]], [0.35, [234, 179, 8]], [0.65, [249, 115, 22]], [1, [220, 38, 38]]];
    const heat = t => {
      let i = 0; while (i < HEAT.length - 2 && t > HEAT[i + 1][0]) i++;
      const [a, ca] = HEAT[i], [b, cb] = HEAT[i + 1], k = Math.min(1, Math.max(0, (t - a) / (b - a)));
      return `rgb(${ca.map((v, j) => Math.round(v + (cb[j] - v) * k)).join(',')})`;
    };

    const host = root.querySelector('.gg-map__svg');
    const svg = el('svg', { viewBox: data.viewBox, preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' }, host);
    const defs = el('defs', {}, svg);
    const gR = el('g', {}, svg), gO = el('g', {}, svg), gW = el('g', { class: 'gg-wave' }, svg), gB = el('g', { class: 'gg-beams' }, svg), gL = el('g', { class: 'gg-labels' }, svg), gT = el('g', {}, svg);
    const byId = {}, nameOf = {};
    data.regions.forEach(r => {
      const p = el('path', { d: r.d, class: 'gg-r' + (r.id === 'aral-sea' ? ' gg-r--sea' : ''), 'data-id': r.id }, gR);
      el('title', {}, p).textContent = r.name;
      if (r.id !== 'aral-sea') el('path', { d: r.d, class: 'gg-outline' }, gO);
      byId[r.id] = p; nameOf[r.id] = r.name;
    });

    const ids = (GEO ? GEO.order : FACT).filter(id => byId[id]);
    const tOf = id => (GEO ? ((GEO.level[id] || 1) - 1) / 9 : 1);
    const colorOf = id => (GEO ? heat(tOf(id)) : COLORS[id] || '#3b5bdb');

    /* hududning «ichki markazi»: bbox to’rida chegaradan eng uzoq nuqta (bbox markazi Toshkent vil. kabi shakllarda tashqarida qoladi) */
    const inner = {};
    const pt = svg.createSVGPoint ? svg.createSVGPoint() : null;
    const interior = id => {
      if (inner[id]) return inner[id];
      const p = byId[id], b = p.getBBox(), L = p.getTotalLength(), edge = [];
      for (let i = 0; i < 160; i++) { const q = p.getPointAtLength((i / 160) * L); edge.push([q.x, q.y]); }
      let best = [b.x + b.width / 2, b.y + b.height / 2], bestD = -1;
      for (let gx = 1; gx < 14; gx++) for (let gy = 1; gy < 14; gy++) {
        const x = b.x + (b.width * gx) / 14, y = b.y + (b.height * gy) / 14;
        if (pt) { pt.x = x; pt.y = y; if (!p.isPointInFill(pt)) continue; }
        let d = 1e9; for (const [ex, ey] of edge) d = Math.min(d, (ex - x) ** 2 + (ey - y) ** 2);
        if (d > bestD) { bestD = d; best = [x, y]; }
      }
      return (inner[id] = best);
    };
    const fb = byId.fergana.getBBox();
    const school = [fb.x + fb.width * 0.2, fb.y + fb.height * 0.32];

    /* legend (nomlar, o’quvchilar soni bo’yicha tartibda) + rang shkalasi + manba yillari */
    const legUl = root.querySelector('.gg-legend');
    legUl.textContent = '';
    ids.forEach(id => {
      const li = document.createElement('li'); li.dataset.id = id;
      const i = document.createElement('i'); i.style.background = colorOf(id); li.appendChild(i);
      li.appendChild(document.createTextNode(nameOf[id]));
      legUl.appendChild(li);
    });
    if (GEO) {
      const sc = root.querySelector('.gg-scale'); sc.hidden = false;
      sc.querySelector('.gg-scale__bar').style.background = `linear-gradient(90deg, ${HEAT.map(([t]) => heat(t) + ' ' + t * 100 + '%').join(', ')})`;
      const ys = root.querySelector('.gg-src__years');
      if (ys && GEO.years && GEO.years.length) ys.textContent = GEO.years.join(', ') + ' o’quv yillari';
    }

    /* hududlar rangi: to’lqin maktabdan tarqaladi — yaqin hudud oldin bo’yaladi */
    const dist = id => Math.hypot(interior(id)[0] - school[0], interior(id)[1] - school[1]);
    const byDist = ids.slice().sort((a, b) => dist(a) - dist(b));
    const light = (id, on) => {
      const p = byId[id]; p.classList.toggle('is-lit', on);
      p.style.setProperty('--c', on ? colorOf(id) : '');
      p.style.setProperty('--o', on ? (0.4 + 0.45 * tOf(id)).toFixed(2) : '');
    };

    /* kamera: ko’rsatilgan hududlar + yorliqlar uchun chetlarda joy */
    const full = data.viewBox.split(' ').map(Number);
    let zoom = full, u = 1, labels = [], beams = [];
    const computeZoom = () => {
      const W = host.clientWidth || 800, H = host.clientHeight || W / 2, ar = W / H, small = W < 560;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      ids.concat('fergana').forEach(id => { const b = byId[id].getBBox(); x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height); });
      const sx = small ? 46 : 150, sy = small ? 22 : 36; /* ekran px */
      let zw = (x1 - x0) / Math.max(0.3, 1 - (2 * sx) / W), zh = (y1 - y0) / Math.max(0.3, 1 - (2 * sy) / H);
      if (zw / zh < ar) zw = zh * ar; else zh = zw / ar;
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      zoom = [cx - zw / 2, cy - zh / 2, zw, zh];
      u = zw / W;
    };

    /* yorliqlar: hudud nuqtasidan tashqariga qisqa chiziqcha → tirsak → nom (hudud yonida, xarita chetida emas).
       Yo’nalish — hudud atrofidagi bo’sh joy tomonga (qo’shni rangli hududlar ustidan o’tmasin). */
    const DIR = { fergana: [0.25, 1], andijan: [1, 0.15], namangan: [0.1, -1], 'tashkent-region': [-0.45, -1, 2], 'tashkent-city': [-1, -0.05], jizzakh: [-1, -0.2],
      qashqadaryo: [-1, 0.35], sirdaryo: [-1, -0.35], samarqand: [-1, 0.25], navoiy: [-1, 0], bukhara: [-1, 0.1], surxondaryo: [0.6, 1], xorazm: [-1, 0], karakalpakstan: [-1, -0.2] };
    const dirOf = id => {
      let d = DIR[id]; if (!d) { const c = interior(id); d = [c[0] - school[0], c[1] - school[1]]; }
      const n = Math.hypot(d[0], d[1]) || 1; return [d[0] / n, d[1] / n, d[2] || 1];
    };
    const buildLabels = () => {
      gL.textContent = ''; labels = [];
      const [zx, zy, zw, zh] = zoom, small = zw / u < 560;
      const fs = (small ? 11.5 : 15) * u, R = (small ? 20 : 32) * u, tail = (small ? 9 : 14) * u, gapT = 5 * u, m = 8 * u;
      const items = ids.map(id => {
        const c = interior(id), [dx, dy, k] = dirOf(id), sx = dx < -0.05 ? -1 : 1;
        const g = el('g', { class: 'gg-tag', 'data-id': id, style: `--c:${colorOf(id)}` }, gL);
        const t = el('text', { 'text-anchor': sx < 0 ? 'end' : 'start', 'font-size': fs.toFixed(2), class: 'gg-tag__name', 'stroke-width': (4 * u).toFixed(2) }, g);
        t.textContent = nameOf[id];
        let tw = 0; try { tw = t.getComputedTextLength(); } catch (e) { tw = 0; } if (!tw) tw = nameOf[id].length * fs * 0.56;
        return { id, g, t, c, sx, tw, ex: c[0] + dx * R * k, ey: c[1] + dy * R * k };
      });
      /* matn qutisi */
      const box = o => { const tx = o.ex + o.sx * (tail + gapT); return o.sx > 0 ? [tx, o.ey - fs * 0.62, tx + o.tw, o.ey + fs * 0.62] : [tx - o.tw, o.ey - fs * 0.62, tx, o.ey + fs * 0.62]; };
      const clamp = o => {
        const b = box(o);
        if (b[0] < zx + m) o.ex += zx + m - b[0]; else if (b[2] > zx + zw - m) o.ex -= b[2] - (zx + zw - m);
        o.ey = Math.min(Math.max(o.ey, zy + fs), zy + zh - fs * 0.8);
      };
      items.forEach(clamp);
      /* «Uchko’prik» yozuvi (maktab nuqtasi ostida) — qo’zg’almas to’siq */
      const sw = (schLbl.textContent.length * 15 * 0.62 * u) / 2, sy = school[1] + 26 * u;
      const fixed = [[school[0] - sw, sy - 15 * u, school[0] + sw, sy + 5 * u], [school[0] - 9 * u, school[1] - 9 * u, school[0] + 9 * u, school[1] + 9 * u]];
      /* bir-birini bosib qolmasin: vertikal itarish */
      for (let it = 0; it < 40; it++) {
        let moved = false;
        items.forEach(o => fixed.forEach(F => {
          const A = box(o);
          if (A[0] < F[2] + 3 * u && F[0] < A[2] + 3 * u && A[1] < F[3] + 2 * u && F[1] < A[3] + 2 * u) {
            o.ey += (A[1] + A[3]) / 2 >= (F[1] + F[3]) / 2 ? F[3] + 2 * u - A[1] : F[1] - 2 * u - A[3]; moved = true;
          }
        }));
        for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
          const A = box(items[i]), B = box(items[j]);
          if (A[0] < B[2] + 4 * u && B[0] < A[2] + 4 * u && A[1] < B[3] && B[1] < A[3]) {
            const push = (Math.min(A[3], B[3]) - Math.max(A[1], B[1])) / 2 + 1.5 * u, up = items[i].ey <= items[j].ey ? -1 : 1;
            items[i].ey += up * push; items[j].ey -= up * push; moved = true;
          }
        }
        items.forEach(clamp);
        if (!moved) break;
      }
      items.forEach(o => {
        const tx = o.ex + o.sx * (tail + gapT), tailX = o.ex + o.sx * tail;
        o.t.setAttribute('x', tx.toFixed(1)); o.t.setAttribute('y', (o.ey + fs * 0.34).toFixed(1));
        const line = el('polyline', { points: `${o.c[0].toFixed(1)},${o.c[1].toFixed(1)} ${o.ex.toFixed(1)},${o.ey.toFixed(1)} ${tailX.toFixed(1)},${o.ey.toFixed(1)}`, class: 'gg-tag__line', 'stroke-width': (1.6 * u).toFixed(2) }, o.g);
        o.g.insertBefore(line, o.t);
        const dot = el('circle', { cx: o.c[0].toFixed(1), cy: o.c[1].toFixed(1), r: (4.2 * u).toFixed(2), class: 'gg-tag__dot', 'stroke-width': (2 * u).toFixed(2) }, o.g);
        labels.push({ g: o.g, line, t: o.t, dot, id: o.id });
      });
    };

    /* nurlar: hududdan maktabga; qalinligi va oqimdagi tomchilar soni — o’quvchilar soniga qarab */
    const buildBeams = () => {
      gB.textContent = ''; defs.textContent = ''; beams = [];
      ids.filter(id => id !== 'fergana').forEach((id, n) => {
        const t = tOf(id), [x, y] = interior(id), mx = (x + school[0]) / 2, my = Math.min(y, school[1]) - 40 * u - Math.abs(x - school[0]) * 0.12;
        const d = `M${x.toFixed(1)} ${y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${school[0].toFixed(1)} ${school[1].toFixed(1)}`;
        const gid = 'gg-bg-' + n;
        const lg = el('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse', x1: x.toFixed(1), y1: y.toFixed(1), x2: school[0].toFixed(1), y2: school[1].toFixed(1) }, defs);
        el('stop', { offset: '0', 'stop-color': colorOf(id), 'stop-opacity': '.45' }, lg);
        el('stop', { offset: '1', 'stop-color': '#dc2626' }, lg);
        const g = el('g', { class: 'gg-beam-g', 'data-id': id }, gB);
        const base = el('path', { d, class: 'gg-beam-base', 'stroke-width': ((1 + 1.8 * t) * u).toFixed(2) }, g);
        const b = el('path', { d, class: 'gg-beam', stroke: `url(#${gid})`, 'stroke-width': ((1.8 + 2.6 * t) * u).toFixed(2) }, g);
        const L = b.getTotalLength(), k = 1 + Math.round(t * 3), per = L / k, seg = Math.max(7 * u, per * 0.32);
        b.style.strokeDasharray = `${seg.toFixed(1)} ${(per - seg).toFixed(1)}`;
        beams.push({ g, b, base, L, per, id });
      });
    };
    const sch = el('g', { class: 'gg-school' }, gT);
    const pulse = el('circle', { cx: school[0], cy: school[1], r: 9 }, sch);
    const dot = el('circle', { cx: school[0], cy: school[1], r: 6, 'stroke-width': 3 }, sch);
    const schLbl = el('text', { x: school[0], y: school[1], class: 'gg-lbl', 'text-anchor': 'middle' }, gT);
    schLbl.textContent = 'Uchko’prik';
    const sizeSchool = () => {
      dot.setAttribute('r', (6 * u).toFixed(2)); dot.setAttribute('stroke-width', (3 * u).toFixed(2));
      schLbl.setAttribute('y', (school[1] + 26 * u).toFixed(1)); schLbl.setAttribute('font-size', (15 * u).toFixed(2)); schLbl.setAttribute('stroke-width', (4 * u).toFixed(2));
    };

    const layout = () => { computeZoom(); buildBeams(); buildLabels(); sizeSchool(); };

    /* legend ↔ xarita ↔ yorliq ↔ nur */
    const hot = (id, on) => {
      if (byId[id]) byId[id].classList.toggle('is-hot', on);
      svg.classList.toggle('has-hot', on);
      legUl.querySelectorAll('li').forEach(li => li.classList.toggle('is-hot', on && li.dataset.id === id));
      labels.forEach(l => l.g.classList.toggle('is-hot', on && l.id === id));
      beams.forEach(bm => bm.g.classList.toggle('is-hot', on && bm.id === id));
    };
    const hotFrom = (e, on) => { const t = e.target.closest('[data-id]'); if (t && ids.includes(t.dataset.id)) hot(t.dataset.id, on); };
    legUl.addEventListener('pointerover', e => hotFrom(e, true));
    legUl.addEventListener('pointerout', e => hotFrom(e, false));
    gR.addEventListener('pointerover', e => hotFrom(e, true));
    gR.addEventListener('pointerout', e => hotFrom(e, false));

    layout();
    let done = false;
    const setVB = () => svg.setAttribute('viewBox', zoom.map(v => v.toFixed(1)).join(' '));
    /* boshlang’ich kadr: butun xarita host nisbatida */
    const W0 = host.clientWidth || 800, H0 = host.clientHeight || 400, ar0 = W0 / H0;
    let fw = full[2], fh = full[3]; if (fw / fh < ar0) fw = fh * ar0; else fh = fw / ar0;
    svg.setAttribute('viewBox', [full[0] + full[2] / 2 - fw / 2, full[1] + full[3] / 2 - fh / 2, fw, fh].map(v => v.toFixed(1)).join(' '));

    /* doimiy hayot: nurlar oqadi, maktab pulsi — faqat ekranda */
    const life = gsap.timeline({ repeat: -1, paused: true });
    const startLife = () => {
      life.clear();
      beams.forEach(({ b, per }) => life.fromTo(b, { strokeDashoffset: per }, { strokeDashoffset: 0, duration: 1.5, ease: 'none', repeat: -1 }, 0));
      life.fromTo(pulse, { attr: { r: 9 * u }, opacity: 0.9 }, { attr: { r: 30 * u }, opacity: 0, duration: 1.6, ease: 'power2.out', repeat: -1 }, 0);
    };
    let rw = W0;
    window.addEventListener('resize', () => { const w = host.clientWidth; if (Math.abs(w - rw) < 40) return; rw = w; layout(); if (done) { setVB(); startLife(); } });

    if (MU.reduced) { done = true; ids.forEach(id => light(id, true)); setVB(); return; }

    gsap.set([gB, gT, gL], { autoAlpha: 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: host, start: 'top 75%', once: true }, onComplete: () => { done = true; } });
    /* 1) konturlar */
    tl.from(gO.children, { drawSVG: '0%', duration: 1.3, stagger: 0.03, ease: 'power2.inOut' });
    /* 2) maktabdan to’lqin — hudud to’lqin yetib kelgan lahzada bo’yaladi */
    const R = Math.max(full[2], full[3]) * 0.9, W1 = 1.1, WD = 2.2;
    [0, 0.3, 0.6].forEach((dl, i) => {
      const w = el('circle', { cx: school[0], cy: school[1], r: 1, class: 'gg-wave__ring' + (i ? ' gg-wave__ring--echo' : '') }, gW);
      tl.fromTo(w, { attr: { r: 2 }, opacity: i ? 0.35 : 0.8 }, { attr: { r: R }, opacity: 0, duration: WD, ease: 'none' }, W1 + dl);
    });
    byDist.forEach(id => tl.call(() => light(id, true), null, W1 + (dist(id) / R) * WD));
    /* 3) kamera */
    tl.add(() => gsap.to(svg, { attr: { viewBox: zoom.map(v => v.toFixed(1)).join(' ') }, duration: 1.6, ease: 'mu.inOut' }), 2.1);
    /* 4) maktab va nurlar */
    tl.to(gT, { autoAlpha: 1, duration: 0.5 }, 3.4)
      .from(dot, { attr: { r: 0 }, duration: 0.7, ease: 'back.out(3)' }, 3.4)
      .set(gB, { autoAlpha: 1 }, 3.5)
      .add(() => beams.forEach((bm, i) => {
        gsap.from(bm.base, { drawSVG: '0%', duration: 0.9, delay: i * 0.1, ease: 'power2.out' });
        gsap.from(bm.b, { opacity: 0, duration: 0.5, delay: 0.6 + i * 0.1 });
      }), 3.5)
      /* 5) yorliqlar */
      .set(gL, { autoAlpha: 1 }, 3.8)
      .add(() => labels.forEach((l, i) => {
        gsap.from(l.dot, { attr: { r: 0 }, duration: 0.45, delay: i * 0.1, ease: 'back.out(3)' });
        gsap.from(l.line, { drawSVG: '0%', duration: 0.8, delay: 0.1 + i * 0.1, ease: 'power2.inOut' });
        gsap.from(l.t, { autoAlpha: 0, x: l.t.getAttribute('text-anchor') === 'start' ? -8 * u : 8 * u, duration: 0.5, delay: 0.5 + i * 0.1, ease: 'power2.out' });
      }), 3.8)
      .call(() => { gW.textContent = ''; startLife(); MU.onVisible(root, v => (v ? life.play() : life.pause())); }, null, 4.8);
  }
});
