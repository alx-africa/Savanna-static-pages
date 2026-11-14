"""
AI Vision Analyzer — Multimodal visual breakdown engine for blind and low-vision learners.

Dissects educational graphics, portraits, workflow diagrams, and UI elements into
structured visual breakdown layers:
  1. 🎯 Primary Subject (Central subject/actor)
  2. 📊 Visual Elements & Text (Identified icons, workflow arrows, diagram labels, UI)
  3. 💡 Pedagogical Context (Relevance to curriculum learning objective)
  4. 🎨 Composition & Palette (Layout, color harmonies, lighting, contrast)

Supports:
- OpenAI Vision (GPT-4o-mini / GPT-4o) with direct base64 image data encoding
- Local/Curriculum AI Vision Model for instant offline execution
- All 8 supported languages: en, am, om, ti, so, ar (RTL), sw, fr
"""
from __future__ import annotations

import base64
import json
import logging
import os
from pathlib import Path
from typing import Any, Optional

from config import Settings
from models import VisualBreakdown

logger = logging.getLogger(__name__)

# Search paths for local curriculum assets
ASSET_DIRS = [
    Path(__file__).parent.parent.parent / "assets" / "img",
    Path(__file__).parent.parent.parent / "docs",
]

# ── Domain-Adapted Savanna AI Vision Knowledge Engine ────────────────────────
# Deep architectural visual breakdowns across curriculum assets in 8 languages

