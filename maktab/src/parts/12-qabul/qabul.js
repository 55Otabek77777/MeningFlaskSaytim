MU.part('qabulholati', {
  init(root) { MU.onVisible(root, v => root.classList.toggle('is-inview', v && !MU.reduced)); }
});
