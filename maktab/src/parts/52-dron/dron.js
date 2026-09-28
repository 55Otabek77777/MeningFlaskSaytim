/* Dron lentasi: bo’lim sticky sahnaga aylanadi; skroll bilan kadrlar «oldinga uchib» almashadi —
   joriy kadr kattalashib so’nadi, keyingisi uzoqdan yaqinlashib chiqadi (Ken Burns). Reduced-motion’da — statik galereya. */
MU.part('dron', {
  init(root) {
    const { gsap } = MU;
    const items = Array.from(root.querySelectorAll('.dr-item'));
    const n = items.length;
    const countB = root.querySelector('.dr-count b'), prog = root.querySelector('.dr-prog b');
    MU.mm.add('(prefers-reduced-motion: no-preference)', () => {
      root.classList.add('is-live');
      /* sahnaga yaqinlashganda hamma kadrlar yuklansin */
      MU.onVisible(root, v => { if (v) items.forEach(it => { const im = it.querySelector('img'); if (im) im.loading = 'eager'; }); }, '600px');
      const imgs = items.map(it => it.querySelector('.dr-ph'));
      const caps = items.map(it => it.querySelector('.dr-cap'));
      gsap.set(items, { autoAlpha: 0 }); gsap.set(items[0], { autoAlpha: 1 });
      gsap.set(caps.slice(1), { autoAlpha: 0, y: 30 });
      const tl = gsap.timeline({ defaults: { ease: 'none' } });
      /* har kadr: 1 birlik «uchish» (sekin yaqinlashish) + 0.45 birlik o’tish */
      items.forEach((it, i) => {
        const at = i * 1.45;
        tl.fromTo(imgs[i], { scale: 1.16, yPercent: 2 }, { scale: 1.0, yPercent: -2, duration: 1.45 + (i < n - 1 ? 0.45 : 0) }, at);
        if (i === n - 1) return;
        const t = at + 1.0;
        /* eski kadr to’liq ko’rinib turadi va oldinga «uchadi», yangisi ustidan chiqadi (qorong’i o’tish yo’q) */
        tl.to(imgs[i], { scale: 1.32, duration: 0.45, ease: 'power1.in' }, t)
          .to(caps[i], { autoAlpha: 0, y: -24, duration: 0.3 }, t)
          .fromTo(items[i + 1], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: 'power1.inOut' }, t)
          .set(items[i], { autoAlpha: 0 }, t + 0.45)
          .to(caps[i + 1], { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, t + 0.25);
      });
      const st = MU.ScrollTrigger.create({
        trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.6, animation: tl,
        onUpdate(self) {
          const i = Math.min(n - 1, Math.floor(self.progress * n * 0.999));
          countB.textContent = String(i + 1).padStart(2, '0');
          gsap.set(prog, { scaleX: self.progress });
        }
      });
      MU.ScrollTrigger.refresh();
      return () => { st.kill(); tl.kill(); root.classList.remove('is-live'); gsap.set([items, imgs, caps], { clearProps: 'all' }); };
    });
  }
});
