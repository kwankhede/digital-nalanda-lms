# DIGITAL NALANDA — GAP ANALYSIS

**Date:** 11 June 2026
**Method:** Live audit of the running product at digitalnalanda.com (admin + public + student views, desktop and mobile viewports) + full review of the custom LMS monorepo (`apps/web` Next.js, `apps/api` Django, `docs/`).
**Auditor lens:** Product Owner · LMS Consultant · UX Designer · Teacher · Student · Admin · Platform Architect.

> **Critical context discovered during the audit:** Digital Nalanda today runs on **LearnWorlds** (the `/author/*` admin, `/path-player`, `/all-courses` are LearnWorlds). The repository contains a **custom replacement LMS** (Next.js + Django) that is mid-build, with a documented plan to migrate content off LearnWorlds. This report therefore audits **two things**: (A) the live product experience students and teachers get *today*, and (B) the readiness of the custom platform that will replace it. Most of today's pain is **operational and content-related, not engineering** — the live platform has features (certificates, quizzes, reports, automations) that have simply never been used.

---

## 1. Executive Summary

Digital Nalanda has a powerful mission (free higher-education support for underprivileged rural students in India), genuine traction (**19,810 registered users**), authentic storytelling, and a content library built by real educators. But the live product is operating at a fraction of its potential:

- **Engagement is collapsing.** ~1 new signup/day against a 19.8k user base; average session time of **4 minutes**; the most recent community posts are "Hi" (20 days old) with zero comments.
- **The assessment and recognition layer has never been switched on.** Zero quiz/assignment submissions ever received (Review Center is empty), **zero certificates ever awarded** — despite a "certificate" filter being shown to students and a 0-certificates counter on every student dashboard.
- **Content is stale and the trust surface shows it.** The Events page lists "Upcoming" events from **March 2021**. The Path newsletter's last issue is **Aug 2023**. Courses are titled "Old Lectures" vs "New Lectures" with lecture dates from 2020–2022.
- **Student communication is broken.** Admin inbox contains direct student questions unanswered for **2–5 years** ("When do the constitution classes start again?" — 2 years ago, no reply).
- **The live-class engine isn't the platform's.** Zero live sessions have ever been scheduled in the LMS (the feature appears not even enabled); weekly workshops advertised on the homepage run through YouTube embeds inside a course shell, so there are no reminders, no attendance, no recordings pipeline, no calendar.
- **Information architecture is improvised.** "Schools" are courses. The newsletter is a course. The counselling centre is a course. There are only **2 course categories** for 29 courses and no search box in the catalogue.

The custom platform in the repo is **further along than the live product in several areas** (role model with 10 roles, approval workflows, course versioning, block-based lesson editor, in-app notifications, 11 transactional emails, counselling module, assignments with grading) but is missing the things that make the live site work at all (real content, live-class automation, mobile app, search, payments/donations) and has known "coming soon" placeholders on its homepage.

**The single biggest risk** is migrating to the new platform while carrying over the operational habits that hollowed out the current one. A gap analysis of features alone would miss this: *the product gap is, first, an operating-model gap.*

---

## 2. Product Score: 38 / 100 (live product) · 55 / 100 (custom platform readiness)

| Dimension | Weight | Live score | Notes |
|---|---|---|---|
| Content & curriculum | 20 | 8/20 | Rich archive, but stale, flat lists, duplicated "old/new" courses, no assessments |
| Student experience | 20 | 7/20 | No onboarding, no guidance, no progress meaning (certificates never issued), 4-min sessions |
| Teacher/creator experience | 15 | 6/15 | LearnWorlds tooling is strong but single-admin operated; no teacher onboarding or pipeline |
| Admin & operations | 15 | 5/15 | Inbox unanswered for years, events 5 years stale, reports unused |
| Community & communication | 10 | 4/10 | Community exists but dormant; no notifications culture |
| Navigation & IA | 10 | 4/10 | Schools-as-courses, no search, dead-feeling menus |
| Mobile | 5 | 3/5 | Responsive web OK; app status unclear |
| Trust & storytelling | 5 | 4/5 | Genuinely strong stories, mission, illustrations |
| **Total** | **100** | **38** | |

