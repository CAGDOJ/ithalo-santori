(() => {
  'use strict';
  const dock = document.getElementById('music-dock');
  const host = document.getElementById('music-video');
  const status = document.getElementById('music-status');
  const toggle = document.getElementById('toggle-music');
  const launcher = document.getElementById('open-music');
  const listen = document.getElementById('listen-here');
  let player = null;
  let ready = false;
  let wantsPlay = true;
  let generation = 0;
  let fallbackTimer;

  function showState(state) {
    const labels = {
      loading: ['Preparando a música…', 'Carregando…'],
      playing: ['Tocando agora', 'Pausar música'],
      blocked: ['Toque para ouvir', 'Tocar música'],
      paused: ['Música pausada', 'Retomar música'],
      ended: ['Ouça mais uma vez', 'Ouvir de novo'],
      unavailable: ['Use o play do vídeo ou ouça pelo YouTube.', 'Tocar música'],
    };
    const [description, buttonLabel] = labels[state];
    dock.dataset.state = state;
    status.textContent = description;
    toggle.disabled = !ready;
    toggle.setAttribute('aria-label', buttonLabel);
    const icon = state === 'playing'
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" stroke-width="3"/></svg>'
      : '<svg aria-hidden="true"><use href="#play"/></svg>';
    toggle.innerHTML = icon + '<span>' + buttonLabel + '</span>';
  }

  function attachController() {
    if (dock.hidden || player || !window.YT?.Player) return;
    const currentGeneration = generation;
    const active = () => currentGeneration === generation && !dock.hidden;
    player = new window.YT.Player('youtube-music', {events: {
      onReady(event) {
        if (!active()) return;
        window.clearTimeout(fallbackTimer);
        ready = true;
        event.target.getIframe().setAttribute('title', 'Não te quero mais - Ithalo Santori');
        if (wantsPlay) {
          event.target.setVolume(65);
          event.target.unMute();
          event.target.playVideo();
        }
        // Never report playback as successful until the player confirms it.
        showState(event.target.getPlayerState() === 1 ? 'playing' : 'blocked');
      },
      onAutoplayBlocked() { if (active()) showState('blocked'); },
      onStateChange(event) {
        if (!active()) return;
        if (event.data === 1) { wantsPlay = true; showState('playing'); }
        else if (event.data === 2) { wantsPlay = false; showState('paused'); }
        else if (event.data === 0) { wantsPlay = false; showState('ended'); }
      },
      onError() {
        if (!active()) return;
        ready = false;
        wantsPlay = false;
        showState('unavailable');
      },
    }});
  }

  function mount() {
    generation += 1;
    ready = false;
    wantsPlay = true;
    dock.hidden = false;
    launcher.hidden = true;
    launcher.setAttribute('aria-expanded', 'true');
    listen.setAttribute('aria-expanded', 'true');
    showState('loading');
    const iframe = document.createElement('iframe');
    const url = new URL('https://www.youtube.com/embed/saacnVY40EY');
    url.search = new URLSearchParams({autoplay: '1', playsinline: '1', enablejsapi: '1', controls: '1', rel: '0', origin: window.location.origin});
    iframe.id = 'youtube-music';
    iframe.title = 'Não te quero mais - Ithalo Santori';
    iframe.src = url.href;
    iframe.width = '300';
    iframe.height = '200';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    host.replaceChildren(iframe);
    const currentGeneration = generation;
    window.clearTimeout(fallbackTimer);
    fallbackTimer = window.setTimeout(() => {
      if (currentGeneration === generation && !dock.hidden && !ready) showState('unavailable');
    }, 12000);
    attachController();
  }

  function stopAndClose() {
    generation += 1;
    wantsPlay = false;
    ready = false;
    window.clearTimeout(fallbackTimer);
    if (player) {
      try { player.destroy(); } catch { /* Removing the frame below also stops audio. */ }
      player = null;
    }
    host.replaceChildren();
    dock.hidden = true;
    launcher.hidden = false;
    launcher.setAttribute('aria-expanded', 'false');
    listen.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    if (!ready || !player) return;
    const state = player.getPlayerState();
    if (state === 1 || (state === 3 && wantsPlay)) {
      wantsPlay = false;
      player.pauseVideo();
      showState('paused');
    } else {
      wantsPlay = true;
      player.unMute();
      player.playVideo();
    }
  });
  document.getElementById('close-music').addEventListener('click', () => {
    stopAndClose();
    launcher.focus({preventScroll: true});
  });
  launcher.addEventListener('click', mount);
  listen.addEventListener('click', () => {
    if (dock.hidden) mount();
    else if (ready && player) { wantsPlay = true; player.unMute(); player.playVideo(); }
  });
  document.addEventListener('portfolio:menu-open', stopAndClose);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && ready && player) { wantsPlay = false; player.pauseVideo(); }
  });
  const previousApiReady = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    if (typeof previousApiReady === 'function') previousApiReady();
    attachController();
  };
  mount();
  if (!window.YT?.Player) {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => { if (!dock.hidden) showState('unavailable'); };
    document.head.append(script);
  }
})();
