MU.part('hero', {
  init(root) {
    const { gsap, ScrollTrigger } = MU;

    /* tajriba yili — har yili avtomatik (site.ts: getFullYear() - 1999) */
    const yEl = root.querySelector('.hero-years');
    yEl.dataset.num = MU.years();
    yEl.textContent = MU.years();
    MU.nums(root);

    /* ---------- yo’nalish slot-so’zi */
    const words = Array.from(root.querySelectorAll('.hero-slot__word'));
    let wi = 0;
    const slot = gsap.timeline({ repeat: -1, paused: true });
    words.forEach((w, i) => {
      const next = words[(i + 1) % words.length];
      slot.to(w, { yPercent: -110, duration: 0.7, ease: 'mu.inOut' }, '+=2')
        .fromTo(next, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: 'mu.inOut', immediateRender: false }, '<');
    });
    gsap.set(words, { yPercent: 110, visibility: 'visible' }); gsap.set(words[0], { yPercent: 0 });
    if (!MU.reduced) MU.onVisible(root, v => (v && MU.revealed ? slot.play() : slot.pause()));
    MU.on('reveal', () => { if (!MU.reduced) slot.play(); });

    /* ---------- THREE: astrolyabiya + armillyar halqalar (navy / oltin, kun yorug’ida) */
    const {
      WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, TorusGeometry, CircleGeometry, BoxGeometry, SphereGeometry,
      ShapeGeometry, Shape, MeshStandardMaterial, MeshBasicMaterial, LineBasicMaterial, LineSegments, LineLoop, Line,
      BufferGeometry, Float32BufferAttribute, HemisphereLight, DirectionalLight, Points, PointsMaterial, CanvasTexture,
      Vector3, DoubleSide
    } = THREE;

    const canvas = root.querySelector('.hero-canvas');
    let renderer;
    try {
      renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { canvas.remove(); return; }
    renderer.setPixelRatio(MU.dpr(2));
    renderer.setClearColor(0x000000, 0);
    const scene = new Scene();
    const camera = new PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 12);
    scene.add(new HemisphereLight(0xffffff, 0xc9d5ee, 1.35));
    const key = new DirectionalLight(0xffffff, 1.7); key.position.set(4, 6, 8); scene.add(key);
    const warm = new DirectionalLight(0xffe7c2, 0.8); warm.position.set(-6, -3, 5); scene.add(warm);

    const NAVY = 0x1e3a8a, BLUE = 0x3b5bdb, GOLD = 0xc98a1b;
    const mNavy = new MeshStandardMaterial({ color: NAVY, metalness: 0.55, roughness: 0.32 });
    const mGold = new MeshStandardMaterial({ color: 0xd9a032, metalness: 0.85, roughness: 0.25, emissive: 0x4a2c00, emissiveIntensity: 0.18 });
    const mPlate = new MeshStandardMaterial({ color: 0xf2f6fd, metalness: 0.1, roughness: 0.8, transparent: true, opacity: 0.72, side: DoubleSide });
    const lNavy = new LineBasicMaterial({ color: NAVY, transparent: true, opacity: 0.6 });
    const lBlue = new LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.28 });
    const lGold = new LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.75 });

    const circlePts = (r, cx = 0, cy = 0, seg = 128, z = 0) => {
      const a = [];
      for (let i = 0; i < seg; i++) { const t = (i / seg) * Math.PI * 2; a.push(cx + Math.cos(t) * r, cy + Math.sin(t) * r, z); }
      return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(a, 3));
    };

    const R = 2.6;
    const rig = new Group(); scene.add(rig);
    const astro = new Group(); rig.add(astro);
    const parts = [];

    /* mater + limb */
    const rim = new Mesh(new TorusGeometry(R, 0.1, 28, 180), mNavy); astro.add(rim); parts.push(rim);
    const rimIn = new Mesh(new TorusGeometry(R * 0.9, 0.028, 12, 180), mGold); astro.add(rimIn); parts.push(rimIn);
    const plate = new Mesh(new CircleGeometry(R * 0.9, 96), mPlate); plate.position.z = -0.02; astro.add(plate); parts.push(plate);
    const tickPos = [];
    for (let i = 0; i < 360; i++) {
      const t = (i / 360) * Math.PI * 2, len = i % 30 === 0 ? 0.22 : i % 10 === 0 ? 0.15 : i % 5 === 0 ? 0.1 : 0.05;
      const r0 = R * 0.9 + 0.03, r1 = r0 + len;
      tickPos.push(Math.cos(t) * r0, Math.sin(t) * r0, 0.02, Math.cos(t) * r1, Math.sin(t) * r1, 0.02);
    }
    const ticksGeo = new BufferGeometry().setAttribute('position', new Float32BufferAttribute(tickPos, 3));
    const ticks = new LineSegments(ticksGeo, lNavy); astro.add(ticks);

    /* plastinka: almukantaratlar (siljigan aylanalar) + azimut chiziqlari */
    const plateLines = new Group(); astro.add(plateLines);
    for (let i = 1; i <= 8; i++) {
      const r = R * (0.12 + i * 0.075), cy = -R * 0.2 + i * 0.07;
      plateLines.add(new LineLoop(circlePts(r, 0, cy, 128, 0.01), i % 2 ? lBlue : lNavy));
    }
    for (let i = 0; i < 12; i++) {
      const t = (i / 12) * Math.PI * 2;
      plateLines.add(new Line(new BufferGeometry().setAttribute('position', new Float32BufferAttribute([0, R * 0.08, 0.01, Math.cos(t) * R * 0.88, Math.sin(t) * R * 0.88, 0.01], 3)), lBlue));
    }

    /* rete: ekliptika, yulduz ko’rsatkichlari */
    const rete = new Group(); rete.position.z = 0.08; astro.add(rete);
    const ecl = new Mesh(new TorusGeometry(R * 0.5, 0.035, 12, 140), mGold); ecl.position.y = R * 0.26; rete.add(ecl); parts.push(ecl);
    const trop = new Mesh(new TorusGeometry(R * 0.84, 0.03, 12, 160), mGold); rete.add(trop); parts.push(trop);
    for (let i = 0; i < 6; i++) {
      const arm = new Mesh(new BoxGeometry(R * 0.84, 0.035, 0.03), mGold);
      arm.rotation.z = (i / 6) * Math.PI; rete.add(arm);
    }
    const flame = new Shape();
    flame.moveTo(0, 0); flame.quadraticCurveTo(0.09, 0.2, 0, 0.42); flame.quadraticCurveTo(-0.09, 0.2, 0, 0);
    const flameGeo = new ShapeGeometry(flame, 8);
    const starMat = new MeshBasicMaterial({ color: 0xe0a526 });
    const starTips = [];
    for (let i = 0; i < 14; i++) {
      const t = (i / 14) * Math.PI * 2 + (i % 3) * 0.2, r = R * (0.28 + ((i * 37) % 10) / 18);
      const f = new Mesh(flameGeo, mGold);
      f.position.set(Math.cos(t) * r * 0.86, Math.sin(t) * r * 0.86, 0.02); f.rotation.z = t - Math.PI / 2; f.scale.setScalar(0.8 + (i % 4) * 0.12);
      rete.add(f);
      const tip = new Mesh(new SphereGeometry(0.045, 10, 10), starMat);
      tip.position.set(Math.cos(t) * (r * 0.86 + 0.35), Math.sin(t) * (r * 0.86 + 0.35), 0.03);
      rete.add(tip); starTips.push(tip);
    }

    /* alidada (qoida) + markaz */
    const rule = new Group(); rule.position.z = 0.16; astro.add(rule);
    const bar = new Mesh(new BoxGeometry(R * 1.95, 0.09, 0.035), mNavy); rule.add(bar);
    [-1, 1].forEach(s => { const v = new Mesh(new BoxGeometry(0.05, 0.28, 0.12), mNavy); v.position.x = s * R * 0.62; rule.add(v); });
    const pin = new Mesh(new SphereGeometry(0.12, 20, 20), mGold); pin.position.z = 0.2; astro.add(pin);

    /* kursi (tepa halqa) */
    const throne = new Mesh(new TorusGeometry(0.26, 0.055, 12, 48), mNavy); throne.position.set(0, R + 0.34, 0); astro.add(throne);
    const shackle = new Mesh(new TorusGeometry(0.16, 0.035, 10, 40), mGold); shackle.position.set(0, R + 0.72, 0); shackle.rotation.y = Math.PI / 2; astro.add(shackle);

    /* armillyar halqalar (3D chuqurlik) */
    const armil = new Group(); rig.add(armil);
    const ringA = new Mesh(new TorusGeometry(R * 1.3, 0.02, 10, 200), new MeshStandardMaterial({ color: BLUE, metalness: 0.5, roughness: 0.4, transparent: true, opacity: 0.55 }));
    const ringB = new Mesh(new TorusGeometry(R * 1.42, 0.016, 10, 200), new MeshStandardMaterial({ color: GOLD, metalness: 0.7, roughness: 0.3, transparent: true, opacity: 0.6 }));
    ringA.rotation.x = 1.25; ringB.rotation.y = 1.1; ringB.rotation.x = 0.3;
    armil.add(ringA, ringB);
    const beadA = new Mesh(new SphereGeometry(0.09, 16, 16), mGold);
    const beadB = new Mesh(new SphereGeometry(0.07, 16, 16), new MeshStandardMaterial({ color: 0xdc2626, metalness: 0.3, roughness: 0.4 }));
    armil.add(beadA, beadB);

    /* yulduz changi */
    const dot = document.createElement('canvas'); dot.width = dot.height = 64;
    const g2 = dot.getContext('2d'); const grd = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.35, 'rgba(255,255,255,.6)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g2.fillStyle = grd; g2.fillRect(0, 0, 64, 64);
    const starCount = MU.isMobile ? 160 : 360;
    const sp = [], sc = [];
    for (let i = 0; i < starCount; i++) {
      const v = new Vector3().randomDirection().multiplyScalar(4.5 + Math.random() * 4);
      sp.push(v.x, v.y, v.z * 0.6);
      const gold = Math.random() < 0.22; sc.push(gold ? 0.79 : 0.23, gold ? 0.54 : 0.36, gold ? 0.11 : 0.86);
    }
    const sGeo = new BufferGeometry().setAttribute('position', new Float32BufferAttribute(sp, 3)).setAttribute('color', new Float32BufferAttribute(sc, 3));
    const dust = new Points(sGeo, new PointsMaterial({ size: 0.09, map: new CanvasTexture(dot), vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false }));
    rig.add(dust);

    /* ---------- joylashuv */
    let W = 1, H = 1;
    const layout = () => {
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setSize(W, H, false);
      camera.aspect = W / H; camera.updateProjectionMatrix();
      const mobile = innerWidth <= 760;
      const fit = mobile ? 0.9 : (innerWidth <= 1100 ? 0.95 : 1);
      rig.scale.setScalar(Math.min(0.92, (W / H) * 0.6) * fit + (mobile ? 0.05 : 0));
      rig.position.set(mobile ? 0 : 0.35, mobile ? 0.1 : 0.75, 0);
    };
    new ResizeObserver(layout).observe(canvas);
    layout();

    /* ---------- holat */
    const state = { tiltX: -0.42, tiltY: -0.55, px: 0, py: 0, spin: 0, intro: MU.reduced ? 1 : 0, scroll: 0 };
    let tx = 0, ty = 0;
    if (!MU.isTouch) root.addEventListener('pointermove', e => {
      tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2;
    });

    ticksGeo.setDrawRange(0, MU.reduced ? 720 : 0);
    const tags = Array.from(root.querySelectorAll('.hero-tag'));
    const tagAnchors = [new Vector3(), new Vector3(), new Vector3()];

    const render = (t = 0, dt = 0.016) => {
      state.px = MU.damp(state.px, tx, 3, dt); state.py = MU.damp(state.py, ty, 3, dt);
      const s = state.scroll, k = state.intro;
      astro.rotation.x = state.tiltX + state.py * 0.12 + Math.sin(t * 0.3) * 0.04 - s * 0.35;
      astro.rotation.y = state.tiltY + state.px * 0.22 + Math.sin(t * 0.2) * 0.06 + (1 - k) * -1.6 + s * 1.1;
      astro.scale.setScalar(0.62 + 0.38 * k);
      rete.rotation.z = t * 0.09;
      rule.rotation.z = -t * 0.05 + 0.6;
      armil.rotation.y = t * 0.12 + s * 0.8; armil.rotation.x = 0.25 + s * 0.3;
      armil.scale.setScalar(0.75 + 0.25 * k);
      ringA.material.opacity = 0.55 * k; ringB.material.opacity = 0.6 * k;
      const a1 = t * 0.45, a2 = -t * 0.3 + 2;
      beadA.position.set(Math.cos(a1) * R * 1.3, 0, Math.sin(a1) * R * 1.3).applyAxisAngle(new Vector3(1, 0, 0), 1.25 - Math.PI / 2);
      beadB.position.set(Math.cos(a2) * R * 1.42, Math.sin(a2) * R * 1.42 * 0.3, Math.sin(a2) * R * 1.42);
      dust.rotation.y = t * 0.02; dust.rotation.x = s * 0.4;
      rig.position.y = (innerWidth <= 760 ? 0.1 : 0.75) + s * 1.4;
      starTips.forEach((m, i) => m.scale.setScalar(0.8 + 0.5 * Math.abs(Math.sin(t * 1.6 + i))));
      renderer.render(scene, camera);

      /* HTML teglar — 3D halqa nuqtalariga proyeksiya */
      if (k > 0.6 && tags.length) {
        const rect = canvas.getBoundingClientRect(), host = root.getBoundingClientRect();
        [[a1 * 0.4 + 0.6, 1.3], [a1 * 0.4 + 2.7, 1.42], [a1 * 0.4 + 4.6, 1.3]].forEach(([ang, rr], i) => {
          const v = tagAnchors[i].set(Math.cos(ang) * R * rr, Math.sin(ang) * R * rr * 0.55, Math.sin(ang) * R * 0.4);
          v.applyMatrix4(rig.matrixWorld).project(camera);
          const x = MU.clamp(rect.left - host.left + (v.x * 0.5 + 0.5) * rect.width, 110, host.width - 130), y = rect.top - host.top + (-v.y * 0.5 + 0.5) * rect.height;
          tags[i].style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
          tags[i].style.opacity = String(MU.clamp((k - 0.6) * 2.5) * (v.z < 1 ? 1 : 0) * (1 - s * 1.4));
        });
      }
    };

    if (MU.reduced) { state.intro = 1; render(0); return; }
    MU.renderLoop(root, (t, dt) => render(t, dt));

    MU.on('reveal', () => {
      gsap.to(state, { intro: 1, duration: 2.6, ease: 'mu.out' });
      gsap.to({ n: 0 }, { n: 720, duration: 2.4, ease: 'power2.inOut', onUpdate() { ticksGeo.setDrawRange(0, Math.round(this.targets()[0].n)); } });
      parts.forEach((m, i) => gsap.from(m.scale, { x: 0.3, y: 0.3, z: 0.3, duration: 1.6, delay: 0.1 + i * 0.08, ease: 'back.out(1.6)' }));
    });

    /* scroll: astrolyabiya buriladi va ko’tariladi, matn yengil suzib ketadi */
    ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom top', scrub: true, onUpdate: s => { state.scroll = s.progress; } });
    gsap.to(root.querySelector('.hero-inner'), { yPercent: -12, autoAlpha: 0.2, ease: 'none', scrollTrigger: { trigger: root, start: '35% top', end: 'bottom top', scrub: true } });
  }
});
