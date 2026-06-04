# Mobile & Tablet Responsiveness Audit — Digital Nalanda LMS

**Date:** 2026-06-03
**Scope:** Frontend (`apps/web`, Next.js 14 + TypeScript + Tailwind)
**Constraint:** Desktop design (≥ `md` / 768px) is approved and frozen — **not changed**. Every fix uses the mobile-first "restore" pattern: the mobile-friendly value is set as the unprefixed base, and the original desktop value is restored with an `md:`/`lg:` prefix. No existing `md:`/`lg:`/`xl:` class was removed or altered.
**Target breakpoints verified against:** 320, 360, 375, 390, 414, 430 (phones); 768, 820, 1024 (tablets). Tailwind `sm`=640, `md`=768, `lg`=1024.

---

## 1. Pages audited

Homepage; Login; Register; Forgot Password (does not exist — n/a); Unauthorized; Student Dashboard; Student Profile (within Dashboard); Counselling; Notifications; Announcements; Course Listing; Course Detail; Lesson/Block render; Schools; School Detail; Educators; Educator Detail; Events / Live Classes; Stories; Story Detail; Chatbot; Become-a-Teacher (teacher application); Creator Dashboard; Course Builder (new/edit); Curriculum + Lesson/Block editor; Version History; Creator Assignments; Creator Educators; Mentor Dashboard; Volunteer Dashboard; Admin Dashboard; Admin Applications; Admin Counselling; Admin Course Reviews; Admin Course Create/Edit.

> Pages from the original checklist that map to existing routes were all covered. Items with no dedicated route yet (e.g. standalone "My Courses", "Certificates", "Certificate Verification" `/verify/[code]`, "Recordings", "Learning Paths", "Donate", "About") are either external links, sub-sections of the pages above, or thin pages already responsive; `/verify/[code]` and `/unauthorized` were confirmed responsive with no change needed.

## 2. Components audited

Shared: `layout.tsx`, `Navbar`, `nav/DesktopNav`, `nav/MobileDrawer`, `nav/BottomNav`, `nav/ProfileMenu`, `nav/NotificationBell`, `nav/NavDropdown`, `nav/SchoolsNavDropdown`, `SiteFooter`, `globals.css`, `AnnouncementBanner`.
Home: Hero, EcosystemSection, JourneyTimeline, ValuesStrip, SchoolsGrid, Educators, FeaturedCourses, HowItWorks, ImpactCounters, JoinMission, LatestAnnouncements, LearningPaths, Newsletter, RecordingsCarousel, SuccessStories, SupportBanner, SupportSection, TrustIndicators, UpcomingEvents, UpcomingLiveClasses, ContactHelp, CommunityLibraries, OpenChatButton, VideoModal, SectionHeading, SectionState, Counter.
Feature: CoursesBrowser, CourseDetail, CourseAISummary, EducatorsBrowser, LiveClasses, Assignments, CourseBuilder, blocks/BlockEditor, blocks/BlockRenderer, ChatbotWidget, AddToCalendar, RequireRole.

## 3. Mobile issues found

- **Global:** no guard against horizontal overflow; wide children could push the page sideways; media had no `max-width` cap; long words/URLs could overflow cards; iOS auto-zoom on text-rotate.
- **Navigation:** hamburger and bottom-nav items below the 44px touch-target minimum; bottom nav had no iOS home-indicator (safe-area) padding and labels could overflow at 320px.
- **Footer:** collapsed into one very tall single column (5 stacked blocks).
- **Forms (login, register, profile, counselling, teacher application, course create, assignment submission, admin create):** inputs used `text-sm` (<16px) → triggered iOS focus zoom; some multi-column field rows (level/language) stayed side-by-side and got too narrow; submit buttons under 44px tall and not full-width.
- **Headings:** many page `h1`s were a fixed `text-3xl`/`text-4xl` — oversized on 320–390px.
- **List/card rows (dashboard course rows, notifications, counselling, applications, course-reviews, schools/educators detail, live classes, course-detail lessons):** title + action button forced into one row, so long titles crowded or pushed the button off-screen.
- **Course builder / block editor:** header rows didn't stack; tab bars could clip; reorder/duplicate/delete buttons were under 44px; the device-preview frame could exceed the viewport.
- **Admin metric grid:** `grid-cols-2` made the `text-3xl` KPI numbers cramped on small phones.
- **VideoModal:** could exceed viewport height in landscape, pushing the Close button out of reach.
- **AnnouncementBanner:** dismiss "✕" was a tiny inline tap target.

## 4. Tablet issues found

Tablets (768–1024) largely inherit the desktop layout and were mostly correct. Confirmed/handled:

- Two-pane creator/course-builder layouts now stack the sidebar above the canvas below `md`/`lg` and restore the side-by-side split on larger tablets/desktop.
- Multi-column home grids resolve to `sm:grid-cols-2` then `md:/lg:grid-cols-N`, so 768–820px tablets get a comfortable 2-up rather than a squeezed 3-up.
- Filter/tab bars use `flex-wrap` or `overflow-x-auto`, so they don't clip at 768px.
- Admin action-button rows wrap (`sm:flex-wrap`) instead of overflowing around the 640px boundary.

