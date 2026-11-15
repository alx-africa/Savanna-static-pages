/**
 * Automated test suite for Track 3: Multilingualism — Phase 1
 * Verifies:
 *  1. Complete 8-language localization coverage in iframe.html.
 *  2. RTL layout direction applied for Arabic.
 *  3. Elimination of undeclared variable runtime exceptions.
 *  4. Pluggable data-lang parsing in widget.js.
 *  5. Privacy-preserving regional language suggestion banner functionality.
 */
const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

function runMultilingualTests() {
  console.log('----------------------------------------------------');
  console.log('Track 3: Multilingualism — Phase 1 Test Suite');
  console.log('----------------------------------------------------');

  const htmlPath = path.join(__dirname, '..', 'widget', 'iframe.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      process.exitCode = 1;
    } else {
      console.log(`✔ PASS: ${message}`);
      passed++;
    }
  }

  // 1. Verify absence of 'isAmharic' in iframe.html
  assert(!html.includes('isAmharic'), 'iframe.html contains 0 occurrences of undeclared isAmharic');

  // 2. Test DOM execution & all 8 languages in JSDOM
  const virtualConsole = new jsdom.VirtualConsole();
  const errors = [];
  virtualConsole.on('error', (err) => errors.push(err));
  virtualConsole.on('jsdomError', (err) => errors.push(err));

  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'http://localhost/widget/iframe.html?api=http://localhost:8000&lang=om',
    virtualConsole
  });

  const { window } = dom;
  const { document } = window;

  // Check no script execution errors were thrown during boot
  assert(errors.length === 0, 'iframe.html boots without any uncaught JavaScript exceptions');

  // Check initial language derived from URL param ?lang=om
  const htmlEl = document.documentElement;
  assert(htmlEl.getAttribute('lang') === 'om', 'Initial language correctly adopted from URL query param (?lang=om)');
  assert(document.getElementById('widget-title').textContent === 'Gargaaraa Savanna', 'Title correctly localized to Afaan Oromoo');
  assert(document.getElementById('send-btn-label').textContent === 'Ergi', 'Send button correctly localized to "Ergi" in Oromo');

  // 3. Test Language Switching across all 8 languages
  const testMatrix = [
    { code: 'en', dir: 'ltr', title: 'Savanna Assistant', send: 'Send' },
    { code: 'am', dir: 'ltr', title: 'ሳቫና ረዳት', send: 'ላክ' },
    { code: 'om', dir: 'ltr', title: 'Gargaaraa Savanna', send: 'Ergi' },
    { code: 'ti', dir: 'ltr', title: 'ሳቫና ሓጋዚ', send: 'ስደድ' },
    { code: 'so', dir: 'ltr', title: 'Kaaliyaha Savanna', send: 'Dir' },
    { code: 'ar', dir: 'rtl', title: 'مساعد سافانا', send: 'إرسال' },
    { code: 'sw', dir: 'ltr', title: 'Msaidizi wa Savanna', send: 'Tuma' },
    { code: 'fr', dir: 'ltr', title: 'Assistant Savanna', send: 'Envoyer' },
  ];

  const langSelect = document.getElementById('lang-select');
  assert(langSelect !== null, 'Language selector dropdown exists');

  testMatrix.forEach(entry => {
    langSelect.value = entry.code;
    langSelect.dispatchEvent(new window.Event('change'));

    const curLang = htmlEl.getAttribute('lang');
    const curDir = htmlEl.getAttribute('dir');
    const curTitle = document.getElementById('widget-title').textContent;
    const curSend = document.getElementById('send-btn-label').textContent;

    assert(curLang === entry.code, `[${entry.code}] lang attribute set to "${entry.code}"`);
    assert(curDir === entry.dir, `[${entry.code}] dir attribute set to "${entry.dir}"`);
    assert(curTitle === entry.title, `[${entry.code}] title updated to "${entry.title}"`);
    assert(curSend === entry.send, `[${entry.code}] send button label updated to "${entry.send}"`);
  });

  // 4. Test Language Suggestion Banner
  const banner = document.getElementById('lang-suggestion-banner');
  const acceptBtn = document.getElementById('suggestion-accept-btn');
  const dismissBtn = document.getElementById('suggestion-dismiss-btn');

  assert(banner !== null, 'Language suggestion banner element exists in DOM');
  assert(acceptBtn !== null, 'Suggestion banner Accept/Switch button exists');
  assert(dismissBtn !== null, 'Suggestion banner Dismiss button exists');

  // 5. Verify widget.js data-lang integration
  const widgetJsPath = path.join(__dirname, '..', 'widget', 'widget.js');
  const widgetJs = fs.readFileSync(widgetJsPath, 'utf8');

  assert(widgetJs.includes('dataset.lang'), 'widget.js parses data-lang attribute from script tag');
  assert(widgetJs.includes('&lang='), 'widget.js propagates initial language parameter to iframe URL');
  assert(widgetJs.includes('savanna:language_changed'), 'widget.js dispatches savanna:language_changed CustomEvent');

  console.log('----------------------------------------------------');
  console.log(`Tests: ${passed}/${total} passed (${Math.round((passed/total)*100)}%)`);
  if (passed === total) {
    console.log('✅ ALL PHASE 1 MULTILINGUAL VERIFICATION TESTS PASSED.');
  } else {
    console.error('❌ SOME TESTS FAILED.');
    process.exit(1);
  }
}

runMultilingualTests();
