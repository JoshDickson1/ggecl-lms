| col1 | col2 | col3 |
| ---- | ---- | ---- |
|      |      |      |
|      |      |      |

# Classroom Module Documentation

## Overview

The Classroom module provides functionality for managing virtual classrooms, including activities, groups, assignments, attendance, and file sharing. It integrates with the Notification and Upload services.

## Models

### Classroom

```typescript
interface IClassroom {
  name: string;
  course: Types.ObjectId; // Reference to Course
  instructors: Types.ObjectId[]; // Array of User references
  students: Types.ObjectId[]; // Array of User references
  activities: IClassroomActivity[];
  groups: IClassroomGroup[];
  attendance: IClassroomAttendance[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Classroom Activity

```typescript
interface IClassroomActivity {
  title: string;
  description?: string;
  files: {
    url: string;
    name: string;
    type: "video" | "pdf" | "document" | "audio" | "image";
  }[];
  createdAt: Date;
  createdBy: Types.ObjectId; // User reference
}
```

### Classroom Group

```typescript
interface IClassroomGroup {
  name: string;
  students: Types.ObjectId[]; // Array of User references
  assignments: IGroupAssignment[];
  createdAt: Date;
  createdBy: Types.ObjectId; // User reference
}
```

### Group Assignment

```typescript
interface IGroupAssignment {
  assignmentId: Types.ObjectId; // Assignment reference
  grades: {
    student: Types.ObjectId; // User reference
    score: number;
    feedback?: string;
    gradedBy: Types.ObjectId; // User reference
    gradedAt: Date;
  }[];
}
```

### Classroom Attendance

```typescript
interface IClassroomAttendance {
  student: Types.ObjectId; // User reference
  duration: number; // in minutes
  date: Date;
}
```

## API Endpoints

### Classroom Management

- `POST /classrooms` - Create a new classroom
- `GET /classrooms/:classroomId` - Get classroom details
- `GET /classrooms/course/:courseId` - Get classrooms by course
- `POST /classrooms/:classroomId/students` - Add student to classroom
- `DELETE /classrooms/:classroomId/students/:studentId` - Remove student from classroom

### Activities

- `POST /classrooms/:classroomId/activities` - Add activity to classroom

### Groups

- `POST /classrooms/:classroomId/groups` - Create new group
- `DELETE /classrooms/:classroomId/groups/:groupName` - Delete group
- `GET /classrooms/:classroomId/groups` - Get all groups in classroom
- `POST /classrooms/:classroomId/groups/:groupName/students` - Add students to group
- `DELETE /classrooms/:classroomId/groups/:groupName/students` - Remove students from group

### Assignments

- `POST /classrooms/:classroomId/groups/:groupName/assignments/:assignmentId/grade` - Grade group assignment

### Attendance

- `POST /classrooms/:classroomId/attendance/:studentId` - Record student attendance

### File Uploads

- `POST /classrooms/:classroomId/:groupName/upload` - Upload multiple files to group
- `POST /classrooms/:classroomId/:groupName/upload-single` - Upload single file to group

## Services

### ClassroomService

Main service class with methods for:

- Classroom CRUD operations
- Managing classroom members (instructors/students)
- Activity management
- Group management (create, delete, add/remove students)
- Assignment grading
- Attendance tracking

Key methods:

- `createClassroom()` - Creates new classroom
- `addActivity()` - Adds activity to classroom
- `createGroup()` - Creates new group
- `addStudentsToGroup()` - Adds students to existing group
- `gradeGroupAssignment()` - Grades assignments for group members
- `recordAttendance()` - Records student attendance duration

## Controllers

### ClassroomController

Handles HTTP requests and responses for classroom operations. Includes:

- Input validation
- Error handling
- Response formatting
- Authentication/authorization checks

## Socket.IO Integration

The classroom module supports real-time updates via Socket.IO for:

- New messages in group discussions
- File upload notifications
- Activity notifications

## Notification Integration

Automatically sends notifications for:

- New classroom creation
- Student additions/removals
- Group changes
- New activities
- Assignment grading
- File uploads

## Error Handling

Common error scenarios:

- Invalid classroom/group/assignment IDs
- Permission denied (non-instructors modifying groups)
- Duplicate group names
- Attempting to add non-enrolled students to groups

## Security

- All endpoints require authentication
- Instructor/admin restricted operations are protected by role middleware
- File uploads are validated and processed securely

## Usage Examples

### Creating a Classroom

```javascript
POST /classrooms
{
  "name": "Math 101 - Fall 2023",
  "courseId": "5f8d0d55b54764421b7156da"
}
```

### Adding an Activity

```javascript
POST /classrooms/5f8d0d55b54764421b7156db/activities
{
  "title": "Week 1 Lecture",
  "description": "Introduction to Algebra",
  "files": [
    {
      "url": "https://example.com/lecture1.pdf",
      "name": "Lecture Slides",
      "type": "pdf"
    }
  ]
}
```

### Creating a Group

```javascript
POST /classrooms/5f8d0d55b54764421b7156db/groups
{
  "name": "Group A",
  "studentIds": ["5f8d0d55b54764421b7156dc", "5f8d0d55b54764421b7156dd"]
}
```

### Uploading Files to Group

```javascript
POST /classrooms/5f8d0d55b54764421b7156db/group-a/upload
Form Data:
- files[]: (multiple files)
- senderId: "5f8d0d55b54764421b7156de"
- role: "student"
- text: "Here are my project files"
```

# Classroom Real-time Communication (Socket.IO) Documentation

## Overview

The Classroom module includes real-time communication features for group discussions within classrooms. This functionality is built using Socket.IO and provides:

- Real-time messaging in classroom groups
- Typing indicators
- Secure group joining with authorization checks

## Socket Events

### 1. Joining a Classroom Group

- **Event Name**: `joinClassroomGroup`
- **Description**: Allows users to join a classroom group discussion
- **Authentication**: Required (socket must be authenticated)
- **Authorization**: User must be either:
  - A student in the specified group
  - An instructor in the classroom
- **Emitted Data**:
  ```typescript
  {
    classroomId: string; // MongoDB ObjectId of the classroom
    groupName: string; // Name of the group to join
    userId: string; // MongoDB ObjectId of the user
    role: string; // User role ('student' or 'instructor')
  }
  ```
- **Success Response**: User joins Socket.IO room `classroom-{classroomId}-{groupName}`
- **Error Events**:
  - `classroomError`: Emitted with error message if:
    - User is not authorized to join
    - Classroom/group doesn't exist
    - Server error occurs

### 2. Sending Classroom Messages

- **Event Name**: `sendClassroomMessage`
- **Description**: Sends a message to a classroom group
- **Authentication**: Required
- **Authorization**: Same as joining requirements
- **Emitted Data**:
  ```typescript
  {
    classroomId: string;   // MongoDB ObjectId
    groupName: string;     // Group name
    senderId: string;      // MongoDB ObjectId
    role: string;          // 'student' or 'instructor'
    text?: string;         // Optional text message
    files?: Array<{        // Optional file attachments
      url: string;         // File URL
      name: string;        // Original filename
      type: string;        // File type ('video', 'pdf', etc.)
    }>;
  }
  ```
- **Success Flow**:
  1. Verifies user is in the classroom group
  2. Saves message to database
  3. Broadcasts message to all group members via `newClassroomMessage` event
- **Database Schema**:
  ```typescript
  {
    classroomId: Types.ObjectId;
    groupName: string;
    senderId: Types.ObjectId;
    sender: string;        // 'Instructor' or 'Student'
    role: string;          // 'student' or 'instructor'
    text?: string;
    files?: Array<{
      url: string;
      name: string;
      type: string;
    }>;
    createdAt: Date;       // Auto-generated
  }
  ```
- **Broadcast Event**: `newClassroomMessage` (sent to room members)
- **Error Events**:
  - `classroomError`: Emitted if:
    - User not authorized
    - Message saving fails
    - Invalid data

### 3. Typing Indicators

- **Event Name**: `typingInClassroom`
- **Description**: Notifies group members when someone is typing
- **Authentication**: Required
- **Emitted Data**:
  ```typescript
  {
    classroomId: string; // MongoDB ObjectId
    groupName: string; // Group name
    senderName: string; // Display name of typing user
  }
  ```
- **Broadcast Event**: `classroomTyping` (sent to all room members except sender)
  ```typescript
  {
    senderName: string; // Display name of typing user
  }
  ```

## Security Considerations

1. **Authentication**: All events require authenticated sockets
2. **Authorization**: Server verifies user is in classroom group before:
   - Allowing joining
   - Accepting messages
   - Showing typing indicators
3. **Data Validation**:
   - Validates MongoDB ObjectIds
   - Checks for empty messages
   - Validates user roles

## Usage Examples

### Frontend Implementation

```javascript
// Join classroom group
socket.emit("joinClassroomGroup", {
  classroomId: "65a1b...",
  groupName: "Group A",
  userId: "65a1b...",
  role: "student",
});