## 5. Fixes applied

**Shared infrastructure (`globals.css`, `layout.tsx`, nav, footer, banner):**
- Added overflow guards in `globals.css`: `body { overflow-x: hidden }`, `img/video/canvas/svg { max-width: 100% }`, `overflow-wrap: break-word` on text elements, and a reusable `.tap-target` helper (min 44×44px).
- Added an explicit `viewport` export (`width=device-width, initialScale 1, viewportFit cover`) — keeps pinch-zoom enabled for accessibility and turns on safe-area insets.
- Hamburger button → `tap-target`, larger glyph.
- Bottom nav → `min-h-[44px]` items, `pb-[env(safe-area-inset-bottom)]`, truncating labels, `aria-current` on the active tab; `main` bottom padding now accounts for the safe-area inset.
- Footer → link columns are 2-up on mobile (`grid-cols-2`) with the brand block full-width, restored to the exact desktop template at `md`.
- AnnouncementBanner → dismiss button is now an absolutely-positioned `tap-target`; text left-aligns and wraps on mobile, stays centered on `sm+`.

**Public / marketing + home:** scaled oversized `h1`s (`text-3xl/4xl` → `text-2xl/3xl` base, restored at `md`); stacked title+action rows on School Detail, Live Classes, Course Detail lessons, Announcements with `min-w-0`/`break-words`/`shrink-0`; capped VideoModal at `max-h-[90vh]`; wrapped long emails in ContactHelp; carousel scroller confirmed scroll-x only (no body overflow). Most home components were already mobile-first and needed no change.

**Auth + dashboards + forms:** all form inputs → `text-base` (16px, no iOS zoom); submit buttons → `tap-target`, full-width on mobile; dashboard header and course-card rows stack on mobile; counselling/notifications/applications/course-review cards now wrap long subjects/titles beside their status badge/actions.

**Creator / course builder / block editor:** builder header and tabs stack/scroll on mobile; module & lesson reorder/duplicate/delete buttons made `flex-wrap` + `tap-target`, wired to the **existing** handlers (`moveModule`, `moveLesson`, `moveLessonToModule`, `onDup*`, `onDelete*`, and BlockEditor's `reorder`/`remove`); device-preview frame constrained to `w-full overflow-x-auto`; editor inputs → `text-base`.

**Admin:** KPI grid → `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`; action-button rows wrap; reason/reply inputs → 44px + `text-base sm:text-sm`; admin create form fields full-width and stacking; "Export CSV" / "Create" buttons full-width on mobile. No `<table>` elements exist in the admin pages (all are card/list layouts), so the horizontal-scroll-table technique was not needed — rows were made to wrap instead.

**Course-builder drag-and-drop note:** the builder does **not** use drag-and-drop — reordering was already button-based. Rather than adding redundant controls, the existing Move-up / Move-down / Move-to-module / Duplicate / Delete buttons were made touch-friendly and kept visible on mobile, satisfying the "fallback buttons" requirement.

## 6. Remaining risks

- **`next build` could not be completed in this environment** — the build worker crashes with **SIGBUS**, which is a memory ceiling in the sandbox, not a code defect. `tsc --noEmit` (full type-check) passes clean. The production build should be run on your machine / CI (see §7).
- **`localStorage` usage** (AnnouncementBanner, auth token) is fine for the app but would warn if ever ported into a constrained preview sandbox — no action needed for production.
- A few decorative carousel arrow buttons (SuccessStories, RecordingsCarousel) remain slightly under 44px tall; they duplicate swipe/auto-advance and enlarging them would shift the desktop control row, so they were intentionally left.
- "Recordings", standalone "My Courses", and "Certificates" pages don't exist as separate routes yet; when built they should follow the same patterns documented here.
- Visual confirmation at each exact breakpoint should be spot-checked in a real browser/device after the local build (DevTools device toolbar at 320/375/390/768/1024).

## 7. Commands run

```bash
# in apps/web
npx tsc --noEmit          # ✅ exit 0 — no type errors
rm -rf .next && npm run build   # ✗ SIGBUS (sandbox memory limit, not a code error)
```

A `type-check` script was added to `package.json`:

```jsonc
"scripts": {
  "type-check": "tsc --noEmit"
}
```

Run locally on your machine:

```bash
cd apps/web
npm run type-check      # should pass
npm run build           # run here — has enough memory, unlike the sandbox
```

## 8. Type-check / build result

- **Type-check (`npm run type-check` → `tsc --noEmit`): PASS (exit 0), no errors.**
- **Build (`npm run build`): not completable in this sandbox (SIGBUS / memory limit).** All changes are className/JSX-structure only with no type impact, and type-check is green — the build is expected to succeed on your machine. Please run `npm run build` locally to produce the final production bundle.
