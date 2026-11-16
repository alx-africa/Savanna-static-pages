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

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

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
    "how": {"en": "how", "am": "እንዴት", "om": "akkamiin", "ti": "ከመይ", "so": "sida", "ar": "كيفية", "sw": "jinsi", "fr": "la façon dont"},
    "Back": {"en": "Back", "am": "ተመለስ", "om": "Duubatti", "ti": "ተመለስ", "so": "Dib", "ar": "رجوع", "sw": "Rudi", "fr": "Retour"},
    "Help": {"en": "Help", "am": "እርዳታ", "om": "Gargaarsa", "ti": "ሓገዝ", "so": "Caawimaad", "ar": "مساعدة", "sw": "Msaada", "fr": "Aide"},
    "Home": {"en": "Home", "am": "መነሻ ገጽ", "om": "Fuula duraa", "ti": "መእተዊ ገጽ", "so": "Hoyga", "ar": "الرئيسية", "sw": "Nyumbani", "fr": "Accueil"},
    "Jobs": {"en": "Jobs", "am": "ስራዎች", "om": "Hojiiwwan", "ti": "ስራሕቲ", "so": "Shaqooyinka", "ar": "الوظائف", "sw": "Kazi", "fr": "Emplois"},
    "Next": {"en": "Next", "am": "ቀጣይ", "om": "Itti aani", "ti": "ቀጻሊ", "so": "Xiga", "ar": "التالي", "sw": "Ifuatayo", "fr": "Suivant"},
    "Quiz": {"en": "Quiz", "am": "ፈተና / ጥያቄዎች (Quiz)", "om": "Gaaffilee Madaallii (Quiz)", "ti": "ፈተና (Quiz)", "so": "Kedis (Quiz)", "ar": "اختبار قصير (Quiz)", "sw": "Jaribio (Quiz)", "fr": "Quiz"},
    "Save": {"en": "Save", "am": "አስቀምጥ", "om": "Olkaayi", "ti": "ኣቐምጥ", "so": "Kaydi", "ar": "حفظ", "sw": "Hifadhi", "fr": "Enregistrer"},
    "Step": {"en": "Step", "am": "ደረጃ", "om": "Tarkaanfii", "ti": "ስጉምቲ", "so": "Tallaabo", "ar": "خطوة", "sw": "Hatua", "fr": "Étape"},
    "VA-1": {"en": "VA-1", "am": "ምናባዊ ረዳት (VA)", "om": "VA-1", "so": "VA-1", "sw": "VA-1", "fr": "VA-1"},
    "from": {"en": "from", "am": "ከ", "om": "irraa", "ti": "ካብ", "ar": "من", "sw": "kutoka"},
    "with": {"en": "with", "am": "ከ", "om": "fi", "ti": "ምስ", "so": "iyo", "ar": "إلى جانب", "sw": "na", "fr": "et"},
    "Apply": {"en": "Apply", "am": "አመልክት", "om": "Iyyadhu", "ti": "ኣመልክት", "so": "Codso", "ar": "تقديم", "sw": "Omba", "fr": "Postuler"},
    "Close": {"en": "Close", "am": "ዝጋ", "om": "Cufi", "ti": "ዕጸው", "so": "Xidh", "ar": "إغلاق", "sw": "Funga", "fr": "Fermer"},
    "Embed": {"en": "Embed", "am": "ከተት", "om": "Keessatti maxxansi", "ti": "ኣእቱ (Embed)", "ar": "تضمين", "sw": "Pachika"},
    "Grade": {"en": "Grade", "am": "ደረጃ", "om": "Sadarkaa", "ti": "ደረጃ", "so": "Darajo", "ar": "التقدير", "sw": "Gredi", "fr": "Note"},
    "Links": {"en": "Links", "am": "አገናኞች", "om": "Geessitoota (Links)", "ti": "ማገናኛዎች (Links)", "so": "Xiriirada", "ar": "الروابط", "sw": "Viungo", "fr": "Liens"},
    "Lists": {"en": "Lists", "am": "ዝርዝሮች", "om": "Tarreewwan", "ti": "ዝርዝሮች (Lists)", "so": "Liisaska", "ar": "القوائم", "sw": "Orodha", "fr": "Listes"},
    "Peers": {"en": "Peers", "am": "አብረውኝ የሚማሩ (እኩዮች)", "om": "Hiriyaa barnootaa", "ti": "መዛኑ (መማህርተይ)", "so": "Ardayda kale", "ar": "الأقران والزملاء", "sw": "Wenzangu", "fr": "Pairs"},
    "Score": {"en": "Score", "am": "ውጤት", "om": "Qabxii", "ti": "ውጽኢት", "so": "Dhibco", "ar": "الدرجة", "sw": "Alama", "fr": "Score"},
    "Video": {"en": "Video", "am": "ቪዲዮ", "om": "Viidiyoo", "ti": "ቪድዮ", "so": "Fiidiyow", "ar": "فيديو", "sw": "Video", "fr": "Vidéo"},
    "05 Nov": {"en": "05 Nov", "am": "ኅዳር 26", "om": "05 Sadaasa", "ti": "05 ሕዳር"},
    "07 Nov": {"en": "07 Nov", "am": "ኅዳር 28", "om": "Sadaasa 07", "ti": "07 ሕዳር"},
    "2:00pm": {"en": "2:00pm", "am": "ከሰዓት 8:00", "om": "Sa'aa 8:00 waaree booda", "ti": "ድሕሪ ቀትሪ 8:00 (2:00pm)"},
    "5 days": {"en": "5 days", "am": "5 ቀናት", "om": "Guyoota 5", "ti": "5 መዓልታት"},
    "6:00pm": {"en": "6:00pm", "am": "ከሰዓት 12:00", "om": "Sa'aatii 12:00 galgala", "ti": "ድሕሪ ቀትሪ 11:00 (6:00pm)"},
    "Cancel": {"en": "Cancel", "am": "ሰርዝ", "om": "Dhiisi", "ti": "ሰርዝ", "so": "Jooji", "ar": "إلغاء", "sw": "Ghairi", "fr": "Annuler"},
    "Course": {"en": "Course", "am": "ኮርስ / ትምህርት", "om": "Koorsii", "ti": "ኮርስ", "so": "Koorsada", "ar": "الدورة التدريبية", "sw": "Kozi", "fr": "Cours"},
    "Events": {"en": "Events", "am": "መርሃ ግብሮች", "om": "Qophiiwwan", "ti": "መደባት"},
    "Filter": {"en": "Filter", "am": "አጣራ (Filter)", "om": "Calali (Filter)", "ti": "ሕረ (Filter)", "so": "Shaandhee (Filter)", "ar": "تصفية (Filter)", "sw": "Chuja (Filter)", "fr": "Filtrer"},
    "Images": {"en": "Images", "am": "ምስሎች", "om": "Suuraawwan", "ti": "ምስሎች (Images)", "so": "Sawirrada", "ar": "الصور", "sw": "Picha", "fr": "Images"},
    "Lesson": {"en": "Lesson", "am": "ትምህርት (Lesson)", "om": "Barnoota", "ti": "ትምህርቲ", "so": "Casharka", "ar": "الدرس", "sw": "Somo", "fr": "Leçon"},
    "Level:": {"en": "Level:", "am": "ደረጃ፡", "om": "Sadarkaa:", "ti": "ደረጃ፡", "so": "Heerka:", "ar": "المستوى:", "sw": "Kiwango:", "fr": "Niveau :"},
    "Log in": {"en": "Log in", "am": "ግባ", "om": "Seeni", "ti": "እቶ", "so": "Gal", "ar": "تسجيل الدخول", "sw": "Ingia", "fr": "Connexion"},
    "Posted": {"en": "Posted", "am": "የተለጠፈበት ቀን", "om": "Kan Maxxanfame", "ti": "እተለጠፈሉ", "so": "La Daabacay", "ar": "تاريخ النشر", "sw": "Imechapishwa", "fr": "Publié le"},
    "Quotes": {"en": "Quotes", "am": "ጥቅሶች", "om": "Sabdoota", "ti": "ጥቅሶች (Quotes)", "so": "Xigashooyinka", "ar": "الاقتباسات", "sw": "Nukuu", "fr": "Citations"},
    "Remote": {"en": "Remote", "am": "የርቀት ስራ (Remote)", "om": "Fagoo (Remote)", "ti": "ናይ ርሕቐት ስራሕ (Remote)", "so": "Masaafada (Remote)", "ar": "عن بُعد (Remote)", "sw": "Kazi ya Masafa (Remote)", "fr": "À distance (Remote)"},
    "Resume": {"en": "Resume", "am": "ቀጥል", "om": "Itti fufi", "ti": "ቀጽል", "so": "Sii wad", "ar": "استئناف", "sw": "Endelea", "fr": "Reprendre"},
    "Salary": {"en": "Salary", "am": "ደመወዝ / ክፍያ", "om": "Mindaa / Kaffaltii", "ti": "መሃያ", "so": "Mushahar", "ar": "الراتب", "sw": "Mshahara", "fr": "Salaire"},
    "Search": {"en": "Search", "am": "ፈልግ", "om": "Barbaadi", "ti": "ድለይ", "so": "Raadi", "ar": "بحث", "sw": "Tafuta", "fr": "Rechercher"},
    "Submit": {"en": "Submit", "am": "አስገባ", "om": "Galchi", "ti": "ኣእቱ", "so": "Geli", "ar": "إرسال", "sw": "Wasilisha", "fr": "Soumettre"},
    "Tables": {"en": "Tables", "am": "ሰንጠረዦች", "om": "Gabateewwan", "ti": "ሰንጠረዦች (Tables)", "ar": "الجداول", "sw": "Jedwali"},
    "Week 1": {"en": "Week 1", "am": "ሳምንት 1"},
    "Week 2": {"en": "Week 2", "am": "ሳምንት 2"},
    "Week 3": {"en": "Week 3", "am": "ሳምንት 3"},
    "Week 4": {"en": "Week 4", "am": "ሳምንት 4", "om": "Torban 4", "ti": "ሰሙን 4", "ar": "الأسبوع 4", "sw": "Wiki ya 4", "fr": "Semaine 4"},
    "Week 5": {"en": "Week 5", "am": "ሳምንት 5"},
    "Week 6": {"en": "Week 6", "am": "ሳምንት 6"},
    "Week 7": {"en": "Week 7", "am": "ሳምንት 7", "om": "Torbee 7"},
    "Week 8": {"en": "Week 8", "am": "ሳምንት 8", "om": "Torbee 8"},
    "Week 9": {"en": "Week 9", "am": "ሳምንት 9", "om": "Torbee 9"},
    "Weight": {"en": "Weight", "am": "ክብደት", "om": "Ulfaatina", "ti": "ክብደት", "so": "Miisaanka", "ar": "الوزن النسبي", "sw": "Uzito wa alama", "fr": "Pondération"},
    "tool (": {"en": "tool (", "am": "መሣሪያ (", "om": "meeshaa (", "ti": "መሳርሒ (", "ar": "الأداة (", "sw": "zana ("},
    "Average": {"en": "Average", "am": "አማካይ", "om": "Giddu-galeessa", "ti": "ማእከላይ ውጽኢት", "so": "Celcelis", "ar": "المعدل", "sw": "Wastani", "fr": "Moyenne"},
    "Björn 👋": {"en": "Björn 👋", "am": "ብዮርን 👋"},
    "Company": {"en": "Company", "am": "ድርጅት", "om": "Dhaabbata", "ti": "ትካል", "so": "Shirkadda", "ar": "الشركة", "sw": "Kampuni", "fr": "Entreprise"},
    "Correct": {"en": "Correct", "am": "ትክክል", "om": "Sirrii", "ti": "ትኽክል", "so": "Sax", "ar": "صحيح", "sw": "Sahihi", "fr": "Correct"},
    "Fields:": {"en": "Fields:", "am": "ማሳያዎች፡", "om": "Dirroowwan:", "ti": "መዳላት:", "ar": "الحقول:", "sw": "Sehemu:"},
    "Filter:": {"en": "Filter:", "am": "አጣሪ (Filter):", "ti": "ማጣርያ:", "so": "Miiraha:", "ar": "تصفية:", "sw": "Chuja:", "fr": "Filtrer :"},
    "Headers": {"en": "Headers", "am": "ခေါင်းጌዎች", "om": "Matadureewwan", "ti": "ခေါင်းጌዎች (Headers)", "so": "Ciwaannada", "ar": "العوِانين", "sw": "Vichwa vya habari", "fr": "En-têtes"},
    "Log out": {"en": "Log out", "am": "ውጣ", "om": "Ba’i", "ti": "ውጻእ", "so": "Ka bax", "ar": "تسجيل الخروج", "sw": "Ondoka", "fr": "Déconnexion"},
    "Overall": {"en": "Overall", "am": "አጠቃላይ", "om": "Walii gala", "ti": "ሓፈሻዊ"},
    "Servers": {"en": "Servers", "am": "ሰርቨሮች", "om": "Sarvaroota", "ti": "ሰርቨራት", "so": "Adeegayaasha", "ar": "الخوادم", "sw": "Seva", "fr": "Serveurs"},
    "Summary": {"en": "Summary", "am": "ማጠቃለያ", "om": "Goolaba", "ti": "ጽሟቕ", "so": "Soo koobid", "ar": "الملخص", "sw": "Muhtasari", "fr": "Résumé"},
    "Up Next": {"en": "Up Next", "am": "ቀጣይ", "om": "Kan Itti Aanu", "ti": "ቀጺሉ ዝጸንሕ", "so": "Kan xiga", "ar": "التالي", "sw": "Inayofuata", "fr": "À suivre"},
    "Week 10": {"en": "Week 10", "am": "ሳምንት 10", "om": "Torbee 10"},
    "Week 11": {"en": "Week 11", "am": "ሳምንት 11", "om": "Torbee 11"},
    "Week 12": {"en": "Week 12", "am": "ሳምንት 12", "om": "Torbee 12"},
    "Week 13": {"en": "Week 13", "am": "ሳምንት 13", "om": "Torbee 13"},
    "Week 14": {"en": "Week 14", "am": "ሳምንት 14", "om": "Torbee 14"},
    "Week 15": {"en": "Week 15", "am": "ሳምንት 15", "om": "Torbee 15"},
    "Advanced": {"en": "Advanced", "am": "የላቀ ደረጃ", "om": "Sadarkaa Olaanaa", "ti": "ዕቱብ/ላዕለዋይ ደረጃ", "ar": "متقدم", "sw": "Ya Juu", "fr": "Avancé"},
    "All Jobs": {"en": "All Jobs", "am": "ሁሉም ስራዎች", "om": "Hojiiwwan Hundumaa", "ti": "ኩሎም ስራሕቲ", "so": "Dhammaan Shaqooyinka", "ar": "جميع الوظائف", "sw": "Kazi Zote", "fr": "Tous les emplois"},
    "Average:": {"en": "Average:", "am": "አማካኝ፡", "om": "Giddu-galeessa:", "ti": "ማካከለኛ:", "so": "Celcelis:", "ar": "المتوسط:", "sw": "Wastani:", "fr": "Moyenne :"},
    "Concepts": {"en": "Concepts", "am": "ጽንሰ-ሀሳቦች", "om": "Yaad-rimeewwan", "ti": "ጽንሰ-ሓሳባት", "so": "Fikradaha", "ar": "المفاهيم", "sw": "Dhana", "fr": "Concepts"},
    "Contract": {"en": "Contract", "am": "የኮንትራት ስራ", "om": "Waliigaltee", "ti": "ናይ ኮንትራት", "so": "Qandaraas", "ar": "عقد", "sw": "Mkataba", "fr": "Contrat"},
    "Criteria": {"en": "Criteria", "am": "መስፈርቶች", "om": "Ulaagaalee", "ti": "መምዘኒታት", "so": "Shuruudaha", "ar": "المعايير", "sw": "Vigezo", "fr": "Critères"},
    "Deadline": {"en": "Deadline", "am": "የማመልከቻ ማብቂያ ቀን", "om": "Guyyaa Dhumaa", "ti": "መዛዘሚ ዕለት", "so": "Waqtiga kama dambaysta ah", "ar": "الموعد النهائي", "sw": "Tarehe ya Mwisho", "fr": "Date limite"},
    "Emphasis": {"en": "Emphasis", "am": "ማጉላት (Emphasis)", "om": "Jajjabeessuu (Emphasis)", "ti": "ማጉላት (Emphasis)", "so": "Xoojin", "ar": "التأكيد", "sw": "Msisitizo", "fr": "Accentuation"},
    "Location": {"en": "Location", "am": "ቦታ", "om": "Bakka", "ti": "ቦታ", "so": "Goobta", "ar": "الموقع", "sw": "Mahali", "fr": "Emplacement"},
    "Module 4": {"en": "Module 4", "am": "ሞጁል 4", "om": "Boqonnaa 4", "ti": "ክፍሊ 4", "ar": "الوحدة 4", "sw": "Moduli ya 4", "fr": "Module 4"},
    "Overview": {"en": "Overview", "am": "አጠቃላይ እይታ", "om": "Ibsa Waliigalaa", "ti": "ሓፈሻዊ ትሕዝቶ", "so": "Dulmar guud", "ar": "نظرة عامة", "sw": "Muhtasari wa jumla", "fr": "Vue d'ensemble"},
    "Projects": {"en": "Projects", "am": "ፕሮጀክቶች", "om": "Pirojektoota", "ti": "ፕሮጀክትታት", "so": "Mashaariicda", "ar": "المشاريع", "sw": "Miradi", "fr": "Projets"},
    "Question": {"en": "Question", "am": "ጥያቄ", "om": "Gaaffii", "ti": "ሕቶ", "so": "Su'aal", "ar": "سؤال", "sw": "Swali", "fr": "Question"},
    "Save Job": {"en": "Save Job", "am": "ስራ አስቀምጥ", "om": "Hojii Olkaayi", "ti": "ስራሕ ኣቐምጥ", "so": "Kaydi Shaqada", "ar": "حفظ الوظيفة", "sw": "Hifadhi Kazi", "fr": "Enregistrer l'offre"},
    "Settings": {"en": "Settings", "am": "ቅንብሮች", "om": "Qindaa’inoota", "ti": "ቅጥዕታት", "so": "Hagaajinta", "ar": "الإعدادات", "sw": "Mipangilio", "fr": "Paramètres"},
    "Syllabus": {"en": "Syllabus", "am": "ስርዓተ-ትምህርት", "om": "Silabasii", "ti": "ስርዓተ-ትምህርቲ", "so": "Manhaja", "ar": "المنهج الدراسي", "sw": "Muhtasari wa Somo", "fr": "Programme"},
    "The JSON": {"en": "The JSON", "am": "የ JSON ይዘት", "om": "JSON kun", "ti": "እቲ JSON", "so": "JSON-ka", "ar": "ملف JSON", "sw": "JSON", "fr": "Le JSON"},
    "becomes:": {"en": "becomes:", "am": "ይሆናል:", "om": "ta'a:", "ti": "ይኸውን:", "ar": "يصبح:", "sw": "inakuwa:"},
    "required": {"en": "required", "am": "የግዴታ", "om": "dirqama", "ti": "ዘድሊ", "ar": "مطلوب", "sw": "inahitajika"},
    "— one of": {"en": "— one of", "am": "— አንዱ", "om": "— isa tokko", "ti": "— ካብቶም", "ar": "— أحد", "sw": "— moja ya"},
    "Apply Now": {"en": "Apply Now", "am": "አሁን ያመልክቱ", "om": "Amma Iyyadhaa", "ti": "ሕጂ ኣመልክቱ", "so": "Hadda Codso", "ar": "قدّم الآن", "sw": "Tuma Maombi Sasa", "fr": "Postuler maintenant"},
    "Completed": {"en": "Completed", "am": "ተጠናቋል", "om": "Xumurameera", "ti": "ተወዲኡ", "so": "Waa la Dhameeyay", "ar": "مكتمل", "sw": "Imekamilika", "fr": "Terminé"},
    "Full Name": {"en": "Full Name", "am": "ሙሉ ስም", "om": "Maqaa Guutuu", "ti": "ምሉእ ስም", "so": "Magaca oo Buuxa", "ar": "الاسم الكامل", "sw": "Jina Kamili", "fr": "Nom complet"},
    "Full-time": {"en": "Full-time", "am": "ሙሉ ጊዜ", "om": "Yeroo Guutuu", "ti": "ምሉእ ግዜ", "so": "Waqti Buuxa", "ar": "دوام كامل", "sw": "Muda Kamili", "fr": "Temps plein"},
    "Incorrect": {"en": "Incorrect", "am": "ስህተት", "om": "Dogoggora", "ti": "ጌጋ", "so": "Khalad", "ar": "غير صحيح", "sw": "Si sahihi", "fr": "Incorrect"},
    "Job Title": {"en": "Job Title", "am": "የስራ መደብ", "om": "Mata duree Hojii", "ti": "ናይ ስራሕ መደብ", "so": "Cinwaanka Shaqada", "ar": "المسمى الوظيفي", "sw": "Nafasi ya Kazi", "fr": "Intitulé du poste"},
    "Part-time": {"en": "Part-time", "am": "የትርፍ ጊዜ", "om": "Yeroo Garaa-garaa", "ti": "ናይ ትርፊ ግዜ", "so": "Waqti Dhiman", "ar": "دوام جزئي", "sw": "Muda wa Sehemu", "fr": "Temps partiel"},
    "Resources": {"en": "Resources", "am": "የትምህርት ግብዓቶች", "om": "Qabeenyaalee", "ti": "ጸጋታት ትምህርቲ", "so": "Khayraadka", "ar": "الموارد التعليمية", "sw": "Nyenzo za masomo", "fr": "Ressources"},
    "Sandboxes": {"en": "Sandboxes", "am": "የሙከራ ሳጥኖች (Sandboxes)", "om": "Saanduqa qorannoo", "ti": "ናይ ፈተነ ባይታታት", "so": "Aagaga tijaabada", "ar": "بيئات الاختبار التجريبية", "sw": "Mazingira ya majaribio", "fr": "Bacs à sable"},
    "Try Again": {"en": "Try Again", "am": "እንደገና ይሞክሩ", "om": "Ammas Yaalaa", "ti": "ደጊምኩም ፈትኑ", "so": "Isku day mar kale", "ar": "حاول مرة أخرى", "sw": "Jaribu tena", "fr": "Réessayer"},
    "Validated": {"en": "Validated", "am": "ተረጋግጧል", "om": "Mirkanaa'eera", "ti": "ተረጋጊጹ", "so": "La xaqiijiyay", "ar": "تم التحقق منه", "sw": "Imethibitishwa", "fr": "Validé"},
    "You have:": {"en": "You have:", "am": "አሎት:", "om": "Qabda:", "ti": "አለካ/ኣለኪ:"},
    "payload (": {"en": "payload (", "am": "መረጃ (payload) (", "om": "payload (", "ar": "حمولة (", "sw": "mzigo wa data ("},
    "AI fluency": {"en": "AI fluency", "am": "የሰው ሰራሽ የማሰብ (AI) እውቀት", "om": "beekumsa AI irratti qaban", "ti": "ብቕዓት AI", "so": "Aqoonta iyo kartida AI", "ar": "التمكن من الذكاء الاصطناعي", "sw": "ufasaha wa AI", "fr": "maîtrise de l'IA"},
    "Accredited": {"en": "Accredited", "am": "ዕውቅና ያለው", "om": "Beekamtii Kan Qabu", "ti": "ዕውቅና ያለው", "ar": "معتمدة", "sw": "Imethibitishwa Rasmi", "fr": "Accrédité"},
    "Assignment": {"en": "Assignment", "am": "የተግባር ስራ (Assignment)", "om": "Hojii Manneenii (Assignment)", "ti": "ዕዮ ገዛ", "so": "Shaqo-guri (Assignment)", "ar": "واجب دراسي", "sw": "Kazi ya Mradi (Assignment)", "fr": "Devoir"},
    "Enroll Now": {"en": "Enroll Now", "am": "አሁን ይመዝገቡ", "om": "Amma Galmaa'aa", "ti": "ሕጂ ተመዝገቡ", "so": "Hadda Isdiiwaangeli", "ar": "سجّل الآن", "sw": "Jiandikishe Sasa", "fr": "S'inscrire maintenant"},
    "Experience": {"en": "Experience", "am": "የስራ ልምድ", "om": "Muuxannoo Hojii", "ti": "ናይ ስራሕ ተመኩሮ", "so": "Khibrad", "ar": "الخبرة", "sw": "Uzoefu", "fr": "Expérience"},
    "Internship": {"en": "Internship", "am": "የልምምድ ስራ (Internship)", "om": "Shaakala Hojii (Internship)", "ti": "ናይ ልምምድ ስራሕ", "so": "Tababar Shaqo (Internship)", "ar": "تدريب عملي (Internship)", "sw": "Mafunzo Kazini (Internship)", "fr": "Stage (Internship)"},
    "My Profile": {"en": "My Profile", "am": "የእኔ መገለጫ", "om": "Piroofaayilii koo", "ti": "መገለጺ መንነተይ", "so": "Xogtayda shakhsiga ah", "ar": "ملفي الشخصي", "sw": "Wasifu wangu", "fr": "Mon profil"},
    "My courses": {"en": "My courses", "am": "የእኔ ኮርሶች", "om": "Koorsoota koo", "ti": "ኮርሰታተይ", "so": "Koorsooyinkayga", "ar": "دوراتي التدريبية", "sw": "Kozi zangu", "fr": "Mes cours"},
    "Transcript": {"en": "Transcript", "am": "የንግግር ጽሁፍ", "om": "Waraabbii Sagalee", "ti": "ናይ ድምጺ ጽሑፍ", "so": "Qoraalka Codka", "ar": "النص المفرّغ", "sw": "Nakala ya sauti", "fr": "Transcription"},
    "ALX program": {"en": "ALX program", "am": "የALX ፕሮግራም", "om": "Sagantaa ALX", "ti": "ናይ ALX ፕሮግራም", "so": "Barnaamijka ALX", "ar": "برنامج ALX", "sw": "Programu ya ALX", "fr": "Programme ALX"},
    "Certificate": {"en": "Certificate", "am": "የምስክር ወረቀት", "om": "Waraqaa Ragaa", "ti": "ናይ ምስክር ወረቐት", "so": "Shahaado", "ar": "شهادة إتمام", "sw": "Cheti cha Kuhitimu", "fr": "Certificat"},
    "In Progress": {"en": "In Progress", "am": "በሂደት ላይ ያለ", "om": "Adeemsa Irra Jira", "ti": "ኣብ ከይዲ ዘሎ", "so": "Wuu Socdaa", "ar": "قيد التقدم", "sw": "Inaendelea", "fr": "En cours"},
    "In progress": {"en": "In progress", "am": "በሂደት ላይ", "om": "Hojiirra jira", "ti": "ኣብ ከይዲ ዘሎ", "so": "Socda", "ar": "قيد التنفيذ", "sw": "Inaendelea", "fr": "En cours"},
    "JSON shape:": {"en": "JSON shape:", "am": "የ JSON ቅርጽ፡", "om": "Bocaasa JSON:", "ti": "JSON ቅርጺ:", "ar": "شكل JSON:", "sw": "Umbo la JSON:"},
    "My Planning": {"en": "My Planning", "am": "የእኔ እቅድ", "om": "Karoora koo", "ti": "ውጥነይ", "so": "Qorshahayga", "ar": "جدولي الدراسي", "sw": "Mipango yangu", "fr": "Mon planning"},
    "Not Started": {"en": "Not Started", "am": "አልተጀመረም", "om": "Hin Jalqabamne", "ti": "ኣይተጀመረን", "so": "Lama Bilaabin", "ar": "لم يبدأ بعد", "sw": "Haijaanza", "fr": "Non commencé"},
    "Not started": {"en": "Not started", "am": "አልተጀመረም", "om": "Hin jalqabamne", "ti": "ኣይተጀመረን", "so": "Aan la bilaabin", "ar": "لم يبدأ بعد", "sw": "Haijaanza", "fr": "Non commencé"},
    "Search Jobs": {"en": "Search Jobs", "am": "ስራዎችን ፈልግ", "om": "Hojiiwwan Barbaadi", "ti": "ስራሕቲ ድለይ", "so": "Raadi Shaqooyin", "ar": "ابحث عن وظائف", "sw": "Tafuta Kazi", "fr": "Rechercher des emplois"},
    "— object of": {"en": "— object of", "am": "— የነገሮች", "om": "— meeshaa ykn wanta", "ti": "— ናይ", "ar": "— كائن من", "sw": "— kitu (object) cha"},
    "Certificate:": {"en": "Certificate:", "am": "ሰርተፍኬት፡", "ti": "ምስክር ወረቀት፡", "ar": "الشهادة:", "sw": "Cheti:", "fr": "Certificat :"},
    "Compensation": {"en": "Compensation", "am": "ጥቅማጥቅም እና ክፍያ", "om": "Kaffaltii fi Faayidaalee", "ti": "ክፍሊትን ረብሓታትን", "so": "Gunnooyinka", "ar": "التعويضات والمزايا", "sw": "Fidia na Marupurupu", "fr": "Rémunération"},
    "Requirements": {"en": "Requirements", "am": "መስፈርቶች", "om": "Ulaagaalee", "ti": "ቅድመ-ኩነታት", "so": "Shuruudaha", "ar": "المتطلبات", "sw": "Vigezo na Masharti", "fr": "Exigences"},
    "What is a VA": {"en": "What is a VA", "am": "የቨርቹዋል ረዳት (VA) ምንድን ነው?", "om": "VA jechuun maal jechuudha?", "ti": "ቨርቹዋል ረዳኢ (VA) ማለት እንታይ እዩ?", "so": "Waa maxay Kaaliyaha Virtual-ka (VA)?", "ar": "ما هو المساعد الافتراضي (VA)", "sw": "VA ni nini", "fr": "Qu'est-ce qu'un·e AS ?"},
    "tool fluency": {"en": "tool fluency", "am": "መሣሪያዎችን አዋቂነት", "om": "beekumsa meeshaalee irratti qaban", "ti": "ብቕዓት መሳርሒ (tool fluency)", "so": "aqoonta qalabka", "ar": "التمكن من الأدوات", "sw": "ufahamu mzuri wa zana", "fr": "la maîtrise des outils"},
    "(weight: 100)": {"en": "(weight: 100)", "am": "(ክብደት፡ 100)", "om": "(ulfaatinni: 100)", "ti": "(ክብደት: 100)"},
    "(weight: 550)": {"en": "(weight: 550)", "am": "(ክብደት፡ 550)", "om": "(ulfaatinni: 550)", "ti": "(ክብደት: 550)"},
    "(weight: 750)": {"en": "(weight: 750)", "am": "(ክብደት: 750)", "om": "(ulfaatinni: 750)", "ti": "(ክብደት፡ 750)"},
    "Current score": {"en": "Current score", "am": "የአሁኑ ውጤት", "om": "Qabxii ammaa", "ti": "ናይ ሕጂ ነጥቢ", "so": "Dhibcaha hadda", "ar": "الدرجة الحالية", "sw": "Alama ya sasa", "fr": "Score actuel"},
    "Email Address": {"en": "Email Address", "am": "የኢሜይል አድራሻ", "om": "Teessoo Iimeelii", "ti": "ኢመይል ኣድራሻ", "so": "Ciwaanka Email-ka", "ar": "البريد الإلكتروني", "sw": "Barua pepe", "fr": "Adresse e-mail"},
    "Good evening,": {"en": "Good evening,", "am": "እንደምን አደሩ/ዋሉ፣"},
    "Key Takeaways": {"en": "Key Takeaways", "am": "ዋና ዋና ነጥቦች", "om": "Qabxiilee Ijoo", "ti": "ቀንድታት ነጥብታት", "so": "Qodobada Muhiimka ah", "ar": "النقاط الرئيسية المستفادة", "sw": "Mambo makuu ya kuzingatia", "fr": "Points clés à retenir"},
    "Library Files": {"en": "Library Files", "am": "የቤተ-መጽሐፍት ፋይሎች", "om": "Faayiloota Kuusaa", "ti": "ቤተ-መጻሕፍቲ ፋይላት (Library Files)", "so": "Faylasha Maktabadda", "ar": "ملفات المكتبة", "sw": "Faili za Maktaba", "fr": "Fichiers de bibliothèque"},
    "Other courses": {"en": "Other courses", "am": "ሌሎች ትምህርቶች"},
    "Prerequisites": {"en": "Prerequisites", "am": "ቅድመ ሁኔታዎች", "om": "Ulaagaalee Duraa", "ti": "ቅድመ-ኩነታት", "so": "Shuruudaha ka horreeya", "ar": "المتطلبات الأساسية", "sw": "Mahitaji ya awali", "fr": "Prérequis"},
    "Project Based": {"en": "Project Based", "am": "በፕሮጀክት ላይ የተመሠረተ", "om": "Projektiirratti Hundaa'e", "ar": "قائم على المشاريع", "sw": "Inayohusu Miradi", "fr": "Basé sur des projets"},
    "Score: 59.56%": {"en": "Score: 59.56%", "am": "ውጤት፡ 59.56%", "om": "Qabxii: 59.56%", "ti": "ውጽኢት: 59.56%"},
    "Submit Answer": {"en": "Submit Answer", "am": "መልስ አስገባ", "om": "Deebii Galchaa", "ti": "መልሲ ኣእትዉ", "so": "Geli Jawaabta", "ar": "إرسال الإجابة", "sw": "Wasilisha jibu", "fr": "Soumettre la réponse"},
    "Course Details": {"en": "Course Details", "am": "የኮርሱ ዝርዝር መግለጫዎች", "om": "Bal'ina Barnootichaa", "ti": "ዝርዝር ኮርሱ", "so": "Faahfaahinta Koorsada", "ar": "تفاصيل الدورة التدريبية", "sw": "Maelezo ya Kozi", "fr": "Détails du cours"},
    "Estimated Time": {"en": "Estimated Time", "am": "የሚፈጀው ጊዜ", "om": "Yeroo Tilmaamame", "ti": "ዝግመት ግዜ", "so": "Waqtiga lagu qiyaasay", "ar": "الوقت المقدر", "sw": "Muda uliokadiriwa", "fr": "Durée estimée"},
    "GitHub Content": {"en": "GitHub Content", "am": "የጊትሃብ ይዘት (GitHub Content)", "om": "Qabiyyee GitHub", "ar": "محتوى GitHub", "sw": "Maudhui ya GitHub"},
    "Grading Rubric": {"en": "Grading Rubric", "am": "የውጤት መስጫ መስፈርት", "om": "Ulaagaa Madaallii Qabxii", "ti": "ናይ ምዘና መምዘኒ", "so": "Halbeegga Qiimeynta", "ar": "معايير التقييم", "sw": "Vigezo vya tathmini", "fr": "Grille d'évaluation"},
    "Markdown guide": {"en": "Markdown guide", "am": "የማርክዳውን አጠቃቀም መመሪያ", "om": "Qajeelfama Maarkidaawun", "ti": "ናይ ማርክዳውን መምርሒ", "so": "Hagaha Markdown", "ar": "دليل ماركداون", "sw": "Mwongozo wa Markdown", "fr": "Guide Markdown"},
    "Prerequisites:": {"en": "Prerequisites:", "am": "ቅድመ ሁኔታዎች፡", "ti": "ቅድመ-ሁኔታዎች፡", "ar": "المتطلبات الأساسية:", "sw": "Masharti ya awali:", "fr": "Prérequis :"},
    "Qualifications": {"en": "Qualifications", "am": "የትምህርት እና የልምድ ዝግጅት", "om": "Ga'umsa Barbaachisu", "ti": "ብቕዓት", "so": "Shahaadooyinka & Khibradda", "ar": "المؤهلات المطلوبة", "sw": "Sifa Zilizohitajika", "fr": "Qualifications"},
    "human strength": {"en": "human strength", "am": "የሰው ልጅ አቅም", "om": "humna namaa", "ti": "ሰብኣዊ ሓይሊ", "so": "Awoodda bini'aadanka", "ar": "القدرات البشرية", "sw": "nguvu ya binadamu", "fr": "force humaine"},
    "Competent (75%)": {"en": "Competent (75%)", "am": "ብቁ (75%)", "om": "Ga'umsa Qabu (75%)", "ti": "ብቑዕ (75%)", "so": "Awood leh (75%)", "ar": "كفء (75%)", "sw": "Inayofaa (75%)", "fr": "Compétent (75 %)"},
    "Course Overview": {"en": "Course Overview", "am": "የኮርስ አጠቃላይ እይታ", "om": "Ibsa waliigalaa koorsii", "ti": "ሓፈሻዊ ትሕዝቶ ኮርስ", "so": "Dulmarka koorsada", "ar": "نظرة عامة على الدورة", "sw": "Muhtasari wa kozi", "fr": "Aperçu du cours"},
    "Displaying code": {"en": "Displaying code", "am": "ኮድ ማሳየት", "om": "Koodii agarsiisuu", "ti": "ኮድ ማሳየት", "ar": "عرض الكود البرمجي", "sw": "Kuonyesha msimbo"},
    "Dynamic values.": {"en": "Dynamic values.", "am": "ተለዋዋጭ እሴቶች።", "om": "Gatii jijjiiramaa (Dynamic values).", "ti": "ተለዋዋጢ ዋጋታት (Dynamic values)", "ar": "قيم ديناميكية.", "sw": "Thamani zinazobadilika."},
    "Grading Rubric:": {"en": "Grading Rubric:", "am": "የደረጃ አሰጣጥ መመሪያ፡", "ar": "معايير التقييم:", "fr": "Grille de notation :"},
    "Job Description": {"en": "Job Description", "am": "የስራ ዝርዝር መግለጫ", "om": "Ibsa Hojii", "ti": "ናይ ስራሕ መግለጺ", "so": "Faahfaahinta Shaqada", "ar": "الوصف الوظيفي", "sw": "Maelezo ya Kazi", "fr": "Description du poste"},
    "Knowledge Check": {"en": "Knowledge Check", "am": "የእውቀት ፍተሻ", "om": "Hubannoo Madaaluu", "ti": "ናይ ፍልጠት ምፍታሽ", "so": "Hubinta Aqoonta", "ar": "التحقق من الفهم", "sw": "Upimaji wa maarifa", "fr": "Contrôle des connaissances"},
    "My Applications": {"en": "My Applications", "am": "ያመለከትኳቸውሥራዎች", "om": "Iyyannoo Koo", "so": "Codsiyadayda", "ar": "طلبات توظيفي", "sw": "Maombi Yangu", "fr": "Mes candidatures"},
    "Python & Docker": {"en": "Python & Docker", "am": "ፓይዘን እና ዶከር", "om": "Paayitoniifi Dokarii (Python & Docker)", "ar": "بايثون ودوكر", "sw": "Python na Docker", "fr": "Python & Docker"},
    "Rive Animations": {"en": "Rive Animations", "am": "የራይቭ እነማዎች (Rive Animations)", "om": "Sochiiwwan Rive (Rive Animations)", "ti": "Rive ኣኒሜሽንስ", "so": "Dhaqdhaqaaqyada Rive", "ar": "رسومات Rive المتحركة", "sw": "Michoro ya Rive (Rive Animations)", "fr": "Animations Rive"},
    "Savanna Careers": {"en": "Savanna Careers", "am": "ሳቫና ከሪርስ", "om": "Savanna Careers", "ti": "ሳቫና ከሪያርስ", "so": "Savanna Careers", "ar": "وظائف سافانا", "sw": "Kazi za Savanna", "fr": "Savanna Careers"},
    "Skills Required": {"en": "Skills Required", "am": "የሚያስፈልጉ ክህሎቶች", "om": "Dandeettiiwwan Barbaachisan", "ti": "ዘድልዩ ክእለታት", "so": "Xirfadaha Loo Baahan Yahay", "ar": "المهارات المطلوبة", "sw": "Ujuzi Unaohitajika", "fr": "Compétences requises"},
    "Upcoming events": {"en": "Upcoming events", "am": "የሚመጡ ሁነቶች", "om": "Taateewwan dhufan", "ti": "ዝመጹ መደባት", "so": "Dhacdooyinka soo socda", "ar": "الأحداث القادمة", "sw": "Matukio yajayo", "fr": "Événements à venir"},
    "Video on demand": {"en": "Video on demand", "am": "ተፈላጊ ቪዲዮዎች", "om": "Viidiyoo filannoon", "ti": "ብሕቶ ዝቐርብ ቪድዮ", "so": "Fiidiyow dalab ah", "ar": "فيديو حسب الطلب", "sw": "Video kwa ombi", "fr": "Vidéo à la demande"},
    "Worked example.": {"en": "Worked example.", "am": "የተሰራ ምሳሌ።", "om": "Fakkeenya hojjetame.", "ti": "እተሰርሐ ኣብነት።", "ar": "مثال عملي.", "sw": "Mfano uliotatuliwa."},
    "Your Score: 16%": {"en": "Your Score: 16%", "am": "ያገኙት ውጤት፦ 16%", "om": "Qabxii Keessan: 16%", "ti": "ንብረብካ/ውጽኢትካ፦ 16%", "so": "Dhibcahaaga: 16%", "ar": "نتيجتك: 16%", "sw": "Alama Yako: 16%", "fr": "Votre score : 16 %"},
    "$600 - $950 / mo": {"en": "$600 - $950 / mo", "am": "$600 - $950 / በወር", "om": "$600 - $950 / ji'aan", "ti": "$600 - $950 / ወርሒ", "so": "$600 - $950 / bishii", "ar": "600 دولار - 950 دولار / شهرياً", "sw": "$600 - $950 / mwezi", "fr": "$600 - $950 / mois"},
    "0 of 1 completed": {"en": "0 of 1 completed", "am": "ከ 1 0 ተጠናቋል", "om": "0 kan 1 irraa xumurameera", "ti": "ካብ 1 እቲ 0 ተዛዚሙ", "so": "0 ka mid ah 1 waa la dhameeyay", "ar": "تم إنجاز 0 من 1", "sw": "0 kati ya 1 imekamilika", "fr": "0 sur 1 complété"},
    "02 - 09 Nov 2026": {"en": "02 - 09 Nov 2026", "am": "02 - 09 ህዳር 2026", "om": "02 - 09 Sadaasa 2026", "ti": "02 - 09 ሕዳር 2026"},
    "1 of 2 completed": {"en": "1 of 2 completed", "am": "ከ 2 1 ተጠናቋል", "om": "1 kan 2 irraa xumurameera", "ti": "ካብ 2 እቲ 1 ተዛዚሙ", "so": "1 ka mid ah 2 waa la dhameeyay", "ar": "تم إنجاز 1 من 2", "sw": "1 kati ya 2 imekamilika", "fr": "1 sur 2 complété"},
    "25 legacy points": {"en": "25 legacy points", "ti": "25 ናይ ውርሻ ነጥብታት", "so": "25 dhibcood oo dhaxal ah", "fr": "25 points d'héritage"},
    "Chidi InlineChat": {"en": "Chidi InlineChat", "am": "ቺዲ የውስጥ ቻት (Chidi InlineChat)", "om": "Chiidi AyinlayinChaati (InlineChat)", "ti": "ቺዲ ኢንላይን ቻት (Chidi InlineChat)", "so": "Wada-hadalka Tooska ah ee Chidi", "ar": "محادثة شيدي المباشرة (Chidi InlineChat)", "sw": "Mazungumzo ya Ndani ya Ukurasa ya Chidi", "fr": "Chat intégré Chidi"},
    "Conference rooms": {"en": "Conference rooms", "am": "የስብሰባ ክፍሎች", "om": "Kutaa waltajjii", "ti": "ናይ ኣኼባ ኣደራሻት", "so": "Qolalka shirarka", "ar": "قاعات الاجتماعات", "sw": "Vyumba vya mkutano", "fr": "Salles de conférence"},
    "Exemplary (100%)": {"en": "Exemplary (100%)", "am": "ልዩ (100%)", "om": "Fakkeenya Ta'uu Danda'u (100%)", "ti": "ኣብነት ዝኾነ (100%)", "so": "Tusaale Fiican (100%)", "ar": "مثالي (100%)", "sw": "Ya Kipekee (100%)", "fr": "Exemplaire (100 %)"},
    "Intro to Week 10": {"en": "Intro to Week 10", "am": "የ10ኛ ሳምንት መግቢያ"},
    "Lab Instructions": {"en": "Lab Instructions", "am": "የተግባር ላብ መመሪያዎች", "om": "Qajeelfama Laabii Hojii", "ti": "ናይ ላብ መምርሒታት", "so": "Tilmaamaha Shaybaarka", "ar": "تعليمات المختبر العملي", "sw": "Maagizo ya maabara ya vitendo", "fr": "Instructions du laboratoire"},
    "Mark as complete": {"en": "Mark as complete", "am": "ተግባር ጨርስ", "om": "Xumuri", "ti": "ተወዲኡ በል", "so": "Calaamadee in la dhameeyay", "ar": "تحديد كمكتمل", "sw": "Weka alama kuwa imekamilika", "fr": "Marquer comme terminé"},
    "Markdown files (": {"en": "Markdown files (", "am": "የማርክዳውን (Markdown) ፋይሎች (", "om": "Faayiloota Markdown (", "ti": "ፋይላት Markdown (", "ar": "ملفات Markdown (", "sw": "Faili za Markdown ("},
    "Module 1: Karibu": {"en": "Module 1: Karibu", "am": "ሞጁል 1፡ ካሪቡ", "om": "Kuus-qabiyyee 1: Nagaan Dhuftan", "ti": "ክፍሊ 1፦ ካሪቡ (Karibu)", "so": "Cutubka 1: Karibu (Soo Dhawoow)", "ar": "الوحدة 1: أهلاً بك (Karibu)", "sw": "Moduli ya 1: Karibu", "fr": "Module 1 : Karibu"},
    "Module 2 Wrap Up": {"en": "Module 2 Wrap Up", "am": "የሞጁል 2 ማጠቃለያ", "om": "Cuunfaa Moodulii 2", "ti": "መዛዘሚ ክፍሊ 2", "so": "Gunaanadka Cutubka 2", "ar": "خلاصة الوحدة 2", "sw": "Hitimisho la Moduli ya 2", "fr": "Synthèse du Module 2"},
    "Responsibilities": {"en": "Responsibilities", "am": "የስራ ኃላፊነቶች", "om": "Ittigaafatamummaa", "ti": "ሓላፍነታት", "so": "Masuuliyadaha", "ar": "المسؤوليات", "sw": "Majukumu", "fr": "Responsabilités"},
    "Resume / CV Link": {"en": "Resume / CV Link", "am": "የሲቪ (CV) ሊንክ", "om": "Geessituu CV / Reezuumeef", "ti": "ናይ CV / ረሱሜ ሊንክ", "so": "Xiriiriyaha Resume / CV-ga", "ar": "رابط السيرة الذاتية", "sw": "Kiungo cha Wasifu wa Kazi (CV)", "fr": "Lien vers le CV"},
    "Why Become a VA?": {"en": "Why Become a VA?", "am": "ለምን ቨርቹዋል ረዳት መሆን ይገባል?", "om": "Maaliif VA ta'uu qabda?", "ti": "ስለምንታይ ኢኻ ቨርቹዋል ረዳኢ ክትከውን ትደሊ?", "so": "Maxaad u Noqonaysaa Kaaliye Virtual ah?", "ar": "لماذا تصبح مساعداً افتراضياً؟", "sw": "Kwa Nini Uwe Msaidizi wa Mtandaoni (VA)?", "fr": "Pourquoi devenir AS ?"},
    "4 positions found": {"en": "4 positions found", "am": "4 የሥራ መደቦች ተገኝተዋል", "om": "Bakkeewwan hojii 4 argaman", "ti": "4 ስራሕቲ ተረኺቦም", "so": "Lama helay 4 boos", "ar": "تم العثور على 4 وظائف", "sw": "Nafasi 4 zimepatikana", "fr": "4 postes trouvés"},
    "Create your local": {"en": "Create your local", "am": "የእርስዎን ሎካል (local)", "om": "Naannoo keessaniif uumaa", "ti": "ናይ ከባቢኻ (local) ዝኾነ ፍጠር", "ar": "أنشئ ملفك المحلي", "sw": "Unda faili lako la hapa nchini", "fr": "Créez votre fichier local"},
    "Deploy Container:": {"en": "Deploy Container:", "am": "Կոնտեյነር ማሰማራት (Deploy Container):", "om": "Konteenara Fe'i (Deploy):", "ti": "ኮንተይነር ኣዋርሕ (Deploy Container):", "so": "Geli Container-ka (Deploy Container):", "ar": "نشر الحاوية:", "sw": "Weka Kontena (Deploy Container):", "fr": "Déployer le conteneur :"},
    "Downloadable file": {"en": "Downloadable file", "am": "የሚወርድ ፋይል", "om": "Faayila buufamuu danda'u", "ti": "ዝወርድ ፋይል", "so": "Fayl la soo degsan karo", "ar": "ملف قابل للتنزيل", "sw": "Faili inayoweza kupakuliwa", "fr": "Fichiers téléchargeables"},
    "Module 2 Overview": {"en": "Module 2 Overview", "am": "የሞጁል 2 አጠቃላይ እይታ", "om": "Ilaalcha Waliigalaa Kuus-qabiyyee 2", "ti": "ናይ ክፍሊ 2 ሓፈሻዊ ትሕዝቶ", "so": "Guudmarka Cutubka 2", "ar": "نظرة عامة على الوحدة 2", "sw": "Muhtasari wa Moduli ya 2", "fr": "Aperçu du module 2"},
    "Overall Progress:": {"en": "Overall Progress:", "am": "አጠቃላይ ሂደት፡", "om": "Guddina Waliigalaa:", "ti": "ሓፈሻዊ ምዕባለ:"},
    "RemoteWork Africa": {"en": "RemoteWork Africa", "am": "ሪሞት ዎርክ አፍሪካ", "om": "RemoteWork Africa", "ti": "ሪሞት ዎርክ ኣፍሪካ", "so": "RemoteWork Africa", "ar": "ريموت وورك أفريكا", "sw": "RemoteWork Africa", "fr": "RemoteWork Africa"},
    "See all my events": {"en": "See all my events", "am": "ሁሉንም ሁነቶች ተመልከት", "om": "Taateewwan koo hunda ilaali", "ti": "ኲሎም መደባተይ ርአ", "so": "Arag dhammaan dhacdooyinka", "ar": "عرض جميع أحداثي", "sw": "Tazama matukio yangu yote", "fr": "Voir tous mes événements"},
    "See score details": {"en": "See score details", "am": "የውጤት ዝርዝሮችን ይመልከቱ", "om": "Bal’ina qabxii ilaali", "ti": "ዝርዝር ውጽኢት ርአ"},
    "Task to complete:": {"en": "Task to complete:", "am": "ሊጠናቀቅ የሚገባው ተግባር፡", "om": "Hojii xumuramu qabu:"},
    "You are busy with": {"en": "You are busy with", "am": "አሁን እየሠሩበት ያለው", "om": "Hojii kana irratti argamta"},
    "$900 - $1,300 / mo": {"en": "$900 - $1,300 / mo", "am": "$900 - $1,300 / በወር", "om": "$900 - $1,300 / ji'aan", "ti": "$900 - $1,300 / ወርሒ", "so": "$900 - $1,300 / bishii", "ar": "900 دولار - 1,300 دولار / شهرياً", "sw": "$900 - $1,300 / mwezi", "fr": "$900 - $1 300 / mois"},
    "). Available keys:": {"en": "). Available keys:", "am": ")። የሚገኙ ቁልፎች:", "om": "). Sagaleewwan ykn furtuuwwan jiran:", "ti": "). ዝርከቡ መርገብቲ (keys):", "ar": "). المفاتيح المتاحة:", "sw": "). Funguo zinazopatikana:"},
    "Access my learning": {"en": "Access my learning", "am": "ትምህርቴን ይድረሱ", "om": "Barnoota koo banaa", "ti": "ትምህርተይ ዕሰሉ", "so": "Gal waxbarashadayda", "ar": "الوصول إلى تعلمي", "sw": "Fikia masomo yangu", "fr": "Accéder à mes cours"},
    "Course Progression": {"en": "Course Progression", "am": "የኮርስ ሂደት", "om": "Adeemsa koorsii", "ti": "ዕቤት ኮርስ", "so": "Horumarka koorsada", "ar": "التقدم في الدورة", "sw": "Maendeleo ya kozi", "fr": "Progression du cours"},
    "Evaluation quizzes": {"en": "Evaluation quizzes", "am": "የግምገማ ፈተናዎች", "om": "Qormaata madaallii", "ti": "ናይ ምዘና ፈተናታት", "so": "Kediska qiimeynta", "ar": "اختبارات التقييم", "sw": "Maswali ya tathmini", "fr": "Quiz d'évaluation"},
    "Submit Application": {"en": "Submit Application", "am": "ማመልከቻ አስገባ", "om": "Iyyannoo Galchuu", "ti": "ሕጹይነት ኣእቱ", "so": "Gudbi Codsiga", "ar": "إرسال الطلب", "sw": "Wasilisha Maombi", "fr": "Soumettre sa candidature"},
    "unlock next course": {"en": "unlock next course", "ti": "ዝቕጽል ኮርስ ክፈት", "so": "fur koorsada xigta", "fr": "débloquer le cours suivant"},
    ", engineers rely on": {"en": ", engineers rely on", "am": "ስትነድፉ፣ መሐንዲሶች", "om": ", injineeronni ni hirkatu", "ti": "ኢንጂነራት ኣብዚ ይምርኮሱ", "so": ", injineeradu waxay ku tiirsan yihiin", "ar": "، يعتمد المهندسون على", "sw": ", wahandisi hutegemea", "fr": ", les ingénieurs s'appuient sur"},
    "EthioTech Solutions": {"en": "EthioTech Solutions", "am": "ኢትዮቴክ ሶሉሽንስ", "om": "Furmaataalee EthioTech", "ti": "ኢትዮ-ቴክ መፍትሒታት", "so": "EthioTech Solutions", "ar": "إيثيوتيك للحلول", "sw": "EthioTech Solutions", "fr": "EthioTech Solutions"},
    "Execute Test Suite:": {"en": "Execute Test Suite:", "am": "የሙከራ ስብስቡን (Test Suite) ያስፈጽሙ፡", "om": "Suuti Qormaataa (Test Suite) Raawwadhaa:", "ti": "ናይ መርመራ ስብስብ (Test Suite) ኣፈጻጸም:", "ar": "تنفيذ مجموعة الاختبارات:", "sw": "Tekeleza Mkusanyiko wa Majaribio (Test Suite):", "fr": "Exécuter la suite de tests :"},
    "Learning Objectives": {"en": "Learning Objectives", "am": "የትምህርቱ ግቦች", "om": "Kaayyolee Barnootaa", "ti": "ናይ ትምህርቲ ሸቶታት", "so": "Ujeedooyinka Waxbarashada", "ar": "الأهداف التعليمية", "sw": "Malengo ya mafunzo", "fr": "Objectifs d'apprentissage"},
    "Module 2 Recap Quiz": {"en": "Module 2 Recap Quiz", "am": "የሞጁል 2 የማጠቃለያ ፈተና", "om": "Gaaffii fi Deebii Cuunfaa Moodulii 2", "ti": "ናይ ክፍሊ 2 ሓጺር መርመራ ግምገማ", "so": "Kediska Dib-u-eegista Cutubka 2", "ar": "اختبار مراجعة الوحدة 2", "sw": "Jaribio la Mapitio la Moduli ya 2", "fr": "Quiz récapitulatif du module 2"},
    "Per-page overrides.": {"en": "Per-page overrides.", "am": "በእያንዳንዱ ገጽ ላይ የሚደረጉ ለውጦች።", "om": "Jijjiirama fuula-fuulaan jiru.", "ti": "ንነፍሲ ወከፍ ገጽ ዝግበር ንዕቀት (Per-page overrides)", "ar": "التعديلات المخصصة لكل صفحة.", "sw": "Mabadiliko ya kila ukurasa."},
    "in the years ahead.": {"en": "in the years ahead.", "am": "በሚቀጥሉት ዓመታት።", "om": "waggoota dhufan keessatti.", "ti": "ኣብቶም ዝመጹ ዓመታት።", "so": "sanadaha soo socda.", "ar": "في السنوات القادمة.", "sw": "katika miaka ijayo.", "fr": "dans les années à venir."},
    "— repository name —": {"en": "— repository name —", "am": "— የማጠራቀሚያው (repository) ስም —", "om": "— maqaa kuusaa (repository) —", "ti": "— ሽም ረፖዚቶሪ (repository) —", "ar": "— اسم المستودع —", "sw": "— jina la hifadhi (repository) —"},
    "$1,100 - $1,600 / mo": {"en": "$1,100 - $1,600 / mo", "am": "$1,100 - $1,600 / ወር", "om": "$1,100 - $1,600 / ji'a", "ti": "$1,100 - $1,600 / ወር", "so": "$1,100 - $1,600 / bishii", "ar": "1,100$ - 1,600$ / شهرياً", "sw": "$1,100 - $1,600 / kwa mwezi", "fr": "1 100 $ - 1 600 $ / mois"},
    "$1,400 - $2,000 / mo": {"en": "$1,400 - $2,000 / mo", "am": "$1,400 - $2,000 / ወር", "om": "$1,400 - $2,000 / ji'a", "ti": "$1,400 - $2,000 / ብወርሒ", "so": "$1,400 - $2,000 / bishii", "ar": "1,400$ - 2,000$ / شهرياً", "sw": "$1,400 - $2,000 / mwezi", "fr": "1 400 $ - 2 000 $ / mois"},
    "31 Aug - 20 Dec 2026": {"en": "31 Aug - 20 Dec 2026", "am": "ነሐሴ 25 - ታኅሣሥ 11 ቀን 2019", "om": "31 Hagayya - 20 Muddee 2026", "ti": "31 ነሓሰ - 20 ታሕሳስ 2026"},
    "An encouraging truth": {"en": "An encouraging truth", "am": "የሚያበረታታ እውነት", "om": "Dhugaa nama jajjabeessu", "ti": "ዘተባብዕ ሓቂ", "so": "Xaqiiqo dhiirigelin leh", "ar": "حقيقة مشجعة", "sw": "Ukweli unaotia moyo", "fr": "Une vérité encourageante"},
    "Auto-detected types:": {"en": "Auto-detected types:", "am": "በራስ-ሰር የታወቁ አይነቶች፡", "om": "Gosoota ofumaan beekaman:", "ti": "ባዕሉ ዝለለዮ ዓይነት:", "so": "Noocyada si toos ah loo aqoonsaday:", "ar": "الأنواع المُكتشفة تلقائياً:", "sw": "Aina zilizotambuliwa kiotomatiki:", "fr": "Types détectés automatiquement :"},
    "CSS style available:": {"en": "CSS style available:", "am": "የ CSS ስታይል ይገኛል፡", "om": "Haalli CSS ni argama:", "ti": "ዝርከብ CSS ስታይል:", "so": "Qaabka CSS ee la heli karo:", "ar": "نمط CSS المتاح:", "sw": "Mtindo wa CSS unapatikana:", "fr": "Style CSS disponible :"},
    "Continue this course": {"en": "Continue this course", "am": "ይህን ኮርስ ይቀጥሉ", "om": "Koorsii kana itti fufaa", "ti": "ነዚ ኮርስ ቀጽልዎ", "so": "Sii wad koorsadan", "ar": "متابعة هذه الدورة", "sw": "Endelea na kozi hii", "fr": "Continuer ce cours"},
    "Global Outsource Ltd": {"en": "Global Outsource Ltd", "am": "ግሎባል ഔትሶርስ ሊሚትድ", "om": "Global Outsource Ltd", "ti": "ግሎባል ഔትሶርስ ድርጅት", "so": "Global Outsource Ltd", "ar": "شركة جلوبال أوتسورس المحدودة", "sw": "Global Outsource Ltd", "fr": "Global Outsource Ltd"},
    "Savanna static pages": {"en": "Savanna static pages", "am": "ሳቫና የትምህርት መድረክ ገጾች", "om": "Fuulota Saavannaa", "ti": "ናይ ሳቫና ትምህርታዊ ገጻት", "so": "Bogagga Madasha Savanna", "ar": "صفحات منصة سافانا التعليمية", "sw": "Kurasa za jukwaa la Savanna", "fr": "Pages de la plateforme Savanna"},
    "Skip to main content": {"en": "Skip to main content", "am": "ወደ ዋናው ይዘትዝለሉ", "om": "Gara qabiyyee ijoo darbi", "ti": "ወደ ዋናው ይዘት ማለፊያ", "so": "U gudub nuxurka koowaad", "ar": "الانتقال إلى المحتوى الرئيسي", "sw": "Rukia maudhui makuu", "fr": "Aller au contenu principal"},
    "Your upcoming events": {"en": "Your upcoming events", "am": "ሊደረጉ የታቀዱ መርሃ ግብሮችዎ", "om": "Qophiiwwan dhufan", "ti": "እዋናዊ መደባትካ/ኪ"},
    "End of Module 2 Check": {"en": "End of Module 2 Check", "am": "የሞጁል 2 ማጠናቀቂያ ማረጋገጫ", "om": "Sakatta'insa Dhuma Moodulii 2", "ti": "መፍተኒ መወዳእታ ክፍሊ 2", "so": "Hubinta Dhamaadka Cutubka 2", "ar": "تقييم نهاية الوحدة 2", "sw": "Uhakiki wa Mwisho wa Moduli ya 2", "fr": "Vérification de fin du Module 2"},
    "Full-Stack Cloud & AI": {"en": "Full-Stack Cloud & AI", "am": "ሙሉ-ቁልል ክላውድ እና AI (Full-Stack Cloud & AI)", "om": "Kulaawudii fi AI Guutuu (Full-Stack)", "ti": "ምሉእ-መደብ ዓቐብ-መዝገብን ሰብ-ሰራሕ ብልሓትን (Full-Stack Cloud & AI)", "ar": "الحوسبة السحابية المتكاملة والذكاء الاصطناعي", "sw": "Wingu na AI ya Full-Stack", "fr": "Cloud Full-Stack et IA"},
    "Go to the next course": {"en": "Go to the next course", "am": "ወደ ቀጣዩ ኮርስ ሂድ", "om": "Gara koorsii itti aanuutti darbi", "ti": "ናብቲ ዝቕጽል ትምህርቲ ኪድ", "so": "U gudub koorsada xigta", "ar": "الانتقال إلى الدورة التدريبية التالية", "sw": "Nenda kwenye kozi inayofuata", "fr": "Passer au cours suivant"},
    "QA Reviews I can make": {"en": "QA Reviews I can make", "am": "የእኩዮች ግምገማዎች (QA)", "om": "Gamaaggama QA gochuu danda’u", "ti": "ናይ ብጾት ገምጋማት (QA)", "so": "Dib u eegista QA ee aan samayn karo", "ar": "مراجعات الجودة المتاحة", "sw": "Mapitio ya QA ninayoweza kufanya", "fr": "Revues QA disponibles"},
    "Rising specialization": {"en": "Rising specialization", "am": "እየጨመረ የመጣው ልዩ ባለሙያተኝነት", "om": "Ogummaa addaa dabalaa dhufe", "ti": "ዝዓበየ ፍሉይነት", "so": "Khibrad gaar ah oo kor u kacaysa", "ar": "التخصص المتنامي", "sw": "Kuongezeka kwa utaalamu maalum", "fr": "Spécialisation croissante"},
    "Savanna Digital Media": {"en": "Savanna Digital Media", "am": "ሳቫና ዲጂታል ሚዲያ", "om": "Miidiyaa Dijitaala Savanna", "ti": "ሳቫና ዲጂታል ሚዲያ", "so": "Savanna Digital Media", "ar": "سافانا للوسائط الرقمية", "sw": "Savanna Digital Media", "fr": "Savanna Digital Media"},
    "Specialized expertise": {"en": "Specialized expertise", "am": "ልዩ ባለሙያተኝነት", "om": "Dandeettii addaa", "ti": "ፍሉይ ብቕዓት ወይ ክእለት (Specialized expertise)", "so": "Khabiirnimo gaar ah", "ar": "الخبرة المتخصصة", "sw": "Utaalamu maalum", "fr": "expertise spécialisée"},
    "Your overall progress": {"en": "Your overall progress", "am": "አጠቃላይ የእርስዎን ሂደት", "om": "Guddina kee waliigalaa", "ti": "ሓፈሻዊ ምዕባለኻ/ኪ"},
    "AI software assistants": {"en": "AI software assistants", "am": "አርቴፊሻል ኢንተለጀንስ (AI) ሶፍትዌር ረዳቶችን", "om": "gargaartota sagantaa (software) AI", "ti": "ሶፍትዌር ረዳኢ ሰብ ሰራሕ ኣእምሮ (AI)", "so": "kaaliyeyaasha software-ka ee AI", "ar": "برمجيات المساعدة المدعومة بالذكاء الاصطناعي", "sw": "programu za usaidizi za AI", "fr": "des assistants logiciels d'IA"},
    "Lesson 1: Introduction": {"en": "Lesson 1: Introduction", "am": "ትምህርት 1፡ መግቢያ", "om": "Barnoota 1: Seensa", "ti": "ትምህርቲ 1፡ መእተዊ", "so": "Casharka 1: Hordhac", "ar": "الدرس 1: مقدمة", "sw": "Somo la 1: Utangulizi", "fr": "Leçon 1: Introduction"},
    "Module 2: What is a VA": {"en": "Module 2: What is a VA", "am": "ሞጁል 2፡ የቨርቹዋል ረዳት (VA) ምንድን ነው?", "om": "Kuus-qabiyyee 2: VA jechuun maal jechuudha?", "ti": "ክፍሊ 2፦ ቨርቹዋል ረዳኢ (VA) ማለት እንታይ እዩ?", "so": "Cutubka 2: Waa maxay Kaaliyaha Virtual-ka (VA)?", "ar": "الوحدة 2: ما هو المساعد الافتراضي (VA)", "sw": "Moduli ya 2: VA ni Nini", "fr": "Module 2 : Qu'est-ce qu'un·e AS ?"},
    "You're slightly behind": {"en": "You're slightly behind", "am": "ትንሽ ዘግይተዋል", "om": "Xincoo duubatti haftoota", "ti": "ቁሩብ ድሕሪት ተሪፍካ/ኪ ኣለኻ/ኺ"},
    "AI Foundations for Work": {"en": "AI Foundations for Work", "am": "አርቴፊሻል ኢንተለጀንስ (AI) ለስራ ቦታ", "om": "Bu’uura AI Hojiif", "ti": "መሰረታት AI ንስራሕ", "so": "Aasaaska AI ee Shaqada", "ar": "أساسيات الذكاء الاصطناعي للعمل", "sw": "Misingi ya AI kwa Kazi", "fr": "Fondations de l'IA pour le travail"},
    "AI-powered productivity": {"en": "AI-powered productivity", "am": "በአርቴፊሻል ኢንተለጀንስ (AI) የሚታገዝ ምርታማነት", "om": "Bu'aa qabeessummaa humna AI-tiin deeggarame", "ti": "ብ ሰብ ሰራሕ ኣእምሮ (AI) ዝተደገፈ ውጽኢታዊነት", "so": "Wax-soosaarka uu xoojiyay AI", "ar": "الإنتاجية المدعومة بالذكاء الاصطناعي", "sw": "Tija inayochochewa na Akili Bandia (AI)", "fr": "Productivité propulsée par l'IA"},
    "Congratulations, Amara!": {"en": "Congratulations, Amara!", "am": "እንኳን ደስ አላት፣ አማራ!", "om": "Baga geesse, Amara!", "ti": "እንኳን ደስ አለዎት፣ አማራ!", "so": "Hambalyo, Amara!", "ar": "تهانينا، أمارا!", "sw": "Hongera sana, Amara!", "fr": "Félicitations, Amara !"},
    "Estimated Time: 4 Hours": {"en": "Estimated Time: 4 Hours", "am": "የተገመተው ጊዜ፡ 4 ሰዓታት", "om": "Fayyadamni Yeroo Tilmaamame: Sa'aa 4", "ti": "ግምታዊ ግዜ፦ 4 ሰዓታት", "ar": "الوقت المقدر: 4 ساعات", "sw": "Muda uliokadiriwa: Saa 4", "fr": "Temps estimé : 4 heures"},
    "Excellent human service": {"en": "Excellent human service", "am": "ድንቅ የሰው ልጅ አገልግሎት", "om": "Tajaajila namummaa olaanaa", "ti": "ሉዑል ሰብኣዊ ኣገልግሎት", "so": "Adeeg bini'aadan oo heer sare ah", "ar": "الخدمة البشرية الممتازة", "sw": "Huduma bora ya kibinadamu", "fr": "excellent service humain"},
    "Graduation Requirements": {"en": "Graduation Requirements", "am": "የምረቃ መስፈርቶች", "om": "Ulaagaalee Eebbaa", "ti": "ናይ ምረቓ ረቋሒታት", "so": "Shuruudaha Qalin-jabinta", "ar": "متطلبات التخرج", "sw": "Mahitaji ya Mahafali", "fr": "Exigences de diplomation"},
    "More digital operations": {"en": "More digital operations", "am": "ተጨማሪ ዲጂታል ስራዎች", "om": "Hojiiwwan dijitaalaa dabalan", "ti": "ዝያዳ ዲጂታላዊ ስርሓት", "so": "Hawlgallo digital ah oo badan", "ar": "المزيد من العمليات الرقمية", "sw": "Shughuli nyingi za kidijitali", "fr": "Des opérations plus numériques"},
    "Binding values may embed": {"en": "Binding values may embed", "am": "የማያያዝ እሴቶች ሊካተቱ ይችላሉ", "om": "Gatiileen hidhaman hammachuu danda'u", "ti": "ናይ ምእሳር ዋጋታት ከእትዉ ይኽእሉ እዮም", "so": "Qiimayaasha xiriirinta waa lagu dhex dari karaa", "ar": "قد تتضمن قيم الربط", "sw": "Thamani zilizounganishwa zinaweza kuwa na", "fr": "Les valeurs de liaison peuvent intégrer"},
    "Evolution of the VA Role": {"en": "Evolution of the VA Role", "am": "የቨርቹዋል ረዳት (VA) ሚና እድገት እና ለውጥ", "om": "Jijjiirama fi Guddina Gahee Hojii VA", "ti": "ምዕባለ ተራ ቨርቹዋል ረዳኢ", "so": "Horumarka Doorka Kaaliyaha Virtual-ka", "ar": "تطور دور المساعد الافتراضي", "sw": "Mabadiliko na Ukuaji wa Nafasi ya VA", "fr": "Évolution du rôle d'AS"},
    "View Course Curriculum →": {"en": "View Course Curriculum →", "am": "የኮርሱን ማስተማሪያ እቅድ ይመልከቱ →", "ar": "عرض منهج الدورة التدريبية ←", "fr": "Voir le programme du cours →"},
    "Why are you a great fit?": {"en": "Why are you a great fit?", "am": "ለዚህ 岗位 ለምን ተስማሚ ነዎት?", "om": "Maaliif namicha ykn dubartiif ta'aa sirrii taata?", "ti": "ንዚ ስራሕ እዚ ስንኡ እንታይ ይገብረካ?", "ar": "لماذا تجد نفسك مناسباً جداً لهذه الوظيفة؟", "sw": "Kwa nini unafaa sana kwa nafasi hii?", "fr": "Pourquoi correspondez-vous parfaitement à ce poste ?"},
    "Chidi embeds use a single": {"en": "Chidi embeds use a single", "am": "የቺዲ መክተቻዎች ነጠላ ይጠቀማሉ", "om": "Maxxansi Chiidi fayyadama tokko qofa", "ti": "መእተዊታት (Embeds) ቺዲ ሓደ ይጥቀሙ", "so": "Ku-dhex-galka Chidi wuxuu adeegsadaa hal", "ar": "تستخدم عمليات تضمين Chidi عنصراً واحداً", "sw": "Viunganishi vya Chidi hutumia", "fr": "Les intégrations Chidi utilisent un seul"},
    "No medical proof required": {"en": "No medical proof required", "am": "የሕክምና ማስረጃ አያስፈልግም", "om": "Ragaa yaalaa hin barbaachisu"},
    "Savanna Learning Platform": {"en": "Savanna Learning Platform", "am": "የሳቫና ትምህርት መድረክ", "om": "Marsariitii Barumsaa Savanna", "ti": "ሳቫና መማህሪ መድረኽ", "ar": "منصة التعلم سافانا", "sw": "Jukwaa la Kujifunza la Savanna", "fr": "Plateforme d'apprentissage Savanna"},
    "Live human captions (CART)": {"en": "Live human captions (CART)", "am": "ቀጥታ የሰው ጽሑፍ ትርጉም (CART)", "om": "Barreeffama qaamaan jiraatee kennamu (CART)"},
    "No accommodation requested": {"en": "No accommodation requested", "am": "ምንም ዓይነት ልዩ ማስተካከያ አልተጠየቀም", "om": "Mijeessiifni kamiyyuu hin gaafatamne"},
    "Step-by-Step Lab Checklist": {"en": "Step-by-Step Lab Checklist", "am": "የላብራቶሪ የደረጃ በደረጃ ማረጋገጫ ዝርዝር", "om": "Tarree Qormaataa Laabii Tarkaanfiin Tarkaanfiin", "ti": "ናይ ላብ ስጉምቲ ብስጉምቲ መርመራ ዝርዝር (Checklist)", "ar": "قائمة التحقق خطوة بخطوة للمختبر", "sw": "Orodha ya Hatua kwa Hatua ya Maabara", "fr": "Liste de contrôle du TP étape par étape"},
    "Test Coverage & Validation": {"en": "Test Coverage & Validation", "am": "የፈተና ሽፋን እና ማረጋገጫ (Test Coverage & Validation)", "om": "Haguuggiifi Madaalli Qorannoo (Test Coverage & Validation)", "ti": "ሽፋን ፈተናን መረጋገጺን", "so": "Baaxadda Tijaabada & Xaqiijinta", "ar": "تغطية الاختبارات والتحقق من الصحة", "sw": "Upeo wa Majaribio na Uthibitishaji", "fr": "Couverture des tests et validation"},
    "human remote professionals": {"en": "human remote professionals", "am": "ሰዎች የሆኑ የርቀት ባለሙያዎችን", "om": "ogeyyii fagoorra hojjetan", "ti": "ሰብ ሞያ ብርሕቀት ዘለዉ ሰባት", "so": "xirfadlayaasha bini'aadamka ah ee meelaha fog ka shaqeeya", "ar": "المهنيين البشريين الذين يعملون عن بُعد", "sw": "wataalamu wa kibinadamu wanaofanya kazi wakiwa mbali", "fr": "des professionnels humains à distance"},
    "support work gets done and": {"en": "support work gets done and", "am": "የድጋፍ ሥራዎች የሚከናወኑበት እና", "om": "hojiin deggersaa akka hojjetamu fi", "ti": "ዕዮ ደገፍ ከም ዝዛዘምን", "so": "shaqada taageerada loo qabto iyo", "ar": "إنجاز مهام الدعم و", "sw": "kazi za usaidizi zinavyofanyika na", "fr": "le travail de support est réalisé et"},
    "Available Job Opportunities": {"en": "Available Job Opportunities", "am": "ያሉ የሥራ እድሎች", "om": "Carraa hojii jiran", "ti": "ዘለዉ ናይ ስራሕ ዕድላት", "so": "Fursadaha Shaqo ee Banaan", "ar": "فرص العمل المتاحة", "sw": "Nafasi za Kazi Zilizopo", "fr": "Offres d'emploi disponibles"},
    "Continue where you left off": {"en": "Continue where you left off", "am": "ካቆሙበት ይቀጥሉ", "om": "Bakka dhaabdanii itti fufaa", "ti": "ካብቲ ዘቋረጽኩምዎ ቀጽሉ", "so": "Ka sii wad meeshii aad joojisay", "ar": "تابع من حيث توقفت", "sw": "Endelea pale ulipoishia", "fr": "Reprendre là où vous vous êtes arrêté"},
    "Learner homepage — v1 paced": {"en": "Learner homepage — v1 paced", "am": "የተማሪ መነሻ ገጽ — በጊዜ የተገደበ", "om": "Fuula Jalqabaa Barataa — Yeroon Murtaa’e", "ti": "ናይ ተምሃራይ መበገሲ ገጽ — ብግዜ ዝተወሰነ", "so": "Bogga Hore ee Ardayga — Xaddidan", "ar": "الصفحة الرئيسية للمتعلم — وتيرة محددة", "sw": "Ukurasa wa mwanafunzi — Kasi ya pamoja", "fr": "Accueil apprenant — Rythme guidé"},
    "Multimedia Lesson Resources": {"en": "Multimedia Lesson Resources", "am": "የመልቲሚዲያ ትምህርት መርጃዎች", "om": "Qabeenya Barnootaa Multimedia", "ti": "ብዙሕ-ሜድያዊ ንዋያት ትምህርቲ", "so": "Khayraadka Casharka ee Warbaahin-badan", "ar": "موارد الدرس متعددة الوسائط", "sw": "Rasilimali za Masomo ya Multimedia", "fr": "Ressources multimédias de la leçon"},
    "Skip to main course content": {"en": "Skip to main course content", "am": "ወደ ዋናው የኮርሱ ይዘትዝለሉ", "om": "Qabiyyee barumsaa guddaatti darbi", "ti": "ናብቲ ቀንዲ ትሕዝቶ ኮርስ ኣጽልል", "ar": "الانتقال إلى محتوى الدورة الرئيسي", "sw": "Rukia kwenye maudhui makuu ya kozi", "fr": "Aller au contenu principal du cours"},
    "Your immediate deliverables": {"en": "Your immediate deliverables", "am": "ሊሠሯቸው የሚገቡ አፋጣኝ ሥራዎች", "om": "Hojiiwwan amma xumuramuu qaban"},
    "⚠️ An Important Distinction": {"en": "⚠️ An Important Distinction", "am": "⚠️ አስፈላጊ ልዩነት", "om": "⚠️ Addaddummaa Barbaachisaa Taʼe", "ti": "⚠️ ኣገዳሲ ፍልልይ", "so": "⚠️ Farqi Muhiim ah", "ar": "⚠️ تمييز مهم", "sw": "⚠️ Tofauti Muhimu", "fr": "⚠️ Une distinction importante"},
    "More remote-first businesses": {"en": "More remote-first businesses", "am": "በበለጠ የርቀት ሥራን የሚያስቀድሙ ንግዶች", "om": "Daldala fagoorraan hojjetaman kan caalaatti dabalan", "ti": "ዝያዳ ብርሕቀት ዝሰርሑ ንግስታት", "so": "Ganacsiyo badan oo fog-hore (remote-first) ah", "ar": "المزيد من الشركات التي تعتمد على العمل عن بُعد كخيار أول", "sw": "Biashara nyingi zinazotanguliza kazi za mbali", "fr": "Davantage d'entreprises axées sur le télétravail"},
    "asynchronous message brokers": {"en": "asynchronous message brokers", "am": "አሲንክሮነስ የመልእክት አስተላላፊዎችን (asynchronous message brokers)", "om": "ergamaa ergaa asinkironasiirratti", "ti": "ኣሲንክሮነሰስ መልእኽቲ መጋበርያታት (asynchronous message brokers)", "so": "dhexdhexaadiyeyaasha fariimaha ee aan isku waqtiga ahayn (asynchronous message brokers)", "ar": "وسطاء الرسائل غير المتزامنة", "sw": "wasuluhishi wa ujumbe wa asynchronous (asynchronous message brokers)", "fr": "des courtiers de messages asynchrones"},
    "what clients will value most": {"en": "what clients will value most", "am": "ደንበኞች የበለጠ ከፍ አድርገው የሚመለከቱት", "om": "maamiltoonni maal akka caalaatti kabajanii fi gatii kennaniif", "ti": "ዓማዊል እንታይ ክዋህሉዎም እዮም", "so": "waxa macaamiishu ay ugu qiimeyn doonaan", "ar": "ما سيقدره العملاء أكثر", "sw": "kile ambacho wateja watakithamini zaidi", "fr": "ce que les clients valoriseront le plus"},
    "Lesson 2: Tools and Workflows": {"en": "Lesson 2: Tools and Workflows", "am": "ትምህርት 2፡ መሳሪያዎች እና የአሰራር ሂደቶች", "om": "Barnoota 2: Meeshaalee fi Adeemsa Hojii", "ti": "ትምህርቲ 2፡ መሳርሒታትን ኣሰራርሓታትን", "so": "Casharka 2: Qalabka iyo Hababka Shaqada", "ar": "الدرس 2: الأدوات وسير العمل", "sw": "Somo la 2: Zana na Mtiririko wa Kazi", "fr": "Leçon 2: Outils et flux de travail"},
    "Requirements & Qualifications": {"en": "Requirements & Qualifications", "am": "መስፈርቶች እና ብቃቶች", "om": "Gaaffilee fi Gahumsa", "ti": "ጠለባትን ብቕዓትን", "so": "Shuruudaha & Aqoonta Loo Baahan Yahay", "ar": "المتطلبات والمؤهلات", "sw": "Mahitaji na Sifa", "fr": "Exigences et qualifications"},
    "The Future of the VA Industry": {"en": "The Future of the VA Industry", "am": "የቨርቹዋል ረዳት ኢንዱስትሪ የወደፊት ጉዞ", "om": "Gara Fuulduraa Indaastirii Gargaaraa Fageenyaa", "ti": "መጻኢ ናይ ቨርቹዋል ረዳኢ ኢንዱስትሪ", "so": "Mustaqbalka Warshadaha Caawiyaha Fog", "ar": "مستقبل صناعة المساعد الافتراضي", "sw": "Mustakabali wa Sekta ya Msaidizi Halisi", "fr": "L'avenir de l'industrie des assistants virtuels"},
    "Code Architecture & Modularity": {"en": "Code Architecture & Modularity", "am": "የኮድ አወቃቀር እና ሞዱላሪቲ (ኮድን በክፍል መከፋፈል)", "om": "Ijaarsa Koodii & Adeemsa Moodulaawaa (Code Architecture & Modularity)", "ti": "ኣቃውማ ኮድ ከምኡ'ውን ሞጁላዊነት", "so": "Dhismaha Koodka & Qayb-qaybinta", "ar": "هندسة الكود البرمجي والقابلية للتجزئة (Modularity)", "sw": "Muundo wa Nambari na Ugawaji Moduli", "fr": "Architecture du code et modularité"},
    "Compensation & Remote Benefits": {"en": "Compensation & Remote Benefits", "am": "ደመወዝ እና የርቀት ስራ ጥቅማጥቅሞች", "om": "Kaffaltii fi Faayidaawwan Hojii Fagoorratti", "ti": "መሃያይን ናይ ርሑቕ ስራሕ ረብሓታትን", "so": "Mushaarka & Faa'iidooyinka Shaqada Fog", "ar": "التعويضات ومزايا العمل عن بُعد", "sw": "Malipo na Manufaa ya Kazi ya Mbali", "fr": "Rémunération et avantages liés au télétravail"},
    "Growing demand for flexibility": {"en": "Growing demand for flexibility", "am": "እየጨመረ የመጣው የተለዋዋጭነት ፍላጎት", "om": "Fedhii jijjiiramaaf mijatu (flexibility) dabalaa dhufe", "ti": "ናይ ተዓጻጻፍነት ድሌት እንዳወሰኸ ምኻዱ", "so": "Baahida sii kordheysa ee dabacsanaanta", "ar": "الطلب المتزايد على المرونة", "sw": "Kuongezeka kwa hitaji la unyumbulifu", "fr": "Demande croissante de flexibilité"},
    "Live Help — Operator Dashboard": {"en": "Live Help — Operator Dashboard", "am": "ቀጥታ ድጋፍ — የአስተባባሪ ዳሽቦርድ", "om": "Deeggarsa Kallattii — Daashboordii Hojjataa", "ti": "ቀጥታ ደገፍ — ናይ ኣተሓባባሪ ዳሽቦርድ", "so": "Caawimaad Toos ah — Dashboard-ka Hawl-wadeenka", "ar": "المساعدة المباشرة — لوحة تحكم المشرف", "sw": "Msaada wa Moja kwa Moja — Dashibodi ya Opereta", "fr": "Aide en direct — Tableau de bord opérateur"},
    "intelligent cloud microservice": {"en": "intelligent cloud microservice", "am": "ብልጥ የክላውድ ማይክሮሰርቪስ", "om": "maaykiroosarsiisi duumessaa ogeessa", "ti": "ጠቢብ ክላውድ ማይክሮሰርቪስ", "so": "adeeg yar oo daruureed oo caqli badan (intelligent cloud microservice)", "ar": "خدمة سحابية مصغرة ذكية", "sw": "huduma ndogo ya wingu yenye akili (intelligent cloud microservice)", "fr": "microservice cloud intelligent"},
    ") in the editor toolbar: pick a": {"en": ") in the editor toolbar: pick a", "am": ") በማስተካከያ መስሪያ አሞሌ ላይ፦ ይምረጡ", "om": ") meeshaa gulaaluu irratti argamu: filadhu", "ti": ") ኣብቲ መሳርሒ ዕንጸይቲ: ሕረዩ ሓደ", "ar": ") في شريط أدوات المحرر: اختر", "sw": ") kwenye mwambaa zana wa mhariri: chagua"},
    "Advice: Tackling the Recap Quiz": {"en": "Advice: Tackling the Recap Quiz", "am": "ምክር፡ የማጠቃለያ ፈተናውን እንዴት መወጣት እንደሚቻል", "om": "Gorsa: Gaaffii fi Deebii Irra Deebii Hojjechuu", "ti": "ምኽሪ፦ ነቲ ሓጺር መርመራ ግምገማ ብኸመይ ክትዋጽኣሉ ትኽእል", "so": "Talo: Ka shaqeynta Kediska Dib-u-eegista", "ar": "نصيحة: كيفية اجتياز اختبار المراجعة", "sw": "Ushauri: Jinsi ya Kujibu Jaribio la Mapitio", "fr": "Conseil : Aborder le quiz récapitulatif"},
    "Researching information quickly": {"en": "Researching information quickly", "am": "መረጃዎችን በፍጥነት መመርመር", "om": "Odeeffannoo saffisaan qorachuu", "ti": "ሓበሬታ ብቕልጡፍ መጽናዕቲ ምግባር", "so": "Baaritaanka macluumaadka si degdeg ah", "ar": "البحث عن المعلومات بسرعة", "sw": "Kufanya utafiti wa taarifa kwa haraka", "fr": "La recherche rapide d'informations"},
    "from the Video library. Use the": {"en": "from the Video library. Use the", "am": "ከቪዲዮ ቤተ-መጽሐፍት። ይህንን ይጠቀሙ", "om": "Kuusaa Viidiyoo keessaa galchi. Fayyadami", "ti": "ካብ ቤተ-መጻሕፍቲ ቪድዮ። ነዚ ተጠቀምሉ:", "so": "oo ka yimid maktabadda Fiidiyowga. Isticmaal", "ar": "من مكتبة الفيديوهات. استخدم", "sw": "kutoka kwenye maktaba ya Video. Tumia", "fr": "depuis la bibliothèque vidéo. Utilisez"},
    "— GitHub organization or user —": {"en": "— GitHub organization or user —", "am": "— የጊትሃብ ድርጅት ወይም ተጠቃሚ —", "om": "— dhaabbata ykn fayyadamaa GitHub —", "ti": "— ትካል ወይ ተጠቃሚ GitHub —", "ar": "— منظمة أو مستخدم GitHub —", "sw": "— shirika au mtumiaji wa GitHub —"},
    "— URL to the hosted Rive file (": {"en": "— URL to the hosted Rive file (", "am": "— ለተስተናገደው የራይቭ ፋይል አድራሻ (URL)", "om": "— URL faayilii Rive kuufameef (", "ti": "— ናብቲ ዝተቐመጠሉ Rive ፋይል ዝወስድ ሊንክ (URL) (", "ar": "— رابط ملف Rive المستضاف (", "sw": "— URL ya faili la Rive lililopangishwa ("},
    "Configure Environment Variables:": {"en": "Configure Environment Variables:", "am": "የአካባቢ ተለዋዋጮችን (Environment Variables) ያዋቅሩ፡", "om": "Jijjiiramtoota Naannoo (Environment Variables) Qindeessaa:", "ti": "ናይ ከባቢ ተለዋዋጢ (Environment Variables) ኣዋቅር:", "ar": "تكوين متغيرات البيئة:", "sw": "Sanidi Vigezo vya Mazingira (Environment Variables):", "fr": "Configurer les variables d'environnement :"},
    "Insert a file hosted at a public": {"en": "Insert a file hosted at a public", "am": "ይፋዊ በሆነ አገልጋይ ላይ የተቀመጠ ፋይል አስገባ", "om": "Faayila iddoo uummataa irratti kuufame", "ti": "ኣብ ህዝባዊ መዕቆቢ ዝርከብ ፋይል ኣእቱ", "so": "Geli fayl ku yaal goob dadweyne", "ar": "أدخل ملفاً مُضافاً على", "sw": "Weka faili iliyohifadhiwa kwenye", "fr": "Insérer un fichier hébergé sur une URL publique"},
    "Latency & Reliability Under Load": {"en": "Latency & Reliability Under Load", "am": "በጭነት ስር መዘግየት እና አስተማማኝነት (Latency & Reliability Under Load)", "om": "Turtiifi Amanamummaa Fe'umsa Jalatti", "ti": "ብፅዕነት ግዜ ምዝንባልን (Latency) እምንነትን (Reliability)", "so": "Daahitaanka & Hal-ku-dhegga Xilliga Culayska", "ar": "زمن الانتقال (Latency) والموثوقية تحت الضغط", "sw": "Kuchelewa kwa Mtandao na Uaminifu Chini ya Mzigo (Latency & Reliability Under Load)", "fr": "Latence et fiabilité sous charge"},
    "Learner homepage — v1 self-paced": {"en": "Learner homepage — v1 self-paced", "am": "የተማሪ መነሻ ገጽ — በራስ ፍጥነት የሚመራ", "om": "Fuula Jalqabaa Barataa — Ofiin Geggeeffamu", "ti": "ናይ ተምሃራይ መበገሲ ገጽ — ብናይ ባዕልኻ ፍጥነት", "so": "Bogga Hore ee Ardayga — Xawaarahaaga", "ar": "الصفحة الرئيسية للمتعلم — وتيرة ذاتية", "sw": "Ukurasa wa mwanafunzi — Kasi ya binafsi", "fr": "Accueil apprenant — Rythme autonome"},
    "Module 3: VA Skills and Mindsets": {"en": "Module 3: VA Skills and Mindsets", "am": "ሞጁል 3፡ የቨርቹዋል ረዳት (VA) ክህሎቶች እና አስተሳሰቦች", "om": "Kuus-qabiyyee 3: Dandeettiiwwanii fi Yaada Qalbii VA", "ti": "ክፍሊ 3፦ ክእለታት ቨርቹዋል ረዳኢን ኣረኣእያን", "so": "Cutubka 3: Xirfadaha iyo Fikirka VA-ga", "ar": "الوحدة 3: مهارات وعقليات المساعد الافتراضي", "sw": "Moduli ya 3: Stadi na Mtazamo wa VA", "fr": "Module 3 : Compétences et états d'esprit de l'AS"},
    "Tasks completed for this period:": {"en": "Tasks completed for this period:", "am": "ለዚህ ጊዜ የተጠናቀቁ ተግባራት፡", "om": "Hojiiwwan yeroo kana keessatti xumuraman:", "ti": "ብዝሒ እዋን እዚ ዝተዛዘሙ ዕዮታት:"},
    "W3 | GRADED | 7.5% | Week 3 Test": {"en": "W3 | GRADED | 7.5% | Week 3 Test", "am": "ሳምንት 3 | ውጤት የሚሰጥበት | 7.5% | የሳምንት 3 ፈተና", "om": "T3 | Qabxii Kan Qabate | 7.5% | Qormaata Torban 3ffaa", "ti": "ሰሙን 3 | ብመዘናግዕ ዝተገምገመ | 7.5% | ፈተና ሰሙን 3"},
    "W9 | GRADED | 7.5% | Week 9 Test": {"en": "W9 | GRADED | 7.5% | Week 9 Test", "am": "ሳምንት 9 | የሚመዘን | 7.5% | የ9ኛ ሳምንት ፈተና", "om": "T9 | Qabxii Kan Qabate | 7.5% | Qormaata Torban 9ffaa", "ti": "ሰሙን 9 | ብመዘናግዕ ዝተገምገመ | 7.5% | ፈተና ሰሙን 9"},
    "with a helper file and an image:": {"en": "with a helper file and an image:", "am": "ከረዳት ፋይል እና ምስል ጋር:", "om": "faayilii gargaaraa fi fakkii wajjin:", "ti": "ሓጋዚ ፋይልን ስእልን ብምጥቃም:", "ar": "مع ملف مساعدة وصورة:", "sw": "ikiwa na faili msaidizi na picha:"},
    "Optional Reads and Market Signals": {"en": "Optional Reads and Market Signals", "am": "ተጨማሪ ንባቦች እና የገበያ ምልክቶች", "om": "Dubbisa Filannoo fi Mallattoowwan Gabaa", "ti": "መማረጺ ንባባትን ምልክታት ዕዳጋን", "so": "Akhriska Ikhtiyaariga ah iyo Tilmaamaha Suuqa", "ar": "قراءات اختيارية ومؤشرات السوق", "sw": "Nyenzo za Kusoma za Ziada na Viashiria vya Soko", "fr": "Lectures facultatives et signaux du marché"},
    "Where Do Virtual Assistants Work?": {"en": "Where Do Virtual Assistants Work?", "am": "ቨርቹዋል ረዳቶች የት ነው የሚሠሩት?", "om": "Deeggartooni Virtual eessa hojjetu?", "ti": "ቨርቹዋል ረዳእቲ ኣብ ኣበይ ይዓይዩ?", "so": "Xaggee bay Kaaliyayaasha Virtual-ku ka Shaqeeyaan?", "ar": "أين يعمل المساعدون الافتراضيون؟", "sw": "Wasaidizi wa Mtandaoni Hufanya Kazi Wapi?", "fr": "Où travaillent les assistant·e·s virtuel·le·s ?"},
    "So, is the Future of VA Promising?": {"en": "So, is the Future of VA Promising?", "am": "ታዲያ የቨርቹዋል ረዳትነት (VA) የወደፊት እጣ ፈንታ ተስፋ ሰጪ ነው?", "om": "Egaa, Fuuldurri Gargaaraa Virtual (VA) abdachiisaa dha?", "ti": "ስለዚ፡ መጻኢ ናይ VA ተስፋ ዝህብዶ እዩ?", "so": "Haddaba, Mustaqbalka VA ma yahay mid rajo leh?", "ar": "إذن، هل مستقبل العمل كassistant افتراضي واعد؟", "sw": "Kwa hiyo, Je, Wakati Ujao wa VA Una Matumaini?", "fr": "Alors, l'avenir du métier de VA est-il prometteur ?"},
    "— system prompt for the AI tutor —": {"en": "— system prompt for the AI tutor —", "am": "— ለ AI አስተማሪ የስርዓት ጥያቄ (prompt) —", "om": "— qajeelfama sirnaa barsiisaa AI tiif —", "ti": "— ሲስተም ፕሮምፕት ንኣስተማሃሪ AI —", "ar": "— موجه النظام الخاص بمعلم الذكاء الاصطناعي —", "sw": "— kidokezo cha mfumo kwa ajili ya mwalimu wa AI —"},
    "— name of the state machine to play": {"en": "— name of the state machine to play", "am": "— የሚጫወተው የሁኔታ ማሽን ስም", "om": "— maqaa maashinii haala (state machine) taphatamu", "ti": "— ክጻወት ዘለዎ ስቴት ማሽን ስም", "ar": "— اسم آلة الحالات (State Machine) المراد تشغيلها", "sw": "— jina la mashine ya hali (state machine) ya kucheza"},
    "Greater value placed on human skills": {"en": "Greater value placed on human skills", "am": "ለሰው ልጅ ችሎታዎች የሚሰጠው ትልቅ ዋጋ", "om": "Dandeettii namaatiif iddoon guddaan kennamuu", "ti": "ኣብ ሰብኣዊ ክእሎታት ዝያዳ ዋጋ ምሃብ", "so": "Qiimeyn ka weyn oo la siinayo xirfadaha bini'aadamka", "ar": "إعطاء قيمة أكبر للمهارات البشرية", "sw": "Kuthaminiwa zaidi kwa stadi za kibinadamu", "fr": "Une plus grande valeur accordée aux compétences humaines"},
    "Overview & Architectural Foundations": {"en": "Overview & Architectural Foundations", "am": "አጠቃላይ እይታ እና የስነ-ህንፃ መሰረቶች", "om": "Ilaalcha Waliigalaa & Bu'uura Karoora Interfaasii", "ti": "ሓፈሻዊ ትሕዝቶን መሰረታት ስነ-ህንጻን (Architectural Foundations)", "so": "Guudmar & Aasaaska Naqshadaynta", "ar": "نظرة عامة والأسس المعمارية", "sw": "Muhtasari & Misingi ya Usanifu", "fr": "Aperçu et fondations architecturales"},
    "Summarizing meetings or long reports": {"en": "Summarizing meetings or long reports", "am": "ስብሰባዎችን ወይም ረጅም ሪፖርቶችን ማጠቃለል", "om": "Walgahiiwwan ykn gabaasota dheeraa cuunfuu", "ti": "ኣኼባታት ወይ ነዊሕ ጸብጻባት ጽሕቖ ሓሳብ ምግባር (ምሕጻር)", "so": "Soo koobidda kulammada ama warbixinnada dhaadheer", "ar": "تلخيص الاجتماعات أو التقارير الطويلة", "sw": "Kufupisha mikutano au ripoti ndefu", "fr": "Le résumé de réunions ou de longs rapports"},
    "Durable message queues using RabbitMQ": {"en": "Durable message queues using RabbitMQ", "am": "ዘላቂ የመልእክት ኪዩዎች ራቢትኤምኪዩን (RabbitMQ) በመጠቀም", "om": "Tarree ergaa cimaa (Durable message queues) RabbitMQ fayyadamuun", "ti": "ራቢት ኤምኪው (RabbitMQ) ብምጥቃም ዝግበር ነዊሕ ዝጸንሕ መልእኽቲ መጽረዪ (message queues)", "so": "Safafka fariimaha waara (Durable message queues) oo la isticmaalayo RabbitMQ", "ar": "قوائم انتظار الرسائل الدائمة باستخدام RabbitMQ", "sw": "Foleni za ujumbe za kudumu (durable message queues) zikitumia RabbitMQ", "fr": "Files d'attente de messages durables utilisant RabbitMQ"},
    "Embed a single on-demand video by its": {"en": "Embed a single on-demand video by its", "am": "አንድን በმოთხოვና የሚገኝ ቪዲዮ በዚህ ይክተቱ", "om": "Viidiyoo fedhii irratti hundaa'u tokko karaa", "ti": "ካብዚ ዝስዕብ ሓደ ሕቶ ዝቕረበሉ ቪድዮ ኣእቱ:", "so": "Ku dheji hal fiidiyow oo dalab ah", "ar": "قم تضمين فيديو فردي حسب الطلب بواسطة", "sw": "Weka video moja inayotakiwa kwa kutumia", "fr": "Intégrer une vidéo à la demande via son"},
    "Virtual Assistant — Executive Support": {"en": "Virtual Assistant — Executive Support", "am": "ቨርቹዋል ረዳት — የሥራ አስፈፃሚ ድጋፍ", "om": "Gargaaraa Virtual — Deeggarsa Hooggantootaa", "ti": "ቪርቹዋል ረዳኢ — ላዕለዋይ ምምሕዳራዊ ደገፍ", "so": "Kaaliyaha Virtual-ka ah — Taageerada Hoggaaminta", "ar": "مساعد افتراضي — دعم تنفيذي", "sw": "Msaidizi wa Kijanja (Virtual Assistant) — Usaidizi wa Kiutendaji", "fr": "Assistant(e) Virtuel(le) — Support Exécutif"},
    "Handling complex or sensitive requests": {"en": "Handling complex or sensitive requests", "am": "ውስብስብ ወይም ሚስጥራዊ ጥያቄዎችን ማስተናገድ", "om": "Gaaffiiwwan walxaxoo ykn miira tuqan keessummeessuu", "ti": "ዝተሓላለኹ ወይ ንትንኪ ዝምልከቱ ሕቶታት ምስተናገድ", "so": "Wax ka qabashada codsiyada adag ama xasaasiga ah", "ar": "التعامل مع الطلبات المعقدة أو الحساسة", "sw": "Kushughulikia maombi magumu au nyeti", "fr": "Le traitement de demandes complexes ou sensibles"},
    "VA Foundations & Professional Identity": {"en": "VA Foundations & Professional Identity", "am": "የቨርቹዋል ረዳት መሰረታዊ ዕውቀት እና የሙያ ማንነት", "om": "Bu’uura Gargaaraa Fageenyaa fi Eenyummaa Ogummaa", "ti": "መሰረታት ቨርቹዋል ረዳኢን ሞያዊ መንነትን", "so": "Aasaaska Caawiyaha Fog iyo Aqoonsiga Xirfadeed", "ar": "أساسيات المساعد الافتراضي والهوية المهنية", "sw": "Misingi ya Msaidizi Halisi na Utambulisho wa Kitaalamu", "fr": "Fondations de l'assistant virtuel et identité professionnelle"},
    "What is Shaping the Future of VA Work?": {"en": "What is Shaping the Future of VA Work?", "am": "የቨርቹዋል ረዳት ሥራዎችን მომავል እየቀረጸ ያለው ምንድን ነው?", "om": "Maaltu Fuuldura Hojii Gargaaraa Virtual (VA) Bocaa Jira?", "ti": "እቲ ናይ VA ዕዮ መጻኢ ዝቀርጽ ዘሎ እንታይ እዩ?", "so": "Maxaa qaabeynaya Mustaqbalka Shaqada VA?", "ar": "ما الذي يشكل مستقبل عمل المساعدين الرقميين؟", "sw": "Ni Nini Kinachotengeneza Wakati Ujao wa Kazi za VA?", "fr": "Qu'est-ce qui façonne l'avenir du travail de VA ?"},
    "Concept page with curriculum navigation": {"en": "Concept page with curriculum navigation", "am": "የጽንሰ-ሀሳብ ገጽ ከስርዓተ-ትምህርት አሰሳ ጋር", "om": "Fuula Yaad-rimee fi Kallattii Barnootaa", "ti": "ናይ ጽንሰ-ሓሳብ ገጽ ምስ ስርዓተ-ትምህርቲ ዳህሳስ", "so": "Bogga fikradda oo leh hage manhaj", "ar": "صفحة المفاهيم مع تصفح المنهج", "sw": "Ukurasa wa dhana na mwongozo wa mtaala", "fr": "Page de concept avec navigation curriculaire"},
    "Data Entry & Research Virtual Assistant": {"en": "Data Entry & Research Virtual Assistant", "am": "የውሂብ ግቤት እና ጥናት ረዳት (Virtual Assistant)", "om": "Gargaaraa Virtual Galmeessa Daataa & Qorannoo", "ti": "ናይ መረዳእታ ምእካብን መጽናዕትን ዲጂታላዊ ረዳኢ", "so": "Kaaliyaha Virtual-ka ee Gelitaanka Xogta & Cilmi-baarista", "ar": "مساعد افتراضي لإدخال البيانات والأبحاث", "sw": "Msaidizi Mtandaoni wa Kuingiza Data na Utafiti", "fr": "Assistant(e) virtuel(le) en saisie de données et recherche"},
    "Fundamentals of Effective Communication": {"en": "Fundamentals of Effective Communication", "am": "ውጤታማ የግንኙነት መሰረታዊ መርሆዎች", "om": "Bu’uura Qunnamtii Bu’a-qabeessaa", "ti": "መሰረታት ውጽኢታዊ ርክብ", "so": "Aasaaska Xidhiidhka Waxtarka Leh", "ar": "أساسيات التواصل الفعال", "sw": "Misingi ya Mawasiliano Yenye Ufanisi", "fr": "Fondements d'une communication efficace"},
    "Reach 70% to be eligible for graduation": {"en": "Reach 70% to be eligible for graduation", "am": "ለምረቃ ብቁ ለመሆን 70% ይድረሱ", "om": "Eebbaaf ga’aa ta’uuf 70% qaqqabaa", "ti": "ንምረቓ ብቑዕ ንምዃን 70% ብጽሑ", "so": "Gaadh 70% si aad ugu qalanto qalin-jabinta", "ar": "احصل على 70% للتأهل للتخرج", "sw": "Fikisha 70% ili ustahili kuhitimu", "fr": "Atteignez 70% pour être éligible à la graduation"},
    "Reflection: Your Reasons to Become a VA": {"en": "Reflection: Your Reasons to Become a VA", "am": "እይታ፡ ቨርቹዋል ረዳት ለመሆን የመረጡባቸው ምክንያቶች", "om": "Yaada Xiinxala: Sababoonni ati VA ta'uuf qabdu", "ti": "ምስትንታን፦ ቨርቹዋል ረዳኢ ንምዃን ዘለዉኻ ምኽንያታት", "so": "Milicsi: Sababahaaga aad ku Noqonayso VA", "ar": "تأمل: أسبابك لتصبح مساعداً افتراضياً", "sw": "Tafakari: Sababu Zako za Kuwa VA", "fr": "Réflexion : Vos raisons de devenir AS"},
    "Supporting scheduling and transcription": {"en": "Supporting scheduling and transcription", "am": "የቀጠሮ አያያዝን እና የጽሁፍ ዝግጅትን መደገፍ", "om": "Qophii sagantaafi barreeffama sagalee gara barreeffaamaatti jijjiiruu deeggaruu", "ti": "ናይ ግዜ መደብ ምትሓዝን ቃል ናብ ጽሑፍ ምቕያርን (transcription) ምድጋፍ", "so": "Taageeridda jadwalka iyo qoraal-rogista", "ar": "دعم جدولة المواعيد والتفريغ الصوتي", "sw": "Kusaidia ratiba na uandishi wa sauti kwenda maandishi", "fr": "L'aide à la planification et à la transcription"},
    "Synchronous HTTP blocking polling loops": {"en": "Synchronous HTTP blocking polling loops", "am": "ተመሳሳይ (Synchronous) የኤችቲቲፒ ማገጃ የድምፅ መስጫ ሉፕ (polling loops)", "om": "Marsaa poolii danqaa HTTP kan wal-cinaan deemuu (Synchronous HTTP blocking polling loops)", "ti": "ተመሳሳሳይ እዋን ዘለዎ HTTP ብሎኪንግ ፖሊንግ ሉፕስ (Synchronous HTTP blocking polling loops)", "ar": "حلقات الاستطلاع المتزامنة للحظر عبر بروتوكول HTTP", "sw": "Vitanzi vya ufuatiliaji vya kuzuia vya HTTP vinavyosawazishwa (Synchronous HTTP blocking polling loops)", "fr": "Boucles de scrutation bloquantes HTTP synchrones"},
    "form below is a low-level escape hatch.": {"en": "form below is a low-level escape hatch.", "am": "ከዚህ በታች ያለው ቅጽ ዝቅተኛ ደረጃ ያለው ማምለጫ መንገድ ነው።", "om": "gadii jiru mala dabalataa sadarkaa gadii ti.", "ti": "ታሕተዋይ ቅርጺ ዝተሓተ ደረጃ መውጽኢ እዩ።", "ar": "الخام أدناه هي بمثابة مخرج طوارئ منخفض المستوى.", "sw": "fomu ya chini ni njia ya dharura ya kiwango cha chini."},
    "Live session: Structuring a persuasiv...": {"en": "Live session: Structuring a persuasiv...", "am": "ቀጥታ ስርጭት ክፍለ ጊዜ፡ አሳማኝ አቀራረብን ማዘጋጀት...", "om": "Walgahii kallattiin: Akkaataa ergaa amansiisaa itti qopheessan...", "ti": "ቀጥታዊ ክፍለ ግዜ: ነእማኒ ዝኾነ ኣቀራርባ..."},
    "Peer Learning Day — Week 10 writing c...": {"en": "Peer Learning Day — Week 10 writing c...", "am": "የባልደረባዎች የትምህርት ቀን — ሳምንት 10 የጽሑፍ...", "om": "Guyyaa Barumsa Hiriyootaa — Torban 10ffaa barreeffama c...", "ti": "ናይ መዛኑ መጽናዕቲ መዓልቲ — ሰሙን 10 ጽሕፈት..."},
    "Run the automated regression tests using": {"en": "Run the automated regression tests using", "am": "ራስ-ሰር የሪግሬሽን ሙከራዎችን (regression tests) በ ... ይጠቀሙ", "om": "Qormaata deebii sirrii (regression tests) ofiisaa fayyadamuun gaggeessi", "ti": "ነቲ አውቶማቲክ ዝኾነ ናይ ርእሰ-ምልሶ ፈተና (regression tests) ብምጥቃም ኣካይድ", "so": "Ku soco tijaabooyinka otomaatiga ah ee dib-u-celinta (regression tests) adigoo isticmaalaya", "ar": "قم بتشغيل اختبارات الانحدار الآلية باستخدام", "sw": "Endesha majaribio ya kujiendesha ya regreshini (regression tests) ukitumia", "fr": "Exécutez les tests de régression automatisés à l'aide de"},
    "So, What Exactly Is a Virtual Assistant?": {"en": "So, What Exactly Is a Virtual Assistant?", "am": "ታዲያስ፣ የቨርቹዋል ረዳት (የመስመር ላይ ረዳት) ትክክለኛ ትርጉሙ ምንድን ነው?", "om": "Egaa, Deeggaraan Virtual (Virtual Assistant) jechuun sirriitti maal jechuudha?", "ti": "ደጊምሲ፣ ቨርቹዋል ረዳኢ (Virtual Assistant) ማለት ከ እንታይ ማለት እዩ?", "so": "Haddaba, Waa Maxay Dhab ahaan Kaaliyaha Virtual-ka (VA)?", "ar": "إذن، ما هو المساعد الافتراضي بالضبط؟", "sw": "Basi, Msaidizi wa Mtandaoni (VA) Hasa Ni Nani?", "fr": "Alors, qu'est-ce qu'un·e Assistant·e Virtuel·le exactement ?"},
    "Social Media & Content Virtual Assistant": {"en": "Social Media & Content Virtual Assistant", "am": "የሶሻል ሚዲያ እና የይዘት ስራዎች ረዳት", "om": "Gargaaraa Virtual Miidiyaa Hawaasaa & Qabiyyee", "ti": "ማሕበራዊ መራኸብን ትሕዝቶን ዲጂታላዊ ረዳኢ", "so": "Kaaliyaha Virtual-ka ee Warbaahinta Bulshada & Nuxurka", "ar": "مساعد افتراضي لوسائل التواصل الاجتماعي وصناعة المحتوى", "sw": "Msaidizi Mtandaoni wa Mitandao ya Kijamii na Maudhui", "fr": "Assistant(e) virtuel(le) en réseaux sociaux et création de contenu"},
    "Virtual Assistant Market Report Overview": {"en": "Virtual Assistant Market Report Overview", "am": "የቨርቹዋል ረዳት ገበያ ሪፖርት አጠቃላይ እይታ", "om": "Gabaasa Gabaa Gargaaraa Virtual (Virtual Assistant) Irra Deebiin Ilaaluu", "ti": "ሓፈሻዊ ጸብጻብ ዕዳጋ ቨርቹዋል ረዳኢ", "so": "Guudmarka Warbixinta Suuqa Kaaliyaha Virtual-ka ah", "ar": "نظرة عامة على تقرير سوق المساعدين الافتراضيين", "sw": "Muhtasari wa Ripoti ya Soko la Wasaidizi wa Kidijitali", "fr": "Aperçu du rapport sur le marché des assistants virtuels"},
    "Inspect the core inference server code in": {"en": "Inspect the core inference server code in", "am": "ዋናውን የኢንፈረንስ ሰርቨር (inference server) ኮድ ይመልከቱ በ", "om": "Koodii sarvarii infireensii bu'uuraa ilaalaa", "ti": "ነቲ ቀንዲ ናይ inference server ኮድ ኣብዚ ውሽጢ መርምሮ፦", "ar": "افحص الكود الأساسي لخادم الاستدلال في", "sw": "Chunguza nambari za msingi (code) za seva ya utabiri katika", "fr": "Inspectez le code principal du serveur d'inférence dans"},
    "Knowledge Check: Architectural Evaluation": {"en": "Knowledge Check: Architectural Evaluation", "am": "የዕውቀት ምርመራ፡ የስነ-ህንፃ ግምገማ", "om": "Madaallii Beekumsaa: Gamaggama Caasaa (Architectural Evaluation)", "ti": "ምርመራ ፍልጠት፡ ገምጋም ኣርክቴክቸር", "so": "Hubinta Aqoonta: Qiimaynta Qaab-dhismeedka", "ar": "اختبار المعرفة: التقييم المعماري", "sw": "Ukaguzi wa Ujuzi: Tathmini ya Usanifu (Architectural Evaluation)", "fr": "Contrôle des connaissances : Évaluation architecturale"},
    "Plain language / cognitive support format": {"en": "Plain language / cognitive support format", "am": "ቀላል ቋንቋ / የማስተዋል (ኮግኒቲቭ) ድጋፍ ቅርጸት", "om": "Afaan salphaa / boca deeggarsa sammuu"},
    "Copyright © 2026 ALX, All rights reserved.": {"en": "Copyright © 2026 ALX, All rights reserved.", "am": "የቅጂ መብት © 2026 ALX፣ መብቱ በህግ የተጠበቀ ነው።", "om": "Mirgi qopheessaa © 2026 ALX, Mirgi hunduu eegamaadha.", "ti": "ሕጋዊ ቅዳሕ © 2026 ALX፡ ኩሉ መሰላት ዝተሓለወ እዩ።", "so": "Xuquuqda daabacaadda © 2026 ALX, Dhammaan xuquuqaha way dhowran yihiin.", "ar": "حقوق الطبع والنشر © 2026 ALX، جميع الحقوق محفوظة.", "sw": "Hakimiliki © 2026 ALX, Haki zote zimehifadhiwa.", "fr": "Copyright © 2026 ALX, Tous droits réservés."},
    "Interview Accommodation Request (Optional)": {"en": "Interview Accommodation Request (Optional)", "am": "የቃለ መጠይቅ ማስተናገጃ ጥያቄ (ঐच्छಿಕ/አማራጭ)", "om": "Gaaffii Mijeessuu Gaaffii fi Deebii (Dirqama miti)"},
    "Organizing tasks, reminders, and workflows": {"en": "Organizing tasks, reminders, and workflows", "am": "ተግባሮችን፣ ማስታወሻዎችን እና የስራ ሂደቶችን ማቀናጀት", "om": "Hojiilee, yaadachiistota, fi adeemsa hojii gurmeessuu", "ti": "ዕማማት፣ መዘኻኸሪታትን ስራሕቲ (workflows) ምውዳብ", "so": "Habeynta shaqooyinka, xusuusinnada, iyo hannaanka shaqada", "ar": "تنظيم المهام، والتذكيرات، وسير العمل", "sw": "Kupanga kazi, vikumbusho, na mikondo ya kazi", "fr": "L'organisation des tâches, des rappels et des flux de travail"},
    "Pan-African Remote Tech & VA Opportunities": {"en": "Pan-African Remote Tech & VA Opportunities", "am": "የፓን-አፍሪካ የርቀት ቴክኖሎጂ እና ረዳት (VA) የሥራ እድሎች", "so": "Fursadaha Fogaanshaha ee Tiknoolajiyada iyo Kaaliyaha Virtual-ka ee Afrika", "ar": "فرص تقنية وعن بعد لالمساعدين الافتراضيين والخبراء عبر عموم أفريقيا", "sw": "Nafasi za Kazi za Kidijitali na Wasaidizi wa Mtandaoni Barani Afrika", "fr": "Opportunités panafricaines en télétravail (Tech & Assistant Virtuel)"},
    "tool in the editor toolbar to generate it.": {"en": "tool in the editor toolbar to generate it.", "am": "ይህንን ለማመንጨት በማስተካከያ (editor) የመሳሪያ አሞሌ ላይ ያለውን መሣሪያ።", "om": "meeshaa gulaallii irratti argamu fayyadamuun uumi.", "ti": "መሳርሒ ኣብ መስተኻኸሊ መሳርሒታት (toolbar) ተቐመም።", "so": "qalabka ku jira barta aaladaha tifaftiraha si aad u dhaliso.", "ar": "الأداة الموجودة في شريط أدوات المحرر لإنشائه.", "sw": "zana kwenye mwambaa zana wa kihariri ili kuitengeneza.", "fr": "l'outil dans la barre d'outils de l'éditeur pour le générer."},
    "— URLs for the InlineChat assets and API —": {"en": "— URLs for the InlineChat assets and API —", "am": "— ለውስጥ ቻት ንብረቶች እና API የሆኑ ዩአርኤሎች (URLs) —", "om": "— URLoota qabeenya InlineChat fi API —", "ti": "— URLs ን InlineChat ጸጋታትን APIን —", "ar": "— روابط (URLs) الأصول وواجهة برمجة التطبيقات لـ InlineChat —", "sw": "— URL za rasilimali na API za InlineChat —"},
    "How AI tools can support Virtual Assistants": {"en": "How AI tools can support Virtual Assistants", "am": "የ AI መሳሪያዎች ቨርቹዋል ረዳቶችን እንዴት ሊደግፉ ይችላሉ", "om": "Meeshaaleen AI akkamitti Gargaartota Virtual deeggaruu danda'u", "ti": "AI መሳርሒታት ንቪርቱዋል ረድኢ (Virtual Assistants) ብኸመይ ክድግፉ ከም ዝኽእሉ", "so": "Sida qalabka AI ay u taageeri karaan Kaaliyeyaasha Dijital ah", "ar": "كيف يمكن لأدوات الذكاء الاصطناعي دعم المساعدين الافتراضيين", "sw": "Jinsi zana za AI zinavyoweza kuwasaidia Wasaidizi wa Kijanja", "fr": "Comment les outils d'IA peuvent accompagner les assistants virtuels"},
    "Stay comfortable learning new digital tools": {"en": "Stay comfortable learning new digital tools", "am": "አዲስ ዲጂታል መሣሪያዎችን በመማር ረገድ ዝግጁ መሆን", "om": "Meeshaaleen dijitaalaa haaraan yeroo dhufan barachuuf qophaa'aa ta'uu", "ti": "ሓደሽቲ ዲጂታላዊ መሳርሒታት ኣብ ምምሃር ቅሉዕነትን ምቾትን ይሃልዎ", "so": "La qabsato barashada aaladaha dijitaalka ah ee cusub", "ar": "الحفاظ على المرونة في تعلم أدوات رقمية جديدة", "sw": "Kujisikia huru na tayari kujifunza zana mpya za kidijitali", "fr": "rester à l'aise avec l'apprentissage de nouveaux outils numériques"},
    "— canvas size in pixels (defaults: 400×225)": {"en": "— canvas size in pixels (defaults: 400×225)", "am": "— የሸራ መጠን በፒክሰሎች (ነባሪ፡ 400×225)", "om": "— guddina kaanvaas piiksiliidhaan (kan dursaatiif: 400×225)", "ti": "— ናይ ካንቫስ መጠን ብፒክሰል (ነባሪ: 400×225)", "ar": "— حجم لوحة الرسم بـ البكسل (الافتراضي: 400×225)", "sw": "— ukubwa wa turubai kwa pikseli (chaguo-msingi: 400×225)"},
    "Asynchronous event pub/sub with Apache Kafka": {"en": "Asynchronous event pub/sub with Apache Kafka", "am": "ያልተመሳሰለ (Asynchronous) የክስተት pub/sub ከአፓቼ ካፍካ (Apache Kafka) ጋር", "om": "Waliigaltee taatee asayinkiroonasiisii (Asynchronous event pub/sub) Apache Kafka waliin", "ti": "ብኣፓቼ ካፍካ (Apache Kafka) ዝግበር ዘይተመሳሳሳይ እዋን ዘለዎ ፍጻመ pub/sub", "so": "Daabacaadda/diiwaangelinta dhacdada ee aan isku xirnayn (Asynchronous event pub/sub) oo wadata Apache Kafka", "ar": "نشر/اشتراك الأحداث غير المتزامنة باستخدام Apache Kafka", "sw": "Uchapishaji/usajili wa matukio usio wa kusawazisha (Asynchronous event pub/sub) ukitumia Apache Kafka", "fr": "Publication/abonnement d'événements asynchrones avec Apache Kafka"},
    "Screen reader compatible interview materials": {"en": "Screen reader compatible interview materials", "am": "ስክሪን አንባቢዎችን (Screen reader) ማስተናገድ የሚችሉ የቃለ መጠይቅ ቁሳቁሶች", "om": "Meeshaalee gaaffii fi deebii kan dubbisaa iskiriinii wajjin wal simatan"},
    "VA-1: VA Foundations & Professional Identity": {"en": "VA-1: VA Foundations & Professional Identity", "am": "VA-1፡ የ VA መሰረታዊ ነገሮች እና የባለሙያ ማንነት", "om": "VA-1: Bu’uuraaleefi Enyummaa Ogummaa VA", "ti": "VA-1: መሰረታት ቪርቹዋል ረዳትን ሞያዊ መንነትን", "so": "VA-1: Aasaaska VA & Aqoonsiga Xirfadeed", "ar": "VA-1: أساسيات المساعد الافتراضي والهوية المهنية", "sw": "VA-1: Misingi ya VA na Utambulisho wa Kitaalamu", "fr": "VA-1 : Fondations du métier d'assistant virtuel et identité professionnelle"},
    "— data binding View Model and instance names": {"en": "— data binding View Model and instance names", "am": "— የመረጃ ትስስር (data binding) ዎች እይታ ሞዴል (View Model) እና የኢንስታንስ ስሞች", "om": "— maqoonni View Model fi instance daataa walitti hidhan", "ti": "— ዳታ መተሓሓዚ ናይ መርበብ ስእሊ (View Model) ከምኡውን ናይ ኣብነት (instance) ኣስማት", "ar": "— ربط البيانات لأسماء نموذج العرض (View Model) والنسخة", "sw": "— majina ya muundo wa mwonekano (View Model) na huluki (instance) ya uunganisho wa data"},
    "Customer Support Specialist (Bilingual EN/AM)": {"en": "Customer Support Specialist (Bilingual EN/AM)", "am": "የደንበኞች ድጋፍ ባለሙያ (በእንግሊዝኛ እና አማርኛ)", "om": "Ogeessa Deeggarsa Maamilaa (Afaan Lammeessoo EN/AM)", "ti": "ብሉጽ ተጠቃማይ ሓገዝ ሰብ ሞያ (እንግሊዝኛን ኣማርኛን ዝዛረብ)", "so": "Khabiirka Taageerada Macmiilka (Labada Luqadood ee EN/AM)", "ar": "أخصائي دعم عملاء (ثنائي اللغة الإنجليزية/الأمهارية)", "sw": "Mtaalamu wa Huduma kwa Wateja (Anayezungumza Kiingereza na Kiamhari)", "fr": "Spécialiste du support client (Bilingue AN/AM)"},
    "Extended time for technical assessment (1.5x)": {"en": "Extended time for technical assessment (1.5x)", "am": "ለቴክኒክ ግምገማ የተራዘመ ጊዜ (1.5 እጥፍ)", "om": "Yeroo dabalataa qorannoo teeknikaatiif (1.5x)"},
    "W2 | GRADED | 5.5% | Week 2 Graded Assignment": {"en": "W2 | GRADED | 5.5% | Week 2 Graded Assignment", "am": "ሳምንት 2 | ውጤት የሚሰጥበት | 5.5% | የሳምንት 2 የቤት ስራ (ውጤት የሚሰጥበት)", "om": "T2 | Qabxii Kan Qabate | 5.5% | Hojii Manaa Torban 2ffaa Qabxii Qabu", "ti": "ሰሙን 2 | ዝተገምገመ | 5.5% | ሰሙን 2 ዝተገምገመ ዕዮ"},
    "W3 | GRADED | 5.5% | Week 3 Graded Assignment": {"en": "W3 | GRADED | 5.5% | Week 3 Graded Assignment", "am": "ሳምንት 3 | ውጤት የሚሰጥበት | 5.5% | የሳምንት 3 የቤት ስራ (ውጤት የሚሰጥበት)", "om": "T3 | Qabxii Kan Qabate | 5.5% | Hojii Manaa Torban 3ffaa Qabxii Qabu", "ti": "ሰሙን 3 | ዝተገምገመ | 5.5% | ሰሙን 3 ዝተገምገመ ዕዮ"},
    "W4 | GRADED | 5.5% | Week 4 Graded Assignment": {"en": "W4 | GRADED | 5.5% | Week 4 Graded Assignment", "am": "ሳምንት 4 | ውጤት የሚሰጥበት | 5.5% | የሳምንት 4 የቤት ስራ (ውጤት የሚሰጥበት)", "om": "T4 | Qabxii Kan Qabate | 5.5% | Hojii Manaa Torban 4ffaa Qabxii Qabu", "ti": "ሰሙን 4 | ዝተገምገመ | 5.5% | ሰሙን 4 ዝተገምገመ ዕዮ"},
    "W6 | GRADED | 5.5% | Week 6 Graded Assignment": {"en": "W6 | GRADED | 5.5% | Week 6 Graded Assignment", "am": "ሳምንት 6 | ውጤት የሚሰጥበት | 5.5% | የሳምንት 6 የቤት ስራ (ውጤት የሚሰጥበት)", "om": "T6 | Qabxii Kan Qabate | 5.5% | Hojii Manaa Torban 6ffaa Qabxii Qabu", "ti": "ሰሙን 6 | ብመዘናግዕ ዝተገምገመ | 5.5% | ናይ ሰሙን 6 ግምገማዊ ዕዮ"},
    "— initial greeting displayed to the student —": {"en": "— initial greeting displayed to the student —", "am": "— ለተማሪው የሚታየው የመጀመሪያ ሰላምታ —", "om": "— nagaa gaaffii jalqabaa barataadhaaf agarsiifamu —", "ti": "— ንተመሃራይ ዝግለጽ ፈለማ ሰላምታ —", "ar": "— التحية الأولية التي تظهر للطالب —", "sw": "— salamu za awali zinazoonyeshwa kwa mwanafunzi —"},
    "What Clients Are Likely to Value More and More": {"en": "What Clients Are Likely to Value More and More", "am": "ደንበኞች ከጊዜ ወደ ጊዜ ከፍ አድርገው ሊመለከቷቸው የሚችሏቸው ነገሮች", "om": "Abbootiin Qabeenyaa Maal Gatii Guddaa Kennuuf Ta'u", "ti": "ዓማዊል ዝያዳ ክዋግእዎም ዝኽእሉ ነገራት", "so": "Waxa ay macaamiishu u badan tahay inay sii kordhayaan qiimayntooda", "ar": "ما يرجح أن يوليه العملاء قيمة متزايدة باستمرار", "sw": "Yale Ambayo Wateja Wanaweza Kuzidi Kuyahesabu ya Thamani Kuu", "fr": "Ce que les clients risquent de valoriser de plus en plus"},
    "Defining the VA Role: Tasks and Specialisations": {"en": "Defining the VA Role: Tasks and Specialisations", "am": "የቨርቹዋል ረዳት (VA) ሚናን መግለፅ፡ ተግባራት እና ልዩ ባለሙያተኞች", "om": "Gahee Hojii VA ibsuu: Hojiiwwanii fi Dameewwan Addaa", "ti": "ተራ ቨርቹዋል ረዳኢ መብርሂ፦ ዕማማትን ፍሉይ ክእለታትን", "so": "Qeexida Doorka VA: Hawlaha iyo Takhasusyada", "ar": "تعريف دور المساعد الافتراضي: المهام والتخصصات", "sw": "Kueleza Nafasi ya VA: Kazi na Maeneo Maalum", "fr": "Définition du rôle d'AS : Tâches et spécialisations"},
    "Grading Rubric: Microservice Project Assessment": {"en": "Grading Rubric: Microservice Project Assessment", "am": "የደረጃ አሰጣጥ መመሪያ፡ የማይክሮሰርቪስ ፕሮጀክት ግምገማ", "om": "Qajeelfama Sadarkaa Madaallii: Porojektii Maaykirosiroovisiiz (Microservice Project Assessment)", "ti": "መመዘኛ ነጥቢ: ምዘና ማይክሮሰርቪስ ፕሮጀክት", "so": "Hagaha Qiimeynta: Qiimeynta Mashruuca Microservice", "ar": "معايير التقييم: تقييم مشروع الخدمات المصغرة (Microservice)", "sw": "Mwongozo wa Ukadiriaji: Tathmini ya Mradi wa Microservice"},
    "Market Trends in the Virtual Assistant Industry": {"en": "Market Trends in the Virtual Assistant Industry", "am": "በቨርቹዋል ረዳት ኢንዱስትሪ ውስጥ ያሉ የገበያ አዝማሚያዎች", "om": "Hojiiwwan Gargaaraa Virtual (Virtual Assistant) keessatti Fakkiiwwan Gabaa Yeroo Ammaa", "ti": "ኣንፈታት ዕዳጋ ኣብ ኢንዱስትሪ ቨርቹዋል ረዳኢ", "so": "Isbeddellada Suuqa ee Warshadaha Kaaliyaha Virtual-ka ah", "ar": "اتجاهات السوق في قطاع المساعدين الافتراضيين", "sw": "Mwelekeo wa Soko katika Sekta ya Wasaidizi wa Kidijitali", "fr": "Tendances du marché dans l'industrie des assistants virtuels"},
    "W10 | GRADED | 5.5% | Week 10 Graded Assignment": {"en": "W10 | GRADED | 5.5% | Week 10 Graded Assignment", "am": "ሳምንት 10 | የሰነድ ውጤት ያለው | 5.5% | የሳምንት 10 የውጤት ግምገማ অ্যাসাইনመንት", "om": "W10 | KENNAMAAF | 5.5% | Kennaa Torbee 10"},
    "WR 100: Fundamentals of Effective Communication": {"en": "WR 100: Fundamentals of Effective Communication", "am": "WR 100፡ ውጤታማ የግንኙነት መሰረታዊ መርሆዎች", "om": "WR 100: Bu’uura Qunnamtii Bu’a-qabeessaa", "ti": "WR 100፡ መሰረታት ውጽኢታዊ ርክብ", "so": "WR 100: Aasaaska Xidhiidhka Waxtarka Leh", "ar": "WR 100: أساسيات التواصل الفعال", "sw": "WR 100: Misingi ya Mawasiliano Yenye Ufanisi", "fr": "WR 100: Fondements d'une communication efficace"},
    "What This Means for Aspiring Virtual Assistants": {"en": "What This Means for Aspiring Virtual Assistants", "am": "ይህ ለታጩ ምናባዊ ረዳቶች ምን ማለት ነው?", "om": "Kun Gargaartota Virtual (VA) ta'uu barbaadaniif maal jechuudha?", "ti": "እዚ ንዝምዕብሉ ዘለዉ ቪርቱዋል ረድኢ እንታይ ማለቱ እዩ", "so": "Wuxuu Kani U Dhignyahay Kaaliyeyaasha Dijitaalka ah ee Hiigsanaya Mustaqbalka", "ar": "ماذا يعني هذا للمساعدين الافتراضيين الطموحين", "sw": "Hii Ina maana Gani kwa Wasaidizi Wa Mtandao Wanaotarajia Kufanikiwa", "fr": "Ce que cela signifie pour les futurs assistants virtuels"},
    "— array of suggested starter prompts (optional)": {"en": "— array of suggested starter prompts (optional)", "am": "— የተጠቆሙ መነሻ ጥያቄዎች ማከማቻ (አማራጭ)", "om": "— tarree yaada gaaffii jalqabaa dhiyaate (filannoo)", "ti": "— ዝተጠቃለሉ መጀመርታ ሕቶታት (ብ ምርጫ) —", "ar": "— مصفوفة من الأسئلة التمهيدية المقترحة (اختياري)", "sw": "— safu ya vidokezo vya kuanzia vilivyopendekezwa (hiari)"},
    "Drafting emails, notes, and first-pass documents": {"en": "Drafting emails, notes, and first-pass documents", "am": "ኢሜሎችን፣ ማስታወሻዎችን እና የመጀመሪያ ደረጃ ሰነዶችን ረቂቅ ማዘጋጀት", "om": "Imeelota, yaadannoo, fi barreeffamoota qaphxii jalqabaa qopheessuu", "ti": "ኢሜላት፣ ចំណስታትን ናይ መጀመርታ ሰነዳትን ምጽሓፍ", "so": "Qorista iimayllada, qoraallada, iyo dukumiintiyada heerka koowaad", "ar": "صياغة رسائل البريد الإلكتروني، والملاحظات، والمسودات الأولى للمستندات", "sw": "Kuandaa rasimu za barua pepe, maelezo, na hati za awali", "fr": "La rédaction d'e-mails, de notes et de premiers jets de documents"},
    "Ethiopian Sign Language (ETSL) / ASL interpreter": {"en": "Ethiopian Sign Language (ETSL) / ASL interpreter", "am": "የኢትዮጵያ የምልክት ቋንቋ (ETSL) / የአሜሪካ የምልክት ቋንቋ (ASL) አስተርጓሚ", "om": "Afaan Mallattoo Itoophiyaa (ETSL) / Hiikaa ASL"},
    "AIFW-1: AI Foundations for Work and Everyday Life": {"en": "AIFW-1: AI Foundations for Work and Everyday Life", "am": "AIFW-1፡ ለስራ እና ለዕለት ተዕለት ሕይወት የሚሆን የሰው ሰራሽ አስተልዎ (AI) መሰረታዊ ነገሮች", "om": "AIFW-1: Bu'uuraalee AI Hojii fi Jireenya Guyyaa Guyyaatiif", "ti": "AIFW-1: መሰረታት ኣርቲፊሻል ኢንተለጀንስ ንስራሕን መዓልታዊ ህይወትን", "so": "AIFW-1: Aasaaska AI ee Shaqada iyo Nolosha Maalinlaha ah", "ar": "AIFW-1: أساسيات الذكاء الاصطناعي للعمل والحياة اليومية", "sw": "AIFW-1: Misingi ya AI kwa Ajili ya Kazi na Maisha ya Kila Siku", "fr": "AIFW-1 : Fondations de l'IA pour le travail et la vie quotidienne"},
    "Artificial Intelligence and the Future of VA Work": {"en": "Artificial Intelligence and the Future of VA Work", "am": "አርቴፊሻል ኢንተለጀንስ እና የቨርቹዋል ረዳት ሥራዎች მომავል", "om": "Artificial Intelligence fi Fuuldura Hojii Gargaaraa VA", "ti": "ኣርቲፊሻል ኢንተለጀንስ (AI)ን መጻኢ ስራሕ ቨርቹዋል ረዳኢ (VA)ን", "so": "Sirdoonka Macmalka ah (AI) iyo Mustaqbalka Shaqada Kaaliyaha Dijital ah (VA)", "ar": "الذكاء الاصطناعي ومستقبل عمل المساعدين الافتراضيين", "sw": "Akili Bandia (AI) na Wakati Ujao wa Kazi za Msaidizi wa Kijanja (VA)", "fr": "L'intelligence artificielle et l'avenir du métier d'assistant virtuel"},
    "Handling simple customer queries through chatbots": {"en": "Handling simple customer queries through chatbots", "am": "ቀላል የደንበኞችን ጥያቄዎች በቻትቦቶች (chatbots) ማስተናገድ", "om": "Gaaffiiwwan abbootii qabeenyaa salphaa ta'an chaatibootii fayyadamuun keessummeessuu", "ti": "ብቻትቦት (chatbots) ኣቢሉ ቀለልቲ ሕቶታት ዓማዊል ምስተናገድ", "so": "Wax ka qabashada su'aalaha fudud ee macaamiisha iyada oo la adeegsanayo chatbots", "ar": "التعامل مع استفسارات العملاء البسيطة من خلال روبوتات الدردشة", "sw": "Kushughulikia maswali rahisi ya wateja kupitia vikaragosi vya mtandaoni (chatbots)", "fr": "La gestion des requêtes clients simples via des chatbots"},
    "Build strong communication and relationship skills": {"en": "Build strong communication and relationship skills", "am": "ጠንካራ የግንኙነት እና የግንኙነት ክህሎቶችን መገንባት", "om": "Dandeettii walqunnamtii fi walitti dhufeenyaa cimaa uumuu", "ti": "ብቑዕ ክእሎት ርክብን ዝምድናን ምህናጽ", "so": "Dhis xirfado adag oo xagga isgaarsiinta iyo xiriirka ah", "ar": "بناء مهارات قوية في التواصل وبناء العلاقات", "sw": "Kujenga ujuzi thabiti wa mawasiliano na uhusiano", "fr": "développer de solides compétences en communication et en relations interpersonnelles"},
    "Distributed streaming pipelines with Redis Streams": {"en": "Distributed streaming pipelines with Redis Streams", "am": "የተከፋፈሉ የስትሪንግ ቧንቧ መስመሮች ከሬዲኤስ ስትሪምስ (Redis Streams) ጋር", "om": "Sarara yaa'ii raabsame (Distributed streaming pipelines) Redis Streams fayyadamuun", "ti": "ሬዲስ ስትሪምስ (Redis Streams) ብምጥቃም ዝተዘርግሐ ስትሪሚንግ ፓይፕላይንስ", "so": "Dhuumaha qulqulka ee la qaybiyey (Distributed streaming pipelines) oo wata Redis Streams", "ar": "خطوط أنابيب البث الموزعة باستخدام Redis Streams", "sw": "Mrija wa utiririshaji uliosambazwa (distributed streaming pipelines) ukitumia Redis Streams", "fr": "Pipelines de streaming distribués avec Redis Streams"},
    "W10 | GRADED | 1.0% | Week 10 - Verifying AI-Ge...": {"en": "W10 | GRADED | 1.0% | Week 10 - Verifying AI-Ge...", "am": "ሳምንት 10 | የሰነድ ውጤት ያለው | 1.0% | ሳምንት 10 - አርቴፊሻል ኢንተለጀንስ (AI) ያዘጋጀውን...", "om": "W10 | KENNAMAAF | 1.0% | Torbee 10 - Mirkaneessuu AI..."},
    "to verify request validation and schema integrity.": {"en": "to verify request validation and schema integrity.", "am": "የጥያቄ ማረጋገጫን (request validation) እና የስኬማ ትክክለኛነትን (schema integrity) ለማረጋገጥ።", "om": "mirkanaa gaaffii fi amanamummaa caasaa (schema) mirkaneessuuf.", "ti": "ሕቶታት ምጽራይን ምሉእነት ስኪማን ንምርግጋጽ።", "so": "si aad u xaqiijiso ansaxinta codsiga iyo daacadnimada qaab-dhismeedka (schema).", "ar": "للتحقق من صحة الطلبات وسلامة مخطط البيانات.", "sw": "ili kuthibitisha uthibitishaji wa maombi na uadilifu wa skema (schema integrity).", "fr": "pour vérifier la validation des requêtes et l'intégrité du schéma."},
    "Develop a niche or service specialization over time": {"en": "Develop a niche or service specialization over time", "am": "ጊዜ ሂደት ውስጥ የልዩ ትኩረት መስክ ወይም የአገልግሎት ስፔሻላይዜሽን ማዳበር", "om": "Yeroo waliin adeemuun damee tajaajilaa addaa qabaachuu", "ti": "ብእዋኑ ፍሉይ ናይ ኣገልግሎት ዓውዲ ወይ ክእሎት ምዕባይ", "so": "Horumariyo takhasus ama qayb gaar ah oo adeeg ah muddada ka dambaysa", "ar": "تطوير تخصص دقيق أو مجال خدمة محدد بمرور الوقت", "sw": "Kukuza eneo maalum la utaalamu au huduma kadiri muda unavyopita", "fr": "développer une niche ou une spécialisation de service au fil du temps"},
    "The recommended way to embed a Rive animation is the": {"en": "The recommended way to embed a Rive animation is the", "am": "የራይቭ እነማን ለመክተት የሚመከረው መንገድ", "om": "Karaa gaariin sochii Rive itti galchan", "ti": "እቲ ዝሰማማዕ መገዲ ሓደ Rive ኣኒሜሽን ንምእታው እቲ", "so": "Habka lagu taliyay in lagu dhejiyo animation-ka Rive waa", "ar": "الطريقة الموصى بها لتضمين رسم Rive متحرك هي", "sw": "Njia inayopendekezwa ya kuweka mchoro wa Rive ni", "fr": "La méthode recommandée pour intégrer une animation Rive est"},
    "Track your journey from enrollment to certification.": {"en": "Track your journey from enrollment to certification.", "ti": "ካብ ምዝገባ ክሳብ ምስክር ወረቐት ዘሎ ጉዕዞኹም ተኸታተሉ፡", "so": "La soco safarkaaga laga bilaabo isdiiwaangelinta ilaa shahaadada.", "fr": "Suivez votre parcours, de l'inscription à la certification."},
    "Communicating with empathy and emotional intelligence": {"en": "Communicating with empathy and emotional intelligence", "am": "በርኅራኄ እና በስሜታዊ ብልህነት መግባባት", "om": "Mararfannoo fi ogeessa miiraa fayyadamuun walqunnamtii gochuu", "ti": "ብርሕራሔን ስምዒታዊ ለባምነትን (emotional intelligence) ምዝርራብ", "so": "La xiriiridda naxariis iyo sirdoon shucuureed", "ar": "التواصل التعاطفي وعالي الذكاء العاطفي", "sw": "Kuwasiliana kwa huruma na akili ya kihisia", "fr": "La communication empreinte d'empathie et d'intelligence émotionnelle"},
    "Complete your course before the time runs out to earn": {"en": "Complete your course before the time runs out to earn", "ti": "ግዜ ከይተወድአ ነዚ ኮርስ ዛዝምዎ እሞ ተዓወቱ", "so": "Dhameystir koorsadaada inta aan waqtigu dhicin si aad u hesho", "fr": "Terminez votre cours avant la fin du temps imparti pour gagner"},
    "Lab Instructions: Deploying the AI Inference Endpoint": {"en": "Lab Instructions: Deploying the AI Inference Endpoint", "am": "የላብራቶሪ መመሪያዎች፡ የAI ኢፈረንስ ማቆሚያ (Inference Endpoint) ማሰማራት", "om": "Qajeelfama Laabii: Endpooyintii Infireensii AI Fe'uu", "ti": "መመሪያታት ላብ: AI Inference Endpoint ክፉት ምግባር (Deploying)", "so": "Tilmaamaha Shaybaarka: Siday loo daah-furo Barta Dhammaadka ee AI-ga (AI Inference Endpoint)", "ar": "تعليمات المختبر: نشر نقطة نهاية استدلال الذكاء الاصطناعي", "sw": "Maagizo ya Maabara: Kupeleka Kituo cha Mwisho cha Utabiri wa AI (AI Inference Endpoint)", "fr": "Instructions du TP : Déploiement de l'endpoint d'inférence IA"},
    "Execute the repository clone command in your terminal:": {"en": "Execute the repository clone command in your terminal:", "am": "በτερሚናልዎ (terminal) ውስጥ የማከማቻ (repository) ማባዣ ትዕዛዙን ያስፈጽሙ፡", "om": "Ajaja kookoo reezitarii (repository clone command) terminaala keessan keessatti raawwadhaa:", "ti": "ነቲ repository ንምቕዳሕ (clone) ዝሕግዝ ትእዛዝ ኣብ ተርሚናልካ ኣፈጻጸም፦", "ar": "نفذ أمر استنساخ المستودع في طرفيتك:", "sw": "Tekeleza amri ya kurudia (clone) ya hazina (repository) kwenye terminal yako:", "fr": "Exécutez la commande de clonage du dépôt dans votre terminal :"},
    "Build and start the containerized service cluster using": {"en": "Build and start the containerized service cluster using", "am": "የኮንտეይነር አገልግሎት ክላስተርን ይገንቡ እና ይጀምሩ በ", "om": "Kuustara tajaajila konteenarame ijaaruu fi jalqabsiisuuf fayyadami", "ti": "ነቲ ብኮንተይነር ዝተሰነደ ኣገልግሎት ክላስተር ብምጥቃም ህነጾን ጀምሮን", "so": "Dhis oo bilow kooxda adeegga ee la keenay container-ka adigoo isticmaalaya", "ar": "قم بناء وتشغيل مجموعة الخدمات المضمنة في حاويات باستخدام", "sw": "Jenga na uwashe nguzo ya huduma iliyowekwa kwenye kontena (containerized service cluster) ukitumia", "fr": "Compilez et démarrez le cluster de services conteneurisé à l'aide de"},
    "Where human Virtual Assistants still add the most value": {"en": "Where human Virtual Assistants still add the most value", "am": "ሰዎች ምናባዊ ረዳቶች (VAs) አሁንም ከፍተኛ ዋጋ የሚጨምሩባቸው ቦታዎች", "om": "Gargaartonni Virtual (VA) namootaa iddoo kamitti gatii guddaa dabalan", "ti": "ሰብኣዊ ቪርቱዋል ረድኢ (VAs) ገና ዝለዓለ ዋጋ ዘለዎም ግደ ዝጻወቱሉ ከባቢታት", "so": "Halka ay Kaaliyeyaasha Dijital ah ee bini'aadanka ahi ay weli ku daraan qiimaha ugu badan", "ar": "المجالات التي يضيف فيها المساعدون الافتراضيون البشريون أعلى قيمة", "sw": "Mahali ambapo Wasaidizi wa Kijanja wa kibinadamu bado wanaongeza thamani kubwa zaidi", "fr": "Là où les assistants virtuels humains ajoutent le plus de valeur"},
    "placeholders, replaced per learner at render time (e.g.": {"en": "placeholders, replaced per learner at render time (e.g.", "am": "ቦታ ያዥዎች፣ ለእያንዳንዱ ተማሪ በሚቀርብበት ጊዜ የሚተኩ (ለምሳሌ", "om": "bakka bu'oota, yeroo barataan ilaaluutti barataa tokkoon tokkoonof kan jijjiiraman (fakkeenyaaf", "ti": "መተካእታታት፣ ኣብ እዋን ምርኢት ንነፍሲ ወከፍ ተማሃራይ ዝተተካእ (ንኣብነት", "ar": "العناصر النائبة، والتي يتم استبدالها لكل متعلم وقت العرض (مثل", "sw": "vitu vya kupachika (placeholders), vinavyobadilishwa kwa kila mwanafunzi wakati wa kuchakata (mf."},
    "AIFW-2: Prompting and Working Effectively with AI Models": {"en": "AIFW-2: Prompting and Working Effectively with AI Models", "am": "AIFW-2: ከAI ሞዴሎች ጋር መጠየቅ እና በብቃት መስራት", "om": "AIFW-2: Qajeelfama kennuu fi Fakkeenya AI wajjin buqqa'anii hojjechuu", "ti": "AIFW-2: ምስ ናሙናታት AI ብግቡእ ብምስራሕን ትእዛዛት (Prompts) ብምሃብን ክእለት ምዕባለ", "so": "AIFW-2: Qorista Fariimaha (Prompting) iyo La Shaqaynta Waxtarka leh ee Qaababka AI", "ar": "AIFW-2: صياغة الأوامر (Prompting) والعمل بفعالية مع نماذج الذكاء الاصطناعي", "sw": "AIFW-2: Kuandaa Maagizo (Prompting) na Kufanya Kazi Vizuri na Mifano ya AI", "fr": "AIFW-2 : Prompting et collaboration efficace avec les modèles d'IA"},
    "Virtual Assistant Market Growth, Trends and Opportunities": {"en": "Virtual Assistant Market Growth, Trends and Opportunities", "am": "የនិርቷል ረዳት (Virtual Assistant) ገበያ እድገት፣ አዝማሚያዎች እና እድሎች", "om": "Guddina Gabaa Gargaaraa Virtual, Adeemsota Haaraa fi Carraawwan", "ti": "ዕብየት ዕዳጋ ቨርቹዋል ረዳኢ፡ ኣንፈታትን ዕድላትን", "so": "Koritaanka Suuqa Kaaliyeyaasha Dijitaalka ah, Isbeddellada iyo Fursadaha", "ar": "نمو سوق المساعدين الافتراضيين، والاتجاهات، والفرص", "sw": "Ukuaji wa Soko la Wasaidizi Wa Mtandao, Mitindo na Fursa", "fr": "Croissance, tendances et opportunités du marché des assistants virtuels"},
    "— name of the artboard to render (uses default if omitted)": {"en": "— name of the artboard to render (uses default if omitted)", "am": "— የሚታየው የጥበብ ሰሌዳ ስም (ካልተገለጸ ነባሪውን ይጠቀማል)", "om": "— maqaa artboard irratti mul'ifamuu (yoo hin kennamne kan dursaaf kennaman fayyadama)", "ti": "— ክፍጠር ዘለዎ ስእሊ መደብር ስም (ካብ ዝሕደግ ነባሪ ይጥቀም)", "ar": "— اسم لوحة الفن (Artboard) المراد عرضها (يتم استخدام القيمة الافتراضية إذا تركت فارغة)", "sw": "— jina la ubao wa kazi (artboard) wa kuchora (inatumia chaguo-msingi ikiwa imeachwa wazi)"},
    "Improving systems rather than simply following instructions": {"en": "Improving systems rather than simply following instructions", "am": "መመሪያዎችን ብቻ ከመከተል ይልቅ አሰራሮችን ማሻሻል", "om": "Ajaja qofa hordofuu mannaa sirna hojii fooyyessuu", "ti": "መምርሒታት ብቀሊሉ ካብ ምኽታል ሓሊፉ ሲስተማት ምምሕያሽ", "so": "Hagaajinta nidaamyada halkii laga ahaan lahaa oo keliya kuwo raacaya tilmaamaha", "ar": "تحسين الأنظمة بدلاً من مجرد اتباع التعليمات", "sw": "Kuboresha mifumo badala ya kufuata maagizo tu", "fr": "L'amélioration des systèmes plutôt que la simple exécution d'instructions"},
    "Managing client relationships with care and professionalism": {"en": "Managing client relationships with care and professionalism", "am": "ከደንበኞች ጋር ያለውን ግንኙነት በጥንቃቄ እና በባለሙያነት ማስተዳደር", "om": "Walitti dhufeenya abbootii qabeenyaa kunuunsaa fi ogummaadhaan bulchuu", "ti": "ርክባት ዓማዊል ብክንክንን ሞያዊ ስነ-ምግባርን ምምሕዳር", "so": "Maareynta xiriirka macaamiisha oo ay la socoto daryeel iyo xirfad", "ar": "إدارة علاقات العملاء باهتمام واحترافية", "sw": "Kusimamia mahusiano ya wateja kwa uangalifu na utaalamu", "fr": "La gestion des relations clients avec soin et professionnalisme"},
    "Coordinating teams, people, and moving parts across projects": {"en": "Coordinating teams, people, and moving parts across projects", "am": "በፕሮጀክቶች ውስጥ ቡድኖችን፣ ሰዎችን እና የተለያዩ እንቅስቃሴዎችን ማስተባበር", "om": "Pirojektoota keessatti gareewwan, namoota, fi qaamolee addaddaa walitti qindeessuu", "ti": "ኣብ ውሽጢ ፕሮጀክትታት ጉጅለታት፣ ሰባት፣ ከምኡ'ውን ዝንቀሳቐሱ ክፋላት ምውህሃድ", "so": "Isku-dubbaridka kooxaha, dadka, iyo qaybaha kala duwan ee mashaariicda", "ar": "تنسيق الفرق والأفراد والعناصر المتعددة عبر المشاريع المختلفة", "sw": "Kuratibu timu, watu, na vipengele mbalimbali kwenye miradi", "fr": "La coordination des équipes, des personnes et des différents aspects des projets"},
    "Module 4: Building Intelligent Cloud Microservices & AI APIs": {"en": "Module 4: Building Intelligent Cloud Microservices & AI APIs", "am": "ሞጁል 4፡ ብልጥ የክላውድ ማይክሮሰርቪሶችን እና የAI ኤፒአይዎችን መገንባት", "om": "Boqonnaa 4: Maaykiroo-tajaajilota Kulaawudii Oomishaa fi APIwwan AI Ijaaruu", "ti": "ክፍሊ 4፦ ለባቡዋት ዓቐብ-መዝገብ መርበብ ሓበሬታን ሰብ-ሰራሕ ብልሓት APIsን ምስራሕ", "ar": "الوحدة 4: بناء الخدمات السحابية المصغرة الذكية وواجهات برمجة التطبيقات للذكاء الاصطناعي", "sw": "Moduli ya 4: Kujenga Huduma Ndogo za Wingu zenye Akili Bandia na API za AI", "fr": "Module 4 : Création de microservices cloud intelligents et d'API d'IA"},
    "Savanna Careers — Pan-African Remote Tech & VA Opportunities": {"en": "Savanna Careers — Pan-African Remote Tech & VA Opportunities", "am": "ሳቫና ከሪርስ — የፓን-አፍሪካ የርቀት ቴክኖሎጂ እና ረዳት (VA) የሥራ እድሎች", "so": "Savanna Careers — Fursadaha Fogaanshaha ee Tiknoolajiyada iyo Kaaliyaha Virtual-ka ee Afrika", "ar": "وظائف سافانا للتوظيف — فرص تقنية وعن بعد لالمساعدين الافتراضيين والخبراء عبر عموم أفريقيا", "sw": "Kazi za Savanna — Nafasi za Kazi za Kidijitali na Wasaidizi Wa Mtandaoni Barani Afrika", "fr": "Savanna Careers — Opportunités panafricaines en télétravail (Tech & Assistant Virtuel)"},
    "Transcript: Instructor Walkthrough on Microservice Isolation": {"en": "Transcript: Instructor Walkthrough on Microservice Isolation", "am": "ጽሑፍ፡ አስተማሪው በማይክሮሰርቪስ መለያየት (Microservice Isolation) ዙሪያ ያደረገው ማብራሪያ", "om": "Galmee Sagantaa: Barsiisaan Insulaashinii Maaykirosaarvisiirratti Gorsa Kennu", "ti": "ትሕዝቶ ጽሑፍ፡ መምህር ብዛዕባ ማይክሮ-ሰርቪስ መጸገሊ (Microservice Isolation) ዝገበሮ መብርሂ", "so": "Qoraalka Casharka: Hagidda Macallinka ee ku saabsan Go'doominta Adeegyada Yar-yar (Microservice Isolation)", "ar": "النص المكتوب: جولة إرشادية للمدرب حول عزل الخدمات المصغرة (Microservices)", "sw": "Nakala ya Maelezo: Mwongozo wa Mwalimu Kuhusu Kutenga Huduma Ndogo (Microservice Isolation)", "fr": "Transcription : Démonstration de l'instructeur sur l'isolation des microservices"},
    "5 Things to Expect from the Virtual Assistant Industry in 2025": {"en": "5 Things to Expect from the Virtual Assistant Industry in 2025", "am": "እንዳይጠብቁዋቸው ከሚገቡ 5 የቨርቹዋል ረዳት ኢንዱስትሪ ነገሮች በ2025 (በ2025 ከቨርቹዋል ረዳት ኢንዱስትሪ ሊጠበቁ የሚገባቸው 5 ነገሮች)", "om": "Wantoota 5 Indaastirii Gargaaraa Virtual irraa Bara 2025tti eegaman", "ti": "ኣብ 2025 ካብ ኢንዱስትሪ ቨርቹዋል ረዳኢ ክግመቱ ዝግበኦም 5 ነገራት", "so": "5 Waxyaabood oo laga filan karo Warshadaha Kaaliyeyaasha Dijitaalka ah (VA) Sannadka 2025", "ar": "5 أمور يجب توقعها من قطاع المساعدين الافتراضيين في عام 2025", "sw": "Mambo 5 ya Kutarajia kutoka kwa Tasnia ya Wasaidizi Wa Mtandao mnamo 2025", "fr": "5 choses à attendre de l'industrie des assistants virtuels en 2025"},
    "Basic happy-path test cases verifying primary response models.": {"en": "Basic happy-path test cases verifying primary response models.", "am": "முதன்மை የመልስ ሞዴሎችን (response models) የሚያረጋግጡ መሰረታዊ የተሳካላቸው የሙከራ ጉዳዮች (happy-path test cases)።", "om": "Kiraayitiriyaawwan qormaataa bu'uuraa kan moodeelota deebii jalqabaa mirkaneessan.", "ti": "ቀንዲ ናይ ምላሽ ሞዴላት ዘረጋግጹ መሰረታዊ ንቡር ፈተነታት (happy-path test cases)።", "so": "Kiisaska tijaabada ee aasaasiga ah ee xaqiijinaya moodooyinka jawaabta ee ugu muhiimsan.", "ar": "حالات اختبار أساسية (happy-path) للتحقق من نماذج الاستجابة الأولية.", "sw": "Kesi za msingi za majaribio ya mafanikio (happy-path) zinazothibitisha miundo mikuu ya majibu.", "fr": "Cas de test nominaux de base vérifiant les principaux modèles de réponse."},
    "Concept page: The Future of the VA Industry | G-School Intranet": {"en": "Concept page: The Future of the VA Industry | G-School Intranet", "am": "የፅንሰ ሀሳብ ገጽ: የቨርቹዋል ረዳት ኢንዱስትሪ የወደፊት እጣ ፈንታ | ጂ-ስኩል ኢንትራኔት", "om": "Fuula Yaadaa: Gara Fuulduraa Industirii VA | G-School Intranet", "ti": "ናይ ኣምር ገጽ: መጻኢ ዕድል ኢንዱስትሪ ቨርቹዋል ረዳኢ | ጂ-ስኩል ኢንትራኔት", "so": "Bogga Fikradda: Mustaqbalka Warshadaha Kaaliyaha Virtual-ka | Shabakadda G-School", "ar": "صفحة المفهوم: مستقبل صناعة المساعد الافتراضي | شبكة جي-سكول", "sw": "Ukurasa wa Dhana: Mustakabali wa Sekta ya Msaidizi Halisi | Mtandao wa Ndani wa G-School", "fr": "Page de concept : L'avenir de l'industrie des assistants virtuels | Intranet G-School"},
    "Functional structure with minimal code coupling between routes.": {"en": "Functional structure with minimal code coupling between routes.", "am": "በራውተሮች መካከል ያለው የኮድ ቁርኝት (coupling) አነስተኛ የሆነበት ተግባራዊ መዋቅር።", "om": "Caasaa hojii kan ‘code coupling’ karaa xiqqaa ta'een gidduu teessoo (routes) jiru qabu.", "ti": "ኣብ መንጎ ሮትስ ዘሎ ምትእስሳር ኮድ ብምንካይ ዝተዋቀረ ተግባራዊ ኣቃውማ።", "ar": "هيكل وظيفي مع الحد الأدنى من ارتباط الكود (Code Coupling) بين المسارات.", "sw": "Muundo wa kiutendaji wenye uunganishaji mdogo wa msimbo (code coupling) kati ya ruta.", "fr": "Structure fonctionnelle avec un couplage de code minimal entre les routes."},
    "Work with adaptability, curiosity, and a problem-solving mindset": {"en": "Work with adaptability, curiosity, and a problem-solving mindset", "am": "ከተለዋዋጭ ሁኔታዎች ጋር በመስማማት፣ የማወቅ ፍላጎት እና ችግር ፈቺ አስተሳሰብ መስራት", "om": "Haalatti madaqamuu, beekuuf fedhii qabaachuu, fi yaada rakkoo hiikuun hojjechuu", "ti": "ብቕልጡፍ ምስ ኩነታት ናይ ምልማድ፡ ጽዕንቶ ናይ ምፍላጥ ፍቕሪን ንጸገም ናይ ምፍታሕ ኣተሓሳስባን ምስራሕ", "so": "Ku shaqee la-qabsi, xiiso wax-barasho, iyo maskax xallinta dhibaatooyinka", "ar": "العمل بقدرة عالية على التكيف، وفضول معرفي، وعقلية تركز على حل المشكلات", "sw": "Kufanya kazi kwa kubadilika kulingana na mazingira, udadisi, na mtazamo wa utatuzi wa shida", "fr": "travailler avec adaptabilité, curiosité et un esprit axé sur la résolution de problèmes"},
    "Using judgment when priorities change or instructions are unclear": {"en": "Using judgment when priorities change or instructions are unclear", "am": "ቅድሚያ የሚሰጧቸው ነገሮች ሲለወጡ ወይም መመሪያዎች ግልጽ ካልሆኑ ትክክለኛ ውሳኔ መስጠት", "om": "Yeroo dursi kennamu jijjiiramu ykn ajajni yoo hin ifne ta'e of eeggannoo fi hubannoodhaan hojjechuu", "ti": "ቀዳምነታት ክልወጡ ከለዉ ወይ መምርሒታት ንጹር ዘይኮኑ እዋን ፍርዲ (judgment) ምጥቃም", "so": "Isticmaalka garashada marka mudnaanta la beddelo ama tilmaamuhu ay caddayn waayaan", "ar": "استخدام التقدير السليم عند تغير الأولويات أو عدم وضوح التعليمات", "sw": "Kutumia uamuzi vipaumbele vinapobadilika au maagizo yakiwa hayako wazi", "fr": "L'exercice du jugement lorsque les priorités changent ou que les instructions ne sont pas claires"},
    "Why might becoming a Virtual Assistant be the right path for you?": {"en": "Why might becoming a Virtual Assistant be the right path for you?", "am": "ቨርቹዋል ረዳት መሆን ለምን ትክክለኛው መንገድ ሊሆንልዎ ይችላል?", "om": "Maaliif Gargaaraa Virtual ta'uun karaa sirrii siif ta'uu danda'a?", "ti": "ቪርቹዋል ረዳኢ ምዃን ንዓኻ ትኽክለኛ መገዲ ክኸውን ዝኽእል ስለምንታይ እዩ?", "so": "Maxay noqon kartaa sababta noqoshada Kaaliyaha Virtual-ka ah ay ugu tahay wadada saxda ah adiga?", "ar": "لماذا قد يكون أن تصبح مساعداً افتراضياً هو المسار المناسب لك؟", "sw": "Kwa nini kuwa Msaidizi wa Kidijitali kunaweza kuwa njia sahihi kwako?", "fr": "Pourquoi devenir assistant virtuel pourrait-il être la bonne voie pour vous ?"},
    "The Virtual Assistant profession is not shrinking. It is evolving.": {"en": "The Virtual Assistant profession is not shrinking. It is evolving.", "am": "የቨርቹዋል ረዳትነት ሙያ እየቀነሰ አይደለም፤ ይልቁንም እያደገ እና እየተሻሻለ ነው።", "om": "Ogeessi Gargaaraa Virtual (VA) hin xiqqaaatu. Jijjiirama irra jira.", "ti": "ሞያ ቨርቹዋል ረዳኢ ይንኪዕ ኣሎ ማለት አይደለም። ይዕብልልን ይልወጥን ኣሎ።", "so": "Xirfadda Kaaliyaha Virtual-ka (VA) ma yaraaneyso. Way horumareysaa.", "ar": "مهنة المساعد الرقمي لا تنحسر، بل تتطور.", "sw": "Utaalamu wa Kuwa Msaidizi wa Kijanja (Virtual Assistant) haupungui. Unabadilika na kukua.", "fr": "La profession d'assistant virtuel ne régresse pas. Elle évolue."},
    "— path to the main content file, relative to the repository root —": {"en": "— path to the main content file, relative to the repository root —", "am": "— ዋናው የይዘት ፋይል የሚገኝበት መንገድ፣ ከማጠራቀሚያው ዋና (root) ማህደር አንፃር —", "om": "— karaa faayilii qabiyyee guddaa, hundee kuusaa irraa kaasee —", "ar": "— مسار ملف المحتوى الرئيسي، نسبياً إلى جذر المستودع —", "sw": "— njia ya faili kuu la maudhui, kulingana na mzizi wa hifadhi (repository root) —"},
    "Acceptable latency with occasional spikes during peak traffic bursts.": {"en": "Acceptable latency with occasional spikes during peak traffic bursts.", "am": "ከፍተኛ የትራፊክ ፍሰት በሚኖርበት ጊዜ አልፎ አልፎ የሚከሰቱ ጭማሪዎችን ጨምሮ ተቀባይነት ያለው መዘግየት።", "om": "Yeroo tiraafikiin guddaan walitti qabamu turtiin yeroo tokko tokko dabalu fudhatama qaba.", "ti": "ኣብ እዋን ዝለዓለ ናይ ትራፊክ ውሕዞ ብውሑድ ግዜያት ዝረአ ተቐባልነት ዘለዎ ዘገምተኛነት።", "so": "Daahitaan la aqbali karo iyada oo ay mararka qaarkood yimaadaan kor u kacyo xilliyada ciriiriga taraafikada.", "ar": "زمن انتقال مقبول مع ارتفاعات عرضية خلال ذروة حركة المرور.", "sw": "Kuchelewa kunakokubalika kukiwa na miinuko ya mara kwa mara wakati wa msongamano mkubwa wa trafiki.", "fr": "Latence acceptable avec des pics occasionnels lors des fortes affluences de trafic."},
    "Comprehensive test suite covering edge cases, schemas, and error codes.": {"en": "Comprehensive test suite covering edge cases, schemas, and error codes.", "am": "አስቸጋሪ ሁኔታዎችን (edge cases)፣ ስኬማዎችን (schemas) እና የስህተት ኮዶችን (error codes) የሚያካትት አጠቃላይ የሙከራ ስብስብ (test suite)።", "om": "Karaan qormaataa guutuu kan haala addaa (edge cases),isiriwwanii (schemas), fi koodiiwwan dogoggoraa haguuguu.", "ti": "መትንከፍቲ ኩነታት (edge cases)፡ ስኬማታት፡ ከምኡውን ኮድ ጌጋታት ዝሽፈነሉ ምሉእ መርመራ ስዩት (test suite)።", "so": "Qorshaha tijaabada ee dhammaystiran ee daboolaya xaaladaha cidhifka ah, jaantusyada (schemas), iyo koodka khaladaadka.", "ar": "مجموعة اختبارات شاملة تغطي الحالات الطرفية (edge cases)، ومخططات البيانات (schemas)، وأكواد الأخطاء.", "sw": "Mkusanyiko kamili wa majaribio unaohusu hali za kipekee (edge cases), skimu (schemas), na nambari za makosa (error codes).", "fr": "Suite de tests complète couvrant les cas limites, les schémas et les codes d'erreur."},
    "W6 | GRADED | 1.0% | Week 6 - Precision and Flow: The Professional Edit": {"en": "W6 | GRADED | 1.0% | Week 6 - Precision and Flow: The Professional Edit", "am": "ሳምንት 6 | ውጤት የሚሰጥበት | 1.0% | ሳምንት 6 - ትክክለኛነት እና ቅልጥፍና፡ የባለሙያ ማስተካከያ", "om": "T6 | Qabxii Kan Qabate | 1.0% | Torban 6 - Sirrii fi Saffisaan: Gulaallii Ogummaa", "ti": "ሰሙን 6 | ብመዘናግዕ ዝተገምገመ | 1.0% | ሰሙን 6 - ልክዕነትን ውሕጅን፡ ሞያዊ ኣርትዖት"},
    "You earned a new badge for VA-1: VA Foundations & Professional Identity": {"en": "You earned a new badge for VA-1: VA Foundations & Professional Identity", "am": "ለ VA-1: የቨርቹዋል ረዳት መሰረቶች እና ሙያዊ ማንነት አዲስ ባጅ አግኝተዋል", "om": "Baddeessa haaraa VA-1 argatteetta: Bu'uuraalee VA & Eenyummaa Ogeessummaa", "ti": "ን VA-1: መሰረታት ቨርቹዋል ረዳኢን ሙያዊ መንነትን ሓድሽ ባጅ ተዓዊትኩም", "so": "Waxaad heshay calaamad cusub oo loogu talagalay VA-1: Aasaaska VA & Aqoonsiga Xirfadeed", "ar": "لقد حصلت على شارة جديدة لـ VA-1: أسس المساعد الافتراضي والهوية المهنية", "sw": "Umepata beji mpya ya VA-1: Misingi ya VA na Utambulisho wa Kitaaluma", "fr": "Vous avez obtenu un nouveau badge pour VA-1 : Fondements et identité professionnelle du VA"},
    "Sub-50ms p95 latency under concurrent load with graceful error recovery.": {"en": "Sub-50ms p95 latency under concurrent load with graceful error recovery.", "am": "በተመሳሳይ ጊዜ በሚመጣ ጭነት ስር ከ50 ሚሊሰከንድ በታች የሆነ p95 መዘግየት እና ስህተቶችን በለስላሳ የማስተካከል አቅም።", "om": "Fe'umsa wajjinii jalatti turtiin p95 ms 50 gadii fi deebisanii argachuu dogoggoraa miira gaariin kan qabu.", "ti": "ብተመሳሳሊ ፅዕነት (concurrent load) ትሕቲ 50ሚሊ ሰከንድ ዝኾነ p95 ዘገምተኛነት ምስ ቅኑዕ ናይ ጌጋ ሕክምና።", "so": "Daahitaan ka hooseeya 50ms p95 ah oo hoos yimaada culays isku mid ah oo leh soo kabasho khaladaad oo habaysan.", "ar": "زمن انتقال أقل من 50 مللي ثانية (p95) تحت الضغط المتزامن مع الاسترداد السلس للأخطاء.", "sw": "Kuchelewa kwa chini ya milisekunde 50 (p95) chini ya mzigo wa pamoja na uwezo mzuri wa kujirekebisha kutoka kwenye makosa.", "fr": "Latence p95 inférieure à 50 ms sous charge concurrente avec récupération d'erreur fluide."},
    "pairs. Type (string, number, boolean, color, enum) is auto-detected. Use": {"en": "pairs. Type (string, number, boolean, color, enum) is auto-detected. Use", "am": "ጥንዶች። ዓይነት (ሕብረቁምፊ፣ ቁጥር፣ ቡሊያን፣ ቀለም፣ እኑም) በራሱ ይታወቃል። ይጠቀሙ", "om": "cooteewwan. Gosti (string, number, boolean, color, enum) ofumaan beekama. Fayyadami", "ti": "ጽምዲ። ዓይነት (string, number, boolean, color, enum) ብባዕሉ ይልለ። ተጠቐ", "ar": "الأزواج. يتم اكتشاف النوع (نص، رقم، قيمة منطقية، لون، تعداد) تلقائياً. استخدم", "sw": "jozi. Aina (string, number, boolean, color, enum) hutambuliwa kiotomatiki. Tumia"},
    "W1 | GRADED | 1.0% | Week 1 - Fixing the Message: A Communication Makeover": {"en": "W1 | GRADED | 1.0% | Week 1 - Fixing the Message: A Communication Makeover", "am": "ሳምንት 1 | ውጤት የሚሰጥበት | 1.0% | ሳምንት 1 - መልእክቱን ማስተካከል፡ የግንኙነት ማሻሻያ", "om": "T1 | Qabxii Kan Qabate | 1.0% | Torban 1 - Ergaa Sirreessuu: Fooyya'iinsa Waliigaltichaa", "ti": "ሰሙን 1 | ዝተገምገመ | 1.0% | ሰሙን 1 - መልእኽቲ ምእራም: ዳዕቮ ርክብ"},
    "© 2026 Savanna Careers. Pan-African Remote Work & Tech Skills Empowerment.": {"en": "© 2026 Savanna Careers. Pan-African Remote Work & Tech Skills Empowerment.", "om": "© 2026 Savanna Careers. Hojii Fagoof Dandeettii Teknoolojii Afrikaa Guutuu CimsUU.", "ti": "© 2026 ሳቫና ከርርስ (Savanna Careers)። ፓን-ኣፍሪካዊ ናይቲ መርበብ ስራሕን ናይ ቴክኖሎጂ ክእለት ስልጣንን።", "ar": "© 2026 مهن سافانا. تمكين العمل عن بعد والمهارات التقنية في عموم إفريقيا.", "sw": "© 2026 Savanna Careers. Kazi za Kijijini za Afrika Nzima na Uimarishaji wa Ujuzi wa Kiforisi.", "fr": "© 2026 Savanna Careers. Télétravail panafricain et valorisation des compétences technologiques."},
    "AI systems can assist with many routine or time-consuming tasks, including:": {"en": "AI systems can assist with many routine or time-consuming tasks, including:", "am": "የ AI ስርዓቶች ብዙ የዕለት ተዕለት ወይም ጊዜ የሚወስዱ ስራዎችን ማገዝ ይችላሉ፣ የሚከተሉትን ጨምሮ:", "om": "Sirnoonni AI hojiilee yeroo hunda hojjetaman ykn yeroo baay'ee fudhatan hedduu gargaaruu danda'u, kanneen armaan gadii dabalatee:", "ti": "ሲስተማት AI ብዙሓት ልሙዳት ወይ ግዜ ዝወስዱ ዕማማት ክድግፉ ይኽእሉ እዮም፣ እዞም ዝስዕቡ ዝሓዙ እዮም፦", "so": "Nidaamyada AI waxay ka caawin karaan shaqooyin badan oo caadi ah ama waqti qaata, oo ay ku jiraan:", "ar": "يمكن أن تساعد أنظمة الذكاء الاصطناعي في العديد من المهام الروتينية أو المستهلكة للوقت، بما في ذلك:", "sw": "Mifumo ya AI inaweza kusaidia katika kazi nyingi za kawaida au zinazochukua muda mwingi, zikiwemo:", "fr": "Les systèmes d'IA peuvent aider dans de nombreuses tâches de routine ou chronophages, notamment :"},
    "Clean separation of concerns with dependency injection and modular routers.": {"en": "Clean separation of concerns with dependency injection and modular routers.", "am": "በዲፔንደንሲ ኢንጀክሽን (dependency injection) እና ሞዱላር ራውተሮች (modular routers) አማካኝነት ግልጽ የሆነ የኃላፊነት መዋቅር መለየት።", "om": "Adda baafannaa qulqulluu dhimmootaa kan ‘dependency injection’ fi ‘modular routers’ fayyadamuun hojjetame.", "ti": "ብሕድሕዶም ዝተዋህለሉ ጸገማት ንጹር ምፍላይ ምስ ጥሙር ቀረባ (dependency injection) ከምኡ'ውን ሞጁላዊ ሮተርስ።", "ar": "فصل نظيف للمسؤوليات مع الحقن التبعي (Dependency Injection) والموجهات المعيارية (Modular Routers).", "sw": "Tengano safi ya majukumu kwa kutumia mfumo wa kuingiza utegemezi (dependency injection) na ruta za msimu (modular routers).", "fr": "Séparation claire des responsabilités avec injection de dépendances et routeurs modulaires."},
    "as the value to bind an artboard property (e.g., to swap branded variants).": {"en": "as the value to bind an artboard property (e.g., to swap branded variants).", "am": "የጥበብ ሰሌዳ (artboard) ንብረትን ለማስተሳሰር እንደ እሴት (ለምሳሌ፣ የንግድ ምልክት ልዩነቶችን ለመቀየር)።", "om": "akka gatii qabeenya artboard waliin walitti hidhuuf (fakkeenyaaf, bifaalee jijjiiruuf).", "ti": "ከም ዋጋ ናይ ስእላዊ መደብ ባህርይ ንምተሓሓዝ (ንኣብነት፣ ንንግዳዊ ዓይነታት ንምለዋወጥ)።", "ar": "كقيمة لربط خاصية في لوحة الفن (على سبيل المثال، للتبديل بين المتغيرات ذات العلامة التجارية).", "sw": "kama thamani ya kuunganisha sifa ya ubao wa sanaa (k.m., kubadilisha miundo yenye chapa tofauti)."},
    "attribute holding a Base64-encoded JSON config. Use the Chidi insert tool (": {"en": "attribute holding a Base64-encoded JSON config. Use the Chidi insert tool (", "am": "ቤዝ64-የተመሰጠረ (Base64-encoded) የJSON ማዋቀር (config) የያዘ ባህሪ። የቺዲን (Chidi) ማስገቢያ መሳሪያ ይጠቀሙ (", "om": "qabiyyee qindaa'ina JSON Base64-encoded qabu. Fayyadami", "ar": "يحتوي على إعدادات JSON مشفرة بصيغة Base64. استخدم أداة إدراج Chidi (", "sw": "sifa moja inayohifadhi usanidi wa JSON uliosimbwa kwa Base64. Tumia zana ya kuingiza"},
    "file and populate your cloud API credentials and database connection string.": {"en": "file and populate your cloud API credentials and database connection string.", "am": "ፋይል ይፍጠሩ እና የደመና (cloud) ኤፒአይ ምስክርነቶችዎን (credentials) እና የመረጃ ቋት ማገናኛ ጽሑፍ (connection string) ያስገቡበት።", "om": "faayilii fi ragaa eenyummaa API duumessaa keessanii akkasumas keenyan walqunnamtii daataa beezii (database connection string) itti guutaa.", "ti": "ፋይል ብምግባር ናይ ክላውድ (cloud) API መረዳእታኻን ናይ ዳታቤዝ (database) መራኸቢ ስትሪንግን (connection string) ኣእቱ።", "ar": "وقم بملئه ببيانات اعتماد واجهة برمجة التطبيقات السحابية (API) وسلسلة اتصال قاعدة البيانات.", "sw": "na ujaze vitambulisho vyako vya API ya wingu na mfuatano wa muunganisho wa hifadhidata (database connection string).", "fr": "et renseignez vos identifiants d'API cloud ainsi que votre chaîne de connexion à la base de données."},
    "how to use AI tools effectively to improve productivity and quality of work.": {"en": "how to use AI tools effectively to improve productivity and quality of work.", "am": "ምርታማነትን እና የስራ ጥራትን ለማሻሻል የ AI መሳሪያዎችን በብቃት እንዴት መጠቀም እንደሚችሉ የሚረዱ።", "om": "meeshaalee AI akkamitti bu'aa qabeessummaa fi qulqullina hojii fooyyessuuf akka itti fayyadaman kan beekan.", "ti": "ውህደትንጽሬትን ስራሕ ንምምሕያሽ መሳርሒታት AI ብብቕዓት ከመይ ገይርካ ክትጥቀምሉ ከም ትኽእል ንምፍላጥ።", "so": "sida loo isticmaalo qalabka AI si wax ku ool ah si loo kordhiyo wax soo saarka iyo tayada shaqada.", "ar": "كيفية استخدام أدوات الذكاء الاصطناعي بفعالية لتحسين الإنتاجية وجودة العمل.", "sw": "jinsi ya kutumia zana za AI kwa ufanisi ili kuongeza tija na ubora wa kazi.", "fr": "utiliser efficacement les outils d'IA pour améliorer leur productivité et la qualité de leur travail."},
    "Module 4: Intelligent Cloud Microservices & AI APIs | Savanna Learning Platform": {"en": "Module 4: Intelligent Cloud Microservices & AI APIs | Savanna Learning Platform", "am": "ሞጁል 4፡ ብልጥ የክላውድ ማይክሮሰርቪሶች እና የAI ኤፒአይዎች | የሳቫና ትምህርት መድረክ", "om": "Boqonnaa 4: Maaykiroo-tajaajilota Kulaawudii fi APIwwan AI Oomishaa | Marsariitii Barumsaa Savanna", "ti": "ክፍሊ 4፦ ለባቡዋት ዓቐብ-መዝገብ መርበብ ሓበሬታን ሰብ-ሰራሕ ብልሓት APIsን | ሳቫና መማህሪ መድረኽ", "ar": "الوحدة 4: الخدمات السحابية المصغرة الذكية واهتمام واجهات برمجة التطبيقات للذكاء الاصطناعي | منصة التعلم سافانا", "sw": "Moduli ya 4: Huduma Ndogo za Wingu zenye Akili Bandia na API za AI | Jukwaa la Kujifunza la Savanna", "fr": "Module 4 : Microservices cloud intelligents et API d'IA | Plateforme d'apprentissage Savanna"},
    "Even as AI tools improve, there are many areas where human VAs remain essential:": {"en": "Even as AI tools improve, there are many areas where human VAs remain essential:", "am": "የሰው ሰራሽ የማሰብ (AI) መሣሪያዎች ቢሻሻሉም፣ የሰው ምናባዊ ረዳቶች አስፈላጊ ሆኖ የሚቀጥሉባቸው ብዙ ዘርፎች አሉ፡", "om": "Meeshaaleen AI fooyya'aa deemuus, iddoowwan gargaartonni VA namootaa itti barbaachisoo ta'an hedduutu jiru:", "ti": "መሳርሒታት AI እናመሓየሹ ኪኸዱ ከለዉ እኳ፣ ሰብኣዊ VAs ኣገደስቲ ዝኾኑሉ ብዙሓት ኩነታት ኣለዉ፦", "so": "Xitaa iyadoo qalabka AI ay soo hagaagayaan, waxaa jira meelo badan oo ay VA-yada bini'aadanka ahi weli lagama maarmaan u yihiin:", "ar": "حتى مع تحسن أدوات الذكاء الاصطناعي، لا تزال هناك العديد من المجالات التي يظل فيها المساعدون البشريون أساسيين:", "sw": "Hata wakati zana za AI zinapozidi kuboreshwa, kuna maeneo mengi ambapo VA wa kibinadamu bado ni muhimu sana:", "fr": "Même si les outils d'IA s'améliorent, de nombreux domaines restent essentiels pour les assistants virtuels humains :"},
    "High integrity, exceptional attention to detail, and autonomous time management.": {"en": "High integrity, exceptional attention to detail, and autonomous time management.", "am": "ከፍተኛ ታማኝነት፣ ለዝርዝር ነገሮች ልዩ ትኩረት መስጠት እና ገករ-አስተዳደራዊ የሰዓት አጠቃቀም።", "om": "Aamansiisummaa olaanaa, xiyyeeffannoo cimaa bal'ina hojiitiif kennuu, fi yeroo mataa isaatti beellama qabachuu danda'uu.", "ti": "ልዑል ተኣማንነት፡ ናይ ሰለስተ ነገራት ኣቓልቦ፡ ከምኡውን ናይ ገዛእ ርእስኻ ግዜ ናይ ምምሕዳር ክእለት።", "so": "Daacadnimo sare, fiiro gaar ah oo faahfaahsan, iyo maaraynta waqtiga oo madax-bannaan.", "ar": "نزاهة عالية، وانتباه استثنائي للتفاصيل، وإدارة ذاتية للوقت.", "sw": "Uadilifu wa hali ya juu, umakini wa kipekee kwa undani, na usimamizi huru wa wakati.", "fr": "Grande intégrité, souci exceptionnel du détail et gestion autonome du temps."},
    "Understand how to use AI as a support tool, not a shortcut for poor-quality work": {"en": "Understand how to use AI as a support tool, not a shortcut for poor-quality work", "am": "ለደካማ ጥራት ስራዎች አቋራጭ መንገድ ሳይሆን የሰው ሰራሽ የማሰብ (AI) ቴክኖሎጂን እንደ ረዳት መሳሪያ እንዴት መጠቀም እንደሚቻል መረዳት", "om": "AI akka meeshaa deeggarsaatti malee, akka karaa gabaabaa hojii qulqullina hin qabne ittiin hojjetaniitti fayyadamuu dhiisuu hubachuu", "ti": "AI ከም ደገፍ መሳርሒ እምበር ንትሕተ-ጽሬት ስራሕ መሕጸሪ መገዲ ከም ዘይኮነ ምርዳእ", "so": "Fahmo sida loo isticmaalo AI oo ah qalab taageero ah, ee aan ahayn waddo gaaban oo shaqo tayo xun lagu soo saaro", "ar": "فهم كيفية استخدام الذكاء الاصطناعي كأداة مساعدة، وليس كاختصار لأعمال رديئة الجودة", "sw": "Kuelewa jinsi ya kutumia AI kama zana ya usaidizi, sio njia ya mkato kwa kazi duni", "fr": "comprendre comment utiliser l'IA comme un outil de soutien et non comme un raccourci pour un travail de mauvaise qualité"},
    "(.txt, .md, .csv, .log). Unrecognized extensions render with a generic file icon.": {"en": "(.txt, .md, .csv, .log). Unrecognized extensions render with a generic file icon.", "am": "(.txt, .md, .csv, .log)። ያልታወቁ የፋይል ቅጥያዎች በአጠቃላይ የፋይል አዶ ይታያሉ።", "om": "(.txt, .md, .csv, .log). Galmeewwan hin beekamne mallattoo fayyaa isaanii isa baramaa ta'een agarsiifamu.", "ti": "(.txt, .md, .csv, .log)። ዘይተፈልጡ ቅጥዕታት ብሓፈሻዊ ናይ ፋይል ምልክት ይቐርቡ።", "ar": "(.txt, .md, .csv, .log). يتم عرض الامتدادات غير المعروفة باستخدام أيقونة ملف عامة.", "sw": "(.txt, .md, .csv, .log). Viambajengo visivyotambulika huonyeshwa kwa aikoni ya kawaida ya faili."},
    "As the profession evolves, the most valuable VAs will likely be those who combine": {"en": "As the profession evolves, the most valuable VAs will likely be those who combine", "am": "ሙያው እያደገ ሲሄድ፣ በጣም ዋጋ ያላቸው ምናባዊ ረዳቶች እነዚህን የሚያጣምሩ ይሆናሉ", "om": "Akkuma ogeessichi fooyya'aa deemuun, gargaartonni VA gatii guddaa qabaatan isaan kanneen walitti fiduu danda'an ta'u", "ti": "ሞያ እናማዕበለ ምስ ከደ፣ ዝበለጸ ዋጋ ዘለዎም VAs እቶም ዝስዕቡ ዘወሃህዱ ክኾኑ ይኽእሉ እዮም", "so": "Markay xirfaddu horumarto, VA-yada ugu qiimaha badan waxay u badan tahay inay noqdaan kuwa isku dara", "ar": "مع تطور المهنة، يُرجح أن يكون المساعدون الأكثر قيمة هم أولئك الذين يجمعون بين", "sw": "Kadiri taaluma hii inavyobadilika, VA wenye thamani zaidi wanaweza kuwa wale wanaochanganya", "fr": "À mesure que la profession évolue, les assistants virtuels les plus précieux seront probablement ceux qui associent"},
    "adaptable, tech-aware, organized, specialized, and deeply human in how they serve": {"en": "adaptable, tech-aware, organized, specialized, and deeply human in how they serve", "am": "ተለዋዋጭ፣ ቴክኖሎጂን የሚያውቁ፣ የተደራጁ፣ በልዩ ሙያ የሰለጠኑ እና በሰዎች አገልግሎት ላይ ልበ ቅን የሆኑ", "om": "haala qabatamaatti madaquu danda'an, teeknooloojii beekan, qindaa'oo ta'an, dhimma tokko irratti xiyyeeffatan, fi tajaajila isaanii keessatti ilaalcha dhala namaa cimoo qaban", "ti": "ምስ ኩነታት ዝለማመዱ፡ ንቴክኖሎጂ ዝፈልጡ፡ እኩባት፡ ፍሉይ ክእሎት ዘለዎምን ኣብ ኣገልግሎቶም ሰብኣዊ መንፈስ ዘርእዩን", "so": "la qabsi badan, tignoolajiyada garanaya, nidaamsan, takhasus leh, isla markaana leh dareen bini'aadinimo qoto dheer habka uu u adeegayo", "ar": "القدرة على التكيف، والوعي التقني، والتنظيم، والتخصص، واللمسة الإنسانية العميقة في تقديم الخدمات", "sw": "wenye kubadilika, wanaojua teknolojia, waliopangika, wenye utaalamu maalum, na wanaojali kibinadamu katika utumishi wao", "fr": "adaptables, conscients des technologies, organisés, spécialisés et profondément humains dans leur approche du service"},
    "to dispatch heavy machine learning workloads without blocking client connections.": {"en": "to dispatch heavy machine learning workloads without blocking client connections.", "am": "የደንበኞችን ግንኙነቶች ሳያስተጓጉሉ ከባድ የማሽን ለርኒንግ የስራ ጫናዎችን ለመላክ ይጠቀሙበታል።", "om": "hojiwwaan barumsa maashinii ulfaatoo walitti hidhaa abbaa maamiloo osoo hin cufin erguuf.", "ti": "ናይ ዓሚቝ ማሽናል লারኒንግ ዕዮታት ንምልኣኽ፡ ናይ ዓማዊል ዝግታታት (client connections) ከይዓጸዉ።", "so": "si ay u diraan culaysyada shaqada ee culus ee mashiinka wax barta iyaga oo aan xidhin xidhiidhada macaamiisha.", "ar": "لإرسال مهام تعلم الآلة الثقيلة دون حظر اتصالات العملاء.", "sw": "kutuma mizigo mizito ya ujinekimataifa bila kuzuia miunganisho ya wateja.", "fr": "pour répartir de lourdes charges de travail d'apprentissage automatique sans bloquer les connexions des clients."},
    "W5 | GRADED | 1.0% | Week 5 - Thesis to Architecture: Building a Logical Foundation": {"en": "W5 | GRADED | 1.0% | Week 5 - Thesis to Architecture: Building a Logical Foundation", "am": "ሳምንት 5 | ውጤት የሚሰጥበት | 1.0% | ሳምንት 5 - ከሃሳብ እስከ ማዕቀፍ፡ ሎጂካዊ መሰረት መገንባት", "om": "T5 | Qabxii Kan Qabate | 1.0% | Torban 5 - Yaada Bu'uuraa irraa hanga Caasaatti: Hundee Yaadaatiif Bu'uura Jajjabaa Ijaaruu", "ti": "ሰሙን 5 | ዝተገምገመ | 1.0% | ሰሙን 5 - ካብ ዛዕባ ናብ ኣርክቴክቸር: ሎጂካዊ መሰረት ምህናጽ"},
    "W2 | GRADED | 1.0% | Week 2 - The Feedback Loop: Mastering AI-Enhanced Communication": {"en": "W2 | GRADED | 1.0% | Week 2 - The Feedback Loop: Mastering AI-Enhanced Communication", "am": "ሳምንት 2 | ውጤት የሚሰጥበት | 1.0% | ሳምንት 2 - የአስተያየት ዑደት፡ በ AI የተደገፈ ግንኙነትን ማጠናከር", "om": "T2 | Qabxii Kan Qabate | 1.0% | Torban 2 - Deebii Kennuu fi Fudhachuu: Kominikeeshinii AI-tiin Deeggarame Barachuu", "ti": "ሰሙን 2 | ዝተገምገመ | 1.0% | ሰሙን 2 - ናይ ርኢቶ ዑደት: ብኣርቲፊሻል ኢንተለጀንስ (AI) ዝተማዕበለ ርክብ ምኽኣል"},
    "W7 | GRADED | 1.0% | Week 7 - The Brevity Benchmark: Cutting Through Corporate Noise": {"en": "W7 | GRADED | 1.0% | Week 7 - The Brevity Benchmark: Cutting Through Corporate Noise", "am": "ሳምንት 7 | ውጤት የሚሰጥበት | 1.0% | ሳምንት 7 - የ brevity መለኪያ፡ አላስፈላጊ የድርጅት ጫጫታዎችን ማስወገድ", "om": "T7 | Qabxii Kan Qabate | 1.0% | Torban 7 - Gabaabsanii Barreessuu: Hayyeeffannoo fi Hayyama Dhaabbata Keessaa Baasuu", "ti": "ሰሙን 7 | ብመዘናግዕ ዝተገምገመ | 1.0% | ሰሙን 7 - መጠን ሓፂር ቃል፡ ካብ ናይ ትካል ድምጺ ምእላይ"},
    "Verify that your local instance launches properly and logs the worker initialization:": {"en": "Verify that your local instance launches properly and logs the worker initialization:", "am": "የእርስዎ ሎካል ኢንስስታንስ (local instance) በትክክል መጀመሩን እና የሰራተኛውን (worker) መነሻነት መዝገብ (log) ማሳየቱን ያረጋግጡ፡", "om": "Insitiansiin naannoo keessanii sirriitti ka'uu isaa fi jalqabsiifama hojjetaa (worker initialization) galmeessuu isaa mirkaneeffadhaa:", "ti": "ናይ ከባቢኻ (local) instance ብግቡእ ምጅማሩን ነቲ worker ምጅማር (initialization) ከም መዝገብ (log) ምርኣዩን ኣረጋግጽ፦", "ar": "تحقق من أن مثيلك المحلي يعمل بشكل صحيح ويقوم بتسجيل بدء تشغيل العامل (worker initialization):", "sw": "Thibitisha kuwa mfano wako wa hapa nchini (local instance) unazindua vizuri na kuandika kwenye kumbukumbu (logs) uanzishwaji wa mfanyakazi (worker):", "fr": "Vérifiez que votre instance locale se lance correctement et enregistre l'initialisation du worker dans les journaux :"},
    "such as chatbots, voice assistants, and digital agents. In other contexts, it refers to": {"en": "such as chatbots, voice assistants, and digital agents. In other contexts, it refers to", "am": "እንደ ቻትቦቶች፣ የድምፅ ረዳቶች እና የዲጂታል ወኪሎች ያሉ አሉ። በሌሎች ሁኔታዎች ደግሞ የሚያመለክተው", "om": "kan akka chaatbootii, gargaartota sagalee, fi ajantoota dijitaalaa. Haala biroo keessatti, kan ibsu", "so": "sida chatbots-ka, kaaliyeyaasha codka, iyo wakiilada digital-ka ah. Xaaladaha kale, waxaa loola jeedaa", "ar": "مثل روبوتات المحادثة، والمساعدين الصوتيين، والوكلاء الرقميين. وفي سياقات أخرى، يشير إلى", "sw": "kama vile chatbots, visaidizi vya sauti, na mawakala wa kidijitali. Katika muktadha mwingine, inamaanisha", "fr": "tels que les chatbots, les assistants vocaux et les agents numériques. Dans d'autres contextes, il fait référence à"},
    "Execute ad-hoc operational research and coordinate cross-departmental deadlines smoothly.": {"en": "Execute ad-hoc operational research and coordinate cross-departmental deadlines smoothly.", "am": "临时 የሆኑ የስራ ላይ ጥናቶችን ማከናወን እና የክፍል አቋራጭ የስራ ቀናትን በለስላሳ ሁኔታ ማስተባበር።", "om": "Qorannoo hojii dhiibbaa yeroo qabxii irratti hojjetamu gaggeessuu fi guyyaa xumuraa kan kutaa garaagaraa walitti fidu sirnaan qindeessuu.", "ti": "ግዜያዊ ናይ ስራሕ መጽናዕቲታትን ንዝተፈላለዩ ክፍሊታት ዝምልከት ናይ ግዜ ገደባት ብዘይ ጸገም ኣወሃህድ።", "so": "Samee cilmi-baaris hawleed oo degdeg ah oo si habsami leh u xooji wakhtiyada kama dambaysta ah ee waaxyaha dhexdooda.", "ar": "إجراء أبحاث تشغيلية مخصصة وتنسيق المواعيد النهائية بين الأقسام بسلاسة.", "sw": "Tekeleza utafiti wa kiutendaji wa mara kwa mara na uratibishe tarehe za mwisho za idara mbalimbali kwa urahisi.", "fr": "Mener des recherches opérationnelles ponctuelles et coordonner harmonieusement les échéances interministérielles."},
    "W4 | GRADED | 1.0% | Stress-Testing Logic: AI as a Strategic Sounding Board (AI Literacy)": {"en": "W4 | GRADED | 1.0% | Stress-Testing Logic: AI as a Strategic Sounding Board (AI Literacy)", "am": "ሳምንት 4 | ውጤት የሚሰጥበት | 1.0% | የሎጂክ ምርመራ፡ AI እንደ ስልታዊ አማካሪ (የ AI ዕውቀት)", "om": "T4 | Qabxii Kan Qabate | 1.0% | Yaada Qormaachuu: AI akka Meeshaa Yaada Wal-jijjiirraa Stireejii (Beekumsa AI)", "ti": "ሰሙን 4 | ዝተገምገመ | 1.0% | ሎጂክ ምፍታን: AI ከም ስትራተጂካዊ መሳርሒ ምጥቃም (AI Literacy)"},
    "Screen incoming correspondence, draft professional emails, and prepare briefing summaries.": {"en": "Screen incoming correspondence, draft professional emails, and prepare briefing summaries.", "am": "ገቢ ደብዳቤዎችን እና መልዕክቶችን ይመርምሩ፣ ሙያዊ ኢሜሎችን ያዘጋጁ፣ እና የአጭር መግለጫ ማጠቃለያዎችን ያዘጋጁ።", "om": "Ergaawwan dhufan ilaali, imeelii ogeessaa qopheessi, fi gabaasa gabaabaa qophaa'inaa qopheessi.", "so": "Baadh farriimaha soo dhacaya, qor iimaylo xirfad leh, oo diyaari warbixinno kooban.", "ar": "فرز المراسلات الواردة، صياغة رسائل بريد إلكتروني احترافية، وإعداد ملخصات الإحاطة.", "sw": "Chuja barua zinazoingia, andika barua pepe za kitaalamu, na uandae muhtasari wa maelekezo.", "fr": "Filtrer la correspondance entrante, rédiger des e-mails professionnels et préparer des notes de synthèse."},
    "Proven experience as a Virtual Assistant, Executive Assistant, or Administrative Specialist.": {"en": "Proven experience as a Virtual Assistant, Executive Assistant, or Administrative Specialist.", "am": "እንደ ቨርቹዋል ረዳት፣ ዋና ስራ አስፈፃሚ ረዳት፣ ወይም የአስተዳደር ባለሙያ የተረጋገጠ ልምድ።", "om": "Gargaaraa Virtual, Gargaaraa Hojii Gaggeessaa, ykn Oggeessa Bulchiinsaa ta'uun muuxannoo qabatamaa qabaachuu.", "ti": "ከም ቨርቹዋል ረዳኢ (Virtual Assistant)፡ ዋና ስራሕ ፈጻሚ ረዳኢ (Executive Assistant)፡ ወይ ድማ ናይ ምምሕዳር ስፔሻሊስት ዝተረጋገጠ ተሞክሮ።", "so": "Waayo-aragnimo la hubo oo ah Kaaliye Dijitaal ah (Virtual Assistant), Kaaliye Sare (Executive Assistant), ama Khabiir Maamul.", "ar": "خبرة مثبتة كمساعد افتراضي، أو مساعد تنفيذي، أو أخصائي إداري.", "sw": "Uzoefu uliothibitishwa kama Msaidizi wa Mtandaoni, Msaidizi Mtendaji, au Mtaalamu wa Utawala.", "fr": "Expérience avérée en tant qu'assistant virtuel, assistant de direction ou spécialiste administratif."},
    "asset, choose its artboard and data bindings, and insert it. This produces a library-anchored": {"en": "asset, choose its artboard and data bindings, and insert it. This produces a library-anchored", "am": "ሀብት (asset)፣ የጥበብ ሰሌዳውን (artboard) እና የውሂብ ትስስሮችን ይምረጡ፣ እና ያስገቡት። ይህ በቤተ-መጽሐፍት የተያያዘ", "om": "qabeenya kana filadhu, iddoo hojii isaa fi daataa walqabate itti dabali. Kunis bu'uura galmee kan ta'e uuma", "ti": "ጸጋ (asset) ክታ ፡ ነቲ ናይ ስእሊ መደብን (artboard) ዳታ መተሓሓዝን መሪጽካ ኣእትዎ። እዚ ድማ ምስ ቤተ-መጻሕፍቲ ዝተኣሳሰረ", "ar": "أصلًا (Asset)، وحدد لوحة الرسم (Artboard) وربط البيانات الخاص بها، ثم أدرجه. ينتج عن هذا عنصر مرتبط بالمكتبة", "sw": "rasilimali, chagua artboard yake na miunganisho ya data, kisha uiweke. Hii inatoa rasilimali iliyofungamanishwa na maktaba"},
    "Now that you have explored where the VA industry is heading, the next question becomes personal:": {"en": "Now that you have explored where the VA industry is heading, the next question becomes personal:", "am": "የቪኤ (VA) ኢንዱስትሪ ወዴት እያመራ እንደሆነ ካሰሱ በኋላ፣ የሚቀጥለው ጥያቄ የግል ይሆናል፡", "om": "Amma indasitiriin VA gara kamitti imalaa akka jiru qoratteetta, gaaffiin itti aanu kan dhufaa ta'a:", "ti": "ኢንዱስትሪ ቪርቹዋል ረዳኢ ኣበይ ኣቢሉ ከም ዘሎ ሕጂ ተረዲኢካዮ ኣለኻ፤ እቲ ቀጻሊ ሕቶ ግና ናብቲ ውልቃዊ ኩነታትካ ዝምልከት እዩ፦", "so": "Hadda oo aad baartay halka ay warshadaha VA u socdaan, su'aasha xigta waxay noqonaysaa mid qaas ah:", "ar": "الآن بعد أن استكشفت إلى أين يتجه قطاع المساعدين الافتراضيين (VA)، يصبح السؤال التالي شخصياً:", "sw": "Sasa kwa kuwa umechunguza mwelekeo wa sekta ya VA, swali linalofuata linakuwa la binafsi:", "fr": "Maintenant que vous avez exploré l'évolution de l'industrie des VA, la question suivante devient personnelle :"},
    ", dimensions, brand and version still resolve from the library file, so the asset stays anchored.": {"en": ", dimensions, brand and version still resolve from the library file, so the asset stays anchored.", "am": ", መጠኖች፣ ብራንድ እና ስሪት አሁንም ከቤተ-መጽሐፍት ፋይሉ ይመጣሉ፣ ስለዚህ ሀብቱ ተያይዞ ይቆያል።", "om": ", safarri, bifaafi bakkni (dimensions, brand and version) faayilii kaartichaa irraa waan argamaniif, qabeenyichi bakka isaatti jiraata.", "ti": "፣ ልዕልናታት፣ ንግዲ ትምርቲን ትርጉምን ካብቲ ናይ ቤተ-መጻሕፍቲ ፋይል ስለ ዝፍታሕ፣ እቲ ጸጋ ተተሓሒዙ ይጸንሕ።", "ar": "، والأبعاد، والعلامة التجارية، والإصدار يتم جلبها من ملف المكتبة، ليبقى الأصل مرتبطاً بقوة.", "sw": ", vipimo, chapa na toleo bado zinapatikana kutoka kwenye faili ya maktaba, ili rasilimali ibaki ikiwa imefungamanishwa."},
    "Human Virtual Assistant Services Market Size | Market Insights, Trends, and Development 2025–2032": {"en": "Human Virtual Assistant Services Market Size | Market Insights, Trends, and Development 2025–2032", "am": "የሰው ሰራሽ ምናባዊ ረዳት አገልግሎቶች ገበያ መጠን | የገበያ ግንዛቤዎች፣ አዝማሚያዎች እና እድገት 2025–2032", "om": "Hanga Gabaa Tajaajila Gargaaraa Virtualii Namoota | Hubannoo Gabaa, Haala Ammayyaa, fi Guddina 2025–2032", "ti": "ዓቐን ዕዳጋ ኣገልግሎት ሰብኣዊ ቪርቹዋል ረዳኢ (Virtual Assistant) | ትንተና ዕዳጋ፣ ዘንቀሳቐሱ ነገራት፣ ከምኡውን ምዕባለ 2025–2032", "so": "Baaxadda Suuqa Adeegyada Kaaliyaha Virtual-ka ah ee Aadanaha | Aragtida Suuqa, Isbeddellada, iyo Horumarinta 2025–2032", "ar": "حجم سوق خدمات المساعدين الافتراضيين البشريين | رؤى السوق، والاتجاهات، والتطورات 2025–2032", "sw": "Ukubwa wa Soko la Huduma za Wasaidizi wa Kidijitali wa Kibinadamu | Mitazamo ya Soko, Mwelekeo, na Maendeleo 2025–2032", "fr": "Taille du marché des services d'assistance virtuelle humaine | Aperçu, tendances et développement du marché 2025-2032"},
    "Virtual Assistant can mean two different things. In some reports, a “virtual assistant” refers to": {"en": "Virtual Assistant can mean two different things. In some reports, a “virtual assistant” refers to", "am": "ቨርቹዋል ረዳት (Virtual Assistant) ሁለት የተለያዩ ትርጉሞች ሊኖሩት ይችላል። በአንዳንድ ሪፖርቶች ላይ “ቨርቹዋል ረዳት” የሚለው ቃል የሚያመለክተው", "om": "Gargaaraan Virtual jedhamu hiika lama qabaachuu dandaʼa. Gabaasa tokko tokko keessatti, \"gargaaraan virtual\" jechuun", "ti": "ቨርቹዋል ረዳኢ ክልተ ዝተፈላለየ ትርጉም ክህልዎ ይኽእል። ኣብ ገለ ጸብጻባት፣ “ቨርቹዋል ረዳኢ” ማለት", "so": "Kaaliyaha Virtual-ka (Virtual Assistant) wuxuu macno ahaan noqon karaa laba shay oo kala duwan. Warbixinada qaar, \"kaaliye virtual\" waxaa loola jeedaa", "ar": "قد تعني عبارة \"المساعد الرقمي\" شيئين مختلفين. ففي بعض التقارير، يشير مصطلح \"المساعد الرقمي\" إلى", "sw": "Msaidizi wa Kijanja (Virtual Assistant) linaweza kumaanisha mambo mawili tofauti. Katika baadhi ya ripoti, “virtual assistant” inamaanisha", "fr": "Assistant virtuel peut signifier deux choses différentes. Dans certains rapports, un « assistant virtuel » fait référence à"},
    "W3 | GRADED | 1.0% | Breaking the Barriers: From Messy Meetings to Executive Clarity (AI Literacy)": {"en": "W3 | GRADED | 1.0% | Breaking the Barriers: From Messy Meetings to Executive Clarity (AI Literacy)", "am": "ሳምንት 3 | ውጤት የሚሰጥበት | 1.0% | እንቅፋቶችን መስበር፡ ካልተደራጁ ስብሰባዎች እስከ ስራ አስፈፃሚ ግልጽነት (የ AI ዕውቀት)", "ti": "ሰሙን 3 | ዝተገምገመ | 1.0% | ዕንቅፋታት ምጥሓስ: ካብ ዝተደበላለቑ ኣኼባታት ናብ ኤግዚክዩቲቭ ንጽርነት (AI Literacy)"},
    "Manage executive calendars, schedule multi-timezone team meetings, and coordinate travel logistics.": {"en": "Manage executive calendars, schedule multi-timezone team meetings, and coordinate travel logistics.", "am": "የስራ አስፈፃሚ የቀን መቁጠሪያዎችን ያስተዳድሩ፣ በተለያዩ የሰዓት ዞኖች ውስጥ የቡድን ስብሰባዎችን መርሐግብር ያስይዙ፣ እና የጉዞ ሎጂስቲክስን ያስተባብሩ።", "om": "Kalandarii hooggantootaa qindeessi, walgahii garee yeroo addaddaa keessatti saganteessi, fi geejjiba imalaa qindeessi.", "so": "Maamul jadwalka madaxda, qorshee kulamada kooxda ee waqtiyada kala duwan leh, oo iskudubarid agabka safarka.", "ar": "إدارة التقويمات التنفيذية، جدولة اجتماعات الفريق عبر مختلف النطاقات الزمنية، وتنسيق لوجستيات السفر.", "sw": "Simamia kalenda za viongozi, ratibu mikutano ya timu ya kanda za saa tofauti, na uratibu mipango ya usafiri.", "fr": "Gérer les agendas de la direction, planifier des réunions d'équipe sur plusieurs fuseaux horaires et coordonner la logistique des déplacements."},
    ") — you do not construct this by hand; double-click an inserted asset to reopen the configurator. The": {"en": ") — you do not construct this by hand; double-click an inserted asset to reopen the configurator. The", "am": ") —これを እርስዎ በእጅ አይሰሩትም፤ ማዋቀሪያውን (configurator) እንደገና ለመክፈት የገባውን ንብረት (asset) ორ ਵੇਰ ጠቅ ያድርጉ።", "om": ") — kana harkaadhaan hin hojjettu; qabeenya galfame tokko irra deebi'anii konfiguratarichaa banuuf irra-deebiin cuqaasaa. Kun", "ti": ") — ብኢድኩም ኣይትሰርሕዎን ኢኹም፤ ኣብ ዝኣተወ ንብረት ክልተ ግዜ ብምጥዋቕ ነቲ መማረጢ እንደገና ክፈቱ። እቲ", "ar": ") — لا تقوم بإنشاء هذا يدوياً؛ انقر نقراً مزدوجاً فوق الأصل المدرج لإعادة فتح أداة التهيئة. الـ", "sw": ") — huhitaji kuunda hii kwa mkono; bonyeza mara mbili kwenye rasilimali iliyowekwa ili kufungua tena kigeuzi. Ile"},
    "Organize cloud documentation, spreadsheet reporting, and project tracking boards in Notion and Slack.": {"en": "Organize cloud documentation, spreadsheet reporting, and project tracking boards in Notion and Slack.", "am": "የክላውድ ሰነዶችን፣ የ spreadsheet ሪፖርቶችን፣ እና የፕሮጀክት መከታተያ ሰሌዳዎችን በ Notion እና Slack ያደራጁ።", "om": "Galmee cloud irratti argaman, gabaasa spreadsheet, fi gabatee hordoffii pirojektii Notion fi Slack irratti qindeessi.", "ti": "ብመገዲ Notionን Slackን ናይ ደመና ሰነዳት፣ ናይ ስፕረድሽት ጸብጻባት፣ ከምኡውን ናይ ፕሮጀክት መከታተሊ ሰሌዳታት ኣወሃህድ።", "so": "Habee dukumiintiyada daruuraha, warbixinta xaashida xisaabinta (spreadsheets), iyo looxyada la socodka mashaariicda ee Notion iyo Slack.", "ar": "تنظيم المستندات السحابية، تقارير الجداول الإلكترونية، ولوحات تتبع المشاريع في نوشن وسلاك.", "sw": "Panga nyaraka za wingu (cloud), ripoti za lahajedwali (spreadsheets), na mbao za ufuatiliaji wa miradi katika Notion na Slack.", "fr": "Organiser la documentation cloud, les rapports sur tableur et les tableaux de suivi de projets dans Notion et Slack."},
    "Proficiency with modern remote collaboration tools: Google Workspace, Microsoft 365, Slack, and Zoom.": {"en": "Proficiency with modern remote collaboration tools: Google Workspace, Microsoft 365, Slack, and Zoom.", "am": "ዘመናዊ የርቀት ትብብር መሳሪያዎችን አጠቃቀም ክህሎት፡ Google Workspace፣ Microsoft 365፣ Slack እና Zoom።", "om": "Meeshaalee waloon hojjechuu fagoorratti gargaaramni ammayyaa: Google Workspace, Microsoft 365, Slack, fi Zoom irratti dandeettii guutuu qabaachuu.", "ti": "ብዘመናዊ ናይ ርሑቕ ምትሕብባር መሳርሒታት ዝለዓለ ክእለት፡ Google Workspace, Microsoft 365, Slack, and Zoom።", "so": "Aqoonta qalabka casriga ah ee shaqada fog: Google Workspace, Microsoft 365, Slack, iyo Zoom.", "ar": "إتقان أدوات التعاون عن بُعد الحديثة: Google Workspace و Microsoft 365 و Slack و Zoom.", "sw": "Umahiri katika zana za kisasa za ushirikiano wa mbali: Google Workspace, Microsoft 365, Slack, na Zoom.", "fr": "Maîtrise des outils de collaboration à distance modernes : Google Workspace, Microsoft 365, Slack et Zoom."},
    "Fluency in professional written and spoken English (bilingual capability in African languages valued).": {"en": "Fluency in professional written and spoken English (bilingual capability in African languages valued).", "am": "በሙያዊ የጽሁፍ እና የንግግር እንግሊዝኛ ቋንቋ አዋቂነት (የአፍሪካ ቋንቋዎችን ሁለት ቋንቋ መናገር የሚችሉ ይመረጣል)።", "om": "Afaan Ingiliffaa barreessuu fi dubbachuu dhaan ogummaadhaan dandeettii guutuu qabaachuu (dandeettiin afaanota Afrikaa lachuun dubbachuu gatii guddaa qaba).", "ti": "ብሉጽ ብቕዓት ብሞያዊ ጽሑፍን ንግግርን ኣብ እንግሊዝኛ (ክልተ ቋንቋታት ናይ ኣፍሪካ ቋንቋታት ምዝራብ ዓቢ ዋጋ አለዎ)።", "so": "Af-Ingiriisi qoraal iyo hadal ah oo si heer sare ah loogu aqoon-u-leeyahay (awoodda labada luqadood ee afafka Afrikaanka waa la qiimeeyaa).", "ar": "إتقان اللغتين الإنجليزية كتابةً وتحدثاً في بيئة العمل (تُفضل القدرة على التحدث بلغتين أفريقيتين).", "sw": "Ufasaha katika lugha ya Kiingereza ya kuandika na kuzungumza kitaalamu (uwezo wa lugha mbili za Kiafrika unathaminiwa).", "fr": "Maîtrise de l'anglais professionnel à l'écrit et à l'oral (le bilinguisme en langues africaines est un atout)."},
    "© 2026 Savanna Learning Academy — Empowering African Digital Professionals with Scalable Tech Careers.": {"en": "© 2026 Savanna Learning Academy — Empowering African Digital Professionals with Scalable Tech Careers.", "am": "© 2026 ሳቫና లెርኒንግ አካዳሚ — የአፍሪካ ዲጂታል ባለሙያዎችን በማደግ ላይ ባሉ የቴክኖሎጂ የስራ እድሎች ማብቃት።", "om": "© 2026 Savanna Learning Academy — Oggeeyota Dijitaalaa Afrikaa Carraa Hojii Teeknoolojii Guddachuu Danda'uun Beekkumsaan Cimsuu.", "ti": "© 2026 ሳቫና ለርኒንግ አካዳሚ — ኣፍሪካውያን ዲጂታል ሞያውያን ብዕዙዝ ናይ ቴክኖሎጂ ስርሓት የዕጥቕ።", "so": "© 2026 Savanna Learning Academy — Waxay Awood Siineysaa Xirfadlayaasha Dijitaalka ah ee Afrika si ay u helaan Xirfado Farsamo oo La Miisaami Karo.", "ar": "© 2026 أكاديمية سافانا للتعلم — تمكين المحترفين الرقميين الأفارقة بمجالات تقنية قابلة للتوسع.", "sw": "© 2026 Savanna Learning Academy — Kuwawezesha Wataalamu wa Kidijitali wa Kiafrika na Kazi za Teknolojia Zinazoweza Kukuwa.", "fr": "© 2026 Savanna Learning Academy — Autonomiser les professionnels du numérique africains grâce à des carrières technologiques évolutives."},
    "URL as a clickable download link. The icon and label are auto-detected from the file extension. Use the": {"en": "URL as a clickable download link. The icon and label are auto-detected from the file extension. Use the", "am": "ዩአርኤል እንደ ሊጫን የሚችል የውርድ ሊንክ። አዶው እና መለያው ከፋይሉ ቅጥያ (extension) በራስ-ሰር ተለይተው ይታወቃሉ። እባክዎ ይጠቀሙ", "om": "Akka geessituu buufataatti tajaajila. Mallattoon fi maqaan isaa galmee fayyadamtootaa irraa ofumaa argama. Fayyadami", "ti": "URL ከም ዝጠወቖ ንምውራድ ዝሕግዝ መላግቦ። እቲ ምልክትን መግለጺን ካብቲ ናይ ፋይል ቅጥዒ ብባዕሉ ይልለ። ንምፍጣሩ ነቲ", "so": "URL ahaan xiriiriye soo dejineed oo la gujin karo. Astaanta iyo calaamadda si toos ah ayaa looga ogaanayaa kordhinta faylka. Isticmaal", "ar": "رابط URL كرابط تنزيل قابل للنقر. يتم اكتشاف الأيقونة والتسمية تلقائياً من امتداد الملف. استخدم", "sw": "URL kama kiungo cha kupakua kinachoweza kubofywa. Aikoni na kibandiko hutambuliwa kiotomatiki kutoka kwa mwisho wa faili. Tumia", "fr": "URL sous forme de lien de téléchargement cliquable. L'icône et l'étiquette sont détectées automatiquement. Utilisez"},
    "Question 1: Which communication strategy is NOT recommended for decoupling high-throughput microservices?": {"en": "Question 1: Which communication strategy is NOT recommended for decoupling high-throughput microservices?", "ti": "ሕቶ 1፡ ዓቕሙ ልዑል ዝኾነ ማይክሮሰርቪስ ንምፍላይ (decoupling) እንታይ ዓይነት ናይ ርክብ ስትራተጂ ኣይምረጽን?", "ar": "السؤال 1: ما هي استراتيجية الاتصال التي **لا** يُنصح بها لفصل الخدمات المصغرة ذات الإنتاجية العالية؟", "sw": "Swali la 1: Ni mkakati gani wa mawasiliano ambao HUPENDEKEZWI kwa ajili ya kutenganisha huduma ndogo (microservices) za kiwango cha juu cha upitishaji?", "fr": "Question 1 : Quelle stratégie de communication n'est PAS recommandée pour découpler des microservices à haut débit ?"},
    "If you would like to explore the future of the VA industry further, start with these articles and reports:": {"en": "If you would like to explore the future of the VA industry further, start with these articles and reports:", "am": "የቨርቹዋል ረዳት (VA) ኢንዱስትሪን የወደፊት እጣ ፈንታ የበለጠ ማሰስ ከፈለጉ፣ በእነዚህ ጽሑፎች እና ሪፖርቶች ይጀምሩ፡", "om": "Yoo gara fuulduraattiDamee VA (Virtual Assistant) dabalataan qorachuu barbaaddan, barruulee fi gabaasota kana irraa eegala:", "ti": "መጻኢ ኢንዱስትሪ VA ብዝያዳ ክትምርምሮ ደሊኻ እንተሊኻ፡ ካብዞም ጽሑፋትን ጸብጻባትን ጀምር:", "so": "Haddii aad jeclaan lahayd inaad sii anbaqaaddo mustaqbalka warshadaha VA, ka bilow maqaalladan iyo warbixinnadan:", "ar": "إذا كنت ترغب في استكشاف مستقبل قطاع المساعدين الافتراضيين بشكل أكبر، فابدأ بهذه المقالات والتقارير:", "sw": "Ikiwa ungependa kuchunguza zaidi kuhusu mustakabali wa tasnia ya VA, anza na makala na ripoti hizi:", "fr": "Si vous souhaitez explorer davantage l'avenir de l'industrie des VA, commencez par ces articles et rapports :"},
    "Mastering asynchronous patterns ensures your applications scale reliably under global and local workloads.": {"en": "Mastering asynchronous patterns ensures your applications scale reliably under global and local workloads.", "am": "አሲንክሮነስ (asynchronous) ንድፎችን ማወቅ መተግበሪያዎችዎ በአለም አቀፍ እና በአካባቢያዊ የስራ ጫናዎች ስር በአስተማማኝ ሁኔታ ማደግ (scale ማድረግ) እንደሚችሉ ያረጋግጣል።", "om": "Paatarnii asynchronous danda'uun appilikeeshiniin keessan fe'iinsa hojii addunyaa fi naannoo jalatti amansiisaan akka guddatus mirkaneessa.", "ar": "إتقان أنماط البرمجة غير المتزامنة يضمن توسيع نطاق تطبيقاتك بكفاءة وموثوقية تحت ضغط أحمال العمل المحلية والعالمية.", "sw": "Kujua vyema mifumo ya asynkronasi huhakikisha programu tumizi zako zinakua na kufanya kazi kwa kuaminika chini ya mizigo ya kazi ya kimataifa na ya kiasili.", "fr": "Maîtriser les modèles asynchrones garantit que vos applications évoluent de manière fiable face aux charges de travail locales et mondiales."},
    "tool in the editor toolbar to pick a video — only online, public, and fully transcoded videos can be embedded.": {"en": "tool in the editor toolbar to pick a video — only online, public, and fully transcoded videos can be embedded.", "am": "ቪዲዮ ለመምረጥሪያ በአርታኢው (editor) መስሪያ አሞሌ ላይ የሚገኝ መሳሪያ — በመስመር ላይ (online) ያሉ፣ በይፋ የሚታዩ እና ሙሉ በሙሉ የተለወጡ (transcoded) ቪዲዮዎች ብቻ መከተተት (embed ማድረግ) ይቻላል።", "om": "Viidiyoo filachuuf meeshaa gulaallii fayyadami — viidiyoowwan sarara irra jiran, kan uummataa, fi guutummaatti qophaa'an qofa galchuu danda'ama.", "ti": "ቪድዮ ንምምራጽ ነቲ ኣብ መስተኻኸሊ መሳርሒታት ዘሎ መሳርሒ ተጠቐም — መስመር ዝኣተዉ፣ ህዝባዊ፣ን ምሉእ ብምሉእ ዝተቐየሩ ቪድዮታት ጥራይ ክትሓውወስ ይኽእል።", "so": "qalabka ku jira barta aaladaha tifaftiraha si aad u doorato fiidiyow — kaliya fiidiyowyada tooska ah, kuwa dadweynaha, iyo kuwa si buuxda loo rogay ayaa la dhejin karaa.", "ar": "الأداة في شريط أدوات المحرر لاختيار فيديو - يمكن فقط تضمين الفيديوهات عبر الإنترنت، والعامة، والتي تمت معالجتها بالكامل.", "sw": "zana iliyo kwenye mwambaa zana wa kihariri ili kuchagua video — ni video za mtandaoni, za wazi, na zilizochakatwa kikamilifu pekee ndizo zinazoweza kuwekwa.", "fr": "outil de la barre d'outils de l'éditeur pour sélectionner une vidéo — seules les vidéos en ligne, publiques et entièrement transcodées peuvent être intégrées."},
    "Yes, but not in a passive way. The profession appears to be moving toward a future where Virtual Assistants who are": {"en": "Yes, but not in a passive way. The profession appears to be moving toward a future where Virtual Assistants who are", "am": "አዎ፣ ግን ባለቅቤ ባልሆነ መልኩ። ሙያው ወደፊት የሚጓዘው የሚከተሉትን የሚያደርጉ ቨርቹዋል ረዳቶች (Virtual Assistants) ወደሚበዙበት አቅጣጫ ይመስላል", "om": "Eeyyee, garuu karaa duubatti hafeen miti. Ogeessonnigargaartonni virtual (Virtual Assistants) ta'an gara fuulduraatti akkamitti akka deeman agarsiisa", "ti": "እወ፡ ግና ከኣ ብዘይምንቅስቓስ መንገዲ ኣይኮነን። እቲ ሞያ ናብቲ ቨርቹዋል ረዳኢ ዝኾኑ ሰባት ዝምርሸሉ ዘሎ መጻኢ የርኢ ኣሎ", "so": "Haa, laakiin ma aha si caajis ah. Xirfaddan waxay u muuqataa inay u socoto mustaqbad uu Kaaliyaha Dijitaalka ah (VA) yahay mid", "ar": "نعم، ولكن ليس بطريقة سلبية. يبدو أن المهنة تتجه نحو مستقبل يصبح فيه المساعدون الافتراضيون الذين يتميزون بـ", "sw": "Ndiyo, lakini sio kwa mtindo wa kusubiri tu. Taaluma hii inaonekana kuelekea kwenye mwelekeo ambapo Wasaidizi Wa Mtandao ambao ni", "fr": "Oui, mais pas de manière passive. La profession semble s'orienter vers un avenir où les assistants virtuels qui sont"},
    "Collect, verify, and input market data into cloud spreadsheets. Conduct basic web research on African tech startups.": {"en": "Collect, verify, and input market data into cloud spreadsheets. Conduct basic web research on African tech startups.", "am": "የገበያ መረጃዎችን ይሰብስቡ፣ ያረጋግጡ እና በደመና ላይ በተመሰረቱ የሺት መተግበሪያዎች ላይ ያስገቡ። በአፍሪካ የቴክኖሎጂ ጀማሪ ድርጅቶች (startups) ላይ መሰረታዊ የድር ጥናቶችን ያካሂዱ።", "om": "Daataa gabaa walitti qabi, mirkaneessi, fi galmee cloud irratti galchi. Jalqaba irra aanees jalqabbiiwwan teeknooloojii Afrikaa irratti qorannoo marsariitii gaggeessi.", "ti": "ናይ ዕዳጋ መረዳእታ ኣክብ፣ ኣረጋግጽ፣ ናብ ክላውድ ስፕሬድሺት ኣእቱ። ኣብ ኣፍሪካውያን ናይ ቴክኖሎጂ ጅማሮታት (startups) መባእታዊ መጽናዕቲ መርበብ ሓበሬታ ኣካይድ።", "so": "Ururi, xaqiiji, oo geli xogta suuqa xaashida xisaabaadka daruuraha. Samee cilmi-baaris shabakadeed oo aasaasiga ah oo ku saabsan shirkadaha tignoolajiyada ee Afrika.", "ar": "جمع وتحقق وإدخال بيانات السوق في جداول البيانات السحابية. إجراء أبحاث ويب أساسية حول الشركات الناشئة في مجال التكنولوجيا في إفريقيا.", "sw": "Kusanya, hakiki, na uweke data ya soko kwenye majedwali ya mtandaoni (cloud spreadsheets). Fanya utafiti wa msingi wa mtandaoni kuhusu kampuni za teknolojia zinazoinuka Barani Afrika.", "fr": "Collecter, vérifier et saisir des données de marché dans des feuilles de calcul infonuagiques. Mener des recherches web de base sur les startups technologiques africaines."},
    "tag whose overrides are independent on each page — double-click an inserted asset to reopen the configurator. The raw": {"en": "tag whose overrides are independent on each page — double-click an inserted asset to reopen the configurator. The raw", "am": "እያንዳንዱ ገጽ ላይ ማስተካከያዎቹ (overrides) ነጻ የሆነ መለያ (tag) — ማዋቀሪያውን (configurator) እንደገና ለመክፈት የገባውን ንብረት (asset) ორ ਵੇਰ ጠቅ ያድርጉ። ጥሬው (raw)", "om": "mallattoo fuula hunda irratti adda ta'e — qabeenya seene tokko irratti altakkaa irra deddeebi'uun sagantaa sana irra deebi'ii bani. Isaa", "ti": "መፍለይ (tag) ይፈጥር ዝነበረ ለውጥታት ኣብ ነፍሲ ወከፍ ገጽ ናቱ ጽግዕተኛ ዘይብሉ እዩ — ንእተኣተወ ጸጋ ክልተ ግዜ ጠውቕ እሞ ነቲ መዋቐሪ (configurator) እንደገና ክፈቶ። ነቲ", "ar": "وسم تكون تعديلاته مستقلة في كل صفحة — انقر نقراً مزدوجاً فوق الأصل المدرج لإعادة فتح أداة التهيئة. البيانات", "sw": "tag ambayo mabadiliko yake yanajitegemea katika kila ukurasa — bonyeza mara mbili kwenye rasilimali iliyowekwa ili kufungua tena kigeuzi. Ile", "fr": "balise dont les surcharges sont indépendantes sur chaque page — double-cliquez sur un actif inséré pour rouvrir le configurateur. Le code brut"},
    "The future will likely reward VAs who go beyond general support and develop deeper skills in one or two service areas.": {"en": "The future will likely reward VAs who go beyond general support and develop deeper skills in one or two service areas.", "am": "የወደፊቱ ጊዜ ከልዩ ድጋፍ ባለፈ በአንድ ወይም በሁለት የአገልግሎት ዘርፎች ጥልቅ ክህሎቶችን የሚያዳብሩ ቨርቹዋል ረዳቶችን (VAs) ሊሸልም ይችላል።", "om": "Fuulduratti VAwwan deeggarsa waliigalaa qofaarratti osoo hin ta'in, damee tajaajila tokko ykn lama irratti dandeettii gad fagoo qaban ni badhaasa jedhamee eegama.", "ti": "መጻኢ ግዜ ነቲ ሓፈሻዊ ደገፍ ጥራይ ዘይኮነስ፣ ኣብ ሓደ ወይ ክልተ ዓውድታት ኣገልግሎት ዝያዳ ዓሚቝ ክእለት ዘማዕበሉ VAs ክሸልም እዩ።", "so": "Mustaqbalka waxaa hubaal ah inuu abaalmarin doono VA-yada ka gudba taageerada guud eena horumariya xirfado qoto dheer oo ku saabsan hal ama laba qaybood oo adeeg ah.", "ar": "من المرجح أن يكافئ المستقبل المساعدين الافتراضيين الذين يتجاوزون الدعم العام ويطورون مهارات أعمق في مجال أو مجالين من مجالات الخدمات.", "sw": "Wakati ujao utawatuza VAs wanaovuka mipaka ya usaidizi wa jumla na kuendeleza ujuzi wa kina zaidi katika eneo moja au mawili ya huduma.", "fr": "L'avenir récompensera probablement les VA qui iront au-delà du support généraliste et développeront des compétences plus poussées dans un ou deux domaines de service."},
    "Discover vetted global remote roles for Virtual Assistants, Cloud Engineers, AI Specialists, and Support Professionals.": {"en": "Discover vetted global remote roles for Virtual Assistants, Cloud Engineers, AI Specialists, and Support Professionals.", "am": "ለዲጂታል ረዳቶች (Virtual Assistants)፣ የክላውድ መሐንዲሶች፣ የሰው ሰራሽ አስተውሎት (AI) ባለሙያዎች እና የድጋፍ ባለሙያዎች የተረጋገጡ ዓለም አቀፍ የርቀት የስራ እድሎችን ያግኙ።", "om": "Gahee hojii fagoofi qorataman addunyaa guutuu keessaa kan Gargaartota Virtual (VA), Injineerota Cloud, Ogeyyii AI, fi Ogeeyyii Deeggarsaa argadhaa.", "so": "Soo hel shaqooyin caalami ah oo la hubiyay oo loogu talagalay Kaaliyeyaasha Virtual-ka, Injineerada Cloud-ka, Khabiirada AI, iyo Xirfadlayaasha Taageerada.", "ar": "اكتشف وظائف عالمية موثوقة عن بعد للمساعدين الافتراضيين، مهندسي السحابة، أخصائي الذكاء الاصطناعي، ومهنيي الدعم الفني.", "sw": "Gundua nafasi za kazi za kimataifa zilizothibitishwa za Wasaidizi wa Mtandaoni, Wahandisi wa Cloud, Wataalamu wa AI, na Wataalamu wa Huduma kwa Wateja.", "fr": "Découvrez des postes à distance mondiaux et vérifiés pour les Assistants Virtuels, Ingénieurs Cloud, Spécialistes en IA et Professionnels du Support."},
    "The future of this profession is encouraging, but it does call for growth. A strong future-ready VA will likely need to:": {"en": "The future of this profession is encouraging, but it does call for growth. A strong future-ready VA will likely need to:", "am": "የዚህ ሙያወደፊት ተስፋ ሰጪ ነው፣ ግን በእርግጠኝነት እድገትን ይጠይቃል። ለወደፊት ዝግጁ የሆነ ጠንካራ ቨርቹዋል ረዳት (VA) የሚከተሉትን ማድረግ ሊያስፈልገው ይችላል፡", "om": "Fuuldurri ogeessa kanaa kan jajjabeessudha, garuu guddina gaafata. VA cimaa fuulduraf qophaa'e tokko irraa kan eegamu:", "ti": "መጻኢ ናይ እዚ ሞያ ተስፋ ዝህብ እዩ፣ ግና ድማ ዕብየት ይሓትት። ንመጻኢ እዋን ድሉው ዝኾነ ብቑዕ VA እዚ ዝስዕብ ክህልዎ ይግባእ፦", "so": "Mustaqbalka xirfaddan waa mid dhiirigelin leh, laakiin waxay u baahan tahay koritaan. VA adag oo mustaqbalka diyaar u ah waxay u baahan doontaa inuu/ay:", "ar": "مستقبل هذه المهنة واعد، لكنه يتطلب حقاً التطور والنمو. سيحتاج المساعد الافتراضي القوي الجاهز للمستقبل غالباً إلى:", "sw": "Wakati ujao wa kazi hii unatia moyo, lakini unahitaji makuzi na mabadiliko. VA dhabiti aliye tayari kwa siku zijazo atahitaji:", "fr": "L'avenir de cette profession est encourageant, mais il exige de l'évolution. Un bon VA prêt pour l'avenir devra probablement :"},
    "who provide business support online. The future of the industry includes both, and increasingly, they will work together.": {"en": "who provide business support online. The future of the industry includes both, and increasingly, they will work together.", "am": "በመስመር ላይ የንግድ ድጋፍ የሚሰጡትን ነው። የኢንዱስትሪው የወደፊት እጣ ፈንታ ሁለቱንም ያካትታል፣ እና ከጊዜ ወደ ጊዜ አብረው ይሠራሉ።", "om": "warra deggersa daldalaa marsariitiirratti kennan. Fuuldura indaastirichaa keessaa lamaanuu ni jiru, fi yeroo dabalataa deemuun waliin hojjetu.", "ti": "ነቲ ንግዲ ብኦንላይን ደገፍ ዝህቡ። መጻኢ ናይቲ ኢንዱስትሪ ክልቲኡ ዝሓወሰ እዩ፣ ብተመሳሳሊ ድማ ብሓባር ክሰርሑ እዮም።", "so": "ee bixiya taageerada ganacsiga online-ka ah. Mustaqbalka warshaduhu wuxuu ka kooban yahay labadaba, waxaana sii kordheysa in ay wada shaqeyn doonaan.", "ar": "ويقدمون الدعم للأعمال عبر الإنترنت. يتضمن مستقبل هذه الصناعة كلاً من الجانبين، وبشكل متزايد، سيعملان معاً.", "sw": "wanaotoa usaidizi wa kibiashara mtandaoni. Wakati ujao wa sekta hii unajumuisha vyote viwili, na kwa kiwango kikubwa, vitafanya kazi pamoja.", "fr": "qui fournissent un support commercial en ligne. L'avenir du secteur englobe les deux, et de plus en plus, ils travailleront ensemble."},
    "Provide executive-level support including calendar management, email correspondence, travel booking, and report preparation.": {"en": "Provide executive-level support including calendar management, email correspondence, travel booking, and report preparation.", "am": "የቀን መቁጠሪያ አስተዳደርን፣ የኢሜይል ግንኙነቶችን፣ የጉዞ ትኬት ማዘዝን እና የሪፖርት ዝግጅትን ጨምሮ ከፍተኛ የስራ አስፈፃሚ ደረጃ ድጋፍ መስጠት።", "om": "Gargaarsa sadarkaa hooggantootaa kan qabate dhiyeessi; kan akka bulchiinsa kalandaraa, barreeffama imeelii, qabatama imalaa, fi qophii gabaasaa.", "ti": "ናይ ዕለት ዕለት ቀዳማይ ደረጃ ሓገዝ ሃብቲ ግዜ ኣመሓድራ፣ መርሃ-ግብር ምትሓዝ፣ መልእኽቲ ኢሜይል ምምርሓ፣ መገሻታት ምትዕርራይን ጸብጻባት ምድላውን ሓዊሱ።", "so": "Bixi taageero heer sare ah oo fulin ah oo ay ku jirto maamulka jadwalka, warqadaha iimaylka, ballansashada safarka, iyo diyaarinta warbixinta.", "ar": "تقديم دعم على المستوى التنفيذي يشمل إدارة التقويم، ومراسلات البريد الإلكتروني، وحجز السفر، وإعداد التقارير.", "sw": "Toa msaada wa kiwango cha juu cha kiutendaji ikiwa ni pamoja na usimamizi wa kalenda, mawasiliano ya barua pepe, uwekaji nafasi za safari, na utayarishaji wa ripoti.", "fr": "Fournir un soutien de niveau exécutif, notamment la gestion d'agenda, la correspondance par e-mail, la réservation de voyages et la préparation de rapports."},
    "Schedule posts across LinkedIn, Twitter, and Instagram. Create simple graphics with Canva and monitor community discussions.": {"en": "Schedule posts across LinkedIn, Twitter, and Instagram. Create simple graphics with Canva and monitor community discussions.", "am": "ልጥፎችን በ LinkedIn፣ Twitter እና Instagram ላይ መርሐግብር ያስይዙ። በ Canva በመጠቀም ቀላል ግራፊክስ ይፍጠሩ እና የማህበረሰብ ውይይቶችን ይከታተሉ።", "om": "Marsariitiiwwan hawaasaa irratti (LinkedIn, Twitter, fi Instagram) barreeffamoota saganteessi. Canva fayyadamuun fakkiiwwan salphaa tolchi akkasumas marii hawaasaa hordofi.", "so": "Qorshee qoraallada LinkedIn, Twitter, iyo Instagram. Ku samee naqshado fudud Canva oo la soco wadahadalada bulshada.", "ar": "جدولة المنشورات عبر لينكد إن، تويتر، وإنستغرام. تصميم رسومات بسيطة باستخدام كانفا ومتابعة النقاشات المجتمعية.", "sw": "Ratibu machapisho kwenye LinkedIn, Twitter, na Instagram. Unda picha rahisi kwa kutumia Canva na ufuatilie mijadala ya jamii.", "fr": "Planifier des publications sur LinkedIn, Twitter et Instagram. Créer des visuels simples avec Canva et modérer les discussions de la communauté."},
    "Handle customer inquiries via chat, email, and phone in both English and Amharic. Resolve issues using the company knowledge base.": {"en": "Handle customer inquiries via chat, email, and phone in both English and Amharic. Resolve issues using the company knowledge base.", "am": "በእንግሊዝኛ እና በአማርኛ ቋንቋዎች በቻት፣ በኢሜል እና በስልክ የሚመጡ የደንበኞችን ጥያቄዎች ይመልሱ። የኩባንያውን የመረጃ ቋት በመጠቀም ችግሮችን ይፍቱ።", "om": "Gaaffiiwwan maamilaa karaa chat, imeelii, fi bilbilaan Afaan Ingiliffaa fi Amaariffaan keessummeessi. Ragaa hubannoo dhaabbatichaa fayyadamuun rakkoolee hiiki.", "ti": "ብእንግሊዝኛን ኣማርኛን ብተሌፎን፣ ኢሜይልን ቻትን ዝቐርቡ ሕቶታት ተጠቃማታት ምስተናገዱ። ንጸገማት ድማ ብናይ ኩባንያ መረዳእታ መኽዘን ተጠቒምካ ፍታሕ ሃብ።", "so": "Maaree wax Ka qabashada su'aalaha macaamiisha ee ku saabsan sheekaysiga, iimaylka, iyo telefoonka labada Ingiriisi iyo Amxaari. Xalliso arrimaha adoo isticmaalaya saldhigga aqoonta shirkadda.", "ar": "التعامل مع استفسارات العملاء عبر الدردشة والبريد الإلكتروني والهاتف باللغتين الإنجليزية والأمهارية. حل المشكلات باستخدام قاعدة معارف الشركة.", "sw": "Shughulikia maswali ya wateja kupitia soga, barua pepe, na simu kwa lugha ya Kiingereza na Kiamhari. Tatua changamoto kwa kutumia mwongozo wa kampuni.", "fr": "Traiter les demandes des clients par chat, e-mail et téléphone en anglais et en amharique. Résoudre les problèmes à l'aide de la base de connaissances de l'entreprise."},
    "Responsiveness, dependability, emotional intelligence, professionalism, and clear communication will remain major differentiators.": {"en": "Responsiveness, dependability, emotional intelligence, professionalism, and clear communication will remain major differentiators.", "am": "ፈጣን ምላሽ ሰጪነት፣ አስተማማኝነት፣ ስሜታዊ ብልህነት (emotional intelligence)፣ ሙያዊ ብቃት እና ግልጽ ግንኙነት ዋና ዋና መለያ ባህሪያት ሆኖ ይቀጥላሉ።", "om": "Dadddeebisuuf qophaa'uu, amanamummaa, hubannoo miiraa, ogummaa, fi walqunnamtii ifaa ta'e dandeettiiwwan adda baasan guddaa ta'anii itti fufu.", "ti": "ኣብ እዋኑ መልሲ ምሃብ፣ እሙን ምዃን፣ ስምዒታዊ ለባምነት፣ ሞያዊ ስነ-ምግባርን ንጹር ርክባትን ቀንዲ መፈላለዪ ረቛሒታት ኮይኖም ክቕጽሉ እዮም።", "so": "Deganaanshaha, la halmaamida waqtiga, sirdoonka dareenka (emotional intelligence), xirfadda shaqada, iyo isgaarsiinta cad waxay ahaan doonaan waxyaabaha ugu waaweyn ee qofka kala sooca.", "ar": "ستظل سرعة الاستجابة، والاعتمادية، والذكاء العاطفي، والاحترافية، والتواصل الواضح من أهم عوامل التميز.", "sw": "Unyumbufu katika kujibu, kutegemewa, akili ya kihisia, weledi, na mawasiliano yaliyo wazi yatasalia kuwa sifa kuu za kipekee.", "fr": "La réactivité, la fiabilité, l'intelligence émotionnelle, le professionnalisme et la clarté de la communication resteront des éléments différenciateurs majeurs."},
    "Architecting resilient, distributed services and deploying containerized machine learning endpoints across African cloud infrastructure.": {"en": "Architecting resilient, distributed services and deploying containerized machine learning endpoints across African cloud infrastructure.", "am": "በአፍሪካ የክላውድ መሠረተ ልማት ላይ ጠንካራ፣ የተከፋፈሉ სერቪሶችን ማዋቀር እና ኮንቴይነር የተደረጉ የማሽን ሌርኒንግ ማብቂያ ነጥቦችን (endpoints) መዘርጋት።", "om": "Tajaajiloota raabsaman kanneen jabaa ta'an tolchuu fi buufataalee barumsa maashinii qola keessatti qopheessaman infraestructura duumessaa Afriikaa irra bobbaasuu.", "ti": "ኣብ መላእ ኣፍሪቃዊ ክላውድ ኢንፍራስትራክቸር፡ ጽኑዓት፡ ዝተዘርግሑ ኣገልግሎታት ምህናጽን ኮንተይነር ዝተገብሩ መርበባት ማሽናል লারኒንግ (Machine Learning endpoints) ምስማርን።", "so": "Qaabaynta adeegyo adkeysi leh, oo kala qaybsan (distributed) iyo dejinta barta mashiinka wax barta ee sanduuqyada ku jira (containerized ML endpoints) guud ahaan kaabayaasha daruuraha Afrika.", "ar": "تصميم خدمات موزعة ومرنة ونشر نقاط نهاية لتعلم الآلة داخل حاويات عبر البنية التحتية السحابية الإفريقية.", "sw": "Kusanifu huduma thabiti na zilizosambazwa, na kupeleka ncha (endpoints) za ujinekimataifa (machine learning) zilizowekwa kwenye kontena katika miundombinu ya wingu ya Afrika.", "fr": "Conception de services distribués et résilients, et déploiement de points de terminaison d'apprentissage automatique conteneurisés sur l'infrastructure cloud africaine."},
    "Follow the steps below to initialize the local inference microservice. Ensure your terminal is authenticated with your cloud credentials.": {"en": "Follow the steps below to initialize the local inference microservice. Ensure your terminal is authenticated with your cloud credentials.", "am": "የአካባቢውን (local) የኢፈረንስ ማይክሮሰርቪስ ለማስጀመር ከዚህ በታች ያሉትን ደረጃዎች ይከተሉ። ተርሚናልዎ ከክላውድ ምስክርነቶችዎ (credentials) ጋር መረጋገጡን ያረጋግጡ።", "om": "Tariiwwan armaan gadii hordofaa microservice inference naannoo sanaa jalqabsiisuuf. Terminaliin keessan ragaa keenyaa (credentials) duumessaa keessaniin mirkanaa'uu isaa mirkaneessaa.", "ti": "ነቲ ከባቢ (local) inference microservice ንምጅማር ነዞም ዝስዕቡ ስጉምታት ተከተል። ተርሚናልካ (terminal) ምስቲ ናይ ክላውድ (cloud) መረዳእታኻ (credentials) ዝተራጋገጸ ምዃኑ ኣረጋግጽ።", "ar": "اتبع الخطوات أدناه لتمهيد خدمة الاستدلال المصغرة المحلية. تأكد من مصادقة طرفيتك (Terminal) باستخدام بيانات اعتماد السحابة الخاصة بك.", "sw": "Fuata hatua zifuatazo ili kuanzisha huduma ndogo (microservice) ya utabiri ya hapa nchini (local). Hakikisha terminal yako imethibitishwa (authenticated) kwa kutumia vitambulisho vyako vya wingu (cloud credentials).", "fr": "Suivez les étapes ci-dessous pour initialiser le microservice d'inférence local. Assurez-vous que votre terminal est authentifié avec vos identifiants cloud."},
    "Clients will increasingly value VAs who can use AI tools responsibly to save time, improve output quality, and streamline repetitive work.": {"en": "Clients will increasingly value VAs who can use AI tools responsibly to save time, improve output quality, and streamline repetitive work.", "am": "ደንበኞች ጊዜን ለመቆጠብ፣ የውጤት ጥራትን ለማሻሻል እና ተደጋጋሚ ስራዎችን ለማቃለል የAI መሳሪያዎችን በኃላፊነት መጠቀም የሚችሉ ቨርቹዋል ረዳቶችን (VAs) ከጊዜ ወደ ጊዜ ዋጋ ይሰጡታል።", "om": "Maamiltoonni VA (Gargaartota Virtual) meeshaalee AI haala gaarii ta'een fayyadamuun yeroo qabachuu, qulqullina hojii fooyyessuu, fi hojiiwwan deddeebi'aman salphisuu danda'an caalaatti ni dinqisiisu.", "ti": "ዓማዊል ነቲ ግዜ ንምዕቃብ፣ጽርየት ስራሕ ንምምሕያሽ፣ ከምኡ'ውን ድጋሚ ዝስርሑ ስራሕቲ ንምቅላል መሳርሒታት AI ብሓላፍነት ክጥቀሙ ዝኽእሉ VAs ብዕምቆት ክኽብሩ እዮም።", "so": "Macamiishu waxay sii kordhin doonaan qiimaynta Kaaliyeyaasha Dijitaalka ah (VA) ee si mas'uuliyad leh u isticmaali kara aaladaha AI si ay u badbaadiyaan waqti, u wanaajiyaan tayada shaqada, isla markaana u fududeeyaan shaqooyinka soo noqnoqda.", "ar": "سيقدر العملاء بشكل متزايد المساعدين الافتراضيين الذين يمكنهم استخدام أدوات الذكاء الاصطناعي بمسؤولية لتوفير الوقت، وتحسين جودة المخرجات، وتبسيط المهام المتكررة.", "sw": "Wateja watawathamini zaidi Wasaidizi Wa Mtandao (VAs) wanaoweza kutumia zana za AI kwa uwajibikaji ili kuokoa muda, kuboresha ubora wa kazi, na kurahisisha kazi zinazojirudia.", "fr": "Les clients accorderont de plus en plus de valeur aux assistants virtuels (VA) capables d'utiliser les outils d'IA de manière responsable pour gagner du temps, améliorer la qualité des livrables et rationaliser les tâches répétitives."},
    ") in the editor toolbar to generate it; double-click an existing tag to edit its config in place — you do not need to construct this by hand.": {"en": ") in the editor toolbar to generate it; double-click an existing tag to edit its config in place — you do not need to construct this by hand.", "am": ") ለማመንጨት በአርታዒው የመሳሪያ አሞሌ ውስጥ ይጠቀሙ፤ ማዋቀሩን እዚያው ለማስተካከል ነባር መለያ (tag) ላይ ሁለቴ ጠቅ ያድርጉ — ይህንን በእጅዎ መስራት አያስፈልግዎትም።", "om": ") meeshaa galchuu Chidi gubbatee jiruun uumi; taagii duraan jiru tokko irra deebi'anii cuqaasuun bakka sanatti qindaa'ina isaa jijjiiri — kana harkaadhaan hojjechuun si hin barbaachisu.", "ti": ") ማስተካከያ መሳሪያው ላይ በመጫን ያመንጩ፤ ያሉትን መለያዎች (tags) ለማስተካከል በላያቸው ላይ ሁለት ጊዜ ይጫኑ — በቃልዎ ወይም በእጅዎ ሊሰሯቸው አይገባም።", "ar": ") في شريط أدوات المحرر لتوليدها؛ انقر نقراً مزدوجاً فوق الوسم الموجود لتحرير إعداداته مباشرة — لست بحاجة إلى بناء هذا يدويًّا.", "sw": ") kwenye mwambaa zana wa kihariri kuizalisha; bofya mara mbili kwenye lebo iliyopo ili kuhariri usanidi wake hapohapo — huitaji kuunda hili kwa mkono.", "fr": ") dans la barre d'outils de l'éditeur pour le générer ; double-cliquez sur une balise existante pour modifier sa configuration directement — vous n'avez pas besoin de le construire manuellement."},
    "— array of supporting file paths, rendered as download links above the main content. Each path is relative to the repository root (same format as": {"en": "— array of supporting file paths, rendered as download links above the main content. Each path is relative to the repository root (same format as", "am": "— ከዋናው ይዘት በላይ እንደ ማውረጃ አገናኞች (download links) የሚታዩ የसहायक ፋይል መንገዶች ድርድር (array)። እያንዳንዱ መንገድ ከሬፖዚተሪው ስር (root) አንፃር ነው (ልክ እንደ", "om": "— hiriira (array) karaa faayilii deeggarsaa, qabiyyee guddaa gubbaan akka liinkii buufataatti kan mul'atan. Karaan hundi hundee kuusaa (repository root) waliin walitti dhufeenya qaba (akkaataa boca walfakkaatuun", "ti": "— ናይ ደገፍ ፋይል መገዲታት ሰደድ (array)፣ ከም መላግቦ ንምውራድ ካብቲ ቀንዲ ትሕዝቶ ንላዕሊ ይቐርቡ። ነፍሲ ወከፍ መገዲ ምስቲ መኽዘን ስርር (repository root) ዝተተሓሓዘ እዩ (ተመሳሳሊ ቅጥዒ ምስ", "ar": "— مصفوفة من مسارات الملفات الداعمة، يتم عرضها كروابط تنزيل أعلى المحتوى الرئيسي. كل مسار نسبي لجذر المستودع (نفس تنسيق", "sw": "— orodha ya njia za faili zinazosaidia, zinazoonyeshwa kama viungo vya kupakua juu ya maudhui makuu. Kila njia inahusiana na mzizi wa hifadhi (muundo sawa na", "fr": "— tableau des chemins de fichiers de support, affichés sous forme de liens de téléchargement au-dessus du contenu principal. Chaque chemin est relatif à la racine du dépôt (même format que"},
    "100% remote work flexibility across Africa, home office and high-speed internet monthly allowance, health coverage reimbursement, and paid time off.": {"en": "100% remote work flexibility across Africa, home office and high-speed internet monthly allowance, health coverage reimbursement, and paid time off.", "am": "በአፍሪካ ዙሪያ 100% የርቀት ስራ ተለዋዋጭነት፣ የቤት ውስጥ ቢሮ እና ፈጣን ኢንተርኔት ወርሃዊ አበል፣ የጤና መድን ክፍያ ማካካሻ፣ እና የሚከፈልበት የእረፍት ጊዜ።", "om": "Afrikaa guutuu keessatti hojii fagoorratti bilisummaa guutuu qabaachuu, deeggarsa ji'aa kan mana hojii fi interneetii saffisa olaanaa, deebii baasii fayyaa, fi boqonnaa mindaa qabu.", "ti": "ኣብ መላእ ኣፍሪካ 100% ናይ ርሑቕ ስራሕ ምቹእነት፣ ንገዛ ቤት ጽሕፈትን ቅልጡፍ ኢንተርኔትን ዝኸውን ወርሓዊ ሓገዝ፣ ናይ ጥዕና ሽፋን ክፍሊት ምምላስ፣ ከምኡውን ብደሞዝ ዝድገፍ ናይ ዕረፍቲ ግዜ።", "so": "Dabacsanaanta shaqada fog ee 100% guud ahaan Afrika, gunnada bil kasta ee xafiiska guriga iyo internetka xawaaraha sare leh, dib-u-bixinta caymiska caafimaadka, iyo fasax la bixiyo.", "ar": "مرونة عمل عن بُعد بنسبة 100% في جميع أنحاء أفريقيا، مع بدل شهري لل office المنزلي والإنترنت عالي السرعة، وتعويض التغطية الصحية، وإجازة مدفوعة الأجر.", "sw": "Urahisi wa kufanya kazi kwa asilimia 100 ukiwa mbali kote barani Afrika, posho ya kila mwezi ya ofisi ya nyumbani na mtandao wa kasi, urejeshaji wa gharama za bima ya afya, na likizo ya malipo.", "fr": "Flexibilité du travail 100 % à distance à travers l'Afrique, allocation mensuelle pour le bureau à domicile et Internet haut débit, remboursement des frais de santé et congés payés."},
    "In the next lesson, you’ll explore the value of the role from a more personal perspective and reflect on why this career path may be worth pursuing.": {"en": "In the next lesson, you’ll explore the value of the role from a more personal perspective and reflect on why this career path may be worth pursuing.", "am": "በሚቀጥለው ትምህርት፣ የዚህን የሥራ መደብ ዋጋ ከባለቤትነት አንፃር ይመረምራሉ እንዲሁም ይህን የሥራ መስክ መከተል ለምን ጠቃሚ ሊሆን እንደሚችል ያሰላስላሉ።", "om": "Kutaadhuma itti aanu keessatti, faayidaa gahee kanaa ilaalcha dhuunfaatiin kan ilaaltan yoo ta'u, maaliif karaa hojii kana hordofuun barbaachisaa akka ta'es ni xiinxaltu.", "ti": "ኣብታ ቀጻሊት ትምህርቲ፣ ዋጋ እዚ ግደ ካብ ውልቃዊ መዘናዘሪ አንጻር ክትምርምሮ ኢኻ፤ ከምኡውን እዚ ናይ ስራሕ መገዲ ክትስዕቦ ዝግባእ ስለምንታይ ምዃኑ ክትሓስበሉ ኢኻ።", "so": "Casharka xiga, waxaad ku baari doontaa qiimaha doorkan dhinac shakhsi ah oo aad ka fekeri doontaa sababta ay wadadan shaqo u mudan tahay in la daba-galo.", "ar": "في الدرس القادم، ستستكشف قيمة هذا الدور من منظور شخصي أكثر وتتأمل في الأسباب التي تجعل هذا المسار المهني يستحق السعي.", "sw": "Katika somo linalofuata, utachunguza thamani ya jukumu hili kutoka mtazamo wa kibinafsi zaidi na kutafakari kwa nini njia hii ya kazi inaweza kuwa na thamani ya kufuatiliwa.", "fr": "Dans la prochaine leçon, vous explorerez la valeur de ce rôle sous un angle plus personnel et réfléchirez aux raisons pour lesquelles cette carrière mérite d'être poursuivie."},
    "This means that the future Virtual Assistant will not simply be someone who performs tasks manually. Increasingly, strong VAs will be those who know": {"en": "This means that the future Virtual Assistant will not simply be someone who performs tasks manually. Increasingly, strong VAs will be those who know", "am": "ይህ ማለት የወደፊቱ የቨርቹዋል ረዳት በቀላሉ ሥራዎችን በእጅ የሚያከናውን ሰው ብቻ አይደለም ማለት ነው። ከጊዜ ወደ ጊዜ ጠንካራ የቨርቹዋል ረዳቶች የሚባሉት የሚያውቁት ይሆናሉ", "om": "Kunis akka agarsiisutti fuulduratti Virtual Assistant jechuun namuma hojiilee harka qoftiin hojjetu qofa jechuu miti. Kanaa mannaa, VA cimaan kan jedhamu namoota beekan ta'a", "ti": "እዚ ማለት መጻኢ ቨርቹዋል ረዳኢ ብኢድ ጥራይ ስርሓት ዘሳልጥ ሰብ ጥራይ ኣይኮነን። ብዝያዳ፡ ብቑዓት VA ዝበሃሉ ነዚ ዝፈልጡ እዮም", "so": "Tani waxay ka dhigan tahay in Kaaliyaha Dijital ah ee mustaqbalku uusan noqon doonin oo keliya qof qabta shaqooyinka gacanta. Si tartiib tartiib ah, VA-yada xooggan waxay noqon doonaan kuwa garanaya", "ar": "هذا يعني أن المساعد الافتراضي المستقبلي لن يكون مجرد شخص يؤدي المهام يدوياً. وبشكل متزايد، سيكون المساعدون الافتراضيون الأكفاء هم أولئك الذين يعرفون", "sw": "Hii ina maana kwamba Msaidizi wa Kijanja wa siku za usoni hatakuwa tu mtu wa kufanya kazi kwa mkono. Mara nyingi, VA mahiri watakuwa wale wanaojua", "fr": "Cela signifie que le futur assistant virtuel ne sera pas simplement quelqu'un qui exécute des tâches manuellement. De plus en plus, les meilleurs assistants virtuels seront ceux qui savent"},
    "In distributed enterprise systems, modern microservices must decouple high-traffic ingestion from synchronous compute bottlenecks. When architecting an": {"en": "In distributed enterprise systems, modern microservices must decouple high-traffic ingestion from synchronous compute bottlenecks. When architecting an", "am": "በተከፋፈሉ የኢንተርፕራይዝ ሲስተሞች ውስጥ፣ ዘመናዊ ማይክሮሰርቪሶች ከፍተኛ ትራፊክ ያለውን መረጃ መቀበል (ingestion) ከተመሳሰሉ (synchronous) የስሌት ማነቆዎች ማላቀቅ አለባቸው። አንድን", "om": "Sirna daldalaa raabsaman keessatti, maaykiroosarsiisota ammayyaa keessummeessuu tiraafikaa olaanaa kana caccabsuu qabu. Yeroo boca", "ti": "ኣብ ዝተዘርግሑ ትካላዊ ሲስተማት፡ ዘመናዊ ማይክሮሰርቪሰርስ (microservices) ነቲ ልዑል ትራፊክ ዘለዎ እግስተር (ingestion) ካብቶም መስመራዊ ስነ-ሰዓብቲ (synchronous) ናይ ሕሳብ ጽዕንቶታት ከርሕቆም ይግባእ። ነዚ ዝስዕብ ክትሃንጽ ከለኻ", "so": "Nidaamyada ganacsiga ee kala qaybsan, adeegyada microservices-ka casriga ah waa inay ka soocaan gelitaanka taraafikada badan cidhiidhiga xisaabinta ee isla waqtigaas ah (synchronous compute bottlenecks). Marka la naqshadaynayo", "ar": "في نظم المؤسسات الموزعة، يجب على الخدمات المصغرة الحديثة فصل عمليات الاستقبال ذات الحركة المرورية العالية عن اختناقات الحوسبة المتزامنة. عند تصميم", "sw": "Katika mifumo ya kibiashara iliyosambazwa, huduma ndogo (microservices) za kisasa lazima zitenganishe upokeaji wa trafiki kubwa na vikwazo vya ukokotoaji vya synchronous. Wakati wa kusanifu", "fr": "Dans les systèmes d'entreprise distribués, les microservices modernes doivent dissocier l'ingestion à fort trafic des goulots d'étranglement informatiques synchrones. Lors de la conception d'un"},
    ": The global virtual assistant market is expanding at an annual rate of 16.3%, with over 32,000 companies employing approximately 1.7 million people worldwide.": {"en": ": The global virtual assistant market is expanding at an annual rate of 16.3%, with over 32,000 companies employing approximately 1.7 million people worldwide.", "am": ": ዓለም አቀፍ የቨርቹዋል ረዳት ገበያ በዓመት በ16.3% እያደገ ሲሆን፣ ከ32,000 በላይ ኩባንያዎች በዓለም አቀፍ ደረጃ በግምት 1.7 ሚሊዮን ሰዎችን ቀጥረው እየሠሩ ይገኛሉ።", "om": ": Gabaan gargaaraa virtualii (virtual assistant) addunyaa dhibbeentaa 16.3-n guddachaa kan jiru yoo ta'u, kampaniwwan 32,000 ol ta'an namoota miliyoona 1.7 ta'an addunyaa maratti qacaraniru.", "ti": ": ዓለምለኻዊ ዕዳጋ ቨርቹዋል ረዳኢ ኣብ ዓመት ብ 16.3% ዓቐን ይስሕፍ ኣሎ፡ ልዕሊ 32,000 ኩባንያታት ድማ ኣብ መላእ ዓለም ኣስታት 1.7 ሚልዮን ሰባት ቀሪበን ኣለዋ።", "so": ": Suuqa caalamiga ah ee kaaliyeyaasha dijitaalka ah wuxuu ku fidayaa heer sanadle ah oo ah 16.3%, iyadoo in ka badan 32,000 shirkadood ay ka shaqaysiiyaan qiyaastii 1.7 milyan oo qof adduunka oo dhan.", "ar": ": يتوسع سوق المساعدين الافتراضيين العالمي بمعدل سنوي قدره 16.3%، حيث توظف أكثر من 32,000 شركة حوالي 1.7 مليون شخص حول العالم.", "sw": ": Soko la kimataifa la wasaidizi wa mtandaoni (virtual assistants) linakua kwa kiwango cha asilimia 16.3 kwa mwaka, likiwa na zaidi ya kampuni 32,000 zinazoajiri takriban watu milioni 1.7 duniani kote.", "fr": ": Le marché mondial des assistants virtuels connaît une croissance annuelle de 16,3 %, avec plus de 32 000 entreprises employant environ 1,7 million de personnes dans le monde."},
    "You do not need to master everything immediately. What matters is building a strong foundation, staying teachable, and growing with the industry as it changes.": {"en": "You do not need to master everything immediately. What matters is building a strong foundation, staying teachable, and growing with the industry as it changes.", "am": "ሁሉንም ነገር በአንድ ጊዜ ቻችሁ መቆጣጠርጠበቅብዎትም። ዋናው ነገር ጠንካራ መሠረት መጣል፣ ለመማር ዝግጁ መሆን እና ኢንዱስትሪው እየተለወጠ ሲሄድ አብሮ ማደግ ነው።", "om": "Wantoota hundumaa battalumatti beekuun si barbaachisuu daba. Kan barbaachisu bu'uura cimaa ijaaruu, barachuuf qophaa'aa ta'uu, fi yeroo induustriichi jijjiiramu waliin guddachuu dha.", "ti": "ኩሉ ነገር ብኡብኡ ክትክእል ኣየድልየካን እዩ። ኣገዳሲ ዝኾነ ነገርጽኑዕ መሰረት ምህናጽ፡ ንትምህርቲ ድሉው ምዃን፡ ከምኡ እውን ኢንዱስትሪ ክልወጥ ከሎ ምስኡ ምዕባይ እዩ።", "so": "Uma baahnid inaad wax walba si buuxda u barato hal mar. Waxa muhiimka ah waa in aad dhisato saldhig adag, inaad diyaar u noqoto barashada wax cusub, oo aad la korto warshadaha iyagoo isbedelaya.", "ar": "لست بحاجة إلى إتقان كل شيء دفعة واحدة. ما يهم حقاً هو بناء أساس قوي، والبقاء مستعداً للتعلم، والنمو جنباً إلى جنب مع تطور قطاع العمل.", "sw": "Huna haja ya kumudu kila kitu mara moja. Kilicho cha muhimu ni kujenga msingi thabiti, kuwa tayari kufundishika, na kukua pamoja na sekta hii kadri inavyobadilika.", "fr": "Vous n'avez pas besoin de tout maîtriser immédiatement. Ce qui compte, c'est de bâtir des bases solides, de garder l'esprit ouvert à l'apprentissage et d'évoluer en même temps que le secteur."},
    "As automation handles more routine work, qualities like judgment, reliability, communication, empathy, problem-solving, and client care become even more valuable.": {"en": "As automation handles more routine work, qualities like judgment, reliability, communication, empathy, problem-solving, and client care become even more valuable.", "am": "አውቶሜሽን ብዙ ተደጋጋሚ ሥራዎችን ሲቆጣጠር፣ እንደ ማስተዋል፣ እምነት የሚጣልበት መሆን፣ ግንኙነት፣ ርህራሄ፣ ችግር ፈቺነት እና የደንበኛ እንክብካቤ ያሉ ባሕርያት ይበልጥ ዋጋ ያላቸው ይሆናሉ።", "om": "Oomishni ofumaasaa hojiilee baramaa yeroo hojjetu, amaloonni akka murtii kennuu, amanammummaa, quunnamtii, walii-galuu ykn garaaf laafina, rakkoo furuu, fi kunuunsa maamilaa caalaatti gatii guddaa qabaatu.", "ti": "ኣውቶማቲክ ስርሓት ዝያዳ ዕለታዊ ስርሓት ክቆጻጸሮ እንከሎ፡ ከም ፍርዲ፡ ተኣማንነት፡ ርክብ፡ ምሕረት (እምነት)፡ ፍታሕ ጸገማትን ክንክን ዓሚልን ዝኣመሰሉ ክእለታት ዝያዳ ክብርቲ ይኾኑ።", "so": "Maaddaama otomaatiggu uu qabto shaqooyin badan oo caadi ah, tayooyinka sida garashada, kalsoonidda, xiriirka, naxariiska, xallinta mashaakilaadka, iyo daryeelka macaamiisha waxay noqonayaan kuwo sii kordhaya oo qiimo leh.", "ar": "مع تولي الأتمتة للمزيد من المهام الروتينية، تصبح صفات مثل التقدير السليم، والموثوقية، والتواصل، والتعاطف، وحل المشكلات، ورعاية العملاء أكثر قيمة من أي وقت مضى.", "sw": "Kadiri mifumo ya kujiendesha inavyochukua kazi za kawaida, sifa kama vile uamuzi, uaminifu, mawasiliano, huruma, utatuzi wa shida, na huduma kwa wateja zinazidi kuwa na thamani kubwa zaidi.", "fr": "À mesure que l'automatisation prend en charge les tâches de routine, des qualités telles que le jugement, la fiabilité, la communication, l'empathie, la résolution de problèmes et le service client deviennent encore plus précieuses."},
    ") are rendered inline; other UTF-8 text files are shown in a code block, while non-UTF-8/binary files show a warning instead. Fetched content is cached for 1 hour.": {"en": ") are rendered inline; other UTF-8 text files are shown in a code block, while non-UTF-8/binary files show a warning instead. Fetched content is cached for 1 hour.", "am": ") በቀጥታ (inline) ይታያሉ፤ ሌሎች UTF-8 የጽሑፍ ፋይሎች በኮድ ብሎክ ውስጥ ይታያሉ፣ ዩቲኤፍ-አልባ (non-UTF-8)/ባይናሪ ፋይሎች ግን ፈንታ ማስጠንቀቂያ ያሳያሉ። የተገኘው ይዘት ለ 1 ሰዓት ተቀምጦ (cached) ይቆያል።", "om": ") achumaan mul'isuuf dhiyaatu; faayilonni barreeffamaa UTF-8 kan biroo blokii koodii keessatti kan mul'atan yommuu ta'u, faayilonni UTF-8 hin taane ykn biayinariin garuu akeekkachiisa agarsiisu. Qabiyyee fiduun kun sa'aatii 1fiif kuufamee (cache) tajaajila.", "ti": ") ብቐጥታ ይቐርቡ፤ ካልኦት ናይ UTF-8 ጽሑፍ ፋይታት ኣብ ኮድ ዓንቀጽ (code block) ይርኣዩ፣ እንተላይ ዘይኮኑ UTF-8/binary ፋይታት ግና መጠንቀቕታ የርእዩ። እቲ ዝተወስደ ትሕዝቶ ን1 ሰዓት ተታሒዙ (cached) ይጸንሕ።", "ar": ") يتم عرضها بشكل مباشر ضمن الصفحة؛ بينما تُعرض ملفات نصية أخرى بتنسيق UTF-8 داخل صندوق كود، في حين تظهر تحذيرات للملفات الثنائية أو التي لا تستخدم ترميز UTF-8. يتم التخزين المؤقت للمحتوى المسترجع لمدة ساعة واحدة.", "sw": ") zinaonyeshwa moja kwa moja; faili zingine za maandishi za UTF-8 zinaonyeshwa kwenye kizuizi cha msimbo (code block), wakati faili zisizo za UTF-8 au za mfumo wa binary zinaonyesha onyo badala yake. Maudhui yaliyovutwa yanahifadhiwa kwa muda (cache) kwa saa 1.", "fr": ") sont affichés en ligne ; les autres fichiers texte UTF-8 sont présentés dans un bloc de code, tandis que les fichiers non-UTF-8/binaires affichent un avertissement à la place. Le contenu récupéré est mis en cache pendant 1 heure."},
    "As businesses move more of their work online, they need people who can manage digital tools, communication systems, content workflows, and online coordination smoothly.": {"en": "As businesses move more of their work online, they need people who can manage digital tools, communication systems, content workflows, and online coordination smoothly.", "am": "ንግዶች ሥራዎቻቸውን ወደ መስመር ላይ ይበልጥ ሲያሸጋግሩ፣ የዲጂታል መሣሪያዎችን፣ የመገናኛ ሥርዓቶችን፣ የይዘት ሥራዎችን እና የመስመር ላይ ቅንጅቶችን በቀላሉ ማስተዳደር የሚችሉ ሰዎችን ይፈልጋሉ።", "om": "Yeroo daldalonni hojii isaanii gara interneetiitti baay'isan, meeshaalee dijitaalaa, sirna quunnamtii, hojiwwaan qabiyyee fi qindoomina miidiyaa haala gaariin hoogganuu danda'an barbaadu.", "ti": "ንግዳውያን ትካላት ስርሖም ናብ ኦንላይን እናሰጋገሩ ምስ ከዱ፡ ዲጂታል መሳርሒታት፡ ስርዓታት መራኸቢታት፡ ናይ ትሕዝቶ ኣሰራርሓን ኦንላይን ምውህሃድን ብብቕዓት ከመሓድሩ ዝኽእሉ ሰባት የድልይዎም እዩ።", "so": "Marka ay ganacsiyadu u guurayaan in badan oo ka mid ah shaqadooda online-ka, waxay u baahan yihiin dad maamuli kara qalabka digital-ka, hababka isgaarsiinta, socodka shaqada ee content-ka, iyo isku-dubbaridka online-ka ah si habsami leh.", "ar": "مع نقل الشركات لمزيد من أعمالها عبر الإنترنت، فإنها تحتاج إلى أشخاص قادريـن على إدارة الأدوات الرقمية، وأنظمة الاتصال، وسير عمل المحتوى، والتنسيق عبر الإنترنت بسلاسة.", "sw": "Kadiri biashara zinavyohamishia kazi zao nyingi mtandaoni, zinahitaji watu wanaoweza kusimamia zana za kidijitali, mifumo ya mawasiliano, mtiririko wa kazi za maudhui, na uratibu wa mtandaoni kwa ufanisi.", "fr": "À mesure que les entreprises déplacent une plus grande partie de leur travail en ligne, elles ont besoin de personnes capables de gérer sans accroc les outils numériques, les systèmes de communication, les flux de contenu et la coordination en ligne."},
    "Many businesses do not want to hire full-time, in-office staff for every task. They increasingly value support that is flexible, efficient, and easy to scale up or down.": {"en": "Many businesses do not want to hire full-time, in-office staff for every task. They increasingly value support that is flexible, efficient, and easy to scale up or down.", "am": "ብዙ ንግዶች ለእያንዳንዱ ተግባር የሙሉ ጊዜ፣ በቢሮ ውስጥ የሚሠሩ ሠራተኞችን መቅጠር አይፈልጉም። ከዚህ ይልቅ ተጣጣፊ፣ ቀልጣፋ እና በቀላሉ ሊጨምሩ ወይም ሊቀነሱ የሚችሉ የድጋፍ አገልግሎቶችን ዋጋ ይሰጣሉ።", "om": "Daldalli hedduun hojiilee hundaaf hojjetoota guutuu fi biiroo keessa taa'an qacaruu hin barbaadan. Isaanis deggersa jijjiiramaaf mijaataa, bu'aqabeessa, fi babal'isuuf ykn xiqqeessuuf salphaa ta'e caalaatti barbaadu.", "ti": "ብዙሓት ንግስታት ንነፍስወከፍ ዕዮ ሙሉእ ግዜ ኣብ ቤት ጽሕፈት ዝሰርሕ ሰራሕተኛ ክቆጽሩ ኣይደልዩን። ንሳቶም ድማ ተዓጻጻፊ፣ ውጽኢታዊ፣ ከምኡውን ንምዕባይ ወይ ንምንካይ ቀሊል ዝኾነ ደገፍ ዋጋ ይህብዎ እዮም።", "so": "Ganacsiyo badani ma rabaan inay shaqaaleysiiyaan shaqaale buuxa (full-time) oo xafiiska jooga hawl kasta. Waxay si isa soo taraysa u qiimeeyaan taageero dabacsan, waxtar leh, oo fudud in la weyneeyo ama la yareeyo.", "ar": "لا ترغب العديد من الشركات في توظيف موظفين بدوام كامل في المكتب لكل مهمة. وهي تقدر بشكل متزايد الدعم الذي يتسم بالمرونة والكفاءة وسهولة التوسيع أو التقليص.", "sw": "Biashara nyingi hazitaki kuajiri wafanyakazi wa kudumu wa ofisini kwa kila kazi. Zinazidi kuthamini msaada ulio nyumbulifu, wenye tija, na rahisi kuongeza au kupunguza kulingana na mahitaji.", "fr": "De nombreuses entreprises ne souhaitent pas embaucher du personnel à temps plein au bureau pour chaque tâche. Elles apprécient de plus en plus un support flexible, efficace et facile à adapter à la hausse ou à la baisse."},
    "By the end of this module, learners will design production-ready REST API endpoints, validate asynchronous queues with AMQP, and deploy automated container health checks.": {"en": "By the end of this module, learners will design production-ready REST API endpoints, validate asynchronous queues with AMQP, and deploy automated container health checks.", "am": "ይህንን ሞጁል ሲያጠናቅቁ ተማሪዎች ለምርት ዝግጁ የሆኑ የREST API ማቆሚያዎችን (endpoints) ይነድፋሉ፣ አሲንክሮነስ ኪዩዎችን በAMQP ያረጋግጣሉ፣ እንዲሁም አውቶማቲክ የኮንቴይነር ጤና ምርመራዎችን ያሰማራሉ።", "om": "Dhumaã¢ã¢ kanaa irratti, barattoonni qabxii REST API oomishaaf qophaa'e ni diizaayini godhu, tartiiba ergaa yeroo tokkicha hin taane (asynchronous queues) AMQP fayyadamuun ni mirkaneessu, akkasumas sakatta'insa fayyaa konteenaaraa of-danda'ee hojjetu ni bobbaasu.", "ti": "እዚ ክፍሊ ትምህርቲ ኣብ መወዳእታ፡ ተማሃሮ ንምህርቲ ዝዳለዉ REST API endpoints ክንድሕን፡ ኣሲንክሮነሰስ ሰረታት (asynchronous queues) ብ AMQP ከረጋግጹ፡ ከምኡውን ኦቶማቲክ ዝኾነ ናይ ኮንተይነር ጥዕና መርመራ ክተክል እዮም።", "so": "Dhammaadka qaybtan, ardaydu waxay naqshadayn doonaan barta REST API ee diyaar u ah soo-saarka (production-ready), waxay xaqiijin doonaan safafka aan isku waqtiga ahayn ee AMQP, waxayna dejibin doonaan baaritaanno caafimaad oo otomaatig ah oo sanduuqyada ah (container health checks).", "ar": "بنهاية هذه الوحدة، سيقوم المتعلمون بتصميم نقاط نهاية لـ REST API جاهزة للإنتاج، والتحقق من صحة طوابير الانتظار غير المتزامنة باستخدام AMQP، ونشر فحوصات آلية لصحة الحاويات.", "sw": "Kufikia mwisho wa moduli hii, wanafunzi wataunda ncha za REST API zilizo tayari kwa matumizi halisi (production-ready), watahakiki foleni za asynchronous kwa kutumia AMQP, na kupeleka ukaguzi wa afya wa kontena otomatiki.", "fr": "À la fin de ce module, les apprenants concevront des points de terminaison d'API REST prêts pour la production, valideront des files d'attente asynchrones avec AMQP et déployeront des contrôles de santé automatisés pour les conteneurs."},
    "Scalability requires strict contract isolation: each service encapsulates its own relational schema and exposes standardized endpoints secured through token authentication.": {"en": "Scalability requires strict contract isolation: each service encapsulates its own relational schema and exposes standardized endpoints secured through token authentication.", "am": "ስኬላቢሊቲ (Scalability) ጥብቅ የኮንትራት መገለልን ይጠይቃል፡ እያንዳንዱ ሰርቪስ የራሱን ሪላሽናል ስኬማ ይይዛል እና በቶከን ማረጋገጫ የተጠበቁ ደረጃቸውን የጠበቁ ማቆሚያዎችን (endpoints) ያቀርባል።", "om": "Guddisuun dandeettii tajaajilaa addaan baasuu cimaa gaafata: tajaajila tokkoon tokkoon isaaniiisgiraama f Dhuunfaa isaanii of keessaa qabu fi buufataalee beekamoo tokeniitiin eegaman ni dhiyeessu.", "ti": "ዓቕሚ ምዕባይ (Scalability) ነቲ ናይ ውዕል ፍሉልነት ይጠልብ እዩ፡ ነፍስ ወከፍ ኣገልግሎት ናይ خۆ ስሕበት ስኪማ (relational schema) ይሕዝን ብቶክን ኣተሓሓዛ (token authentication) ዝተሓለዉ ስሩዓት መወዳእታታት (endpoints) የቕርብ።", "so": "Miisaaniyadu waxay u baahan tahay go'doominta qandaraaska adag: adeeg kastaa wuxuu ka kooban yahay qaabkiisa xidhiidhka ah (relational schema) wuxuuna soo bandhigayaa barta heerka caadiga ah ee lagu sugay xaqiijinta astaanta (token authentication).", "ar": "تتطلب القابلية للتوسع عزلاً صارماً للعقود: حيث تغلف كل خدمة مخططها العلائي الخاص وتكشف عن نقاط نهاية قياسية مؤمنة من خلال مصادقة الرموز المميزة (Tokens).", "sw": "Uwezo wa kukua (scalability) unahitaji utengano mkali wa mikataba: kila huduma inajumuisha mpango wake wa uhusiano (relational schema) na kuweka wazi ncha zilizosanifiwa zilizolindwa kupitia uthibitishaji wa tokeni (token authentication).", "fr": "La scalabilité exige une isolation stricte des contrats : chaque service encapsule son propre schéma relationnel et expose des points de terminaison standardisés sécurisés par authentification par jeton (token)."},
    "Companies are now more comfortable building distributed teams, hiring remotely, and working across locations and time zones. That makes remote support roles more normal and more scalable.": {"en": "Companies are now more comfortable building distributed teams, hiring remotely, and working across locations and time zones. That makes remote support roles more normal and more scalable.", "am": "ኩባንያዎች አሁን የተዘረጉ ቡድኖችን በመገንባት፣ በርቀት በመቅጠር እና በተለያዩ አካባቢዎችና የሰዓት ዞኖች በመሥራት ረገድ የበለጠ ምቾት ይሰማቸዋል። ይህም የርቀት ድጋፍ ሚናዎችን ይበልጥ የተለመዱ እና ሊሰፉ የሚችሉ ያደርጋቸዋል።", "om": "Kampaanonni amma gareewwan facca’oo ijaaruu, fageenyarraa qacaruu, akkasumas bakkeewwanii fi naannoo yeroo garaagaraa keessatti hojjechuu mijaataa ta'anii argamu. Kunis gahee deggersaa fageenyarraa kennamu caalaatti idilee fi babal'achuuf dandeettii qabu taasisa.", "ti": "ኩባንያታት ሕጂ ጉጅለታት ኣብ ዝተፈላለየ ቦታታት ንምቛም፣ ብርሕቀት ሰራሕተኛታት ንምቕጻር፣ ከምኡውን ኣብ ዝተፈላለየ ቦታታትን ሰዓታትን ንምስራሕ ዝያዳ ተማቹኦም እዩ። እዚ ድማ እቲ ናይ ሕከክ ደገፍ ግደታት ዝያዳ ንቡርን ክሰፍሕ ዝኽእልን ይገብሮ።", "so": "Shirkaduhu hadda waxay aad ugu raaxaysanayaan dhisidda kooxo kala firdhisan, shaqaalaynta fogaanta, iyo ka shaqaynta goobo iyo waqtiyo kala duwan. Taasi waxay ka dhigaysa doorarka taageerada fog kuwo caadi ah oo la balaadhin karo.", "ar": "أصبحت الشركات أكثر ارتياحاً لبناء فرق عمل موزعة، والتوظيف عن بُعد، والعمل عبر مختلف المواقع والمناطق الزمنية. وهذا يجعل أدوار الدعم عن بُعد أكثر طبيعية وأسهل في التوسع.", "sw": "Kampuni sasa ziko huru zaidi kujenga timu zilizotawanywa, kuajiri wafanyakazi walioko mbali, na kufanya kazi kutoka maeneo na kanda za saa tofauti. Hilo linafanya nafasi za usaidizi wa mbali kuwa za kawaida zaidi na zenye uwezo wa kukua.", "fr": "Les entreprises sont désormais plus à l'aise pour constituer des équipes distribuées, recruter à distance et travailler sur plusieurs sites et fuseaux horaires. Cela rend les rôles de support à distance plus courants et plus évolutifs."},
    "The same library asset can render a different artboard, state machine or data bindings on each page. The overrides are configured in the Library Files tool and stored on the tag as a Base64": {"en": "The same library asset can render a different artboard, state machine or data bindings on each page. The overrides are configured in the Library Files tool and stored on the tag as a Base64", "am": "ተመሳሳይ የቤተ-መጽሐፍት ሀብት በእያንዳንዱ ገጽ ላይ የተለየ የጥበብ ሰሌዳ፣ የሁኔታ ማሽን (state machine) ወይም የውሂብ ትስስሮችን ማሳየት ይችላል። ማሻሻያዎቹ በቤተ-መጽሐፍት ፋይሎች መሣሪያ ውስጥ ተዋቅረው እንደ Base64 በመለያው ላይ ይቀመጣሉ", "om": "Qabeenyi galmee tokkoo fuula addadda irratti fuula hojii, sadarkaa dizaayinii ykn daataa walqabate garaagaraa agarsiisuu danda'a. Jijjiiramni kun meeshaa Galmee Kuusaa keessatti kan qophaa'u yoo ta'u akka Base64 ta'ee mallattoo irratti kuufama", "ti": "ተመሳሳሊ ናይ ቤተ-መጻሕፍቲ ጸጋ ኣብ ነፍሲ ወከፍ ገጽ ዝተፈላለየ ስእላዊ መደብ፣ ኩነታት ማሕነኽ (state machine) ወይ ዳታ መተሓሓዚ ከርኢ ይኽእል። እቲ ለውጥታት ኣብ ናይ ቤተ-መጻሕፍቲ ፋይላት መሳርሒ ተዋቂሩ ኣብቲ መፍለይ (tag) ከም Base64 ይቕመጥ", "ar": "يمكن لنفس الأصل في المكتبة عرض لوحة رسم، أو آلة حالة (State Machine)، أو ربط بيانات مختلف في كل صفحة. يتم ضبط التعديلات المخصصة في أداة ملفات المكتبة وتخزينها على العلامة بتنسيق Base64", "sw": "Rasilimali ile ile ya maktaba inaweza kuonyesha artboard tofauti, mtambo wa hali (state machine) au miunganisho ya data kwenye kila ukurasa. Mabadiliko haya yanasanidiwa katika zana ya Faili za Maktaba na kuhifadhiwa kwenye lebo kama", "fr": "Le même actif de bibliothèque peut afficher un plan de travail, une machine à états ou des liaisons de données différents sur chaque page. Les surcharges sont configurées dans l'outil Fichiers de bibliothèque et stockées sur la balise sous forme de chaîne Base64"},
    ": The Vitrual Assistant market expansion is attributed to key drivers like the rise in remote work, cost-effective solutions, and a growing preference for flexible, scalable workforce options.": {"en": ": The Vitrual Assistant market expansion is attributed to key drivers like the rise in remote work, cost-effective solutions, and a growing preference for flexible, scalable workforce options.", "am": ": የምናባዊ ረዳቶች ገበያ መስፋፋት እንደ የርቀት ሥራ መጨመር፣ ወጪ ቆጣቢ መፍትሄዎች እና ተጣጣፊና ሊሰፉ የሚችሉ የሰው ኃይል አማራጮች ምርጫ እያደገ መምጣት የመሳሰሉት ዋና ዋና ምክንያቶች የተነሳ ነው።", "om": ": Babal’achuun gabaa Gargaaraa Virtualii kanaaf sababni ijoo hojiin fagoorraa dabaluu, furmaata baasii xiqqaa gaafatu, fi filannoon humna hojii jijjiiramaaf mijataa ta'e fedhii argachaa dhuuu isaati.", "ti": "፦ እቲ ናይ ቪርቹዋል ረዳኢ ዕዳጋ ምዕባለ ንዝተዘርዘሩ ቀንዲ ምኽንያታት ዝውከክ እዩ፦ ምስፍሕፋሕ ዕዮ ካብ ርሕቐት (ሪሞት ዎርክ)፣ ወጻኢ ዝቐልል ፍታሓት፣ ከምኡውን ተጣጣይን ንዕብየት ዝምችእን ኣገባብ ስራሕ ሰራሕተኛታት ምርጫ ምውሳኽ።", "so": ": Ballaarinta suuqa Kaaliyaha Virtual-ka ah waxaa sabab u ah arrimo muhiim ah sida kor u kaca shaqada fog (remote work), xalalka kharash-ku-oolka ah, iyo doorbididda sii kordhaysa ee xulashooyinka shaqaale ee dabacsan oo la ballaarin karo.", "ar": ": يُعزى التوسع في سوق المساعدين الافتراضيين إلى عوامل رئيسية مثل انتشار العمل عن بعد، والحلول فعالة من حيث التكلفة، والتوجه المتزايد نحو خيارات القوى العاملة المرنة القابلة للتوسع.", "sw": ": Ukuaji wa soko la Wasaidizi wa Kidijitali unachangiwa na mambo makuu kama vile kuongezeka kwa kazi za mbali (remote work), suluhu zenye gharama nafuu, na kupendelea zaidi machaguo ya wafanyakazi wanaobadilika na kupanuka kwa urahisi.", "fr": ": L'expansion du marché des assistants virtuels est attribuée à des moteurs clés tels que l'essor du travail à distance, les solutions rentables et la préférence croissante pour des options de main-d'œuvre flexibles et évolutives."},
    "General support will still matter, but more clients are looking for VAs with niche strengths in areas like customer support, e-commerce, project coordination, social media, tech tools, and operations.": {"en": "General support will still matter, but more clients are looking for VAs with niche strengths in areas like customer support, e-commerce, project coordination, social media, tech tools, and operations.", "am": "አጠቃላይ ድጋፍ አሁንም አስፈላጊ ይሆናል፣ ነገር ግን ብዙ ደንበኞች እንደ የደንበኛ ድጋፍ፣ ኢ-ኮሜርስ፣ የፕሮጀክት ማስተባበር፣ ማህበራዊ ሚዲያ፣ የቴክኖሎጂ መሣሪያዎች እና ስራዎች ባሉ ልዩ ዘርፎች የተካኑ የቨርቹዋል ረዳቶችን (VAs) ይፈልጋሉ።", "om": "Deggersi waliigalaa ammas barbaachisaadha, garuu maamiltoonni hedduun Virtual Assistants (VA) dandeettii addaa kan qaban kan akka deggersa maamiltootaa, daldala elektirooniksii (e-commerce), qindoomina pirojektii, miidiyaa hawaasaa, meeshaalee teeknolojii, fi hojiilee guyyaa guyyaa irratti xiyyeeffatan barbaadu.", "ti": "ሓፈሻዊ ደገፍ ክሳብ ሕጂ ኣገዳሲ እዩ፣ ግና ዝያዳ ዓማዊል ኣብ ዓውድታት ከም ደገፍ ዓሚል፣ ኢ-ኮሜርስ፣ ምትሕብባር ፕሮጀክት፣ ሶሻል ሚድያ፣ ቴክኖሎጂ መሳርሒታት፣ ከምኡውን ስርሓት ፍሉይ ተኽሎ ዘለዎም VAታት ይደልዩ ኣለዉ።", "so": "Taageerada guud wali way muhiim ahaan doontaa, laakiin macaamiil badan ayaa raadinaya VA-yo leh xirfado gaar ah oo dhinacyada taageerada macaamiisha, e-commerce, isku-dubbaridka mashaariicda, baraha bulshada, qalabka tignoolajiyada, iyo hawlgallada ah.", "ar": "سيظل الدعم العام مهمًا، لكن المزيد من العملاء يبحثون عن مساعدين رقميين ذوي نقاط قوة متخصصة في مجالات مثل دعم العملاء، والتجارة الإلكترونية، وتنسيق المشاريع، وسائل التواصل الاجتماعي، والأدوات التقنية، والعمليات.", "sw": "Usaidizi wa jumla bado utakuwa muhimu, lakini wateja wengi wanatafuta VA wenye ujuzi maalum katika maeneo kama vile huduma kwa wateja, biashara mtandaoni, uratibu wa miradi, mitandao ya kijamii, zana za kiteknolojia, na shughuli za kiutendaji.", "fr": "Le support généraliste restera important, mais de plus en plus de clients recherchent des VA dotés de compétences de niche dans des domaines tels que le support client, le e-commerce, la coordination de projets, les réseaux sociaux, les outils technologiques et les opérations."},
    "\"Pay close attention to error boundaries: if an individual worker encounters an out-of-memory exception, your health probe must restart the worker container automatically without impacting neighbor services.\"": {"en": "\"Pay close attention to error boundaries: if an individual worker encounters an out-of-memory exception, your health probe must restart the worker container automatically without impacting neighbor services.\"", "am": "\"ለስህተት ወሰኖች (error boundaries) ከፍተኛ ትኩረት ይስጡ፡ አንድ ግለሰብ ሰራተኛ (worker) የማስታወሻ እጥረት (out-of-memory exception) ካጋጠመው፣ የጤና ምርመራዎ (health probe) ጎረቤት ሰርቪሶችን ሳይጎዳ የሰራተኛውን ኮንቴይነር በራስ ሰር እንደገና ማስጀመር አለበት።\"", "om": "\"Daangaa dogoggoraa (error boundaries) irratti xiyyeeffannaa cimaa kennaa: hojjetaan dhuunfaa tokko rakkoo memoriaa dhabuu (out-of-memory exception) yoo mudate, health probe keessan kontaneerii hojjetaa sana ofumaan irra deebi'ee kaasuu qaba tajaajiloota ollaa irratti dhiibbaa osoo hin uumin.\"", "ti": "\"ናይ ጌጋ ዶባት (error boundaries) ብዕሙቕቲ ቆላሕታ ተኸታተሉ፡ ሓደ ሰራሕተኛ ካብ ዓቕሚ ዝሓለፈ ዝኽሪ ጌጋ (out-of-memory exception) አጋጢምዎ እንተሎ፡ ናይ ጥዕና መርመራኻ (health probe) ነቲ ናይ ሰራሕተኛ ኮንቴነር ኣብ ጎረባብቲ ኣገልግሎታት ሳዕቤን ከይፈጠረ ብኣውቶማቲክ ክጅምሮ ይግባእ።\"", "so": "\"Si dhow ugu fiirso xadka khaladaadka: haddii shaqaale gaar ah uu la kulmo cilad xusuusta ka baxsan (out-of-memory exception), baaraha caafimaadkaagu waa inuu dib u bilaabaa weelka shaqaalaha (worker container) si otomaatig ah iyada oo aan loo saameyn adeegyada dariska ah.\"", "ar": "\"انتبه جيداً لحدود الأخطاء (error boundaries): إذا واجه عامل فردي استثناء نفاد الذاكرة (out-of-memory)، يجب على فحص الصحة (health probe) إعادة تشغيل حاوية العامل تلقائياً دون التأثير على الخدمات المجاورة.\"", "sw": "\"Zingatia sana mipaka ya makosa (error boundaries): mfanyakazi mmoja akikutana na hitilafu ya kuishiwa na kumbukumbu (out-of-memory exception), kichunguzi chako cha afya (health probe) lazima kiwashe upya kontena la mfanyakazi huyo kiotomatiki bila kuathiri huduma za jirani.\"", "fr": "\"Prêtez une attention particulière aux limites d'erreur : si un worker individuel rencontre une exception de dépassement de mémoire (out-of-memory), votre sonde de santé doit redémarrer le conteneur du worker automatiquement sans impacter les services voisins.\""},
    "Artificial Intelligence is making it easier to draft, summarize, organize, research, schedule, and automate routine tasks. This will not remove the need for human VAs, but it will change what strong VA work looks like.": {"en": "Artificial Intelligence is making it easier to draft, summarize, organize, research, schedule, and automate routine tasks. This will not remove the need for human VAs, but it will change what strong VA work looks like.", "am": "አርቴፊሻል ኢንተሊጀንስ (AI) ረቂቆችን ማዘጋጀት፣ ማጠቃለል፣ ማደራጀት፣ ምርምር ማድረግ፣ የጊዜ ሰሌዳ ማውጣት እና ተደጋጋሚ ሥራዎችን በራስ-ሰር ማከናወን ቀላል እያደረገው ነው። ይህ የሰውን የቨርቹዋል ረዳቶች (VAs) ፍላጎት አያስወግድም፣ ነገር ግን ጥሩ የቨርቹዋል ረዳት ሥራ ምን እንደሚመስል ይለውጠዋል።", "om": "Artificial Intelligence (AI) qajeelcha qopheessuu, gabaabsuu, gurmeessuu, qorachuu, saganteessuu, fi hojiilee baramaa ofumaasaanii akka hojjetaman gochuu salphaa taasisaa jira. Kunis barbaachisummaa VA namootaa hin hambisu, garuu hojiin VA cimaan akkamitti akka fakkaatu ni jijjiira.", "ti": "ሰብ ሰራሕ ኣእምሮ (AI) ረቂቕ ንምድላው፣ ንምጽቃጥ፣ ንምውዳብ፣ ምርምር ንምግባር፣ ግዜ ንምቕማጥ፣ ከምኡውን ልሙዳት ስርሓት ብኣውቶማቲክ ንምስራሕ ቀሊል ይገብሮ ኣሎ። እዚ ንሰብ VAs ዘድልየሉ ምኽንያት ኣይኪቕንጾን እዩ፣ ግና ድልዱል ናይ VA ዕዮ እንታይ ይመስል ዝብል ክልውጦ እዩ።", "so": "Sirdoonka Macmalka ah (AI) wuxuu fududeynayaa qorista, soo koobidda, abaabulidda, baaritaanka, jadwalka, iyo otomaatigga hawlaha caadiga ah. Tani meesha kama saari doonto baahida loo qabo VA-yada bini'aadamka ah, laakiin waxay bedeli doontaa sida shaqada xooggan ee VA ay u egtahay.", "ar": "يجعل الذكاء الاص الأمر أسهل في صياغة، وتلخيص، وتنظيم، والبحث، والجدولة، وأتمتة المهام الروتينية. لن يلغي هذا الحاجة إلى المساعدين الرقميين البشريين، ولكنه سيغير شكل العمل الفعال للمساعد الرقمي.", "sw": "Akili Bandia inafanya iwe rahisi kuandaa rasimu, kufupisha, kupanga, kufanya utafiti, kupanga ratiba, na kuendesha kazi za kawaida kiotomatiki. Hii haitaondoa hitaji la VA wa kibinadamu, lakini itabadilisha jinsi kazi bora za VA zinavyopaswa kuwa.", "fr": "L'intelligence artificielle facilite la rédaction, la synthèse, l'organisation, la recherche, la planification et l'automatisation des tâches routinières. Cela ne supprimera pas le besoin de VA humains, mais cela changera la nature d'un travail de VA de qualité."},
    ": The Virtual Assistant market is experiencing significant growth due to advancements in artificial intelligence (AI), natural language processing (NLP), and the increasing demand for efficient customer service solutions.": {"en": ": The Virtual Assistant market is experiencing significant growth due to advancements in artificial intelligence (AI), natural language processing (NLP), and the increasing demand for efficient customer service solutions.", "am": ": የቨርቹዋል ረዳት ገበያ በአርቴፊሻል ኢንተለጀንስ (AI)፣ በተፈጥሮ ቋንቋ ማቀነባበሪያ (NLP) እድገቶች እና ቀልጣፋ የደንበኛ አገልግሎት መፍትሄዎች ፍላጎት እያደገ በመምጣቱ ከፍተኛ እድገት እያሳየ ነው።", "om": ": Gabaan Gargaaraa Virtualii guddina olaanaa argachaa kan jiru dandeettii sammuu nam-tolchee (AI), sirna hubannoo afaan uumamaa (NLP), fi fedhii tajaajila tajaajilamtootaaf mijataa ta'eef qabu dabalaa dhufeen walqabateeti.", "ti": ": ዕዳጋ ቨርቹዋል ረዳኢ ብሰንኪ ምዕባለታት ኣርቲፊሻል ኢንተለጀንስ (AI)፡ ናይ ባህርያዊ ቋንቋ ምትሕሓዝ (NLP)፡ ከምኡ እውን ንብቑዕ ኣገልግሎት ዓሚል ዘለዎ ወሰኽ ዓብይ ዕብየት የርኢ ኣሎ።", "so": ": Suuqa Kaaliyaha Virtual-ka ah (Virtual Assistant) wuxuu la kulmayaa korodh la taaban karo oo dhashay sababtii horumarka sirdoonka macmalka ah (AI), farsamada habaynta luqadda dabiiciga ah (NLP), iyo baahida sii kordhaysa ee xalalka adeegga macaamiisha ee waxtarka leh.", "ar": ": يشهد سوق المساعدين الافتراضيين نمواً ملحوظاً بفضل التطورات في مجال الذكاء الاصطناعي (AI)، ومعالجة اللغات الطبيعية (NLP)، والطلب المتزايد على حلول خدمة العملاء الكفؤة.", "sw": ": Soko la Wasaidizi wa Kidijitali (Virtual Assistants) linakua kwa kasi kubwa kutokana na maendeleo ya akili bandia (AI), uchakataji wa lugha asilia (NLP), na kuongezeka kwa mahitaji ya suluhu bora za huduma kwa wateja.", "fr": ": Le marché des assistants virtuels connaît une croissance significative grâce aux avancées de l'intelligence artificielle (IA), du traitement automatique du langage naturel (NLP) et à la demande croissante de solutions de service client efficaces."},
    ": The global virtual assistant market size was estimated at USD 3.75 billion in 2024, but is set to expand to USD 23.57 billion by 2033, growing at a Compound Annual Growth Rate (CAGR) of 22.3% during the forecast period.": {"en": ": The global virtual assistant market size was estimated at USD 3.75 billion in 2024, but is set to expand to USD 23.57 billion by 2033, growing at a Compound Annual Growth Rate (CAGR) of 22.3% during the forecast period.", "am": ": የዓለም አቀፍ የምናባዊ ረዳቶች (VA) ገበያ መጠን እ.ኤ.አ. በ2024 3.75 ቢሊዮን የአሜሪካ ዶላር ይደርሳል ተብሎ ይገመታል፤ ሆኖም በጥናቱ ጊዜ በ22.3% የተዋሃደ ዓመታዊ የዕድገት መጠን (CAGR) እያደገ በ2033 ወደ 23.57 ቢሊዮን የአሜሪካ ዶላር እንደሚያድግ ይጠበቃል።", "om": ": Bal'inni gabaa gargaaraa virtualii addunyaa bara 2024tti Doolaara Ameerikaa biliyoona 3.75 akka ta'e tilmaamamee ture, garuu bara 2033tti gara Doolaara Ameerikaa biliyoona 23.57tti guddisuuf karoorfameera; kunis yeroo tilmaamaa kana keessatti guddina waggaa walitti qabatamaa (CAGR) dhibbeentaa 22.3 tiin guddachaa jira.", "ti": ": ዓለምለኻዊ ዓቐን ዕዳጋ ቨርቹዋል ረዳኢ ኣብ 2024 ኣስታት 3.75 ቢልዮን ዶላር ኣመሪካ ከም ዝነበረ ይግመት፡ ግና ከኣ ክሳብ 2033 ናብ 23.57 ቢልዮን ዶላር ኣመሪካ ከዕቢ ተደሊዩ ኣሎ፡ ኣብቲ ናይ ትንበያ እዋን ድማ ብ 22.3% ናይ ዓመት ዕብየት መጠን (CAGR) ክዓቢ እዩ።", "so": ": Baaxadda suuqa kaaliyaha virtual-ka ah ee adduunka waxaa lagu qiyaasay 3.75 bilyan oo dollar sannadkii 2024, laakiin waxaa loo qorsheeyay inay kor u kacdo oo gaarto 23.57 bilyan oo dollar sannadka 2033, iyada oo ku koreysa Heerka Kobaca Sannadlaha ah ee Isku-dhafnaan (CAGR) oo ah 22.3% muddada saadaasha.", "ar": ": قُدِّر حجم سوق المساعدين الافتراضيين العالمي بـ 3.75 مليار دولار أمريكي في عام 2024، ومن المتوقع أن يرتفع ليصل إلى 23.57 مليار دولار أمريكي بحلول عام 2033، مسجلاً معدل نمو سنوي مركب (CAGR) بنسبة 22.3% خلال الفترة المتوقعة.", "sw": ": Ukubwa wa soko la kimataifa la wasaidizi wa kidijitali ulikadiriwa kuwa Dola za Marekani bilioni 3.75 mnamo 2024, lakini umepangwa kufikia Dola za Marekani bilioni 23.57 ifikapo 2033, ukikua kwa Kiwango cha Ukuaji wa Kila Mwaka cha Pamoja (CAGR) cha 22.3% katika kipindi cha utabiri.", "fr": ": La taille du marché mondial des assistants virtuels était estimée à 3,75 milliards de dollars en 2024, mais devrait atteindre 23,57 milliards de dollars d'ici 2033, affichant un taux de croissance annuel composé (TCAC) de 22,3 % au cours de la période de prévision."},
    "As businesses become more digital, more global, and more comfortable with remote collaboration, the need for skilled support professionals continues to grow. At the same time, new technologies like Artificial Intelligence are changing": {"en": "As businesses become more digital, more global, and more comfortable with remote collaboration, the need for skilled support professionals continues to grow. At the same time, new technologies like Artificial Intelligence are changing", "am": "ንግዶች ይበльጡ ዲጂታል፣ ዓለም አቀፋዊ እና በርቀት በመተባበር ረገድ የተለመዱ ሲሆኑ፣ የሰለጠኑ የድጋፍ ባለሙያዎች ፍላጎት እያደገContinued ይሄዳል። በተመሳሳይ ጊዜ፣ እንደ አርቴፊሻል ኢንተሊጀንስ (AI) ያሉ አዳዲስ ቴክኖሎጂዎች እየለወጡ ይገኛሉ", "om": "Yeroo daldalli caalaatti dijitaalaawaa, addunyaalessaa, fi hojii fagoorratti walta'uuf mijataa deemu, fedhiin ogeeyyii deggersaa dandeettii qabanis itti fufaanii guddachaa deemu. Yeroo wal fakkaataatti, teeknoolojoonni haaraan akka Artificial Intelligence (AI)", "ti": "ንግስታት ዝያዳ ዲጂታላዊ፣ ዓለምለኻዊ ክኸዉኑን፣ ብርሕቀት ብምትሕብባር ክላመዱ ኣብ ዝኸዱሉ እዋን፣ ድሌት ናይ ክኢላታት ደገፍ ሰራሕተኛታት እንዳወሰኸ ይኸይድ ኣሎ። ኣብ ሓደ እዋን ድማ፣ ከም ሰብ ሰራሕ ኣእምሮ (AI) ዝኣመሰሉ ሓደሽቲ ቴክኖሎጂታት ይልወጡ ኣለዉ", "so": "Marka ay ganacsiyadu noqdaan kuwo sii kordhaya dhanka digital-ka, caalamiga ah, isla markaana la qabsanaya wada-shaqeynta fog (remote), baahida loo qabo xirfadlayaasha taageerada ee aqoonta u leh ayaa sii koreysa. Isla waqtigaas, tiknoolajiyada cusub sida Sirdoonka Macmalka ah (AI) ayaa bedelaya", "ar": "مع تحول الشركات نحو المزيد من الرقمنة والعالمية وتفضيلها للتعاون عن بُعد، تستمر الحاجة إلى محترفي دعم ذوي مهارات عالية في النمو. وفي الوقت نفسه، تُحدث التقنيات الجديدة مثل الذكاء الاصطناعي تغييرات في", "sw": "Kadiri biashara zinavyozidi kuwa za kidijitali, za kimataifa, na kuzoea kufanya kazi kwa mtandao wakiwa mbali, hitaji la wataalamu wenye ujuzi wa kutoa usaidizi linaendelea kukua. Wakati huo huo, teknolojia mpya kama vile Akili Bandia (AI) zinabadilisha", "fr": "À mesure que les entreprises deviennent plus numériques, plus mondiales et plus à l'aise avec la collaboration à distance, le besoin de professionnels du support qualifiés ne cesse de croître. En même temps, les nouvelles technologies telles que l'intelligence artificielle modifient"},
    "GitHub content embeds pull a file from a repository's default branch at render time and display it inline. Use the GitHub insert tool in the editor toolbar to fill in the fields and validate the paths — you do not need to construct this by hand.": {"en": "GitHub content embeds pull a file from a repository's default branch at render time and display it inline. Use the GitHub insert tool in the editor toolbar to fill in the fields and validate the paths — you do not need to construct this by hand.", "am": "የጊትሃብ (GitHub) ይዘት ማካተት (embeds) በሚሰጥበት ጊዜ ፋይል ከሬፖዚተሪው ነባሪ ቅርንጫፍ (default branch) ጎትቶ በማምጣት በቀጥታ ያሳያል። መስኮቹን ለመሙላት እና መንገዶቹን (paths) ለማረጋገጥ በአርታዒው (editor) ውስጥ የሚገኘውን የጊትሃብ ማስገቢያ መሳሪያ ይጠቀሙ — ይህንን በእጅዎ መስራት አያስፈልግዎትም።", "om": "Qabiyyeen GitHub bakkuma sanatti akka mul'atuuf yeroo xiyyeeffannoo kennamu damee (branch) kuusaa (repository) irraa faayilii tokko harkisee fida. Dirreewwan guutuufi karaa (path) mirkaneessuuf meeshaa galchuu GitHub meeshaalee gubbaa (toolbar) jiran fayyadami — kana harkaadhaan hojjechuun si hin barbaachisu.", "ti": "ናይ ጊትሃብ (GitHub) ትሕዝቶታት ፋይል ካብ ነባሪ ጨንፈር (default branch) ናይ መኽዘን (repository) ኣብ እዋን ምርኢት ስሒቡ ብቐጥታ የርእዮ። ንቦታታት ንምምላእን ንመገዲታት ንምርግጋጽን ነቲ ኣብ መስተኻኸሊ መሳርሒ ዘሎ ናይ ጊትሃብ መእተዊ መሳርሒ ተጠቐም — በዓልኻ ብኢድካ ክትሰርሖ ኣየድልየካን እዩ።", "ar": "تقوم ميزة تضمين محتوى GitHub بسحب ملف من الفرع الافتراضي للمستودع وقت العرض وعرضه بشكل مباشر ضمن المحتوى. استخدم أداة إدراج GitHub في شريط أدوات المحرر لملء الحقول والتحقق من صحة المسارات — لست بحاجة إلى بناء هذا يدويًا.", "sw": "Viungo vya maudhui vya GitHub huvuta faili kutoka tawi kuu la hifadhi (repository) wakati wa kuchakata na kuionyesha moja kwa moja ndani ya ukurasa. Tumia zana ya kuingiza ya GitHub kwenye mwambaa zana wa kihariri kujaza nafasi na kuthibitisha njia za faili — hulazimiki kuandika haya kwa mkono.", "fr": "Les intégrations de contenu GitHub récupèrent un fichier à partir de la branche par défaut d'un dépôt au moment du rendu et l'affichent en ligne. Utilisez l'outil d'insertion GitHub dans la barre d'outils de l'éditeur pour remplir les champs et valider les chemins — vous n'avez pas besoin de le construire manuellement."},
    "Artificial Intelligence is one of the most important forces shaping the future of the Virtual Assistant profession. Many modern workplaces already use AI tools to help draft, summarize, research, organize information, and automate repetitive tasks.": {"en": "Artificial Intelligence is one of the most important forces shaping the future of the Virtual Assistant profession. Many modern workplaces already use AI tools to help draft, summarize, research, organize information, and automate repetitive tasks.", "am": "አርቴፊሻል ኢንተሊጀንስ የቨርቹዋል ረዳት (Virtual Assistant) ሙያን የወደፊት ዕጣ ፈንታ ከሚቀርጹ ጠቃሚ ኃይሎች አንዱ ነው። ብዙ ዘመናዊ የሥራ ቦታዎች ረቂቆችን ለማዘጋጀት፣ ለማጠቃለል፣ ምርምር ለማድረግ፣ መረጃዎችን ለማደራጀት እና ተደጋጋሚ ሥራዎችን በራስ-ሰር ለማከናወን ቀደም ሲል የ AI መሣሪያዎችን ይጠቀማሉ።", "om": "Artificial Intelligence humnoota fuuldura hojii Virtual Assistant (VA) bocan keessaa tokko. Iddoo hojii ammayyaa hedduun amma iyyuu meeshaalee AI fayyadamuun qajeelcha qopheessuu, gabaabsuu, odeeffannoo qorachuu, gurmeessuu, fi hojiilee deddeebi'aman ofumaasaanii akka hojjetaman gargaarsaf itti fayyadamu.", "ti": "ኣርቲፊሻል ኢንተለጀንስ መጻኢ ሞያ ቨርቹዋል ረዳኢ ካብ ዝቕርጹ ኣገደስቲ ሓይሊታት ሓደ እዩ። ብዙሓት ዘመናዊ መሳርሒ ስራሕቲ፡ ሓሳባት ንምጽሓፍ፡ ንምጽማቕ፡ ምርምር ንምግባር፡ ሓበሬታ ንምውዳብን ድጋሚ ዝግበሩ ስርሓት ንምውራድን ድሮ መሳርሒታት AI ይጥቀሙ እዮም።", "so": "Sirdoonka Macmalka ah (AI) waa mid ka mid ah xoogagga ugu muhiimsan ee qaabeynaya mustaqbalka xirfadda Kaaliyaha Dijital ah (Virtual Assistant). Goobo badan oo shaqo oo casri ah ayaa horay u isticmaali jiray qalabka AI si ay uga caawiyaan qorista, soo koobidda, baaritaanka, habeynta macluumaadka, iyo otomaatigga shaqooyinka soo noqnoqda.", "ar": "يُعد الذكاء الاصطناعي أحد أهم القوى التي تشكل مستقبل مهنة المساعد الافتراضي. تستخدم العديد من بيئات العمل الحديثة بالفعل أدوات الذكاء الاصطناعي للمساعدة في صياغة النصوص، وتلخيصها، والبحث، وتنظيم المعلومات، وأتمتة المهام المتكررة.", "sw": "Akili Bandia ni moja ya nguvu muhimu zinazounda mustakabali wa taaluma ya Msaidizi wa Kijanja (Virtual Assistant). Maeneo mengi ya kazi ya sasa tayari yanatumia zana za AI kusaidia kuandaa rasimu, kufupisha, kufanya utafiti, kupanga habari, na kurahisisha kazi zinazojirudia.", "fr": "L'intelligence artificielle est l'une des forces les plus importantes qui façonnent l'avenir de la profession d'assistant virtuel (VA). De nombreux environnements de travail modernes utilisent déjà des outils d'IA pour rédiger, résumer, effectuer des recherches, organiser des informations et automatiser des tâches répétitives."},
    "will continue to be valuable. The future VA is likely to be more than an administrative helper. They may become a workflow partner, a client support specialist, an operations coordinator, a digital organizer, or an AI-enabled right hand for a business.": {"en": "will continue to be valuable. The future VA is likely to be more than an administrative helper. They may become a workflow partner, a client support specialist, an operations coordinator, a digital organizer, or an AI-enabled right hand for a business.", "am": "ዋጋቸውን አጠናክረው ይቀጥላሉ። የወደፊቱ ቨርቹዋል ረዳት (VA) ከአስተዳደራዊ ረዳትነት የዘለለ ሊሆን ይችላል። የስራ ፍሰት አጋር፣ የደንበኛ ድጋፍ ስፔሻሊስት፣ የስራ ክንውን አስተባባሪ (operations coordinator)፣ የዲጂታል አስተባባሪ፣ ወይም ለንግድ ስራ በAI የታገዘ ቀኝ እጅ ሊሆኑ ይችላሉ።", "om": "bu'aa qabeeyyii ta'anii itti fufu. VA fuulduraa gargaaraa bulchiinsaa qofa ta'uu dhiisuu mala. Isaan hiriyaa hojii, ogeessa deeggarsa maamilaa, qindeessaa hojii, gurmeessaa dijitaalaa, ykn harka mirgaa teeknolojii AI qabu ta'uu danda'u.", "ti": "ዋጋ ዘለዎም ኮይኖም ክቕጽሉ እዮም። መጻኢ VA ካብ ናይ ምምሕዳር ረዳኢ ንላዕሊ ክኸውን ይኽእል እዩ። መሻርኽቲ ስርሓት፡ ናይ ዓሚል ደገፍ ስፔሻሊስት፡ ኣወሃሃዲ ስርሓት፡ ዲጂታላዊ ኣወሃሃዲ፡ ወይ ንንግዲ ዝኸውን ብ AI ዝተሰነየ ቅኑዕ ኢድ ክኾኑ ይኽእሉ።", "so": "uu sii ahaan doono mid qiimo leh. VA-ga mustaqbalka wuxuu u badan yahay inuu ka badnaado oo keliya caawiye maamul. Waxaa laga yaabaa inay noqdaan wehel shaqo, khabiir taageero macmiil, iskuduwaha howlaha, qabanqaabiye dijitaal ah, ama gacanta midig ee ganacsiga ee AI ku shaqeysa.", "ar": "عنصراً ذا قيمة مستمرة. من المرجح أن يتحول المساعد الافتراضي المستقبلي ليصبح أكثر من مجرد مساعد إداري؛ فقد يصبح شريكاً في سير العمل، أو أخصائي دعم للعملاء، أو منسق عمليات، أو منظماً رقمياً، أو اليد اليمنى المدعومة بالذكاء الاصطناعي لأي نشاط تجاري.", "sw": "wataendelea kuwa na thamani. VA wa siku zijazo anaweza kuwa zaidi ya msaidizi wa kiutawala tu. Wanaweza kuwa mshirika wa mtiririko wa kazi, mtaalamu wa usaidizi kwa wateja, Mratibu wa shughuli za uendeshaji, mratibu wa kidijitali, au mkono wa kulia unaowezeshwa na AI kwa biashara.", "fr": "continueront d'être précieux. Le futur VA sera probablement bien plus qu'un simple assistant administratif. Il pourra devenir un partenaire de flux de travail, un spécialiste du support client, un coordinateur des opérations, un organisateur numérique ou le bras droit augmenté par l'IA d'une entreprise."},
    ": Whether in digital marketing, project management, or tech support, the demand for niche expertise is rising. However, soft skills matter more than ever. So, although technical skills are essential, emotional intelligence is becoming equally important.": {"en": ": Whether in digital marketing, project management, or tech support, the demand for niche expertise is rising. However, soft skills matter more than ever. So, although technical skills are essential, emotional intelligence is becoming equally important.", "am": ": በዲጂታል ማርኬቲንግ፣ በፕሮጀክት ማኔጅመንት፣ ወይም በቴክኒክ ድጋፍ ይሁን፣ የልዩ ባለሙያዎች ፍላጎት እየጨመረ ነው። ይሁን እንጂ ለስላሳ ክህሎቶች (soft skills) ከሁע ጊዜ በላይ አስፈላጊ ናቸው። ስለዚህ ቴክኒካዊ ክህሎቶች አስፈላጊ ቢሆኑም፣ ስሜታዊ ብልህነትም እንዲሁ እጅግ አስፈላጊ እየሆነ መጥቷል።", "om": ": Gabaabaadhumatti, gabaasuu dijitaalaa, bulchiinsa pirojektii, ykn deggersa teekinolojii keessatti ta'us, dandeettiin addaa barbaadamu dabalaa jira. Haa ta'u malee, dandeettiin hariiroo hawaasummaa (soft skills) kanaan duraa olitti barbaachisaa dha. Kanaafuu, dandeettiin teekinolojii murteessaa ta'us, hubannoon miirichaa (emotional intelligence) sadarkaa walqixaatiin barbaachisaa dhufaa jira.", "ti": ": ኣብ ዲጂታላዊ ማርኬቲንግ ይኹን፡ ምሕደራ ፕሮጀክት፡ ወይ ድጋፍ ቴክኖሎጂ፡ ጠለብ ፍሉይ ክእሎት ይዓቢ ኣሎ። እንተኾነ ግና፡ ልስሉሳት ክእለታት ካብ ከመይ ንላዕሊ ኣገደስቲ እዮም። ስለዚ፡ ቴክኒካዊ ክእለታት ኣገደስቲ እንተኾኑ እውን፡ ስምዒታዊ ለባምነት (Emotional Intelligence) ተመሳሳሊ ክብደት ይረክብ ኣሎ።", "so": ": Haddii ay noqoto dhanka suuqgeynta dhijitaalka ah, maamulka mashruuca, ama taageerada t teknolojiyadda, baahida loo qabo khibrad gaar ah way koreysaa. Si kastaba ha ahaatee, xirfadaha jilicsan (soft skills) ayaa ka muhiimsan sidii abid. Sidaa darteed, inkasta oo xirfadaha farsamada ay lama huraan yihiin, sirdoonka dareenka (emotional intelligence) ayaa iyaguna noqonaya kuwo muhiimad siman leh.", "ar": ": سواء في التسويق الرقمي أو إدارة المشاريع أو الدعم التقني، يتزايد الطلب على الخبرات المتخصصة. ومع ذلك، أصبحت المهارات الشخصية (Soft Skills) مهمة أكثر من أي وقت مضى. لذا، ورغم ضرورة المهارات التقنية، فإن الذكاء العاطفي يكتسب أهمية مساوية لها.", "sw": ": Iwe katika masoko ya kidijitali, usimamizi wa miradi, au usaidizi wa kiteknolojia, mahitaji ya utaalamu maalum yanazidi kuongezeka. Hata hivyo, stadi za kijamii (soft skills) ni muhimu kuliko wakati mwingine wowote. Kwa hiyo, ingawa stadi za kiufundi ni za lazima, uwezo wa kutambua na kudhibiti hisia (emotional intelligence) unakuwa wa maana sawa na huo.", "fr": ": Qu'il s'agisse de marketing digital, de gestion de projet ou de support technique, la demande d'expertises spécifiques est en hausse. Cependant, les compétences relationnelles (soft skills) comptent plus que jamais. Ainsi, bien que les compétences techniques soient essentielles, l'intelligence émotionnelle devient tout aussi importante."},
    "We are seeking a highly organized, autonomous Virtual Assistant to deliver executive-level operational support. In this role, you will coordinate remote administrative workflows, handle high-priority executive communications, and ensure day-to-day organizational momentum across distributed global teams.": {"en": "We are seeking a highly organized, autonomous Virtual Assistant to deliver executive-level operational support. In this role, you will coordinate remote administrative workflows, handle high-priority executive communications, and ensure day-to-day organizational momentum across distributed global teams.", "am": "ከፍተኛ ድርጅታዊ ብቃት ያለው እና በራሱ የሚንቀሳቀስ የኤክስክዩቲቭ ደረጃ የአሰራር ድጋፍ የሚሰጥ ምናባዊ ረዳት (Virtual Assistant) እንፈልጋለን። በዚህ ኃላፊነት, የርቀት አስተዳደራዊ የስራ ሂደቶችን ያስተባብራሉ, ከፍተኛ ትኩረት የሚሹ የስራ አስፈፃሚ ግንኙነቶችን ይቆጣጠራሉ, እንዲሁም በተለያዩ የዓለም ክፍሎች በተበተኑ ዓለም አቀፍ ቡድኖች መካከል የዕለት ተዕለት ድርጅታዊ እንቅስቃሴዎች ያለማቋረጥ እንዲቀጥሉ ያደርጋሉ።", "om": "Gargaaraa Virtual ta'e kan sirnaan qindaa'ee fi of danda'ee hojjetu, deeggarsa hojii olaanaa kennuu danda'u barbaadaa jirra. Gahee kana keessatti, adeemsa hojii bulchiinsa fagoo walitti qindeessita, quunnamtii hooggantootaa barbaachisoo ta'an ni hordofita, akkasumas gareewwan addunyaa irratti bittinnaa'an gidduutti adeemsa hojii guyyaa-guyyaa ni mirkaneessita.", "so": "Waxaan raadineynaa Kaaliyaha Dijitaalka ah (Virtual Assistant) ee aad u nidaamsan, madax-bannaan oo bixin kara taageero hawleed heer sare ah. Doorkan, waxaad iskudubaridi doontaa hab-raacyada maamul ee fog, waxaad maamuli doontaa is-gaarsiinta madaxda ee muhiimadda sare leh, waxaadna xaqiijin doontaa socodka hawlaha maalinlaha ah ee kooxaha caalamiga ah ee kala daadsan.", "ar": "نبحث عن مساعد افتراضي يتمتع بدرجة عالية من التنظيم والاعتمادية لتقديم دعم تشغيلي بمستوى تنفيذي. في هذا الدور، ستوم بالتنسيق بين سير العمل الإداري عن بعد، وإدارة الاتصالات التنفيذية عالية الأولوية، وضمان استمرارية العمل التنظيمي اليومي عبر فرق عمل عالمية موزعة.", "sw": "Tunatafuta Msaidizi Mtandaoni aliyeandaliwa vyema na anayejitegemea ili kutoa usaidizi wa kiutendaji wa ngazi ya juu. Katika nafasi hii, utaratibu mtiririko wa kazi za kiutawala za mbali, utashughulikia mawasiliano ya viongozi yenye kipaumbele cha juu, na kuhakikisha ufanisi wa kila siku wa shirika katika timu za kimataifa zilizotawanywa.", "fr": "Nous recherchons un(e) Assistant(e) Virtuel(le) hautement organisé(e) et autonome pour fournir un support opérationnel de niveau exécutif. Dans ce rôle, vous coordonnerez les flux de travail administratifs à distance, gérerez les communications prioritaires de la direction et garantirez l'efficacité organisationnelle au quotidien au sein d'équipes mondiales distribuées."},
    "\"Welcome back engineers. In this deep dive, we explore why separating business logic from ingestion endpoints is critical when deploying AI models in emerging African cloud markets. When bandwidth is constrained and connection spikes happen, your asynchronous message broker absorbs incoming payloads without starving your machine learning workers.\"": {"en": "\"Welcome back engineers. In this deep dive, we explore why separating business logic from ingestion endpoints is critical when deploying AI models in emerging African cloud markets. When bandwidth is constrained and connection spikes happen, your asynchronous message broker absorbs incoming payloads without starving your machine learning workers.\"", "am": "\"እንኳን ደህና መጣችሁ መሐንዲሶች። በዚህ ጥልቅ ዳሰሳ፣ በአዳዲስ የአፍሪካ የክላውድ ገበያዎች ውስጥ አርቴፊሻል ኢንተለጀንስ (AI) ሞዴሎችን ስናሰማራ የንግድሎጂክ (business logic) ከውሂብ መቀበያ ነጥቦች (ingestion endpoints) መለየቱ ለምን ወሳኝ እንደሆነ እንመረምራለን። የኢንተርኔት ፈጣንነት (bandwidth) ውስን ሆኖ የግንኙነት መጨናነቅ ሲያጋጥም፣ የአሲንክሮን መልእክት ደላላ (asynchronous message broker) የማሽን లెርኒንግ ሰራተኞቻችሁን ሳያጨናንቅ የሚመጡትን መረጃዎች ይቀበላል።\"", "om": "\"Injiniaroota, baga deebitan. Qorannoo gadi fagoo kana keessatti, yeroo moodeelota AI gabaawwan duumessaa Afrikaa keessatti mul'achaa jiran irratti bobbaastani, tooftaa daldalaa (business logic) cinaacha ingestion endpoints irraa addaan baasuun maaliif akka barbaachisaa ta'e ilaalla. Yeroo bandwiitichi (bandwidth) daangeffamee fi walitti hidhiinsi saffisaan dabalu, message broker asynchronous ta'e kun hojjettoota machine learning keessan osoo hin beela'in payload seensaa fudhata.\"", "ti": "\"እንቋዕ ብድሓን መጻእኩም መሃንድሳት። ኣብዚ ዕሙቕ ዝበለ መጽናዕቲ፡ ኣብ ዝማዕበላ ዕዳጋታት ክላውድ ኣፍሪቃ ሞዴላት AI ክትተኽሉ እንለዎ ናይ ንግድ ሎጂክ ካብ ናይ ምእካብ መወዳእታታት (ingestion endpoints) ምፍላይ ስንኩድ ዝኾነሉ ምኽንያት ንምርምር። ባንድዊድዝ (bandwidth) ውሱን ምስ ዝኸውንን መራኸቢታት ብሃንደበት ክውስኹን እንከለዉ፡ ዘይምዕሩይ መልእኽቲ መለወጢኻ (asynchronous message broker) ንናይ ማሽን ለርኒንግ ሰራሕተኛታትካ ከይጸምኦ ነቲ ዝኣቱ ጽዕነት ይቕበሎ።\"", "so": "\"Ku soo dhowaada injineerada. Darsigan qoto dheer, waxaan ku baariseynaa sababta ay muhiim ugu tahay in laga saaro caqli-galka ganacsiga (business logic) birtimaadka soo dejinta (ingestion endpoints) marka la geeynayo moodooyinka AI suuqyada daruuraha Afrika ee soo koraya. Marka ballaadhka xog-gudbinta (bandwidth) uu xaddidan yahay oo xiriirada ay kor u kacaan, dhexdhexaadiyahaaga fariimaha ee aan isku-sidka ahayn (asynchronous message broker) wuxuu qaadayaa xogta soo gashaysa iyada oo aan la gaajo-telin shaqaalahaaga barashada mashiinka (machine learning workers).\"", "ar": "\"أهلاً بكم مجدداً أيها المهندسون. في هذا الغوص العميق، نستكشف سبب أهمية فصل منطق الأعمال عن نقاط نهاية استيعاب البيانات عند نشر نماذج الذكاء الاصطناعي في الأسواق السحابية الإفريقية الناشئة. عندما يكون نطاق التردد (bandwidth) محدوداً وتحدث ذروة في الاتصالات، يقوم وسيط الرسائل غير المتزامن (asynchronous message broker) باختصاص الحمولات الواردة دون استنزاف عمال التعلم الآلي لديك.\"", "sw": "\"Karibuni tena wahandisi. Katika uchunguzi huu wa kina, tunachunguza kwa nini kutenganisha mantiki ya biashara (business logic) na sehemu za mwisho za upokeaji data (ingestion endpoints) ni muhimu wakati wa kusambaza mifano ya AI katika masoko ya wingu yanayoibuka barani Afrika. Wakati kipimo data (bandwidth) kikiwa kimebanwa na miunganisho ya ghafla kutokea, dalali wako wa ujumbe wa asynkronasi (asynchronous message broker) hupokea data zinazoingia bila kuwanyima rasilimali wafanyakazi wako wa kujifunza kwa mashine (machine learning workers).\"", "fr": "\"Bon retour, ingénieurs. Dans cette analyse approfondie, nous explorons pourquoi il est crucial de séparer la logique métier des points de terminaison d'ingestion lors du déploiement de modèles d'IA sur les marchés cloud africains émergents. Lorsque la bande passante est limitée et que des pics de connexion se produisent, votre courtier de messages asynchrone absorbe les charges utiles entrantes sans affamer vos workers de machine learning.\""}
  };

  // Case-insensitive & normalized lookup index for resilient DOM translation matching
  const LOWER_DOM_TRANSLATIONS = {};
  for (const [origKey, map] of Object.entries(DOM_TRANSLATIONS)) {
    const lk = origKey.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!LOWER_DOM_TRANSLATIONS[lk]) LOWER_DOM_TRANSLATIONS[lk] = map;
  }


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
      if (k && v && typeof v === 'string' && v.trim() && v.trim().toLowerCase() !== k.trim().toLowerCase()) {
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

  function substituteElementText(el, translatedText) {
    if (!el || !translatedText || translatedText === el.textContent) return;
    if (!el.dataset.sa11yOrigText) {
      el.dataset.sa11yOrigText = (el.innerText || el.textContent || '').trim();
    }
    const hasComplexChildren = el.querySelector('button, input, select, textarea, canvas, svg, iframe');
    if (!hasComplexChildren) {
      el.textContent = translatedText;
    } else {
      const firstTextNode = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim());
      if (firstTextNode) {
        firstTextNode.nodeValue = translatedText;
      }
    }
  }

  function isPureEnglishText(text, lang) {
    if (!text || typeof text !== 'string') return false;
    const clean = text.trim();
    if (!/[a-zA-Z]/.test(clean)) return false;
    // For Ethiopic script languages (am, ti), if no Ethiopic glyphs, it is pure English
    if ((lang === 'am' || lang === 'ti') && !/[\u1200-\u137F]/.test(clean)) return true;
    // For Arabic script languages, if no Arabic glyphs, it is pure English
    if (lang === 'ar' && !/[\u0600-\u06FF]/.test(clean)) return true;
    // Check for common uppercase acronyms, tech terms, or scientific names
    if (/^([A-Z]{2,6}|(?:[A-Z]\.){2,}|COVID-19|REST API|AWS|HTML|CSS|SQL|API|AI|UI\/UX|Machine Learning|Software Engineering|Data Science)$/i.test(clean)) return true;
    return false;
  }

  function getEffectiveApiUrl() {
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
    if (base.includes('localhost') && typeof window !== 'undefined' && window.location) {
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        base = window.location.origin;
      }
    }
    if (!base && typeof window !== 'undefined' && window.location) {
      base = (window.location.port === '8080') ? 'http://localhost:8000' : window.location.origin;
    }
    return (base || window.location.origin || 'http://localhost:8000').replace(/\/$/, '').replace(/\/api$/, '');
  }

  function getTranslateApiUrl() {
    return getEffectiveApiUrl() + '/translate';
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
            // Mark only genuinely translated strings in attemptedBatchStrings
            for (const [origStr, transStr] of Object.entries(data.translations)) {
              if (transStr && typeof transStr === 'string' && transStr.trim() && transStr.trim().toLowerCase() !== origStr.trim().toLowerCase()) {
                attemptedBatchStrings[lang].add(origStr);
              }
            }
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
      // Drain pending queue gracefully without starving browser UI thread
      if (pendingBatchStrings[lang] && pendingBatchStrings[lang].size > 0 && currentLang === lang) {
        setTimeout(() => {
          dispatchBatchTranslation(lang);
        }, 80);
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

  function syncSkipLink(lang) {
    if (typeof document === 'undefined') return;
    const skipLabels = {
      en: 'Skip to main content',
      am: 'ወደ ዋናው ይዘት ዝለል',
      om: 'Gara qabiyyee ijoo darbi',
      ti: 'ናብቲ ቀንዲ ትሕዝቶ ሕለፍ',
      so: 'U gudub nuxurka guud',
      ar: 'الانتقال إلى المحتوى الرئيسي',
      sw: 'Ruka hadi maudhui kuu',
      fr: 'Passer au contenu principal'
    };
    const label = skipLabels[lang] || skipLabels.en;

    let skipLink = document.querySelector('a[href="#content"], a.visually-hidden-focusable, a.sa11y-skip-link');
    if (skipLink) {
      skipLink.textContent = label;
      skipLink.setAttribute('aria-label', label);
    } else {
      const mainEl = document.querySelector('main, #content, [role="main"]');
      if (mainEl && !document.querySelector('.sa11y-skip-link') && document.body) {
        skipLink = document.createElement('a');
        skipLink.href = mainEl.id ? `#${mainEl.id}` : '#content';
        if (!mainEl.id) mainEl.id = 'content';
        skipLink.className = 'sa11y-skip-link visually-hidden-focusable';
        skipLink.style.cssText = 'position:absolute;top:0;left:0;padding:12px 18px;background:#0056b3;color:#fff;z-index:99999;font-weight:700;text-decoration:none;border-radius:0 0 6px 0;';
        skipLink.textContent = label;
        skipLink.setAttribute('aria-label', label);
        document.body.insertBefore(skipLink, document.body.firstChild);
      }
    }
  }

  function ensureSemanticLandmarks() {
    if (typeof document === 'undefined') return;

    // 1. Ensure primary content has role="main" if no <main> exists
    if (!document.querySelector('main, [role="main"]')) {
      const primaryContainer = document.querySelector(
        '#main-content, #main, #content, .main-content, .content, article, .formatted-content, .post-content, .entry-content, .page-content, section.main, [role="region"].main'
      ) || document.querySelector('section, .container');
      if (primaryContainer) {
        primaryContainer.setAttribute('role', 'main');
      }
    }

    // 2. Ensure header has role="banner" if no <header> with banner role exists
    if (!document.querySelector('header, [role="banner"]')) {
      const headerEl = document.querySelector('.header, #header, .navbar, .top-bar, .site-header, header');
      if (headerEl) {
        headerEl.setAttribute('role', 'banner');
      }
    }

    // 3. Ensure navigation landmarks have distinguishing aria-labels for screen reader browse mode (D key)
    const navCandidates = document.querySelectorAll('nav, [role="navigation"], .sidebar.navigation, #sidebar, .nav-menu, .navigation');
    const navLabels = {
      en: { sidebar: 'Sidebar Navigation', menu: 'Navigation Menu', main: 'Main Navigation' },
      am: { sidebar: 'የጎን አሰሳ ማውጫ', menu: 'የአሰሳ ዝርዝር', main: 'ዋና አሰሳ' },
      om: { sidebar: 'Kutaa cinaa', menu: 'Baafata', main: 'Qajeelcha ijoo' },
      ti: { sidebar: 'ናይ ጎኒ መጎልበቲ', menu: 'ዝርዝር መጎልበቲ', main: 'ቀንዲ መጎልበቲ' },
      so: { sidebar: 'Hagaha dhinaca', menu: 'Liiska hagaha', main: 'Hagaha guud' },
      ar: { sidebar: 'التنقل الجانبي', menu: 'قائمة التنقل', main: 'التنقل الرئيسي' },
      sw: { sidebar: 'Urambazaji wa pembeni', menu: 'Menyu ya urambazaji', main: 'Urambazaji mkuu' },
      fr: { sidebar: 'Navigation latérale', menu: 'Menu de navigation', main: 'Navigation principale' }
    };
    const t = navLabels[currentLang] || navLabels.en;

    navCandidates.forEach((nav, idx) => {
      if (!nav.getAttribute('role')) {
        nav.setAttribute('role', 'navigation');
      }
      if (!nav.getAttribute('aria-label') && !nav.getAttribute('aria-labelledby')) {
        // Derive label dynamically from inner heading if present
        const innerHeading = nav.querySelector('h1, h2, h3, h4, h5, h6, .nav-title, .menu-title');
        if (innerHeading && innerHeading.textContent.trim()) {
          nav.setAttribute('aria-label', innerHeading.textContent.trim());
          return;
        }
        const id = (nav.id || '').toLowerCase();
        const cls = (nav.className || '').toLowerCase();
        if (id.includes('sidebar') || cls.includes('sidebar') || nav.closest('aside')) {
          nav.setAttribute('aria-label', t.sidebar || 'Sidebar Navigation');
        } else if (id.includes('menu') || cls.includes('menu') || id.includes('curriculum')) {
          nav.setAttribute('aria-label', t.menu || 'Navigation Menu');
        } else {
          nav.setAttribute('aria-label', `${t.main || 'Navigation'} ${idx > 0 ? idx + 1 : ''}`.trim());
        }
      }
    });
  }

  function translateHostPage(lang) {
    if (!lang || !ALL_LANGUAGES.includes(lang)) lang = 'en';

    // 1. Update document element language and direction (RTL for Arabic)
    if (document.documentElement) {
      document.documentElement.lang = lang;
      document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    }

    syncSkipLink(lang);
    ensureSemanticLandmarks();

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

    if (lang === 'en') {
      document.querySelectorAll('[data-sa11y-orig-text]').forEach(el => {
        if (el.dataset.sa11yOrigText) {
          el.textContent = el.dataset.sa11yOrigText;
          delete el.dataset.sa11yOrigText;
        }
      });
    }

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

      // Exact match in static dictionary (exact, normalized, lowercase, unpunctuated)
      if (DOM_TRANSLATIONS[trimmed] && DOM_TRANSLATIONS[trimmed][lang]) {
        node.nodeValue = leadingWs + DOM_TRANSLATIONS[trimmed][lang] + trailingWs;
        continue;
      }
      if (DOM_TRANSLATIONS[normTrimmed] && DOM_TRANSLATIONS[normTrimmed][lang]) {
        node.nodeValue = leadingWs + DOM_TRANSLATIONS[normTrimmed][lang] + trailingWs;
        continue;
      }
      // Punctuation-tolerant match (e.g. trailing colon, period, question mark)
      const unpunct = normTrimmed.replace(/[:.,?!;]+$/, '').trim();
      const trailingPunct = normTrimmed.slice(unpunct.length);
      if (unpunct && unpunct !== normTrimmed && DOM_TRANSLATIONS[unpunct] && DOM_TRANSLATIONS[unpunct][lang]) {
        node.nodeValue = leadingWs + DOM_TRANSLATIONS[unpunct][lang] + trailingPunct + trailingWs;
        continue;
      }
      // Case-insensitive match via LOWER_DOM_TRANSLATIONS
      const lowerNorm = normTrimmed.toLowerCase();
      if (typeof LOWER_DOM_TRANSLATIONS !== 'undefined' && LOWER_DOM_TRANSLATIONS[lowerNorm] && LOWER_DOM_TRANSLATIONS[lowerNorm][lang]) {
        node.nodeValue = leadingWs + LOWER_DOM_TRANSLATIONS[lowerNorm][lang] + trailingWs;
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
      shortcutEsc: 'Silence audio, cancel scanning or close open dialogs',
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
      shortcutEsc: 'ድምፅን ወዲያውኑ ማቆም፣ ስካነርን ማቆም ወይም ንቁ መስኮትን መዝጋት',
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
  function captureImageBase64(targetEl) {
    if (!targetEl) return null;
    try {
      let imgEl = targetEl;
      if (targetEl.tagName !== 'IMG') {
        imgEl = targetEl.querySelector('img');
      }
      if (imgEl && imgEl.tagName === 'IMG' && imgEl.complete && imgEl.naturalWidth > 0) {
        const maxDim = 800;
        let w = imgEl.naturalWidth;
        let h = imgEl.naturalHeight;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round(h * (maxDim / w));
            w = maxDim;
          } else {
            w = Math.round(w * (maxDim / h));
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w || 300;
        canvas.height = h || 300;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.85);
      }
    } catch (_) {}
    return null;
  }

  let activeA11yAudio = null;
  let activeA11yAbort = null;
  const a11yAudioCache = new Map();

  function normalizeSpeechPunctuation(text, lang) {
    if (!text) return '';
    if (lang === 'am' || lang === 'ti') {
      return text
        .replace(/።\s*/g, '. ')
        .replace(/፣\s*/g, ', ')
        .replace(/፤\s*/g, '; ')
        .replace(/፧\s*/g, '? ')
        .replace(/፡(?=\s+[A-Za-z\u1200-\u137F]|$)/g, ': ')
        .replace(/\.+/g, '.')
        .replace(/,+/g, ',')
        .replace(/;+/g, ';')
        .replace(/\s+/g, ' ')
        .trim();
    }
    return text;
  }

  async function speakVisualDescription(text) {
    if (!text) return;
    const isEn = (currentLang === 'en') || isPureEnglishText(text, currentLang);
    const speechLang = isEn ? 'en' : currentLang;
    const cleanText = normalizeSpeechPunctuation(text, speechLang);
    const bcp47 = isEn ? 'en-US' : (BCP47_A11Y[speechLang] || 'en-US');

    // 1. Try native browser voice if available for this language
    if ('speechSynthesis' in window && window.speechSynthesis.getVoices) {
      try {
        const voices = window.speechSynthesis.getVoices();
        const prefix = speechLang.toLowerCase();
        const hasVoice = voices.some(v => v.lang && v.lang.toLowerCase().startsWith(prefix));
        if (hasVoice) {
          if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
          return new Promise(resolve => {
            const utt = new SpeechSynthesisUtterance(cleanText);
            utt.lang = bcp47;
            utt.rate = 1.0;
            utt.onend = () => resolve();
            utt.onerror = () => resolve();
            window.speechSynthesis.speak(utt);
          });
        }
      } catch (_) {}
    }

    // 2. Stream neural audio fallback via /speech/synthesize (Edge-TTS with bilingual switching)
    if (typeof fetch !== 'function') return;
    try {
      if (activeA11yAudio) {
        activeA11yAudio.pause();
        activeA11yAudio = null;
      }
      if (activeA11yAbort) {
        activeA11yAbort.abort();
      }
      activeA11yAbort = new AbortController();

      const cacheKey = speechLang + ':' + cleanText;
      let audioUrl = a11yAudioCache.get(cacheKey);
      if (!audioUrl) {
        const apiUrl = getEffectiveApiUrl();
        const resp = await fetch(apiUrl + '/speech/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanText, language: speechLang }),
          signal: activeA11yAbort.signal
        });
        if (resp.ok) {
          const blob = await resp.blob();
          audioUrl = URL.createObjectURL(blob);
          a11yAudioCache.set(cacheKey, audioUrl);
        }
      }
      if (audioUrl) {
        return new Promise(resolve => {
          activeA11yAudio = new Audio(audioUrl);
          let finished = false;
          const finish = () => {
            if (!finished) {
              finished = true;
              if (activeA11yAudio) {
                activeA11yAudio = null;
              }
              resolve();
            }
          };
          activeA11yAudio.onended = finish;
          activeA11yAudio.onerror = finish;
          activeA11yAudio.onpause = () => {
            finish();
          };
          const p = activeA11yAudio.play();
          if (p && typeof p.catch === 'function') {
            p.catch(finish);
          }
          // Safety timeout in case audio play event does not trigger in mock test environments
          setTimeout(finish, 8000);
        });
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.debug('[Savanna A11y] Speech notice:', err);
      }
    }
  }

  function extractElementVisualDetails(targetEl) {
    if (!targetEl) return { src: '', fullUrl: '', alt: '', filename: '', imageData: null };
    let src = targetEl.getAttribute('src') || '';
    let fullUrl = targetEl.src || targetEl.currentSrc || '';
    if (!src) {
      const childImg = targetEl.querySelector('img');
      if (childImg) {
        src = childImg.getAttribute('src') || '';
        fullUrl = childImg.src || childImg.currentSrc || '';
      }
    }
    if (!src) {
      // Check style background-image or child element with background-image
      const bg = targetEl.style.backgroundImage || 
        (window.getComputedStyle ? window.getComputedStyle(targetEl).backgroundImage : '') || '';
      const match = bg.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (match) {
        src = match[1];
        fullUrl = src;
      } else {
        const childBg = targetEl.querySelector('[style*="background-image"], .logo');
        if (childBg) {
          const cBg = childBg.style.backgroundImage || (window.getComputedStyle ? window.getComputedStyle(childBg).backgroundImage : '') || '';
          const cMatch = cBg.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (cMatch) {
            src = cMatch[1];
            fullUrl = src;
          }
        }
      }
    }
    const alt = targetEl.getAttribute('alt') || targetEl.getAttribute('aria-label') || targetEl.title || '';
    const filename = src.split('/').pop().split('?')[0] || '';
    const imageData = captureImageBase64(targetEl);
    return { src, fullUrl: fullUrl || src, alt, filename, imageData };
  }

  function describeImage(img) {
    if (!img) return;
    const parent = img.parentElement;
    const existing = parent ? parent.querySelector('.sa11y-image-desc-card') : null;
    if (existing) {
      existing.remove();
      return;
    }

    const { src, fullUrl, alt, filename, imageData } = extractElementVisualDetails(img);
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
        .map(el => `<span class="sa11y-image-desc-tag">📊 ${escapeHtml(el)}</span>`)
        .join('');

      card.innerHTML = `
        <div class="sa11y-image-desc-header">
          <span>🤖 ${i18n[lang].imgDescTitle}</span>
          <span class="badge bg-success" style="font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px; background: #166534; color: #ffffff;">${escapeHtml(data.ai_provider || 'savanna-ai-vision')}</span>
          <button type="button" class="btn btn-sm btn-outline-secondary sa11y-desc-close-btn" aria-label="${i18n[lang].imgDescClose}">✕</button>
        </div>
        <div class="sa11y-ai-breakdown-body">
          <p style="margin: 0 0 0.5rem 0; font-size: 0.95rem; color: #14532d;">
            <strong>🎯 ${lang === 'am' ? 'የምስሉ ዝርዝር መግለጫ' : 'Visual Description'}:</strong> ${escapeHtml(breakdown.primary_subject)}
          </p>
          <div class="sa11y-image-desc-tags" style="margin-bottom: 0.6rem;">${tagsHtml}</div>
          ${breakdown.intent_and_purpose ? `
            <div style="margin: 0 0 0.6rem 0; font-size: 0.92rem; color: #065f46; background: #ecfdf5; border-left: 4px solid #10b981; padding: 8px 12px; border-radius: 4px; line-height: 1.5;">
              <strong>💡 ${lang === 'am' ? 'የምስሉ ዓላማና ትርጉም' : 'Visual Intent & Purpose'}:</strong> ${escapeHtml(breakdown.intent_and_purpose)}
            </div>
          ` : ''}
          ${breakdown.pedagogical_context && breakdown.pedagogical_context !== breakdown.intent_and_purpose ? `
            <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #166534; line-height: 1.5;">
              <strong>🎓 ${lang === 'am' ? 'ትምህርታዊ ፋይዳ' : 'Pedagogical Context'}:</strong> ${escapeHtml(breakdown.pedagogical_context)}
            </p>
          ` : ''}
          ${breakdown.composition_and_palette ? `
            <p style="margin: 0 0 0.75rem 0; font-size: 0.85rem; color: #4b5563; line-height: 1.4;">
              <strong>🎨 ${lang === 'am' ? 'የቀለምና ዲዛይን ቅንብር' : 'Composition & Palette'}:</strong> ${escapeHtml(breakdown.composition_and_palette)}
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
      const descText = alt || filename
        ? (lang === 'am' ? `የትምህርት ሥዕላዊ መግለጫ፡ ${alt || filename}` : `Educational visual: ${alt || filename}`)
        : (lang === 'am' ? 'የትምህርት ይዘት ሥዕላዊ መግለጫ' : 'Educational lesson graphic');
      const fallbackData = {
        description: descText,
        ai_provider: 'savanna-a11y-native',
        breakdown: {
          primary_subject: descText,
          visual_elements: [alt || filename || 'Curriculum Graphic'],
          intent_and_purpose: lang === 'am' ? 'የትምህርት ፅንሰ-ሃሳቡን በምስል ያጠናክራል።' : 'Reinforces core lesson competencies.',
          pedagogical_context: lang === 'am' ? 'የትምህርት ፅንሰ-ሃሳቡን በምስል ያጠናክራል።' : 'Reinforces core lesson competencies.',
          composition_and_palette: 'Standard accessible graphic.'
        }
      };
      renderCardContent(fallbackData);
    }

    // Call live AI Vision API endpoint
    if (typeof fetch === 'function') {
      const apiUrl = getEffectiveApiUrl();
      fetch(apiUrl + '/describe-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          url: fullUrl || src,
          image_data: imageData,
          language: lang
        })
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
    const arrivalSpeechPromise = speakVisualDescription(initialCue);

    const { src, fullUrl, alt, filename, imageData } = extractElementVisualDetails(img);

    async function onDescriptionReady(description) {
      img.dataset.aiDescription = description;
      const initialLabel = img.getAttribute('alt') || img.getAttribute('aria-label') || 'Graphic';
      img.setAttribute('aria-label', `${initialLabel}. AI Description: ${description}`);
      img.setAttribute('aria-description', description);

      // Wait for the arrival notification ("This image is being processed by AI...") to finish naturally without cutting off
      try {
        await arrivalSpeechPromise;
      } catch (_) {}

      // Only speak if the blind user is still focused on this image
      const isStillFocused = (document.activeElement === img || img.contains(document.activeElement) ||
        (img.closest && img.closest('a') && img.closest('a') === document.activeElement));
      if (isStillFocused) {
        announce(description);
        speakVisualDescription(description);
      }
    }

    // Call live AI Vision endpoint: Visual explanation FIRST, Intent & Pedagogical purpose SECOND
    const situationContext = 'This user is blind and cannot see the screen. They need to understand what this visual depicts and its educational intent. FIRST clearly describe what is visually depicted in the image, and SECOND clearly explain the intent, pedagogical purpose, and core message of the visual.';
    if (typeof fetch === 'function') {
      const apiUrl = getEffectiveApiUrl();
      fetch(apiUrl + '/describe-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          url: fullUrl || src,
          image_data: imageData,
          language: lang,
          context: situationContext
        })
      })
      .then(res => res.json())
      .then(data => {
        onDescriptionReady(data.description);
      })
      .catch(() => {
        const descText = alt || filename
          ? (lang === 'am' ? `የትምህርት ይዘት ምስል፡ ${alt || filename}` : `Educational lesson visual: ${alt || filename}`)
          : (lang === 'am' ? 'የትምህርት ይዘት ምስል' : 'Educational visual');
        onDescriptionReady(descText);
      });
    } else {
      const descText = alt || filename
        ? (lang === 'am' ? `የትምህርት ይዘት ምስል፡ ${alt || filename}` : `Educational lesson visual: ${alt || filename}`)
        : (lang === 'am' ? 'የትምህርት ይዘት ምስል' : 'Educational visual');
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
    const role = (node.getAttribute('role') || '').toLowerCase();
    const prefixes = {
      callout: {
        en: 'Important note: ',
        am: 'ማሳሰቢያ፡ ',
        om: 'Hubachiisa: ',
        ti: 'መተሓሳሰቢ፡ ',
        so: 'Ogeysiis muhiim ah: ',
        ar: 'ملاحظة هامة: ',
        sw: 'Taarifa muhimu: ',
        fr: 'Remarque importante : '
      },
      job: {
        en: 'Job opening: ',
        am: 'የሥራ ማስታወቂያ፡ ',
        om: 'Beeksisa hojii: ',
        ti: 'ናይ ስራሕ ምልክታ፡ ',
        so: 'Xayeysiinta shaqada: ',
        ar: 'فرصة عمل: ',
        sw: 'Nafasi ya kazi: ',
        fr: 'Offre d’emploi : '
      }
    };

    if (/^h[1-6]$/.test(tag) || role === 'heading') {
      // Natural spoken reading: Speak heading content directly without repeating robotic level numbers
      prefix = '';
    } else if (node.classList.contains('callout') || node.closest('.callout')) {
      prefix = (prefixes.callout[currentLang] || prefixes.callout.en);
    } else if (node.classList.contains('job-card') || role === 'article') {
      prefix = (prefixes.job[currentLang] || prefixes.job.en);
    }

    // If user selected a non-English language but the paragraph is in English,
    // dynamically translate, substitute into the DOM visually, and speak in their chosen language!
    if (currentLang !== 'en' && /[a-zA-Z]/.test(rawText)) {
      const transKey = `trans_${currentLang}`;
      if (node.dataset[transKey]) {
        const trans = node.dataset[transKey];
        substituteElementText(node, trans);
        const fullText = `${prefix}${trans}`;
        announce(fullText);
        speakVisualDescription(fullText);
        return;
      }
      const cachedTrans = getDynamicTrans(currentLang, rawText);
      if (cachedTrans) {
        node.dataset[transKey] = cachedTrans;
        substituteElementText(node, cachedTrans);
        const fullText = `${prefix}${cachedTrans}`;
        announce(fullText);
        speakVisualDescription(fullText);
        return;
      }
      const apiUrl = getEffectiveApiUrl();
      if (typeof fetch === 'function') {
        fetch(apiUrl + '/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ strings: [rawText], target_lang: currentLang, source_lang: 'en' })
        })
        .then(r => r.json())
        .then(d => {
          const trans = (d.translations && d.translations[rawText]) || rawText;
          if (trans && trans !== rawText) {
            node.dataset[transKey] = trans;
            setDynamicTransBatch(currentLang, { [rawText]: trans });
            substituteElementText(node, trans);
          }
          if (document.activeElement === node || node.classList.contains('sa11y-text-focused')) {
            const fullText = `${prefix}${trans}`;
            announce(fullText);
            speakVisualDescription(fullText);
          }
        })
        .catch(() => {
          const fullSpeechText = `${prefix}${rawText}`;
          announce(fullSpeechText);
          speakVisualDescription(fullSpeechText);
        });
      } else {
        const fullSpeechText = `${prefix}${rawText}`;
        announce(fullSpeechText);
        speakVisualDescription(fullSpeechText);
      }
      return;
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

      // Generic Dynamic Accessible Image Labeling (Plug-and-play across any arbitrary website)
      if (!img.getAttribute('aria-label')) {
        let label = (alt || '').trim();
        const parentLink = img.closest('a');
        const isLogoOrBrand = img.closest('.logo, .logo-container, .brand, .site-logo') || (parentLink && parentLink.closest('header') && !label);

        if (isLogoOrBrand) {
          const siteName = (document.title || '').split(/[-|—]/)[0].trim() || (typeof window !== 'undefined' && window.location ? window.location.hostname.replace(/^www\./, '') : 'Site');
          label = `${siteName} ${currentLang === 'am' ? 'አርማ' : 'Logo'}`;
        } else if (!label || /^[a-z0-9_-]+\.(jpg|jpeg|png|webp|svg|gif)$/i.test(label) || /^[a-z0-9_-]{15,}$/i.test(label)) {
          // Clean slug into natural human words: e.g. "sensor-diagram-v2" -> "Sensor Diagram V2"
          const rawStem = (src.split('/').pop() || '').split('.')[0]
            .replace(/[-_]+/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .trim();
          if (rawStem && !/^[0-9a-f]{20,}$/i.test(rawStem)) {
            label = rawStem.charAt(0).toUpperCase() + rawStem.slice(1);
          } else {
            label = (i18n[currentLang] && i18n[currentLang].imgGeneric) || (currentLang === 'am' ? 'ምስል' : 'Visual content');
          }
        }
        if (isImg && !img.getAttribute('alt')) img.setAttribute('alt', label);
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
          if (activeA11yAudio) {
            activeA11yAudio.pause();
            activeA11yAudio = null;
          }
          if (activeA11yAbort) {
            activeA11yAbort.abort();
          }
        });
        focusTarget.style.cursor = 'pointer';
        focusTarget.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            if (this.tagName !== 'A') e.preventDefault();
            describeImage(this);
          }
        });
        focusTarget.addEventListener('click', function () {
          describeImage(img);
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

    // 4. Enrich Educational & Portal Content Elements for Sequential Reading (Universal Scalability across any site)
    let contentRoots = Array.from(document.querySelectorAll(
      'main, article, [role="main"], #curriculum_navigation_content, .formatted-content, .savanna-styles, #jobs-container, .job-details, .job-card, .job-listing, .career-portal, .container, section'
    ));
    if (contentRoots.length === 0) {
      contentRoots = [document.body || document.documentElement];
    }

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
    
    const textSelectors = 'h1, h2, h3, h4, h5, h6, [role="heading"], p, .callout, blockquote, li, [role="article"], .job-card, .job-card-title, .job-card-snippet, .job-details';
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
        if (el.tagName === 'LI' && el.closest('h1, h2, h3, h4, h5, h6')) {
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
    banner.innerHTML = `<span aria-hidden="true">✓</span><span>${escapeHtml(message)}</span>`;
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

  const navActionMsgs = {
    next: {
      en: 'Navigating to next section...',
      am: 'ወደ ቀጣይ ክፍል በመሄድ ላይ...',
      om: 'Gara kutaa itti aanutti...',
      ti: 'ናብ ዝቕጽል ክፍሊ...',
      so: 'U gudbaya qaybta xigta...',
      ar: 'الانتقال إلى القسم التالي...',
      sw: 'Inaelekea sehemu inayofuata...',
      fr: 'Navigation vers la section suivante...'
    },
    nextLoaded: {
      en: 'Next section loaded',
      am: 'ቀጣይ ክፍል ተከፍቷል',
      om: 'Kutaan itti aanaa banameera',
      ti: 'ዝቕጽል ክፍሊ ተኸፊቱ',
      so: 'Qaybta xigta waa furantay',
      ar: 'تم تحميل القسم التالي',
      sw: 'Sehemu inayofuata imepakiwa',
      fr: 'Section suivante chargée'
    },
    prev: {
      en: 'Navigating to previous section...',
      am: 'ወደ ቀዳሚ ክፍል በመመለስ ላይ...',
      om: 'Gara kutaa duraatti...',
      ti: 'ናብ ዝሓለፈ ክፍሊ...',
      so: 'Ku noqonaya qaybtii hore...',
      ar: 'العودة إلى القسم السابق...',
      sw: 'Inarudi sehemu iliyopita...',
      fr: 'Retour à la section précédente...'
    },
    complete: {
      en: 'Activity marked as complete!',
      am: 'ተግባሩ ተጠናቋል ተብሎ ተመዝግቧል!',
      om: 'Hojiin xumurameera!',
      ti: 'እቲ ዕዮ ተወዲኡ!',
      so: 'Hawshu way dhammaatay!',
      ar: 'تم تحديد النشاط كمكتمل!',
      sw: 'Shughuli imekamilika!',
      fr: 'Activité marquée comme terminée !'
    }
  };

  /* ── 11. Navigation & Action Helpers ───────────────────────────────────── */
  function navigateNextLesson() {
    const nextMsg = navActionMsgs.next[currentLang] || navActionMsgs.next.en;
    const loadedMsg = navActionMsgs.nextLoaded[currentLang] || navActionMsgs.nextLoaded.en;

    // 1. Look for active item in navigation list / sidebar / tabs
    const activeItem = document.querySelector('.list-group-item.active, [aria-selected="true"], [aria-current="page"]');
    if (activeItem && activeItem.nextElementSibling) {
      const link = activeItem.nextElementSibling.querySelector('a') || activeItem.nextElementSibling;
      if (link && typeof link.click === 'function') {
        announce(nextMsg);
        triggerVisualAlert(nextMsg);
        link.click();
        return;
      }
    }
    // 2. Look for Next buttons or standard pagination links across any platform
    const nextBtn = document.querySelector('[rel="next"], .pagination .next a, a.next, button.next, [data-action="next"]') ||
      Array.from(document.querySelectorAll('a, button')).find(el => {
        const txt = (el.textContent || '').trim().toLowerCase();
        return (txt.includes('next') || txt.includes('ቀጣይ') || txt.includes('suivant') || txt.includes('التالي')) &&
          !el.closest('#sa11y-motor-toolbar');
      });
    if (nextBtn) {
      announce(nextMsg);
      triggerVisualAlert(nextMsg);
      nextBtn.click();
      return;
    }
    // Fallback simulation in prototype
    if (activeItem && activeItem.nextElementSibling) {
      activeItem.classList.remove('active');
      activeItem.nextElementSibling.classList.add('active');
      triggerVisualAlert(loadedMsg);
      announce(loadedMsg);
    }
  }

  function navigatePrevLesson() {
    const prevMsg = navActionMsgs.prev[currentLang] || navActionMsgs.prev.en;

    const activeItem = document.querySelector('.list-group-item.active, [aria-selected="true"], [aria-current="page"]');
    if (activeItem && activeItem.previousElementSibling) {
      const link = activeItem.previousElementSibling.querySelector('a') || activeItem.previousElementSibling;
      if (link && typeof link.click === 'function') {
        announce(prevMsg);
        triggerVisualAlert(prevMsg);
        link.click();
        return;
      }
    }
    const backBtn = document.querySelector('[rel="prev"], .pagination .prev a, a.prev, button.prev, [data-action="back"]') ||
      Array.from(document.querySelectorAll('a, button')).find(el => {
        const txt = (el.textContent || '').trim().toLowerCase();
        return (txt.includes('back') || txt.includes('prev') || txt.includes('ተመለስ') || txt.includes('précédent') || txt.includes('السابق')) &&
          !el.closest('#sa11y-motor-toolbar');
      });
    if (backBtn) {
      announce(prevMsg);
      triggerVisualAlert(prevMsg);
      backBtn.click();
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
    }
  }

  function triggerCompleteLesson() {
    const completeMsg = navActionMsgs.complete[currentLang] || navActionMsgs.complete.en;
    const completeBtn = document.querySelector('form.button_to button[type="submit"], [data-action="complete"], .btn-complete') ||
      Array.from(document.querySelectorAll('button')).find(b => {
        const txt = (b.textContent || '').trim().toLowerCase();
        return (txt.includes('complete') || txt.includes('finish') || txt.includes('ጨርስ') || txt.includes('terminer') || txt.includes('إكمال')) &&
          !b.closest('#sa11y-motor-toolbar');
      });

    if (completeBtn) {
      completeBtn.click();
    } else {
      triggerVisualAlert(completeMsg);
      announce(completeMsg);
    }
  }

  function readCurrentLessonAloud() {
    if (activeA11yAudio || (window.speechSynthesis && window.speechSynthesis.speaking)) {
      if (activeA11yAudio) {
        activeA11yAudio.pause();
        activeA11yAudio = null;
      }
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
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
    if (currentLang === 'am' && /[a-zA-Z]/.test(speakText) && !/[\u1200-\u137F]/.test(speakText) && typeof fetch === 'function') {
      const apiUrl = getEffectiveApiUrl();
      fetch(apiUrl + '/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strings: [speakText], target_lang: 'am', source_lang: 'en' })
      })
      .then(r => r.json())
      .then(d => {
        const trans = (d.translations && d.translations[speakText]) || speakText;
        speakVisualDescription(trans);
      })
      .catch(() => {
        speakVisualDescription(speakText);
      });
    } else {
      speakVisualDescription(speakText);
    }

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
    } else if (e.key === 'Escape' || e.key === 'Control') {
      if (isAutoScanActive) {
        stopSwitchScanner();
      }
      if (isShortcutsOpen) {
        closeShortcutsModal();
      }
      if (isReadingRulerActive) {
        toggleReadingRuler(false);
      }
      if (activeA11yAudio) {
        activeA11yAudio.pause();
        activeA11yAudio = null;
      }
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    }
  }

  // Global shortcuts for blind and keyboard users:
  // - Alt + I: Describe focused or main lesson image
  // - Escape or Control: Universal silence (matching NVDA/JAWS Ctrl standard) to immediately halt any playing speech/audio
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
    } else if (e.key === 'Escape' || e.key === 'Control') {
      // Universal silence: immediately halt any active TTS audio or Web Speech
      if (activeA11yAudio) {
        activeA11yAudio.pause();
        activeA11yAudio = null;
      }
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
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

  let shortcutsTriggerElement = null;

  function openShortcutsModal() {
    shortcutsTriggerElement = document.activeElement;
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
    if (shortcutsTriggerElement && typeof shortcutsTriggerElement.focus === 'function') {
      shortcutsTriggerElement.focus();
    } else if (motorBarEl) {
      const btn = motorBarEl.querySelector('#sa11y-btn-shortcuts');
      if (btn) btn.focus();
    }
    shortcutsTriggerElement = null;
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
      const apiUrl = getEffectiveApiUrl();
      const resp = await fetch(apiUrl + '/chat', {
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
          bodyEl.innerHTML = `<ul class="sa11y-plain-list">${lines.map(line => `<li>${escapeHtml(line.replace(/^[•\-\*]\s*/, ''))}</li>`).join('')}</ul>`;
        }

        const audioBtn = cardEl.querySelector('.sa11y-card-audio-btn');
        if (audioBtn) {
          audioBtn.addEventListener('click', () => {
            speakVisualDescription(plainSummary.replace(/[•\-\*]/g, ''));
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
    const isVoiceGuideOn = (localStorage.getItem('savanna_voice_guide') !== 'false');
    const enableScreenReader = Boolean(profile.screenReader) || isVoiceGuideOn;
    adaptBlindAndScreenReader(enableScreenReader);
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
      const isVoiceGuideOn = (localStorage.getItem('savanna_voice_guide') !== 'false');
      const enableScreenReader = (activeProfile && activeProfile.screenReader) || isVoiceGuideOn;
      adaptBlindAndScreenReader(enableScreenReader);
      if (currentLang && currentLang !== 'en') translateHostPage(currentLang);
    }, 100);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Listen to profile updates
  window.addEventListener('savanna:a11y-profile-changed', (e) => {
    activeProfile = e.detail;
    applyAdaptations(activeProfile);
  });

  // Listen to voice guide / storage updates from widget iframe
  window.addEventListener('storage', (e) => {
    if (e.key === 'savanna_voice_guide' || e.key === STORAGE_KEY) {
      applyAdaptations(getStoredProfile() || detectOSPreferences());
    }
  });

  /* ── 12. Initial Mount & Check ────────────────────────────────────────── */
  function initEngine() {
    createTriggerButton();
    syncSkipLink(currentLang);
    ensureSemanticLandmarks();

    // Enable image keyboard Tab navigation and visual accessibility by default
    const isVoiceGuideOn = (localStorage.getItem('savanna_voice_guide') !== 'false');
    const stored = getStoredProfile();
    const enableBlind = (stored && stored.screenReader) || isVoiceGuideOn;
    adaptBlindAndScreenReader(enableBlind);

    // If current language is not English, translate host DOM immediately
    if (currentLang && currentLang !== 'en') {
      translateHostPage(currentLang);
    }

    // Check if user has completed onboarding or configured profile
    const onboardingDone = (localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true');

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


  /* ── 2e. Global Language Synchronization Listeners ─────────────────────── */
  window.addEventListener('savanna:language_changed', (e) => {
    if (e.detail && e.detail.lang) {
      const newLang = e.detail.lang;
      if (ALL_LANGUAGES.includes(newLang) && newLang !== currentLang) {
        selectLanguage(newLang);
      }
    }
  });

  window.addEventListener('savanna:set_language', (e) => {
    if (e.detail && e.detail.lang) {
      const newLang = e.detail.lang;
      if (ALL_LANGUAGES.includes(newLang) && newLang !== currentLang) {
        selectLanguage(newLang);
      }
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key === LANG_KEY && e.newValue && ALL_LANGUAGES.includes(e.newValue)) {
      if (e.newValue !== currentLang) {
        selectLanguage(e.newValue);
      }
    }
  });

    // Expose API for host scripts or other modules
  window.SavannaA11y = window.__SAVANNA_A11Y_ENGINE__ = {
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
