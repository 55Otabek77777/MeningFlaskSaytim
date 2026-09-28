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
    const prev = root.querySelector('.hy-prev'), next = root.querySelector('.hy-next');
    const announcement = root.querySelector('.hy-announcement');
    let activeIndex = 0, pin = null;
    const offset = i => slides[i].offsetLeft - parseFloat(getComputedStyle(track).paddingLeft);
    const nearest = (x, max) => slides.reduce((best, _, i) =>
      Math.abs(Math.min(max, offset(i)) - x) < Math.abs(Math.min(max, offset(best)) - x) ? i : best, 0);
    const setIdx = (i, p) => {
      activeIndex = i;
      countB.textContent = String(i + 1).padStart(2, '0');
      gsap.set(prog, { scaleX: p });
      prev.setAttribute('aria-disabled', String(i === 0));
      next.setAttribute('aria-disabled', String(i === n - 1));
    };
    setIdx(0, 1 / n);
    const go = i => {
      i = Math.max(0, Math.min(n - 1, i));
      if (pin) {
        const max = pin.end - pin.start;
        MU.scrollTo(pin.start + Math.min(max, offset(i)), { duration: 0.85 });
      } else track.scrollTo({ left: offset(i), behavior: MU.reduced ? 'instant' : 'smooth' });
      const caption = slides[i].querySelector('figcaption b');
      announcement.textContent = (i + 1) + ' / ' + n + '. ' + caption.textContent.trim();
    };
    prev.addEventListener('click', () => { if (activeIndex > 0) go(activeIndex - 1); });
    next.addEventListener('click', () => { if (activeIndex < n - 1) go(activeIndex + 1); });
    reel.addEventListener('keydown', e => {
      if (e.altKey || e.ctrlKey || e.metaKey || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      const i = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : Math.max(0, Math.min(n - 1, activeIndex + (e.key === 'ArrowRight' ? 1 : -1)));
      go(i);
      if (e.target.closest('.hy-slide')) slides[i].focus({ preventScroll: true });
    });

    /* suratni bosib kattalashtirish (lenta va «ikkinchi uy» suratlari) */
    root.querySelectorAll('.hy-slide, .hy-shot').forEach(f => {
      const img = f.querySelector('img'), cap = f.querySelector('figcaption b, figcaption');
      if (!img) return;
      const frame = f.querySelector('.hy-frame') || f;
      const zoom = document.createElement('span'); zoom.className = 'hy-zoom'; zoom.setAttribute('aria-hidden', 'true');
      zoom.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg>';
      frame.append(zoom);
      f.tabIndex = 0; f.setAttribute('role', 'button'); f.setAttribute('aria-label', (img.alt || 'Surat') + ' — kattalashtirish');
      const open = () => MU.lightbox && MU.lightbox({ src: img.currentSrc || img.src, alt: img.alt, caption: cap ? cap.textContent.trim() : img.alt });
      f.addEventListener('click', open);
      f.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });

    /* mobil: surishni kuzatish */
    const onNativeScroll = () => {
      if (pin) return;
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? track.scrollLeft / max : 0;
      setIdx(nearest(track.scrollLeft, max), Math.max(1 / n, p));
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
          onUpdate(self) { setIdx(nearest(self.progress * dist(), dist()), Math.max(1 / n, self.progress)); }
        }
      });
      pin = tween.scrollTrigger;
      slides.forEach((s, i) => {
        const img = s.querySelector('img'), frame = s.querySelector('.hy-frame'), cap = s.querySelector('figcaption');
        /* surat ichida parallaks: ramka ichida rasm qarama-qarshi siljiydi */
        gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: s, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
        if (i === 0) return;
        /* kirishda parda: o‘ngdan ochiladi, izoh ko‘tariladi */
        gsap.fromTo(frame, { clipPath: 'inset(0 0 0 36% round 28px)' }, { clipPath: 'inset(0 0 0 0% round 28px)', ease: 'none', scrollTrigger: { trigger: s, containerAnimation: tween, start: 'left 105%', end: 'left 45%', scrub: true } });
        gsap.fromTo(cap, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: s, containerAnimation: tween, start: 'left 75%', end: 'left 40%', scrub: true } });
      });
      return () => { pin = null; root.classList.remove('is-pinned'); gsap.set(track, { clearProps: 'transform' }); onNativeScroll(); };
    });

    /* kichik ekranda: kartalar ketma-ket paydo bo‘ladi */
    MU.mm.add('(max-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.from(slides.slice(0, 2), { x: 60, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'mu.out', scrollTrigger: { trigger: reel, start: 'top 85%', once: true } });
    });
  }
});
