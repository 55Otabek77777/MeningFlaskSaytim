MU.part('yonalishlar', {
  init(root) {
    MU.onVisible(root, v => root.classList.toggle('is-inview', v && !MU.reduced));
    if (MU.reduced) return;
    /* ikonkalar kartalar kirganda chiziladi */
    const icons = root.querySelectorAll('.yn-ico svg');
    MU.gsap.from(icons, {
      scale: 0.4, rotation: -25, autoAlpha: 0, duration: 1, stagger: 0.08, ease: 'back.out(2)',
      scrollTrigger: { trigger: root.querySelector('.yn-grid'), start: 'top 80%', once: true }
    });
  }
});
