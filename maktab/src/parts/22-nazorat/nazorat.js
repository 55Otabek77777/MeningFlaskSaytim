/* Face ID → Nazoratchi bot: yuz nuqtalari skanerlanadi → «Tasdiqlandi» → ma’lumot oqimi → telefonga xabar.
   Sikl faqat bo’lim ekranda bo’lganda o’ynaydi. */
MU.part('nazorat', {
  init(root) {
    const { gsap } = MU;
    MU.nums(root);
    const NS = 'http://www.w3.org/2000/svg';
    const mesh = root.querySelector('.nz-face__mesh');
    const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); mesh.appendChild(e); return e; };

    /* stilize yuz landmarklari (200×240 maydon) */
    const P = [];
    const cx = 100, cy = 122;
    for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; P.push([cx + Math.cos(a) * 70, cy + Math.sin(a) * 92 * (Math.sin(a) > 0 ? 1 : 0.94)]); }
    const eye = (x, y) => { for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; P.push([x + Math.cos(a) * 13, y + Math.sin(a) * 5.5]); } P.push([x, y]); };
    eye(72, 104); eye(128, 104);
    for (let i = 0; i < 5; i++) { P.push([56 + i * 8, 88 - Math.sin((i / 4) * Math.PI) * 6]); P.push([112 + i * 8, 88 - Math.sin((i / 4) * Math.PI) * 6]); }
    for (let i = 0; i < 5; i++) P.push([100, 108 + i * 9]);
    P.push([90, 146], [110, 146], [100, 150]);
    for (let i = 0; i < 9; i++) { const t = i / 8; P.push([76 + t * 48, 172 + Math.sin(t * Math.PI) * 7]); }
    for (let i = 1; i < 8; i++) { const t = i / 8; P.push([76 + t * 48, 172 + Math.sin(t * Math.PI) * 2]); }
    for (let i = 0; i < 18; i++) P.push([cx + (Math.sin(i * 7.3) * 0.5) * 100, cy + (Math.cos(i * 3.1) * 0.5) * 150]);
    el('ellipse', { class: 'fm-oval', cx, cy, rx: 82, ry: 106 });
    const edges = [];
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
      const d = Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]);
      if (d < 26) edges.push(el('line', { class: 'fm-edge', x1: P[i][0], y1: P[i][1], x2: P[j][0], y2: P[j][1] }));
    }
    const dots = P.map(([x, y]) => el('circle', { class: 'fm-dot', cx: x.toFixed(1), cy: y.toFixed(1), r: 1.8 }));
    dots.sort((a, b) => a.getAttribute('cy') - b.getAttribute('cy'));

    const term = root.querySelector('.nz-term');
    const line = root.querySelector('.nz-face__line');
    const scan = root.querySelector('.nz-st--scan'), ok = root.querySelector('.nz-st--ok');
    const clock = root.querySelector('.nz-clock');
    const dot = root.querySelector('.nz-flow__dot'), path = root.querySelector('.nz-flow__path');
    const msgs = Array.from(root.querySelectorAll('.nz-msg'));
    const TIMES = ['05:48', '13:20', '18:42'];

    if (MU.reduced) { gsap.set(ok, { opacity: 1 }); gsap.set(scan, { opacity: 0 }); term.classList.add('is-ok'); return; }

    gsap.set(msgs, { autoAlpha: 0, y: 18, scale: 0.94, transformOrigin: '0% 100%' });
    gsap.set(dots, { opacity: 0.25, attr: { r: 1.4 } });
    gsap.set(edges, { opacity: 0.15 });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4, paused: true });
    TIMES.forEach((t, i) => {
      const at = tl.duration();
      tl.call(() => { clock.textContent = t; term.classList.remove('is-ok'); }, null, at)
        .set(ok, { opacity: 0 }, at).set(scan, { opacity: 1 }, at)
        .set(dots, { opacity: 0.25, attr: { r: 1.4 } }, at).set(edges, { opacity: 0.15 }, at)
        .fromTo(line, { top: '0%', opacity: 1 }, { top: '100%', duration: 1.1, ease: 'sine.inOut' }, at + 0.1)
        .to(dots, { opacity: 1, attr: { r: 2.2 }, duration: 0.25, stagger: { each: 0.012 } }, at + 0.15)
        .to(edges, { opacity: 0.8, duration: 0.6 }, at + 0.5)
        .to(line, { top: '0%', duration: 0.7, ease: 'sine.inOut' }, at + 1.2)
        .set(line, { opacity: 0 }, at + 1.9)
        .to(scan, { opacity: 0, duration: 0.2 }, at + 1.9)
        .fromTo(ok, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.2)' }, at + 1.95)
        .call(() => term.classList.add('is-ok'), null, at + 1.95);
      if (window.MotionPathPlugin) tl.fromTo(dot, { opacity: 1 }, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: 0.9, ease: 'power2.inOut' }, at + 2.3).set(dot, { opacity: 0 }, at + 3.2);
      tl.to(msgs[i], { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.7)' }, at + 3.15).to({}, { duration: 1.2 });
    });
    tl.to(msgs, { autoAlpha: 0, y: -10, duration: 0.4, stagger: 0.05 }, '+=0.6').set(msgs, { y: 18, scale: 0.94 });
    MU.onVisible(root, v => (v ? tl.play() : tl.pause()), '0px');

    /* sahna sichqonchaga yengil og’adi */
    if (!MU.isTouch) {
      const stage = root.querySelector('.nz-stage');
      const qx = gsap.quickTo(stage, 'rotationY', { duration: 0.8, ease: 'power3.out' }), qy = gsap.quickTo(stage, 'rotationX', { duration: 0.8, ease: 'power3.out' });
      gsap.set(stage, { transformPerspective: 1200 });
      root.addEventListener('pointermove', e => { const r = root.getBoundingClientRect(); qx(((e.clientX - r.left) / r.width - 0.5) * 8); qy(-((e.clientY - r.top) / r.height - 0.5) * 6); });
      root.addEventListener('pointerleave', () => { qx(0); qy(0); });
    }
  }
});
