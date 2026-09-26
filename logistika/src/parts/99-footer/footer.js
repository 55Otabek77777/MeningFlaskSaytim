MU.part('footer', {
  init(root) {
    if (MU.reduced) return;
    MU.gsap.fromTo(root.querySelector('.ft-mega'), { yPercent: 60, scale: 0.8, autoAlpha: 0 },
      { yPercent: 0, scale: 1, autoAlpha: 0.9, ease: 'none', scrollTrigger: { trigger: root, start: 'top 80%', end: 'bottom bottom', scrub: 1 } });
  }
});
