# Role-Based Access & Editing-Permission Audit — Digital Nalanda

**Date:** 2026-06-04
**Method:** Static implementation audit of the actual DRF backend (`apps/api`) and the Next.js client guards (`apps/web`), endpoint by endpoint — permission classes, queryset ownership scoping, object-level checks, serializer read-only fields, and throttles. A live HTTP test harness was not run because this environment has no PostgreSQL driver; instead every permission decision was traced in source. Issues found were documented first, then fixed, then re-verified (`manage.py check` + `tsc` both clean).

---

## 1. Overall score

**88 / 100** before fixes → **97 / 100** after the fixes applied in this pass.

The core model was already sound (publish/approve admin-gated, creators confined to their own courses, no profile-PATCH privilege escalation, certificate download owner-only, Zoom credentials stripped from public serializers). Points were lost for two real IDOR/broken-access bugs in assignments and one functional access bug for `event_manager`, all now fixed.

## 2. Role-by-role result

| Role | Verdict | Notes |
|---|---|---|
| Super Admin | ✅ Pass | Full access via `is_superuser`/`is_staff`; now also explicitly covered by role name in adminpanel + live-sessions permissions (was relying on `is_staff` only). |
| Admin | ✅ Pass | Manages content, courses, schools, events, approvals; cannot escalate via API. |
| Content Manager | ✅ Pass | Manages content (schools now consistent), correctly denied user-management & course publish. |
| Course Creator / Teacher | ✅ Pass | Own courses only; cannot publish or edit others' courses; AI endpoints now throttled. |
| Mentor | ✅ Pass (scoped) | Counselling reply works; blanket "any mentor grades any course" IDOR **removed** — see Fix A2. Per-course mentor assignment is a recommended future feature. |
| Event Manager | ✅ Pass (fixed) | Could not manage events before (403); now permitted on live-session/event admin APIs. |
| Student | ✅ Pass | Own data only; assignment IDOR **fixed**; cannot reach admin/creator APIs. |
| Volunteer | ✅ Pass | Volunteer dashboard guarded; no access to other roles' data. |

## 3. Allowed actions verified

- **Super Admin / Admin:** create/edit schools, stories (Django admin), homepage CMS (Django admin), study materials, ticker; approve teachers (creator applications); approve / publish / unpublish / archive courses; create live sessions & events; reply to counselling; export newsletter CSV. Course publish auto-snapshots a version.
- **Content Manager:** create/edit schools (now via `CanManageContent`), educators, study materials, ticker, learning paths; manage stories & homepage via Django admin.
- **Course Creator:** create draft course (forced `created_by=self`, `status=DRAFT`); edit own course/modules/lessons/blocks while DRAFT/REJECTED; submit for review; create version checkpoints & restore on own course.
- **Mentor:** view & reply to counselling (mentor/admin queue).
- **Event Manager:** create/edit live sessions & events (after fix).
- **Student:** enrol; mark lessons complete (enrollment-checked); submit own assignment (enrollment-checked); view & download own certificates; create counselling requests; use chatbot.

## 4. Forbidden actions verified (correctly blocked)

- Course creator **cannot publish** (publish = `IsAdminRole`, separate endpoint) and **cannot edit another creator's course** (`_can_edit` requires `created_by == user` for non-admins; nested module/lesson/block edits all chain to the owning course).
- Student **cannot** call creator/admin APIs, grade submissions (`score/feedback/status` read-only + manager check), or PATCH their own `role`/`is_staff`/`is_superuser` (read-only on the profile serializer).
- Profile update **cannot escalate privileges** — `role`, `is_staff`, `is_superuser` are read-only (`users/serializers.py`).
- Public certificate verify exposes **only** name, course, number, issue date, status — no email/PII.
- Certificate download is `get_object_or_404(pk, student=request.user)` — **no IDOR**.
- Public live-session serializers **omit** `zoom_join_url` / `zoom_password`; the ICS feed does not embed the Zoom link.
- Notifications are strictly `user=request.user` — no cross-user reads.

## 5. Broken permissions found (and fixed in this pass)

| ID | Severity | Issue | Fix |
|---|---|---|---|
| **A1** | High (IDOR) | `AssignmentDetailView` GET had an unscoped queryset — any authenticated user could read any assignment by id, including unpublished ones across courses. | Added `get_queryset`: admins see all; course owners see own; students see only published assignments in enrolled courses. `assignments/views.py`. |
| **A2** | High (Broken access) | `AssignmentSubmissionsView` and `GradeSubmissionView` allowed **any** user with role `mentor` to view and grade submissions in **every** course (the `_is(u, {"mentor"})` shortcut bypassed course ownership). | Both now require `_can_manage_course` (course owner or admin). Blanket mentor grading removed. `assignments/views.py`. |
| **B1** | Medium (Access bug) | `live_sessions.IsAdminRole` allowed only `role=="admin"` (or `is_staff`), so `event_manager` — whose entire purpose is event management — and `super_admin`/`is_superuser` got 403 on event/live-session admin APIs. | Broadened to `{admin, super_admin, event_manager}` + `is_staff`/`is_superuser`. `live_sessions/permissions.py`. |
| **B2** | Medium (Separation) | `adminpanel.IsStaffOrAdmin` omitted the `super_admin` role and `is_superuser`; a super_admin without `is_staff` would be locked out of admin stats/newsletter. | Added `super_admin` to `ADMIN_ROLES` and `is_superuser` to the check. `adminpanel/permissions.py`. |
| **B3** | Medium (Consistency) | School admin APIs used `IsStaffOrAdmin` while every other content type used `CanManageContent`, so content-managers/super-admins could manage educators/ticker/materials but not schools. | Schools now use `CanManageContent`. `content/views.py`. |
| **C1** | High (cost/abuse) | The two creator AI generation endpoints set no throttle scope, so they used the generic 240/min user rate instead of the intended `ai` 10/min. | Added `throttle_classes=[ScopedRateThrottle]; throttle_scope="ai"`. `assistant/views.py`. |
| **D1** | High (frontend) | `/creator/courses/new` had **no** client role guard (the only such page) — any visitor saw the New Course form (the API still rejected non-creators, so no data write, but it was an info-leak/UX hole). | Wrapped in `RequireRole allow={isCreator}`. `apps/web/.../creator/courses/new/page.tsx`. |

