"""Vector retrieval from ChromaDB using multilingual-e5-small embeddings."""
from __future__ import annotations

import asyncio
import logging

from typing import Any

logger = logging.getLogger(__name__)

_EMBED_MODEL_NAME = "intfloat/multilingual-e5-small"
_COLLECTION_NAME = "savanna_docs"

# ── Cross-lingual domain concept expansion dictionary ─────────────────────────
# Maps high-frequency intent terms in non-English languages to semantic domain keywords
_CROSS_LINGUAL_EXPANSIONS: dict[str, list[tuple[set[str], str]]] = {
    "am": [
        ({"ማጠናቀቂያ", "ምረቃ", "ደረጃ", "ነጥብ", "ውጤት"}, "graduation threshold 70 percent passing score progress gauge"),
        ({"ማጠናቀቅ", "ምልክት", "ኮንሴፕት"}, "mark as complete curriculum navigation save progress button"),
        ({"ቀነ-ገደብ", "ማለፍ", "የዘገየ"}, "deadline pacing boost slightly behind cohort coordinator"),
        ({"ኮርስ", "መቀየር", "መለወጥ"}, "switch course dropdown programme status"),
        ({"እርዳታ", "አስተባባሪ", "ተደራሽነት", "ማስተካከያ"}, "request accommodation interview live help escalation operator"),
        ({"ሥራ", "ስራ", "ቨርቹዋል", "ረዳት", "ወደፊት"}, "virtual assistant VA remote jobs executive administrative support future industry market growth trends shaping"),
        ({"ፅሁፍ", "መጻፍ", "መግባባት", "ኮሙኒኬሽን"}, "WR 100 fundamentals of effective communication writing technical"),
        ({"አርቲፊሻል", "አርቴፊሻል", "ኢንተለጀንስ", "ሞዴል", "ፕሮምፕት", "አይኤ"}, "artificial intelligence AI future virtual assistant work automated tools AIFW 1 prompting models"),
        ({"ግምገማ", "ፈተና", "ጥያቄዎች"}, "QA Reviews I can make evaluation quizzes projects"),
        ({"ጎግል", "ሺትስ", "ሰንጠረዥ"}, "Google Sheets spreadsheets administrative scheduling tools"),
    ],
    "om": [
        ({"eebba", "eebbaa", "eebbifamuu", "qabxii", "qabxiin", "sadarkaa", "xumuruu", "barbachisu"}, "graduation threshold 70 percent passing score course progress"),
        ({"xumureera", "mallattoo", "mallateessuu"}, "mark as complete navigation panel button progress"),
        ({"yeroo", "boodatti", "hafe", "daangaa"}, "deadline pacing boost behind schedule coordinator"),
        ({"jijjiiruu", "koorsii"}, "switch course dropdown programme"),
        ({"gargaarsa", "mijeeffannaa", "deeggarsa"}, "request accommodation interview live help human operator"),
        ({"hojii", "fageenyaa", "gargaaraa"}, "virtual assistant remote jobs career gateway"),
        ({"barreessuu", "qunnamtii", "dandeettii"}, "WR 100 fundamentals of effective communication writing technical"),
        ({"namtolchee", "ogummaa", "sagantaa"}, "AIFW 1 AI foundations for work prompting models"),
        ({"qorannoo", "qormaata", "gaaffiiwwan"}, "QA Reviews I can make evaluation quizzes projects"),
        ({"waraqaa", "kalandarii", "taliigaa"}, "Google Sheets spreadsheets administrative scheduling tools"),
    ],
    "ti": [
        ({"ምረቓ", "ደረጃ", "ነጥቢ", "ውጽኢት"}, "graduation threshold 70 percent passing score progress"),
        ({"ምዝዛም", "ምልክት", "መልጎም"}, "mark as complete curriculum navigation button"),
        ({"ግዜ", "ደንጒዩ", "ቀነ-ገደብ"}, "deadline pacing boost behind schedule coordinator"),
        ({"ምቕያር", "ትምህርቲ"}, "switch course dropdown programme"),
        ({"ሓገዝ", "ተበጻሕነት", "ምምችቻው"}, "request accommodation interview live help human operator"),
        ({"ስራሕ", "ርሑቕ", "ሓጋዚ"}, "virtual assistant remote jobs career gateway"),
        ({"ጽሕፈት", "ርክብ", "ምይይጥ"}, "WR 100 fundamentals of effective communication writing technical"),
        ({"ሰርሖ-ሰብ", "ሞዴል", "ቴክኖሎጂ"}, "AIFW 1 AI foundations for work prompting models"),
        ({"ገምጋም", "ፈተና", "ሕቶታት"}, "QA Reviews I can make evaluation quizzes projects"),
        ({"ሰሌዳ", "መደብ", "ምሕደራ"}, "Google Sheets spreadsheets administrative scheduling tools"),
    ],
    "so": [
        ({"qalin", "jabinta", "qalinjabin", "qalinjabinta", "buundo", "buundada", "dhibcaha", "gudubka"}, "graduation threshold 70 percent passing score progress"),
        ({"dhamaystir", "calaamad", "badhan"}, "mark as complete curriculum navigation button"),
        ({"waqtiga", "dib", "u", "dhac"}, "deadline pacing boost behind schedule coordinator"),
        ({"beddel", "koorsada"}, "switch course dropdown programme"),
        ({"caawimaad", "fududayn", "naafada"}, "request accommodation interview live help human operator"),
        ({"shaqo", "fog", "kaaliye"}, "virtual assistant remote jobs career gateway"),
        ({"qoraalka", "xiriirka", "isgaarsiinta"}, "WR 100 fundamentals of effective communication writing technical"),
        ({"garaadka", "macmalka", "moodalka"}, "AIFW 1 AI foundations for work prompting models"),
        ({"dib", "u", "eegis", "imtixaan"}, "QA Reviews I can make evaluation quizzes projects"),
    ],
    "ar": [
        ({"تخرج", "درجة", "نسبة", "اجتياز"}, "graduation threshold 70 percent passing score progress"),
        ({"إكمال", "اكتمال", "علامة", "زر"}, "mark as complete curriculum navigation button"),
        ({"موعد", "نهائي", "تأخر", "جدول"}, "deadline pacing boost behind schedule coordinator"),
        ({"تغيير", "تبديل", "دورة"}, "switch course dropdown programme"),
        ({"مساعدة", "تيسير", "دعم", "تسهيلات"}, "request accommodation interview live help human operator"),
        ({"وظيفة", "عمل", "مساعد", "افتراضي"}, "virtual assistant remote jobs career gateway"),
        ({"كتابة", "تواصل", "مهارات"}, "WR 100 fundamentals of effective communication writing technical"),
        ({"ذكاء", "اصطناعي", "نماذج"}, "AIFW 1 AI foundations for work prompting models"),
        ({"مراجعة", "اختبار", "تقييم"}, "QA Reviews I can make evaluation quizzes projects"),
        ({"جداول", "بيانات", "جدولة"}, "Google Sheets spreadsheets administrative scheduling tools"),
    ],
    "sw": [
        ({"kuhitimu", "alama", "asilimia", "kufaulu"}, "graduation threshold 70 percent passing score progress"),
        ({"kamilisha", "alama", "kitufe"}, "mark as complete curriculum navigation button"),
        ({"tarehe", "mwisho", "kuchelewa"}, "deadline pacing boost behind schedule coordinator"),
        ({"badilisha", "kozi"}, "switch course dropdown programme"),
        ({"msaada", "makazi", "huduma"}, "request accommodation interview live help human operator"),
        ({"kazi", "mbali", "msaidizi"}, "virtual assistant remote jobs career gateway"),
        ({"kuandika", "mawasiliano", "ujuzi"}, "WR 100 fundamentals of effective communication writing technical"),
        ({"akili", "mnemba", "modeli"}, "AIFW 1 AI foundations for work prompting models"),
        ({"mapitio", "tathmini", "mitihani"}, "QA Reviews I can make evaluation quizzes projects"),
    ],
    "fr": [
        ({"diplôme", "seuil", "note", "réussite", "pourcentage"}, "graduation threshold 70 percent passing score progress"),
        ({"terminé", "compléter", "bouton"}, "mark as complete curriculum navigation button"),
        ({"délai", "retard", "date", "limite"}, "deadline pacing boost behind schedule coordinator"),
        ({"changer", "cours"}, "switch course dropdown programme"),
        ({"aide", "aménagement", "assistance"}, "request accommodation interview live help human operator"),
        ({"emploi", "travail", "distant", "assistant"}, "virtual assistant remote jobs career gateway"),
        ({"écriture", "communication", "compétences"}, "WR 100 fundamentals of effective communication writing technical"),
        ({"intelligence", "artificielle", "modèle"}, "AIFW 1 AI foundations for work prompting models"),
        ({"revue", "évaluation", "quiz"}, "QA Reviews I can make evaluation quizzes projects"),
    ],
}


