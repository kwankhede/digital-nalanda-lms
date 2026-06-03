# Entity Relationship Diagram

> Core data model for Digital Nalanda LMS. Apps: `users`, `courses`,
> `enrollments`, `progress`, `certificates`, `live_sessions`, `content`.

```mermaid
erDiagram
    USER ||--o{ ENROLLMENT : has
    USER ||--o{ LESSONPROGRESS : tracks
    USER ||--o{ CERTIFICATE : earns
    USER ||--o{ SESSIONATTENDANCE : attends
    USER ||--o{ LIVESESSION : mentors

    CATEGORY ||--o{ COURSE : groups
    COURSE ||--o{ MODULE : contains
    MODULE ||--o{ LESSON : contains
    COURSE ||--o{ ENROLLMENT : has
    COURSE ||--o{ CERTIFICATE : issues
    COURSE ||--o{ LIVESESSION : "may relate"

    ENROLLMENT }o--|| USER : student
    LESSONPROGRESS }o--|| LESSON : lesson
    LIVESESSION ||--o{ SESSIONATTENDANCE : records

    STORYCATEGORY ||--o{ STORY : groups
    STORY ||--o{ STORYMEDIA : has

    SCHOOL { string name string slug int course_count int order bool is_published }
    LEARNINGPATH { string name string slug int course_count bool is_published }
    EDUCATOR { string name string expertise string school bool is_featured }
    COMMUNITYLIBRARY { string name string location }
    IMPACTMETRIC { int value string suffix string label int order }
    NEWSLETTERSUBSCRIBER { string email datetime created_at }

    USER {
      string email PK
      string role
      string full_name
      bool is_staff
    }
    COURSE {
      string title
      string slug
      string level
      string language
      bool is_free
      bool is_published
      string external_id
      string source_platform
    }
    ENROLLMENT {
      string status
      int progress_percentage
      datetime completed_at
    }
    CERTIFICATE {
      string certificate_number
      string verification_code
      bool is_revoked
    }
    LIVESESSION {
      string title
      string slug
      datetime start_time
      string status
      string zoom_join_url
      string recording_url
    }
    STORY {
      string title
      string slug
      string student_name
      bool is_featured
    }
```

## Notes on relationships

- **User** is a custom model (`AUTH_USER_MODEL = users.User`); email is the login
  identifier and unique. `role` ∈ {student, mentor, content_manager, admin}.
- **Course → Module → Lesson** is the content hierarchy. `Course`, `Module`,
  `Lesson` carry migration-readiness fields (`external_id`, `source_platform`,
  `original_url`, `migration_notes`, `imported_at`).
- **Enrollment** is unique per (student, course); **LessonProgress** unique per
  (student, lesson). `recalc_progress` recomputes `progress_percentage`/status
  and auto-issues a **Certificate** on completion.
- **LiveSession**/**Event** are loosely related to schools/courses by name today;
  **SessionAttendance** is unique per (student, session).
- **content** app (homepage data): School, LearningPath, Educator,
  CommunityLibrary, ImpactMetric, Story (+ StoryCategory, StoryMedia),
  NewsletterSubscriber — all admin-managed and exposed via public read APIs.
