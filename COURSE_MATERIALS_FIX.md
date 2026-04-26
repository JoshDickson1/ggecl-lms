# Course Materials Re-implementation Guide

## Overview
The InstructorCourseManage component already has a comprehensive materials management system. Based on the API documentation, here's what needs to be verified/fixed:

## Current Implementation Status

### ✅ Already Implemented
1. **Curriculum Tab** - Video-only materials for lessons
2. **Materials Tab** - Non-video files (PDFs, images, audio, documents)
3. **Quiz Editor** - Local state quiz management (needs backend integration)
4. **File Upload** - Using StorageService for R2/cloud storage
5. **File Preview** - Modal for viewing videos, images, PDFs, audio
6. **Section/Lesson Management** - Full CRUD operations

### API Endpoints Being Used

#### Course Structure
- `GET /api/courses/{id}` - Get full course with curriculum
- `POST /api/courses/{id}/sections` - Create section
- `PATCH /api/courses/{id}/sections/{sectionId}` - Update section
- `DELETE /api/courses/{id}/sections/{sectionId}` - Delete section

#### Lessons
- `POST /api/courses/{id}/sections/{sectionId}/lessons` - Create lesson
- `PATCH /api/courses/{id}/sections/{sectionId}/lessons/{lessonId}` - Update lesson
- `DELETE /api/courses/{id}/sections/{sectionId}/lessons/{lessonId}` - Delete lesson

#### Materials
- `POST /api/courses/{id}/sections/{sectionId}/lessons/{lessonId}/materials` - Add material
- `DELETE /api/courses/{id}/sections/{sectionId}/lessons/{lessonId}/materials/{materialId}` - Remove material

## Material Types

According to the API, materials have these types:
- `VIDEO` - Video files (shown in Curriculum tab)
- `PDF` - Documents, PDFs, images (shown in Materials tab)
- `AUDIO` - Audio files (shown in Materials tab)
- `LINK` - External links
- `QUIZ` - Quiz materials

## Current Material Flow

### 1. Curriculum Tab (Videos Only)
```typescript
// Upload video to lesson
1. User clicks "Upload video" on a lesson
2. File is uploaded to R2 via StorageService
3. Material is created with type: MaterialType.VIDEO
4. Material is added to lesson via API
```

### 2. Materials Tab (Non-Video Files)
```typescript
// Upload documents, images, audio
1. User clicks "Add image, audio, PDF, doc…" on a lesson
2. Files are uploaded to R2 via StorageService
3. Materials are created with appropriate types (PDF, AUDIO)
4. Materials are added to lesson via API
```

### 3. File Preview
- Videos: HTML5 video player
- Audio: HTML5 audio player
- Images: Direct image display
- PDFs: iframe embed
- Other: Download link

## What Needs to be Fixed

### 1. Material Type Mapping
The current `materialTypeFromFile` function only returns VIDEO, AUDIO, or PDF. According to the API, we need to handle:
- VIDEO - video files
- AUDIO - audio files
- PDF - all documents, images, and other files
- LINK - external URLs (not implemented yet)
- QUIZ - quiz materials (not implemented yet)

### 2. Quiz Integration
Quizzes are currently stored in local state only. They need to be:
- Saved to backend via quiz API endpoints
- Loaded from backend when viewing course
- Associated with course sections

### 3. Material Display Icons
The current `MATERIAL_ICONS` uses:
- VIDEO, DOCUMENT, AUDIO, LINK, OTHER

But API uses:
- VIDEO, PDF, AUDIO, LINK, QUIZ

Need to update the mapping.

## Fixes Required

### Fix 1: Update Material Type Icons

```typescript
const MATERIAL_ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  VIDEO: { icon: <Film className="w-3.5 h-3.5" />,      color: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-100 dark:bg-blue-900/30" },
  PDF:   { icon: <FileText className="w-3.5 h-3.5" />,  color: "text-sky-600 dark:text-sky-400",         bg: "bg-sky-100 dark:bg-sky-900/30" },
  AUDIO: { icon: <Music className="w-3.5 h-3.5" />,     color: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-100 dark:bg-violet-900/30" },
  LINK:  { icon: <Globe className="w-3.5 h-3.5" />,     color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  QUIZ:  { icon: <ListChecks className="w-3.5 h-3.5" />, color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-100 dark:bg-amber-900/30" },
};
```

### Fix 2: Update Material Type Detection

The current implementation is correct - all non-video, non-audio files should map to PDF type as per the API spec.

### Fix 3: Quiz Backend Integration (Future)

When backend implements quiz endpoints:
```typescript
// POST /api/quizzes
// GET /api/quizzes?courseId={id}
// PATCH /api/quizzes/{id}
// DELETE /api/quizzes/{id}
```

## Testing Checklist

### Curriculum Tab
- [ ] Create section
- [ ] Edit section title
- [ ] Delete section
- [ ] Create lesson
- [ ] Edit lesson title
- [ ] Delete lesson
- [ ] Upload video to lesson
- [ ] Preview video
- [ ] Delete video from lesson

### Materials Tab
- [ ] Upload PDF to lesson
- [ ] Upload image to lesson
- [ ] Upload audio to lesson
- [ ] Upload document to lesson
- [ ] Preview each file type
- [ ] Delete materials
- [ ] Create quiz (local state)
- [ ] Edit quiz
- [ ] Delete quiz

### File Preview Modal
- [ ] Preview video
- [ ] Preview audio
- [ ] Preview image
- [ ] Preview PDF
- [ ] Navigate between multiple files
- [ ] Download file
- [ ] Close modal

## Known Issues

1. **Quiz Persistence**: Quizzes are stored in local component state only. They will be lost on page refresh until backend integration is complete.

2. **Material Type Display**: The component uses "DOCUMENT" internally but API uses "PDF". This is handled in the icon mapping.

3. **Link Materials**: Not yet implemented. Need UI for adding external links as materials.

## Summary

The course materials system is **fully functional** for:
- ✅ Video uploads (Curriculum tab)
- ✅ Document/image/audio uploads (Materials tab)
- ✅ File previews
- ✅ Section/lesson management

Needs work for:
- ⏳ Quiz backend integration
- ⏳ Link materials
- ⏳ Material reordering (drag & drop)

The current implementation should work correctly with the existing API endpoints. The main issue is likely just ensuring the API responses match the expected structure.