def expand_cross_lingual_query(query: str, language: str) -> str:
    """
    Generate an expanded bilingual query representation when non-English queries
    are searched against English course documents.
    Supports morphological prefix stripping (Ethiopic/Amharic/Tigrinya) and
    character normalization for production-grade retrieval resilience.
    """
    if not query or language == "en" or language not in _CROSS_LINGUAL_EXPANSIONS:
        return query

    import re
    raw_tokens = set(re.findall(r"[\w']+", query.lower()))
    tokens = set(raw_tokens)

    # Amharic and Tigrinya morphological prefix stripping & character alternation
    if language in ("am", "ti"):
        for t in list(raw_tokens):
            stem = re.sub(r"^(የ|በ|ለ|ከ|እንደ|ወደ|ስለ|ዝ)", "", t)
            tokens.add(stem)
            tokens.add(stem.replace("ቴ", "ቲ"))
            tokens.add(stem.replace("ቲ", "ቴ"))

    additions: list[str] = []
    for term_set, expansion in _CROSS_LINGUAL_EXPANSIONS[language]:
        if tokens & term_set:
            additions.append(expansion)

    if additions:
        return f"{query} {' '.join(additions)}"
    return query


async def expand_cross_lingual_query_async(query: str, language: str) -> str:
    """
    Dynamically translate or project non-English queries into English using
    Gemini MT, with automatic fallback to morphological lexical expansion.
    Enables zero-hardcoding semantic retrieval for arbitrary learner questions.
    """
    if not query or language == "en":
        return query

    # 1. Attempt dynamic AI machine translation for deep query understanding
    try:
        from routers.translate import translate_texts_with_gemini
        trans_res = await translate_texts_with_gemini([query], target_lang="en", source_lang=language)
        if trans_res and query in trans_res:
            translated_en = trans_res[query].strip()
            if translated_en and translated_en.lower() != query.lower():
                logger.info("Dynamic cross-lingual query translation [%s -> en]: '%s' -> '%s'", language, query, translated_en)
                # Combine original query + translated English representation
                return f"{query} {translated_en}"
    except Exception as exc:
        logger.debug("Dynamic query translation unavailable (%s), falling back to morphological expansion.", exc)

    # 2. Heuristic morphological fallback expansion for offline mode
    return expand_cross_lingual_query(query, language)


