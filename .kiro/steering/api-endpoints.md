---
inclusion: manual
---

# GGECL API Endpoints Reference

Base URL: `VITE_API_URL/api`  
Auth: cookie-based session (credentials: "include" on every request)

---

## Courses

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/courses/public` | None | Browse published courses (storefront). Supports: `search`, `instructorId`, `level`, `certification`, `tags`, `minPrice`, `maxPrice`, `cursor`, `limit`, `sortBy`, `sortOrder` |
| GET | `/courses/public/:id` | None | Single published course landing page (outline-only curriculum) |
| GET | `/courses` | Required | List courses scoped by role. ADMIN: all + `status`/`instructorId` filters. INSTRUCTOR: own. STUDENT: published only |
| POST | `/courses` | ADMIN/INSTRUCTOR | Create course. ADMIN must supply `instructorId` |
| GET | `/courses/:id` | Required | Full course detail. Curriculum depth depends on role + enrollment. Returns `isEnrolled` flag |
| PATCH | `/courses/:id` | ADMIN/INSTRUCTOR | Update course |
| DELETE | `/courses/:id` | ADMIN/INSTRUCTOR | Delete course (INSTRUCTOR: DRAFT only) |
| PATCH | `/courses/:id/publish` | ADMIN/INSTRUCTOR | Publish course |
| PATCH | `/courses/:id/archive` | ADMIN/INSTRUCTOR | Archive course |

### Sections
| Method | Path | Description |
|--------|------|-------------|
| POST | `/courses/:id/sections` | Add section. Body: `{ title, position }` |
| PATCH | `/courses/:id/sections/:sectionId` | Update section |
| DELETE | `/courses/:id/sections/:sectionId` | Remove section + all lessons |

### Lessons
| Method | Path | Description |
|--------|------|-------------|
| POST | `/courses/:id/sections/:sectionId/lessons` | Add lesson. Body: `{ title, position, description?, duration?, isPreview? }` |
| PATCH | `/courses/:id/sections/:sectionId/lessons/:lessonId` | Update lesson |
| DELETE | `/courses/:id/sections/:sectionId/lessons/:lessonId` | Remove lesson |

### Materials
| Method | Path | Description |
|--------|------|-------------|
| POST | `/courses/:id/sections/:sectionId/lessons/:lessonId/materials` | Add material. Body: `{ type, title, url, publicId?, fileName?, size? }` |
| DELETE | `/courses/:id/sections/:sectionId/lessons/:lessonId/materials/:materialId` | Remove material |

---

## Auth

All auth routes proxied through Better Auth:
`GET/POST/PUT/DELETE/PATCH/OPTIONS/HEAD /auth/:path`

---

## Activities

| Method | Path | Description |
|--------|------|-------------|
| GET | `/activities` | Paginated activity feed for current user |
| GET | `/activities/unread-count` | Unread badge count |
| GET | `/activities/:id` | Single activity |
| DELETE | `/activities/:id` | Delete activity |
| PATCH | `/activities/bulk/read` | Mark all as read |
| PATCH | `/activities/:id/read` | Mark one as read |
| DELETE | `/activities/bulk` | Delete all activities |

---

## Enrollments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/enrollments` | STUDENT | Enroll. Body: `{ courseId }` |
| GET | `/enrollments` | ADMIN | List all enrollments |
| GET | `/enrollments/count` | Public | Enrollment count |
| DELETE | `/enrollments/:courseId` | STUDENT | Unenroll |
| GET | `/enrollments/mine` | STUDENT | My enrollments (all enrolled courses with course details) |
| GET | `/enrollments/courses/by-enrollments` | ADMIN | Courses ranked by enrollment count |
| GET | `/enrollments/course/:courseId` | ADMIN/INSTRUCTOR | Enrollments for a specific course |

---

## Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users/public` | None | List users publicly |
| GET | `/users/public/:id` | None | Single public user |
| GET | `/users/search` | ADMIN | Search users |
| POST | `/users` | — | Create user |
| GET | `/users` | ADMIN | All users with full detail |
| GET | `/users/mine` | Required | My own profile |
| GET | `/users/:id` | Required | Single user by ID |
| PATCH | `/users/:id` | Required | Update user |
| DELETE | `/users/:id` | Required | Delete user |

---

