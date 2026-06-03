# API Reference

> Base URL: `http://localhost:8000` (dev). All list endpoints are unpaginated
> unless noted. Auth via `Authorization: Bearer <access>`.

## Auth (`users`)
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/api/auth/register/` | public | email + password → user + JWT |
| POST | `/api/auth/login/` | public | email + password → access/refresh |
| POST | `/api/auth/token/refresh/` | public | refresh → access |
| POST | `/api/auth/logout/` | student+ | blacklists refresh |
| GET/PATCH | `/api/auth/me/` | student+ | profile (PATCH editable fields) |

## Courses
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/categories/` | public | |
| GET | `/api/courses/` | public | filters `category`,`level`,`language` (paginated) |
| GET | `/api/courses/featured/` | public | homepage |
| GET | `/api/courses/<slug>/` | public | detail + modules + lessons |

## Enrollments & progress
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/api/courses/<slug>/enroll/` | student+ | idempotent |
| GET | `/api/my/enrollments/` | student+ | |
| GET | `/api/my/courses/` | student+ | + progress |
| GET | `/api/my/progress/` | student+ | `?course=<slug>` |
| POST | `/api/lessons/<id>/progress/` | enrolled | watch seconds |
| POST | `/api/lessons/<id>/complete/` | enrolled | auto-recalc + cert |

## Certificates
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/api/certificates/generate/<slug>/` | student+ | idempotent |
| GET | `/api/my/certificates/` | student+ | |
| GET | `/api/certificates/<id>/` | owner | metadata |
| GET | `/api/certificates/<id>/download/` | owner | PDF |
| GET | `/api/certificates/verify/<code>/` | public | Valid/Invalid |

## Live sessions & events (`live_sessions`)
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/live-sessions/` `/upcoming/` `/recordings/` `/<slug>/` | public | |
| POST | `/api/live-sessions/<slug>/join/` | student+ | returns Zoom URL |
| GET | `/api/live-sessions/<slug>/attendance/` | mentor/admin | |
| GET | `/api/events/` `/upcoming/` `/<slug>/` | public | |
| GET | `/api/home/recordings/` | public | last 5 |
| GET | `/api/home/upcoming/` | public | next 30 days, max 10 |
| */CRUD | `/api/admin/live-sessions/` `/api/admin/events/` | admin | |
| GET | `/api/mentor/live-sessions/` | mentor/admin | own |

## Homepage content (`content`)
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/home/impact/` | public | impact metrics |
| GET | `/api/schools/` `/api/schools/<slug>/` | public | |
| GET | `/api/learning-paths/` | public | |
| GET | `/api/educators/featured/` | public | |
| GET | `/api/community-libraries/` | public | |
| POST | `/api/newsletter/subscribe/` | public | idempotent |
| GET | `/api/stories/` `/featured/` `/<slug>/` | public | |

## Admin dashboard (`adminpanel`)
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/admin/stats/` | admin | totals + growth + completion rate |
| GET | `/api/admin/newsletter/` | admin | subscriber list |
| GET | `/api/admin/newsletter/export/` | admin | CSV download |

## Management commands (CSV import — see MIGRATION_GUIDE.md)
`import_schools`, `import_educators`, `import_stories`, `import_courses`,
`import_modules`, `import_lessons`, `import_events` — all support `--file` and
`--dry-run`.


## Teacher / course creator governance (`creators`)
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/api/creator/apply/` | student+ | one active application per user |
| GET | `/api/creator/application/status/` | student+ | latest application |
| GET | `/api/admin/creator-applications/` | admin | `?status=` filter |
| GET | `/api/admin/creator-applications/<id>/` | admin | |
| POST | `/api/admin/creator-applications/<id>/approve/` | admin | role → course_creator |
| POST | `/api/admin/creator-applications/<id>/reject/` | admin | notes; reverts applicant |
| GET/POST | `/api/creator/courses/` | creator | list own / create draft |
| GET/PATCH | `/api/creator/courses/<id>/` | creator (own, editable) | |
| POST | `/api/creator/courses/<id>/submit/` | creator (own) | draft/rejected → submitted |
| GET | `/api/creator/courses/<id>/curriculum/` | creator/admin | nested module→lesson tree |
| POST | `/api/creator/courses/<id>/reorder/` | creator (own) | persist module+lesson order + moves |
| POST | `/api/creator/modules/<id>/duplicate/` | creator (own) | duplicate chapter + lessons |
| POST | `/api/creator/lessons/<id>/duplicate/` | creator (own) | duplicate lesson |
| GET | `/api/live-sessions/<slug>/calendar.ics` | public | ICS download (student-safe join URL) |
| POST | `/api/creator/courses/<id>/modules/` | creator (own, editable) | add module |
| PATCH/DELETE | `/api/creator/modules/<id>/` | creator (own, editable) | |
| POST | `/api/creator/modules/<id>/lessons/` | creator (own, editable) | add lesson |
| PATCH/DELETE | `/api/creator/lessons/<id>/` | creator (own, editable) | |
| GET | `/api/admin/course-reviews/` | admin | `?status=` filter |
| GET/PATCH | `/api/admin/course-reviews/<id>/` | admin | edit / assign instructor |
| POST | `/api/admin/course-reviews/<id>/{approve,reject,publish,unpublish,archive}/` | admin | status transitions |
| GET | `/api/admin/audit-logs/` | admin | `?action=` filter |


