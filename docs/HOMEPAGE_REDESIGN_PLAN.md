# Homepage Redesign Plan — Digital Nalanda

> Status: **proposal for approval**. No implementation until approved.
> Goal: reposition the homepage from "NGO website" to **"India's Free Digital
> University for Social Transformation"** — in the visual language of Coursera /
> Khan Academy / MasterClass / Harvard Online / DeepLearning.ai.

## 1. Analysis of the current homepage

What's working (keep the substance):

- Strong, authentic mission and real beneficiary stories.
- Genuine impact data (5000+ students, 600+ learners, 20+ educators, 14 libraries, 100% free).
- Real content: 10 schools, foundation course, weekend workshops, "The Path" newsletter, donation tiers.

What's failing (the design, not the content):

- **No clear hierarchy** — hero illustration competes with a wall of small text; nothing says "start here."
- **Schools are pill-buttons** in two columns — they read as a nav menu, not as a flagship offering.
- **Impact numbers are buried** at the bottom in a colored grid, so credibility lands too late.
- **Stories are at the very bottom** in cramped equal columns — the emotional payload arrives after most users have left.
- **Courses aren't featured at all** — the strongest conversion driver on an LMS is invisible.
- **Workshops/events are a text list + a screenshot** — not scannable, not clickable.
- **Two emerald-green full-bleed bands** dominate; the palette feels random rather than systematic.
- **Dense paragraphs, small buttons, lots of vertical scrolling** with weak rhythm.

Conclusion: the raw material is excellent; it needs re-sequencing for a conversion
narrative and a premium, systematic visual language — not a restyle.

## 2. Redesign strategy

**Positioning.** Lead with the "free digital university" identity, not "we are a
team of educators." First screen must answer *what / who / why* in one glance.

**Conversion narrative (the order matters).** Hook → proof → what you can study →
proof it works → how to start → act. Concretely:

1. Hero (what + primary action)
2. Impact counters (instant credibility)
3. Schools (the breadth — the "university")
4. Featured courses (the product — drives enrollments)
5. How learning works (removes "how do I start?" friction)
6. Success stories (emotional proof — moved way up from the bottom)
7. Workshops & events (live, time-bound urgency)
8. Newsletter "The Path" (low-commitment capture)
9. Support / donate (impact-framed, after value is shown)
10. Trust indicators (institutional reassurance)
11. Footer (deep navigation)

**Why this order converts:** value and proof come *before* asks. Registration and
enrollment CTAs appear early (hero) and recur; the donation ask comes only after
the visitor has seen the mission, the breadth, and the human impact.

**Design system (systematic, not random):**

- **Palette:** existing brand navy `#0b1f4d` (authority) + orange `#f97316`
  (action/CTA) as the system. Emerald becomes a *sparingly used* accent, not two
  full-bleed bands. Generous white/neutral space between sections.
- **Type scale:** large display headings (clamp ~36–60px), comfortable body
  (17–18px), clear section eyebrows. Mobile-first sizes that scale up.
- **Layout language:** card-based, consistent radius/shadow, 12-col max-w-6xl
  container, strong section rhythm (consistent vertical padding).
- **Motion:** CSS/IntersectionObserver only (count-up on scroll, subtle fade/rise).
  No animation libraries — keeps it fast.
- **Accessibility:** semantic landmarks, labelled controls, focus states, alt text,
  color-contrast-safe pairs, `prefers-reduced-motion` respected.

## 3. Component hierarchy

```
app/page.tsx  (server component — fetches featured courses, schools, stories, events)
│
├── <HeroSection>            (client only for the count-up; mostly static)
│     ├── <StatPill> ×3      (inline animated mini-stats)
│     └── CTAs: Start Learning / Watch Introduction → <VideoModal>
│
├── <ImpactCounters>         (client — count-up on scroll)
│     └── <Counter> ×5
│
├── <SchoolsGrid>
│     └── <SchoolCard> ×10   (icon, name, description, course count)
│
├── <FeaturedCourses>        (data from /api/courses/)
│     └── <CourseCard> ×N    (reuses the courses-page card pattern)
│
├── <HowItWorks>
│     └── <StepCard> ×6      (horizontal timeline on desktop, vertical on mobile)
│
├── <SuccessStories>         (client — carousel)
│     └── <StoryCard> ×N     (photo, quote, name, placement)
│
├── <EventsWorkshops>
│     └── <EventCard> ×N     (speaker, date, topic, Register CTA)
│
├── <NewsletterSignup>       (client — email field + submit)
│
├── <SupportSection>
│     └── <DonationTierCard> ×3   (₹500 / ₹1000 / ₹5000 + impact)
│
├── <TrustIndicators>        (educators, universities, library network)
│
└── <SiteFooter>             (multi-column nav + social) — promote to shared layout
```

### Reusable components (used here and elsewhere)

- `SectionHeading` (eyebrow + title + optional subtitle) — every section.
- `CourseCard` — shared with `/courses` (single source of truth).
- `SchoolCard`, `StepCard`, `StoryCard`, `EventCard`, `DonationTierCard`, `StatPill`, `Counter`.
- `VideoModal` (YouTube intro), `Button` (primary/secondary variants), `Container`.
- `SiteFooter` moves into the shared layout so all pages get it.

Data sources: Featured Courses → existing `/api/courses/` (real). Schools, stories,
events, donation tiers → static config arrays for now (no models yet), structured
so they can swap to API/CMS later without touching the components.

## 4. Desktop wireframe (max-w ~1152px, centered)

