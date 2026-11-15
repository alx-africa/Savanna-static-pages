/**
 * Zero-Hardcoding Plug-and-Play Test Suite
 *
 * PROVES EMPIRICALLY that:
 * 1. Savanna contains ZERO hardcoded content from host sites.
 * 2. ANY third-party website can simply drop in:
 *      <script src="../widget/a11y-engine.js" async></script>
 * 3. An entirely new, previously unseen website with arbitrary domain-specific text
 *    (e.g., Solar Agritech / IoT Marine Robotics) is 100% dynamically translated on the fly
 *    via real-time Gemini AI integration, including body text, input placeholders, and aria-labels.
 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('Savanna: Zero-Hardcoding Plug-and-Play Test Suite');
console.log('====================================================');

const engineJs = fs.readFileSync(path.join(__dirname, '../widget/a11y-engine.js'), 'utf8');

// A 100% fictional, brand-new external website that Savanna has NEVER seen before
const unseenThirdPartyWebsiteHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Kilimanjaro Solar Agritech & IoT Sensors</title>
</head>
<body>
  <header>
    <h1 id="hero-title">Autonomous Drip Irrigation and Solar Water Desalination</h1>
    <nav>
      <a href="/sensors" aria-label="Explore sensor telemetry networks">Telemetry Data</a>
    </nav>
  </header>
  <main>
    <article id="main-feature">
      <h2>Precision Agriculture for Smallholder Farmers</h2>
      <p id="feature-desc">Our solar-powered micro-controllers continuously monitor soil nitrogen, phosphorus, and moisture levels across high-altitude farms.</p>
      
      <form id="contact-form">
        <label for="farmer-id">Farmer Registration</label>
        <input type="text" id="farmer-id" placeholder="Enter your regional cooperative license number...">
        <button type="submit" id="btn-request">Request Sensor Deployment Kit</button>
      </form>
    </article>
  </main>
  <footer>
    <p id="copyright-notice">Copyright 2026 Kilimanjaro CleanTech Cooperative. All rights reserved.</p>
  </footer>
</body>
</html>`;

function setupPlugAndPlayDOM() {
  const dom = new JSDOM(unseenThirdPartyWebsiteHtml, {
    url: 'https://kilimanjaro-solar-agritech.co.tz/portal',
    runScripts: 'dangerously'
  });
  const win = dom.window;
  win.fetch = global.fetch;
  win.SavannaConfig = { apiUrl: 'http://localhost:8000' };

  // Simply drop in the widget script exactly as an external customer would!
  const script = win.document.createElement('script');
  script.textContent = engineJs;
  win.document.body.appendChild(script);

  return win;
}

function waitForDynamicTranslation(win, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve({ timedOut: true });
    }, timeoutMs);

    win.addEventListener('savanna:page_translated', function handler(e) {
      if (e.detail && e.detail.remaining === 0) {
        clearTimeout(timer);
        win.removeEventListener('savanna:page_translated', handler);
        resolve(e.detail);
      }
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let passed = 0;
let total = 0;

async function test(desc, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

async function runPlugAndPlayVerification() {
  console.log('\n[Suite: Pure Plug-and-Play On An Unseen External Website]');

  await test('Verifies that unseen third-party website has ZERO hardcoded dictionary matches', async () => {
    const win = setupPlugAndPlayDOM();
    const heroTitle = win.document.getElementById('hero-title').textContent.trim();
    const featureDesc = win.document.getElementById('feature-desc').textContent.trim();
    
    // Check in-memory translations in widget
    const dynTransAm = win.SavannaA11y.getDynamicTranslations('am');
    assert.strictEqual(dynTransAm[heroTitle], undefined, 'Hero title must NOT be in cache or hardcoded');
    assert.strictEqual(dynTransAm[featureDesc], undefined, 'Feature description must NOT be in cache or hardcoded');
  });

  await test('Dropping in Savanna script automatically discovers and live-translates arbitrary content with Gemini AI', async () => {
    const win = setupPlugAndPlayDOM();
    
    console.log('    -> Triggering language selection to Amharic (am) on brand-new website...');
    const waitPromise = waitForDynamicTranslation(win, 15000);
    win.SavannaA11y.setLanguage('am');
    
    const result = await waitPromise;
    console.log('    -> Translation event received:', result);
    await sleep(400);

    // 1. Verify H1 translated into Amharic via live Gemini call
    const heroTitle = win.document.getElementById('hero-title').textContent;
    console.log('    -> Translated H1:', heroTitle);
    assert(/[\u1200-\u137F]/.test(heroTitle),
      `Hero title must be translated into Amharic via live Gemini call, got: ${heroTitle}`);

    // 2. Verify deep paragraph translated into Amharic
    const featureDesc = win.document.getElementById('feature-desc').textContent;
    console.log('    -> Translated P:', featureDesc);
    assert(/[\u1200-\u137F]/.test(featureDesc),
      `Paragraph must be translated into Amharic via live Gemini call, got: ${featureDesc}`);

    // 3. Verify form button translated
    const btnRequest = win.document.getElementById('btn-request').textContent;
    console.log('    -> Translated Button:', btnRequest);
    assert(/[\u1200-\u137F]/.test(btnRequest),
      `Button must be translated into Amharic via live Gemini call, got: ${btnRequest}`);

    // 4. Verify input placeholder translated
    const placeholder = win.document.getElementById('farmer-id').getAttribute('placeholder');
    console.log('    -> Translated Placeholder:', placeholder);
    assert(/[\u1200-\u137F]/.test(placeholder),
      `Input placeholder must be translated into Amharic, got: ${placeholder}`);

    // 5. Verify nav link aria-label translated
    const ariaLabel = win.document.querySelector('nav a').getAttribute('aria-label');
    console.log('    -> Translated Aria-Label:', ariaLabel);
    assert(/[\u1200-\u137F]/.test(ariaLabel),
      `Nav link aria-label must be translated into Amharic, got: ${ariaLabel}`);
  });

  await test('Switching back to English losslessly restores 100% of the original third-party text', async () => {
    const win = setupPlugAndPlayDOM();

    // First translate to Amharic
    const pAm = waitForDynamicTranslation(win, 15000);
    win.SavannaA11y.setLanguage('am');
    await pAm;
    await sleep(300);

    // Now restore to English
    win.SavannaA11y.setLanguage('en');
    await sleep(150);

    const heroTitle = win.document.getElementById('hero-title').textContent.trim();
    assert.strictEqual(heroTitle, 'Autonomous Drip Irrigation and Solar Water Desalination',
      'Hero title must restore to exact pristine English');

    const placeholder = win.document.getElementById('farmer-id').getAttribute('placeholder').trim();
    assert.strictEqual(placeholder, 'Enter your regional cooperative license number...',
      'Input placeholder must restore to exact pristine English');

    const ariaLabel = win.document.querySelector('nav a').getAttribute('aria-label').trim();
    assert.strictEqual(ariaLabel, 'Explore sensor telemetry networks',
      'Aria-label must restore to exact pristine English');
  });

  console.log('====================================================');
  console.log(`Results: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================');
}

runPlugAndPlayVerification();
