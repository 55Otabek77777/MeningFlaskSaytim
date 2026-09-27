MU.part('geografiya', {
 init(root) {
  const data = window.muUzMap;
  if (!data) return;
  const ns='http://www.w3.org/2000/svg', svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox',data.viewBox); svg.setAttribute('aria-hidden','true');
  const highlighted = new Set(['fergana','namangan','andijan','tashkent-region','tashkent-city','jizzakh']);
  data.regions.forEach(region => {
   const path=document.createElementNS(ns,'path');
   path.setAttribute('d',region.d);
   path.setAttribute('class','gg-r' + (highlighted.has(region.id) ? ' is-lit' : '') + (region.id==='fergana' ? ' is-home' : '') + (region.id==='aral-sea' ? ' gg-r--sea' : ''));
   const title=document.createElementNS(ns,'title'); title.textContent=MU.t(region.name); path.appendChild(title); svg.appendChild(path);
  });
  root.querySelector('.gg-map__svg').appendChild(svg);
 }
});
