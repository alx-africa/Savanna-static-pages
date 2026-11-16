/**
 * Track 3 Remediation Phase 1 — Priority 5 Test Suite
 * Tests 8-language localization, RTL support, and absence of language collapse in a11y-engine.
 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('----------------------------------------------------');
console.log('Track 3 Remediation: A11y 8-Language Localization Suite');
console.log('----------------------------------------------------');

const a11yEngineCode = fs.readFileSync(path.join(__dirname, '../widget/a11y-engine.js'), 'utf8');

const LANGUAGES = ['en', 'am', 'om', 'ti', 'so', 'ar', 'sw', 'fr'];

function setupDOM(initialLang = 'en') {
  const dom = new JSDOM(`<!DOCTYPE html>
<html lang="${initialLang}">
<head><title>A11y Multilingual Test</title></head>
<body>
  <div id="curriculum_navigation_content">
    <h1>Virtual Assistant</h1>
    <p>Lesson content paragraph for accommodations testing.</p>
  </div>
</body>
</html>`, {
    url: 'http://localhost:8000/',
    runScripts: 'dangerously'
  });

  const { window } = dom;
  window.localStorage.setItem('savanna_lang', initialLang);
  window.localStorage.setItem('savanna_a11y_profile', JSON.stringify({
    screenReader: true,
    captionsTranscripts: true,
    highContrast: true,
    motorAssistance: true,
    cognitiveSupport: true,
    configured: true,
    skipped: false
  }));

  // Execute engine
  const scriptEl = window.document.createElement('script');
  scriptEl.textContent = a11yEngineCode;
  window.document.body.appendChild(scriptEl);

  return window;
}

let passed = 0;
let total = 0;

function runTest(desc, fn) {
  total++;
  try {
    fn();
    console.log(`✔ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`✘ FAIL: ${desc}`);
    console.error(err);
    process.exit(1);
  }
}

// Test 1: Language is preserved across all 8 languages on load
for (const lang of LANGUAGES) {
  runTest(`Initial language "${lang}" is preserved without collapse`, () => {
    const win = setupDOM(lang);
    const trigger = win.document.getElementById('savanna-a11y-trigger');
    assert(trigger, 'Trigger button should exist');
    trigger.click();

    const backdrop = win.document.getElementById('savanna-a11y-modal-backdrop');
    assert(backdrop, 'Backdrop should exist');
    assert.strictEqual(backdrop.getAttribute('lang'), lang);

    if (lang === 'ar') {
      assert.strictEqual(backdrop.getAttribute('dir'), 'rtl', 'Arabic must have dir="rtl"');
    } else {
      assert.strictEqual(backdrop.getAttribute('dir'), 'ltr', `${lang} must have dir="ltr"`);
    }
  });
}

// Test 2: Dynamic language change event preserves all 8 languages without collapse
runTest('Dynamic savanna:language_changed event preserves all 8 languages without collapsing', () => {
  const win = setupDOM('en');
  const trigger = win.document.getElementById('savanna-a11y-trigger');
  trigger.click();
  const backdrop = win.document.getElementById('savanna-a11y-modal-backdrop');

  for (const lang of LANGUAGES) {
    win.dispatchEvent(new win.CustomEvent('savanna:language_changed', { detail: { lang } }));
    assert.strictEqual(backdrop.getAttribute('lang'), lang, `Failed to update backdrop lang to ${lang}`);
    if (lang === 'ar') {
      assert.strictEqual(backdrop.getAttribute('dir'), 'rtl', 'Arabic must set dir="rtl" dynamically');
    } else {
      assert.strictEqual(backdrop.getAttribute('dir'), 'ltr', `${lang} must set dir="ltr" dynamically`);
    }
  }
});

// Test 3: Accommodations captions & transcript drawer localized in all 8 languages
for (const lang of LANGUAGES) {
  runTest(`Accommodations drawer correctly localized for "${lang}"`, () => {
    const win = setupDOM(lang);
    const drawer = win.document.getElementById('sa11y-lesson-transcript');
    assert(drawer, 'Transcript drawer must exist');
    assert.strictEqual(drawer.getAttribute('lang'), lang);
    if (lang === 'ar') {
      assert.strictEqual(drawer.getAttribute('dir'), 'rtl');
    }
    const h4 = drawer.querySelector('.sa11y-transcript-content h4');
    assert(h4 && h4.textContent.trim().length > 0, 'Transcript heading must be localized');
  });
}

// Test 4: Modal Language Cycler button cycles through all 8 languages
runTest('Modal Language Switcher button cycles through all 8 languages without error', () => {
  const win = setupDOM('en');
  const trigger = win.document.getElementById('savanna-a11y-trigger');
  trigger.click();
  const backdrop = win.document.getElementById('savanna-a11y-modal-backdrop');
  const langBtn = backdrop.querySelector('#sa11y-lang-btn');
  assert(langBtn, 'Language switcher button must exist');

  // Starting at en (index 0)
  for (let i = 1; i < LANGUAGES.length; i++) {
    langBtn.click();
    const expectedLang = LANGUAGES[i];
    assert.strictEqual(backdrop.getAttribute('lang'), expectedLang, `Expected ${expectedLang} after click ${i}`);
  }
  // One more click wraps around to en
  langBtn.click();
  assert.strictEqual(backdrop.getAttribute('lang'), 'en', 'Must wrap around to en');
});

console.log('----------------------------------------------------');
console.log(`Tests: ${passed}/${total} passed (100%)`);
console.log('✅ ALL REMEDIATION PHASE 1 PRIORITY 5 TESTS PASSED.');
console.log('----------------------------------------------------');
