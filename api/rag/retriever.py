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
        ({"ሥራ", "ስራ", "ቨርቹዋል", "ረዳት"}, "virtual assistant remote jobs executive administrative support"),
    ],
    "om": [
        ({"eebba", "eebbaa", "eebbifamuu", "qabxii", "qabxiin", "sadarkaa", "xumuruu", "barbachisu"}, "graduation threshold 70 percent passing score course progress"),
        ({"xumureera", "mallattoo", "mallateessuu"}, "mark as complete navigation panel button progress"),
        ({"yeroo", "boodatti", "hafe", "daangaa"}, "deadline pacing boost behind schedule coordinator"),
        ({"jijjiiruu", "koorsii"}, "switch course dropdown programme"),
        ({"gargaarsa", "mijeeffannaa", "deeggarsa"}, "request accommodation interview live help human operator"),
        ({"hojii", "fageenyaa", "gargaaraa"}, "virtual assistant remote jobs career gateway"),
    ],
    "ti": [
        ({"ምረቓ", "ደረጃ", "ነጥቢ", "ውጽኢት"}, "graduation threshold 70 percent passing score progress"),
        ({"ምዝዛም", "ምልክት", "መልጎም"}, "mark as complete curriculum navigation button"),
        ({"ግዜ", "ደንጒዩ", "ቀነ-ገደብ"}, "deadline pacing boost behind schedule coordinator"),
        ({"ምቕያር", "ትምህርቲ"}, "switch course dropdown programme"),
        ({"ሓገዝ", "ተበጻሕነት", "ምምችቻው"}, "request accommodation interview live help human operator"),
        ({"ስራሕ", "ርሑቕ", "ሓጋዚ"}, "virtual assistant remote jobs career gateway"),
    ],
    "so": [
        ({"qalin", "jabinta", "qalinjabin", "qalinjabinta", "buundo", "buundada", "dhibcaha", "gudubka"}, "graduation threshold 70 percent passing score progress"),
        ({"dhamaystir", "calaamad", "badhan"}, "mark as complete curriculum navigation button"),
        ({"waqtiga", "dib", "u", "dhac"}, "deadline pacing boost behind schedule coordinator"),
        ({"beddel", "koorsada"}, "switch course dropdown programme"),
        ({"caawimaad", "fududayn", "naafada"}, "request accommodation interview live help human operator"),
        ({"shaqo", "fog", "kaaliye"}, "virtual assistant remote jobs career gateway"),
    ],
    "ar": [
        ({"تخرج", "درجة", "نسبة", "اجتياز"}, "graduation threshold 70 percent passing score progress"),
        ({"إكمال", "اكتمال", "علامة", "زر"}, "mark as complete curriculum navigation button"),
        ({"موعد", "نهائي", "تأخر", "جدول"}, "deadline pacing boost behind schedule coordinator"),
        ({"تغيير", "تبديل", "دورة"}, "switch course dropdown programme"),
        ({"مساعدة", "تيسير", "دعم", "تسهيلات"}, "request accommodation interview live help human operator"),
        ({"وظيفة", "عمل", "مساعد", "افتراضي"}, "virtual assistant remote jobs career gateway"),
    ],
    "sw": [
        ({"kuhitimu", "alama", "asilimia", "kufaulu"}, "graduation threshold 70 percent passing score progress"),
        ({"kamilisha", "alama", "kitufe"}, "mark as complete curriculum navigation button"),
        ({"tarehe", "mwisho", "kuchelewa"}, "deadline pacing boost behind schedule coordinator"),
        ({"badilisha", "kozi"}, "switch course dropdown programme"),
        ({"msaada", "makazi", "huduma"}, "request accommodation interview live help human operator"),
        ({"kazi", "mbali", "msaidizi"}, "virtual assistant remote jobs career gateway"),
    ],
    "fr": [
        ({"diplôme", "seuil", "note", "réussite", "pourcentage"}, "graduation threshold 70 percent passing score progress"),
        ({"terminé", "compléter", "bouton"}, "mark as complete curriculum navigation button"),
        ({"délai", "retard", "date", "limite"}, "deadline pacing boost behind schedule coordinator"),
        ({"changer", "cours"}, "switch course dropdown programme"),
        ({"aide", "aménagement", "assistance"}, "request accommodation interview live help human operator"),
        ({"emploi", "travail", "distant", "assistant"}, "virtual assistant remote jobs career gateway"),
    ],
}


def expand_cross_lingual_query(query: str, language: str) -> str:
    """
    Generate an expanded bilingual query representation when non-English queries
    are searched against English course documents.
    """
    if not query or language == "en" or language not in _CROSS_LINGUAL_EXPANSIONS:
        return query

    import re
    tokens = set(re.findall(r"[\w']+", query.lower()))
    additions: list[str] = []

    for term_set, expansion in _CROSS_LINGUAL_EXPANSIONS[language]:
        if tokens & term_set:
            additions.append(expansion)

    if additions:
        return f"{query} {' '.join(additions)}"
    return query


# Module-level singletons — loaded once per process
_embed_model: Any = None
_chroma_client: Any = None
_chroma_path: str | None = None


def _get_embed_model():
    global _embed_model  # noqa: PLW0603
    if _embed_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading retriever embedding model %s …", _EMBED_MODEL_NAME)
            _embed_model = SentenceTransformer(_EMBED_MODEL_NAME)
        except ImportError:
            logger.warning("sentence_transformers not installed; dense retrieval unavailable.")
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
    if model is None or client is None:
        return []

    try:
        collection = client.get_collection(_COLLECTION_NAME)
    except Exception as exc:  # noqa: BLE001
        logger.error("Could not get collection '%s': %s", _COLLECTION_NAME, exc)
        return []

    # Expand query for non-English queries to bridge cross-lingual semantic gap
    effective_query = expand_cross_lingual_query(query, language)

    # multilingual-e5-small expects "query: " prefix for queries
    query_vec = model.encode(f"query: {effective_query}", show_progress_bar=False).tolist()

    where: dict | None = None
    if domain:
        where = {"domain": {"$eq": domain}}

    try:
        results = collection.query(
            query_embeddings=[query_vec],
            n_results=n_results,
            where=where,
            include=["documents", "metadatas", "distances"],
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("ChromaDB query failed: %s", exc)
        return []

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
                "distance": float(dist),
            }
        )

    return output


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

    results = await asyncio.to_thread(
        _retrieve_sync, query, language, chroma_path, n_results, domain
    )
    return results