```
┌───────────────────────────────────────────────────────────┐
│ NAV  Digital Nalanda [LMS]      Home Courses Schools …  Login│
├───────────────────────────────────────────────────────────┤
│  HERO  (two columns)                                        │
│  ┌───────────────────────────┐   ┌───────────────────────┐ │
│  │ Free Quality Education     │   │                       │ │
│  │ For Every Student          │   │   community imagery / │ │
│  │ (big display heading)      │   │   student success     │ │
│  │ subheadline …              │   │   visual              │ │
│  │ [Start Learning] [▶ Watch] │   │                       │ │
│  │  5000+   600+   100% free  │   └───────────────────────┘ │
│  └───────────────────────────┘                             │
├───────────────────────────────────────────────────────────┤
│  IMPACT   5000+   600+   20+   14   100%   (animated row)   │
├───────────────────────────────────────────────────────────┤
│  SCHOOLS — "Explore our Schools"                            │
│   [card][card][card][card]     (4 across × ~3 rows = 10)    │
│   icon / name / desc / N courses                            │
├───────────────────────────────────────────────────────────┤
│  FEATURED COURSES — "Start learning today"                  │
│   [course][course][course][course]   →  View all courses    │
├───────────────────────────────────────────────────────────┤
│  HOW IT WORKS  ① → ② → ③ → ④ → ⑤ → ⑥  (horizontal timeline) │
├───────────────────────────────────────────────────────────┤
│  SUCCESS STORIES  ◀  [ big photo | quote | name/placement ] ▶│
├───────────────────────────────────────────────────────────┤
│  WORKSHOPS & EVENTS   [event][event][event]                 │
│   speaker • date • topic • [Register]                       │
├───────────────────────────────────────────────────────────┤
│  THE PATH newsletter   headline + [ email ____ ][Subscribe] │
├───────────────────────────────────────────────────────────┤
│  SUPPORT   [₹500][₹1000][₹5000]  impact-framed cards        │
├───────────────────────────────────────────────────────────┤
│  TRUST   20+ educators · universities · 14 libraries        │
├───────────────────────────────────────────────────────────┤
│  FOOTER  About | Schools | Courses | Events | Donate | …    │
└───────────────────────────────────────────────────────────┘
```

## 5. Mobile wireframe (single column, ~380px, mobile-first)

```
┌───────────────────────┐
│ ☰  Digital Nalanda     │
├───────────────────────┤
│ Free Quality Education │
│ For Every Student      │
│ subheadline …          │
│ [ Start Learning ]     │  ← full-width buttons
│ [ ▶ Watch Intro  ]     │
│ 5000+ · 600+ · 100%    │
├───────────────────────┤
│ community image        │
├───────────────────────┤
│ IMPACT (2-col grid)    │
│ [5000+] [600+]         │
│ [20+]   [14]   [100%]  │
├───────────────────────┤
│ SCHOOLS (1–2 col cards)│
│ [card]                 │
│ [card] … (10)          │
├───────────────────────┤
│ FEATURED COURSES       │
│ [course] (stacked)     │
│  → View all            │
├───────────────────────┤
│ HOW IT WORKS           │
│ ① (vertical steps)     │
│ ② …                    │
├───────────────────────┤
│ STORIES (swipe carousel)│
│ ◀ [ photo+quote ] ▶    │
├───────────────────────┤
│ EVENTS (stacked cards) │
├───────────────────────┤
│ NEWSLETTER             │
│ [ email ] [Subscribe]  │
├───────────────────────┤
│ SUPPORT (stacked tiers)│
├───────────────────────┤
│ TRUST                  │
├───────────────────────┤
│ FOOTER (stacked cols)  │
└───────────────────────┘
```

## 6. Why each section exists (objective mapping)

| Section | Primary objective it serves |
|---------|------------------------------|
| Hero | What DN is + first action (Start Learning) → registrations |
| Impact counters | Credibility/trust before any ask |
| Schools | Communicates breadth → "this is a university," aids discovery |
| Featured courses | The core product → course enrollments |
| How it works | Removes friction → conversion to first enrollment |
| Success stories | Emotional trust → registrations + donations |
| Workshops & events | Time-bound urgency → engagement + signups |
| Newsletter | Low-commitment capture → newsletter signups |
| Support | Impact-framed giving → donations (after value shown) |
| Trust indicators | Institutional credibility → overall trust |
| Footer | Deep navigation + SEO |

## 7. Technical approach

- **Next.js App Router**, `app/page.tsx` as a server component that fetches real
  featured courses; section components split into `src/components/home/`.
- **Tailwind CSS** with the existing brand tokens (extend with neutral grays + a
  type scale); reuse `CourseCard`.
- **Animations:** small client components using `IntersectionObserver` for count-up
  and fade/rise; respect `prefers-reduced-motion`. No animation libraries.
- **Performance:** `next/image` for imagery, lazy-load below-the-fold media, keep
  JS minimal (most sections static/server-rendered).
- **Accessibility & SEO:** semantic sections/headings, alt text, labelled inputs,
  metadata; carousel keyboard-navigable.
- **Static-now/dynamic-later:** schools, stories, events, donation tiers live in
  typed config files so they can move to the API/CMS without UI changes.

## 8. Build sequence (once approved)

1. Design tokens + `SectionHeading`, `Container`, `Button` primitives.
2. Hero + ImpactCounters (with count-up).
3. SchoolsGrid + SchoolCard.
4. FeaturedCourses (wire to `/api/courses/`).
5. HowItWorks, SuccessStories (carousel), EventsWorkshops.
6. Newsletter, Support, TrustIndicators.
7. SiteFooter into shared layout.
8. Responsive QA (mobile-first), accessibility pass, type-check.
