MU.part('core', {
  init() {
    const nav = document.querySelector('.nv');
    const bar = document.querySelector('.nv-progress span');
    const { gsap, ScrollTrigger } = MU;
    gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate(self) {
        const y = self.scroll();
        nav.classList.toggle('is-glass', y > 40);
        nav.classList.toggle('is-hidden', y > 400 && self.direction === 1);
      }
    });
    nav.querySelectorAll('.nv-links a').forEach(a => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      ScrollTrigger.create({ trigger: target, start: 'top 50%', end: 'bottom 50%', onToggle: s => a.classList.toggle('is-active', s.isActive) });
    });
    if (!MU.reduced) gsap.from(nav, { y: -90, autoAlpha: 0, duration: 1.2, delay: 0.3, ease: 'mu.out' });
  }
});
