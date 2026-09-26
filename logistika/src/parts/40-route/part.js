/* ==========================================================================
   40-route · "Yangi Ipak yoʻli" — pinned scroll journey Shanghai → Duisburg.
   Layers (all driven by one camera):
     1. WebGL land dots — per-dot lighting: trail wake, vehicle light + lens swell,
        pointer lamp, twinkles, sonar reveal wave, gold caravan ghost, Uzbekistan glow
     2. SVG under a camera matrix — graticule, borders, caravan route, DrawSVG trail,
        city nodes, vehicle badge (MotionPath raw-path sampling, heading = autoRotate)
     3. HTML — city/region labels (projected), HUD, stops rail, final summary
   ========================================================================== */
MU.part('route', {
  init(root, MU) {
    const DATA = window.muRouteMap;
    const MPP = window.MotionPathPlugin;
    if (!root || !DATA || !MPP) return;
    const { gsap, ScrollTrigger } = MU;
    const W = window, reduced = MU.reduced, hover = W.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const q = s => root.querySelector(s), qa = s => Array.from(root.querySelectorAll(s));
    const NS = 'http://www.w3.org/2000/svg';
    const mk = (tag, attrs, parent) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(e);
      return e;
    };
    const clamp = MU.clamp, lerp = MU.lerp;
    const smooth = t => t * t * (3 - 2 * t);
    const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const fmt = MU.fmt;

    const stage = q('.rt-stage'), glCanvas = q('.rt-gl'), cam = q('.rt-cam'), labelsEl = q('.rt-labels');
    const MODES = ['Temir yoʻl', 'Avtomobil', 'Parom'];
    const P_IN = 0.08, P_OUT = 0.9;

    /* ------------------------------------------------------------ static vector geometry */
    ['.rt-uzb', '.rt-uzb-glow', '.rt-uzb-fill'].forEach(s => q(s).setAttribute('d', DATA.uzbOutline));
    q('.rt-caravan').setAttribute('d', DATA.caravan);
    q('.rt-caravan-mask').setAttribute('d', DATA.caravan);
    if (reduced) q('.rt-caravan').removeAttribute('mask');
    q('.rt-plan').setAttribute('d', DATA.corridor);
    const trails = qa('.rt-trail');
    trails.forEach(p => p.setAttribute('d', DATA.corridor));
    /* cartographic line layer (graticule, borders, coast) — 2D canvas, redrawn only when the camera moves */
    const linesCanvas = q('.rt-lines'), lctx = linesCanvas.getContext('2d');
    const P2 = W.Path2D ? { borders: new Path2D(DATA.borders), coast: new Path2D(DATA.coast), uzb: new Path2D(DATA.uzbOutline) } : null;
    function drawLines() {
      if (!lctx || !P2) return;
      const cw = linesCanvas.width, ch = linesCanvas.height, k = dpr;
      lctx.setTransform(1, 0, 0, 1, 0, 0);
      lctx.globalCompositeOperation = 'source-over';
      lctx.clearRect(0, 0, cw, ch);
      lctx.setTransform(camS * k, 0, 0, camS * k, camTX * k, camTY * k);
      const lw = 1 / camS;
      /* graticule: conic → concentric parallels + straight meridians */
      lctx.beginPath();
      DATA.parallels.forEach(([, r]) => { lctx.moveTo(DATA.apex[0] + r, DATA.apex[1]); lctx.arc(DATA.apex[0], DATA.apex[1], r, 0, Math.PI * 2); });
      DATA.meridians.forEach(([, x1, y1, x2, y2]) => { lctx.moveTo(x1, y1); lctx.lineTo(x2, y2); });
      lctx.lineWidth = lw; lctx.strokeStyle = 'rgba(150,180,255,.08)'; lctx.stroke();
      lctx.lineJoin = 'round';
      lctx.lineWidth = lw * 0.8; lctx.strokeStyle = gl ? 'rgba(150,180,255,.17)' : 'rgba(150,180,255,.35)'; lctx.stroke(P2.borders);
      lctx.lineWidth = lw * 0.8; lctx.strokeStyle = gl ? 'rgba(46,230,214,.12)' : 'rgba(46,230,214,.45)'; lctx.stroke(P2.coast);
      /* soft edges: fade to transparent so section edges never show a seam */
      lctx.setTransform(1, 0, 0, 1, 0, 0);
      lctx.globalCompositeOperation = 'destination-out';
      const fade = (x0, y0, x1, y1, rx, ry, rw, rh) => {
        const g = lctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        lctx.fillStyle = g; lctx.fillRect(rx, ry, rw, rh);
      };
      const fy = ch * 0.14, fx = cw * 0.07;
      fade(0, 0, 0, fy, 0, 0, cw, fy);
      fade(0, ch, 0, ch - fy, 0, ch - fy, cw, fy);
      fade(0, 0, fx, 0, 0, 0, fx, ch);
      fade(cw, 0, cw - fx, 0, cw - fx, 0, fx, ch);
      lctx.globalCompositeOperation = 'source-over';
    }

    /* ------------------------------------------------------------ corridor lookup (MotionPath raw path) */
    const N = 1400;
    const LX = new Float32Array(N + 1), LY = new Float32Array(N + 1), LA = new Float32Array(N + 1);
    const raw = MPP.stringToRawPath(DATA.corridor);
    MPP.cacheRawPathMeasurements(raw, 32);
    const pt = {};
    for (let i = 0; i <= N; i++) {
      MPP.getPositionOnPath(raw, i / N, true, pt);
      LX[i] = pt.x; LY[i] = pt.y; LA[i] = pt.angle;
    }
    const craw = MPP.stringToRawPath(DATA.caravan);
    MPP.cacheRawPathMeasurements(craw, 24);
    const CN = 700, CAX = new Float32Array(CN + 1), CAY = new Float32Array(CN + 1);
    for (let i = 0; i <= CN; i++) { MPP.getPositionOnPath(craw, i / CN, false, pt); CAX[i] = pt.x; CAY[i] = pt.y; }

    let searchFrom = 0;
    const nearestFrac = (x, y) => {
      let best = Infinity, bi = searchFrom;
      for (let i = searchFrom; i <= N; i++) {
        const d = (LX[i] - x) ** 2 + (LY[i] - y) ** 2;
        if (d < best) { best = d; bi = i; }
      }
      searchFrom = bi;
      return bi / N;
    };
    const cities = DATA.cities.map(([name, x, y, day, km, mode, country, lon, lat], i) => ({ name, x, y, day, km, mode, country, lon, lat, i }));
    const NC = cities.length;
    searchFrom = 0; cities.forEach(c => { c.f = nearestFrac(c.x, c.y); });
    cities[0].f = 0; cities[NC - 1].f = 1;
    searchFrom = 0;
    const wps = DATA.wp.map(w => ({ x: w[0], y: w[1], lon: w[2], lat: w[3], country: w[6], f: nearestFrac(w[0], w[1]) }));
    wps[0].f = 0; wps[wps.length - 1].f = 1;

    /* smoothed camera track + heading */
    const CX = new Float32Array(N + 1), CY = new Float32Array(N + 1), HX = new Float32Array(N + 1), HY = new Float32Array(N + 1);
    (() => {
      const win = Math.round(N * 0.03), hwin = Math.round(N * 0.045);
      for (let i = 0; i <= N; i++) {
        let sx = 0, sy = 0, n = 0, hx = 0, hy = 0;
        for (let k = -win; k <= win; k++) { const j = clamp(i + k, 0, N); sx += LX[j]; sy += LY[j]; n++; }
        for (let k = -hwin; k <= hwin; k++) {
          const j = clamp(i + k, 0, N), a = LA[j] * Math.PI / 180;
          hx += Math.cos(a); hy += Math.sin(a);
        }
        const hl = Math.hypot(hx, hy) || 1;
        CX[i] = sx / n; CY[i] = sy / n; HX[i] = hx / hl; HY[i] = hy / hl;
      }
    })();
    const sampleArr = (arr, rp) => {
      const x = clamp(rp) * N, i = Math.min(N - 1, Math.floor(x)), t = x - i;
      return arr[i] + (arr[i + 1] - arr[i]) * t;
    };

    /* ------------------------------------------------------------ journey schedule (scroll → route progress) */
    const DW = cities.map((c, i) => (i === 0 || i === NC - 1 ? 0 : c.name === 'Toshkent' ? 0.055 : 0.017));
    const LEGW = cities.slice(0, -1).map((c, i) => 0.6 * (cities[i + 1].f - c.f) + 0.4 / (NC - 1));
    const TOTAL = DW.reduce((a, b) => a + b, 0) + LEGW.reduce((a, b) => a + b, 0);
    const SEGS = [];
    (() => {
      let j = 0;
      cities.forEach((c, i) => {
        if (DW[i]) { SEGS.push({ t: 'd', i, j0: j, j1: j + DW[i] / TOTAL }); j += DW[i] / TOTAL; }
        if (i < NC - 1) { SEGS.push({ t: 'l', i, j0: j, j1: j + LEGW[i] / TOTAL }); j += LEGW[i] / TOTAL; }
      });
      SEGS[SEGS.length - 1].j1 = 1;
    })();
    const rpAt = j => {
      j = clamp(j);
      for (const s of SEGS) {
        if (j <= s.j1) {
          const c = cities[s.i];
          if (s.t === 'd') return c.f;
          const u = (j - s.j0) / (s.j1 - s.j0);
          return c.f + (cities[s.i + 1].f - c.f) * lerp(u, smooth(u), 0.6);
        }
      }
      return 1;
    };
    const pForCity = i => {
      if (i <= 0) return P_IN;
      if (i >= NC - 1) return P_OUT;
      const s = SEGS.find(x => x.t === 'd' && x.i === i);
      const j = s ? (s.j0 + s.j1) / 2 : SEGS.find(x => x.t === 'l' && x.i === i).j0;
      return P_IN + j * (P_OUT - P_IN);
    };

    /* zoom profile (multipliers of the base view width) */
    const ZM = { Shanghai: 1, Sian: 1.02, Urumchi: 1.08, 'Qorgʻos': 0.92, Olmaota: 0.88, Toshkent: 0.74, Samarqand: 0.8,
      Buxoro: 0.86, Turkmanboshi: 0.96, Boku: 0.88, Tbilisi: 0.92, Istanbul: 1, Duisburg: 1.08 };
    const legAt = rp => { let i = 0; while (i < NC - 2 && rp > cities[i + 1].f) i++; return i; };

    /* ------------------------------------------------------------ view / camera */
    let SW = 1, SH = 1, dpr = 1, mobile = false, baseW = 700, lead = 0.08;
    let F = { x: 0, y: 0 }, izIn = null, izOut = null, ovStatic = null;
    const followView = rp => {
      const i = legAt(rp), a = cities[i], b = cities[i + 1];
      const u = clamp((rp - a.f) / (b.f - a.f || 1));
      const bump = clamp((b.f - a.f) / 0.2) * 0.3;
      const w = baseW * lerp(ZM[a.name] || 1, ZM[b.name] || 1, smooth(u)) * (1 + bump * Math.sin(Math.PI * u));
      return [sampleArr(CX, rp) + sampleArr(HX, rp) * w * lead, sampleArr(CY, rp) + sampleArr(HY, rp) * w * lead, w];
    };
    function zoomInterp(a, b, rho = 1.3) {
      const rho2 = rho * rho, rho4 = rho2 * rho2;
      const [ux0, uy0, w0] = a, [ux1, uy1, w1] = b;
      const dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy;
      if (d2 < 1e-9) {
        const S = Math.log(w1 / w0) / rho;
        return t => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)];
      }
      const d1 = Math.sqrt(d2);
      const b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1);
      const b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1);
      const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      const S = (r1 - r0) / rho, ch0 = Math.cosh(r0), sh0 = Math.sinh(r0);
      return t => {
        const s = t * S, u = w0 / (rho2 * d1) * (ch0 * Math.tanh(rho * s + r0) - sh0);
        return [ux0 + u * dx, uy0 + u * dy, w0 * ch0 / Math.cosh(rho * s + r0)];
      };
    }
    /* bbox of everything we want in the overview */
    const BB = (() => {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      const add = (x, y) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); };
      for (let i = 0; i <= N; i += 4) add(LX[i], LY[i]);
      for (let i = 0; i <= CN; i += 4) add(CAX[i], CAY[i]);
      return { x0, y0, x1, y1 };
    })();

    const headBottom = () => {
      const sr = stage.getBoundingClientRect();
      const hEl = q('.rt-head'), fEl = q('.rt-final');
      return {
        head: hEl.offsetTop + hEl.offsetHeight + (hEl.offsetParent ? hEl.offsetParent.getBoundingClientRect().top - sr.top : 0),
        fin: fEl.offsetTop + fEl.offsetHeight + (fEl.offsetParent ? fEl.offsetParent.getBoundingClientRect().top - sr.top : 0)
      };
    };
    function layout() {
      const r = stage.getBoundingClientRect();
      SW = Math.max(1, r.width); SH = Math.max(1, r.height);
      mobile = SW <= 768;
      dpr = MU.dpr(2);
      baseW = mobile ? clamp(SW * 1.12, 380, 520) : clamp(SW * 0.52, 580, 940);
      lead = mobile ? 0.06 : 0.09;
      F = mobile ? { x: SW * 0.5, y: SH * 0.46 } : { x: SW * 0.53, y: SH * 0.5 };
      /* overview framings: header (intro) / summary (outro) sit top-left, legend bottom-right */
      const hb = headBottom();
      const fitView = r => {
        const bw = BB.x1 - BB.x0, bh = BB.y1 - BB.y0;
        const s = Math.min((r.x1 - r.x0) / bw, (r.y1 - r.y0) / bh);
        const scx = (r.x0 + r.x1) / 2, scy = (r.y0 + r.y1) / 2;
        return [(BB.x0 + BB.x1) / 2 - (scx - F.x) / s, (BB.y0 + BB.y1) / 2 - (scy - F.y) / s, SW / s];
      };
      const ovIn = mobile
        ? fitView({ x0: SW * 0.07, x1: SW * 0.93, y0: Math.max(SH * 0.38, hb.head + 36), y1: SH * 0.74 })
        : fitView({ x0: SW * 0.05, x1: SW * (SW > 1100 ? 0.86 : 0.95), y0: Math.max(SH * 0.46, hb.head + 36), y1: SH * 0.9 });
      const ovOut = mobile
        ? fitView({ x0: SW * 0.07, x1: SW * 0.93, y0: Math.max(SH * 0.44, hb.fin + 40), y1: SH * 0.86 })
        : fitView({ x0: SW * 0.05, x1: SW * 0.95, y0: Math.max(SH * 0.48, hb.fin + 64), y1: SH * 0.92 });
      ovStatic = ovIn;
      izIn = zoomInterp(ovIn, followView(0));
      izOut = zoomInterp(followView(1), ovOut);
      if (gl) {
        glCanvas.width = Math.round(SW * dpr); glCanvas.height = Math.round(SH * dpr);
        gl.viewport(0, 0, glCanvas.width, glCanvas.height);
      }
      linesCanvas.width = Math.round(SW * dpr); linesCanvas.height = Math.round(SH * dpr);
      last.cam = '';
      dirty = true;
    }
    const viewAt = p => {
      if (reduced) return ovStatic;
      if (p <= P_IN) return izIn(inOut(clamp(p / P_IN)));
      if (p >= P_OUT) return izOut(inOut(clamp((p - P_OUT) / (1 - P_OUT))));
      return followView(rpAt((p - P_IN) / (P_OUT - P_IN)));
    };

    /* ------------------------------------------------------------ DOM: nodes, labels, stops, ticks */
    const nodesG = q('.rt-nodes');
    const ANCH = { Shanghai: 'nw', Sian: 's', Urumchi: 'n', 'Qorgʻos': 's', Olmaota: 'n', Toshkent: 'n', Samarqand: 's',
      Buxoro: 'n', Turkmanboshi: 's', Boku: 'n', Tbilisi: 'n', Istanbul: 's', Duisburg: 'ne' };
    const MAJOR = new Set(W.innerWidth <= 768 ? ['Shanghai', 'Toshkent', 'Istanbul', 'Duisburg'] : ['Shanghai', 'Urumchi', 'Toshkent', 'Boku', 'Istanbul', 'Duisburg']);
    cities.forEach(c => {
      const g = mk('g', { class: 'rt-node' + (c.name === 'Toshkent' ? ' rt-node--hq' : ''), transform: `translate(${c.x} ${c.y})` }, nodesG);
      const s = mk('g', { class: 'rt-node__s' }, g);
      if (c.name === 'Toshkent') mk('circle', { class: 'rt-node__hq', r: 34, fill: 'url(#rt-g-hq)' }, s);
      c.burst = mk('circle', { class: 'rt-node__burst', r: 4 }, s);
      mk('circle', { class: 'rt-node__pulse', r: 7 }, s);
      c.ring = mk('circle', { class: 'rt-node__ring', r: 6.5 }, s);
      c.dot = mk('circle', { class: 'rt-node__dot', r: 2.6 }, s);
      c.node = g;
      const l = document.createElement('div');
      l.className = `rt-lbl rt-lbl--${ANCH[c.name] || 'n'}${MAJOR.has(c.name) ? ' is-major' : ''}${c.name === 'Toshkent' ? ' rt-lbl--hq' : ''}`;
      l.innerHTML = `<span class="rt-lbl__in"><span class="rt-lbl__day">${c.day}-kun</span><span class="rt-lbl__name">${c.name}</span>${
        c.name === 'Toshkent' ? '<span class="rt-lbl__tag">Bosh ofis</span>' : ''}</span>`;
      labelsEl.appendChild(l);
      c.lbl = l;
    });
    const regions = DATA.labels.map(([t, x, y, k]) => {
      const l = document.createElement('div');
      l.className = `rt-rlbl rt-rlbl--${k}`;
      l.textContent = t;
      labelsEl.appendChild(l);
      return { el: l, x, y };
    });
    const stopsList = q('.rt-stops__list');
    cities.forEach((c, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<button type="button" class="rt-stop"><span class="rt-stop__dot" aria-hidden="true"></span><span class="rt-stop__d">${String(c.day).padStart(2, '0')}</span><span class="rt-stop__n">${c.name}</span></button>`;
      stopsList.appendChild(li);
      c.stop = li.firstChild;
      c.stop.setAttribute('aria-label', `${c.day}-kun · ${c.name}`);
    });
    const ticks = q('.rt-hud__ticks');
    cities.forEach(c => { const t = document.createElement('i'); t.style.left = (c.f * 100).toFixed(2) + '%'; ticks.appendChild(t); c.tick = t; });

    const veh = q('.rt-veh'), vehHead = q('.rt-veh__head'), vehIcos = qa('.rt-veh__ico'), vehCone = q('.rt-veh__cone');
    const hud = {
      el: q('.rt-hud'), icos: qa('.rt-hud__ico svg'), mode: q('.rt-hud__modename'), from: q('.rt-hud__from'), to: q('.rt-hud__to'),
      fill: q('.rt-hud__fill'), km: q('.rt-hud__km'), day: q('.rt-hud__day'), country: q('.rt-hud__country'),
      geo: q('.rt-hud__geo'), needle: q('.rt-hud__needle'), status: q('.rt-hud__status'), cty: q('.rt-hud__cty')
    };
    const stopsLine = q('.rt-stops__line i');
    const scaleBar = q('.rt-scale__bar'), scaleTxt = q('.rt-scale__txt');
    const finalEl = q('.rt-final'), finalCta = q('.rt-final__cta');

    /* ------------------------------------------------------------ WebGL land dots */
    let gl = null, prog = null, sprog = null, U = {}, SU = {}, dotCount = 0, sbuf = null, sdata = null;
    const SPR_MAX = 40;
    const uzbC = { x: 0, y: 0 };
    (() => {
      let n = 0; cities.forEach(c => { if (c.country === 'Oʻzbekiston') { uzbC.x += c.x; uzbC.y += c.y; n++; } });
      uzbC.x /= n; uzbC.y /= n;
    })();
    const tosh = cities.find(c => c.name === 'Toshkent');

    function buildDots(grid) {
      const pitch = grid.pitch, rowH = grid.rowH;
      const uz = new Set();
      grid.uzb.split(',').forEach((row, j) => {
        for (let k = 0; k < row.length; k += 4) {
          const c0 = parseInt(row.substr(k, 2), 36), n = parseInt(row.substr(k + 2, 2), 36);
          for (let c = c0; c < c0 + n; c++) uz.add(j * 4096 + c);
        }
      });
      /* spatial buckets for corridor / caravan distance */
      const B = 26, bw = Math.ceil(DATA.w / B) + 1, bh = Math.ceil(DATA.h / B) + 1;
      const bucket = (xs, ys, n) => {
        const b = Array.from({ length: bw * bh }, () => []);
        for (let i = 0; i <= n; i++) {
          const bx = clamp(Math.floor(xs[i] / B), 0, bw - 1), by = clamp(Math.floor(ys[i] / B), 0, bh - 1);
          b[by * bw + bx].push(i);
        }
        return b;
      };
      const bRoute = bucket(LX, LY, N), bCar = bucket(CAX, CAY, CN);
      const near = (b, xs, ys, x, y) => {
        const bx = Math.floor(x / B), by = Math.floor(y / B);
        let best = Infinity, bi = -1;
        for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
          const X = bx + ox, Y = by + oy;
          if (X < 0 || Y < 0 || X >= bw || Y >= bh) continue;
          for (const i of b[Y * bw + X]) {
            const d = (xs[i] - x) ** 2 + (ys[i] - y) ** 2;
            if (d < best) { best = d; bi = i; }
          }
        }
        return [bi, Math.sqrt(best)];
      };
      const pos = [], info = [];
      grid.land.split(',').forEach((row, j) => {
        for (let k = 0; k < row.length; k += 4) {
          const c0 = parseInt(row.substr(k, 2), 36), n = parseInt(row.substr(k + 2, 2), 36);
          for (let c = c0; c < c0 + n; c++) {
            const x = (c + 0.5) * pitch + (j % 2) * pitch / 2, y = (j + 0.5) * rowH;
            const h = Math.sin(j * 127.1 + c * 311.7) * 43758.5453, seed = h - Math.floor(h);
            const [ri, rd] = near(bRoute, LX, LY, x, y);
            const [, cd] = near(bCar, CAX, CAY, x, y);
            pos.push(x, y);
            info.push(seed, uz.has(j * 4096 + c) ? 1 : 0, ri >= 0 ? ri / N : -1, ri >= 0 ? Math.min(rd, 99) : 99, Math.min(cd, 99));
          }
        }
      });
      return { pos: new Float32Array(pos), info: new Float32Array(info), count: pos.length / 2 };
    }

    const VS = `
      attribute vec2 a_pos; attribute vec4 a_info; attribute float a_car;
      uniform vec2 u_res; uniform vec3 u_cam; uniform float u_time, u_rp, u_reveal, u_pitch, u_dpr, u_uzb, u_fade;
      uniform vec2 u_veh, u_revc, u_map; uniform vec4 u_ptr, u_rip; uniform vec3 u_ripc;
      varying vec4 v_col;
      void main() {
        vec2 sp = a_pos * u_cam.x + u_cam.yz;
        vec2 cl = sp / u_res * 2.0 - 1.0;
        float seed = a_info.x, uz = a_info.y, rf = a_info.z, rd = a_info.w;
        vec2 e = min(a_pos, u_map - a_pos);
        float edge = smoothstep(0.0, 150.0, min(e.x, e.y * 1.6));
        float dr = distance(a_pos, u_revc);
        float rad = u_reveal * 1500.0;
        float vis = 1.0 - smoothstep(rad - 90.0, rad, dr);
        float wave = exp(-pow((dr - rad) / 30.0, 2.0)) * (1.0 - smoothstep(0.75, 1.0, u_reveal)) * step(0.0005, u_reveal);
        float tw = pow(0.5 + 0.5 * sin(u_time * (0.5 + seed * 1.7) + seed * 81.0), 14.0) * step(0.62, fract(seed * 17.31));
        float car = exp(-pow(a_car / 10.0, 2.0));
        float trail = (rf >= 0.0 && rf <= u_rp) ? exp(-pow(rd / 15.0, 2.0)) : 0.0;
        float fresh = (rf >= 0.0 && rf <= u_rp) ? exp(-pow((u_rp - rf) / 0.035, 2.0)) * exp(-pow(rd / 22.0, 2.0)) : 0.0;
        float plan = (rf > u_rp) ? exp(-pow(rd / 7.0, 2.0)) * 0.32 : 0.0;
        float dv = distance(a_pos, u_veh);
        float vl = exp(-pow(dv / 46.0, 2.0)) * u_fade;
        float dp = distance(a_pos, u_ptr.xy);
        float pl = exp(-pow(dp / u_ptr.w, 2.0)) * u_ptr.z;
        float drp = distance(a_pos, u_rip.xy);
        float rip = exp(-pow((drp - u_rip.z * u_rip.w) / 16.0, 2.0)) * max(0.0, 1.0 - u_rip.z / 1.5) * step(0.0, u_rip.z);
        vec3 col = mix(vec3(0.17, 0.23, 0.43), vec3(0.25, 0.32, 0.58), seed);
        col = mix(col, vec3(0.62, 0.47, 0.22), car * 0.6);
        col = mix(col, vec3(1.0, 0.76, 0.34), uz * (0.72 + 0.28 * u_uzb));
        col = mix(col, vec3(0.16, 0.86, 0.80), max(trail * 0.95, plan));
        col += vec3(0.55, 1.0, 0.95) * (vl * 0.95 + fresh * 0.55);
        col += vec3(0.45, 0.62, 1.0) * pl * 0.85;
        col += vec3(0.7, 0.85, 1.0) * tw * 0.55;
        col += vec3(0.35, 1.0, 0.92) * wave * 1.2;
        col += u_ripc * rip;
        float size = u_pitch * u_cam.x * 0.5 * (1.0 + vl * 0.95 + pl * 0.8 + wave * 1.1 + trail * 0.18 + uz * 0.08 + rip * 0.9);
        gl_PointSize = max(size, 1.35 * u_dpr);
        float vig = smoothstep(1.0, 0.86, abs(cl.x)) * smoothstep(1.0, 0.74, abs(cl.y));
        float a = edge * vis * vig * (0.82 + 0.18 * seed);
        v_col = vec4(col, a);
        gl_Position = vec4(cl.x, -cl.y, 0.0, 1.0);
      }`;
    const FS = `
      precision mediump float;
      varying vec4 v_col;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.34, d) * v_col.a;
        gl_FragColor = vec4(v_col.rgb * a, a);
      }`;
    const SVS = `
      attribute vec2 a_pos; attribute vec4 a_col; attribute float a_size;
      uniform vec2 u_res; uniform vec3 u_cam;
      varying vec4 v_col;
      void main() {
        vec2 cl = (a_pos * u_cam.x + u_cam.yz) / u_res * 2.0 - 1.0;
        gl_Position = vec4(cl.x, -cl.y, 0.0, 1.0);
        gl_PointSize = a_size;
        v_col = a_col * smoothstep(1.0, 0.8, abs(cl.x)) * smoothstep(1.0, 0.7, abs(cl.y));
      }`;
    const SFS = `
      precision mediump float;
      varying vec4 v_col;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = (exp(-d * d * 5.0) + 0.9 * exp(-d * d * 60.0)) * (1.0 - smoothstep(0.85, 1.0, d)) * v_col.a;
        gl_FragColor = vec4(v_col.rgb * a, a);
      }`;
    const compile = (vs, fs) => {
      const sh = (type, src) => {
        const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
      };
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      return p;
    };
    let dotBufs = null;
    function initGL() {
      try {
        gl = glCanvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, depth: false, stencil: false, preserveDrawingBuffer: false });
      } catch (e) { gl = null; }
      if (!gl) { root.classList.add('rt-nogl'); return; }
      prog = compile(VS, FS);
      sprog = compile(SVS, SFS);
      ['a_pos', 'a_info', 'a_car'].forEach(n => { U[n] = gl.getAttribLocation(prog, n); });
      ['u_res', 'u_cam', 'u_time', 'u_rp', 'u_reveal', 'u_pitch', 'u_dpr', 'u_uzb', 'u_fade', 'u_veh', 'u_revc', 'u_map', 'u_ptr', 'u_rip', 'u_ripc']
        .forEach(n => { U[n] = gl.getUniformLocation(prog, n); });
      ['a_pos', 'a_col', 'a_size'].forEach(n => { SU[n] = gl.getAttribLocation(sprog, n); });
      ['u_res', 'u_cam'].forEach(n => { SU[n] = gl.getUniformLocation(sprog, n); });
      const grid = W.innerWidth <= 768 ? DATA.grid.m : DATA.grid.d;
      const d = buildDots(grid);
      dotCount = d.count;
      U.pitch = grid.pitch;
      const inter = new Float32Array(d.count * 7);
      for (let i = 0; i < d.count; i++) {
        inter[i * 7] = d.pos[i * 2]; inter[i * 7 + 1] = d.pos[i * 2 + 1];
        for (let k = 0; k < 5; k++) inter[i * 7 + 2 + k] = d.info[i * 5 + k];
      }
      dotBufs = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, dotBufs);
      gl.bufferData(gl.ARRAY_BUFFER, inter, gl.STATIC_DRAW);
      sdata = new Float32Array(SPR_MAX * 7);
      sbuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, sbuf);
      gl.bufferData(gl.ARRAY_BUFFER, sdata.byteLength, gl.DYNAMIC_DRAW);
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      glCanvas.addEventListener('webglcontextlost', e => { e.preventDefault(); gl = null; root.classList.add('rt-nogl'); }, false);
    }
    try { initGL(); } catch (err) { gl = null; root.classList.add('rt-nogl'); }

    /* ------------------------------------------------------------ state */
    const S = { p: reduced ? 1 : 0, reveal: reduced ? 1 : 0, ptrOn: 0 };
    let target = S.p, dirty = true, timeNow = 0, pVel = 0;
    const last = { cam: '', rp: -1, p: -1, speed: -1, vo: '', arrived: -2, leg: -1, mode: 0, country: '', km: -1, day: -1, geo: '', scale: '', final: false, labelsKey: '' };
    const ptr = { x: 0, y: 0, in: false, mx: 0, my: 0 };
    let camS = 1, camTX = 0, camTY = 0, curW = 1, curRp = 0;

    /* scrubbed interface choreography */
    const headBody = q('.rt-head__body'), stopsEl = q('.rt-stops'), hudEl = hud.el, legend = q('.rt-legend');
    const ui = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    ui.to(headBody, { opacity: 0, y: -46, duration: P_IN * 0.75 }, P_IN * 0.08)
      .fromTo(hudEl, { autoAlpha: 0, y: 46 }, { autoAlpha: 1, y: 0, duration: P_IN * 0.7, ease: 'power2.out' }, P_IN * 0.35)
      .fromTo(stopsEl, { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: P_IN * 0.7, ease: 'power2.out' }, P_IN * 0.45)
      .to(stopsEl, { autoAlpha: 0, x: 40, duration: (1 - P_OUT) * 0.35 }, P_OUT + 0.004)
      .to(hudEl, { autoAlpha: 0, y: 40, duration: (1 - P_OUT) * 0.35 }, P_OUT + (1 - P_OUT) * 0.2)
      .fromTo(finalEl, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: (1 - P_OUT) * 0.5, ease: 'power2.out' }, P_OUT + (1 - P_OUT) * 0.4)
      .fromTo(legend, { autoAlpha: 1 }, { autoAlpha: W.innerWidth <= 768 ? 0 : 0.85, duration: P_IN * 0.5 }, P_IN * 0.3)
      .set({}, {}, 1);

    /* ------------------------------------------------------------ arrivals & HUD */
    const setMode = m => {
      if (m === last.mode) return;
      last.mode = m;
      vehIcos.forEach(ic => ic.classList.toggle('is-on', +ic.dataset.mode === m));
      hud.icos.forEach(ic => ic.classList.toggle('is-on', +ic.dataset.mode === m));
      hud.mode.textContent = MODES[m];
      if (!reduced) {
        gsap.fromTo(hud.mode, { yPercent: 90, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, overwrite: true });
        gsap.fromTo(q('.rt-veh__ring'), { attr: { r: 30 }, opacity: 0.2 }, { attr: { r: 22 }, opacity: 1, duration: 0.9, ease: 'elastic.out(1, .5)', overwrite: true });
      }
    };
    const ripple = { x: 0, y: 0, t0: 0, city: null };
    const popCity = c => {
      if (reduced) return;
      Object.assign(ripple, { x: c.x, y: c.y, t0: timeNow, city: c });
      gsap.fromTo(c.burst, { attr: { r: 5 }, opacity: 0.95 }, { attr: { r: c.name === 'Toshkent' ? 70 : 46 }, opacity: 0, duration: 1.4, ease: 'expo.out', overwrite: true });
      gsap.fromTo(c.ring, { attr: { r: 2 } }, { attr: { r: 6.5 }, duration: 0.9, ease: 'back.out(4)', overwrite: true });
      gsap.fromTo(c.dot, { attr: { r: 6 } }, { attr: { r: 2.6 }, duration: 0.8, ease: 'power3.out', overwrite: true });
    };
    const geoFmt = (v, pos, neg) => {
      const a = Math.abs(v), d = Math.floor(a), m = Math.floor((a - d) * 60);
      return `${v >= 0 ? pos : neg} ${d}°${String(m).padStart(2, '0')}′`;
    };
    function updateJourney(p, rp) {
      /* arrived index: last city whose fraction we have reached */
      let arrived = -1;
      if (p >= P_IN * 0.55) { arrived = 0; for (let i = 1; i < NC; i++) if (rp >= cities[i].f - 1e-4) arrived = i; }
      if (arrived !== last.arrived) {
        const prev = last.arrived;
        cities.forEach((c, i) => {
          const on = i <= arrived;
          c.node.classList.toggle('is-on', on);
          c.node.classList.toggle('is-cur', i === arrived);
          c.stop.classList.toggle('is-past', on && i !== arrived);
          c.stop.classList.toggle('is-cur', i === arrived);
          c.tick.classList.toggle('is-on', on);
          if (on && i > prev && prev >= -1 && arrived - prev <= 2) popCity(c);
        });
        last.arrived = arrived;
        last.labelsKey = '';
      }
      /* while dwelling at a city the HUD already shows the outgoing leg */
      const leg = Math.min(Math.max(legAt(rp), arrived), NC - 2);
      if (leg !== last.leg) {
        last.leg = leg;
        hud.from.textContent = cities[leg].name;
        hud.to.textContent = cities[leg + 1].name;
        if (!reduced) gsap.fromTo([hud.from, hud.to], { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.06, overwrite: true });
      }
      setMode(p >= P_OUT ? cities[NC - 2].mode : cities[leg].mode);
      /* km / day */
      const a = cities[leg], b = cities[leg + 1], u = clamp((rp - a.f) / (b.f - a.f || 1));
      const km = Math.round(lerp(a.km, b.km, u) / 10) * 10;
      if (km !== last.km) { last.km = km; hud.km.textContent = fmt(km); }
      const day = u > 0.995 ? b.day : Math.min(18, Math.floor(lerp(a.day, b.day, u) + 1e-6));
      if (day !== last.day) { last.day = day; hud.day.textContent = day; }
      hud.fill.style.transform = `scaleX(${rp.toFixed(4)})`;
      stopsLine.style.transform = `scaleY(${rp.toFixed(4)})`;
      /* country + coordinates from waypoints */
      let k = 0; while (k < wps.length - 2 && rp >= wps[k + 1].f) k++;
      const wa = wps[k], wb = wps[k + 1], wu = clamp((rp - wa.f) / (wb.f - wa.f || 1));
      const country = rp >= 1 - 1e-4 ? wps[wps.length - 1].country : wa.country;
      if (country !== last.country) {
        const first = !last.country;
        last.country = country;
        hud.country.textContent = country;
        if (!first && !reduced) { hud.cty.classList.remove('is-flash'); void hud.cty.offsetWidth; hud.cty.classList.add('is-flash'); }
      }
      const geo = `${geoFmt(lerp(wa.lat, wb.lat, wu), 'N', 'S')} · ${geoFmt(lerp(wa.lon, wb.lon, wu), 'E', 'W')}`;
      if (geo !== last.geo) { last.geo = geo; hud.geo.textContent = geo; }
      const fin = p >= P_OUT + (1 - P_OUT) * 0.3;
      if (fin !== last.final) {
        last.final = fin;
        root.classList.toggle('is-final', fin);
        hud.status.textContent = fin ? 'Yetkazildi' : 'Jonli';
        finalCta.tabIndex = fin ? 0 : -1;
        finalEl.setAttribute('aria-hidden', fin ? 'false' : 'true');
      }
    }

    function labelsFor(p) {
      const zoomedOut = curW > baseW * 1.45;
      const A = last.arrived;
      /* the current city is highlighted only while the vehicle is still near it; the next one appears on approach */
      const near = A >= 0 && curRp - cities[A].f < 0.018;
      const soon = A + 1 < NC && cities[A + 1].f - curRp < 0.07;
      const key = (zoomedOut ? 'o' : 'f') + A + (near ? 'n' : '') + (soon ? 's' : '') + (p < P_IN * 0.5 ? 'a' : p > P_OUT ? 'z' : 'm');
      if (key === last.labelsKey) return;
      last.labelsKey = key;
      cities.forEach((c, i) => {
        let st = '';
        if (zoomedOut) st = MAJOR.has(c.name) ? (i <= A ? 'on' : 'plan') : '';
        else if (i === A) st = near ? 'cur' : 'on';
        else if (i < A && i >= A - 2) st = 'on';
        else if (i === A + 1 && soon) st = 'next';
        c.lbl.dataset.st = st;
      });
    }

    /* ------------------------------------------------------------ render */
    function render(dt) {
      const p = S.p;
      const v = viewAt(p);
      curW = v[2];
      let s = SW / v[2];
      let tx = F.x - v[0] * s, ty = F.y - v[1] * s;
      if (ptr.in || Math.abs(ptr.mx) > 0.01) { tx += ptr.mx * -14; ty += ptr.my * -10; }
      camS = s; camTX = tx; camTY = ty;
      const j = clamp((p - P_IN) / (P_OUT - P_IN));
      const rp = p <= P_IN ? 0 : p >= P_OUT ? 1 : rpAt(j);
      curRp = rp;
      const camKey = s.toFixed(4) + ',' + tx.toFixed(2) + ',' + ty.toFixed(2);
      if (camKey !== last.cam || dirty) {
        last.cam = camKey;
        cam.setAttribute('transform', `matrix(${s.toFixed(5)} 0 0 ${s.toFixed(5)} ${tx.toFixed(2)} ${ty.toFixed(2)})`);
        cam.style.setProperty('--k', (1 / s).toFixed(5));
        drawLines();
        /* labels follow the camera and fade out near the screen edges */
        const edge = (x, y, m) => clamp(Math.min(x, SW - x) / m) * clamp(Math.min(y, SH - y) / (m * 0.8));
        cities.forEach(c => {
          const x = c.x * s + tx, y = c.y * s + ty;
          c.lbl.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
          c.lbl.style.opacity = edge(x, y, 70).toFixed(2);
        });
        regions.forEach(r => {
          const x = r.x * s + tx, y = r.y * s + ty;
          r.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
          r.el.style.opacity = edge(x, y, 110).toFixed(2);
        });
        /* scale bar */
        const kmPx = DATA.kmPerUnit / s;
        const opts = [50, 100, 200, 250, 500, 1000, 2000];
        let best = opts[0]; opts.forEach(o => { if (Math.abs(o / kmPx - 92) < Math.abs(best / kmPx - 92)) best = o; });
        scaleBar.style.width = (best / kmPx).toFixed(1) + 'px';
        const txt = fmt(best) + ' km';
        if (txt !== last.scale) { last.scale = txt; scaleTxt.textContent = txt; }
      }
      /* trail + vehicle (DOM writes only when something changed) */
      const vx = sampleArr(LX, rp), vy = sampleArr(LY, rp);
      const vehOn = p > P_IN * 0.4 ? 1 : p / (P_IN * 0.4);
      if (rp !== last.rp || dirty) {
        last.rp = rp;
        trailTw.progress(rp);
        const hx = sampleArr(HX, rp), hy = sampleArr(HY, rp), ang = Math.atan2(hy, hx) * 180 / Math.PI;
        veh.setAttribute('transform', `translate(${vx.toFixed(2)} ${vy.toFixed(2)})`);
        vehHead.setAttribute('transform', `rotate(${ang.toFixed(1)})`);
        hud.needle.style.transform = `rotate(${(ang + 90).toFixed(1)}deg)`;
      }
      const speed = Math.round(clamp(Math.abs(pVel) * 6) * 20) / 20;
      if (speed !== last.speed) {
        last.speed = speed;
        vehCone.setAttribute('transform', `scale(${(1 + speed * 0.9).toFixed(2)} ${(1 - speed * 0.25).toFixed(2)})`);
      }
      const vo = vehOn.toFixed(3);
      if (vo !== last.vo) { last.vo = vo; veh.style.opacity = vo; }
      if (p !== last.p || dirty) {
        last.p = p;
        updateJourney(p, rp);
        labelsFor(p);
        ui.time(p);
      }
      drawGL(vx, vy, vehOn);
      dirty = false;
    }

    function drawGL(vx, vy, vehOn) {
      if (!gl) return;
      const cw = glCanvas.width, ch = glCanvas.height;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      /* dots */
      gl.useProgram(prog);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindBuffer(gl.ARRAY_BUFFER, dotBufs);
      gl.enableVertexAttribArray(U.a_pos); gl.vertexAttribPointer(U.a_pos, 2, gl.FLOAT, false, 28, 0);
      gl.enableVertexAttribArray(U.a_info); gl.vertexAttribPointer(U.a_info, 4, gl.FLOAT, false, 28, 8);
      gl.enableVertexAttribArray(U.a_car); gl.vertexAttribPointer(U.a_car, 1, gl.FLOAT, false, 28, 24);
      gl.uniform2f(U.u_res, cw, ch);
      gl.uniform3f(U.u_cam, camS * dpr, camTX * dpr, camTY * dpr);
      gl.uniform1f(U.u_time, timeNow);
      gl.uniform1f(U.u_rp, S.p <= P_IN * 0.55 ? -1 : curRp);
      gl.uniform1f(U.u_reveal, S.reveal);
      gl.uniform1f(U.u_pitch, U.pitch);
      gl.uniform1f(U.u_dpr, dpr);
      const inUz = curRp >= cities[5].f - 0.01 && curRp <= cities[7].f + 0.02 ? 1 : 0;
      S.uzb = MU.damp(S.uzb || 0, inUz, 3, 1 / 60);
      gl.uniform1f(U.u_uzb, S.uzb * 0.8 + 0.2 * (0.5 + 0.5 * Math.sin(timeNow * 1.6)));
      gl.uniform1f(U.u_fade, vehOn * (S.p > P_OUT ? 1 - clamp((S.p - P_OUT) / (1 - P_OUT)) * 0.6 : 1));
      gl.uniform2f(U.u_veh, vx, vy);
      gl.uniform2f(U.u_revc, tosh.x, tosh.y);
      gl.uniform2f(U.u_map, DATA.w, DATA.h);
      const pm = [(ptr.x - camTX) / camS, (ptr.y - camTY) / camS];
      gl.uniform4f(U.u_ptr, pm[0], pm[1], S.ptrOn, 95 / camS);
      const hq = ripple.city && ripple.city.name === 'Toshkent';
      gl.uniform4f(U.u_rip, ripple.x, ripple.y, ripple.city ? timeNow - ripple.t0 : -1, hq ? 230 : 150);
      if (hq) gl.uniform3f(U.u_ripc, 1.0, 0.72, 0.3); else gl.uniform3f(U.u_ripc, 0.3, 0.95, 0.9);
      gl.drawArrays(gl.POINTS, 0, dotCount);
      gl.disableVertexAttribArray(U.a_info); gl.disableVertexAttribArray(U.a_car);
      /* glow sprites: packets on the trail, caravan ghosts, arrived-city glows */
      let n = 0;
      const put = (x, y, r, g, b, a, size) => {
        if (n >= SPR_MAX) return;
        const o = n * 7;
        sdata[o] = x; sdata[o + 1] = y; sdata[o + 2] = r; sdata[o + 3] = g; sdata[o + 4] = b; sdata[o + 5] = a; sdata[o + 6] = size * dpr;
        n++;
      };
      const rv = S.reveal;
      if (curRp > 0.02 && S.p > P_IN * 0.6) {
        for (let k = 0; k < 4; k++) {
          const f = ((timeNow * 0.09 + k / 4) % 1) * curRp;
          const fade = Math.sin(Math.PI * (((timeNow * 0.09 + k / 4) % 1)));
          put(sampleArr(LX, f), sampleArr(LY, f), 0.55, 1, 0.95, 0.8 * fade, 18);
        }
      }
      if (rv > 0.3) {
        for (let k = 0; k < 6; k++) {
          const f = (timeNow * 0.012 + k / 6) % 1, i = Math.floor(f * CN);
          put(CAX[i], CAY[i], 1, 0.78, 0.4, 0.55 * Math.min(1, (rv - 0.3) * 2) * Math.sin(Math.PI * ((f * 6) % 1)), 11);
        }
      }
      cities.forEach((c, i) => {
        if (i <= last.arrived) put(c.x, c.y, i === 5 ? 1 : 0.4, i === 5 ? 0.8 : 1, i === 5 ? 0.4 : 0.92, i === last.arrived ? 0.9 : 0.45, i === 5 ? 60 : 34);
      });
      if (n) {
        gl.useProgram(sprog);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.bindBuffer(gl.ARRAY_BUFFER, sbuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, sdata.subarray(0, n * 7));
        gl.enableVertexAttribArray(SU.a_pos); gl.vertexAttribPointer(SU.a_pos, 2, gl.FLOAT, false, 28, 0);
        gl.enableVertexAttribArray(SU.a_col); gl.vertexAttribPointer(SU.a_col, 4, gl.FLOAT, false, 28, 8);
        gl.enableVertexAttribArray(SU.a_size); gl.vertexAttribPointer(SU.a_size, 1, gl.FLOAT, false, 28, 24);
        gl.uniform2f(SU.u_res, cw, ch);
        gl.uniform3f(SU.u_cam, camS * dpr, camTX * dpr, camTY * dpr);
        gl.drawArrays(gl.POINTS, 0, n);
        gl.disableVertexAttribArray(SU.a_col); gl.disableVertexAttribArray(SU.a_size);
      }
    }

    /* DrawSVG trail (progress set from the scroll schedule) */
    const trailTw = gsap.fromTo(trails, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', ease: 'none', duration: 1, paused: true });

    /* ------------------------------------------------------------ loop */
    let prevP = S.p;
    const lambda = () => (MU.lenis ? 11 : 7.5);
    let lastT = -1;
    const loop = MU.renderLoop(stage, (t, dt) => {
      /* real elapsed time for the scroll damping so state converges even at low frame rates */
      const rdt = lastT < 0 ? dt : clamp(t - lastT, 0, 1);
      lastT = t;
      timeNow = t;
      const d = target - S.p;
      S.p = Math.abs(d) < 1e-5 ? target : S.p + d * (1 - Math.exp(-lambda() * rdt));
      pVel = MU.damp(pVel, (S.p - prevP) / Math.max(dt, 1e-3), 6, dt);
      prevP = S.p;
      const on = ptr.in ? 1 : 0;
      S.ptrOn = MU.damp(S.ptrOn, on, 5, dt);
      ptr.mx = MU.damp(ptr.mx, ptr.in ? (ptr.x / SW - 0.5) * 2 : 0, 3, dt);
      ptr.my = MU.damp(ptr.my, ptr.in ? (ptr.y / SH - 0.5) * 2 : 0, 3, dt);
      render(dt);
    }, { margin: '60px' });
    if (reduced) loop.stop();

    /* ------------------------------------------------------------ sizing */
    layout();
    const ro = new ResizeObserver(() => { layout(); if (!loop.running) render(0); });
    ro.observe(stage);

    /* ------------------------------------------------------------ pointer lamp + parallax (desktop) */
    if (hover && !reduced) {
      stage.addEventListener('pointermove', e => {
        const r = stage.getBoundingClientRect();
        ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.in = true;
      });
      stage.addEventListener('pointerleave', () => { ptr.in = false; });
    }

    /* ------------------------------------------------------------ stops rail: jump to a city */
    let st = null;
    cities.forEach((c, i) => {
      c.stop.addEventListener('click', () => {
        if (!st) return;
        const y = st.start + pForCity(i) * (st.end - st.start);
        MU.scrollTo(y, { duration: 1.4 });
      });
    });

    /* ------------------------------------------------------------ static in-view helpers (CSS loops pause offscreen) */
    MU.onVisible(root, v => root.classList.toggle('is-inview', v), '0px');

    if (reduced) {
      root.classList.add('is-static');
      S.p = target = 1; S.reveal = 1;
      render(0);
      gsap.set([headBody, legend], { clearProps: 'all' });
      gsap.set([finalEl, stopsEl, hudEl], { autoAlpha: 0 });
      return;
    }

    /* ------------------------------------------------------------ entrance: sonar reveal from Toshkent */
    const svgIntro = gsap.timeline({ paused: true });
    svgIntro
      .to(S, { reveal: 1, duration: 3.2, ease: 'power2.out', onUpdate: () => { dirty = true; } }, 0)
      .fromTo(linesCanvas, { opacity: 0 }, { opacity: 1, duration: 2.2 }, 0.3)
      .fromTo([q('.rt-uzb'), q('.rt-uzb-glow')], { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.6, ease: 'power2.inOut' }, 0.1)
      .fromTo(q('.rt-uzb-fill'), { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0.8)
      .fromTo(q('.rt-caravan-mask'), { drawSVG: '100% 100%' }, {
        drawSVG: '0% 100%', duration: 2.6, ease: 'power2.inOut',
        onComplete: () => q('.rt-caravan').removeAttribute('mask')
      }, 0.6)
      .fromTo(q('.rt-caravan-txt'), { opacity: 0 }, { opacity: 1, duration: 1.2 }, 2.2)
      .fromTo(q('.rt-plan'), { opacity: 0 }, { opacity: 1, duration: 1.4 }, 1)
      .fromTo(cities.map(c => c.node), { opacity: 0 }, {
        opacity: 1, duration: 0.6, stagger: i => Math.abs(i - 5) * 0.12
      }, 0.9)
      .fromTo(labelsEl, { opacity: 0 }, { opacity: 1, duration: 1.2 }, 1.3)
      .fromTo(legend.children, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, 1.2);
    ScrollTrigger.create({ trigger: root, start: 'top 72%', once: true, onEnter: () => svgIntro.play() });

    /* ------------------------------------------------------------ pinned scroll */
    st = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: () => '+=' + Math.round(W.innerHeight * (W.innerWidth <= 768 ? 2.4 : 2.8)),
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: self => { target = self.progress; },
      onRefresh: self => { target = self.progress; }
    });
    render(0);
  }
});