// Send message
socket.emit("sendClassroomMessage", {
  classroomId: "65a1b...",
  groupName: "Group A",
  senderId: "65a1b...",
  role: "student",
  text: "Hello everyone!",
  files: [
    {
      url: "https://...",
      name: "notes.pdf",
      type: "pdf",
    },
  ],
});

// Typing indicator
socket.emit("typingInClassroom", {
  classroomId: "65a1b...",
  groupName: "Group A",
  senderName: "John Doe",
});

// Listen for messages
socket.on("newClassroomMessage", (message) => {
  console.log("New message:", message);
});

// Listen for typing indicators
socket.on("classroomTyping", ({ senderName }) => {
  console.log(`${senderName} is typing...`);
});

// Error handling
socket.on("classroomError", (error) => {
  console.error("Classroom error:", error);
});
```

## Error Handling

All classroom-related socket operations can emit `classroomError` events with descriptive messages:

- "Not authorized to join this group"
- "Failed to join group"
- "Not authorized" (for sending messages)
- "Failed to send message"

# Course Materials Module Documentation

## Overview

This module handles the uploading, management, and retrieval of course materials. It supports both single and batch file uploads to Cloudinary storage and integrates with the Course model.

## API Endpoints

### 1. Upload Single Material

- **Endpoint**: `POST /courses/:courseId/materials`
- **Description**: Upload a single file as course material
- **Authentication**: Required
- **Roles**: Instructor, Admin
- **Request Type**: `multipart/form-data`
- **Request Body**:
  ```javascript
  {
    "material": File, // The file to upload
    "title": "string", // Optional, defaults to filename
    "description": "string" // Optional
  }
  ```
- **Response (Success - 201)**:
  ```javascript
  {
    "message": "Material uploaded successfully",
    "material": {
      "title": "string",
      "description": "string",
      "url": "string", // Cloudinary URL
      "publicId": "string", // Cloudinary public ID
      "fileType": "string", // MIME type
      "fileName": "string",
      "size": number, // File size in bytes
      "uploadedBy": "ObjectId",
      "uploadedAt": "ISO Date"
    }
  }
  ```
- **Possible Errors**:
  - 400: No file uploaded or invalid IDs
  - 403: Unauthorized (not instructor/admin)
  - 404: Course not found
  - 500: Upload failed

### 2. Upload Multiple Materials

- **Endpoint**: `POST /courses/:courseId/materials/batch`
- **Description**: Upload multiple files as course materials in one request
- **Authentication**: Required
- **Roles**: Instructor, Admin
- **Request Type**: `multipart/form-data`
- **Request Body**:
  ```javascript
  {
    "materials": [File, File, ...] // Array of files to upload
  }
  ```
- **Response (Success - 201)**:
  ```javascript
  {
    "message": "Materials uploaded successfully",
    "count": number, // Number of files uploaded
    "materials": [
      {
        "title": "string",
        "description": "string",
        "url": "string",
        "publicId": "string",
        "fileType": "string",
        "fileName": "string",
        "size": number,
        "uploadedBy": "ObjectId",
        "uploadedAt": "ISO Date"
      },
      ...
    ]
  }
  ```
- **Possible Errors**:
  - 400: No files uploaded or invalid IDs
  - 403: Unauthorized (not instructor/admin)
  - 404: Course not found
  - 500: Upload failed

### 3. Get Course Materials

- **Endpoint**: `GET /courses/:courseId/materials`
- **Description**: Retrieve all materials for a course
- **Authentication**: Required
- **Roles**: Any authenticated user
- **Response (Success - 200)**:
  ```javascript
  {
    "materials": [
      {
        "_id": "ObjectId",
        "title": "string",
        "description": "string",
        "url": "string",
        "publicId": "string",
        "fileType": "string",
        "fileName": "string",
        "size": number,
        "uploadedBy": "ObjectId",
        "uploadedAt": "ISO Date"
      },
      ...
    ]
  }
  ```
- **Possible Errors**:
  - 400: Invalid course ID
  - 404: Course not found
  - 500: Server error

### 4. Delete Material

- **Endpoint**: `DELETE /courses/:courseId/materials/:materialId`
- **Description**: Delete a course material (removes from both database and Cloudinary)
- **Authentication**: Required
- **Roles**: Instructor, Admin
- **Response (Success - 200)**:
  ```javascript
  {
    "message": "Material deleted successfully"
  }
  ```
- **Possible Errors**:
  - 400: Invalid IDs
  - 403: Unauthorized (not instructor/admin)
  - 404: Course or material not found
  - 500: Deletion failed

## File Handling

- **Storage**: Files are stored in Cloudinary under folder `course_materials/:courseId`
- **File Size Limit**: 500MB per file
- **Batch Limit**: Maximum 10 files per batch upload
- **Supported File Types**: All file types (Cloudinary auto-detects resource type)

## Security

- All endpoints require authentication
- Upload/delete operations restricted to instructors and admins
- Materials are stored with unique public IDs to prevent guessing attacks
- File uploads are validated before processing

## Usage Examples

### Uploading a Single File

```javascript
const formData = new FormData();
formData.append("material", fileInput.files[0]);
formData.append("title", "Lecture Notes");
formData.append("description", "Week 1 Introduction");

