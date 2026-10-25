(() => {
  'use strict';
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const main = document.querySelector('main');
  const footer = document.querySelector('footer');
  function closeMenu() {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('menu-open');
    main.inert = footer.inert = false;
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', open);
    main.inert = footer.inert = open;
    if (open) document.dispatchEvent(new Event('portfolio:menu-open'));
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { closeMenu(); menuButton.focus(); }
  });
  const desktop = window.matchMedia('(min-width: 621px)');
  desktop.addEventListener('change', event => { if (event.matches) closeMenu(); });

  let toastTimer;
  function toast(message) {
    const element = document.getElementById('toast');
    element.textContent = message;
    element.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { element.hidden = true; }, 4000);
  }
  const publicUrl = new URL(window.location.pathname, window.location.origin).href;
  document.getElementById('share-portfolio').addEventListener('click', async () => {
    const data = {title: 'Ithalo Santori | Portfólio artístico', text: 'Conheça Ithalo Santori. Música, vídeos e contato para shows.', url: publicUrl};
    try {
      if (navigator.share) { await navigator.share(data); return; }
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(publicUrl);
        toast('Link do portfólio copiado. É só compartilhar!');
      } else { window.prompt('Copie o link do portfólio:', publicUrl); }
    } catch (error) {
      if (error.name !== 'AbortError') window.prompt('Copie o link do portfólio:', publicUrl);
    }
  });
  document.getElementById('year').textContent = new Date().getFullYear();

  const mobileBooking = document.querySelector('.mobile-booking');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      mobileBooking.classList.toggle('booking-hidden', entries[0].isIntersecting);
    }, {threshold: 0.2});
    observer.observe(document.getElementById('contato'));
  }
})();