# Module-level singletons — loaded once per process
_embed_model: Any = None
_chroma_client: Any = None
_chroma_path: str | None = None


def _get_embed_model():
    global _embed_model  # noqa: PLW0603
    if _embed_model is None:
        import os
        if os.getenv("DISABLE_DENSE_EMBEDDINGS", "").lower() in ("true", "1", "yes") or os.getenv("RENDER"):
            logger.info("Low-memory environment detected; using pure-Python BM25 semantic retrieval to preserve RAM.")
            return None
        for path in ['/sys/fs/cgroup/memory.max', '/sys/fs/cgroup/memory/memory.limit_in_bytes']:
            try:
                with open(path) as f:
                    val = f.read().strip()
                    if val != 'max' and int(val) < 1024 * 1024 * 1024:
                        logger.info("Cgroup limit < 1GB; using pure-Python BM25 to prevent container OOM.")
                        return None
            except Exception:
                pass
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading retriever embedding model %s …", _EMBED_MODEL_NAME)
            _embed_model = SentenceTransformer(_EMBED_MODEL_NAME)
        except (ImportError, Exception) as exc:
            logger.warning("sentence_transformers unavailable (%s); dense retrieval falling back to BM25.", exc)
            return None
    return _embed_model


def _get_chroma_client(chroma_path: str):
    global _chroma_client, _chroma_path  # noqa: PLW0603
    if _chroma_client is None or _chroma_path != chroma_path:
        try:
            import chromadb
            logger.info("Connecting to ChromaDB at %s …", chroma_path)
            _chroma_client = chromadb.PersistentClient(path=chroma_path)
            _chroma_path = chroma_path
        except ImportError:
            logger.warning("chromadb not installed; vector store unavailable.")
            return None
    return _chroma_client


