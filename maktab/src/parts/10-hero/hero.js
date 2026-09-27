MU.part('hero', {
  init(root) {
    const { gsap, ScrollTrigger } = MU;
    const yEl = root.querySelector('.hero-years');
    yEl.dataset.num = MU.years(); yEl.textContent = MU.years();
    MU.nums(root);

    const video = root.querySelector('.hero-video'), media = root.querySelector('.hero-media');
    const btn = root.querySelector('.hero-sound'), txt = root.querySelector('.hero-sound__txt');

    /* ovoz: videoga yoki tugmaga bosilsa yoqiladi (brauzer qoidasi — faqat foydalanuvchi harakatidan keyin) */
    const setSound = on => {
      video.muted = !on; if (on) video.play().catch(() => {});
      btn.setAttribute('aria-pressed', String(on)); txt.textContent = on ? 'Ovozni o’chirish' : 'Ovozni yoqish';
    };
    btn.addEventListener('click', () => setSound(video.muted));
    video.addEventListener('click', () => setSound(video.muted));

    if (MU.reduced) { video.removeAttribute('autoplay'); video.pause(); btn.hidden = true; return; }

    /* faqat ekranda o’ynaydi (trafik va batareya) */
    const play = () => { const p = video.play(); if (p) p.catch(() => {}); };
    MU.onVisible(root, v => (v ? play() : video.pause()), '0px');

    /* kinematik ochilish: video yumaloq «oyna»dan to’liq ekranga */
    const wide = matchMedia('(min-width: 901px)').matches;
    gsap.set(media, { clipPath: wide ? 'inset(14% 10% 14% 46% round 36px)' : 'inset(6% 5% 18% 5% round 28px)' });
    MU.on('reveal', () => gsap.to(media, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.8, ease: 'mu.inOut', delay: 0.05 }));

    /* scroll: video sekin yaqinlashadi, matn yuqoriga suzadi */
    gsap.to(video, { scale: 1.14, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to(root.querySelector('.hero-copy'), { yPercent: -14, autoAlpha: 0.15, ease: 'none', scrollTrigger: { trigger: root, start: '30% top', end: 'bottom top', scrub: true } });
  }
});
