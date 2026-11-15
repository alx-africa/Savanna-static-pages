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
    Array.from(document.querySelectorAll('script[src*="widget.js"]')).pop();

  (function loadA11yEngine() {
    if (window.__SAVANNA_A11Y_ENGINE__ || document.querySelector('script[src*="a11y-engine.js"]')) return;
    const a11yScript = document.createElement('script');
    let a11ySrc = '/widget/a11y-engine.js?v=2.2.0';
    if (scriptEl && scriptEl.src) {
      try {
        const u = new URL(scriptEl.src);
        a11ySrc = u.origin + '/widget/a11y-engine.js?v=2.2.0';
      } catch (_) {}
    }
    a11yScript.src = a11ySrc;
    a11yScript.async = true;
    document.head.appendChild(a11yScript);
  })();

  /* ── 1. Resolve API base URL & initial language ───────────────────────── */
  const apiUrl = (scriptEl && scriptEl.dataset.apiUrl)
    ? scriptEl.dataset.apiUrl.replace(/\/$/, '')
    : (window.location.origin + '/api');

  window.SavannaConfig = window.SavannaConfig || {};
  window.SavannaConfig.apiUrl = apiUrl;

  const initialLang = (scriptEl && scriptEl.dataset.lang) ? scriptEl.dataset.lang : '';

  /* ── 2. Inject persistent CSS ─────────────────────────────────────────── */
  const CSS = `
    :root {
      --savanna-primary: #005fcc;
      --savanna-bg: #ffffff;
      --savanna-shadow: 0 4px 24px rgba(0,0,0,.18);
    }
    #savanna-trigger {
      all: unset;
      position: fixed;
      inset-block-end: 1.5rem;
      inset-inline-end: 1.5rem;
      z-index: 2147483646;
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 50%;
      background: var(--savanna-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: var(--savanna-shadow);
      transition: transform .2s ease, box-shadow .2s ease;
    }
    @media (prefers-reduced-motion: reduce) {
      #savanna-trigger { transition: none; }
    }
    #savanna-trigger:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(0,0,0,.24); }
    #savanna-trigger:focus-visible {
      outline: 3px solid #005fcc;
      outline-offset: 3px;
      box-shadow: 0 0 0 5px rgba(0,95,204,.35);
    }
    #savanna-trigger[aria-expanded="true"] { background: #003d85; }
    #savanna-iframe-container {
      position: fixed;
      inset-block-end: 6rem;
      inset-inline-end: 1.5rem;
      z-index: 2147483645;
      width: min(400px, calc(100vw - 2rem));
      height: min(600px, calc(100vh - 8rem));
      border-radius: 1rem;
      box-shadow: var(--savanna-shadow);
      overflow: hidden;
      display: none;
      background: var(--savanna-bg);
    }
    #savanna-iframe-container.savanna-open { display: block; }
    #savanna-iframe {
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 1rem;
    }
    @media (forced-colors: active) {
      #savanna-trigger { background: ButtonText; color: ButtonFace; }
      #savanna-iframe-container { border: 2px solid ButtonText; }
    }
    @media (max-width: 480px) {
      #savanna-iframe-container {
        inset-inline-end: 0;
        inset-block-end: 5rem;
        width: 100vw;
        height: calc(100vh - 5.5rem);
        border-radius: 1rem 1rem 0 0;
      }
    }
  `;
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  /* ── 3. Build trigger button ──────────────────────────────────────────── */
  const trigger = document.createElement('button');
  trigger.id = 'savanna-trigger';
  trigger.setAttribute('role', 'button');
  trigger.setAttribute('aria-label', 'Open learning assistant');
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

  const iframe = document.createElement('iframe');
  iframe.id = 'savanna-iframe';
  let iframeSrc = apiUrl + '/widget/iframe.html?api=' + encodeURIComponent(apiUrl);
  if (window.location.protocol === 'file:' && scriptEl && scriptEl.src) {
    iframeSrc = scriptEl.src.replace(/widget\.js(\?.*)?$/, 'iframe.html') + '?api=' + encodeURIComponent(apiUrl);
  }
  if (initialLang) {
    iframeSrc += '&lang=' + encodeURIComponent(initialLang);
  }
  iframe.src = iframeSrc;
  iframe.title = 'Savanna Learning Assistant';
  iframe.setAttribute('allow', 'microphone; display-capture');
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
  container.appendChild(iframe);

  document.body.appendChild(trigger);
  document.body.appendChild(container);

  /* ── 5. Open / close logic ─────────────────────────────────────────────── */
  let isOpen = false;

  function openWidget() {
    isOpen = true;
    container.classList.add('savanna-open');
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-label', 'Close learning assistant');
    /* Focus into iframe via postMessage */
    iframe.contentWindow && iframe.contentWindow.postMessage({ type: 'focus' }, '*');
  }

  function closeWidget() {
    isOpen = false;
    container.classList.remove('savanna-open');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', 'Open learning assistant');
    trigger.focus();
  }

  function toggleWidget() {
    isOpen ? closeWidget() : openWidget();
  }

  trigger.addEventListener('click', toggleWidget);
  trigger.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleWidget();
    }
  });

  /* ── 6. postMessage listener (from iframe) ─────────────────────────────── */
  window.addEventListener('message', function (event) {
    /* Accept messages from same origin or the configured API origin */
    const allowedOrigin = new URL(apiUrl).origin;
    if (event.origin !== window.location.origin && event.origin !== allowedOrigin) return;
    if (!event.data || typeof event.data !== 'object') return;

    if (event.data.type === 'close') {
      closeWidget();
    } else if (event.data.type === 'resize' && typeof event.data.height === 'number') {
      const maxH = window.innerHeight - 128;
      const clampedH = Math.min(Math.max(event.data.height, 200), maxH);
      container.style.height = clampedH + 'px';
    } else if (event.data.type === 'savanna:lang_change' && event.data.lang) {
      // Synchronize language change with host page and a11y engine
      window.dispatchEvent(new CustomEvent('savanna:language_changed', { detail: { lang: event.data.lang } }));
    } else if (event.data.type === 'db-assistant:question') {
      const qEvt = new CustomEvent('db-assistant:question', {
        bubbles: true,
        composed: true,
        detail: { question: event.data.question, language: event.data.language }
      });
      document.dispatchEvent(qEvt);
      const hostElem = document.querySelector('db-assistant');
      if (hostElem) hostElem.dispatchEvent(qEvt);
    } else if (event.data.type === 'db-assistant:escalated') {
      const escEvt = new CustomEvent('db-assistant:escalated', {
        bubbles: true,
        composed: true,
        detail: { ticketId: event.data.ticketId, conversation: event.data.conversation }
      });
      document.dispatchEvent(escEvt);
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

  /* ── 7. Escape key closes widget ──────────────────────────────────────── */
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

  function isVoiceGuideEnabled() {
    return localStorage.getItem(VOICE_GUIDE_KEY) !== 'false';
  }

  let activeHostAudio = null;
  let hostSpeechAbort = null;
  let hostFocusTimer = null;
  const hostAudioCache = new Map();

  // Instant pre-cached audio assets for standard navigation cues (0ms latency, 100% offline)
  const PRESET_AUDIO_MAP = {
    'ረዳትን ክፈት፣ አዝራር፣ ተዘግቷል': '/assets/audio/nav/trigger_open.mp3',
    'ረዳትን ዝጋ፣ አዝራር፣ ተከፍቷል': '/assets/audio/nav/trigger_close.mp3',
    'አዝራር': '/assets/audio/nav/role_button.mp3',
    'አገናኝ': '/assets/audio/nav/role_link.mp3',
    'የፅሑፍ ማስገቢያ': '/assets/audio/nav/role_edit.mp3',
    'ርዕስ': '/assets/audio/nav/role_heading.mp3',
    'ዝርዝር': '/assets/audio/nav/role_list.mp3'
  };

  async function speakHost(text) {
    if (!isVoiceGuideEnabled() || !text) return;
    const currentLang = localStorage.getItem('savanna_lang') || 'en';
    const bcp47 = BCP47_HOST[currentLang] || 'en-US';

    // 0. Instant static preset check (0ms latency, runs offline)
    if (PRESET_AUDIO_MAP[text]) {
      try {
        if (activeHostAudio) {
          activeHostAudio.pause();
          activeHostAudio = null;
        }
        activeHostAudio = new Audio(PRESET_AUDIO_MAP[text]);
        activeHostAudio.play().catch(function () {});
        return;
      } catch (_) {}
    }

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
    en: { button: 'button', link: 'link', edit: 'edit text', para: 'paragraph', heading: 'heading level ', list: 'list item', expanded: 'expanded', collapsed: 'collapsed', pressed: 'pressed', notPressed: 'not pressed' },
    am: { button: 'አዝራር', link: 'አገናኝ', edit: 'የፅሑፍ ማስገቢያ', para: 'አንቀጽ', heading: 'ርዕስ ደረጃ ', list: 'ዝርዝር ንጥል', expanded: 'ተከፍቷል', collapsed: 'ተዘግቷል', pressed: 'ነቅቷል', notPressed: 'ጠፍቷል' },
    om: { button: 'qabduu', link: 'hidhata', edit: 'galmee barreeffamaa', para: 'keeyyata', heading: 'sadarkaa mata duree ', list: 'miseensa tarree', expanded: "bal'ateera", collapsed: "dudduubatti deebi'eera", pressed: 'cuqaasameera', notPressed: 'hin cuqaasamne' },
    ti: { button: 'መልጎም', link: 'መላገቢ', edit: 'መእተዊ ጽሑፍ', para: 'ዓንቀጽ', heading: 'ደረጃ ኣርእስቲ ', list: 'ንጥሪ ዝርዝር', expanded: 'ተዘርጊሑ', collapsed: 'ተዓጺፉ', pressed: 'ተጠዊቑ', notPressed: 'ኣይተጠወቐን' },
    so: { button: 'badhan', link: 'xiriir', edit: 'meel qoraal', para: 'faqradda', heading: 'heerka cinwaanka ', list: 'shayga liiska', expanded: 'la fidiyay', collapsed: 'la laabay', pressed: 'la riixay', notPressed: 'aan la riixin' },
    ar: { button: 'زر', link: 'رابط', edit: 'إدخال نص', para: 'فقرة', heading: 'عنوان مستوى ', list: 'عنصر قائمة', expanded: 'موسع', collapsed: 'مطوي', pressed: 'مضغوط', notPressed: 'غير مضغوط' },
    sw: { button: 'kitufe', link: 'kiungo', edit: 'uandishi wa maandishi', para: 'aya', heading: 'kiwango cha kichwa ', list: 'kipengee cha orodha', expanded: 'imepanuliwa', collapsed: 'imekunjwa', pressed: 'imebonyezwa', notPressed: 'haijabonyezwa' },
    fr: { button: 'bouton', link: 'lien', edit: 'champ de texte', para: 'paragraphe', heading: 'titre de niveau ', list: 'élément de liste', expanded: 'développé', collapsed: 'réduit', pressed: 'enfoncé', notPressed: 'non enfoncé' }
  };

  function getHostElementDescription(el) {
    if (!el || el === document.body || el === document.documentElement) return null;
    if (el.dataset && (el.dataset.sa11yBound || el.dataset.sa11yTextBound)) return null;

    const curLang = localStorage.getItem('savanna_lang') || 'en';
    const r = I18N_ROLES[curLang] || I18N_ROLES.en;

    const COMMON_AMHARIC_LABELS = {
      'Skip to main content': 'ወደ ዋናው ይዘት ይለፉ',
      'Toggle navigation menu': 'የአሰሳ ምናሌ',
      'Home': 'መነሻ',
      'Access my learning': 'ትምህርቴን ጀምር',
      'My courses': 'የእኔ ኮርሶች',
      'Concepts': 'ጽንሰ-ሐሳቦች',
      'Close': 'ዝጋ',
      'Open': 'ክፈት',
      'Next': 'ቀጣይ',
      'Previous': 'ቀዳሚ'
    };

    let label = el.getAttribute('aria-label') || '';
    if (!label && el.placeholder) label = el.placeholder;
    if (!label && el.innerText && el.innerText.trim().length > 0) {
      label = el.innerText.trim();
    }
    if (curLang === 'am' && COMMON_AMHARIC_LABELS[label]) {
      label = COMMON_AMHARIC_LABELS[label];
    }
    let role = el.getAttribute('role');
    if (!role) {
      const tag = el.tagName;
      if (tag === 'BUTTON') role = r.button;
      else if (tag === 'A') role = r.link;
      else if (tag === 'INPUT' || tag === 'TEXTAREA') role = r.edit;
      else if (tag === 'P') role = r.para;
      else if (/^H[1-6]$/.test(tag)) role = r.heading + tag[1];
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
    const curLang = localStorage.getItem('savanna_lang') || 'en';
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
      }, 75);
    }
  });

  // Prewarm host page interactive cues in background for zero-latency Tab speech
  function prewarmHostNavigation() {
    const curLang = localStorage.getItem('savanna_lang') || 'en';
    if (curLang === 'en') return;
    const elements = document.querySelectorAll('a, button, input, [role="button"], [tabindex="0"]');
    const seen = new Set();
    let delay = 300;
    for (let i = 0; i < elements.length && i < 20; i++) {
      const desc = getHostElementDescription(elements[i]);
      if (desc && !seen.has(desc) && !PRESET_AUDIO_MAP[desc]) {
        seen.add(desc);
        setTimeout(function () {
          const cacheKey = curLang + ':' + desc;
          if (!hostAudioCache.has(cacheKey)) {
            const base = apiUrl.replace(/\/api$/, '');
            fetch(base + '/speech/synthesize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: desc, language: curLang })
            }).then(function (res) {
              if (res.ok) return res.blob();
            }).then(function (blob) {
              if (blob) hostAudioCache.set(cacheKey, URL.createObjectURL(blob));
            }).catch(function () {});
          }
        }, delay);
        delay += 100;
      }
    }
  }

  if (document.readyState === 'complete') {
    setTimeout(prewarmHostNavigation, 1000);
  } else {
    window.addEventListener('load', function () {
      setTimeout(prewarmHostNavigation, 1000);
    });
  }

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
      connectedCallback() {
        const lang = this.getAttribute('lang');
        const api = this.getAttribute('api');
        const content = this.getAttribute('content');

        if (lang) {
          localStorage.setItem('savanna_lang', lang);
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'set_lang', lang: lang }, '*');
          }
        }
        if (api) {
          window.SavannaConfig = window.SavannaConfig || {};
          window.SavannaConfig.apiUrl = api.replace(/\/$/, '');
        }
        if (content) {
          fetch(content)
            .then(res => res.json())
            .then(data => {
              const lessons = Array.isArray(data) ? data : (data.lessons || [data]);
              fetch((window.SavannaConfig.apiUrl || apiUrl) + '/api/v1/content', {
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
