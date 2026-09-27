/* Maktab hayoti: desktop’da lenta pin qilinadi va skroll bilan gorizontal suriladi
   (har surat ichida parallaks + kirishda parda ochilishi); mobil/reduced’da — tabiiy surish. */
MU.part('hayot', {
  init(root) {
    const { gsap, ScrollTrigger } = MU;
    MU.nums(root);
    const reel = root.querySelector('.hy-reel');
    const track = root.querySelector('.hy-track');
    const slides = Array.from(root.querySelectorAll('.hy-slide'));
    const countB = root.querySelector('.hy-count b');
    const prog = root.querySelector('.hy-prog b');
    const n = slides.length;
    const setIdx = (i, p) => {
      countB.textContent = String(i + 1).padStart(2, '0');
      gsap.set(prog, { scaleX: p });
    };
    setIdx(0, 1 / n);

    /* suratni bosib kattalashtirish (lenta va «ikkinchi uy» suratlari) */
    root.querySelectorAll('.hy-slide, .hy-shot').forEach(f => {
      const img = f.querySelector('img'), cap = f.querySelector('figcaption b, figcaption');
      if (!img) return;
      f.tabIndex = 0; f.setAttribute('role', 'button'); f.setAttribute('aria-label', (img.alt || 'Surat') + ' — kattalashtirish');
      const open = () => MU.lightbox && MU.lightbox({ src: img.currentSrc || img.src, alt: img.alt, caption: cap ? cap.textContent.trim() : img.alt });
      f.addEventListener('click', open);
      f.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });

    /* mobil: surishni kuzatish */
    const onNativeScroll = () => {
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? track.scrollLeft / max : 0;
      setIdx(Math.round(p * (n - 1)), Math.max(1 / n, p));
    };
    track.addEventListener('scroll', onNativeScroll, { passive: true });

    MU.mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
      root.classList.add('is-pinned');
      /* barcha suratlar oldindan yuklansin — gorizontal lentada lazy ba’zan kech qoladi */
      slides.forEach(s => { const im = s.querySelector('img'); im.loading = 'eager'; });
      const last = slides[n - 1];
      const dist = () => Math.max(0, last.offsetLeft + last.offsetWidth + parseFloat(getComputedStyle(track).paddingLeft) - innerWidth);
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: reel, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate(self) { setIdx(Math.min(n - 1, Math.round(self.progress * (n - 1))), Math.max(1 / n, self.progress)); }
        }
      });
      slides.forEach((s, i) => {
        const img = s.querySelector('img'), frame = s.querySelector('.hy-frame'), cap = s.querySelector('figcaption');
        /* surat ichida parallaks: ramka ichida rasm qarama-qarshi siljiydi */
        gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: s, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
        if (i === 0) return;
        /* kirishda parda: o‘ngdan ochiladi, izoh ko‘tariladi */
        gsap.fromTo(frame, { clipPath: 'inset(0 0 0 36% round 28px)' }, { clipPath: 'inset(0 0 0 0% round 28px)', ease: 'none', scrollTrigger: { trigger: s, containerAnimation: tween, start: 'left 105%', end: 'left 45%', scrub: true } });
        gsap.fromTo(cap, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: s, containerAnimation: tween, start: 'left 75%', end: 'left 40%', scrub: true } });
      });
      return () => { root.classList.remove('is-pinned'); gsap.set(track, { clearProps: 'transform' }); };
    });

    /* kichik ekranda: kartalar ketma-ket paydo bo‘ladi */
    MU.mm.add('(max-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.from(slides.slice(0, 2), { x: 60, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'mu.out', scrollTrigger: { trigger: reel, start: 'top 85%', once: true } });
    });
  }
});
