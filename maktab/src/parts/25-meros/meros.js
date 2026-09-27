MU.part('meros', {
  init(root) {
    const { gsap, ScrollTrigger } = MU;
    root.querySelector('.mr-years').textContent = MU.years();
    const photos = root.querySelectorAll('.mr-ph, .mr-bld');
    if (MU.reduced) { photos.forEach(p => p.classList.add('is-in')); return; }
    /* foto «parda» bilan ochiladi */
    photos.forEach((p, i) => {
      gsap.fromTo(p, { clipPath: 'inset(100% 0% 0% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.4, ease: 'mu.inOut', delay: i % 2 ? 0.25 : 0,
        scrollTrigger: { trigger: p, start: 'top 85%', once: true, onEnter: () => p.classList.add('is-in') }, clearProps: 'clipPath' });
    });
    /* vaqt chizig’i scroll bilan to’ladi */
    const wide = () => innerWidth > 1000;
    const line = root.querySelector('.mr-line i');
    gsap.fromTo(line, { scaleX: 0, scaleY: 0 }, { scaleX: 1, scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: root.querySelector('.mr-time'), start: 'top 80%', end: 'bottom 55%', scrub: true, invalidateOnRefresh: true } });
    gsap.set(line, { transformOrigin: wide() ? '0 50%' : '50% 0' });
    gsap.from(root.querySelectorAll('.mr-steps > li'), { y: 40, autoAlpha: 0, stagger: 0.12, duration: 1, ease: 'mu.out',
      scrollTrigger: { trigger: root.querySelector('.mr-time'), start: 'top 82%', once: true } });
  }
});
