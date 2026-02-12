"""Query Processor - Phase 2 Step 1"""
import re

STOP_WORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "dare", "ought",
    "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "as", "into", "through", "during", "before", "after", "above", "below",
    "between", "out", "off", "over", "under", "again", "further", "then",
    "once", "here", "there", "when", "where", "why", "how", "all", "both",
    "each", "few", "more", "most", "other", "some", "such", "no", "nor",
    "not", "only", "own", "same", "so", "than", "too", "very", "just",
    "don", "now", "and", "but", "or", "if", "while", "that", "which",
    "who", "whom", "this", "these", "those", "what", "i", "me", "my",
    "we", "our", "you", "your", "he", "him", "his", "she", "her", "it",
    "its", "they", "them", "their",
}


def tokenize_query(query: str) -> list:
    words = re.findall(r"\b\w+\b", query.lower())
    return [w for w in words if w not in STOP_WORDS and len(w) > 1]


def detect_intent(query: str) -> str:
    q = query.lower().strip()

    # Definition patterns
    definition_patterns = [
        r"^what is\b", r"^what are\b", r"^define\b", r"^meaning of\b",
        r"^definition of\b", r"^explain\b",
    ]
    for p in definition_patterns:
        if re.search(p, q):
            return "definition"

    # List patterns
    list_patterns = [
        r"^(top|best|worst)\s+\d+", r"\blist of\b", r"\btop\b.*\b(tools|apps|software|products|services)\b",
        r"\bbest\b.*\b(tools|apps|software|products|services|for)\b",
    ]
    for p in list_patterns:
        if re.search(p, q):
            return "list"

    # Comparison patterns
    comparison_patterns = [
        r"\bvs\.?\b", r"\bversus\b", r"\bcompare\b", r"\bcomparison\b",
        r"\bdifference between\b", r"\bbetter than\b", r"\bor\b.*\bwhich\b",
    ]
    for p in comparison_patterns:
        if re.search(p, q):
            return "comparison"

    # Transactional patterns
    transactional_patterns = [
        r"\bbuy\b", r"\bprice\b", r"\bcost\b", r"\bpurchase\b", r"\border\b",
        r"\bdiscount\b", r"\bcheap\b", r"\baffordable\b", r"\bfree trial\b",
        r"\bsubscrib\b", r"\bsign up\b",
    ]
    for p in transactional_patterns:
        if re.search(p, q):
            return "transactional"

    # How-to / informational
    info_patterns = [
        r"^how\b", r"^why\b", r"^when\b", r"^where\b", r"\bguide\b",
        r"\btutorial\b", r"\btips\b", r"\bsteps\b",
    ]
    for p in info_patterns:
        if re.search(p, q):
            return "informational"

    return "informational"  # default
