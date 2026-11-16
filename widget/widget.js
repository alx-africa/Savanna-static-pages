/**
 * Savanna Multilingual Assistant — Level 1 drop-in widget
 * Usage: <script src="/widget/widget.js" data-api-url="http://localhost:8000"></script>
 *
 * WCAG 2.2 AA compliant. No external dependencies.
 */
(function () {
  'use strict';

  /* ── 0. Load Pluggable Adaptive Accessibility Engine ─────────────────── */
  const scriptEl = document.currentScript ||
    (function () {
      const scripts = document.querySelectorAll('script[src*="widget.js"]');
      return scripts.length ? scripts[scripts.length - 1] : null;
    })();

  /* ── 1. Resolve API base URL & initial language ───────────────────────── */
  let apiUrl = (scriptEl && scriptEl.dataset.apiUrl)
    ? scriptEl.dataset.apiUrl.replace(/\/$/, '')
    : '';

  // Smart resolution: If apiUrl not explicitly set, auto-detect the origin of the widget.js script itself!
  // This enables the widget to work out-of-the-box on ANY arbitrary third-party website with ZERO configuration.
  if (!apiUrl && scriptEl && scriptEl.src) {
    try {
      const scriptUrl = new URL(scriptEl.src, window.location.href);
      if (scriptUrl.origin && scriptUrl.origin !== 'null' && !scriptUrl.protocol.startsWith('file')) {
        apiUrl = scriptUrl.origin;
      }
    } catch (_) {}
  }

  // Fallback if running locally or if script origin is not HTTP/HTTPS
  if (!apiUrl && typeof window !== 'undefined' && window.location) {
    apiUrl = (window.location.port === '8080') ? 'http://localhost:8000' : window.location.origin;
  }

  window.SavannaConfig = window.SavannaConfig || {};
  window.SavannaConfig.apiUrl = apiUrl;

  (function loadA11yEngine() {
    if (window.__SAVANNA_A11Y_ENGINE__ || document.querySelector('script[src*="a11y-engine.js"]')) return;
    const a11yScript = document.createElement('script');
    let a11ySrc = (apiUrl ? apiUrl : '') + '/widget/a11y-engine.js?v=2.2.0';
    if (!apiUrl && scriptEl && scriptEl.src) {
      try {
        const u = new URL(scriptEl.src, window.location.href);
        a11ySrc = u.origin + '/widget/a11y-engine.js?v=2.2.0';
      } catch (_) {}
    }
    a11yScript.src = a11ySrc;
    a11yScript.async = true;
    (document.head || document.documentElement).appendChild(a11yScript);
  })();

  const initialLang = (scriptEl && scriptEl.dataset.lang) ? scriptEl.dataset.lang : '';

  /* ── 2. Inject persistent CSS (Isolated & Host-Resistant) ──────────────── */
  const CSS = `
    :root {
      --savanna-primary: #005fcc;
      --savanna-bg: #ffffff;
      --savanna-shadow: 0 8px 32px rgba(0,0,0,.22);
    }
    #savanna-trigger {
      all: unset !important;
      box-sizing: border-box !important;
      position: fixed !important;
      inset-block-end: 1.5rem !important;
      inset-inline-end: 1.5rem !important;
      z-index: 2147483647 !important;
      width: 3.5rem !important;
      height: 3.5rem !important;
      min-width: 3.5rem !important;
      min-height: 3.5rem !important;
      max-width: 3.5rem !important;
      max-height: 3.5rem !important;
      border-radius: 50% !important;
      background: var(--savanna-primary, #005fcc) !important;
      color: #ffffff !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      box-shadow: 0 4px 24px rgba(0,0,0,.22) !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      line-height: 1 !important;
      user-select: none !important;
      touch-action: none;
      transition: transform .2s ease, box-shadow .2s ease, background .2s ease !important;
      -webkit-tap-highlight-color: transparent !important;
    }
    #savanna-trigger svg {
      display: block !important;
      width: 28px !important;
      height: 28px !important;
      stroke: #ffffff !important;
      fill: none !important;
      pointer-events: none !important;
      margin: auto !important;
    }
    @media (prefers-reduced-motion: reduce) {
      #savanna-trigger { transition: none !important; }
    }
    #savanna-trigger:hover {
      transform: scale(1.08) !important;
      box-shadow: 0 8px 30px rgba(0,0,0,.30) !important;
    }
    #savanna-trigger:focus-visible {
      outline: 3px solid #005fcc !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 0 5px rgba(0,95,204,.35) !important;
    }
    #savanna-trigger[aria-expanded="true"] { background: #003d85 !important; }

    /* ── Responsive & Ergonomic Chat Tab Container ───────────────────────── */
    #savanna-iframe-container {
      position: fixed !important;
      inset-block-end: 5.5rem !important;
      inset-inline-end: 1.5rem !important;
      z-index: 2147483647 !important;
      width: min(380px, calc(100vw - 2rem)) !important;
      height: min(540px, calc(100vh - 6.5rem)) !important;
      max-width: calc(100vw - 1rem) !important;
      max-height: calc(100vh - 5rem) !important;
      min-width: 290px !important;
      min-height: 380px !important;
      border-radius: 1rem !important;
      box-shadow: var(--savanna-shadow) !important;
      overflow: hidden !important;
      display: none;
      background: var(--savanna-bg) !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 1px solid rgba(0,0,0,0.12) !important;
      transition: width 0.22s ease, height 0.22s ease, transform 0.22s ease !important;
    }
    #savanna-iframe-container.savanna-open { display: block !important; }

    /* Size preset: Compact / Small Chat Tab for PCs & Laptops */
    #savanna-iframe-container.savanna-compact {
      width: min(330px, calc(100vw - 1.5rem)) !important;
      height: min(430px, calc(100vh - 5.5rem)) !important;
      min-height: 340px !important;
    }

    /* Size preset: Expanded / Large View for Desktop Widescreen */
    #savanna-iframe-container.savanna-expanded {
      width: min(520px, calc(100vw - 2rem)) !important;
      height: min(680px, calc(100vh - 6.5rem)) !important;
    }

    #savanna-iframe {
      width: 100% !important;
      height: 100% !important;
      border: none !important;
      border-radius: 1rem !important;
      display: block !important;
    }
    @media (forced-colors: active) {
      #savanna-trigger { background: ButtonText !important; color: ButtonFace !important; }
      #savanna-iframe-container { border: 2px solid ButtonText !important; }
    }
    /* Small PC screens (e.g. 1366x768 laptops) */
    @media (max-height: 720px) and (min-width: 481px) {
      #savanna-iframe-container {
        inset-block-end: 4.8rem !important;
        height: min(480px, calc(100vh - 5.5rem)) !important;
      }
      #savanna-iframe-container.savanna-compact {
        height: min(390px, calc(100vh - 5.2rem)) !important;
      }
    }
    /* Mobile screens */
    @media (max-width: 480px) {
      #savanna-iframe-container,
      #savanna-iframe-container.savanna-compact,
      #savanna-iframe-container.savanna-expanded {
        inset-inline-end: 0 !important;
        inset-block-end: 4.5rem !important;
        width: 100vw !important;
        height: calc(100vh - 5rem) !important;
        border-radius: 1rem 1rem 0 0 !important;
      }
    }
  `;
  const style = document.createElement('style');
  style.textContent = CSS;
  (document.head || document.documentElement).appendChild(style);

  /* ── 3. Build trigger button ──────────────────────────────────────────── */
  const trigger = document.createElement('button');
  trigger.id = 'savanna-trigger';
  trigger.setAttribute('role', 'button');
  trigger.setAttribute('aria-label', 'Open learning assistant (Alt+A)');
  trigger.setAttribute('accesskey', 'a');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'savanna-iframe-container');
  trigger.setAttribute('tabindex', '0');
  trigger.type = 'button';

  /* Chat bubble SVG — inline, no external deps */
  trigger.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
         stroke-linejoin="round" aria-hidden="true" focusable="false">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>`;

  /* ── 4. Build iframe container ─────────────────────────────────────────── */
  const container = document.createElement('div');
  container.id = 'savanna-iframe-container';
  container.setAttribute('aria-label', 'Savanna Learning Assistant panel');

  // Apply saved size preset (compact / standard / expanded)
  let currentSize = safeStorageGet('savanna_widget_size', 'standard');
  if (currentSize === 'compact') {
    container.classList.add('savanna-compact');
  } else if (currentSize === 'expanded') {
    container.classList.add('savanna-expanded');
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'savanna-iframe';
  let iframeSrc = apiUrl + '/widget/iframe.html?api=' + encodeURIComponent(apiUrl);
  if (window.location.protocol === 'file:' && scriptEl && scriptEl.src) {
    iframeSrc = scriptEl.src.replace(/widget\.js(\?.*)?$/, 'iframe.html') + '?api=' + encodeURIComponent(apiUrl);
  }
  if (initialLang) {
    iframeSrc += '&lang=' + encodeURIComponent(initialLang);
  }
  iframeSrc += (iframeSrc.includes('?') ? '&' : '?') + 'v=2.8.3';
  iframe.src = iframeSrc;
  iframe.title = 'Savanna Learning Assistant';
  iframe.setAttribute('allow', 'microphone; display-capture');
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals');
  container.appendChild(iframe);

  /* Safe mounting: Guaranteed to work even if script is placed in <head> on arbitrary websites */
  function mountSavannaWidget() {
    if (window.__SAVANNA_WIDGET_MOUNTED__) return;
    if (!document.body) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountSavannaWidget);
      } else {
        setTimeout(mountSavannaWidget, 50);
      }
      return;
    }
    window.__SAVANNA_WIDGET_MOUNTED__ = true;
    document.body.appendChild(trigger);
    document.body.appendChild(container);
    restoreTriggerPosition();
  }

  mountSavannaWidget();

  /* ── 5. Pedagogical Host Context Extractor ──────────────────────────────── */
  function extractPageContext() {
    let title = document.title || '';

    // Find active or nearest heading in viewport
    let activeHeading = '';
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, [role="heading"]'));
    if (headings.length > 0) {
      let closest = headings[0];
      let minDistance = Infinity;
      for (const h of headings) {
        const rect = h.getBoundingClientRect();
        if (rect.top >= -50 && rect.top <= window.innerHeight * 0.6) {
          closest = h;
          break;
        }
        const dist = Math.abs(rect.top);
        if (dist < minDistance) {
          minDistance = dist;
          closest = h;
        }
      }
      activeHeading = closest ? (closest.textContent || '').trim().replace(/\s+/g, ' ') : '';
    }

    // Selected text if any
    let selection = '';
    try {
      const sel = window.getSelection();
      if (sel && sel.toString()) {
        selection = sel.toString().trim();
      }
    } catch (_) {}

    // Universal content excerpt from semantic main, article, or content containers
    let summary = '';
    const mainContent = document.querySelector('main, article, [role="main"], #content, #main-content, .course-content, .lesson-content, .entry-content, .post-content, .content, .savanna-styles') || document.body;
    if (mainContent) {
      try {
        const clone = mainContent.cloneNode(true);
        const toRemove = clone.querySelectorAll('script, style, noscript, svg, #savanna-iframe-container, #savanna-trigger, nav, header, footer, [role="navigation"], [role="banner"], [role="contentinfo"]');
        toRemove.forEach(function (el) { el.remove(); });
        summary = (clone.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 1500);
      } catch (_) {}
    }

    return {
      title: title,
      active_heading: activeHeading,
      selected_text: selection,
      summary: summary,
      url: window.location.href
    };
  }

  /* ── 3.1 Draggable / Repositionable Floating Trigger ───────────────────── */
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let hasMoved = false;
  let btnStartX = 0;
  let btnStartY = 0;

  function restoreTriggerPosition() {
    try {
      const saved = safeStorageGet('savanna_trigger_pos');
      if (saved) {
        const pos = JSON.parse(saved);
        if (typeof pos.bottom === 'number' && typeof pos.right === 'number') {
          const b = Math.min(Math.max(16, pos.bottom), window.innerHeight - 70);
          const r = Math.min(Math.max(16, pos.right), window.innerWidth - 70);
          trigger.style.bottom = b + 'px';
          trigger.style.right = r + 'px';
          trigger.style.top = 'auto';
          trigger.style.left = 'auto';
        }
      }
    } catch (_) {}
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    isDragging = true;
    hasMoved = false;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    dragStartX = clientX;
    dragStartY = clientY;
    const rect = trigger.getBoundingClientRect();
    btnStartX = rect.left;
    btnStartY = rect.top;
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    const dx = clientX - dragStartX;
    const dy = clientY - dragStartY;
    if (Math.hypot(dx, dy) > 6) {
      hasMoved = true;
      const newLeft = Math.min(Math.max(10, btnStartX + dx), window.innerWidth - 66);
      const newTop = Math.min(Math.max(10, btnStartY + dy), window.innerHeight - 66);
      trigger.style.left = newLeft + 'px';
      trigger.style.top = newTop + 'px';
      trigger.style.right = 'auto';
      trigger.style.bottom = 'auto';
    }
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    if (hasMoved) {
      try {
        const rect = trigger.getBoundingClientRect();
        safeStorageSet('savanna_trigger_pos', JSON.stringify({
          right: window.innerWidth - rect.right,
          bottom: window.innerHeight - rect.bottom
        }));
      } catch (_) {}
    }
  }

  trigger.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  trigger.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp);

  /* ── 4.1 Widget Size Preset Management ─────────────────────────────────── */
  function applyWidgetSize(size) {
    if (!['compact', 'standard', 'expanded'].includes(size)) {
      size = (currentSize === 'compact') ? 'standard' : 'compact';
    }
    currentSize = size;
    safeStorageSet('savanna_widget_size', size);
    container.classList.remove('savanna-compact', 'savanna-expanded');
    if (size === 'compact') {
      container.classList.add('savanna-compact');
    } else if (size === 'expanded') {
      container.classList.add('savanna-expanded');
    }
    try {
      iframe.contentWindow && iframe.contentWindow.postMessage({ type: 'size_changed', size: size }, '*');
    } catch (_) {}
  }

  /* ── 6. Open / close logic ─────────────────────────────────────────────── */
  let isOpen = false;

  function openWidget() {
    isOpen = true;
    container.classList.add('savanna-open');
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-label', 'Close learning assistant (Alt+A)');

    const context = extractPageContext();
    iframe.contentWindow && iframe.contentWindow.postMessage({
      type: 'page_context',
      context: context,
      size: currentSize
    }, '*');

    /* Focus into iframe via postMessage */
    iframe.contentWindow && iframe.contentWindow.postMessage({ type: 'focus' }, '*');
  }

  function closeWidget() {
    isOpen = false;
    container.classList.remove('savanna-open');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', 'Open learning assistant (Alt+A)');
    trigger.focus();
  }

  function toggleWidget() {
    isOpen ? closeWidget() : openWidget();
  }

  trigger.addEventListener('click', function (e) {
    if (hasMoved) {
      hasMoved = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    toggleWidget();
  });
  trigger.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleWidget();
    }
  });

  /* Global Keyboard Shortcut: Alt + A toggles assistant from anywhere on page */
  window.addEventListener('keydown', function (e) {
    if (e.altKey && (e.key === 'a' || e.key === 'A' || e.code === 'KeyA') && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      toggleWidget();
    }
  });

  /* Update iframe when user selects text on the host page */
  document.addEventListener('selectionchange', function () {
    if (!isOpen) return;
    try {
      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : '';
      iframe.contentWindow && iframe.contentWindow.postMessage({
        type: 'selection_change',
        selected_text: text
      }, '*');
    } catch (_) {}
  });

  /* ── 7. postMessage listener (from iframe) ─────────────────────────────── */
  window.addEventListener('message', function (event) {
    /* Accept messages from same origin or the configured API origin */
    let allowedOrigin = '';
    try {
      allowedOrigin = new URL(apiUrl, window.location.href).origin;
    } catch (_) {}
    if (event.origin !== window.location.origin && event.origin !== allowedOrigin && allowedOrigin) return;
    if (!event.data || typeof event.data !== 'object') return;

    if (event.data.type === 'close') {
      closeWidget();
    } else if (event.data.type === 'request_context') {
      iframe.contentWindow && iframe.contentWindow.postMessage({
        type: 'page_context',
        context: extractPageContext(),
        size: currentSize
      }, '*');
    } else if (event.data.type === 'set_size' || event.data.type === 'savanna:set_size') {
      applyWidgetSize(event.data.size);
    } else if (event.data.type === 'savanna:lang_change' && event.data.lang) {
      safeStorageSet('savanna_lang', event.data.lang);
      window.dispatchEvent(new CustomEvent('savanna:language_changed', { detail: { lang: event.data.lang } }));
    } else if (event.data.type === 'db-assistant:question') {
      const qEvt = new CustomEvent('db-assistant:question', {
        bubbles: true,
        composed: true,
        detail: {
          text: event.data.text || event.data.question,
          question: event.data.question || event.data.text,
          language: event.data.language
        }
      });
      document.dispatchEvent(qEvt);
      window.dispatchEvent(qEvt);
      const hostElem = document.querySelector('db-assistant');
      if (hostElem) hostElem.dispatchEvent(qEvt);
    } else if (event.data.type === 'db-assistant:escalated') {
      const escEvt = new CustomEvent('db-assistant:escalated', {
        bubbles: true,
        composed: true,
        detail: {
          ticketId: event.data.ticketId,
          conversation: event.data.conversation
        }
      });
      document.dispatchEvent(escEvt);
      window.dispatchEvent(escEvt);
      const hostElem = document.querySelector('db-assistant');
      if (hostElem) hostElem.dispatchEvent(escEvt);
    }
  });

  // Allow host window to set language via CustomEvent
  window.addEventListener('savanna:set_language', function (e) {
    if (e.detail && e.detail.lang) {
      iframe.contentWindow && iframe.contentWindow.postMessage({ type: 'set_lang', lang: e.detail.lang }, '*');
    }
  });

  /* ── 8. Escape key closes widget ──────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeWidget();
  });

  /* ── 8. Built-in Focus Reader / Self-Voicing on Host Page ─────────────── */
  const VOICE_GUIDE_KEY = 'savanna_voice_guide';
  const BCP47_HOST = {
    'en': 'en-US',
    'am': 'am-ET',
    'ti': 'ti-ET',
    'ar': 'ar-SA',
    'om': 'om-ET',
    'so': 'so-SO',
    'sw': 'sw-KE',
    'fr': 'fr-FR'
  };

  function safeStorageGet(key, fallback = null) {
    try {
      const val = window.localStorage ? window.localStorage.getItem(key) : null;
      return (val !== null && val !== undefined) ? val : fallback;
    } catch (_) {
      return fallback;
    }
  }
  function safeStorageSet(key, val) {
    try {
      if (window.localStorage) window.localStorage.setItem(key, val);
    } catch (_) {}
  }

  function isVoiceGuideEnabled() {
    return safeStorageGet(VOICE_GUIDE_KEY) !== 'false';
  }

  let activeHostAudio = null;
  let hostSpeechAbort = null;
  let hostFocusTimer = null;
  const hostAudioCache = new Map();

  async function speakHost(text) {
    if (!isVoiceGuideEnabled() || !text) return;
    const currentLang = safeStorageGet('savanna_lang', 'en');
    const bcp47 = BCP47_HOST[currentLang] || 'en-US';

    // 1. Check if browser has a matching local voice for this language (0ms native Web Speech)
    if (window.speechSynthesis && window.speechSynthesis.getVoices) {
      try {
        const voices = window.speechSynthesis.getVoices();
        const prefix = currentLang.toLowerCase();
        const hasVoice = voices.some(function (v) {
          return v.lang && v.lang.toLowerCase().startsWith(prefix);
        });
        if (hasVoice) {
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(text);
          utt.lang = bcp47;
          utt.rate = 1.0;
          window.speechSynthesis.speak(utt);
          return;
        }
      } catch (_) {}
    }

    // 2. Client-side memory cache check (0ms instant playback)
    const cacheKey = currentLang + ':' + text;
    if (hostAudioCache.has(cacheKey)) {
      try {
        if (activeHostAudio) {
          activeHostAudio.pause();
          activeHostAudio = null;
        }
        activeHostAudio = new Audio(hostAudioCache.get(cacheKey));
        activeHostAudio.play().catch(function () {});
        return;
      } catch (_) {}
    }

    // 3. Otherwise stream synthesized neural audio with abort capability
    try {
      if (hostSpeechAbort) {
        hostSpeechAbort.abort();
      }
      hostSpeechAbort = new AbortController();

      if (activeHostAudio) {
        activeHostAudio.pause();
        activeHostAudio = null;
      }

      const base = apiUrl.replace(/\/api$/, '');
      const endpoint = base + '/speech/synthesize';
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, language: currentLang }),
        signal: hostSpeechAbort.signal
      });
      if (resp.ok) {
        const blob = await resp.blob();
        const audioUrl = URL.createObjectURL(blob);
        hostAudioCache.set(cacheKey, audioUrl);
        activeHostAudio = new Audio(audioUrl);
        activeHostAudio.onended = function () {
          activeHostAudio = null;
        };
        activeHostAudio.play().catch(function () {});
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.debug('[Savanna widget] Speech notice:', err);
      }
    }
  }

  const I18N_ROLES = {
    en: { button: 'button', link: 'link', edit: 'edit text', para: 'paragraph', heading: 'heading', list: 'list item', expanded: 'expanded', collapsed: 'collapsed', pressed: 'pressed', notPressed: 'not pressed' },
    am: { button: 'አዝራር', link: 'አገናኝ', edit: 'የፅሑፍ ማስገቢያ', para: 'አንቀጽ', heading: 'ርዕስ', list: 'ዝርዝር ንጥል', expanded: 'ተከፍቷል', collapsed: 'ተዘግቷል', pressed: 'ነቅቷል', notPressed: 'ጠፍቷል' },
    om: { button: 'qabduu', link: 'hidhata', edit: 'galmee barreeffamaa', para: 'keeyyata', heading: 'mata duree', list: 'miseensa tarree', expanded: "bal'ateera", collapsed: "dudduubatti deebi'eera", pressed: 'cuqaasameera', notPressed: 'hin cuqaasamne' },
    ti: { button: 'መልጎም', link: 'መላገቢ', edit: 'መእተዊ ጽሑፍ', para: 'ዓንቀጽ', heading: 'ኣርእስቲ', list: 'ንጥሪ ዝርዝር', expanded: 'ተዘርጊሑ', collapsed: 'ተዓጺፉ', pressed: 'ተጠዊቑ', notPressed: 'ኣይተጠወቐን' },
    so: { button: 'badhan', link: 'xiriir', edit: 'meel qoraal', para: 'faqradda', heading: 'cinwaanka', list: 'shayga liiska', expanded: 'la fidiyay', collapsed: 'la laabay', pressed: 'la riixay', notPressed: 'aan la riixin' },
    ar: { button: 'زر', link: 'رابط', edit: 'إدخال نص', para: 'فقرة', heading: 'عنوان', list: 'عنصر قائمة', expanded: 'موسع', collapsed: 'مطوي', pressed: 'مضغوط', notPressed: 'غير مضغوط' },
    sw: { button: 'kitufe', link: 'kiungo', edit: 'uandishi wa maandishi', para: 'aya', heading: 'kichwa', list: 'kipengee cha orodha', expanded: 'imepanuliwa', collapsed: 'imekunjwa', pressed: 'imebonyezwa', notPressed: 'haijabonyezwa' },
    fr: { button: 'bouton', link: 'lien', edit: 'champ de texte', para: 'paragraphe', heading: 'titre', list: 'élément de liste', expanded: 'développé', collapsed: 'réduit', pressed: 'enfoncé', notPressed: 'non enfoncé' }
  };

  function getHostElementDescription(el) {
    if (!el || el === document.body || el === document.documentElement) return null;
    if (el.dataset && (el.dataset.sa11yBound || el.dataset.sa11yTextBound)) return null;

    const curLang = safeStorageGet('savanna_lang', 'en');
    const r = I18N_ROLES[curLang] || I18N_ROLES.en;

    let label = el.getAttribute('aria-label') || '';
    if (!label && el.placeholder) label = el.placeholder;
    if (!label && el.innerText && el.innerText.trim().length > 0) {
      label = el.innerText.trim();
    }
    const cleanLabel = label.replace(/\s+/g, ' ').trim();
    if (curLang !== 'en') {
      const dynMap = (window.SavannaA11y && typeof window.SavannaA11y.getDynamicTranslations === 'function')
        ? window.SavannaA11y.getDynamicTranslations(curLang)
        : null;
      if (dynMap && dynMap[cleanLabel]) {
        label = dynMap[cleanLabel];
      }
    }
    let role = el.getAttribute('role');
    if (!role) {
      const tag = el.tagName;
      if (tag === 'BUTTON') role = r.button;
      else if (tag === 'A') role = r.link;
      else if (tag === 'INPUT' || tag === 'TEXTAREA') role = r.edit;
      else if (tag === 'P') role = r.para;
      else if (/^H[1-6]$/.test(tag)) role = r.heading;
      else if (tag === 'LI') role = r.list;
    }
    const states = [];
    if (el.hasAttribute('aria-expanded')) {
      states.push(el.getAttribute('aria-expanded') === 'true' ? r.expanded : r.collapsed);
    }
    if (el.hasAttribute('aria-pressed')) {
      states.push(el.getAttribute('aria-pressed') === 'true' ? r.pressed : r.notPressed);
    }
    if (!label && !role) return null;
    return [label, role, states.join(', ')].filter(Boolean).join(', ');
  }

  // Speak trigger button specifically when focused
  trigger.addEventListener('focus', function () {
    const curLang = safeStorageGet('savanna_lang', 'en');
    const triggerDescs = {
      'en': isOpen ? 'Close learning assistant, button, expanded' : 'Open learning assistant, button, collapsed',
      'am': isOpen ? 'ረዳትን ዝጋ፣ አዝራር፣ ተከፍቷል' : 'ረዳትን ክፈት፣ አዝራር፣ ተዘግቷል',
      'om': isOpen ? "Gargaaraa cufi, qabduu, bal'ateera" : "Gargaaraa bani, qabduu, dudduubatti deebi'eera",
      'ti': isOpen ? 'ሓጋዚ ዕጸዉ፣ መልጎም፣ ተዘርጊሑ' : 'ሓጋዚ ክፈቱ፣ መልጎም፣ ተዓጺፉ',
      'so': isOpen ? 'Xir kaaliyaha, badhan, la fidiyay' : 'Fur kaaliyaha, badhan, la laabay',
      'ar': isOpen ? 'إغلاق المساعد، زر، موسع' : 'فتح المساعد، زر، مطوي',
      'sw': isOpen ? 'Funga msaidizi, kitufe, imepanuliwa' : 'Fungua msaidizi, kitufe, imekunjwa',
      'fr': isOpen ? "Fermer l'assistant, bouton, développé" : "Ouvrir l'assistant, bouton, réduit"
    };
    const desc = triggerDescs[curLang] || triggerDescs['en'];
    speakHost(desc);
  });

  // Catch host page focus on interactive elements during Tab navigation
  let isKeyboardNav = false;
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') isKeyboardNav = true;
  });
  window.addEventListener('mousedown', function () {
    isKeyboardNav = false;
  });

  document.addEventListener('focusin', function (e) {
    if (e.target === trigger) return;
    if (isKeyboardNav) {
      const desc = getHostElementDescription(e.target);
      if (!desc) return;
      if (hostFocusTimer) clearTimeout(hostFocusTimer);
      hostFocusTimer = setTimeout(function () {
        speakHost(desc);
      }, 350);
    }
  });

  // On-demand speech cache for host interactive cues (no background network flooding)

  /* ── 9. Double-Space Shortcut for Live Help Desk ───────────────────────── */
  let lastSpaceTime = 0;
  window.addEventListener('keydown', function (e) {
    if (e.key === ' ' || e.code === 'Space') {
      const targetTag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
      const isInput = targetTag === 'INPUT' || targetTag === 'TEXTAREA';
      // If typing inside an input with text, allow normal typing
      if (isInput && e.target.value && e.target.value.trim().length > 0) {
        return;
      }
      const now = Date.now();
      if (now - lastSpaceTime < 450) {
        e.preventDefault();
        lastSpaceTime = 0;
        openWidgetWithEscalation();
      } else {
        lastSpaceTime = now;
      }
    }
  });

  function openWidgetWithEscalation() {
    if (!isOpen) {
      openWidget();
    }
    speakHost('Opening Live Help Desk');
    setTimeout(function () {
      iframe.contentWindow && iframe.contentWindow.postMessage({ type: 'open_escalate' }, '*');
    }, 150);
  }

  /* ── 10. Web Component: <db-assistant> (Level 1 Technical Guide Contract) ─ */
  if (typeof customElements !== 'undefined' && !customElements.get('db-assistant')) {
    class DbAssistant extends HTMLElement {
      static get observedAttributes() {
        return ['lang', 'api', 'content', 'theme'];
      }

      connectedCallback() {
        this.applyAttributes();
      }

      attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
          this.applyAttributes();
        }
      }

      applyAttributes() {
        const lang = this.getAttribute('lang');
        const api = this.getAttribute('api');
        const content = this.getAttribute('content');

        if (lang) {
          safeStorageSet('savanna_lang', lang);
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'set_lang', lang: lang }, '*');
          }
        }
        if (api) {
          let cleanApi = api.replace(/\/$/, '');
          if (cleanApi.includes('localhost') && typeof window !== 'undefined' && window.location) {
            const h = window.location.hostname;
            if (h !== 'localhost' && h !== '127.0.0.1' && h !== '') {
              cleanApi = window.location.origin;
            }
          }
          window.SavannaConfig = window.SavannaConfig || {};
          window.SavannaConfig.apiUrl = cleanApi;
        }
        if (content && (typeof fetch === 'function' || (typeof window !== 'undefined' && typeof window.fetch === 'function'))) {
          const fetchFn = typeof fetch === 'function' ? fetch : window.fetch;
          const targetApi = (window.SavannaConfig && window.SavannaConfig.apiUrl) || apiUrl;
          fetchFn(content)
            .then(res => res.json())
            .then(data => {
              const lessons = Array.isArray(data) ? data : (data.lessons || [data]);
              fetchFn(targetApi + '/api/v1/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessons: lessons })
              }).catch(() => {});
            })
            .catch(() => {});
        }
      }
    }
    customElements.define('db-assistant', DbAssistant);
  }
})();
