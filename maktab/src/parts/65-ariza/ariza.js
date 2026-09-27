MU.part('ariza', {
  init(root) {
    const { gsap } = MU;
    const form = root.querySelector('.az-form');
    const $ = s => root.querySelector(s);
    const nameI = $('#az-name'), regionS = $('#az-region'), phoneI = $('#az-phone'), hp = $('#az-website');
    const btn = $('.az-submit'), status = $('.az-status');
    const tk = k => root.querySelector(`[data-tk="${k}"]`);

    /* telefon maskasi: +998 | 90 123 45 67 */
    const digits = () => phoneI.value.replace(/\D/g, '').slice(0, 9);
    const fmtPhone = d => [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');
    phoneI.addEventListener('input', () => {
      phoneI.value = fmtPhone(digits());
      setTicket('phone', '+998 ' + phoneI.value);
      if (fieldOf('phone').classList.contains('is-invalid')) check('phone');
    });

    /* jonli ariza varaqasi */
    const setTicket = (k, v) => {
      const el = tk(k); if (!el) return;
      const text = v && v.trim() ? v : (k === 'phone' ? '+998' : '—');
      if (el.textContent === text) return;
      el.textContent = text;
      if (!MU.reduced) gsap.fromTo(el, { color: '#3b5bdb', y: 4 }, { color: '#0f172a', y: 0, duration: 0.5, ease: 'mu.out', overwrite: true });
    };
    nameI.addEventListener('input', () => { setTicket('fullName', nameI.value); if (fieldOf('fullName').classList.contains('is-invalid')) check('fullName'); });
    regionS.addEventListener('change', () => { regionS.closest('.az-field').classList.add('is-filled'); setTicket('region', regionS.value); check('region'); });
    form.querySelectorAll('input[name="grade"]').forEach(r => r.addEventListener('change', () => {
      setTicket('grade', r.value); check('grade');
      if (!MU.reduced) gsap.fromTo(r.nextElementSibling, { scale: 0.9 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, .4)' });
    }));

    /* validatsiya — API kontrakti bilan bir xil (api/ariza) */
    const fieldOf = k => root.querySelector(`[data-field="${k}"]`);
    const rules = {
      fullName: () => { const v = nameI.value.trim(); return v.length >= 3 && v.length <= 120 ? '' : 'Ism-familiyani to’liq yozing (kamida 3 harf).'; },
      region: () => (regionS.value ? '' : 'Viloyatni tanlang.'),
      grade: () => (form.querySelector('input[name="grade"]:checked') ? '' : 'Sinfni tanlang.'),
      phone: () => (/^\d{9}$/.test(digits()) ? '' : 'Telefon raqamini to’liq kiriting: +998 va 9 ta raqam.')
    };
    const check = k => {
      const msg = rules[k](), f = fieldOf(k);
      f.classList.toggle('is-invalid', !!msg); f.classList.toggle('is-valid', !msg);
      f.querySelector('.az-err').textContent = msg;
      return !msg;
    };
    nameI.addEventListener('blur', () => nameI.value && check('fullName'));
    phoneI.addEventListener('blur', () => phoneI.value && check('phone'));

    const shake = el => { if (!MU.reduced) gsap.fromTo(el, { x: 0 }, { keyframes: { x: [-10, 9, -7, 5, -2, 0] }, duration: 0.5, ease: 'none' }); };
    const setBtn = mode => {
      const label = $('.az-submit__label'), spin = $('.az-submit__spin'), ok = $('.az-submit__check');
      gsap.to(label, { autoAlpha: mode === 'idle' ? 1 : 0, y: mode === 'idle' ? 0 : -14, duration: 0.3 });
      gsap.to(spin, { autoAlpha: mode === 'load' ? 1 : 0, duration: 0.3 });
      gsap.to(ok, { autoAlpha: mode === 'ok' ? 1 : 0, scale: mode === 'ok' ? 1 : 0.4, duration: 0.5, ease: 'back.out(2.5)' });
      btn.disabled = mode !== 'idle';
      btn.style.background = mode === 'ok' ? '#16a34a' : '';
    };
    const say = (cls, html) => { status.className = 'az-status ' + cls; status.innerHTML = html; if (!MU.reduced) gsap.from(status, { y: 12, autoAlpha: 0, duration: 0.5 }); };
    const fmtDate = iso => {
      const d = new Date(iso); if (isNaN(d)) return '';
      const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
        .formatToParts(d).map(x => [x.type, x.value]));
      return `${p.day}.${p.month}.${p.year}, ${p.hour}:${p.minute}`;
    };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      status.textContent = ''; status.className = 'az-status';
      const bad = Object.keys(rules).filter(k => !check(k));
      if (bad.length) { bad.forEach(k => shake(fieldOf(k))); const f = fieldOf(bad[0]).querySelector('input, select'); if (f) f.focus(); return; }
      const payload = {
        fullName: nameI.value.trim(), region: regionS.value,
        grade: form.querySelector('input[name="grade"]:checked').value,
        phone: '+998' + digits(), website: hp.value
      };
      setBtn('load');
      let res, data = {};
      try {
        const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 15000);
        res = await fetch('/api/ariza', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctrl.signal });
        clearTimeout(tm);
        data = await res.json().catch(() => ({}));
      } catch (err) {
        setBtn('idle');
        say('is-err', 'Internet aloqasi bo’lmadi. Iltimos, qayta urinib ko’ring yoki qo’ng’iroq qiling: <a href="tel:+998974173777">+998 97 417 37 77</a>.');
        return;
      }
      if (res.ok && data.ok && data.duplicate) {
        setBtn('ok'); stamp();
        const when = fmtDate(data.createdAt);
        say('is-warn', `Arizangiz ${when ? when + ' da' : 'avvalroq'} qabul qilingan. Menejerimiz siz bilan albatta bog’lanadi — qayta yuborish shart emas.`);
      } else if (res.ok && data.ok) {
        setBtn('ok'); stamp(); confetti();
        say('is-ok', 'Arizangiz qabul qilindi! Admin yoki menejerimiz 24 soat ichida siz bilan bog’lanadi.');
      } else if (res.status === 429 || data.error === 'rate_limited') {
        setBtn('idle');
        say('is-warn', 'Biroz kuting — qisqa vaqtda juda ko’p urinish bo’ldi. 10 daqiqadan so’ng qayta yuboring yoki qo’ng’iroq qiling: <a href="tel:+998974173777">+998 97 417 37 77</a>.');
      } else {
        setBtn('idle');
        say('is-err', 'Ma’lumotlarni tekshirib, qayta yuboring. Muammo davom etsa, qo’ng’iroq qiling: <a href="tel:+998974173777">+998 97 417 37 77</a>.');
      }
    });

    /* «Qabul qilindi» muhri */
    const stamp = () => {
      const s = $('.az-ticket__stamp'); if (!s) return;
      if (MU.reduced) { gsap.set(s, { opacity: 0.9, scale: 1 }); return; }
      gsap.fromTo(s, { opacity: 0, scale: 2.4, rotation: -14 }, { opacity: 0.9, scale: 1, rotation: -14, duration: 0.45, ease: 'power4.in',
        onComplete: () => gsap.fromTo(s.parentElement, { x: -3 }, { x: 0, duration: 0.3, ease: 'elastic.out(1, .3)' }) });
    };

    /* yulduzcha konfetti */
    const cv = $('.az-confetti'), ctx = cv.getContext('2d');
    const confetti = () => {
      if (MU.reduced) return;
      const r = cv.getBoundingClientRect(), d = MU.dpr(2);
      cv.width = r.width * d; cv.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      const cx = r.width / 2, cy = r.height - 110;
      const COLORS = ['#dc2626', '#3b5bdb', '#1e3a8a', '#c98a1b', '#e0a526'];
      const ps = Array.from({ length: 90 }, () => ({ x: cx, y: cy, vx: MU.rand(-7, 7), vy: MU.rand(-13, -5), r: MU.rand(3, 7), a: MU.rand(0, 6.28), va: MU.rand(-0.2, 0.2), c: COLORS[Math.floor(Math.random() * 5)], star: Math.random() < 0.45 }));
      let life = 0;
      const tick = () => {
        life++; ctx.clearRect(0, 0, r.width, r.height);
        ps.forEach(p => {
          p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, 1 - life / 110);
          if (p.star) { ctx.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? p.r * 0.45 : p.r * 1.4, t = (i / 8) * Math.PI * 2; ctx.lineTo(Math.cos(t) * rr, Math.sin(t) * rr); } ctx.fill(); }
          else ctx.fillRect(-p.r / 2, -p.r, p.r, p.r * 2);
          ctx.restore();
        });
        if (life < 110) requestAnimationFrame(tick); else ctx.clearRect(0, 0, r.width, r.height);
      };
      tick();
    };
  }
});
