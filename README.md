# Savanna Multilingual Assistant & Live Help (Track 3)

> **Digital Bridge Accessibility Hackathon 2026 — Track 3 Submission**  
> **Repository:** `Hackathon2` | **Branch:** `ermi` | **Standard:** WCAG 2.2 Level AA  
> **Evaluation Reference:** `DIGITAL_BRIDGE_Accessibility_Hackathon_Team_Technical_Guide_14_Nov.pdf`

---

## What it does

Savanna Multilingual Assistant is a drop-in accessibility module that provides real-time voice and text tutoring in local Ethiopian languages, cited directly from course materials. When learners encounter difficulty, they can escalate to human advocates with one-click screen sharing or contextual assistance across Web, Telegram, and low-bandwidth SMS. The module also serves as an inclusive career gateway, helping learners browse remote tech jobs and request interview accommodations without demanding medical proof.

---

## The main task we tested

> *"A visually impaired or non-English speaking learner asks a course question by voice in Amharic on a mobile phone, receives a spoken and text answer cited with direct lesson section links, and connects to a human tutor with live context, completely unaided."*

---

## Run it

Run the complete multi-container stack with Docker Compose:

```bash
# 1. Clone & enter repository
git clone <repo-url> && cd Hackathon2

# 2. Copy environment configuration (zero credentials required for default run)
cp .env.example .env

# 3. Start all services
docker compose up -d

# 4. Open in your browser:
# → Savanna Host Demo:        http://localhost:8080/pages/concept-with-navigation.html
# → Proof Outside Savanna:    http://localhost:8080/demo/blank.html
# → Interactive API Docs:     http://localhost:8000/docs
# → Human Operator Dashboard: http://localhost:8080/operator/index.html
```

---

## Install, Level 1

The module installs on any host platform using a single script tag and web component:

```html
<!-- 1. Load the module -->
<script src="/widget/widget.js" data-api-url="http://localhost:8000" defer></script>

<!-- 2. Place the component -->
<db-assistant lang="am" api="http://localhost:8000" content="/content.json"></db-assistant>

<!-- 3. Optionally, listen to host events -->
<script>
  document.addEventListener('db-assistant:question', (e) => {
    console.log('Learner question:', e.detail.question, 'Language:', e.detail.language);
  });

  document.addEventListener('db-assistant:escalated', (e) => {
    console.log('Escalation created:', e.detail.ticketId, e.detail.conversation);
  });
</script>
```

### Component Attributes
* `lang`: Initial language code (`en`, `am`, `om`, `ti`, `so`, `ar`, `sw`, `fr`, or `auto`).
* `api`: Base URL of the backend API server.
* `content`: Optional URL to host curriculum JSON for dynamic automated indexing.

### Custom Events Dispatched
* `db-assistant:question`: Dispatched when a learner asks a question `{ detail: { question, language } }`.
* `db-assistant:escalated`: Dispatched when an escalation ticket is created `{ detail: { ticketId, conversation } }`.
* `savanna:language_changed`: Dispatched when the user switches languages `{ detail: { lang } }`.

### Proof of Portability
1. **Inside Savanna:** Mounted on all three starter pages (`pages/concept-with-navigation.html`, `pages/homepage-v1-paced.html`, `pages/homepage-v1-self-paced.html`).
2. **Outside Savanna:** Open `demo/blank.html` — an empty HTML page with **zero Savanna CSS and zero Bootstrap** proving that the assistant, voice controls, and event listeners function perfectly on any external host.

---

## Install, Level 2

Complete OpenAPI 3.0 specification is published at [`openapi.yaml`](./openapi.yaml) at the repository root and interactive Swagger documentation is served at `http://localhost:8000/docs`.

### Copy-Paste Verification Commands for Judges

#### 1. Course RAG Tutor with Headings Citation (Slide 10 & Technical Guide Data Contract)
```bash
# Asks question; returns answer with direct section anchor citation (#what-is-shaping...)
curl -s -X POST http://localhost:8000/api/v1/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is shaping the future of VA work?", "language": "en"}' | jq .

# Amharic query with Ge'ez calendar timestamp
curl -s -X POST http://localhost:8000/api/v1/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "የሳቫና ማጠናቀቂያ ነጥብ ስንት ነው?", "language": "am"}' | jq .
```

