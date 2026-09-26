/* ==========================================================================
   06 — Aqlli park · geometry + texture kit (procedural 40ft HC container)
   Exposed as window.muFleetKit, consumed by b-fleet.js
   ========================================================================== */
window.muFleetKit = function muFleetKit(renderer) {
  const {
    Group, Mesh, BoxGeometry, PlaneGeometry, CylinderGeometry, CircleGeometry, SphereGeometry,
    BufferGeometry, BufferAttribute, Float32BufferAttribute, MeshStandardMaterial, MeshPhysicalMaterial,
    MeshBasicMaterial, CanvasTexture, SRGBColorSpace, Color, AdditiveBlending, DoubleSide,
    Sprite, SpriteMaterial, PointLight, RepeatWrapping, BufferGeometryUtils
  } = THREE;

  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const disposables = [];
  const track = o => { disposables.push(o); return o; };

  /* ------------------------------------------------------------ dimensions (metres) */
  const L = 12.19, W = 2.44, H = 2.9;          // 40' high cube
  const POST = 0.16, RAIL_B = 0.17, RAIL_T = 0.12;
  const DEP = 0.038;                            // side corrugation depth

  /* ------------------------------------------------------------ helpers */
  let seed = 1429;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const box = (w, h, d, x = 0, y = 0, z = 0) => { const g = new BoxGeometry(w, h, d); g.translate(x, y, z); return g; };
  const cyl = (r, h, x, y, z, axis = 'y', seg = 12) => {
    const g = new CylinderGeometry(r, r, h, seg);
    if (axis === 'x') g.rotateZ(Math.PI / 2);
    if (axis === 'z') g.rotateX(Math.PI / 2);
    g.translate(x, y, z);
    return g;
  };
  const merge = list => {
    const flat = list.map(g => (g.index ? g.toNonIndexed() : g));
    const m = BufferGeometryUtils.mergeGeometries(flat, false);
    list.forEach(g => g.dispose());
    flat.forEach(g => g.dispose());
    return track(m);
  };
  const setUV = (g, fn) => {
    const p = g.attributes.position, uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) {
      const r = fn(p.getX(i), p.getY(i), p.getZ(i));
      uv[i * 2] = r[0]; uv[i * 2 + 1] = r[1];
    }
    g.setAttribute('uv', new BufferAttribute(uv, 2));
    return g;
  };

  /* Trapezoidal corrugated sheet, flat-shaded.
     vertical=true  -> ribs run vertically (profile along x, extruded along y), panel len × h
     vertical=false -> ribs run horizontally (profile along y), panel h(width) × len(height)
     Local space: x∈[0,w], y∈[0,h], z∈[0,depth] (outer face at z = depth, facing +z). */
  function corrugated(len, h, pitch, depth, vertical = true) {
    const n = Math.max(1, Math.round(len / pitch)), p = len / n;
    const a = p * 0.28, b = p * 0.2, c = p * 0.32;
    const prof = [];
    for (let k = 0; k < n; k++) {
      const s0 = k * p;
      prof.push([s0, depth], [s0 + a, depth], [s0 + a + b, 0], [s0 + a + b + c, 0]);
    }
    prof.push([len, depth]);
    const pos = [];
    const push = v => pos.push(v[0], v[1], v[2]);
    for (let i = 0; i < prof.length - 1; i++) {
      const [s1, d1] = prof[i], [s2, d2] = prof[i + 1];
      if (s2 - s1 < 1e-6) continue;
      if (vertical) {
        const A = [s1, 0, d1], B = [s2, 0, d2], C = [s2, h, d2], D = [s1, h, d1];
        push(A); push(B); push(C); push(A); push(C); push(D);
      } else {
        const A = [0, s1, d1], B = [0, s2, d2], C = [h, s2, d2], D = [h, s1, d1];
        push(A); push(C); push(B); push(A); push(D); push(C);
      }
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return g;
  }

  /* ------------------------------------------------------------ canvas textures */
  const FONT_D = 'Unbounded, "Arial Black", sans-serif';
  const FONT_B = 'Manrope, system-ui, sans-serif';
  const FONT_M = '"JetBrains Mono", ui-monospace, monospace';
  const redraws = [];

  function canvasTex(w, h, draw, { srgb = true, repeat = false } = {}) {
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    const t = new CanvasTexture(cv);
    if (srgb) t.colorSpace = SRGBColorSpace;
    t.anisotropy = aniso;
    if (repeat) t.wrapS = t.wrapT = RepeatWrapping;
    const run = () => { seed = 1429 + w + h; ctx.clearRect(0, 0, w, h); draw(ctx, w, h); t.needsUpdate = true; };
    run();
    redraws.push(run);
    return track(t);
  }

  function star(ctx, cx, cy, r, inner = 0.62, rot = -Math.PI / 2) {
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = rot + (i * Math.PI) / 8, rr = i % 2 ? r * inner : r;
      ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    ctx.closePath();
  }
  function logo(ctx, cx, cy, r) {
    const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    g.addColorStop(0, '#2ee6d6'); g.addColorStop(1, '#3d8bff');
    star(ctx, cx, cy, r); ctx.fillStyle = g; ctx.fill();
    star(ctx, cx, cy, r * 0.62, 0.62, -Math.PI / 2 + Math.PI / 8);
    ctx.fillStyle = 'rgba(8,14,40,.85)'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.24, 0, Math.PI * 2); ctx.fillStyle = '#ffc861'; ctx.fill();
  }
  function paintBase(ctx, w, h, top = '#2a45b8', mid = '#1f3598', bot = '#14246c') {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, top); g.addColorStop(0.55, mid); g.addColorStop(1, bot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // faint weathering streaks + bottom grime
    for (let i = 0; i < w / 6; i++) {
      ctx.fillStyle = `rgba(4,8,30,${0.015 + rnd() * 0.035})`;
      ctx.fillRect(rnd() * w, rnd() * h * 0.25, 1 + rnd() * 3, h * (0.25 + rnd() * 0.75));
    }
    const gg = ctx.createLinearGradient(0, h * 0.8, 0, h);
    gg.addColorStop(0, 'rgba(0,0,10,0)'); gg.addColorStop(1, 'rgba(0,0,10,.28)');
    ctx.fillStyle = gg; ctx.fillRect(0, h * 0.8, w, h * 0.2);
  }
  function spaced(ctx, text, x, y, sp) { ctx.letterSpacing = sp + 'px'; ctx.fillText(text, x, y); ctx.letterSpacing = '0px'; }

  // side wall livery (u: along the length, v: up)
  const sideTex = canvasTex(2048, 512, (ctx, w, h) => {
    paintBase(ctx, w, h);
    // diagonal ribbon (turq → azure) with gold pinstripe
    const rx = w * 0.7;
    const rg = ctx.createLinearGradient(rx, 0, rx + w * 0.12, h);
    rg.addColorStop(0, '#2ee6d6'); rg.addColorStop(1, '#3d8bff');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.moveTo(rx + h * 0.42, 0); ctx.lineTo(rx + h * 0.42 + w * 0.055, 0); ctx.lineTo(rx + w * 0.055, h); ctx.lineTo(rx, h); ctx.fill();
    ctx.fillStyle = '#ffc861';
    const gx = rx + w * 0.07;
    ctx.beginPath(); ctx.moveTo(gx + h * 0.42, 0); ctx.lineTo(gx + h * 0.42 + w * 0.009, 0); ctx.lineTo(gx + w * 0.009, h); ctx.lineTo(gx, h); ctx.fill();
    // bottom pinstripe
    ctx.fillStyle = 'rgba(255,200,97,.8)'; ctx.fillRect(0, h * 0.9, rx + 6, h * 0.008);
    // logo + wordmark
    const cy = h * 0.47;
    logo(ctx, w * 0.085, cy, h * 0.2);
    ctx.fillStyle = '#f4f7ff'; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    ctx.font = `800 ${Math.round(h * 0.25)}px ${FONT_D}`;
    spaced(ctx, 'ULUGʻBEK', w * 0.15, cy + h * 0.06, -2);
    ctx.font = `800 ${Math.round(h * 0.085)}px ${FONT_B}`;
    ctx.fillStyle = '#2ee6d6';
    spaced(ctx, 'LOGISTICS', w * 0.153, cy + h * 0.2, 22);
    ctx.fillStyle = 'rgba(255,200,97,.95)';
    ctx.font = `700 ${Math.round(h * 0.06)}px ${FONT_M}`;
    spaced(ctx, 'YULDUZLAR ANIQLIGIDA', w * 0.153, cy + h * 0.31, 8);
    // container code block top-right
    ctx.textAlign = 'right'; ctx.fillStyle = '#f4f7ff';
    ctx.font = `700 ${Math.round(h * 0.08)}px ${FONT_M}`;
    ctx.fillText('ULBU 142907 9', w * 0.975, h * 0.19);
    ctx.font = `700 ${Math.round(h * 0.07)}px ${FONT_M}`;
    ctx.fillText('45G1', w * 0.975, h * 0.29);
    // data plate bottom-right
    ctx.font = `600 ${Math.round(h * 0.034)}px ${FONT_M}`;
    ctx.fillStyle = 'rgba(244,247,255,.85)';
    const rows = [['MAX.GROSS', '32 500 KG'], ['TARE', ' 3 750 KG'], ['PAYLOAD', '28 750 KG'], ['CU.CAP.', '  76,4 CU.M']];
    rows.forEach((r, i) => {
      const y = h * 0.64 + i * h * 0.05;
      ctx.textAlign = 'left'; ctx.fillText(r[0], w * 0.86, y);
      ctx.textAlign = 'right'; ctx.fillText(r[1], w * 0.975, y);
    });
  });

  // door pair (u: 0 at left-door hinge → 1 at right-door hinge when viewed from outside)
  const doorTex = canvasTex(1024, 1024, (ctx, w, h) => {
    paintBase(ctx, w, h, '#2843b4', '#1e3394', '#14246a');
    // large split star across the seam
    ctx.save(); ctx.globalAlpha = 0.95; logo(ctx, w / 2, h * 0.47, w * 0.2); ctx.restore();
    ctx.strokeStyle = 'rgba(46,230,214,.5)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(w / 2, h * 0.47, w * 0.26, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([4, 12]); ctx.beginPath(); ctx.arc(w / 2, h * 0.47, w * 0.3, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#f4f7ff'; ctx.textAlign = 'center';
    ctx.font = `800 ${Math.round(w * 0.06)}px ${FONT_D}`;
    spaced(ctx, 'ULUGʻBEK', w / 2, h * 0.78, 2);
    ctx.font = `700 ${Math.round(w * 0.024)}px ${FONT_B}`;
    ctx.fillStyle = '#2ee6d6';
    spaced(ctx, 'LOGISTICS', w / 2, h * 0.83, 10);
    // code block on the right leaf
    ctx.textAlign = 'right'; ctx.fillStyle = '#f4f7ff';
    ctx.font = `700 ${Math.round(w * 0.038)}px ${FONT_M}`;
    ctx.fillText('ULBU 142907 9', w * 0.95, h * 0.1);
    ctx.fillText('45G1', w * 0.95, h * 0.15);
    ctx.font = `600 ${Math.round(w * 0.019)}px ${FONT_M}`;
    ctx.fillStyle = 'rgba(244,247,255,.85)';
    ['MAX.GROSS  32 500 KG', 'TARE        3 750 KG', 'PAYLOAD    28 750 KG'].forEach((t, i) => ctx.fillText(t, w * 0.95, h * 0.21 + i * h * 0.03));
    // CSC plate on the left leaf
    ctx.fillStyle = '#b8c0d4'; ctx.fillRect(w * 0.08, h * 0.08, w * 0.12, h * 0.07);
    ctx.fillStyle = '#6d7690';
    for (let i = 0; i < 5; i++) ctx.fillRect(w * 0.09, h * 0.095 + i * h * 0.011, w * (0.06 + rnd() * 0.04), h * 0.005);
    ctx.fillStyle = '#f4f7ff'; ctx.textAlign = 'left';
    ctx.font = `700 ${Math.round(w * 0.018)}px ${FONT_M}`;
    ctx.fillText('CSC SAFETY APPROVAL', w * 0.08, h * 0.175);
  });

  // closed end wall
  const endTex = canvasTex(512, 512, (ctx, w, h) => {
    paintBase(ctx, w, h);
    logo(ctx, w / 2, h * 0.46, w * 0.27);
    ctx.strokeStyle = 'rgba(46,230,214,.45)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(w / 2, h * 0.46, w * 0.34, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,200,97,.85)'; ctx.fillRect(0, h * 0.9, w, h * 0.012);
  });

  const woodTex = canvasTex(512, 256, (ctx, w, h) => {
    const n = 8;
    for (let i = 0; i < n; i++) {
      const y = (i * h) / n, l = 0.8 + rnd() * 0.35;
      ctx.fillStyle = `rgb(${Math.round(150 * l)},${Math.round(104 * l)},${Math.round(62 * l)})`;
      ctx.fillRect(0, y, w, h / n);
      for (let k = 0; k < 40; k++) {
        ctx.fillStyle = `rgba(60,34,14,${0.05 + rnd() * 0.12})`;
        ctx.fillRect(rnd() * w, y + rnd() * (h / n), 30 + rnd() * 160, 1);
      }
      ctx.fillStyle = 'rgba(20,10,4,.55)'; ctx.fillRect(0, y, w, 2);
    }
  }, { repeat: true });

  function cartonDraw(kind) {
    return (ctx, w, h) => {
      const branded = kind === 'brand';
      ctx.fillStyle = branded ? '#e8edf7' : '#b98c5c'; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 220; i++) {
        ctx.fillStyle = branded ? `rgba(90,110,160,${rnd() * 0.05})` : `rgba(70,40,15,${rnd() * 0.12})`;
        ctx.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 18, 1);
      }
      // tape band
      ctx.fillStyle = branded ? 'rgba(46,230,214,.9)' : 'rgba(214,176,120,.95)';
      ctx.fillRect(w * 0.4, 0, w * 0.2, h);
      ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(w * 0.42, 0, w * 0.03, h);
      // printed mark
      ctx.save(); ctx.globalAlpha = branded ? 1 : 0.75;
      if (branded) logo(ctx, w * 0.2, h * 0.3, w * 0.09);
      else { star(ctx, w * 0.2, h * 0.3, w * 0.08); ctx.fillStyle = '#5a3a1c'; ctx.fill(); }
      ctx.restore();
      ctx.fillStyle = branded ? '#2447c9' : '#4f3218';
      ctx.font = `800 ${Math.round(w * 0.05)}px ${FONT_D}`;
      ctx.textAlign = 'center';
      ctx.fillText('ULUGʻBEK', w * 0.2, h * 0.47);
      // this-way-up arrows
      ctx.strokeStyle = branded ? '#2447c9' : '#4f3218'; ctx.lineWidth = w * 0.012; ctx.lineCap = 'round';
      [0.74, 0.84].forEach(x => {
        ctx.beginPath(); ctx.moveTo(w * x, h * 0.34); ctx.lineTo(w * x, h * 0.16);
        ctx.moveTo(w * (x - 0.03), h * 0.21); ctx.lineTo(w * x, h * 0.16); ctx.lineTo(w * (x + 0.03), h * 0.21); ctx.stroke();
      });
      // barcode label
      ctx.fillStyle = '#f6f6f2'; ctx.fillRect(w * 0.66, h * 0.62, w * 0.26, h * 0.24);
      ctx.fillStyle = '#111';
      for (let x = w * 0.68; x < w * 0.9; x += 2 + Math.floor(rnd() * 4)) ctx.fillRect(x, h * 0.65, rnd() > 0.5 ? 2 : 1, h * 0.12);
      ctx.font = `600 ${Math.round(w * 0.028)}px ${FONT_M}`; ctx.textAlign = 'left';
      ctx.fillText('UL-2026-TAS', w * 0.68, h * 0.83);
    };
  }
  const kraftTex = canvasTex(256, 256, cartonDraw('kraft'));
  const brandTex = canvasTex(256, 256, cartonDraw('brand'));

  const crateTex = canvasTex(256, 256, (ctx, w, h) => {
    ctx.drawImage(woodTex.image, 0, 0, w, h);
    ctx.strokeStyle = 'rgba(40,22,8,.9)'; ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(14, 14); ctx.lineTo(w - 14, h - 14); ctx.stroke();
    ctx.fillStyle = 'rgba(30,16,6,.8)'; ctx.font = `800 ${Math.round(w * 0.07)}px ${FONT_D}`; ctx.textAlign = 'center';
    ctx.fillText('EHTIYOT', w / 2, h * 0.3);
  });

  function radialTex(stops, size = 128) {
    return canvasTex(size, size, (ctx, w) => {
      const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      stops.forEach(([o, c]) => g.addColorStop(o, c));
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, w);
    }, { srgb: false });
  }
  const glowTex = radialTex([[0, 'rgba(255,255,255,1)'], [0.18, 'rgba(255,255,255,.55)'], [0.45, 'rgba(255,255,255,.12)'], [1, 'rgba(255,255,255,0)']]);
  const ringTex = radialTex([[0, 'rgba(255,255,255,0)'], [0.72, 'rgba(255,255,255,0)'], [0.86, 'rgba(255,255,255,1)'], [0.93, 'rgba(255,255,255,.25)'], [1, 'rgba(255,255,255,0)']]);
  const blobTex = radialTex([[0, 'rgba(0,0,0,.9)'], [0.45, 'rgba(0,0,0,.45)'], [1, 'rgba(0,0,0,0)']]);
  const shadowTex = canvasTex(512, 128, (ctx, w, h) => {
    // blurred rectangle via an offset shadow (works everywhere, unlike ctx.filter)
    ctx.shadowColor = 'rgba(0,0,0,.95)';
    ctx.shadowBlur = 26;
    ctx.shadowOffsetX = w;
    ctx.fillStyle = '#000';
    ctx.fillRect(w * 0.1 - w, h * 0.3, w * 0.8, h * 0.4);
    ctx.shadowColor = 'transparent';
  }, { srgb: false });
  const scanTex = canvasTex(256, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(46,230,214,.0)'); g.addColorStop(0.5, 'rgba(46,230,214,.18)'); g.addColorStop(1, 'rgba(46,230,214,.0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(160,255,248,1)'; ctx.lineWidth = 5; ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = 'rgba(160,255,248,.35)';
    for (let y = 12; y < h; y += 10) ctx.fillRect(8, y, w - 16, 1);
    ctx.fillStyle = 'rgba(200,255,250,1)';
    [[4, 4], [w - 28, 4], [4, h - 10], [w - 28, h - 10]].forEach(([x, y]) => ctx.fillRect(x, y, 24, 6));
  }, { srgb: false });

  // interior wall shading: soft vertical ribs (repeats along the hull)
  const ribTex = canvasTex(64, 8, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, '#6c7497'); g.addColorStop(0.3, '#8a92b4'); g.addColorStop(0.42, '#40486a');
    g.addColorStop(0.6, '#2c3352'); g.addColorStop(0.78, '#555d80'); g.addColorStop(1, '#6c7497');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }, { repeat: true });
  ribTex.repeat.set(42, 1);
  const ribTexEnd = ribTex.clone();
  ribTexEnd.repeat.set(8, 1);
  ribTexEnd.needsUpdate = true;
  track(ribTexEnd);

  /* ------------------------------------------------------------ materials */
  const paintOpts = { metalness: 0.12, roughness: 0.44, clearcoat: 0.8, clearcoatRoughness: 0.18 };
  const M = {
    side: track(new MeshPhysicalMaterial(Object.assign({ map: sideTex }, paintOpts))),
    end: track(new MeshPhysicalMaterial(Object.assign({ map: endTex }, paintOpts))),
    door: track(new MeshPhysicalMaterial(Object.assign({ map: doorTex }, paintOpts, { clearcoat: 0.45, roughness: 0.5 }))),
    doorIn: track(new MeshStandardMaterial({ color: new Color('#2c3558'), metalness: 0.3, roughness: 0.6 })),
    frame: track(new MeshPhysicalMaterial(Object.assign({ color: new Color('#1b2d86') }, paintOpts, { roughness: 0.46 }))),
    castings: track(new MeshStandardMaterial({ color: new Color('#5b6684'), metalness: 0.85, roughness: 0.34 })),
    steel: track(new MeshStandardMaterial({ color: new Color('#b9c0cf'), metalness: 0.85, roughness: 0.34, envMapIntensity: 0.7 })),
    black: track(new MeshBasicMaterial({ color: new Color('#04060c') })),
    interior: track(new MeshStandardMaterial({ map: ribTex, color: new Color('#5a6690'), metalness: 0.25, roughness: 0.7 })),
    interiorEnd: track(new MeshStandardMaterial({ map: ribTexEnd, color: new Color('#5a6690'), metalness: 0.25, roughness: 0.7 })),
    floor: track(new MeshStandardMaterial({ map: woodTex, roughness: 0.8, metalness: 0 })),
    wood: track(new MeshStandardMaterial({ color: new Color('#c79a63'), roughness: 0.85, metalness: 0 })),
    kraft: track(new MeshStandardMaterial({ map: kraftTex, roughness: 0.82, metalness: 0 })),
    brand: track(new MeshStandardMaterial({ map: brandTex, roughness: 0.6, metalness: 0 })),
    crate: track(new MeshStandardMaterial({ map: crateTex, roughness: 0.85, metalness: 0 })),
    film: track(new MeshPhysicalMaterial({ color: new Color('#cfe8ff'), transparent: true, opacity: 0.2, roughness: 0.12, metalness: 0, clearcoat: 1, depthWrite: false })),
    led: track(new MeshBasicMaterial({ color: new Color('#bff8ff') })),
    sensor: track(new MeshBasicMaterial({ color: new Color('#2ee6d6') })),
    device: track(new MeshStandardMaterial({ color: new Color('#0d1226'), metalness: 0.5, roughness: 0.35 }))
  };

  /* ------------------------------------------------------------ container body */
  const container = new Group();
  const body = new Group();
  container.add(body);
  const add = (geo, mat, parent = body) => { const m = new Mesh(geo, mat); parent.add(m); return m; };

  const wallH = H - RAIL_B - RAIL_T, wallL = L - POST * 2;
  const zOut = W / 2 - 0.012;

  // side walls (+z / -z)
  const sideA = corrugated(wallL, wallH, 0.278, DEP, true);
  sideA.translate(-wallL / 2, RAIL_B, zOut - DEP);
  setUV(sideA, (x, y) => [(x + wallL / 2) / wallL, (y - RAIL_B) / wallH]);
  const sideB = corrugated(wallL, wallH, 0.278, DEP, true);
  sideB.rotateY(Math.PI);
  sideB.translate(wallL / 2, RAIL_B, -(zOut - DEP));
  setUV(sideB, (x, y) => [(wallL / 2 - x) / wallL, (y - RAIL_B) / wallH]);
  add(merge([sideA, sideB]), M.side);

  // closed end wall (-x)
  const endW = W - POST * 2;
  const endG = corrugated(endW, wallH, 0.3, 0.045, true);
  endG.rotateY(-Math.PI / 2);
  endG.translate(-(L / 2 - 0.012 - 0.045), RAIL_B, -endW / 2);
  setUV(endG, (x, y, z) => [(z + endW / 2) / endW, (y - RAIL_B) / wallH]);
  add(track(endG), M.end);

  // roof (shallow transverse ribs)
  const roofG = corrugated(wallL, W - 0.1, 0.62, 0.022, true);
  roofG.rotateX(-Math.PI / 2);
  roofG.translate(-wallL / 2, H - 0.05, (W - 0.1) / 2);
  setUV(roofG, () => [0, 0]);

  // frame: posts, rails, headers, sills
  const fr = [roofG];
  const cx = L / 2 - POST / 2, cz = W / 2 - POST / 2;
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => fr.push(box(POST, H - 0.24, POST, sx * cx, H / 2, sz * cz)));
  [-1, 1].forEach(s => {
    fr.push(box(L - 0.36, RAIL_B, 0.13, 0, RAIL_B / 2, s * (W / 2 - 0.065)));
    fr.push(box(L - 0.36, RAIL_T, 0.1, 0, H - RAIL_T / 2, s * (W / 2 - 0.05)));
  });
  fr.push(box(0.12, RAIL_B, W - 0.32, -L / 2 + 0.06, RAIL_B / 2, 0));
  fr.push(box(0.1, RAIL_T, W - 0.32, -L / 2 + 0.05, H - RAIL_T / 2, 0));
  const HEADER = 0.3, SILL = 0.2;
  fr.push(box(0.17, HEADER, W - 0.32, L / 2 - 0.085, H - HEADER / 2, 0));
  fr.push(box(0.17, SILL, W - 0.32, L / 2 - 0.085, SILL / 2, 0));
  add(merge(fr), M.frame);

  // corner castings + oval apertures
  const cast = [], holes = [];
  const CX = 0.2, CY = 0.13, CZ = 0.18;
  const hole = (rx, ry, x, y, z, face) => {
    const g = new CircleGeometry(1, 20);
    g.scale(rx, ry, 1);
    if (face === 'x+') g.rotateY(Math.PI / 2);
    if (face === 'x-') g.rotateY(-Math.PI / 2);
    if (face === 'z-') g.rotateY(Math.PI);
    if (face === 'y+') g.rotateX(-Math.PI / 2);
    g.translate(x, y, z);
    holes.push(g);
  };
  [-1, 1].forEach(sx => [-1, 1].forEach(sz => [0, 1].forEach(top => {
    const x = sx * (L / 2 - CX / 2 + 0.004), z = sz * (W / 2 - CZ / 2 + 0.004), y = top ? H - CY / 2 + 0.004 : CY / 2;
    cast.push(box(CX, CY, CZ, x, y, z));
    hole(0.045, 0.026, x + sx * (CX / 2 + 0.002), y, z, sx > 0 ? 'x+' : 'x-');
    hole(0.05, 0.03, x, y, z + sz * (CZ / 2 + 0.002), sz > 0 ? 'z+' : 'z-');
    if (top) hole(0.062, 0.03, x, y + CY / 2 + 0.002, z, 'y+');
  })));
  add(merge(cast), M.castings);

  // door gasket shadow + dark gap between leaves
  const DOOR_H = H - HEADER - SILL, DOOR_Y = SILL;
  const OPEN_W = W - 0.32;
  add(merge(holes), M.black);

  // interior shell (visible through the doors)
  const ix = L - 0.34, iy = H - 0.36, iz = W - 0.2;
  const intr = new Group(); body.add(intr);
  const ip = (w, h, rx, ry, x, y, z, mat) => {
    const g = new PlaneGeometry(w, h);
    if (rx) g.rotateX(rx);
    if (ry) g.rotateY(ry);
    g.translate(x, y, z);
    return add(track(g), mat, intr);
  };
  const floorG = new PlaneGeometry(ix, iz);
  floorG.rotateX(-Math.PI / 2); floorG.translate(0, RAIL_B + 0.001, 0);
  setUV(floorG, (x, y, z) => [(x + ix / 2) / 1.6, (z + iz / 2) / 1.2]);
  add(track(floorG), M.floor, intr);
  ip(ix, iz, Math.PI / 2, 0, 0, H - 0.18, 0, M.interiorEnd);         // ceiling
  ip(ix, iy, 0, 0, 0, RAIL_B + iy / 2, -iz / 2, M.interior);           // far wall (faces +z)
  ip(ix, iy, 0, Math.PI, 0, RAIL_B + iy / 2, iz / 2, M.interior);     // near wall (faces -z)
  ip(iz, iy, 0, Math.PI / 2, -ix / 2, RAIL_B + iy / 2, 0, M.interiorEnd); // back wall (faces +x)
  const ledMesh = add(track(box(ix - 0.6, 0.03, 0.06, 0, H - 0.2, 0)), M.led, intr);
  const lamp = new PointLight(new Color('#ffd7a1'), 0, 9, 1.4);
  lamp.position.set(L / 2 - 2.2, H - 0.55, 0);
  body.add(lamp);

  /* ------------------------------------------------------------ doors */
  const HZ = 0.07;                        // hinge pins sit just outside the side walls
  const doorThick = 0.05;
  const doorX = L / 2;                    // doors close flush with the end frame
  const leaves = [];
  // side: +1 = left door (hinged at +z), -1 = right door (hinged at -z) as seen from outside
  [1, -1].forEach(side => {
    const pivot = new Group();
    const pz = side * (W / 2 + HZ), px = doorX + 0.01;
    pivot.position.set(px, 0, pz);
    container.add(pivot);
    const leaf = new Group(); pivot.add(leaf);
    const z0 = side * (W / 2 - 0.02), z1 = side * 0.006;          // outer edge → centre (container coords)
    const zmin = Math.min(z0, z1), zmax = Math.max(z0, z1), dw = zmax - zmin;
    const toLocal = g => { g.translate(-px, 0, -pz); return g; };
    // corrugated panel (horizontal ribs), mapped with the shared door texture
    const pw = dw - 0.14, ph = DOOR_H - 0.2;
    const panel = corrugated(ph, pw, 0.36, 0.04, false);
    panel.rotateY(Math.PI / 2);
    panel.translate(doorX, DOOR_Y + 0.1, zmax - 0.07);
    setUV(panel, (x, y, z) => [(OPEN_W / 2 + 0.1 - z) / (OPEN_W + 0.2), (y - DOOR_Y) / DOOR_H]);
    add(toLocal(panel), M.door, leaf);
    const inner = corrugated(ph, pw, 0.36, 0.03, false);
    inner.rotateY(-Math.PI / 2);
    inner.translate(doorX - 0.002, DOOR_Y + 0.1, zmin + 0.07);
    setUV(inner, () => [0, 0]);
    add(toLocal(inner), M.doorIn, leaf);
    // door frame (stiles + rails) and inner skin
    const f = [];
    const zc = (zmin + zmax) / 2;
    f.push(box(doorThick, DOOR_H, 0.07, doorX + doorThick / 2, DOOR_Y + DOOR_H / 2, zmin + 0.035));
    f.push(box(doorThick, DOOR_H, 0.07, doorX + doorThick / 2, DOOR_Y + DOOR_H / 2, zmax - 0.035));
    f.push(box(doorThick, 0.1, dw, doorX + doorThick / 2, DOOR_Y + 0.05, zc));
    f.push(box(doorThick, 0.1, dw, doorX + doorThick / 2, DOOR_Y + DOOR_H - 0.05, zc));
    f.push(box(0.012, DOOR_H, dw, doorX + 0.006, DOOR_Y + DOOR_H / 2, zc));          // inner skin
    // hinge knuckles on the outer edge
    [0.22, 0.85, 1.55, 2.2].forEach(hy => f.push(box(0.12, 0.09, 0.09, doorX + 0.05, DOOR_Y + hy, side * (W / 2 + 0.02))));
    add(toLocal(merge(f)), M.frame, leaf);
    if (side < 0) add(toLocal(box(0.03, DOOR_H - 0.04, 0.014, doorX + 0.03, DOOR_Y + DOOR_H / 2, 0.001)), M.black, leaf);   // rubber seam
    // locking rods: two per leaf, each with guides, cams and a handle that swings out
    const rods = [];
    const rodZ = [zmin + dw * 0.3, zmin + dw * 0.72];
    rodZ.forEach((rz, ri) => {
      const rodG = new Group();
      rodG.position.set(doorX + doorThick + 0.045 - px, 0, rz - pz);
      leaf.add(rodG);
      const rg = [cyl(0.021, DOOR_H + 0.16, 0, DOOR_Y + DOOR_H / 2, 0, 'y', 10)];
      // cams top + bottom
      rg.push(box(0.05, 0.06, 0.09, 0.0, DOOR_Y + DOOR_H + 0.04, 0.03));
      rg.push(box(0.05, 0.06, 0.09, 0.0, DOOR_Y - 0.04, 0.03));
      // handle (hub + bar + grip)
      const hy = DOOR_Y + 1.12;
      const hdir = side;                  // handles lie toward the hinge side
      rg.push(box(0.07, 0.1, 0.07, 0, hy, 0));
      rg.push(box(0.035, 0.04, 0.36, 0.02, hy, hdir * 0.2));
      rg.push(box(0.05, 0.12, 0.05, 0.03, hy, hdir * 0.38));
      const rodMesh = add(merge(rg), M.steel, rodG);
      rodMesh.userData.base = 0;
      rods.push({ g: rodG, dir: hdir });
      // guides fixed to the leaf
      const gd = [];
      [0.35, DOOR_H - 0.35].forEach(gy => gd.push(box(0.05, 0.06, 0.08, doorX + doorThick + 0.02, DOOR_Y + gy, rz)));
      gd.push(box(0.02, 0.14, 0.1, doorX + doorThick + 0.01, DOOR_Y + 1.12, rz + hdir * 0.38)); // handle retainer
      add(toLocal(merge(gd)), M.steel, leaf);
    });
    leaves.push({ pivot, side, rods });
  });

  // cam keepers on header + sill (fixed to the frame)
  const keep = [];
  leaves.forEach(lf => lf.rods.forEach(r => {
    const wz = r.g.position.z + lf.pivot.position.z;
    keep.push(box(0.08, 0.08, 0.12, doorX + 0.06, DOOR_Y + DOOR_H + 0.05, wz + 0.02));
    keep.push(box(0.08, 0.08, 0.12, doorX + 0.06, DOOR_Y - 0.05, wz + 0.02));
  }));
  add(merge(keep), M.steel);

  /* ------------------------------------------------------------ sensors */
  const glowMatFor = (color, tex) => track(new SpriteMaterial({ map: tex, color: new Color(color), blending: AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
  function sensorNode(color = '#2ee6d6', size = 1) {
    const g = new Group();
    const core = new Mesh(track(new SphereGeometry(0.045 * size, 12, 8)), track(new MeshBasicMaterial({ color: new Color(color) })));
    g.add(core);
    const halo = new Sprite(glowMatFor(color, glowTex)); halo.scale.setScalar(0.6 * size); g.add(halo);
    const ring = new Sprite(glowMatFor(color, ringTex)); ring.scale.setScalar(0.4 * size); g.add(ring);
    return { g, core, halo, ring, size, phase: rnd() * 6 };
  }
  const sensors = {};
  // GPS / telematics puck on the roof
  const gpsDev = new Group();
  gpsDev.position.set(L / 2 - 1.1, H + 0.005, 0.35);
  gpsDev.add(new Mesh(track(new CylinderGeometry(0.16, 0.19, 0.07, 24)), M.device));
  const ant = new Mesh(track(new CylinderGeometry(0.008, 0.008, 0.32, 6)), M.steel); ant.position.set(0.1, 0.18, 0); gpsDev.add(ant);
  container.add(gpsDev);
  sensors.gps = sensorNode('#2ee6d6', 1.2); sensors.gps.g.position.set(0, 0.07, 0); gpsDev.add(sensors.gps.g);
  // smart seal on the door header (stays visible when the doors swing)
  const sealDev = new Group();
  sealDev.position.set(L / 2 + 0.03, H - 0.16, 0);
  sealDev.add(new Mesh(track(box(0.08, 0.14, 0.26)), M.device));
  container.add(sealDev);
  sensors.seal = sensorNode('#39e58c', 0.8); sensors.seal.g.position.set(0.06, 0, 0); sealDev.add(sensors.seal.g);

  /* ------------------------------------------------------------ cargo (pallet units) */
  const palletGeo = (() => {
    const p = [];
    [-0.43, -0.215, 0, 0.215, 0.43].forEach(z => p.push(box(1.2, 0.022, 0.13, 0, 0.133, z)));
    [-0.54, 0, 0.54].forEach(x => p.push(box(0.12, 0.022, 1.0, x, 0.1, 0)));
    [-0.54, 0, 0.54].forEach(x => [-0.43, 0, 0.43].forEach(z => p.push(box(0.12, 0.078, 0.14, x, 0.05, z))));
    [-0.43, 0, 0.43].forEach(z => p.push(box(1.2, 0.022, 0.13, 0, 0.011, z)));
    return merge(p);
  })();
  function stackGeo(nx, nz, ny, bh) {
    const bx = 1.2 / nx, bz = 1.0 / nz, g = [];
    for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) {
      const shrink = j === ny - 1 && (i + k) % 3 === 0 ? 0.92 : 1;
      g.push(box((bx - 0.012) * shrink, bh - 0.008, (bz - 0.012) * shrink, -0.6 + bx * (i + 0.5), 0.144 + bh * (j + 0.5), -0.5 + bz * (k + 0.5)));
    }
    return merge(g);
  }
  const stacks = {
    kraft: stackGeo(3, 2, 3, 0.29),
    brand: stackGeo(2, 2, 3, 0.3),
    crate: merge([box(1.16, 0.84, 0.96, 0, 0.144 + 0.42, 0)])
  };
  const filmGeo = track(box(1.24, 0.95, 1.04, 0, 0.144 + 0.46, 0));

  const unitKinds = ['kraft', 'brand', 'crate', 'brand', 'kraft', 'kraft'];
  function makeUnit(kind, wrapped) {
    const g = new Group();
    g.add(new Mesh(palletGeo, M.wood));
    g.add(new Mesh(stacks[kind], M[kind]));
    if (wrapped) { const f = new Mesh(filmGeo, M.film); f.renderOrder = 2; g.add(f); }
    return g;
  }

  /* ------------------------------------------------------------ misc FX */
  const shadowMat = track(new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.85 }));
  const shadowGeo = track(new PlaneGeometry(L * 1.18, W * 2.6));
  shadowGeo.rotateX(-Math.PI / 2);
  const blobGeo = track(new PlaneGeometry(1.9, 1.7));
  blobGeo.rotateX(-Math.PI / 2);
  const blobMat = () => track(new MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.7 }));

  const scanMat = track(new MeshBasicMaterial({ map: scanTex, transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide, opacity: 0 }));
  const scanGeo = track(new PlaneGeometry(W + 0.5, H + 0.45));
  scanGeo.rotateY(Math.PI / 2);

  return {
    L, W, H, DOOR_H, DOOR_Y, container, body, leaves, lamp, ledMesh, M, sensors, sensorNode,
    unitKinds, makeUnit, shadowMat, shadowGeo, blobGeo, blobMat, scanMat, scanGeo, glowTex,
    redraw: () => redraws.forEach(f => f()),
    dispose: () => disposables.forEach(d => d.dispose && d.dispose())
  };
};
