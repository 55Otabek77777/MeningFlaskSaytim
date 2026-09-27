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
        gsap.fromTo(links, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.05, delay: MU.reduced ? 0 : 0.25, ease: 'mu.out' });
      } else {
        gsap.to(menu, { clipPath: 'circle(0% at calc(100% - 44px) 44px)', duration: MU.reduced ? 0 : 0.6, ease: 'mu.inOut', onComplete: () => { if (!menuOpen) menu.hidden = true; } });
      }
    };
    burger.addEventListener('click', () => setMenu(!menuOpen));
    menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

    if (!MU.reduced) gsap.from(nav, { y: -90, autoAlpha: 0, duration: 1.2, delay: 0.2, ease: 'mu.out' });
  }
});