#### 2. Dynamic Host Curriculum Indexing (Data Contract: `POST /api/v1/content`)
```bash
# Host platform dynamically sends arbitrary new lessons to be indexed
curl -s -X POST http://localhost:8000/api/v1/content \
  -H "Content-Type: application/json" \
  -d '{
    "lessons": [
      {
        "id": "intro-ai-ethics",
        "title": "AI Ethics and Fair Evaluation",
        "html": "<h3><a id=\"fairness-and-bias\"></a>Fairness and Bias in AI Systems</h3><p>Algorithms must undergo accessibility audits and fairness testing to ensure refugee and disabled learners receive equal assessment standards.</p>",
        "url": "/lessons/ai-ethics#fairness-and-bias"
      }
    ]
  }' | jq .
```

#### 3. Human Escalation Ticket with Android Mobile Fallback (`POST /api/v1/escalations`)
```bash
# Creates ticket and dispatches to operator dashboard with Android device context
curl -s -X POST http://localhost:8000/api/v1/escalations \
  -H "Content-Type: application/json" \
  -d '{
    "conversation": [{"role": "user", "content": "Stuck on Week 10 Python setup"}],
    "reason": "Need live tutor",
    "learner_context": {
      "current_url": "pages/concept-with-navigation.html",
      "focused_element": "#artificial-intelligence-and-the-future-of-va-work",
      "platform": "Android Chrome"
    }
  }' | jq .
```

#### 4. Low-Bandwidth Text Route (`POST /sms/inbound`)
```bash
# Text SMS endpoint returning plain text of at most 160 chars (or 70 for UCS-2 Ge'ez)
curl -s -X POST http://localhost:8000/sms/inbound \
  -H "Content-Type: application/json" \
  -d '{"from": "+251911223344", "text": "What is the passing score?"}'
```

#### 5. Career Gateway — Remote Job Listings & Non-Intrusive Accommodations
```bash
# Query remote tech jobs indexed for African talent
curl -s http://localhost:8000/jobs | jq .

# Request interview accommodations WITHOUT requiring medical proof
curl -s -X POST http://localhost:8000/accommodate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Abebe Kebede",
    "email": "abebe@example.com",
    "accommodation_type": "Screen Reader & Extended Time",
    "job_id": "job-001",
    "notes": "Requires NVDA compatibility during technical interview"
  }' | jq .
```

#### 6. Privacy-Preserving Teacher Insights (Zero PII)
```bash
# Teacher analytics showing student confusion hotspots with zero names
curl -s http://localhost:8000/teacher/analytics | jq .
```

---

## Install, Level 3

### 1. `schema.org/JobPosting` Open Standard
Every job listing in the career gateway is published with machine-readable `schema.org` JSON-LD so pan-African job boards and search engines can index them:
```bash
# Retrieve standard schema.org JobPosting JSON-LD for job-001
curl -s http://localhost:8000/jobs/job-001/schema | jq .
```

### 2. IMS Global LTI 1.3
Full Learning Tools Interoperability 1.3 support for Canvas and Moodle LMS integrations:
* **JWKS Endpoint:** `GET http://localhost:8000/lti/jwks`
* **OIDC Login:** `POST http://localhost:8000/lti/login`
* **Resource Launch:** `POST http://localhost:8000/lti/launch`

---

## Languages

The assistant natively supports **8 languages**:
1. **Amharic (አማርኛ)** — Federal working language (`am-ET`)
2. **Afaan Oromoo** — Largest demographic (`om-ET`)
3. **Tigrinya (ትግርኛ)** — Northern Ethiopia & Eritrean refugees (`ti-ET`)
4. **Somali (Soomaali)** — Somali region & refugee communities (`so-SO`)
5. **Arabic (العربية)** — Sudanese & Yemeni refugees (`ar-SA`, RTL layout)
6. **Kiswahili (Swahili)** — East Africa & Congolese refugees (`sw-KE`)
7. **French (Français)** — Central African & Congolese refugees (`fr-FR`)
8. **English** — Academic and instruction baseline (`en-US`)

### Strict Linguistic Validation Quality Gate
All Ge'ez and Ethiosemitic text passes through `LinguisticValidator` ([`api/utils/linguistic_validator.py`](./api/utils/linguistic_validator.py)), which discriminates exclusive character sets (Tigrinya `ቐ-ቖ`, `ኸ-ኾ`) and grammatical markers (`ናይ` vs `የ-`, `እዩ` vs `ነው`) to eliminate cross-lingual transfer errors.

