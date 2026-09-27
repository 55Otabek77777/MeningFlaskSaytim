MU.part('faq', {
  init(root) {
    const { gsap, ScrollTrigger } = MU;
    const items = Array.from(root.querySelectorAll('.fq-item'));
    const toggle = (it, open) => {
      const btn = it.querySelector('.fq-q'), a = it.querySelector('.fq-a');
      if (open === it.classList.contains('is-open')) return;
      it.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        a.hidden = false;
        if (!MU.reduced) gsap.fromTo(a, { height: 0 }, { height: 'auto', duration: 0.55, ease: 'mu.out', onComplete: () => ScrollTrigger.refresh() });
        if (!MU.reduced) gsap.from(a.querySelector('p'), { y: 12, autoAlpha: 0, duration: 0.5, delay: 0.1 });
      } else if (!MU.reduced) gsap.to(a, { height: 0, duration: 0.4, ease: 'mu.inOut', onComplete: () => { a.hidden = true; gsap.set(a, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
      else a.hidden = true;
    };
    items.forEach(it => it.querySelector('.fq-q').addEventListener('click', () => {
      const open = !it.classList.contains('is-open');
      items.forEach(o => o !== it && toggle(o, false));
      toggle(it, open);
    }));
    toggle(items[0], true);

    /* qidiruv: joriy va yangi alifboda bir xil ishlaydi (şifokor = shifokor, öqiş = o’qish) */
    const A = window.MUAlifbo;
    const norm = t => (A ? A.toOld(String(t)) : String(t)).toLowerCase().replace(/[’'‘\u02BB\u02BC`]/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const input = root.querySelector('#fq-search'), status = root.querySelector('.fq-search__status');
    if (input) {
      let tm = 0;
      input.addEventListener('input', () => {
        clearTimeout(tm);
        tm = setTimeout(() => {
          const q = norm(input.value.trim());
          let n = 0, first = null;
          items.forEach(it => {
            const hit = !q || norm(it.textContent).includes(q);
            it.hidden = !hit;
            if (hit) { n++; if (!first) first = it; }
          });
          status.textContent = !q ? '' : n ? n + ' ta javob topildi.' : 'Mos javob topilmadi — menejerimizga qo’ng’iroq qiling: +998 97 417 37 77.';
          if (q && first && n <= 3) { items.forEach(o => o !== first && toggle(o, false)); toggle(first, true); }
          ScrollTrigger.refresh();
        }, 120);
      });
    }
  }
});
