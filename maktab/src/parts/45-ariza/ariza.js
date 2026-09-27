MU.part('ariza', {
  init(root) {
    const { gsap } = MU;
    const form = root.querySelector('.az-form');
    const $ = s => root.querySelector(s);
    const nameI = $('#az-name'), regionS = $('#az-region'), phoneI = $('#az-phone'), hp = $('#az-website');
    const btn = $('.az-submit'), status = $('.az-status');
    const tk = k => root.querySelector(`[data-tk="${k}"]`);

    /* telefon maskasi: +998 | 90 123 45 67 */
    const digits = () => {
      let value = phoneI.value.replace(/\D/g, '');
      if (value.length > 9 && value.startsWith('998')) value = value.slice(3);
      return value.slice(0, 9);
    };
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
    /* jonli saytdagi sinf izohlari (10-sinf; 11-sinf va bitiruvchilar) */
    const gradeNote = $('.az-grade-note');
    const NOTES = {
      '10-sinf': ['is-info', '10-sinf uchun qabul qisman sinov va suhbat asosida amalga oshiriladi.'],
      '11-sinf': ['is-warn', '⚠️ Diqqat: 11-sinf o’quvchilari va bitiruvchilar uchun qabul o’z yo’nalishi bo’yicha sertifikat mavjudligiga bog’liq — barcha nomzodlar ham qabul qilinavermaydi. Aniq ma’lumot uchun mas’ul menejerlar bilan bog’laning: <a href="tel:+998974173777">+998 97 417 37 77</a> / <a href="https://t.me/MirzoUlugbekMaktabi_Admin" target="_blank" rel="noopener noreferrer">@MirzoUlugbekMaktabi_Admin</a>.']
    };
    NOTES['Bitiruvchi (11-sinfni tugatgan)'] = NOTES['11-sinf'];
    const showNote = v => {
      const n = NOTES[v];
      if (!n) { gradeNote.hidden = true; gradeNote.innerHTML = ''; return; }
      gradeNote.className = 'az-grade-note ' + n[0];
      gradeNote.innerHTML = n[1];
      gradeNote.hidden = false;
      if (!MU.reduced) gsap.from(gradeNote, { y: 8, autoAlpha: 0, duration: 0.45, ease: 'mu.out' });
    };
    form.querySelectorAll('input[name="grade"]').forEach(r => r.addEventListener('change', () => {
      setTicket('grade', r.value); check('grade'); showNote(r.value);
      if (!MU.reduced) gsap.fromTo(r.nextElementSibling, { scale: 0.9 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, .4)' });
    }));

    /* validatsiya — API kontrakti bilan bir xil (api/ariza) */
    const fieldOf = k => root.querySelector(`[data-field="${k}"]`);
    const rules = {
      fullName: () => { const v = nameI.value.trim(); return v.length >= 3 && v.length <= 120 ? '' : 'Ism-familiyani to’liq kiriting.'; },
      region: () => (regionS.value ? '' : 'Viloyatni tanlang.'),
      grade: () => (form.querySelector('input[name="grade"]:checked') ? '' : 'Sinfni tanlang.'),
      phone: () => (/^\d{9}$/.test(digits()) ? '' : 'Telefon raqamni to’liq kiriting: +998 90 123 45 67')
    };
    const check = k => {
      const msg = rules[k](), f = fieldOf(k);
      f.classList.toggle('is-invalid', !!msg); f.classList.toggle('is-valid', !msg);
      f.querySelectorAll('input,select').forEach(input => input.setAttribute('aria-invalid', String(!!msg)));
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
    const OY = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    const fmtDate = iso => {
      const d = new Date(iso); if (!iso || isNaN(d)) return '';
      try {
        const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tashkent', day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
          .formatToParts(d).map(x => [x.type, x.value]));
        return `${+p.day}-${OY[+p.month - 1]}, ${p.year}, ${p.hour}:${p.minute}`;
      } catch (e) { return ''; }
    };
    /* 60 soniyalik mijoz tomoni cheklovi — jonli saytdagi kabi localStorage["ariza_last_submit"] */
    const THROTTLE_KEY = 'ariza_last_submit', THROTTLE_MS = 60000;
    const lastSubmit = () => { try { return Number(localStorage.getItem(THROTTLE_KEY) || 0); } catch (e) { return 0; } };
    const markSubmit = () => { try { localStorage.setItem(THROTTLE_KEY, String(Date.now())); } catch (e) { /* jim */ } };
    const BOT = '<a class="az-st__bot" href="https://t.me/mirzorasmiybot?start=web" target="_blank" rel="noopener noreferrer">🤖 Rasmiy botga o’tish</a>';

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
      if (Date.now() - lastSubmit() < THROTTLE_MS) { say('is-warn', 'Iltimos, bir daqiqadan so’ng qayta urinib ko’ring.'); return; }
      setBtn('load');
      let res, data = {};
      try {
        const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 15000);
        res = await fetch('/api/ariza', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctrl.signal });
        clearTimeout(tm);
        data = await res.json().catch(() => ({}));
      } catch (err) {
        setBtn('idle');
        say('is-err', 'Xatolik yuz berdi. Iltimos, qayta urinib ko’ring yoki telefon orqali bog’laning: <a href="tel:+998974173777">+998 97 417 37 77</a>.');
        return;
      }
      if (res.ok && data.ok) markSubmit();
      if (res.ok && data.ok && data.duplicate) {
        setBtn('ok'); stamp();
        const when = fmtDate(data.createdAt);
        say('is-info', `<b class="az-st__title">Siz allaqachon ro’yxatdan o’tgansiz</b><p>${when ? `Arizangiz avval, ${when}da qabul qilingan.` : 'Arizangiz avval qabul qilingan.'} Qayta yuborish shart emas — menejerlarimiz bilan bog’lanasiz.</p><p class="az-st__sub">Ma’lumotlaringizni to’g’rilash kerak bo’lsa yoki xabarnomalarni kuzatib borish uchun rasmiy botimizga o’ting 👇</p>${BOT}<p class="az-st__sub">Savol bo’lsa: <a href="tel:+998974173777">+998 97 417 37 77</a></p>`);
      } else if (res.ok && data.ok) {
        setBtn('ok'); stamp();
        say('is-ok', `<b class="az-st__title">Arizangiz qabul qilindi ✅</b><p>Tez orada menejerlarimiz siz bilan bog’lanadi.</p><p class="az-st__sub">So’nggi yangiliklar, natijalar va savollaringizga javob olish uchun rasmiy botimizga o’ting 👇</p>${BOT}`);
      } else if (res.status === 429 || data.error === 'rate_limited') {
        setBtn('idle');
        say('is-warn', 'Iltimos, bir daqiqadan so’ng qayta urinib ko’ring.');
      } else {
        setBtn('idle');
        say('is-err', 'Xatolik yuz berdi. Iltimos, qayta urinib ko’ring yoki telefon orqali bog’laning: <a href="tel:+998974173777">+998 97 417 37 77</a>.');
      }
    });

    /* «Qabul qilindi» muhri */
    const stamp = () => {
      const s = $('.az-ticket__stamp'); if (!s) return;
      if (MU.reduced) { gsap.set(s, { opacity: 0.9, scale: 1 }); return; }
      gsap.fromTo(s, { opacity: 0, scale: 2.4, rotation: -14 }, { opacity: 0.9, scale: 1, rotation: -14, duration: 0.45, ease: 'power4.in',
        onComplete: () => gsap.fromTo(s.parentElement, { x: -3 }, { x: 0, duration: 0.3, ease: 'elastic.out(1, .3)' }) });
    };

  }
});
