"""AI assistant service. Uses Google Gemini if GEMINI_API_KEY is set; otherwise
falls back to a deterministic template so the feature always works in dev.
The API key lives only in settings/env and is never returned to clients.
AI output is suggestion-only — it never auto-publishes."""
import json
import urllib.request

from django.conf import settings

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-1.5-flash:generateContent?key={key}"
)


def _gemini(prompt: str) -> str | None:
    key = getattr(settings, "GEMINI_API_KEY", "")
    if not key:
        return None
    try:
        body = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode()
        req = urllib.request.Request(
            GEMINI_URL.format(key=key), data=body,
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read())
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        return None


def course_summary(title: str, description: str) -> dict:
    prompt = (
        f"You are helping a teacher. For the course titled '{title}' with "
        f"description: {description}\nReturn JSON with keys short_summary, "
        f"long_summary, learning_outcomes (list), key_takeaways (list), "
        f"prerequisites (list), who_should_take (list), seo_description."
    )
    raw = _gemini(prompt)
    if raw:
        try:
            cleaned = raw.strip().strip("`").replace("json\n", "", 1)
            return {"source": "gemini", **json.loads(cleaned)}
        except Exception:
            return {"source": "gemini", "short_summary": raw[:280], "long_summary": raw}
    # Template fallback (no key / offline)
    base = description or title
    return {
        "source": "template",
        "short_summary": f"{title}: {base[:160]}",
        "long_summary": f"This course, {title}, covers: {base}. Learners build practical, real-world skills through structured lessons.",
        "learning_outcomes": [f"Understand the core concepts of {title}", "Apply skills to real examples", "Build confidence in the subject"],
        "key_takeaways": ["Foundational understanding", "Practical application", "Readiness for next steps"],
        "prerequisites": ["No prior experience required"],
        "who_should_take": ["Students", "Beginners", "Anyone curious about " + title],
        "seo_description": f"Learn {title} free on Digital Nalanda. {base[:120]}",
    }


def lesson_summary(title: str, content: str) -> dict:
    prompt = (
        f"For the lesson '{title}' with content: {content}\nReturn JSON with keys "
        f"summary, key_concepts (list), suggested_quiz_questions (list), "
        f"suggested_assignments (list)."
    )
    raw = _gemini(prompt)
    if raw:
        try:
            cleaned = raw.strip().strip("`").replace("json\n", "", 1)
            return {"source": "gemini", **json.loads(cleaned)}
        except Exception:
            return {"source": "gemini", "summary": raw[:280]}
    base = content or title
    return {
        "source": "template",
        "summary": f"{title}: {base[:180]}",
        "key_concepts": [f"Main idea of {title}", "Supporting detail", "Practical example"],
        "suggested_quiz_questions": [f"What is the main point of {title}?", "Give one real-world example."],
        "suggested_assignments": [f"Write a short reflection on {title}."],
    }