# ─── Lightweight Pure-Python BM25 Course Indexer & Fallback ───────────────────
_BM25_INDEX: dict[str, Any] | None = None


def _build_bm25_corpus() -> dict[str, Any]:
    """
    Build an in-memory Okapi BM25 index over actual curriculum and course documents.
    Operates with zero heavy ML dependencies (no PyTorch, no ChromaDB).
    """
    import math
    import json
    import re
    from pathlib import Path
    from bs4 import BeautifulSoup

    base_dir = Path(__file__).parent.parent.parent
    docs_dir = base_dir / "docs"
    pages_dir = base_dir / "pages"

    chunks: list[dict[str, str]] = []

    def _strip_html(html_str: str) -> str:
        soup = BeautifulSoup(html_str, "html.parser")
        for tag in soup(["script", "style", "noscript", "meta", "head"]):
            tag.decompose()
        return " ".join(soup.get_text().split())

    def _chunk(text: str, size: int = 450, overlap: int = 50) -> list[str]:
        res = []
        start = 0
        while start < len(text):
            seg = text[start : start + size].strip()
            if seg:
                res.append(seg)
            start += size - overlap
        return res

    from rag.ingest import extract_semantic_sections

    # 1. Index course HTML pages from pages/
    if pages_dir.exists():
        for html_file in sorted(pages_dir.glob("*.html")):
            try:
                raw_html = html_file.read_text(encoding="utf-8", errors="replace")
                secs = extract_semantic_sections(raw_html, html_file.name, "course")
                for sec in secs:
                    sec_chunks = _chunk(sec["text"])
                    anchor_id = sec.get("anchor", "")
                    for idx, c in enumerate(sec_chunks):
                        cid = f"{html_file.stem}_{anchor_id or idx}" if idx == 0 and anchor_id else f"{html_file.stem}_{idx}"
                        chunks.append({
                            "id": cid,
                            "text": c,
                            "source": sec["source"],
                            "title": sec.get("title", html_file.stem),
                            "url": sec.get("url", f"pages/{html_file.name}"),
                            "domain": "course",
                        })
            except Exception as exc:
                logger.warning("BM25: error reading page %s: %s", html_file, exc)

    # 2. Index course-content in docs/course-content/ if present
    cc_dir = docs_dir / "course-content"
    if cc_dir.exists():
        for html_file in sorted(cc_dir.rglob("*.html")):
            try:
                raw_html = html_file.read_text(encoding="utf-8", errors="replace")
                secs = extract_semantic_sections(raw_html, html_file.name, "course")
                for sec in secs:
                    sec_chunks = _chunk(sec["text"])
                    anchor_id = sec.get("anchor", "")
                    for idx, c in enumerate(sec_chunks):
                        cid = f"cc_{html_file.stem}_{anchor_id or idx}" if idx == 0 and anchor_id else f"cc_{html_file.stem}_{idx}"
                        chunks.append({
                            "id": cid,
                            "text": c,
                            "source": sec["source"],
                            "title": sec.get("title", html_file.stem),
                            "url": sec.get("url", f"pages/{html_file.name}"),
                            "domain": "course",
                        })
            except Exception as exc:
                logger.warning("BM25: error reading course-content %s: %s", html_file, exc)

    # 3. Index job listings from docs/jobs/jobs.json
    jobs_file = docs_dir / "jobs" / "jobs.json"
    if jobs_file.exists():
        try:
            jobs_data = json.loads(jobs_file.read_text(encoding="utf-8"))
            if isinstance(jobs_data, list):
                for job in jobs_data:
                    parts = [
                        job.get("title", ""),
                        job.get("company", ""),
                        job.get("location", ""),
                        job.get("type", ""),
                        job.get("description", ""),
                        "Skills: " + ", ".join(job.get("skills", [])),
                    ]
                    for t in job.get("translations", {}).values():
                        parts.append(t.get("title", ""))
                        parts.append(t.get("description", ""))
                    job_text = " | ".join(p for p in parts if p)
                    chunks.append({
                        "id": f"job_{job.get('id', 'unk')}",
                        "text": job_text,
                        "source": f"jobs:{job.get('id', 'unknown')}",
                        "title": job.get("title", "Remote Tech Job"),
                        "url": f"/jobs/{job.get('id', '')}",
                        "domain": "jobs",
                    })
        except Exception as exc:
            logger.warning("BM25: error reading jobs.json: %s", exc)

    doc_tokens: list[list[str]] = [re.findall(r"[\w']+", c["text"].lower()) for c in chunks]
    doc_lens: list[int] = [len(dt) for dt in doc_tokens]
    N = len(chunks)
    avgdl = (sum(doc_lens) / N) if N > 0 else 1.0

    df: dict[str, int] = {}
    for dt in doc_tokens:
        for w in set(dt):
            df[w] = df.get(w, 0) + 1

    idf: dict[str, float] = {
        w: math.log((N - freq + 0.5) / (freq + 0.5) + 1.0)
        for w, freq in df.items()
    }

    logger.info("BM25 index initialized with %d curriculum chunks.", N)
    return {
        "chunks": chunks,
        "doc_tokens": doc_tokens,
        "doc_lens": doc_lens,
        "N": N,
        "avgdl": avgdl,
        "idf": idf,
    }


