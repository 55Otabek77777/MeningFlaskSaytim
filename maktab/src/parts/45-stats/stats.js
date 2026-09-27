MU.part('stats', {
  init(root) {
    const { gsap } = MU;
    const yEl = root.querySelector('.st-years');
    yEl.dataset.num = MU.years(); yEl.textContent = MU.years();
    MU.nums(root);

    let inview = false;
    const loops = [];
    MU.onVisible(root, v => {
      inview = v; root.classList.toggle('is-inview', v);
      loops.forEach(l => (v ? l.play() : l.pause()));
    });

    /* A — chiziq chiziladi, yulduz yo’l bo’ylab yuradi */
    const path = root.querySelector('.st-line__path'), star = root.querySelector('.st-line__star');
    if (!MU.reduced) {
      gsap.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', duration: 2, ease: 'power2.inOut', scrollTrigger: { trigger: path, start: 'top 88%', once: true } });
      gsap.from(root.querySelectorAll('.st-line__dots circle'), { scale: 0, transformOrigin: '50% 50%', duration: 0.7, stagger: 0.45, ease: 'back.out(3)', scrollTrigger: { trigger: path, start: 'top 88%', once: true } });
      loops.push(gsap.to(star, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: 4, ease: 'none', repeat: -1, paused: true }));
    } else star.remove();

    /* B — sparkles */
    const sp = root.querySelector('.st-sparkle');
    const SVG = '<svg viewBox="0 0 24 24"><path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"/></svg>';
    if (!MU.reduced) {
      const pop = () => {
        if (!inview) return;
        const w = document.createElement('span'); w.innerHTML = SVG; const s = w.firstChild;
        s.style.left = MU.rand(8, 88) + '%'; s.style.top = MU.rand(8, 70) + '%';
        sp.appendChild(s);
        gsap.fromTo(s, { scale: 0, rotation: -90, autoAlpha: 1 }, { scale: MU.rand(0.5, 1.2), rotation: 90, duration: 0.8, ease: 'back.out(2)', yoyo: true, repeat: 1, onComplete: () => s.remove() });
      };
      loops.push(gsap.timeline({ repeat: -1, paused: true }).call(pop).to({}, { duration: 0.35 }));
    }

    /* C — flickering grid (canvas) */
    const cv = root.querySelector('.st-flicker'), ctx = cv.getContext('2d');
    let cols = 0, rows = 0, cells = new Float32Array(0), d = 1;
    const SZ = 5, GAP = 5;
    const size = () => {
      const r = cv.getBoundingClientRect(); d = MU.dpr(2);
      cv.width = r.width * d; cv.height = r.height * d;
      cols = Math.ceil(r.width / (SZ + GAP)); rows = Math.ceil(r.height / (SZ + GAP));
      cells = Float32Array.from({ length: cols * rows }, () => Math.random() * 0.3);
    };
    new ResizeObserver(size).observe(cv); size();
    const drawGrid = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (let i = 0; i < cells.length; i++) {
        const x = (i % cols) * (SZ + GAP), y = Math.floor(i / cols) * (SZ + GAP), a = cells[i];
        ctx.fillStyle = i % 17 === 0 ? `rgba(201,138,27,${a})` : `rgba(59,91,219,${a})`;
        ctx.fillRect(x * d, y * d, SZ * d, SZ * d);
      }
    };
    if (MU.reduced) drawGrid();
    else MU.renderLoop(cv, (t, dt) => {
      for (let i = 0; i < cells.length; i++) if (Math.random() < 0.6 * dt) cells[i] = Math.random() * 0.32;
      drawGrid();
    });

    /* D — o’lchagich 8.0 / 9 */
    const fg = root.querySelector('.st-gauge__fg'), L = 2 * Math.PI * 50;
    gsap.set(fg, { strokeDasharray: L, strokeDashoffset: MU.reduced ? L * (1 - 8 / 9) : L });
    if (!MU.reduced) gsap.to(fg, { strokeDashoffset: L * (1 - 8 / 9), duration: 2.2, ease: 'power3.out', scrollTrigger: { trigger: fg, start: 'top 90%', once: true } });

    /* F — 64 kamera: 8×8 to’lqin */
    const cams = root.querySelector('.st-cams');
    const dots = Array.from({ length: 64 }, () => { const i = document.createElement('i'); cams.appendChild(i); return i; });
    if (MU.reduced) dots.forEach(i => i.classList.add('is-on'));
    else {
      gsap.to({}, { duration: 1.6, scrollTrigger: { trigger: cams, start: 'top 88%', once: true }, onUpdate() {
        const n = Math.round(this.progress() * 64); dots.forEach((el, i) => el.classList.toggle('is-on', i < n));
      } });
      let k = 0;
      loops.push(gsap.timeline({ repeat: -1, paused: true, delay: 2 }).call(() => {
        dots.forEach(el => el.classList.remove('is-hot'));
        const r = Math.floor(k / 8) % 8, c = k % 8; k = (k + 9) % 64;
        [r * 8 + c, ((r + 3) % 8) * 8 + ((c + 5) % 8)].forEach(i => dots[i].classList.add('is-hot'));
      }).to({}, { duration: 0.9 }));
    }
  }
});
