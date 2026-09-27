MU.part('footer', {
  init(root) {
    const { gsap, ScrollTrigger } = MU;
    root.querySelector('.ft-year').textContent = new Date().getFullYear();
    MU.onVisible(root, v => root.classList.toggle('is-inview', v));

    /* meteorlar (magicui) */
    const box = root.querySelector('.ft-meteors');
    if (!MU.reduced) for (let i = 0; i < 14; i++) {
      const m = document.createElement('i');
      m.style.left = MU.rand(10, 110) + '%';
      m.style.animationDelay = MU.rand(0, 8).toFixed(2) + 's';
      m.style.animationDuration = MU.rand(4, 9).toFixed(2) + 's';
      box.appendChild(m);
    }

    /* katta so’z belgisi — scroll bilan yig’iladi */
    if (!MU.reduced) gsap.fromTo(root.querySelectorAll('.ft-mega span'), { yPercent: 70, autoAlpha: 0 }, {
      yPercent: 0, autoAlpha: 1, stagger: 0.15, ease: 'none',
      scrollTrigger: { trigger: root.querySelector('.ft-mega'), start: 'top bottom', end: 'bottom 85%', scrub: 1 }
    });

    /* tashrif hisoblagichi — mavjud sayt mantig’i (sessionStorage mu_visit_counted) */
    const wrap = root.querySelector('.ft-visits'), num = root.querySelector('.ft-visits__num');
    let counted = false;
    try { counted = sessionStorage.getItem('mu_visit_counted') === '1'; } catch (e) { /* bloklangan */ }
    fetch('/api/visit', { method: counted ? 'GET' : 'POST' })
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(data => {
        if (!counted) { try { sessionStorage.setItem('mu_visit_counted', '1'); } catch (e) { /* jim */ } }
        const total = Number(data && data.total);
        if (!total) return;
        wrap.hidden = false;
        const o = { v: 0 }, show = () => { num.textContent = Math.round(o.v).toLocaleString('uz-UZ').replace(/[,.\u202F]/g, '\u00A0'); };
        if (MU.reduced) { o.v = total; show(); return; }
        gsap.to(o, { v: total, duration: 2.4, ease: 'power3.out', onUpdate: show, scrollTrigger: { trigger: wrap, start: 'top 95%', once: true } });
        ScrollTrigger.refresh();
      })
      .catch(() => { /* API yo’q (lokal ko’rish) — hisoblagich yashirin qoladi */ });

    /* mobil yopishqoq panel */
    const sticky = root.querySelector('.ft-sticky');
    ScrollTrigger.create({ start: 600, end: 'max', onToggle: s => sticky.classList.toggle('is-on', s.isActive) });
  }
});
