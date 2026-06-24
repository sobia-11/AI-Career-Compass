"""
nlp_module.py
─────────────────────────────────────────────────────────────────
Shared NLP module for AI Career Compass.

This module is used by BOTH:
  1. career_guidance_v2.ipynb  -> to demonstrate/test the NLP pipeline
  2. app.py (Flask backend)    -> to parse live free-text input from users

It implements a real NLP preprocessing pipeline using NLTK:
  1. Tokenization        (nltk.tokenize.word_tokenize)
  2. Lowercasing & punctuation removal
  3. Stopword removal    (nltk.corpus.stopwords)
  4. Stemming            (nltk.stem.PorterStemmer)
  5. Keyword matching & scoring (Low / Medium / High per skill)

Having one shared module means the notebook and the live Flask app
use the EXACT SAME function — not two separate copies of similar logic.
─────────────────────────────────────────────────────────────────
"""

import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer


# ─── Ensure required NLTK data is available ──────────────────────
# These downloads only happen once; after the first successful run,
# NLTK caches the data locally and skips re-downloading.
def _ensure_nltk_data():
    required = [
        ("tokenizers/punkt", "punkt"),
        ("tokenizers/punkt_tab", "punkt_tab"),
        ("corpora/stopwords", "stopwords"),
    ]
    for path, pkg_name in required:
        try:
            nltk.data.find(path)
        except LookupError:
            try:
                nltk.download(pkg_name, quiet=True)
            except Exception as e:
                raise RuntimeError(
                    f"NLTK resource '{pkg_name}' could not be downloaded "
                    f"(no internet connection?). The NLP free-text mode "
                    f"requires this resource. Original error: {e}"
                )


_ensure_nltk_data()

_stop_words = set(stopwords.words("english"))
_stemmer = PorterStemmer()


# ─── Keyword dictionary (raw words, later stemmed) ───────────────
NLP_KEYWORDS_RAW = {
    "math":     ["math", "mathematics", "calculus", "algebra", "statistics",
                 "numbers", "equations", "analytical"],
    "coding":   ["coding", "programming", "code", "python", "javascript", "java",
                 "developer", "software", "github"],
    "creative": ["creative", "design", "art", "graphics", "visual", "aesthetic",
                 "portfolio", "frontend", "beautiful"],
    "comm":     ["communication", "presenting", "talk", "speech", "explain",
                 "writing", "collaborate", "leadership"],
    "logic":    ["logic", "reasoning", "thinking", "problem", "algorithms",
                 "critical", "systematic", "debugging"],
    "tech":     ["technology", "tech", "gadgets", "hardware", "networks",
                 "cybersecurity", "servers", "cloud"],
    "team":     ["teamwork", "team", "group", "collaborate", "together", "hackathon"],
    "problem":  ["problem", "solving", "debugging", "fixing", "challenges",
                 "solutions", "troubleshoot", "puzzles"],
}

# Stem every keyword once at import time, so matching happens at the
# root-word level (e.g. "coding", "coded", "codes" all stem to "code").
NLP_KEYWORDS_STEMMED = {
    skill: set(_stemmer.stem(word) for word in words)
    for skill, words in NLP_KEYWORDS_RAW.items()
}


def preprocess_text(text: str) -> list:
    """
    Standard NLP preprocessing pipeline:
      1. Lowercase the text
      2. Remove punctuation/numbers
      3. Tokenize into words            (NLTK word_tokenize)
      4. Remove stopwords               (NLTK stopwords corpus)
      5. Stem each remaining word       (NLTK PorterStemmer)

    Returns a list of cleaned, stemmed tokens.
    """
    text = text.lower()
    text = re.sub(r"[^a-z\s]", " ", text)           # remove punctuation/digits
    tokens = word_tokenize(text)                     # tokenization
    tokens = [t for t in tokens if t not in _stop_words and len(t) > 1]  # stopwords
    stemmed_tokens = [_stemmer.stem(t) for t in tokens]                  # stemming
    return stemmed_tokens


def parse_nlp_text(text: str) -> dict:
    """
    Convert a free-text student description into skill scores
    (0 = Low, 1 = Medium, 2 = High) using the full NLP pipeline above.

    This is the single source of truth used by both the training
    notebook (for demonstration/testing) and the Flask app (for live
    predictions).
    """
    tokens = preprocess_text(text)

    scores = {}
    for skill, stemmed_keywords in NLP_KEYWORDS_STEMMED.items():
        count = sum(1 for tok in tokens if tok in stemmed_keywords)
        if count == 0:
            scores[skill] = 0
        elif count <= 2:
            scores[skill] = 1
        else:
            scores[skill] = 2
    return scores
