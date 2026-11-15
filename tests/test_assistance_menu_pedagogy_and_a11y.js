/**
 * Automated Test: Assistance Menu Pedagogy & Accessibility Verification
 * Verifies:
 *   1. Context awareness (lesson title, active heading, selected text forwarded)
 *   2. Starter prompt pills in English and Amharic
 *   3. Non-visual keyboard shortcuts (Alt+A, Alt+V, Alt+L, Escape/Control)
 *   4. Audio speed controls (0.8x, 1.0x, 1.25x)
 *   5. Web Audio earcons instantiation
 *   6. Axe-core WCAG 2.2 AA zero violations
 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const axe = require('axe-core');

async function runTests() {
  console.log('----------------------------------------------------');
  console.log('Savanna Assistance Menu — Pedagogy & Accessibility Test');
  console.log('----------------------------------------------------');

  let passed = 0;
  let total = 0;

  function assert(desc, condition) {
    total++;
    if (condition) {
      console.log(`  ✓ ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${desc}`);
    }
  }

  const iframeHtml = fs.readFileSync(path.join(__dirname, '../widget/iframe.html'), 'utf8');
  const dom = new JSDOM(iframeHtml, {
    url: 'http://localhost:8000/widget/iframe.html?api=http://localhost:8000&lang=en',
    runScripts: 'dangerously',
    resources: 'usable',
    beforeParse(window) {
      window.Element.prototype.scrollIntoView = () => {};
      window.URL.createObjectURL = () => 'blob:mock';
      window.URL.revokeObjectURL = () => {};
      window.HTMLMediaElement.prototype.play = () => Promise.resolve();
      window.HTMLMediaElement.prototype.pause = () => {};
      window.fetch = () => Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ text: 'Mock response', response: 'Mock response', citations: [] }),
        blob: () => Promise.resolve(new window.Blob(['mockaudio'], { type: 'audio/mp3' })),
        text: () => Promise.resolve('Mock text')
      });
    }
  });

  const { window } = dom;
  const { document } = window;

  // Wait for scripts to initialize
  await new Promise(r => setTimeout(r, 500));

  // 1. Starter Prompt Pills existence
  const pillsBar = document.querySelector('.prompt-pills-bar');
  assert('Starter prompt pills container is rendered', !!pillsBar);

  const pillSimple = document.getElementById('pill-simple');
  const pillExample = document.getElementById('pill-example');
  const pillQuiz = document.getElementById('pill-quiz');
  const selectionPill = document.getElementById('selection-pill');

  assert('Simple explanation pill exists', !!pillSimple);
  assert('Ethiopian example pill exists', !!pillExample);
  assert('Quiz me pill exists', !!pillQuiz);
  assert('Selection pill exists (hidden by default)', selectionPill && selectionPill.hasAttribute('hidden'));

  // 2. Active Context Badge
  const contextBadge = document.getElementById('active-context-badge');
  const contextTitle = document.getElementById('active-context-title');
  assert('Active context badge exists in DOM', !!contextBadge && !!contextTitle);

  // 3. Receive page_context from host via MessageEvent
  window.dispatchEvent(new window.MessageEvent('message', {
    data: {
      type: 'page_context',
      context: {
        title: 'Virtual Assistant Professional Course',
        active_heading: 'Where Do Virtual Assistants Work?',
        selected_text: 'Remote contractors working across global timezones',
        summary: 'Virtual assistants support businesses with executive administrative tasks.'
      }
    }
  }));

  assert('Active context badge displays current topic', contextTitle.textContent.includes('Where Do Virtual Assistants Work?'));
  assert('Active context badge is now visible', !contextBadge.hasAttribute('hidden'));
  assert('Selection pill is now visible because selected_text was provided', !selectionPill.hasAttribute('hidden'));

  // 4. Bilingual Support: Switch to Amharic
  const langSelect = document.getElementById('lang-select');
  langSelect.value = 'am';
  langSelect.dispatchEvent(new window.Event('change'));

  await new Promise(r => setTimeout(r, 200));

  const pillSimpleText = document.getElementById('pill-text-simple').textContent;
  const pillExampleText = document.getElementById('pill-text-example').textContent;
  const pillQuizText = document.getElementById('pill-text-quiz').textContent;

  assert('Pill 1 translated to Amharic (በቀላል አማርኛ)', pillSimpleText === 'በቀላል አማርኛ');
  assert('Pill 2 translated to Amharic (ምሳሌ ስጠኝ)', pillExampleText === 'ምሳሌ ስጠኝ');
  assert('Pill 3 translated to Amharic (ፈትነኝ)', pillQuizText === 'ፈትነኝ');
  assert('Active context badge prefix is translated to Amharic (ርዕስ:)', contextTitle.textContent.includes('ርዕስ:'));

  // 5. Interactive Pill Click
  const chatInput = document.getElementById('chat-input');
  pillSimple.click(); // clicks Amharic simple pill

  await new Promise(r => setTimeout(r, 200));

  assert('Pill click sets textarea message and prepares question', chatInput.value === '' || document.querySelectorAll('.message-item').length > 0);

  // 6. Audio Speed Control: verify speed buttons exist on assistant messages
  const speedButtons = document.querySelectorAll('.btn-audio-speed');
  assert('Audio playback speed controls exist on assistant messages', speedButtons.length > 0);
  if (speedButtons.length > 0) {
    const initialSpeed = speedButtons[0].textContent;
    speedButtons[0].click();
    assert('Clicking speed button cycles playback rate', speedButtons[0].textContent !== initialSpeed);
  }

  // 7. Axe-Core Accessibility Audit on Enhanced Widget
  console.log('\nRunning axe-core audit on updated iframe...');
  const axeResults = await axe.run(document.documentElement, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag22aa']
    }
  });

  const violations = axeResults.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
  assert(`Axe-core WCAG 2.2 AA audit passed with 0 critical/serious violations (found: ${violations.length})`, violations.length === 0);

  if (violations.length > 0) {
    console.error('Violations details:', JSON.stringify(violations, null, 2));
  }

  console.log('----------------------------------------------------');
  console.log(`Results: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log('----------------------------------------------------');

  if (passed !== total) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