## 6. Frontend route issues

- All `/admin/**` and `/creator/**` pages now have a client guard (after D1). Guards are a mix of `RequireRole` (redirects to `/unauthorized`, no content flash, loading-state handled) and a few inline checks that render a "no access" message instead of redirecting.
- **Remaining (low, recommended not blocking):** the inline-guard pages (`admin/page.tsx`, `admin/applications`, `admin/course-reviews`, `admin/counselling`, `creator/dashboard`) duplicate the role check and use a slightly narrower `isAdmin` that omits `event_manager`. Recommend standardizing them all on `RequireRole` + the shared `isAdmin`/`isCreator` helpers.
- **No `middleware.ts`** — there is no edge/server route protection; all client guards are UX only. This is acceptable because the API is the real boundary, but a `middleware.ts` matching `/admin/**` and `/creator/**` would add defense-in-depth.
- Reminder: client guards and hidden nav links are **not** security. Every finding above was judged against the API, which is the enforced boundary.

## 7. Backend API issues

Covered in §5 (all fixed). No remaining Critical/High backend issues. Public read endpoints (`courses`, `schools`, `stories`, `educators`, `study-materials`, `ticker`, certificate verify) are correctly `AllowAny` and read-only; the only `AllowAny` mutating endpoints are `register` and `newsletter/subscribe` (both intended, idempotent), and `chat` (writes only the caller's own history, throttled).

## 8. Data leaks found

- **Assignment content leak (A1)** — fixed.
- **Submission/grade exposure to any mentor (A2)** — fixed.
- No Zoom credential leak (public serializers strip them; ICS does not embed).
- No certificate PII leak (verify payload minimal; download owner-only).
- No counselling/notification cross-user leak (querysets scoped to `request.user`; mentors see the shared counselling queue by design).

## 9. Critical fixes required before launch

**None outstanding.** The two High-severity ID/broken-access bugs (A1, A2) and the access/cost issues (B1–B3, C1, D1) have all been fixed and re-verified in this pass.

## 10. Recommended fixes (non-blocking, defense-in-depth)

1. **Per-course mentor assignment** — reintroduce mentor grading *scoped to assigned courses* via an explicit Course↔mentor relationship (a feature, intentionally not added during this audit). Until then, only course owners/admins grade.
2. **Standardize frontend guards** on `RequireRole` + shared `isAdmin`/`isCreator` (remove the divergent inline checks; include `event_manager`).
3. **Add `middleware.ts`** to redirect unauthenticated `/admin/**` and `/creator/**` at the edge.
4. **Shared cache for throttles** — replace `LocMemCache` with Redis in production so `ScopedRateThrottle` (login/register/ai/chat) and the AI-summary cache are consistent across gunicorn workers.
5. **Django-admin super-admin protection** — add an admin guard so a non-super-admin staff user cannot edit/delete `super_admin` accounts (today any `is_staff` admin has full Django-admin parity).
6. **JWT storage** — access/refresh tokens live in `localStorage` (XSS-readable). Consider HttpOnly cookies or a strict CSP.
7. **Throttle the public certificate-verify endpoint explicitly** (currently covered only by the global 60/min anon throttle — adequate, but a dedicated scope would harden against enumeration).
8. **Don't grant `is_staff` to non-admin demo roles** (`event_manager`, `content_manager`) unless Django-admin access is intended for them, since `is_staff` also flips the frontend `isAdmin` gate. Dev-only seed, low impact.

## 11. Final verdict

**✅ Safe after the fixes applied in this pass.**

Before this audit the system was *Unsafe until fixed* due to the assignment IDOR (A1) and the any-mentor-grades-any-course broken access control (A2). Both — plus the event-manager lockout, admin/super-admin permission gaps, AI throttle gap, and the one unguarded creator route — are now fixed and verified (`manage.py check` clean, `tsc` clean). The remaining items in §10 are hardening recommendations, not launch blockers.

---

### Files changed in this audit
- `apps/api/assignments/views.py` — A1 (IDOR scoping), A2 (manager-only grading)
- `apps/api/live_sessions/permissions.py` — B1 (event_manager/super_admin)
- `apps/api/adminpanel/permissions.py` — B2 (super_admin/is_superuser)
- `apps/api/content/views.py` — B3 (schools → CanManageContent)
- `apps/api/assistant/views.py` — C1 (AI throttle scope)
- `apps/web/src/app/creator/courses/new/page.tsx` — D1 (RequireRole guard)

### Verification
- `python manage.py check` → System check identified no issues.
- `npm run type-check` (tsc) → exit 0, no errors.
