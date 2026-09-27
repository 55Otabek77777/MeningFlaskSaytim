/* AI yordamchi: jonli saytdagi AiChat mantiqi — POST /api/chat {message, history (oxirgi 8), sessionId}. */
MU.part('chat', {
  init(root) {
    const { gsap } = MU;
    const launch = root.querySelector('.ch-launch');
    const panel = root.querySelector('.ch-panel');
    const backdrop = root.querySelector('.ch-backdrop');
    const log = root.querySelector('.ch-log');
    const form = root.querySelector('.ch-form');
    const input = root.querySelector('.ch-input');
    const sendBtn = root.querySelector('.ch-send');
    const LOGO = 'https://mirzoulugbek.app/logo.png';
    const GREETING = 'Assalomu alaykum! 👋 Men Mirzo Ulug’bek maktabining yordamchisiman. Qabul, yo’nalishlar yoki maktab haqida savolingiz bo’lsa — bemalol so’rang!';
    const FAIL = 'Kechirasiz, hozir javob bera olmadim. Iltimos, menejerimizga yozing: @Otabek_Mashrabov';
    const OFFLINE = 'Aloqa uzildi. Iltimos, menejerimizga yozing: @Otabek_Mashrabov yoki +998 97 417 37 77';
    const messages = [{ role: 'assistant', content: GREETING }];
    let open = false, sending = false, lastFocus = null;

    const sessionId = () => {
      try {
        let id = localStorage.getItem('site_ai_session');
        if (!id) {
          id = (crypto.randomUUID && crypto.randomUUID()) || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 3) | 8).toString(16); });
          localStorage.setItem('site_ai_session', id);
        }
        return id;
      } catch (e) { return ''; }
    };
    /* model ba’zan markdown qaytaradi — oddiy matnga aylantiramiz */
    const cleanReply = t => t.replace(/\*\*(.*?)\*\*/g, '$1').replace(/(^|[^*])\*(?!\*)([^*]+?)\*/g, '$1$2')
      .replace(/^#{1,6}\s+/gm, '').replace(/^\s*[-•]\s+/gm, '').replace(/\n{3,}/g, '\n\n').trim();

    const bubble = (role, text) => {
      const row = document.createElement('div');
      row.className = 'ch-msg ' + (role === 'user' ? 'ch-msg--me' : 'ch-msg--bot');
      if (role !== 'user') row.innerHTML = `<span class="ch-msg__ava"><img src="${LOGO}" alt="" width="18" height="18"></span>`;
      const b = document.createElement('div');
      b.className = 'ch-bubble';
      if (role === 'user') b.setAttribute('data-no-transliterate', '');
      b.textContent = role === 'user' ? text : MU.t(text);
      row.appendChild(b);
      log.appendChild(row);
      if (!MU.reduced) gsap.from(row, { y: 14, autoAlpha: 0, scale: 0.96, transformOrigin: role === 'user' ? '100% 100%' : '0% 100%', duration: 0.4, ease: 'back.out(1.8)' });
      log.scrollTop = log.scrollHeight;
      return row;
    };
    bubble('assistant', GREETING);

    const fit = () => { input.style.height = '44px'; input.style.height = Math.min(Math.max(input.scrollHeight, 44), 132) + 'px'; };
    const sync = () => { sendBtn.disabled = sending || !input.value.trim(); };
    input.addEventListener('input', () => { fit(); sync(); });
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
    sync();

    MU.dialog(panel, { onClose: () => { open = false; launch.setAttribute('aria-expanded', 'false'); } });
    const setOpen = value => {
      open = value;
      launch.setAttribute('aria-expanded', String(value));
      if (value) { MU.openDialog(panel); log.scrollTop = log.scrollHeight; input.focus({ preventScroll: true }); }
      else panel.close();
    };
    launch.addEventListener('click', () => setOpen(true));

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const text = input.value.trim().slice(0, 1000);
      if (!text || sending) return;
      messages.push({ role: 'user', content: text });
      bubble('user', text);
      input.value = ''; fit();
      sending = true; sync(); sendBtn.classList.add('is-busy');
      const typing = document.createElement('div');
      typing.className = 'ch-msg ch-msg--bot';
      typing.innerHTML = `<span class="ch-msg__ava"><img src="${LOGO}" alt="" width="18" height="18"></span><div class="ch-bubble ch-typing" aria-label="Yozmoqda"><i></i><i></i><i></i></div>`;
      log.appendChild(typing); log.scrollTop = log.scrollHeight;
      let reply;
      const ctrl = new AbortController(), timeout = setTimeout(() => ctrl.abort(), 25000);
      try {
        const history = messages.slice(1).slice(-8).map(m => ({ role: m.role, content: m.content }));
        const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, history, sessionId: sessionId() }), signal: ctrl.signal });
        let data = null;
        try { data = await res.json(); } catch (err) { /* JSON emas */ }
        reply = data && typeof data.reply === 'string' && data.reply.length ? cleanReply(data.reply) : FAIL;
      } catch (err) { reply = OFFLINE; }
      clearTimeout(timeout);
      typing.remove();
      messages.push({ role: 'assistant', content: reply });
      bubble('assistant', reply);
      sending = false; sync(); sendBtn.classList.remove('is-busy');
    });

    /* tugma preloader’dan keyin chiqadi */
    const show = () => launch.classList.add('is-on');
    MU.on('reveal', show);
    setTimeout(show, 4000);
  }
});
