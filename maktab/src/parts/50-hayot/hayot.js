MU.part('hayot', {
 init(root) {
  const track = root.querySelector('.hy-track'), slides = [...root.querySelectorAll('.hy-slide')];
  const previous = root.querySelector('.hy-prev'), next = root.querySelector('.hy-next');
  const count = root.querySelector('.hy-count b'), progress = root.querySelector('.hy-prog b');
  let index = 0;
  const step = () => slides[1].offsetLeft - slides[0].offsetLeft;
  const update = () => {
   index = Math.min(slides.length-1, Math.round(track.scrollLeft / step()));
   count.textContent = String(index + 1).padStart(2, '0');
   progress.style.transform = 'scaleX(' + (index + 1) / slides.length + ')';
   previous.disabled = track.scrollLeft <= 2;
   next.disabled = track.scrollLeft >= track.scrollWidth-track.clientWidth-2;
  };
  const go = dir => track.scrollBy({ left: step() * dir, behavior: MU.reduced ? 'instant' : 'smooth' });
  previous.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('scroll', update, { passive: true });
  track.addEventListener('keydown', e => {
   if (e.target !== track) return;
   if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); go(e.key === 'ArrowRight' ? 1 : -1); }
  });
  new ResizeObserver(update).observe(track);
  slides.forEach(slide => {
   const img = slide.querySelector('img'), button = document.createElement('button');
   button.type = 'button'; button.className = 'hy-zoom'; button.textContent = '⤢';
   button.setAttribute('aria-label', MU.t(img.alt + ' — kattalashtirish'));
   button.setAttribute('aria-haspopup', 'dialog');
   button.addEventListener('click', () => MU.viewPhoto(img.src, img.alt));
   slide.querySelector('.hy-frame').appendChild(button);
  });
  update();
 }
});
