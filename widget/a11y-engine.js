/**
 * Savanna Pluggable Adaptive Accessibility Engine
 * Level 1 Plug-in | Zero Host Code Modification Required
 * WCAG 2.2 AA Compliant
 */
(function () {
  'use strict';

  // Prevent multiple initializations
  if (window.__SAVANNA_A11Y_ENGINE__) return;
  window.__SAVANNA_A11Y_ENGINE__ = true;

  const STORAGE_KEY = 'savanna_a11y_profile';
  const LANG_KEY = 'savanna_lang';

  /* ── 1. Resolve Script & CSS paths ───────────────────────────────────── */
  const currentScript = document.currentScript ||
    Array.from(document.querySelectorAll('script[src*="a11y-engine.js"], script[src*="widget.js"]')).pop();
  
  let cssBase = '/widget/a11y-engine.css';
  if (currentScript && currentScript.src) {
    try {
      const url = new URL(currentScript.src);
      cssBase = url.origin + '/widget/a11y-engine.css';
    } catch (_) {}
  }

  function injectStylesheet() {
    if (document.querySelector('link[href*="a11y-engine.css"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssBase;
    document.head.appendChild(link);
  }
  injectStylesheet();

  /* ── 2. Multilingual Support (8 Supported Languages) ─────────────────── */
  const ALL_LANGUAGES = ['en', 'am', 'om', 'ti', 'so', 'ar', 'sw', 'fr'];
  const storedLang = localStorage.getItem(LANG_KEY);
  let currentLang = ALL_LANGUAGES.includes(storedLang) ? storedLang : 'en';

  const BCP47_A11Y = {
    en: 'en-US',
    am: 'am-ET',
    om: 'om-ET',
    ti: 'ti-ET',
    so: 'so-SO',
    ar: 'ar-SA',
    sw: 'sw-TZ',
    fr: 'fr-FR'
  };

  const i18n = {
    en: {
      triggerLabel: 'Accessibility preferences and accommodation settings',
      modalTitle: 'How would you like to experience your learning?',
      modalSubtitle: 'Customize your learning interface. Select all that help you learn best.',
      noticeText: 'We do not ask for medical history or proof. You can change these anytime or skip.',
      optScreenReaderTitle: 'Screen Reader & Audio-Guided Learning',
      optScreenReaderDesc: 'Optimized for blind learners: spoken landmarks, rich image descriptions, and audio navigation.',
      optCaptionsTitle: 'Captions, Transcripts & Visual Alerts',
      optCaptionsDesc: 'Optimized for Deaf and hard-of-hearing learners: subtitles, transcripts for audio, and visual flash alerts.',
      optContrastTitle: 'Large Text & High Visual Contrast',
      optContrastDesc: 'Optimized for low-vision learners: enhanced contrast ratios, scalable typography, and bold focus indicators.',
      optMotorTitle: 'Keyboard, Switch Device & Motor Assistance',
      optMotorDesc: 'Optimized for mobility limitations: giant action buttons, sticky controls, single-key shortcuts, and switch scanning.',
      optCognitiveTitle: 'Plain Language & Low Distraction',
      optCognitiveDesc: 'Optimized for neurodivergent learners, ADHD, and dyslexia: simplified text, reading guide ruler, and reduced animations.',
      btnSave: 'Save & Apply Preferences',
      btnSkip: 'Skip for now (I will configure later)',
      langToggle: 'English (EN)',
      closeLabel: 'Close accessibility dialog',
      savedAnnouncement: 'Accessibility preferences updated and applied.',
      skippedAnnouncement: 'Accessibility setup skipped. You can open it anytime using the accessibility button.',
      // Phase 3: Motor & Mobility i18n
      motorBarLabel: 'Adaptive Motor and Mobility Quick Actions',
      btnMotorBack: 'Back (K)',
      btnMotorComplete: 'Complete (C)',
      btnMotorNext: 'Next (J)',
      btnVoiceNav: 'Voice Nav (V)',
      btnAutoScan: 'Auto-Scan (S)',
      btnShortcuts: 'Shortcuts (?)',
      voiceNavActive: '🎙️ Voice Listening active. Say: Next, Back, Complete, Scroll down, Read, Stop, Help',
      voiceNavUnsupported: 'Web Speech Recognition is not supported by your browser. Use shortcuts J, K, C, S instead.',
      voiceNavStopped: 'Voice navigation paused.',
      scanActive: '⚡ Auto-Scan active. Press Space, Enter or click to select focused element. Esc to stop.',
      scanStopped: 'Auto-Scan stopped.',
      shortcutsModalTitle: 'Keyboard & Voice Navigation Guide',
      shortcutsModalDesc: 'Single-key shortcuts and hands-free voice commands designed for mobility accommodations.',
      shortcutNext: 'Next lesson / next section',
      shortcutPrev: 'Previous lesson / back',
      shortcutComplete: 'Mark current activity as complete',
      shortcutScan: 'Toggle single-switch automatic element scanner',
      shortcutVoice: 'Toggle hands-free voice recognition',
      shortcutHelp: 'Toggle this shortcut guide',
      shortcutEsc: 'Cancel scanning or close open dialogs',
      voiceCmdList: 'Voice Commands: "next", "back", "complete", "scroll down", "scroll up", "read", "stop", "help"',
      // Phase 4: Cognitive & Reading i18n
      btnSimplify: '✨ Simplify Section',
      btnOriginal: 'Original Text',
      simplifiedTitle: 'Plain-Language Summary (Step-by-Step)',
      simplifiedLoading: 'Simplifying text into plain language...',
      btnReadAloud: '🔊 Read Aloud',
      rulerToggle: '📏 Reading Guide Ruler',
      rulerActivePill: '📏 Reading Ruler: ON (Press R to toggle)',
      rulerInactivePill: '📏 Reading Ruler: OFF (Press R to toggle)',
      stepBadge: 'Step',
      plainKeyTakeaway: 'Key Takeaway',
      plainActionSteps: 'Action Steps',
      // Phase 5: Vision & AI Image Description
      btnDescribeImg: '👁️ Describe Image (Alt+I)',
      imgDescTitle: 'AI Visual Description (Screen Reader Ready)',
      imgDescReadAloud: '🔊 Read Aloud',
      imgDescClose: 'Close Description',
      imgDescAnnounce: 'Reading visual description aloud...',
      imgArrivalAnnouncement: 'Graphic focused. Analyzing visual elements with AI...',
      imgArrivalCached: 'Graphic focused. Playing AI visual description.',
      // Accommodations & Shortcuts Drawer i18n
      transcriptLabel: 'Lesson Audio & Video Transcript',
      transcriptSummary: 'Lesson Audio Transcript & Captions (Deaf / Hard of Hearing Access)',
      transcriptHeading: 'Lesson Spoken Content Transcript',
      transcriptBody: 'This lesson covers the future of the Virtual Assistant profession. As businesses adopt remote tools and Artificial Intelligence, the demand for human collaboration, specialized niche skills, emotional intelligence, and adaptable digital operations increases dramatically.',
      transcriptSignBtn: 'Request Ethiopian Sign Language (EthSL) Interpretation',
      transcriptSignAlert: 'Sign language interpretation request logged. An accessibility coordinator will assist you.',
      shortcutTableKey: 'Shortcut',
      shortcutTableAction: 'Action',
      shortcutTableImg: 'Describe Image with AI (Screen Reader Ready)',
      shortcutTableSpace: 'Select active element during Auto-Scan',
      shortcutVoiceTitle: 'Hands-Free Voice Commands',
      shortcutGotIt: 'Got it',
    },
    am: {
      triggerLabel: 'የተደራሽነት ምርጫዎች እና የማስተካከያ ቅንብሮች',
      modalTitle: 'ትምህርትዎን በምን ዓይነት መልኩ መከታተል ይፈልጋሉ?',
      modalSubtitle: 'የትምህርት በይነገጽዎን ያብጁ። ለእርስዎ የሚስማሙትን ሁሉ ይምረጡ።',
      noticeText: 'ምንም ዓይነት የህክምና ማረጋገጫ አንጠይቅም። በማንኛውም ጊዜ መቀየር ወይም ማለፍ ይችላሉ።',
      optScreenReaderTitle: 'የስክሪን አንባቢ እና የድምፅ መመሪያ',
      optScreenReaderDesc: 'ለዓይነ-ስውራን የተመቻቸ፡ ዝርዝር የምስል ገለፃዎች፣ የስክሪን አንባቢ ድጋፍ እና የድምፅ አሰሳ።',
      optCaptionsTitle: 'የፅሑፍ መግለጫዎች እና የእይታ ማንቂያዎች',
      optCaptionsDesc: 'የመስማት ችግር ላለባቸው ተማሪዎች፡ ንዑስ ርዕሶች፣ የድምፅ ፅሑፎች እና የእይታ ብልጭታ ማንቂያዎች።',
      optContrastTitle: 'ትልቅ ፅሑፍ እና ከፍተኛ የቀለም ንፅፅር',
      optContrastDesc: 'ዝቅተኛ እይታ ላላቸው ተማሪዎች፡ ከፍተኛ ንፅፅር፣ ትላልቅ ፊደላት እና ደማቅ የአሰሳ ጠቋሚዎች።',
      optMotorTitle: 'የቁልፍ ሰሌዳ፣ ስዊች እና የአካል ድጋፍ',
      optMotorDesc: 'የእንቅስቃሴ ውስንነት ላለባቸው፡ ትላልቅ አዝራሮች፣ ቀላል አቋራጭ ቁልፎች እና አውቶማቲክ ስካነር።',
      optCognitiveTitle: 'ቀላል ቋንቋ እና ትኩረት ሰብሳቢ እይታ',
      optCognitiveDesc: 'ለቀላል ንባብ እና ትኩረት፡ አጫጭር ዓረፍተ ነገሮች፣ የንባብ መስመር እና የማይንቀሳቀስ እይታ።',
      btnSave: 'አስቀምጥና ተግብር',
      btnSkip: 'ለጊዜው እለፈው (በኋላ አስተካክላለሁ)',
      langToggle: 'አማርኛ (AM)',
      closeLabel: 'የተደራሽነት መስኮትን ዝጋ',
      savedAnnouncement: 'የተደራሽነት ምርጫዎች ተቀምጠው ተተግብረዋል።',
      skippedAnnouncement: 'የተደራሽነት ቅንብር አልፏል። በማንኛውም ጊዜ በተደራሽነት አዝራሩ መክፈት ይችላሉ።',
      // Phase 3: Motor & Mobility i18n
      motorBarLabel: 'የእንቅስቃሴ እና የአካል ድጋፍ ፈጣን እርምጃዎች',
      btnMotorBack: 'ተመለስ (K)',
      btnMotorComplete: 'ተግባር ጨርስ (C)',
      btnMotorNext: 'ቀጣይ (J)',
      btnVoiceNav: 'ድምፅ ትዕዛዝ (V)',
      btnAutoScan: 'ስዊች ስካነር (S)',
      btnShortcuts: 'አቋራጮች (?)',
      voiceNavActive: '🎙️ የድምፅ ማዳመጥ በርቷል። የሚከተሉትን ይበሉ፡ ቀጣይ፣ ተመለስ፣ ጨርስ፣ ወደ ታች፣ አንብብ፣ አቁም፣ እርዳታ',
      voiceNavUnsupported: 'ይህ ብሮውዘር የድምፅ ትዕዛዝን አይደግፍም። እባክዎ የቁልፍ ሰሌዳ አቋራጮችን (J, K, C, S) ይጠቀሙ።',
      voiceNavStopped: 'የድምፅ ትዕዛዝ ቆሟል።',
      scanActive: '⚡ አውቶማቲክ ስካነር በርቷል። የተመረጠውን ለመክፈት Space ወይም Enter ይጫኑ። ለማቆም Esc ይጫኑ።',
      scanStopped: 'አውቶማቲክ ስካነር ቆሟል።',
      shortcutsModalTitle: 'የቁልፍ ሰሌዳ እና የድምፅ ትዕዛዝ መመሪያ',
      shortcutsModalDesc: 'የእንቅስቃሴ ውስንነት ላለባቸው ተማሪዎች የተዘጋጁ ነጠላ ቁልፎች እና የድምፅ ትዕዛዞች።',
      shortcutNext: 'ወደ ቀጣይ ትምህርት / ክፍል መሄድ',
      shortcutPrev: 'ወደ ቀዳሚ ትምህርት / መመለስ',
      shortcutComplete: 'የአሁኑን ተግባር ተጠናቋል ብሎ መመዝገብ',
      shortcutScan: 'የስዊች አውቶማቲክ ስካነርን ማብራት / ማጥፋት',
      shortcutVoice: 'እጅ-አልባ የድምፅ ትዕዛዝን ማብራት / ማጥፋት',
      shortcutHelp: 'ይህን የመመሪያ መስኮት መክፈት / መዝጋት',
      shortcutEsc: 'ስካነርን ማቆም ወይም ንቁ መስኮትን መዝጋት',
      voiceCmdList: 'የድምፅ ትዕዛዞች፡ "ቀጣይ", "ተመለስ", "ጨርስ", "ወደ ታች", "ወደ ላይ", "አንብብ", "አቁም", "እርዳታ"',
      // Phase 4: Cognitive & Reading i18n
      btnSimplify: '✨ ቀላል ማብራሪያ',
      btnOriginal: 'የመጀመሪያ ፅሑፍ',
      simplifiedTitle: 'ቀላል እና ደረጃ በደረጃ ማጠቃለያ',
      simplifiedLoading: 'ወደ ቀላል ቋንቋ በመቀየር ላይ...',
      btnReadAloud: '🔊 በድምፅ አድምጥ',
      rulerToggle: '📏 የንባብ መመሪያ ገዥ',
      rulerActivePill: '📏 የንባብ ገዥ በርቷል (R ይጫኑ)',
      rulerInactivePill: '📏 የንባብ ገዥ ጠፍቷል (R ይጫኑ)',
      stepBadge: 'ደረጃ',
      plainKeyTakeaway: 'ዋናው ነጥብ',
      plainActionSteps: 'ቀጣይ እርምጃዎች',
      // Phase 5: Vision & AI Image Description
      btnDescribeImg: '👁️ ምስል አብራራ (Alt+I)',
      imgDescTitle: 'የምስል ዝርዝር ማብራሪያ (ለስክሪን አንባቢ)',
      imgDescReadAloud: '🔊 በድምፅ አድምጥ',
      imgDescClose: 'ማብራሪያውን ዝጋ',
      imgDescAnnounce: 'የምስሉ ማብራሪያ በድምፅ እየተነበበ ነው...',
      imgArrivalAnnouncement: 'ምስል ላይ ደርሰዋል። AI ምስሉን በመተንተን ላይ ነው...',
      imgArrivalCached: 'ምስል ላይ ደርሰዋል። የAI ምስል መግለጫ እየተነበበ ነው...',
      // Accommodations & Shortcuts Drawer i18n
      transcriptLabel: 'የቪዲዮና ኦዲዮ የፅሑፍ ግልባጭ',
      transcriptSummary: 'የትምህርቱ ሙሉ የፅሑፍ ግልባጭ እና ንዑስ ርዕሶች (የመስማት ችግር ላለባቸው)',
      transcriptHeading: 'የድምፅ ይዘት ማጠቃለያ',
      transcriptBody: 'ይህ ትምህርት የቨርቹዋል አሲስታንት ኢንዱስትሪ የወደፊት ጉዞን ያብራራል። ቴክኖሎጂ እና አርቴፊሻል ኢንተለጀንስ (AI) የስራ ሂደቶችን እንዴት እየቀየሩ እንዳሉ እና የሰው ልጅ ክህሎቶች ለምን ይበልጥ አስፈላጊ እንደሆኑ በዝርዝር ያትታል።',
      transcriptSignBtn: 'የኢትዮጵያ የምልክት ቋንቋ (EthSL) አስተርጓሚ ይጠይቁ',
      transcriptSignAlert: 'የምልክት ቋንቋ ጥያቄዎ ተመዝግቧል። የተደራሽነት አስተባባሪ ያነጋግርዎታል።',
      shortcutTableKey: 'ቁልፍ',
      shortcutTableAction: 'ተግባር',
      shortcutTableImg: 'የምስሉን ዝርዝር መግለጫ አድምጥ (AI Image Inspector)',
      shortcutTableSpace: 'በስካነር ውስጥ ንቁ የሆነውን መምረጥ',
      shortcutVoiceTitle: 'እጅ-አልባ የድምፅ ትዕዛዞች',
      shortcutGotIt: 'ተረዳሁ',
    },
    om: {
      triggerLabel: 'Filannoowwan qaqqabiinsaa fi qindaa’inoota madaqsuu',
      modalTitle: 'Barnoota keessan haala akkamiin hordofuu barbaaddu?',
      modalSubtitle: 'Fuula barnootaa keessan fooyyeffadhaa. Waan barachuuf isin gargaaru hundumaa filadhaa.',
      noticeText: 'Waraqaa ragaa yaalaa hin gaafannu. Yeroo barbaaddanitti jijjiiruu ykn bira darbuu dandeessu.',
      optScreenReaderTitle: 'Dubbisaa Iskiriinii fi Qajeelcha Sagalee',
      optScreenReaderDesc: 'Barattoota ijaan hin argineef kan mijate: ibsa suuraa bal’aa, deeggarsa dubbisaa iskiriinii fi kallattii sagalee.',
      optCaptionsTitle: 'Ibsa Barreeffamaa fi Akeekkachiisa Mul’ataa',
      optCaptionsDesc: 'Barattoota gurraan hin dhageenyeef kan mijate: barreeffama sagalee fi akeekkachiisa ifa mul’ataa.',
      optContrastTitle: 'Barreeffama Guddaa fi Wal-dhabdee Rangi Mul’ataa',
      optContrastDesc: 'Barattoota arguuf rakkina qabaniif: wal-dhabdee rangi gaarii, barreeffama bal’aa fi agarsiistuu ifaa.',
      optMotorTitle: 'Kiiyboordii, Meesha Swiikii fi Deeggarsa Sochii',
      optMotorDesc: 'Rakkina sochii qaamaa qabaniif: qabduuwwan gurguddoo, kutaalee saffisaa fi iskaanerii ofumaa.',
      optCognitiveTitle: 'Afaan Salphaa fi Hubannoo Qulqulluu',
      optCognitiveDesc: 'Barattoota xiyyeeffannoo fi dubbisuun isaan dhibuuf: barreeffama salphaa, sarara dubbisaa fi sochii hir’ate.',
      btnSave: 'Olkaayiitii Hojiirra Oolchi',
      btnSkip: 'Ammaaf bira darbi (Booddeen qindeessa)',
      langToggle: 'Afaan Oromoo (OM)',
      closeLabel: 'Dallaa qaqqabiinsaa cufi',
      savedAnnouncement: 'Filannoowwan qaqqabiinsaa haaromfaman hojiirra oolaniiru.',
      skippedAnnouncement: 'Qindaa’inni qaqqabiinsaa darbeera. Yeroo barbaaddanitti qabduu qaqqabiinsaan banuu dandeessu.',
      motorBarLabel: 'Tarkaanfiiwwan Saffisaa Sochii Qaamaa',
      btnMotorBack: 'Duubatti (K)',
      btnMotorComplete: 'Xumuri (C)',
      btnMotorNext: 'Itti aani (J)',
      btnVoiceNav: 'Kallattii Sagalee (V)',
      btnAutoScan: 'Iskaanerii Swiikii (S)',
      btnShortcuts: 'Qaxxaamura (?)',
      voiceNavActive: '🎙️ Sagalee dhaggeeffachuun banaadha. Jechoota kanneen fayyadamaa: Itti aani, Duubatti, Xumuri, Gadi siqi, Dubbisi, Dhaabi, Gargaarsa',
      voiceNavUnsupported: 'Biroowzariin keessan ajaja sagalee hin deggeru. Qaxxaamura kiiyboordii (J, K, C, S) fayyadamaa.',
      voiceNavStopped: 'Ajajni sagalee dhaabbateera.',
      scanActive: '⚡ Iskaaneriin ofumaa banaadha. Waan filatame banuuf Space ykn Enter dhiibaa. Dhaabuuf Esc dhiibaa.',
      scanStopped: 'Iskaaneriin ofumaa dhaabbateera.',
      shortcutsModalTitle: 'Qajeelfama Kiiyboordii fi Ajaja Sagalee',
      shortcutsModalDesc: 'Barattoota sochii qaamaa irratti rakkina qabaniif qaxxaamura kiiyboordii fi ajaja sagalee.',
      shortcutNext: 'Gara barnoota itti aanutti darbi',
      shortcutPrev: 'Gara barnoota darbeetti deebi’i',
      shortcutComplete: 'Hojii kana akka xumurameetti galmeessi',
      shortcutScan: 'Iskaanerii swiikii ofumaa bani / cufi',
      shortcutVoice: 'Ajaja sagalee harka-malee bani / cufi',
      shortcutHelp: 'Qajeelfama qaxxaamuraa bani / cufi',
      shortcutEsc: 'Iskaanerii dhaabi ykn dallaa banaa cufi',
      voiceCmdList: 'Ajaja Sagalee: "next", "back", "complete", "scroll down", "scroll up", "read", "stop", "help"',
      btnSimplify: '✨ Ibsa Salphaa',
      btnOriginal: 'Barreeffama Jalqabaa',
      simplifiedTitle: 'Cuunfaa Sadarkaa-sadarkaan Afaan Salphaan',
      simplifiedLoading: 'Gara afaan salphaatti jijjiiramaa jira...',
      btnReadAloud: '🔊 Sagaleen Dhaggeeffadhu',
      rulerToggle: '📏 Sarara Qajeelcha Dubbisaa',
      rulerActivePill: '📏 Sarara Dubbisaa: BANAA (Cufuuf R dhiibaa)',
      rulerInactivePill: '📏 Sarara Dubbisaa: CUFAA (Banuuf R dhiibaa)',
      stepBadge: 'Sadarkaa',
      plainKeyTakeaway: 'Qabxii Ijoo',
      plainActionSteps: 'Tarkaanfiiwwan Hojii',
      btnDescribeImg: '👁️ Suuraa Ibsi (Alt+I)',
      imgDescTitle: 'Ibsa Suuraa AI (Dubbisaa Iskiriiniif)',
      imgDescReadAloud: '🔊 Sagaleen Dhaggeeffadhu',
      imgDescClose: 'Ibsa Cufi',
      imgDescAnnounce: 'Ibsi suuraa sagaleen dubbifamaa jira...',
      imgArrivalAnnouncement: 'Suuraa irra geessaniittu. AI suuraa qaaccessaa jira...',
      imgArrivalCached: 'Suuraa irra geessaniittu. Ibsi suuraa AI taphachaa jira.',
      transcriptLabel: 'Waraabbii Barreeffama Sagalee fi Viidiyoo Barnootaa',
      transcriptSummary: 'Waraabbii Guutuu Sagalee fi Mata-duree Gadii (Gurraan Hin Dhageenyeef)',
      transcriptHeading: 'Cuunfaa Qabiyyee Dubbatamee',
      transcriptBody: 'Barnoonni kun gara fuulduraa ogummaa Gargaaraa Fageenyaa (Virtual Assistant) ibsa. Akkaataa teeknooloojiin fi Namtolcheen (AI) adeemsa hojii jijjiiraa jiranii fi sababa dandeettiin dhala namaa daran barbaachisaa ta’e bal’inaan dhiyeessa.',
      transcriptSignBtn: 'Afaan Mallattoo Itoophiyaa (EthSL) Gaafadhaa',
      transcriptSignAlert: 'Gaaffiin afaan mallattoo keessanii galmaa’eera. Qindeessaan qaqqabiinsaa isin gargaara.',
      shortcutTableKey: 'Qubee',
      shortcutTableAction: 'Hojii',
      shortcutTableImg: 'Ibsa suuraa AI dhaggeeffadhu (Screen Reader)',
      shortcutTableSpace: 'Iskaanerii keessatti waan filatame bani',
      shortcutVoiceTitle: 'Ajaja Sagalee Harka-Malee',
      shortcutGotIt: 'Hubadheera',
    },
    ti: {
      triggerLabel: 'ናይ ተበጻሕነት ምርጫታትን ምምችቻው ቅጥዕታትን',
      modalTitle: 'ትምህርትኹም ብኸመይ ክትከታተሉ ትደልዩ?',
      modalSubtitle: 'ናይ ትምህርቲ መተግበሪ ገጽኩም ኣመዓራርዩ። ዝበለጸ ንኽትመሃሩ ዝሕግዙኹም ኲሎም ምረጹ።',
      noticeText: 'ናይ ሕክምና መረዳእታ ወይ መረጋገጺ ኣይንሓትን ኢና። ኣብ ዝኾነ እዋን ክትቅይሩ ወይ ክትሓልፉ ትኽእሉ ኢኹም።',
      optScreenReaderTitle: 'ስክሪን ኣንባቢን ናይ ድምጺ መምርሒን',
      optScreenReaderDesc: 'ንዓይነ-ስዉራን ተምሃሮ ዝተመቻቸወ፡ ዝርዝር መግለጺታት ስእሊ፡ ደገፍ ስክሪን ኣንባቢን ድምጻዊ ዳህሳስን።',
      optCaptionsTitle: 'ጽሑፋዊ መግለጺታትን ናይ ምርኢት መጠንቀቕታታትን',
      optCaptionsDesc: 'ጸገም ምስማዕ ንዘለዎም ተምሃሮ ዝተመቻቸወ፡ ትሕዝቶ ድምጺ ብጽሑፍን ናይ ምርኢት ብልጭታ መጠንቀቕታን።',
      optContrastTitle: 'ዓቢ ጽሑፍን ልዑል ናይ ሕብሪ ፍልልይን',
      optContrastDesc: 'ትሑት ምርኢት ንዘለዎም ተምሃሮ፡ ልዑል ፍልልይ ሕብርታት፡ ዓበይቲ ፊደላትን ድሙቕ መመልከቲን።',
      optMotorTitle: 'ኪቦርድ፡ ናይ ስዊች መሳርሒን ናይ ምንቅስቓስ ሓገዝን',
      optMotorDesc: 'ናይ ምንቅስቓስ ጸገም ንዘለዎም፡ ዓበይቲ መተኮሲታት፡ ቀለልቲ ኣቋራጭ ቁልፍታትን ኣውቶማቲክ ስካነርን።',
      optCognitiveTitle: 'ቀሊል ቋንቋን ካብ ምዝንጋዕ ነጻ ዝኾነ ምርኢትን',
      optCognitiveDesc: 'ንቀሊል ንባብን ቆላሕታን፡ ሓጸርቲ ሓረጋት፡ ናይ ንባብ መስመርን ምንቅስቓስ ዘይብሉ ትርኢትን።',
      btnSave: 'ኣቐሚጥካ ተግብር',
      btnSkip: 'ንሕጂ ሕለፎ (ጸኒሐ ከስተኻኽሎ እየ)',
      langToggle: 'ትግርኛ (TI)',
      closeLabel: 'ናይ ተበጻሕነት መስኮት ዕጾ',
      savedAnnouncement: 'ናይ ተበጻሕነት ምርጫታት ተመዝጊቦም ተተግቢሮም ኣለዉ።',
      skippedAnnouncement: 'ናይ ተበጻሕነት ቅጥዒ ሓሊፉ። ኣብ ዝኾነ እዋን በቲ ናይ ተበጻሕነት መጎልበቲ ክትከፍቱዎ ትኽእሉ ኢኹም።',
      motorBarLabel: 'ናይ ምንቅስቓስን ኣካላዊ ሓገዝን ቅልጡፍ ስጉምትታት',
      btnMotorBack: 'ተመለስ (K)',
      btnMotorComplete: 'ፈጽም (C)',
      btnMotorNext: 'ቀጻሊ (J)',
      btnVoiceNav: 'ናይ ድምጺ ትእዛዝ (V)',
      btnAutoScan: 'ስዊች ስካነር (S)',
      btnShortcuts: 'ኣቋራጭታት (?)',
      voiceNavActive: '🎙️ ናይ ድምጺ ምስማዕ ተኸፊቱ ኣሎ። ዝስዕቡ ቃላት ተጠቐሙ፡ ቀጻሊ፡ ተመለስ፡ ፈጽም፡ ንታሕቲ፡ ኣንብብ፡ ደው በል፡ ሓገዝ',
      voiceNavUnsupported: 'እዚ ብሮውዘር ናይ ድምጺ ትእዛዝ ኣይድግፍን እዩ። ናይ ኪቦርድ ኣቋራጭታት (J, K, C, S) ተጠቐሙ።',
      voiceNavStopped: 'ናይ ድምጺ ትእዛዝ ደው ኢሉ ኣሎ።',
      scanActive: '⚡ ኣውቶማቲክ ስካነር በርሁ ኣሎ። ዝተመርጸ ንምኽፋት Space ወይ Enter ጠውቑ። ደው ንምባል Esc ጠውቑ።',
      scanStopped: 'ኣውቶማቲክ ስካነር ደው ኢሉ ኣሎ።',
      shortcutsModalTitle: 'ናይ ኪቦርድን ናይ ድምጺ ትእዛዝን መምርሒ',
      shortcutsModalDesc: 'ናይ ምንቅስቓስ ጸገም ንዘለዎም ተምሃሮ ዝተዳለዉ ነጸል ቁልፍታትን ናይ ድምጺ ትእዛዛትን።',
      shortcutNext: 'ናብ ቀጻሊ ትምህርቲ / ክፍሊ ኪድ',
      shortcutPrev: 'ናብ ዝሓለፈ ትምህርቲ / ተመለስ',
      shortcutComplete: 'ናይ ሕጂ ዕዮ ከም ዝተዛዘመ መዝግብ',
      shortcutScan: 'ናይ ስዊች ኣውቶማቲክ ስካነር ኣብርህ / ኣጥፍእ',
      shortcutVoice: 'ኢድ-ኣልቦ ናይ ድምጺ ትእዛዝ ኣብርህ / ኣጥፍእ',
      shortcutHelp: 'እዚ ናይ መምርሒ መስኮት ክፈት / ዕጾ',
      shortcutEsc: 'ስካነር ደው ኣብል ወይ ንቑሕ መስኮት ዕጾ',
      voiceCmdList: 'ናይ ድምጺ ትእዛዛት: "next", "back", "complete", "scroll down", "scroll up", "read", "stop", "help"',
      btnSimplify: '✨ ቀሊል መብርሂ',
      btnOriginal: 'መበቆላዊ ጽሑፍ',
      simplifiedTitle: 'ቀሊልን ብደረጃ ዝተሰርዐን ጽማቔ',
      simplifiedLoading: 'ናብ ቀሊል ቋንቋ ይቕየር ኣሎ...',
      btnReadAloud: '🔊 ብድምጺ ኣስምዕ',
      rulerToggle: '📏 ናይ ንባብ መምርሒ መስመር',
      rulerActivePill: '📏 ናይ ንባብ መስመር: በርሁ ኣሎ (R ጠውቑ)',
      rulerInactivePill: '📏 ናይ ንባብ መስመር: ጠፊኡ ኣሎ (R ጠውቑ)',
      stepBadge: 'ደረጃ',
      plainKeyTakeaway: 'ቀንዲ ነጥቢ',
      plainActionSteps: 'ቀጻሊ ስጉምትታት',
      btnDescribeImg: '👁️ ስእሊ ኣብራህ (Alt+I)',
      imgDescTitle: 'ናይ AI ስእላዊ መግለጺ (ንሰክሪን ኣንባቢ)',
      imgDescReadAloud: '🔊 ብድምጺ ኣስምዕ',
      imgDescClose: 'መብርሂ ዕጾ',
      imgDescAnnounce: 'ናይ ስእሉ መግለጺ ብድምጺ ይንበብ ኣሎ...',
      imgArrivalAnnouncement: 'ስእሊ ረኺብኩም ኣለኹም። AI ነቲ ስእሊ ይምርምሮ ኣሎ...',
      imgArrivalCached: 'ስእሊ ረኺብኩም ኣለኹም። ናይ AI ስእላዊ መግለጺ ይንበብ ኣሎ።',
      transcriptLabel: 'ናይ ትምህርቲ ድምጽን ቪድዮን ጽሑፋዊ ቅዳሕ',
      transcriptSummary: 'ናይ ትምህርቲ ምሉእ ጽሑፋዊ ቅዳሕን ንኡሳን ኣርእስታትን (ንጸገም ምስማዕ)',
      transcriptHeading: 'ጽማቔ ናይቲ ዝተነበበ ትሕዝቶ',
      transcriptBody: 'እዚ ትምህርቲ መጻኢ ናይ ቨርቹዋል ኣሲስታንት (Virtual Assistant) ሞያ የብርህ። ቴክኖሎጂን ሰርሖ-ሰብን (AI) ከመይ ጌሮም ናይ ስራሕ ሂደታት ይቕይሩ ከምዘለዉን ናይ ደቂ-ሰብ ክእለት ስለምንታይ ኣዝዩ ኣገዳሲ ከምዝኾነን ብዝርዝር የረድእ።',
      transcriptSignBtn: 'ናይ ኢትዮጵያ ምልክት ቋንቋ (EthSL) ተርጓሚ ሕተት',
      transcriptSignAlert: 'ናይ ምልክት ቋንቋ ሕቶኹም ተመዝጊቡ ኣሎ። ናይ ተበጻሕነት ኣተሓባባሪ ክሕግዘኩም እዩ።',
      shortcutTableKey: 'ቁልፊ',
      shortcutTableAction: 'ተግባር',
      shortcutTableImg: 'ናይ ስእሊ ዝርዝር መግለጺ ስማዕ (Screen Reader)',
      shortcutTableSpace: 'ኣብ ስካነር ንቑሕ ዝኾነ ምረጽ',
      shortcutVoiceTitle: 'ኢድ-ኣልቦ ናይ ድምጺ ትእዛዛት',
      shortcutGotIt: 'ተረዲኡኒ',
    },
    so: {
      triggerLabel: 'Dookhyada fududeynta iyo habeynta adeegga',
      modalTitle: 'Sidee ayaad jeclaan lahayd inaad wax u barato?',
      modalSubtitle: 'Habeey muuqaalkaaga waxbarasho. Dooro wax kasta oo waxbarashadaada fududeynaya.',
      noticeText: 'Ma weydiinno caddeyn caafimaad. Waad beddeli kartaa wakhti kasta ama waad ka boodi kartaa.',
      optScreenReaderTitle: 'Akhristaha Shaashadda iyo Hagidda Codka',
      optScreenReaderDesc: 'Waxaa loo habeeyay ardayda aragga naafada ka ah: sharaxaad sawirro oo faahfaahsan iyo hagidda codka.',
      optCaptionsTitle: 'Qoraalka Hoose, Qoraallada iyo Digniinaha Muuqaalka ah',
      optCaptionsDesc: 'Waxaa loo habeeyay ardayda maagalka naafada ka ah: qoraalka codka iyo digniino biligleynaya.',
      optContrastTitle: 'Qoraal Weyn iyo Aragti Ka Duwan oo Sare',
      optContrastDesc: 'Waxaa loo habeeyay dadka araggoodu daciifka yahay: xuruuf waaweyn iyo tilmaamayaal cad.',
      optMotorTitle: 'Kiiboodhka, Qalabka Badhanka iyo Caawinta Dhaqdhaqaaqa',
      optMotorDesc: 'Waxaa loo habeeyay xaddidaadda dhaqdhaqaaqa: badhano waaweyn iyo furayaal gaagaaban.',
      optCognitiveTitle: 'Luqad Fudud iyo Feejignaan Sare',
      optCognitiveDesc: 'Waxaa loo habeeyay feejignaanta iyo akhriska: qoraal la fududeeyay iyo xariiqda hagidda akhriska.',
      btnSave: 'Keydi oo Dhaqangeli',
      btnSkip: 'Ka bood hadda (Hadhow baan habeyn doonaa)',
      langToggle: 'Soomaali (SO)',
      closeLabel: 'Xir daaqadda fududeynta',
      savedAnnouncement: 'Dookhyada fududeynta waa la cusbooneysiiyay waana la dhaqangeliyay.',
      skippedAnnouncement: 'Dejinta fududeynta waa laga booday. Waxaad furi kartaa wakhti kasta adigoo isticmaalaya badhanka fududeynta.',
      motorBarLabel: 'Tallaabooyinka Degdegga ah ee Dhaqdhaqaaqa',
      btnMotorBack: 'Dib (K)',
      btnMotorComplete: 'Dhameystir (C)',
      btnMotorNext: 'Xiga (J)',
      btnVoiceNav: 'Hagidda Codka (V)',
      btnAutoScan: 'Baaraha Badhanka (S)',
      btnShortcuts: 'Gaagaaban (?)',
      voiceNavActive: '🎙️ Dhageysiga codka waa furan yahay. Dheh: Xiga, Dib, Dhameystir, Hoos u rog, Akhri, Jooji, Caawimaad',
      voiceNavUnsupported: 'Barrawsarkaagu ma taageero amarrada codka. Fadlan isticmaal furayaasha gaagaaban (J, K, C, S).',
      voiceNavStopped: 'Hagiddii codka waa la hakiyay.',
      scanActive: '⚡ Baaraha tooska ah waa shaqeynayaa. Riix Space ama Enter si aad u doorato. Riix Esc si aad u joojiso.',
      scanStopped: 'Baarihii tooska ahaa waa istaagay.',
      shortcutsModalTitle: 'Tilmaamaha Furayaasha Kiiboodhka iyo Codka',
      shortcutsModalDesc: 'Furayaal gaagaaban oo loogu talagalay ardayda qabta dhibaatooyinka dhaqdhaqaaqa.',
      shortcutNext: 'U gudub casharka xiga',
      shortcutPrev: 'Ku noqo casharkii hore',
      shortcutComplete: 'U calaamadee hawshan mid dhammaatay',
      shortcutScan: 'Daar / Demi baaraha tooska ah',
      shortcutVoice: 'Daar / Demi aqoonsiga codka',
      shortcutHelp: 'Fur / Xir tilmaamaha furayaasha',
      shortcutEsc: 'Jooji baaraha ama xir daaqadaha furan',
      voiceCmdList: 'Amarrada Codka: "next", "back", "complete", "scroll down", "scroll up", "read", "stop", "help"',
      btnSimplify: '✨ Fududee Qoraalka',
      btnOriginal: 'Qoraalkii Asalka Ahaa',
      simplifiedTitle: 'Soo Koobid Luqad Fudud ah (Tallaabo-tallaabo)',
      simplifiedLoading: 'Waxaa loo beddelayaa luqad fudud...',
      btnReadAloud: '🔊 Kor u Akhri',
      rulerToggle: '📏 Xariiqda Hagidda Akhriska',
      rulerActivePill: '📏 Xariiqda Akhriska: DAARAN (Riix R si aad u damiso)',
      rulerInactivePill: '📏 Xariiqda Akhriska: DAMISAN (Riix R si aad u daarto)',
      stepBadge: 'Tallaabada',
      plainKeyTakeaway: 'Qodobka Muhiimka ah',
      plainActionSteps: 'Tallaabooyinka Shaqada',
      btnDescribeImg: '👁️ Sharax Sawirka (Alt+I)',
      imgDescTitle: 'Sharaxaadda Muuqaalka AI (Akhristaha Shaashadda)',
      imgDescReadAloud: '🔊 Kor u Akhri',
      imgDescClose: 'Xir Sharaxaadda',
      imgDescAnnounce: 'Sharaxaadda sawirka ayaa kor loo akhrinayaa...',
      imgArrivalAnnouncement: 'Sawir ayaad dul joogtaa. AI ayaa baaraya sawirka...',
      imgArrivalCached: 'Sawir ayaad dul joogtaa. Sharaxaadda AI ayaa socota.',
      transcriptLabel: 'Qoraalka Codka iyo Fiidyowga Casharka',
      transcriptSummary: 'Qoraalka Buuxa ee Codka Casharka (Dadka Dhegaha Naafada ka ah)',
      transcriptHeading: 'Soo Koobidda Qoraalka Codka',
      transcriptBody: 'Casharkani wuxuu faahfaahinayaa mustaqbalka xirfadda Kaaliyaha Fogaanta (Virtual Assistant). Sida tiknoolajiyada iyo Garaadka Macmalka ah (AI) ay u beddelayaan shaqada iyo sababta xirfadaha aadanaha ay muhiim u yihiin.',
      transcriptSignBtn: 'Codso Turjumaanka Luqadda Dhaqdhaqaaqa (EthSL)',
      transcriptSignAlert: 'Codsigaaga luqadda dhegoolaha waa la diiwaangeliyay. Isku-duwaha fududeynta ayaa kula soo xiriiri doona.',
      shortcutTableKey: 'Furaha',
      shortcutTableAction: 'Shaqada',
      shortcutTableImg: 'Dhageyso sharaxaadda sawirka AI (Screen Reader)',
      shortcutTableSpace: 'Dooro waxa calaamadeysan xilliga baarista',
      shortcutVoiceTitle: 'Amarrada Codka ee Gacmo-La\'aanta ah',
      shortcutGotIt: 'Waan Fahmay',
    },
    ar: {
      triggerLabel: 'تفضيلات إمكانية الوصول وإعدادات الملاءمة',
      modalTitle: 'كيف تفضل خوض تجربتك التعليمية؟',
      modalSubtitle: 'خصّص واجهة تعلّمك. اختر جميع الخيارات التي تساعدك على التعلّم بشكل أفضل.',
      noticeText: 'نحن لا نطلب سجلاً طبياً أو إثباتاً. يمكنك تعديل هذه الخيارات في أي وقت أو تخطيها.',
      optScreenReaderTitle: 'قارئ الشاشة والتعلم الموجّه صوتياً',
      optScreenReaderDesc: 'مُحسّن للمتعلمين المكفوفين: معالم منطوقة، ووصف غني للصور، وتنقّل صوتي.',
      optCaptionsTitle: 'الترجمة النصية والنصوص المقروءة والتنبيهات المرئية',
      optCaptionsDesc: 'مُحسّن للمتعلمين الصم وضعاف السمع: ترجمات، نصوص كاملة للمحتوى الصوتي، وتنبيهات وميض مرئية.',
      optContrastTitle: 'نص كبير وتباين بصري عالٍ',
      optContrastDesc: 'مُحسّن للمتعلمين ضعاف البصر: نسب تباين محسنة، نصوص قابلة للتكبير، ومؤشرات تركيز واضحة.',
      optMotorTitle: 'لوحة المفاتيح وأجهزة التبديل والمساعدة الحركية',
      optMotorDesc: 'مُحسّن لمحدودي الحركة: أزرار تحكم كبيرة، اختصارات بمفتاح واحد، وفحص تلقائي للمفاتيح.',
      optCognitiveTitle: 'لغة مبسطة وتقليل المشتتات',
      optCognitiveDesc: 'مُحسّن للتنوع العصبي والتشتت وعسر القراءة: نصوص مبسطة، مسطرة قراءة، وحركات مخففة.',
      btnSave: 'حفظ وتطبيق التفضيلات',
      btnSkip: 'تخطي الآن (سأقوم بالتهيئة لاحقاً)',
      langToggle: 'العربية (AR)',
      closeLabel: 'إغلاق نافذة إمكانية الوصول',
      savedAnnouncement: 'تم تحديث تفضيلات إمكانية الوصول وتطبيقها.',
      skippedAnnouncement: 'تم تخطي إعداد إمكانية الوصول. يمكنك فتحه في أي وقت باستخدام زر إمكانية الوصول.',
      motorBarLabel: 'الإجراءات السريعة للمساعدة الحركية',
      btnMotorBack: 'رجوع (K)',
      btnMotorComplete: 'إكمال (C)',
      btnMotorNext: 'التالي (J)',
      btnVoiceNav: 'التنقل الصوتي (V)',
      btnAutoScan: 'الفحص التلقائي (S)',
      btnShortcuts: 'الاختصارات (?)',
      voiceNavActive: '🎙️ الاستماع للأوامر الصوتية نشط. قل: التالي، رجوع، إكمال، مرر لأسفل، اقرأ، توقف، مساعدة',
      voiceNavUnsupported: 'متصفحك لا يدعم التعرف على الصوت. يرجى استخدام اختصارات لوحة المفاتيح (J, K, C, S).',
      voiceNavStopped: 'تم إيقاف التنقل الصوتي مؤقتاً.',
      scanActive: '⚡ الفحص التلقائي نشط. اضغط مسافة أو Enter للاختيار. اضغط Esc للإيقاف.',
      scanStopped: 'تم إيقاف الفحص التلقائي.',
      shortcutsModalTitle: 'دليل لوحة المفاتيح والأوامر الصوتية',
      shortcutsModalDesc: 'اختصارات بمفتاح واحد وأوامر صوتية مصممة لتيسير الحركة.',
      shortcutNext: 'الانتقال إلى الدرس أو القسم التالي',
      shortcutPrev: 'الرجوع إلى الدرس السابق',
      shortcutComplete: 'تحديد النشاط الحالي كمكتمل',
      shortcutScan: 'تبديل الفاحص التلقائي للمفاتيح',
      shortcutVoice: 'تبديل التعرف الصوتي دون استخدام اليدين',
      shortcutHelp: 'فتح أو إغلاق دليل الاختصارات',
      shortcutEsc: 'إلغاء الفحص أو إغلاق النوافذ المفتوحة',
      voiceCmdList: 'الأوامر الصوتية: "next", "back", "complete", "scroll down", "scroll up", "read", "stop", "help"',
      btnSimplify: '✨ تبسيط النص',
      btnOriginal: 'النص الأصلي',
      simplifiedTitle: 'ملخص بلغة مبسطة (خطوة بخطوة)',
      simplifiedLoading: 'جارٍ تبسيط النص إلى لغة سهلة...',
      btnReadAloud: '🔊 قراءة بصوت عالٍ',
      rulerToggle: '📏 مسطرة دليل القراءة',
      rulerActivePill: '📏 مسطرة القراءة: مفعلة (اضغط R للإيقاف)',
      rulerInactivePill: '📏 مسطرة القراءة: معطلة (اضغط R للتشغيل)',
      stepBadge: 'الخطوة',
      plainKeyTakeaway: 'الفكرة الرئيسية',
      plainActionSteps: 'خطوات التنفيذ',
      btnDescribeImg: '👁️ وصف الصورة (Alt+I)',
      imgDescTitle: 'الوصف البصري بالذكاء الاصطناعي (لقارئ الشاشة)',
      imgDescReadAloud: '🔊 قراءة بصوت عالٍ',
      imgDescClose: 'إغلاق الوصف',
      imgDescAnnounce: 'جارٍ قراءة الوصف البصري بصوت عالٍ...',
      imgArrivalAnnouncement: 'تم التركيز على الصورة. يقوم الذكاء الاصطناعي بتحليل العناصر...',
      imgArrivalCached: 'تم التركيز على الصورة. تشغيل الوصف البصري.',
      transcriptLabel: 'النص المقروء والتفريغ الصوتي للدرس',
      transcriptSummary: 'التفريغ الصوتي والترجمة النصية للدرس (لضعاف السمع)',
      transcriptHeading: 'تفريغ المحتوى الصوتي للدرس',
      transcriptBody: 'يشرح هذا الدرس مستقبل مهنة المساعد الافتراضي (Virtual Assistant). كيف تؤثر التكنولوجيا والذكاء الاصطناعي في بيئة العمل ولماذا تزداد أهمية المهارات البشرية.',
      transcriptSignBtn: 'طلب ترجمة بلغة الإشارة الإثيوبية (EthSL)',
      transcriptSignAlert: 'تم تسجيل طلب ترجمة لغة الإشارة. سيتواصل معك منسق إمكانية الوصول.',
      shortcutTableKey: 'المفتاح',
      shortcutTableAction: 'الإجراء',
      shortcutTableImg: 'الاستماع لوصف الصورة بالذكاء الاصطناعي',
      shortcutTableSpace: 'تحديد العنصر النشط أثناء الفحص التلقائي',
      shortcutVoiceTitle: 'الأوامر الصوتية دون استخدام اليدين',
      shortcutGotIt: 'حسناً، فهمت',
    },
    sw: {
      triggerLabel: 'Mapendeleo ya ufikiaji na mipangilio ya marekebisho',
      modalTitle: 'Je, ungependa kupata uzoefu gani wa kujifunza?',
      modalSubtitle: 'Binafsisha kiolesura chako cha kujifunza. Chagua vyote vinavyokusaidia kujifunza vizuri.',
      noticeText: 'Hatuulizi historia ya matibabu au uthibitisho. Unaweza kubadilisha haya wakati wowote au kuruka.',
      optScreenReaderTitle: 'Kisoma Skrini na Masomo ya Kuongozwa kwa Sauti',
      optScreenReaderDesc: 'Imeboreshwa kwa wanafunzi wasioona: maelezo ya kina ya picha na urambazaji kwa sauti.',
      optCaptionsTitle: 'Manukuu, Nakala za Maandishi na Arifa za Kuona',
      optCaptionsDesc: 'Imeboreshwa kwa viziwi na wenye ugumu wa kusikia: manukuu ya sauti na arifa za mwanga.',
      optContrastTitle: 'Maandishi Makubwa na Utofautishaji wa Juu wa Rangi',
      optContrastDesc: 'Imeboreshwa kwa wanafunzi wenye uono hafifu: utofautishaji wa hali ya juu na maandishi yanayokuzika.',
      optMotorTitle: 'Kibodi, Vifaa vya Swichi na Usaidizi wa Mwendo',
      optMotorDesc: 'Imeboreshwa kwa wenye ulemavu wa viungo: vitufe vikubwa, njia za mkato na skana ya kiotomatiki.',
      optCognitiveTitle: 'Lugha Rahisi na Utulivu wa Kuzingatia',
      optCognitiveDesc: 'Imeboreshwa kwa wanafunzi wenye ugumu wa kusoma: maandishi rahisi, rula ya kusoma na uhuishaji uliopunguzwa.',
      btnSave: 'Hifadhi na Utumie',
      btnSkip: 'Ruka kwa sasa (Nitarekebisha baadaye)',
      langToggle: 'Kiswahili (SW)',
      closeLabel: 'Funga dirisha la ufikiaji',
      savedAnnouncement: 'Mapendeleo ya ufikiaji yamesasishwa na kutumiwa.',
      skippedAnnouncement: 'Usanidi wa ufikiaji umerukwa. Unaweza kuufungua wakati wowote kwa kitufe cha ufikiaji.',
      motorBarLabel: 'Vitendo vya Haraka vya Usaidizi wa Mwendo',
      btnMotorBack: 'Nyuma (K)',
      btnMotorComplete: 'Kamilisha (C)',
      btnMotorNext: 'Mbele (J)',
      btnVoiceNav: 'Amri za Sauti (V)',
      btnAutoScan: 'Skana ya Swichi (S)',
      btnShortcuts: 'Njia za Mkato (?)',
      voiceNavActive: '🎙️ Usikilizaji wa amri za sauti unatumika. Sema: Mbele, Nyuma, Kamilisha, Shuka chini, Soma, Simama, Msaada',
      voiceNavUnsupported: 'Kivinjari chako hakiungi mkono utambuzi wa sauti. Tumia njia za mkato za kibodi (J, K, C, S).',
      voiceNavStopped: 'Urambazaji wa sauti umesitishwa.',
      scanActive: '⚡ Skana ya kiotomatiki inafanya kazi. Bonyeza Space au Enter kuchagua. Bonyeza Esc kusimamisha.',
      scanStopped: 'Skana ya kiotomatiki imesimamishwa.',
      shortcutsModalTitle: 'Mwongozo wa Kibodi na Amri za Sauti',
      shortcutsModalDesc: 'Njia za mkato na amri za sauti zilizoundwa kusaidia wanafunzi wenye vikwazo vya mwendo.',
      shortcutNext: 'Nenda kwenye somo au sehemu inayofuata',
      shortcutPrev: 'Rudi kwenye somo lililopita',
      shortcutComplete: 'Weka alama ya shughuli kuwa imekamilika',
      shortcutScan: 'Washa / Zima skana ya swichi ya kiotomatiki' ,
      shortcutVoice: 'Washa / Zima amri za sauti bila mikono',
      shortcutHelp: 'Fungua / Funga mwongozo wa njia za mkato',
      shortcutEsc: 'Sitisha skana au funga madirisha yaliyofunguliwa',
      voiceCmdList: 'Amri za Sauti: "next", "back", "complete", "scroll down", "scroll up", "read", "stop", "help"',
      btnSimplify: '✨ Rahisisha Sehemu Hii',
      btnOriginal: 'Maandishi Asili',
      simplifiedTitle: 'Muhtasari wa Lugha Rahisi (Hatua kwa Hatua)',
      simplifiedLoading: 'Inarahisisha maandishi kuwa lugha nyepesi...',
      btnReadAloud: '🔊 Soma kwa Sauti',
      rulerToggle: '📏 Rula ya Mwongozo wa Kusoma',
      rulerActivePill: '📏 Rula ya Kusoma: IMEWASHWA (Bonyeza R kuzima)',
      rulerInactivePill: '📏 Rula ya Kusoma: IMEZIMWA (Bonyeza R kuwasha)',
      stepBadge: 'Hatua',
      plainKeyTakeaway: 'Jambo Kuu',
      plainActionSteps: 'Hatua za Kuchukua',
      btnDescribeImg: '👁️ Eleza Picha (Alt+I)',
      imgDescTitle: 'Maelezo ya Picha ya AI (Kwa Kisoma Skrini)',
      imgDescReadAloud: '🔊 Soma kwa Sauti',
      imgDescClose: 'Funga Maelezo',
      imgDescAnnounce: 'Maelezo ya picha yanasomwa kwa sauti...',
      imgArrivalAnnouncement: 'Picha imelengwa. AI inachambua vipengele vya picha...',
      imgArrivalCached: 'Picha imelengwa. Inasoma maelezo ya picha ya AI.',
      transcriptLabel: 'Nakala ya Maandishi ya Sauti na Video ya Somo',
      transcriptSummary: 'Nakala Kamili ya Maandishi ya Somo (Kwa Viziwi na Wenye Ugumu wa Kusikia)',
      transcriptHeading: 'Muhtasari wa Yaliyosemwa Katika Somo',
      transcriptBody: 'Somo hili linaeleza mustakabali wa taaluma ya Msaidizi wa Mtandaoni (Virtual Assistant). Jinsi teknolojia na Akili Mnemba (AI) zinavyobadilisha kazi na kwa nini ujuzi wa binadamu unazidi kuwa muhimu.',
      transcriptSignBtn: 'Omba Mkalimani wa Lugha ya Alama (EthSL)',
      transcriptSignAlert: 'Ombi lako la lugha ya alama limesajiliwa. Mratibu wa ufikiaji atawasiliana nawe.',
      shortcutTableKey: 'Kitufe',
      shortcutTableAction: 'Kitendo',
      shortcutTableImg: 'Sikiliza maelezo ya picha ya AI (Screen Reader)',
      shortcutTableSpace: 'Chagua kipengele wakati wa skana ya kiotomatiki',
      shortcutVoiceTitle: 'Amri za Sauti Bila Kutumia Mikono',
      shortcutGotIt: 'Nimeelewa',
    },
    fr: {
      triggerLabel: 'Préférences d’accessibilité et paramètres d’adaptation',
      modalTitle: 'Comment souhaitez-vous vivre votre apprentissage ?',
      modalSubtitle: 'Personnalisez votre interface d’apprentissage. Sélectionnez tout ce qui vous aide à mieux apprendre.',
      noticeText: 'Nous ne demandons aucun justificatif médical. Vous pouvez modifier ces options à tout moment ou ignorer.',
      optScreenReaderTitle: 'Lecteur d’écran et apprentissage guidé par la voix',
      optScreenReaderDesc: 'Optimisé pour les apprenants non-voyants : repères vocaux, descriptions riches des images et navigation audio.',
      optCaptionsTitle: 'Sous-titres, transcriptions et alertes visuelles',
      optCaptionsDesc: 'Optimisé pour les personnes sourdes ou malentendantes : sous-titres, transcriptions audio et alertes visuelles.',
      optContrastTitle: 'Grand texte et contraste visuel élevé',
      optContrastDesc: 'Optimisé pour la basse vision : contrastes renforcés, typographie agrandie et indicateurs de focus nets.',
      optMotorTitle: 'Clavier, contacteurs et assistance motrice',
      optMotorDesc: 'Optimisé pour les limitations motrices : grands boutons, raccourcis à touche unique et balayage automatique.',
      optCognitiveTitle: 'Langage clair et faible distraction',
      optCognitiveDesc: 'Optimisé pour la neurodiversité, le TDAH et la dyslexie : texte simplifié, règle de lecture et animations réduites.',
      btnSave: 'Enregistrer et appliquer',
      btnSkip: 'Ignorer pour l’instant (je configurerai plus tard)',
      langToggle: 'Français (FR)',
      closeLabel: 'Fermer la boîte de dialogue d’accessibilité',
      savedAnnouncement: 'Préférences d’accessibilité mises à jour et appliquées.',
      skippedAnnouncement: 'Configuration d’accessibilité ignorée. Vous pouvez l’ouvrir à tout moment via le bouton d’accessibilité.',
      motorBarLabel: 'Actions rapides d’assistance motrice et de mobilité',
      btnMotorBack: 'Précédent (K)',
      btnMotorComplete: 'Terminer (C)',
      btnMotorNext: 'Suivant (J)',
      btnVoiceNav: 'Commandes Vocales (V)',
      btnAutoScan: 'Balayage Contacteur (S)',
      btnShortcuts: 'Raccourcis (?)',
      voiceNavActive: '🎙️ Écoute vocale active. Dites : Suivant, Précédent, Terminer, Défiler vers le bas, Lire, Arrêter, Aide',
      voiceNavUnsupported: 'Votre navigateur ne prend pas en charge la reconnaissance vocale. Utilisez les raccourcis clavier (J, K, C, S).',
      voiceNavStopped: 'Navigation vocale mise en pause.',
      scanActive: '⚡ Balayage automatique actif. Appuyez sur Espace ou Entrée pour sélectionner. Échap pour arrêter.',
      scanStopped: 'Balayage automatique arrêté.',
      shortcutsModalTitle: 'Guide des raccourcis clavier et commandes vocales',
      shortcutsModalDesc: 'Raccourcis à touche unique et commandes vocales mains libres conçus pour l’accessibilité motrice.',
      shortcutNext: 'Leçon suivante / section suivante',
      shortcutPrev: 'Leçon précédente / retour',
      shortcutComplete: 'Marquer l’activité actuelle comme terminée',
      shortcutScan: 'Activer / désactiver le balayage automatique',
      shortcutVoice: 'Activer / désactiver les commandes vocales mains libres',
      shortcutHelp: 'Ouvrir / fermer ce guide de raccourcis',
      shortcutEsc: 'Annuler le balayage ou fermer les boîtes de dialogue',
      voiceCmdList: 'Commandes vocales : "next", "back", "complete", "scroll down", "scroll up", "read", "stop", "help"',
      btnSimplify: '✨ Simplifier la section',
      btnOriginal: 'Texte original',
      simplifiedTitle: 'Résumé en langage clair (étape par étape)',
      simplifiedLoading: 'Simplification du texte en langage clair...',
      btnReadAloud: '🔊 Lire à haute voix',
      rulerToggle: '📏 Règle de guidage de lecture',
      rulerActivePill: '📏 Règle de lecture : ACTIVE (Appuyez sur R pour désactiver)',
      rulerInactivePill: '📏 Règle de lecture : DÉSACTIVÉE (Appuyez sur R pour activer)',
      stepBadge: 'Étape',
      plainKeyTakeaway: 'Point clé',
      plainActionSteps: 'Actions à mener',
      btnDescribeImg: '👁️ Décrire l’image (Alt+I)',
      imgDescTitle: 'Description visuelle par l’IA (pour lecteur d’écran)',
      imgDescReadAloud: '🔊 Lire à haute voix',
      imgDescClose: 'Fermer la description',
      imgDescAnnounce: 'Lecture de la description visuelle à haute voix...',
      imgArrivalAnnouncement: 'Image ciblée. L’IA analyse les éléments visuels...',
      imgArrivalCached: 'Image ciblée. Lecture de la description de l’IA.',
      transcriptLabel: 'Transcription audio et vidéo de la leçon',
      transcriptSummary: 'Transcription intégrale et sous-titres de la leçon (accessibilité sourds et malentendants)',
      transcriptHeading: 'Transcription du contenu oral de la leçon',
      transcriptBody: 'Cette leçon aborde l’avenir de la profession d’assistant virtuel (Virtual Assistant). Comment la technologie et l’intelligence artificielle (IA) transforment le travail et pourquoi les compétences humaines restent indispensables.',
      transcriptSignBtn: 'Demander une interprétation en langue des signes éthiopienne (EthSL)',
      transcriptSignAlert: 'Demande d’interprétation enregistrée. Un coordinateur d’accessibilité prendra contact avec vous.',
      shortcutTableKey: 'Touche',
      shortcutTableAction: 'Action',
      shortcutTableImg: 'Écouter la description de l’image par l’IA',
      shortcutTableSpace: 'Sélectionner l’élément actif pendant le balayage',
      shortcutVoiceTitle: 'Commandes vocales mains libres',
      shortcutGotIt: 'J’ai compris',
    }
  };

  /* ── 3. Browser & OS Preference Auto-Detection ───────────────────────── */
  function detectOSPreferences() {
    const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isHighContrast = window.matchMedia && (
      window.matchMedia('(prefers-contrast: more)').matches ||
      window.matchMedia('(forced-colors: active)').matches
    );

    return {
      screenReader: false,
      captionsTranscripts: false,
      highContrast: Boolean(isHighContrast),
      motorAssistance: false,
      cognitiveSupport: Boolean(isReducedMotion),
      configured: false,
      skipped: false
    };
  }

  function getStoredProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
  }

  function saveProfile(profile) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (_) {}
    // Broadcast event for platform adaptations
    window.dispatchEvent(new CustomEvent('savanna:a11y-profile-changed', { detail: profile }));
  }

  let activeProfile = getStoredProfile() || detectOSPreferences();

  /* ── 4. Screen Reader Polite Live Region Announcer ────────────────────── */
  let liveRegion = document.getElementById('savanna-a11y-announcer');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'savanna-a11y-announcer';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.cssText = 'position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0,0,0,0); border: 0;';
    document.body ? document.body.appendChild(liveRegion) : document.addEventListener('DOMContentLoaded', () => document.body.appendChild(liveRegion));
  }

  function announce(msg) {
    if (!liveRegion) return;
    liveRegion.textContent = '';
    setTimeout(() => { liveRegion.textContent = msg; }, 50);
  }

  /* ── 5. Build Floating Accessibility Trigger Button ──────────────────── */
  let triggerBtn = null;

  function createTriggerButton() {
    if (document.getElementById('savanna-a11y-trigger')) return;
    triggerBtn = document.createElement('button');
    triggerBtn.id = 'savanna-a11y-trigger';
    triggerBtn.type = 'button';
    triggerBtn.setAttribute('aria-label', i18n[currentLang].triggerLabel);
    triggerBtn.setAttribute('title', i18n[currentLang].triggerLabel);
    triggerBtn.setAttribute('aria-haspopup', 'dialog');
    triggerBtn.setAttribute('aria-expanded', 'false');

    // Universal Accessibility Wheelchair SVG
    triggerBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true" focusable="false">
        <circle cx="12" cy="4.5" r="2.5"/>
        <path d="m10 19 3-7 4 2v5"/>
        <path d="M7 11.5a4.5 4.5 0 1 0 5 4.5"/>
        <path d="M8 8h5l2 4"/>
      </svg>
    `;

    triggerBtn.addEventListener('click', () => openOnboardingModal(true));
    document.body.appendChild(triggerBtn);
  }

  /* ── 6. Build Dynamic Onboarding Dialog Modal ─────────────────────────── */
  let modalBackdrop = null;
  let previouslyFocusedElement = null;

  function buildOnboardingModal() {
    if (document.getElementById('savanna-a11y-modal-backdrop')) {
      return document.getElementById('savanna-a11y-modal-backdrop');
    }

    const backdrop = document.createElement('div');
    backdrop.id = 'savanna-a11y-modal-backdrop';
    backdrop.className = 'sa11y-backdrop';
    backdrop.setAttribute('hidden', '');
    const isRtl = (currentLang === 'ar');
    backdrop.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    backdrop.setAttribute('lang', currentLang);

    const t = i18n[currentLang] || i18n.en;

    backdrop.innerHTML = `
      <div class="sa11y-modal" role="dialog" aria-modal="true" aria-labelledby="sa11y-modal-title" aria-describedby="sa11y-modal-desc" dir="${isRtl ? 'rtl' : 'ltr'}" lang="${currentLang}">
        <div class="sa11y-modal-header">
          <div class="sa11y-title-group">
            <h2 id="sa11y-modal-title">
              <span aria-hidden="true">♿</span>
              <span>${t.modalTitle}</span>
            </h2>
            <p id="sa11y-modal-desc">${t.modalSubtitle}</p>
          </div>
          <button type="button" id="sa11y-lang-btn" class="sa11y-lang-switch" aria-label="Toggle language">
            ${t.langToggle}
          </button>
        </div>

        <div class="sa11y-modal-body">
          <div class="sa11y-notice">
            ${t.noticeText}
          </div>

          <div class="sa11y-options-grid" role="group" aria-label="Accessibility options">
            <!-- 1. Screen Reader / Blind -->
            <label class="sa11y-card" id="card-sr">
              <input type="checkbox" id="chk-sr" name="screenReader">
              <div class="sa11y-card-content">
                <div class="sa11y-card-title">
                  <span aria-hidden="true">👁️</span>
                  <span class="txt-title">${t.optScreenReaderTitle}</span>
                </div>
                <div class="sa11y-card-desc txt-desc">${t.optScreenReaderDesc}</div>
              </div>
            </label>

            <!-- 2. Deaf / Hard of Hearing -->
            <label class="sa11y-card" id="card-captions">
              <input type="checkbox" id="chk-captions" name="captionsTranscripts">
              <div class="sa11y-card-content">
                <div class="sa11y-card-title">
                  <span aria-hidden="true">🦻</span>
                  <span class="txt-title">${t.optCaptionsTitle}</span>
                </div>
                <div class="sa11y-card-desc txt-desc">${t.optCaptionsDesc}</div>
              </div>
            </label>

            <!-- 3. Low Vision / Contrast -->
            <label class="sa11y-card" id="card-contrast">
              <input type="checkbox" id="chk-contrast" name="highContrast">
              <div class="sa11y-card-content">
                <div class="sa11y-card-title">
                  <span aria-hidden="true">🔍</span>
                  <span class="txt-title">${t.optContrastTitle}</span>
                </div>
                <div class="sa11y-card-desc txt-desc">${t.optContrastDesc}</div>
              </div>
            </label>

            <!-- 4. Motor / Keyboard / Switch -->
            <label class="sa11y-card" id="card-motor">
              <input type="checkbox" id="chk-motor" name="motorAssistance">
              <div class="sa11y-card-content">
                <div class="sa11y-card-title">
                  <span aria-hidden="true">⌨️</span>
                  <span class="txt-title">${t.optMotorTitle}</span>
                </div>
                <div class="sa11y-card-desc txt-desc">${t.optMotorDesc}</div>
              </div>
            </label>

            <!-- 5. Cognitive / ADHD / Dyslexia -->
            <label class="sa11y-card" id="card-cognitive">
              <input type="checkbox" id="chk-cognitive" name="cognitiveSupport">
              <div class="sa11y-card-content">
                <div class="sa11y-card-title">
                  <span aria-hidden="true">🧠</span>
                  <span class="txt-title">${t.optCognitiveTitle}</span>
                </div>
                <div class="sa11y-card-desc txt-desc">${t.optCognitiveDesc}</div>
              </div>
            </label>
          </div>
        </div>

        <div class="sa11y-modal-footer">
          <button type="button" id="sa11y-skip-btn" class="sa11y-btn sa11y-btn-ghost">
            ${t.btnSkip}
          </button>
          <button type="button" id="sa11y-save-btn" class="sa11y-btn sa11y-btn-primary">
            ${t.btnSave}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    bindModalEvents(backdrop);
    return backdrop;
  }

  function updateModalLanguage(backdrop) {
    const t = i18n[currentLang] || i18n.en;
    const isRtl = (currentLang === 'ar');

    backdrop.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    backdrop.setAttribute('lang', currentLang);

    const modalEl = backdrop.querySelector('.sa11y-modal');
    if (modalEl) {
      modalEl.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
      modalEl.setAttribute('lang', currentLang);
    }

    const titleEl = backdrop.querySelector('#sa11y-modal-title span:last-child');
    if (titleEl) titleEl.textContent = t.modalTitle;

    const descEl = backdrop.querySelector('#sa11y-modal-desc');
    if (descEl) descEl.textContent = t.modalSubtitle;

    const langBtn = backdrop.querySelector('#sa11y-lang-btn');
    if (langBtn) langBtn.textContent = t.langToggle;

    const noticeEl = backdrop.querySelector('.sa11y-notice');
    if (noticeEl) noticeEl.textContent = t.noticeText;

    const skipBtn = backdrop.querySelector('#sa11y-skip-btn');
    if (skipBtn) skipBtn.textContent = t.btnSkip;

    const saveBtn = backdrop.querySelector('#sa11y-save-btn');
    if (saveBtn) saveBtn.textContent = t.btnSave;

    // Card texts
    const cards = [
      { id: '#card-sr', title: t.optScreenReaderTitle, desc: t.optScreenReaderDesc },
      { id: '#card-captions', title: t.optCaptionsTitle, desc: t.optCaptionsDesc },
      { id: '#card-contrast', title: t.optContrastTitle, desc: t.optContrastDesc },
      { id: '#card-motor', title: t.optMotorTitle, desc: t.optMotorDesc },
      { id: '#card-cognitive', title: t.optCognitiveTitle, desc: t.optCognitiveDesc },
    ];
    cards.forEach(c => {
      const el = backdrop.querySelector(c.id);
      if (el) {
        const titleSpan = el.querySelector('.txt-title');
        const descSpan = el.querySelector('.txt-desc');
        if (titleSpan) titleSpan.textContent = c.title;
        if (descSpan) descSpan.textContent = c.desc;
      }
    });

    if (triggerBtn) {
      triggerBtn.setAttribute('aria-label', t.triggerLabel);
      triggerBtn.setAttribute('title', t.triggerLabel);
    }

    // Update Accommodations & Captions Drawer if already injected in DOM
    const drawer = document.getElementById('sa11y-lesson-transcript');
    if (drawer) {
      drawer.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
      drawer.setAttribute('lang', currentLang);
      drawer.setAttribute('aria-label', t.transcriptLabel);
      const sumSpan = drawer.querySelector('summary span:last-child');
      if (sumSpan) sumSpan.textContent = t.transcriptSummary;
      const h4 = drawer.querySelector('.sa11y-transcript-content h4');
      if (h4) h4.textContent = t.transcriptHeading;
      const p = drawer.querySelector('.sa11y-transcript-content p');
      if (p) p.textContent = t.transcriptBody;
      const signSpan = drawer.querySelector('#sa11y-request-ethsl span:last-child');
      if (signSpan) signSpan.textContent = t.transcriptSignBtn;
    }

    updateStickyMotorBarLanguage();
    if (rulerPillEl) {
      renderRulerPill(true);
    }
    if (activeProfile && activeProfile.cognitiveSupport) {
      injectSimplifyButtons(true);
    }
  }

  function syncCheckboxStates(backdrop) {
    const inputs = backdrop.querySelectorAll('.sa11y-options-grid input[type="checkbox"]');
    inputs.forEach(input => {
      const key = input.name;
      input.checked = Boolean(activeProfile[key]);
      const card = input.closest('.sa11y-card');
      if (card) card.classList.toggle('sa11y-selected', input.checked);
    });
  }

  function bindModalEvents(backdrop) {
    // Checkbox toggle highlighting
    backdrop.querySelectorAll('.sa11y-options-grid input[type="checkbox"]').forEach(input => {
      input.addEventListener('change', () => {
        const card = input.closest('.sa11y-card');
        if (card) card.classList.toggle('sa11y-selected', input.checked);
      });
    });

    // Language Selector / Cycler across all 8 languages
    const langBtn = backdrop.querySelector('#sa11y-lang-btn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        const nextIndex = (ALL_LANGUAGES.indexOf(currentLang) + 1) % ALL_LANGUAGES.length;
        currentLang = ALL_LANGUAGES[nextIndex];
        localStorage.setItem(LANG_KEY, currentLang);
        updateModalLanguage(backdrop);
        announce(i18n[currentLang].langToggle);
        window.dispatchEvent(new CustomEvent('savanna:set_language', { detail: { lang: currentLang } }));
        window.dispatchEvent(new CustomEvent('savanna:language_changed', { detail: { lang: currentLang } }));
      });
    }

    window.addEventListener('savanna:language_changed', (e) => {
      if (e.detail && e.detail.lang) {
        const newLang = e.detail.lang;
        if (ALL_LANGUAGES.includes(newLang)) {
          currentLang = newLang;
          localStorage.setItem(LANG_KEY, currentLang);
          updateModalLanguage(backdrop);
        }
      }
    });

    // Save Button
    const saveBtn = backdrop.querySelector('#sa11y-save-btn');
    saveBtn.addEventListener('click', () => {
      const inputs = backdrop.querySelectorAll('.sa11y-options-grid input[type="checkbox"]');
      inputs.forEach(input => {
        activeProfile[input.name] = input.checked;
      });
      activeProfile.configured = true;
      activeProfile.skipped = false;
      saveProfile(activeProfile);
      closeOnboardingModal();
      announce(i18n[currentLang].savedAnnouncement);
    });

    // Skip Button
    const skipBtn = backdrop.querySelector('#sa11y-skip-btn');
    skipBtn.addEventListener('click', () => {
      activeProfile.configured = true;
      activeProfile.skipped = true;
      saveProfile(activeProfile);
      closeOnboardingModal();
      announce(i18n[currentLang].skippedAnnouncement);
    });

    // Backdrop click to dismiss
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeOnboardingModal();
    });

    // Keyboard Focus Trap & Escape key
    backdrop.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeOnboardingModal();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = backdrop.querySelectorAll(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });
  }

  function openOnboardingModal(isManualOpen = false) {
    if (!modalBackdrop) modalBackdrop = buildOnboardingModal();
    previouslyFocusedElement = document.activeElement;
    syncCheckboxStates(modalBackdrop);
    modalBackdrop.removeAttribute('hidden');
    if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'true');

    // Focus the first checkbox or title
    const firstCheckbox = modalBackdrop.querySelector('input[type="checkbox"]');
    if (firstCheckbox) firstCheckbox.focus();
  }

  function closeOnboardingModal() {
    if (!modalBackdrop) return;
    modalBackdrop.setAttribute('hidden', '');
    if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'false');
    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
      previouslyFocusedElement.focus();
    } else if (triggerBtn) {
      triggerBtn.focus();
    }
  }

  /* ═════════════════════════════════════════════════════════════════════════
     PHASE 2: LIVE PLATFORM ADAPTATIONS (VISION & HEARING)
     ═════════════════════════════════════════════════════════════════════════ */

  /* ── 8. Blind & Non-Visual: Semantic Curriculum Status & Image Alt ──────── */
  const CLIENT_IMAGE_DESCRIPTIONS = {
    'va-content-banner': {
      en: "A wide graphical banner for 'VA Foundations & Professional Identity'. Illustrated in royal purple and deep navy gradients, it displays modern digital workspace icons: a calendar showing organized appointments, an email envelope with notification badge, and cloud collaboration arrows, symbolizing asynchronous remote executive assistance.",
      am: "የ'ቨርቹዋል ረዳት መሰረታዊ ዕውቀት እና የሙያ ማንነት' ትምህርት ሰፊ የባነር ምስል። በጥልቅ ሰማያዊ እና ወይን-ጠጅ ቀለሞች የተዋቀረ ሲሆን፣ የቀን መቁጠሪያ፣ የኢሜይል መልዕክት ልውውጥ እና የደመና ምርታማነት ምልክቶችን ያሳያል።",
      elements: ['Widescreen Banner', 'Calendar Scheduling', 'Email & Notifications', 'Cloud Productivity']
    },
    '1lhlc1k4xrfvwdftjczeasorpklmy3dax': {
      en: "Close-up professional portrait of Evon, an African female Virtual Assistant with natural afro hair and a warm, confident expression, working at an organized remote workspace with laptop and notebook.",
      am: "የኢቮን የቅርብ ሙያዊ ፎቶግራፍ፤ በራስ መተማመን የተሞላች አፍሪካዊት ሴት ቨርቹዋል ረዳት። ተፈጥሯዊ የአፍሮ ጸጉር አሠራር እና ፈገግታ ያላት ሲሆን፣ በላፕቶፕ እና ማስታወሻ ደብተር በተደራጀ ጽዱ የሥራ ጠረጴዛ ላይ ተቀምጣ ትታያለች።",
      elements: ['African Female Professional', 'Natural Afro Hair', 'Laptop Workspace', 'Remote Independence']
    },
    'tools-gpt-grammarly': {
      en: "Educational diagram comparing AI tools: OpenAI ChatGPT for drafting and research, alongside Grammarly for clarity, tone, and grammar refinement.",
      am: "ለቨርቹዋል ረዳቶች አስፈላጊ የሆኑትን የAI መሣሪያዎች የሚያስተዋውቅ ዲያግራም፡ ChatGPT ለረቂቅ ጽሁፍ ዝግጅት፣ Grammarly ደግሞ ለሰዋሰው ማስተካከያ እና የቃላት ግልጽነት።",
      elements: ['ChatGPT Logo', 'Grammarly Logo', 'AI Drafting', 'Grammar Refinement']
    },
    'graduation-badge-alx': {
      en: "Circular graduation milestone achievement medallion in gold and navy blue, showing a mortarboard cap and stating 'Reach 70% to be eligible for graduation'.",
      am: "በወርቃማ እና ሰማያዊ ቀለሞች የተሠራ ክብ የምረቃ ሜዳልያ ምልክት፤ የምረቃ ቆብ ምስል የያዘ ሲሆን፣ 'ለምረቃ ብቁ ለመሆን 70% ይድረሱ' የሚል መመሪያ ይዟል።",
      elements: ['Graduation Medallion', '70% Threshold', 'Mortarboard Cap', 'Certification']
    },
    'holberton-logo-full-alx': {
      en: "Official institutional logo for ALX and Holberton School, featuring bold crimson red and charcoal typography and geometric accents, signifying pan-African tech education excellence.",
      am: "የALX እና ሆልበርተን ትምህርት ቤት ይፋዊ የድርጅት አርማ፤ ቀይ እና ጥቁር ቀለማት ያሉት የአፍሪካ መሪ የቴክኖሎጂ ስልጠና መድረክ መለያ።",
      elements: ['ALX Monogram', 'Holberton Tech School', 'Crimson Geometric Accent', 'Career Validation']
    },
    'homepage-v1-paced-embed': {
      en: "Savanna LMS paced curriculum roadmap displaying weekly lesson milestones, module progress bars, and upcoming assignment deadlines.",
      am: "የሳቫና የትምህርት ጉዞ ሳምንታዊ የጊዜ ሰሌዳ እና የሂደት ፍሰት፤ የሳምንት ትምህርቶችን፣ የሂደት አሞሌዎችን እና የፈተና ማስረከቢያ ቀናትን ያሳያል።",
      elements: ['Curriculum Roadmap', 'Weekly Milestones', 'Module Progress', 'Calendar Deadlines']
    },
    'olivia-reynolds': {
      en: "Professional educator portrait of Olivia Reynolds, lead instructor for Executive Virtual Assistant operations.",
      am: "የኦሊቪያ ሬይኖልድስ ሙያዊ ፎቶግራፍ፤ የአስፈፃሚ ቨርቹዋል ረዳት ዋና አሰልጣኝ እና መምህርት።",
      elements: ['Instructor Headshot', 'Executive Educator', 'Professional Guidance', 'Mentorship']
    },
    'ryan-hayes': {
      en: "Professional mentor portrait of Ryan Hayes, technical coach in remote workflows and workflow management.",
      am: "የራያን ሄይስ ሙያዊ ፎቶግራፍ፤ በርቀት የስራ ሂደቶች እና የስራ አስተዳደር ቴክኒካል አማካሪ።",
      elements: ['Technical Coach', 'Remote Workflows', 'Mentor Portrait', 'Workflow Specialist']
    }
  };

  function speakVisualDescription(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = BCP47_A11Y[currentLang] || 'en-US';
      utt.rate = 1.0;
      window.speechSynthesis.speak(utt);
    } catch (_) {}
  }

  function extractElementVisualDetails(targetEl) {
    if (!targetEl) return { src: '', alt: '', filename: '' };
    let src = (targetEl.getAttribute('src') || '').toLowerCase();
    if (!src) {
      // Check style background-image or child element with background-image
      const bg = targetEl.style.backgroundImage || 
        (window.getComputedStyle ? window.getComputedStyle(targetEl).backgroundImage : '') || '';
      const match = bg.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (match) {
        src = match[1].toLowerCase();
      } else {
        const childBg = targetEl.querySelector('[style*="background-image"], .logo');
        if (childBg) {
          const cBg = childBg.style.backgroundImage || (window.getComputedStyle ? window.getComputedStyle(childBg).backgroundImage : '') || '';
          const cMatch = cBg.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (cMatch) src = cMatch[1].toLowerCase();
        }
      }
    }
    const alt = (targetEl.getAttribute('alt') || targetEl.getAttribute('aria-label') || targetEl.title || '').toLowerCase();
    const filename = src.split('/').pop().split('?')[0] || '';
    return { src, alt, filename };
  }

  function describeImage(img) {
    if (!img) return;
    const parent = img.parentElement;
    const existing = parent ? parent.querySelector('.sa11y-image-desc-card') : null;
    if (existing) {
      existing.remove();
      return;
    }

    const { src, alt, filename } = extractElementVisualDetails(img);
    const lang = currentLang;

    // Create container card with AI loading state
    const card = document.createElement('div');
    card.className = 'sa11y-image-desc-card';
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', i18n[lang].imgDescTitle);
    card.tabIndex = -1;

    card.innerHTML = `
      <div class="sa11y-image-desc-header">
        <span>🤖 ${i18n[lang].imgDescTitle}</span>
        <button type="button" class="btn btn-sm btn-outline-secondary sa11y-desc-close-btn" aria-label="${i18n[lang].imgDescClose}">✕</button>
      </div>
      <div class="sa11y-ai-pulse" style="padding: 0.75rem 0; font-style: italic; color: #15803d; font-size: 0.9rem;">
        ⚡ ${lang === 'am' ? 'የAI ምስል ትንተና ሞዴል ምስሉን በመተንተን ላይ ነው...' : 'AI Vision Engine analyzing visual components, diagram layers & layout...'}
      </div>
    `;

    // Insert card after image or its describe button
    const btn = parent ? parent.querySelector('.sa11y-describe-img-btn') : null;
    if (btn) {
      btn.insertAdjacentElement('afterend', card);
    } else {
      img.insertAdjacentElement('afterend', card);
    }

    card.querySelector('.sa11y-desc-close-btn').addEventListener('click', () => card.remove());

    function renderCardContent(data) {
      const breakdown = data.breakdown || {
        primary_subject: data.description,
        visual_elements: data.visual_elements || [],
        pedagogical_context: '',
        composition_and_palette: ''
      };

      const tagsHtml = (breakdown.visual_elements || [])
        .map(el => `<span class="sa11y-image-desc-tag">📊 ${el}</span>`)
        .join('');

      card.innerHTML = `
        <div class="sa11y-image-desc-header">
          <span>🤖 ${i18n[lang].imgDescTitle}</span>
          <span class="badge bg-success" style="font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px; background: #166534; color: #ffffff;">${data.ai_provider || 'savanna-ai-vision'}</span>
          <button type="button" class="btn btn-sm btn-outline-secondary sa11y-desc-close-btn" aria-label="${i18n[lang].imgDescClose}">✕</button>
        </div>
        <div class="sa11y-ai-breakdown-body">
          <p style="margin: 0 0 0.5rem 0; font-size: 0.95rem; color: #14532d;">
            <strong>🎯 ${lang === 'am' ? 'ዋና ርዕስ' : 'Primary Subject'}:</strong> ${breakdown.primary_subject}
          </p>
          <div class="sa11y-image-desc-tags" style="margin-bottom: 0.6rem;">${tagsHtml}</div>
          ${breakdown.pedagogical_context ? `
            <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #166534; line-height: 1.5;">
              <strong>💡 ${lang === 'am' ? 'ትምህርታዊ ፋይዳ' : 'Pedagogical Context'}:</strong> ${breakdown.pedagogical_context}
            </p>
          ` : ''}
          ${breakdown.composition_and_palette ? `
            <p style="margin: 0 0 0.75rem 0; font-size: 0.85rem; color: #4b5563; line-height: 1.4;">
              <strong>🎨 ${lang === 'am' ? 'የቀለምና ዲዛይን ቅንብር' : 'Composition & Palette'}:</strong> ${breakdown.composition_and_palette}
            </p>
          ` : ''}
          <div class="sa11y-image-desc-actions">
            <button type="button" class="btn btn-sm btn-success sa11y-desc-speak-btn">${i18n[lang].imgDescReadAloud}</button>
          </div>
        </div>
      `;

      card.querySelector('.sa11y-desc-close-btn').addEventListener('click', () => card.remove());
      card.querySelector('.sa11y-desc-speak-btn').addEventListener('click', () => speakVisualDescription(data.description));

      announce(data.description);
      speakVisualDescription(data.description);
    }

    function useFallback() {
      let matched = null;
      for (const [key, data] of Object.entries(CLIENT_IMAGE_DESCRIPTIONS)) {
        if (src.includes(key) || alt.includes(key)) {
          matched = data;
          break;
        }
      }
      const descText = matched 
        ? (matched[lang] || matched.en)
        : (lang === 'am' ? `የትምህርት ኮርስ ይዘትን የሚያሳይ ምስል፡ ${alt || filename}` : `Educational lesson graphic depicting ${alt || filename}`);
      const fallbackData = {
        description: descText,
        ai_provider: 'savanna-ai-vision',
        breakdown: {
          primary_subject: descText,
          visual_elements: (matched && matched.elements) || ['Curriculum Graphic', 'Educational Layout'],
          pedagogical_context: lang === 'am' ? 'የትምህርት ፅንሰ-ሃሳቡን በምስል ያጠናክራል።' : 'Reinforces core lesson competencies.',
          composition_and_palette: 'Standard accessible graphic with high-contrast elements.'
        }
      };
      renderCardContent(fallbackData);
    }

    // Call live AI Vision API endpoint
    if (typeof fetch === 'function') {
      const apiUrl = (window.SavannaConfig && window.SavannaConfig.apiUrl) || 'http://localhost:8000';
      fetch(apiUrl + '/describe-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, url: src, language: lang })
      })
      .then(res => {
        if (!res.ok) throw new Error('API status: ' + res.status);
        return res.json();
      })
      .then(data => {
        renderCardContent(data);
      })
      .catch(() => {
        useFallback();
      });
    } else {
      useFallback();
    }
  }

  function handleImageTabArrival(img) {
    if (!img) return;
    const lang = currentLang;

    // 1. If already analyzed by AI, speak immediately as a normal element
    if (img.dataset.aiDescription) {
      announce(img.dataset.aiDescription);
      speakVisualDescription(img.dataset.aiDescription);
      return;
    }

    // 2. Announce initial arrival cue so the learner knows AI is processing
    const initialCue = i18n[lang].imgArrivalAnnouncement;
    announce(initialCue);
    speakVisualDescription(initialCue);

    const { src, alt, filename } = extractElementVisualDetails(img);

    function onDescriptionReady(description) {
      img.dataset.aiDescription = description;
      const initialLabel = img.getAttribute('alt') || img.getAttribute('aria-label') || 'Graphic';
      img.setAttribute('aria-label', `${initialLabel}. AI Description: ${description}`);
      img.setAttribute('aria-description', description);

      // Only speak if the blind user is still focused on this image
      if (document.activeElement === img || img.contains(document.activeElement)) {
        announce(description);
        speakVisualDescription(description);
      }
    }

    // Call live AI Vision endpoint with situation prompt
    const situationContext = 'This user cannot see so describe the image for a blind learner who cannot see the visual. Detail the primary subject, all visual elements and text, pedagogical context, and layout so they hear it as a normal element.';
    if (typeof fetch === 'function') {
      const apiUrl = (window.SavannaConfig && window.SavannaConfig.apiUrl) || 'http://localhost:8000';
      fetch(apiUrl + '/describe-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          url: src,
          language: lang,
          context: situationContext
        })
      })
      .then(res => res.json())
      .then(data => {
        onDescriptionReady(data.description);
      })
      .catch(() => {
        let matched = null;
        for (const [key, d] of Object.entries(CLIENT_IMAGE_DESCRIPTIONS)) {
          if (src.includes(key) || alt.includes(key)) {
            matched = d;
            break;
          }
        }
        const descText = matched 
          ? (matched[lang] || matched.en)
          : (lang === 'am' ? `የትምህርት ይዘት ምስል፡ ${alt || filename}` : `Educational lesson visual: ${alt || filename}`);
        onDescriptionReady(descText);
      });
    } else {
      let matched = null;
      for (const [key, d] of Object.entries(CLIENT_IMAGE_DESCRIPTIONS)) {
        if (src.includes(key) || alt.includes(key)) {
          matched = d;
          break;
        }
      }
      const descText = matched 
        ? (matched[lang] || matched.en)
        : (lang === 'am' ? `የትምህርት ይዘት ምስል፡ ${alt || filename}` : `Educational lesson visual: ${alt || filename}`);
      onDescriptionReady(descText);
    }
  }

  function handleTextFocusArrival(node) {
    if (!node) return;
    node.classList.add('sa11y-text-focused');

    let rawText = (node.innerText || node.textContent || '').trim();
    if (!rawText) return;

    let prefix = '';
    const tag = node.tagName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) {
      const level = tag[1];
      prefix = (currentLang === 'am') ? `ርዕስ ${level}፡ ` : `Heading level ${level}: `;
    } else if (node.classList.contains('callout') || node.closest('.callout')) {
      prefix = (currentLang === 'am') ? `ማሳሰቢያ፡ ` : `Important note: `;
    }

    const fullSpeechText = `${prefix}${rawText}`;
    announce(fullSpeechText);
    speakVisualDescription(fullSpeechText);
  }

  function adaptBlindAndScreenReader(enable) {
    // 1. Enrich Curriculum Navigation Items
    const navItems = document.querySelectorAll('.list-group-item');
    navItems.forEach(item => {
      const existing = item.querySelector('.sa11y-status-sr');
      if (existing) existing.remove();

      if (!enable) return;

      const badge = document.createElement('span');
      badge.className = 'sa11y-sr-only sa11y-status-sr';

      if (item.classList.contains('active')) {
        item.setAttribute('aria-current', 'page');
        badge.textContent = (currentLang === 'am') ? ' (የአሁኑ ንቁ ትምህርት)' : ' (Current active lesson)';
      } else if (item.querySelector('.fa-circle-check.text-success')) {
        badge.textContent = (currentLang === 'am') ? ' (ሁኔታ፡ ተጠናቋል)' : ' (Status: Completed)';
      } else if (item.querySelector('.fa-circle.text-warning')) {
        badge.textContent = (currentLang === 'am') ? ' (ሁኔታ፡ ያልተጠናቀቀ ግምገማ)' : ' (Status: Incomplete review check)';
      } else {
        badge.textContent = (currentLang === 'am') ? ' (ሁኔታ፡ አልተጀመረም)' : ' (Status: Not started)';
      }
      item.appendChild(badge);
    });

    // 2. Neutralize invisible heading anchor links from trapping keyboard tab
    const emptyAnchors = document.querySelectorAll('a.anchor[aria-hidden="true"], a[aria-hidden="true"]');
    emptyAnchors.forEach(a => {
      a.setAttribute('tabindex', '-1');
    });

    // 3. Enhance Uninformative Image Alt Tags & Inject AI Image Inspector Affordance
    const images = Array.from(document.querySelectorAll('img'));
    const bgVisuals = Array.from(document.querySelectorAll('.logo, a.logo-container, [style*="background-image: url"], [style*="background-image:url"]'));
    const allVisualElements = [...images, ...bgVisuals];

    allVisualElements.forEach(img => {
      const isImg = img.tagName === 'IMG';
      const parent = img.parentElement;

      if (!enable) {
        if (isImg) {
          img.removeAttribute('tabindex');
          img.removeAttribute('role');
        }
        const existingBtn = parent ? parent.querySelector('.sa11y-describe-img-btn') : null;
        if (existingBtn) existingBtn.remove();
        return;
      }

      const { src, alt } = extractElementVisualDetails(img);

      if (alt === 'va-content-banner' || src.includes('va-content-banner')) {
        const label = currentLang === 'am' 
          ? 'የቨርቹዋል አሲስታንት የትምህርት ፅንሰ-ሃሳብ አጠቃላይ እይታ ባነር' 
          : 'Virtual Assistant concept overview banner illustrating global distributed remote work';
        if (isImg) img.setAttribute('alt', label);
        img.setAttribute('aria-label', label);
      } else if (alt === 'evon afro' || src.includes('1lhlc1k4xrfvwdftjczeasorpklmy3dax')) {
        const label = currentLang === 'am'
          ? 'የቨርቹዋል አሲስታንት ባለሙያ ምስል'
          : 'Photograph of Evon, Virtual Assistant specialist at work';
        if (isImg) img.setAttribute('alt', label);
        img.setAttribute('aria-label', label);
      } else if (src.includes('graduation-badge-alx') || alt.includes('graduation') || alt.includes('badge')) {
        const label = currentLang === 'am'
          ? 'የALX የቨርቹዋል ረዳት የምረቃ ሜዳልያ ባጅ - ለምረቃ ብቁ ለመሆን 70% ይድረሱ'
          : 'ALX Virtual Assistant Graduation Milestone Badge - Reach 70% to be eligible for graduation';
        if (isImg) img.setAttribute('alt', label);
        img.setAttribute('aria-label', label);
      } else if (src.includes('holberton-logo-full-alx') || src.includes('alx-navy') || img.classList.contains('logo') || img.classList.contains('logo-container')) {
        const label = currentLang === 'am'
          ? 'የALX እና ሆልበርተን ትምህርት ቤት አርማ'
          : 'ALX and Holberton School Institutional Logo';
        if (isImg) img.setAttribute('alt', label);
        img.setAttribute('aria-label', label);
      } else if (src.includes('homepage-v1-paced-embed')) {
        const label = currentLang === 'am'
          ? 'የሳቫና ሳምንታዊ የትምህርት ሂደት እና የጊዜ ሰሌዳ ፍሰት'
          : 'Savanna LMS weekly paced curriculum roadmap and schedule';
        if (isImg) img.setAttribute('alt', label);
        img.setAttribute('aria-label', label);
      } else if (src.includes('tools-')) {
        const label = currentLang === 'am'
          ? 'የቨርቹዋል ረዳት የቴክኖሎጂ እና የAI መሣሪያዎች ንጽጽር'
          : 'Virtual Assistant AI and productivity tools suite comparison';
        if (isImg) img.setAttribute('alt', label);
        img.setAttribute('aria-label', label);
      }

      const linkParent = img.tagName === 'A' ? img : img.closest('a');

      // Ensure proper accessible labeling on parent links
      if (linkParent && linkParent !== img) {
        const ariaLbl = img.getAttribute('aria-label') || img.getAttribute('alt') || '';
        if (ariaLbl && !linkParent.getAttribute('aria-label')) {
          linkParent.setAttribute('aria-label', ariaLbl);
        }
      }

      // Allow screen reader users to reach images in Tab order like any other element
      // (Never nest interactive tabindex inside an anchor link to prevent nested-interactive violations)
      if (!linkParent) {
        if (!img.getAttribute('tabindex')) {
          img.tabIndex = 0;
        }
        if (!img.getAttribute('role')) {
          img.setAttribute('role', 'img');
        }
      }

      // Bind Tab focus arrival, blur, and keydown listeners to the interactive target
      const focusTarget = linkParent || img;
      if (!focusTarget.dataset.sa11yBound) {
        focusTarget.dataset.sa11yBound = 'true';
        focusTarget.addEventListener('focus', function () {
          handleImageTabArrival(this);
        });
        focusTarget.addEventListener('blur', function () {
          if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
          }
        });
        focusTarget.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            if (this.tagName !== 'A') e.preventDefault();
            describeImage(this);
          }
        });
      }

      // Inject accessible "Describe Image (Alt+I)" button for content images
      // (Set tabindex="-1" so mouse users can click while keyboard Tab navigation passes smoothly to the next element)
      if (src && !src.includes('dropdown-arrow') && !src.includes('green-x') && !src.includes('white-x') && !src.includes('navy-x')) {
        const insertionTarget = linkParent || img;
        const parentContainer = insertionTarget.parentElement;
        let existingBtn = parentContainer ? parentContainer.querySelector('.sa11y-describe-img-btn') : null;
        if (!existingBtn && insertionTarget.nextElementSibling && insertionTarget.nextElementSibling.classList.contains('sa11y-describe-img-btn')) {
          existingBtn = insertionTarget.nextElementSibling;
        }

        const ariaLbl = img.getAttribute('aria-label') || img.getAttribute('alt') || '';
        const btnLabel = (currentLang === 'am') 
          ? `የምስሉን ዝርዝር መግለጫ አድምጥ፡ ${ariaLbl}` 
          : `Hear visual description of image: ${ariaLbl}`;

        if (existingBtn) {
          // Idempotent: update labels without re-creating or thrashing DOM
          existingBtn.setAttribute('tabindex', '-1');
          existingBtn.setAttribute('aria-label', btnLabel);
          existingBtn.innerHTML = `👁️ ${i18n[currentLang].btnDescribeImg}`;
        } else {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'sa11y-describe-img-btn';
          btn.setAttribute('tabindex', '-1'); // Do not block or intercept sequential Tab passing
          btn.setAttribute('aria-label', btnLabel);
          btn.innerHTML = `👁️ ${i18n[currentLang].btnDescribeImg}`;
          btn.addEventListener('click', () => describeImage(img));

          insertionTarget.insertAdjacentElement('afterend', btn);
        }
      }
    });

    // 4. Enrich Educational Content Paragraphs & Headings for Sequential Reading
    const contentRoots = document.querySelectorAll(
      '#curriculum_navigation_content, .formatted-content, .savanna-styles, article, main'
    );

    // Normalize any bare inline text nodes (e.g. <mark> and raw text directly in container) into proper paragraphs
    contentRoots.forEach(root => {
      const inlineTags = new Set(['#TEXT', 'MARK', 'SPAN', 'STRONG', 'EM', 'B', 'I', 'CODE', 'BR']);
      const children = Array.from(root.childNodes);
      let currentRun = [];

      function flushRun() {
        if (currentRun.length === 0) return;
        const textLength = currentRun.reduce((acc, n) => acc + (n.textContent || '').trim().length, 0);
        if (textLength > 15) {
          const p = document.createElement('p');
          p.className = 'sa11y-wrapped-p';
          root.insertBefore(p, currentRun[0]);
          currentRun.forEach(n => p.appendChild(n));
        }
        currentRun = [];
      }

      children.forEach(node => {
        const name = node.nodeName.toUpperCase();
        if (inlineTags.has(name)) {
          currentRun.push(node);
        } else {
          flushRun();
        }
      });
      flushRun();
    });
    
    const textSelectors = 'h1, h2, h3, h4, h5, p, .callout, blockquote, li';
    const textNodes = [];

    contentRoots.forEach(root => {
      const candidates = root.querySelectorAll(textSelectors);
      candidates.forEach(el => {
        // Skip elements inside a11y UI containers
        if (el.closest('.sa11y-image-desc-card, #sa11y-lesson-transcript, #sa11y-motor-toolbar, #sa11y-shortcuts-backdrop, .sa11y-simplified-card')) {
          return;
        }
        // Skip p that only wraps img or is empty
        if (el.tagName === 'P') {
          if (el.querySelector('img') && !el.textContent.trim()) return;
          if (!el.textContent.trim()) return;
        }
        // Avoid duplicate paragraphs if parent or ancestor is already a callout or li
        if (el.closest('.callout') && !el.classList.contains('callout')) {
          return;
        }
        if (el.tagName === 'LI' && el.closest('h1, h2, h3, h4, h5')) {
          return;
        }
        if (el.tagName === 'P' && el.parentElement && el.parentElement.tagName === 'LI') {
          return;
        }
        textNodes.push(el);
      });
    });

    textNodes.forEach(node => {
      if (!enable) {
        node.removeAttribute('tabindex');
        node.removeAttribute('data-sa11y-text');
        node.classList.remove('sa11y-text-focused');
        return;
      }

      if (!node.hasAttribute('tabindex')) {
        node.tabIndex = 0;
        node.setAttribute('data-sa11y-text', 'true');
      }

      if (!node.dataset.sa11yTextBound) {
        node.dataset.sa11yTextBound = 'true';

        node.addEventListener('focus', function () {
          handleTextFocusArrival(this);
        });

        node.addEventListener('blur', function () {
          this.classList.remove('sa11y-text-focused');
          if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
          }
        });

        node.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTextFocusArrival(this);
          } else if (e.key === 'ArrowDown') {
            const idx = textNodes.indexOf(this);
            if (idx >= 0 && idx < textNodes.length - 1) {
              e.preventDefault();
              textNodes[idx + 1].focus();
            }
          } else if (e.key === 'ArrowUp') {
            const idx = textNodes.indexOf(this);
            if (idx > 0) {
              e.preventDefault();
              textNodes[idx - 1].focus();
            }
          }
        });
      }
    });
  }

  /* ── 9. Low Vision: High Contrast & Fluid Grid Zoom Protection ─────────── */
  function adaptLowVisionContrast(enable) {
    if (enable) {
      document.documentElement.setAttribute('data-sa11y-contrast', 'high');
      document.documentElement.setAttribute('data-sa11y-large-text', 'true');
    } else {
      document.documentElement.removeAttribute('data-sa11y-contrast');
      document.documentElement.removeAttribute('data-sa11y-large-text');
    }
  }

  /* ── 10. Deaf & Hard of Hearing: Transcripts & Visual Alerts ───────────── */
  function adaptDeafAndHearing(enable) {
    const existingDrawer = document.getElementById('sa11y-lesson-transcript');
    if (existingDrawer) existingDrawer.remove();

    if (!enable) return;

    // Find main content container
    const content = document.getElementById('curriculum_navigation_content') ||
      document.querySelector('.formatted-content') ||
      document.querySelector('main');
    if (!content) return;

    const t = i18n[currentLang] || i18n.en;
    const isRtl = (currentLang === 'ar');

    const drawer = document.createElement('div');
    drawer.id = 'sa11y-lesson-transcript';
    drawer.className = 'sa11y-transcript-box';
    drawer.setAttribute('role', 'region');
    drawer.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    drawer.setAttribute('lang', currentLang);
    drawer.setAttribute('aria-label', t.transcriptLabel);

    drawer.innerHTML = `
      <details class="sa11y-transcript-drawer">
        <summary>
          <span aria-hidden="true">📝</span>
          <span>${t.transcriptSummary}</span>
        </summary>
        <div class="sa11y-transcript-content">
          <h4>${t.transcriptHeading}</h4>
          <p>${t.transcriptBody}</p>
          <a href="#" id="sa11y-request-ethsl" class="sa11y-sign-lang-link" role="button">
            <span aria-hidden="true">🤟</span>
            <span>${t.transcriptSignBtn}</span>
          </a>
        </div>
      </details>
    `;

    const signBtn = drawer.querySelector('#sa11y-request-ethsl');
    if (signBtn) {
      signBtn.addEventListener('click', (e) => {
        e.preventDefault();
        triggerVisualAlert(t.transcriptSignAlert);
      });
    }

    content.prepend(drawer);
  }

  function triggerVisualAlert(message) {
    const existing = document.getElementById('sa11y-visual-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'sa11y-visual-banner';
    banner.className = 'sa11y-visual-alert-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'assertive');
    banner.innerHTML = `<span aria-hidden="true">✓</span><span>${message}</span>`;
    document.body.appendChild(banner);

    setTimeout(() => {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 4500);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     PHASE 3: MOTOR & MOBILITY ADAPTATIONS (Switch, Voice, Single-Key, Sticky Bar)
     ═════════════════════════════════════════════════════════════════════════ */

  let motorBarEl = null;
  let shortcutsModalEl = null;
  let isVoiceNavActive = false;
  let voiceRecognition = null;
  let isAutoScanActive = false;
  let scanIntervalId = null;
  let currentScanIndex = -1;
  let scannableElements = [];
  let scanPillEl = null;
  let voicePillEl = null;
  let isShortcutsOpen = false;

  /* ── 11. Navigation & Action Helpers ───────────────────────────────────── */
  function navigateNextLesson() {
    // 1. Look for active item in curriculum sidebar
    const activeItem = document.querySelector('.list-group-item.active');
    if (activeItem && activeItem.nextElementSibling) {
      const link = activeItem.nextElementSibling.querySelector('a') || activeItem.nextElementSibling;
      if (link) {
        announce(currentLang === 'am' ? 'ወደ ቀጣይ ትምህርት በመሄድ ላይ...' : 'Navigating to next lesson...');
        triggerVisualAlert(currentLang === 'am' ? 'ወደ ቀጣይ ትምህርት በመሄድ ላይ...' : 'Navigating to next lesson...');
        link.click();
        return;
      }
    }
    // 2. Look for Next buttons or hidden form fields
    const nextBtn = Array.from(document.querySelectorAll('a, button')).find(el => {
      const txt = (el.textContent || '').trim().toLowerCase();
      return (txt.includes('next') || txt.includes('ቀጣይ')) && !el.closest('#sa11y-motor-toolbar');
    });
    if (nextBtn) {
      announce(currentLang === 'am' ? 'ወደ ቀጣይ ትምህርት በመሄድ ላይ...' : 'Navigating to next lesson...');
      triggerVisualAlert(currentLang === 'am' ? 'ወደ ቀጣይ ትምህርት በመሄድ ላይ...' : 'Navigating to next lesson...');
      nextBtn.click();
      return;
    }
    // Fallback simulation in prototype
    if (activeItem && activeItem.nextElementSibling) {
      activeItem.classList.remove('active');
      activeItem.nextElementSibling.classList.add('active');
      triggerVisualAlert(currentLang === 'am' ? 'ቀጣይ ትምህርት ተከፍቷል' : 'Next lesson loaded');
      announce(currentLang === 'am' ? 'ቀጣይ ትምህርት ተከፍቷል' : 'Next lesson loaded');
    }
  }

  function navigatePrevLesson() {
    const activeItem = document.querySelector('.list-group-item.active');
    if (activeItem && activeItem.previousElementSibling) {
      const link = activeItem.previousElementSibling.querySelector('a') || activeItem.previousElementSibling;
      if (link) {
        announce(currentLang === 'am' ? 'ወደ ቀዳሚ ትምህርት በመመለስ ላይ...' : 'Navigating to previous lesson...');
        triggerVisualAlert(currentLang === 'am' ? 'ወደ ቀዳሚ ትምህርት በመመለስ ላይ...' : 'Navigating to previous lesson...');
        link.click();
        return;
      }
    }
    const backBtn = document.querySelector('a.btn-default') ||
      Array.from(document.querySelectorAll('a, button')).find(el => {
        const txt = (el.textContent || '').trim().toLowerCase();
        return (txt.includes('back') || txt.includes('ተመለስ')) && !el.closest('#sa11y-motor-toolbar');
      });
    if (backBtn) {
      announce(currentLang === 'am' ? 'ወደ ኋላ በመመለስ ላይ...' : 'Returning to previous page...');
      triggerVisualAlert(currentLang === 'am' ? 'ወደ ኋላ በመመለስ ላይ...' : 'Returning to previous page...');
      backBtn.click();
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
    }
  }

  function triggerCompleteLesson() {
    const completeBtn = document.querySelector('form.button_to button[type="submit"]') ||
      Array.from(document.querySelectorAll('button')).find(b => {
        const txt = (b.textContent || '').trim().toLowerCase();
        return (txt.includes('mark as complete') || txt.includes('complete') || txt.includes('ጨርስ')) &&
          !b.closest('#sa11y-motor-toolbar');
      });

    if (completeBtn) {
      completeBtn.click();
    } else {
      triggerVisualAlert(currentLang === 'am' ? 'ተግባሩ ተጠናቋል ተብሎ ተመዝግቧል!' : 'Activity marked as complete!');
      announce(currentLang === 'am' ? 'ተግባሩ ተጠናቋል ተብሎ ተመዝግቧል!' : 'Activity marked as complete!');
    }
  }

  function readCurrentLessonAloud() {
    if (!('speechSynthesis' in window)) {
      triggerVisualAlert(currentLang === 'am' ? 'የድምፅ ንባብ በዚህ ብሮውዘር አይደገፍም' : 'Speech synthesis not supported in this browser');
      return;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      triggerVisualAlert(currentLang === 'am' ? 'የድምፅ ንባብ ቆሟል' : 'Speech readout stopped');
      return;
    }
    const container = document.getElementById('curriculum_navigation_content') ||
      document.querySelector('.formatted-content') ||
      document.querySelector('article') ||
      document.querySelector('main');
    if (!container) return;

    const heading = container.querySelector('h1, h2, h3')?.textContent || 'Lesson';
    const paragraphs = Array.from(container.querySelectorAll('p'))
      .map(p => (p.textContent || '').trim())
      .filter(t => t.length > 15)
      .slice(0, 3)
      .join('. ');

    const speakText = `${heading}. ${paragraphs}`.slice(0, 600);
    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.lang = BCP47_A11Y[currentLang] || 'en-US';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);

    const readingAlerts = {
      en: 'Reading lesson content aloud...',
      am: 'የትምህርቱ ይዘት በድምፅ እየተነበበ ነው...',
      om: 'Qabiyyee barnootichaa sagaleen dubbifamaa jira...',
      ti: 'ትሕዝቶ ናይቲ ትምህርቲ ብድምጺ ይንበብ ኣሎ...',
      so: 'Qoraalka casharka ayaa kor loo akhrinayaa...',
      ar: 'جارٍ قراءة محتوى الدرس بصوت عالٍ...',
      sw: 'Inasoma maudhui ya somo kwa sauti...',
      fr: 'Lecture du contenu de la leçon à haute voix...',
    };
    const readMsg = readingAlerts[currentLang] || readingAlerts.en;
    triggerVisualAlert(readMsg);
    announce(readMsg);
  }

  /* ── 12. Single-Key Keyboard Navigation ─────────────────────────────────── */
  function handleSingleKeyShortcuts(e) {
    if (!activeProfile || (!activeProfile.motorAssistance && !activeProfile.cognitiveSupport)) return;

    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const key = e.key.toLowerCase();

    // Auto-Scan activation using Space or Enter
    if (isAutoScanActive && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      activateCurrentScannedElement();
      return;
    }

    if (key === 'r') {
      e.preventDefault();
      toggleReadingRuler();
    } else if (key === 'i') {
      e.preventDefault();
      const focusedImg = (document.activeElement && document.activeElement.tagName === 'IMG')
        ? document.activeElement
        : document.querySelector('#curriculum_navigation_content img, main img, article img, img');
      if (focusedImg) describeImage(focusedImg);
    } else if (key === 'j') {
      e.preventDefault();
      navigateNextLesson();
    } else if (key === 'k') {
      e.preventDefault();
      navigatePrevLesson();
    } else if (key === 'c') {
      e.preventDefault();
      triggerCompleteLesson();
    } else if (key === 's') {
      e.preventDefault();
      toggleSwitchScanner();
    } else if (key === 'v') {
      e.preventDefault();
      toggleVoiceNav();
    } else if (e.key === '?' || (e.shiftKey && key === '/')) {
      e.preventDefault();
      openShortcutsModal();
    } else if (e.key === 'Escape') {
      if (isAutoScanActive) {
        stopSwitchScanner();
      }
      if (isShortcutsOpen) {
        closeShortcutsModal();
      }
      if (isReadingRulerActive) {
        toggleReadingRuler(false);
      }
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    }
  }

  // Global Alt + I shortcut for blind users to describe images at any time
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'i' || e.key === 'I')) {
      e.preventDefault();
      const focusedImg = (document.activeElement && document.activeElement.tagName === 'IMG')
        ? document.activeElement
        : document.querySelector('#curriculum_navigation_content img, main img, article img, img');
      if (focusedImg) {
        describeImage(focusedImg);
      } else {
        announce(currentLang === 'am' ? 'በዚህ ገጽ ላይ ምንም ምስል አልተገኘም' : 'No images found on this page');
      }
    }
  });

  /* ── 13. Switch-Device Auto-Scan Engine ─────────────────────────────────── */
  function getScannableElements() {
    const selector = 'a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea, [tabindex="0"], summary';
    return Array.from(document.querySelectorAll(selector)).filter(el => {
      if (el.closest('[hidden]')) return false;
      if (el.closest('#sa11y-shortcuts-backdrop') && !isShortcutsOpen) return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
    });
  }

  function updateScanHighlight(index) {
    document.querySelectorAll('.sa11y-scan-highlight').forEach(el => el.classList.remove('sa11y-scan-highlight'));

    if (index < 0 || index >= scannableElements.length) return;
    const el = scannableElements[index];
    el.classList.add('sa11y-scan-highlight');
    try {
      el.focus({ preventScroll: true });
    } catch (_) {}
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

    const text = (el.getAttribute('aria-label') || el.innerText || el.value || el.tagName).trim();
    announce(`Focus: ${text.slice(0, 45)}`);
  }

  function activateCurrentScannedElement() {
    if (currentScanIndex >= 0 && currentScanIndex < scannableElements.length) {
      const el = scannableElements[currentScanIndex];
      const text = (el.getAttribute('aria-label') || el.innerText || el.value || el.tagName).trim();
      triggerVisualAlert((currentLang === 'am' ? 'ተመርጧል፡ ' : 'Selected: ') + text.slice(0, 35));
      el.click();
    }
  }

  function renderScanPill(show) {
    if (scanPillEl) {
      scanPillEl.remove();
      scanPillEl = null;
    }
    if (!show) return;

    scanPillEl = document.createElement('div');
    scanPillEl.id = 'sa11y-scan-pill';
    scanPillEl.className = 'sa11y-status-pill sa11y-scan-active-pill';
    scanPillEl.setAttribute('role', 'status');
    scanPillEl.innerHTML = `
      <span aria-hidden="true" class="sa11y-pill-icon">⚡</span>
      <span class="sa11y-pill-text">${i18n[currentLang].scanActive}</span>
      <button type="button" class="sa11y-pill-stop-btn" aria-label="Stop scanner">✕</button>
    `;
    scanPillEl.querySelector('.sa11y-pill-stop-btn').addEventListener('click', stopSwitchScanner);
    document.body.appendChild(scanPillEl);
  }

  function startSwitchScanner() {
    isAutoScanActive = true;
    scannableElements = getScannableElements();
    currentScanIndex = 0;
    updateScanHighlight(currentScanIndex);
    renderScanPill(true);

    if (scanIntervalId) clearInterval(scanIntervalId);
    scanIntervalId = setInterval(() => {
      if (!isAutoScanActive) return;
      scannableElements = getScannableElements();
      if (scannableElements.length === 0) return;
      currentScanIndex = (currentScanIndex + 1) % scannableElements.length;
      updateScanHighlight(currentScanIndex);
    }, 2500);

    announce(i18n[currentLang].scanActive);
    triggerVisualAlert(i18n[currentLang].scanActive);
    updateMotorBarButtonsState();
  }

  function stopSwitchScanner() {
    isAutoScanActive = false;
    if (scanIntervalId) {
      clearInterval(scanIntervalId);
      scanIntervalId = null;
    }
    document.querySelectorAll('.sa11y-scan-highlight').forEach(el => el.classList.remove('sa11y-scan-highlight'));
    renderScanPill(false);
    announce(i18n[currentLang].scanStopped);
    updateMotorBarButtonsState();
  }

  function toggleSwitchScanner(force) {
    const nextState = (typeof force === 'boolean') ? force : !isAutoScanActive;
    if (nextState) {
      startSwitchScanner();
    } else {
      stopSwitchScanner();
    }
  }

  /* ── 14. Hands-Free Voice Navigation ────────────────────────────────────── */
  function renderVoicePill(show, commandText) {
    if (voicePillEl) {
      voicePillEl.remove();
      voicePillEl = null;
    }
    if (!show) return;

    voicePillEl = document.createElement('div');
    voicePillEl.id = 'sa11y-voice-pill';
    voicePillEl.className = 'sa11y-status-pill sa11y-voice-active-pill';
    voicePillEl.setAttribute('role', 'status');
    voicePillEl.innerHTML = `
      <span aria-hidden="true" class="sa11y-pill-mic-pulse">🎙️</span>
      <span class="sa11y-pill-text">${commandText || i18n[currentLang].voiceNavActive}</span>
      <button type="button" class="sa11y-pill-stop-btn" aria-label="Stop voice navigation">✕</button>
    `;
    voicePillEl.querySelector('.sa11y-pill-stop-btn').addEventListener('click', stopVoiceNav);
    document.body.appendChild(voicePillEl);
  }

  function startVoiceNav() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      announce(i18n[currentLang].voiceNavUnsupported);
      triggerVisualAlert(i18n[currentLang].voiceNavUnsupported);
      return;
    }

    try {
      voiceRecognition = new SpeechRecognition();
      voiceRecognition.continuous = true;
      voiceRecognition.interimResults = false;
      voiceRecognition.lang = BCP47_A11Y[currentLang] || 'en-US';

      voiceRecognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        if (!lastResult.isFinal) return;
        const transcript = (lastResult[0].transcript || '').trim().toLowerCase();
        processVoiceCommand(transcript);
      };

      voiceRecognition.onerror = (e) => {
        console.warn('SpeechRecognition notice:', e.error);
      };

      voiceRecognition.onend = () => {
        if (isVoiceNavActive) {
          try { voiceRecognition.start(); } catch (_) {}
        }
      };

      voiceRecognition.start();
      isVoiceNavActive = true;
      renderVoicePill(true);
      announce(i18n[currentLang].voiceNavActive);
      triggerVisualAlert(i18n[currentLang].voiceNavActive);
      updateMotorBarButtonsState();
    } catch (err) {
      console.warn('Speech recognition error:', err);
      announce(i18n[currentLang].voiceNavUnsupported);
    }
  }

  function stopVoiceNav() {
    isVoiceNavActive = false;
    if (voiceRecognition) {
      try { voiceRecognition.stop(); } catch (_) {}
      voiceRecognition = null;
    }
    renderVoicePill(false);
    announce(i18n[currentLang].voiceNavStopped);
    updateMotorBarButtonsState();
  }

  function toggleVoiceNav(force) {
    const nextState = (typeof force === 'boolean') ? force : !isVoiceNavActive;
    if (nextState) {
      startVoiceNav();
    } else {
      stopVoiceNav();
    }
  }

  function processVoiceCommand(cmd) {
    renderVoicePill(true, (currentLang === 'am' ? 'የተሰማው ትዕዛዝ፡ ' : 'Voice Command: ') + `"${cmd}"`);

    if (cmd.includes('next') || cmd.includes('forward') || cmd.includes('ቀጣይ')) {
      navigateNextLesson();
    } else if (cmd.includes('back') || cmd.includes('previous') || cmd.includes('ተመለስ')) {
      navigatePrevLesson();
    } else if (cmd.includes('complete') || cmd.includes('finish') || cmd.includes('done') || cmd.includes('ጨርስ')) {
      triggerCompleteLesson();
    } else if (cmd.includes('down') || cmd.includes('ወደ ታች')) {
      window.scrollBy({ top: 450, behavior: 'smooth' });
    } else if (cmd.includes('up') || cmd.includes('ወደ ላይ')) {
      window.scrollBy({ top: -450, behavior: 'smooth' });
    } else if (cmd.includes('read') || cmd.includes('speak') || cmd.includes('listen') || cmd.includes('አንብብ')) {
      readCurrentLessonAloud();
    } else if (cmd.includes('stop') || cmd.includes('pause') || cmd.includes('አቁም')) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (isAutoScanActive) stopSwitchScanner();
    } else if (cmd.includes('help') || cmd.includes('shortcut') || cmd.includes('እርዳታ')) {
      openShortcutsModal();
    } else if (cmd.includes('scan') || cmd.includes('switch') || cmd.includes('ስካነር')) {
      toggleSwitchScanner();
    } else if (cmd.includes('ruler') || cmd.includes('focus') || cmd.includes('ገዥ')) {
      toggleReadingRuler();
    }
  }

  /* ── 15. Sticky Motor Action Bar UI ─────────────────────────────────────── */
  function injectStickyMotorBar() {
    if (document.getElementById('sa11y-motor-toolbar')) return;

    const t = i18n[currentLang];
    const bar = document.createElement('nav');
    bar.id = 'sa11y-motor-toolbar';
    bar.className = 'sa11y-motor-bar';
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', t.motorBarLabel);

    bar.innerHTML = `
      <div class="sa11y-motor-buttons">
        <button type="button" id="sa11y-btn-back" class="sa11y-motor-btn" title="${t.btnMotorBack}" aria-label="${t.btnMotorBack}">
          <span aria-hidden="true" class="sa11y-btn-icon">⬅</span>
          <span class="sa11y-btn-text">${t.btnMotorBack}</span>
        </button>
        <button type="button" id="sa11y-btn-complete" class="sa11y-motor-btn sa11y-btn-accent" title="${t.btnMotorComplete}" aria-label="${t.btnMotorComplete}">
          <span aria-hidden="true" class="sa11y-btn-icon">✓</span>
          <span class="sa11y-btn-text">${t.btnMotorComplete}</span>
        </button>
        <button type="button" id="sa11y-btn-next" class="sa11y-motor-btn" title="${t.btnMotorNext}" aria-label="${t.btnMotorNext}">
          <span aria-hidden="true" class="sa11y-btn-icon">➡</span>
          <span class="sa11y-btn-text">${t.btnMotorNext}</span>
        </button>
        <button type="button" id="sa11y-btn-voice" class="sa11y-motor-btn ${isVoiceNavActive ? 'sa11y-active-mode' : ''}" title="${t.btnVoiceNav}" aria-label="${t.btnVoiceNav}" aria-pressed="${isVoiceNavActive}">
          <span aria-hidden="true" class="sa11y-btn-icon">🎙️</span>
          <span class="sa11y-btn-text">${t.btnVoiceNav}</span>
        </button>
        <button type="button" id="sa11y-btn-scan" class="sa11y-motor-btn ${isAutoScanActive ? 'sa11y-active-mode' : ''}" title="${t.btnAutoScan}" aria-label="${t.btnAutoScan}" aria-pressed="${isAutoScanActive}">
          <span aria-hidden="true" class="sa11y-btn-icon">⚡</span>
          <span class="sa11y-btn-text">${t.btnAutoScan}</span>
        </button>
        <button type="button" id="sa11y-btn-shortcuts" class="sa11y-motor-btn" title="${t.btnShortcuts}" aria-label="${t.btnShortcuts}">
          <span aria-hidden="true" class="sa11y-btn-icon">❓</span>
          <span class="sa11y-btn-text">${t.btnShortcuts}</span>
        </button>
      </div>
    `;

    document.body.appendChild(bar);
    motorBarEl = bar;

    bar.querySelector('#sa11y-btn-back').addEventListener('click', navigatePrevLesson);
    bar.querySelector('#sa11y-btn-complete').addEventListener('click', triggerCompleteLesson);
    bar.querySelector('#sa11y-btn-next').addEventListener('click', navigateNextLesson);
    bar.querySelector('#sa11y-btn-voice').addEventListener('click', () => toggleVoiceNav());
    bar.querySelector('#sa11y-btn-scan').addEventListener('click', () => toggleSwitchScanner());
    bar.querySelector('#sa11y-btn-shortcuts').addEventListener('click', openShortcutsModal);
  }

  function removeStickyMotorBar() {
    if (motorBarEl && motorBarEl.parentNode) {
      motorBarEl.parentNode.removeChild(motorBarEl);
    }
    motorBarEl = null;
  }

  function updateMotorBarButtonsState() {
    if (!motorBarEl) return;
    const voiceBtn = motorBarEl.querySelector('#sa11y-btn-voice');
    if (voiceBtn) {
      voiceBtn.classList.toggle('sa11y-active-mode', isVoiceNavActive);
      voiceBtn.setAttribute('aria-pressed', String(isVoiceNavActive));
    }
    const scanBtn = motorBarEl.querySelector('#sa11y-btn-scan');
    if (scanBtn) {
      scanBtn.classList.toggle('sa11y-active-mode', isAutoScanActive);
      scanBtn.setAttribute('aria-pressed', String(isAutoScanActive));
    }
  }

  function updateStickyMotorBarLanguage() {
    if (!motorBarEl) return;
    const t = i18n[currentLang];
    motorBarEl.setAttribute('aria-label', t.motorBarLabel);

    const map = [
      { id: '#sa11y-btn-back', text: t.btnMotorBack },
      { id: '#sa11y-btn-complete', text: t.btnMotorComplete },
      { id: '#sa11y-btn-next', text: t.btnMotorNext },
      { id: '#sa11y-btn-voice', text: t.btnVoiceNav },
      { id: '#sa11y-btn-scan', text: t.btnAutoScan },
      { id: '#sa11y-btn-shortcuts', text: t.btnShortcuts }
    ];

    map.forEach(item => {
      const btn = motorBarEl.querySelector(item.id);
      if (btn) {
        btn.setAttribute('title', item.text);
        btn.setAttribute('aria-label', item.text);
        const txtSpan = btn.querySelector('.sa11y-btn-text');
        if (txtSpan) txtSpan.textContent = item.text;
      }
    });

    if (shortcutsModalEl) {
      shortcutsModalEl.remove();
      shortcutsModalEl = null;
    }
  }

  /* ── 16. Shortcuts Guide Modal ─────────────────────────────────────────── */
  function buildShortcutsModal() {
    if (document.getElementById('sa11y-shortcuts-backdrop')) {
      return document.getElementById('sa11y-shortcuts-backdrop');
    }

    const t = i18n[currentLang] || i18n.en;
    const isRtl = (currentLang === 'ar');
    const backdrop = document.createElement('div');
    backdrop.id = 'sa11y-shortcuts-backdrop';
    backdrop.className = 'sa11y-backdrop';
    backdrop.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    backdrop.setAttribute('lang', currentLang);
    backdrop.setAttribute('hidden', '');

    backdrop.innerHTML = `
      <div class="sa11y-modal sa11y-shortcuts-modal" role="dialog" aria-modal="true" aria-labelledby="sa11y-shortcuts-title" aria-describedby="sa11y-shortcuts-desc" dir="${isRtl ? 'rtl' : 'ltr'}" lang="${currentLang}">
        <div class="sa11y-modal-header">
          <div class="sa11y-title-group">
            <h2 id="sa11y-shortcuts-title">
              <span aria-hidden="true">⌨️</span>
              <span>${t.shortcutsModalTitle}</span>
            </h2>
            <p id="sa11y-shortcuts-desc">${t.shortcutsModalDesc}</p>
          </div>
          <button type="button" id="sa11y-shortcuts-close" class="sa11y-close-btn" aria-label="${t.closeLabel}">✕</button>
        </div>
        <div class="sa11y-modal-body">
          <div class="sa11y-shortcuts-table-wrap">
            <table class="sa11y-shortcuts-table">
              <thead>
                <tr>
                  <th scope="col">${t.shortcutTableKey}</th>
                  <th scope="col">${t.shortcutTableAction}</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><kbd>J</kbd></td><td>${t.shortcutNext}</td></tr>
                <tr><td><kbd>K</kbd></td><td>${t.shortcutPrev}</td></tr>
                <tr><td><kbd>C</kbd></td><td>${t.shortcutComplete}</td></tr>
                <tr><td><kbd>S</kbd></td><td>${t.shortcutScan}</td></tr>
                <tr><td><kbd>V</kbd></td><td>${t.shortcutVoice}</td></tr>
                <tr><td><kbd>R</kbd></td><td>${t.rulerToggle}</td></tr>
                <tr><td><kbd>Alt + I / I</kbd></td><td>${t.shortcutTableImg}</td></tr>
                <tr><td><kbd>?</kbd></td><td>${t.shortcutHelp}</td></tr>
                <tr><td><kbd>Space / Enter</kbd></td><td>${t.shortcutTableSpace}</td></tr>
                <tr><td><kbd>Esc</kbd></td><td>${t.shortcutEsc}</td></tr>
              </tbody>
            </table>
          </div>
          <div class="sa11y-voice-commands-card">
            <h4><span aria-hidden="true">🎙️</span> ${t.shortcutVoiceTitle}</h4>
            <p class="sa11y-code-pill">${t.voiceCmdList}</p>
          </div>
        </div>
        <div class="sa11y-modal-footer">
          <button type="button" id="sa11y-shortcuts-ok" class="sa11y-btn sa11y-btn-primary">
            ${t.shortcutGotIt}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    shortcutsModalEl = backdrop;

    const closeBtn = backdrop.querySelector('#sa11y-shortcuts-close');
    const okBtn = backdrop.querySelector('#sa11y-shortcuts-ok');
    closeBtn.addEventListener('click', closeShortcutsModal);
    okBtn.addEventListener('click', closeShortcutsModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeShortcutsModal();
    });
    backdrop.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeShortcutsModal();
    });

    return backdrop;
  }

  function openShortcutsModal() {
    if (!shortcutsModalEl) shortcutsModalEl = buildShortcutsModal();
    isShortcutsOpen = true;
    shortcutsModalEl.removeAttribute('hidden');
    const okBtn = shortcutsModalEl.querySelector('#sa11y-shortcuts-ok');
    if (okBtn) okBtn.focus();
  }

  function closeShortcutsModal() {
    if (!shortcutsModalEl) return;
    isShortcutsOpen = false;
    shortcutsModalEl.setAttribute('hidden', '');
    if (motorBarEl) {
      const btn = motorBarEl.querySelector('#sa11y-btn-shortcuts');
      if (btn) btn.focus();
    }
  }

  /* ── 17. Motor Adaptation Controller ────────────────────────────────────── */
  function adaptMotorAndMobility(enable) {
    if (enable) {
      document.documentElement.setAttribute('data-sa11y-motor', 'true');
      injectStickyMotorBar();
      window.addEventListener('keydown', handleSingleKeyShortcuts);
    } else {
      document.documentElement.removeAttribute('data-sa11y-motor');
      removeStickyMotorBar();
      stopSwitchScanner();
      stopVoiceNav();
      if (!activeProfile || !activeProfile.cognitiveSupport) {
        window.removeEventListener('keydown', handleSingleKeyShortcuts);
      }
      if (isShortcutsOpen) closeShortcutsModal();
    }
  }

  /* ═════════════════════════════════════════════════════════════════════════
     PHASE 4: COGNITIVE, READING & NEURODIVERGENT ADAPTATIONS
     ═════════════════════════════════════════════════════════════════════════ */

  let isReadingRulerActive = false;
  let readingRulerEl = null;
  let rulerPillEl = null;

  /* ── 18. Reading Guide Ruler ───────────────────────────────────────────── */
  function createReadingRuler() {
    if (document.getElementById('sa11y-reading-ruler')) return;

    const ruler = document.createElement('div');
    ruler.id = 'sa11y-reading-ruler';
    ruler.className = 'sa11y-reading-ruler';
    ruler.setAttribute('aria-hidden', 'true');

    ruler.innerHTML = `
      <div class="sa11y-ruler-dim-top" id="sa11y-ruler-top"></div>
      <div class="sa11y-ruler-guide-band" id="sa11y-ruler-band">
        <div class="sa11y-ruler-reading-line"></div>
      </div>
      <div class="sa11y-ruler-dim-bottom" id="sa11y-ruler-bottom"></div>
    `;

    document.body.appendChild(ruler);
    readingRulerEl = ruler;

    window.addEventListener('mousemove', handleRulerMouseMove);
  }

  function removeReadingRuler() {
    if (readingRulerEl && readingRulerEl.parentNode) {
      readingRulerEl.parentNode.removeChild(readingRulerEl);
    }
    readingRulerEl = null;
    window.removeEventListener('mousemove', handleRulerMouseMove);
    if (rulerPillEl && rulerPillEl.parentNode) {
      rulerPillEl.parentNode.removeChild(rulerPillEl);
    }
    rulerPillEl = null;
    isReadingRulerActive = false;
  }

  function handleRulerMouseMove(e) {
    if (!isReadingRulerActive || !readingRulerEl) return;
    const bandHeight = 110;
    const y = e.clientY;
    const topHeight = Math.max(0, y - bandHeight / 2);
    const bottomTop = y + bandHeight / 2;

    const topEl = readingRulerEl.querySelector('#sa11y-ruler-top');
    const bandEl = readingRulerEl.querySelector('#sa11y-ruler-band');
    const btmEl = readingRulerEl.querySelector('#sa11y-ruler-bottom');

    if (topEl) topEl.style.height = `${topHeight}px`;
    if (bandEl) {
      bandEl.style.top = `${topHeight}px`;
      bandEl.style.height = `${bandHeight}px`;
    }
    if (btmEl) btmEl.style.top = `${bottomTop}px`;
  }

  function renderRulerPill(show) {
    if (rulerPillEl) {
      rulerPillEl.remove();
      rulerPillEl = null;
    }
    if (!show) return;

    rulerPillEl = document.createElement('button');
    rulerPillEl.id = 'sa11y-ruler-pill';
    rulerPillEl.type = 'button';
    rulerPillEl.className = 'sa11y-ruler-toggle-pill';
    rulerPillEl.setAttribute('aria-pressed', String(isReadingRulerActive));
    rulerPillEl.innerHTML = `
      <span aria-hidden="true">📏</span>
      <span class="sa11y-ruler-pill-text">${isReadingRulerActive ? i18n[currentLang].rulerActivePill : i18n[currentLang].rulerInactivePill}</span>
    `;

    rulerPillEl.addEventListener('click', () => toggleReadingRuler());
    document.body.appendChild(rulerPillEl);
  }

  function toggleReadingRuler(force) {
    const nextState = (typeof force === 'boolean') ? force : !isReadingRulerActive;
    isReadingRulerActive = nextState;

    if (isReadingRulerActive) {
      if (!readingRulerEl) createReadingRuler();
      if (readingRulerEl) readingRulerEl.removeAttribute('hidden');
      announce(i18n[currentLang].rulerActivePill);
    } else {
      if (readingRulerEl) readingRulerEl.setAttribute('hidden', '');
      announce(i18n[currentLang].rulerInactivePill);
    }
    renderRulerPill(true);
  }

  /* ── 19. Plain-Language Simplification & Step Chunking ──────────────────── */
  async function fetchPlainLanguageSummary(text, lang) {
    try {
      const resp = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: (lang === 'am')
            ? `ይህን ፅሑፍ በ3 አጫጭር እና ግልጽ የሆኑ ነጥቦች አጠቃልለው ያብራሩ፡\n${text}`
            : `Summarize the following educational content in 3 short, crystal-clear, plain-language bullet points without technical jargon:\n${text}`,
          language: lang,
          simple_mode: true
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.reply) return data.reply;
      }
    } catch (_) {}

    // Deterministic plain-language fallback
    if (lang === 'am') {
      return `• ዋናው ሀሳብ፡ ይህ ክፍል የቨርቹዋል አሲስታንት ስራ በቴክኖሎጂ እና በሰው ሰራሽ ብልህነት (AI) ታግዞ እንዴት እንደሚከናወን ያሳያል።\n• ደረጃ 1፡ የዲጂታል መሳሪያዎችን እና አዳዲስ አሰራሮችን ማወቅ።\n• ደረጃ 2፡ የደንበኞችን ፍላጎት በቅልጥፍና እና በታማኝነት ማሟላት።\n• ደረጃ 3፡ ከቡድን አባላት ጋር ግልጽ ግንኙነት መፍጠር።`;
    }
    return `• Main Idea: Virtual Assistants use modern remote tools and AI to support businesses efficiently.\n• Step 1: Understand your client's core workflows and communication channels.\n• Step 2: Use digital productivity tools to save time and organize deliverables.\n• Step 3: Prioritize clear human collaboration, empathy, and continuous learning.`;
  }

  function injectSimplifyButtons(enable) {
    document.querySelectorAll('.sa11y-simplify-container, .sa11y-step-badge').forEach(el => el.remove());

    if (!enable) return;

    const contentArea = document.getElementById('curriculum_navigation_content') ||
      document.querySelector('.formatted-content') ||
      document.querySelector('article') ||
      document.querySelector('main');
    if (!contentArea) return;

    const sections = Array.from(contentArea.querySelectorAll('p, blockquote')).filter(p => {
      return (p.textContent || '').trim().length > 120 && !p.closest('.sa11y-simplified-card') && !p.closest('#sa11y-lesson-transcript');
    });

    sections.forEach((p, index) => {
      // Step badge for structured, predictable navigation
      const badge = document.createElement('span');
      badge.className = 'sa11y-step-badge';
      badge.setAttribute('aria-hidden', 'true');
      badge.textContent = `${i18n[currentLang].stepBadge} ${index + 1}`;
      p.parentNode.insertBefore(badge, p);

      // Simplify container
      const container = document.createElement('div');
      container.className = 'sa11y-simplify-container';

      const simplifyBtn = document.createElement('button');
      simplifyBtn.type = 'button';
      simplifyBtn.className = 'sa11y-simplify-btn';
      simplifyBtn.setAttribute('aria-expanded', 'false');
      simplifyBtn.innerHTML = `
        <span aria-hidden="true">✨</span>
        <span>${i18n[currentLang].btnSimplify}</span>
      `;

      let cardEl = null;

      simplifyBtn.addEventListener('click', async () => {
        if (cardEl) {
          const isHidden = cardEl.hasAttribute('hidden');
          if (isHidden) {
            cardEl.removeAttribute('hidden');
            simplifyBtn.setAttribute('aria-expanded', 'true');
            simplifyBtn.innerHTML = `<span aria-hidden="true">📖</span> <span>${i18n[currentLang].btnOriginal}</span>`;
          } else {
            cardEl.setAttribute('hidden', '');
            simplifyBtn.setAttribute('aria-expanded', 'false');
            simplifyBtn.innerHTML = `<span aria-hidden="true">✨</span> <span>${i18n[currentLang].btnSimplify}</span>`;
          }
          return;
        }

        cardEl = document.createElement('div');
        cardEl.className = 'sa11y-simplified-card';
        cardEl.setAttribute('role', 'region');
        cardEl.setAttribute('aria-label', i18n[currentLang].simplifiedTitle);

        cardEl.innerHTML = `
          <div class="sa11y-simplified-header">
            <span class="sa11y-simplified-title">
              <span aria-hidden="true">💡</span>
              <strong>${i18n[currentLang].simplifiedTitle}</strong>
            </span>
            <div class="sa11y-simplified-actions">
              <button type="button" class="sa11y-card-audio-btn" aria-label="${i18n[currentLang].btnReadAloud}">
                ${i18n[currentLang].btnReadAloud}
              </button>
            </div>
          </div>
          <div class="sa11y-simplified-body">
            <div class="sa11y-simplified-loading">${i18n[currentLang].simplifiedLoading}</div>
          </div>
        `;

        container.appendChild(cardEl);
        simplifyBtn.setAttribute('aria-expanded', 'true');
        simplifyBtn.innerHTML = `<span aria-hidden="true">📖</span> <span>${i18n[currentLang].btnOriginal}</span>`;

        const plainSummary = await fetchPlainLanguageSummary(p.textContent, currentLang);
        const bodyEl = cardEl.querySelector('.sa11y-simplified-body');
        if (bodyEl) {
          const lines = plainSummary.split('\n').filter(l => l.trim().length > 0);
          bodyEl.innerHTML = `<ul class="sa11y-plain-list">${lines.map(line => `<li>${line.replace(/^[•\-\*]\s*/, '')}</li>`).join('')}</ul>`;
        }

        const audioBtn = cardEl.querySelector('.sa11y-card-audio-btn');
        if (audioBtn) {
          audioBtn.addEventListener('click', () => {
            if ('speechSynthesis' in window) {
              if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
                return;
              }
              const utter = new SpeechSynthesisUtterance(plainSummary.replace(/[•\-\*]/g, ''));
              utter.lang = BCP47_A11Y[currentLang] || 'en-US';
              window.speechSynthesis.speak(utter);
            }
          });
        }

        announce(i18n[currentLang].simplifiedTitle);
      });

      container.appendChild(simplifyBtn);
      p.parentNode.insertBefore(container, p);
    });
  }

  /* ── 20. Cognitive Adaptation Controller ────────────────────────────────── */
  function adaptCognitiveSupport(enable) {
    if (enable) {
      document.documentElement.setAttribute('data-sa11y-cognitive', 'true');
      injectSimplifyButtons(true);
      renderRulerPill(true);
      window.addEventListener('keydown', handleSingleKeyShortcuts);
    } else {
      document.documentElement.removeAttribute('data-sa11y-cognitive');
      injectSimplifyButtons(false);
      removeReadingRuler();
      if (!activeProfile || !activeProfile.motorAssistance) {
        window.removeEventListener('keydown', handleSingleKeyShortcuts);
      }
    }
  }

  /* ── 21. Master Adaptation Controller ──────────────────────────────────── */
  function applyAdaptations(profile) {
    if (!profile) return;
    adaptBlindAndScreenReader(Boolean(profile.screenReader));
    adaptLowVisionContrast(Boolean(profile.highContrast));
    adaptDeafAndHearing(Boolean(profile.captionsTranscripts));
    adaptMotorAndMobility(Boolean(profile.motorAssistance));
    adaptCognitiveSupport(Boolean(profile.cognitiveSupport));
  }

  // Hook form submissions (e.g. "Mark as complete") to flash visual alert
  document.addEventListener('submit', () => {
    if (activeProfile && activeProfile.captionsTranscripts) {
      triggerVisualAlert(currentLang === 'am' ? 'ተግባሩ ተጠናቋል!' : 'Activity marked as complete!');
    }
  });

  // Watch for dynamic DOM changes (module swaps, accordion changes)
  let mutationTimeout = null;
  const observer = new MutationObserver((mutations) => {
    // Ignore internal accessibility DOM updates to prevent infinite loops
    const isInternal = mutations.every(m => {
      const t = m.target;
      return t && (
        t.id === 'savanna-a11y-announcer' ||
        t.id === 'sa11y-live-region' ||
        (t.classList && (t.classList.contains('sa11y-describe-img-btn') || t.classList.contains('sa11y-image-desc-card') || t.classList.contains('sa11y-status-sr'))) ||
        (t.closest && t.closest('.sa11y-image-desc-card, #sa11y-live-region, #savanna-a11y-announcer, #sa11y-motor-toolbar, #sa11y-reading-ruler'))
      );
    });
    if (isInternal) return;

    if (mutationTimeout) clearTimeout(mutationTimeout);
    mutationTimeout = setTimeout(() => {
      adaptBlindAndScreenReader(true);
    }, 150);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Listen to profile updates
  window.addEventListener('savanna:a11y-profile-changed', (e) => {
    activeProfile = e.detail;
    applyAdaptations(activeProfile);
  });

  /* ── 12. Initial Mount & Check ────────────────────────────────────────── */
  function initEngine() {
    createTriggerButton();

    // Enable image keyboard Tab navigation and visual accessibility by default
    adaptBlindAndScreenReader(true);

    // Check if user has already configured or skipped
    const stored = getStoredProfile();
    if (!stored || (!stored.configured && !stored.skipped)) {
      // First visit: automatically open the accessible identification modal
      setTimeout(() => {
        openOnboardingModal(false);
      }, 400);
    } else {
      activeProfile = stored;
      applyAdaptations(activeProfile);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEngine);
  } else {
    initEngine();
  }

  // Expose API for host scripts or other modules
  window.SavannaA11y = {
    openSettings: () => openOnboardingModal(true),
    getProfile: () => ({ ...activeProfile }),
    setProfile: (p) => {
      activeProfile = { ...activeProfile, ...p, configured: true };
      saveProfile(activeProfile);
    }
  };
})();
