"""OpenAI-backed AI provider using AsyncOpenAI."""
from __future__ import annotations

import logging
import re
from typing import TYPE_CHECKING

import openai

from ai.provider import AIProvider
from models import ChatMessage, Citation

if TYPE_CHECKING:
    from config import Settings

logger = logging.getLogger(__name__)

_LANGUAGE_NAMES: dict[str, str] = {
    "en": "English",
    "am": "Amharic (አማርኛ)",
    "om": "Afaan Oromo (Afaan Oromoo)",
    "ti": "Tigrinya (ትግርኛ)",
    "so": "Somali (Soomaali)",
    "ar": "Arabic (العربية)",
    "sw": "Kiswahili (Swahili)",
    "fr": "French (Français)",
}

def get_system_prompt(language: str, simple_mode: bool = False) -> str:
    lang_name = _LANGUAGE_NAMES.get(language, "English")
    prompt = (
        f"You are a helpful multilingual learning assistant for Savanna, an online learning platform "
        f"serving Ethiopian and regional refugee learners (including Eritrean, Sudanese, Somali, and Congolese learners). "
        f"You MUST respond fluently and naturally in {lang_name}. "
        f"Answer from the provided course content or the active lesson on the learner's screen. "
        f"When the learner asks about a concept, term, or highlighted text from their lesson, explain it clearly and pedagogically. "
        f"If the answer is neither in the provided content nor in the active lesson, state clearly in {lang_name} that the course material does not mention it, and do not include any citation markers. "
        f"When answering from course content chunks, always cite your sources using [source_id] notation corresponding to the course chunks provided. "
        f"Do not make up information or answer questions outside the course curriculum.\n\n"
        f"CRITICAL TERMINOLOGY & ENTITY PRESERVATION RULES:\n"
        f"1. Do NOT translate technical acronyms, tool names, coding terms, or proper nouns into literal words.\n"
        f"2. Always preserve technical acronyms, course codes, software tools, metrics, percentages (e.g. '70%'), proper institution/organization names, and URLs in their standard professional notation (e.g. 'Virtual Assistant', 'VA', 'Pull Request', 'Git', 'GitHub', 'HTML', 'CSS', 'JavaScript', 'Python', 'CRM', 'QA Review', etc.).\n"
        f"3. When explaining a technical concept in {lang_name}, provide the natural pedagogical explanation in {lang_name} "
        f"while retaining the standard industry term in English (e.g. 'Gabaasa qorannoo (QA Review)' in Oromo or "
        f"'የጥራት ማረጋገጫ ግምገማ (QA Review)' in Amharic).\n\n"
        f"INTERACTIVE QUIZ GENERATION RULES:\n"
        f"When the learner asks for a quiz, test, practice questions, or to test their understanding (e.g. 'quiz me', 'quiz', 'test', 'ፈትነኝ', 'ጥያቄ አዘጋጅልኝ', 'ፈተና', 'gaaffilee qopheessi', 'quiz me on this page'):\n"
        f"1. Generate between 5 and 10 multiple-choice questions grounded directly in the active lesson content on their screen or provided curriculum.\n"
        f"2. Each question must test a meaningful concept, definition, tool, rule, or practical skill from the lesson.\n"
        f"3. Provide exactly 4 distinct, plausible answer choices for each question, with exactly ONE correct answer.\n"
        f"4. Provide a supportive, pedagogical explanation in {lang_name} explaining WHY the correct option is right.\n"
        f"5. You MUST output the quiz inside a valid JSON block enclosed strictly within [QUIZ] and [/QUIZ] tags so the interactive UI can render it. Schema:\n"
        f"[QUIZ]\n"
        f"{{\n"
        f'  "title": "Quiz: <Lesson / Topic Title>",\n'
        f'  "questions": [\n'
        f"    {{\n"
        f'      "id": 1,\n'
        f'      "question": "Question text in {lang_name}?",\n'
        f'      "options": ["Choice A", "Choice B", "Choice C", "Choice D"],\n'
        f'      "answer": 0,\n'
        f'      "explanation": "Clear pedagogical explanation in {lang_name}."\n'
        f"    }}\n"
        f"  ]\n"
        f"}}\n"
        f"[/QUIZ]\n"
        f"Provide between 5 and 10 questions in the questions array. "
        f"You may precede the [QUIZ] block with a brief 1-line encouraging greeting in {lang_name}."
    )
    if simple_mode:
        prompt += (
            f"\n\n[SIMPLE MODE ACTIVATED] Use very plain, simple words in {lang_name}. "
            f"Keep sentences short (under 12 words). Avoid convoluted sentence structures so non-native speakers "
            f"and low-literacy learners can easily understand."
        )
    return prompt

