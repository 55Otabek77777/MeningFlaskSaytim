/* ==========================================================================
   60-process · Qanday ishlaymiz — 5 steps.
   Desktop: sticky astrolabe dial (rolling step number, 5-sector ring, orbit dot,
   swapping titles, girih rotating with scroll) + cards that light up in turn along
   a gradient-filling timeline. Mobile: left timeline with nodes.
   ========================================================================== */
MU.part('process', {
  init(root, MU) {
    if (!root) return;
    const { gsap, ScrollTrigger } = MU;
    const q = s => root.querySelector(s), qa = s => Array.from(root.querySelectorAll(s));
    const clamp = MU.clamp;
    const smooth = t => t * t * (3 - 2 * t);
    const NS = 'http://www.w3.org/2000/svg';
    const mk = (tag, attrs, parent) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      parent.appendChild(e);
      return e;
    };

    const steps = qa('.prc-step'), nodes = qa('.prc-node'), jumps = qa('.prc-jump__b');
    const N = steps.length;
    const track = q('.prc-track'), line = q('.prc-line'), fill = q('.prc-line__fill'), head = q('.prc-line__head');
    const strip = q('.prc-num__strip'), tstrip = q('.prc-side__strip');
    const orbit = q('.prc-orbit'), girih = q('.prc-girih');

    /* ---------------------------------------------------------------- dial geometry */
    const ticks = q('.prc-ticks');
    for (let i = 0; i < 72; i++) {
      const major = i % 3 === 0;
      mk('line', { x1: 160, y1: 6, x2: 160, y2: major ? 15 : 11, class: major ? 'is-major' : '', transform: `rotate(${i * 5} 160 160)` }, ticks);
    }
    const segsG = q('.prc-segs');
    const SEG = 66;              /* degrees per sector (72 minus the gap) */
    const segs = [];
    for (let i = 0; i < N; i++) {
      const rot = `rotate(${i * 72 - 90 + 3} 160 160)`;
      mk('circle', { class: 'prc-seg-bg', cx: 160, cy: 160, r: 136, pathLength: 360, 'stroke-dasharray': `${SEG} ${360 - SEG}`, transform: rot }, segsG);
      segs.push(mk('circle', { class: 'prc-seg', cx: 160, cy: 160, r: 136, pathLength: 360, 'stroke-dasharray': `0 360`, transform: rot }, segsG));
    }

    /* ---------------------------------------------------------------- measure + state */
    let centers = new Array(N).fill(0), span = 1;
    const measure = () => {
      /* node centres (desktop: card middle, mobile: near the card top) — layout values, immune to reveal transforms */
      centers = steps.map((li, i) => li.offsetTop + nodes[i].offsetTop + nodes[i].offsetHeight / 2);
      span = Math.max(1, centers[N - 1] - centers[0]);
      line.style.top = centers[0] + 'px';
      line.style.height = span + 'px';
    };
    measure();

    const last = { act: -1, segs: [], x: -1 };
    function update(prog) {
      const y = centers[0] + prog * span;
      let k = 0;
      while (k < N - 2 && y > centers[k + 1]) k++;
      const x = clamp(k + (y - centers[k]) / Math.max(1, centers[k + 1] - centers[k]), 0, N - 1);
      const act = Math.round(x);
      if (Math.abs(x - last.x) > 1e-4) {
        last.x = x;
        const f = Math.floor(x), fr = x - f;
        const stepped = MU.reduced ? act : Math.min(N - 1, f + smooth(clamp((fr - 0.3) / 0.4)));
        strip.style.transform = `translate3d(0, ${(-stepped * 100 / N).toFixed(3)}%, 0)`;
        tstrip.style.transform = `translate3d(0, ${(-stepped * 100 / N).toFixed(3)}%, 0)`;
        fill.style.transform = `scaleY(${prog.toFixed(4)})`;
        head.style.transform = `translate3d(0, ${(prog * span).toFixed(1)}px, 0)`;
        segs.forEach((s, i) => {
          const v = Math.round(clamp(x - i + 1) * SEG * 10) / 10;
          if (v !== last.segs[i]) { last.segs[i] = v; s.setAttribute('stroke-dasharray', `${v} ${360 - v}`); }
        });
        /* orbit dot rides the head of the filled arc */
        const j = Math.min(N - 1, Math.ceil(x + 1 - 1e-6) - 1);
        const ang = j * 72 + 3 + clamp(x - j + 1) * SEG;
        orbit.setAttribute('transform', `rotate(${ang.toFixed(2)} 160 160)`);
        if (girih && !MU.reduced) girih.style.transform = `rotate(${(prog * 90).toFixed(2)}deg)`;
        nodes.forEach((n, i) => n.classList.toggle('is-on', i <= x + 0.02));
      }
      if (act !== last.act) {
        last.act = act;
        steps.forEach((s, i) => s.classList.toggle('is-active', i === act));
        jumps.forEach((b, i) => {
          b.classList.toggle('is-active', i === act);
          b.classList.toggle('is-done', i < act);
          if (i === act) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
        });
      }
    }

    /* ---------------------------------------------------------------- scroll: reading line at 55% of the viewport */
    const READ = 55;
    const st = ScrollTrigger.create({
      trigger: track,
      start: () => { measure(); return `top+=${centers[0]} ${READ}%`; },
      end: () => `top+=${centers[N - 1]} ${READ}%`,
      invalidateOnRefresh: true,
      onUpdate: self => update(self.progress),
      onRefresh: self => update(self.progress)
    });
    update(0);

    /* jump buttons */
    jumps.forEach((b, i) => b.addEventListener('click', () => {
      const y = st.start + ((centers[i] - centers[0]) / span) * (st.end - st.start);
      MU.scrollTo(y + 2, { duration: 1.2 });
    }));

    /* CSS loops (icons, conic border, rings) only while on screen */
    MU.onVisible(root, v => root.classList.toggle('is-inview', v), '80px');

    /* entrance: ring sectors + ticks sweep in when the dial reveals */
    if (!MU.reduced) {
      const tl = gsap.timeline({ paused: true });
      tl.from(ticks.children, { opacity: 0, duration: 0.6, stagger: { each: 0.012, from: 'start' }, ease: 'power1.out' }, 0.2)
        .from(q('.prc-num'), { yPercent: 40, opacity: 0, duration: 1.2 }, 0.35)
        .from(q('.prc-side__titles'), { y: 24, opacity: 0, duration: 1 }, 0.5)
        .from(jumps, { scaleX: 0, opacity: 0, duration: 0.7, stagger: 0.06 }, 0.6);
      ScrollTrigger.create({ trigger: q('.prc-grid'), start: 'top 80%', once: true, onEnter: () => tl.play() });
    }
  }
});
