/* Dron lentasi: bo’lim sticky sahnaga aylanadi; skroll bilan kadrlar «oldinga uchib» almashadi —
   joriy kadr kattalashib ketadi, keyingisi ustidan chiqadi (Ken Burns). Ba’zi kadrlarda qisqa dron klipi bor:
   faqat faol kadrda, bo’lim ekranda bo’lganda, gorizontal ekranda va Save-Data/sekin tarmoq bo’lmasa o’ynaydi.
   Reduced-motion’da — statik galereya (videolarsiz). */
MU.part('dron', {
  init(root) {
    const { gsap } = MU;
    const items = Array.from(root.querySelectorAll('.dr-item'));
    const n = items.length;
    const chapters = Array.from(root.querySelectorAll('.dr-chapters button'));
    items.forEach((item, i) => { item.id = 'dr-kadr-' + (i + 1); });
    const countB = root.querySelector('.dr-count b'), prog = root.querySelector('.dr-prog b');
    MU.mm.add('(prefers-reduced-motion: no-preference)', () => {
      root.classList.add('is-live');
      /* sahnaga yaqinlashganda hamma kadrlar yuklansin */
      const disconnect = MU.onVisible(root, v => { if (v) items.forEach(it => { const im = it.querySelector('img'); if (im) im.loading = 'eager'; }); }, '600px');
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
      /* dron kliplari */
      const conn = navigator.connection || {};
      const videoOk = () => !(conn.saveData || /(^|slow-)2g|3g/.test(conn.effectiveType || '')) && matchMedia('(min-aspect-ratio: 1/1)').matches;
      const vids = items.map(it => it.querySelector('.dr-vid'));
      let active = -1, inView = false;
      const sync = () => vids.forEach((v, j) => {
        if (!v) return;
        if (j === active && inView && !document.hidden && videoOk()) {
          if (!v.getAttribute('src')) { v.addEventListener('playing', () => v.classList.add('is-on'), { once: true }); v.src = v.dataset.src; }
          const pr = v.play(); if (pr && pr.catch) pr.catch(() => {});
        } else if (!v.paused) v.pause();
      });
      const st = MU.ScrollTrigger.create({
        trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.6, animation: tl,
        onToggle(self) { inView = self.isActive; sync(); }
      });
      // Use rendered timeline time: the counter and clip follow the visible scene during scrub.
      const updateChapter = () => {
          const i = Math.min(n - 1, Math.floor((tl.time() + 0.225) / 1.45));
          countB.textContent = String(i + 1).padStart(2, '0');
          gsap.set(prog, { scaleX: tl.progress() });
          if (i !== active) {
            active = i;
            chapters.forEach((b, j) => { if (j === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
            sync();
          }
      };
      tl.eventCallback('onUpdate', updateChapter);
      updateChapter();
      const selectChapter = e => {
        const i = chapters.indexOf(e.currentTarget);
        const p = (i * 1.45 + 0.4) / tl.duration();
        MU.scrollTo(st.start + (st.end - st.start) * p, { duration: 0.9 });
      };
      chapters.forEach(b => b.addEventListener('click', selectChapter));
      document.addEventListener('visibilitychange', sync);
      window.addEventListener('resize', sync, { passive: true });
      if (conn.addEventListener) conn.addEventListener('change', sync);
      MU.ScrollTrigger.refresh();
      return () => {
        chapters.forEach(b => b.removeEventListener('click', selectChapter));
        document.removeEventListener('visibilitychange', sync);
        window.removeEventListener('resize', sync);
        if (conn.removeEventListener) conn.removeEventListener('change', sync);
        disconnect(); vids.forEach(v => v && v.pause()); st.kill(); tl.kill();
        root.classList.remove('is-live'); gsap.set([items, imgs, caps], { clearProps: 'all' });
      };
    });
  }
});
