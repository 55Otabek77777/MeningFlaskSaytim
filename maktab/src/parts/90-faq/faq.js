MU.part('faq', {
  init(root) {
    const { gsap, ScrollTrigger } = MU;
    const items = Array.from(root.querySelectorAll('.fq-item'));
    const toggle = (it, open) => {
      const btn = it.querySelector('.fq-q'), a = it.querySelector('.fq-a');
      if (open === it.classList.contains('is-open')) return;
      it.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        a.hidden = false;
        if (!MU.reduced) gsap.fromTo(a, { height: 0 }, { height: 'auto', duration: 0.55, ease: 'mu.out', onComplete: () => ScrollTrigger.refresh() });
        if (!MU.reduced) gsap.from(a.querySelector('p'), { y: 12, autoAlpha: 0, duration: 0.5, delay: 0.1 });
      } else if (!MU.reduced) gsap.to(a, { height: 0, duration: 0.4, ease: 'mu.inOut', onComplete: () => { a.hidden = true; gsap.set(a, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
      else a.hidden = true;
    };
    items.forEach(it => it.querySelector('.fq-q').addEventListener('click', () => {
      const open = !it.classList.contains('is-open');
      items.forEach(o => o !== it && toggle(o, false));
      toggle(it, open);
    }));
    toggle(items[0], true);
  }
});
