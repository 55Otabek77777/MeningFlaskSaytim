/* Shared behavior stays on MU; raw API values are never transliterated. */
MU.years = () => new Date().getFullYear() - 1999;
MU.countUp = (el, to, { suffix = '', decimals = 0 } = {}) => {
  el.textContent = (decimals ? to.toFixed(decimals) : String(to)) + suffix;
};
MU.nums = root => root.querySelectorAll('[data-num]').forEach(el => MU.countUp(el, +el.dataset.num, {
  suffix: el.dataset.numSuffix || '', decimals: +(el.dataset.numDecimals || 0)
}));

MU.dialog = (dialog, { onClose } = {}) => {
  dialog.querySelector('.mu-dialog__close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),video[controls],[tabindex="0"]')]
      .filter(el => el.getClientRects().length && !el.closest('[hidden]'));
    const first = controls[0], last = controls.at(-1);
    if (!first) return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  let backdrop = false;
  dialog.addEventListener('pointerdown', e => { backdrop = e.target === dialog && outside(e); });
  const outside = e => { const r = dialog.getBoundingClientRect(); return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom; };
  dialog.addEventListener('click', e => { if (backdrop && e.target === dialog && outside(e)) dialog.close(); backdrop = false; });
  dialog.addEventListener('close', () => {
    onClose?.();
    if (!document.querySelector('dialog[open]')) {
      document.body.classList.remove('mu-modal-open');
      MU.lenis?.start();
    }
    dialog.muReturnFocus?.focus({ preventScroll: true });
  });
};
MU.openDialog = dialog => {
  if (dialog.open) return;
  dialog.muReturnFocus = document.activeElement;
  dialog.showModal();
  document.body.classList.add('mu-modal-open');
  MU.lenis?.stop();
};

MU.part('core', {
  init() {
    const nav = document.querySelector('.nv');
    const bar = document.querySelector('.nv-progress span');
    MU.gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .2 } });
    const dd = nav.querySelector('.nv-dd'), ddBtn = dd.querySelector('button');
    const setDropdown = open => {
      dd.classList.toggle('is-open', open);
      ddBtn.setAttribute('aria-expanded', String(open));
    };
    ddBtn.addEventListener('click', () => setDropdown(!dd.classList.contains('is-open')));
    dd.addEventListener('keydown', e => {
      if (e.key === 'Escape') { setDropdown(false); ddBtn.focus(); }
      if (e.key === 'ArrowDown' && e.target === ddBtn) { e.preventDefault(); setDropdown(true); dd.querySelector('a').focus(); }
    });
    dd.addEventListener('focusout', e => { if (!dd.contains(e.relatedTarget)) setDropdown(false); });
    document.addEventListener('click', e => { if (!dd.contains(e.target) || e.target.closest('a')) setDropdown(false); });

    document.addEventListener('click', e => {
      if (!e.target.closest('a[href^="tel:"]')) return;
      try {
        if (navigator.sendBeacon) navigator.sendBeacon('/api/track-call');
        else fetch('/api/track-call', { method: 'POST', keepalive: true }).catch(() => {});
      } catch {}
    }, true);

    const burger = nav.querySelector('.nv-burger'), menu = document.getElementById('nv-menu');
    MU.dialog(menu, { onClose: () => burger.setAttribute('aria-expanded', 'false') });
    burger.addEventListener('click', () => { MU.openDialog(menu); burger.setAttribute('aria-expanded', 'true'); });
    menu.addEventListener('click', e => {
      if (!e.target.closest('a')) return;
      menu.muReturnFocus = null;
      menu.close();
      document.body.classList.remove('mu-modal-open');
      MU.lenis?.start();
    });
    matchMedia('(min-width: 1101px)').addEventListener('change', e => { if (e.matches && menu.open) menu.close(); });

    const viewer = document.createElement('dialog');
    viewer.className = 'mu-dialog mu-viewer';
    viewer.setAttribute('aria-labelledby', 'mu-viewer-title');
    viewer.setAttribute('data-lenis-prevent', '');
    viewer.innerHTML = '<div class="mu-dialog__head"><h2 id="mu-viewer-title">Yaqindan ko’rish</h2><button class="mu-dialog__close" type="button" aria-label="Yopish" autofocus>×</button></div><img class="mu-viewer__image" alt=""><div class="mu-viewer__foot"><p class="mu-viewer__caption"></p><a class="mu-viewer__link" target="_blank" rel="noopener noreferrer">Asl rasmni ochish ↗</a></div>';
    document.body.appendChild(viewer);
    MU.dialog(viewer);
    const photo = viewer.querySelector('img'), caption = viewer.querySelector('.mu-viewer__caption');
    photo.addEventListener('error', () => { caption.textContent = MU.t('Rasm yuklanmadi. Asl rasm havolasi orqali qayta ochib ko’ring.'); });
    MU.viewPhoto = (src, description) => {
      photo.src = src;
      photo.alt = MU.t(description);
      caption.textContent = MU.t(description);
      viewer.querySelector('a').href = src;
      MU.openDialog(viewer);
    };
  }
});
