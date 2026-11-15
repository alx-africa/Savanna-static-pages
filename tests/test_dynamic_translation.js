/**
 * Production Integration Test Suite:
 * Pluggable Dynamic Batch Translation & Client Caching Engine
 *
 * Verifies:
 * 1. Arbitrary unseen host content (not in static DOM_TRANSLATIONS) is extracted non-destructively.
 * 2. Unseen strings are batched and debounced for POST /translate.
 * 3. DOM text nodes and aria-labels update in-place upon receiving cloud batch translations.
 * 4. Client localStorage (`savanna_dyn_trans_{lang}`) caches translations locally.
 * 5. Instant 0ms cache hits on subsequent visits / language switching.
 * 6. Switching back to English restores original text 100% losslessly.
 * 7. Live end-to-end translation with FastAPI backend and Gemini / cache persistence.
 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('----------------------------------------------------');
console.log('Savanna: Dynamic Hybrid Batch Translation Test Suite');
console.log('----------------------------------------------------');

const engineJs = fs.readFileSync(path.join(__dirname, '../widget/a11y-engine.js'), 'utf8');

function setupHostDOM(htmlBody, storageInit = {}) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Host Website - Africa Tech Skills Portal</title>
</head>
<body>
  ${htmlBody}
</body>
</html>`;

  const dom = new JSDOM(html, {
    url: 'http://localhost:8080/portal.html',
    runScripts: 'dangerously'
  });

  const { window } = dom;

  // Initialize storage
  for (const [k, v] of Object.entries(storageInit)) {
    window.localStorage.setItem(k, v);
  }

  // Set API config
  window.SavannaConfig = { apiUrl: 'http://localhost:8000' };

  return window;
}

let passed = 0;
let total = 0;

async function test(desc, fn) {
  total++;
  try {
    await fn();
    console.log(`✔ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`✘ FAIL: ${desc}`);
    console.error(err);
    process.exit(1);
  }
}

async function runAllTests() {
  // Test 1: Injects unseen content and verifies client cache helper
  await test('Dynamic cache helper loads and sets translations in localStorage', async () => {
    const win = setupHostDOM('<p id="test">Hello world</p>');
    
    // Inject script
    const scriptEl = win.document.createElement('script');
    scriptEl.textContent = engineJs;
    win.document.body.appendChild(scriptEl);

    assert(win.SavannaA11y, 'SavannaA11y API must be exposed');
    assert(typeof win.SavannaA11y.setDynamicTranslations === 'function', 'setDynamicTranslations must exist');
    assert(typeof win.SavannaA11y.getDynamicTranslations === 'function', 'getDynamicTranslations must exist');

    win.SavannaA11y.setDynamicTranslations('am', {
      'Welcome to the African Cloud Academy': 'እንኳን ወደ አፍሪካ ክላውድ አካዳሚ በደህና መጡ'
    });

    const cached = win.SavannaA11y.getDynamicTranslations('am');
    assert.strictEqual(
      cached['Welcome to the African Cloud Academy'],
      'እንኳን ወደ አፍሪካ ክላውድ አካዳሚ በደህና መጡ'
    );

    // Verify localStorage persistence
    const raw = win.localStorage.getItem('savanna_dyn_trans_am');
    assert(raw, 'Dynamic translation must be stored in localStorage');
    const parsed = JSON.parse(raw);
    assert.strictEqual(parsed['Welcome to the African Cloud Academy'], 'እንኳን ወደ አፍሪካ ክላውድ አካዳሚ በደህና መጡ');
  });

  // Test 2: Instant DOM translation from dynamic client cache
  await test('Host DOM translates arbitrary unseen strings instantly when in dynamic cache', async () => {
    const brandNewPageHtml = `
      <header>
        <h1 id="brand-title">Welcome to the African Cloud Academy</h1>
        <p id="brand-tagline">Empowering next-generation cloud architects across the continent.</p>
      </header>
      <main>
        <div id="module-overview">Master Kubernetes, Terraform, and DevOps best practices.</div>
        <button id="cta-enroll" aria-label="Enroll in Cloud DevOps Track">Start Your Application</button>
      </main>
    `;

    // Pre-populate client cache with translations that are NOT in static DOM_TRANSLATIONS
    const win = setupHostDOM(brandNewPageHtml, {
      savanna_dyn_trans_am: JSON.stringify({
        'Welcome to the African Cloud Academy': 'እንኳን ወደ አፍሪካ ክላውድ አካዳሚ በደህና መጡ',
        'Empowering next-generation cloud architects across the continent.': 'በመላው አህጉሪቱ የቀጣዩ ትውልድ የክላውድ መሃንዲሶችን ማብቃት።',
        'Master Kubernetes, Terraform, and DevOps best practices.': 'ኩበርኔትስን፣ ቴራፎርምን እና ምርጥ የዴቭኦፕስ አሰራሮችን ይማሩ።',
        'Enroll in Cloud DevOps Track': 'በክላውድ ዴቭኦፕስ ትምህርት ይመዝገቡ',
        'Start Your Application': 'ማመልከቻዎን ይጀምሩ'
      })
    });

    const scriptEl = win.document.createElement('script');
    scriptEl.textContent = engineJs;
    win.document.body.appendChild(scriptEl);

    // Switch to Amharic
    win.SavannaA11y.setLanguage('am');

    assert.strictEqual(
      win.document.getElementById('brand-title').textContent.trim(),
      'እንኳን ወደ አፍሪካ ክላውድ አካዳሚ በደህና መጡ',
      'Heading must be dynamically translated from dynamic cache'
    );
    assert.strictEqual(
      win.document.getElementById('brand-tagline').textContent.trim(),
      'በመላው አህጉሪቱ የቀጣዩ ትውልድ የክላውድ መሃንዲሶችን ማብቃት።',
      'Tagline must be dynamically translated from dynamic cache'
    );
    assert.strictEqual(
      win.document.getElementById('module-overview').textContent.trim(),
      'ኩበርኔትስን፣ ቴራፎርምን እና ምርጥ የዴቭኦፕስ አሰራሮችን ይማሩ።',
      'Module overview must be translated'
    );
    assert.strictEqual(
      win.document.getElementById('cta-enroll').textContent.trim(),
      'ማመልከቻዎን ይጀምሩ',
      'Button text must be translated'
    );
    assert.strictEqual(
      win.document.getElementById('cta-enroll').getAttribute('aria-label'),
      'በክላውድ ዴቭኦፕስ ትምህርት ይመዝገቡ',
      'Button aria-label must be translated'
    );

    // Switch back to English losslessly
    win.SavannaA11y.setLanguage('en');
    assert.strictEqual(
      win.document.getElementById('brand-title').textContent.trim(),
      'Welcome to the African Cloud Academy',
      'Heading must restore to pristine English'
    );
    assert.strictEqual(
      win.document.getElementById('cta-enroll').getAttribute('aria-label'),
      'Enroll in Cloud DevOps Track',
      'Aria label must restore to pristine English'
    );
  });

  // Test 3: Unseen strings batch collection and fetch dispatch
  await test('TreeWalker queues unseen strings and dispatches debounced fetch request', async () => {
    const customHtml = `
      <section id="custom-section">
        <h2 id="new-course">Full-Stack Rust Systems Engineering</h2>
        <p id="new-desc">High-throughput microservices and bare-metal performance.</p>
      </section>
    `;

    const win = setupHostDOM(customHtml);

    // Mock fetch on window to capture the batch request
    let capturedUrl = null;
    let capturedBody = null;
    let fetchCalled = false;

    win.fetch = async (url, opts) => {
      fetchCalled = true;
      capturedUrl = url;
      capturedBody = JSON.parse(opts.body);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          translations: {
            'Full-Stack Rust Systems Engineering': 'የሙሉ-ስታክ ረስት ሲስተምስ ኢንጂነሪንግ',
            'High-throughput microservices and bare-metal performance.': 'ከፍተኛ አፈፃፀም ያላቸው ማይክሮሰርቪሶች እና ፈጣን ስሌት።'
          },
          target_lang: 'am',
          source_lang: 'en'
        })
      };
    };

    const scriptEl = win.document.createElement('script');
    scriptEl.textContent = engineJs;
    win.document.body.appendChild(scriptEl);

    // Switch to Amharic
    win.SavannaA11y.setLanguage('am');

    // Wait for the 70ms debounce + dispatch
    await new Promise(r => setTimeout(r, 150));

    assert(fetchCalled, 'fetch must be called for unseen strings');
    assert.strictEqual(capturedUrl, 'http://localhost:8000/translate', 'Must post to /translate endpoint');
    assert.strictEqual(capturedBody.target_lang, 'am');
    assert(capturedBody.strings.includes('Full-Stack Rust Systems Engineering'));
    assert(capturedBody.strings.includes('High-throughput microservices and bare-metal performance.'));

    // Verify DOM was automatically updated when cloud translations returned
    assert.strictEqual(
      win.document.getElementById('new-course').textContent.trim(),
      'የሙሉ-ስታክ ረስት ሲስተምስ ኢንጂነሪንግ',
      'DOM heading must update in place with cloud translation'
    );
    assert.strictEqual(
      win.document.getElementById('new-desc').textContent.trim(),
      'ከፍተኛ አፈፃፀም ያላቸው ማይክሮሰርቪሶች እና ፈጣን ስሌት።',
      'DOM description must update in place with cloud translation'
    );

    // Verify localStorage now has the returned translations cached
    const raw = win.localStorage.getItem('savanna_dyn_trans_am');
    assert(raw, 'Translations must be persisted to localStorage');
    const cached = JSON.parse(raw);
    assert.strictEqual(cached['Full-Stack Rust Systems Engineering'], 'የሙሉ-ስታክ ረስት ሲስተምስ ኢንጂነሪንግ');
  });

  // Test 4: Live E2E translation against FastAPI backend
  await test('Live E2E: Backend /translate returns Gemini/cached translations for host website', async () => {
    const liveHtml = `
      <div id="portal-banner">
        <h1 id="portal-heading">Artificial Intelligence Career Essentials</h1>
        <p id="portal-desc">Practical skills for remote work success.</p>
      </div>
    `;

    // Real fetch using node-fetch or global fetch pointing to live localhost:8000
    const win = setupHostDOM(liveHtml);
    win.fetch = global.fetch || require('node-fetch');

    const scriptEl = win.document.createElement('script');
    scriptEl.textContent = engineJs;
    win.document.body.appendChild(scriptEl);

    // Listen for savanna:page_translated event
    let eventReceived = false;
    let eventDetail = null;
    win.addEventListener('savanna:page_translated', (e) => {
      eventReceived = true;
      eventDetail = e.detail;
    });

    // Switch to Afaan Oromo (om)
    win.SavannaA11y.setLanguage('om');

    // Wait for batch request and response (allow up to 4s for network/Gemini)
    for (let i = 0; i < 40; i++) {
      if (eventReceived) break;
      await new Promise(r => setTimeout(r, 100));
    }

    assert(eventReceived, 'savanna:page_translated event must be dispatched after cloud translation');
    assert.strictEqual(eventDetail.lang, 'om');
    assert(eventDetail.count >= 1, 'At least 1 string must be translated');

    const headingText = win.document.getElementById('portal-heading').textContent.trim();
    assert(
      headingText.length > 0 && headingText !== 'Artificial Intelligence Career Essentials',
      `Heading must be translated into Oromo: got "${headingText}"`
    );

    // Check client localStorage persistence
    const stored = JSON.parse(win.localStorage.getItem('savanna_dyn_trans_om'));
    assert(stored['Artificial Intelligence Career Essentials'], 'Translation must be in client storage');
  });

  console.log('----------------------------------------------------');
  console.log(`Dynamic Translation Tests: ${passed}/${total} passed (${Math.round((passed/total)*100)}%)`);
  console.log('✅ ALL DYNAMIC HYBRID TRANSLATION TESTS PASSED.');
  console.log('----------------------------------------------------');
}

runAllTests().catch(err => {
  console.error(err);
  process.exit(1);
});
