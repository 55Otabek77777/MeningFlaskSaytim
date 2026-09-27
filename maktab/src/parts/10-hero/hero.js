MU.part('hero', {
  init(root) {
    root.querySelector('.hero-years').textContent = MU.years();
    const video = root.querySelector('video');
    const dialog = root.querySelector('dialog');
    const failure = root.querySelector('.hero-video-error');
    MU.dialog(dialog, { onClose: () => video.pause() });
    root.querySelector('.hero-watch').addEventListener('click', () => {
      MU.openDialog(dialog);
      if (!video.hasAttribute('src')) {
        video.poster = video.dataset.poster;
        video.src = 'https://mirzoulugbek.app/assets/video/hero.mp4';
      }
      video.play().catch(() => {});
    });
    video.addEventListener('error', () => { failure.hidden = false; });
    document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
    if (!MU.reduced) MU.gsap.from(root.querySelector('.hero-visual'), { opacity: 0, y: 16, duration: .7, clearProps: 'all' });
  }
});
