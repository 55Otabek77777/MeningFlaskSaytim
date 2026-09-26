/* ==========================================================================
   02 · XIZMATLAR (services) — owner D
   6 cards: 3D flip-in, DrawSVG icons + idle micro-loops (only while visible),
   hover: tilt/glare (core data-tilt) + conic border + loop speed-up.
   ========================================================================== */
MU.part('services', {
  init(root, MU) {
    if (!root) return;
    const { gsap, ScrollTrigger } = MU;
    const $ = (s, el = root) => el.querySelector(s);
    const $$ = (s, el = root) => Array.from(el.querySelectorAll(s));
    const reduced = MU.reduced;

    /* ---------------------------------------------------------- ring ticks */
    const ticks = $('.svc-bg__ticks');
    if (ticks) {
      const NS = 'http://www.w3.org/2000/svg';
      for (let i = 0; i < 120; i++) {
        const a = (i / 120) * Math.PI * 2, long = i % 10 === 0;
        const r1 = 390, r2 = long ? 368 : 380;
        const l = document.createElementNS(NS, 'line');
        l.setAttribute('x1', (Math.cos(a) * r1).toFixed(1)); l.setAttribute('y1', (Math.sin(a) * r1).toFixed(1));
        l.setAttribute('x2', (Math.cos(a) * r2).toFixed(1)); l.setAttribute('y2', (Math.sin(a) * r2).toFixed(1));
        ticks.appendChild(l);
      }
    }

    /* ---------------------------------------------------------- section visibility (CSS loops) */
    MU.onVisible(root, v => root.classList.toggle('svc-on', v && !reduced), '100px');

    /* ---------------------------------------------------------- icon idle loops */
    const loops = {
      truck(svg) {
        const tl = gsap.timeline({ paused: true });
        tl.to($$('.svc-i-wheel', svg), { rotation: 360, transformOrigin: '50% 50%', duration: .8, ease: 'none', repeat: -1 }, 0);
        tl.fromTo($('.svc-i-dash', svg), { x: 0 }, { x: -20, duration: .42, ease: 'none', repeat: -1 }, 0);
        tl.to($('.svc-i-body', svg), { y: -1.2, duration: .22, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0);
        tl.fromTo($$('.svc-i-speed line', svg), { x: 6, opacity: 0 }, { x: -6, opacity: 1, duration: .5, ease: 'none', stagger: { each: .16, repeat: -1 } }, 0);
        tl.to($('.svc-i-beam', svg), { opacity: 1, duration: .6, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0);
        return tl;
      },
      train(svg) {
        const tl = gsap.timeline({ paused: true });
        tl.to($$('.svc-i-wheel', svg), { rotation: 360, transformOrigin: '50% 50%', duration: .7, ease: 'none', repeat: -1 }, 0);
        tl.fromTo($('.svc-i-dash', svg), { x: 0 }, { x: -10, duration: .26, ease: 'none', repeat: -1 }, 0);
        tl.to($('.svc-i-body', svg), { y: -.8, duration: .13, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0);
        const puffs = $$('.svc-i-smoke circle', svg);
        puffs.forEach((p, i) => {
          tl.fromTo(p, { x: 6 - i * 5, y: 10 - i * 8, scale: .3, transformOrigin: '50% 50%' },
            { x: -8 - i * 4, y: -8 - i * 5, scale: 1.25, duration: 1.8, ease: 'sine.out', repeat: -1 }, i * .6);
          tl.fromTo(p, { opacity: 0 }, { opacity: 1, duration: .9, ease: 'sine.inOut', yoyo: true, repeat: -1 }, i * .6);
        });
        return tl;
      },
      ship(svg) {
        const tl = gsap.timeline({ paused: true });
        tl.fromTo($('.svc-i-body', svg), { rotation: -3, y: 0 }, { rotation: 3, y: -1.5, transformOrigin: '50% 90%', duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0);
        tl.fromTo($('.svc-i-wave', svg), { x: 0 }, { x: -20, duration: 1.4, ease: 'none', repeat: -1 }, 0);
        tl.fromTo($('.svc-i-wave2', svg), { x: -20 }, { x: 0, duration: 2, ease: 'none', repeat: -1 }, 0);
        return tl;
      },
      plane(svg) {
        const tl = gsap.timeline({ paused: true });
        tl.fromTo($('.svc-i-body', svg), { rotation: -6 }, { rotation: 5, transformOrigin: '55% 50%', duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0);
        tl.fromTo($('.svc-i-body', svg), { y: 2 }, { y: -3, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0);
        tl.fromTo($('.svc-i-cloud', svg), { x: 100 }, { x: -50, duration: 3.2, ease: 'none', repeat: -1 }, 0);
        tl.fromTo($('.svc-i-cloud2', svg), { x: 30 }, { x: -120, duration: 4.6, ease: 'none', repeat: -1 }, 0);
        tl.fromTo($('.svc-i-trail', svg), { x: 4, opacity: .2 }, { x: -6, opacity: 1, duration: .35, ease: 'none', yoyo: true, repeat: -1 }, 0);
        return tl;
      },
      boxes(svg) {
        const boxes = $$('.svc-i-box', svg), scan = $('.svc-i-scan', svg);
        const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: .3 });
        tl.set(boxes, { y: -70, opacity: 0 })
          .to(boxes, { y: 0, opacity: 1, duration: .75, ease: 'bounce.out', stagger: .32 })
          .fromTo(scan, { opacity: 0, y: 0 }, { opacity: 1, duration: .2 }, '-=.2')
          .to(scan, { y: 30, duration: .9, ease: 'sine.inOut', yoyo: true, repeat: 1 })
          .to(scan, { opacity: 0, duration: .2 })
          .to(boxes, { y: -6, opacity: 0, duration: .45, ease: 'power2.in', stagger: .06 }, '+=.9');
        return tl;
      },
      stamp(svg) {
        const st = $('.svc-i-stamp', svg), mark = $('.svc-i-mark', svg);
        const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: .2 });
        tl.set(mark, { opacity: 0, scale: .2, transformOrigin: '50% 50%' })
          .to(st, { x: -36, y: 28, duration: .7, ease: 'power3.inOut' }, .2)
          .to(st, { y: 36, duration: .14, ease: 'power4.in' })
          .to(mark, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(3)' })
          .to(svg, { x: 1.5, duration: .05, yoyo: true, repeat: 3, ease: 'none' }, '<')
          .to(st, { y: 0, x: 0, duration: .8, ease: 'power3.inOut' }, '+=.08')
          .to(mark, { opacity: 0, duration: .4 }, '+=1.1');
        return tl;
      }
    };

    const cards = $$('.svc-item').map((item, idx) => {
      const flip = $('.svc-flip', item), card = $('.svc-card', item), svg = $('.svc-ico', item);
      const kind = svg && svg.dataset.ico;
      const c = { item, flip, card, svg, idx, drawn: false, vis: false, loop: null };
      if (!reduced && svg && loops[kind]) c.loop = loops[kind](svg);
      return c;
    });

    const sync = c => {
      if (!c.loop) return;
      if (c.drawn && c.vis) c.loop.play(); else c.loop.pause();
    };
    cards.forEach(c => {
      MU.onVisible(c.card, v => { c.vis = v; sync(c); }, '60px');
      if (c.loop && !MU.isTouch) {
        c.card.addEventListener('pointerenter', () => gsap.to(c.loop, { timeScale: 2.3, duration: .6, ease: 'power2.out' }));
        c.card.addEventListener('pointerleave', () => gsap.to(c.loop, { timeScale: 1, duration: .9, ease: 'power2.out' }));
      }
    });

    /* ---------------------------------------------------------- "Batafsil" -> modes panel */
    $$('[data-svc-panel]').forEach(a => a.addEventListener('click', e => {
      if (!document.getElementById('transport')) return;
      e.preventDefault(); e.stopPropagation();
      MU.emit('modes:go', parseInt(a.dataset.svcPanel, 10) || 0);
    }));

    /* ---------------------------------------------------------- live counter */
    const liveVal = $('[data-svc-live]'), bars = $$('.svc-live__bars i');
    let live = 1128, liveCall = null, liveOn = false;
    const liveTick = () => {
      live += Math.round(MU.rand(-2, 5));
      if (liveVal) {
        gsap.timeline()
          .to(liveVal, { yPercent: -45, opacity: 0, duration: .25, ease: 'power2.in' })
          .add(() => { liveVal.textContent = MU.fmt(live); })
          .fromTo(liveVal, { yPercent: 55, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .55, ease: 'back.out(2)' });
      }
      gsap.to(bars, { scaleY: () => MU.rand(.18, 1), duration: .9, ease: 'power3.inOut', stagger: .025 });
      liveCall = gsap.delayedCall(MU.rand(1.8, 3.2), liveTick);
    };
    if (reduced) gsap.set(bars, { scaleY: i => .3 + ((i * 37) % 70) / 100 });
    else if (liveVal) {
      MU.onVisible(liveVal.closest('.svc-live'), v => {
        if (v && !liveOn) { liveOn = true; liveCall = gsap.delayedCall(.6, liveTick); }
        else if (!v && liveOn) { liveOn = false; if (liveCall) liveCall.kill(); }
      }, '0px');
    }

    /* ---------------------------------------------------------- reduced motion: final state */
    if (reduced) {
      cards.forEach(c => { const m = c.svg && $('.svc-i-mark', c.svg); if (m) gsap.set(m, { opacity: 1 }); });
      return;
    }

    /* ---------------------------------------------------------- reveal choreography */
    const flips = cards.map(c => c.flip);
    gsap.set(flips, { autoAlpha: 0, rotationX: -64, y: 110, z: -60, transformPerspective: 1300, transformOrigin: '50% 0%' });
    cards.forEach(c => {
      if (!c.svg) return;
      if (c.svg.dataset.ico === 'stamp') gsap.set($('.svc-i-mark', c.svg), { opacity: 0 });
    });

    const revealCard = (c, delay) => {
      const ds = $$('.d', c.svg);
      const fills = $$('.f', c.svg);
      const chips = $$('.svc-card__chips .chip', c.card);
      const tl = gsap.timeline({ delay });
      tl.to(c.flip, { autoAlpha: 1, rotationX: 0, y: 0, z: 0, duration: 1.35, ease: 'mu.out', clearProps: 'transform' }, 0);
      if (ds.length) tl.fromTo(ds, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.1, ease: 'power2.inOut', stagger: .035 }, .3);
      if (fills.length) tl.fromTo(fills, { fillOpacity: 0 }, { fillOpacity: 1, duration: .6 }, 1.1);
      tl.from($('.svc-icon__halo', c.card), { scale: .2, opacity: 0, duration: 1.2 }, .25);
      if (chips.length) tl.from(chips, { y: 16, autoAlpha: 0, duration: .7, stagger: .07 }, .55);
      tl.from($('.svc-card__more', c.card), { y: 14, autoAlpha: 0, duration: .7 }, .75);
      tl.add(() => { c.drawn = true; sync(c); }, 1.2);
    };

    ScrollTrigger.batch(flips, {
      start: 'top 90%',
      once: true,
      onEnter: batch => batch.forEach((el, k) => {
        const c = cards.find(x => x.flip === el);
        if (c) revealCard(c, k * .13);
      })
    });

    /* ---------------------------------------------------------- scroll-linked motion */
    const word = $('.svc-bg__word'), rings = $('.svc-bg__rings');
    if (word) gsap.fromTo(word, { xPercent: 4 }, { xPercent: -32, ease: 'none',
      scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true } });
    if (rings) gsap.fromTo(rings, { rotation: -25 }, { rotation: 65, ease: 'none',
      scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true } });

    const glows = $$('.svc-bg__glow');
    if (glows.length) gsap.fromTo(glows, { y: i => (i ? 120 : -60) }, { y: i => (i ? -160 : 140), x: i => (i ? -80 : 90), ease: 'none',
      scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true } });

    MU.mm.add('(min-width: 1101px)', () => {
      const mid = cards.filter(c => c.idx % 3 === 1).map(c => c.item);
      const side = cards.filter(c => c.idx % 3 !== 1).map(c => c.item);
      gsap.fromTo(mid, { y: 90 }, { y: -30, ease: 'none',
        scrollTrigger: { trigger: $('.svc-grid'), start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
      gsap.fromTo(side, { y: 20 }, { y: -10, ease: 'none',
        scrollTrigger: { trigger: $('.svc-grid'), start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
    });
  }
});
