/* ==========================================================================
   06 — Aqlli park · pinned digital-twin scene
   container turns → e-seal verifies → doors swing → cargo floats out →
   IoT sensors glow with projected HTML callouts → fleet chips
   ========================================================================== */
MU.part('fleet', {
  init(root, MU) {
    const { gsap, ScrollTrigger } = MU;
    const $ = s => root.querySelector(s);
    const $$ = s => Array.from(root.querySelectorAll(s));
    const stage = $('.flt-stage');
    const canvas = $('.flt-canvas');
    const mob = MU.isMobile;
    // portrait tablets share the phone choreography (framing, cargo stack, story hand-off) but keep desktop quality
    const narrow = mob || window.innerWidth / Math.max(1, window.innerHeight) < 0.9;
    const reduced = MU.reduced;
    const clamp = MU.clamp, lerp = MU.lerp;
    const ease = t => t * t * (3 - 2 * t);

    /* ---------------------------------------------------------- decorative dial ticks */
    const tk = $('.flt-bg__ticks');
    if (tk) {
      let s = '';
      for (let i = 0; i < 120; i++) {
        const a = (i / 120) * Math.PI * 2, major = i % 10 === 0;
        const r2 = major ? 262 : i % 5 === 0 ? 278 : 287, c = Math.cos(a), si = Math.sin(a);
        s += `<line x1="${(300 + c * 296).toFixed(1)}" y1="${(300 + si * 296).toFixed(1)}" x2="${(300 + c * r2).toFixed(1)}" y2="${(300 + si * r2).toFixed(1)}"${major ? ' class="is-major"' : ''}/>`;
      }
      tk.innerHTML = s;
    }

    /* ---------------------------------------------------------- choreography parameters */
    // camera target t = [x, y, z]; cargo = floating rack slots (container-local, x relative to the door end)
    const P = narrow ? {
      fov: 34, offX: 0, offY: 0.03, pin: 1.8,
      rot0: 1.22, rot1: -1.2, rot2: -1.02, rot3: -0.94,
      d0: 32, d1: 19, d2: 33, d3: 35,
      el0: 0.15, el1: 0.13, el2: 0.17, el3: 0.2,
      t0: [0, 1.3, 0], t1: [2.4, 1.6, 5.0], t2: [3.4, 3.0, 5.6], t3: [3.3, 3.1, 5.4],
      cargo: [[1.6, 0.8, 0.5, 0.04, 0.25, -0.03], [1.65, 2.25, -0.45, -0.05, -0.2, 0.05], [1.6, 3.7, 0.5, 0.05, 0.3, 0.03], [1.65, 5.15, -0.45, -0.04, -0.25, -0.04]],
      co: [[-22, -60], [24, -46], [24, 40], [-24, 46]]
    } : {
      fov: 28, offX: 0.12, offY: -0.02, pin: 2.4,
      rot0: 0.62, rot1: -0.95, rot2: -0.36, rot3: -0.3,
      d0: 20, d1: 13.2, d2: 24.5, d3: 26.5,
      el0: 0.1, el1: 0.12, el2: 0.19, el3: 0.22,
      t0: [0, 1.35, 0], t1: [2.9, 2.0, 4.0], t2: [4.9, 2.3, 1.4], t3: [4.7, 2.4, 1.3],
      cargo: [[1.6, 0.75, 0.45, 0.04, 0.22, -0.03], [3.1, 0.9, -0.35, -0.05, -0.18, 0.04],
        [1.65, 2.2, 0.35, -0.04, -0.16, 0.05], [3.15, 2.35, -0.45, 0.05, 0.24, -0.03],
        [1.7, 3.65, 0.4, 0.05, 0.28, 0.04], [3.2, 3.8, -0.4, -0.05, -0.22, -0.05]],
      co: [[30, -150], [0, -210], [0, 170], [-200, 70]]
    };

    const S = {
      rot: P.rot0, dist: P.d0, el: P.el0, tx: P.t0[0], ty: P.t0[1], tz: P.t0[2],
      handles: 0, doorR: 0, doorL: 0, light: 0, seal: 0, sensors: 0, intro: reduced ? 1 : 0
    };
    const cam = (d, el, rot, t) => ({ dist: d, el, rot, tx: t[0], ty: t[1], tz: t[2] });
    const OPEN = Math.PI * 0.7;

    /* ---------------------------------------------------------- callouts (DOM) */
    const coEls = $$('.flt-co'), leaders = $$('.flt-leader');
    const coDefs = coEls.map((el, i) => ({
      el, dot: el.querySelector('.flt-co__dot'), card: el.querySelector('.flt-co__card'),
      st: { v: 0 }, ox: P.co[i][0], oy: P.co[i][1], w: 220, h: 60, on: false, anchor: null
    }));
    // html order: gps, temp, hum, seal
    const CO = { gps: coDefs[0], temp: coDefs[1], hum: coDefs[2], seal: coDefs[3] };
    let topMin = 90, botMin = 40;

    function measure() {
      const sr = stage.getBoundingClientRect();
      coDefs.forEach(c => { c.w = c.card.offsetWidth || 220; c.h = c.card.offsetHeight || 60; });
      const head = $('.flt-head'), story = $('.flt-story');
      if (narrow && head && story) {
        topMin = head.getBoundingClientRect().bottom - sr.top + 10;
        botMin = sr.bottom - story.getBoundingClientRect().top + 10;
      } else {
        topMin = 96; botMin = 40;
      }
    }

    /* ---------------------------------------------------------- WebGL */
    let G = null;
    try { G = createGL(); } catch (err) { G = null; }
    if (!G) root.classList.add('is-nogl');

    function createGL() {
      const {
        WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, PlaneGeometry, CylinderGeometry, BoxGeometry, BufferGeometry,
        Float32BufferAttribute, ShaderMaterial, MeshBasicMaterial, PointsMaterial, Points, WebGLRenderTarget, PMREMGenerator,
        Color, Vector2, Vector3, DirectionalLight, HemisphereLight, SphereGeometry, SRGBColorSpace, NeutralToneMapping,
        AdditiveBlending, BackSide, DoubleSide
      } = THREE;
      if (!THREE || !window.muFleetKit) return null;
      const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true, stencil: false, powerPreference: 'high-performance' });
      if (!gl) return null;

      const renderer = new WebGLRenderer({ canvas, context: gl, alpha: true, antialias: true });
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = NeutralToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.outputColorSpace = SRGBColorSpace;

      const scene = new Scene();
      const world = new Group();
      scene.add(world);
      const kit = window.muFleetKit(renderer);
      const { container, L, W, H } = kit;
      world.add(container);

      /* studio environment → PMREM (softboxes in palette colours) */
      {
        const env = new Scene();
        const sky = new Mesh(new SphereGeometry(40, 32, 16), new ShaderMaterial({
          side: BackSide, depthWrite: false,
          vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: 'varying vec3 vP; void main(){ float h = vP.y; vec3 c = mix(vec3(0.004,0.006,0.016), vec3(0.05,0.07,0.16), smoothstep(-0.3, 0.9, h)); gl_FragColor = vec4(c, 1.0); }'
        }));
        env.add(sky);
        const soft = (w, h, col, k, x, y, z) => {
          const m = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ color: new Color(col).multiplyScalar(k), side: DoubleSide }));
          m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
        };
        soft(26, 9, '#ffffff', 3.2, 0, 26, 6);
        soft(5, 22, '#2ee6d6', 1.9, -26, 6, -6);
        soft(5, 20, '#ffc861', 1.8, 26, 5, -8);
        soft(22, 6, '#3d8bff', 1.3, 0, 7, 26);
        soft(10, 4, '#8b6cff', 0.9, 10, 2, 22);
        const pmrem = new PMREMGenerator(renderer);
        const envRT = pmrem.fromScene(env, 0.03);
        scene.environment = envRT.texture;
        scene.environmentIntensity = 0.85;
        env.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        pmrem.dispose();
      }

      /* lights live inside `world` so the mirrored pass is lit consistently */
      world.add(new HemisphereLight(new Color('#a9bcff'), new Color('#080b18'), 0.7));
      const key = new DirectionalLight(new Color('#fff1dc'), 2.7); key.position.set(7, 12, 9); world.add(key);
      const rimC = new DirectionalLight(new Color('#2ee6d6'), 1.9); rimC.position.set(-13, 5, -6); world.add(rimC);
      const rimW = new DirectionalLight(new Color('#ffc861'), 1.2); rimW.position.set(13, 4, -9); world.add(rimW);
      const fill = new DirectionalLight(new Color('#5d9bff'), 0.7); fill.position.set(-5, 3, 12); world.add(fill);

      /* grounding: container shadow + per-unit blobs */
      const shadows = new Group();
      container.add(shadows);
      const cShadow = new Mesh(kit.shadowGeo, kit.shadowMat);
      cShadow.position.y = 0.004;
      shadows.add(cShadow);

      /* cargo */
      const units = [];
      const slots = [[L / 2 - 0.85, 0.57], [L / 2 - 0.85, -0.57], [L / 2 - 2.15, 0.57], [L / 2 - 2.15, -0.57], [L / 2 - 3.45, 0.57], [L / 2 - 3.45, -0.57]];
      P.cargo.forEach((f, i) => {
        const g = kit.makeUnit(kit.unitKinds[i], i === 1 || i === 3);
        const [sx, sz] = slots[i];
        const blob = new Mesh(kit.blobGeo, kit.blobMat());
        blob.position.y = 0.006;
        shadows.add(blob);
        container.add(g);
        units.push({
          g, blob, st: { p: 0 }, ph: i * 1.7,
          P0: new Vector3(sx, 0.172, sz), P1: new Vector3(L / 2 + 1.3, 0.26, sz * 1.15),
          P2: new Vector3(L / 2 + f[0], f[1], f[2]), R: f.slice(3)
        });
      });
      const devGeo = new BoxGeometry(0.16, 0.1, 0.05);
      const addSensor = (unit, color, x, y, z) => {
        const dev = new Mesh(devGeo, kit.M.device);
        dev.position.set(x, y, z - 0.03);
        unit.g.add(dev);
        const s = kit.sensorNode(color, 0.95);
        s.g.position.set(x, y, z);
        unit.g.add(s.g);
        return s;
      };
      const sTemp = addSensor(units[3], '#ffc861', 0.3, 0.8, 0.56);
      const sHum = addSensor(units[1], '#3d8bff', -0.28, 0.6, 0.56);
      CO.gps.anchor = kit.sensors.gps.core;
      CO.seal.anchor = kit.sensors.seal.core;
      CO.temp.anchor = sTemp.core;
      CO.hum.anchor = sHum.core;
      const sensorList = [kit.sensors.gps, sTemp, sHum, kit.sensors.seal];

      /* scan frame that sweeps the hull once sensors wake */
      const scan = new Mesh(kit.scanGeo, kit.scanMat);
      scan.position.set(0, H / 2, 0);
      container.add(scan);

      /* light spilling out of the doors: soft volume + floor pool */
      const fxVert = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
      const beamMat = new ShaderMaterial({
        transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide,
        uniforms: { uAmt: { value: 0 }, uColor: { value: new Color('#ffd49a') } },
        vertexShader: fxVert,
        fragmentShader: 'uniform float uAmt; uniform vec3 uColor; varying vec2 vUv; void main(){ float across = sin(fract(vUv.x * 4.0) * 3.14159); float a = pow(1.0 - vUv.y, 2.4) * pow(across, 1.6) * uAmt; gl_FragColor = vec4(uColor, a); }'
      });
      const beamGeo = new CylinderGeometry(1.7, 1, 4.2, 4, 1, true);
      beamGeo.rotateY(Math.PI / 4);
      beamGeo.rotateZ(-Math.PI / 2);
      beamGeo.scale(1, (kit.DOOR_H / 2) / Math.SQRT1_2, ((W - 0.36) / 2) / Math.SQRT1_2);
      beamGeo.translate(L / 2 + 2.1, kit.DOOR_Y + kit.DOOR_H / 2, 0);
      const beam = new Mesh(beamGeo, beamMat);
      container.add(beam);
      const spillMat = new ShaderMaterial({
        transparent: true, depthWrite: false, blending: AdditiveBlending,
        uniforms: { uAmt: { value: 0 }, uColor: { value: new Color('#ffcf8f') } },
        vertexShader: fxVert,
        fragmentShader: 'uniform float uAmt; uniform vec3 uColor; varying vec2 vUv; void main(){ float a = pow(1.0 - vUv.x, 1.8) * pow(sin(vUv.y * 3.14159), 2.0) * uAmt; gl_FragColor = vec4(uColor, a); }'
      });
      const spillGeo = new PlaneGeometry(5.5, 4);
      spillGeo.rotateX(-Math.PI / 2);
      spillGeo.translate(L / 2 + 2.75, 0.008, 0);
      const spill = new Mesh(spillGeo, spillMat);
      container.add(spill);

      /* floating dust in the studio light */
      const nDust = mob ? 110 : 240;
      const dp = new Float32Array(nDust * 3);
      for (let i = 0; i < nDust; i++) {
        dp[i * 3] = MU.rand(-11, 13); dp[i * 3 + 1] = MU.rand(0.2, 8); dp[i * 3 + 2] = MU.rand(-7, 7);
      }
      const dGeo = new BufferGeometry();
      dGeo.setAttribute('position', new Float32BufferAttribute(dp, 3));
      const dust = new Points(dGeo, new PointsMaterial({
        size: 0.07, map: kit.glowTex, color: new Color('#9fdcff'), transparent: true, opacity: 0.5,
        depthWrite: false, blending: AdditiveBlending, sizeAttenuation: true
      }));
      scene.add(dust);

      /* mirror floor: samples a half-res mirrored render of `world` */
      const useRefl = !mob;
      const rt = useRefl ? new WebGLRenderTarget(4, 4, { colorSpace: SRGBColorSpace }) : null;
      const floorMat = new ShaderMaterial({
        transparent: true, depthWrite: false,
        defines: { REFL: useRefl ? 1 : 0 },
        uniforms: {
          uRefl: { value: rt ? rt.texture : null }, uRes: { value: new Vector2(1, 1) }, uTexel: { value: new Vector2(0.001, 0.001) },
          uPulse: { value: 0 }, uPulseAmt: { value: 0 }, uGrid: { value: 1 },
          uRot: { value: 0 }, uHalf: { value: new Vector2(L / 2, W / 2) }
        },
        vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
        fragmentShader: `
          uniform sampler2D uRefl; uniform vec2 uRes; uniform vec2 uTexel;
          uniform float uPulse; uniform float uPulseAmt; uniform float uGrid;
          uniform float uRot; uniform vec2 uHalf;
          varying vec3 vW;
          void main() {
            vec2 p = vW.xz;
            float r = length(p * vec2(0.52, 1.0));
            float fade = 1.0 - smoothstep(3.2, 11.5, r);
            vec3 col = vec3(0.008, 0.012, 0.03);
            col += vec3(0.03, 0.045, 0.1) * (1.0 - smoothstep(0.0, 7.5, r));
            vec2 gp = abs(fract(p - 0.5) - 0.5) / fwidth(p);
            float line = 1.0 - min(min(gp.x, gp.y), 1.0);
            col += vec3(0.18, 0.9, 0.84) * line * 0.055 * uGrid * (1.0 - smoothstep(1.5, 10.0, r));
            float rr = length(p * vec2(0.7, 1.0));
            float ring = exp(-pow((rr - uPulse * 13.0) * 1.7, 2.0)) * (1.0 - uPulse);
            col += vec3(0.18, 0.9, 0.84) * ring * 0.32 * uPulseAmt;
            #if REFL == 1
              vec2 suv = gl_FragCoord.xy / uRes;
              vec3 rf = texture2D(uRefl, suv).rgb * 0.32;
              rf += texture2D(uRefl, suv + vec2(uTexel.x, 0.0)).rgb * 0.17;
              rf += texture2D(uRefl, suv - vec2(uTexel.x, 0.0)).rgb * 0.17;
              rf += texture2D(uRefl, suv + vec2(0.0, uTexel.y)).rgb * 0.17;
              rf += texture2D(uRefl, suv - vec2(0.0, uTexel.y)).rgb * 0.17;
              // fade with distance from the container footprint (a proxy for reflected height)
              float cr = cos(uRot), sr = sin(uRot);
              vec2 q = vec2(p.x * cr - p.y * sr, p.x * sr + p.y * cr);
              float fd = length(max(abs(q) - uHalf, 0.0));
              col += rf * 0.3 * exp(-fd * 0.62) * (1.0 - smoothstep(2.0, 10.5, r));
            #endif
            gl_FragColor = vec4(col, fade);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`
      });
      const floorGeo = new PlaneGeometry(64, 64);
      floorGeo.rotateX(-Math.PI / 2);
      const floor = new Mesh(floorGeo, floorMat);
      floor.renderOrder = -1;
      scene.add(floor);

      const camera = new PerspectiveCamera(P.fov, 1, 0.1, 140);

      return { renderer, scene, world, kit, container, L, W, H, units, sensorList, scan, beamMat, spillMat, spill, beam, dust, floor, floorMat, rt, shadows, camera, sTemp, sHum };
    }

    /* ---------------------------------------------------------- per-frame state → scene */
    const ptr = { x: 0, y: 0 }, ptrT = { x: 0, y: 0 };
    let cw = 1, ch = 1, fitK = 1;
    const v3 = G ? new THREE.Vector3() : null;

    function applyState(t) {
      const { kit, container, units, L, H } = G;
      container.rotation.y = S.rot + (1 - S.intro) * 0.55;
      kit.leaves.forEach(lf => {
        const k = lf.side > 0 ? S.doorL : S.doorR;
        lf.pivot.rotation.y = -lf.side * ease(k) * OPEN;
        lf.rods.forEach(r => { r.g.rotation.y = r.dir * S.handles * 1.45; });
      });
      kit.lamp.intensity = S.light * 18;
      kit.M.led.color.setRGB(0.25 + S.light * 2.6, 0.3 + S.light * 2.9, 0.34 + S.light * 3.0);
      G.beamMat.uniforms.uAmt.value = S.light * 0.26;
      G.spillMat.uniforms.uAmt.value = S.light * 0.42;

      units.forEach(u => {
        const p = u.st.p;
        const a = ease(clamp(p / 0.5)), b = ease(clamp((p - 0.42) / 0.58));
        const hover = Math.min(1, a * 2.5);
        const x = lerp(lerp(u.P0.x, u.P1.x, a), u.P2.x, b);
        const y = lerp(lerp(u.P0.y, u.P1.y, hover), u.P2.y, b) + Math.sin(t * 1.1 + u.ph) * 0.07 * b;
        const z = lerp(lerp(u.P0.z, u.P1.z, a), u.P2.z, b);
        u.g.position.set(x, y, z);
        u.g.rotation.set(u.R[0] * b + Math.sin(t * 0.7 + u.ph) * 0.03 * b, u.R[1] * b, u.R[2] * b + Math.cos(t * 0.6 + u.ph) * 0.03 * b);
        u.blob.position.set(x, 0.006, z);
        u.blob.rotation.y = u.R[1] * b;
        u.blob.material.opacity = 0.62 * clamp((x - L / 2) / 0.8) * (1 - clamp((y - 0.2) / 6.5));
      });

      const lv = [S.sensors, S.sensors, S.sensors, Math.max(S.seal, S.sensors)];
      G.sensorList.forEach((s, i) => {
        const k = lv[i];
        const pulse = 0.5 + 0.5 * Math.sin(t * 3.2 + s.phase);
        s.halo.material.opacity = k * (0.5 + 0.4 * pulse);
        s.halo.scale.setScalar(s.size * (0.5 + 0.3 * pulse) * (0.3 + 0.7 * k));
        const rp = (t * 0.55 + s.phase) % 1;
        s.ring.material.opacity = k * (1 - rp) * 0.85;
        s.ring.scale.setScalar(s.size * (0.15 + rp * 1.25));
        s.core.scale.setScalar(0.5 + 0.7 * k);
      });
      // GPS LED blinks even when idle
      G.kit.sensors.gps.core.visible = S.sensors > 0.05 || Math.sin(t * 5) > 0.6;

      const sp = (t * 0.16) % 1;
      G.scan.position.x = -L / 2 + sp * L;
      G.scan.material.opacity = S.sensors * 0.8 * Math.sin(sp * Math.PI) + (1 - S.intro) * 0.9;
      if (S.intro < 1) G.scan.position.x = -L / 2 + ease(S.intro) * L;
      G.floorMat.uniforms.uRot.value = container.rotation.y;
      G.floorMat.uniforms.uPulse.value = (t * 0.26) % 1;
      G.floorMat.uniforms.uPulseAmt.value = Math.max(S.sensors, (1 - S.intro) * 0.8);
      G.dust.rotation.y = t * 0.012;
      G.dust.position.y = Math.sin(t * 0.3) * 0.15;
    }

    function placeCamera() {
      const cam = G.camera;
      const d = S.dist * fitK * (1 + (1 - ease(S.intro)) * 0.22);
      const az = ptr.x * 0.09, el = S.el + ptr.y * 0.035;
      cam.position.set(S.tx + Math.sin(az) * Math.cos(el) * d, S.ty + Math.sin(el) * d, S.tz + Math.cos(az) * Math.cos(el) * d);
      cam.lookAt(S.tx, S.ty, S.tz);
    }

    function render() {
      const { renderer, scene, camera, world, rt } = G;
      if (rt) {
        G.floor.visible = false; G.shadows.visible = false; G.dust.visible = false; G.spill.visible = false;
        world.scale.y = -1;
        renderer.setRenderTarget(rt);
        renderer.clear();
        renderer.render(scene, camera);
        world.scale.y = 1;
        G.floor.visible = true; G.shadows.visible = true; G.dust.visible = true; G.spill.visible = true;
        renderer.setRenderTarget(null);
      }
      renderer.render(scene, camera);
    }

    const boxes = [];
    function updateCallouts() {
      const cam = G.camera;
      boxes.length = 0;
      coDefs.forEach((c, i) => {
        const v = c.st.v, leader = leaders[i];
        c.vis = false;
        if (v < 0.003 || !c.anchor) {
          if (c.on) { c.on = false; c.el.style.visibility = 'hidden'; c.el.style.opacity = '0'; leader.style.strokeDashoffset = '1'; }
          return;
        }
        c.anchor.getWorldPosition(v3);
        v3.project(cam);
        if (v3.z > 1) return;
        c.ax = (v3.x * 0.5 + 0.5) * cw; c.ay = (-v3.y * 0.5 + 0.5) * ch;
        c.left = clamp(c.ox < 0 ? c.ax + c.ox - c.w : c.ax + c.ox, 12, Math.max(12, cw - c.w - 12));
        c.top = clamp(c.ay + c.oy - c.h / 2, topMin, Math.max(topMin, ch - c.h - botMin));
        c.vis = true;
        boxes.push(c);
      });
      // keep cards from stacking on top of each other
      boxes.sort((a, b) => a.top - b.top);
      for (let i = 1; i < boxes.length; i++) {
        for (let j = 0; j < i; j++) {
          const a = boxes[j], b = boxes[i];
          const xo = a.left < b.left + b.w + 8 && b.left < a.left + a.w + 8;
          if (xo && b.top < a.top + a.h + 10) b.top = a.top + a.h + 10;
        }
      }
      coDefs.forEach((c, i) => {
        const leader = leaders[i];
        if (!c.vis) {
          if (c.on && c.st.v >= 0.003) { c.on = false; c.el.style.visibility = 'hidden'; leader.style.strokeDashoffset = '1'; }
          return;
        }
        const v = c.st.v;
        const ex = c.ox < 0 ? c.left + c.w : c.left, ey = c.top + c.h / 2;
        const kx = c.ax + (ex - c.ax) * 0.42;
        c.dot.style.transform = `translate3d(${c.ax.toFixed(1)}px,${c.ay.toFixed(1)}px,0) scale(${(0.3 + 0.7 * v).toFixed(3)})`;
        c.card.style.transform = `translate3d(${(c.left + (1 - v) * (c.ox < 0 ? 26 : -26)).toFixed(1)}px,${c.top.toFixed(1)}px,0)`;
        if (!c.on) { c.on = true; c.el.style.visibility = 'visible'; }
        c.el.style.opacity = Math.min(1, v * 1.35).toFixed(3);
        leader.setAttribute('d', `M${c.ax.toFixed(1)} ${c.ay.toFixed(1)}L${kx.toFixed(1)} ${ey.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`);
        leader.style.strokeDashoffset = (1 - v).toFixed(3);
      });
    }

    /* ---------------------------------------------------------- live telemetry */
    const el = {
      gps: $('[data-flt="gps"]'), temp: $('[data-flt="temp"]'), hum: $('[data-flt="hum"]'),
      humbar: $('[data-flt="humbar"]'), spark: $('[data-flt="spark"]'), clock: $('[data-flt="clock"]'),
      timer: $('.flt-co__timer-fg'), check: $('.flt-co__check')
    };
    const temps = Array.from({ length: 16 }, (_, i) => 4 + Math.sin(i * 0.9) * 0.18);
    let temp = 4.0, hum = 45, lat = 41.3111, lon = 69.2797, nextLive = 0, lastSec = -1, gpsCycle = -1;
    const pad = n => String(n).padStart(2, '0');
    function drawSpark() {
      const lo = 3.5, hi = 4.5;
      el.spark.setAttribute('points', temps.map((v, i) => `${(i * 4).toFixed(1)},${(22 - ((v - lo) / (hi - lo)) * 20).toFixed(1)}`).join(' '));
    }
    function live(t) {
      const now = new Date();
      const sec = now.getSeconds();
      if (sec !== lastSec && el.clock) {
        lastSec = sec;
        el.clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(sec)}`;
      }
      if (S.sensors < 0.01 && S.seal < 0.01) return;
      const ph = (t % 30) / 30, cyc = Math.floor(t / 30);
      if (el.timer) el.timer.style.strokeDashoffset = ph.toFixed(4);
      if (cyc !== gpsCycle) {
        gpsCycle = cyc;
        lat += MU.rand(-0.0009, 0.0012); lon += MU.rand(0.0008, 0.0021);
        if (el.gps) el.gps.textContent = `${MU.fmt(lat, 4)}° N · ${MU.fmt(lon, 4)}° E`;
      }
      if (el.check) el.check.style.strokeDashoffset = (1 - clamp((CO.seal.st.v - 0.4) / 0.6)).toFixed(3);
      if (t < nextLive) return;
      nextLive = t + 1.3;
      temp = clamp(temp + MU.rand(-0.14, 0.14), 3.6, 4.4);
      temps.shift(); temps.push(temp);
      hum = Math.round(clamp(hum + MU.rand(-1, 1), 43, 47));
      if (el.temp) el.temp.textContent = `+${MU.fmt(temp, 1)} °C`;
      if (el.hum) el.hum.textContent = `${hum} %`;
      if (el.humbar) el.humbar.style.transform = `scaleY(${(hum / 100).toFixed(3)})`;
      if (el.spark) drawSpark();
    }
    if (el.spark) drawSpark();

    /* ---------------------------------------------------------- sizing */
    function resize() {
      cw = Math.max(1, stage.clientWidth);
      ch = Math.max(1, stage.clientHeight);
      measure();
      if (!G) return;
      const { renderer, camera, rt, floorMat } = G;
      renderer.setPixelRatio(Math.min(MU.dpr(mob ? 1.5 : 1.6), dprCap));
      renderer.setSize(cw, ch, false);
      const aspect = cw / ch;
      fitK = narrow ? Math.max(0.82, Math.pow(0.47 / aspect, 0.9)) : Math.max(0.94, Math.pow(1.6 / aspect, 0.8));
      camera.setViewOffset(cw, ch, -cw * P.offX, -ch * P.offY, cw, ch);
      camera.updateProjectionMatrix();
      if (rt) {
        const s = renderer.getPixelRatio() * 0.5;
        const rw = Math.max(2, Math.round(cw * s)), rh = Math.max(2, Math.round(ch * s));
        rt.setSize(rw, rh);
        floorMat.uniforms.uTexel.value.set(1.3 / rw, 1.3 / rh);
      }
      renderer.getDrawingBufferSize(floorMat.uniforms.uRes.value);
      if (reduced || !loop || !loop.running) drawFrame(lastT);
    }

    // adaptive quality: if frames stay slow, step the pixel ratio down (never below 1)
    let dprCap = 2, slow = 0, frames = 0;
    function adapt(dt) {
      if (++frames < 40 || dprCap <= 1) return;
      slow = dt > 0.024 ? slow + 1 : Math.max(0, slow - 2);
      if (slow > 90 && G.renderer.getPixelRatio() > 1) {
        dprCap = Math.max(1, G.renderer.getPixelRatio() - 0.3);
        slow = 0; frames = 0;
        resize();
      }
    }

    let lastT = 0;
    function drawFrame(t) {
      if (!G) return;
      lastT = t;
      applyState(t);
      placeCamera();
      render();
      updateCallouts();
    }

    let loop = null;
    if (G) {
      if (!reduced) {
        loop = MU.renderLoop(stage, (t, dt) => {
          ptr.x = MU.damp(ptr.x, ptrT.x, 2.4, dt);
          ptr.y = MU.damp(ptr.y, ptrT.y, 2.4, dt);
          drawFrame(t);
          live(t);
          adapt(dt);
        });
      }
      canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); if (loop) loop.stop(); }, false);
      if (!MU.isTouch && !reduced) {
        stage.addEventListener('pointermove', e => {
          ptrT.x = (e.clientX / cw - 0.5) * 2;
          ptrT.y = (e.clientY / ch - 0.5) * 2;
        });
        stage.addEventListener('pointerleave', () => { ptrT.x = 0; ptrT.y = 0; });
      }
    }
    if ('ResizeObserver' in window) {
      let raf = 0;
      new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(resize); }).observe(stage);
    }
    resize();

    // canvas livery uses the display fonts → repaint once they are guaranteed loaded
    if (G && document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load('800 64px Unbounded', 'ULUGʻBEK'),
        document.fonts.load('700 32px Manrope', 'LOGISTICS'),
        document.fonts.load('600 32px "JetBrains Mono"', 'ULBU 142907 9')
      ]).then(() => { G.kit.redraw(); if (!loop || !loop.running) drawFrame(lastT); }).catch(() => {});
    }

    /* ---------------------------------------------------------- scroll choreography */
    const panes = $$('.flt-pane'), steps = $$('.flt-step'), chips = $$('.flt-chip');
    const counts = $$('[data-flt-count]');
    const story = $('.flt-story');
    const T = [0, 2.0, 4.0, 6.4, 8.4];
    let stageIdx = -1;
    function setStage(time) {
      let idx = 0;
      for (let i = 0; i < T.length; i++) if (time >= T[i] - 0.05) idx = i;
      if (idx === stageIdx) return;
      stageIdx = idx;
      steps.forEach((s, i) => { s.classList.toggle('is-active', i === idx); s.classList.toggle('is-done', i < idx); });
    }
    const cnt = { v: 0 };
    const renderCounts = () => counts.forEach(c => { c.textContent = MU.fmt(Math.round(+c.dataset.fltCount * cnt.v)).replace(/\u202F/g, '\u2009'); });

    const tl = gsap.timeline({ defaults: { ease: 'none' }, paused: true, onUpdate: () => setStage(tl.time()) });
    tl.to(S, Object.assign(cam(P.d1, P.el1, P.rot1, P.t1), { duration: 2.2, ease: 'power2.inOut' }), 0)
      .to(S, { seal: 1, duration: 0.5, ease: 'power2.out' }, 1.9)
      .to(CO.seal.st, { v: 1, duration: 0.7, ease: 'power2.out' }, 2.0)
      .to(S, { handles: 1, duration: 0.6, ease: 'power2.inOut' }, 2.3)
      .to(S, { doorR: 1, duration: 1.3, ease: 'power2.inOut' }, 2.75)
      .to(S, { doorL: 1, duration: 1.3, ease: 'power2.inOut' }, 3.0)
      .to(S, { light: 1, duration: 1.0, ease: 'power1.out' }, 3.05)
      .to(S, Object.assign(cam(P.d2, P.el2, P.rot2, P.t2), { duration: 2.6, ease: 'power2.inOut' }), 3.9);
    if (G) G.units.forEach((u, i) => tl.to(u.st, { p: 1, duration: 1.7, ease: 'power1.inOut' }, 4.0 + i * 0.26));
    tl.to(S, { sensors: 1, duration: 1.0, ease: 'power2.out' }, 6.5);
    [CO.gps, CO.temp, CO.hum].forEach((c, k) => tl.to(c.st, { v: 1, duration: 0.7, ease: 'power2.out' }, 6.7 + k * 0.3));
    tl.to(S, Object.assign(cam(P.d3, P.el3, P.rot3, P.t3), { duration: 1.8, ease: 'power2.inOut' }), 8.2);
    tl.to('#park .flt-hud', { autoAlpha: 0, y: -14, duration: 0.4, ease: 'power2.in' }, 3.7);
    if (narrow && story) tl.to(story, { autoAlpha: 0, y: 24, duration: 0.4, ease: 'power2.in' }, 8.3);
    tl.fromTo(chips, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.6, ease: 'power3.out' }, 8.4);
    tl.to(cnt, { v: 1, duration: 0.8, ease: 'power2.out', onUpdate: renderCounts }, 8.4);
    for (let i = 1; i < panes.length; i++) {
      tl.to(panes[i - 1], { autoAlpha: 0, y: -18, duration: 0.3, ease: 'power2.in' }, T[i] - 0.32);
      tl.fromTo(panes[i], { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, T[i]);
    }
    tl.fromTo('#park .flt-progress i', { scaleX: 0 }, { scaleX: 1, duration: 10 }, 0);
    tl.fromTo('#park .flt-hud__bar i', { scaleX: 0.08 }, { scaleX: 1, duration: 10 }, 0);
    tl.fromTo('#park .flt-bg__dial', { rotation: -8 }, { rotation: 52, duration: 10, transformOrigin: '50% 50%' }, 0);
    tl.fromTo('#park .flt-bg__glow--a', { xPercent: 0, yPercent: 0 }, { xPercent: -24, yPercent: -12, duration: 10 }, 0);
    tl.fromTo('#park .flt-bg__glow--b', { xPercent: 0 }, { xPercent: 40, duration: 10 }, 0);
    tl.to({}, { duration: 0.2 }, 10);

    if (reduced) {
      tl.progress(1);
      S.intro = 1;
      renderCounts();
      setStage(10);
      if (G) drawFrame(0);
    } else {
      ScrollTrigger.create({
        trigger: root, pin: true, start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * P.pin),
        scrub: 1, anticipatePin: 1, animation: tl
      });
      // one-shot entrance: camera settles in while a scan frame sweeps the hull
      const intro = gsap.to(S, { intro: 1, duration: 2.4, ease: 'power3.out', paused: true });
      ScrollTrigger.create({ trigger: root, start: 'top 75%', once: true, onEnter: () => intro.play() });
      ScrollTrigger.addEventListener('refresh', () => { measure(); });
    }
  }
});
