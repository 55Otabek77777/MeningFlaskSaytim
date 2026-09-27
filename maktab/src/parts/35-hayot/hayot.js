MU.part('hayot', {
  init(root) {
    const { gsap, ScrollTrigger } = MU;
    const q = s => root.querySelector(s), qa = s => Array.from(root.querySelectorAll(s));
    const NS = 'http://www.w3.org/2000/svg';
    const svgEl = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); parent.appendChild(e); return e; };
    const loops = [];
    const loop = tl => { tl.pause(); loops.push(tl); return tl; };
    MU.onVisible(root, v => { root.classList.toggle('is-inview', v); if (!MU.reduced) loops.forEach(t => (v ? t.play() : t.pause())); });

    /* ---------- 1: kalendar (2 haftada bir marta uyga ruxsat) + yotoqxona oynalari */
    const grid = q('.hy-cal__grid');
    const cells = Array.from({ length: 28 }, (_, i) => {
      const c = document.createElement('i'); const wd = i % 7, wk = Math.floor(i / 7);
      c.dataset.kind = wd >= 5 && (wk === 1 || wk === 3) ? 'home' : wd < 6 ? 'lesson' : 'rest';
      grid.appendChild(c); return c;
    });
    const wins = q('.hd-wins');
    const winEls = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
      if (r === 2 && (c === 2 || c === 3)) continue;
      winEls.push(svgEl('rect', { x: 58 + c * 34, y: 58 + r * 38, width: 22, height: 24, rx: 3 }, wins));
    }
    const fillCal = () => cells.forEach(c => c.classList.add(c.dataset.kind === 'home' ? 'is-home' : c.dataset.kind === 'lesson' ? 'is-lesson' : 'x'));
    if (MU.reduced) { fillCal(); winEls.forEach((w, i) => i % 3 === 0 && w.classList.add('is-lit')); }
    else {
      ScrollTrigger.create({ trigger: grid, start: 'top 90%', once: true, onEnter: () => cells.forEach((c, i) => setTimeout(() => c.classList.add(c.dataset.kind === 'home' ? 'is-home' : c.dataset.kind === 'lesson' ? 'is-lesson' : 'x'), i * 45)) });
      loop(gsap.timeline({ repeat: -1 }).call(() => { winEls.forEach(w => w.classList.toggle('is-lit', Math.random() < 0.45)); }).to({}, { duration: 1.4 }));
    }

    /* ---------- 2: Face ID skaner + Telegram xabarlari (animated list) */
    const dotsG = q('.hs-dots');
    [[66, 60], [94, 60], [80, 74], [70, 84], [90, 84], [80, 50]].forEach(([x, y]) => svgEl('circle', { cx: x, cy: y, r: 2.6 }, dotsG));
    const msgs = qa('.hy-msgs li');
    if (MU.reduced) gsap.set('.hy-scan__ok', { opacity: 1 });
    else {
      const tl = loop(gsap.timeline({ repeat: -1, repeatDelay: 1.2 }));
      tl.set(msgs, { autoAlpha: 0, y: 24, scale: 0.94 })
        .set(q('.hy-scan__ok'), { opacity: 0, scale: 0.6 })
        .set(dotsG.children, { scale: 0, transformOrigin: '50% 50%' })
        .fromTo(q('.hy-scan__line'), { top: '14%' }, { top: '84%', duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: 1 })
        .to(dotsG.children, { scale: 1, duration: 0.3, stagger: 0.07, ease: 'back.out(3)' }, 0.5)
        .to(q('.hy-scan__ok'), { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' })
        .to(msgs[0], { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, '+=0.2')
        .to(msgs[1], { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, '+=1.1')
        .to(msgs[2], { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, '+=1.1')
        .to({}, { duration: 2.2 });
    }

    /* ---------- 3: EKG chizig’i */
    const ecg = q('.he-line');
    if (!MU.reduced) loop(gsap.timeline({ repeat: -1 }).fromTo(ecg, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 1.6, ease: 'none' }).to(ecg, { drawSVG: '100% 100%', duration: 1.1, ease: 'none' }));

    /* ---------- 4: 24 soatlik soat (07:00–21:30) + poyezd */
    const ticksG = q('.hc-ticks');
    for (let h = 0; h < 24; h++) {
      const a = (h / 24) * Math.PI * 2 - Math.PI / 2, r1 = h % 6 === 0 ? 70 : 76;
      svgEl('line', { x1: 100 + Math.cos(a) * r1, y1: 100 + Math.sin(a) * r1, x2: 100 + Math.cos(a) * 82, y2: 100 + Math.sin(a) * 82 }, ticksG);
    }
    const ang = h => (h / 24) * Math.PI * 2 - Math.PI / 2, R = 62;
    const a0 = ang(7), a1 = ang(21.5);
    q('.hc-arc').setAttribute('d', `M${100 + Math.cos(a0) * R} ${100 + Math.sin(a0) * R} A${R} ${R} 0 1 1 ${100 + Math.cos(a1) * R} ${100 + Math.sin(a1) * R}`);
    const hh = q('.hc-hand--h'), mm = q('.hc-hand--m');
    gsap.set([hh, mm], { svgOrigin: '100 100' });
    if (MU.reduced) gsap.set(hh, { rotation: 7 / 24 * 360 });
    else {
      gsap.from(q('.hc-arc'), { drawSVG: '0%', duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: q('.hy-clock'), start: 'top 85%', once: true } });
      loop(gsap.timeline({ repeat: -1 }).fromTo(hh, { rotation: 7 / 24 * 360 }, { rotation: 21.5 / 24 * 360, duration: 7, ease: 'none' }));
      loop(gsap.timeline({ repeat: -1 }).fromTo(mm, { rotation: 0 }, { rotation: 360, duration: 0.5, ease: 'none' }));
    }
    const sl = q('.hr-sleepers');
    for (let x = 16; x < 306; x += 18) svgEl('line', { x1: x, y1: 50, x2: x, y2: 58 }, sl);
    if (!MU.reduced) loop(gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 0.8 }).fromTo(q('.hr-train'), { x: 0 }, { x: 222, duration: 3.2, ease: 'power1.inOut' }));

    /* ---------- gorizontal pin (desktop) */
    const pinEl = q('.hy-pin'), track = q('.hy-track'), tabs = qa('.hy-tab'), bar = q('.hy-tabs__bar b');
    MU.mm.add('(min-width: 901px)', () => {
      if (MU.reduced) return;
      const dist = () => track.scrollWidth - innerWidth;
      const tw = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: pinEl, start: 'top top+=76', end: () => '+=' + dist(), pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: s => {
            gsap.set(bar, { scaleX: s.progress });
            const i = Math.min(tabs.length - 1, Math.round(s.progress * (tabs.length - 1)));
            tabs.forEach((t, k) => t.classList.toggle('is-on', k === i));
          }
        }
      });
      qa('.hy-panel').forEach((p, i) => {
        if (!i) return;
        gsap.from(p.querySelector('.hy-panel__in'), { scale: 0.88, rotationY: -12, autoAlpha: 0.3, transformPerspective: 1400, ease: 'none',
          scrollTrigger: { trigger: p, containerAnimation: tw, start: 'left right', end: 'left 35%', scrub: true } });
        gsap.from(p.querySelectorAll('.hy-facts li'), { x: 60, autoAlpha: 0, stagger: 0.1, ease: 'none',
          scrollTrigger: { trigger: p, containerAnimation: tw, start: 'left 80%', end: 'left 30%', scrub: true } });
      });
      return () => gsap.set(track, { clearProps: 'transform' });
    });
  }
});
