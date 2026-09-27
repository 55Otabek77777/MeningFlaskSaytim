/* ==========================================================================
   «Mirzo Ulug’bek» maktabi — shared runtime (window.MU)
   Loaded after vendor libs (gsap + plugins, Lenis, THREE) and before parts.
   Parts register with MU.part(name, { init(root, MU), reveal(root, MU) }).
   ========================================================================== */
(() => {
  'use strict';
  const W = window, D = document, root = D.documentElement;
  const gsap = W.gsap;

  const PLUGINS = ['ScrollTrigger', 'SplitText', 'MotionPathPlugin', 'DrawSVGPlugin', 'CustomEase', 'Flip',
    'Observer', 'ScrambleTextPlugin', 'MorphSVGPlugin', 'ScrollToPlugin', 'Draggable', 'InertiaPlugin'];
  gsap.registerPlugin(...PLUGINS.map(n => W[n]).filter(Boolean));
  const { ScrollTrigger, SplitText, CustomEase } = W;

  CustomEase.create('mu.out', '0.16, 1, 0.3, 1');
  CustomEase.create('mu.inOut', '0.76, 0, 0.24, 1');
  CustomEase.create('mu.soft', '0.25, 0.1, 0.25, 1');
  gsap.defaults({ ease: 'mu.out', duration: 1 });
  ScrollTrigger.config({ ignoreMobileResize: true });

  const mq = q => W.matchMedia(q);
  const reduced = mq('(prefers-reduced-motion: reduce)').matches;
  const isTouch = mq('(hover: none), (pointer: coarse)').matches;

  const handlers = {};
  const parts = new Map();
  const done = new WeakSet();
  let holds = 0, ready = false, revealed = false;

  const safe = (name, phase, fn) => {
    try { return fn(); } catch (err) { console.error(`[MU] part "${name}" ${phase} failed:`, err); }
  };
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* ------------------------------------------------------------ number formatting (uz) */
  const NBSP = ' ';
  const fmt = (n, decimals = 0) => {
    const neg = n < 0; n = Math.abs(n);
    const fixed = n.toFixed(decimals);
    let [int, frac] = fixed.split('.');
    int = int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
    return (neg ? '−' : '') + int + (frac ? ',' + frac : '');
  };

  const MU = W.MU = {
    gsap, ScrollTrigger, SplitText, THREE: W.THREE,
    reduced, isTouch,
    get isMobile() { return W.innerWidth <= 768; },
    mm: gsap.matchMedia(),
    lenis: null,
    get ready() { return ready; },
    get revealed() { return revealed; },

    /* register a part (call at script top level) */
    part(name, def = {}) { parts.set(name, Object.assign({ name, root: null }, def)); return MU; },

    on(evt, fn) {
      (handlers[evt] || (handlers[evt] = [])).push(fn);
      if ((evt === 'ready' && ready) || (evt === 'reveal' && revealed)) safe('on:' + evt, 'handler', () => fn());
      return () => { handlers[evt] = (handlers[evt] || []).filter(f => f !== fn); };
    },
    emit(evt, data) { (handlers[evt] || []).slice().forEach(fn => safe('on:' + evt, 'handler', () => fn(data))); },

    /* preloader: const release = MU.holdReveal(); ... release(); */
    holdReveal() {
      holds++;
      let released = false;
      return () => {
        if (released) return;
        released = true; holds--;
        if (holds <= 0 && ready) doReveal();
      };
    },

    scrollTo(target, opts = {}) {
      if (MU.lenis) {
        MU.lenis.scrollTo(target, Object.assign({
          duration: 1.6,
          easing: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
        }, opts));
        return;
      }
      let y = target;
      if (typeof target === 'string') target = D.querySelector(target);
      if (target && target.getBoundingClientRect) y = target.getBoundingClientRect().top + W.scrollY + (opts.offset || 0);
      W.scrollTo({ top: +y || 0, behavior: reduced || opts.immediate ? 'auto' : 'smooth' });
    },

    /* IntersectionObserver helper -> returns disconnect() */
    onVisible(el, cb, margin = '150px') {
      const io = new IntersectionObserver(entries => entries.forEach(e => cb(e.isIntersecting, e)), { rootMargin: margin });
      io.observe(el);
      return () => io.disconnect();
    },

    /* Run fn(timeSec, dtSec, frame) on the gsap ticker ONLY while el is on screen and the tab is visible. */
    renderLoop(el, fn, { margin = '100px' } = {}) {
      let visible = false, active = true, on = false;
      const tick = (time, deltaMs, frame) => fn(time, Math.min(deltaMs, 50) / 1000, frame);
      const update = () => {
        const should = visible && active && !D.hidden;
        if (should && !on) { gsap.ticker.add(tick); on = true; }
        else if (!should && on) { gsap.ticker.remove(tick); on = false; }
      };
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; update(); }, { rootMargin: margin });
      io.observe(el);
      D.addEventListener('visibilitychange', update);
      return {
        start() { active = true; update(); },
        stop() { active = false; update(); },
        get running() { return on; },
        destroy() { active = false; update(); io.disconnect(); D.removeEventListener('visibilitychange', update); }
      };
    },

    dpr(max = 2) { return Math.min(W.devicePixelRatio || 1, W.innerWidth <= 768 ? Math.min(max, 1.5) : max); },
    clamp: (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)),
    lerp: (a, b, t) => a + (b - a) * t,
    map: (v, a, b, c, d) => c + ((v - a) / (b - a)) * (d - c),
    damp: (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt)),
    rand: (a = 0, b = 1) => a + Math.random() * (b - a),
    fmt
  };

  /* ================================================================ behaviors
     Declarative data-attributes, applied per part in DOM order after its init(). */
  const REVEAL = {
    up:    [{ y: 70, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }],
    down:  [{ y: -70, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }],
    left:  [{ x: -90, autoAlpha: 0 }, { x: 0, autoAlpha: 1 }],
    right: [{ x: 90, autoAlpha: 0 }, { x: 0, autoAlpha: 1 }],
    fade:  [{ autoAlpha: 0 }, { autoAlpha: 1 }],
    scale: [{ scale: 0.84, autoAlpha: 0 }, { scale: 1, autoAlpha: 1 }],
    zoom:  [{ scale: 1.18, autoAlpha: 0 }, { scale: 1, autoAlpha: 1 }],
    blur:  [{ y: 30, autoAlpha: 0, filter: 'blur(16px)' }, { y: 0, autoAlpha: 1, filter: 'blur(0px)', clearProps: 'filter' }],
    clip:  [{ clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', clearProps: 'clipPath' }],
    wipe:  [{ clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', clearProps: 'clipPath' }],
    flip:  [{ rotationX: -75, y: 50, autoAlpha: 0, transformPerspective: 1000, transformOrigin: '50% 100%' },
            { rotationX: 0, y: 0, autoAlpha: 1 }]
  };

  const onRevealOrScroll = (el, tween, start = 'top 88%') => {
    if (el.dataset.on === 'reveal') {
      MU.on('reveal', () => tween.play());
    } else {
      ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => tween.play() });
    }
  };

  function bReveal(el) {
    const kind = el.dataset.reveal || 'up';
    const p = REVEAL[kind] || REVEAL.up;
    if (reduced) return;
    const children = el.hasAttribute('data-reveal-children');
    const targets = children ? Array.from(el.children) : el;
    const delay = parseFloat(el.dataset.delay || 0);
    const stagger = parseFloat(el.dataset.stagger || 0.09);
    const duration = parseFloat(el.dataset.duration || (kind === 'clip' || kind === 'wipe' ? 1.4 : 1.2));
    const tw = gsap.fromTo(targets, Object.assign({}, p[0]),
      Object.assign({}, p[1], { duration, delay, stagger: children ? stagger : 0, ease: 'mu.out', paused: true }));
    onRevealOrScroll(el, tw);
  }

  function bSplit(el) {
    const type = el.dataset.split || 'lines';
    if (reduced) return;
    const delay = parseFloat(el.dataset.delay || 0);
    let finished = false;
    const splitType = type === 'chars' ? 'lines,words,chars' : type === 'words' ? 'lines,words' : 'lines';
    SplitText.create(el, {
      type: splitType,
      mask: 'lines',
      autoSplit: true,
      linesClass: 'mu-line',
      wordsClass: 'mu-word',
      charsClass: 'mu-char',
      onSplit(self) {
        if (finished) return;
        const vars = type === 'chars'
          ? { yPercent: 120, rotationX: -70, autoAlpha: 0, transformOrigin: '50% 100%', duration: 1.1, stagger: 0.022 }
          : type === 'words'
            ? { yPercent: 115, rotation: 5, duration: 1.1, stagger: 0.04 }
            : { yPercent: 115, duration: 1.25, stagger: 0.1 };
        Object.assign(vars, { ease: 'mu.out', delay, onComplete: () => { finished = true; } });
        if (el.dataset.on === 'reveal') {
          const tw = gsap.from(self[type], Object.assign(vars, { paused: true }));
          MU.on('reveal', () => tw.play());
          return tw;
        }
        return gsap.from(self[type], Object.assign(vars, { scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
      }
    });
  }

  function bCount(el) {
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || 0, 10);
    const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const o = { v: 0 };
    const render = () => { el.textContent = pre + fmt(o.v, dec) + suf; };
    if (reduced) { o.v = end; render(); return; }
    render();
    const tw = gsap.to(o, { v: end, duration: parseFloat(el.dataset.duration || 2.4), ease: 'power3.out', onUpdate: render, paused: true,
      delay: parseFloat(el.dataset.delay || 0) });
    onRevealOrScroll(el, tw, 'top 92%');
  }

  function bParallax(el) {
    if (reduced) return;
    const s = parseFloat(el.dataset.parallax) || 0.2;
    gsap.fromTo(el, { y: () => W.innerHeight * s * 0.5 }, {
      y: () => -W.innerHeight * s * 0.5, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
    });
  }

  function bMagnetic(el) {
    if (isTouch || reduced) return;
    const s = parseFloat(el.dataset.magnetic) || 0.35;
    const inner = el.querySelector('[data-magnetic-inner]');
    const q = (t, p) => gsap.quickTo(t, p, { duration: 0.6, ease: 'power3.out' });
    const xTo = q(el, 'x'), yTo = q(el, 'y');
    const ixTo = inner && q(inner, 'x'), iyTo = inner && q(inner, 'y');
    let rect = null;
    el.addEventListener('pointerenter', () => { gsap.set(el, { x: 0, y: 0 }); rect = el.getBoundingClientRect(); });
    el.addEventListener('pointermove', e => {
      if (!rect) rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2), dy = e.clientY - (rect.top + rect.height / 2);
      xTo(dx * s); yTo(dy * s);
      if (inner) { ixTo(dx * s * 0.6); iyTo(dy * s * 0.6); }
    });
    el.addEventListener('pointerleave', () => {
      rect = null;
      gsap.to(el, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, 0.35)', overwrite: true });
      if (inner) gsap.to(inner, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, 0.35)', overwrite: true });
    });
  }

  function bTilt(el) {
    if (isTouch || reduced) return;
    const max = parseFloat(el.dataset.tilt) || 8;
    gsap.set(el, { transformPerspective: 1100 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    let rect = null;
    el.addEventListener('pointerenter', () => { rect = el.getBoundingClientRect(); el.classList.add('is-tilting'); });
    el.addEventListener('pointermove', e => {
      if (!rect) rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width, py = (e.clientY - rect.top) / rect.height;
      rx((0.5 - py) * max * 2); ry((px - 0.5) * max * 2);
      el.style.setProperty('--mx', (px * 100).toFixed(2) + '%');
      el.style.setProperty('--my', (py * 100).toFixed(2) + '%');
    });
    el.addEventListener('pointerleave', () => { rect = null; rx(0); ry(0); el.classList.remove('is-tilting'); });
  }

  function bSpotlight(el) {
    if (isTouch) return;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left).toFixed(1) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top).toFixed(1) + 'px');
    });
  }

  function bScramble(el) {
    if (reduced || !W.ScrambleTextPlugin) return;
    const text = el.textContent;
    const tw = gsap.to(el, {
      duration: parseFloat(el.dataset.duration || 1.4), paused: true, delay: parseFloat(el.dataset.delay || 0),
      scrambleText: { text, chars: el.dataset.scramble || 'upperCase', revealDelay: 0.3, speed: 0.6 }, ease: 'none'
    });
    onRevealOrScroll(el, tw, 'top 92%');
  }

  const BEHAVIORS = [
    ['[data-split]', bSplit],
    ['[data-reveal]', bReveal],
    ['[data-count]', bCount],
    ['[data-parallax]', bParallax],
    ['[data-magnetic]', bMagnetic],
    ['[data-tilt]', bTilt],
    ['[data-spotlight]', bSpotlight],
    ['[data-scramble]', bScramble]
  ];

  function behaviors(scope) {
    BEHAVIORS.forEach(([sel, fn]) => {
      const list = scope.matches && scope.matches(sel) ? [scope] : [];
      list.concat(Array.from(scope.querySelectorAll(sel))).forEach(el => {
        const key = sel;
        if (!el.__mu) el.__mu = {};
        if (el.__mu[key]) return;
        el.__mu[key] = true;
        safe('behavior', sel, () => fn(el));
      });
    });
  }
  MU.applyBehaviors = behaviors;

  /* ================================================================ anchors */
  function anchors() {
    D.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      const hash = a.getAttribute('href');
      if (hash.length < 2) { e.preventDefault(); MU.scrollTo(0); return; }
      const target = D.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      MU.emit('navigate', { hash, target });
      MU.scrollTo(target);
    });
  }

  /* ================================================================ lifecycle */
  function boot() {
    root.classList.add('js');
    if (isTouch) root.classList.add('is-touch');
    if (reduced) root.classList.add('is-reduced');
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    W.scrollTo(0, 0);

    if (!reduced && W.Lenis) {
      const lenis = MU.lenis = new W.Lenis({
        duration: 1.15,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.3,
        autoRaf: false
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      if (holds > 0) lenis.stop();
    }
    anchors();

    const fontsReady = D.fonts && D.fonts.ready ? Promise.race([D.fonts.ready, wait(2500)]) : Promise.resolve();
    fontsReady.then(start);
  }

  function start() {
    const seen = new Set();
    D.querySelectorAll('[data-part]').forEach(el => {
      const name = el.dataset.part;
      const def = parts.get(name);
      if (def && !seen.has(name)) {
        seen.add(name);
        def.root = el;
        if (def.init) safe(name, 'init', () => def.init(el, MU));
      }
      behaviors(el);
    });
    parts.forEach((def, name) => {
      if (!seen.has(name) && def.init) safe(name, 'init', () => def.init(null, MU));
    });
    behaviors(D.body);
    ScrollTrigger.refresh();
    ready = true;
    root.classList.add('is-ready');
    MU.emit('ready');
    if (holds <= 0) doReveal();
    else if (MU.lenis) MU.lenis.stop();
  }

  function doReveal() {
    if (revealed) return;
    revealed = true;
    root.classList.add('is-revealed');
    if (MU.lenis) MU.lenis.start();
    parts.forEach((def, name) => { if (def.reveal) safe(name, 'reveal', () => def.reveal(def.root, MU)); });
    MU.emit('reveal');
    setTimeout(() => ScrollTrigger.refresh(), 600);
  }

  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 0);
})();