## Assignments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/assignments` | INSTRUCTOR | Create assignment |
| GET | `/assignments` | INSTRUCTOR/ADMIN | List assignments |
| GET | `/assignments/:id` | — | Get assignment |
| PATCH | `/assignments/:id` | INSTRUCTOR | Update assignment |
| DELETE | `/assignments/:id` | INSTRUCTOR | Delete assignment |
| GET | `/assignments/:id/submissions` | INSTRUCTOR | All submissions |
| GET | `/assignments/:id/stats` | INSTRUCTOR | Submission stats |
| PATCH | `/assignments/submissions/:submissionId/grade` | INSTRUCTOR | Grade submission |
| GET | `/assignments/overview/instructor` | INSTRUCTOR | Aggregated stats |
| GET | `/assignments/overview/admin` | ADMIN | Platform-wide stats |
| GET | `/assignments/student/list` | STUDENT | My assignments with submission status |
| POST | `/assignments/:id/submit` | STUDENT | Submit assignment |
| GET | `/assignments/:id/my-submission` | STUDENT | My submission for an assignment |

---

## Wishlist

| Method | Path | Description |
|--------|------|-------------|
| GET | `/wishlist` | Get wishlist |
| POST | `/wishlist` | Add course. Body: `{ courseId }` |
| DELETE | `/wishlist` | Clear wishlist |
| DELETE | `/wishlist/:courseId` | Remove course |
| POST | `/wishlist/move-to-cart` | Move to cart |

---

## Cart

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cart` | Get cart |
| POST | `/cart` | Add course |
| DELETE | `/cart` | Clear cart |
| DELETE | `/cart/:courseId` | Remove course |
| POST | `/cart/move-to-wishlist` | Move to wishlist |

---

## Admin Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/admin/summary` | Full snapshot |
| GET | `/dashboard/admin/students` | Student counts |
| GET | `/dashboard/admin/instructors` | Instructor counts |
| GET | `/dashboard/admin/courses` | Course counts by status |
| GET | `/dashboard/admin/revenue` | Revenue for date range |
| GET | `/dashboard/admin/completion-rate` | Platform-wide completion rate |
| GET | `/dashboard/admin/top-enrollments` | Top N most enrolled courses |
| GET | `/dashboard/admin/signups` | New user signups for date range |
| GET | `/dashboard/admin/activities` | Recent platform-wide activities |

---

## Instructor Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/instructor/summary` | Full snapshot |
| GET | `/dashboard/instructor/students` | Total unique students (count) |
| GET | `/dashboard/instructor/students/all` | All unique students with details |
| GET | `/dashboard/instructor/students/per-course` | Students by course |
| GET | `/dashboard/instructor/reviews` | Overall + per-course avg ratings |
| GET | `/dashboard/instructor/reviews/recent` | Most recent reviews |
| GET | `/dashboard/instructor/completion-rate` | Completion rates |
| GET | `/dashboard/instructor/activity` | Aggregate student activity totals |
| GET | `/dashboard/instructor/activity/timeline` | Activity time-series |
| GET | `/dashboard/instructor/activity/per-course` | Activity by course |
| GET | `/dashboard/instructor/top-courses` | Top N by enrollment |
| GET | `/dashboard/instructor/notifications` | Activity feed |

---

## Reviews

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/reviews/courses/:courseId` | None | Paginated reviews. Params: `page`, `limit`, `rating`, `sort` (newest/oldest/highest/lowest) |
| GET | `/reviews/instructors/:instructorUserId` | None | Aggregated instructor reviews |
| GET | `/reviews/courses/:courseId/my-review` | STUDENT | My review for a course |
| POST | `/reviews` | STUDENT | Submit review |
| PATCH | `/reviews/:reviewId` | STUDENT | Edit review |
| DELETE | `/reviews/:reviewId` | STUDENT | Delete review |
| POST | `/reviews/:reviewId/reply` | INSTRUCTOR | Reply to review |
| PATCH | `/reviews/replies/:replyId` | INSTRUCTOR | Edit reply |
| DELETE | `/reviews/replies/:replyId` | INSTRUCTOR | Delete reply |

---

## Achievements

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/achievements/me` | Required | My earned achievements |
| GET | `/achievements/user/:userId` | None | User's achievements (public) |
| GET | `/achievements` | ADMIN | All defined achievements |
| POST | `/achievements/grant` | ADMIN | Manually grant achievement |

---

