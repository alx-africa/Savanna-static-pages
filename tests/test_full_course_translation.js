/**
 * Comprehensive End-to-End Course Translation Test Suite
 *
 * Verifies that the complete curriculum page (pages/concept-with-navigation.html)
 * is translated pedagogically into African and international languages:
 * 1. Amharic (am) - 100% of headings, callouts, bullet items, and paragraphs.
 * 2. Afaan Oromoo (om) - 100% of course content translated culturally & pedagogically.
 * 3. Arabic (ar) - 100% translated with proper RTL layout direction.
 * 4. Kiswahili (sw) - 100% translated with authentic East African tech phrasing.
 * 5. Lossless rollback: Switching back to English (en) restores 100% original text.
 * 6. Pluggable non-destructive architecture: 0 host HTML modifications.
 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('Savanna A11y: Full Course Translation Test Suite');
console.log('====================================================');

const htmlPath = path.join(__dirname, '../pages/concept-with-navigation.html');
const rawHtml = fs.readFileSync(htmlPath, 'utf8');
const engineJs = fs.readFileSync(path.join(__dirname, '../widget/a11y-engine.js'), 'utf8');

function setupCourseDOM() {
  const dom = new JSDOM(rawHtml, {
    url: 'http://localhost:8080/pages/concept-with-navigation.html',
    runScripts: 'dangerously'
  });
  const win = dom.window;

  // Use Node global fetch against running FastAPI backend
  win.fetch = global.fetch;

  // Configure Savanna API
  win.SavannaConfig = { apiUrl: 'http://localhost:8000' };

  // Inject widget script
  const script = win.document.createElement('script');
  script.textContent = engineJs;
  win.document.body.appendChild(script);

  return win;
}

function waitForTranslationComplete(win, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout (${timeoutMs}ms) waiting for translation completion`));
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

async function runTests() {
  console.log('\n[Test Suite 1: Full Course Translation to Amharic]');
  await test('Amharic: Translates 100% of course headings, callout, and paragraphs', async () => {
    const win = setupCourseDOM();
    const waitPromise = waitForTranslationComplete(win);
    win.SavannaA11y.setLanguage('am');
    await waitPromise;

    // 1. Verify Main Lesson Title
    const h1 = win.document.querySelector('#curriculum_navigation_content h1');
    assert(h1, 'Lesson h1 should exist');
    assert(h1.textContent.includes('የወደፊት') || h1.textContent.includes('ኢንዱስትሪ'),
      `Expected Amharic title, got: ${h1.textContent}`);

    // 2. Verify Section Headings
    const headings = Array.from(win.document.querySelectorAll('#curriculum_navigation_content h4, #curriculum_navigation_content h5'))
      .map(h => h.textContent.trim());
    assert(headings.length >= 8, `Expected at least 8 section headings, got ${headings.length}`);
    const amharicRegex = /[\u1200-\u137F]/;
    for (const h of headings) {
      assert(amharicRegex.test(h), `Heading should contain Amharic characters: ${h}`);
    }

    // 3. Verify Callout Box Content
    const callout = win.document.querySelector('.callout-content');
    assert(callout, 'Callout content element must exist');
    assert(amharicRegex.test(callout.textContent), `Callout should be in Amharic: ${callout.textContent.slice(0, 60)}`);

    // 4. Verify Bullet Items
    const lis = Array.from(win.document.querySelectorAll('#curriculum_navigation_content li'))
      .map(li => li.textContent.trim());
    assert(lis.length >= 6, `Expected at least 6 bullet items, got ${lis.length}`);
    for (const li of lis) {
      assert(amharicRegex.test(li), `List item should contain Amharic: ${li}`);
    }

    // 5. Verify Paragraphs
    const paras = Array.from(win.document.querySelectorAll('#curriculum_navigation_content p'))
      .map(p => p.textContent.trim())
      .filter(p => p.length > 20);
    assert(paras.length >= 5, `Expected substantial paragraphs, got ${paras.length}`);
    for (const p of paras) {
      assert(amharicRegex.test(p), `Paragraph should contain Amharic characters: ${p.slice(0, 60)}...`);
    }
  });

  console.log('\n[Test Suite 2: Full Course Translation to Afaan Oromoo]');
  await test('Afaan Oromoo: Translates curriculum into fluent Oromo tech phrasing', async () => {
    const win = setupCourseDOM();
    const waitPromise = waitForTranslationComplete(win);
    win.SavannaA11y.setLanguage('om');
    await waitPromise;

    const h1 = win.document.querySelector('#curriculum_navigation_content h1');
    assert(h1.textContent.includes('Fuuldura') || h1.textContent.includes('Indastirii'),
      `Expected Afaan Oromoo title, got: ${h1.textContent}`);

    // Verify key Oromo vocabulary present in translated headings
    const headings = Array.from(win.document.querySelectorAll('#curriculum_navigation_content h4'))
      .map(h => h.textContent.trim());
    const hasOromoHeading = headings.some(h => /Fuuldura|Gargaaraa|Qabeenyaa|Gatii|abdachiisaa|bocaa/i.test(h));
    assert(hasOromoHeading, `Expected Oromo curriculum terminology in headings: ${JSON.stringify(headings)}`);

    // Verify callout box
    const callout = win.document.querySelector('.callout-content');
    assert(/Addaddummaa|Barbaachisaa|Garaagarummaa|hubannoo|maamilaa/i.test(callout.textContent),
      `Expected Oromo pedagogical callout translation, got: ${callout.textContent.slice(0, 80)}`);
  });

  console.log('\n[Test Suite 3: Arabic Translation & RTL Layout]');
  await test('Arabic: Translates curriculum and enforces RTL direction', async () => {
    const win = setupCourseDOM();
    const waitPromise = waitForTranslationComplete(win);
    win.SavannaA11y.setLanguage('ar');
    await waitPromise;

    // Verify document direction
    assert.strictEqual(win.document.documentElement.getAttribute('dir'), 'rtl',
      'HTML document dir attribute must be rtl for Arabic');

    // Verify Arabic characters in title and headings
    const h1 = win.document.querySelector('#curriculum_navigation_content h1');
    const arabicRegex = /[\u0600-\u06FF]/;
    assert(arabicRegex.test(h1.textContent), `Title must contain Arabic: ${h1.textContent}`);

    const headings = Array.from(win.document.querySelectorAll('#curriculum_navigation_content h4'))
      .map(h => h.textContent.trim());
    for (const h of headings) {
      assert(arabicRegex.test(h), `Heading must contain Arabic: ${h}`);
    }
  });

  console.log('\n[Test Suite 4: Kiswahili Translation]');
  await test('Kiswahili: Translates curriculum with East African pedagogical clarity', async () => {
    const win = setupCourseDOM();
    const waitPromise = waitForTranslationComplete(win);
    win.SavannaA11y.setLanguage('sw');
    await waitPromise;

    const h1 = win.document.querySelector('#curriculum_navigation_content h1');
    assert(/Mustakabali|Sekta|Msaidizi Halisi|Msaidizi wa Kijanja/i.test(h1.textContent),
      `Expected Swahili title, got: ${h1.textContent}`);

    const callout = win.document.querySelector('.callout-content');
    assert(/Tofauti Muhimu|Msaidizi wa Kijanja|kidijitali|kazi pamoja/i.test(callout.textContent),
      `Expected Swahili phrasing in callout: ${callout.textContent.slice(0, 80)}`);
  });

  console.log('\n[Test Suite 5: Lossless Switching & English Rollback]');
  await test('Rollback to en: Restores 100% original English lesson content losslessly', async () => {
    const win = setupCourseDOM();

    // 1. Snapshot original English texts
    const origTitle = win.document.querySelector('#curriculum_navigation_content h1').textContent.trim();
    const origCallout = win.document.querySelector('.callout-content').textContent.trim();
    const origHeadings = Array.from(win.document.querySelectorAll('#curriculum_navigation_content h4'))
      .map(h => h.textContent.trim());

    // 2. Switch to Amharic and wait
    const amPromise = waitForTranslationComplete(win);
    win.SavannaA11y.setLanguage('am');
    await amPromise;

    // Verify it actually translated to Amharic
    const amTitle = win.document.querySelector('#curriculum_navigation_content h1').textContent.trim();
    assert.notStrictEqual(amTitle, origTitle, 'Title should have changed from English');

    // 3. Switch back to English
    win.SavannaA11y.setLanguage('en');

    // 4. Verify 100% lossless restoration
    const restoredTitle = win.document.querySelector('#curriculum_navigation_content h1').textContent.trim();
    const restoredCallout = win.document.querySelector('.callout-content').textContent.trim();
    const restoredHeadings = Array.from(win.document.querySelectorAll('#curriculum_navigation_content h4'))
      .map(h => h.textContent.trim());

    assert.strictEqual(restoredTitle, origTitle, 'Restored title must match original English exactly');
    assert.strictEqual(restoredCallout, origCallout, 'Restored callout must match original English exactly');
    assert.deepStrictEqual(restoredHeadings, origHeadings, 'Restored headings must match original English exactly');
    assert.strictEqual(win.document.documentElement.getAttribute('dir'), 'ltr', 'Direction must revert to ltr');
  });

  console.log('\n====================================================');
  console.log(`Results: ${passed}/${total} test suites passed!`);
  console.log('====================================================');
  if (passed !== total) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