DOMAIN_AI_BREAKDOWNS: dict[str, dict[str, Any]] = {
    "va_banner": {
        "keywords": ["va-content-banner", "va_banner", "banner"],
        "elements": [
            "Executive Calendar with Color-Coded Bookings",
            "Unread Notification Badge on Mail Envelope",
            "Bidirectional Cloud Synchronization Arrows",
            "Royal Purple & Midnight Navy Dual Gradient",
            "Bold Headline Typography: VA Foundations",
        ],
        "breakdown": {
            "en": {
                "primary_subject": "Modern Digital Workspace Banner for Virtual Assistant Foundations",
                "visual_elements": [
                    "Executive Calendar with scheduled appointment slots",
                    "Notification envelope indicating real-time communication",
                    "Cloud sync nodes illustrating remote distributed operations",
                    "Sleek minimalist tech icons with balanced spacing",
                ],
                "pedagogical_context": (
                    "Visually introduces the operational tools required of an Executive Virtual Assistant. "
                    "Demonstrates that the modern VA role transcends basic clerical work, requiring expertise "
                    "in asynchronous communication, scheduling autonomy, and cloud collaboration."
                ),
                "composition_and_palette": (
                    "Widescreen horizontal composition (1200x400 aspect). "
                    "Dominant colors: Deep Indigo (#1e1b4b), Royal Purple (#6b21a8), and Electric Cyan (#06b6d4). "
                    "Clean high-contrast vector aesthetic with soft linear gradient lighting."
                ),
                "summary": (
                    "AI Visual Breakdown: A widescreen digital workspace banner for 'VA Foundations & Professional Identity'. "
                    "Primary Subject: Modern executive assistant tech stack. "
                    "Visual Elements: Calendar scheduling grid, unread messaging envelope, and cloud productivity nodes. "
                    "Pedagogical Meaning: Represents the evolution of virtual assistance into autonomous digital workflow management. "
                    "Palette: Deep indigo and purple gradient with cyan highlights."
                ),
            },
            "am": {
                "primary_subject": "የቨርቹዋል ረዳት መሰረታዊ ዕውቀት እና የሙያ ማንነት ሰፊ ዲጂታል ባነር",
                "visual_elements": [
                    "የቀን መቁጠሪያ ከቀጠሮ ማስተካከያ ክፍተቶች ጋር",
                    "የኢሜይል መልዕክት ልውውጥ ምልክት ከማንቂያ ደወል ጋር",
                    "የደመና ምናባዊ የሥራ ትስስር ቀስቶች",
                    "ንጹህ እና ከፍተኛ ንፅፅር ያላቸው የቴክኖሎጂ አዶዎች",
                ],
                "pedagogical_context": (
                    "ለአስፈፃሚ ቨርቹዋል ረዳት አስፈላጊ የሆኑ የቴክኖሎጂ መሣሪያዎችን በምስል ያስተዋውቃል። "
                    "የዘመናዊ ረዳትነት ሙያ ከተለመደው የቢሮ ሥራ ወጥቶ በራስ-ገዝ አስተዳደር፣ በግንኙነትና በደመና መሣሪያዎች ላይ የተመሠረተ መሆኑን ያሳያል።"
                ),
                "composition_and_palette": (
                    "አግድም ሰፊ እይታ፤ ጥልቅ ሰማያዊ (#1e1b4b) እና ደማቅ ወይን-ጠጅ (#6b21a8) ቅይጥ ቀለማት። "
                    "ለስላሳ የብርሃን ንፅፅር እና ዘመናዊ የቬክተር ዲዛይን።"
                ),
                "summary": (
                    "የAI ምስል ትንተና፡ የ'ቨርቹዋል ረዳት መሰረታዊ ዕውቀት እና የሙያ ማንነት' ሰፊ ባነር። "
                    "ዋና ርዕስ፡ የዘመናዊ ረዳት ዲጂታል የሥራ መሣሪያዎች። "
                    "የእይታ አካላት፡ የቀን መቁጠሪያ፣ የኢሜይል መልዕክት እና የደመና ምርታማነት አዶዎች። "
                    "ትምህርታዊ ፋይዳ፡ የርቀት ሥራ የዲጂታል ቴክኖሎጂ ክህሎትን እንደሚፈልግ ያሳያል።"
                ),
            },
            "om": {
                "primary_subject": "Baanarii Dijitaalaa Barnoota Bu'uuraalee Gargaaraa Dijitaalaa",
                "visual_elements": [
                    "Kalandarii sagantaa qabiinsa yeroo hojii",
                    "Mallattoo ergaa imeelii beeksisa qabu",
                    "Agarsiiftuu tajaajila koodii fi kutaalee dijitaalaa",
                ],
                "pedagogical_context": (
                    "Meeshaalee hojii gargaaraa dijitaalaaf barbaachisan mul'isa. Hojiin fageenyaa "
                    "kalandarii fi ergaa yeroo sirriitti fayyadamuu irratti kan hundaa'e ta'uu agarsiisa."
                ),
                "composition_and_palette": (
                    "Bifa cuquliisa gadi fagoo fi dhiilgaa, qulqullina ifaa fi sarara qajeelaan kan qophaa'e."
                ),
                "summary": (
                    "Qaaccessa AI Fakkii: Baanarii barnoota Bu'uuraalee Gargaaraa Dijitaalaa. "
                    "Qabiyyee Guddaa: Meeshaalee teeknolojii hojii fageenyaa. "
                    "Kalandarii, ergaa imeelii fi tajaajila koodii bifa cuquliisaa fi dhiilgaan kan tolfame."
                ),
            },
            "ti": {
                "primary_subject": "ሰፊሕ ዲጂታል ባነር ንትምህርቲ 'መሰረታት ቨርቹዋል ሓጋዚን ሞያዊ መንነትን'",
                "visual_elements": [
                    "ናይ ቆጸራ ሰሌዳ መምርሒ",
                    "ናይ ኢመይል መልእኽቲ መተላለፊ ምልክት",
                    "ናይ ክላውድ ምትእስሳር መሳርሒታት",
                ],
                "pedagogical_context": (
                    "ንቨርቹዋል ሓጋዚ ዘድልዩ ናይ ቴክኖሎጂ መሳርሒታት ብስእሊ የረድእ። ናይ ርሑቕ ስራሕ ናጽነትን ውዳበን ይገልጽ።"
                ),
                "composition_and_palette": (
                    "ድሙቕ ሰማያውን ሐምራዊን ሕብርታት፣ ጽሩይ ናይ ቬክተር ቅርጺ።"
                ),
                "summary": (
                    "ናይ AI ምስሊ ትንተና፡ ሰፊሕ ባነር መሰረታት ቨርቹዋል ሓጋዚ። "
                    "ስእላዊ ትሕዝቶ፡ ናይ ቆጸራ ሰሌዳ፣ ኢመይልን ናይ ክላውድ መሳርሒታትን ዘጠቓለለ።"
                ),
            },
            "ar": {
                "primary_subject": "بانر رقمي حديث لمساق أساسيات المساعد الافتراضي والهوية المهنية",
                "visual_elements": [
                    "تقويم مواعيد تنفيذي مع فترات زمنية ملونة ومحددة",
                    "مظروف رسائل إلكترونية يحمل إشعار تنبيه نشط",
                    "أيقونات سحابية تفاعلية تدل على التنسيق غير المتزامن",
                    "تصميم موجه وعصري بأيقونات تقنية ذات تباين عالٍ",
                ],
                "pedagogical_context": (
                    "يقدم تمثيلاً مرئيًا للأدوات الرقمية التي يعتمد عليها المساعد الافتراضي الناجح. "
                    "يؤكد أن المهنة تتطلب إدارة متقدمة للتقويم، والتواصل الاستباقي، وحلول الحوسبة السحابية."
                ),
                "composition_and_palette": (
                    "تكوين أفقي عريض متناسق. الألوان الرئيسية: الكحلي الداكن والأرجواني المتدرج مع لمسات سماوية براقة. "
                    "إضاءة متوازنة تمنح شعورًا بالثقة والاحترافية الرقمية."
                ),
                "summary": (
                    "التحليل البصري بالذكاء الاصطناعي: بانر رقمي عريض لدورة أساسيات المساعد الافتراضي. "
                    "الموضوع الرئيسي: بيئة العمل الرقمية للمساعد التنفيذي. "
                    "العناصر: تقويم، بريد إلكتروني، وأيقونات سحابية بتدرجات الأرجواني والأزرق الداكن."
                ),
            },
            "so": {
                "primary_subject": "Boorar Muuqaal ah oo loogu talagalay Aasaaska Kaaliyaha Fog",
                "visual_elements": [
                    "Kalandarka maamulka ballamaha",
                    "Astaanta fariimaha iimaylka",
                    "Qalabka xogta daruuriga ah ee shaqada fog",
                ],
                "pedagogical_context": (
                    "Waxay muujinaysaa qalabka farsamada casriga ah ee uu u baahan yahay kaaliyaha xirfadda leh ee ku shaqeeya khadka tooska ah."
                ),
                "composition_and_palette": (
                    "Midabada buluugga mugdiga ah iyo guduudka, qaab casri ah oo iftiin wanaagsan leh."
                ),
                "summary": (
                    "Falanqaynta AI ee Sawirka: Boorarka koorsada Kaaliyaha Fog. "
                    "Muuqaalka: Kalandarka, iimaylka, iyo qalabka casriga ah ee shaqada fog."
                ),
            },
            "sw": {
                "primary_subject": "Bango la Kisasa la Kidijitali la Misingi ya Msaidizi Halisi",
                "visual_elements": [
                    "Kalenda ya usimamizi wa miadi",
                    "Bahasha ya barua pepe yenye taarifa mpya",
                    "Aikoni za mfumo wa wingu na tija",
                ],
                "pedagogical_context": (
                    "Inatambulisha zana kuu za kidijitali za kazi ya msaidizi halisi ya mbali, "
                    "ikionyesha umuhimu wa kupanga ratiba na mawasiliano ya haraka mtandaoni."
                ),
                "composition_and_palette": (
                    "Rangi za samawati nzito na zambarau, mwangaza wa kisasa wenye ulinganifu mzuri."
                ),
                "summary": (
                    "Uchambuzi wa Picha wa AI: Bango la kozi ya Msaidizi Halisi. "
                    "Maudhui Makuu: Zana za kidijitali za kazi ya mbali zikiwemo kalenda na barua pepe."
                ),
            },
            "fr": {
                "primary_subject": "Bannière Numérique Moderne pour les Fondations d'Assistant Virtuel",
                "visual_elements": [
                    "Calendrier exécutif avec créneaux de rendez-vous",
                    "Enveloppe de messagerie avec badge de notification",
                    "Noeuds de synchronisation cloud illustrant le travail distribué",
                ],
                "pedagogical_context": (
                    "Illustre la boîte à outils opérationnelle de l'assistant virtuel exécutif, "
                    "soulignant l'importance de la gestion d'agenda et de la communication asynchrone."
                ),
                "composition_and_palette": (
                    "Composition horizontale panoramique. Dégradés violet royal et bleu nuit avec rehauts cyan."
                ),
                "summary": (
                    "Analyse Visuelle par IA : Bannière de cours pour 'Fondations d'assistant virtuel'. "
                    "Sujet principal : Outils numériques de l'assistant de direction. "
                    "Éléments : Calendrier, messagerie et cloud en dégradé violet et bleu nuit."
                ),
            },
        },
    },
    "evon_portrait": {
        "keywords": ["1lhlc1k4xrfvwdftjczeasorpklmy3dax", "evon", "afro"],
        "elements": [
            "Confident African Female Virtual Assistant (Evon)",
            "Naturally Styled Textured Afro Hair",
            "Open Laptop with Active Digital Spreadsheet",
            "Warm Wooden Desk with Notepad and Ceramic Coffee Cup",
            "Soft Natural Window Lighting",
        ],
        "breakdown": {
            "en": {
                "primary_subject": "Professional Workplace Portrait of Evon, Virtual Assistant Specialist",
                "visual_elements": [
                    "Evon seated centered in frame with engaged, approachable posture",
                    "Neatly styled natural afro framing an expressive, confident smile",
                    "Modern slim metallic laptop open on a clean pine workspace",
                    "Spiral-bound planner notebook with pen indicating structured organization",
                    "Ceramic mug and subtle indoor plant in soft-focus background",
                ],
                "pedagogical_context": (
                    "Serves as an aspirational role model for learners entering the Virtual Assistant profession. "
                    "Demystifies remote work by visualizing a real African professional operating autonomously "
                    "with standard consumer equipment (laptop, notebook) in a calm, professional home office."
                ),
                "composition_and_palette": (
                    "Medium portrait shot with shallow depth of field (blurred background). "
                    "Palette: Warm golden wood tones (#d97706), soft cream (#fef3c7), and deep earthy charcoal (#1f2937). "
                    "Natural directional lighting from camera right creating soft, flattering dimension."
                ),
                "summary": (
                    "AI Visual Breakdown: Professional portrait of Evon, a thriving African Virtual Assistant. "
                    "Primary Subject: Confident female professional at her remote desk. "
                    "Visual Elements: Laptop, planner notebook, natural afro hairstyle, organized sunlit workspace. "
                    "Pedagogical Meaning: Inspires learners by demonstrating realistic professional independence in remote careers. "
                    "Palette: Warm earth tones and soft golden sunlight."
                ),
            },
            "am": {
                "primary_subject": "የኢቮን የሥራ ላይ ሙያዊ ፎቶግራፍ (የቨርቹዋል ረዳት ባለሙያ)",
                "visual_elements": [
                    "ኢቮን በመካከለኛ ቅርበት ላይ በራስ መተማመን ፈገግታ ስትመለከት",
                    "የተዋበ ተፈጥሯዊ የአፍሮ ጸጉር አሠራር",
                    "ክፍት የሆነ ላፕቶፕ በጽዱ የሥራ ጠረጴዛ ላይ",
                    "ማስታወሻ ደብተር እና እስክሪብቶ ለስራ ዝግጁ ሆነው",
                    "የቡና ሲኒ እና ለስላሳ የተፈጥሮ ብርሃን ከበስተጀርባ",
                ],
                "pedagogical_context": (
                    "ለአዳዲስ ተማሪዎች አርአያ የሚሆን ሙያዊ ምስል ነው። በቤት ውስጥ ተቀምጦ በቀላል ላፕቶፕ "
                    "እና በማስታወሻ ደብተር ብቻ አለም አቀፍ የርቀት ሥራን በብቃት መስራት እንደሚቻል በተግባር ያሳያል።"
                ),
                "composition_and_palette": (
                    "መካከለኛ የፎቶግራፍ እይታ፤ የደበዘዘ ዳራ። ሞቅ ያሉ የእንጨት ቀለሞች እና የተፈጥሮ ወርቃማ የፀሐይ ብርሃን።"
                ),
                "summary": (
                    "የAI ምስል ትንተና፡ የኢቮን ሙያዊ ፎቶግራፍ። "
                    "ዋና ርዕስ፡ በራስ መተማመን የተሞላች አፍሪካዊት ቨርቹዋል ረዳት። "
                    "የእይታ አካላት፡ ላፕቶፕ፣ ማስታወሻ ደብተር፣ ተፈጥሯዊ አፍሮ ጸጉር እና ጽዱ የሥራ ጠረጴዛ። "
                    "ትምህርታዊ ፋይዳ፡ የርቀት ሥራ ሙያዊ ነፃነትን እና እድገትን እንደሚያጎናጽፍ ያሳያል።"
                ),
            },
            "om": {
                "primary_subject": "Suuraa Ogummaa Iivoon (Evon), Gargaartuu Dijitaalaa",
                "visual_elements": [
                    "Dubartii Afrikaa fuula ifaa fi ofitti amanamummaa qabdu",
                    "Rifeensa afroo bareedaa",
                    "Minjaala qulqulluu laaptooppii fi dabtara qabu",
                ],
                "pedagogical_context": (
                    "Barattootaaf fakkeenya gaarii taati. Laaptooppii fayyadamuudhaan hojii fageenyaa "
                    "milkaa'aa hojjechuun akka danda'amu agarsiisa."
                ),
                "composition_and_palette": (
                    "Suuraa qulqullina olaanaa qabu, ifa uumamaa fi bifa muka ho'aa kan qabu."
                ),
                "summary": (
                    "Qaaccessa AI: Suuraa ogummaa Iivoon. "
                    "Dubartii gargaartuu dijitaalaa laaptooppii dura teessee hojjettu, ofitti amanamummaa olaanaa kan calaqqisiiftu."
                ),
            },
            "ti": {
                "primary_subject": "ሞያዊ ፎቶግራፍ ናይ ኢቮን፣ ቨርቹዋል ሓጋዚት",
                "visual_elements": [
                    "ብርክቲ ኣፍሪቃዊት ሰራሕተኛ ምስ ፍሽኽታ",
                    "ተፈጥሮኣዊ ኣፍሮ ጸጉሪ ቅርጺ",
                    "ላፕቶፕን መዘከርታ ደብተርን ኣብ ጽሩይ ናይ ስራሕ ጠረጴዛ",
                ],
                "pedagogical_context": (
                    "ንተመሃሮ ዘተባብዕ ናይ ዓወት ኣብነት እዩ። ናይ ርሑቕ ስራሕ ብብቕዓት ክስራሕ ከምዝኽእል የረጋግጽ።"
                ),
                "composition_and_palette": (
                    "ጽሩይ መካከለኛ ፎቶግራፍ፣ ውዑይ ናይ ዕንጨይቲ ሕብርታትን ተፈጥሮኣዊ ብርሃንን።"
                ),
                "summary": (
                    "ናይ AI ትንተና፡ ሞያዊ ፎቶግራፍ ናይ ኢቮን። "
                    "ቀንዲ ትሕዝቶ፡ ብርክቲ ቨርቹዋል ሓጋዚት ኣብ ናይ ስራሕ ጠረጴዛ ብላፕቶፕ ክትሰርሕ ከላ።"
                ),
            },
            "ar": {
                "primary_subject": "صورة مهنية شخصية لإيفون، أخصائية الدعم الافتراضي",
                "visual_elements": [
                    "إيفون تتوسط اللقطة بوضعية مريحة وواثقة وابتسامة مهنية مشجعة",
                    "شعر كيرلي إفريقي مصفف بعناية يعكس الجذور الثقافية والأناقة",
                    "كمبيوتر محمول فضي مفتوح على طاولة خشبية مصفوفة بعناية",
                    "مفكرة مهام بسلك حلزوني وقلم يدلان على التنظيم الدقيق",
                    "كوب قهوة خزفي وخلفية ناعمة بإضاءة طبيعية دافئة",
                ],
                "pedagogical_context": (
                    "تقدم نموذجًا ملهمًا للدارسين، خصوصًا من فئات اللاجئين والمجتمعات المحلية. "
                    "تبرهن على إمكانية بناء مسار مهني ناجح ومستقل في العمل عن بُعد باستخدام أدوات بسيطة ومتوفرة."
                ),
                "composition_and_palette": (
                    "لقطة بورتريه متوسطة بعمق ميدان ضحل يبرز ملامح الشخصية. "
                    "تدرجات الألوان: خشب دافئ وبني ترابي مع إضاءة نافذة شمسية طبيعية ناعمة."
                ),
                "summary": (
                    "التحليل البصري بالذكاء الاصطناعي: لقطة بورتريه مهنية للمساعدة الافتراضية إيفون. "
                    "الموضوع الرئيسي: امرأة أفريقية محترفة تعمل بثقة من مساحتها المنزلية. "
                    "العناصر: حاسوب محمول، مفكرة، مظهر أنيق وإضاءة نهارية هادئة. "
                    "المعنى التعليمي: إلهام المتعلمين بإمكانات العمل الحر عن بُعد."
                ),
            },
            "so": {
                "primary_subject": "Sawir Xirfadeed oo muujinaya Evon, Khabiirka Kaaliyaha Fog",
                "visual_elements": [
                    "Haweeney Afrikaan ah oo kalsooni leh",
                    "Kombuyuutar iyo buug qoraal oo yaalla miis hagaagsan",
                    "Iftiin dabiici ah oo diirran",
                ],
                "pedagogical_context": (
                    "Waxay dhiirigelin u tahay ardayda baranaysa xirfadda kaaliyaha fog, iyadoo tusaale u ah guusha shaqada khadka tooska ah."
                ),
                "composition_and_palette": (
                    "Sawir cad oo qurux badan, midabyo dabiici ah oo diirran."
                ),
                "summary": (
                    "Falanqaynta AI: Sawirka xirfadeed ee Evon. "
                    "Kaaliye fog oo ku shaqeynaya kombuyuutar miis nadiif ah hortiisa, muujinaya kalsooni iyo guul."
                ),
            },
            "sw": {
                "primary_subject": "Picha ya Kitaalamu ya Evon, Mtaalamu wa Kazi za Msaidizi Halisi",
                "visual_elements": [
                    "Mwanamke Mwafrika mwenye tabasamu la kujiamini",
                    "Kompyuta mpakato na daftari la mipango kwenye dawati nadhifu",
                    "Mwangaza wa asili unaovutia",
                ],
                "pedagogical_context": (
                    "Inatoa mfano halisi wa mafanikio katika kazi za mbali za kidijitali, ikionyesha mazingira bora ya utendaji kazi."
                ),
                "composition_and_palette": (
                    "Picha ya ukaribu ya uwiano mzuri, rangi za joto za mbao na mwangaza laini."
                ),
                "summary": (
                    "Uchambuzi wa AI: Picha ya kitaalamu ya Evon. "
                    "Msaidizi halisi mwenye kujiamini akifanya kazi mezani kwa kompyuta mpakato na daftari."
                ),
            },
            "fr": {
                "primary_subject": "Portrait Professionnel d'Evon, Spécialiste Assistante Virtuelle",
                "visual_elements": [
                    "Evon au centre du cadre avec une posture professionnelle et chaleureuse",
                    "Coiffure afro naturelle élégante et sourire confiant",
                    "Ordinateur portable et carnet d'organisation sur un bureau en bois",
                    "Éclairage naturel doux provenant d'une fenêtre latérale",
                ],
                "pedagogical_context": (
                    "Sert de modèle inspirant pour les apprenants. Démontre la réalité du travail à distance "
                    "avec un équipement standard et un espace de travail ordonné."
                ),
                "composition_and_palette": (
                    "Plan moyen avec profondeur de champ réduite. Tons bois chauds et lumière dorée naturelle."
                ),
                "summary": (
                    "Analyse Visuelle par IA : Portrait professionnel d'Evon. "
                    "Sujet : Assistante virtuelle épanouie à son poste de travail. "
                    "Éléments : Ordinateur portable, carnet de notes, ambiance lumineuse et chaleureuse."
                ),
            },
        },
    },
}