def _retrieve_bm25_sync(
    query: str,
    language: str,
    n_results: int = 5,
    domain: str | None = None,
) -> list[dict]:
    """
    Search curriculum chunks using Okapi BM25 with cross-lingual expansion.
    """
    global _BM25_INDEX
    if _BM25_INDEX is None:
        _BM25_INDEX = _build_bm25_corpus()

    chunks = _BM25_INDEX["chunks"]
    doc_tokens = _BM25_INDEX["doc_tokens"]
    doc_lens = _BM25_INDEX["doc_lens"]
    N = _BM25_INDEX["N"]
    avgdl = _BM25_INDEX["avgdl"]
    idf = _BM25_INDEX["idf"]

    if N == 0:
        return []

    import re
    effective_query = expand_cross_lingual_query(query, language)
    q_tokens = re.findall(r"[\w']+", effective_query.lower())
    if not q_tokens:
        return []

    k1 = 1.5
    b = 0.75
    scores: list[tuple[float, int]] = []

    for i, dt in enumerate(doc_tokens):
        if domain and chunks[i].get("domain") != domain:
            continue

        score = 0.0
        tf_dict: dict[str, int] = {}
        for w in dt:
            tf_dict[w] = tf_dict.get(w, 0) + 1

        for qw in q_tokens:
            if qw in tf_dict:
                tf = tf_dict[qw]
                cur_idf = idf.get(qw, 0.0)
                denom = tf + k1 * (1.0 - b + b * (doc_lens[i] / avgdl))
                score += cur_idf * (tf * (k1 + 1.0)) / denom

        if score > 0.5:
            scores.append((score, i))

    scores.sort(key=lambda s: s[0], reverse=True)

    results: list[dict] = []
    for score, idx in scores[:n_results]:
        c = chunks[idx]
        results.append({
            "id": c["id"],
            "text": c["text"],
            "source": c["source"],
            "title": c.get("title", c["source"]),
            "url": c.get("url", f"pages/{c['source']}"),
            "distance": round(1.0 / (1.0 + score), 4),
        })

    return results


