MU.part('footer', {
  init(root) {
    const { gsap, ScrollTrigger } = MU;
    root.querySelector('.ft-year').textContent = new Date().getFullYear();
    root.querySelector('.ft-yrs').textContent = MU.years();
    MU.onVisible(root, v => root.classList.toggle('is-inview', v));

    /* tashrif hisoblagichi — mavjud sayt mantig’i (sessionStorage mu_visit_counted) */
    const wrap = root.querySelector('.ft-visits'), num = root.querySelector('.ft-visits__num');
    let counted = false;
    try { counted = sessionStorage.getItem('mu_visit_counted') === '1'; } catch (e) { /* bloklangan */ }
    fetch('/api/visit', { method: counted ? 'GET' : 'POST' })
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(data => {
        if (!counted) { try { sessionStorage.setItem('mu_visit_counted', '1'); } catch (e) { /* jim */ } }
        const total = Number(data && data.total);
        if (!Number.isFinite(total) || total <= 0) return;
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
