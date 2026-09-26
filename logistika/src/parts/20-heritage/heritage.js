/* ==========================================================================
   20-heritage · Ulugʻbek merosi
   Pinned story. ~1400 particles (700 mobile) rendered with WebGL points morph
   with scroll: starfield → Faxriy sextant (meridian arc + graduations + swinging
   alidade) → Silk-Road constellation (Toshkent hub) → 8-point girih star.
   Per-particle delays + curved 3D flight paths, pointer repel + click ripple,
   a 2D vector layer (rails, labels, caravan pulses, astrolabe inscription),
   text panels synced to phases, year odometer 1429 → 2026, 1018 → 12 000+.
   After the pin: a statement whose words light up with scroll.
   ========================================================================== */
MU.part('heritage', {
  init(root, MU) {
    if (!root) return;
    const { gsap, ScrollTrigger, SplitText } = MU;
    const $ = s => root.querySelector(s), $$ = s => Array.from(root.querySelectorAll(s));
    const clamp = MU.clamp;
    const smooth = t => (t = clamp(t), t * t * (3 - 2 * t));
    const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const TAU = Math.PI * 2, D2R = Math.PI / 180;

    const stage = $('.her-stage');
    const glCanvas = $('.her-gl'), vCanvas = $('.her-vec');
    const REDUCED = MU.reduced;
    if (REDUCED) root.classList.add('her--static');
    if (MU.isTouch) root.classList.add('her--touch');

    /* deterministic randomness (same sky on every load) */
    let seed = 1429;
    const rnd = () => {
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const MOBILE = MU.isMobile;
    const N = MOBILE ? 700 : 1400;
    const ND = Math.round(N * 0.2);   /* permanent background stars */
    const NC = N - ND;                /* particles that build the shapes */

    const COL = {
      white: [0.95, 0.97, 1], ice: [0.7, 0.82, 1], turq: [0.18, 0.9, 0.84], azure: [0.26, 0.56, 1],
      violet: [0.56, 0.44, 1], gold: [1, 0.78, 0.38], amber: [1, 0.6, 0.24], brass: [1, 0.87, 0.62], coral: [1, 0.4, 0.25]
    };
    const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

    /* ================================================================ geometry
       shape space: origin = shape centre, 1 unit = S px                        */
    const segLine = (x1, y1, x2, y2) => ({ len: Math.hypot(x2 - x1, y2 - y1), at: u => [x1 + (x2 - x1) * u, y1 + (y2 - y1) * u] });
    const segArc = (cx, cy, r, a1, a2) => ({ len: Math.abs(a2 - a1) * r, at: u => { const a = a1 + (a2 - a1) * u; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; } });
    const group = segs => {
      const L = segs.reduce((s, g) => s + g.len, 0);
      return {
        at(u) {
          let d = u * L;
          for (let i = 0; i < segs.length; i++) {
            const g = segs[i];
            if (d <= g.len || i === segs.length - 1) return g.at(g.len ? Math.min(1, d / g.len) : 0);
            d -= g.len;
          }
          return [0, 0];
        }
      };
    };
    const disc = (cx, cy, r) => ({ rand: true, at: () => { const a = rnd() * TAU, d = Math.sqrt(rnd()) * r; return [cx + Math.cos(a) * d, cy + Math.sin(a) * d]; } });
    const circle = (cx, cy, r, a1 = 0, a2 = TAU) => group([segArc(cx, cy, r, a1, a2)]);
    const poly = pts => group(pts.slice(0, -1).map((p, i) => segLine(p[0], p[1], pts[i + 1][0], pts[i + 1][1])));

    /* roles: 0 static · 1 rotates with girih · 3 alidade arm · 4 sight star · 5 Toshkent breathing */
    function makeShape(prims, n) {
      const tw = prims.reduce((s, p) => s + p.w, 0);
      const counts = prims.map(p => Math.floor(p.w / tw * n));
      let left = n - counts.reduce((a, b) => a + b, 0), k = 0;
      while (left-- > 0) counts[(k++) % counts.length]++;
      const out = [];
      prims.forEach((p, pi) => {
        const c = counts[pi];
        for (let j = 0; j < c; j++) {
          const u = p.geo.rand ? rnd() : (j + 0.5) / c;
          const pt = p.geo.at(u);
          const jit = p.jit == null ? 0.005 : p.jit;
          const col = typeof p.col === 'function' ? p.col(u, pt) : p.col;
          const o = {
            x: pt[0] + (rnd() - .5) * 2 * jit, y: pt[1] + (rnd() - .5) * 2 * jit, z: (rnd() - .5) * 0.05,
            c: col, a: p.a * (0.82 + rnd() * 0.3), s: p.s * (0.8 + rnd() * 0.4),
            key: clamp((p.key ? p.key(u, pt) : rnd()) * 0.84 + rnd() * 0.16),
            role: p.role || 0, rp: p.rp ? p.rp(u) : 0
          };
          const e = p.eval ? p.eval(o) : o;
          o.ang = Math.atan2(e.y, e.x);
          out.push(o);
        }
      });
      out.sort((a, b) => a.ang - b.ang);
      return out;
    }

    /* ---- I · Faxriy sextant (meridian arc) ---- */
    const PV = [0, -0.78], RO = 1.7, RI = 1.55, RM = 0.9;
    const A0 = 58 * D2R, A1 = 122 * D2R;
    const degA = d => (120 - d) * D2R;          /* scale reading d° → angle */
    const polar = (r, a) => [PV[0] + Math.cos(a) * r, PV[1] + Math.sin(a) * r];
    function shapeArc(n) {
      const ticks = [], majors = [];
      for (let d = 0; d <= 60; d++) {
        const a = degA(d), major = d % 10 === 0, mid = d % 5 === 0;
        const r1 = major ? RI - 0.03 : mid ? RI + 0.01 : RI + 0.05;
        const r2 = major ? RO + 0.04 : mid ? RO - 0.01 : RO - 0.05;
        const p1 = polar(r1, a), p2 = polar(r2, a);
        (major ? majors : ticks).push(segLine(p1[0], p1[1], p2[0], p2[1]));
      }
      const e0 = polar(RO, A0), e1 = polar(RO, A1);
      const s1 = polar(RM, A0), s2 = polar(RM, A1);
      const struts = [80, 100].map(d => { const a = d * D2R, p = polar(RM, a), q = polar(RI, a); return segLine(p[0], p[1], q[0], q[1]); });
      const arcKey = u => 0.3 + 0.7 * u;
      return makeShape([
        { geo: circle(PV[0], PV[1], RO, A1, A0), w: 21, col: COL.gold, a: .78, s: 1.25, key: arcKey },
        { geo: circle(PV[0], PV[1], RI, A1, A0), w: 14, col: COL.amber, a: .7, s: 1.1, key: arcKey },
        { geo: group(ticks), w: 15, col: COL.brass, a: .72, s: 1.0, key: u => 0.4 + 0.6 * u, jit: .003 },
        { geo: group(majors), w: 8, col: COL.white, a: .9, s: 1.2, key: u => 0.45 + 0.55 * u, jit: .003 },
        { geo: group([segLine(PV[0], PV[1], e1[0], e1[1]), segLine(PV[0], PV[1], e0[0], e0[1])]), w: 13, col: COL.gold, a: .62, s: 1.05, key: u => (u % .5) * 0.6 },
        { geo: circle(PV[0], PV[1], RM, A1 - .02, A0 + .02), w: 6, col: COL.amber, a: .5, s: .95, key: u => .2 + .5 * u },
        { geo: group(struts.concat([segLine(s1[0], s1[1], e0[0], e0[1]), segLine(s2[0], s2[1], e1[0], e1[1])])), w: 4, col: COL.amber, a: .45, s: .9, key: () => .5 },
        { geo: circle(PV[0], PV[1], 0.075), w: 3, col: COL.white, a: .9, s: 1.1, key: () => 0 },
        { geo: disc(PV[0], PV[1], 0.03), w: 2, col: COL.white, a: 1, s: 1.4, key: () => 0 },
        { geo: { at: u => [0, 0] }, w: 9, col: COL.turq, a: .95, s: 1.2, role: 3, rp: u => 0.1 + 1.72 * u, jit: .004, key: u => .15 + .5 * u,
          eval: o => ({ x: PV[0] + Math.cos(90 * D2R) * o.rp, y: PV[1] + Math.sin(90 * D2R) * o.rp }) },
        { geo: disc(0, 0, 0.035), w: 3, col: COL.white, a: 1, s: 1.5, role: 4, key: () => .9,
          eval: o => ({ x: o.x, y: o.y - 1.14 }) }
      ], n);
    }

    /* ---- II · Silk-Road constellation ---- */
    const CITIES = [
      ['Toshkent', 0, 0, 3, 's'], ['Samarqand', -0.26, 0.2, 1, 's'], ['Buxoro', -0.5, 0.1, 1, 'n'],
      ['Turkmanboshi', -0.7, 0.31, 1, 's'], ['Boku', -0.87, 0.05, 1, 'e'], ['Tbilisi', -0.97, -0.22, 1, 'n'],
      ['Istanbul', -1.2, -0.02, 1.5, 's'], ['Duisburg', -1.1, -0.52, 1.5, 'n'],
      ['Olmaota', 0.28, -0.14, 1, 's'], ['Qorgʻos', 0.48, -0.31, 1, 'n'], ['Urumchi', 0.71, -0.18, 1, 's'],
      ['Sian', 0.94, 0.12, 1, 'n'], ['Shanghai', 1.16, 0.34, 1.5, 's'],
      ['Moskva', -0.52, -0.6, 1.5, 'n'], ['Dubay', -0.34, 0.62, 1.5, 's']
    ];
    const EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [0, 8], [8, 9], [9, 10], [10, 11], [11, 12],
      [0, 13], [13, 7], [0, 14], [1, 14]];
    const cdist = i => Math.hypot(CITIES[i][1], CITIES[i][2]);
    const MAXD = Math.max(...CITIES.map((c, i) => cdist(i)));
    /* orient edges away from Toshkent (lines grow outward) */
    EDGES.forEach(e => { if (cdist(e[0]) > cdist(e[1])) e.reverse(); });
    function shapeCon(n) {
      const edgeSegs = EDGES.map(([a, b]) => segLine(CITIES[a][1], CITIES[a][2], CITIES[b][1], CITIES[b][2]));
      const prims = [
        { geo: group(edgeSegs), w: 46, col: (u, p) => mixc(COL.turq, COL.azure, clamp(Math.abs(p[0]) / 1.2)), a: .5, s: .95, jit: .004,
          key: (u, p) => Math.hypot(p[0], p[1]) / MAXD },
        { geo: disc(0, 0, 0.022), w: 2.5, col: COL.gold, a: 1, s: 1.3, role: 5, key: () => 0 },
        { geo: circle(0, 0, 0.12), w: 6, col: COL.gold, a: .75, s: 1.05, role: 5, key: () => .05, jit: .003 },
        { geo: circle(0, 0, 0.36), w: 7, col: COL.azure, a: .3, s: .85, key: u => .1 + .2 * u, jit: .002 }
      ];
      CITIES.forEach((c, i) => {
        if (!i) return;
        prims.push({ geo: disc(c[1], c[2], 0.006 + 0.004 * c[3]), w: 0.55 * c[3] + 0.5, col: c[3] > 1 ? COL.white : COL.ice, a: 1, s: 1.0 + 0.22 * c[3], key: () => cdist(i) / MAXD });
      });
      return makeShape(prims, n);
    }

    /* ---- III · 8-point girih star ---- */
    const RG = 0.98;
    const starPts = (R, r, rot, k = 8) => {
      const pts = [];
      for (let i = 0; i <= k * 2; i++) { const rr = i % 2 ? r : R, a = rot + i * Math.PI / k; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
      return pts;
    };
    const square = rot => { const p = []; for (let k = 0; k <= 4; k++) { const a = rot + k * Math.PI / 2; p.push([Math.cos(a) * RG, Math.sin(a) * RG]); } return p; };
    const angKey = (u, p) => ((Math.atan2(p[1], p[0]) + Math.PI) / TAU) * 0.7 + Math.hypot(p[0], p[1]) * 0.2;
    function shapeGir(n) {
      const inner = starPts(0.52, 0.34, -Math.PI / 2 + Math.PI / 8);
      const spokes = [];
      for (let k = 0; k < 8; k++) {
        const a = -Math.PI / 2 + Math.PI / 8 + k * Math.PI / 4;
        spokes.push(segLine(Math.cos(a) * 0.52, Math.sin(a) * 0.52, Math.cos(a) * 0.724 * RG, Math.sin(a) * 0.724 * RG));
      }
      const beads = [];
      for (let k = 0; k < 8; k++) { const a = -Math.PI / 2 + k * Math.PI / 4; beads.push(disc(Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0.011)); }
      const beadGeo = { rand: true, at: () => beads[(rnd() * 8) | 0].at() };
      return makeShape([
        { geo: poly(square(-Math.PI / 2)), w: 19, col: (u, p) => mixc(COL.turq, COL.azure, (p[0] + 1) / 2), a: .72, s: 1.1, role: 1, key: angKey },
        { geo: poly(square(-Math.PI / 4)), w: 19, col: (u, p) => mixc(COL.azure, COL.violet, (p[1] + 1) / 2), a: .72, s: 1.1, role: 1, key: angKey },
        { geo: poly(inner), w: 14, col: COL.gold, a: .8, s: 1.05, role: 1, key: u => .3 + .5 * u },
        { geo: group(spokes), w: 6, col: COL.brass, a: .55, s: .9, role: 1, key: () => .55 },
        { geo: disc(0, 0, 0.035), w: 2, col: COL.gold, a: 1, s: 1.2, role: 1, key: () => .1 },
        { geo: circle(0, 0, 0.17), w: 5, col: COL.amber, a: .7, s: 1, role: 1, key: () => .15 },
        { geo: circle(0, 0, 1.15), w: 20, col: (u) => mixc(COL.azure, COL.violet, Math.abs(Math.sin(u * TAU))), a: .42, s: .9, role: 1, key: u => .5 + .5 * u, jit: .003 },
        { geo: beadGeo, w: 6, col: COL.white, a: 1, s: 1.25, role: 1, key: () => .95 }
      ], n);
    }

    /* ================================================================ particle state */
    const SH = 4;
    const X = [], Y = [], Z = [], CR = [], CG = [], CB = [], AL = [], SZ = [], DL = [], RL = [], RP = [];
    for (let s = 0; s < SH; s++) {
      X[s] = new Float32Array(N); Y[s] = new Float32Array(N); Z[s] = new Float32Array(N);
      CR[s] = new Float32Array(N); CG[s] = new Float32Array(N); CB[s] = new Float32Array(N);
      AL[s] = new Float32Array(N); SZ[s] = new Float32Array(N); DL[s] = new Float32Array(N);
      RL[s] = new Uint8Array(N); RP[s] = new Float32Array(N);
    }
    /* stars: stage-fraction coordinates + depth */
    const SU = new Float32Array(N), SV = new Float32Array(N), SDZ = new Float32Array(N);
    const PH = new Float32Array(N), TW = new Float32Array(N), SW = new Float32Array(N), ZB = new Float32Array(N);
    const OX = new Float32Array(N), OY = new Float32Array(N), VX = new Float32Array(N), VY = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      SU[i] = -0.04 + rnd() * 1.08; SV[i] = -0.04 + rnd() * 1.08; SDZ[i] = -0.5 + Math.pow(rnd(), 0.8) * 2;
      PH[i] = rnd() * TAU; TW[i] = 0.6 + rnd() * 2.4; SW[i] = 0.62 + rnd() * 0.36; ZB[i] = -0.95 + rnd() * 0.55;
      const r = rnd(), c = r < 0.1 ? COL.gold : r < 0.2 ? COL.turq : r < 0.5 ? COL.ice : COL.white;
      CR[0][i] = c[0]; CG[0][i] = c[1]; CB[0][i] = c[2];
      AL[0][i] = 0.42 + Math.pow(rnd(), 1.3) * 0.58;
      SZ[0][i] = 0.62 + Math.pow(rnd(), 2.6) * 1.9;
      DL[0][i] = rnd();
    }
    const fill = (s, list) => {
      list.forEach((o, i) => {
        X[s][i] = o.x; Y[s][i] = o.y; Z[s][i] = o.z; CR[s][i] = o.c[0]; CG[s][i] = o.c[1]; CB[s][i] = o.c[2];
        AL[s][i] = Math.min(1, o.a); SZ[s][i] = o.s; DL[s][i] = o.key; RL[s][i] = o.role; RP[s][i] = o.rp;
      });
      for (let i = NC; i < N; i++) {   /* dust keeps its star position, dimmed */
        CR[s][i] = CR[0][i]; CG[s][i] = CG[0][i]; CB[s][i] = CB[0][i];
        AL[s][i] = AL[0][i] * 0.45; SZ[s][i] = SZ[0][i]; DL[s][i] = 0; RL[s][i] = 9;
      }
    };
    fill(1, shapeArc(NC));
    fill(2, shapeCon(NC));
    fill(3, shapeGir(NC));

    /* ================================================================ layout */
    let W = 1, H = 1, DPR = 1, CX = 0, CY = 0, S = 100, PORTRAIT = false;
    const SC = [1, 1, 1, 1];   /* per-shape scale (the flat constellation may spread wider on landscape) */
    const F = 3.2;            /* perspective focal (shape units) */
    let sorted = false;
    const ringImg = document.createElement('canvas');

    function layout() {
      W = Math.max(1, stage.clientWidth); H = Math.max(1, stage.clientHeight);
      DPR = MU.dpr(2);
      PORTRAIT = W < 900 || W / H < 1.05;
      if (REDUCED) {
        PORTRAIT = W < 900;
        CX = PORTRAIT ? W * 0.5 : W * 0.72; CY = PORTRAIT ? Math.min(H * 0.5, 260) : H * 0.42;
        S = PORTRAIT ? Math.min(W * 0.3, 150) : Math.min(H * 0.26, W * 0.16);
      } else if (PORTRAIT) {
        CX = W * 0.5; S = Math.min(W * 0.35, H * 0.2, 250); CY = Math.max(S * 1.35 + 76, H * 0.34);
      } else {
        /* fit between the top HUD row and the bottom HUD row */
        const top = Math.min(118, H * 0.13), bot = Math.min(150, H * 0.17);
        S = Math.min((H - top - bot) / 2.62, W * 0.2);
        CX = Math.min(W * 0.635, W - S * 1.62); CY = top + (H - top - bot) / 2 + S * 0.02;
      }
      SC[2] = PORTRAIT ? Math.min(1, (W * 0.5 - 8) / (S * 1.32)) : 1.2;
      [glCanvas, vCanvas].forEach(c => { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); });
      root.style.setProperty('--her-cx', CX.toFixed(0) + 'px');
      root.style.setProperty('--her-cy', CY.toFixed(0) + 'px');
      /* star positions → shape space (accounting for depth so they land on their screen spot) */
      for (let i = 0; i < N; i++) {
        const k = F / (F + SDZ[i]);
        X[0][i] = (SU[i] * W - CX) / (S * k); Y[0][i] = (SV[i] * H - CY) / (S * k); Z[0][i] = SDZ[i];
        for (let s = 1; s < SH; s++) if (i >= NC) { X[s][i] = X[0][i]; Y[s][i] = Y[0][i]; Z[s][i] = Z[0][i]; }
      }
      if (!sorted) {   /* core stars ordered by angle around the shape centre → coherent radial morph */
        sorted = true;
        const idx = Array.from({ length: NC }, (_, i) => i).sort((a, b) => Math.atan2(Y[0][a], X[0][a]) - Math.atan2(Y[0][b], X[0][b]));
        const cp = arr => { const c = arr.slice(0, NC); idx.forEach((j, i) => { arr[i] = c[j]; }); };
        [SU, SV, SDZ, CR[0], CG[0], CB[0], AL[0], SZ[0], DL[0]].forEach(cp);
        layout();
        return;
      }
      buildRing();
      if (vctx) vctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (gl) gl.viewport(0, 0, glCanvas.width, glCanvas.height);
      if (REDUCED) renderStatic();
    }

    /* astrolabe inscription + tick ring pre-rendered (rotated each frame as an image) */
    const INSCR = 'ULUGʻBEK LOGISTICS ✦ TOSHKENT ✦ 2009 ✦ 47 DAVLAT ✦ 1018 YULDUZ ✦ YULDUZLAR ANIQLIGIDA ✦ ';
    function buildRing() {
      const R = S * 1.3, pad = 16, size = Math.ceil((R + pad) * 2);
      ringImg.width = Math.round(size * DPR); ringImg.height = Math.round(size * DPR);
      const c = ringImg.getContext('2d');
      c.setTransform(DPR, 0, 0, DPR, size / 2 * DPR, size / 2 * DPR);
      c.clearRect(-size, -size, size * 2, size * 2);
      const fs = Math.max(8, Math.min(11, S * 0.034));
      c.font = `600 ${fs}px "JetBrains Mono", monospace`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      const chars = Array.from(INSCR);
      const step = TAU / chars.length;
      chars.forEach((ch, i) => {
        c.save(); c.rotate(i * step); c.translate(0, -R);
        c.fillStyle = ch === '✦' ? 'rgba(255,200,97,.95)' : 'rgba(234,241,255,.62)';
        c.fillText(ch, 0, 0); c.restore();
      });
      const r1 = S * 1.205, r2 = S * 1.235;
      for (let i = 0; i < 144; i++) {
        const a = i * TAU / 144, major = i % 18 === 0, r0 = major ? r1 - S * 0.03 : i % 6 === 0 ? r1 - S * 0.012 : r1;
        c.strokeStyle = major ? 'rgba(255,200,97,.8)' : 'rgba(150,180,255,.32)';
        c.lineWidth = major ? 1.4 : 1;
        c.beginPath(); c.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); c.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); c.stroke();
      }
      c.strokeStyle = 'rgba(150,180,255,.22)'; c.lineWidth = 1;
      c.beginPath(); c.arc(0, 0, r2 + S * 0.012, 0, TAU); c.stroke();
    }

    /* ================================================================ WebGL points */
    let gl = null, glBuf = null, glLoc = null, ctx2 = null;
    const BUF = new Float32Array(N * 7);
    function initGL() {
      try {
        gl = glCanvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' });
      } catch (e) { gl = null; }
      if (!gl) { ctx2 = glCanvas.getContext('2d'); return; }
      const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER,
        'attribute vec2 p;attribute float s;attribute vec4 c;uniform vec2 r;varying vec4 vc;' +
        'void main(){gl_Position=vec4(p.x/r.x*2.0-1.0,1.0-p.y/r.y*2.0,0.0,1.0);gl_PointSize=s;vc=c;}'));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER,
        'precision mediump float;varying vec4 vc;' +
        'void main(){vec2 q=gl_PointCoord*2.0-1.0;float d=dot(q,q);if(d>1.0)discard;' +
        'float core=smoothstep(0.2,0.0,d);float halo=exp(-d*5.0)*0.6*(1.0-d);float a=(core+halo)*vc.a;' +
        'gl_FragColor=vec4(mix(vc.rgb,vec3(1.0),core*0.6)*a,a);}'));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl = null; ctx2 = null; return; }
      gl.useProgram(prog);
      glBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, glBuf);
      gl.bufferData(gl.ARRAY_BUFFER, BUF.byteLength, gl.DYNAMIC_DRAW);
      const at = (name, size, off) => { const l = gl.getAttribLocation(prog, name); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, gl.FLOAT, false, 28, off); };
      at('p', 2, 0); at('s', 1, 8); at('c', 4, 12);
      glLoc = gl.getUniformLocation(prog, 'r');
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.clearColor(0, 0, 0, 0);
    }
    initGL();
    glCanvas.addEventListener('webglcontextlost', e => { e.preventDefault(); gl = null; });
    glCanvas.addEventListener('webglcontextrestored', () => { initGL(); layout(); });
    const MAXPS = gl ? (gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) || [1, 64])[1] : 64;
    const vctx = vCanvas.getContext('2d');

    /* ================================================================ interaction */
    const ptr = { x: -9999, y: -9999, on: false, nx: 0, ny: 0 };
    const ripples = [];
    const setPtr = (cx, cy) => {
      const r = stage.getBoundingClientRect();
      ptr.x = cx - r.left; ptr.y = cy - r.top; ptr.on = true;
      ptr.nx = (ptr.x / W - 0.5) * 2; ptr.ny = (ptr.y / H - 0.5) * 2;
    };
    if (!REDUCED) {
      stage.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') setPtr(e.clientX, e.clientY); }, { passive: true });
      stage.addEventListener('pointerleave', () => { ptr.on = false; });
      stage.addEventListener('touchstart', e => { const t = e.touches[0]; if (t) setPtr(t.clientX, t.clientY); }, { passive: true });
      stage.addEventListener('touchmove', e => { const t = e.touches[0]; if (t) setPtr(t.clientX, t.clientY); }, { passive: true });
      stage.addEventListener('touchend', () => { ptr.on = false; }, { passive: true });
      stage.addEventListener('click', e => {
        const r = stage.getBoundingClientRect();
        ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: 0, hit: false });
        if (ripples.length > 4) ripples.shift();
      });
    }

    /* ================================================================ HUD + panels */
    const intro = $('.her-intro'), hudBottom = $('.her-hud__bottom'), coord = $('.her-coord');
    const coordV = $('.her-coord__v'), coordL = $('.her-coord__l');
    const phaseEls = $$('.her-phase'), phaseBars = $$('.her-phase__bar i');
    const countV = $('.her-count__v'), countBox = $('.her-count');
    const ruler = $('.her-ruler'), rulerMark = $('.her-ruler__mark'), rulerLbl = $('.her-ruler__mark b'), hint = $('.her-hint');
    const glow = $('.her-glow');

    /* year odometer strips */
    const odo = $$('.her-odo');
    odo.forEach(d => {
      const strip = document.createElement('span');
      strip.className = 'her-odo__s';
      strip.innerHTML = '0123456789' .split('').concat('0').map(n => `<span>${n}</span>`).join('');
      d.textContent = '';
      d.appendChild(strip);
    });
    const odoStrips = odo.map(d => d.firstChild);
    let lastYear = -1;
    function setYear(v) {
      if (Math.abs(v - lastYear) < 0.002) return;
      lastYear = v;
      for (let k = 0; k < 4; k++) {
        const p = Math.pow(10, k);
        const dgt = Math.floor(v / p) % 10;
        const f = k === 0 ? v % 1 : Math.max(0, (v % p) - (p - 1));
        const pos = dgt + f;
        odoStrips[3 - k].style.transform = `translate3d(0,${(-pos * 100 / 11).toFixed(3)}%,0)`;
      }
    }

    /* panels: title words + lead + facts, direction-aware transitions */
    const panels = $$('.her-panel').map(el => {
      const t = el.querySelector('.her-panel__t');
      const split = SplitText.create(t, { type: 'words', wordsClass: 'her-pw', tag: 'span' });
      return {
        el, words: split.words, k: el.querySelector('.her-panel__k'),
        lead: el.querySelector('.her-panel__p'), facts: Array.from(el.querySelectorAll('.her-panel__f li'))
      };
    });
    let active = -1;
    function panelOut(p, dir) {
      p.el.classList.remove('is-active');
      gsap.killTweensOf([p.words, p.k, p.lead, p.facts]);
      gsap.to(p.words, { yPercent: -70 * dir, opacity: 0, filter: 'blur(8px)', duration: .42, stagger: .012, ease: 'power2.in', overwrite: true });
      gsap.to([p.k, p.lead].concat(p.facts), { y: -22 * dir, opacity: 0, filter: 'blur(6px)', duration: .38, ease: 'power2.in', overwrite: true });
    }
    function panelIn(p, dir) {
      p.el.classList.add('is-active');
      gsap.killTweensOf([p.words, p.k, p.lead, p.facts]);
      gsap.fromTo(p.words, { yPercent: 80 * dir, opacity: 0, rotationX: -60 * dir, filter: 'blur(10px)', transformOrigin: '50% 100%', transformPerspective: 700 },
        { yPercent: 0, opacity: 1, rotationX: 0, filter: 'blur(0px)', duration: 1.05, stagger: .04, delay: .16, ease: 'mu.out', overwrite: true });
      gsap.fromTo(p.k, { y: 16 * dir, opacity: 0, filter: 'blur(4px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .8, delay: .08, overwrite: true });
      gsap.fromTo(p.lead, { y: 30 * dir, opacity: 0, filter: 'blur(8px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, delay: .32, overwrite: true });
      gsap.fromTo(p.facts, { y: 26 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .09, delay: .45, overwrite: true });
    }
    function setActive(i) {
      if (i === active) return;
      const dir = i > active ? 1 : -1;
      if (active > 0) panelOut(panels[active - 1], dir);
      if (i > 0) panelIn(panels[i - 1], dir);
      phaseEls.forEach((el, k) => { el.classList.toggle('is-active', k + 1 === i); el.classList.toggle('is-done', k + 1 < i); });
      root.dataset.phase = i;
      active = i;
    }
    if (!REDUCED) panels.forEach(p => gsap.set([p.words, p.k, p.lead].concat(p.facts), { opacity: 0 }));

    let coordState = 0;
    const COORDS = [['39°40′N · 67°00′E', 'Samarqand rasadxonasi'], ['41°18′N · 69°14′E', 'Toshkent · markaz']];
    function setCoord(i) {
      if (i === coordState) return;
      coordState = i;
      const [v, l] = COORDS[i];
      if (REDUCED || !window.ScrambleTextPlugin) { coordV.textContent = v; coordL.textContent = l; return; }
      gsap.to(coordV, { duration: .9, scrambleText: { text: v, chars: '0123456789°′NE·', speed: .7 }, overwrite: true });
      gsap.to(coordL, { duration: .9, scrambleText: { text: l, chars: 'lowerCase', speed: .7 }, overwrite: true });
    }

    let lastCount = -1, countMode = 0;
    function setCount(v, mode) {
      const n = Math.round(v);
      if (n !== lastCount) { lastCount = n; countV.textContent = MU.fmt(n) + (mode && n >= 12000 ? '+' : ''); }
      if (mode !== countMode) { countMode = mode; countBox.classList.toggle('is-b', mode === 1); }
    }

    /* ================================================================ progress → morph */
    const KF = [[0, 0], [0.06, 0], [0.27, 1], [0.38, 1], [0.59, 2], [0.70, 2], [0.91, 3], [1, 3]];
    const pToF = p => {
      for (let i = 1; i < KF.length; i++) {
        if (p <= KF[i][0]) { const a = KF[i - 1], b = KF[i]; return a[1] + (b[1] - a[1]) * ((p - a[0]) / (b[0] - a[0])); }
      }
      return 3;
    };
    let target = 0, cur = 0, yearShown = 1429, dtNow = 0.016;
    const hudCache = {};
    const setStyle = (el, key, prop, val) => { if (hudCache[key] !== val) { hudCache[key] = val; el.style[prop] = val; } };
    const setVar = (el, prop, val) => { if (hudCache[prop] !== val) { hudCache[prop] = val; el.style.setProperty(prop, val); } };

    function updateHud(f, p) {
      const io = 1 - smooth((f - 0.02) / 0.3);
      const ioR = Math.round(io * 1000) / 1000;
      setStyle(intro, 'io', 'opacity', String(ioR));
      setStyle(intro, 'it', 'transform', `translate3d(0,${(-70 * (1 - ioR)).toFixed(1)}px,0) scale(${(1 + 0.08 * (1 - ioR)).toFixed(4)})`);
      setStyle(intro, 'if', 'filter', ioR > 0.995 ? 'none' : `blur(${(10 * (1 - ioR)).toFixed(2)}px)`);
      setStyle(intro, 'iv', 'visibility', ioR < 0.01 ? 'hidden' : 'visible');
      const hv = String(Math.round(smooth((f - 0.22) / 0.4) * 1000) / 1000);
      setStyle(hudBottom, 'hb', 'opacity', hv);
      setStyle(ruler, 'ru', 'opacity', hv);
      setStyle(coord, 'co', 'opacity', hv);
      if (hint) setStyle(hint, 'hi', 'opacity', String(Math.round(smooth((f - 0.6) / 0.4) * 1000) / 1000));
      setActive(f < 0.34 ? 0 : f < 1.42 ? 1 : f < 2.42 ? 2 : 3);
      phaseBars.forEach((b, k) => {
        const v = k === 2 ? clamp((f - 2.5) * 2) : clamp(f - (k + 0.5));
        setStyle(b, 'pb' + k, 'transform', `scaleX(${v.toFixed(3)})`);
      });
      const yT = Math.round(f <= 1 ? 1429 : 1429 + (2026 - 1429) * ease(clamp((f - 1) / 2)));
      yearShown = Math.abs(yT - yearShown) > 40 ? MU.damp(yearShown, yT, 9, dtNow) : MU.damp(yearShown, yT, 14, dtNow);
      if (Math.abs(yearShown - yT) < 0.004) yearShown = yT;
      setYear(yearShown);
      const cv = f < 1 ? 1018 * smooth(f) : f < 2.2 ? 1018 : 1018 + (12000 - 1018) * ease(clamp((f - 2.2) / 0.7));
      setCount(cv, f > 2.35 ? 1 : 0);
      setCoord(f >= 1.5 ? 1 : 0);
      setStyle(rulerMark, 'rm', 'transform', `translate3d(0,${(p * 100).toFixed(2)}%,0)`);
      const deg = Math.round(p * 60) + '°';
      if (hudCache.rl !== deg) { hudCache.rl = deg; rulerLbl.textContent = deg; }
    }

    /* ================================================================ frame */
    let tiltX = 0, tiltY = 0, time = 0;
    const W8 = new Float32Array(SH);   /* formation weight of each shape (for vectors / glow) */
    let cosG = 1, sinG = 0, angG = 0, cosP = 0, sinP = 1, phi = 90 * D2R, sX = 0, sY = -1.14, breath = 1;
    let rX = 0, rY = 0, cRX = 1, sRX = 0, cRY = 1, sRY = 0;
    const PJ = { x: 0, y: 0, k: 1 };
    const proj = (x, y, z) => {
      const x1 = x * cRY + z * sRY, z1 = -x * sRY + z * cRY;
      const y1 = y * cRX - z1 * sRX, z2 = y * sRX + z1 * cRX;
      const k = F / (F + z2);
      PJ.x = CX + x1 * S * k; PJ.y = CY + y1 * S * k; PJ.k = k;
      return PJ;
    };

    function frame(t, dt) {
      time = t; dtNow = dt || 0.016;
      cur = REDUCED ? target : MU.damp(cur, target, 5.5, dt);
      if (Math.abs(cur - target) < 0.0004) cur = target;
      const f = pToF(cur);
      let a = Math.floor(f), tt = f - a;
      if (a >= 3) { a = 3; tt = 0; }
      const b = Math.min(3, a + 1);
      if (!REDUCED) updateHud(f, cur);

      /* shape weights */
      W8.fill(0);
      W8[a] += 1 - smooth(tt / 0.4);
      if (b !== a) W8[b] += smooth((tt - 0.6) / 0.4);

      /* dynamic targets */
      angG = REDUCED ? 0 : t * 0.07;
      cosG = Math.cos(angG); sinG = Math.sin(angG);
      phi = (90 + (REDUCED ? 0 : 13 * Math.sin(t * 0.42) + 3 * Math.sin(t * 1.1))) * D2R;
      cosP = Math.cos(phi); sinP = Math.sin(phi);
      sX = PV[0] - cosP * 0.36; sY = PV[1] - sinP * 0.36;
      breath = 1 + (REDUCED ? 0 : 0.07 * Math.sin(t * 2.4));

      /* camera: pointer tilt + swing through each morph */
      const desk = !PORTRAIT && !MU.isTouch;
      tiltY = MU.damp(tiltY, ptr.on && desk ? ptr.nx * 0.14 : 0, 2.5, dt);
      tiltX = MU.damp(tiltX, ptr.on && desk ? -ptr.ny * 0.09 : 0, 2.5, dt);
      const sgn = a === 1 ? -1 : 1, sw = Math.sin(Math.PI * tt);
      rY = tiltY + (REDUCED ? 0 : sw * 0.3 * sgn) + (REDUCED ? 0 : Math.sin(t * 0.21) * 0.035);
      rX = tiltX + (REDUCED ? 0 : sw * 0.12) + (REDUCED ? 0 : Math.cos(t * 0.17) * 0.02);
      cRY = Math.cos(rY); sRY = Math.sin(rY); cRX = Math.cos(rX); sRX = Math.sin(rX);

      /* ripple impulses */
      for (let r = ripples.length - 1; r >= 0; r--) { ripples[r].t += dt; if (ripples[r].t > 1.4) ripples.splice(r, 1); }

      const Dly = 0.5, inv = 1 / (1 - Dly);
      let np = 0;
      const pathOn = tt > 0.001 && tt < 0.999 && !REDUCED;
      const Xa = X[a], Ya = Y[a], Za = Z[a], Xb = X[b], Yb = Y[b], Zb = Z[b];
      const RLa = RL[a], RLb = RL[b], RPa = RP[a], RPb = RP[b], DLb = DL[b], scA = SC[a], scB = SC[b];
      const R2 = MOBILE ? 80 : 120, RR = R2 * R2;
      const mob = MOBILE ? 0.9 : 1;
      const sizeMul = DPR * 4.6 * Math.max(0.78, Math.min(1.2, S / 260)) * mob;
      let o = 0;
      for (let i = 0; i < N; i++) {
        /* --- target in shape a --- */
        let ax = Xa[i], ay = Ya[i], az = Za[i];
        let ro = RLa[i];
        if (ro === 1) { const nx = ax * cosG - ay * sinG; ay = ax * sinG + ay * cosG; ax = nx; }
        else if (ro === 3) { ax += PV[0] + cosP * RPa[i]; ay += PV[1] + sinP * RPa[i]; }
        else if (ro === 4) { ax += sX; ay += sY; }
        else if (ro === 5) { ax *= breath; ay *= breath; }
        if (a === 0 || ro === 9) { ax += Math.sin(t * 0.11 + PH[i]) * 0.012; ay += Math.cos(t * 0.09 + PH[i] * 1.3) * 0.012; }
        else if (scA !== 1) { ax *= scA; ay *= scA; }
        let x = ax, y = ay, z = az;
        let cr = CR[a][i], cg = CG[a][i], cb = CB[a][i], al = AL[a][i], sz = SZ[a][i];
        if (tt > 0) {
          let bx = Xb[i], by = Yb[i], bz = Zb[i];
          ro = RLb[i];
          if (ro === 1) { const nx = bx * cosG - by * sinG; by = bx * sinG + by * cosG; bx = nx; }
          else if (ro === 3) { bx += PV[0] + cosP * RPb[i]; by += PV[1] + sinP * RPb[i]; }
          else if (ro === 4) { bx += sX; by += sY; }
          else if (ro === 5) { bx *= breath; by *= breath; }
          if (b === 0 || ro === 9) { bx += Math.sin(t * 0.11 + PH[i]) * 0.012; by += Math.cos(t * 0.09 + PH[i] * 1.3) * 0.012; }
          else if (scB !== 1) { bx *= scB; by *= scB; }
          const lt = clamp((tt - DLb[i] * Dly) * inv);
          if (lt > 0) {
            const e = ease(lt), u = 1 - e;
            if (ro === 9) { x = bx; y = by; z = bz; }
            else {
              /* curved flight: control point = midpoint swirled around the centre + depth bump */
              const mx = (ax + bx) * 0.5, my = (ay + by) * 0.5, s = SW[i] * sgn, cs = Math.cos(s), sn = Math.sin(s);
              const cxp = mx * cs - my * sn, cyp = mx * sn + my * cs, czp = (az + bz) * 0.5 + ZB[i];
              x = u * u * ax + 2 * u * e * cxp + e * e * bx;
              y = u * u * ay + 2 * u * e * cyp + e * e * by;
              z = u * u * az + 2 * u * e * czp + e * e * bz;
              if (pathOn && i % PSTEP === 0 && np < PATHS.length - 6) {
                proj(ax, ay, az); PATHS[np++] = PJ.x; PATHS[np++] = PJ.y;
                proj(cxp, cyp, czp); PATHS[np++] = PJ.x; PATHS[np++] = PJ.y;
                proj(bx, by, bz); PATHS[np++] = PJ.x; PATHS[np++] = PJ.y;
              }
            }
            cr += (CR[b][i] - cr) * e; cg += (CG[b][i] - cg) * e; cb += (CB[b][i] - cb) * e;
            al += (AL[b][i] - al) * e; sz += (SZ[b][i] - sz) * e;
            al *= 1 + 0.7 * Math.sin(Math.PI * e);
          }
        }
        /* project */
        const x1 = x * cRY + z * sRY, z1 = -x * sRY + z * cRY;
        const y1 = y * cRX - z1 * sRX, z2 = y * sRX + z1 * cRX;
        const k = F / (F + Math.max(-2.6, z2));
        let px = CX + x1 * S * k, py = CY + y1 * S * k;

        /* pointer repel + ripples (spring back) */
        if (!REDUCED) {
          let fx = 0, fy = 0;
          if (ptr.on) {
            const dx = px + OX[i] - ptr.x, dy = py + OY[i] - ptr.y, d2 = dx * dx + dy * dy;
            if (d2 < RR) {
              const d = Math.sqrt(d2) + 0.01, q = 1 - d / R2, fz = q * q * 5200;
              fx += dx / d * fz; fy += dy / d * fz;
              al *= 1 + q * 1.2;
            }
          }
          for (let r = 0; r < ripples.length; r++) {
            const rp = ripples[r], rad = rp.t * 620, dx = px - rp.x, dy = py - rp.y, d = Math.sqrt(dx * dx + dy * dy) + 0.01;
            const band = 1 - Math.abs(d - rad) / 70;
            if (band > 0) { const fz = band * 9000 * (1 - rp.t / 1.4); fx += dx / d * fz; fy += dy / d * fz; }
          }
          VX[i] += (fx - OX[i] * 34 - VX[i] * 7.5) * dt;
          VY[i] += (fy - OY[i] * 34 - VY[i] * 7.5) * dt;
          OX[i] += VX[i] * dt; OY[i] += VY[i] * dt;
          px += OX[i]; py += OY[i];
        }

        /* twinkle */
        const tw = (a === 0 || RLa[i] === 9) ? 0.62 + 0.38 * Math.sin(t * TW[i] + PH[i]) : 0.84 + 0.16 * Math.sin(t * TW[i] * 1.6 + PH[i]);
        BUF[o++] = px * DPR; BUF[o++] = py * DPR;
        BUF[o++] = Math.min(MAXPS, sz * k * sizeMul);
        BUF[o++] = cr; BUF[o++] = cg; BUF[o++] = cb;
        BUF[o++] = Math.min(1, al * (REDUCED ? 1 : tw));
      }
      draw();
      drawVectors(t);
      if (np) drawPaths(np, b, Math.sin(Math.PI * tt));
      if (glow) for (let s = 1; s < SH; s++) setVar(glow, '--her-g' + s, (Math.round(W8[s] * 200) / 200).toFixed(3));
    }

    function draw() {
      if (gl) {
        gl.uniform2f(glLoc, glCanvas.width, glCanvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindBuffer(gl.ARRAY_BUFFER, glBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, BUF);
        gl.drawArrays(gl.POINTS, 0, N);
      } else if (ctx2) {
        ctx2.setTransform(1, 0, 0, 1, 0, 0);
        ctx2.clearRect(0, 0, glCanvas.width, glCanvas.height);
        ctx2.globalCompositeOperation = 'lighter';
        for (let i = 0, o = 0; i < N; i++, o += 7) {
          const r = BUF[o + 2] * 0.22;
          ctx2.globalAlpha = BUF[o + 6];
          ctx2.fillStyle = `rgb(${(BUF[o + 3] * 255) | 0},${(BUF[o + 4] * 255) | 0},${(BUF[o + 5] * 255) | 0})`;
          ctx2.beginPath(); ctx2.arc(BUF[o], BUF[o + 1], Math.max(0.6, r), 0, TAU); ctx2.fill();
        }
        ctx2.globalAlpha = 1;
      }
    }

    /* ================================================================ vector layer */
    const rgba = (c, a) => `rgba(${c},${a.toFixed(3)})`;
    const GOLD = '255,200,97', TURQ = '46,230,214', AZ = '61,139,255', WH = '234,241,255';
    function polyline(fn, n) {
      for (let i = 0; i <= n; i++) { const p = fn(i / n); const q = proj(p[0], p[1], 0); if (i) vctx.lineTo(q.x, q.y); else vctx.moveTo(q.x, q.y); }
    }
    function sparkle(x, y, r, a) {
      const g = vctx.createRadialGradient(x, y, 0, x, y, r * 4);
      g.addColorStop(0, `rgba(255,236,190,${(a * 0.55).toFixed(3)})`); g.addColorStop(1, 'rgba(255,200,97,0)');
      vctx.fillStyle = g; vctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
      vctx.beginPath();
      vctx.moveTo(x, y - r * 2.6); vctx.quadraticCurveTo(x, y, x + r * 2.6, y); vctx.quadraticCurveTo(x, y, x, y + r * 2.6);
      vctx.quadraticCurveTo(x, y, x - r * 2.6, y); vctx.quadraticCurveTo(x, y, x, y - r * 2.6);
      vctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; vctx.fill();
    }
    const fsz = () => Math.max(9, Math.min(11, S * 0.036));

    function drawArc(w, t) {
      const c = vctx;
      c.save();
      /* sector wash */
      c.beginPath();
      const pv = Object.assign({}, proj(PV[0], PV[1], 0)); c.moveTo(pv.x, pv.y);
      polyline(u => polar(RO, A0 + (A1 - A0) * u), 40);
      c.closePath();
      const g = c.createRadialGradient(pv.x, pv.y, 0, pv.x, pv.y, RO * S);
      g.addColorStop(0, rgba(GOLD, 0.0)); g.addColorStop(0.75, rgba(GOLD, 0.03 * w)); g.addColorStop(1, rgba(GOLD, 0.12 * w));
      c.fillStyle = g; c.fill();
      /* rails */
      c.lineWidth = 1;
      c.strokeStyle = rgba(GOLD, 0.45 * w);
      c.beginPath(); polyline(u => polar(RO, A1 + (A0 - A1) * u), 64); c.stroke();
      c.strokeStyle = rgba(GOLD, 0.25 * w);
      c.beginPath(); polyline(u => polar(RI, A1 + (A0 - A1) * u), 64); c.stroke();
      c.beginPath(); polyline(u => polar(RM, A1 + (A0 - A1) * u), 40); c.stroke();
      /* degree labels */
      c.font = `600 ${fsz()}px "JetBrains Mono", monospace`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = rgba(GOLD, 0.85 * w);
      for (let d = 0; d <= 60; d += 10) { const p = polar(RO + 0.13, degA(d)), q = proj(p[0], p[1], 0); c.fillText(d + '°', q.x, q.y); }
      /* alidade + sight line to the star */
      const tip = polar(RO + 0.07, phi), tq = Object.assign({}, proj(tip[0], tip[1], 0));
      c.strokeStyle = rgba(TURQ, 0.75 * w); c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(pv.x, pv.y); c.lineTo(tq.x, tq.y); c.stroke();
      const sq = proj(sX, sY, 0), sx = sq.x, sy = sq.y;
      c.setLineDash([3, 5]); c.strokeStyle = rgba(TURQ, 0.5 * w); c.lineWidth = 1;
      c.beginPath(); c.moveTo(pv.x, pv.y); c.lineTo(sx, sy); c.stroke(); c.setLineDash([]);
      sparkle(sx, sy, Math.max(2.4, S * 0.011) * (1 + 0.15 * Math.sin(t * 3)), w);
      /* live reading next to the observed star */
      const reading = (120 - phi / D2R);
      c.fillStyle = rgba(TURQ, 0.95 * w);
      c.font = `600 ${fsz() + 1}px "JetBrains Mono", monospace`;
      c.textAlign = 'left';
      c.fillText('h = ' + MU.fmt(reading, 1) + '°', sx + 16, sy - 2);
      c.fillStyle = rgba(WH, 0.45 * w);
      c.font = `400 ${fsz()}px "JetBrains Mono", monospace`;
      c.fillText('Vega · α Lyr', sx + 16, sy + 13);
      c.textAlign = 'center';
      /* caption */
      const cp = proj(0, PV[1] + RO + 0.34, 0);
      c.fillStyle = rgba(WH, 0.5 * w);
      c.font = `400 ${fsz()}px "JetBrains Mono", monospace`;
      if ('letterSpacing' in c) c.letterSpacing = '3px';
      c.fillText('FAXRIY SEKSTANT · SAMARQAND · 1429', cp.x, cp.y);
      if ('letterSpacing' in c) c.letterSpacing = '0px';
      c.restore();
    }

    const EDGE_ORD = EDGES.map(([p]) => cdist(p) / MAXD);
    function drawCon(w, t) {
      const c = vctx;
      c.save();
      c.lineWidth = 1;
      const k2 = SC[2];
      const cp = CITIES.map(ci => { const q = proj(ci[1] * k2, ci[2] * k2, 0); return [q.x, q.y]; });
      EDGES.forEach(([p, q], ei) => {
        const lt = clamp((w - EDGE_ORD[ei] * 0.45) / 0.55);
        if (lt <= 0) return;
        const A = cp[p], B = cp[q];
        const g = c.createLinearGradient(A[0], A[1], B[0], B[1]);
        g.addColorStop(0, rgba(TURQ, 0.55 * w)); g.addColorStop(1, rgba(AZ, 0.4 * w));
        c.strokeStyle = g;
        c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(A[0] + (B[0] - A[0]) * lt, A[1] + (B[1] - A[1]) * lt); c.stroke();
        /* caravan pulse travelling outward */
        if (w > 0.85) {
          const u = (t * 0.22 + ei * 0.377) % 1, px = A[0] + (B[0] - A[0]) * u, py = A[1] + (B[1] - A[1]) * u;
          const pa = Math.sin(u * Math.PI) * (w - 0.85) / 0.15;
          const gg = c.createRadialGradient(px, py, 0, px, py, 7);
          gg.addColorStop(0, `rgba(210,255,250,${(0.95 * pa).toFixed(3)})`); gg.addColorStop(1, 'rgba(46,230,214,0)');
          c.fillStyle = gg; c.fillRect(px - 7, py - 7, 14, 14);
        }
      });
      /* Toshkent pulse rings */
      const T = cp[0];
      for (let k = 0; k < 2; k++) {
        const u = (t * 0.45 + k * 0.5) % 1;
        c.strokeStyle = rgba(GOLD, (1 - u) * 0.6 * w);
        c.beginPath(); c.arc(T[0], T[1], S * k2 * (0.12 + u * 0.3), 0, TAU); c.stroke();
      }
      sparkle(T[0], T[1], Math.max(2.2, S * 0.012) * (1 + 0.12 * Math.sin(t * 2.4)), w);
      /* labels */
      const fs = fsz();
      c.textBaseline = 'middle';
      CITIES.forEach((ci, i) => {
        const la = clamp((w - (cdist(i) / MAXD) * 0.4) / 0.6);
        if (la <= 0) return;
        if (PORTRAIT && ci[3] === 1 && i) return;          /* only hubs on small screens */
        const [x, y] = cp[i], big = i === 0;
        const off = big ? S * k2 * 0.2 : S * 0.055 + 6;
        let lx = x, ly = y;
        c.textAlign = 'center';
        if (ci[4] === 'n') ly = y - off; else if (ci[4] === 's') ly = y + off; else if (ci[4] === 'e') { lx = x + off; c.textAlign = 'left'; }
        c.font = big ? `600 ${fs + 2}px "JetBrains Mono", monospace` : `400 ${fs}px "JetBrains Mono", monospace`;
        c.fillStyle = big ? rgba(GOLD, la) : rgba(WH, 0.72 * la);
        c.fillText(ci[0].toUpperCase(), lx, ly);
        if (!big) {
          const gr = S * (ci[3] > 1 ? 0.075 : 0.055), gg = c.createRadialGradient(x, y, 0, x, y, gr);
          gg.addColorStop(0, rgba('200,255,250', 0.55 * la)); gg.addColorStop(0.35, rgba(TURQ, 0.16 * la)); gg.addColorStop(1, rgba(TURQ, 0));
          c.fillStyle = gg; c.fillRect(x - gr, y - gr, gr * 2, gr * 2);
          c.strokeStyle = rgba(TURQ, 0.3 * la); c.beginPath(); c.arc(x, y, S * 0.042, 0, TAU); c.stroke();
          if (ci[3] > 1) sparkle(x, y, Math.max(1.6, S * 0.007), 0.85 * la);
        }
      });
      c.restore();
    }

    function drawGir(w, t) {
      const c = vctx;
      c.save();
      const o = Object.assign({}, proj(0, 0, 0));
      /* centre glow */
      const g = c.createRadialGradient(o.x, o.y, 0, o.x, o.y, S * 0.6);
      g.addColorStop(0, rgba(GOLD, 0.22 * w)); g.addColorStop(1, rgba(GOLD, 0));
      c.fillStyle = g; c.fillRect(o.x - S, o.y - S, S * 2, S * 2);
      /* star outline */
      const outline = starPts(RG, RG * 0.7654, -Math.PI / 2);
      c.strokeStyle = rgba(TURQ, 0.3 * w); c.lineWidth = 1;
      c.beginPath();
      outline.forEach((p, i) => {
        const x = p[0] * cosG - p[1] * sinG, y = p[0] * sinG + p[1] * cosG, q = proj(x, y, 0);
        if (i) c.lineTo(q.x, q.y); else c.moveTo(q.x, q.y);
      });
      c.stroke();
      for (let k = 0; k < 8; k++) {
        const a = -Math.PI / 2 + k * Math.PI / 4 + angG, q = proj(Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0);
        sparkle(q.x, q.y, Math.max(1.4, S * 0.0065) * (1 + 0.25 * Math.sin(t * 2 + k)), 0.9 * w);
      }
      sparkle(o.x, o.y, Math.max(2.4, S * 0.013) * (1 + 0.1 * Math.sin(t * 1.7)), w);
      /* rotating astrolabe ring (pre-rendered) */
      if (ringImg.width) {
        const sz = ringImg.width / DPR;
        c.globalAlpha = w;
        c.translate(o.x, o.y);
        c.rotate(-angG * 1.7);
        c.drawImage(ringImg, -sz / 2, -sz / 2, sz, sz);
      }
      c.restore();
    }

    const PSTEP = MOBILE ? 7 : 9;
    const PATHS = new Float32Array(Math.ceil(N / PSTEP) * 6 + 12);
    const PCOL = ['190,210,255', GOLD, TURQ, '120,150,255'];
    function drawPaths(np, b, k) {
      const c = vctx;
      c.save();
      c.lineWidth = 1;
      c.strokeStyle = rgba(PCOL[b], 0.16 * k);
      c.beginPath();
      for (let j = 0; j < np; j += 6) { c.moveTo(PATHS[j], PATHS[j + 1]); c.quadraticCurveTo(PATHS[j + 2], PATHS[j + 3], PATHS[j + 4], PATHS[j + 5]); }
      c.stroke();
      c.restore();
    }

    function drawVectors(t) {
      vctx.clearRect(0, 0, W, H);
      if (W8[1] > 0.01) drawArc(W8[1], t);
      if (W8[2] > 0.01) drawCon(W8[2], t);
      if (W8[3] > 0.01) drawGir(W8[3], t);
      /* ripple rings */
      ripples.forEach(r => {
        const u = r.t / 1.4;
        vctx.strokeStyle = rgba(TURQ, (1 - u) * 0.45);
        vctx.lineWidth = 1;
        vctx.beginPath(); vctx.arc(r.x, r.y, r.t * 620, 0, TAU); vctx.stroke();
      });
    }

    /* ================================================================ wiring */
    function renderStatic() {
      target = cur = 1;
      frame(0, 0);
    }

    const ro = new ResizeObserver(() => layout());
    ro.observe(stage);
    layout();

    if (REDUCED) {
      renderStatic();
      countV.textContent = '12 000+';
      countBox.classList.add('is-b');
      setYear(2026);
    } else {
      ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: () => '+=' + Math.round(stage.offsetHeight * (MU.isMobile ? 1.7 : 2.3)),
        pin: stage,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: self => { target = self.progress; }
      });
      const loop = MU.renderLoop(stage, frame);
      loop.start();
      frame(0, 0);
    }

    /* ================================================================ statement: words light up */
    const stmt = $('.her-statement');
    const wrap = node => {
      Array.from(node.childNodes).forEach(ch => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(pt => {
            if (!pt) return;
            if (/^\s+$/.test(pt)) frag.appendChild(document.createTextNode(pt));
            else { const s = document.createElement('span'); s.className = 'her-w'; s.textContent = pt; frag.appendChild(s); }
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) wrap(ch);
      });
    };
    wrap(stmt);
    const words = Array.from(stmt.querySelectorAll('.her-w'));
    if (!REDUCED) {
      const pen = document.createElement('span');
      pen.className = 'her-pen';
      pen.setAttribute('aria-hidden', 'true');
      pen.innerHTML = '<svg viewBox="-50 -50 100 100"><path d="M0-48C4-12 12-4 48 0 12 4 4 12 0 48-4 12-12 4-48 0-12-4-4-12 0-48Z"/></svg>';
      stmt.appendChild(pen);
      const px = gsap.quickTo(pen, 'x', { duration: .5, ease: 'power3.out' });
      const py = gsap.quickTo(pen, 'y', { duration: .5, ease: 'power3.out' });
      gsap.set(words, { opacity: 0.13 });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stmt, start: 'top 80%', end: 'bottom 45%', scrub: 0.6,
          onUpdate(self) {
            const i = Math.min(words.length - 1, Math.floor(self.progress * words.length * 1.02));
            const wd = words[i];
            px(wd.offsetLeft + wd.offsetWidth + 6);
            py(wd.offsetTop + wd.offsetHeight * 0.35);
            pen.style.opacity = self.progress > 0.01 && self.progress < 0.995 ? 1 : 0;
          }
        }
      });
      tl.to(words, { opacity: 1, ease: 'none', duration: 3, stagger: 1 });
      words.forEach(wd => { if (wd.closest('.her-hl')) tl.fromTo(wd, { '--her-glow': 0 }, { '--her-glow': 1, duration: 3, ease: 'none' }, words.indexOf(wd)); });
    }

    /* keep the sign star spinning only in view */
    MU.onVisible(root, v => root.classList.toggle('is-inview', v));
  }
});
