MU.part('yonalishlar', {
 init(root) {
  const filters = [...root.querySelectorAll('[data-filter]')], cards = [...root.querySelectorAll('[data-goals]')];
  filters.forEach(button => button.addEventListener('click', () => {
   filters.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
   let count = 0;
   cards.forEach(card => { card.hidden = button.dataset.filter !== 'all' && !card.dataset.goals.split(' ').includes(button.dataset.filter); if (!card.hidden) count++; });
   root.querySelector('.yn-status').textContent = MU.t(count + ' ta yo’nalish ko’rsatilmoqda.');
   MU.ScrollTrigger.refresh();
  }));
 }
});
