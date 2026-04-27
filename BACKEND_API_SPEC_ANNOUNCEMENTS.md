# Backend API Specification - Announcements System

## Overview
This document contains all TypeScript types and API specifications needed to implement the announcements system on the backend.

---

## 1. Core Data Types

### AudienceType
```typescript
type AudienceType = 
  | "all_students"        // All enrolled students
  | "all_instructors"     // All instructors
  | "everyone"            // All platform users (students + instructors)
  | "specific_student"    // Single student by ID
  | "specific_instructor" // Single instructor by ID
```

### AnnouncementType
```typescript
type AnnType = 
  | "info"        // General information
  | "alert"       // Important alert/warning
  | "update"      // Platform update
  | "promotion"   // Promotional content
  | "maintenance" // Maintenance notice
```

### AnnouncementStatus
```typescript
type AnnStatus = 
  | "sent"   // Successfully sent
  | "draft"  // Saved as draft
```

### Announcement Entity
```typescript
interface Announcement {
  id: string;                    // Unique identifier (e.g., "ann-1234567890")
  title: string;                 // Max 120 characters
  body: string;                  // Max 1000 characters
  type: AnnType;                 // Type of announcement
  audienceType: AudienceType;    // Target audience
  audienceLabel: string;         // Human-readable audience (e.g., "All Students", "John Doe")
  audienceCount: number;         // Number of recipients
  status: AnnStatus;             // Current status
  sentAt: string;                // Date sent (formatted: "1 Jan 2024") or "—" for drafts
  sentBy: string;                // Admin name who sent it
  openRate?: number;             // Optional: percentage of recipients who opened (0-100)
}
```

### User (for recipient search)
```typescript
interface RealUser {
  id: string;           // User unique ID
  name: string;         // Full name
  email: string;        // Email address
  image?: string | null; // Optional avatar URL
}
```

---

## 2. Email API Endpoint

### POST `/email/send`

**Purpose**: Send announcement emails to recipients

**Request Body**:
```typescript
interface SendEmailRequest {
  type: "ANNOUNCEMENT";  // Email template type
  to: string;            // Recipient email address
  data: {
    subject: string;     // Email subject line
    body: string;        // Email body content
  };
}
```

**Example Request**:
```json
{
  "type": "ANNOUNCEMENT",
  "to": "student@example.com",
  "data": {
    "subject": "[GGECL] Scheduled Maintenance",
    "body": "[INFO] Scheduled Maintenance\n\nWe will be performing system maintenance on Sunday at 3AM...\n\n---\nYou received this because you are a member of the GGECL platform."
  }
}
```

**Response**:
```typescript
// Success: 200 OK
{
  "success": true,
  "messageId": "string" // Optional: email service message ID
}

// Error: 400/500
{
  "error": "string",
  "message": "string"
}
```

**Notes**:
- The backend should support `type: "ANNOUNCEMENT"` in the `SendEmailDto` enum
- Email body is pre-formatted by frontend with announcement type prefix
- Frontend handles batch sending by calling this endpoint multiple times
- Failures should be graceful - frontend will continue even if email fails

---

## 3. User Search API

### GET `/users`

**Purpose**: Search and list users for recipient selection

**Query Parameters**:
```typescript
interface UserSearchParams {
  role?: "STUDENT" | "INSTRUCTOR";  // Filter by role
  search?: string;                   // Search by name or email
  limit?: number;                    // Results per page (default: 20)
  cursor?: string;                   // Pagination cursor
}
```

**Example Request**:
```
GET /users?role=STUDENT&search=john&limit=20
```

**Response**:
```typescript
interface UserSearchResponse {
  data: RealUser[];  // or items: RealUser[]
  meta?: {
    total: number;        // Total count
    nextCursor?: string;  // Next page cursor
  };
  // Alternative structure:
  items?: RealUser[];
  total?: number;
  nextCursor?: string;
}
```

**Example Response**:
```json
{
  "data": [
    {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "image": "https://example.com/avatar.jpg"
    }
  ],
  "meta": {
    "total": 150,
    "nextCursor": "cursor-abc123"
  }
}
```

**Notes**:
- Frontend supports both response structures (data/items, meta/direct)
- Used for searching specific students/instructors
- Also used to get total counts for audience statistics

---

## 4. Announcement CRUD API (Optional - Currently Local Storage)

### POST `/announcements`

**Purpose**: Create a new announcement

**Request Body**:
```typescript
interface CreateAnnouncementRequest {
  title: string;                 // Max 120 chars
  body: string;                  // Max 1000 chars
  type: AnnType;
  audienceType: AudienceType;
  audienceLabel: string;
  audienceCount: number;
  status: AnnStatus;
  recipientIds?: string[];       // Optional: specific user IDs if audience is specific
}
```

**Response**:
```typescript
{
  "id": "string",
  "createdAt": "2024-01-01T00:00:00Z",
  ...rest of announcement fields
}
```

### GET `/announcements`

**Purpose**: List all announcements

**Query Parameters**:
```typescript
interface ListAnnouncementsParams {
  type?: AnnType;
  audienceType?: AudienceType;
  status?: AnnStatus;
  search?: string;
  limit?: number;
  cursor?: string;
}
```

