/* ==========================================================================
   45-stats · Raqamlarda
   Bento of living numbers: 99,3 % ring (ticks light up, comet orbit), 47-country
   3D orbit, fleet composition bar, split-flap "bugun yetkazildi" live counter,
   client avatars, rolling-digit odometer that keeps ticking, 2019–2026 volume
   bars + trend line, 6×6 warehouse grid wave. Loops only run while in view.
   ========================================================================== */
MU.part('stats', {
  init(root, MU) {
    if (!root) return;
    const { gsap, ScrollTrigger } = MU;
    const $ = s => root.querySelector(s), $$ = s => Array.from(root.querySelectorAll(s));
    const R = MU.reduced;
    const NS = 'http://www.w3.org/2000/svg';
    const mk = (tag, attrs, parent) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(e);
      return e;
    };
    const rand = MU.rand, clamp = MU.clamp;

    let live = false;
    const liveHooks = [];
    MU.onVisible(root, v => { live = v; root.classList.toggle('is-live', v); liveHooks.forEach(fn => fn(v)); }, '0px');

    /* run fn once when el scrolls in (immediately in reduced motion) */
    const onEnter = (el, fn, start = 'top 80%') => {
      if (R) { fn(); return; }
      ScrollTrigger.create({ trigger: el, start, once: true, onEnter: fn });
    };
    const counter = (el, to, { dec = 0, suf = '', dur = 2.2, delay = 0, ease = 'power3.out', onUpdate } = {}) => {
      const o = { v: 0 };
      const render = () => { el.textContent = MU.fmt(o.v, dec) + suf; if (onUpdate) onUpdate(o.v); };
      if (R) { o.v = to; render(); return { play() {} }; }
      render();
      return gsap.to(o, { v: to, duration: dur, delay, ease, onUpdate: render, paused: true });
    };

    /* ================================================================ Tashkent clock */
    const tashNow = () => { const d = new Date(); return new Date(d.getTime() + (d.getTimezoneOffset() + 300) * 60000); };
    const p2 = n => String(n).padStart(2, '0');
    const clock = $('.sts-clock');
    const tickClock = () => { const t = tashNow(); clock.textContent = `${p2(t.getHours())}:${p2(t.getMinutes())}:${p2(t.getSeconds())}`; };
    tickClock();
    let clockId = 0;
    liveHooks.push(v => {
      if (v && !clockId && !R) clockId = setInterval(tickClock, 1000);
      else if (!v && clockId) { clearInterval(clockId); clockId = 0; }
    });

    /* ================================================================ card entrance */
    const cards = $$('.sts-card');
    if (!R) {
      gsap.set(cards, { autoAlpha: 0, y: 80, rotationX: -16, scale: 0.94, transformPerspective: 1400, transformOrigin: '50% 0%' });
      ScrollTrigger.batch(cards, {
        start: 'top 90%', once: true,
        onEnter: batch => gsap.to(batch, {
          autoAlpha: 1, y: 0, rotationX: 0, scale: 1, duration: 1.35, stagger: 0.11, ease: 'mu.out', overwrite: true,
          clearProps: 'transform,transformPerspective,visibility'
        })
      });
    }
    /* generic counters inside cards */
    cards.forEach(card => {
      const els = Array.from(card.querySelectorAll('[data-sts-to]'));
      if (!els.length) return;
      const tws = els.map((el, i) => counter(el, parseFloat(el.dataset.stsTo), {
        dec: parseInt(el.dataset.stsDec || 0, 10), suf: el.dataset.stsSuf || '', dur: 2.4, delay: 0.25 + i * 0.12
      }));
      onEnter(card, () => tws.forEach(t => t.play()));
    });

    /* ================================================================ 01 · ring 99,3 % */
    {
      const card = $('.sts-card--ring'), ring = $('.sts-ring'), svg = $('.sts-ring__svg');
      const prog = $('.sts-ring__prog'), tip = $('.sts-ring__tip'), num = $('.sts-ring__n');
      const TK = 120, ticks = [];
      const tg = $('.sts-ring__ticks');
      for (let i = 0; i < TK; i++) {
        const major = i % 10 === 0;
        ticks.push(mk('line', { x1: 0, y1: -(major ? 141 : 146), x2: 0, y2: -156, transform: `rotate(${i * 3})`, class: major ? 'is-major' : '' }, tg));
      }
      let lit = 0;
      const setRing = v => {
        prog.setAttribute('stroke-dasharray', `${v.toFixed(3)} 100`);
        prog.style.opacity = v > 0.4 ? 1 : 0;
        tip.setAttribute('transform', `rotate(${(v * 3.6).toFixed(2)})`);
        tip.style.opacity = v > 0.4 ? 1 : 0;
        num.textContent = MU.fmt(v, 1);
        const n = Math.min(TK, Math.round(v / 100 * TK));
        if (n > lit) for (let i = lit; i < n; i++) ticks[i].classList.add('is-on');
        else for (let i = n; i < lit; i++) ticks[i].classList.remove('is-on');
        lit = n;
      };
      if (R) { setRing(99.3); ring.classList.add('is-done'); }
      else {
        setRing(0);
        const o = { v: 0 };
        const tw = gsap.to(o, { v: 99.3, duration: 3, ease: 'power3.inOut', paused: true, delay: 0.35, onUpdate: () => setRing(o.v), onComplete: () => ring.classList.add('is-done') });
        onEnter(card, () => tw.play(), 'top 75%');
        gsap.fromTo(svg, { rotation: -24 }, { rotation: 8, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
      }
    }

    /* ================================================================ 02 · 47-country orbit */
    {
      const card = $('.sts-card--geo');
      const ringsG = $('.sts-orbit__rings'), dotsG = $('.sts-orbit__front');
      const TILT = -12;
      const ORB = [{ rx: 102, ry: 30, n: 22, sp: 0.16 }, { rx: 72, ry: 21, n: 15, sp: -0.24 }, { rx: 44, ry: 13, n: 10, sp: 0.36 }];
      const ct = Math.cos(TILT * Math.PI / 180), st = Math.sin(TILT * Math.PI / 180);
      const dots = [];
      ORB.forEach((o, ri) => {
        mk('ellipse', { rx: o.rx, ry: o.ry, transform: `rotate(${TILT})` }, ringsG);
        for (let k = 0; k < o.n; k++) dots.push({ o, a0: (k / o.n) * Math.PI * 2 + ri * 0.4, el: mk('circle', { r: 1.8 }, dotsG) });
      });
      /* reveal order: shuffle so countries "light up" all over the orbits */
      const order = dots.map((d, i) => i).sort((a, b) => ((a * 37) % 47) - ((b * 37) % 47));
      order.forEach((di, k) => { dots[di].rank = k; });
      let shown = R ? 47 : 0;
      const draw = t => {
        for (let i = 0; i < dots.length; i++) {
          const d = dots[i], a = d.a0 + t * d.o.sp;
          const x = Math.cos(a) * d.o.rx, y = Math.sin(a) * d.o.ry;
          const X = x * ct - y * st, Y = x * st + y * ct;
          const depth = (Math.sin(a) + 1) / 2;
          const vis = clamp(shown - d.rank);
          d.el.setAttribute('cx', X.toFixed(2)); d.el.setAttribute('cy', Y.toFixed(2));
          d.el.setAttribute('r', ((1.1 + depth * 1.6) * (0.4 + 0.6 * vis)).toFixed(2));
          d.el.style.opacity = ((0.25 + depth * 0.75) * vis).toFixed(3);
        }
      };
      draw(0);
      if (!R) {
        const loop = MU.renderLoop(card, t => draw(t));
        loop.start();
        const o = { v: 0 };
        const tw = gsap.to(o, { v: 47, duration: 2.4, delay: 0.25, ease: 'power3.out', paused: true, onUpdate: () => { shown = o.v; } });
        onEnter(card, () => tw.play());
      }
    }

    /* ================================================================ 03 · fleet composition */
    {
      const card = $('.sts-card--fleet');
      const segs = $$('.sts-fbar i');
      if (!R) {
        gsap.set(segs, { scaleX: 0 });
        onEnter(card, () => gsap.to(segs, { scaleX: 1, duration: 1.6, stagger: 0.22, delay: 0.35, ease: 'expo.out' }));
      }
    }

    /* ================================================================ 04 · today · split-flap */
    {
      const card = $('.sts-card--today'), flap = $('.sts-flap');
      const rate = h => 18 + 80 * Math.exp(-(((h - 11) / 3.2) ** 2)) + 64 * Math.exp(-(((h - 16.5) / 2.6) ** 2));
      const rates = Array.from({ length: 24 }, (_, h) => rate(h + 0.5));
      const tn = tashNow(), hr = tn.getHours() + tn.getMinutes() / 60;
      let today = Math.round(rates.reduce((s, r, h) => s + r * clamp(hr - h, 0, 1), 0)) + 36;
      const DIG = Math.max(4, String(today + 400).length);
      const cells = [];
      for (let i = 0; i < DIG; i++) {
        if (DIG - i === 3) { const sep = document.createElement('span'); sep.className = 'sts-fc sts-fc--sep'; flap.appendChild(sep); }
        const el = document.createElement('span');
        el.className = 'sts-fc';
        el.innerHTML = '<span class="sts-fc__t"><b>0</b></span><span class="sts-fc__b"><b>0</b></span><span class="sts-fc__ft"><b>0</b></span><span class="sts-fc__fb"><b>0</b></span>';
        flap.appendChild(el);
        const q = s => el.querySelector(s + ' b');
        cells.push({ el, t: q('.sts-fc__t'), b: q('.sts-fc__b'), ft: q('.sts-fc__ft'), fb: q('.sts-fc__fb'), ftw: el.querySelector('.sts-fc__ft'), fbw: el.querySelector('.sts-fc__fb'), val: '0' });
      }
      const flip = (c, v, speed = 1) => {
        if (c.val === v) return;
        const old = c.val; c.val = v;
        if (R) { c.t.textContent = c.b.textContent = c.ft.textContent = c.fb.textContent = v; return; }
        c.t.textContent = v; c.fb.textContent = v; c.ft.textContent = old; c.b.textContent = old;
        gsap.killTweensOf([c.ftw, c.fbw]);
        gsap.set(c.ftw, { rotationX: 0 }); gsap.set(c.fbw, { rotationX: 90 });
        gsap.timeline()
          .to(c.ftw, { rotationX: -90, duration: 0.24 / speed, ease: 'power2.in' })
          .to(c.fbw, { rotationX: 0, duration: 0.36 / speed, ease: 'back.out(2)' })
          .add(() => { c.b.textContent = v; c.ft.textContent = v; gsap.set(c.ftw, { rotationX: 0 }); });
      };
      const setFlap = (n, speed) => {
        const s = String(n).padStart(DIG, '0');
        let lead = true;
        cells.forEach((c, i) => {
          if (s[i] !== '0' || i === DIG - 1) lead = false;
          c.el.classList.toggle('is-lead', lead);
          flip(c, s[i], speed);
        });
      };
      /* hourly histogram */
      const hoursEl = $('.sts-hours'), maxR = Math.max(...rates);
      const bars = rates.map((r, h) => {
        const i = document.createElement('i');
        i.style.setProperty('--h', (r / maxR * 100).toFixed(1) + '%');
        if (h < Math.floor(hr)) i.classList.add('is-past'); else if (h === Math.floor(hr)) i.classList.add('is-now');
        hoursEl.appendChild(i);
        return i;
      });
      const ROUTES = ['Toshkent → Moskva', 'Shanghai → Toshkent', 'Samarqand → Istanbul', 'Toshkent → Dubay', 'Urumchi → Samarqand',
        'Buxoro → Olmaota', 'Toshkent → Boku', 'Duisburg → Toshkent', 'Olmaota → Tbilisi'];
      const lastEl = $('.sts-last__r');
      let ri = 0;
      if (R) setFlap(today, 1);
      else {
        gsap.set(bars, { scaleY: 0 });
        onEnter(card, () => {
          gsap.to(bars, { scaleY: 1, duration: 1, stagger: 0.025, delay: 0.3, ease: 'expo.out' });
          /* slot-machine arrival: each digit rattles through values, then lands */
          const s = String(today).padStart(DIG, '0');
          cells.forEach((c, i) => {
            const steps = 5 + i * 3;
            for (let k = 1; k <= steps; k++) {
              gsap.delayedCall(0.3 + k * 0.085, () => flip(c, k === steps ? s[i] : String((Number(c.val) + 1) % 10), 2.2));
            }
          });
          gsap.delayedCall(0.3 + (5 + (DIG - 1) * 3) * 0.085 + 0.6, () => { setFlap(today, 1); schedule(); });
        });
      }
      const schedule = () => gsap.delayedCall(rand(2.6, 5.2), () => {
        if (live && !document.hidden) {
          today += 1;
          setFlap(today, 1);
          ri = (ri + 1 + Math.floor(rand(0, 3))) % ROUTES.length;
          if (window.ScrambleTextPlugin) gsap.to(lastEl, { duration: 0.8, scrambleText: { text: ROUTES[ri], chars: 'ABDEGHIKLMNOQRSTUXYZ', speed: 0.6 } });
          else lastEl.textContent = ROUTES[ri];
          const nb = bars.find(b => b.classList.contains('is-now'));
          if (nb) gsap.fromTo(nb, { scaleY: 1.25 }, { scaleY: 1, duration: 0.8, ease: 'elastic.out(1, .4)' });
        }
        schedule();
      });
      if (!R) setFlap(0, 1); else setFlap(today, 1);
    }

    /* ================================================================ 05 · clients */
    {
      const card = $('.sts-card--clients');
      const av = $$('.sts-avatars span');
      if (!R) {
        gsap.set(av, { scale: 0, rotation: -40, autoAlpha: 0 });
        onEnter(card, () => gsap.to(av, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.9, stagger: 0.08, delay: 0.3, ease: 'back.out(2)' }));
        /* idle float, only while visible */
        const bob = gsap.to(av, { y: -4, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: { each: 0.22, from: 'start' }, paused: true, delay: 1.5 });
        liveHooks.push(v => (v ? bob.play() : bob.pause()));
      }
    }

    /* ================================================================ 06 · odometer */
    {
      const card = $('.sts-card--odo'), odo = $('.sts-odo'), plus = $('.sts-odo__plus');
      const V0 = 1873402519, ND = 10;
      const strips = [];
      for (let i = 0; i < ND; i++) {
        const d = document.createElement('span');
        d.className = 'sts-od' + (i === 1 || i === 4 || i === 7 ? ' is-gap' : '') + (i >= ND - 3 ? ' is-hot' : '');
        const s = document.createElement('span');
        s.className = 'sts-od__s';
        s.innerHTML = '0123456789'.split('').concat('0').map(n => `<i>${n}</i>`).join('');
        d.appendChild(s); odo.appendChild(d); strips.push(s);
      }
      const setPos = (i, pos) => { strips[i].style.transform = `translate3d(0,${(-(pos % 10) * 100 / 11).toFixed(3)}%,0)`; };
      const setOdo = v => {
        for (let k = 0; k < ND; k++) {
          const p = Math.pow(10, k), d = Math.floor(v / p) % 10;
          const f = k === 0 ? v % 1 : Math.max(0, (v % p) - (p - 1));
          setPos(ND - 1 - k, d + f);
        }
      };
      const digits = String(V0).split('').map(Number);
      let val = V0;
      if (R) setOdo(V0);
      else {
        digits.forEach((d, i) => setPos(i, 0));
        const st = { v: V0 };
        const tick = () => gsap.delayedCall(rand(1.1, 1.9), () => {
          if (live && !document.hidden) {
            const inc = Math.round(rand(3, 12));
            val += inc;
            gsap.to(st, { v: val, duration: 1, ease: 'power2.inOut', onUpdate: () => setOdo(st.v) });
            plus.textContent = '+' + inc + ' km';
            gsap.fromTo(plus, { y: 10, autoAlpha: 0 }, { y: -14, autoAlpha: 1, duration: 0.5, ease: 'power2.out', overwrite: true });
            gsap.to(plus, { autoAlpha: 0, y: -26, duration: 0.6, delay: 0.9, ease: 'power2.in' });
          }
          tick();
        });
        onEnter(card, () => {
          const tl = gsap.timeline({ onComplete: () => { setOdo(val); tick(); } });
          digits.forEach((d, i) => {
            const o = { p: 0 };
            tl.to(o, { p: d + 10 * (2 + Math.floor(i * 0.6)), duration: 1.5 + i * 0.13, ease: 'expo.out', onUpdate: () => setPos(i, o.p) }, 0.25 + (ND - 1 - i) * 0.06);
          });
        }, 'top 78%');
      }
    }

    /* ================================================================ 07 · yearly volume */
    {
      const card = $('.sts-card--vol'), chart = $('.sts-chart');
      const lis = $$('.sts-bars li'), barEls = lis.map(li => li.querySelector('.sts-bar')), vals = lis.map(li => li.querySelector('b'));
      const line = $('.sts-chart__line'), area = $('.sts-chart__area'), dotsG = $('.sts-chart__dots');
      const svg = $('.sts-chart__svg');
      const dots = lis.map(() => mk('circle', { r: 3.5 }, dotsG));
      let drawn = R, pts = [];
      const geo = () => {
        const w = chart.clientWidth, h = chart.clientHeight;
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        pts = barEls.map(b => [b.offsetLeft + b.offsetWidth / 2, b.offsetTop]);
        if (pts.length < 2) return;
        /* Catmull-Rom → cubic Bézier */
        let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
        for (let i = 0; i < pts.length - 1; i++) {
          const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
          const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
          d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
        }
        line.setAttribute('d', d);
        const base = barEls[0].offsetTop + barEls[0].offsetHeight;
        area.setAttribute('d', `${d} L${pts[pts.length - 1][0].toFixed(1)} ${base} L${pts[0][0].toFixed(1)} ${base}Z`);
        dots.forEach((c, i) => { c.setAttribute('cx', pts[i][0].toFixed(1)); c.setAttribute('cy', pts[i][1].toFixed(1)); });
        const len = line.getTotalLength ? line.getTotalLength() : 1000;
        line.style.strokeDasharray = len;
        if (drawn) line.style.strokeDashoffset = 0;
        else line.style.strokeDashoffset = len;
        return len;
      };
      const ro = new ResizeObserver(() => { geo(); });
      ro.observe(chart);
      geo();
      if (R) { area.style.opacity = 1; }
      else {
        gsap.set(barEls, { scaleY: 0 });
        gsap.set(vals, { autoAlpha: 0, y: 10 });
        gsap.set(dots, { scale: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' });
        onEnter(card, () => {
          const tl = gsap.timeline({ delay: 0.3 });
          tl.to(barEls, { scaleY: 1, duration: 1.3, stagger: 0.08, ease: 'expo.out' })
            .to(vals, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.35)
            .add(() => { drawn = true; }, 0.9)
            .fromTo(line, { strokeDashoffset: () => geo() }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.9)
            .to(area, { opacity: 1, duration: 1.2 }, 1.4)
            .to(dots, { scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(3)' }, 1.1);
        });
      }
    }

    /* ================================================================ 08 · warehouses grid */
    {
      const card = $('.sts-card--wh'), grid = $('.sts-grid');
      const HQ = 14;
      const cells = Array.from({ length: 36 }, (_, i) => {
        const c = document.createElement('i');
        if (i === HQ) c.className = 'is-hq';
        grid.appendChild(c);
        return c;
      });
      const light = () => cells.forEach(c => c.classList.add('is-on'));
      if (R) light();
      else {
        gsap.set(cells, { scale: 0.2, autoAlpha: 0 });
        onEnter(card, () => gsap.to(cells, {
          scale: 1, autoAlpha: 1, duration: 0.7, ease: 'back.out(2.4)', delay: 0.25,
          stagger: { grid: [6, 6], from: 'start', each: 0.06, onComplete() { this.targets()[0].classList.add('is-on'); } }
        }));
        const ping = () => gsap.delayedCall(rand(0.6, 1.4), () => {
          if (live && !document.hidden) {
            const c = cells[Math.floor(rand(0, 36))];
            if (c.classList.contains('is-on')) {
              c.classList.remove('is-ping'); void c.offsetWidth; c.classList.add('is-ping');
            }
          }
          ping();
        });
        ping();
        grid.addEventListener('animationend', e => e.target.classList.remove('is-ping'));
      }
    }

    /* ================================================================ scroll-linked background */
    if (!R) {
      const bgLine = $('.sts-bg__line');
      if (window.DrawSVGPlugin) {
        gsap.fromTo(bgLine, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', scrollTrigger: { trigger: root, start: 'top 75%', end: 'bottom 70%', scrub: 1 } });
      }
      gsap.fromTo('#raqamlar .sts-orb', { yPercent: -6 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true } });
    }
  }
});
