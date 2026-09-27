MU.part('rasadxona', {
  init(root) {
    const { gsap, ScrollTrigger } = MU;
    const {
      WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, TorusGeometry, SphereGeometry, CylinderGeometry, BoxGeometry,
      MeshStandardMaterial, HemisphereLight, DirectionalLight, PointLight, Vector3, Points, PointsMaterial, BufferGeometry, Float32BufferAttribute
    } = THREE;
    const stage = root.querySelector('.rx-stage'), canvas = root.querySelector('.rx-canvas');
    let renderer;
    try { renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return; }
    renderer.setPixelRatio(MU.dpr(2)); renderer.setClearColor(0x000000, 0);
    const scene = new Scene(), camera = new PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.6, 11); camera.lookAt(0, 0, 0);
    scene.add(new HemisphereLight(0xffffff, 0xcbd6ee, 1.3));
    const key = new DirectionalLight(0xffffff, 1.8); key.position.set(5, 7, 6); scene.add(key);
    const rim = new DirectionalLight(0xffe2b0, 0.9); rim.position.set(-6, 2, -4); scene.add(rim);
    const core = new PointLight(0xffc36b, 0, 8); scene.add(core);

    const mNavy = new MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.6, roughness: 0.3 });
    const mBlue = new MeshStandardMaterial({ color: 0x3b5bdb, metalness: 0.55, roughness: 0.32 });
    const mGold = new MeshStandardMaterial({ color: 0xd9a032, metalness: 0.85, roughness: 0.22, emissive: 0x3a2400, emissiveIntensity: 0.2 });
    const mCore = new MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffa31a, emissiveIntensity: 0.2, metalness: 0.2, roughness: 0.4 });

    const R = 2.2;
    const sph = new Group(); scene.add(sph);
    const ring = (r, tube, mat, seg = 160) => new Mesh(new TorusGeometry(r, tube, 16, seg), mat);
    const rings = [
      { m: ring(R, 0.07, mNavy), base: [0, 0, 0], open: [0.9, 0.2, 0], spread: 1.25 },           /* meridian */
      { m: ring(R * 0.97, 0.05, mBlue), base: [Math.PI / 2, 0, 0], open: [1.2, 0.6, 0.4], spread: 1.4 },   /* ufq */
      { m: ring(R * 0.94, 0.05, mGold), base: [Math.PI / 2 - 0.41, 0, 0], open: [0.3, 1.1, 0.8], spread: 1.55 }, /* ekliptika */
      { m: ring(R * 0.91, 0.04, mBlue), base: [0, Math.PI / 2, 0], open: [-0.6, 1.4, 0.2], spread: 1.7 },  /* kolur */
      { m: ring(R * 0.88, 0.04, mNavy), base: [0.5, Math.PI / 4, 0], open: [1.6, -0.4, 0.9], spread: 1.85 }
    ];
    rings.forEach(r => { r.m.rotation.set(...r.base); sph.add(r.m); });
    /* graduslar — meridian halqasidagi bo’rtiqlar */
    for (let i = 0; i < 36; i++) {
      const t = (i / 36) * Math.PI * 2, b = new Mesh(new BoxGeometry(0.03, i % 3 ? 0.12 : 0.22, 0.05), mGold);
      b.position.set(Math.cos(t) * (R + 0.1), Math.sin(t) * (R + 0.1), 0); b.rotation.z = t + Math.PI / 2; rings[0].m.add(b);
    }
    const axis = new Mesh(new CylinderGeometry(0.03, 0.03, R * 2.5, 12), mGold); axis.rotation.z = 0.41; sph.add(axis);
    const earth = new Mesh(new SphereGeometry(0.42, 40, 40), mCore); sph.add(earth);
    /* poydevor */
    const base = new Group(); base.position.y = -R - 0.35; scene.add(base);
    const col = new Mesh(new CylinderGeometry(0.12, 0.2, 0.7, 24), mNavy); col.position.y = 0.2; base.add(col);
    const foot = new Mesh(new CylinderGeometry(0.9, 1.05, 0.16, 48), mNavy); foot.position.y = -0.18; base.add(foot);
    const cup = new Mesh(new TorusGeometry(0.42, 0.05, 12, 60), mGold); cup.rotation.x = Math.PI / 2; cup.position.y = 0.55; base.add(cup);
    /* yulduz changi */
    const sp = []; for (let i = 0; i < 260; i++) { const v = new Vector3().randomDirection().multiplyScalar(3.4 + Math.random() * 2.4); sp.push(v.x, v.y, v.z); }
    const dust = new Points(new BufferGeometry().setAttribute('position', new Float32BufferAttribute(sp, 3)), new PointsMaterial({ color: 0x3b5bdb, size: 0.045, transparent: true, opacity: 0.55, depthWrite: false }));
    scene.add(dust);

    let W = 1, H = 1;
    const size = () => { const r = canvas.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height); renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); };
    new ResizeObserver(size).observe(canvas); size();

    /* holat: scroll progress + sudrab aylantirish */
    const st = { p: MU.reduced ? 1 : 0, spinY: 0, vel: 0.15, dragX: 0 };
    let drag = null;
    stage.addEventListener('pointerdown', e => { drag = { x: e.clientX, spin: st.spinY }; st.vel = 0; stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointermove', e => { if (!drag) return; const dx = (e.clientX - drag.x) / W * 4; st.vel = (drag.spin + dx - st.spinY) * 6; st.spinY = drag.spin + dx; });
    const end = () => { drag = null; };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);

    const chips = Array.from(root.querySelectorAll('.rx-orbit li'));
    let chipW = [];
    const measure = () => { chipW = chips.map(li => li.firstChild.offsetWidth); };
    measure(); addEventListener('resize', measure); if (document.fonts) document.fonts.ready.then(measure);
    const steps = Array.from(root.querySelectorAll('.rx-steps li'));
    const ease = x => x * x * (3 - 2 * x), seg = (p, a, b) => MU.clamp((p - a) / (b - a));
    const tmp = new Vector3();
    const render = (t, dt) => {
      const p = st.p, open = ease(seg(p, 0.3, 0.7)), out = ease(seg(p, 0.55, 0.95));
      if (!drag) { st.spinY += st.vel * dt; st.vel = MU.damp(st.vel, 0.15, 1.2, dt); }
      sph.rotation.y = st.spinY + p * 2.2;
      sph.rotation.x = -0.15 + Math.sin(t * 0.4) * 0.05;
      rings.forEach((r, i) => {
        const spin = t * (0.15 + i * 0.07) * (1 - open * 0.6);
        r.m.rotation.x = MU.lerp(r.base[0], r.open[0], open) + (i % 2 ? spin : 0);
        r.m.rotation.y = MU.lerp(r.base[1], r.open[1], open) + (i % 2 ? 0 : spin * 0.5);
        r.m.rotation.z = MU.lerp(r.base[2], r.open[2], open);
        r.m.scale.setScalar(MU.lerp(1, r.spread * 0.82, open));
      });
      earth.scale.setScalar(1 + open * 0.7 + Math.sin(t * 3) * 0.03 * open);
      mCore.emissiveIntensity = 0.2 + open * 1.4; core.intensity = open * 18;
      base.position.y = -R - 0.35 - open * 1.6; base.scale.setScalar(1 - open * 0.3);
      axis.scale.y = 1 - open * 0.55;
      dust.rotation.y = t * 0.03;
      renderer.render(scene, camera);
      /* 5 yo’nalish — markazdan orbitaga chiqadi (ekran chetidan chiqmaydi) */
      const sr = stage.getBoundingClientRect();
      chips.forEach((li, i) => {
        const a = (i / chips.length) * Math.PI * 2 + t * 0.22 + st.spinY * 0.3, rr = R * (0.2 + out * 1.28);
        tmp.set(Math.cos(a) * rr, Math.sin(a) * rr * (innerWidth < 760 ? 1.05 : 0.72) + 0.1, Math.sin(a) * rr * 0.4).project(camera);
        const hw = (chipW[i] || 200) / 2 + 10;
        const x = MU.clamp((tmp.x * 0.5 + 0.5) * W, hw - sr.left, innerWidth - sr.left - hw), y = (-tmp.y * 0.5 + 0.5) * H;
        li.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${(0.6 + out * 0.4).toFixed(3)})`;
        li.style.opacity = out.toFixed(3);
        li.style.zIndex = tmp.z < 0.985 ? 2 : 1;
      });
      const si = p < 0.3 ? 0 : p < 0.62 ? 1 : 2;
      steps.forEach((s, k) => s.classList.toggle('is-on', k <= si));
    };

    if (MU.reduced) { render(0, 0); return; }
    ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: s => { st.p = s.progress; } });
    MU.renderLoop(root, (t, dt) => render(t, dt));
  }
});