_CITATION_RE = re.compile(r"\[([^\]]+)\]")


def _build_context_block(context_chunks: list[dict], page_context: dict | None = None) -> str:
    """Format RAG chunks and live lesson page context into a readable context block."""
    lines: list[str] = []

    if page_context and isinstance(page_context, dict):
        lines.append("=== Active Lesson on Learner's Screen ===")
        if page_context.get("title"):
            lines.append(f"Lesson Title: {page_context['title']}")
        if page_context.get("active_heading"):
            lines.append(f"Current Topic / Heading: {page_context['active_heading']}")
        if page_context.get("selected_text"):
            lines.append(f"Learner Highlighted Text: \"{page_context['selected_text']}\"")
        if page_context.get("summary"):
            lines.append(f"Lesson Excerpt:\n{page_context['summary']}")
        lines.append("---")

    if context_chunks:
        lines.append("=== Provided course content ===")
        for chunk in context_chunks:
            lines.append(f"[{chunk['id']}] (source: {chunk['source']})\n{chunk['text']}")
            lines.append("---")

    if not lines:
        return "No additional context available."
    return "\n".join(lines)


def _extract_citations(
    response_text: str, context_chunks: list[dict]
) -> list[Citation]:
    """Parse [chunk_id] references from the response and map to chunks."""
    chunk_map = {c["id"]: c for c in context_chunks}
    seen: set[str] = set()
    citations: list[Citation] = []
    for match in _CITATION_RE.finditer(response_text):
        ref = match.group(1)
        if ref in chunk_map and ref not in seen:
            seen.add(ref)
            c = chunk_map[ref]
            citations.append(
                Citation(
                    id=ref,
                    source=c["source"],
                    excerpt=c["text"][:200],
                    url=c.get("url"),
                    title=c.get("title", c["source"]),
                )
            )
    return citations


class OpenAIProvider(AIProvider):
    def __init__(self, settings: "Settings") -> None:
        self._settings = settings
        self._client = openai.AsyncOpenAI(api_key=settings.openai_api_key)

    @property
    def name(self) -> str:
        return "openai"

    async def chat(
        self,
        message: str,
        language: str,
        context_chunks: list[dict],
        history: list[ChatMessage],
        simple_mode: bool = False,
        page_context: dict | None = None,
    ) -> tuple[str, list[Citation]]:
        system_prompt = get_system_prompt(language, simple_mode)
        context_block = _build_context_block(context_chunks, page_context=page_context)

        messages: list[dict] = [
            {"role": "system", "content": system_prompt},
            # Inject the RAG context as a user message so it's always visible
            {
                "role": "user",
                "content": f"Here is the relevant content to answer from:\n\n{context_block}",
            },
            {"role": "assistant", "content": "Understood. I will answer only from the provided content."},
        ]

        # Append conversation history
        for msg in history:
            messages.append({"role": msg.role, "content": msg.content})

        # Append the current user query
        messages.append({"role": "user", "content": message})

        try:
            response = await self._client.chat.completions.create(
                model=self._settings.openai_model,
                messages=messages,  # type: ignore[arg-type]
                temperature=0.2,
                max_tokens=1024,
            )
            text = response.choices[0].message.content or ""
            citations = _extract_citations(text, context_chunks)
            return text, citations
        except openai.AuthenticationError as exc:
            logger.error("OpenAI authentication error: %s", exc)
            return "⚠️ AI service authentication failed. Please check the API key.", []
        except openai.RateLimitError as exc:
            logger.warning("OpenAI rate limit hit: %s", exc)
            return "⚠️ AI service is busy. Please try again in a moment.", []
        except openai.APIConnectionError as exc:
            logger.error("OpenAI connection error: %s", exc)
            return "⚠️ Could not reach the AI service. Please check your connection.", []
        except Exception as exc:  # noqa: BLE001
            logger.exception("Unexpected error from OpenAI: %s", exc)
            return f"⚠️ An unexpected error occurred: {exc}", []
