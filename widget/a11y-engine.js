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
  const ONBOARDING_COMPLETED_KEY = 'savanna_onboarding_completed';

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

  /* ── 2b. Visual Language Options & Badges (Crisp High-Contrast SVGs) ─── */
  const LANGUAGE_OPTIONS = [
    {
      code: 'en',
      native: 'English',
      english: 'English',
      badge: 'EN',
      color: '#005fcc',
      iconSvg: '<svg viewBox="0 0 36 24" class="sa11y-flag-svg" aria-hidden="true"><rect width="36" height="24" rx="3" fill="#00247d"/><path d="M0,0 L36,24 M36,0 L0,24" stroke="#ffffff" stroke-width="4"/><path d="M0,0 L36,24 M36,0 L0,24" stroke="#cf142b" stroke-width="2.5"/><path d="M18,0 V24 M0,12 H36" stroke="#ffffff" stroke-width="6"/><path d="M18,0 V24 M0,12 H36" stroke="#cf142b" stroke-width="3.5"/></svg>'
    },
    {
      code: 'am',
      native: 'አማርኛ',
      english: 'Amharic',
      badge: 'አማ',
      color: '#078930',
      iconSvg: '<svg viewBox="0 0 36 24" class="sa11y-flag-svg" aria-hidden="true"><rect width="36" height="8" fill="#078930" rx="3 3 0 0"/><rect y="8" width="36" height="8" fill="#fcdd09"/><rect y="16" width="36" height="8" fill="#da121a" rx="0 0 3 3"/><circle cx="18" cy="12" r="5" fill="#0f47af"/><polygon points="18,8.2 19.1,10.8 21.8,11.2 19.8,12.8 20.4,15.5 18,14.1 15.6,15.5 16.2,12.8 14.2,11.2 16.9,10.8" fill="#fcdd09"/></svg>'
    },
    {
      code: 'om',
      native: 'Afaan Oromoo',
      english: 'Oromo',
      badge: 'OM',
      color: '#d91b24',
      iconSvg: '<svg viewBox="0 0 36 24" class="sa11y-flag-svg" aria-hidden="true"><rect width="36" height="8" fill="#da121a" rx="3 3 0 0"/><rect y="8" width="36" height="8" fill="#ffffff"/><rect y="16" width="36" height="8" fill="#000000" rx="0 0 3 3"/><circle cx="18" cy="12" r="4.5" fill="#da121a"/><circle cx="18" cy="12" r="2.5" fill="#fcdd09"/></svg>'
    },
    {
      code: 'ti',
      native: 'ትግርኛ',
      english: 'Tigrinya',
      badge: 'ትግ',
      color: '#128a42',
      iconSvg: '<svg viewBox="0 0 36 24" class="sa11y-flag-svg" aria-hidden="true"><rect width="36" height="24" rx="3" fill="#0066b2"/><polygon points="0,0 36,12 0,24" fill="#da121a"/><polygon points="0,0 36,0 36,12" fill="#078930"/><polygon points="0,24 36,24 36,12" fill="#0066b2"/><circle cx="9" cy="12" r="3" fill="#fcdd09"/></svg>'
    },
    {
      code: 'so',
      native: 'Soomaali',
      english: 'Somali',
      badge: 'SO',
      color: '#4189dd',
      iconSvg: '<svg viewBox="0 0 36 24" class="sa11y-flag-svg" aria-hidden="true"><rect width="36" height="24" rx="3" fill="#4189dd"/><polygon points="18,6 19.7,10.2 24.2,10.5 20.7,13.3 21.8,17.7 18,15 14.2,17.7 15.3,13.3 11.8,10.5 16.3,10.2" fill="#ffffff"/></svg>'
    },
    {
      code: 'ar',
      native: 'العربية',
      english: 'Arabic (RTL)',
      badge: 'AR',
      color: '#006233',
      iconSvg: '<svg viewBox="0 0 36 24" class="sa11y-flag-svg" aria-hidden="true"><rect width="36" height="24" rx="3" fill="#006233"/><circle cx="17" cy="12" r="5" fill="#ffffff"/><circle cx="18.5" cy="12" r="4.2" fill="#006233"/><polygon points="18,9.5 18.8,11.2 20.5,11.4 19.1,12.5 19.5,14.2 18,13.2 16.5,14.2 16.9,12.5 15.5,11.4 17.2,11.2" fill="#ffffff"/></svg>'
    },
    {
      code: 'sw',
      native: 'Kiswahili',
      english: 'Swahili',
      badge: 'SW',
      color: '#1eb53a',
      iconSvg: '<svg viewBox="0 0 36 24" class="sa11y-flag-svg" aria-hidden="true"><rect width="36" height="24" rx="3" fill="#1eb53a"/><polygon points="0,24 36,0 36,6 6,24" fill="#fcdd09"/><polygon points="0,24 36,0 36,4 4,24" fill="#000000"/><polygon points="36,0 36,24 0,24" fill="#00a3dd"/></svg>'
    },
    {
      code: 'fr',
      native: 'Français',
      english: 'French',
      badge: 'FR',
      color: '#002395',
      iconSvg: '<svg viewBox="0 0 36 24" class="sa11y-flag-svg" aria-hidden="true"><rect width="12" height="24" rx="3 0 0 3" fill="#002395"/><rect x="12" width="12" height="24" fill="#ffffff"/><rect x="24" width="12" height="24" rx="0 3 3 0" fill="#ed2939"/></svg>'
    }
  ];

  /* ── 2c. Pluggable Live DOM Content Translation Dictionary ─────────────── */
  const DOM_TRANSLATIONS = {
  "Savanna static pages": {
    "en": "Savanna static pages",
    "am": "ሳቫና የትምህርት መድረክ ገጾች",
    "om": "Fuulota Saavannaa",
    "ti": "ናይ ሳቫና ትምህርታዊ ገጻት",
    "so": "Bogagga Madasha Savanna",
    "ar": "صفحات منصة سافانا التعليمية",
    "sw": "Kurasa za jukwaa la Savanna",
    "fr": "Pages de la plateforme Savanna"
  },
  "Learner homepage — v1 paced": {
    "en": "Learner homepage — v1 paced",
    "am": "የተማሪ መነሻ ገጽ — በጊዜ የተገደበ",
    "om": "Fuula Jalqabaa Barataa — Yeroon Murtaa’e",
    "ti": "ናይ ተምሃራይ መበገሲ ገጽ — ብግዜ ዝተወሰነ",
    "so": "Bogga Hore ee Ardayga — Xaddidan",
    "ar": "الصفحة الرئيسية للمتعلم — وتيرة محددة",
    "sw": "Ukurasa wa mwanafunzi — Kasi ya pamoja",
    "fr": "Accueil apprenant — Rythme guidé"
  },
  "Learner homepage — v1 self-paced": {
    "en": "Learner homepage — v1 self-paced",
    "am": "የተማሪ መነሻ ገጽ — በራስ ፍጥነት የሚመራ",
    "om": "Fuula Jalqabaa Barataa — Ofiin Geggeeffamu",
    "ti": "ናይ ተምሃራይ መበገሲ ገጽ — ብናይ ባዕልኻ ፍጥነት",
    "so": "Bogga Hore ee Ardayga — Xawaarahaaga",
    "ar": "الصفحة الرئيسية للمتعلم — وتيرة ذاتية",
    "sw": "Ukurasa wa mwanafunzi — Kasi ya binafsi",
    "fr": "Accueil apprenant — Rythme autonome"
  },
  "Concept page with curriculum navigation": {
    "en": "Concept page with curriculum navigation",
    "am": "የጽንሰ-ሀሳብ ገጽ ከስርዓተ-ትምህርት አሰሳ ጋር",
    "om": "Fuula Yaad-rimee fi Kallattii Barnootaa",
    "ti": "ናይ ጽንሰ-ሓሳብ ገጽ ምስ ስርዓተ-ትምህርቲ ዳህሳስ",
    "so": "Bogga fikradda oo leh hage manhaj",
    "ar": "صفحة المفاهيم مع تصفح المنهج",
    "sw": "Ukurasa wa dhana na mwongozo wa mtaala",
    "fr": "Page de concept avec navigation curriculaire"
  },
  "Live Help — Operator Dashboard": {
    "en": "Live Help — Operator Dashboard",
    "am": "ቀጥታ ድጋፍ — የአስተባባሪ ዳሽቦርድ",
    "om": "Deeggarsa Kallattii — Daashboordii Hojjataa",
    "ti": "ቀጥታ ደገፍ — ናይ ኣተሓባባሪ ዳሽቦርድ",
    "so": "Caawimaad Toos ah — Dashboard-ka Hawl-wadeenka",
    "ar": "المساعدة المباشرة — لوحة تحكم المشرف",
    "sw": "Msaada wa Moja kwa Moja — Dashibodi ya Opereta",
    "fr": "Aide en direct — Tableau de bord opérateur"
  },
  "Access my learning": {
    "en": "Access my learning",
    "am": "ትምህርቴን ይድረሱ",
    "om": "Barnoota koo banaa",
    "ti": "ትምህርተይ ዕሰሉ",
    "so": "Gal waxbarashadayda",
    "ar": "الوصول إلى تعلمي",
    "sw": "Fikia masomo yangu",
    "fr": "Accéder à mes cours"
  },
  "My Planning": {
    "en": "My Planning",
    "am": "የእኔ እቅድ",
    "om": "Karoora koo",
    "ti": "ውጥነይ",
    "so": "Qorshahayga",
    "ar": "جدولي الدراسي",
    "sw": "Mipango yangu",
    "fr": "Mon planning"
  },
  "Projects": {
    "en": "Projects",
    "am": "ፕሮጀክቶች",
    "om": "Pirojektoota",
    "ti": "ፕሮጀክትታት",
    "so": "Mashaariicda",
    "ar": "المشاريع",
    "sw": "Miradi",
    "fr": "Projets"
  },
  "QA Reviews I can make": {
    "en": "QA Reviews I can make",
    "am": "የእኩዮች ግምገማዎች (QA)",
    "om": "Gamaaggama QA gochuu danda’u",
    "ti": "ናይ ብጾት ገምጋማት (QA)",
    "so": "Dib u eegista QA ee aan samayn karo",
    "ar": "مراجعات الجودة المتاحة",
    "sw": "Mapitio ya QA ninayoweza kufanya",
    "fr": "Revues QA disponibles"
  },
  "Evaluation quizzes": {
    "en": "Evaluation quizzes",
    "am": "የግምገማ ፈተናዎች",
    "om": "Qormaata madaallii",
    "ti": "ናይ ምዘና ፈተናታት",
    "so": "Kediska qiimeynta",
    "ar": "اختبارات التقييم",
    "sw": "Maswali ya tathmini",
    "fr": "Quiz d'évaluation"
  },
  "My courses": {
    "en": "My courses",
    "am": "የእኔ ኮርሶች",
    "om": "Koorsoota koo",
    "ti": "ኮርሰታተይ",
    "so": "Koorsooyinkayga",
    "ar": "دوراتي التدريبية",
    "sw": "Kozi zangu",
    "fr": "Mes cours"
  },
  "Concepts": {
    "en": "Concepts",
    "am": "ጽንሰ-ሀሳቦች",
    "om": "Yaad-rimeewwan",
    "ti": "ጽንሰ-ሓሳባት",
    "so": "Fikradaha",
    "ar": "المفاهيم",
    "sw": "Dhana",
    "fr": "Concepts"
  },
  "Conference rooms": {
    "en": "Conference rooms",
    "am": "የስብሰባ ክፍሎች",
    "om": "Kutaa waltajjii",
    "ti": "ናይ ኣኼባ ኣደራሻት",
    "so": "Qolalka shirarka",
    "ar": "قاعات الاجتماعات",
    "sw": "Vyumba vya mkutano",
    "fr": "Salles de conférence"
  },
  "Servers": {
    "en": "Servers",
    "am": "ሰርቨሮች",
    "om": "Sarvaroota",
    "ti": "ሰርቨራት",
    "so": "Adeegayaasha",
    "ar": "الخوادم",
    "sw": "Seva",
    "fr": "Serveurs"
  },
  "Sandboxes": {
    "en": "Sandboxes",
    "am": "የሙከራ ሳጥኖች (Sandboxes)",
    "om": "Saanduqa qorannoo",
    "ti": "ናይ ፈተነ ባይታታት",
    "so": "Aagaga tijaabada",
    "ar": "بيئات الاختبار التجريبية",
    "sw": "Mazingira ya majaribio",
    "fr": "Bacs à sable"
  },
  "Video on demand": {
    "en": "Video on demand",
    "am": "ተፈላጊ ቪዲዮዎች",
    "om": "Viidiyoo filannoon",
    "ti": "ብሕቶ ዝቐርብ ቪድዮ",
    "so": "Fiidiyow dalab ah",
    "ar": "فيديو حسب الطلب",
    "sw": "Video kwa ombi",
    "fr": "Vidéo à la demande"
  },
  "Peers": {
    "en": "Peers",
    "am": "አብረውኝ የሚማሩ (እኩዮች)",
    "om": "Hiriyaa barnootaa",
    "ti": "መዛኑ (መማህርተይ)",
    "so": "Ardayda kale",
    "ar": "الأقران والزملاء",
    "sw": "Wenzangu",
    "fr": "Pairs"
  },
  "My Profile": {
    "en": "My Profile",
    "am": "የእኔ መገለጫ",
    "om": "Piroofaayilii koo",
    "ti": "መገለጺ መንነተይ",
    "so": "Xogtayda shakhsiga ah",
    "ar": "ملفي الشخصي",
    "sw": "Wasifu wangu",
    "fr": "Mon profil"
  },
  "Average": {
    "en": "Average",
    "am": "አማካይ",
    "om": "Giddu-galeessa",
    "ti": "ማእከላይ ውጽኢት",
    "so": "Celcelis",
    "ar": "المعدل",
    "sw": "Wastani",
    "fr": "Moyenne"
  },
  "Resume": {
    "en": "Resume",
    "am": "ቀጥል",
    "om": "Itti fufi",
    "ti": "ቀጽል",
    "so": "Sii wad",
    "ar": "استئناف",
    "sw": "Endelea",
    "fr": "Reprendre"
  },
  "Upcoming events": {
    "en": "Upcoming events",
    "am": "የሚመጡ ሁነቶች",
    "om": "Taateewwan dhufan",
    "ti": "ዝመጹ መደባት",
    "so": "Dhacdooyinka soo socda",
    "ar": "الأحداث القادمة",
    "sw": "Matukio yajayo",
    "fr": "Événements à venir"
  },
  "See all my events": {
    "en": "See all my events",
    "am": "ሁሉንም ሁነቶች ተመልከት",
    "om": "Taateewwan koo hunda ilaali",
    "ti": "ኲሎም መደባተይ ርአ",
    "so": "Arag dhammaan dhacdooyinka",
    "ar": "عرض جميع أحداثي",
    "sw": "Tazama matukio yangu yote",
    "fr": "Voir tous mes événements"
  },
  "Course Progression": {
    "en": "Course Progression",
    "am": "የኮርስ ሂደት",
    "om": "Adeemsa koorsii",
    "ti": "ዕቤት ኮርስ",
    "so": "Horumarka koorsada",
    "ar": "التقدم في الدورة",
    "sw": "Maendeleo ya kozi",
    "fr": "Progression du cours"
  },
  "Course Overview": {
    "en": "Course Overview",
    "am": "የኮርስ አጠቃላይ እይታ",
    "om": "Ibsa waliigalaa koorsii",
    "ti": "ሓፈሻዊ ትሕዝቶ ኮርስ",
    "so": "Dulmarka koorsada",
    "ar": "نظرة عامة على الدورة",
    "sw": "Muhtasari wa kozi",
    "fr": "Aperçu du cours"
  },
  "Continue this course": {
    "en": "Continue this course",
    "am": "ይህን ኮርስ ይቀጥሉ",
    "om": "Koorsii kana itti fufaa",
    "ti": "ነዚ ኮርስ ቀጽልዎ",
    "so": "Sii wad koorsadan",
    "ar": "متابعة هذه الدورة",
    "sw": "Endelea na kozi hii",
    "fr": "Continuer ce cours"
  },
  "Continue where you left off": {
    "en": "Continue where you left off",
    "am": "ካቆሙበት ይቀጥሉ",
    "om": "Bakka dhaabdanii itti fufaa",
    "ti": "ካብቲ ዘቋረጽኩምዎ ቀጽሉ",
    "so": "Ka sii wad meeshii aad joojisay",
    "ar": "تابع من حيث توقفت",
    "sw": "Endelea pale ulipoishia",
    "fr": "Reprendre là où vous vous êtes arrêté"
  },
  "Reach 70% to be eligible for graduation": {
    "en": "Reach 70% to be eligible for graduation",
    "am": "ለምረቃ ብቁ ለመሆን 70% ይድረሱ",
    "om": "Eebbaaf ga’aa ta’uuf 70% qaqqabaa",
    "ti": "ንምረቓ ብቑዕ ንምዃን 70% ብጽሑ",
    "so": "Gaadh 70% si aad ugu qalanto qalin-jabinta",
    "ar": "احصل على 70% للتأهل للتخرج",
    "sw": "Fikisha 70% ili ustahili kuhitimu",
    "fr": "Atteignez 70% pour être éligible à la graduation"
  },
  "Graduation Requirements": {
    "en": "Graduation Requirements",
    "am": "የምረቃ መስፈርቶች",
    "om": "Ulaagaalee Eebbaa",
    "ti": "ናይ ምረቓ ረቋሒታት",
    "so": "Shuruudaha Qalin-jabinta",
    "ar": "متطلبات التخرج",
    "sw": "Mahitaji ya Mahafali",
    "fr": "Exigences de diplomation"
  },
  "Current score": {
    "en": "Current score",
    "am": "የአሁኑ ውጤት",
    "om": "Qabxii ammaa",
    "ti": "ናይ ሕጂ ነጥቢ",
    "so": "Dhibcaha hadda",
    "ar": "الدرجة الحالية",
    "sw": "Alama ya sasa",
    "fr": "Score actuel"
  },
  "In progress": {
    "en": "In progress",
    "am": "በሂደት ላይ",
    "om": "Hojiirra jira",
    "ti": "ኣብ ከይዲ ዘሎ",
    "so": "Socda",
    "ar": "قيد التنفيذ",
    "sw": "Inaendelea",
    "fr": "En cours"
  },
  "Completed": {
    "en": "Completed",
    "am": "ተጠናቋል",
    "om": "Xumurameera",
    "ti": "ተወዲኡ",
    "so": "Dhammaystiran",
    "ar": "مكتمل",
    "sw": "Imekamilika",
    "fr": "Terminé"
  },
  "Not started": {
    "en": "Not started",
    "am": "አልተጀመረም",
    "om": "Hin jalqabamne",
    "ti": "ኣይተጀመረን",
    "so": "Aan la bilaabin",
    "ar": "لم يبدأ بعد",
    "sw": "Haijaanza",
    "fr": "Non commencé"
  },
  "Mark as complete": {
    "en": "Mark as complete",
    "am": "ተግባር ጨርስ",
    "om": "Xumuri",
    "ti": "ተወዲኡ በል",
    "so": "Calaamadee in la dhameeyay",
    "ar": "تحديد كمكتمل",
    "sw": "Weka alama kuwa imekamilika",
    "fr": "Marquer comme terminé"
  },
  "WR 100: Fundamentals of Effective Communication": {
    "en": "WR 100: Fundamentals of Effective Communication",
    "am": "WR 100፡ ውጤታማ የግንኙነት መሰረታዊ መርሆዎች",
    "om": "WR 100: Bu’uura Qunnamtii Bu’a-qabeessaa",
    "ti": "WR 100፡ መሰረታት ውጽኢታዊ ርክብ",
    "so": "WR 100: Aasaaska Xidhiidhka Waxtarka Leh",
    "ar": "WR 100: أساسيات التواصل الفعال",
    "sw": "WR 100: Misingi ya Mawasiliano Yenye Ufanisi",
    "fr": "WR 100: Fondements d'une communication efficace"
  },
  "Fundamentals of Effective Communication": {
    "en": "Fundamentals of Effective Communication",
    "am": "ውጤታማ የግንኙነት መሰረታዊ መርሆዎች",
    "om": "Bu’uura Qunnamtii Bu’a-qabeessaa",
    "ti": "መሰረታት ውጽኢታዊ ርክብ",
    "so": "Aasaaska Xidhiidhka Waxtarka Leh",
    "ar": "أساسيات التواصل الفعال",
    "sw": "Misingi ya Mawasiliano Yenye Ufanisi",
    "fr": "Fondements d'une communication efficace"
  },
  "VA Foundations & Professional Identity": {
    "en": "VA Foundations & Professional Identity",
    "am": "የቨርቹዋል ረዳት መሰረታዊ ዕውቀት እና የሙያ ማንነት",
    "om": "Bu’uura Gargaaraa Fageenyaa fi Eenyummaa Ogummaa",
    "ti": "መሰረታት ቨርቹዋል ረዳኢን ሞያዊ መንነትን",
    "so": "Aasaaska Caawiyaha Fog iyo Aqoonsiga Xirfadeed",
    "ar": "أساسيات المساعد الافتراضي والهوية المهنية",
    "sw": "Misingi ya Msaidizi Halisi na Utambulisho wa Kitaalamu",
    "fr": "Fondations de l'assistant virtuel et identité professionnelle"
  },
  "The Future of the VA Industry": {
    "en": "The Future of the VA Industry",
    "am": "የቨርቹዋል ረዳት ኢንዱስትሪ የወደፊት ጉዞ",
    "om": "Gara Fuulduraa Indaastirii Gargaaraa Fageenyaa",
    "ti": "መጻኢ ናይ ቨርቹዋል ረዳኢ ኢንዱስትሪ",
    "so": "Mustaqbalka Warshadaha Caawiyaha Fog",
    "ar": "مستقبل صناعة المساعد الافتراضي",
    "sw": "Mustakabali wa Sekta ya Msaidizi Halisi",
    "fr": "L'avenir de l'industrie des assistants virtuels"
  },
  "Lesson 1: Introduction": {
    "en": "Lesson 1: Introduction",
    "am": "ትምህርት 1፡ መግቢያ",
    "om": "Barnoota 1: Seensa",
    "ti": "ትምህርቲ 1፡ መእተዊ",
    "so": "Casharka 1: Hordhac",
    "ar": "الدرس 1: مقدمة",
    "sw": "Somo la 1: Utangulizi",
    "fr": "Leçon 1: Introduction"
  },
  "Lesson 2: Tools and Workflows": {
    "en": "Lesson 2: Tools and Workflows",
    "am": "ትምህርት 2፡ መሳሪያዎች እና የአሰራር ሂደቶች",
    "om": "Barnoota 2: Meeshaalee fi Adeemsa Hojii",
    "ti": "ትምህርቲ 2፡ መሳርሒታትን ኣሰራርሓታትን",
    "so": "Casharka 2: Qalabka iyo Hababka Shaqada",
    "ar": "الدرس 2: الأدوات وسير العمل",
    "sw": "Somo la 2: Zana na Mtiririko wa Kazi",
    "fr": "Leçon 2: Outils et flux de travail"
  },
  "AI Foundations for Work": {
    "en": "AI Foundations for Work",
    "am": "አርቴፊሻል ኢንተለጀንስ (AI) ለስራ ቦታ",
    "om": "Bu’uura AI Hojiif",
    "ti": "መሰረታት AI ንስራሕ",
    "so": "Aasaaska AI ee Shaqada",
    "ar": "أساسيات الذكاء الاصطناعي للعمل",
    "sw": "Misingi ya AI kwa Kazi",
    "fr": "Fondations de l'IA pour le travail"
  },
  "Markdown guide": {
    "en": "Markdown guide",
    "am": "የማርክዳውን አጠቃቀም መመሪያ",
    "om": "Qajeelfama Maarkidaawun",
    "ti": "ናይ ማርክዳውን መምርሒ",
    "so": "Hagaha Markdown",
    "ar": "دليل ماركداون",
    "sw": "Mwongozo wa Markdown",
    "fr": "Guide Markdown"
  },
  "Search": {
    "en": "Search",
    "am": "ፈልግ",
    "om": "Barbaadi",
    "ti": "ድለይ",
    "so": "Raadi",
    "ar": "بحث",
    "sw": "Tafuta",
    "fr": "Rechercher"
  },
  "Help": {
    "en": "Help",
    "am": "እርዳታ",
    "om": "Gargaarsa",
    "ti": "ሓገዝ",
    "so": "Caawimaad",
    "ar": "مساعدة",
    "sw": "Msaada",
    "fr": "Aide"
  },
  "Settings": {
    "en": "Settings",
    "am": "ቅንብሮች",
    "om": "Qindaa’inoota",
    "ti": "ቅጥዕታት",
    "so": "Hagaajinta",
    "ar": "الإعدادات",
    "sw": "Mipangilio",
    "fr": "Paramètres"
  },
  "Log in": {
    "en": "Log in",
    "am": "ግባ",
    "om": "Seeni",
    "ti": "እቶ",
    "so": "Gal",
    "ar": "تسجيل الدخول",
    "sw": "Ingia",
    "fr": "Connexion"
  },
  "Log out": {
    "en": "Log out",
    "am": "ውጣ",
    "om": "Ba’i",
    "ti": "ውጻእ",
    "so": "Ka bax",
    "ar": "تسجيل الخروج",
    "sw": "Ondoka",
    "fr": "Déconnexion"
  },
  "Submit": {
    "en": "Submit",
    "am": "አስገባ",
    "om": "Galchi",
    "ti": "ኣእቱ",
    "so": "Geli",
    "ar": "إرسال",
    "sw": "Wasilisha",
    "fr": "Soumettre"
  },
  "Cancel": {
    "en": "Cancel",
    "am": "ሰርዝ",
    "om": "Dhiisi",
    "ti": "ሰርዝ",
    "so": "Jooji",
    "ar": "إلغاء",
    "sw": "Ghairi",
    "fr": "Annuler"
  },
  "Close": {
    "en": "Close",
    "am": "ዝጋ",
    "om": "Cufi",
    "ti": "ዕጸው",
    "so": "Xidh",
    "ar": "إغلاق",
    "sw": "Funga",
    "fr": "Fermer"
  },
  "Save": {
    "en": "Save",
    "am": "አስቀምጥ",
    "om": "Olkaayi",
    "ti": "ኣቐምጥ",
    "so": "Kaydi",
    "ar": "حفظ",
    "sw": "Hifadhi",
    "fr": "Enregistrer"
  },
  "Next": {
    "en": "Next",
    "am": "ቀጣይ",
    "om": "Itti aani",
    "ti": "ቀጻሊ",
    "so": "Xiga",
    "ar": "التالي",
    "sw": "Ifuatayo",
    "fr": "Suivant"
  },
  "Back": {
    "en": "Back",
    "am": "ተመለስ",
    "om": "Duubatti",
    "ti": "ተመለስ",
    "so": "Dib",
    "ar": "رجوع",
    "sw": "Rudi",
    "fr": "Retour"
  },
  "Syllabus": {
    "en": "Syllabus",
    "am": "ስርዓተ-ትምህርት",
    "om": "Silabasii",
    "ti": "ስርዓተ-ትምህርቲ",
    "so": "Manhaja",
    "ar": "المنهج الدراسي",
    "sw": "Muhtasari wa Somo",
    "fr": "Programme"
  },
  "Resources": {
    "en": "Resources",
    "am": "የትምህርት ግብዓቶች",
    "om": "Qabeenyaalee",
    "ti": "ጸጋታት ትምህርቲ",
    "so": "Khayraadka",
    "ar": "الموارد التعليمية",
    "sw": "Nyenzo za masomo",
    "fr": "Ressources"
  },
  // ── Universal Job Searching & Career Marketplace Terminology ──
  "Jobs": {
    "en": "Jobs", "am": "ስራዎች", "om": "Hojiiwwan", "ti": "ስራሕቲ", "so": "Shaqooyinka", "ar": "الوظائف", "sw": "Kazi", "fr": "Emplois"
  },
  "Job Title": {
    "en": "Job Title", "am": "የስራ መደብ", "om": "Mata duree Hojii", "ti": "ናይ ስራሕ መደብ", "so": "Cinwaanka Shaqada", "ar": "المسمى الوظيفي", "sw": "Nafasi ya Kazi", "fr": "Intitulé du poste"
  },
  "Company": {
    "en": "Company", "am": "ድርጅት", "om": "Dhaabbata", "ti": "ትካል", "so": "Shirkadda", "ar": "الشركة", "sw": "Kampuni", "fr": "Entreprise"
  },
  "Location": {
    "en": "Location", "am": "ቦታ", "om": "Bakka", "ti": "ቦታ", "so": "Goobta", "ar": "الموقع", "sw": "Mahali", "fr": "Emplacement"
  },
  "Remote": {
    "en": "Remote", "am": "የርቀት ስራ (Remote)", "om": "Fagoo (Remote)", "ti": "ናይ ርሕቐት ስራሕ (Remote)", "so": "Masaafada (Remote)", "ar": "عن بُعد (Remote)", "sw": "Kazi ya Masafa (Remote)", "fr": "À distance (Remote)"
  },
  "Full-time": {
    "en": "Full-time", "am": "ሙሉ ጊዜ", "om": "Yeroo Guutuu", "ti": "ምሉእ ግዜ", "so": "Waqti Buuxa", "ar": "دوام كامل", "sw": "Muda Kamili", "fr": "Temps plein"
  },
  "Part-time": {
    "en": "Part-time", "am": "የትርፍ ጊዜ", "om": "Yeroo Garaa-garaa", "ti": "ናይ ትርፊ ግዜ", "so": "Waqti Dhiman", "ar": "دوام جزئي", "sw": "Muda wa Sehemu", "fr": "Temps partiel"
  },
  "Contract": {
    "en": "Contract", "am": "የኮንትራት ስራ", "om": "Waliigaltee", "ti": "ናይ ኮንትራት", "so": "Qandaraas", "ar": "عقد", "sw": "Mkataba", "fr": "Contrat"
  },
  "Internship": {
    "en": "Internship", "am": "የልምምድ ስራ (Internship)", "om": "Shaakala Hojii (Internship)", "ti": "ናይ ልምምድ ስራሕ", "so": "Tababar Shaqo (Internship)", "ar": "تدريب عملي (Internship)", "sw": "Mafunzo Kazini (Internship)", "fr": "Stage (Internship)"
  },
  "Apply Now": {
    "en": "Apply Now", "am": "አሁን ያመልክቱ", "om": "Amma Iyyadhaa", "ti": "ሕጂ ኣመልክቱ", "so": "Hadda Codso", "ar": "قدّم الآن", "sw": "Tuma Maombi Sasa", "fr": "Postuler maintenant"
  },
  "Apply": {
    "en": "Apply", "am": "አመልክት", "om": "Iyyadhu", "ti": "ኣመልክት", "so": "Codso", "ar": "تقديم", "sw": "Omba", "fr": "Postuler"
  },
  "Save Job": {
    "en": "Save Job", "am": "ስራ አስቀምጥ", "om": "Hojii Olkaayi", "ti": "ስራሕ ኣቐምጥ", "so": "Kaydi Shaqada", "ar": "حفظ الوظيفة", "sw": "Hifadhi Kazi", "fr": "Enregistrer l'offre"
  },
  "Job Description": {
    "en": "Job Description", "am": "የስራ ዝርዝር መግለጫ", "om": "Ibsa Hojii", "ti": "ናይ ስራሕ መግለጺ", "so": "Faahfaahinta Shaqada", "ar": "الوصف الوظيفي", "sw": "Maelezo ya Kazi", "fr": "Description du poste"
  },
  "Requirements": {
    "en": "Requirements", "am": "መስፈርቶች", "om": "Ulaagaalee", "ti": "ቅድመ-ኩነታት", "so": "Shuruudaha", "ar": "المتطلبات", "sw": "Vigezo na Masharti", "fr": "Exigences"
  },
  "Responsibilities": {
    "en": "Responsibilities", "am": "የስራ ኃላፊነቶች", "om": "Ittigaafatamummaa", "ti": "ሓላፍነታት", "so": "Masuuliyadaha", "ar": "المسؤوليات", "sw": "Majukumu", "fr": "Responsabilités"
  },
  "Qualifications": {
    "en": "Qualifications", "am": "የትምህርት እና የልምድ ዝግጅት", "om": "Ga'umsa Barbaachisu", "ti": "ብቕዓት", "so": "Shahaadooyinka & Khibradda", "ar": "المؤهلات المطلوبة", "sw": "Sifa Zilizohitajika", "fr": "Qualifications"
  },
  "Skills Required": {
    "en": "Skills Required", "am": "የሚያስፈልጉ ክህሎቶች", "om": "Dandeettiiwwan Barbaachisan", "ti": "ዘድልዩ ክእለታት", "so": "Xirfadaha Loo Baahan Yahay", "ar": "المهارات المطلوبة", "sw": "Ujuzi Unaohitajika", "fr": "Compétences requises"
  },
  "Experience": {
    "en": "Experience", "am": "የስራ ልምድ", "om": "Muuxannoo Hojii", "ti": "ናይ ስራሕ ተመኩሮ", "so": "Khibrad", "ar": "الخبرة", "sw": "Uzoefu", "fr": "Expérience"
  },
  "Salary": {
    "en": "Salary", "am": "ደመወዝ / ክፍያ", "om": "Mindaa / Kaffaltii", "ti": "መሃያ", "so": "Mushahar", "ar": "الراتب", "sw": "Mshahara", "fr": "Salaire"
  },
  "Compensation": {
    "en": "Compensation", "am": "ጥቅማጥቅም እና ክፍያ", "om": "Kaffaltii fi Faayidaalee", "ti": "ክፍሊትን ረብሓታትን", "so": "Gunnooyinka", "ar": "التعويضات والمزايا", "sw": "Fidia na Marupurupu", "fr": "Rémunération"
  },
  "Deadline": {
    "en": "Deadline", "am": "የማመልከቻ ማብቂያ ቀን", "om": "Guyyaa Dhumaa", "ti": "መዛዘሚ ዕለት", "so": "Waqtiga kama dambaysta ah", "ar": "الموعد النهائي", "sw": "Tarehe ya Mwisho", "fr": "Date limite"
  },
  "Posted": {
    "en": "Posted", "am": "የተለጠፈበት ቀን", "om": "Kan Maxxanfame", "ti": "እተለጠፈሉ", "so": "La Daabacay", "ar": "تاريخ النشر", "sw": "Imechapishwa", "fr": "Publié le"
  },
  "Search Jobs": {
    "en": "Search Jobs", "am": "ስራዎችን ፈልግ", "om": "Hojiiwwan Barbaadi", "ti": "ስራሕቲ ድለይ", "so": "Raadi Shaqooyin", "ar": "ابحث عن وظائف", "sw": "Tafuta Kazi", "fr": "Rechercher des emplois"
  },
  "All Jobs": {
    "en": "All Jobs", "am": "ሁሉም ስራዎች", "om": "Hojiiwwan Hundumaa", "ti": "ኩሎም ስራሕቲ", "so": "Dhammaan Shaqooyinka", "ar": "جميع الوظائف", "sw": "Kazi Zote", "fr": "Tous les emplois"
  },
  "Filter": {
    "en": "Filter", "am": "አጣራ (Filter)", "om": "Calali (Filter)", "ti": "ሕረ (Filter)", "so": "Shaandhee (Filter)", "ar": "تصفية (Filter)", "sw": "Chuja (Filter)", "fr": "Filtrer"
  },
  // ── Universal Learning & Course Platform Terminology ──
  "Course": {
    "en": "Course", "am": "ኮርስ / ትምህርት", "om": "Koorsii", "ti": "ኮርስ", "so": "Koorsada", "ar": "الدورة التدريبية", "sw": "Kozi", "fr": "Cours"
  },
  "Lesson": {
    "en": "Lesson", "am": "ትምህርት (Lesson)", "om": "Barnoota", "ti": "ትምህርቲ", "so": "Casharka", "ar": "الدرس", "sw": "Somo", "fr": "Leçon"
  },
  "Assignment": {
    "en": "Assignment", "am": "የተግባር ስራ (Assignment)", "om": "Hojii Manneenii (Assignment)", "ti": "ዕዮ ገዛ", "so": "Shaqo-guri (Assignment)", "ar": "واجب دراسي", "sw": "Kazi ya Mradi (Assignment)", "fr": "Devoir"
  },
  "Quiz": {
    "en": "Quiz", "am": "ፈተና / ጥያቄዎች (Quiz)", "om": "Gaaffilee Madaallii (Quiz)", "ti": "ፈተና (Quiz)", "so": "Kedis (Quiz)", "ar": "اختبار قصير (Quiz)", "sw": "Jaribio (Quiz)", "fr": "Quiz"
  },
  "Certificate": {
    "en": "Certificate", "am": "የምስክር ወረቀት", "om": "Waraqaa Ragaa", "ti": "ናይ ምስክር ወረቐት", "so": "Shahaado", "ar": "شهادة إتمام", "sw": "Cheti cha Kuhitimu", "fr": "Certificat"
  },
  "Completed": {
    "en": "Completed", "am": "ተጠናቋል", "om": "Xumurameera", "ti": "ተወዲኡ", "so": "Waa la Dhameeyay", "ar": "مكتمل", "sw": "Imekamilika", "fr": "Terminé"
  },
  "In Progress": {
    "en": "In Progress", "am": "በሂደት ላይ ያለ", "om": "Adeemsa Irra Jira", "ti": "ኣብ ከይዲ ዘሎ", "so": "Wuu Socdaa", "ar": "قيد التقدم", "sw": "Inaendelea", "fr": "En cours"
  },
  "Not Started": {
    "en": "Not Started", "am": "አልተጀመረም", "om": "Hin Jalqabamne", "ti": "ኣይተጀመረን", "so": "Lama Bilaabin", "ar": "لم يبدأ بعد", "sw": "Haijaanza", "fr": "Non commencé"
  },
  "Enroll Now": {
    "en": "Enroll Now", "am": "አሁን ይመዝገቡ", "om": "Amma Galmaa'aa", "ti": "ሕጂ ተመዝገቡ", "so": "Hadda Isdiiwaangeli", "ar": "سجّل الآن", "sw": "Jiandikishe Sasa", "fr": "S'inscrire maintenant"
  },
  "Question": {
    "en": "Question", "am": "ጥያቄ", "om": "Gaaffii", "ti": "ሕቶ", "so": "Su'aal", "ar": "سؤال", "sw": "Swali", "fr": "Question"
  },
  "Score": {
    "en": "Score", "am": "ውጤት", "om": "Qabxii", "ti": "ውጽኢት", "so": "Dhibco", "ar": "الدرجة", "sw": "Alama", "fr": "Score"
  },
  "Grade": {
    "en": "Grade", "am": "ደረጃ", "om": "Sadarkaa", "ti": "ደረጃ", "so": "Darajo", "ar": "التقدير", "sw": "Gredi", "fr": "Note"
  },
  "Correct": {
    "en": "Correct", "am": "ትክክል", "om": "Sirrii", "ti": "ትኽክል", "so": "Sax", "ar": "صحيح", "sw": "Sahihi", "fr": "Correct"
  },
  "Incorrect": {
    "en": "Incorrect", "am": "ስህተት", "om": "Dogoggora", "ti": "ጌጋ", "so": "Khalad", "ar": "غير صحيح", "sw": "Si sahihi", "fr": "Incorrect"
  },
  "Try Again": {
    "en": "Try Again", "am": "እንደገና ይሞክሩ", "om": "Ammas Yaalaa", "ti": "ደጊምኩም ፈትኑ", "so": "Isku day mar kale", "ar": "حاول مرة أخرى", "sw": "Jaribu tena", "fr": "Réessayer"
  },
  "Submit Answer": {
    "en": "Submit Answer", "am": "መልስ አስገባ", "om": "Deebii Galchaa", "ti": "መልሲ ኣእትዉ", "so": "Geli Jawaabta", "ar": "إرسال الإجابة", "sw": "Wasilisha jibu", "fr": "Soumettre la réponse"
  },
  "Lab Instructions": {
    "en": "Lab Instructions", "am": "የተግባር ላብ መመሪያዎች", "om": "Qajeelfama Laabii Hojii", "ti": "ናይ ላብ መምርሒታት", "so": "Tilmaamaha Shaybaarka", "ar": "تعليمات المختبر العملي", "sw": "Maagizo ya maabara ya vitendo", "fr": "Instructions du laboratoire"
  },
  "Grading Rubric": {
    "en": "Grading Rubric", "am": "የውጤት መስጫ መስፈርት", "om": "Ulaagaa Madaallii Qabxii", "ti": "ናይ ምዘና መምዘኒ", "so": "Halbeegga Qiimeynta", "ar": "معايير التقييم", "sw": "Vigezo vya tathmini", "fr": "Grille d'évaluation"
  },
  "Criteria": {
    "en": "Criteria", "am": "መስፈርቶች", "om": "Ulaagaalee", "ti": "መምዘኒታት", "so": "Shuruudaha", "ar": "المعايير", "sw": "Vigezo", "fr": "Critères"
  },
  "Weight": {
    "en": "Weight", "am": "ክብደት", "om": "Ulfaatina", "ti": "ክብደት", "so": "Miisaanka", "ar": "الوزن النسبي", "sw": "Uzito wa alama", "fr": "Pondération"
  },
  "Transcript": {
    "en": "Transcript", "am": "የንግግር ጽሁፍ", "om": "Waraabbii Sagalee", "ti": "ናይ ድምጺ ጽሑፍ", "so": "Qoraalka Codka", "ar": "النص المفرّغ", "sw": "Nakala ya sauti", "fr": "Transcription"
  },
  "Summary": {
    "en": "Summary", "am": "ማጠቃለያ", "om": "Goolaba", "ti": "ጽሟቕ", "so": "Soo koobid", "ar": "الملخص", "sw": "Muhtasari", "fr": "Résumé"
  },
  "Step": {
    "en": "Step", "am": "ደረጃ", "om": "Tarkaanfii", "ti": "ስጉምቲ", "so": "Tallaabo", "ar": "خطوة", "sw": "Hatua", "fr": "Étape"
  },
  "Estimated Time": {
    "en": "Estimated Time", "am": "የሚፈጀው ጊዜ", "om": "Yeroo Tilmaamame", "ti": "ዝግመት ግዜ", "so": "Waqtiga lagu qiyaasay", "ar": "الوقت المقدر", "sw": "Muda uliokadiriwa", "fr": "Durée estimée"
  },
  "Overview": {
    "en": "Overview", "am": "አጠቃላይ እይታ", "om": "Ibsa Waliigalaa", "ti": "ሓፈሻዊ ትሕዝቶ", "so": "Dulmar guud", "ar": "نظرة عامة", "sw": "Muhtasari wa jumla", "fr": "Vue d'ensemble"
  },
  "Prerequisites": {
    "en": "Prerequisites", "am": "ቅድመ ሁኔታዎች", "om": "Ulaagaalee Duraa", "ti": "ቅድመ-ኩነታት", "so": "Shuruudaha ka horreeya", "ar": "المتطلبات الأساسية", "sw": "Mahitaji ya awali", "fr": "Prérequis"
  },
  "Learning Objectives": {
    "en": "Learning Objectives", "am": "የትምህርቱ ግቦች", "om": "Kaayyolee Barnootaa", "ti": "ናይ ትምህርቲ ሸቶታት", "so": "Ujeedooyinka Waxbarashada", "ar": "الأهداف التعليمية", "sw": "Malengo ya mafunzo", "fr": "Objectifs d'apprentissage"
  },
  "Key Takeaways": {
    "en": "Key Takeaways", "am": "ዋና ዋና ነጥቦች", "om": "Qabxiilee Ijoo", "ti": "ቀንድታት ነጥብታት", "so": "Qodobada Muhiimka ah", "ar": "النقاط الرئيسية المستفادة", "sw": "Mambo makuu ya kuzingatia", "fr": "Points clés à retenir"
  },
  "Knowledge Check": {
    "en": "Knowledge Check", "am": "የእውቀት ፍተሻ", "om": "Hubannoo Madaaluu", "ti": "ናይ ፍልጠት ምፍታሽ", "so": "Hubinta Aqoonta", "ar": "التحقق من الفهم", "sw": "Upimaji wa maarifa", "fr": "Contrôle des connaissances"
  }
};

  /* ── 2d. Dynamic DOM Content Translation Engine ───────────────────────── */
  const originalTextMap = new WeakMap();
  const DYN_TRANS_PREFIX = 'savanna_dyn_trans_';
  const dynamicTransCache = {}; // In-memory dynamic translation cache: { am: { "Hello": "ሰላም" }, ... }
  const pendingBatchStrings = {}; // Pending unseen strings per language: { am: Set(), ... }
  const attemptedBatchStrings = {}; // Strings already dispatched to avoid duplicate network hammering
  const inFlightTranslations = {}; // In-flight request guards per language: { am: true, ... }
  let translateDebounceTimer = null;

  function normalizeText(t) {
    return (t || '').replace(/\s+/g, ' ').trim();
  }

  function getDynamicTrans(lang, text) {
    if (!text) return null;
    if (!dynamicTransCache[lang]) {
      dynamicTransCache[lang] = {};
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(DYN_TRANS_PREFIX + lang);
          if (raw) Object.assign(dynamicTransCache[lang], JSON.parse(raw));
        }
      } catch (_) {}
    }
    const cache = dynamicTransCache[lang];
    if (cache[text]) return cache[text];
    const norm = normalizeText(text);
    if (cache[norm]) return cache[norm];
    return null;
  }

  function setDynamicTransBatch(lang, map) {
    if (!dynamicTransCache[lang]) {
      dynamicTransCache[lang] = {};
    }
    for (const [k, v] of Object.entries(map || {})) {
      if (k && v) {
        dynamicTransCache[lang][k] = v;
        dynamicTransCache[lang][normalizeText(k)] = v;
      }
    }
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(DYN_TRANS_PREFIX + lang, JSON.stringify(dynamicTransCache[lang]));
      }
    } catch (_) {}
  }

  function getTranslateApiUrl() {
    let base = '';
    if (typeof window !== 'undefined' && window.SavannaConfig && window.SavannaConfig.apiUrl) {
      base = window.SavannaConfig.apiUrl;
    } else if (currentScript && currentScript.dataset && currentScript.dataset.apiUrl) {
      base = currentScript.dataset.apiUrl;
    } else if (currentScript && currentScript.src) {
      try {
        base = new URL(currentScript.src).origin;
      } catch (_) {}
    }
    if (!base && typeof window !== 'undefined' && window.location) {
      base = (window.location.port === '8080') ? 'http://localhost:8000' : window.location.origin;
    }
    base = (base || '').replace(/\/$/, '');
    const cleanBase = base.replace(/\/api$/, '');
    return cleanBase + '/translate';
  }

  function detectHostSiteType() {
    if (typeof window === 'undefined') return 'general';
    // 1. Explicit configuration from window.SavannaConfig or script attribute
    if (window.SavannaConfig && window.SavannaConfig.siteType) {
      const explicit = String(window.SavannaConfig.siteType).toLowerCase();
      if (['jobs', 'learning', 'general'].includes(explicit)) return explicit;
    }
    const currentScript = (typeof document !== 'undefined') ? (document.currentScript || document.querySelector('script[data-site-type]')) : null;
    if (currentScript && currentScript.dataset && currentScript.dataset.siteType) {
      const scriptType = currentScript.dataset.siteType.toLowerCase();
      if (['jobs', 'learning', 'general'].includes(scriptType)) return scriptType;
    }

    // 2. Automated structural and semantic DOM inspection
    if (typeof document === 'undefined' || !document.body) return 'general';
    const doc = document;

    // Job Searching site markers
    const hasJobElements = !!doc.querySelector(
      '#job-details, .job-details, .job-description, .job-card, .job-listing, .job-item, ' +
      '.vacancy-card, [data-job-id], [data-job-content], .career-portal, .job-search-results, ' +
      '#jobs-list, .application-modal'
    );
    const pageTitle = (doc.title || '').toLowerCase();
    const metaKeywords = (doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '').toLowerCase();
    const metaDesc = (doc.querySelector('meta[name="description"]')?.getAttribute('content') || '').toLowerCase();

    if (hasJobElements || /job|career|vacancy|hiring|remote work|recruitment/i.test(pageTitle + ' ' + metaKeywords + ' ' + metaDesc)) {
      return 'jobs';
    }

    // Learning / Course platform markers
    const hasLearningElements = !!doc.querySelector(
      '#curriculum_navigation_content, .formatted-content, .savanna-styles, .course-content, ' +
      '.lesson-content, .curriculum-container, .module-body, [data-lesson-content], .quiz-container, ' +
      '.assignment-content, #student-current-curriculum'
    );
    if (hasLearningElements || /course|lesson|curriculum|module|syllabus|academy|learn|student/i.test(pageTitle + ' ' + metaKeywords + ' ' + metaDesc)) {
      return 'learning';
    }

    return 'general';
  }

  function scheduleBatchTranslation(lang) {
    if (lang === 'en' || !pendingBatchStrings[lang] || pendingBatchStrings[lang].size === 0) return;
    if (translateDebounceTimer) {
      clearTimeout(translateDebounceTimer);
    }
    translateDebounceTimer = setTimeout(() => {
      dispatchBatchTranslation(lang);
    }, 50);
  }

  async function dispatchBatchTranslation(lang) {
    if (lang === 'en') return;
    if (!pendingBatchStrings[lang] || pendingBatchStrings[lang].size === 0) return;
    if (inFlightTranslations[lang]) return;

    // Process in batches of up to 75 strings per request for maximum parallel backend speed
    const allPending = Array.from(pendingBatchStrings[lang]);
    const stringsToTranslate = allPending.slice(0, 75);
    if (!attemptedBatchStrings[lang]) attemptedBatchStrings[lang] = new Set();
    stringsToTranslate.forEach(s => {
      pendingBatchStrings[lang].delete(s);
      attemptedBatchStrings[lang].add(s);
    });

    if (stringsToTranslate.length === 0) return;

    inFlightTranslations[lang] = true;
    let dispatchedInBatch = false;
    const url = getTranslateApiUrl();

    try {
      const fetchFn = (typeof window !== 'undefined' && window.fetch) ? window.fetch : (typeof fetch === 'function' ? fetch : null);
      if (fetchFn) {
        const siteType = detectHostSiteType();
        const resp = await fetchFn(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            strings: stringsToTranslate,
            target_lang: lang,
            source_lang: 'en',
            site_type: siteType,
            domain: (typeof window !== 'undefined' && window.location) ? window.location.hostname : 'unknown'
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data && data.translations && typeof data.translations === 'object') {
            setDynamicTransBatch(lang, data.translations);
            if (currentLang === lang) {
              translateHostPage(lang);
              if (typeof window !== 'undefined') {
                const Evt = window.CustomEvent || (typeof CustomEvent !== 'undefined' ? CustomEvent : null);
                if (Evt) {
                  dispatchedInBatch = true;
                  window.dispatchEvent(new Evt('savanna:page_translated', {
                    detail: {
                      lang,
                      count: Object.keys(data.translations).length,
                      remaining: pendingBatchStrings[lang] ? pendingBatchStrings[lang].size : 0
                    }
                  }));
                }
              }
            }
          }
        }
      }
    } catch (err) {
      // Graceful offline/network fallback
    } finally {
      inFlightTranslations[lang] = false;
      // Continue draining pending queue until 100% of course content and host page is translated
      if (pendingBatchStrings[lang] && pendingBatchStrings[lang].size > 0 && currentLang === lang) {
        setTimeout(() => {
          dispatchBatchTranslation(lang);
        }, 40);
      } else if (!dispatchedInBatch && currentLang === lang && (!pendingBatchStrings[lang] || pendingBatchStrings[lang].size === 0)) {
        if (typeof window !== 'undefined') {
          const Evt = window.CustomEvent || (typeof CustomEvent !== 'undefined' ? CustomEvent : null);
          if (Evt) {
            window.dispatchEvent(new Evt('savanna:page_translated', {
              detail: {
                lang,
                count: 0,
                remaining: 0
              }
            }));
          }
        }
      }
    }
  }

  function translateHostPage(lang) {
    if (!lang || !ALL_LANGUAGES.includes(lang)) lang = 'en';

    // 1. Update document element language and direction (RTL for Arabic)
    if (document.documentElement) {
      document.documentElement.lang = lang;
      document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    }

    if (!document.body) return;

    // 2. TreeWalker over non-internal text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          if (parent.closest(
            '#savanna-a11y-modal-backdrop, #savanna-a11y-trigger, #savanna-trigger, #savanna-modal-backdrop, ' +
            '#sa11y-reading-ruler, #sa11y-motor-toolbar, #savanna-a11y-announcer, #sa11y-live-region, ' +
            '#sa11y-shortcuts-backdrop, script, style, code, pre, kbd, samp, var'
          )) {
            return NodeFilter.FILTER_REJECT;
          }
          const noTransEl = parent.closest('[translate="no"], .notranslate, [data-sa11y-ignore], [data-no-translate]');
          if (noTransEl && noTransEl !== document.body && noTransEl !== document.documentElement) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    function getContentPriorityScore(node) {
      const parent = node.parentElement;
      if (!parent) return 0;
      let score = 0;

      // 1. Core Semantic Main / Article Containers
      if (parent.closest('main, article, [role="main"], [role="article"], [role="feed"]')) score += 50;

      // 2. Learning Platform primary content selectors
      if (parent.closest(
        '#curriculum_navigation_content, .formatted-content, .savanna-styles, .course-content, ' +
        '.lesson-content, .curriculum-container, .module-body, [data-lesson-content], .quiz-container, ' +
        '.assignment-details, .learning-material, .reading-content, .lab-instructions, .rubric-table, ' +
        '.knowledge-check, .question-card, .transcript-card, .activity-step, .quiz-stem, .option-label, ' +
        '.quiz-feedback, .objectives-card, .table-rubric'
      )) {
        score += 100;
      }

      // 3. Job Searching & Career Marketplace primary content selectors
      if (parent.closest(
        '#job-details, .job-details, .job-description, .job-card, .job-listing, .job-post, ' +
        '.vacancy-card, [data-job-id], [data-job-content], .career-item, .posting-requirements, ' +
        '.job-search-results, .application-modal, .candidate-portal'
      )) {
        score += 100;
      }

      // 4. Heading elements carry high hierarchical orientation value
      if (parent.closest('h1, h2, h3, h4, h5, h6, [role="heading"]')) score += 30;

      // 5. Assessments, Question Stems & Interactive Controls
      if (parent.closest('legend, .question-text, .quiz-stem, label[for], .step-number, .badge')) score += 35;

      // 6. Rubrics & tabular learning data
      if (parent.closest('th, td, .rubric-header, .criterion-title')) score += 25;

      // 7. Dense text nodes (longer paragraphs or requirements specs)
      const textLen = (node.nodeValue || '').trim().length;
      if (textLen >= 40) score += 20;
      if (textLen >= 120) score += 20;

      // 8. Deprioritize chrome, footers, breadcrumbs, cookie notices
      if (parent.closest('nav, header, footer, .sidebar, .navbar, .breadcrumb, .social-share, .cookie-banner, .footer')) {
        score -= 40;
      }

      return score;
    }

    // Universal prioritization: Sort highest priority educational and career content to index 0
    textNodes.sort((a, b) => {
      const scoreA = getContentPriorityScore(a);
      const scoreB = getContentPriorityScore(b);
      return scoreB - scoreA;
    });

    for (const node of textNodes) {
      if (!originalTextMap.has(node)) {
        originalTextMap.set(node, node.nodeValue);
      }
      const orig = originalTextMap.get(node);

      if (lang === 'en') {
        node.nodeValue = orig;
        continue;
      }

      const trimmed = orig.trim();
      const leadingWs = orig.match(/^\s*/)[0];
      const trailingWs = orig.match(/\s*$/)[0];
      const normTrimmed = normalizeText(trimmed);

      // Exact match in static dictionary
      if (DOM_TRANSLATIONS[trimmed] && DOM_TRANSLATIONS[trimmed][lang]) {
        node.nodeValue = leadingWs + DOM_TRANSLATIONS[trimmed][lang] + trailingWs;
        continue;
      }
      if (DOM_TRANSLATIONS[normTrimmed] && DOM_TRANSLATIONS[normTrimmed][lang]) {
        node.nodeValue = leadingWs + DOM_TRANSLATIONS[normTrimmed][lang] + trailingWs;
        continue;
      }

      // Match in dynamic translation cache (exact or normalized)
      const cached = getDynamicTrans(lang, trimmed);
      if (cached) {
        node.nodeValue = leadingWs + cached + trailingWs;
        continue;
      }

      // Pattern: Week N
      const weekMatch = trimmed.match(/^Week\s+(\d+)$/i);
      if (weekMatch) {
        const n = weekMatch[1];
        const patterns = {
          am: 'ሳምንት ' + n,
          om: 'Torban ' + n,
          ti: 'ሰሙን ' + n,
          so: 'Toddobaadka ' + n,
          ar: 'الأسبوع ' + n,
          sw: 'Wiki ' + n,
          fr: 'Semaine ' + n
        };
        if (patterns[lang]) {
          node.nodeValue = leadingWs + patterns[lang] + trailingWs;
          continue;
        }
      }

      // Pattern: Module N
      const modMatch = trimmed.match(/^Module\s+(\d+)$/i);
      if (modMatch) {
        const n = modMatch[1];
        const patterns = {
          am: 'ሞጁል ' + n,
          om: 'Mojuulii ' + n,
          ti: 'ሞጁል ' + n,
          so: 'Cutubka ' + n,
          ar: 'الوحدة ' + n,
          sw: 'Moduli ' + n,
          fr: 'Module ' + n
        };
        if (patterns[lang]) {
          node.nodeValue = leadingWs + patterns[lang] + trailingWs;
          continue;
        }
      }

      // Substring phrase replacement
      let replacedText = orig;
      let didReplace = false;
      for (const [key, map] of Object.entries(DOM_TRANSLATIONS)) {
        if (key.length >= 4 && map[lang] && replacedText.includes(key)) {
          replacedText = replacedText.split(key).join(map[lang]);
          didReplace = true;
        }
      }
      if (didReplace) {
        node.nodeValue = replacedText;
        continue;
      }

      // Not found in static dictionary or cache: Queue for dynamic batch translation
      if (/[a-zA-Z\u00C0-\u024F]/.test(trimmed)) {
        if (!attemptedBatchStrings[lang] || !attemptedBatchStrings[lang].has(trimmed)) {
          if (!pendingBatchStrings[lang]) pendingBatchStrings[lang] = new Set();
          pendingBatchStrings[lang].add(trimmed);
        }
      }
    }

    // Update aria-labels and placeholder attributes
    const interactiveEls = document.querySelectorAll('[aria-label], input[placeholder]');
    interactiveEls.forEach(el => {
      if (el.closest(
        '#savanna-a11y-modal-backdrop, #savanna-a11y-trigger, #savanna-trigger, #savanna-modal-backdrop, ' +
        '#sa11y-reading-ruler, #sa11y-motor-toolbar, #savanna-a11y-announcer, #sa11y-live-region, #sa11y-shortcuts-backdrop, ' +
        'script, style, code, pre, kbd, samp, var'
      )) {
        return;
      }
      const noTransInteractive = el.closest('[translate="no"], .notranslate, [data-sa11y-ignore], [data-no-translate]');
      if (noTransInteractive && noTransInteractive !== document.body && noTransInteractive !== document.documentElement) {
        return;
      }

      if (el.hasAttribute('aria-label')) {
        if (!el.dataset.sa11yOrigAria) el.dataset.sa11yOrigAria = el.getAttribute('aria-label');
        const origAria = el.dataset.sa11yOrigAria.trim();
        if (lang === 'en') {
          el.setAttribute('aria-label', el.dataset.sa11yOrigAria);
        } else if (DOM_TRANSLATIONS[origAria] && DOM_TRANSLATIONS[origAria][lang]) {
          el.setAttribute('aria-label', DOM_TRANSLATIONS[origAria][lang]);
        } else if (getDynamicTrans(lang, origAria)) {
          el.setAttribute('aria-label', getDynamicTrans(lang, origAria));
        } else if (/[a-zA-Z\u00C0-\u024F]/.test(origAria)) {
          if (!attemptedBatchStrings[lang] || !attemptedBatchStrings[lang].has(origAria)) {
            if (!pendingBatchStrings[lang]) pendingBatchStrings[lang] = new Set();
            pendingBatchStrings[lang].add(origAria);
          }
        }
      }

      if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
        if (!el.dataset.sa11yOrigPlaceholder) el.dataset.sa11yOrigPlaceholder = el.getAttribute('placeholder');
        const origPh = el.dataset.sa11yOrigPlaceholder.trim();
        if (lang === 'en') {
          el.setAttribute('placeholder', el.dataset.sa11yOrigPlaceholder);
        } else if (DOM_TRANSLATIONS[origPh] && DOM_TRANSLATIONS[origPh][lang]) {
          el.setAttribute('placeholder', DOM_TRANSLATIONS[origPh][lang]);
        } else if (getDynamicTrans(lang, origPh)) {
          el.setAttribute('placeholder', getDynamicTrans(lang, origPh));
        } else if (/[a-zA-Z\u00C0-\u024F]/.test(origPh)) {
          if (!attemptedBatchStrings[lang] || !attemptedBatchStrings[lang].has(origPh)) {
            if (!pendingBatchStrings[lang]) pendingBatchStrings[lang] = new Set();
            pendingBatchStrings[lang].add(origPh);
          }
        }
      }
    });

    if (lang !== 'en') {
      if (pendingBatchStrings[lang] && pendingBatchStrings[lang].size > 0) {
        scheduleBatchTranslation(lang);
      } else if (!inFlightTranslations[lang]) {
        // All strings already translated from cache or static dict! Dispatch completion immediately
        if (typeof window !== 'undefined') {
          const Evt = window.CustomEvent || (typeof CustomEvent !== 'undefined' ? CustomEvent : null);
          if (Evt) {
            window.dispatchEvent(new Evt('savanna:page_translated', {
              detail: {
                lang,
                count: 0,
                remaining: 0
              }
            }));
          }
        }
      }
    }
  }


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
      step1Title: 'Choose your preferred language',
      step1Subtitle: 'Select how you want the platform to communicate with you. The page content updates instantly.',
      stepBadge1: 'Step 1 of 2: Language Preference',
      stepBadge2: 'Step 2 of 2: Accessibility Accommodations',
      btnNextStep: 'Next: Choose Accommodations ➔',
      btnBackStep: '⬅️ Back to Languages',
      tabLanguages: '1. Language',
      tabAccommodations: '2. Accommodations',
      optStandardTitle: 'Standard Interface (No accommodations)',
      optStandardDesc: 'Standard layout and styling without additional assistive tools enabled.',
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
      step1Title: "የመማሪያ ቋንቋዎን ይምረጡ",
      step1Subtitle: "መድረኩ ለእርስዎ የሚቀርብበትን ቋንቋ ይምረጡ። የገጹ ይዘት ወዲያውኑ ይቀየራል።",
      stepBadge1: "ደረጃ 1 ከ 2፡ የቋንቋ ምርጫ",
      stepBadge2: "ደረጃ 2 ከ 2፡ የተደራሽነት ፍላጎቶች",
      btnNextStep: "ቀጣይ፡ የተደራሽነት ምርጫዎች ➔",
      btnBackStep: "⬅️ ወደ ቋንቋዎች ተመለስ",
      tabLanguages: "1. ቋንቋ",
      tabAccommodations: "2. የተደራሽነት አማራጮች",
      optStandardTitle: "መደበኛ እይታ (ልዩ ማስተካከያ አያስፈልገኝም)",
      optStandardDesc: "መደበኛ የገጽ ገጽታና ፊደላት ያለ ተጨማሪ አጋዥ መሳሪያዎች።",
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
      step1Title: "Afaan ittiin barachuu barbaaddan filadhaa",
      step1Subtitle: "Haala platformiin isiniif dhiyaatu filadhaa. Qabiyyichi battalumatti jijjiirama.",
      stepBadge1: "Sadarkaa 1ffaa 2 keessaa: Filannoo Afaanii",
      stepBadge2: "Sadarkaa 2ffaa 2 keessaa: Deeggarsa Qaqqabiinsaa",
      btnNextStep: "Itti fufi: Qaqqabiinsa Filadhu ➔",
      btnBackStep: "⬅️ Gara Afaanotaatti Deebi’i",
      tabLanguages: "1. Afaan",
      tabAccommodations: "2. Qaqqabiinsa",
      optStandardTitle: "Muuxannoo Idilee (Madaqsuu hin barbaadu)",
      optStandardDesc: "Haala dhiyaannaa fi qubee idilee meeshaalee gargaarsaa dabalataa malee.",
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
      step1Title: "ትመርጽዎ ናይ ትምህርቲ ቋንቋ ምረጹ",
      step1Subtitle: "እቲ መድረኽ ብኸመይ ክቐርበልኩም ከም እትደልዩ ምረጹ። ትሕዝቶኡ ብኡንብኡ ይቕየር።",
      stepBadge1: "ደረጃ 1 ካብ 2፡ ናይ ቋንቋ ምርጫ",
      stepBadge2: "ደረጃ 2 ካብ 2፡ ናይ ተበጻሕነት ምምችቻው",
      btnNextStep: "ቀጽል፡ ናይ ተበጻሕነት ምርጫታት ➔",
      btnBackStep: "⬅️ ናብ ቋንቋታት ተመለስ",
      tabLanguages: "1. ቋንቋ",
      tabAccommodations: "2. ተበጻሕነት",
      optStandardTitle: "ስሩዕ ተመክሮ (ፍሉይ ምምችቻው ኣየድልየንን)",
      optStandardDesc: "ስሩዕ ቅርጺ ገጽን ፊደላትን ብዘይ ተወሳኺ ናይ ሓገዝ መሳርሒታት።",
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
      step1Title: "Dooro luuqadda aad doorbiddo",
      step1Subtitle: "Dooro sida madashu kuula xidhiidhi lahayd. Nuxurka boggu isla markiiba wuu isbeddelayaa.",
      stepBadge1: "Tallaabada 1 ee 2: Xulashada Luuqadda",
      stepBadge2: "Tallaabada 2 ee 2: Fududeynta Helitaanka",
      btnNextStep: "Xiga: Dooro Fududeynta ➔",
      btnBackStep: "⬅️ Ku noqo Luuqadaha",
      tabLanguages: "1. Luuqadda",
      tabAccommodations: "2. Fududeynta",
      optStandardTitle: "Khibrad Caadi ah (Uma baahna fududeyn)",
      optStandardDesc: "Qaabka caadiga ah iyada oo aan la shidin qalab dheeraad ah.",
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
      step1Title: "اختر لغتك المفضلة للتعلم",
      step1Subtitle: "حدد كيف تريد للمنصة أن تتواصل معك. يتغير محتوى الصفحة على الفور.",
      stepBadge1: "الخطوة 1 من 2: تفضيل اللغة",
      stepBadge2: "الخطوة 2 من 2: التسهيلات التيسيرية وإمكانية الوصول",
      btnNextStep: "التالي: خيارات إمكانية الوصول ➔",
      btnBackStep: "⬅️ الرجوع إلى اللغات",
      tabLanguages: "1. اللغة",
      tabAccommodations: "2. التسهيلات التيسيرية",
      optStandardTitle: "واجهة قياسية متوازنة (دون تسهيلات إضافية)",
      optStandardDesc: "التصميم والخطوط القياسية دون تفعيل أدوات مساعدة إضافية.",
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
      step1Title: "Chagua lugha unayopendelea",
      step1Subtitle: "Chagua jinsi jukwaa linavyopaswa kuwasiliana nawe. Maudhui ya ukurasa hubadilika mara moja.",
      stepBadge1: "Hatua ya 1 ya 2: Mapendeleo ya Lugha",
      stepBadge2: "Hatua ya 2 ya 2: Marekebisho ya Ufikiaji",
      btnNextStep: "Ifuatayo: Chagua Marekebisho ➔",
      btnBackStep: "⬅️ Rudi kwenye Lugha",
      tabLanguages: "1. Lugha",
      tabAccommodations: "2. Marekebisho",
      optStandardTitle: "Muonekano wa Kawaida (Bila marekebisho)",
      optStandardDesc: "Mpangilio na maandishi ya kawaida bila zana za ziada za usaidizi.",
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
      step1Title: "Choisissez votre langue d’apprentissage",
      step1Subtitle: "Sélectionnez la langue d’interaction. Le contenu de la page s’adapte instantanément.",
      stepBadge1: "Étape 1 sur 2 : Préférence de langue",
      stepBadge2: "Étape 2 sur 2 : Aménagements d’accessibilité",
      btnNextStep: "Suivant : Choisir les aménagements ➔",
      btnBackStep: "⬅️ Retour aux langues",
      tabLanguages: "1. Langue",
      tabAccommodations: "2. Aménagements",
      optStandardTitle: "Interface standard (aucun aménagement)",
      optStandardDesc: "Mise en page et typographie par défaut sans outils d’assistance activés.",
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
  let currentStep = 1; // 1: Language Selection, 2: Accommodations

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
            <div class="sa11y-header-top">
              <span id="sa11y-step-badge" class="sa11y-step-pill">${currentStep === 1 ? t.stepBadge1 : t.stepBadge2}</span>
            </div>
            <h2 id="sa11y-modal-title">
              <span id="sa11y-modal-icon" aria-hidden="true">${currentStep === 1 ? '🌐' : '♿'}</span>
              <span class="txt-title">${currentStep === 1 ? t.step1Title : t.modalTitle}</span>
            </h2>
            <p id="sa11y-modal-desc">${currentStep === 1 ? t.step1Subtitle : t.modalSubtitle}</p>
          </div>
          <button type="button" id="sa11y-lang-btn" class="sa11y-lang-switch" aria-label="Toggle language">
            ${t.langToggle}
          </button>
        </div>

        <!-- Wizard Step Tabs for direct navigation -->
        <div class="sa11y-wizard-tabs" role="tablist" aria-label="Onboarding Steps">
          <button type="button" role="tab" id="sa11y-tab-step1" class="sa11y-tab ${currentStep === 1 ? 'sa11y-tab-active' : ''}" aria-selected="${currentStep === 1}">
            ${t.tabLanguages}
          </button>
          <button type="button" role="tab" id="sa11y-tab-step2" class="sa11y-tab ${currentStep === 2 ? 'sa11y-tab-active' : ''}" aria-selected="${currentStep === 2}">
            ${t.tabAccommodations}
          </button>
        </div>

        <div class="sa11y-modal-body">
          <!-- Step 1: Language Selection Panel -->
          <div id="sa11y-step-1-panel" class="sa11y-step-panel" ${currentStep === 1 ? '' : 'hidden'} role="region" aria-label="Language options">
            <div class="sa11y-lang-grid" role="radiogroup" aria-label="Choose speaking language">
              ${LANGUAGE_OPTIONS.map(opt => `
                <button type="button" role="radio" class="sa11y-lang-card ${opt.code === currentLang ? 'sa11y-selected' : ''}" data-lang="${opt.code}" aria-checked="${opt.code === currentLang}">
                  <div class="sa11y-lang-badge-wrap">
                    ${opt.iconSvg}
                  </div>
                  <div class="sa11y-lang-text">
                    <span class="sa11y-lang-native">${opt.native}</span>
                    <span class="sa11y-lang-en">${opt.english} (${opt.code.toUpperCase()})</span>
                  </div>
                  <div class="sa11y-lang-check" aria-hidden="true">✓</div>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Step 2: Disability / Accessibility Accommodations Panel -->
          <div id="sa11y-step-2-panel" class="sa11y-step-panel" ${currentStep === 2 ? '' : 'hidden'} role="region" aria-label="Accessibility accommodation options">
            <div class="sa11y-notice">
              ${t.noticeText}
            </div>

            <div class="sa11y-options-grid" role="group" aria-label="Accessibility accommodation options">
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

              <!-- 6. Standard Experience -->
              <label class="sa11y-card" id="card-standard">
                <input type="checkbox" id="chk-standard" name="standard">
                <div class="sa11y-card-content">
                  <div class="sa11y-card-title">
                    <span aria-hidden="true">👤</span>
                    <span class="txt-title">${t.optStandardTitle}</span>
                  </div>
                  <div class="sa11y-card-desc txt-desc">${t.optStandardDesc}</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="sa11y-modal-footer">
          <div class="sa11y-footer-left">
            <button type="button" id="sa11y-back-btn" class="sa11y-btn sa11y-btn-outline" ${currentStep === 1 ? 'hidden' : ''}>
              ${t.btnBackStep}
            </button>
            <button type="button" id="sa11y-skip-btn" class="sa11y-btn sa11y-btn-ghost">
              ${t.btnSkip}
            </button>
          </div>
          <div class="sa11y-footer-right">
            <button type="button" id="sa11y-next-btn" class="sa11y-btn sa11y-btn-primary" ${currentStep === 1 ? '' : 'hidden'}>
              ${t.btnNextStep}
            </button>
            <button type="button" id="sa11y-save-btn" class="sa11y-btn sa11y-btn-primary" ${currentStep === 2 ? '' : 'hidden'}>
              ${t.btnSave}
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    bindModalEvents(backdrop);
    return backdrop;
  }

  function showStep(stepNumber, backdrop) {
    currentStep = stepNumber;
    const bd = backdrop || modalBackdrop;
    if (!bd) return;

    const step1Panel = bd.querySelector('#sa11y-step-1-panel');
    const step2Panel = bd.querySelector('#sa11y-step-2-panel');
    const tab1 = bd.querySelector('#sa11y-tab-step1');
    const tab2 = bd.querySelector('#sa11y-tab-step2');
    const backBtn = bd.querySelector('#sa11y-back-btn');
    const nextBtn = bd.querySelector('#sa11y-next-btn');
    const saveBtn = bd.querySelector('#sa11y-save-btn');

    if (currentStep === 1) {
      if (step1Panel) step1Panel.removeAttribute('hidden');
      if (step2Panel) step2Panel.setAttribute('hidden', '');
      if (tab1) { tab1.classList.add('sa11y-tab-active'); tab1.setAttribute('aria-selected', 'true'); }
      if (tab2) { tab2.classList.remove('sa11y-tab-active'); tab2.setAttribute('aria-selected', 'false'); }
      if (backBtn) backBtn.setAttribute('hidden', '');
      if (nextBtn) nextBtn.removeAttribute('hidden');
      if (saveBtn) saveBtn.setAttribute('hidden', '');
    } else {
      if (step1Panel) step1Panel.setAttribute('hidden', '');
      if (step2Panel) step2Panel.removeAttribute('hidden');
      if (tab1) { tab1.classList.remove('sa11y-tab-active'); tab1.setAttribute('aria-selected', 'false'); }
      if (tab2) { tab2.classList.add('sa11y-tab-active'); tab2.setAttribute('aria-selected', 'true'); }
      if (backBtn) backBtn.removeAttribute('hidden');
      if (nextBtn) nextBtn.setAttribute('hidden', '');
      if (saveBtn) saveBtn.removeAttribute('hidden');
    }

    updateModalLanguage(bd);
  }

  function selectLanguage(langCode, backdrop) {
    if (!ALL_LANGUAGES.includes(langCode)) return;
    currentLang = langCode;
    localStorage.setItem(LANG_KEY, currentLang);

    // 1. Live translate the host page content!
    translateHostPage(currentLang);

    // 2. Update modal language
    const bd = backdrop || modalBackdrop;
    if (bd) {
      updateModalLanguage(bd);
      bd.querySelectorAll('.sa11y-lang-card').forEach(card => {
        const isSel = (card.dataset.lang === currentLang);
        card.classList.toggle('sa11y-selected', isSel);
        card.setAttribute('aria-checked', isSel ? 'true' : 'false');
      });
    }

    // 3. Screen reader polite announcement
    const opt = LANGUAGE_OPTIONS.find(l => l.code === currentLang);
    const nativeName = opt ? opt.native : currentLang;
    announce(`${nativeName} selected. Page content translated.`);

    // 4. Dispatch events for widget iframe and other listeners
    window.dispatchEvent(new CustomEvent('savanna:set_language', { detail: { lang: currentLang } }));
    window.dispatchEvent(new CustomEvent('savanna:language_changed', { detail: { lang: currentLang } }));
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

    const stepBadge = backdrop.querySelector('#sa11y-step-badge');
    if (stepBadge) stepBadge.textContent = (currentStep === 1 ? t.stepBadge1 : t.stepBadge2);

    const iconSpan = backdrop.querySelector('#sa11y-modal-icon');
    if (iconSpan) iconSpan.textContent = (currentStep === 1 ? '🌐' : '♿');

    const titleEl = backdrop.querySelector('#sa11y-modal-title .txt-title') || backdrop.querySelector('#sa11y-modal-title span:last-child');
    if (titleEl) titleEl.textContent = (currentStep === 1 ? t.step1Title : t.modalTitle);

    const descEl = backdrop.querySelector('#sa11y-modal-desc');
    if (descEl) descEl.textContent = (currentStep === 1 ? t.step1Subtitle : t.modalSubtitle);

    const langBtn = backdrop.querySelector('#sa11y-lang-btn');
    if (langBtn) langBtn.textContent = t.langToggle;

    const tab1 = backdrop.querySelector('#sa11y-tab-step1');
    if (tab1) tab1.textContent = t.tabLanguages;

    const tab2 = backdrop.querySelector('#sa11y-tab-step2');
    if (tab2) tab2.textContent = t.tabAccommodations;

    const noticeEl = backdrop.querySelector('.sa11y-notice');
    if (noticeEl) noticeEl.textContent = t.noticeText;

    const backBtn = backdrop.querySelector('#sa11y-back-btn');
    if (backBtn) backBtn.textContent = t.btnBackStep;

    const nextBtn = backdrop.querySelector('#sa11y-next-btn');
    if (nextBtn) nextBtn.textContent = t.btnNextStep;

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
      { id: '#card-standard', title: t.optStandardTitle, desc: t.optStandardDesc },
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
      if (key === 'standard') {
        const anyActive = Boolean(activeProfile.screenReader || activeProfile.captionsTranscripts || 
                          activeProfile.highContrast || activeProfile.motorAssistance || 
                          activeProfile.cognitiveSupport);
        input.checked = !anyActive;
      } else {
        input.checked = Boolean(activeProfile[key]);
      }
      const card = input.closest('.sa11y-card');
      if (card) card.classList.toggle('sa11y-selected', input.checked);
    });

    // Also sync language selection cards in Step 1
    backdrop.querySelectorAll('.sa11y-lang-card').forEach(card => {
      const lang = card.dataset.lang;
      const isSelected = (lang === currentLang);
      card.classList.toggle('sa11y-selected', isSelected);
      card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    });
  }

  function bindModalEvents(backdrop) {
    // Language card click & keyboard selection
    backdrop.querySelectorAll('.sa11y-lang-card').forEach(card => {
      card.addEventListener('click', () => {
        const lang = card.dataset.lang;
        selectLanguage(lang, backdrop);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectLanguage(card.dataset.lang, backdrop);
        }
      });
    });

    // Step navigation buttons
    const nextBtn = backdrop.querySelector('#sa11y-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        showStep(2, backdrop);
        const firstChk = backdrop.querySelector('#chk-sr');
        if (firstChk) firstChk.focus();
      });
    }

    const backBtn = backdrop.querySelector('#sa11y-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        showStep(1, backdrop);
        const activeCard = backdrop.querySelector('.sa11y-lang-card.sa11y-selected') || backdrop.querySelector('.sa11y-lang-card');
        if (activeCard) activeCard.focus();
      });
    }

    // Wizard direct tabs
    const tab1 = backdrop.querySelector('#sa11y-tab-step1');
    if (tab1) {
      tab1.addEventListener('click', () => showStep(1, backdrop));
    }
    const tab2 = backdrop.querySelector('#sa11y-tab-step2');
    if (tab2) {
      tab2.addEventListener('click', () => showStep(2, backdrop));
    }

    // Checkbox toggle & mutual exclusivity for standard
    const standardChk = backdrop.querySelector('#chk-standard');
    const specificChks = backdrop.querySelectorAll(
      '#chk-sr, #chk-captions, #chk-contrast, #chk-motor, #chk-cognitive'
    );

    if (standardChk) {
      standardChk.addEventListener('change', () => {
        if (standardChk.checked) {
          specificChks.forEach(chk => {
            chk.checked = false;
            const card = chk.closest('.sa11y-card');
            if (card) card.classList.remove('sa11y-selected');
          });
          adaptLowVisionContrast(false);
        }
        const card = standardChk.closest('.sa11y-card');
        if (card) card.classList.toggle('sa11y-selected', standardChk.checked);
      });
    }

    specificChks.forEach(input => {
      input.addEventListener('change', () => {
        if (input.checked && standardChk) {
          standardChk.checked = false;
          const stdCard = standardChk.closest('.sa11y-card');
          if (stdCard) stdCard.classList.remove('sa11y-selected');
        }
        const card = input.closest('.sa11y-card');
        if (card) card.classList.toggle('sa11y-selected', input.checked);

        // Immediate visual contrast preview
        if (input.id === 'chk-contrast') {
          adaptLowVisionContrast(input.checked);
        }
      });
    });

    // Language Cycler button (#sa11y-lang-btn) - preserved for test suites
    const langBtn = backdrop.querySelector('#sa11y-lang-btn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        const nextIndex = (ALL_LANGUAGES.indexOf(currentLang) + 1) % ALL_LANGUAGES.length;
        selectLanguage(ALL_LANGUAGES[nextIndex], backdrop);
      });
    }

    window.addEventListener('savanna:language_changed', (e) => {
      if (e.detail && e.detail.lang) {
        const newLang = e.detail.lang;
        if (ALL_LANGUAGES.includes(newLang) && newLang !== currentLang) {
          selectLanguage(newLang, backdrop);
        }
      }
    });

    // Save Button
    const saveBtn = backdrop.querySelector('#sa11y-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const inputs = backdrop.querySelectorAll('.sa11y-options-grid input[type="checkbox"]');
        inputs.forEach(input => {
          if (input.name !== 'standard') {
            activeProfile[input.name] = input.checked;
          }
        });
        activeProfile.configured = true;
        activeProfile.skipped = false;
        try {
          localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
        } catch (_) {}
        saveProfile(activeProfile);
        applyAdaptations(activeProfile);
        closeOnboardingModal();
        announce(i18n[currentLang].savedAnnouncement);
      });
    }

    // Skip Button
    const skipBtn = backdrop.querySelector('#sa11y-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        activeProfile.configured = true;
        activeProfile.skipped = true;
        try {
          localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
        } catch (_) {}
        saveProfile(activeProfile);
        closeOnboardingModal();
        announce(i18n[currentLang].skippedAnnouncement);
      });
    }

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
          'button:not([hidden]), [href], input:not([hidden]), [tabindex]:not([tabindex="-1"])'
        );
        const visibleFocusables = Array.from(focusables).filter(el => {
          return !el.closest('[hidden]');
        });
        if (visibleFocusables.length === 0) return;
        const first = visibleFocusables[0];
        const last = visibleFocusables[visibleFocusables.length - 1];

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

  function openOnboardingModal(isManualOpen = false, targetStep = 1) {
    if (!modalBackdrop) modalBackdrop = buildOnboardingModal();
    previouslyFocusedElement = document.activeElement;
    currentStep = targetStep || 1;
    showStep(currentStep, modalBackdrop);
    syncCheckboxStates(modalBackdrop);
    modalBackdrop.removeAttribute('hidden');
    if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'true');

    // Focus active language card or first input
    if (currentStep === 1) {
      const activeCard = modalBackdrop.querySelector('.sa11y-lang-card.sa11y-selected') || modalBackdrop.querySelector('.sa11y-lang-card');
      if (activeCard) activeCard.focus();
    } else {
      const firstCheckbox = modalBackdrop.querySelector('input[type="checkbox"]');
      if (firstCheckbox) firstCheckbox.focus();
    }
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
      if (!enable) {
        if (existing) existing.remove();
        return;
      }

      let expectedText = (currentLang === 'am') ? ' (ሁኔታ፡ አልተጀመረም)' : ' (Status: Not started)';
      if (item.classList.contains('active')) {
        item.setAttribute('aria-current', 'page');
        expectedText = (currentLang === 'am') ? ' (የአሁኑ ንቁ ትምህርት)' : ' (Current active lesson)';
      } else if (item.querySelector('.fa-circle-check.text-success')) {
        expectedText = (currentLang === 'am') ? ' (ሁኔታ፡ ተጠናቋል)' : ' (Status: Completed)';
      } else if (item.querySelector('.fa-circle.text-warning')) {
        expectedText = (currentLang === 'am') ? ' (ሁኔታ፡ ያልተጠናቀቀ ግምገማ)' : ' (Status: Incomplete review check)';
      }

      if (existing) {
        if (existing.textContent !== expectedText) {
          existing.textContent = expectedText;
        }
        return;
      }

      const badge = document.createElement('span');
      badge.className = 'sa11y-sr-only sa11y-status-sr';
      badge.textContent = expectedText;
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
    const isInternalNode = (n) => n && n.nodeType === 1 && (
      (n.id && (n.id.startsWith('savanna-') || n.id.startsWith('sa11y-'))) ||
      (n.classList && (n.classList.contains('sa11y-describe-img-btn') || n.classList.contains('sa11y-image-desc-card') || n.classList.contains('sa11y-status-sr'))) ||
      (n.closest && n.closest('.sa11y-image-desc-card, #sa11y-live-region, #savanna-a11y-announcer, #sa11y-motor-toolbar, #sa11y-reading-ruler'))
    );

    const isInternal = mutations.every(m => {
      const t = m.target;
      if (isInternalNode(t)) return true;
      const allAddedInternal = Array.from(m.addedNodes).every(isInternalNode);
      const allRemovedInternal = Array.from(m.removedNodes).every(isInternalNode);
      return (m.addedNodes.length > 0 || m.removedNodes.length > 0) && allAddedInternal && allRemovedInternal;
    });
    if (isInternal) return;

    if (mutationTimeout) clearTimeout(mutationTimeout);
    mutationTimeout = setTimeout(() => {
      adaptBlindAndScreenReader(true);
      if (currentLang && currentLang !== 'en') translateHostPage(currentLang);
    }, 100);
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

    // If current language is not English, translate host DOM immediately
    if (currentLang && currentLang !== 'en') {
      translateHostPage(currentLang);
    }

    // Check if user has completed onboarding or configured profile
    const onboardingDone = (localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true');
    const stored = getStoredProfile();

    if (!onboardingDone && (!stored || (!stored.configured && !stored.skipped))) {
      // First visit: automatically open the accessible 2-step onboarding wizard
      setTimeout(() => {
        openOnboardingModal(false, 1);
      }, 400);
    } else {
      if (stored) {
        activeProfile = stored;
        applyAdaptations(activeProfile);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEngine);
  } else {
    initEngine();
  }

  // Single Page Application (SPA) navigation observer (React, Next.js, Vue, Angular)
  if (typeof window !== 'undefined' && window.history) {
    try {
      const wrapHistoryMethod = (type) => {
        const orig = window.history[type];
        if (typeof orig === 'function') {
          return function() {
            const rv = orig.apply(this, arguments);
            window.dispatchEvent(new Event('savanna:locationchange'));
            return rv;
          };
        }
        return orig;
      };
      window.history.pushState = wrapHistoryMethod('pushState');
      window.history.replaceState = wrapHistoryMethod('replaceState');
      window.addEventListener('popstate', () => window.dispatchEvent(new Event('savanna:locationchange')));
      window.addEventListener('hashchange', () => window.dispatchEvent(new Event('savanna:locationchange')));

      window.addEventListener('savanna:locationchange', () => {
        setTimeout(() => {
          if (currentLang && currentLang !== 'en') {
            translateHostPage(currentLang);
          }
        }, 100);
      });
    } catch (e) {
      // Graceful fallback for non-standard environments
    }
  }

  // Expose API for host scripts or other modules
  window.SavannaA11y = {
    openSettings: (targetStep) => openOnboardingModal(true, targetStep || 1),
    getProfile: () => ({ ...activeProfile }),
    setProfile: (p) => {
      activeProfile = { ...activeProfile, ...p, configured: true };
      saveProfile(activeProfile);
      applyAdaptations(activeProfile);
    },
    setLanguage: (lang) => {
      if (ALL_LANGUAGES.includes(lang)) {
        selectLanguage(lang, modalBackdrop);
      }
    },
    getLanguage: () => currentLang,
    detectDomain: () => detectHostSiteType(),
    getSiteType: () => detectHostSiteType(),
    translatePage: () => translateHostPage(currentLang),
    getDynamicTranslations: (lang) => (dynamicTransCache[lang] ? { ...dynamicTransCache[lang] } : {}),
    setDynamicTranslations: (lang, map) => setDynamicTransBatch(lang, map),
    flushPendingTranslations: (lang) => dispatchBatchTranslation(lang || currentLang)
  };
})();