**Response**:
```typescript
{
  "data": Announcement[],
  "meta": {
    "total": number,
    "nextCursor"?: string
  }
}
```

### GET `/announcements/:id`

**Purpose**: Get single announcement

**Response**: `Announcement`

### PATCH `/announcements/:id`

**Purpose**: Update announcement (for drafts)

**Request Body**: Partial `Announcement`

### DELETE `/announcements/:id`

**Purpose**: Delete announcement

**Response**: `{ "success": true }`

---

## 5. Email Template

### ANNOUNCEMENT Template

The backend email service should support an `ANNOUNCEMENT` template type that formats emails appropriately.

**Template Variables**:
```typescript
{
  subject: string;  // Email subject
  body: string;     // Pre-formatted body from frontend
}
```

**Email Format**:
```
Subject: {subject}

{body}

---
GGECL Learning Platform
[Unsubscribe link]
```

---

## 6. Frontend Email Body Format

The frontend sends emails with this format:

```
[TYPE] Title

Body content here...

---
You received this because you are a member of the GGECL platform.
```

**Example**:
```
[INFO] Scheduled Maintenance

We will be performing system maintenance on Sunday at 3AM. The platform will be unavailable for approximately 2 hours.

---
You received this because you are a member of the GGECL platform.
```

---

## 7. Batch Email Sending Logic

The frontend handles batch sending with this logic:

```typescript
// For specific person
if (audienceType === "specific_student" || audienceType === "specific_instructor") {
  await sendEmail(selectedUser.email, subject, body);
}

// For all students/instructors/everyone
else {
  const roles = 
    audienceType === "all_students" ? ["STUDENT"] :
    audienceType === "all_instructors" ? ["INSTRUCTOR"] :
    ["STUDENT", "INSTRUCTOR"];

  for (const role of roles) {
    let cursor = undefined;
    while (true) {
      const response = await GET /users?role={role}&limit=50&cursor={cursor}
      const users = response.data || response.items;
      
      // Send to all users in batch
      await Promise.all(users.map(user => 
        sendEmail(user.email, subject, body)
      ));
      
      cursor = response.meta?.nextCursor || response.nextCursor;
      if (!cursor || users.length === 0) break;
    }
  }
}
```

---

## 8. Database Schema Suggestions

### announcements table
```sql
CREATE TABLE announcements (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  body TEXT NOT NULL,
  type ENUM('info', 'alert', 'update', 'promotion', 'maintenance') NOT NULL,
  audience_type ENUM('all_students', 'all_instructors', 'everyone', 'specific_student', 'specific_instructor') NOT NULL,
  audience_label VARCHAR(255) NOT NULL,
  audience_count INT NOT NULL,
  status ENUM('sent', 'draft') NOT NULL,
  sent_at TIMESTAMP NULL,
  sent_by VARCHAR(255) NOT NULL,
  open_rate DECIMAL(5,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### announcement_recipients table (optional - for tracking)
```sql
CREATE TABLE announcement_recipients (
  id VARCHAR(255) PRIMARY KEY,
  announcement_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP NOT NULL,
  opened_at TIMESTAMP NULL,
  FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 9. Implementation Priority

### Phase 1 (Critical)
1. ✅ Add `ANNOUNCEMENT` type to email service `SendEmailDto` enum
2. ✅ Implement `POST /email/send` with ANNOUNCEMENT template
3. ✅ Ensure `GET /users` supports role filtering and search

### Phase 2 (Recommended)
4. Implement `POST /announcements` to persist announcements
5. Implement `GET /announcements` for listing
6. Implement `DELETE /announcements/:id`

### Phase 3 (Optional)
7. Add email open tracking (webhook from email service)
8. Add `PATCH /announcements/:id` for editing drafts
9. Add analytics endpoints for announcement metrics

---

## 10. Error Handling

### Email Send Failures
- Frontend expects graceful failures
- If email service is unavailable, return 503 but don't crash
- Frontend will show warning but continue

### User Search
- Return empty array if no results
- Support both `data` and `items` response formats
- Include total count for pagination

### Validation
- Title: max 120 characters
- Body: max 1000 characters
- Email: valid email format
- Type: must be one of valid AnnType values
- AudienceType: must be one of valid AudienceType values

---

## 11. Testing Checklist

- [ ] Email service accepts `type: "ANNOUNCEMENT"`
- [ ] Email template formats correctly
- [ ] User search returns correct results
- [ ] User search supports pagination
- [ ] Batch email sending works for large audiences
- [ ] Draft announcements can be saved
- [ ] Sent announcements are persisted
- [ ] Email failures are handled gracefully
- [ ] Open rate tracking works (if implemented)

---

## 12. Frontend Current State

**Note**: The frontend currently uses **localStorage** for announcement persistence. Once the backend APIs are implemented, the frontend will need to be updated to:

1. Replace localStorage with API calls
2. Add React Query mutations for CRUD operations
3. Add error handling for API failures
4. Add loading states during API calls

The frontend is ready to integrate - all types and interfaces are already defined and match this specification.

---

## Questions?

Contact the frontend team if you need clarification on:
- Expected response formats
- Error handling behavior
- Additional fields needed
- Integration timeline