Custom platform readiness (55/100): excellent role/permission/workflow skeleton and creator tooling; loses points for zero real content, no search, no payments/donations flow, no mobile app, learning paths and featured courses still placeholder, quizzes deferred.

---

## 3. Role-by-Role Analysis

The live LearnWorlds site has its own role set (Admin, Course creator, Instructor, Assistant instructor, plus admin sub-roles like Marketer, Customer support, Community manager — all unused as far as observable). The custom platform defines exactly the roles Digital Nalanda wants (`apps/api/users/models.py`): Student, Teacher Applicant, Course Creator, Mentor, Event Manager, Library Coordinator, Volunteer, Content Manager, Admin, Super Admin. Analysis below uses Digital Nalanda's intended roles.

### 3.1 Super Admin
- **Can do (live):** Everything — one LearnWorlds admin account appears to run the entire school: courses, website, users, inbox, marketing.
- **Can do (custom):** Full access; admin dashboard with metrics, audit logs, user management, course review, school management, ticker, study materials.
- **Missing:** A delegation model in practice. The live site has role machinery (LearnWorlds custom roles; custom platform's 10 roles) but everything funnels through one person. No operational dashboards ("what needs my attention today": unanswered messages, pending approvals, stale content alerts). No content-freshness monitoring.
- **Frustrations:** The job is undoable by one person — which is exactly what the unanswered 4-year-old inbox proves.
- **Adoption risk:** Burnout of the founding team; everything stalls when one person is busy.

### 3.2 Admin
- **Can do (custom):** Approve teachers (`/admin/applications`), review/approve courses (`/admin/course-reviews` with version diff), manage users (incl. admin-initiated password reset email), schools, study materials, counselling oversight, audit logs.
- **Missing:**
  - **Events management UI** — events exist in code but there's no clear admin workflow that keeps the public Events page fresh (the live one died in 2021).
  - **Homepage content manager** — impact metrics, featured sections, upcoming-classes feed need a non-developer editing surface (custom platform stores them DB-driven; ensure the admin UI covers all of them, not just Django admin).
  - **Bulk user operations** (bulk role change, bulk message, CSV import is migration-only).
  - **Moderation queue** for community/discussions.
  - **An "operations inbox":** one screen merging pending teacher applications + course reviews + counselling waiting + unanswered messages, with SLA timers.
- **Confusing:** Django admin as fallback for CRUD is fine for engineers, hostile for the actual admins.

### 3.3 Content Manager
- **Can do (custom):** `/content/dashboard` exists; stories, schools, study materials manageable via admin surfaces.
- **Gaps to close (this was a direct audit question):**
  - **Create/edit schools:** exists (`/admin/schools`, SCHOOLS_MANAGEMENT.md) — but school↔course/educator links are still soft (roadmap lists "hard links" as not done), so school pages can't reliably aggregate content.
  - **Manage homepage:** partially — impact metrics/newsletter are DB-driven, but there's no single homepage-builder screen; "Featured courses" and "Learning paths" sections render *"coming soon"* empty states in production code.
  - **Manage educators:** educator pages exist (`/educators/[slug]`); needs a content-manager-facing editor (photo, bio, courses taught) rather than Django admin.
  - **Manage stories:** yes — stories platform shipped with categories/media/SEO.
  - **Manage learning paths:** **no** — learning paths are placeholders; "real sequences" is explicitly deferred in the roadmap. This is a flagship concept for Digital Nalanda ("The Path") and is missing.
  - **Manage libraries:** model exists (community libraries on homepage); no dedicated management UI/workflow for the 14 rural libraries (inventory, coordinators, events at libraries).
- **Verdict:** ~60% there. The missing 40% (learning paths, homepage curation, library ops) is the part most tied to the mission.

### 3.4 Course Creator (Teacher) — see also §4
- **Can do (custom):** Apply via `/become-teacher`; on approval get Creator Dashboard; visual course builder (Basic/Curriculum/Preview/Submit tabs), chapter+lesson tree with reorder/duplicate/autosave; block-based lesson editor with device preview; AI summary assistant; submit for review; versioning with diff and rollback; assignments with grading; live-class lesson type with manual Zoom links.
- **Missing:** Quizzes (deferred), question banks, course analytics per teacher (enrollment/completion/drop-off per lesson), co-teaching/TA roles per course, content scheduling (drip), direct student messaging, earnings/recognition view (even non-monetary: impact stats).
- **Frustrations:** No onboarding checklist; no sample course template; manual Zoom link pasting; cannot see who their students are or message them.

### 3.5 Mentor
- **Can do (custom):** `/mentor/dashboard`; counselling reply queue (with email + in-app notification to student on reply); assignment grading.
- **Missing:** Mentor↔student assignment (caseloads), session scheduling, mentee progress visibility, mentor activity reporting. The homepage claims **300+ mentors** — there is no tooling that could coordinate 300 mentors today.
- **Adoption risk:** Mentors are the scarcest resource; without caseload tools and recognition they will churn silently.

### 3.6 Event Manager
- **Can do (custom):** `/events/dashboard` exists; events model with homepage feeds.
- **Missing:** Recurring events (the entire live schedule is weekly!), registration/RSVP + capacity, reminder emails, post-event recording attachment, attendance tracking, event archive that auto-moves past events (the live site's 2021 "upcoming" events are the cautionary tale).
- **Verdict:** The model exists; the workflow doesn't.

### 3.7 Student — see also §6
- **Can do (live):** Register free, browse catalogue, watch YouTube lectures inside courses, see % progress, post in community, message admin (into a void), donate.
- **Can do (custom):** All of the above plus counselling requests, assignments submission, certificates (auto-PDF with QR verification), notifications bell, announcements.
- **Missing (both):** Onboarding/placement ("I'm preparing for NEET / UPSC / English — where do I start?"), learning paths, search, live-class reminders and calendar that actually populate, downloadable notes management, offline/low-bandwidth mode, Hindi/regional language UI, doubt-resolution workflow with SLA, peer study groups.

---

## 4. Course Creator Review (critical area)

**Test: "If I am a new teacher, can I immediately understand…"** (evaluated on the custom platform, since live teaching is centralized through the admin):

| Question | Verdict | Evidence / gap |
|---|---|---|
| How to create a course? | **Mostly yes** | `/creator/courses/new` + tabbed studio is discoverable. Gap: no first-run walkthrough or template gallery. |
| How to add modules? | **Yes** | Curriculum tab, chapter tree, reorder/move/duplicate. |
| How to add lessons? | **Yes** | Block-based editor; YouTube/video/text/quiz-placeholder blocks; device preview. |
| How to publish? | **Partially** | Submit-for-review exists with validation, but state visibility after submit (where is my course in the queue? expected review time?) is missing. |
| How to manage students? | **No** | No roster, no per-course student list, no messaging, no per-lesson analytics for creators. |

**UX gaps found:**
1. No teacher onboarding checklist (profile → sample lesson → submit) and no empty-state guidance on first login.
2. No course quality rubric shown before submission (what reviewers check), so rejections will feel arbitrary.
3. AI tools are suggestion-only summaries — good safety choice, but undiscoverable; no AI quiz-draft or lesson-outline assist where it would save real time.
4. Live classes need manual Zoom links — error-prone; no recurring schedule; no auto-recording attach.
5. No notion of course co-owners; rural educators often teach in pairs/panels (the live site literally advertises "a Panel of Experts").
6. Analytics: creators can see nothing about learner behaviour. Even Udemy's most basic per-course dashboard (enrollments, completion %, drop-off lesson) is absent.
7. Publishing workflow exists but there's no **unpublish/archive** student-safe path communicated, and no scheduled publishing.

**Recommendations:** onboarding checklist with sample course; review-SLA + status timeline UI; per-course analytics v1 (enrollments, completion, last-activity); roster + announce-to-my-students; recurring live-session scheduler. (Priorities in §13–16.)

---

## 5. Admin Review — operational tools

Audit questions answered:

- **Approve teachers?** Custom: yes, full workflow with emails. Live: N/A (no teacher pipeline at all — a real gap given "20+ educators").
- **Approve courses?** Custom: yes — review queue, version diff, approve/needs-changes/publish, each with email. Strong.
- **Manage users?** Custom: yes (list, role change, password reset). Missing: bulk ops, suspension flow, GDPR-style export/delete.
- **Manage schools?** Yes, with the soft-link caveat (§3.3).
- **Manage homepage content?** Partial — metrics/newsletter yes; featured/paths placeholders; no WYSIWYG section ordering.
- **Manage events?** Model yes, operating workflow no (no recurrence/RSVP/reminders/auto-archive).
- **Manage counselling?** Yes — queue + reply + notification + email. Missing: SLA timers, assignment to specific mentors, canned responses, analytics (volume, response time).

**Missing operational tools (cross-cutting):** unified "needs attention" inbox; content staleness alerts (events in the past still marked upcoming, courses with no activity in N months); response-time SLAs; weekly automated ops digest to admins (the live Reports Center even has "Scheduled reports" — never used).

---

## 6. Student Review — from first signup

Walked the live flow as a student would:

1. **Discover courses?** Weak. `/all-courses` has filter chips but **no search box**; only 2 categories; "Schools" listed above courses creates two competing mental models. No levels, no duration, no "start here".
2. **Understand learning paths?** No. "The Path" in the nav is the *newsletter* (as a course, last issue Aug 2023) — actively misleading naming against "learning paths".
3. **Join live classes?** Confusing. Homepage advertises weekend workshops; platform has zero scheduled live sessions; students must know to enter the "Live Classes" course and find an embed. No reminders, no time-zone handling, no calendar files.
4. **Access recordings?** Sort of — recordings live as YouTube videos in courses titled "Old Lectures", with no recency markers or organization by date/topic. "Watch on YouTube" leaks students off-platform mid-lesson.
5. **Track progress?** Cosmetic. % bars exist, but progress leads to nothing: **0 certificates ever issued**, no completion celebration, no streaks, no "next up".
6. **View certificates?** The UI shows a certificates counter and filter, but no certificate has ever been awarded — a silent broken promise. (Custom platform fixes this with auto-issued QR-verified PDFs.)
7. **Get help?** The inbox black hole (messages unanswered for years). Counselling exists only as an empty "course" shell on live. (Custom platform's counselling module is the right answer.)

**Friction points ranked:** (1) no guided start, (2) live-class discovery, (3) help/contact black hole, (4) stale content eroding trust, (5) no search, (6) no meaningful completion.

---

## 7. Navigation Review

- **Student nav (live):** Home · Dashboard · All Courses · Schools(dropdown) · Events · The Path · Blog · Donate · About Us. Issues: "Dashboard" and "Home" both exist (Dashboard → `/home`, Home → `/nalanda-home` — two homes); "The Path" is a newsletter-course; Schools dropdown items are just course links; Events page is 5 years stale; no search anywhere in the header; no notifications surface; "Sign out" is the only account control (no profile page link).
- **Admin nav (live):** LearnWorlds default — fine, but Certificates/Review Center/Gradebook pages are empty because the features are unused; deep-links to `/author/...` 404 with a leaky `error?author-access` URL.
- **Custom platform nav:** ecosystem nav with dropdowns/mobile drawer/bottom bar shipped. Watch-outs: homepage sections that say "coming soon" should not ship to production; `/unauthorized` page exists (good); make sure every dashboard (creator/mentor/content/events/volunteer) is reachable from the profile menu, not just by URL.
- **Hidden features (live):** community spaces, course discussions, the entire Reports Center, automations, push notifications — all present, none surfaced in any workflow.

---

## 8. Homepage Review

**Strong:** mission storytelling ("proud beneficiaries of reservation policy"), Siddhesh Gautam illustrations, real alumni stories with named universities, impact numbers (600+ trained, 5000+ online, 14 libraries), clear free-for-all promise, donate CTA.

**Missing sections / fixes:**
1. **Proof of life:** "This week at Nalanda" — next 7 days of live classes pulled from real schedule data (the current static workshop table can rot like the Events page did).
2. **Educators section** with faces/credentials (homepage mentions 20+ educators but doesn't show them; custom platform has educator pages — link them).
3. **Learning paths** ("Start here if you're preparing for NEET/UPSC/English") — currently a placeholder in the custom build.
4. **Recent recordings** rail (latest 6, with dates — recency as a trust signal).
5. **Impact dashboard** with live numbers rather than static text; donors respond to motion.
6. **Newsletter signup** (The Path) as an email capture, not a course.
7. **Language toggle** (Hindi at minimum) — the audience is rural India; an English-only homepage filters out the mission's core users.
8. **Donate transparency:** what ₹X funds (a library month, a student stipend) — currently a bare donate link.

---

## 9. Notifications Review

| Event | Live (LearnWorlds) | Custom platform |
|---|---|---|
| Course approval / rejection | N/A (no pipeline) | ✅ in-app + email (approved / needs changes / live) |
| Teacher approval / rejection | N/A | ✅ email both ways |
| Assignment graded | unused | ✅ notification on grading |
| Counselling reply | N/A | ✅ in-app + email |
| New live class scheduled | ❌ never used | ⚠️ model supports it; no automatic trigger/reminder confirmed |
| New announcement | possible, unused | ✅ announcement banner + audience targeting |
| Community mention/message | ✅ active emails | ⚠️ community features thinner |
| **Live-class starting soon (T-30min)** | ❌ | ❌ **missing both — highest-value notification for this product** |
| Certificate issued | ❌ (never issued) | ✅ email |
| Inactivity nudge ("come back") | available via automations, unused | ❌ missing |

The custom platform's in-app system (9 types, muting prefs, `notify()` helper) is a solid base. The gap is **scheduled/time-based notifications** (class reminders, weekly digest, inactivity win-back) — everything currently is request-triggered.

---

## 10. Email Review

Verified in code (`apps/api/core/email.py` + call sites) and in live settings:

| Email | Live | Custom | Notes |
|---|---|---|---|
| Welcome | ✅ active | ✅ | |
| Email verification | **❌ INACTIVE on live** | ✅ | Inactive verification → unverifiable 19.8k user base; turn it on before migration. |
| Forgot/reset password | ✅ | ✅ (both request + confirmation; + admin-initiated) | |
| Teacher approved / rejected | n/a | ✅ / ✅ | |
| Course approved / rejected / live | n/a | ✅ / ✅ / ✅ | |
| Certificate issued | unused | ✅ | |
| Counselling reply | n/a | ✅ | |
| Enrollment confirmation | ✅ | ❌ not seen | Small gap. |
| Course completion | ⚠️ template exists (status not fully verified) | ❌ not seen | Worth adding with certificate link. |
| Live-session reminder | ❌ | ❌ | **Design needed (below).** |
| Weekly digest / win-back | ❌ (automations exist, unused) | ❌ | |

**Missing workflow design — live-session reminder:** on session create/update, enqueue reminders at T-24h and T-30m to enrolled/RSVP'd students (email + in-app + push when app exists), with ICS attachment and IST-explicit times; suppress if cancelled; log delivery. Requires a task queue (Celery/cron) — currently absent; this is the architectural unlock for *all* scheduled communication (digests, SLA alerts, staleness checks).

---

## 11. Analytics Review

- **Admin (live):** LearnWorlds Reports Center is genuinely rich (users at risk, course abandonment watchlist, certified users, study time, mobile vs desktop, scheduled reports, AI insights Lab) — **and unused**. Before building anything: adopt three reports as weekly ritual (Users at risk, Course abandonment watchlist, Monthly active users).
- **Admin (custom):** Dashboard V2 metrics + newsletter export. Missing: cohort retention, funnel (visitor→signup→first lesson→7-day return), counselling/inbox response times, content staleness.
- **Teacher:** nothing on either platform. Minimum viable: enrollments, weekly active learners, completion %, per-lesson drop-off, assignment submission rates.
- **Student:** % progress only. Add: study-time, streaks, "what's next", certificates earned, goal tracking (exam date countdown — NEET/CLAT students live by dates).

**North-star metric recommendation:** Weekly Active Learners (did ≥1 meaningful learning action). Today's 4-minute average session says the real WAL is a tiny fraction of 19,810.

---

## 12. Mobile Review

- **Student (live web):** LearnWorlds responsive theme works; course player usable; YouTube embeds are the main bandwidth/UX constraint. Risk: "Watch on YouTube" exits are even more tempting on mobile.
- **Admin (live web):** LearnWorlds admin is desktop-oriented; acceptable.
- **Mobile app:** LearnWorlds has a Mobile app menu (white-label app status unknown/likely not shipped); the custom platform's Flutter app is **explicitly not started** (`apps/mobile/README.md`).
- **Critical issues for the audience:** rural India = Android + intermittent data. Needs: low-bandwidth mode (audio-only/downloadable PDFs), offline viewing, small APK, vernacular UI. A PWA with offline caching of notes could deliver 70% of the value before a native app exists. This is a **mission-critical** gap, not a nice-to-have.

---

## 13. Benchmarking

| Capability | Moodle | Canvas | Coursera | Udemy | Khan Academy | Digital Nalanda (live / custom) |
|---|---|---|---|---|---|---|
| Course authoring | ✅ | ✅ | ✅ | ✅ | n/a | ✅ strong (custom builder + versioning) |
| Quizzes/assessments | ✅✅ | ✅✅ | ✅ | ✅ | ✅✅ | ❌ / ⚠️ assignments only, quizzes deferred |
| Certificates | ✅ | ✅ | ✅✅ | ✅ | ❌ | ❌ never used / ✅ QR-verified |
| Learning paths/programs | ✅ | ✅ | ✅✅ (Specializations) | ⚠️ | ✅✅ (mastery) | ❌ / ⚠️ placeholder |
| Live classes native | ⚠️ plugins | ✅ | ✅ | ❌ | ❌ | ❌ unused / ⚠️ manual Zoom |
| Search & discovery | ✅ | ✅ | ✅✅ | ✅✅ | ✅ | ❌ / ❌ (roadmap) |
| Progress & mastery | ✅ | ✅ | ✅ | ✅ | ✅✅ | ⚠️ cosmetic |
| Community/forums | ✅ | ✅ | ⚠️ | ⚠️ | ❌ | ⚠️ exists, dormant |
| Mobile app/offline | ✅ | ✅ | ✅✅ | ✅✅ | ✅✅ | ❌ |
| Multi-language | ✅✅ | ✅ | ✅ | ✅ | ✅✅ | ❌ |
| Mentoring/counselling | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **differentiator (custom)** |
| Mission storytelling/donations | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ **differentiator** |

**Already have (keep & polish):** course builder + versioning (rivals Canvas), approval workflows, counselling (unique), stories/schools CMS, certificate verification by QR (better than Moodle default).

**Should add (in order):** search; learning paths as real sequences; quizzes with question banks (already a menu item in LearnWorlds — content is the gap); live-session scheduling with reminders; teacher analytics; Hindi UI; PWA/offline; mastery-style progress for foundation skills (Khan model fits exam prep).

**Should NOT add:** marketplace economics (Udemy revenue share, coupons, affiliates), SCORM/LTI enterprise compliance (Moodle/Canvas baggage), proctoring, complex gradebooks (weighted GPA etc.), paid tiers/upsell funnels, gamification beyond streaks/badges (leaderboards can demotivate the exact students Nalanda serves), generic AI chat tutors without curriculum grounding.

---

## 14. Consolidated Gap Registers

### 14.1 Missing Features (top of register)
1. Search (catalogue + global) — none on live or custom.
2. Learning paths as sequenced programs with path-level progress.
3. Quizzes + question banks + auto-grading.
4. Live-session lifecycle: schedule → RSVP → remind → run → attach recording → attendance.
5. Task queue for any scheduled job (reminders, digests, staleness alerts).
6. Teacher analytics; admin cohort/funnel analytics.
7. Mobile app / PWA with offline + low-bandwidth mode.
8. Multi-language UI (Hindi first).
9. Donation flow on-platform with transparency (currently external link).
10. Mentor caseload management for the claimed 300+ mentors.

### 14.2 Missing Workflows
- Student onboarding (goal → level → recommended path → first class booked).
- Teacher onboarding (checklist, sample course, review rubric, SLA).
- Event lifecycle with auto-archive (the 2021 "upcoming" bug is a workflow gap, not a content bug).
- Support SLA: every inbound student message gets a response target & owner.
- Content freshness review (quarterly course audit; auto-flag "Old Lectures").
- Certificate issuance (define completion criteria per course; backfill deserving past completers — instant goodwill with 19.8k users).

### 14.3 Missing Permissions
- Live: everything runs as school admin; instructor/assistant roles unused; no content-manager/marketer separation in practice.
- Custom: role enum is right; gaps — per-course co-teacher permissions, mentor-scoped student data visibility (privacy), content-manager write access without user-management rights, event-manager without course rights (verify guards match the matrix in `docs/PERMISSIONS_MATRIX.md`), volunteer/library-coordinator dashboards have no real capabilities behind them yet.

### 14.4 UX Issues (live)
- Two "homes" (Home vs Dashboard), newsletter named like a learning feature, schools-as-courses, no search, certificate promise never fulfilled, stale dates everywhere, YouTube exits, generic 404s, donate flow leaves the site.

### 14.5 Content Management Gaps
- Homepage section curation UI; learning-path editor; library management; educator profile editor; media library; bulk import beyond migration scripts; staleness dashboards.

### 14.6 Student / Teacher / Admin Experience Gaps
- Covered in §6 / §4 / §5 respectively.

---

## 15. Top 25 Improvements (prioritized)

| # | Improvement | Why it matters | User impact | Effort | Priority |
|---|---|---|---|---|---|
| 1 | Answer the inbox + set support SLA (assign an owner, canned replies) | Trust is the product for this audience; years-old silence is fatal | Every student | S | **P0** |
| 2 | Fix Events page (archive 2021 items; show real schedule) | Public trust surface actively harming credibility | All visitors | S | **P0** |
| 3 | Schedule the real weekly workshops as live sessions in-platform | Unlocks reminders/attendance/recordings; ends YouTube-only ops | All active students | M | **P0** |
| 4 | Turn on email verification (live) before migration | 19.8k unverifiable emails poisons the future platform | Platform integrity | S | **P0** |
| 5 | Issue certificates: define completion rules, award retroactively | Fulfils a promise the UI already makes; cheap delight at scale | Thousands | S | **P0** |
| 6 | Catalogue search + categories overhaul (2 → ~10 meaningful) | Discovery is step 1 of every student journey | All students | S–M | **P0** |
| 7 | "Start here" student onboarding (goal-based path chooser) | 4-min sessions = people bounce without direction | New students | M | **P0** |
| 8 | Task queue + live-class reminder emails (T-24h/T-30m, ICS) | Single biggest attendance lever; architectural unlock | Active students | M | **P0** |
| 9 | Rename/cleanup IA: "The Path"→Newsletter; merge Old/New Lecture courses into organized archives | Removes the top navigation confusions | All | S | **P1** |
| 10 | Learning paths v1 (ordered course lists + path progress) | The mission *is* a path (foundation → school → exam) | All students | M | **P1** |
| 11 | Unified admin "needs attention" inbox (applications, reviews, counselling, messages w/ SLA timers) | Prevents the next 4-year-old unanswered message | Admins | M | **P1** |
| 12 | Teacher onboarding checklist + review rubric + status timeline | Teacher pipeline quality and fairness | Creators | S–M | **P1** |
| 13 | Per-course teacher analytics v1 | Teachers can't improve what they can't see | Creators | M | **P1** |
| 14 | Weekly automated ops digest + 3 adopted reports (at-risk, abandonment, MAU) | Builds the data-operating muscle before fancy dashboards | Admins | S | **P1** |
| 15 | Course completion email + celebration screen + certificate link | Closes the loop on progress | Students | S | **P1** |
| 16 | Counselling SLA + mentor assignment + canned responses | Differentiator feature made operable | Students/Mentors | M | **P1** |
| 17 | Hindi UI for student-facing surfaces | Mission-core accessibility | Majority of target users | L | **P1** |
| 18 | Quizzes v1 with question banks (start with foundation English/Maths) | Assessment = learning; zero submissions ever is the proof of absence | Students | L | **P1** |
| 19 | Event lifecycle (recurrence, RSVP, reminders, auto-archive) | Keeps the trust surface alive permanently | All | M | **P1** |
| 20 | PWA: offline notes + low-bandwidth audio mode | Rural Android reality | Mobile students | L | **P1** |
| 21 | Homepage: educators section, recordings rail, live "this week" schedule, newsletter capture | Converts mission interest into action | Visitors | M | **P2** |
| 22 | Donation flow on-platform with impact transparency | Funds the mission; current flow leaks | Donors | M | **P2** |
| 23 | Mentor caseloads + mentee progress views | Scales the 300-mentor claim into reality | Mentors | L | **P2** |
| 24 | Community revival: weekly prompt ritual, course-discussion seeding, moderation queue | Dormant community is worse than none | Students | M | **P2** |
| 25 | Library coordinator module (14 libraries: inventory, events, coordinators) | Unique offline-online bridge nobody else has | Library users | L | **P2** |

## 16. Roadmap Buckets

### Quick Wins (1–2 days each)
- Items **1, 2, 4, 5, 9, 14, 15** above, plus: add a search box (even client-side filter) to `/all-courses`; remove "coming soon" empty states from the custom homepage before launch; fix `error?author-access` leaky 404; add profile/account link to student nav; put real dates ("Recorded Nov 2021") on archive lectures instead of "Old Lectures" branding; enable LearnWorlds automations for a win-back email while still on LearnWorlds.

### Medium Features (1–2 weeks each)
- Items **3, 6, 7, 8, 10, 11, 12, 13, 16, 19, 21, 22, 24**: live-session lifecycle + reminders (with the task queue), onboarding flows (student + teacher), learning paths v1, unified ops inbox, teacher analytics, counselling operations, events lifecycle, homepage upgrades, donations.

### Strategic Features (roadmap)
- Items **17, 18, 20, 23, 25**: Hindi/vernacular UI, quizzes & mastery practice (Khan-style for foundation skills), PWA→Flutter app with offline, mentor network platform, library network module; plus: LearnWorlds→custom migration itself (content, users, progress — with verified emails), alumni network, scholarship/stipend application workflows.

---

## Appendix A — Evidence Log (selected)

| Observation | Source |
|---|---|
| 19,810 users; 0% conversions; 0 sales; 4-min avg time; 29 courses; 2 categories | `/author/dashboard` (11 Jun 2026) |
| Zero upcoming live sessions; "enable them in settings" hint | `/author/live_sessions?tab=upcoming` |
| Zero assessment submissions ever | `/author/assignments?tab=ungraded` — "You haven't received any submission yet" |
| Zero certificates ever awarded | `/author/certifications` — "No certificates awarded yet" |
| Inbox unanswered 2–5 yrs ("When the constitution classes startet again?" 2 yrs ago) | `/author/inbox` |
| "Upcoming" events dated March 2021 | `/pages/events` |
| The Path last issue Aug 2023; delivered as a course | `/course/the-path-magazine` |
| Email verification INACTIVE; welcome/reset/enrollment/completion active | `/author/settings_notifications` |
| Schools dropdown links are `/course/...` URLs | homepage nav DOM |
| No search box on catalogue; filter chips only | `/all-courses` |
| Student dashboard: stats + full catalogue dump; 0 certificates counter | `/start` (after-login preview) |
| Course player: flat 2021–22 YouTube lecture lists + PDFs | `/path-player?courseid=sss` |
| 10-role enum incl. Content Manager, Mentor, Event Manager | `apps/api/users/models.py` |
| 11 transactional emails implemented | `apps/api/core/email.py` + `users/creators/certificates/assistant` views |
| In-app notifications: 9 types + muting | `apps/api/notifications/models.py` |
| Flutter app not started | `apps/mobile/README.md` |
| Quizzes/payments/Zoom API/search deferred; learning paths placeholder | `docs/PRODUCT_ROADMAP.md`; `components/home/LearningPaths.tsx` ("coming soon") |

*Report generated by Claude (Cowork) — product audit of live site and codebase, 11 June 2026.*