fetch("/courses/5f8d0d55b54764421b7156da/materials", {
  method: "POST",
 credentials:include
  body: formData,
});
```

### Uploading Multiple Files

```javascript
const formData = new FormData();
for (let i = 0; i < files.length; i++) {
  formData.append("materials", files[i]);
}

fetch("/courses/5f8d0d55b54764421b7156da/materials/batch", {
  method: "POST",
  credentials:include
  body: formData,
});
```

### Retrieving Materials

```javascript
fetch("/courses/5f8d0d55b54764421b7156da/materials", {
  credentials: include,
})
  .then((response) => response.json())
  .then((data) => console.log(data.materials));
```

### Deleting a Material

```javascript
fetch("/courses/5f8d0d55b54764421b7156da/materials/5f8d0d55b54764421b7156db", {
  method: "DELETE",
  credentials: include,
});
```

# Audit Log Module Documentation

## Overview

The Audit Log module tracks and records important actions within the LMS system for security, compliance, and troubleshooting purposes. It provides administrators with visibility into system activities.

## Models

### AuditLog

```typescript
interface IAuditLog {
  action: AuditAction; // Type of action performed
  userId: Types.ObjectId; // Who performed the action
  userRole: "admin" | "instructor" | "student"; // Role of user
  entityType: EntityType; // What entity was affected
  entityId?: Types.ObjectId; // ID of affected entity
  targetUserId?: Types.ObjectId; // If action affects another user
  metadata?: {
    // Additional context
    ip?: string; // IP address of requester
    userAgent?: string; // User agent/browser info
    changes?: any; // Track field changes
    reason?: string; // Explanation for action
  };
  timestamp: Date; // When action occurred
}
```

### AuditAction Enum

```typescript
enum AuditAction {
  // Course actions
  COURSE_CREATED = "COURSE_CREATED",
  COURSE_DELETED = "COURSE_DELETED",

