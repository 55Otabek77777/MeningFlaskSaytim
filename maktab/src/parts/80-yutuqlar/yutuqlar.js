MU.part('yutuqlar', {
  init(root) {
    const { gsap } = MU;
    MU.nums(root);
    const cards = Array.from(root.querySelectorAll('.yt-card'));
    let order = cards.slice();
    const layout = (dur = 0.9) => order.forEach((c, i) => gsap.to(c, {
      x: i * (innerWidth < 600 ? 4 : 14), y: i * -12, z: -i * 40, rotationZ: i ? (i % 2 ? 3 : -3) * Math.min(i, 3) * 0.6 : 0, rotationY: i * -3,
      autoAlpha: i < 5 ? 1 - i * 0.12 : 0, zIndex: cards.length - i, duration: MU.reduced ? 0 : dur, ease: 'mu.out'
    }));
    layout(0);
    const shine = c => { if (!MU.reduced) gsap.fromTo(c.querySelector('.yt-shine'), { xPercent: -60 }, { xPercent: 60, duration: 1.1, ease: 'power2.inOut' }); };
    const next = (dir = 1) => {
      if (dir > 0) {
        const top = order.shift(); order.push(top);
        if (!MU.reduced) gsap.to(top, { y: -160, rotationZ: -14, rotationX: 20, duration: 0.45, ease: 'power2.in', onComplete: () => layout() });
        else layout();
      } else { order.unshift(order.pop()); layout(); }
      shine(order[0]);
    };
    root.querySelectorAll('.yt-btn').forEach(b => b.addEventListener('click', () => { next(+b.dataset.dir); restart(); }));
    /* sudrab tashlash (Draggable) */
    if (window.Draggable) cards.forEach(c => Draggable.create(c, {
      type: 'x,y', zIndexBoost: false, onPress() { restart(); },
      onRelease() { if (Math.abs(this.x) > 90 || Math.abs(this.y) > 90) next(1); else layout(0.6); },
      onDrag() { gsap.set(this.target, { rotationZ: this.x / 12 }); }
    }));
    /* avtomatik almashish — faqat ekranda */
    let timer = null, vis = false;
    const restart = () => { clearInterval(timer); if (vis && !MU.reduced) timer = setInterval(() => next(1), 3200); };
    MU.onVisible(root, v => { vis = v; restart(); });
  }
});
