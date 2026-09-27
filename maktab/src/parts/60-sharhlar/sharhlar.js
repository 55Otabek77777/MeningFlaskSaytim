/* Ota-onalar fikri: reyting soni sanaladi, yulduzlar chapdan o‘ngga 4.9/5 gacha to‘ladi. */
MU.part('sharhlar', {
  init(root) {
    const { gsap } = MU;
    MU.nums(root);
    const fill = root.querySelector('.sh-rating__fill');
    if (MU.reduced) return;
    gsap.fromTo(fill, { width: '0%' }, { width: '98%', duration: 2, ease: 'power3.out', scrollTrigger: { trigger: fill, start: 'top 90%', once: true } });
    /* kartalardagi qo‘shtirnoq belgisi yengil suzadi */
    root.querySelectorAll('.sh-q').forEach((q, i) => gsap.fromTo(q, { y: 14, rotate: -8, autoAlpha: 0 }, { y: 0, rotate: 0, autoAlpha: 1, duration: 1, delay: 0.25 + i * 0.12, ease: 'back.out(2)', scrollTrigger: { trigger: q, start: 'top 90%', once: true } }));
  }
});