  // Group actions
  CLASSROOM_GROUP_CREATED = "GROUP_CREATED",
  CLASSROOM_GROUP_DELETED = "GROUP_DELETED",

  // System actions
  LOGIN_FAILED = "LOGIN_FAILED",
  CONTENT_REPORTED = "CONTENT_REPORTED"
}

more actions would be added later
```

### EntityType Enum

```typescript
enum EntityType {
  COURSE = "COURSE",
  CLASSROOM = "CLASSROOM",
  CLASSROOM_GROUP = "GROUP",
  USER = "USER",
}
```

## API Endpoints

### Get Audit Logs

- **Endpoint**: `GET /audit-logs`
- **Description**: Retrieve system audit logs with filtering and pagination
- **Authentication**: Required
- **Roles**: Admin only
- **Query Parameters**:

  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 50)
  - `action`: Filter by specific action type (from AuditAction enum)
  - `entityType`: Filter by entity type (from EntityType enum)

- **Response (Success - 200)**:

  ```javascript
  [
    {
      "_id": "ObjectId",
      "action": "string", // AuditAction value
      "userId": {
        "_id": "ObjectId",
        "email": "string",
        "fullName": "string"
      },
      "userRole": "string", // "admin"|"instructor"|"student"
      "entityType": "string", // EntityType value
      "entityId": "ObjectId",
      "targetUserId": {
        "_id": "ObjectId",
        "email": "string",
        "fullName": "string"
      },
      "metadata": {
        "ip": "string",
        "userAgent": "string",
        "changes": {}, // optional
        "reason": "string" // optional
      },
      "createdAt": "ISO Date",
      "updatedAt": "ISO Date"
    },
    ...
  ]
  ```

- **Possible Errors**:

  - 401: Unauthorized (missing/invalid token)
  - 403: Forbidden (non-admin user)
  - 500: Server error

## Usage Examples

### Fetching Logs (Admin)

```javascript
// Get first page of all logs
fetch("/audit-logs", {
  headers: {
    Authorization: "Bearer [ADMIN_TOKEN]",
  },
});

