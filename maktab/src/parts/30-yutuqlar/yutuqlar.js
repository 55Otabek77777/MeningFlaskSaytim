/* Yutuqlar — jonli saytdagi AchievementsCarousel + AchievementsClock mantiqi:
   har 3 soniyada (soat sekund strelkasi bilan bir ritmda) keyingi sertifikat, faqat ±3 ta karta chiziladi,
   rasm yuklanmaguncha almashmaydi (6 s cheklov), izoh markazdan o‘tish paytida (20%) almashadi. */
MU.part('yutuqlar', {
  init(root) {
    const { gsap } = MU;
    MU.nums(root);
    const D = window.muCerts || { base: '', list: [] };
    const ALL = D.list.map((c, i) => ({ id: i, name: c[0], subject: c[1], grade: c[2], src: D.base + c[3], w: c[4], h: c[5] }));
    const ORDER = ['Kimyo', 'Biologiya', 'Matematika', 'Fizika', 'Ingliz tili', 'Ona tili va adabiyot', 'Tarix'];
    const RENDER = 3, TR = 520, SWAP = Math.round(TR * 0.2);
    const SCALE = [1, 0.66, 0.48, 0.36], OPAC = [1, 0.5, 0.24, 0.08], BLUR = [0, 2, 3.6, 5.5];
    const stage = root.querySelector('.yt-stage');
    const track = root.querySelector('.yt-track');
    const nameEl = root.querySelector('.yt-caption__name');
    const metaEl = root.querySelector('.yt-caption__meta');
    const capIn = root.querySelector('.yt-caption__in');
    const bar = root.querySelector('.yt-bar');
    const countEl = root.querySelector('.yt-count');
    const filterEl = root.querySelector('.yt-filter');
    if (!ALL.length) { root.querySelector('.yt-show').hidden = true; return; }

    const alt = c => `${c.name} — ${c.subject} fanidan ${c.grade} darajali sertifikat`;
    let items = ALL, cards = [], index = 0, capTimer = 0, lastAdvance = 0, hover = false, dragging = false, visible = false;
    let paused = MU.reduced;
    const pause = root.querySelector('.yt-pause');
    const syncPause = () => {
      pause.setAttribute('aria-pressed', String(paused));
      pause.textContent = MU.t(paused ? 'Almashishni davom ettirish' : 'Almashishni to’xtatish');
    };
    pause.addEventListener('click', () => { paused = !paused; syncPause(); });
    syncPause();

    /* ---------- kartalar */
    const build = () => {
      track.textContent = '';
      cards = items.map(c => {
        const a = document.createElement('a');
        a.className = 'yt-cert is-off';
        a.href = '/yutuqlar';
        a.tabIndex = -1;
        a.setAttribute('aria-label', MU.t(`${alt(c)} — kattalashtirish`));
        a.setAttribute('aria-haspopup', 'dialog');
        a.addEventListener('click', e => { if (moved) return; e.preventDefault(); MU.viewPhoto(c.src, alt(c)); });
        a.innerHTML = `<span class="yt-cert__frame"><img alt="" width="${c.w}" height="${c.h}" decoding="async" draggable="false"><span class="yt-cert__sheen"></span></span>`;
        const img = a.querySelector('img');
        img.alt = alt(c);
        img.addEventListener('load', () => { c.loaded = true; }, { once: true });
        img.addEventListener('error', () => { c.loaded = true; a.classList.add('is-broken'); }, { once: true });
        track.appendChild(a);
        return { el: a, img, c };
      });
    };
    const posOf = i => {
      const n = items.length;
      let p = i - index;
      if (p > n / 2) p -= n;
      if (p < -n / 2) p += n;
      return p;
    };
    const layout = () => {
      const n = items.length;
      cards.forEach((k, i) => {
        const p = posOf(i), a = Math.abs(p);
        if (visible && a <= RENDER && !k.img.hasAttribute('src')) k.img.src = k.c.src;
        k.el.tabIndex = p === 0 ? 0 : -1;
        k.el.setAttribute('aria-hidden', String(p !== 0));
        if (a > RENDER) { k.el.classList.add('is-off'); k.el.classList.remove('is-center'); return; }
        k.el.classList.remove('is-off');
        k.el.classList.toggle('is-center', p === 0);
        k.el.tabIndex = p === 0 ? 0 : -1;
        k.el.style.zIndex = 30 - a;
        k.el.style.pointerEvents = p === 0 ? 'auto' : 'none';
        k.el.style.opacity = OPAC[a];
        k.el.style.filter = BLUR[a] ? `blur(${BLUR[a]}px)` : 'none';
        k.el.style.transform = MU.reduced
          ? `translate(-50%, -50%) translateX(${p * 38}%) scale(${SCALE[a]})`
          : `translate(-50%, -50%) translateX(${p * 38}%) scale(${SCALE[a]}) rotateY(${p * -13}deg)`;
      });
      const pct = n > 1 ? ((index + 1) / n) * 100 : 100;
      bar.style.setProperty('--p', pct + '%');
      bar.setAttribute('aria-valuemax', n);
      bar.setAttribute('aria-valuenow', index + 1);
      bar.setAttribute('aria-valuetext', `${index + 1} / ${n}`);
      countEl.textContent = `${index + 1} / ${n}`;
    };
    const caption = (instant) => {
      clearTimeout(capTimer);
      const c = items[index];
      const put = () => {
        nameEl.textContent = c.name;
        metaEl.textContent = `${c.subject} · ${c.grade} daraja`;
        if (!instant && !MU.reduced) gsap.fromTo(capIn, { yPercent: 35, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: 'mu.out', overwrite: true });
      };
      if (instant) put(); else capTimer = setTimeout(put, SWAP);
    };
    const sheen = () => {
      const k = cards[index];
      if (!k || MU.reduced) return;
      k.el.classList.remove('is-sheen');
      void k.el.offsetWidth;
      k.el.classList.add('is-sheen');
    };
    const go = (to, opts = {}) => {
      const n = items.length;
      if (!n) return;
      index = ((to % n) + n) % n;
      lastAdvance = Date.now();
      layout();
      caption(opts.instant);
      if (!opts.instant) sheen();
    };

    /* ---------- fan bo‘yicha saralash */
    const subjects = ORDER.filter(s => ALL.some(c => c.subject === s));
    ALL.forEach(c => { if (!subjects.includes(c.subject)) subjects.push(c.subject); });
    const chips = ['Barchasi'].concat(subjects).map(s => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'yt-chip';
      b.textContent = s;
      b.setAttribute('aria-pressed', String(s === 'Barchasi'));
      b.addEventListener('click', () => {
        if (b.getAttribute('aria-pressed') === 'true') return;
        chips.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        items = s === 'Barchasi' ? ALL : ALL.filter(c => c.subject === s);
        const swap = () => { build(); index = 0; layout(); caption(true); };
        if (MU.reduced) { swap(); return; }
        gsap.to(track, { autoAlpha: 0, scale: 0.96, duration: 0.22, ease: 'power2.in', onComplete() {
          swap();
          gsap.fromTo(track, { autoAlpha: 0, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'mu.out' });
          gsap.fromTo(capIn, { yPercent: 35, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: 'mu.out' });
        } });
        lastAdvance = Date.now();
      });
      filterEl.appendChild(b);
      return b;
    });

    build();
    layout();
    caption(true);

    /* ---------- boshqaruv: tugmalar, klaviatura, surish, progress */
    root.querySelectorAll('.yt-arrow').forEach(b => b.addEventListener('click', () => go(index + (+b.dataset.dir))));
    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    });
    stage.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
    stage.addEventListener('pointerleave', () => { hover = false; });
    let sx = 0, sy = 0, moved = false, swiping = false;
    stage.addEventListener('pointerdown', e => {
      if (e.target.closest('.yt-arrow')) return;
      swiping = true; moved = false; sx = e.clientX; sy = e.clientY;
    });
    window.addEventListener('pointermove', e => {
      if (!swiping) return;
      if (Math.abs(e.clientX - sx) > 8 && Math.abs(e.clientX - sx) > Math.abs(e.clientY - sy)) { moved = true; stage.classList.add('is-drag'); }
    }, { passive: true });
    window.addEventListener('pointerup', e => {
      if (!swiping) return;
      swiping = false;
      stage.classList.remove('is-drag');
      const dx = e.clientX - sx;
      if (moved && Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    });
    window.addEventListener('pointercancel', () => { swiping = false; stage.classList.remove('is-drag'); });
    stage.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } }, true);

    const seek = x => {
      const r = bar.getBoundingClientRect(), n = items.length;
      if (n < 2) return;
      const i = Math.round(MU.clamp((x - r.left) / r.width, 0, 1) * (n - 1));
      if (i !== index) go(i, { instant: true });
    };
    bar.addEventListener('pointerdown', e => { dragging = true; bar.classList.add('is-drag'); bar.setPointerCapture(e.pointerId); seek(e.clientX); });
    bar.addEventListener('pointermove', e => { if (dragging) seek(e.clientX); });
    const endDrag = () => { if (!dragging) return; dragging = false; bar.classList.remove('is-drag'); lastAdvance = Date.now(); };
    bar.addEventListener('pointerup', endDrag);
    bar.addEventListener('pointercancel', endDrag);
    bar.addEventListener('keydown', e => {
      const map = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
      if (e.key in map) { e.preventDefault(); go(index + map[e.key], { instant: true }); }
      if (e.key === 'Home') { e.preventDefault(); go(0, { instant: true }); }
      if (e.key === 'End') { e.preventDefault(); go(items.length - 1, { instant: true }); }
    });

    /* markaziy kartani sichqoncha bilan yengil og‘dirish */
    if (!MU.isTouch && !MU.reduced) {
      stage.addEventListener('pointermove', e => {
        const k = cards[index];
        if (!k) return;
        const r = stage.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(k.el.firstChild, { rotationY: nx * 10, rotationX: -ny * 8, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
      });
      stage.addEventListener('pointerleave', () => gsap.to(track.querySelectorAll('.yt-cert__frame'), { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'power3.out', overwrite: 'auto' }));
    }

    /* ---------- soat */
    const marks = root.querySelector('.yt-clock__marks');
    let html = '';
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) {
        const a = (i * 6 * Math.PI) / 180, n = i / 5;
        html += `<b style="left:${(175 + Math.sin(a) * 145 - 15).toFixed(2)}px;top:${(175 - Math.cos(a) * 145 - 10).toFixed(2)}px">${n === 0 ? 12 : n}</b>`;
      } else html += `<i style="transform:rotate(${i * 6}deg)"></i>`;
    }
    marks.innerHTML = html;
    const hH = root.querySelector('.yt-hand--h'), hM = root.querySelector('.yt-hand--m'), hS = root.querySelector('.yt-hand--s');
    let base = null;
    const tick = () => {
      const ms = Date.now(), total = Math.floor(ms / 1000), d = new Date(ms);
      const h = d.getHours() % 12, m = d.getMinutes(), s = d.getSeconds();
      hH.style.transform = `rotate(${h * 30 + (m / 60) * 30}deg)`;
      hM.style.transform = `rotate(${m * 6 + (s / 60) * 6}deg)`;
      if (!base) {
        base = { sec: total, angle: s * 6 };
        hS.classList.add('no-tr');
        hS.style.transform = `rotate(${base.angle}deg)`;
        void hS.offsetWidth;
        hS.classList.remove('no-tr');
      } else hS.style.transform = `rotate(${base.angle + (total - base.sec) * 6}deg)`;
    };
    tick();

    /* ---------- ritm: soat har soniyada, sertifikat har 3 soniyada */
    const advance = () => {
      if (paused || document.hidden || document.querySelector('dialog[open]') || root.contains(document.activeElement) || dragging || hover || swiping || items.length <= 1) return;
      const next = (index + 1) % items.length;
      if (!items[next].loaded && Date.now() - lastAdvance < 6000) return;
      go(next);
    };
    let raf = 0, lastSec = -1, lastBucket = -1;
    const loop = () => {
      const now = Date.now(), sec = Math.floor(now / 1000), bucket = Math.floor(now / 3000);
      if (sec !== lastSec) { lastSec = sec; tick(); }
      if (bucket !== lastBucket) { if (lastBucket !== -1) advance(); lastBucket = bucket; }
      raf = requestAnimationFrame(loop);
    };
    MU.onVisible(root, v => {
      visible = v;
      if (v) layout();
      root.classList.toggle('is-inview', v && !MU.reduced);
      cancelAnimationFrame(raf);
      if (v) { lastBucket = -1; base = null; tick(); raf = requestAnimationFrame(loop); }
    });

    /* ---------- kirish: kartalar markazdan yelpig‘ich bo‘lib yoyiladi */
    if (!MU.reduced && window.ScrollTrigger) {
      stage.classList.add('is-pre');
      ScrollTrigger.create({
        trigger: stage, start: 'top 80%', once: true,
        onEnter() {
          cards.forEach(k => { k.el.style.transitionDelay = `${Math.abs(posOf(cards.indexOf(k))) * 90}ms`; });
          stage.classList.remove('is-pre');
          setTimeout(() => cards.forEach(k => { k.el.style.transitionDelay = ''; }), 1200);
          lastAdvance = Date.now();
          sheen();
        }
      });
    }
  }
});