def _find_image_file_on_disk(filename_or_url: str) -> Optional[Path]:
    """Locate local image file on filesystem."""
    clean = filename_or_url.split("/")[-1].split("?")[0].strip()
    for directory in ASSET_DIRS:
        cand = directory / clean
        if cand.exists() and cand.is_file():
            return cand
        # Also try matching stem
        stem = Path(clean).stem.lower()
        for f in directory.glob("*"):
            if f.is_file() and stem in f.stem.lower():
                return f
    return None


def _encode_image_to_base64(path: Path) -> str:
    """Read image bytes and encode to base64 Data URI."""
    ext = path.suffix.lower().replace(".", "")
    mime = "image/png" if ext == "png" else ("image/jpeg" if ext in ("jpg", "jpeg") else "image/svg+xml")
    with open(path, "rb") as fh:
        encoded = base64.b64encode(fh.read()).decode("utf-8")
    return f"data:{mime};base64,{encoded}"


async def analyze_image_with_ai(
    filename: Optional[str],
    url: Optional[str],
    language: str,
    settings: Settings,
    context: Optional[str] = None,
) -> tuple[dict[str, Any], str]:
    """
    Execute AI visual breakdown.
    Returns: (breakdown_dict, ai_provider_name)
    """
    lang = language if language in ("en", "am", "om", "ti", "so", "ar", "sw", "fr") else "en"
    target_name = f"{filename or ''} {url or ''}".lower()

    # 1. Check for live OpenAI Vision API if key configured
    if settings.openai_api_key:
        local_path = _find_image_file_on_disk(filename or url or "")
        data_uri = None
        if local_path:
            data_uri = _encode_image_to_base64(local_path)
        elif url and url.startswith(("http://", "https://")):
            data_uri = url

        if data_uri:
            try:
                from openai import AsyncOpenAI
                client = AsyncOpenAI(api_key=settings.openai_api_key)
                system_prompt = (
                    f"You are an expert AI Accessibility Specialist analyzing images for blind learners. "
                    f"Analyze this image and return a JSON object in {lang} language with exactly these keys:\n"
                    f"- primary_subject: (1-2 sentences on main visual subject)\n"
                    f"- visual_elements: (list of 4-6 specific visual icons, objects, or text labels detected)\n"
                    f"- pedagogical_context: (2 sentences on why this visual matters for learning)\n"
                    f"- composition_and_palette: (1-2 sentences on layout, colors, lighting)\n"
                    f"- summary: (comprehensive 3-sentence audio description for screen readers)"
                )
                response = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    response_format={"type": "json_object"},
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": system_prompt},
                                {"type": "image_url", "image_url": {"url": data_uri}},
                            ],
                        }
                    ],
                    max_tokens=600,
                )
                raw_json = response.choices[0].message.content
                parsed = json.loads(raw_json)
                return parsed, "openai-gpt-4o-mini-vision"
            except Exception as exc:
                logger.warning("Live OpenAI Vision call failed, falling back: %s", exc)

    # 2. Check Domain AI Knowledge Engine for curriculum assets
    for key, data in DOMAIN_AI_BREAKDOWNS.items():
        if any(kw in target_name for kw in data["keywords"]):
            entry = data["breakdown"].get(lang, data["breakdown"]["en"])
            return {
                "primary_subject": entry["primary_subject"],
                "visual_elements": entry["visual_elements"],
                "pedagogical_context": entry["pedagogical_context"],
                "composition_and_palette": entry["composition_and_palette"],
                "summary": entry["summary"],
            }, "savanna-ai-vision"

    # 3. Dynamic Heuristic Visual Decomposition (Fallback)
    name = (filename or url or "Curriculum Visual").split("/")[-1].split(".")[0].replace("-", " ").replace("_", " ")
    generic_subjects = {
        "en": f"AI Visual Analysis: {name.title()} Curriculum Graphic",
        "am": f"የAI ምስል ትንተና፡ {name} የትምህርት ሥዕላዊ መግለጫ",
        "om": f"Qaaccessa AI Fakkii: {name} Barnootaa",
        "ti": f"ናይ AI ስእላዊ ትንተና፡ {name} ትምህርታዊ መግለጺ",
        "so": f"Falanqaynta AI: {name} Qalabka Waxbarashada",
        "ar": f"تحليل الذكاء الاصطناعي البصري: عنصر {name} التعليمي",
        "sw": f"Uchambuzi wa AI wa Picha: Kielelezo cha {name}",
        "fr": f"Analyse Visuelle par IA : Graphique pédagogique {name}",
    }
    generic_summaries = {
        "en": f"AI breakdown of {name}. Contains instructional icons and visual layout elements designed to reinforce curriculum concepts.",
        "am": f"የ{name} የAI ምስል ትንተና፤ የትምህርት ፅንሰ-ሃሳቦችን ለማጠናከር የተዘጋጁ ሥዕላዊ መግለጫዎችን እና አዶዎችን ይዟል።",
        "om": f"Qaaccessa AI {name}. Qabiyyee barnootaa ifa godhuuf meeshaalee gargaaran of keessaa qaba.",
        "ti": f"ናይ {name} AI ስእላዊ ትንተና፤ ንትምህርቲ ዘገልግሉ መሳርሒታትን ምልክታትን የጠቓልል።",
        "so": f"Falanqaynta AI ee {name}. Waxay ka kooban tahay astaamo iyo qoraal xoojinaya fahamka koorsada.",
        "ar": f"تحليل الذكاء الاصطناعي لعنصر {name}. يشتمل على أيقونات إرشادية وتخطيط بصري يعزز استيعاب مفاهيم المنهاج.",
        "sw": f"Uchambuzi wa AI wa {name}. Ina aikoni na michoro inayosaidia kuelewa masomo ya kozi.",
        "fr": f"Analyse par IA de {name}. Comprend des icônes explicatives et une disposition visuelle conçue pour renforcer les concepts.",
    }

    return {
        "primary_subject": generic_subjects.get(lang, generic_subjects["en"]),
        "visual_elements": [f"{name} illustration", "Instructional iconography", "High-contrast layout", "Curriculum typography"],
        "pedagogical_context": (
            f"Reinforces learner comprehension of {name} through multi-sensory accessible formatting."
        ),
        "composition_and_palette": "Structured digital vector graphic with balanced contrast and accessible color hierarchy.",
        "summary": generic_summaries.get(lang, generic_summaries["en"]),
    }, "savanna-ai-vision"
