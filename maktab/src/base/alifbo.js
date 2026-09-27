/* ==========================================================================
   Yangi o’zbek alifbosi (Senat 10.09.2026 da ma’qullagan): Sh→Ş, Ch→Ç, O‘→Ö, G‘→Ğ; tutuq belgisi ’ qoladi.
   Manba matnlar joriy alifboda yoziladi; build statik HTML’ni yangi alifboga o’giradi, sahifada esa
   MutationObserver dinamik matnni (yangiliklar, chat, forma xabarlari …) tanlangan alifboga moslaydi.
   Tugma orqali «Joriy» alifboga qaytish mumkin (localStorage «mu_alifbo»).
   Himoya: URL, domen, @handle, email, #xeshteg o’zgarmaydi; [data-raw] ichidagi matn ham.
   Bu fayl ham brauzerda (window.MUAlifbo), ham build’da (globalThis.MUAlifbo) ishlaydi.
   ========================================================================== */
(function (root) {
  const AP = '[\'’‘\u02BB\u02BC`´]';
  const RE_O = new RegExp('([Oo])' + AP, 'g');
  const RE_G = new RegExp('([Gg])' + AP, 'g');
  const PROTECT = /(https?:\/\/[^\s<>"«»]+|www\.[^\s<>"«»]+|[\w.+-]+@[\w-]+\.[\w.]+|@[A-Za-z0-9_]{3,}|#[A-Za-z0-9_]+|\b[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.(?:app|com|uz|org|me|net|io)\b(?:\/[^\s<>"«»]*)?)/g;
  const NEED_NEW = /[OoGg]['’‘\u02BB\u02BC`´]|[Ss][Hh]|[Cc][Hh]/;
  const NEED_OLD = /[ÖöĞğŞşÇç]/;
  const up = (s, i) => { const n = s.charAt(i); return n && n === n.toUpperCase() && n !== n.toLowerCase(); };

  function segNew(s) {
    return s.replace(RE_O, (m, o) => (o === 'O' ? 'Ö' : 'ö'))
      .replace(RE_G, (m, g) => (g === 'G' ? 'Ğ' : 'ğ'))
      .replace(/S[Hh]/g, 'Ş').replace(/s[Hh]/g, 'ş')
      .replace(/C[Hh]/g, 'Ç').replace(/c[Hh]/g, 'ç');
  }
  function segOld(s) {
    return s.replace(/[ÖöĞğŞşÇç]/g, (ch, i, str) => {
      const U = up(str, i + 1) || (up(str, i - 1) && !/[a-zа-я]/.test(str.charAt(i + 1)));
      switch (ch) {
        case 'Ö': return 'O’';
        case 'ö': return 'o’';
        case 'Ğ': return 'G’';
        case 'ğ': return 'g’';
        case 'Ş': return U ? 'SH' : 'Sh';
        case 'ş': return 'sh';
        case 'Ç': return U ? 'CH' : 'Ch';
        default: return 'ch';
      }
    });
  }
  const guard = (s, fn, need) => {
    if (!s || !need.test(s)) return s;
    return s.split(PROTECT).map((seg, i) => (i % 2 ? seg : fn(seg))).join('');
  };
  const api = {
    toNew: s => guard(s, segNew, NEED_NEW),
    toOld: s => guard(s, segOld, NEED_OLD),
    ATTRS: ['alt', 'title', 'aria-label', 'placeholder', 'data-text', 'aria-valuetext', 'aria-roledescription'],
    mode: 'yangi'
  };
  api.conv = s => (api.mode === 'yangi' ? api.toNew(s) : api.toOld(s));

  /* ---- build: statik HTML (matn tugunlari + ruxsat etilgan atributlar), script/style/izohlarga tegmaydi */
  api.html = (html, fn = api.toNew) => {
    const VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i;
    let raw = null; /* {tag, depth} — [data-raw] elementi ichida hech narsa o’zgarmaydi */
    return html.split(/(<!--[\s\S]*?-->|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>)/gi).map((part, i) => {
      if (!(i % 2)) return raw ? part : fn(part);
      if (part.startsWith('<!--') || /^<(script|style)/i.test(part)) return part;
      const m = part.match(/^<(\/?)([a-z0-9-]+)/i);
      if (raw) {
        if (m && m[2].toLowerCase() === raw.tag && !/\/>$/.test(part)) raw.depth += m[1] ? -1 : 1;
        if (raw.depth <= 0) raw = null;
        return part;
      }
      if (m && !m[1] && /\sdata-raw[\s=>]/.test(part)) {
        if (!VOID.test(m[2]) && !/\/>$/.test(part)) raw = { tag: m[2].toLowerCase(), depth: 1 };
        return part;
      }
      return part.replace(/(\s(?:alt|title|aria-label|placeholder|data-text|aria-roledescription)=")([^"]*)(")/g, (x, a, v, b) => a + fn(v) + b);
    }).join('');
  };

  /* ---- brauzer */
  if (typeof document !== 'undefined' && document.documentElement) {
    let stored = null;
    try { stored = localStorage.getItem('mu_alifbo'); } catch (e) { /* jim */ }
    api.mode = stored === 'joriy' ? 'joriy' : 'yangi';
    const SKIP = 'script,style,textarea,input,[data-raw],noscript';
    const fixText = n => {
      const p = n.parentElement;
      if (!p || p.closest(SKIP)) return;
      const v = n.nodeValue, c = api.conv(v);
      if (c !== v) n.nodeValue = c;
    };
    const fixAttrs = el => {
      if (el.closest && el.closest('[data-raw]')) return;
      for (const a of api.ATTRS) {
        const v = el.getAttribute(a);
        if (v) { const c = api.conv(v); if (c !== v) el.setAttribute(a, c); }
      }
    };
    const walk = rootEl => {
      if (!rootEl) return;
      if (rootEl.nodeType === 3) { fixText(rootEl); return; }
      if (rootEl.nodeType !== 1) return;
      const tw = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
      let n; while ((n = tw.nextNode())) fixText(n);
      fixAttrs(rootEl);
      rootEl.querySelectorAll('[' + api.ATTRS.join('],[') + ']').forEach(fixAttrs);
    };
    api.apply = () => walk(document.body);
    api.set = m => {
      api.mode = m === 'joriy' ? 'joriy' : 'yangi';
      try { localStorage.setItem('mu_alifbo', api.mode); } catch (e) { /* jim */ }
      document.documentElement.dataset.alifbo = api.mode;
      api.apply();
      document.dispatchEvent(new CustomEvent('mu:alifbo', { detail: api.mode }));
    };
    document.documentElement.dataset.alifbo = api.mode;
    api.apply();
    const mo = new MutationObserver(list => {
      for (const r of list) {
        if (r.type === 'characterData') fixText(r.target);
        else if (r.type === 'attributes') fixAttrs(r.target);
        else r.addedNodes.forEach(walk);
      }
    });
    mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: api.ATTRS });
  }
  root.MUAlifbo = api;
})(typeof window !== 'undefined' ? window : globalThis);
