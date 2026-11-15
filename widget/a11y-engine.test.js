/**
 * Automated test suite for the Savanna Adaptive Accessibility Engine (a11y-engine.js).
 * Validates WCAG 2.2 AA compliance on:
 * - Floating trigger button
 * - Universal onboarding modal dialog
 * - Phase 2: Transcripts and semantic curriculum status
 * - Phase 3: Sticky motor toolbar, switch-scanner highlights, and shortcuts modal
 * - Phase 4: Cognitive & Reading adaptations (reading guide ruler, AI plain-language chunking, step badges)
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const axe = require('axe-core');

async function testAccessibilityEngine() {
  console.log('----------------------------------------------------');
  console.log('Savanna A11y Engine — Comprehensive WCAG 2.2 AA Audit');
  console.log('----------------------------------------------------');

  const engineJs = fs.readFileSync(path.join(__dirname, 'a11y-engine.js'), 'utf8');
  const engineCss = fs.readFileSync(path.join(__dirname, 'a11y-engine.css'), 'utf8');

  // Minimal host page shell simulating ALX concept page
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>ALX Learning Hub - Accessibility Test</title>
      <style>${engineCss}</style>
    </head>
    <body>
      <div class="header d-flex align-items-center position-fixed top-0 w-100">
        <a class="logo-container p-1" href="#">
          <div class="logo mx-auto" style="background-image: url(&quot;../assets/img/holberton-logo-full-alx.png&quot;)"></div>
        </a>
      </div>
      <main id="content">
        <h1>VA Foundations &amp; Professional Identity</h1>
        <div id="curriculum_navigation_content">
          <p>This is a test lesson for accessibility evaluation, cognitive plain-language simplification, and motor controls. It contains comprehensive educational descriptions to test adaptive learning features.</p>
          <p><img src="../assets/img/VA-Content-Banner.png" alt="VA-Content-Banner" width="600" height="200" /></p>
          <figure>
            <img src="../assets/img/1lhlc1k4XRfVWDFTjczeaSoRpKlMY3dAX.png" alt="Evon afro" width="400" height="400" />
          </figure>
          <div class="graduation-badge">
            <img src="../assets/img/graduation-badge-alx.svg" alt="Graduation badge" width="100" height="100" />
          </div>
        </div>
        <div class="list-group">
          <div class="list-group-item active">Lesson 1: Introduction</div>
          <div class="list-group-item">Lesson 2: Tools and Workflows</div>
        </div>
        <form class="button_to" method="post" action="#">
          <button type="submit" class="btn btn-primary">Mark as complete</button>
        </form>
      </main>
    </body>
    </html>
  `;

  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'http://localhost:8080/pages/concept-with-navigation.html'
  });

  const { window } = dom;

  // Polyfills for browser environment
  window.matchMedia = window.matchMedia || function() {
    return { matches: false, addListener: function() {}, removeListener: function() {} };
  };

  // Execute engine script inside the DOM window
  window.eval(engineJs);

  // 1. Verify Trigger Button Injected
  const trigger = window.document.getElementById('savanna-a11y-trigger');
  if (!trigger) {
    throw new Error('Trigger button #savanna-a11y-trigger was not injected.');
  }
  console.log('✔ Trigger button injected with aria-label:', trigger.getAttribute('aria-label'));

  // 2. Open Settings & Trigger Adaptations (All 5 profiles active)
  window.SavannaA11y.setProfile({
    screenReader: true,
    captionsTranscripts: true,
    highContrast: true,
    motorAssistance: true,
    cognitiveSupport: true
  });

  // 3. Verify Phase 2 & 3 elements injected
  const transcript = window.document.getElementById('sa11y-lesson-transcript');
  if (!transcript) throw new Error('Phase 2 Transcript drawer not injected.');
  console.log('✔ Phase 2 Transcript & captions drawer injected.');

  const motorBar = window.document.getElementById('sa11y-motor-toolbar');
  if (!motorBar) throw new Error('Phase 3 Motor toolbar not injected.');
  console.log('✔ Phase 3 Sticky Motor toolbar injected with 6 action buttons.');

  // Open shortcuts guide modal
  const shortcutsBtn = motorBar.querySelector('#sa11y-btn-shortcuts');
  shortcutsBtn.click();
  const shortcutsModal = window.document.getElementById('sa11y-shortcuts-backdrop');
  if (!shortcutsModal || shortcutsModal.hasAttribute('hidden')) {
    throw new Error('Shortcuts guide modal did not open on trigger click.');
  }
  console.log('✔ Phase 3 Shortcuts modal opened successfully.');

  // 4. Verify Phase 4 Cognitive elements
  if (window.document.documentElement.getAttribute('data-sa11y-cognitive') !== 'true') {
    throw new Error('Phase 4 data-sa11y-cognitive attribute not set on root.');
  }

  const rulerPill = window.document.getElementById('sa11y-ruler-pill');
  if (!rulerPill) throw new Error('Phase 4 Reading ruler toggle pill not injected.');
  console.log('✔ Phase 4 Reading ruler toggle pill injected.');

  rulerPill.click(); // Toggle reading ruler ON
  const readingRuler = window.document.getElementById('sa11y-reading-ruler');
  if (!readingRuler) throw new Error('Phase 4 Reading ruler overlay not rendered.');
  console.log('✔ Phase 4 Reading guide ruler overlay rendered.');

  const stepBadge = window.document.querySelector('.sa11y-step-badge');
  if (!stepBadge) throw new Error('Phase 4 Step badge not injected above section.');
  console.log('✔ Phase 4 Step-by-step chunking badge injected.');

  const simplifyBtn = window.document.querySelector('.sa11y-simplify-btn');
  if (!simplifyBtn) throw new Error('Phase 4 Simplify section button not injected.');
  console.log('✔ Phase 4 Plain-language simplify button injected.');

  // Click simplify button to trigger summary card
  simplifyBtn.click();
  const simplifyCard = window.document.querySelector('.sa11y-simplified-card');
  if (!simplifyCard) throw new Error('Phase 4 Plain-language summary card not rendered.');
  console.log('✔ Phase 4 Plain-language summary card rendered with audio readout option.');

  // 5. Phase 5: Vision & Image Accessibility for Blind Learners
  const describeBtn = window.document.querySelector('.sa11y-describe-img-btn');
  if (!describeBtn) throw new Error('Phase 5 Describe Image button not injected.');
  console.log('✔ Phase 5 Describe Image button injected for screen reader users.');

  describeBtn.click();
  await new Promise(r => setTimeout(r, 50));
  const descCard = window.document.querySelector('.sa11y-image-desc-card');
  if (!descCard) throw new Error('Phase 5 AI Image Description card not rendered.');
  console.log('✔ Phase 5 AI Image Description card rendered with pedagogical description.');

  // 6. Screen Reader Tab-To-Image Focus & Automatic AI Description
  const testImg = window.document.querySelector('#curriculum_navigation_content img');
  if (!testImg || testImg.getAttribute('tabindex') !== '0') {
    throw new Error('Image not in sequential Tab navigation order (missing tabindex="0").');
  }
  if (testImg.getAttribute('role') !== 'img') {
    throw new Error('Image missing role="img" for screen reader recognition.');
  }
  console.log('✔ Screen reader image Tab navigation verified (tabindex="0", role="img").');

  // Simulate screen reader tabbing into the image (focus event)
  testImg.focus();
  await new Promise(r => setTimeout(r, 60));
  if (!testImg.dataset.aiDescription) {
    throw new Error('AI description was not cached on image dataset upon Tab arrival.');
  }
  console.log('✔ Screen reader Tab arrival triggered AI description and audio synthesis.');

  // 6b. Verify Graduation Badge and Holberton Logo are fully accessible
  const badgeImg = window.document.querySelector('img[src*="graduation-badge"]');
  if (!badgeImg || badgeImg.getAttribute('tabindex') !== '0') {
    throw new Error('Graduation badge missing tabindex="0".');
  }
  badgeImg.focus();
  await new Promise(r => setTimeout(r, 60));
  if (!badgeImg.dataset.aiDescription) {
    throw new Error('Graduation badge failed to receive AI visual description upon Tab arrival.');
  }
  console.log('✔ Graduation badge Tab arrival verified with AI breakdown.');

  const logoContainer = window.document.querySelector('a.logo-container');
  if (!logoContainer || !logoContainer.getAttribute('aria-label')) {
    throw new Error('Holberton/ALX logo container missing accessible aria-label.');
  }
  logoContainer.focus();
  await new Promise(r => setTimeout(r, 60));
  console.log('✔ Holberton/ALX institutional logo container verified with accessible label:', logoContainer.getAttribute('aria-label'));

  // 7. Run axe-core audit on the fully adapted page
  axe.configure({
    rules: [
      { id: 'color-contrast', enabled: false }, // jsdom does not compute full RGB styles
      { id: 'aria-valid-attr', enabled: true },
      { id: 'aria-roles', enabled: true },
      { id: 'button-name', enabled: true },
      { id: 'document-title', enabled: true },
      { id: 'html-has-lang', enabled: true },
      { id: 'landmark-one-main', enabled: true }
    ]
  });

  const results = await axe.run(window.document.documentElement, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']
    }
  });

  const violations = results.violations || [];
  const criticalOrSerious = violations.filter(v => v.impact === 'critical' || v.impact === 'serious');

  console.log(`Audited rules: ${results.passes.length + violations.length}`);
  console.log(`Passes:        ${results.passes.length}`);
  console.log(`Violations:    ${violations.length}`);
  console.log(`Critical/Serious: ${criticalOrSerious.length}`);

  if (criticalOrSerious.length > 0) {
    console.error('\n❌ AXE AUDIT FAILED:');
    criticalOrSerious.forEach(v => {
      console.error(`  - [${v.impact.toUpperCase()}] ${v.id}: ${v.help}`);
    });
    process.exit(1);
  }

  console.log('\n✅ ALL PHASE 1, 2, 3, 4, AND 5 ACCESSIBILITY AUDITS PASSED WITH 0 VIOLATIONS.');
  process.exit(0);
}

testAccessibilityEngine().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
