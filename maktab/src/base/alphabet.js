/* Visible text only: endpoint paths, option values and user input stay unchanged. */
MU.t = /*@TO_LATIN*/;
(() => {
  const attributes = ['alt', 'title', 'aria-label', 'aria-valuetext', 'placeholder', 'data-text'];
  const excluded = 'script,style,textarea,[data-no-transliterate],[contenteditable="true"]';
  const text = node => {
    if (!node.parentElement || node.parentElement.closest(excluded)) return;
    const translated = MU.t(node.data);
    if (translated !== node.data) node.data = translated;
  };
  MU.translate = root => {
    if (root.nodeType === Node.TEXT_NODE) { text(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE || root.closest(excluded)) return;
    const visit = el => {
      if (el.closest(excluded)) return;
      // HTML options without an explicit value derive it from their text.
      if (el.tagName === 'OPTION' && !el.hasAttribute('value')) el.value = el.textContent;
      for (const name of attributes) if (el.hasAttribute(name)) {
        const before = el.getAttribute(name), after = MU.t(before);
        if (after !== before) el.setAttribute(name, after);
      }
    };
    visit(root);
    root.querySelectorAll(attributes.map(a => `[${a}]`).join(',') + ',option').forEach(visit);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) text(walker.currentNode);
  };
  MU.translate(document.body);
  new MutationObserver(records => {
    const nodes = new Set();
    for (const r of records) {
      if (r.type === 'childList') r.addedNodes.forEach(n => nodes.add(n));
      else nodes.add(r.target);
    }
    nodes.forEach(n => { if (n.isConnected) MU.translate(n); });
  }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attributes });
})();
