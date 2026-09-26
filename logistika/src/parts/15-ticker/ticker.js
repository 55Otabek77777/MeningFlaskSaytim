/* ==========================================================================
   15-ticker — velocity-reactive crossing marquees.
   Seamless: each band clones its group until it covers the band width + one
   group, and wraps by the exact (sub-pixel) group period. Scroll velocity
   boosts speed, flips direction with scroll direction and skews the type.
   The girih separators roll with the distance travelled.
   ========================================================================== */
MU.part('ticker', {
  init(root, MU) {
    const { gsap, ScrollTrigger } = MU;
    const bands = Array.from(root.querySelectorAll('.tkr-band')).map(band => ({
      band,
      inner: band.querySelector('.tkr-band__in'),
      track: band.querySelector('.tkr-track'),
      group: band.querySelector('.tkr-group'),
      dir: parseFloat(band.dataset.dir) || -1,
      speed: parseFloat(band.dataset.speed) || 60,
      x: 0, w: 1, hover: 1, hoverT: 1
    }));

    const build = b => {
      b.track.querySelectorAll('[data-tkr-clone]').forEach(n => n.remove());
      const add = () => {
        const c = b.group.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        c.removeAttribute('aria-label');
        c.setAttribute('data-tkr-clone', '');
        b.track.appendChild(c);
        return c;
      };
      const first = add();
      /* exact period: distance between the group and its first clone (rotation-invariant) */
      const r1 = b.group.getBoundingClientRect(), r2 = first.getBoundingClientRect();
      b.w = Math.hypot(r2.left - r1.left, r2.top - r1.top) || b.group.offsetWidth || 1;
      const need = Math.ceil(b.band.offsetWidth / b.w) + 1;
      for (let i = 1; i < need; i++) add();
      b.x = ((b.x % b.w) - b.w) % b.w;
    };
    const buildAll = () => bands.forEach(b => {
      const t = b.track.style.transform;
      b.track.style.transform = 'none';
      build(b);
      b.track.style.transform = t;
    });
    buildAll();
    let lastW = window.innerWidth;
    const ro = new ResizeObserver(() => {
      if (Math.abs(window.innerWidth - lastW) < 2) return;
      lastW = window.innerWidth; buildAll();
    });
    ro.observe(root);
    if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(buildAll);

    /* hover: slow the band down (desktop) */
    if (!MU.isTouch) bands.forEach(b => {
      b.band.addEventListener('pointerenter', () => { b.hoverT = 0.18; });
      b.band.addEventListener('pointerleave', () => { b.hoverT = 1; });
    });

    MU.onVisible(root, v => root.classList.toggle('is-inview', v), '0px');

    /* scroll-linked crossing: the bands open like scissors as the section passes */
    if (!MU.reduced) {
      const narrow = window.matchMedia('(max-width: 768px)').matches;
      const a = narrow ? [-7, -10.5, -14] : [-2, -6, -10];
      const g = narrow ? [6, 9.5, 13] : [2, 5.5, 9];
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
      })
        .fromTo(bands[0].band, { yPercent: -50, rotation: a[0], xPercent: 3 }, { rotation: a[2], xPercent: -3 }, 0)
        .fromTo(bands[1].band, { yPercent: -50, rotation: g[0], xPercent: -3 }, { rotation: g[2], xPercent: 3 }, 0);

      /* entrance: bands wipe in from opposite sides */
      bands.forEach((b, i) => {
        gsap.fromTo(b.inner, { clipPath: i ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' }, {
          clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', delay: i * 0.12,
          clearProps: 'clipPath',
          scrollTrigger: { trigger: root, start: 'top 85%', once: true }
        });
      });
    }

    /* velocity from ScrollTrigger (works for Lenis + native touch scroll) */
    let vel = 0, velAt = 0, sdir = 1, sv = 0, skew = 0;
    ScrollTrigger.create({
      trigger: root, start: 'top bottom', end: 'bottom top',
      onUpdate: s => { vel = s.getVelocity(); velAt = performance.now(); if (s.direction) sdir = s.direction; }
    });

    const render = () => bands.forEach(b => {
      b.track.style.transform = `translate3d(${b.x.toFixed(2)}px,0,0) skewX(${(skew * -b.dir * sdir).toFixed(2)}deg)`;
      b.track.style.setProperty('--tkr-rot', (b.x * 0.55 * b.dir).toFixed(1) + 'deg');
    });

    if (MU.reduced) { render(); return; }

    MU.renderLoop(root, (t, dt) => {
      const target = performance.now() - velAt > 140 ? 0 : vel;
      sv = MU.damp(sv, target, 5, dt);
      const boost = 1 + Math.min(Math.abs(sv) / 260, 9);
      skew = MU.damp(skew, MU.clamp(Math.abs(sv) / 160, 0, 11), 7, dt);
      bands.forEach(b => {
        b.hover = MU.damp(b.hover, b.hoverT, 5, dt);
        b.x += b.dir * sdir * b.speed * boost * b.hover * dt;
        if (b.x <= -b.w || b.x > 0) b.x = ((b.x % b.w) - b.w) % b.w;
      });
      render();
    });
  }
});
