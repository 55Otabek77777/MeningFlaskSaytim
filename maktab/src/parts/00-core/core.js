/* Oddiy sanoq (ming ajratkichsiz, masalan «1560+»). Har qism o’z init()ida MU.nums(root) chaqiradi. */
MU.countUp = (el, to, { duration = 2.2, delay = 0, suffix = '', on = 'scroll', start = 'top 90%', decimals = 0 } = {}) => {
  const o = { v: 0 };
  const render = () => { el.textContent = (decimals ? o.v.toFixed(decimals) : Math.round(o.v)) + suffix; };
  if (MU.reduced) { o.v = to; render(); return; }
  render();
  const tw = MU.gsap.to(o, { v: to, duration, delay, ease: 'power3.out', onUpdate: render, paused: true });
  if (on === 'reveal') MU.on('reveal', () => tw.play());
  else MU.ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => tw.play() });
};
MU.nums = root => root.querySelectorAll('[data-num]').forEach(el => MU.countUp(el, parseFloat(el.dataset.num), {
  duration: parseFloat(el.dataset.numDuration || 2.2), delay: parseFloat(el.dataset.numDelay || 0),
  suffix: el.dataset.numSuffix || '', on: el.dataset.numOn || 'scroll', decimals: parseInt(el.dataset.numDecimals || 0, 10)
}));
/* O’quv markazi tajribasi: 1999 asos → 2026 da 27 (site.ts experienceYears bilan bir xil) */
MU.years = () => new Date().getFullYear() - 1999;

/* surat ko’rish oynasi: MU.lightbox({ src, alt, caption, href, hrefText }) — native <dialog>, Esc/fon bosilsa yopiladi, fokus qaytadi */
MU.lightbox = ({ src, alt = '', caption = '', href = '', hrefText = '' }) => {
  const dlg = document.querySelector('.mu-lb');
  if (!dlg || !src) return;
  const back = document.activeElement;
  const img = dlg.querySelector('.mu-lb__img'), link = dlg.querySelector('.mu-lb__link');
  img.src = src; img.alt = alt;
  dlg.querySelector('.mu-lb__txt').textContent = caption;
  link.hidden = !href; if (href) { link.href = href; link.textContent = hrefText || href; }
  if (MU.lenis) MU.lenis.stop();
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  const done = () => { if (MU.lenis) MU.lenis.start(); if (back && back.focus) back.focus({ preventScroll: true }); dlg.removeEventListener('close', done); };
  dlg.addEventListener('close', done);
  if (!dlg.dataset.wired) {
    dlg.dataset.wired = '1';
    dlg.querySelector('.mu-lb__close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  }
};

MU.part('core', {
  init() {
    const { gsap, ScrollTrigger } = MU;
    const nav = document.querySelector('.nv');
    const bar = document.querySelector('.nv-progress span');
    let menuOpen = false;

    /* progress + header holati */
    gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate(self) {
        const y = self.scroll();
        nav.classList.toggle('is-glass', y > 30);
        nav.classList.toggle('is-hidden', y > 500 && self.direction === 1 && !menuOpen);
      }
    });
    /* Yo’nalishlar dropdown (klaviatura/sensor uchun) */
    const dd = nav.querySelector('.nv-dd'), ddBtn = dd.querySelector('.nv-dd__btn');
    ddBtn.addEventListener('click', () => { const o = !dd.classList.contains('is-open'); dd.classList.toggle('is-open', o); ddBtn.setAttribute('aria-expanded', String(o)); });
    document.addEventListener('click', e => { if (!dd.contains(e.target)) { dd.classList.remove('is-open'); ddBtn.setAttribute('aria-expanded', 'false'); } });

    /* qo’ng’iroq bosilishi → /api/track-call (fire-and-forget, tel: navigatsiyasi bloklanmaydi) */
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href^="tel:"]');
      if (!a) return;
      try {
        if (navigator.sendBeacon) navigator.sendBeacon('/api/track-call');
        else fetch('/api/track-call', { method: 'POST', keepalive: true }).catch(() => {});
      } catch (err) { /* jim */ }
    }, true);

    /* mobil menyu */
    const burger = nav.querySelector('.nv-burger');
    const menu = document.getElementById('nv-menu');
    const links = menu.querySelectorAll('.nv-menu__links a, .nv-menu__foot > *');
    const setMenu = open => {
      if (open === menuOpen) return;
      menuOpen = open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Menyuni yopish' : 'Menyuni ochish');
      document.body.classList.toggle('nv-locked', open);
      if (MU.lenis) open ? MU.lenis.stop() : MU.lenis.start();
      if (open) {
        menu.hidden = false;
        gsap.killTweensOf([menu, links]);
        gsap.fromTo(menu, { clipPath: 'circle(0% at calc(100% - 44px) 44px)' }, { clipPath: 'circle(150% at calc(100% - 44px) 44px)', duration: MU.reduced ? 0 : 0.9, ease: 'mu.inOut' });
        gsap.fromTo(links, { y: MU.reduced ? 0 : 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: MU.reduced ? 0 : 0.8, stagger: MU.reduced ? 0 : 0.05, delay: MU.reduced ? 0 : 0.25, ease: 'mu.out' });
        setTimeout(() => { const f = menu.querySelector('a, button'); if (f) f.focus({ preventScroll: true }); }, MU.reduced ? 0 : 300);
      } else {
        burger.focus({ preventScroll: true });
        gsap.to(menu, { clipPath: 'circle(0% at calc(100% - 44px) 44px)', duration: MU.reduced ? 0 : 0.6, ease: 'mu.inOut', onComplete: () => { if (!menuOpen) menu.hidden = true; } });
      }
    };
    burger.addEventListener('click', () => setMenu(!menuOpen));

    /* alifbo tugmasi (src/base/alifbo.js) */
    const A = window.MUAlifbo;
    const abcBtns = Array.from(document.querySelectorAll('[data-abc]'));
    const syncAbc = () => abcBtns.forEach(b => b.setAttribute('aria-pressed', String(!!A && b.dataset.abc === A.mode)));
    abcBtns.forEach(b => b.addEventListener('click', () => {
      if (!A || A.mode === b.dataset.abc) return;
      A.set(b.dataset.abc); syncAbc();
      if (!MU.reduced) gsap.fromTo('main, body > section, body > footer', { opacity: 0.55 }, { opacity: 1, duration: 0.5, ease: 'power2.out', clearProps: 'opacity' });
      MU.ScrollTrigger.refresh();
    }));
    syncAbc();
    menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') setMenu(false);
      /* menyu ochiq: Tab faqat menyu va burger ichida aylanadi */
      if (e.key === 'Tab' && menuOpen) {
        const f = [burger, ...menu.querySelectorAll('a[href], button:not([disabled])')].filter(x => x.offsetParent !== null);
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });

    if (!MU.reduced) gsap.from(nav, { y: -90, autoAlpha: 0, duration: 1.2, delay: 0.2, ease: 'mu.out' });
  }
});