## Progress

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/progress/dashboard` | STUDENT | Full learning dashboard |
| GET | `/progress/top-courses` | STUDENT | Enrolled courses sorted by relevance (in-progress first). Returns `{ id, title, img, progress, enrolledAt, completedAt }[]` |
| GET | `/progress/xp` | STUDENT | XP and level state |
| GET | `/progress/watch-time` | STUDENT | Watch time analytics |
| GET | `/progress/courses/:courseId` | STUDENT | Course progress detail |
| PATCH | `/progress/lessons/:lessonId` | STUDENT | Update lesson watch progress. Body: `{ watchedSeconds, totalSeconds }` |
| POST | `/progress/lessons/:lessonId/complete` | STUDENT | Mark lesson complete |
| POST | `/progress/courses/:courseId/complete` | STUDENT | Mark course complete |
| GET | `/progress/instructor/watch-time` | INSTRUCTOR/ADMIN | Watch time analytics |
| GET | `/progress/streak` | STUDENT | Current streak state |

---

## Support Tickets

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/support-tickets` | Required | Create ticket |
| GET | `/support-tickets` | ADMIN | List all tickets |
| GET | `/support-tickets/mine` | Required | My tickets |
| GET | `/support-tickets/:id` | Required | Single ticket |
| DELETE | `/support-tickets/:id` | ADMIN | Delete ticket |
| GET | `/support-tickets/admin/stats` | ADMIN | Ticket status counts |
| PATCH | `/support-tickets/:id/status` | ADMIN | Update status |
| POST | `/support-tickets/:id/notes` | ADMIN | Add internal note |

---

## Search

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/search/public` | None | Public search |
| GET | `/search` | Required | Authenticated global search |

---

## Storage

| Method | Path | Description |
|--------|------|-------------|
| POST | `/storage/presigned-upload` | Get pre-signed PUT URL for direct-to-R2 upload |
| GET | `/storage/signed-url` | Temporary signed GET URL for private object |
| DELETE | `/storage/file` | Delete file from R2 |

---

## Quizzes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/quizzes` | INSTRUCTOR | Create quiz for a course section |
| GET | `/quizzes` | INSTRUCTOR/ADMIN | List quizzes |
| GET | `/quizzes/:id` | — | Get quiz |
| PATCH | `/quizzes/:id` | INSTRUCTOR | Update quiz |
| DELETE | `/quizzes/:id` | INSTRUCTOR | Delete quiz |
| GET | `/quizzes/:id/attempts` | INSTRUCTOR | All student attempts |
| GET | `/quizzes/:id/stats` | INSTRUCTOR | Attempt stats |
| POST | `/quizzes/:id/submit` | STUDENT | Submit attempt |
| GET | `/quizzes/:id/my-attempt` | STUDENT | My attempt |

---

## Chat

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/chat/rooms` | Required | List rooms caller belongs to |
| POST | `/chat/rooms/classroom` | INSTRUCTOR/ADMIN | Create classroom room |
| POST | `/chat/rooms/group` | INSTRUCTOR/ADMIN | Create group room |
| PATCH | `/chat/rooms/:roomId` | INSTRUCTOR/ADMIN | Update room name/description |
| GET | `/chat/rooms/:roomId/summary` | Required | Room summary (description, messages, members, pinned, grade) |
| POST | `/chat/rooms/:roomId/members` | INSTRUCTOR/ADMIN | Add members |
| DELETE | `/chat/rooms/:roomId/members` | INSTRUCTOR/ADMIN | Remove member |
| PATCH | `/chat/rooms/:roomId/members/role` | INSTRUCTOR/ADMIN | Set member role |
| GET | `/chat/rooms/:roomId/messages` | Required | Paginated messages |
| POST | `/chat/rooms/:roomId/messages` | Required | Send message (with optional file attachments) |
| DELETE | `/chat/rooms/:roomId/messages/:messageId` | Required | Delete message |
| POST | `/chat/rooms/:roomId/messages/:messageId/react` | Required | Toggle reaction |
| POST | `/chat/rooms/:roomId/messages/:messageId/pin` | INSTRUCTOR/ADMIN | Pin message |
| DELETE | `/chat/rooms/:roomId/messages/:messageId/pin` | INSTRUCTOR/ADMIN | Unpin message |
| POST | `/chat/rooms/:roomId/grade` | INSTRUCTOR | Grade group room |
| GET | `/chat/rooms/:roomId/grade` | Required | Get group room grade |

---

## Email

| Method | Path | Description |
|--------|------|-------------|
| POST | `/email/send` | Send email |
