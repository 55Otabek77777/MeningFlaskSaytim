/* Geografiya: O’zbekiston xaritasi → sharqiy viloyatlarga zoom → har bir hududga chiziqcha (leader line) bilan
   ulangan rangli yorliq, hududlardan maktabga nurlar. window.muGeoData bo’lsa (gen-hudud.mjs) — hududlar
   «kam / o’rta / ko’p / juda ko’p» darajasida bo’yaladi (raqam ko’rsatilmaydi), yillar almashtiriladi. */
MU.part('geografiya', {
  init(root) {
    const { gsap } = MU;
    const data = window.muUzMap; if (!data) return;
    const GEO = window.muGeoData || null;
    const NS = 'http://www.w3.org/2000/svg';
    const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
    const COLORS = { fergana: '#dc2626', namangan: '#2563eb', andijan: '#7c3aed', 'tashkent-region': '#0891b2', 'tashkent-city': '#ea580c', jizzakh: '#16a34a',
      bukhara: '#0d9488', samarqand: '#9333ea', sirdaryo: '#65a30d', navoiy: '#c2410c', qashqadaryo: '#be185d', surxondaryo: '#4f46e5', xorazm: '#0369a1', karakalpakstan: '#a16207' };
    const TIER = [null, { n: 'kam', c: '#22c55e' }, { n: 'o’rta', c: '#eab308' }, { n: 'ko’p', c: '#f97316' }, { n: 'juda ko’p', c: '#dc2626' }];
    const FACT = ['fergana', 'namangan', 'andijan', 'tashkent-region', 'tashkent-city', 'jizzakh'];

    const host = root.querySelector('.gg-map__svg');
    const svg = el('svg', { viewBox: data.viewBox, preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' }, host);
    const defs = el('defs', {}, svg);
    const grad = el('linearGradient', { id: 'gg-grad', x1: '0', y1: '0', x2: '1', y2: '0' }, defs);
    el('stop', { offset: '0', 'stop-color': '#3b5bdb', 'stop-opacity': '0' }, grad);
    el('stop', { offset: '.5', 'stop-color': '#3b5bdb' }, grad);
    el('stop', { offset: '1', 'stop-color': '#dc2626' }, grad);
    const gR = el('g', {}, svg), gO = el('g', {}, svg), gB = el('g', {}, svg), gL = el('g', { class: 'gg-labels' }, svg), gT = el('g', {}, svg);
    const byId = {}, nameOf = {};
    data.regions.forEach(r => {
      const p = el('path', { d: r.d, class: 'gg-r' + (r.id === 'aral-sea' ? ' gg-r--sea' : '') }, gR);
      el('title', {}, p).textContent = r.name;
      if (r.id !== 'aral-sea') el('path', { d: r.d, class: 'gg-outline' }, gO);
      byId[r.id] = p; nameOf[r.id] = r.name;
    });

    /* hududning «ichki markazi»: bbox to’rida chegaradan eng uzoq nuqta (bbox markazi Toshkent vil. kabi shakllarda tashqarida qoladi) */
    const inner = {};
    const interior = id => {
      if (inner[id]) return inner[id];
      const p = byId[id], b = p.getBBox(), L = p.getTotalLength(), edge = [];
      for (let i = 0; i < 160; i++) { const q = p.getPointAtLength((i / 160) * L); edge.push([q.x, q.y]); }
      let best = [b.x + b.width / 2, b.y + b.height / 2], bestD = -1;
      const pt = svg.createSVGPoint ? svg.createSVGPoint() : null;
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

    /* holat */
    let year = GEO ? GEO.latest : null;
    const shown = () => (GEO && GEO.years[year] ? Object.keys(GEO.years[year].viloyat).filter(id => byId[id]) : FACT);
    const tierOf = id => (GEO && GEO.years[year] ? GEO.years[year].viloyat[id] || 0 : 0);
    const colorOf = id => (GEO ? (TIER[tierOf(id)] || {}).c || '#dde6f6' : COLORS[id] || '#3b5bdb');

    let painted = false;
    const paint = () => {
      const ids = painted ? shown() : [];
      Object.keys(byId).forEach(id => {
        if (id === 'aral-sea') return;
        const on = ids.includes(id);
        byId[id].classList.toggle('is-lit', on);
        byId[id].style.setProperty('--c', on ? colorOf(id) : '');
      });
      /* legend: shu yilda ko’rsatilgan hududlar (darajasi bilan) */
      const ul = root.querySelector('.gg-legend');
      ul.textContent = '';
      shown().slice().sort((a, b) => tierOf(b) - tierOf(a)).forEach(id => {
        const li = document.createElement('li'); li.dataset.id = id;
        const i = document.createElement('i'); i.style.background = colorOf(id); li.appendChild(i);
        li.appendChild(document.createTextNode(nameOf[id] + (GEO && tierOf(id) ? ' · ' + TIER[tierOf(id)].n : '')));
        ul.appendChild(li);
      });
    };

    /* kamera: ko’rsatilgan hududlar + chap/o’ng yorliq ustunlari uchun joy */
    const full = data.viewBox.split(' ').map(Number);
    let zoom = full, u = 1, labels = [];
    const computeZoom = () => {
      const W = host.clientWidth || 800, H = host.clientHeight || W / 2, ar = W / H;
      const ids = shown().concat('fergana');
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      ids.forEach(id => { const b = byId[id].getBBox(); x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height); });
      const side = W < 560 ? 78 : 190; /* har tomonda yorliq ustuni (px) */
      const pad = 14, wR = x1 - x0 + pad * 2, hR = y1 - y0 + pad * 2;
      let zw = wR / Math.max(0.3, 1 - (2 * side) / W), zh = zw / ar;
      if (zh < hR * 1.08) { zh = hR * 1.08; zw = zh * ar; }
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      zoom = [cx - zw / 2, cy - zh / 2, zw, zh];
      u = zw / W;
    };

    /* yorliqlar: chap/o’ng ustun, chiziqcha: hudud nuqtasi → tirsak → yorliq */
    const buildLabels = () => {
      gL.textContent = ''; labels = [];
      const ids = shown(), [zx, zy, zw, zh] = zoom, mid = zx + zw / 2, small = zw / u < 560;
      const fs = (small ? 11.5 : 15) * u, fs2 = (small ? 10 : 12.5) * u, gap = (GEO ? (small ? 30 : 42) : (small ? 21 : 30)) * u;
      const cols = { L: [], R: [] };
      ids.forEach(id => { const c = interior(id); cols[c[0] < mid ? 'L' : 'R'].push({ id, c }); });
      for (const side of ['L', 'R']) {
        const list = cols[side].sort((a, b) => a.c[1] - b.c[1]);
        const top = zy + 24 * u, bot = zy + zh - 24 * u;
        let y = top;
        list.forEach(o => { o.y = Math.max(o.c[1], y); y = o.y + gap; });
        const over = y - gap - bot; if (over > 0) list.forEach(o => { o.y -= over; });
        for (let i = list.length - 2; i >= 0; i--) if (list[i + 1].y - list[i].y < gap) list[i].y = list[i + 1].y - gap;
        list.forEach(o => {
          const x = side === 'L' ? zx + 18 * u : zx + zw - 18 * u, anchor = side === 'L' ? 'start' : 'end';
          const g = el('g', { class: 'gg-tag', 'data-id': o.id, style: `--c:${colorOf(o.id)}` }, gL);
          const t = el('text', { x, y: o.y, 'text-anchor': anchor, 'font-size': fs.toFixed(2), class: 'gg-tag__name', 'stroke-width': (4 * u).toFixed(2) }, g);
          t.textContent = nameOf[o.id];
          let tw = 0; try { tw = t.getComputedTextLength(); } catch (e) { tw = nameOf[o.id].length * fs * 0.55; }
          if (GEO) {
            const t2 = el('text', { x, y: o.y + fs * 1.15, 'text-anchor': anchor, 'font-size': fs2.toFixed(2), class: 'gg-tag__tier', 'stroke-width': (3 * u).toFixed(2) }, g);
            t2.textContent = (TIER[tierOf(o.id)] || {}).n || '';
          }
          const ex = side === 'L' ? x + tw + 8 * u : x - tw - 8 * u;       /* yorliq chekkasi */
          const elbow = side === 'L' ? ex + 22 * u : ex - 22 * u;
          const ly = o.y - fs * 0.34;
          const line = el('polyline', { points: `${o.c[0].toFixed(1)},${o.c[1].toFixed(1)} ${elbow.toFixed(1)},${ly.toFixed(1)} ${ex.toFixed(1)},${ly.toFixed(1)}`, class: 'gg-tag__line', 'stroke-width': (1.6 * u).toFixed(2) }, g);
          g.insertBefore(line, t);
          el('circle', { cx: o.c[0].toFixed(1), cy: o.c[1].toFixed(1), r: (4.2 * u).toFixed(2), class: 'gg-tag__dot', 'stroke-width': (2 * u).toFixed(2) }, g);
          labels.push({ g, line, id: o.id });
        });
      }
    };

    /* nurlar: hududlardan maktabga */
    let beams = [];
    const buildBeams = () => {
      gB.textContent = ''; beams = [];
      shown().filter(id => id !== 'fergana').forEach(id => {
        const [x, y] = interior(id), mx = (x + school[0]) / 2, my = Math.min(y, school[1]) - 40 * u - Math.abs(x - school[0]) * 0.12;
        const d = `M${x.toFixed(1)} ${y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${school[0].toFixed(1)} ${school[1].toFixed(1)}`;
        el('path', { d, class: 'gg-beam-base', 'stroke-width': (1.6 * u).toFixed(2) }, gB);
        const b = el('path', { d, class: 'gg-beam', 'stroke-width': (2.8 * u).toFixed(2) }, gB);
        const L = b.getTotalLength(); b.style.strokeDasharray = `${Math.max(8, L * 0.28)} ${L * 2}`; b.style.strokeDashoffset = L * 0.58;
        beams.push({ b, L });
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

    /* legend ↔ xarita */
    const hot = (id, on) => {
      if (byId[id]) byId[id].classList.toggle('is-hot', on);
      root.querySelectorAll('.gg-legend li').forEach(li => li.classList.toggle('is-hot', on && li.dataset.id === id));
      labels.forEach(l => l.g.classList.toggle('is-hot', on && l.id === id));
    };
    const legUl = root.querySelector('.gg-legend');
    legUl.addEventListener('pointerover', e => { const li = e.target.closest('li'); if (li) hot(li.dataset.id, true); });
    legUl.addEventListener('pointerout', e => { const li = e.target.closest('li'); if (li) hot(li.dataset.id, false); });

    /* yillar (faqat ma’lumot bo’lsa) */
    if (GEO) {
      root.querySelector('.gg-tiers').hidden = false;
      root.querySelectorAll('.gg-tiers i').forEach(i => { i.style.background = TIER[+i.dataset.t].c; });
      const ys = Object.keys(GEO.years).sort();
      if (ys.length > 1) {
        const wrap = root.querySelector('.gg-years'); wrap.hidden = false;
        ys.forEach(y => {
          const btn = document.createElement('button');
          btn.type = 'button'; btn.textContent = y.replace('-', '–'); btn.setAttribute('role', 'tab'); btn.setAttribute('aria-selected', String(y === year));
          btn.addEventListener('click', () => {
            if (y === year) return; year = y;
            wrap.querySelectorAll('button').forEach(x => x.setAttribute('aria-selected', String(x === btn)));
            paint(); layout(); valley.update(y); if (done) startLife();
            gsap.to(svg, { attr: { viewBox: zoom.map(v => v.toFixed(1)).join(' ') }, duration: 0.9, ease: 'mu.inOut' });
            if (!MU.reduced) gsap.from(gL.children, { autoAlpha: 0, x: 0, duration: 0.5, stagger: 0.05 });
          });
          wrap.appendChild(btn);
        });
      }
    }

    /* ---------------------------------------------------------------- Farg’ona vodiysi tumanlari (daraja xaritasi) */
    const valley = (() => {
      const V = window.muValley, wrap = root.querySelector('.gg-valley');
      if (!V || !GEO || !wrap) return { update() {} };
      wrap.hidden = false;
      const vhost = wrap.querySelector('.gg-valley__svg'), empty = wrap.querySelector('.gg-valley__empty');
      const [, , VW, VH] = V.viewBox.split(' ').map(Number);
      const W = vhost.clientWidth || 1000, side = W < 560 ? 70 : 170;
      const vbW = VW / Math.max(0.35, 1 - (2 * side) / W), u = vbW / W, vx = -(vbW - VW) / 2;
      const vsvg = el('svg', { viewBox: `${vx.toFixed(1)} -10 ${vbW.toFixed(1)} ${VH + 20}`, 'aria-hidden': 'true' }, vhost);
      const gP = el('g', {}, vsvg), gLb = el('g', { class: 'gg-labels' }, vsvg), gS = el('g', {}, vsvg);
      const tp = {}, tn = {};
      V.t.forEach(t => { const p = el('path', { d: t.d, class: 'gg-t', 'data-reg': t.reg }, gP); el('title', {}, p).textContent = t.uz; tp[t.id] = p; tn[t.id] = t.uz; });
      /* tuman ichki nuqtasi */
      const ip = {};
      const inPt = id => {
        if (ip[id]) return ip[id];
        const p = tp[id], b = p.getBBox(), pt = vsvg.createSVGPoint(); let best = [b.x + b.width / 2, b.y + b.height / 2], bd = -1;
        const L = p.getTotalLength(), edge = []; for (let i = 0; i < 90; i++) { const q = p.getPointAtLength((i / 90) * L); edge.push([q.x, q.y]); }
        for (let gx = 1; gx < 11; gx++) for (let gy = 1; gy < 11; gy++) {
          const x = b.x + (b.width * gx) / 11, y = b.y + (b.height * gy) / 11; pt.x = x; pt.y = y;
          if (!p.isPointInFill(pt)) continue;
          let d = 1e9; for (const [ex, ey] of edge) d = Math.min(d, (ex - x) ** 2 + (ey - y) ** 2);
          if (d > bd) { bd = d; best = [x, y]; }
        }
        return (ip[id] = best);
      };
      /* maktab — Uchko’prik */
      const sp = tp.Uchkuprik ? inPt('Uchkuprik') : [VW / 2, VH / 2];
      const pl = el('circle', { cx: sp[0], cy: sp[1], r: 8 * u, class: 'gg-vpulse' }, gS);
      el('circle', { cx: sp[0], cy: sp[1], r: 6 * u, class: 'gg-vschool', 'stroke-width': 2.5 * u }, gS);
      const lbls = [];
      const labels = (tiers) => {
        gLb.textContent = ''; lbls.length = 0;
        const ids = Object.keys(tiers).filter(id => tiers[id] >= 3 && tp[id]).sort((a, b) => tiers[b] - tiers[a]);
        const mid = VW / 2, fs = (W < 560 ? 11.5 : 14.5) * u, fs2 = (W < 560 ? 10 : 12) * u, gap = (W < 560 ? 30 : 40) * u, cols = { L: [], R: [] };
        ids.forEach(id => { const c = inPt(id); cols[c[0] < mid ? 'L' : 'R'].push({ id, c }); });
        for (const sd of ['L', 'R']) {
          const list = cols[sd].sort((a, b) => a.c[1] - b.c[1]); let y = 20 * u;
          list.forEach(o => { o.y = Math.max(o.c[1], y); y = o.y + gap; });
          const over = y - gap - (VH - 10 * u); if (over > 0) list.forEach(o => { o.y -= over; });
          list.forEach(o => {
            const x = sd === 'L' ? vx + 14 * u : vx + vbW - 14 * u, anchor = sd === 'L' ? 'start' : 'end', col = TIER[tiers[o.id]].c;
            const g = el('g', { class: 'gg-tag', style: `--c:${col}` }, gLb);
            const t = el('text', { x, y: o.y, 'text-anchor': anchor, 'font-size': fs.toFixed(2), class: 'gg-tag__name', 'stroke-width': (4 * u).toFixed(2) }, g);
            t.textContent = tn[o.id];
            const t2 = el('text', { x, y: o.y + fs * 1.1, 'text-anchor': anchor, 'font-size': fs2.toFixed(2), class: 'gg-tag__tier', 'stroke-width': (3 * u).toFixed(2) }, g);
            t2.textContent = TIER[tiers[o.id]].n;
            let tw = 0; try { tw = t.getComputedTextLength(); } catch (e) { tw = tn[o.id].length * fs * 0.55; }
            const ex = sd === 'L' ? x + tw + 8 * u : x - tw - 8 * u, elb = sd === 'L' ? ex + 20 * u : ex - 20 * u, ly = o.y - fs * 0.34;
            const line = el('polyline', { points: `${o.c[0].toFixed(1)},${o.c[1].toFixed(1)} ${elb.toFixed(1)},${ly.toFixed(1)} ${ex.toFixed(1)},${ly.toFixed(1)}`, class: 'gg-tag__line', 'stroke-width': (1.5 * u).toFixed(2) }, g);
            g.insertBefore(line, t);
            el('circle', { cx: o.c[0].toFixed(1), cy: o.c[1].toFixed(1), r: (3.6 * u).toFixed(2), class: 'gg-tag__dot', 'stroke-width': (1.8 * u).toFixed(2) }, g);
            lbls.push(line);
          });
        }
      };
      let shownOnce = false;
      const update = y => {
        const tiers = (GEO.years[y] && GEO.years[y].tuman) || null;
        empty.hidden = !!tiers; vsvg.style.opacity = tiers ? '' : '.35';
        Object.keys(tp).forEach(id => { const t = tiers ? tiers[id] || 0 : 0; tp[id].style.setProperty('--c', t ? TIER[t].c : ''); tp[id].classList.toggle('is-on', !!t); tp[id].querySelector('title').textContent = tn[id] + (t ? ' — ' + TIER[t].n : ''); });
        labels(tiers || {});
        if (shownOnce && !MU.reduced) lbls.forEach((l, i) => gsap.from(l, { drawSVG: '0%', duration: 0.7, delay: i * 0.06 }));
      };
      update(year);
      if (!MU.reduced) {
        gsap.set(gLb, { autoAlpha: 0 });
        const tlv = gsap.timeline({ scrollTrigger: { trigger: vhost, start: 'top 78%', once: true }, onComplete: () => { shownOnce = true; } });
        tlv.from(gP.children, { opacity: 0, duration: 0.5, stagger: { each: 0.02, from: 'random' } })
          .set(gLb, { autoAlpha: 1 })
          .add(() => lbls.forEach((l, i) => gsap.from(l, { drawSVG: '0%', duration: 0.8, delay: i * 0.08, ease: 'power2.inOut' })))
          .from(gLb.querySelectorAll('text'), { autoAlpha: 0, duration: 0.5, stagger: 0.03 }, '+=0.3');
        gsap.fromTo(pl, { attr: { r: 8 * u }, opacity: 0.9 }, { attr: { r: 26 * u }, opacity: 0, duration: 1.6, repeat: -1, ease: 'power2.out' });
      } else shownOnce = true;
      return { update };
    })();

    paint(); layout();
    let done = false;
    const setVB = () => svg.setAttribute('viewBox', zoom.map(v => v.toFixed(1)).join(' '));
    /* boshlang’ich kadr: butun xarita host nisbatida */
    const W0 = host.clientWidth || 800, H0 = host.clientHeight || 400, ar0 = W0 / H0;
    let fw = full[2], fh = full[3]; if (fw / fh < ar0) fw = fh * ar0; else fh = fw / ar0;
    svg.setAttribute('viewBox', [full[0] + full[2] / 2 - fw / 2, full[1] + full[3] / 2 - fh / 2, fw, fh].map(v => v.toFixed(1)).join(' '));
    let rw = W0;
    window.addEventListener('resize', () => { const w = host.clientWidth; if (Math.abs(w - rw) < 40) return; rw = w; layout(); if (done) { setVB(); startLife(); } });

    if (MU.reduced) { done = true; painted = true; paint(); setVB(); return; }
    gsap.set([gB, gT], { autoAlpha: 0 });
    gsap.set(gL, { autoAlpha: 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: host, start: 'top 75%', once: true }, onComplete: () => { done = true; } });
    tl.from(gO.children, { drawSVG: '0%', duration: 1.4, stagger: 0.03, ease: 'power2.inOut' })
      .call(() => { painted = true; paint(); }, null, 0.8)
      .to(svg, { attr: { viewBox: zoom.map(v => v.toFixed(1)).join(' ') }, duration: 1.8, ease: 'mu.inOut' }, 1.4)
      .to([gB, gT], { autoAlpha: 1, duration: 0.6 }, 2.9)
      .from(dot, { attr: { r: 0 }, duration: 0.7, ease: 'back.out(3)' }, 2.9)
      .set(gL, { autoAlpha: 1 }, 3.1)
      .add(() => {
        labels.forEach((l, i) => {
          gsap.from(l.line, { drawSVG: '0%', duration: 0.9, delay: i * 0.12, ease: 'power2.inOut' });
          gsap.from(l.g.querySelectorAll('text'), { autoAlpha: 0, duration: 0.5, delay: 0.5 + i * 0.12 });
          gsap.from(l.g.querySelector('circle'), { attr: { r: 0 }, duration: 0.5, delay: i * 0.12, ease: 'back.out(3)' });
        });
      }, 3.1);
    /* doimiy hayot: nurlar oqadi, maktab pulsi — faqat ekranda */
    const life = gsap.timeline({ repeat: -1, paused: true });
    const startLife = () => {
      life.clear();
      beams.forEach(({ b, L }, i) => life.fromTo(b, { strokeDashoffset: L * 0.58 }, { strokeDashoffset: -L * 0.02, duration: 2.2, ease: 'none', repeat: -1, delay: i * 0.3 }, 0));
      life.fromTo(pulse, { attr: { r: 9 * u }, opacity: 0.9 }, { attr: { r: 30 * u }, opacity: 0, duration: 1.6, ease: 'power2.out', repeat: -1 }, 0);
    };
    tl.call(() => { startLife(); MU.onVisible(root, v => (v ? life.play() : life.pause())); });
  }
});
