MU.part('geografiya', {
  init(root) {
    const { gsap } = MU;
    const data = window.muUzMap; if (!data) return;
    const NS = 'http://www.w3.org/2000/svg';
    const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
    const host = root.querySelector('.gg-map__svg');
    const svg = el('svg', { viewBox: data.viewBox, 'aria-hidden': 'true' }, host);
    const defs = el('defs', {}, svg);
    const grad = el('linearGradient', { id: 'gg-grad', x1: '0', y1: '0', x2: '1', y2: '0' }, defs);
    el('stop', { offset: '0', 'stop-color': '#3b5bdb', 'stop-opacity': '0' }, grad);
    el('stop', { offset: '.5', 'stop-color': '#3b5bdb' }, grad);
    el('stop', { offset: '1', 'stop-color': '#dc2626' }, grad);
    const LIT = ['namangan', 'andijan', 'tashkent-region', 'tashkent-city', 'jizzakh'];
    const gR = el('g', {}, svg), gO = el('g', {}, svg), gB = el('g', {}, svg), gT = el('g', {}, svg);
    const byId = {};
    data.regions.forEach(r => {
      const p = el('path', { d: r.d, class: 'gg-r' + (r.id === 'aral-sea' ? ' gg-r--sea' : '') }, gR);
      el('title', {}, p).textContent = r.name;
      if (r.id !== 'aral-sea') el('path', { d: r.d, class: 'gg-outline' }, gO);
      byId[r.id] = p;
    });
    const center = id => { const b = byId[id].getBBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
    const fb = byId.fergana.getBBox();
    const school = [fb.x + fb.width * 0.2, fb.y + fb.height * 0.32];
    /* kamera: butun O’zbekiston → sharqiy viloyatlar */
    const full = data.viewBox.split(' ').map(Number);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    ['fergana', ...LIT].forEach(id => { const b = byId[id].getBBox(); x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height); });
    const pad = 26, zw0 = x1 - x0 + pad * 2, zh0 = y1 - y0 + pad * 2, ar = full[2] / full[3];
    const zw = Math.max(zw0, zh0 * ar), zh = zw / ar;
    const zoom = [x0 - pad - (zw - zw0) / 2, y0 - pad - (zh - zh0) / 2, zw, zh];
    const k = zw / full[2];

    /* nurlar: viloyatlardan maktabga (animated beam) */
    const beams = LIT.filter(id => id !== 'tashkent-city').map(id => {
      const [x, y] = center(id), mx = (x + school[0]) / 2, my = Math.min(y, school[1]) - 30 * k * 3 - Math.abs(x - school[0]) * 0.12;
      const d = `M${x.toFixed(1)} ${y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${school[0].toFixed(1)} ${school[1].toFixed(1)}`;
      el('path', { d, class: 'gg-beam-base', 'stroke-width': (2 * k * 1.6).toFixed(2) }, gB);
      const b = el('path', { d, class: 'gg-beam', 'stroke-width': (3.2 * k * 1.6).toFixed(2) }, gB);
      const L = b.getTotalLength(); b.style.strokeDasharray = `${Math.max(8, L * 0.28)} ${L * 2}`; b.style.strokeDashoffset = L * 0.3 + L * 0.28;
      el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: (4 * k * 1.6).toFixed(2), class: 'gg-src' }, gB);
      return { b, L, id };
    });
    /* maktab → oliygoh (ramziy): Toshkent shahri tomon uchqun */
    const [tx, ty] = center('tashkent-city');
    const uniD = `M${school[0].toFixed(1)} ${school[1].toFixed(1)} Q${((school[0] + tx) / 2).toFixed(1)} ${(Math.min(ty, school[1]) - 60 * k * 1.6).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}`;
    const uni = el('path', { d: uniD, class: 'gg-uni', 'stroke-width': (2 * k * 1.6).toFixed(2), 'stroke-dasharray': `${(5 * k * 1.6).toFixed(1)} ${(7 * k * 1.6).toFixed(1)}` }, gB);
    const S = k * 1.6;
    const star = el('path', { d: `M0 ${-9 * S} ${2.4 * S} ${-2.4 * S} ${9 * S} 0 ${2.4 * S} ${2.4 * S} 0 ${9 * S} ${-2.4 * S} ${2.4 * S} ${-9 * S} 0 ${-2.4 * S} ${-2.4 * S}Z`, class: 'gg-star' }, gB);
    const sch = el('g', { class: 'gg-school' }, gT);
    const pulse = el('circle', { cx: school[0], cy: school[1], r: 9 * S }, sch);
    const dot = el('circle', { cx: school[0], cy: school[1], r: 6 * S, 'stroke-width': (3 * S).toFixed(2) }, sch);
    const lbl = (x, y, t, c = '') => { const e = el('text', { x, y, class: 'gg-lbl ' + c, 'text-anchor': 'middle', 'font-size': (15 * S).toFixed(2), 'stroke-width': (4 * S).toFixed(2) }, gT); e.textContent = t; return e; };
    lbl(school[0], school[1] + 24 * S, 'Uchko’prik');
    lbl(tx, ty - 14 * S, 'Oliygoh sari', 'gg-lbl--uni');

    const legend = Array.from(root.querySelectorAll('.gg-legend li'));
    const hot = (id, on) => { if (byId[id]) byId[id].classList.toggle('is-hot', on); legend.forEach(li => li.classList.toggle('is-hot', on && li.dataset.id === id)); };
    legend.forEach(li => { li.addEventListener('pointerenter', () => hot(li.dataset.id, true)); li.addEventListener('pointerleave', () => hot(li.dataset.id, false)); });

    const light = () => { byId.fergana.classList.add('is-home'); LIT.forEach(id => byId[id].classList.add('is-lit')); };
    if (MU.reduced) { light(); svg.setAttribute('viewBox', zoom.join(' ')); gsap.set(star, { x: tx, y: ty }); return; }
    gsap.set([gB, gT], { autoAlpha: 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: host, start: 'top 78%', once: true } });
    tl.from(gO.children, { drawSVG: '0%', duration: 1.5, stagger: 0.04, ease: 'power2.inOut' })
      .call(() => byId.fergana.classList.add('is-home'), null, 0.7)
      .call(() => LIT.forEach((id, i) => setTimeout(() => byId[id].classList.add('is-lit'), i * 140)), null, 0.9)
      .to(svg, { attr: { viewBox: zoom.map(v => v.toFixed(1)).join(' ') }, duration: 1.8, ease: 'mu.inOut' }, 1.5)
      .to([gB, gT], { autoAlpha: 1, duration: 0.6 }, 3)
      .from(dot, { attr: { r: 0 }, duration: 0.7, ease: 'back.out(3)' }, 3)
      .from(uni, { drawSVG: '0%', duration: 1.2, ease: 'power2.inOut' }, 3.2);
    /* doimiy hayot: nurlar oqadi, uchqun oliygoh sari uchadi, maktab pulsi — faqat ekranda */
    const life = gsap.timeline({ repeat: -1, paused: true });
    beams.forEach(({ b, L }, i) => life.fromTo(b, { strokeDashoffset: L * 0.3 + L * 0.28 }, { strokeDashoffset: -L * 0.02, duration: 2.2, ease: 'none', repeat: -1, delay: i * 0.35 }, 0));
    life.to(star, { motionPath: { path: uni, align: uni, alignOrigin: [0.5, 0.5] }, duration: 3, ease: 'power1.inOut', repeat: -1, repeatDelay: 0.6 }, 0)
      .fromTo(pulse, { attr: { r: 9 * S }, opacity: 0.9 }, { attr: { r: 30 * S }, opacity: 0, duration: 1.6, ease: 'power2.out', repeat: -1 }, 0);
    tl.call(() => MU.onVisible(root, v => (v ? life.play() : life.pause())));
  }
});
