MU.part('yonalishlar', {
  init(root) {
    const { gsap } = MU;
    MU.onVisible(root, v => root.classList.toggle('is-inview', v && !MU.reduced));
    /* qiziqish bo’yicha filtr: kartalar Flip bilan silliq qayta joylashadi */
    const btns = Array.from(root.querySelectorAll('[data-filter]')), cards = Array.from(root.querySelectorAll('.yn-card[data-goals]'));
    const status = root.querySelector('.yn-status');
    btns.forEach(b => b.addEventListener('click', () => {
      const f = b.dataset.filter;
      const state = window.Flip && !MU.reduced ? Flip.getState(cards) : null;
      btns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      let n = 0;
      cards.forEach(c => { const g = c.dataset.goals.split(' '); c.hidden = !(f === 'all' || g.includes('all') || g.includes(f)); if (!c.hidden && !g.includes('all')) n++; });
      status.textContent = n + ' ta yo’nalish ko’rsatilmoqda.';
      if (state) Flip.from(state, { duration: 0.6, ease: 'mu.out', scale: true, absolute: true, onEnter: el => gsap.fromTo(el, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.5 }), onLeave: el => gsap.to(el, { autoAlpha: 0, scale: 0.9, duration: 0.3 }), onComplete: () => MU.ScrollTrigger.refresh() });
      else MU.ScrollTrigger.refresh();
    }));
    if (MU.reduced) return;
    /* ikonkalar kartalar kirganda chiziladi */
    const icons = root.querySelectorAll('.yn-ico svg');
    MU.gsap.from(icons, {
      scale: 0.4, rotation: -25, autoAlpha: 0, duration: 1, stagger: 0.08, ease: 'back.out(2)',
      scrollTrigger: { trigger: root.querySelector('.yn-grid'), start: 'top 80%', once: true }
    });
  }
});
