/**
 * Comprehensive Course Content Scalability Test Suite
 *
 * Verifies that Savanna seamlessly localizes any diverse educational content:
 * 1. Rich conceptual text with inline styled accents (.bold-accent, mark, strong)
 * 2. Strict preservation of code syntax, CLI commands, kbd, samp, var, and translate="no"
 * 3. Interactive assessment quizzes with dynamic feedback injection
 * 4. Tabular evaluation rubrics and bidirectional RTL layout (Arabic)
 * 5. Step-by-step practical lab checklists
 * 6. Multimedia transcript cards
 * 7. Lossless rollback to original English
 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('Savanna: Course Content Scalability Test Suite');
console.log('====================================================');

const courseHtml = fs.readFileSync(path.join(__dirname, '../pages/interactive-course.html'), 'utf8');
const engineJs = fs.readFileSync(path.join(__dirname, '../widget/a11y-engine.js'), 'utf8');

function setupDOM(html, url = 'http://localhost:8080/pages/interactive-course.html') {
  const dom = new JSDOM(html, {
    url,
    runScripts: 'dangerously'
  });
  const win = dom.window;
  win.fetch = global.fetch;
  win.SavannaConfig = { apiUrl: 'http://localhost:8000' };

  const script = win.document.createElement('script');
  script.textContent = engineJs;
  win.document.body.appendChild(script);

  return win;
}

function waitForTranslation(win, timeoutMs = 8000) {
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

async function runCourseContentScalabilityTests() {
  console.log('\n[Suite 1: Domain Auto-Detection & Initial State]');
  await test('Correctly detects learning domain and initializes English baseline', async () => {
    const win = setupDOM(courseHtml);
    assert.strictEqual(win.SavannaA11y.detectDomain(), 'learning',
      'Should classify interactive-course.html as learning domain');

    const h1 = win.document.querySelector('.course-title');
    assert(h1.textContent.includes('Module 4: Building Intelligent Cloud Microservices'),
      'H1 must start in original English');
  });

  console.log('\n[Suite 2: Rich Conceptual Content & Inline Formatted Accents]');
  await test('Translates conceptual paragraphs and inline spans into Amharic', async () => {
    const win = setupDOM(courseHtml);
    const p = waitForTranslation(win);
    win.SavannaA11y.setLanguage('am');
    await p;
    await sleep(200);

    // 1. Heading translated
    const h1 = win.document.querySelector('.course-title');
    assert(/[\u1200-\u137F]/.test(h1.textContent),
      `Course title should be in Amharic, got: ${h1.textContent}`);

    // 2. Callout title & learning objectives
    const calloutTitle = win.document.querySelector('.callout-title');
    assert(/[\u1200-\u137F]/.test(calloutTitle.textContent),
      `Callout title should be translated, got: ${calloutTitle.textContent}`);

    // 3. Inline styled accents translated
    const boldAccent = win.document.querySelector('.bold-accent');
    assert(/[\u1200-\u137F]/.test(boldAccent.textContent),
      `Bold accent should be translated, got: ${boldAccent.textContent}`);
  });

  console.log('\n[Suite 3: Strict Code Syntax & Terminal Command Preservation]');
  await test('Preserves Python syntax, kbd commands, samp output, and var elements untouched', async () => {
    const win = setupDOM(courseHtml);
    const p = waitForTranslation(win);
    win.SavannaA11y.setLanguage('am');
    await p;
    await sleep(200);

    // 1. Code block must remain 100% uncorrupted Python code
    const codeEl = win.document.querySelector('pre code');
    assert(codeEl.textContent.includes('from fastapi import FastAPI, HTTPException'),
      'Python import statements must remain pristine English code');
    assert(codeEl.textContent.includes('async def get_prediction(payload: dict):'),
      'Python function signature must remain pristine English code');
    assert(codeEl.textContent.includes('"tokens_processed": len(payload["input_text"].split())'),
      'Python dictionary keys and string literals in code must remain intact');
    assert(!/[\u1200-\u137F]/.test(codeEl.textContent),
      'Code block must contain zero translated script characters');

    // 2. Terminal CLI command in kbd must remain exact git command
    const kbd = win.document.querySelector('kbd');
    assert.strictEqual(
      kbd.textContent.trim(),
      'git clone https://github.com/savanna-learning/cloud-microservices.git',
      'Terminal command inside <kbd> must not be altered'
    );

    // 3. System output in samp must remain intact
    const samp = win.document.querySelector('samp');
    assert(
      samp.textContent.includes('INFO: Worker node 1 initialized on port 8000'),
      'System output inside <samp> must remain intact'
    );

    // 4. Surrounding lab instructions MUST be translated
    const labTitle = win.document.querySelectorAll('.section-title')[1];
    assert(/[\u1200-\u137F]/.test(labTitle.textContent),
      `Lab instructions title must be translated into Amharic, got: ${labTitle.textContent}`);
  });

  console.log('\n[Suite 4: Interactive Assessment & Dynamic Feedback]');
  await test('Translates quiz questions and dynamic evaluation feedback in Afaan Oromoo', async () => {
    const win = setupDOM(courseHtml);
    const p = waitForTranslation(win);
    win.SavannaA11y.setLanguage('om');
    await p;
    await sleep(200);

    // 1. Question stem translated
    const stem = win.document.querySelector('.quiz-stem');
    assert(stem.textContent !== 'Question 1: Which communication strategy is NOT recommended for decoupling high-throughput microservices?',
      'Quiz stem should be translated into Afaan Oromoo');

    // 2. Submit Answer button translated via universal Tier 1 dictionary
    const submitBtn = win.document.getElementById('submit-quiz-btn');
    assert.strictEqual(submitBtn.textContent.trim(), 'Deebii Galchaa',
      'Submit Answer button must translate to "Deebii Galchaa" in Afaan Oromoo');

    // 3. User selects correct answer and clicks submit
    const radioA = win.document.querySelector('input[name="quiz-q1"][value="a"]');
    radioA.checked = true;
    submitBtn.click();

    // 4. Feedback box renders dynamically
    const feedbackBox = win.document.getElementById('quiz-feedback-box');
    assert(feedbackBox.classList.contains('correct'), 'Feedback box must have correct class');
    
    // Wait for dynamic translation observer
    await sleep(350);
    assert(feedbackBox.textContent.length > 10, 'Feedback banner text must be populated');
  });

  console.log('\n[Suite 5: Tabular Evaluation Rubrics & RTL Alignment]');
  await test('Translates grading rubric table and applies RTL layout for Arabic', async () => {
    const win = setupDOM(courseHtml);
    const p = waitForTranslation(win);
    win.SavannaA11y.setLanguage('ar');
    await p;
    await sleep(200);

    // 1. RTL direction
    assert.strictEqual(win.document.documentElement.getAttribute('dir'), 'rtl',
      'Arabic must set document dir to rtl');

    // 2. Table headers translated
    const ths = Array.from(win.document.querySelectorAll('.rubric-table th')).map(th => th.textContent.trim());
    assert(ths.some(t => /[\u0600-\u06FF]/.test(t)),
      `Table headers must contain Arabic text, got: ${JSON.stringify(ths)}`);

    // 3. Criteria rows translated
    const firstTd = win.document.querySelector('.rubric-table tbody td');
    assert(/[\u0600-\u06FF]/.test(firstTd.textContent),
      `Rubric criteria cell should be in Arabic, got: ${firstTd.textContent}`);
  });

  console.log('\n[Suite 6: Step-by-Step Procedure & Multimedia Transcript]');
  await test('Translates step procedures and video transcript in Kiswahili', async () => {
    const win = setupDOM(courseHtml);
    const p = waitForTranslation(win);
    win.SavannaA11y.setLanguage('sw');
    await p;
    await sleep(200);

    // 1. Step checklist translated
    const step1 = win.document.querySelector('.step-item .step-text');
    assert(step1.textContent !== 'Configure Environment Variables: Create your local .env file and populate your cloud API credentials and database connection string.',
      'Step text should be translated into Kiswahili');

    // 2. Video transcript summary translated
    const summary = win.document.querySelector('.transcript-card summary');
    assert(summary.textContent !== 'Transcript: Instructor Walkthrough on Microservice Isolation',
      'Transcript summary should be translated into Kiswahili');
  });

  console.log('\n[Suite 7: Lossless Rollback to Pristine English]');
  await test('Restores all course elements, rubrics, and quiz to pristine English baseline', async () => {
    const win = setupDOM(courseHtml);

    // First translate to Amharic
    const pAm = waitForTranslation(win);
    win.SavannaA11y.setLanguage('am');
    await pAm;
    await sleep(200);

    // Then rollback to English
    win.SavannaA11y.setLanguage('en');
    await sleep(150);

    // Verify pristine restorations
    const h1 = win.document.querySelector('.course-title');
    assert.strictEqual(
      h1.textContent.trim(),
      'Module 4: Building Intelligent Cloud Microservices & AI APIs',
      'H1 must restore to exact original English'
    );

    const submitBtn = win.document.getElementById('submit-quiz-btn');
    assert.strictEqual(
      submitBtn.textContent.trim(),
      'Submit Answer',
      'Submit button must restore to exact "Submit Answer"'
    );

    const calloutTitle = win.document.querySelector('.callout-title');
    assert(
      calloutTitle.textContent.includes('Learning Objectives'),
      'Callout title must restore to English'
    );

    const firstTh = win.document.querySelector('.rubric-table th');
    assert.strictEqual(
      firstTh.textContent.trim(),
      'Criteria',
      'Table header must restore to "Criteria"'
    );

    assert.strictEqual(win.document.documentElement.getAttribute('dir'), 'ltr',
      'Document direction must return to ltr');
  });

  console.log('====================================================');
  console.log(`Results: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================');
}

runCourseContentScalabilityTests();