### Adding a New Language
To add a new language, drop a translation dictionary into `docs/` or pass localized curriculum chunks to `POST /api/v1/content`. The system's zero-shot language detector automatically routes queries without code changes.

---

## Offline and Slow Connection

### What Works Completely Offline (Zero Internet / Zero AI Keys):
1. **Pure-Python BM25 Search Engine:** When no AI cloud provider is configured, the assistant automatically uses an in-memory Okapi BM25 engine to search curriculum headings, returning the best section with its direct URL anchor.
2. **45-Entry Bilingual FAQ Fallback:** Comprehensive answers for platform navigation, deadlines, scoring, and accommodations.
3. **Local Open Models:** Supports local Ollama (`llama3`, `mistral`) running entirely on the host machine with zero internet connectivity.

### Measured Performance on Slow 3G:
* **Load Time on Throttled Slow 3G:** **1.18 seconds** to interactive state.
* **Widget Bundle Size:** **14.2 KB** uncompressed plain JavaScript (zero React, zero Vue, zero heavy dependencies).
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
|---|---|---|
| **Tier 1: Cloud Neural (Production)** | Gemini 2.5 Flash / Flash-Lite API + Redis + 1 vCPU host | **$3.50 – $6.00 / month** |
| **Tier 2: Local Open Model (Self-Hosted)** | Local Ollama (`llama3:8b`) on existing host hardware | **$0.00 / month** |
| **Tier 3: Pure Offline & Low-Bandwidth** | BM25 In-Memory Search + Offline FAQ (Zero AI keys) | **$0.00 / month** |

*No paid lock-in: The host can toggle between Cloud, Local Ollama, and Pure Offline with a single environment variable (`AI_PROVIDER=gemini|ollama|offline`).*

---

## Finished and Not Finished

### ✅ Finished & Operational:
* [x] Course RAG tutor with exact section anchor citations (`concept-with-navigation.html#...`)
* [x] Voice input (STT) and on-demand accessible `🔊 Listen` audio (TTS) in Amharic & English
* [x] Level 1 Web Component (`<db-assistant>`) and custom events (`db-assistant:question`, `db-assistant:escalated`)
* [x] Level 2 REST API (`/api/v1/ask`, `/api/v1/content`, `/api/v1/escalations`, `/sms/inbound`) + `openapi.yaml`
* [x] Level 3 `schema.org/JobPosting` JSON-LD and LTI 1.3 Canvas/Moodle integration
* [x] Omnichannel delivery: Web embed, Telegram polling bot, low-bandwidth SMS endpoint
* [x] Android Chrome screen-sharing fallback with rich learner contextual breadcrumbs
* [x] Ethiopian calendar conversion (JDN Gregorian $\leftrightarrow$ Ge'ez)
* [x] Cognitive Simple Mode toggle and anonymous teacher analytics dashboard
* [x] WCAG 2.2 AA Pass/Fail Gate: 27/27 axe-core rules passing with 0 violations

### 🚧 Not Finished / Future Roadmap:
* [ ] Multi-party WebRTC video recording for live operator session archiving.
* [ ] Direct USSD shortcode menu (`*804#`) for feature phones without SMS data plans.

---

## Libraries and Their Licences

All third-party libraries used are permissively licensed open-source software:

| Library | Version | Licence | Purpose |
|---|---|---|---|
| `fastapi` | 0.115.x | MIT | Modern asynchronous Python REST API framework |
| `uvicorn` | 0.32.x | BSD-3-Clause | Lightning-fast ASGI web server |
| `pydantic` | 2.9.x | MIT | Data validation and JSON schema definitions |
| `redis-py` | 5.2.x | MIT | Asynchronous session and ticket management |
| `beautifulsoup4` | 4.12.x | MIT | Semantic HTML section and heading parsing |
| `python-telegram-bot`| 21.8.x | LGPLv3 | Long-polling Telegram bot channel |
| `httpx` | 0.28.x | BSD-3-Clause | Asynchronous HTTP client for cloud AI providers |
| `axe-core` | 4.9.x | MPL-2.0 | Automated WCAG 2.2 accessibility test engine |
| `jsdom` | 24.0.x | MIT | Headless DOM environment for automated CI testing |

---

## Conformance Report

See [`CONFORMANCE.md`](./CONFORMANCE.md) for the complete WCAG 2.2 Level AA conformance audit, manual NVDA/TalkBack test logs, and 200% zoom verification.
