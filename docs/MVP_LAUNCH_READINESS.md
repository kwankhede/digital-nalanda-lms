# MVP Launch Readiness Report — Digital Nalanda LMS

_Status as of this sprint. Backend `manage.py check` clean, no missing
migrations, frontend `tsc --noEmit` clean across 15 Django apps._

## 1. Completed features

**Learning core (≈100%)**
Courses (category/module/lesson), enrollments, lesson progress with
auto-completion, certificates (auto-issued PDF + QR + public verification +
owner-only download).

**Teacher platform (≈95%)**
Teacher application → admin approval → role elevation; course governance
(draft → submitted → approved → published, reject-to-edit, archive); visual
course builder (tabbed studio, chapter/lesson tree, reorder/move/duplicate,
autosave, stats, device preview, validated submit); Notion-style block lesson
builder; AI summary assistant (Gemini + template fallback, suggestion-only).

**Student experience (≈90%)**
Dashboard (courses, progress, certificates, live classes), block content
rendering, live-class calendar (ICS/Google/Outlook), **notifications**
(bell + unread badge + `/notifications` center + triggers), counselling/guidance,
Nalanda chatbot.

**Community features (≈45%)**
Stories, schools, educators, community-library content, **announcements**
(audience-targeted banner). Discussions, event registration, volunteer module
still pending (see §2).

**Operations / admin (≈90%)**
Admin Dashboard V2 (metrics + CSV export), course review center, creator
application review, counselling queue, audit log, CSV import system, Django
admin for all 15 apps, role-based access + route guards + `/unauthorized`.

## 2. Remaining enhancements (this sprint's un-built phases)

| Phase | Feature | Size | Status |
|-------|---------|------|--------|
| 1 | Course versioning (working draft vs published + diff/rollback) | Large | Not started (flagship gap) |
| 4 | Assignments & submissions + grading | Medium | Not started |
| 5 | Discussions & community (boards/threads/comments) | Medium | Not started |
| 6 | Event registration + attendance reports | Medium | Not started |
| 7 | Student analytics (aggregate metrics) | Small–Med | Partial (basic stats in admin) |
| 8 | Volunteer management | Medium | Not started (role exists) |
| 9 | Community library platform (models/pages) | Medium | Partial (content cards only) |
| 10 | Reporting & exports (beyond newsletter CSV) | Small | Partial |
| 11 | Admin Dashboard V3 (new module widgets) | Small | Incremental |
| — | Advanced layout blocks; `/donate`, `/about` pages | Small | Not started |

## 3. Known risks

- **No course versioning yet** — editing a published course isn't separated from
  the live version. Mitigation: current workflow keeps only `status=published`
  public; teachers edit drafts/rejected. Build Phase 1 before heavy teacher load.
- **Rate limiting not enabled** — DRF throttling is prepared but off. Add before
  public launch to protect auth/AI endpoints.
- **AI/chatbot depend on `GEMINI_API_KEY`** for richer output; without it they
  use safe deterministic fallbacks (no failure, lower quality).
- **Media on local storage** — move to Cloudflare R2 before scale (architecture
  already abstracted via Django storage).
- **Notifications are in-app + poll-based** (60s). Email/push deferred.

## 4. Launch recommendation

**Soft-launch ready** for a controlled cohort (hundreds of students, a handful of
vetted teachers) today: the learning core, certificates, live classes, teacher
governance, notifications, and admin tooling are complete and tested.

**Before public scale**, complete: course versioning (Phase 1), assignments
(Phase 4), rate limiting, and move media to R2.

## 5. Suggested Phase 2 roadmap (priority order)

1. **Course versioning + diff review** (unblocks confident teacher editing).
2. **Assignments & submissions** (completes the learning loop).
3. **Discussions/community** + **event registration** (engagement).
4. **Student analytics** + **Admin Dashboard V3** + **reporting/exports**.
5. **Volunteer management** + **community library platform** (DN differentiators).
6. **Hardening**: rate limiting, R2 media, email/push notifications.
7. Deferred by direction: payments, Zoom API, Flutter app.
