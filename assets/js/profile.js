(() => {
  'use strict';

  const storageKey = 'savanna-profile';
  let currentLanguage = 'en';
  const translations = {
    'Skip to main content': 'ወደ ዋናው ይዘት ይሂዱ',
    'Savanna home': 'የSavanna መነሻ',
    'MY PROFILE': 'የእኔ መገለጫ',
    'Your profile, your path': 'የእርስዎ መገለጫ፣ የእርስዎ መንገድ',
    'Keep your information private while you build skills and find work that fits you.': 'ክህሎትዎን እያዳበሩ እና የሚስማማዎትን ሥራ ሲያገኙ መረጃዎን በሚስጥር ይጠብቁ።',
    'IDENTITY STATUS': 'የመታወቂያ ሁኔታ',
    'Your account is verified': 'መለያዎ ተረጋግጧል',
    'You joined with a partner referral. No kebele ID or passport is required.': 'በአጋር ድርጅት ምሪት ተመዝግበዋል። የቀበሌ መታወቂያ ወይም ፓስፖርት አያስፈልግም።',
    '✓ Partner referral · AAAPD': '✓ የአጋር ድርጅት ምሪት · AAAPD',
    'Add another document (optional)': 'ሌላ ሰነድ ያክሉ (አማራጭ)',
    'Stored on this device until you choose to share it.': 'ለማጋራት እስኪመርጡ ድረስ በዚህ መሣሪያ ላይ ይቀመጣል።',
    'Your progress saves on this device.': 'የሰሩት ሥራ በዚህ መሣሪያ ላይ ይቀመጣል።',
    'STEP 1 OF 3': 'ደረጃ 1 ከ 3',
    'Tell us about you': 'ስለ እርስዎ ይንገሩን',
    'Profile 33%': 'መገለጫ 33%',
    'Name': 'ስም',
    'City or region': 'ከተማ ወይም ክልል',
    'Short introduction': 'አጭር መግቢያ',
    'You can type or use the microphone. You will review words before saving.': 'መጻፍ ወይም ማይክሮፎኑን መጠቀም ይችላሉ። ከማስቀመጥዎ በፊት ቃላቱን ይገምግሙ።',
    'Skills and strengths': 'ክህሎቶች እና ጥንካሬዎች',
    'For example: customer service, sewing, bookkeeping, or repair.': 'ለምሳሌ፦ የደንበኛ አገልግሎት፣ ስፌት፣ የሂሳብ አያያዝ ወይም ጥገና።',
    'Project or work history': 'የፕሮጀክት ወይም የሥራ ታሪክ',
    'Save profile': 'መገለጫውን አስቀምጥ',
    'PRIVATE SUPPORT': 'የግል ድጋፍ',
    'What support would help you learn?': 'ለመማር ምን ዓይነት ድጋፍ ይረዳዎታል?',
    'This request is completely confidential, requires zero medical proof, and is used solely to match you with the right support.': 'ይህ ጥያቄ ሙሉ በሙሉ ሚስጥራዊ ነው፣ ምንም የሕክምና ማስረጃ አይጠይቅም፣ እና ተስማሚ ድጋፍ ለማግኘት ብቻ ይጠቅማል።',
    'Learning coach': 'የመማር አሰልጣኝ',
    'Technology or device help': 'የቴክኖሎጂ ወይም የመሣሪያ እገዛ',
    'Connectivity support': 'የግንኙነት ድጋፍ',
    'Flexible schedule': 'ተለዋዋጭ የጊዜ ሰሌዳ',
    'Save private request': 'የግል ጥያቄን አስቀምጥ',
    'Choose any support you need': 'የሚያስፈልግዎትን ድጋፍ ይምረጡ',
    'CAREER GATEWAY': 'የሥራ መግቢያ',
    'Find work that fits': 'የሚስማማ ሥራ ያግኙ',
    'Private matching': 'የግል ማጣመር',
    'Choose support you need privately. Employers only see the skills and accommodations they can provide.': 'የሚያስፈልግዎትን ድጋፍ በግል ይምረጡ። አሠሪዎች ሊያቀርቡ የሚችሉትን ክህሎትና ማመቻቸት ብቻ ያያሉ።',
    'Support I need at work': 'በሥራ ላይ የሚያስፈልገኝ ድጋፍ',
    'Flexible hours': 'ተለዋዋጭ የሥራ ሰዓት',
    'Remote or low-travel work': 'ከርቀት ወይም ብዙ ጉዞ የማይጠይቅ ሥራ',
    'Screen-reader friendly tools': 'ለስክሪን አንባቢ ተስማሚ መሣሪያዎች',
    'Customer support assistant': 'የደንበኛ ድጋፍ ረዳት',
    'Blue Nile Cooperative · Addis Ababa / remote': 'ብሉ ናይል ሕብረት ሥራ · አዲስ አበባ / ከርቀት',
    'Digital records assistant': 'የዲጂታል መዝገብ ረዳት',
    'Open Hands Ethiopia · Remote': 'ኦፕን ሃንድስ ኢትዮጵያ · ከርቀት',
    'Accessible tools': 'ተደራሽ መሣሪያዎች',
    'Apply': 'ያመልክቱ',
    'FOR EMPLOYERS': 'ለአሠሪዎች',
    'List workplace accommodations': 'የሥራ ቦታ ማመቻቸቶችን ይዘርዝሩ',
    'Role title': 'የሥራ መደብ ርዕስ',
    'Organisation': 'ድርጅት',
    'Accommodations available': 'የሚገኙ ማመቻቸቶች',
    'Physical access': 'የአካል ተደራሽነት',
    'Assistive technology': 'አጋዥ ቴክኖሎጂ',
    'Flexible scheduling': 'ተለዋዋጭ የጊዜ ሰሌዳ',
    'Save job details': 'የሥራ ዝርዝሩን አስቀምጥ',
    'Share only when you choose': 'ማጋራት የሚፈልጉትን ጊዜ እርስዎ ይወስናሉ',
    'Would you like an AAAPD partner to help register or update your profile?': 'የAAAPD አጋር መገለጫዎን ለመመዝገብ ወይም ለማዘመን እንዲረዳ ይፈልጋሉ?',
    'Yes, I consent to AAAPD partner support': 'አዎ፣ የAAAPD አጋር ድጋፍን እስማማለሁ',
    'Save & resume by SMS': 'በSMS አስቀምጥ እና ቀጥል',
    'YOUR CHOICE': 'የእርስዎ ምርጫ',
    'Read this page aloud': 'ይህን ገጽ በድምፅ አንብብ',
    '🔊 Read this page aloud': '🔊 ይህን ገጽ በድምፅ አንብብ',
    'Use simple view': 'ቀላል እይታን ተጠቀም',
    'Use standard view': 'መደበኛ እይታን ተጠቀም',
    'Review your words': 'የተናገሩትን ይገምግሙ',
    'Check the transcription. Edit it or record again before adding it to your profile.': 'ጽሑፉን ይመልከቱ። ወደ መገለጫዎ ከመጨመርዎ በፊት ያርሙት ወይም እንደገና ይቅረጹ።',
    'Transcribed text': 'የተተረጎመ ጽሑፍ',
    'Cancel': 'ሰርዝ',
    'Record again': 'እንደገና ቅረጽ',
    'Use this text': 'ይህን ጽሑፍ ተጠቀም',
    'Why would you be a good fit?': 'ለምን ተስማሚ እጩ ይሆናሉ?',
    'Save application': 'ማመልከቻውን አስቀምጥ',
    'Dictate short introduction using voice': 'አጭር መግቢያን በድምፅ ይናገሩ',
    'Dictate skills and strengths using voice': 'ክህሎቶችን እና ጥንካሬዎችን በድምፅ ይናገሩ',
    'Dictate project or work history using voice': 'የፕሮጀክት ወይም የሥራ ታሪክን በድምፅ ይናገሩ',
    'Dictate application answer using voice': 'የማመልከቻ መልስን በድምፅ ይናገሩ'
  };
  const englishByAmharic = Object.fromEntries(Object.entries(translations).map(([english, amharic]) => [amharic, english]));

  function translatePage(language) {
    const dictionary = language === 'am' ? translations : englishByAmharic;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const trimmed = node.nodeValue.trim();
      if (dictionary[trimmed]) node.nodeValue = node.nodeValue.replace(trimmed, dictionary[trimmed]);
    });
    document.querySelectorAll('[aria-label]').forEach((element) => {
      const translated = dictionary[element.getAttribute('aria-label')];
      if (translated) element.setAttribute('aria-label', translated);
    });
  }
  const save = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* local-only enhancement */ }
  };
  const load = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
  };
  const status = (message) => {
    document.getElementById('save-status').textContent = currentLanguage === 'am' && translations[message] ? translations[message] : message;
  };

  function setupLanguage() {
    const button = document.getElementById('language-toggle');
    button.addEventListener('click', () => {
      const amharic = document.documentElement.lang !== 'am';
      currentLanguage = amharic ? 'am' : 'en';
      document.documentElement.lang = amharic ? 'am' : 'en';
      button.setAttribute('aria-pressed', String(amharic));
      button.textContent = amharic ? 'English / አማ' : 'አማ / English';
      translatePage(currentLanguage);
    });
  }

  function setupReadAloud() {
    document.getElementById('read-aloud').addEventListener('click', () => {
      const text = document.getElementById('main-content').textContent.replace(/\s+/g, ' ').trim();
      const isAmharic = document.documentElement.lang === 'am';
      if (isAmharic && !/[\u1200-\u137F]/.test(text)) {
        status('Amharic text is not available to read yet. Choose Amharic and try again.');
        return;
      }
      status(isAmharic ? 'Generating Amharic audio…' : 'Generating audio…');
      fetch('/api/gemini-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: isAmharic ? 'am-ET' : 'en-US' })
      })
        .then(async (response) => {
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Gemini audio request failed.');
          return result;
        })
        .then(({ audio, mimeType }) => {
          const bytes = Uint8Array.from(atob(audio), (character) => character.charCodeAt(0));
          const player = new Audio(URL.createObjectURL(new Blob([bytes], { type: mimeType || 'audio/wav' })));
          player.onended = () => URL.revokeObjectURL(player.src);
          return player.play();
        })
        .then(() => status(isAmharic ? 'Amharic audio is playing.' : 'Audio is playing.'))
        .catch((error) => status(error.message));
    });
  }

  function setupVoice() {
    let activeTarget = null;
    let recognition = null;
    const review = document.getElementById('voice-review');
    const text = document.getElementById('voice-text');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const start = (target) => {
      activeTarget = target;
      if (!SpeechRecognition) { status('Voice input is not supported here. You can type instead.'); target.focus(); return; }
      recognition = new SpeechRecognition();
      recognition.lang = document.documentElement.lang === 'am' ? 'am-ET' : 'en-US';
      recognition.interimResults = false;
      recognition.onstart = () => status('Listening… speak now.');
      recognition.onerror = () => status('Voice input could not be completed. Please try again or type instead.');
      recognition.onresult = (event) => {
        text.value = event.results[0][0].transcript;
        review.showModal();
        status('Review your transcription before using it.');
      };
      recognition.start();
    };
    document.querySelectorAll('[data-voice-target]').forEach((button) => {
      button.addEventListener('click', () => start(document.getElementById(button.dataset.voiceTarget)));
    });
    document.getElementById('record-again').addEventListener('click', () => {
      review.close();
      if (activeTarget) start(activeTarget);
    });
    document.getElementById('use-voice-text').addEventListener('click', () => {
      if (activeTarget) activeTarget.value = text.value;
      review.close();
      status('Voice text added. Save the form when ready.');
    });
  }

  function setupProfile() {
    const form = document.getElementById('profile-form');
    const saved = load(storageKey);
    if (saved) Object.keys(saved).forEach((key) => { const field = form.elements[key]; if (field) field.value = saved[key]; });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      save(storageKey, data);
      status('Profile saved on this device.');
    });
    document.getElementById('save-support').addEventListener('click', () => {
      save('savanna-support', [...document.querySelectorAll('input[name="support"]:checked')].map((input) => input.value));
      status('Your private support request is saved on this device.');
    });
  }

  function setupJobs() {
    const jobs = [...document.querySelectorAll('.job-card')];
    document.querySelectorAll('.job-support').forEach((input) => input.addEventListener('change', () => {
      const selected = [...document.querySelectorAll('.job-support:checked')].map((item) => item.value);
      jobs.forEach((job) => { job.hidden = selected.length > 0 && !selected.some((value) => job.dataset.support.split(' ').includes(value)); });
    }));
    const dialog = document.getElementById('application-dialog');
    const result = document.getElementById('application-result');
    document.querySelectorAll('.apply-button').forEach((button) => button.addEventListener('click', () => {
      document.getElementById('application-job').textContent = `Applying for ${button.dataset.job}`;
      dialog.dataset.job = button.dataset.job;
      dialog.showModal();
    }));
    document.getElementById('close-application').addEventListener('click', () => dialog.close());
    document.getElementById('application-form').addEventListener('submit', (event) => {
      event.preventDefault();
      save('savanna-application', { job: dialog.dataset.job, answer: document.getElementById('application-answer').value });
      result.textContent = 'Application saved privately on this device.';
      setTimeout(() => dialog.close(), 900);
    });
  }

  function setupEmployerAndConsent() {
    document.getElementById('employer-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.target;
      save('savanna-employer-job', { role: form.role.value, organisation: form.employer.value, accommodations: [...form.querySelectorAll('[name="accommodation"]:checked')].map((item) => item.value) });
      document.getElementById('employer-result').textContent = 'Job details saved locally. You can share them when ready.';
    });
    document.getElementById('sms-resume').addEventListener('click', () => {
      const result = document.getElementById('sms-result');
      if (!document.getElementById('partner-consent').checked) { result.textContent = 'Please give consent before requesting a resume link.'; return; }
      result.textContent = 'A secure resume link would be sent after you confirm your phone number. No link was sent in this offline demo.';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('literacy-toggle').addEventListener('click', (event) => {
      const simple = document.body.classList.toggle('simple-view');
      event.currentTarget.setAttribute('aria-pressed', String(simple));
      const englishLabel = simple ? 'Use standard view' : 'Use simple view';
      event.currentTarget.textContent = currentLanguage === 'am' ? translations[englishLabel] : englishLabel;
    });
    setupLanguage();
    setupReadAloud();
    setupVoice();
    setupProfile();
    setupJobs();
    setupEmployerAndConsent();
  });
})();
