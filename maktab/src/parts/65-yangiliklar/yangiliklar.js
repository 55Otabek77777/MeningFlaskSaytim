/* So’nggi yangiliklar: darhol snapshot (a-news.js) chiziladi, keyin /api/telegram-news so‘raladi —
   jonli oqim snapshot’dan yangiroq bo‘lsagina almashtiriladi (route keshi eskirgan paytda ham sahifa yangi ko‘rinadi). */
MU.part('yangiliklar', {
  init(root) {
    const { gsap } = MU;
    const big = root.querySelector('.ny-big');
    const rowsEl = root.querySelector('.ny-rows');
    const empty = root.querySelector('.ny-empty');
    const OY = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

    /* xom Telegram matni: unicode qalin harflar → oddiy, apostroflar → ’, tinish belgisidan keyin emoji yopishmasin */
    const clean = t => String(t || '').normalize('NFKC').replace(/[\u02BB\u02BC'\u2018`\u00B4]/g, '’')
      .replace(/([.!?:])(\p{Extended_Pictographic})/gu, '$1 $2').replace(/[ \t]+/g, ' ').trim();
    const num = id => parseInt(String(id || '').split('/').pop(), 10) || 0;
    const fmtDate = iso => {
      if (!iso) return '';
      const d = new Date(iso);
      if (isNaN(d)) return '';
      try {
        const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tashkent', day: 'numeric', month: 'numeric', year: 'numeric' })
          .formatToParts(d).map(x => [x.type, x.value]));
        return `${+p.day}-${OY[+p.month - 1]}, ${p.year}`;
      } catch (e) { return `${d.getDate()}-${OY[d.getMonth()]}, ${d.getFullYear()}`; }
    };
    /* sarlavha — birinchi qator yoki birinchi gap (≤ max belgi), qolgani — matn */
    const split = (text, max) => {
      const t = clean(text);
      const nl = t.indexOf('\n');
      let head = nl > 0 ? t.slice(0, nl) : t;
      const m = head.match(/^(.{8,}?[.!?])(\s|$)/u);
      if (m && m[1].length <= max) head = m[1];
      if (head.length > max) {
        const cut = head.slice(0, max);
        head = cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 12)).replace(/[\s,.;:—-]+$/u, '') + '…';
        return { title: head, rest: t };
      }
      return { title: head, rest: t.slice(head.length).replace(/^\s+/, '') };
    };
    const safeLink = l => (/^https:\/\/t\.me\//.test(l || '') ? l : 'https://t.me/ulugbek_rm');
    const safePhoto = u => { try { const url = new URL(u); return url.protocol === 'https:' && /(^|\.)(telesco\.pe|cdn-telegram\.org)$/.test(url.hostname) ? url.href : ''; } catch { return ''; } };
    const img = (src, alt, cls) => {
      const i = document.createElement('img');
      i.alt = alt; i.loading = 'lazy'; i.decoding = 'async'; i.referrerPolicy = 'no-referrer';
      if (cls) i.className = cls;
      i.addEventListener('error', () => { const ph = document.createElement('span'); ph.className = 'ny-ph'; i.replaceWith(ph); }, { once: true });
      i.src = src;
      return i;
    };

    let shownTop = 0, firstPaint = true;
    const render = posts => {
      posts = (posts || []).filter(p => p && (p.text || p.photo)).slice(0, 5);
      if (!posts.length) { big.hidden = true; rowsEl.hidden = true; empty.hidden = false; return; }
      big.hidden = false; rowsEl.hidden = false; empty.hidden = true;
      shownTop = num(posts[0].id);

      const [a, ...rest] = posts;
      const s = split(a.text, 80), link = safeLink(a.link);
      const media = big.querySelector('.ny-big__media');
      media.href = link;
      media.textContent = '';
      const ph = safePhoto(a.photo);
      media.appendChild(ph ? img(ph, s.title) : Object.assign(document.createElement('span'), { className: 'ny-ph' }));
      const t = big.querySelector('.ny-date');
      t.textContent = fmtDate(a.date);
      if (a.date) t.dateTime = a.date; else t.removeAttribute('datetime');
      const ta = big.querySelector('.ny-big__title a');
      ta.textContent = s.title; ta.href = link;
      big.querySelector('.ny-big__text').textContent = s.rest;
      big.querySelector('.ny-read').href = link;

      rowsEl.textContent = '';
      rest.slice(0, 4).forEach(p => {
        const r = split(p.text, 70);
        const li = document.createElement('li');
        li.className = 'ny-row';
        const aEl = document.createElement('a');
        aEl.href = safeLink(p.link); aEl.target = '_blank'; aEl.rel = 'noopener noreferrer';
        const th = document.createElement('span');
        th.className = 'ny-thumb';
        const pp = safePhoto(p.photo);
        th.appendChild(pp ? img(pp, '') : Object.assign(document.createElement('span'), { className: 'ny-ph' }));
        const body = document.createElement('span');
        body.className = 'ny-row__body';
        const tt = document.createElement('span');
        tt.className = 'ny-row__title';
        tt.textContent = r.title || 'Telegram post';
        body.appendChild(tt);
        const d = fmtDate(p.date);
        if (d) { const dt = document.createElement('time'); dt.className = 'ny-date'; dt.dateTime = p.date; dt.textContent = d; body.appendChild(dt); }
        aEl.append(th, body);
        li.appendChild(aEl);
        rowsEl.appendChild(li);
      });

      const rows = rowsEl.children;
      if (MU.reduced) return;
      if (firstPaint) {
        firstPaint = false;
        gsap.from(rows, { y: 12, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: 'mu.out', scrollTrigger: { trigger: rowsEl, start: 'top 88%', once: true } });
      } else {
        gsap.fromTo([big, ...rows], { autoAlpha: 0.2, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'mu.out' });
      }
    };

    const snap = (window.muNews && window.muNews.posts) || [];
    render(snap);

    /* jonli oqim: faqat snapshot’dan yangiroq bo‘lsa almashtiriladi */
    const load = () => fetch('/api/telegram-news', { headers: { accept: 'application/json' } })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        const posts = d && Array.isArray(d.posts) ? d.posts : null;
        if (posts && posts.length && num(posts[0].id) > shownTop) render(posts);
      })
      .catch(() => {});
    const stop = MU.onVisible(root, v => { if (v) { stop(); load(); } }, '600px');
  }
});
