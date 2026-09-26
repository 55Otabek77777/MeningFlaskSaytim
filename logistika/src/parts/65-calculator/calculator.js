/* ==========================================================================
   09 — Narx kalkulyatori · live quote engine + motion
   distance table (great-circle × mode factor) × mode rate × chargeable weight + extras
   ========================================================================== */
MU.part('calculator', {
  init(root, MU) {
    const { gsap, ScrollTrigger } = MU;
    const $ = s => root.querySelector(s);
    const $$ = s => Array.from(root.querySelectorAll(s));
    const RM = MU.reduced;
    const D = d => (RM ? 0 : d);
    const fmt = MU.fmt, clamp = MU.clamp;
    // display font (Unbounded) renders U+202F very narrow → use a regular thin space there
    const fmtD = (n, d) => MU.fmt(n, d).replace(/\u202F/g, '\u2009');

    /* ---------------------------------------------------------- data */
    const CITIES = [
      { id: 'TAS', name: 'Toshkent', country: 'Oʻzbekiston', lat: 41.31, lon: 69.24 },
      { id: 'SKD', name: 'Samarqand', country: 'Oʻzbekiston', lat: 39.65, lon: 66.96 },
      { id: 'ALA', name: 'Olmaota', country: 'Qozogʻiston', lat: 43.24, lon: 76.89 },
      { id: 'SHA', name: 'Shanghai', country: 'Xitoy', lat: 31.23, lon: 121.47 },
      { id: 'MOW', name: 'Moskva', country: 'Rossiya', lat: 55.75, lon: 37.62 },
      { id: 'BAK', name: 'Boku', country: 'Ozarbayjon', lat: 40.41, lon: 49.87 },
      { id: 'IST', name: 'Istanbul', country: 'Turkiya', lat: 41.01, lon: 28.98 },
      { id: 'DXB', name: 'Dubay', country: 'BAA', lat: 25.2, lon: 55.27 },
      { id: 'BOM', name: 'Mumbay', country: 'Hindiston', lat: 19.08, lon: 72.88 },
      { id: 'DUI', name: 'Duisburg', country: 'Germaniya', lat: 51.43, lon: 6.76 },
      { id: 'RTM', name: 'Rotterdam', country: 'Niderlandiya', lat: 51.92, lon: 4.48 }
    ];
    const byId = id => CITIES.find(c => c.id === id) || CITIES[0];
    // factor: route km / great-circle km · speed km/day · handling days · $ per t·km · CO₂ g per t·km · density kg/m³ (volumetric)
    const MODES = {
      avto: { name: 'Avto', factor: 1.2, speed: 645, handling: 0.8, rate: 0.074, base: 180, min: 420, co2: 62, dens: 333 },
      rail: { name: 'Temir yoʻl', factor: 1.22, speed: 680, handling: 1.2, rate: 0.047, base: 260, min: 650, co2: 22, dens: 333 },
      sea: { name: 'Dengiz', factor: 1.75, speed: 520, handling: 1.4, rate: 0.021, base: 340, min: 780, co2: 11, dens: 1000 },
      avia: { name: 'Avia', factor: 1.08, speed: 7000, handling: 0.6, rate: 1.05, base: 120, min: 260, co2: 602, dens: 167 }
    };
    const ORDER = ['avto', 'rail', 'sea', 'avia'];
    const st = { from: 'TAS', to: 'MOW', mode: 'avto', kg: 12000, m3: 38, ex: { ins: false, customs: true, temp: false, express: false } };

    const rad = d => (d * Math.PI) / 180;
    function gc(a, b) {
      const dl = rad(b.lat - a.lat), dn = rad(b.lon - a.lon);
      const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dn / 2) ** 2;
      return 2 * 6371 * Math.asin(Math.sqrt(h));
    }
    function quote(mode) {
      const m = MODES[mode];
      const km = gc(byId(st.from), byId(st.to)) * m.factor;
      const t = Math.max(st.kg, st.m3 * m.dens) / 1000;
      let freight = Math.max(m.min, m.base + km * m.rate * Math.pow(t, 0.93));
      let extras = 0;
      if (st.ex.temp) freight *= 1.22;
      if (st.ex.express) extras += freight * 0.3;
      if (st.ex.ins) extras += freight * 0.03;
      if (st.ex.customs) extras += 190;
      freight = Math.round(freight / 5) * 5;
      extras = Math.round(extras / 5) * 5;
      const days = Math.max(1, Math.ceil((m.handling + km / m.speed) * (st.ex.express ? 0.7 : 1)));
      return { km, t, freight, extras, total: freight + extras, days, co2: (t * km * m.co2) / 1000 };
    }

    /* ---------------------------------------------------------- odometer */
    const odo = $('.clc-odo');
    const NCOL = 7;
    const cols = [], seps = [];
    for (let i = 0; i < NCOL; i++) {
      const col = document.createElement('span');
      col.className = 'clc-odo__col';
      const strip = document.createElement('span');
      strip.className = 'clc-odo__strip';
      strip.innerHTML = '0123456789'.split('').map(d => `<span>${d}</span>`).join('');
      col.appendChild(strip);
      odo.appendChild(col);
      cols.push({ el: col, strip, d: 0, vis: true });
      if (i === 0 || i === 3) {
        const sp = document.createElement('span');
        sp.className = 'clc-odo__sep';
        odo.appendChild(sp);
        seps.push({ el: sp, after: i, vis: true });
      }
    }
    function setOdo(value) {
      const s = String(Math.max(0, Math.round(value))).padStart(NCOL, '0').slice(-NCOL);
      const sig = s.search(/[1-9]/);
      const lead = sig < 0 ? NCOL - 1 : sig;
      cols.forEach((c, i) => {
        const vis = i >= lead;
        if (vis !== c.vis) {
          c.vis = vis;
          gsap.to(c.el, { width: vis ? '0.74em' : '0em', autoAlpha: vis ? 1 : 0, duration: D(0.55), ease: 'power3.inOut', overwrite: 'auto' });
        }
        const d = +s[i];
        if (d !== c.d) {
          c.d = d;
          gsap.to(c.strip, { yPercent: -d * 10, duration: D(0.8 + (NCOL - i) * 0.07), ease: 'power4.out', overwrite: 'auto' });
        }
      });
      seps.forEach(sp => {
        const vis = sp.after >= lead;
        if (vis !== sp.vis) {
          sp.vis = vis;
          gsap.to(sp.el, { width: vis ? '0.22em' : '0em', duration: D(0.55), ease: 'power3.inOut', overwrite: 'auto' });
        }
      });
    }
    setOdo(0);

    /* ---------------------------------------------------------- counters */
    const tweens = {};
    function countTo(el, key, val, { dec = 0, pre = '', suf = '', disp = false } = {}) {
      if (!el) return;
      const f = disp ? fmtD : fmt;
      const o = tweens[key] || (tweens[key] = { v: 0 });
      gsap.to(o, { v: val, duration: D(0.9), ease: 'power3.out', overwrite: true, onUpdate: () => { el.textContent = pre + f(o.v, dec) + suf; } });
      if (RM) el.textContent = pre + f(val, dec) + suf;
    }

    /* ---------------------------------------------------------- outputs */
    const out = {
      freight: $('[data-clc="freight"]'), extras: $('[data-clc="extras"]'), days: $('[data-clc="days"]'),
      km: $('[data-clc="km"]'), co2: $('[data-clc="co2"]'), sr: $('[data-clc="sr"]'),
      trucks: $('[data-clc="trucks"]'), teu: $('[data-clc="teu"]'),
      leg: $('[data-clc="leg"]'), codeA: $('[data-clc="codeA"]'), codeB: $('[data-clc="codeB"]'), cityA: $('[data-clc="cityA"]'), cityB: $('[data-clc="cityB"]')
    };
    const scan = $('.clc-out__scan');
    const pillRect = $('.clc-map__pill rect');
    const deltaEl = $('[data-clc="delta"]');
    const cmpRows = $$('.clc-cmp__row');
    const leaf = '<svg class="clc-cmp__leaf" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19C5 10 11 5 20 4c0 9-5 14-13 15zM5 19l8-8"/></svg>';
    let entered = RM, srTimer = 0, lastTotal = -1;

    function update() {
      const q = quote(st.mode);
      if (!entered) return q;
      setOdo(q.total);
      countTo(out.freight, 'fr', q.freight, { pre: '$' });
      countTo(out.extras, 'ex', q.extras, { pre: '$' });
      countTo(out.days, 'days', q.days, { disp: true });
      countTo(out.km, 'km', Math.round(q.km / 10) * 10, { disp: true });
      countTo(out.co2, 'co2', q.co2 < 100 ? q.co2 : Math.round(q.co2), { dec: q.co2 < 100 ? 1 : 0, disp: true });
      if (out.leg) {
        out.leg.textContent = `${fmt(Math.round(q.km / 10) * 10)} km · ${q.days} kun`;
        try {
          const bb = out.leg.getBBox(), pad = 14;
          if (bb.width) { pillRect.setAttribute('width', (bb.width + pad * 2).toFixed(1)); pillRect.setAttribute('x', (220 - bb.width / 2 - pad).toFixed(1)); }
        } catch (e) { /* not rendered yet */ }
      }
      // per-mode CO₂ comparison
      const all = ORDER.map(m => quote(m).co2);
      const max = Math.max(...all), min = Math.min(...all);
      cmpRows.forEach((row, i) => {
        const m = ORDER[i];
        row.classList.toggle('is-active', m === st.mode);
        row.setAttribute('aria-pressed', String(m === st.mode));
        gsap.to(row.querySelector('.clc-cmp__bar i'), { scaleX: Math.max(0.025, Math.sqrt(all[i] / max)), duration: D(1), ease: 'power3.out', delay: D(i * 0.05), overwrite: 'auto' });
        countTo(row.querySelector('.clc-cmp__v'), 'cmp' + i, all[i] < 100 ? all[i] : Math.round(all[i]), { dec: all[i] < 100 ? 1 : 0, suf: ' kg' });
        const name = row.querySelector('.clc-cmp__name');
        const green = all[i] === min;
        if (green !== !!name.querySelector('.clc-cmp__leaf')) {
          name.innerHTML = MODES[m].name + (green ? leaf : '');
        }
      });
      if (q.total !== lastTotal && !RM && lastTotal >= 0) {
        gsap.fromTo(scan, { xPercent: -110, autoAlpha: 1 }, { xPercent: 190, autoAlpha: 1, duration: 0.9, ease: 'power2.inOut', overwrite: true });
        // floating ± delta next to the price
        const dv = q.total - lastTotal, up = dv > 0;
        deltaEl.textContent = (up ? '+' : '−') + '$' + fmt(Math.abs(dv));
        deltaEl.className = 'clc-delta mono ' + (up ? 'is-up' : 'is-down');
        gsap.killTweensOf(deltaEl);
        gsap.timeline()
          .fromTo(deltaEl, { autoAlpha: 0, y: 10, scale: 0.85 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(2.5)' })
          .to(deltaEl, { autoAlpha: 0, y: -14, duration: 0.6, ease: 'power2.in' }, 1.4);
      }
      lastTotal = q.total;
      clearTimeout(srTimer);
      srTimer = setTimeout(() => {
        out.sr.textContent = `Taxminiy narx ${fmt(q.total)} dollar, muddat ${q.days} kun, ${byId(st.from).name} — ${byId(st.to).name}, ${MODES[st.mode].name}.`;
      }, 400);
      return q;
    }

    /* ---------------------------------------------------------- route map */
    const PATHS = {
      avto: 'M36 104 C 120 104, 130 74, 220 80 S 330 108, 404 104',
      rail: 'M36 104 C 150 98, 290 98, 404 104',
      sea: 'M36 104 C 80 132, 130 132, 176 108 S 270 80, 316 104 S 380 124, 404 104',
      avia: 'M36 104 C 110 8, 330 8, 404 104'
    };
    const base = $('.clc-map__base'), prog = $('.clc-map__prog'), veh = $('.clc-veh');
    const vehIcons = $$('.clc-veh__i');
    const run = { p: 0 };
    let curVeh = null;
    function placeVeh() {
      const len = base.getTotalLength();
      const p = run.p;
      const a = base.getPointAtLength(p * len);
      const b = base.getPointAtLength(Math.min(len, p * len + 2));
      const c = base.getPointAtLength(Math.max(0, p * len - 2));
      const ang = (Math.atan2(b.y - c.y, b.x - c.x) * 180) / Math.PI;
      const lift = st.mode === 'avia' ? 0 : -8;
      veh.setAttribute('transform', `translate(${a.x.toFixed(2)} ${a.y.toFixed(2)}) rotate(${ang.toFixed(2)}) translate(0 ${lift})`);
      veh.style.opacity = Math.min(1, p * 14, (1 - p) * 10).toFixed(3);
      prog.style.strokeDasharray = `${p.toFixed(4)} 1`;
    }
    function showVeh(mode, animate) {
      vehIcons.forEach(g => {
        const on = g.dataset.veh === mode;
        if (!animate) { gsap.set(g, { autoAlpha: on ? 1 : 0, scale: 1, svgOrigin: '0 0' }); return; }
        if (on) gsap.fromTo(g, { autoAlpha: 0, scale: 0.2, rotation: -30, svgOrigin: '0 0' }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(2.2)', delay: 0.15 });
        else gsap.to(g, { autoAlpha: 0, scale: 0.3, duration: 0.25, svgOrigin: '0 0' });
      });
      curVeh = mode;
    }
    const vehLoop = gsap.timeline({ repeat: -1, repeatDelay: 0.5, paused: true });
    vehLoop.fromTo(run, { p: 0 }, { p: 1, duration: 3.6, ease: 'power1.inOut', onUpdate: placeVeh });
    function morphRoute(mode, animate) {
      if (!animate || !window.MorphSVGPlugin) { base.setAttribute('d', PATHS[mode]); prog.setAttribute('d', PATHS[mode]); placeVeh(); return; }
      gsap.to([base, prog], { morphSVG: PATHS[mode], duration: 0.9, ease: 'power3.inOut', overwrite: 'auto', onUpdate: placeVeh });
    }
    function setCityLabels(animate) {
      const A = byId(st.from), B = byId(st.to);
      const pairs = [[out.codeA, A.id], [out.codeB, B.id], [out.cityA, A.name], [out.cityB, B.name]];
      pairs.forEach(([el, txt]) => {
        if (!el || el.textContent === txt) return;
        if (animate && window.ScrambleTextPlugin) gsap.to(el, { duration: 0.6, scrambleText: { text: txt, chars: 'ABCDEFGHIJKLMNOPRSTUVXYZ', speed: 0.8 }, overwrite: true });
        else el.textContent = txt;
      });
    }

    /* ---------------------------------------------------------- dial */
    const needle = $('.clc-dial__needle'), dialInner = $('.clc-dial__inner'), ticks = $('.clc-dial__ticks');
    if (ticks) {
      let s = '';
      for (let i = 0; i < 96; i++) {
        const a = (i / 96) * Math.PI * 2, major = i % 8 === 0, c = Math.cos(a), si = Math.sin(a);
        const r1 = 352, r2 = major ? 324 : 340;
        s += `<line x1="${(400 + c * r1).toFixed(1)}" y1="${(400 + si * r1).toFixed(1)}" x2="${(400 + c * r2).toFixed(1)}" y2="${(400 + si * r2).toFixed(1)}"${major ? ' class="is-major"' : ''}/>`;
      }
      ticks.innerHTML = s;
    }
    let dialAngle = 0;
    function rotateDial(mode, animate) {
      const target = ORDER.indexOf(mode) * 90;
      let delta = ((target - dialAngle) % 360 + 540) % 360 - 180;
      dialAngle += delta;
      gsap.to(needle, { rotation: dialAngle, svgOrigin: '400 400', duration: animate ? D(1.4) : 0, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
    }
    const innerSpin = RM ? null : gsap.to(dialInner, { rotation: 360, svgOrigin: '400 400', duration: 120, repeat: -1, ease: 'none', paused: true });

    /* ---------------------------------------------------------- dropdowns */
    const dds = [];
    function makeDD(wrap) {
      const key = wrap.dataset.dd, other = key === 'from' ? 'to' : 'from';
      const btn = wrap.querySelector('.clc-dd__btn'), list = wrap.querySelector('.clc-dd__list');
      const codeEl = btn.querySelector('[data-clc="code"]'), val = btn.querySelector('.clc-dd__val');
      const cityEl = btn.querySelector('[data-clc="city"]'), countryEl = btn.querySelector('[data-clc="country"]');
      list.id = `clc-${key}-list`;
      btn.setAttribute('aria-controls', list.id);
      let isOpen = false, active = 0, opts = [];
      function render() {
        const o = byId(st[other]);
        list.innerHTML = CITIES.map((c, i) => {
          const dis = c.id === o.id, sel = c.id === st[key];
          return `<li role="option" id="clc-${key}-o${i}" class="clc-opt${sel ? ' is-sel' : ''}" aria-selected="${sel}"${dis ? ' aria-disabled="true"' : ''} data-id="${c.id}">` +
            `<span class="clc-opt__code mono">${c.id}</span><span class="clc-opt__txt"><span class="clc-opt__city">${c.name}</span><span class="clc-opt__country">${c.country}</span></span>` +
            `<span class="clc-opt__km mono">${dis ? '—' : fmt(Math.round(gc(c, o) / 10) * 10) + ' km'}</span></li>`;
        }).join('');
        opts = Array.from(list.children);
      }
      function setActive(i, scroll) {
        if (!opts.length) return;
        active = (i + opts.length) % opts.length;
        opts.forEach((o, k) => o.classList.toggle('is-active', k === active));
        list.setAttribute('aria-activedescendant', opts[active].id);
        if (scroll) {
          const o = opts[active];
          if (o.offsetTop < list.scrollTop) list.scrollTop = o.offsetTop - 6;
          else if (o.offsetTop + o.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = o.offsetTop + o.offsetHeight - list.clientHeight + 6;
        }
      }
      function move(dir) {
        for (let n = 1; n <= opts.length; n++) {
          const k = (active + dir * n + opts.length * 2) % opts.length;
          if (opts[k].getAttribute('aria-disabled') !== 'true') { setActive(k, true); return; }
        }
      }
      function open() {
        dds.forEach(d => d !== api && d.close(false));
        render();
        isOpen = true;
        wrap.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        setActive(Math.max(0, CITIES.findIndex(c => c.id === st[key])), true);
        gsap.killTweensOf(list);
        gsap.set(list, { visibility: 'visible' });          // must be focusable right away
        gsap.fromTo(list, { opacity: 0, y: -10, clipPath: 'inset(0% 0% 100% 0% round 18px)' },
          { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: D(0.55), ease: 'power3.out' });
        gsap.fromTo(opts, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: D(0.45), stagger: D(0.022), ease: 'power2.out', delay: D(0.06) });
        list.focus({ preventScroll: true });
      }
      function close(focusBtn) {
        if (!isOpen) return;
        isOpen = false;
        wrap.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        list.removeAttribute('aria-activedescendant');
        gsap.killTweensOf(list);
        gsap.to(list, { autoAlpha: 0, y: -6, duration: D(0.25), ease: 'power2.in' });
        if (focusBtn) btn.focus({ preventScroll: true });
      }
      function sync(animate) {
        const c = byId(st[key]);
        if (!animate) { codeEl.textContent = c.id; cityEl.textContent = c.name; countryEl.textContent = c.country; return; }
        const dir = key === 'from' ? 1 : -1;
        gsap.timeline()
          .to(val, { yPercent: -70 * dir, autoAlpha: 0, duration: 0.2, ease: 'power2.in' })
          .add(() => { cityEl.textContent = c.name; countryEl.textContent = c.country; })
          .fromTo(val, { yPercent: 70 * dir, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.55, ease: 'back.out(1.8)' });
        if (window.ScrambleTextPlugin) gsap.to(codeEl, { duration: 0.6, scrambleText: { text: c.id, chars: 'ABCDEFGHIJKLMNOPRSTUVXYZ', speed: 0.7 }, overwrite: true });
        else codeEl.textContent = c.id;
      }
      function choose(id) {
        if (id === st[key] || id === st[other]) return;
        st[key] = id;
        sync(!RM);
        routeChanged();
      }
      btn.addEventListener('click', () => (isOpen ? close(true) : open()));
      btn.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); }
      });
      list.addEventListener('click', e => {
        const li = e.target.closest('[role="option"]');
        if (!li || li.getAttribute('aria-disabled') === 'true') return;
        choose(li.dataset.id);
        close(true);
      });
      list.addEventListener('pointermove', e => {
        const li = e.target.closest('[role="option"]');
        if (li) setActive(opts.indexOf(li), false);
      });
      list.addEventListener('keydown', e => {
        const k = e.key;
        if (k === 'ArrowDown') { e.preventDefault(); move(1); }
        else if (k === 'ArrowUp') { e.preventDefault(); move(-1); }
        else if (k === 'Home') { e.preventDefault(); setActive(0, true); }
        else if (k === 'End') { e.preventDefault(); setActive(opts.length - 1, true); }
        else if (k === 'Enter' || k === ' ') {
          e.preventDefault();
          const li = opts[active];
          if (li && li.getAttribute('aria-disabled') !== 'true') { choose(li.dataset.id); close(true); }
        } else if (k === 'Escape') { e.preventDefault(); close(true); }
        else if (k === 'Tab') close(false);
      });
      const api = { wrap, open, close, sync, get isOpen() { return isOpen; } };
      dds.push(api);
      return api;
    }
    $$('.clc-dd').forEach(makeDD);
    document.addEventListener('pointerdown', e => { dds.forEach(d => { if (d.isOpen && !d.wrap.contains(e.target)) d.close(false); }); });
    dds.forEach(d => d.sync(false));

    const swapBtn = $('.clc-swap');
    let swapTurn = 0;
    swapBtn.addEventListener('click', () => {
      [st.from, st.to] = [st.to, st.from];
      swapTurn += 180;
      gsap.to(swapBtn.querySelector('svg'), { rotation: swapTurn, duration: D(0.7), ease: 'back.out(1.7)' });
      dds.forEach(d => d.sync(!RM));
      routeChanged();
    });

    function routeChanged() {
      setCityLabels(!RM);
      if (!RM) {
        gsap.fromTo(prog, { opacity: 0.2 }, { opacity: 1, duration: 0.8 });
        vehLoop.restart();
        if (!visible) vehLoop.pause();
      }
      update();
    }

    /* ---------------------------------------------------------- transport mode */
    const seg = $('.clc-seg'), ind = $('.clc-seg__ind'), segBtns = $$('.clc-seg__btn');
    function placeInd(animate) {
      const b = segBtns[ORDER.indexOf(st.mode)];
      if (!b || !b.offsetWidth) return;
      gsap.to(ind, { x: b.offsetLeft, width: b.offsetWidth, duration: animate ? D(0.75) : 0, ease: 'elastic.out(1, 0.78)', overwrite: 'auto' });
    }
    const ICON_FX = {
      avto: ico => gsap.fromTo(ico.querySelectorAll('.clc-wheel'), { rotation: 0 }, { rotation: 360, transformOrigin: '50% 50%', duration: 0.8, ease: 'power2.out' }),
      rail: ico => gsap.fromTo(ico, { x: -6 }, { x: 0, duration: 0.7, ease: 'back.out(2.5)' }),
      sea: ico => gsap.fromTo(ico, { rotation: -10, transformOrigin: '50% 80%' }, { rotation: 0, duration: 1.1, ease: 'elastic.out(1, 0.35)' }),
      avia: ico => gsap.fromTo(ico, { x: -8, y: 6, rotation: -14 }, { x: 0, y: 0, rotation: 0, duration: 0.8, ease: 'back.out(2)' })
    };
    function setMode(mode, animate = true, focus = false) {
      if (!MODES[mode]) return;
      const changed = mode !== st.mode;
      st.mode = mode;
      segBtns.forEach(b => {
        const on = b.dataset.mode === mode;
        b.setAttribute('aria-checked', String(on));
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      placeInd(animate);
      if (animate && changed && !RM) {
        const b = segBtns[ORDER.indexOf(mode)];
        ICON_FX[mode](b.querySelector('.clc-ico'));
        showVeh(mode, true);
        morphRoute(mode, true);
      } else {
        showVeh(mode, false);
        morphRoute(mode, false);
      }
      rotateDial(mode, animate);
      update();
    }
    segBtns.forEach((b, i) => {
      b.addEventListener('click', () => setMode(b.dataset.mode));
      b.addEventListener('keydown', e => {
        let n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % ORDER.length;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i + ORDER.length - 1) % ORDER.length;
        if (e.key === 'Home') n = 0;
        if (e.key === 'End') n = ORDER.length - 1;
        if (n !== null) { e.preventDefault(); setMode(ORDER[n], true, true); }
      });
    });
    cmpRows.forEach(r => r.addEventListener('click', () => setMode(r.dataset.mode)));

    /* ---------------------------------------------------------- sliders */
    const W_MIN = 100, W_SPAN = 400;
    const kgFromV = v => {
      const raw = W_MIN * Math.pow(W_SPAN, v / 1000);
      const step = raw < 1000 ? 10 : raw < 10000 ? 50 : 250;
      return clamp(Math.round(raw / step) * step, 100, 40000);
    };
    const vFromKg = kg => Math.round((1000 * Math.log(kg / W_MIN)) / Math.log(W_SPAN));
    const wIn = $('#clc-weight'), vIn = $('#clc-volume');
    const wVal = $('[data-clc="wval"]'), vVal = $('[data-clc="vval"]');
    const contFill = $('.clc-cont__fill');
    // tick placement (log scale for weight)
    const wt = $$('[data-range="weight"] .clc-range__ticks span');
    [100, 1000, 10000, 40000].forEach((kg, i) => { if (wt[i]) wt[i].style.left = (vFromKg(kg) / 10) + '%'; });
    const vt = $$('[data-range="volume"] .clc-range__ticks span');
    [1, 20, 40, 60, 80].forEach((m, i) => { if (vt[i]) vt[i].style.left = (((m - 1) / 79) * 100) + '%'; });

    function applyWeight() {
      const v = +wIn.value;
      st.kg = kgFromV(v);
      wIn.closest('.clc-range__track').style.setProperty('--p', (v / 1000).toFixed(4));
      wVal.textContent = fmt(st.kg);
      wIn.setAttribute('aria-valuetext', fmt(st.kg) + ' kg');
      const tr = Math.max(1, Math.ceil(st.kg / 20000));
      out.trucks.textContent = st.kg < 1500 ? 'yigʻma yuk (LTL)' : `≈ ${tr} fura`;
    }
    function applyVolume() {
      const v = +vIn.value;
      st.m3 = v;
      vIn.closest('.clc-range__track').style.setProperty('--p', ((v - 1) / 79).toFixed(4));
      vVal.textContent = fmt(v);
      vIn.setAttribute('aria-valuetext', v + ' m³');
      out.teu.textContent = `≈ ${fmt(v / 67.7, 1)} × 40ft`;
      gsap.to(contFill, { scaleX: clamp(v / 67.7, 0.02, 1), duration: D(0.5), ease: 'power3.out', overwrite: 'auto' });
    }
    function setupRange(input, apply) {
      const bubble = input.parentElement.querySelector('.clc-range__bubble');
      const shift = () => gsap.set(bubble, { xPercent: -(18 + 64 * ((+input.value - +input.min) / (+input.max - +input.min))) });
      const rot = RM ? () => {} : gsap.quickTo(bubble, 'rotation', { duration: 0.45, ease: 'power3.out' });
      const span = +input.max - +input.min;
      let lastV = +input.value, lastT = performance.now(), settle = 0;
      input.addEventListener('input', () => {
        const v = +input.value, now = performance.now();
        const vel = ((v - lastV) / span) * 1000 / Math.max(8, now - lastT);
        lastV = v; lastT = now;
        rot(clamp(-vel * 9, -18, 18));
        clearTimeout(settle);
        settle = setTimeout(() => rot(0), 110);
        apply();
        shift();
        update();
      });
      const up = () => { gsap.to(bubble, { scale: 1, duration: D(0.5), ease: 'elastic.out(1, 0.5)' }); rot(0); };
      input.addEventListener('pointerdown', () => gsap.to(bubble, { scale: 1.16, duration: D(0.3), ease: 'back.out(3)' }));
      input.addEventListener('pointerup', up);
      input.addEventListener('pointercancel', up);
      input.addEventListener('blur', up);
      apply();
      shift();
    }
    setupRange(wIn, applyWeight);
    setupRange(vIn, applyVolume);

    /* ---------------------------------------------------------- extras */
    $$('.clc-tog').forEach(b => {
      const knob = b.querySelector('.clc-tog__sw i'), ico = b.querySelector('.clc-tog__ico');
      const key = b.dataset.extra;
      const on0 = b.getAttribute('aria-checked') === 'true';
      st.ex[key] = on0;
      gsap.set(knob, { x: on0 ? 16 : 0 });
      b.addEventListener('click', () => {
        const on = b.getAttribute('aria-checked') !== 'true';
        b.setAttribute('aria-checked', String(on));
        st.ex[key] = on;
        gsap.to(knob, { x: on ? 16 : 0, duration: D(0.55), ease: 'back.out(2.4)', overwrite: 'auto' });
        if (!RM) {
          gsap.fromTo(knob, { scaleX: 1.45 }, { scaleX: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
          if (on) gsap.fromTo(ico, { scale: 0.7, rotation: -12 }, { scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(3)' });
        }
        update();
      });
    });

    /* ---------------------------------------------------------- CTA → contact part can prefill */
    const cta = $('.clc-cta__btn');
    if (cta) cta.addEventListener('click', () => {
      const q = quote(st.mode);
      MU.emit('calc:quote', { from: byId(st.from).name, to: byId(st.to).name, mode: MODES[st.mode].name, kg: st.kg, m3: st.m3, total: q.total, days: q.days });
    });

    /* ---------------------------------------------------------- lifecycle / motion */
    let visible = false;
    MU.onVisible(root, v => {
      visible = v;
      root.classList.toggle('is-inview', v);
      if (RM) return;
      if (v) { vehLoop.play(); if (innerSpin) innerSpin.play(); }
      else { vehLoop.pause(); if (innerSpin) innerSpin.pause(); }
    }, '60px');

    // initial (non-animated) state
    showVeh(st.mode, false);
    morphRoute(st.mode, false);
    setCityLabels(false);
    rotateDial(st.mode, false);
    requestAnimationFrame(() => placeInd(false));
    if ('ResizeObserver' in window) new ResizeObserver(() => placeInd(false)).observe(seg);

    if (RM) {
      run.p = 1;
      placeVeh();
      update();
    } else {
      const panel = $('.clc-panel');
      // panel tilts up out of the page as it scrolls in
      gsap.fromTo(panel, { rotationX: 10, y: 80, scale: 0.955, transformPerspective: 1600, transformOrigin: '50% 0%' }, {
        rotationX: 0, y: 0, scale: 1, ease: 'none',
        scrollTrigger: { trigger: panel, start: 'top bottom', end: 'top 55%', scrub: 0.8 }
      });
      gsap.fromTo('#kalkulyator .clc-dial', { rotation: -25 }, {
        rotation: 25, ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
      const rows = $$('.clc-form > .clc-row');
      gsap.set(rows, { y: 40, autoAlpha: 0 });
      gsap.set('#kalkulyator .clc-out > *:not(.clc-out__scan)', { y: 28, autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: panel, start: 'top 72%', once: true,
        onEnter: () => {
          gsap.to(rows, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.08, ease: 'mu.out', clearProps: 'transform' });
          gsap.to('#kalkulyator .clc-out > *:not(.clc-out__scan)', { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.07, ease: 'mu.out', delay: 0.15, clearProps: 'transform' });
          placeInd(false);
          gsap.from(ind, { scaleX: 0, duration: 0.9, ease: 'mu.out', delay: 0.3, transformOrigin: '0% 50%' });
          setTimeout(() => { entered = true; update(); }, 350);
        }
      });
    }
  }
});