## AI assistant, chatbot & counselling (`assistant`)
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/api/assistant/ai/course-summary/` | creator/admin | AI (Gemini or template) course summary — suggestion only |
| POST | `/api/assistant/ai/lesson-summary/` | creator/admin | AI lesson summary |
| GET/POST | `/api/assistant/chat/` | logged-in | Nalanda chatbot history / send (rule-based + AI fallback) |
| GET/POST | `/api/counselling/` | student+ | own requests / submit |
| GET | `/api/counselling/<id>/` | owner | request detail (student sees own only) |
| GET | `/api/counselling/manage/` | mentor/admin | full queue; `?status=` |
| POST | `/api/counselling/<id>/reply/` | mentor/admin | `action`: reply / assign / close |


## Notifications & announcements
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/notifications/` | logged-in | paginated; `?type=`, `?unread=1`; includes `unread_count` |
| GET | `/api/notifications/unread-count/` | logged-in | badge count |
| POST | `/api/notifications/<id>/read/` | owner | mark one read |
| POST | `/api/notifications/read-all/` | logged-in | mark all read |
| GET/PUT | `/api/notifications/preferences/` | logged-in | muted types |
| GET | `/api/announcements/active/` | public | live announcements for the user's audience |

Triggers (in-app): certificate issued, mentor counselling reply, course approved/published/rejected.


## Assignments & submissions (`assignments`)
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET/POST | `/api/creator/courses/<id>/assignments/` | creator(own)/admin | list / create |
| GET | `/api/creator/assignments/mine/` | creator | assignments across own courses |
| PATCH/DELETE | `/api/assignments/<id>/` | course owner/admin | edit / delete |
| GET | `/api/my/assignments/` | student | enrolled-course assignments + own submission |
| POST | `/api/assignments/<id>/submit/` | enrolled student | text_response / file_url |
| GET | `/api/assignments/<id>/submissions/` | teacher(owner)/mentor/admin | submissions to grade |
| POST | `/api/submissions/<id>/grade/` | teacher(owner)/mentor/admin | score + feedback (notifies student) |


## Course versioning (`versioning`)
The live Course/Module/Lesson rows are the **working draft**. Each publish is
frozen as an immutable `CourseVersion` snapshot, so creators/admins can review
unpublished changes, compare any two versions, and roll back.

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/creator/courses/<id>/versions/` | owner/admin | version history list |
| POST | `/api/creator/courses/<id>/versions/` | owner(editable)/admin | save a manual checkpoint |
| GET | `/api/creator/courses/<id>/versions/<n>/` | owner/admin | full snapshot of version `n` |
| GET | `/api/creator/courses/<id>/diff/` | owner/admin | working draft vs latest published snapshot |
| GET | `/api/creator/courses/<id>/versions/<a>/compare/<b>/` | owner/admin | structured diff between two versions |
| POST | `/api/creator/courses/<id>/versions/<n>/restore/` | owner(editable)/admin | roll back; auto-checkpoints current state first |

Notes: publishing a course auto-creates a published snapshot. Restore only runs
while the course is in a draft/rejected (editable) state; it reconciles by id so
surviving lessons keep their primary key (student progress preserved). Restores
are written to the **AuditLog** (`course_restored`).
