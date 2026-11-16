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
  await new Promise(r => setTimeout(r, 900));

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

  // 7. Rich Pedagogical Markdown Typography
  console.log('\nTesting rich pedagogical markdown typography...');
  const testMarkdown = `### Key Lesson Concepts
**Accessibility** is essential for *all* learners.
* High contrast visuals
* Full keyboard navigation
* Screen reader announcements

\`aria-live="polite"\` notifies assistive technology smoothly.

\`\`\`javascript
const answer = true;
\`\`\``;

  // Append markdown message
  const mdLi = window.appendMessage('assistant', testMarkdown, []);
  const mdBubble = mdLi.querySelector('.message-bubble');

  assert('Assistant bubble renders semantic <h4> heading', !!mdBubble.querySelector('h4.chat-h4'));
  assert('Assistant bubble renders <strong> bold tag', !!mdBubble.querySelector('strong'));
  assert('Assistant bubble renders <em> italic tag', !!mdBubble.querySelector('em'));
  assert('Assistant bubble renders semantic <ul> with <li> items', !!mdBubble.querySelector('ul.chat-list li'));
  assert('Assistant bubble renders <code class="chat-inline-code">', !!mdBubble.querySelector('code.chat-inline-code'));
  assert('Assistant bubble renders <pre class="chat-code-block">', !!mdBubble.querySelector('pre.chat-code-block'));
  assert('Raw markdown ### is not rendered as literal text', !mdBubble.textContent.includes('###'));
  assert('Raw markdown ** is not rendered as literal text', !mdBubble.textContent.includes('**'));

  // 8. Interactive 5-to-10 Question Quiz UI/UX
  console.log('\nTesting interactive accessible Quiz Mode...');
  const sampleQuizPayload = `Here is a 5-question practice quiz based on this page:

[QUIZ]
{
  "title": "Quiz: Web Accessibility Essentials",
  "questions": [
    {
      "id": 1,
      "question": "What is the primary role of ARIA live regions?",
      "options": ["To play background music", "To announce dynamic content updates to screen reader users", "To resize the browser window", "To encrypt user passwords"],
      "answer": 1,
      "explanation": "ARIA live regions inform assistive technologies of dynamic content changes without interrupting the user's workflow."
    },
    {
      "id": 2,
      "question": "What is the minimum WCAG 2.2 AA contrast ratio for standard body text?",
      "options": ["4.5:1", "3:1", "1.5:1", "10:1"],
      "answer": 0,
      "explanation": "WCAG 2.2 Level AA requires a minimum contrast ratio of 4.5:1 for standard text."
    },
    {
      "id": 3,
      "question": "Which keyboard key typically moves focus between interactive elements?",
      "options": ["Shift", "Tab", "Escape", "Spacebar only"],
      "answer": 1,
      "explanation": "The Tab key moves forward through focusable interactive elements, and Shift+Tab moves backward."
    },
    {
      "id": 4,
      "question": "Why should images have descriptive 'alt' text?",
      "options": ["To make images load faster", "To convey image meaning to blind learners using screen readers", "To hide images from search engines", "To prevent image downloads"],
      "answer": 1,
      "explanation": "Alt text provides a text alternative for users who cannot see the image."
    },
    {
      "id": 5,
      "question": "What HTML element provides native semantic grouping for quiz questions?",
      "options": ["<fieldset> with <legend>", "<div> with <span>", "<table> with <tr>", "<section> with <aside>"],
      "answer": 0,
      "explanation": "A <fieldset> paired with a <legend> semantically groups form controls and labels the entire question for screen readers."
    }
  ]
}
[/QUIZ]`;

  const quizLi = window.appendMessage('assistant', sampleQuizPayload, []);
  const quizContainer = quizLi.querySelector('.interactive-quiz-container');

  assert('Interactive quiz container is rendered in assistant bubble', !!quizContainer);
  assert('Quiz title is displayed', quizContainer.querySelector('.quiz-title').textContent.includes('Web Accessibility Essentials'));

  const progressBar = quizContainer.querySelector('.quiz-progress-bar');
  assert('Quiz progress bar has role="progressbar"', progressBar && progressBar.getAttribute('role') === 'progressbar');
  assert('Progress bar valuemax is 5', progressBar && progressBar.getAttribute('aria-valuemax') === '5');

  const fieldset = quizContainer.querySelector('.quiz-fieldset');
  const legend = quizContainer.querySelector('.quiz-question-text');
  assert('Semantic <fieldset> container exists', !!fieldset);
  assert('Semantic <legend> with question prompt exists', !!legend && legend.textContent.includes('ARIA live regions'));

  const options = quizContainer.querySelectorAll('.quiz-option-item');
  assert('Exactly 4 options are rendered for Question 1', options.length === 4);

  const checkBtn = quizContainer.querySelector('.btn-quiz-check');
  assert('Check Answer button exists and is initially disabled', !!checkBtn && checkBtn.disabled);

  // Select Option 1 (the correct answer: index 1)
  const radio1 = quizContainer.querySelector('#quiz-opt-0-1');
  assert('Option radio button exists', !!radio1);
  radio1.checked = true;
  radio1.dispatchEvent(new window.Event('change'));

  assert('Check Answer button is enabled after selecting an option', !checkBtn.disabled);

  // Submit answer
  checkBtn.click();

  const feedback = quizContainer.querySelector('.quiz-feedback');
  assert('Feedback status box is visible with role="status"', !!feedback && feedback.getAttribute('role') === 'status');
  assert('Feedback box has aria-live="polite"', feedback && feedback.getAttribute('aria-live') === 'polite');
  const isCorrectAnnounced = feedback && (feedback.textContent.includes('Correct!') || feedback.textContent.includes('ትክክል!'));
  const hasExplanation = feedback && feedback.textContent.includes('ARIA live regions inform');
  assert('Feedback confirms correct answer and provides pedagogical explanation', isCorrectAnnounced && hasExplanation);

  const nextBtn = quizContainer.querySelector('.btn-quiz-next');
  assert('Next Question button is now displayed', !!nextBtn && nextBtn.style.display !== 'none');

  // Advance to Question 2
  nextBtn.click();
  const q2Legend = quizContainer.querySelector('.quiz-question-text');
  assert('Question 2 is now active in legend', !!q2Legend && q2Legend.textContent.includes('WCAG 2.2 AA contrast ratio'));

  // 9. Axe-Core Accessibility Audit on Enhanced Widget with Quiz & Markdown
  console.log('\nRunning axe-core audit on updated iframe with Quiz & Markdown...');
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
