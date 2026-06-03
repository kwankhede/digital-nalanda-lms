"""Nalanda assistant — rule-based first, AI fallback second."""
from .ai import _gemini

RULES = [
    (("certificate", "certified"), "Certificates are auto-issued when you complete 100% of a course. Find them on your Dashboard under 'My Certificates', where you can download or verify them."),
    (("live", "zoom", "class"), "Upcoming live classes appear on your Dashboard under 'Live Classes'. Click 'Join Zoom' at class time, or 'Add to Calendar' so you don't miss it."),
    (("event", "workshop"), "Browse upcoming events and workshops on the homepage under 'Upcoming Classes & Events'."),
    (("enroll", "join course", "start course"), "Open any course from the Courses page and click 'Enroll for Free'. Then use 'Continue Learning' and mark lessons complete as you go."),
    (("assignment",), "Assignments appear inside your enrolled course lessons. Your mentor reviews and gives feedback."),
    (("teacher", "teach", "creator"), "Want to teach? Go to 'Teach on Digital Nalanda', submit an application, and an admin will review it. Once approved you get a Creator Dashboard."),
    (("counsel", "guidance", "mentor", "help me choose", "career"), "For academic guidance, course selection, or mentorship, open Dashboard → Counselling and submit a request. A mentor will reply."),
    (("password", "login", "reset"), "Use the Login page to sign in. For password issues, contact an admin or use account recovery."),
    (("hello", "hi", "hey", "namaste"), "Namaste! I'm the Nalanda Assistant. Ask me about courses, live classes, certificates, events, or guidance."),
]


def answer(message: str) -> str:
    m = (message or "").lower()
    for keywords, reply in RULES:
        if any(k in m for k in keywords):
            return reply
    ai = _gemini(
        "You are the Nalanda Assistant for a free education platform. Answer "
        f"briefly and helpfully: {message}"
    )
    if ai:
        return ai
    return ("I can help with courses, live classes, certificates, events, "
            "assignments, and academic guidance. Try asking about one of those, "
            "or visit Dashboard → Counselling for mentor support.")
