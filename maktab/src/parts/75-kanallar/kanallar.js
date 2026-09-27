/* AI CTA: nuqtalar faqat ekranda «yozadi», yorug‘lik sichqonchaga ergashadi. */
MU.part('kanallar', {
  init(root) {
    const ai = root.querySelector('.kn-ai');
    MU.onVisible(root, v => root.classList.toggle('is-inview', v && !MU.reduced));
    if (MU.reduced || MU.isTouch) return;
    ai.addEventListener('pointermove', e => {
      const r = ai.getBoundingClientRect();
      ai.style.setProperty('--gx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
    });
  }
});