# ─── Sync retrieval (run via asyncio.to_thread) ───────────────────────────────

def _retrieve_sync(
    query: str,
    language: str,
    chroma_path: str,
    n_results: int,
    domain: str | None,
) -> list[dict]:
    model = _get_embed_model()
    client = _get_chroma_client(chroma_path)
    if model is not None and client is not None:
        try:
            collection = client.get_collection(_COLLECTION_NAME)
            effective_query = expand_cross_lingual_query(query, language)
            query_vec = model.encode(f"query: {effective_query}", show_progress_bar=False).tolist()

            where: dict | None = None
            if domain:
                where = {"domain": {"$eq": domain}}

            results = collection.query(
                query_embeddings=[query_vec],
                n_results=n_results,
                where=where,
                include=["documents", "metadatas", "distances"],
            )

            output: list[dict] = []
            ids_list = results.get("ids", [[]])[0]
            docs_list = results.get("documents", [[]])[0]
            metas_list = results.get("metadatas", [[]])[0]
            distances_list = results.get("distances", [[]])[0]

            for chunk_id, text, meta, dist in zip(
                ids_list, docs_list, metas_list, distances_list
            ):
                output.append(
                    {
                        "id": chunk_id,
                        "text": text,
                        "source": meta.get("source", "unknown"),
                        "title": meta.get("title", meta.get("source", "Course Section")),
                        "url": meta.get("url", f"pages/{meta.get('source', '')}"),
                        "distance": float(dist),
                    }
                )

            if output:
                return output
        except Exception as exc:
            logger.warning("ChromaDB vector query failed, falling back to BM25: %s", exc)

    # Lightweight BM25 Fallback over actual curriculum and documents
    return _retrieve_bm25_sync(query, language, n_results, domain)


# ─── Public async API ─────────────────────────────────────────────────────────

async def retrieve(
    query: str,
    language: str = "en",
    chroma_path: str | None = None,
    n_results: int = 5,
    domain: str | None = None,
) -> list[dict]:
    """
    Embed *query* and retrieve the top *n_results* matching chunks.

    Parameters
    ----------
    query       : User query string (English or Amharic).
    language    : "en" or "am" — reserved for future language-aware filtering.
    chroma_path : Path to the ChromaDB persistent storage directory (optional, defaults to config).
    n_results   : Number of chunks to return.
    domain      : Optional filter — "course" or "jobs".

    Returns
    -------
    List of dicts: {"id": str, "text": str, "source": str, "distance": float}
    Sorted by ascending distance (most relevant first).
    """
    if not query.strip():
        return []

    if not chroma_path:
        from config import get_settings
        chroma_path = get_settings().chroma_path

    effective_query = await expand_cross_lingual_query_async(query, language)
    results = await asyncio.to_thread(
        _retrieve_sync, effective_query, language, chroma_path, n_results, domain
    )
    return results
