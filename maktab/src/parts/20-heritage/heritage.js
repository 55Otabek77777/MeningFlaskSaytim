MU.part('heritage', {
  init(root) {
    const { gsap, ScrollTrigger } = MU;
    const cv = root.querySelector('.mr-canvas'), ctx = cv.getContext('2d');
    const N = MU.isMobile ? 560 : 1100;

    /* ---------- shakllar: offscreen canvasda chizib, piksellardan nuqta olamiz */
    const oc = document.createElement('canvas'), S = 400; oc.width = oc.height = S;
    const o = oc.getContext('2d', { willReadFrequently: true });
    const shapes = [
      /* 0 — yulduz turkumi (Ulug’bek) */
      g => {
        const st = [[70, 250], [118, 210], [165, 222], [210, 186], [262, 170], [300, 120], [340, 92], [262, 250], [322, 282], [205, 300], [140, 318], [96, 110], [180, 96]];
        g.lineWidth = 2.2;
        [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [4, 7], [7, 8], [3, 9], [9, 10], [11, 12], [12, 3]].forEach(([a, b]) => { g.beginPath(); g.moveTo(...st[a]); g.lineTo(...st[b]); g.stroke(); });
        st.forEach(([x, y], i) => { g.beginPath(); g.arc(x, y, i % 4 === 0 ? 9 : 6, 0, 7); g.fill(); });
        g.beginPath(); g.arc(200, 200, 176, 0, 7); g.setLineDash([3, 9]); g.stroke(); g.setLineDash([]);
      },
      /* 1 — ochiq kitob + qalam */
      g => {
        g.lineWidth = 3;
        g.beginPath(); g.moveTo(200, 150); g.quadraticCurveTo(140, 118, 70, 128); g.lineTo(70, 290); g.quadraticCurveTo(140, 282, 200, 312); g.stroke();
        g.beginPath(); g.moveTo(200, 150); g.quadraticCurveTo(260, 118, 330, 128); g.lineTo(330, 290); g.quadraticCurveTo(260, 282, 200, 312); g.stroke();
        g.beginPath(); g.moveTo(200, 150); g.lineTo(200, 312); g.stroke();
        g.lineWidth = 2;
        for (let i = 0; i < 6; i++) { const y = 165 + i * 22; g.beginPath(); g.moveTo(88, y); g.quadraticCurveTo(140, y - 12, 186, y + 4); g.stroke(); g.beginPath(); g.moveTo(214, y + 4); g.quadraticCurveTo(262, y - 12, 312, y); g.stroke(); }
        g.lineWidth = 3; g.beginPath(); g.moveTo(352, 58); g.lineTo(280, 180); g.lineTo(272, 206); g.lineTo(292, 188); g.lineTo(364, 66); g.closePath(); g.stroke();
      },
      /* 2 — maktab binosi (birinchi bino) */
      g => {
        g.lineWidth = 3;
        g.strokeRect(50, 150, 300, 170); g.beginPath(); g.moveTo(36, 150); g.lineTo(364, 150); g.stroke();
        g.strokeRect(160, 118, 80, 202); g.beginPath(); g.arc(200, 92, 18, 0, 7); g.stroke();
        g.lineWidth = 2;
        [[70, 175], [110, 175], [270, 175], [310, 175], [70, 245], [110, 245], [270, 245], [310, 245]].forEach(([x, y]) => g.strokeRect(x - 12, y - 18, 24, 36));
        g.strokeRect(176, 140, 48, 40); g.strokeRect(182, 250, 36, 70);
        g.beginPath(); g.moveTo(20, 330); g.lineTo(380, 330); g.stroke();
      },
      /* 3 — kengayish: ikkinchi bino */
      g => {
        g.lineWidth = 3;
        g.strokeRect(30, 170, 210, 150); g.strokeRect(105, 140, 60, 180);
        g.lineWidth = 2;
        [[55, 195], [80, 195], [190, 195], [215, 195], [55, 255], [80, 255], [190, 255], [215, 255]].forEach(([x, y]) => g.strokeRect(x - 9, y - 14, 18, 28));
        g.lineWidth = 3; g.strokeRect(262, 120, 110, 200);
        g.lineWidth = 2;
        for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) g.strokeRect(276 + c * 32, 138 + r * 44, 18, 26);
        g.beginPath(); g.moveTo(10, 330); g.lineTo(390, 330); g.stroke();
      },
      /* 4 — 2027–2028 reja: ko’p qavatli bino + kran */
      g => {
        g.lineWidth = 3; g.setLineDash([10, 6]); g.strokeRect(120, 70, 160, 250); g.setLineDash([]);
        g.lineWidth = 2;
        for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) g.strokeRect(134 + c * 36, 88 + r * 38, 22, 22);
        g.lineWidth = 3;
        g.beginPath(); g.moveTo(330, 330); g.lineTo(330, 50); g.lineTo(200, 50); g.moveTo(330, 50); g.lineTo(380, 50); g.moveTo(330, 80); g.lineTo(300, 50); g.stroke();
        g.beginPath(); g.moveTo(236, 50); g.lineTo(236, 96); g.stroke(); g.strokeRect(226, 96, 20, 14);
        g.beginPath(); g.moveTo(20, 330); g.lineTo(380, 330); g.stroke();
      }
    ];
    const targets = shapes.map(draw => {
      o.clearRect(0, 0, S, S); o.strokeStyle = o.fillStyle = '#000'; o.lineCap = o.lineJoin = 'round'; draw(o);
      const d = o.getImageData(0, 0, S, S).data, pts = [];
      for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) if (d[(y * S + x) * 4 + 3] > 120) pts.push(x / S, y / S);
      const out = new Float32Array(N * 2), n = pts.length / 2;
      for (let i = 0; i < N; i++) { const k = Math.floor(Math.random() * n); out[i * 2] = pts[k * 2] + MU.rand(-0.004, 0.004); out[i * 2 + 1] = pts[k * 2 + 1] + MU.rand(-0.004, 0.004); }
      return out;
    });

    /* ---------- zarrachalar */
    const COLORS = ['30,58,138', '59,91,219', '201,138,27', '220,38,38'];
    const P = Array.from({ length: N }, (_, i) => ({
      x: Math.random(), y: Math.random(), vx: 0, vy: 0, delay: Math.random() * 0.5, seed: Math.random() * 6.28,
      r: Math.random() < 0.08 ? 2.2 : Math.random() * 1.1 + 0.9, c: i % 9 === 0 ? 2 : i % 23 === 0 ? 3 : i % 3 === 0 ? 1 : 0
    }));
    /* rang × shaffoflik bo’yicha guruhlab chizamiz (16 ta fill — tez, zaif telefonlarda ham) */
    const LV = 4, buckets = Array.from({ length: COLORS.length * LV }, () => []);
    let phase = -1, phaseT = 0, W = 1, H = 1, dpr = 1, mx = -999, my = -999;
    const size = () => { const r = cv.getBoundingClientRect(); dpr = MU.dpr(2); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; };
    new ResizeObserver(size).observe(cv); size();
    if (!MU.isTouch) {
      cv.parentElement.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
      cv.parentElement.addEventListener('pointerleave', () => { mx = my = -999; });
    }
    const M = 0.09;
    const draw = (t, dt) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const tg = targets[Math.max(0, phase)], since = t - phaseT, sz = Math.min(W, H) * (1 - 2 * M), ox = (W - sz) / 2, oy = (H - sz) / 2 - H * 0.03;
      for (let i = 0; i < N; i++) {
        const p = P[i];
        let tx = ox + tg[i * 2] * sz + Math.sin(t * 0.8 + p.seed) * 1.6, ty = oy + tg[i * 2 + 1] * sz + Math.cos(t * 0.7 + p.seed) * 1.6;
        const px = p.x * W, py = p.y * H;
        if (since > p.delay || MU.reduced) {
          p.vx += (tx - px) * 0.045; p.vy += (ty - py) * 0.045;
        }
        const dx = px - mx, dy = py - my, dd = dx * dx + dy * dy;
        if (dd < 3600) { const f = (3600 - dd) / 3600 * 3.2; p.vx += dx / Math.sqrt(dd + 1) * f; p.vy += dy / Math.sqrt(dd + 1) * f; }
        p.vx *= 0.8; p.vy *= 0.8;
        p.x = (px + p.vx) / W; p.y = (py + p.vy) / H;
        const lv = Math.min(LV - 1, Math.floor((0.5 + 0.5 * Math.sin(t * 2 + p.seed)) * LV));
        buckets[p.c * LV + lv].push(p);
      }
      for (let b = 0; b < buckets.length; b++) {
        const list = buckets[b]; if (!list.length) continue;
        ctx.fillStyle = `rgba(${COLORS[Math.floor(b / LV)]},${(0.35 + 0.55 * ((b % LV) + 0.5) / LV).toFixed(2)})`;
        ctx.beginPath();
        for (const p of list) { const x = p.x * W, y = p.y * H; if (p.r > 1.8) { ctx.moveTo(x + p.r, y); ctx.arc(x, y, p.r, 0, 6.283); } else ctx.rect(x - p.r, y - p.r, p.r * 2, p.r * 2); }
        ctx.fill(); list.length = 0;
      }
    };

    /* ---------- faza boshqaruvi */
    const yearV = root.querySelector('.mr-year__val'), yearC = root.querySelector('.mr-year__cap'), dots = root.querySelectorAll('.mr-dots li');
    const items = Array.from(root.querySelectorAll('.mr-item'));
    let clock = 0;
    const setPhase = i => {
      if (i === phase) return;
      phase = i; phaseT = clock;
      items.forEach((el, k) => el.classList.toggle('is-active', k === i));
      dots.forEach((el, k) => el.classList.toggle('is-on', k === i));
      const it = items[i];
      if (MU.reduced || !window.ScrambleTextPlugin) { yearV.textContent = it.dataset.year; yearC.textContent = it.dataset.cap; draw(clock, 0); }
      else {
        gsap.to(yearV, { duration: 0.8, scrambleText: { text: it.dataset.year, chars: '0123456789', speed: 0.8 } });
        gsap.to(yearC, { duration: 0.6, scrambleText: { text: it.dataset.cap, chars: 'upperCase', speed: 0.8 } });
      }
    };
    items.forEach((el, i) => ScrollTrigger.create({
      trigger: el, start: 'top 62%', end: 'bottom 62%',
      onEnter: () => setPhase(i), onEnterBack: () => setPhase(i)
    }));
    setPhase(0);
    if (MU.reduced) { P.forEach((p, i) => { p.x = 0.5; p.y = 0.5; }); for (let k = 0; k < 90; k++) draw(0, 0.016); return; }
    MU.renderLoop(cv, (t, dt) => { clock = t; draw(t, dt); });
  }
});
