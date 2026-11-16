# Savanna Multilingual Assistant & Live Help

[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG%202.2-Level%20AA%20Compliant-brightgreen.svg)](./CONFORMANCE.md)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python 3.12](https://img.shields.io/badge/Python-3.12%20%7C%203.14-blue.svg?logo=python&logoColor=white)](https://www.python.org)
[![Cloud Run](https://img.shields.io/badge/Google%20Cloud-Cloud%20Run%20Deployed-4285F4.svg?logo=googlecloud&logoColor=white)](https://savanna-assistant-303345096403.us-central1.run.app)
[![Docker](https://img.shields.io/badge/Docker%20Compose-Multi--Container-2496ED.svg?logo=docker&logoColor=white)](./docker-compose.yml)
[![Languages](https://img.shields.io/badge/Languages-8%20East%20African%20%26%20Global-orange.svg)](#languages)

> **Digital Bridge Accessibility Hackathon 2026 — Track 3 Submission**  
> **Repository:** `Hackathon2` | **Active Branches:** `main` & `ermi` | **Standard:** WCAG 2.2 Level AA  
> **Evaluation Reference:** `DIGITAL_BRIDGE_Accessibility_Hackathon_Team_Technical_Guide_14_Nov.pdf`

---

## Live Deployments for Hackathon Judges

The complete solution is deployed and running on **Google Cloud Run** in `us-central1` with production SSL:

| Destination | Purpose | Live Link |
| :--- | :--- | :--- |
| 🎓 **Savanna Course Demo** | Full interactive course with floating AI tutor, starter pills & quiz mode | [Open Live Course](https://savanna-assistant-303345096403.us-central1.run.app/pages/concept-with-navigation.html) |
| 💼 **Career Gateway** | Remote job board with non-intrusive interview accommodations | [Open Jobs Portal](https://savanna-assistant-303345096403.us-central1.run.app/pages/jobs-portal.html) |
| 🌐 **Proof Outside Savanna** | Blank external HTML page with zero Savanna/Bootstrap CSS | [Open Blank Demo](https://savanna-assistant-303345096403.us-central1.run.app/demo/blank.html) |
| 🎧 **Operator Live Dashboard** | Human tutor escalation desk with WebRTC screen-sharing receiver | [Open Operator Desk](https://savanna-assistant-303345096403.us-central1.run.app/operator/index.html) |
| 📚 **Interactive Swagger API** | Full OpenAPI 3.0 interactive documentation for Level 2 & Level 3 endpoints | [Open Swagger Docs](https://savanna-assistant-303345096403.us-central1.run.app/docs) |

---

## What it does

**Savanna Multilingual Assistant** is a universal, pluggable accessibility module that brings voice and text AI tutoring in local Ethiopian languages to online learning platforms. Grounded strictly in course materials with direct section anchor citations, it bridges language, digital literacy, and accessibility gaps.

```
+---------------------------------------------------------------------------------------------------+
|                                        SAVANNA ARCHITECTURE                                       |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|   +-------------------------------------------------------------------------------------------+   |
|   | HOST WEBPAGE (Any LMS / School / CMS)                                                     |   |
|   |                                                                                           |   |
|   |   +---------------------------+                +--------------------------------------+   |   |
|   |   | Movable Trigger Button    |  Alt+A / Click | Floating Chat Tab (Compact / Normal) |   |   |
|   |   | (Draggable, Touch/Mouse)  +--------------->+ .message-list | starter-pills | TTS  |   |   |
|   |   +---------------------------+                +-------------------+------------------+   |   |
|   +--------------------------------------------------------------------|----------------------+   |
|                                                                        |                          |
|                                                                        | POST /chat               |
|                                                                        v                          |
|   +-------------------------------------------------------------------------------------------+   |
|   | FASTAPI BACKEND (Cloud Run / Docker)                                                      |   |
|   |                                                                                           |   |
|   |   +-------------------+   +--------------------+   +-------------------+   +----------+   |   |
|   |   | Multilingual RAG  |   | Cross-Lingual STT  |   | Neural TTS Cache  |   | Human    |   |   |
|   |   | Gemini 2.5 Flash  |   | & Review Engine    |   | Edge-TTS (am-ET)  |   | Escalate |   |   |
|   |   +-------------------+   +--------------------+   +-------------------+   +----+-----+   |   |
|   +---------------------------------------------------------------------------------|---------+   |
|                                                                                     |             |
|                                                                                     v             |
|   +------------------------------------+   +--------------------------------------------------+   |
|   | OMNICHANNEL CHANNELS               |   | INCLUSIVE CAREER GATEWAY                         |   |
|   | Telegram Bot + SMS (UCS-2 Ge'ez)   |   | Remote Tech Jobs + Non-Medical Accommodations    |   |
|   +------------------------------------+   +--------------------------------------------------+   |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

### Key Capabilities

1. **Course Question Answering with Direct Anchor Citations:** Answers are grounded in the active curriculum and cited with clickable URL fragment anchors (e.g. `pages/concept-with-navigation.html#what-is-shaping-the-future-of-va-work`).
2. **First-Class Voice Experience for Blind Learners:**
   - Record questions by voice in Amharic, Oromo, Tigrinya, Arabic, Somali, Kiswahili, French, or English.
   - **Review Before Sending:** Blind learners can listen back to their recording, approve or re-record, and send with full autonomy.
   - **Accessible Spoken Answers:** Text-to-speech with on-demand audio playback (`Alt+L`) and auditory earcon chimes.
3. **Pluggable & Responsive Floating Widget:**
   - Works on **any third-party website** with a single script tag — automatically resolves backend API origin with zero configuration.
   - **Ergonomic Sizing:** Includes **Compact Mode** (`330px × 430px`) for smaller PC laptops (1366×768) and **Standard Mode** (`380px × 540px`). Toggleable with **`Alt + S`** or the header button.
   - **Draggable Trigger:** The floating bubble can be freely repositioned anywhere on screen with mouse or touch.
4. **Instant Human Escalation:** One-click transfer to human tutors with live learner context, transcript history, and mobile screen-sharing fallbacks.
5. **Omnichannel Delivery:** Accessible via Web widget, Telegram long-polling bot, and low-bandwidth plain SMS (`160` characters Latin / `70` characters UCS-2 Ge'ez).
6. **Inclusive Career Gateway:** Pan-African remote tech job listings adhering to `schema.org/JobPosting` standards, featuring a dignified accommodation request flow without demanding medical proof.

---

## The main task we tested

> *"A visually impaired or non-English speaking learner asks a course question by voice in Amharic on a mobile phone, receives a spoken and text answer cited with direct lesson section links, and connects to a human tutor with live context, completely unaided."*

### Verified Evaluation Steps:
1. **Open Assistant:** Learner opens the assistant via the floating trigger or global hotkey **`Alt + A`**.
2. **Voice Recording:** Press **`Alt + V`** (or microphone button) to start recording in Amharic: *"ሰላም፣ ትምህርቱን እንዴት መጀመር እችላለሁ?"*.
3. **Review & Approval:** The audio review panel opens; learner presses Play to listen back and clicks Send.
4. **Grounded AI Answer:** AI responds in Amharic with exact course section citations (`[concept-with-navigation_sec0_c1]`) and Ethiopian Ge'ez calendar date (`ህዳር 7 ቀን 2019 ዓ.ም.`).
5. **Spoken Output:** Press **`Alt + L`** (or click Listen) to hear the response read aloud via natural neural TTS (`am-ET-MekdesNeural`).
6. **One-Click Escalation:** Double-tap spacebar or click *"Get human help"* to open an escalation ticket with active DOM breadcrumbs forwarded to the operator dashboard.

---

## Run it

### Option A: Zero Installation (Live Cloud Run)

You can evaluate the entire project immediately in any web browser without cloning or installing dependencies:
* **Interactive Course:** [https://savanna-assistant-303345096403.us-central1.run.app/pages/concept-with-navigation.html](https://savanna-assistant-303345096403.us-central1.run.app/pages/concept-with-navigation.html)
* **API Documentation:** [https://savanna-assistant-303345096403.us-central1.run.app/docs](https://savanna-assistant-303345096403.us-central1.run.app/docs)

### Option B: Local Docker Compose (Complete Stack)

Run the multi-container stack (FastAPI Backend, Redis Cache, Nginx Static Host) locally:

```bash
# 1. Clone repository
git clone https://github.com/habibi-code/Savanna-static-pages.git
cd Savanna-static-pages

# 2. Setup environment (works out-of-the-box with built-in offline providers)
cp .env.example .env

# 3. Start services
docker compose up -d

# 4. Access locally:
# -> Course Demo:        http://localhost:8080/pages/concept-with-navigation.html
# -> Blank Host Demo:    http://localhost:8080/demo/blank.html
# -> Interactive API:    http://localhost:8000/docs
# -> Operator Dashboard: http://localhost:8080/operator/index.html
```

### Option C: Run Local Python Backend Directly

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r api/requirements.txt
PYTHONPATH=api uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Install, Level 1

The module installs onto **any website** (WordPress, Canvas LMS, Moodle, custom HTML, Webflow) using a single script tag and web component:

```html
<!-- 1. Universal Drop-in Script (Works on ANY external domain) -->
<script src="https://savanna-assistant-303345096403.us-central1.run.app/widget/widget.js?v=2.8.3" defer></script>

<!-- 2. Web Component (Technical Guide Contract) -->
<db-assistant lang="am" content="/content.json"></db-assistant>

<!-- 3. Optional: Listen to Host Events -->
<script>
  // Learner asks a question
  document.addEventListener('db-assistant:question', (e) => {
    console.log('Question:', e.detail.question, 'Language:', e.detail.language);
  });

  // Learner escalates to human tutor
  document.addEventListener('db-assistant:escalated', (e) => {
    console.log('Ticket ID:', e.detail.ticketId, 'Conversation:', e.detail.conversation);
  });

  // Language changed
  window.addEventListener('savanna:language_changed', (e) => {
    console.log('New language:', e.detail.lang);
  });
</script>
```

### Component Attributes
* `lang`: Initial language code (`en`, `am`, `om`, `ti`, `so`, `ar`, `sw`, `fr`, or `auto`).
* `api`: Optional override for backend API base URL (defaults automatically to the script's origin).
* `content`: Optional URL to host curriculum JSON for dynamic automated indexing.

### Built-in Keyboard Shortcuts

| Shortcut | Function | Target Users |
| :--- | :--- | :--- |
| **`Alt + A`** | Toggle Assistant panel open/closed | Universal / Blind learners |
| **`Alt + V`** | Start / stop voice recording | Blind / Low-literacy learners |
| **`Alt + L`** | Listen / replay latest assistant answer aloud | Auditory / Visually impaired |
| **`Alt + S`** | **Toggle Small Compact size vs Standard size** | **Laptops & small PC monitors** |
| **`Escape`** / **`Ctrl`** | Instantly silence any active audio playback | NVDA / JAWS screen reader users |
| **`Space + Space`** | Double-space shortcut to open Live Help Desk | Motor impaired / Fast escalation |

---

## Install, Level 2

Complete OpenAPI 3.0 specification is published at [`openapi.yaml`](./openapi.yaml) and interactive Swagger documentation is served at `/docs`.

### Copy-Paste Verification Commands for Judges

You can run these commands against the **Live Cloud Run URL** (`https://savanna-assistant-303345096403.us-central1.run.app`) or `http://localhost:8000`:

#### 1. Course RAG Tutor with Section Citations (`POST /api/v1/ask`)
```bash
# Asks question; returns answer cited with direct lesson section anchor link
curl -s -X POST https://savanna-assistant-303345096403.us-central1.run.app/api/v1/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is shaping the future of VA work?", "language": "en"}' | jq .

# Amharic query with Ge'ez calendar timestamp
curl -s -X POST https://savanna-assistant-303345096403.us-central1.run.app/api/v1/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "የሳቫና ማጠናቀቂያ ነጥብ ስንት ነው?", "language": "am"}' | jq .
```

#### 2. Dynamic Host Curriculum Indexing (`POST /api/v1/content`)
```bash
# Host platform sends arbitrary new lessons to be dynamically indexed
curl -s -X POST https://savanna-assistant-303345096403.us-central1.run.app/api/v1/content \
  -H "Content-Type: application/json" \
  -d '{
    "lessons": [
      {
        "id": "ai-ethics-101",
        "title": "AI Ethics and Fair Evaluation",
        "html": "<h3><a id=\"fairness-and-bias\"></a>Fairness in AI Systems</h3><p>Algorithms must undergo accessibility audits to ensure refugee and disabled learners receive equal assessment standards.</p>",
        "url": "/lessons/ai-ethics#fairness-and-bias"
      }
    ]
  }' | jq .
```

#### 3. Human Escalation Ticket (`POST /api/v1/escalations`)
```bash
# Dispatches ticket with device context to the human operator dashboard
curl -s -X POST https://savanna-assistant-303345096403.us-central1.run.app/api/v1/escalations \
  -H "Content-Type: application/json" \
  -d '{
    "conversation": [{"role": "user", "content": "Stuck on Week 10 Python setup"}],
    "reason": "Need live tutor assistance",
    "learner_context": {
      "current_url": "pages/concept-with-navigation.html",
      "focused_element": "#artificial-intelligence-and-the-future-of-va-work",
      "platform": "Android Chrome"
    }
  }' | jq .
```

#### 4. Low-Bandwidth Text SMS Route (`POST /sms/inbound`)
```bash
# Text SMS endpoint returning plain text of at most 160 chars (70 for UCS-2 Ge'ez)
curl -s -X POST https://savanna-assistant-303345096403.us-central1.run.app/sms/inbound \
  -H "Content-Type: application/json" \
  -d '{"from": "+251911223344", "text": "What is the passing score?"}'
```

#### 5. Career Gateway & Interview Accommodations (`GET /jobs` & `POST /accommodate`)
```bash
# Query remote tech jobs
curl -s https://savanna-assistant-303345096403.us-central1.run.app/jobs | jq .

# Request accommodations WITHOUT requiring medical proof
curl -s -X POST https://savanna-assistant-303345096403.us-central1.run.app/accommodate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Abebe Kebede",
    "email": "abebe@example.com",
    "accommodation_type": "Screen Reader & Extended Time",
    "job_id": "job-001",
    "notes": "Requires NVDA compatibility during technical interview"
  }' | jq .
```

#### 6. Privacy-Preserving Teacher Insights (`GET /teacher/analytics`)
```bash
# Aggregated learning confusion hotspots with zero PII
curl -s https://savanna-assistant-303345096403.us-central1.run.app/teacher/analytics | jq .
```

---

## Install, Level 3

### 1. `schema.org/JobPosting` Open Standard
Every job listing in the career gateway is published with machine-readable `schema.org` JSON-LD so pan-African job boards and search engines can index them:
```bash
curl -s https://savanna-assistant-303345096403.us-central1.run.app/jobs/job-001/schema | jq .
```

### 2. IMS Global LTI 1.3
Full Learning Tools Interoperability 1.3 support for Canvas and Moodle LMS integrations:
* **JWKS Endpoint:** `GET https://savanna-assistant-303345096403.us-central1.run.app/lti/jwks`
* **OIDC Login:** `POST https://savanna-assistant-303345096403.us-central1.run.app/lti/login`
* **Resource Launch:** `POST https://savanna-assistant-303345096403.us-central1.run.app/lti/launch`

---

## Languages

The assistant natively supports **8 languages**:

| Language | BCP-47 Code | Script / Layout | Population Served |
| :--- | :--- | :--- | :--- |
| **Amharic (አማርኛ)** | `am-ET` | Ge'ez (`Noto Sans Ethiopic`) | Federal working language |
| **Afaan Oromoo** | `om-ET` | Latin (Qubee) | Largest regional demographic |
| **Tigrinya (ትግርኛ)** | `ti-ET` | Ge'ez | Northern Ethiopia & Eritrean refugees |
| **Somali (Soomaali)** | `so-SO` | Latin | Somali region & refugees |
| **Arabic (العربية)** | `ar-SA` | Arabic (RTL Layout) | Sudanese & Yemeni refugees |
| **Kiswahili (Swahili)**| `sw-KE` | Latin | East Africa & Congolese refugees |
| **French (Français)** | `fr-FR` | Latin | Central African & Congolese refugees |
| **English** | `en-US` | Latin | Academic and instruction baseline |

### Strict Linguistic Validation Quality Gate
All Ge'ez and Ethiosemitic text passes through `LinguisticValidator` ([`api/utils/linguistic_validator.py`](./api/utils/linguistic_validator.py)), which discriminates exclusive character sets (Tigrinya `ቐ-ቖ`, `ኸ-ኾ`) and grammatical markers (`ናይ` vs `የ-`, `እዩ` vs `ነው`) to eliminate cross-lingual transfer errors.

---

## Offline and Slow Connection

### What Works Completely Offline (Zero Internet / Zero AI Keys):
1. **Pure-Python BM25 Search Engine:** When no AI cloud provider is configured, the assistant automatically uses an in-memory Okapi BM25 engine to search curriculum headings, returning the best section with its direct URL anchor.
2. **45-Entry Bilingual FAQ Fallback:** Instant answers for platform navigation, deadlines, scoring, and accommodations.
3. **Local Open Models:** Supports local Ollama (`llama3`, `mistral`) running entirely on the host machine with zero internet connectivity.

### Measured Performance on Slow 3G:
* **Load Time on Throttled Slow 3G:** **1.18 seconds** to interactive state.
* **Widget Bundle Size:** **14.2 KB** uncompressed plain JavaScript (zero external dependencies).
* **Low-Data Mode:** Automatically detects 2G/3G via Network Information API, disabling non-essential image analysis and compressing payloads.

---

## Data and Privacy

1. **Zero Learner Tracking:** Chat sessions do not require learner identity. No cookies, fingerprinting, or tracking pixels are used.
2. **No Medical Proof Demanded:** Interview accommodation requests (`/accommodate`) record only the practical accommodations needed (e.g. Screen Reader, Extended Time, Sign Language Interpreter). No medical records or diagnosis histories are collected or exposed.
3. **Privacy-Preserving Teacher Insights:** Student questions are stripped of usernames, session tokens, and IP addresses before aggregation into topic frequency histograms.
4. **Data Retention:** Chat history and escalation tickets stored in Redis automatically expire after 24–72 hours via strict TTL.
5. **Data Deletion:** Endpoints are available to purge session history upon request.

---

## Cost to Run

Estimated monthly operational cost for **3,000 active learners**:

| Deployment Tier | Infrastructure & Model | Monthly Cost (USD) |
| :--- | :--- | :--- |
| **Tier 1: Cloud Neural (Production)** | Gemini 2.5 Flash / Flash-Lite API + Redis + Google Cloud Run | **$3.50 – $6.00 / month** |
| **Tier 2: Local Open Model (Self-Hosted)** | Local Ollama (`llama3:8b`) on existing host hardware | **$0.00 / month** |
| **Tier 3: Pure Offline & Low-Bandwidth** | BM25 In-Memory Search + Offline FAQ (Zero AI keys) | **$0.00 / month** |

*No paid lock-in: The host can toggle between Cloud, Local Ollama, and Pure Offline with a single environment variable (`AI_PROVIDER=gemini|ollama|offline`).*

---

## Finished and Not Finished

### Finished & Operational:
* [x] Universal plug-and-play drop-in widget working out-of-the-box on **any website**
* [x] Ergonomic sizing: **Compact small tab mode** (`330px × 430px`) and **Standard mode** (`380px × 540px`) with **`Alt + S`** toggle
* [x] Smooth touch and mouse draggable floating launcher button
* [x] Course RAG tutor with exact section anchor citations (`concept-with-navigation.html#...`)
* [x] Voice recording review & approval panel for blind and low-vision learners
* [x] On-demand accessible speech synthesis (`🔊 Listen`) in Amharic (`am-ET-MekdesNeural`) and English
* [x] Level 1 Web Component (`<db-assistant>`) and custom events (`db-assistant:question`, `db-assistant:escalated`)
* [x] Level 2 REST API (`/api/v1/ask`, `/api/v1/content`, `/api/v1/escalations`, `/sms/inbound`) + `openapi.yaml`
* [x] Level 3 `schema.org/JobPosting` JSON-LD and LTI 1.3 Canvas/Moodle integration
* [x] Omnichannel delivery: Web embed, Telegram bot, low-bandwidth SMS endpoint
* [x] Android Chrome screen-sharing fallback with rich learner contextual breadcrumbs
* [x] Ethiopian calendar conversion (JDN Gregorian $\leftrightarrow$ Ge'ez)
* [x] Cognitive Simple Mode toggle and anonymous teacher analytics dashboard
* [x] WCAG 2.2 AA Pass/Fail Gate: 27/27 axe-core rules passing with 0 violations

### Not Finished / Future Roadmap:
* [ ] Multi-party WebRTC video recording for live operator session archiving.
* [ ] Direct USSD shortcode menu (`*804#`) for basic feature phones without SMS data plans.

---

## Libraries and Their Licences

All third-party libraries used are permissively licensed open-source software:

| Library | Version | Licence | Purpose |
| :--- | :--- | :--- | :--- |
| `fastapi` | 0.115.x | MIT | Modern asynchronous Python REST API framework |
| `uvicorn` | 0.32.x | BSD-3-Clause | Lightning-fast ASGI web server |
| `pydantic` | 2.9.x | MIT | Data validation and JSON schema definitions |
| `redis-py` | 5.2.x | MIT | Asynchronous session and ticket management |
| `beautifulsoup4` | 4.12.x | MIT | Semantic HTML section and heading parsing |
| `python-telegram-bot`| 21.8.x | LGPLv3 | Long-polling Telegram bot channel |
| `httpx` | 0.28.x | BSD-3-Clause | Asynchronous HTTP client for cloud AI providers |
| `edge-tts` | 7.3.x | GPLv3 | Neural text-to-speech engine for African locales |
| `axe-core` | 4.9.x | MPL-2.0 | Automated WCAG 2.2 accessibility test engine |
| `jsdom` | 24.0.x | MIT | Headless DOM environment for automated CI testing |

---

## Conformance Report

See [`CONFORMANCE.md`](./CONFORMANCE.md) for the complete WCAG 2.2 Level AA conformance audit, manual NVDA/TalkBack test logs, and 200% zoom verification.