// Filter for course-related actions
fetch("/audit-logs?entityType=COURSE&limit=20", {
  headers: {
    Authorization: "Bearer [ADMIN_TOKEN]",
  },
});

// Get second page of group deletions
fetch("/audit-logs?action=GROUP_DELETED&page=2", {
  headers: {
    Authorization: "Bearer [ADMIN_TOKEN]",
  },
});
```

## Best Practices

1. **Log Important Events**:

   - Use appropriate `AuditAction` for different operations
   - Include relevant metadata (IP, user agent) for security events

2. **Retention Policy**:

   - Consider implementing log rotation/archiving for older logs
   - Set appropriate indexes for query performance

3. **Security**:

   - Keep audit log access restricted to admins
   - Never expose sensitive data in logs

4. **Integration**:

   - Call audit logging after successful operations
   - Example flow:
     ```typescript
     // After successful group creation
     await new AuditLog({
       action: AuditAction.CLASSROOM_GROUP_CREATED,
       userId: creatorId,
       userRole: creatorRole,
       entityType: EntityType.CLASSROOM_GROUP,
       entityId: newGroup._id,
       metadata: {
         ip: req.ip,
         userAgent: req.headers["user-agent"],
       },
     }).save();
     ```

# Assignment Module Documentation

## Overview

The Assignment module handles creation, submission, grading, and management of course assignments. It includes features for file attachments, notifications, and role-based access control.

## Models

### Assignment

```typescript
interface IAssignment {
  title: string; // Assignment title
  description?: string; // Optional description
  course: Types.ObjectId; // Reference to Course
  classroomId?: Types.ObjectId; // Optional classroom reference
  groupId?: Types.ObjectId; // Optional group reference
  instructorId: Types.ObjectId; // Creator (Admin/Instructor)
  instructorModel: "Admin" | "Instructor"; // Creator type
  studentId?: Types.ObjectId; // Student who submitted
  dueDate: Date; // Deadline
  status: "draft" | "published" | "submitted" | "graded"; // Current state
  grade?: "A" | "B" | "C" | "D" | "E" | "F"; // Final grade
  remark?: string; // Instructor comments
  submissionDate?: Date; // When submitted
  files: IAssignmentFile[]; // Assignment files
  submissionFiles: IAssignmentFile[]; // Student submission files
  isMarked: boolean; // Grading status
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-generated
}

