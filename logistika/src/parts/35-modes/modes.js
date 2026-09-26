/* ==========================================================================
   03 · TRANSPORT TURLARI (modes) — owner D
   Pinned horizontal journey through 4 illustrated scenes (a-art.js).
   One scrubbed master timeline drives: track x, per-layer parallax
   (data-s), text entrances/exits, HUD progress. Loops run only for the
   panels in view while the section is on screen.
   ========================================================================== */
MU.part('modes', {
  init(root, MU) {
    if (!root) return;
    const { gsap, ScrollTrigger } = MU;
    const $ = (s, el = root) => el.querySelector(s);
    const $$ = (s, el = root) => Array.from(el.querySelectorAll(s));
    const reduced = MU.reduced;
    const art = window.muModesArt;

    const pin = $('.mod-pin'), frame = $('.mod-frame'), track = $('.mod-track');
    const panels = $$('.mod-panel');
    const N = panels.length;
    if (!pin || !frame || !track || !N) return;

    const META = [
      { mode: 'Avto', spd: 88, unit: 'km/soat', acc: '#ffc861' },
      { mode: 'Temir yoʻl', spd: 120, unit: 'km/soat', acc: '#ff7a4a' },
      { mode: 'Dengiz', spd: 18, unit: 'tugun', acc: '#2ee6d6' },
      { mode: 'Avia', spd: 900, unit: 'km/soat', acc: '#a58bff' }
    ];

    /* ---------------------------------------------------------- build scenes */
    panels.forEach(p => {
      const sc = $('.mod-scene', p), fn = art && art[p.dataset.mode];
      if (sc && fn) sc.innerHTML = fn();
    });

    const dots = $$('.mod-hud__dot');
    dots.forEach((d, i) => d.style.setProperty('--i', i));
    const fill = $('.mod-hud__fill'), modeEl = $('[data-mod-mode]'), spdEl = $('[data-mod-spd]'), unitEl = $('[data-mod-unit]');
    const W = () => frame.clientWidth || window.innerWidth;
    const portraitMQ = window.matchMedia('(max-width: 768px), (max-aspect-ratio: 3/4)');
    const portrait = () => portraitMQ.matches;
    const perPanel = () => Math.max(window.innerHeight * (MU.isMobile ? .95 : 1.15), W() * (MU.isMobile ? .6 : .75));
    const dist = () => Math.round((N - 1) * perPanel());

    /* ---------------------------------------------------------- state: live panels + visibility */
    let onScreen = false, t = 0, cur = -1;
    const live = new Set([0]);
    const loops = []; // { panel, tl }
    const syncLoops = () => loops.forEach(l => { if (onScreen && live.has(l.panel)) l.tl.play(); else l.tl.pause(); });
    // content-visibility is applied only AFTER the paused styles are flushed, so skipped subtrees never keep running animations
    const flush = () => void getComputedStyle(track).opacity;
    MU.onVisible(frame, v => { onScreen = v; root.classList.toggle('mod-on', v && !reduced); syncLoops(); }, '60px');
    MU.onVisible(root, v => root.classList.toggle('mod-near', v && !reduced), '0px');
    MU.onVisible(frame, v => {
      if (v) { root.classList.remove('mod-cv-all'); return; }
      onScreen = false; root.classList.remove('mod-on'); syncLoops(); flush();
      root.classList.add('mod-cv-all');
    }, '700px');

    /* ---------------------------------------------------------- crane loops (sea) */
    if (!reduced) {
      const seaIdx = panels.findIndex(p => p.dataset.mode === 'sea');
      $$('.mod-crane', panels[seaIdx] || root).forEach((crane, k) => {
        const trolley = $('.mod-trolley', crane), cable = $('.mod-cable', crane), spreader = $('.mod-spreader', crane), box = $('.mod-cbox', crane);
        if (!trolley || !cable || !spreader || !box) return;
        gsap.set(trolley, { x: 205 });
        gsap.set(cable, { scaleY: .3, transformOrigin: '50% 0%' });
        gsap.set(spreader, { y: -70 });
        const hoist = (tl, s, d, pos) => tl.to(cable, { scaleY: s, duration: d, ease: 'sine.inOut' }, pos).to(spreader, { y: (s - 1) * 100, duration: d, ease: 'sine.inOut' }, '<');
        const tl = gsap.timeline({ paused: true, repeat: -1, delay: k * 2.2 });
        tl.to(trolley, { x: 40, duration: 2.8, ease: 'power2.inOut' });
        hoist(tl, 1, 1.5);
        tl.to(box, { opacity: 0, duration: .35 });
        hoist(tl, .3, 1.3);
        tl.to(trolley, { x: 205, duration: 2.6, ease: 'power2.inOut' });
        hoist(tl, .9, 1.2);
        tl.to(box, { opacity: 1, duration: .35 });
        hoist(tl, .3, 1.2);
        if (k) tl.progress(.45);
        loops.push({ panel: seaIdx, tl });
      });
    }

    /* ---------------------------------------------------------- HUD */
    const spd = { v: META[0].spd, j: 0 };
    const renderSpd = () => { if (spdEl) spdEl.textContent = MU.fmt(Math.max(0, Math.round(spd.v + spd.j))); };
    const counted = new Set();
    const countMetric = i => {
      if (counted.has(i)) return;
      counted.add(i);
      const el = $('[data-mod-count]', panels[i]);
      if (!el || reduced) return;
      const end = parseFloat(el.dataset.modCount), o = { v: 0 };
      gsap.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => { el.textContent = MU.fmt(o.v); } });
    };
    const setActive = i => {
      if (i === cur) return;
      const first = cur < 0;
      cur = i;
      dots.forEach((d, k) => {
        d.classList.toggle('is-active', k === i);
        d.classList.toggle('is-past', k < i);
        if (k === i) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
      });
      root.style.setProperty('--mod-acc', META[i].acc);
      if (modeEl) {
        if (!reduced && !first && window.ScrambleTextPlugin) {
          gsap.to(modeEl, { duration: .7, overwrite: true, scrambleText: { text: META[i].mode, chars: 'ABDEGIKLMNOPRSTUVXYZ', speed: .9 } });
        } else modeEl.textContent = META[i].mode;
      }
      if (unitEl) unitEl.textContent = META[i].unit;
      gsap.to(spd, { v: META[i].spd, duration: reduced || first ? 0 : 1.3, ease: 'power3.out', onUpdate: renderSpd, overwrite: true });
      if (!first) countMetric(i);
    };

    const update = p => {
      t = p * (N - 1);
      let changed = false;
      let hide = null;
      panels.forEach((pn, i) => {
        const on = Math.abs(t - i) < .999;
        if (on === live.has(i)) return;
        changed = true;
        if (on) { live.add(i); pn.classList.remove('mod-cv'); pn.classList.add('is-live'); }
        else { live.delete(i); pn.classList.remove('is-live'); (hide || (hide = [])).push(pn); }
      });
      if (hide) { flush(); hide.forEach(pn => pn.classList.add('mod-cv')); }
      if (changed) syncLoops();
      setActive(Math.round(t));
    };
    panels.forEach((pn, i) => pn.classList.add(i ? 'mod-cv' : 'is-live'));
    setActive(0);

    /* ---------------------------------------------------------- intro: window opens, truck drives in */
    const info0 = $('.mod-info', panels[0]);
    const items0 = info0 ? [...$$('.mod-info__top > *', info0), ...$$('.mod-info__bot > *', info0)] : [];
    if (!reduced) {
      gsap.fromTo(frame, { clipPath: 'inset(7% 4% 0% 4% round 44px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
        scrollTrigger: { trigger: pin, start: 'top bottom', end: 'top top', scrub: true }
      });
      const truckIn = $('.mod-truck .mod-act__in', panels[0]);
      if (truckIn) gsap.fromTo(truckIn, { x: () => -W() * .55 }, {
        x: 0, ease: 'power2.out',
        scrollTrigger: { trigger: pin, start: 'top 90%', end: 'top 8%', scrub: .8, invalidateOnRefresh: true }
      });
      const word0 = $$('.mod-word > *', panels[0]);
      if (word0.length) gsap.fromTo(word0, { yPercent: 40, opacity: 0 }, {
        yPercent: 0, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: pin, start: 'top 75%', end: 'top 15%', scrub: true }
      });
      gsap.set(items0, { autoAlpha: 0, y: 40 });
      ScrollTrigger.create({
        trigger: pin, start: 'top 45%', once: true,
        onEnter: () => { gsap.to(items0, { autoAlpha: 1, y: 0, duration: 1.1, stagger: .07, ease: 'mu.out' }); countMetric(0); }
      });
    } else counted.add(0);

    /* ---------------------------------------------------------- master timeline */
    const tl = gsap.timeline({ defaults: { ease: 'none' }, onUpdate: () => update(tl.progress()) });
    tl.to(track, { x: () => -(N - 1) * W(), duration: N - 1 }, 0);
    if (fill) tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: N - 1 }, 0);
    if (!reduced) {
      panels.forEach((p, i) => {
        const a = Math.max(0, i - 1), b = Math.min(N - 1, i + 1);
        $$('.mod-l[data-s]', p).forEach(el => {
          const s = parseFloat(el.dataset.s) || 0;
          if (!s) return;
          el.classList.add('mod-px');
          tl.fromTo(el, { x: () => (a - i) * s * W() }, { x: () => (b - i) * s * W(), duration: b - a }, a);
        });
        const info = $('.mod-info', p), scrim = $('.mod-scrim', p);
        if (!info) return;
        if (i > 0) {
          if (scrim) tl.fromTo(scrim, { autoAlpha: () => (portrait() ? 1 : 0) }, { autoAlpha: 1, duration: .6 }, i - .75);
          const items = [...$$('.mod-info__top > *', info), ...$$('.mod-info__bot > *', info)];
          tl.fromTo(items, { x: () => W() * .14, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .5, stagger: .035, ease: 'power2.out' }, i - .7);
          const word = $$('.mod-word > *', p);
          if (word.length) tl.fromTo(word, { yPercent: 35, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .55, stagger: .08, ease: 'power2.out' }, i - .75);
        }
        if (i < N - 1) {
          tl.to(info, { x: () => -W() * .08, autoAlpha: 0, duration: .4, ease: 'power1.in' }, i + .22);
          if (scrim) tl.to(scrim, { autoAlpha: () => (portrait() ? 1 : 0), duration: .5 }, i + .3);
        }
      });
    }

    const st = ScrollTrigger.create({
      trigger: pin, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      start: 'top top', end: () => '+=' + dist(),
      scrub: MU.isTouch || reduced ? true : .6,
      animation: tl
    });

    /* ---------------------------------------------------------- navigation */
    const goTo = i => {
      i = MU.clamp(i | 0, 0, N - 1);
      const y = st.start + (st.end - st.start) * (i / (N - 1)) + (i === 0 ? 2 : 0);
      MU.scrollTo(y);
    };
    dots.forEach(d => d.addEventListener('click', () => goTo(parseInt(d.dataset.go, 10) || 0)));
    MU.on('modes:go', i => goTo(i));

    /* ---------------------------------------------------------- vehicle easter eggs (tap / click) */
    const RING_AT = { truck: [99, 60], train: [99.2, 66], ship: [16, 12], plane: [93, 46] };
    $$('.mod-act').forEach(act => {
      act.addEventListener('click', () => {
        if (reduced) return;
        const kind = act.dataset.act, inner = $('.mod-act__in', act), at = RING_AT[kind] || [50, 50];
        for (let k = 0; k < 3; k++) {
          const ring = document.createElement('i');
          ring.className = 'mod-ring';
          ring.style.left = at[0] + '%'; ring.style.top = at[1] + '%';
          (inner || act).appendChild(ring);
          gsap.fromTo(ring, { scale: .1, opacity: 1 }, { scale: 1.6 + k * .5, opacity: 0, duration: 1.1 + k * .25, delay: k * .14, ease: 'power2.out', onComplete: () => ring.remove() });
        }
        const bump = kind === 'plane' ? { x: '+=26', y: '-=14' } : kind === 'ship' ? { y: '-=10' } : { y: '-=8' };
        gsap.timeline().to(inner, Object.assign({ duration: .22, ease: 'power2.out' }, bump)).to(inner, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1, .4)' });
        const spark = $('.mod-train__spark', act);
        if (spark) gsap.fromTo(spark, { opacity: 1, scale: 2 }, { opacity: 0, scale: .5, duration: .6, ease: 'power2.out', clearProps: 'opacity,transform' });
      });
    });

    /* ---------------------------------------------------------- pointer parallax (desktop) + live readouts */
    const ptr = { x: 0, y: 0 };
    let lastPx = '', lastPy = '';
    if (!MU.isTouch && !reduced) {
      const qx = gsap.quickTo(ptr, 'x', { duration: 1.1, ease: 'power3.out' });
      const qy = gsap.quickTo(ptr, 'y', { duration: 1.1, ease: 'power3.out' });
      frame.addEventListener('pointermove', e => {
        const r = frame.getBoundingClientRect();
        qx(((e.clientX - r.left) / r.width) * 2 - 1);
        qy(((e.clientY - r.top) / r.height) * 2 - 1);
      });
      frame.addEventListener('pointerleave', () => { qx(0); qy(0); });
    }
    const gps = $('[data-mod-gps]');
    let lat = 41.3111, lon = 69.2797, acc = 0;
    MU.renderLoop(frame, (time, dt) => {
      const px = ptr.x.toFixed(3), py = ptr.y.toFixed(3);
      if (px !== lastPx) { frame.style.setProperty('--px', px); lastPx = px; }
      if (py !== lastPy) { frame.style.setProperty('--py', py); lastPy = py; }
      if (reduced) return;
      acc += dt;
      if (acc > .45) {
        acc = 0;
        spd.j = MU.rand(-1, 1) * (META[cur] ? Math.max(1, META[cur].spd * .012) : 1);
        renderSpd();
        if (gps && live.has(0)) {
          lat -= .00021; lon -= .00047;
          gps.textContent = lat.toFixed(4) + '° N · ' + lon.toFixed(4) + '° E';
        }
      }
    });
  }
});
