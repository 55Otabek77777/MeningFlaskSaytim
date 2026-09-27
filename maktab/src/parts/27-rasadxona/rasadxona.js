/* Rasadxona: Samarqand (39,675° sh.k., 67,006° sh.u.) osmoni — haqiqiy yulduzlar (Yale BSC, ≤ 5,6 kattalik) hozirgi mahalliy yulduz
   vaqtiga ko’ra joylashadi va real yo’nalishda aylanadi. Oldinda jez armillyar sfera: meridian va ufq halqalari
   qo’zg’almas, osmon qismi (ekvator, ekliptika 23°30′17″, kolurlar, tropiklar) qutb o’qi atrofida osmon bilan sinxron.
   5 bob scroll bilan: osmon → sfera yig’iladi (1018) → yil aylanishi → ekliptika og’ishi → yo’nalishlar orbitasi. */
MU.part('rasadxona', {
  init(root) {
    const { gsap, ScrollTrigger } = MU;
    const chapters = Array.from(root.querySelectorAll('.rx-ch'));
    const steps = Array.from(root.querySelectorAll('.rx-steps li'));
    const lstEl = root.querySelector('.rx-lst');
    const countEl = root.querySelector('.rx-count');
    const LAT = 39.675 * Math.PI / 180, LON = 67.006, EPS = (23 + 30 / 60 + 17 / 3600) * Math.PI / 180;

    /* mahalliy yulduz vaqti (GMST + uzunlik) */
    const lstHours = ms => { const d = ms / 86400000 + 2440587.5 - 2451545.0; let g = (18.697374558 + 24.06570982441908 * d) % 24; if (g < 0) g += 24; return (g + LON / 15) % 24; };
    const fmt = h => { const s = Math.floor(h * 3600) % 86400; return [(s / 3600) | 0, ((s % 3600) / 60) | 0, s % 60].map(v => String(v).padStart(2, '0')).join(':'); };
    const tickLst = () => { lstEl.textContent = fmt(lstHours(Date.now())); };
    tickLst();
    let lstTimer = 0;
    MU.onVisible(root, v => { clearInterval(lstTimer); if (v) lstTimer = setInterval(tickLst, 1000); });

    /* boblar */
    let cur = -1, counted = false;
    const setCh = i => {
      if (i === cur) return; cur = i;
      chapters.forEach((c, k) => c.classList.toggle('is-on', k === i));
      steps.forEach((s, k) => { s.classList.toggle('is-on', k <= i); s.classList.toggle('is-cur', k === i); });
      if (i >= 1 && !counted && !MU.reduced) { counted = true; const o = { v: 0 }; gsap.to(o, { v: 1018, duration: 1.6, ease: 'power3.out', onUpdate: () => { countEl.textContent = Math.round(o.v); } }); }
    };
    setCh(0);

    /* ---------------------------------------------------------------- 3D */
    const SKY = window.muSky;
    if (!window.THREE || !SKY) return;
    const {
      WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, LatheGeometry, Vector2, Vector3, Plane, CylinderGeometry, SphereGeometry, TorusGeometry,
      MeshStandardMaterial, MeshPhysicalMaterial, CanvasTexture, RepeatWrapping, SRGBColorSpace, ACESFilmicToneMapping, PMREMGenerator, RoomEnvironment,
      BufferGeometry, Float32BufferAttribute, Points, ShaderMaterial, AdditiveBlending, LineSegments, LineBasicMaterial, DirectionalLight
    } = THREE;
    const canvas = root.querySelector('.rx-canvas');
    let renderer;
    try { renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { root.classList.add('no-gl'); return; }
    renderer.setPixelRatio(MU.dpr(1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.localClippingEnabled = true;
    const scene = new Scene();
    const pm = new PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.85;
    const camera = new PerspectiveCamera(38, 1, 0.1, 400);
    const key = new DirectionalLight(0xffe2b0, 1.6); key.position.set(-4, 6, 4); scene.add(key);
    const rim = new DirectionalLight(0x7aa2ff, 1.1); rim.position.set(5, 1, -6); scene.add(rim);
    const horizon = [new Plane(new Vector3(0, 1, 0), 0.02)];

    /* ---- osmon: qutb o’qi Samarqand kengligida, yulduz vaqti bilan aylanadi */
    const skyTilt = new Group(); skyTilt.rotation.x = -(Math.PI / 2 - LAT); scene.add(skyTilt);
    const sky = new Group(); skyTilt.add(sky);
    const RS = 120;
    const eq = (raDeg, decDeg, r = RS) => { const a = raDeg * Math.PI / 180, d = decDeg * Math.PI / 180; return [r * Math.cos(d) * Math.sin(a), r * Math.sin(d), r * Math.cos(d) * Math.cos(a)]; };
    const bvRGB = bv => {
      const K = [[-0.4, [0.61, 0.72, 1]], [0, [0.8, 0.87, 1]], [0.4, [1, 0.98, 0.94]], [0.8, [1, 0.9, 0.72]], [1.2, [1, 0.8, 0.55]], [2, [1, 0.66, 0.42]]];
      for (let i = 1; i < K.length; i++) if (bv <= K[i][0]) { const [b0, c0] = K[i - 1], [b1, c1] = K[i], f = MU.clamp((bv - b0) / (b1 - b0)); return c0.map((c, j) => c + (c1[j] - c) * f); }
      return K[K.length - 1][1];
    };
    const sPos = [], sCol = [], sSize = [];
    for (let i = 0; i < SKY.s.length; i += 4) {
      const ra = SKY.s[i] / 10, dec = SKY.s[i + 1] / 10, mag = SKY.s[i + 2] / 10, bv = SKY.s[i + 3] / 10;
      sPos.push(...eq(ra, dec));
      const b = Math.pow(10, -0.4 * mag), k = Math.sqrt(b) / 2;
      const c = bvRGB(bv); sCol.push(...c.map(v => v * (mag < 4.8 ? MU.clamp(0.8 + k * 1.1, 0.8, 1.4) : 0.55)));
      sSize.push(2.4 + 10 * MU.clamp(k, 0, 1) + (mag < 4.8 ? 0.9 : 0));
    }
    const sg = new BufferGeometry();
    sg.setAttribute('position', new Float32BufferAttribute(sPos, 3));
    sg.setAttribute('color', new Float32BufferAttribute(sCol, 3));
    sg.setAttribute('size', new Float32BufferAttribute(sSize, 1));
    const starMat = new ShaderMaterial({
      transparent: true, depthWrite: false, blending: AdditiveBlending,
      uniforms: { uPx: { value: 1 }, uTime: { value: 0 }, uAlpha: { value: 1 } },
      vertexShader: `attribute float size; attribute vec3 color; uniform float uPx; uniform float uTime; varying vec3 vC; varying float vAlt;
        void main(){ vC = color; vec4 wp = modelMatrix * vec4(position, 1.0); vAlt = normalize(wp.xyz).y;
          gl_Position = projectionMatrix * viewMatrix * wp;
          float tw = 0.82 + 0.18 * sin(uTime * 1.7 + position.x * 0.31 + position.z * 0.57);
          gl_PointSize = size * uPx * tw; }`,
      fragmentShader: `varying vec3 vC; varying float vAlt; uniform float uAlpha;
        void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); float a = 1.0 - smoothstep(0.12, 0.5, d); a = a * a * (3.0 - 2.0 * a);
          a *= smoothstep(-0.01, 0.07, vAlt) * uAlpha; gl_FragColor = vec4(vC, a); }`
    });
    sky.add(new Points(sg, starMat));

    const segGeo = (lists, r) => { const a = []; lists.forEach(L => { for (let i = 0; i + 3 < L.length; i += 2) a.push(...eq(L[i] / 10, L[i + 1] / 10, r), ...eq(L[i + 2] / 10, L[i + 3] / 10, r)); }); return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(a, 3)); };
    const lineMat = (color, opacity) => new LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false, clippingPlanes: horizon });
    const conMat = lineMat(0x9fb8ff, 0);
    sky.add(new LineSegments(segGeo(SKY.l, RS * 0.995), conMat));
    /* ekvatorial to’r: har 2 soat va har 15° */
    const grid = [];
    for (let h = 0; h < 24; h += 2) { const L = []; for (let d = -75; d <= 75; d += 5) L.push(h * 150, d * 10); grid.push(L); }
    for (let d = -45; d <= 75; d += 15) { const L = []; for (let a = 0; a <= 360; a += 4) L.push(a * 10, d * 10); grid.push(L); }
    const gridMat = lineMat(0xf3c969, 0);
    sky.add(new LineSegments(segGeo(grid, RS * 0.99), gridMat));
    /* osmondagi ekliptika (ekvatorga EPS burchak ostida) */
    const eclPts = [];
    for (let l = 0; l <= 360; l += 3) {
      const L = l * Math.PI / 180, ra = Math.atan2(Math.sin(L) * Math.cos(EPS), Math.cos(L)) * 180 / Math.PI, dec = Math.asin(Math.sin(EPS) * Math.sin(L)) * 180 / Math.PI;
      eclPts.push(((ra + 360) % 360) * 10, dec * 10);
    }
    const eclMat = lineMat(0xf3c969, 0);
    sky.add(new LineSegments(segGeo([eclPts], RS * 0.985), eclMat));

    /* ---- jez armillyar sfera */
    const tickTex = (major, minor, fine) => {
      const c = document.createElement('canvas'); c.width = 2048; c.height = 64;
      const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 64);
      gr.addColorStop(0, '#e2c27f'); gr.addColorStop(0.5, '#b8904e'); gr.addColorStop(1, '#8a6630');
      g.fillStyle = gr; g.fillRect(0, 0, 2048, 64);
      g.fillStyle = 'rgba(40, 24, 6, .78)';
      for (let d = 0; d < 360; d += fine) {
        const x = (d / 360) * 2048, len = d % major === 0 ? 64 : d % minor === 0 ? 40 : 22;
        g.fillRect(x - (d % major ? 0.8 : 1.6), 64 - len, d % major ? 1.6 : 3.2, len);
      }
      const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.wrapS = RepeatWrapping; t.anisotropy = 4; return t;
    };
    const brass = new MeshStandardMaterial({ color: 0xc9a060, metalness: 1, roughness: 0.3 });
    const brassDark = new MeshStandardMaterial({ color: 0x8a6a3a, metalness: 1, roughness: 0.42 });
    const ringMat = (major, minor, fine) => new MeshStandardMaterial({ map: tickTex(major, minor, fine), metalness: 1, roughness: 0.3 });
    const matA = ringMat(30, 10, 2), matB = ringMat(90, 15, 5), matE = ringMat(30, 10, 1);
    const band = (r, w, t, mat) => {
      const prof = [new Vector2(r - t / 2, -w / 2), new Vector2(r + t / 2, -w / 2), new Vector2(r + t / 2, w / 2), new Vector2(r - t / 2, w / 2), new Vector2(r - t / 2, -w / 2)];
      return new Mesh(new LatheGeometry(prof, 160), mat);
    };
    const arm = new Group(); scene.add(arm);
    const fixed = new Group(); arm.add(fixed);
    const horizonRing = band(1.1, 0.12, 0.03, matB); fixed.add(horizonRing);            /* ufq (gorizontal) */
    const meridian = band(1.0, 0.07, 0.035, matA); meridian.rotation.z = Math.PI / 2; fixed.add(meridian); /* meridian: N–S tekisligi */
    /* poydevor: disk, ustun, 4 oyoq ufq halqasiga */
    const stand = new Group(); arm.add(stand);
    const disc = new Mesh(new CylinderGeometry(0.62, 0.7, 0.07, 64), brassDark); disc.position.y = -1.42; stand.add(disc);
    const col = new Mesh(new CylinderGeometry(0.045, 0.08, 0.36, 24), brass); col.position.y = -1.2; stand.add(col);
    const cup = new Mesh(new TorusGeometry(0.1, 0.02, 12, 40), brass); cup.rotation.x = Math.PI / 2; cup.position.y = -1.02; stand.add(cup);
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2, top = new Vector3(Math.cos(a) * 1.1, 0, Math.sin(a) * 1.1), bot = new Vector3(Math.cos(a) * 0.58, -1.4, Math.sin(a) * 0.58);
      const len = top.distanceTo(bot), leg = new Mesh(new CylinderGeometry(0.018, 0.028, len, 12), brass);
      leg.position.copy(top).add(bot).multiplyScalar(0.5); leg.lookAt(top); leg.rotateX(Math.PI / 2); stand.add(leg);
    }
    /* osmon qismi: qutb o’qi Samarqand kengligida, osmon bilan birga aylanadi */
    const celTilt = new Group(); celTilt.rotation.x = -(Math.PI / 2 - LAT); arm.add(celTilt);
    const cel = new Group(); celTilt.add(cel);
    const axis = new Mesh(new CylinderGeometry(0.014, 0.014, 2.3, 12), brass); cel.add(axis);
    const knobs = [1.15, -1.15].map(y => { const k = new Mesh(new SphereGeometry(0.035, 16, 16), brass); k.position.y = y; cel.add(k); return k; });
    const rc = 0.9;
    const eqR = band(rc, 0.06, 0.03, matA); cel.add(eqR);                                   /* osmon ekvatori */
    const col1 = band(rc * 0.985, 0.05, 0.028, matA); col1.rotation.z = Math.PI / 2; cel.add(col1); /* kolurlar */
    const col2 = band(rc * 0.985, 0.05, 0.028, matA); col2.rotation.x = Math.PI / 2; cel.add(col2);
    const eclGroup = new Group(); eclGroup.rotation.x = EPS; cel.add(eclGroup);
    const eclR = band(rc * 1.02, 0.12, 0.03, matE); eclGroup.add(eclR);                    /* ekliptika (burj kamari) */
    const tropics = [1, -1].map(s => { const t = band(rc * Math.cos(EPS), 0.035, 0.022, brass); t.position.y = s * rc * Math.sin(EPS); cel.add(t); return t; });
    const polars = [1, -1].map(s => { const t = band(rc * Math.sin(EPS), 0.03, 0.02, brass); t.position.y = s * rc * Math.cos(EPS); cel.add(t); return t; });
    const earth = new Mesh(new SphereGeometry(0.17, 48, 48), new MeshPhysicalMaterial({ color: 0x1e40af, roughness: 0.35, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.2 }));
    cel.add(earth);
    /* EPS burchagi yoyi (3-bob) */
    const arcPts = [], ap = a => [0, -Math.sin(a) * rc * 1.12, Math.cos(a) * rc * 1.12];
    for (let i = 0; i < 24; i++) arcPts.push(...ap((i / 24) * EPS), ...ap(((i + 1) / 24) * EPS));
    arcPts.push(...ap(0), 0, 0, 0, ...ap(EPS), 0, 0, 0);
    const arcMat = new LineBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0 });
    cel.add(new LineSegments(new BufferGeometry().setAttribute('position', new Float32BufferAttribute(arcPts, 3)), arcMat));
    matE.emissive.setHex(0x6b4a10);

    /* yig’ilish: har bir halqa uchun «tarqoq» holat */
    const parts = [horizonRing, meridian, eqR, col1, col2, eclR, ...tropics, ...polars, axis, earth, ...knobs].map((m, i) => ({
      m, rot: m.rotation.clone(), pos: m.position.clone(), sc: m.scale.clone(),
      d: new Vector3(Math.sin(i * 2.1) * 2.2, Math.cos(i * 1.7) * 1.6 + 0.6, Math.sin(i * 0.9) * 1.8), spin: [Math.sin(i * 3.3) * 2.4, Math.cos(i * 2.7) * 2.4, Math.sin(i * 1.3) * 1.8]
    }));

    /* ---- o’lcham va ramka */
    let W = 1, H = 1, wide = true;
    const armHome = new Vector3();
    const size = () => {
      const r = canvas.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
      wide = W / H > 1.05;
      if (wide) armHome.set(1.95, 0.05, -7.4); else armHome.set(0, 0.95, -9.2);
      starMat.uniforms.uPx.value = renderer.getPixelRatio() * (wide ? 1.3 : 1.1);
    };
    new ResizeObserver(size).observe(canvas); size();

    /* ---- holat */
    const st = { p: MU.reduced ? 0.9 : 0 };
    const ease = x => x * x * (3 - 2 * x), seg = (p, a, b) => MU.clamp((p - a) / (b - a));
    const chips = Array.from(root.querySelectorAll('.rx-orbit li'));
    const hud = root.querySelector('.rx-hud');
    let chipW = [];
    const measure = () => { chipW = chips.map(li => li.firstElementChild.offsetWidth); };
    measure(); addEventListener('resize', measure); if (document.fonts) document.fonts.ready.then(measure);
    const tmp = new Vector3(), ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    if (!MU.isTouch) root.addEventListener('pointermove', e => { ptr.tx = (e.clientX / innerWidth - 0.5); ptr.ty = (e.clientY / innerHeight - 0.5); });
    const lst0 = lstHours(Date.now()) / 24 * Math.PI * 2, t0 = performance.now() / 1000;

    const render = t => {
      const p = st.p;
      const A = ease(seg(p, 0.14, 0.36));           /* sfera yig’ilishi */
      const Y = ease(seg(p, 0.4, 0.6));             /* «yil» aylanishi */
      const E = ease(seg(p, 0.6, 0.78));            /* ekliptika */
      const O = ease(seg(p, 0.8, 0.96));            /* orbitalar */
      setCh(p < 0.2 ? 0 : p < 0.4 ? 1 : p < 0.6 ? 2 : p < 0.8 ? 3 : 4);
      ptr.x += (ptr.tx - ptr.x) * 0.05; ptr.y += (ptr.ty - ptr.y) * 0.05;

      /* osmon: haqiqiy yulduz vaqti + sekin tezlashtirilgan aylanish + «yil» bobida bir to’liq aylanish */
      const now = (performance.now() / 1000 - t0);
      const spin = lst0 + now * 0.012 + Y * Math.PI * 2;
      sky.rotation.y = -spin;
      cel.rotation.y = -spin;
      starMat.uniforms.uTime.value = t;
      conMat.opacity = 0.05 + A * 0.22 - E * 0.1;
      gridMat.opacity = Y * 0.14 * (1 - O * 0.6);
      eclMat.opacity = E * 0.55 * (1 - O * 0.5);
      arcMat.opacity = E * (1 - O);
      eclR.material.emissiveIntensity = E * 0.9;

      /* kamera: avval qutb tomonga qaraydi, keyin sferaga tushadi */
      const pitch = MU.lerp(0.62, wide ? 0.07 : -0.02, ease(seg(p, 0.05, 0.3))) - ptr.y * 0.04;
      const yaw = ptr.x * 0.06 + (wide ? -0.05 : 0);
      camera.position.set(0, 0, 0);
      camera.rotation.set(pitch, -yaw, 0, 'YXZ');

      /* sfera */
      arm.position.copy(armHome); arm.position.y += (1 - A) * -1.2;
      arm.rotation.set(0, -0.35 + ptr.x * 0.25 + O * 0.2, 0);
      const s = (wide ? 1.05 : 0.8) * (0.55 + 0.45 * A) * (1 + O * 0.05);
      arm.scale.setScalar(s);
      parts.forEach((q, i) => {
        const a = ease(MU.clamp(A * 1.3 - i * 0.02));
        q.m.position.set(q.pos.x + q.d.x * (1 - a), q.pos.y + q.d.y * (1 - a), q.pos.z + q.d.z * (1 - a));
        q.m.rotation.set(q.rot.x + q.spin[0] * (1 - a), q.rot.y + q.spin[1] * (1 - a), q.rot.z + q.spin[2] * (1 - a));
        q.m.scale.copy(q.sc).multiplyScalar(0.2 + 0.8 * a);
        q.m.visible = a > 0.01;
      });
      stand.position.y = (1 - A) * -1.5; stand.visible = A > 0.02;
      renderer.render(scene, camera);
      hud.style.opacity = (1 - O).toFixed(3);

      /* yo’nalishlar ekliptika tekisligidagi katta orbitada */
      const sr = root.getBoundingClientRect();
      chips.forEach((li, i) => {
        if (O < 0.01) { li.style.opacity = '0'; li.style.visibility = 'hidden'; return; }
        li.style.visibility = 'visible';
        const ang = (i / chips.length) * Math.PI * 2 + now * 0.08, R = wide ? 2.05 : 1.55;
        tmp.set(Math.cos(ang) * R * O, 0, Math.sin(ang) * R * O);
        eclGroup.localToWorld(tmp);
        tmp.project(camera);
        const hw = (chipW[i] || 180) / 2 + 12;
        const x = MU.clamp((tmp.x * 0.5 + 0.5) * W, hw, W - hw), y = MU.clamp((-tmp.y * 0.5 + 0.5) * H, 96, H * (wide ? 0.92 : 0.42));
        li.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        li.style.opacity = (O * (tmp.z < 1 ? 1 : 0)).toFixed(3);
      });
    };

    if (MU.reduced) { st.p = 0.7; render(0); return; }
    ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: s => { st.p = s.progress; } });
    MU.renderLoop(root, t => render(t));
  }
});