interface IAssignmentFile {
  url: string; // File URL
  publicId: string; // Cloudinary public ID
  fileName: string; // Original filename
  fileType: string; // MIME type
  size: number; // File size in bytes
}
```

## API Endpoints

### 1. Create Assignment

-
- **Description**: Create a new assignment
- **Authentication**: Required
- **Roles**: Admin, Instructor
- **Request Type**: `multipart/form-data`
- **Request Body**:
  ```typescript
  {
    title: string;          // Required
    description?: string;
    courseId: string;       // Valid ObjectId
    classroomId?: string;   // Valid ObjectId
    groupId?: string;       // Valid ObjectId
    dueDate: string;        // ISO date string
    files?: File[];         // Assignment files
  }
  ```
- **Response (Success - 200)**:
  ```typescript
  {
    success: boolean;
    assignment: IAssignment;
  }
  ```
- **Possible Errors**:
  - 401: Unauthorized
  - 403: Forbidden (student trying to create)
  - 400: Invalid input data
  - 500: Server error

### 2. Submit Assignment

-
- **Description**: Student submission of assignment
- **Authentication**: Required
- **Roles**: Student only
- **Request Type**: `multipart/form-data`
- **Request Body**:
  ```typescript
  {
    assignmentId: string;   // Valid ObjectId
    files: File[];          // Submission files
  }
  ```
- **Response (Success - 200)**:
  ```typescript
  {
    success: boolean;
    assignment: IAssignment;
  }
  ```
- **Possible Errors**:
  - 401: Unauthorized
  - 403: Forbidden (non-student trying to submit)
  - 404: Assignment not found
  - 500: Server error

### 3. Grade Assignment

-
- **Description**: Grade a submitted assignment
- **Authentication**: Required
- **Roles**: Admin, Instructor
- **Request Body**:
  ```typescript
  {
    assignmentId: string;   // Valid ObjectId
    grade: "A" | "B" | "C" | "D" | "E" | "F";
    remark?: string;
  }
  ```
- **Response (Success - 200)**:
  ```typescript
  {
    success: boolean;
    assignment: IAssignment;
  }
  ```
- **Possible Errors**:
  - 401: Unauthorized
  - 403: Forbidden (student trying to grade)
  - 404: Assignment not found
  - 500: Server error

### 4. Get Assignment by ID

-
- **Description**: Get assignment details
- **Authentication**: Required
- **Roles**: Any authenticated user
- **Query Parameters**:
  ```typescript
  {
    id: string; // Valid ObjectId
  }
  ```
- **Response (Success - 200)**: `IAssignment`
- **Possible Errors**:
  - 401: Unauthorized
  - 404: Assignment not found
  - 500: Server error

### 5. Get Assignments (Student View)

-
- **Description**: List assignments for current student
- **Authentication**: Required
- **Roles**: Student only
- **Query Parameters**:
  ```typescript
  {
    page?: number;      // Default: 1
    limit?: number;     // Default: 10
    search?: string;    // Optional search term
    sortBy?: "title" | "status" | "dueDate" | "createdAt"; // Default: dueDate
    order?: "asc" | "desc"; // Default: asc
    status?: "draft" | "published" | "submitted" | "graded";
    dueDate?: Date;     // Filter by due date
  }
  ```
- **Response (Success - 200)**:
  ```typescript
  {
    assignments: IAssignment[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  }
  ```
- **Possible Errors**:
  - 401: Unauthorized
  - 403: Forbidden (non-student access)
  - 500: Server error

### 6. Get Assignments (Instructor View)

-
- **Description**: List assignments created by current instructor
- **Authentication**: Required
- **Roles**: Instructor only
- **Query Parameters**: Same as student view
- **Response**: Same structure as student view
- **Possible Errors**:
  - 401: Unauthorized
  - 403: Forbidden (non-instructor access)
  - 500: Server error

### 7. Get Assignments (Admin View)

-
- **Description**: List all assignments in system
- **Authentication**: Required
- **Roles**: Admin only
- **Query Parameters**: Same as student view
- **Response**: Same structure as student view
- **Possible Errors**:
  - 401: Unauthorized
  - 403: Forbidden (non-admin access)
  - 500: Server error

### 8. Get Submitted Assignments

-
- **Description**: List submitted assignments for grading
- **Authentication**: Required
- **Roles**: Admin, Instructor
- **Query Parameters**:
  ```typescript
  {
    // All parameters from student view plus:
    classroomId?: string; // Filter by classroom
    groupId?: string;     // Filter by group
  }
  ```
- **Response**: Same structure as student view
- **Possible Errors**:
  - 401: Unauthorized
  - 403: Forbidden (student access)
  - 500: Server error

## File Handling

- **Upload Types**:
  - `ASSIGNMENT`: Files attached by instructor when creating assignment
  - `SUBMISSION`: Files attached by student when submitting
- **Storage**: Files are stored in Cloudinary with:
  - Automatic file type detection
  - Organized in folders by upload category
  - Metadata including original filename and size

## Notifications

Automatically sent for:

- New assignment creation (to students)
- Assignment submission (to instructor/admin)
- Assignment grading (to student)

## Security

- All endpoints require authentication
- Role-based access control enforced
- File uploads validated before processing
- ObjectId validation for all references
- Caching implemented for performance

## Usage Examples

### Creating an Assignment (Instructor)

```javascript
const formData = new FormData();
formData.append("title", "Math Homework 1");
formData.append("courseId", "65a1b...");
formData.append("dueDate", new Date().toISOString());
formData.append("files", fileInput.files[0]);

fetch("/api/trpc/assignment.create", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${instructorToken}`,
  },
  body: formData,
});
```

### Submitting an Assignment (Student)

```javascript
const formData = new FormData();
formData.append("assignmentId", "65a1b...");
formData.append("files", fileInput.files[0]);

fetch("/api/trpc/assignment.submit", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${studentToken}`,
  },
  body: formData,
});
```

### Grading an Assignment (Instructor)

```javascript
fetch("/api/trpc/assignment.grade", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${instructorToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    assignmentId: "65a1b...",
    grade: "A",
    remark: "Excellent work!",
  }),
});
```
