MU.part('negabiz', {
  init(root) {
    root.querySelector('.nb-years').textContent = MU.years();
    MU.onVisible(root, v => root.classList.toggle('is-inview', v && !MU.reduced));
    /* grid spotlight: har karta o’z ofsetini biladi */
    const grid = root.querySelector('.nb-grid');
    const cards = Array.from(grid.children);
    const offs = () => { const g = grid.getBoundingClientRect(); cards.forEach(c => { const r = c.getBoundingClientRect(); c.style.setProperty('--ox', (r.left - g.left) + 'px'); c.style.setProperty('--oy', (r.top - g.top) + 'px'); }); };
    offs(); addEventListener('resize', offs); if (document.fonts) document.fonts.ready.then(offs);
    new ResizeObserver(offs).observe(grid);
    grid.addEventListener('pointerenter', offs);
    grid.addEventListener('pointermove', e => { const g = grid.getBoundingClientRect(); cards.forEach(c => { c.style.setProperty('--mx', (e.clientX - g.left) + 'px'); c.style.setProperty('--my', (e.clientY - g.top) + 'px'); }); });
    grid.addEventListener('pointerleave', () => cards.forEach(c => { c.style.setProperty('--mx', '-999px'); c.style.setProperty('--my', '-999px'); }));
  }
});
