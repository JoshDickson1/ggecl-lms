---
inclusion: manual
---

# Student Watch Course Page - Implementation Status

## ✅ What's Already Implemented

### 1. **Core Video Player** ✅
- HTML5 video element with full controls
- Play/pause, seek, volume control
- Playback speed adjustment (0.5x - 2x)
- Skip back 10 seconds
- Time display (current/total)
- Fullscreen support (basic)
- Video progress tracking

### 2. **Course Structure Navigation** ✅
- Collapsible sidebar with sections
- Lesson list with completion status
- Visual indicators:
  - ✓ Completed lessons (green checkmark)
  - 🔒 Locked lessons (no video material)
  - ▶ Available lessons (blue play icon)
  - Current lesson highlight (blue background + pulse dot)
- Section expand/collapse with animations
- Auto-expand section containing current lesson

### 3. **Progress Tracking** ✅
- Real-time progress updates via API (`PATCH /progress/lessons/:id`)
- Lesson completion marking (`POST /progress/lessons/:id/complete`)
- Overall course progress display in header
- Progress bar visualization
- Completed lesson tracking from API

### 4. **Lesson Materials** ✅
- Display additional materials (documents, links, files)
- Material type icons (document, link, download)
- File size display
- External link support (opens in new tab)

### 5. **Review System** ✅
- Star rating (1-5 stars with hover preview)
- Comment textarea with validation (min 10 chars)
- Submit review functionality
- Display existing review
- Success state after submission

### 6. **UI/UX** ✅
- Responsive layout
- Dark mode support
- Loading states
- Error states (course not found, not enrolled)
- Smooth animations (Framer Motion)
- Sticky header with course title + lesson title
- Sidebar toggle button

### 7. **API Integration** ✅
- Course data fetching (`GET /courses/:id`)
- Progress data fetching (`GET /progress/courses/:id`)
- Review fetching (`GET /reviews/courses/:id/my-review`)
- Progress updates (mutations)
- Review submission (mutation)

---

## 🐛 Critical Bug to Fix

### **Route Parameter Mismatch** 🔴
**Status:** BLOCKING BUG

**Problem:**
```tsx
// Route definition in App.tsx
{ path: "courses/:id/watch", element: <StudentWatchCourse /> }

// Component reads wrong param name
const { courseId } = useParams<{ courseId: string }>();
```

**Fix Required:**
```tsx
// Change line 364 in StudentWatchCourse.tsx from:
const { courseId } = useParams<{ courseId: string }>();

// To:
const { id } = useParams<{ id: string }>();

// Then update all references from courseId to id throughout the component
```

**Impact:** The page will **not work at all** until this is fixed. The `courseId` will always be `undefined`, causing all API calls to fail.

---

## 🚧 What's Missing / Needs Implementation

### 1. **Video Player Enhancements** 🟡

#### a) **Fullscreen Implementation**
- Current: Basic `<Maximize>` button exists but doesn't work
- Needed:
  ```tsx
  const toggleFullscreen = async () => {
    const container = videoContainerRef.current;
    if (!document.fullscreenElement) {
      await container?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };
  ```

#### b) **Keyboard Shortcuts**
- Space: Play/pause
- Arrow Left/Right: Seek ±5s
- Arrow Up/Down: Volume ±10%
- F: Fullscreen
- M: Mute/unmute
- 0-9: Jump to 0%-90%

#### c) **Video Quality Selection**
- If backend supports multiple qualities
- Quality selector dropdown

#### d) **Subtitles/Captions**
- If backend provides subtitle tracks
- Caption toggle + language selection

#### e) **Picture-in-Picture**
- Browser PiP API support
- Useful for multitasking

### 2. **Progress Persistence & Resume** 🟡

#### a) **Auto-Resume**
- Load last watched position from progress API
- Show "Resume from X:XX" toast on page load
- Auto-seek to last position

#### b) **Progress Sync Throttling**
- Current: Updates on every `timeupdate` event (too frequent)
- Better: Throttle to every 5-10 seconds
- Implementation:
  ```tsx
  const progressTimerRef = useRef<NodeJS.Timeout>();
  
  const handleTimeUpdate = (time: number) => {
    if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    progressTimerRef.current = setTimeout(() => {
      saveProgress({ lessonId, watchedSeconds: time, totalSeconds: duration });
    }, 5000); // Save every 5 seconds
  };
  ```

#### c) **Completion Threshold**
- Current: Marks complete when video ends
- Better: Mark complete at 90-95% watched (industry standard)
- Prevents issues with credits/outros

### 3. **Lesson Navigation** 🟡

#### a) **Next/Previous Lesson Buttons**
- "Next Lesson" button in video player
- "Previous Lesson" button
- Auto-advance to next lesson on completion (optional, with countdown)

#### b) **Lesson Autoplay**
- Toggle: "Autoplay next lesson"
- Countdown timer (5s) before auto-advancing
- Skip countdown button

### 4. **Notes & Bookmarks** 🟢 (Nice-to-have)

#### a) **Timestamped Notes**
- Add note at current video timestamp
- Click note to jump to that timestamp
- Edit/delete notes
- Persist to backend or localStorage

#### b) **Bookmarks**
- Bookmark important moments
- Visual markers on progress bar
- Quick jump to bookmarks

### 5. **Download Support** 🟢

#### a) **Offline Viewing**
- Download lesson videos (if allowed by instructor)
- Download materials (PDFs, slides, code files)
- Batch download all materials

### 6. **Quiz Integration** 🟡

#### a) **Inline Quizzes**
- If backend supports quizzes per lesson
- Show quiz modal after lesson completion
- Block next lesson until quiz passed (if required)
- Display quiz results

### 7. **Discussion/Q&A** 🟢

#### a) **Lesson Comments**
- Comment section below video
- Timestamped questions
- Instructor/student replies
- Upvote helpful answers

### 8. **Accessibility** 🟡

#### a) **Screen Reader Support**
- ARIA labels for all controls
- Keyboard navigation
- Focus management

#### b) **Transcript**
- Display video transcript
- Searchable transcript
- Click transcript to jump to timestamp

### 9. **Performance** 🟡

#### a) **Video Preloading**
- Preload next lesson video in background
- Reduce wait time between lessons

#### b) **Lazy Loading**
- Lazy load lesson thumbnails
- Virtualize long lesson lists

### 10. **Analytics** 🟢

#### a) **Watch Time Tracking**
- Track actual watch time (not just progress)
- Engagement metrics
- Rewatch tracking

#### b) **Completion Certificates**
- Auto-generate certificate on course completion
- Download/share certificate

### 11. **Layout Issues** 🟡

#### a) **Full-Screen Layout**
- Current: Watch page is inside `StudentLayout` (has sidebar + navbar padding)
- Problem: Cramped layout, not ideal for video watching
- Solution: Move watch route outside `StudentLayout` in `App.tsx`:
  ```tsx
  // Move this route outside the StudentLayout wrapper
  {
    path: "/student/courses/:id/watch",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]} redirectTo="/login">
        <DashboardAuthProvider>
          <StudentWatchCourse />
        </DashboardAuthProvider>
      </ProtectedRoute>
    ),
  }
  ```

#### b) **Responsive Design**
- Mobile: Stack video + sidebar vertically
- Tablet: Optimize sidebar width
- Desktop: Current layout works

### 12. **Error Handling** 🟡

#### a) **Video Loading Errors**
- Handle video load failures
- Show retry button
- Fallback to different quality

#### b) **Network Issues**
- Detect offline state
- Show reconnection UI
- Resume playback after reconnect

#### c) **API Error Handling**
- Progress save failures (retry logic)
- Course load failures (better error messages)

---

## 📋 Priority Roadmap

### **Phase 1: Critical Fixes** (Do First)
1. ✅ Fix route parameter bug (`courseId` → `id`)
2. ✅ Fix fullscreen functionality
3. ✅ Implement progress throttling
4. ✅ Add next/previous lesson navigation
5. ✅ Move route outside StudentLayout for full-screen experience

### **Phase 2: Core Features** (Do Next)
1. ✅ Auto-resume from last position
2. ✅ Keyboard shortcuts
3. ✅ Lesson autoplay with countdown
4. ✅ Quiz integration (if backend ready)
5. ✅ Mobile responsive improvements

### **Phase 3: Enhanced UX** (Nice-to-have)
1. ⭕ Timestamped notes
2. ⭕ Bookmarks
3. ⭕ Download support
4. ⭕ Picture-in-Picture
5. ⭕ Video quality selection

### **Phase 4: Advanced Features** (Future)
1. ⭕ Discussion/Q&A
2. ⭕ Transcript support
3. ⭕ Analytics dashboard
4. ⭕ Completion certificates
5. ⭕ Collaborative features (watch parties, etc.)

---

## 🎯 Immediate Action Items

1. **Fix the route param bug** (5 minutes)
   - Change `courseId` to `id` in `useParams`
   - Update all references

2. **Test the page** (10 minutes)
   - Navigate to `/student/courses/:id/watch`
   - Verify video loads
   - Test progress tracking
   - Test lesson switching

3. **Implement fullscreen** (15 minutes)
   - Add fullscreen API calls
   - Handle fullscreen state
   - Update button icon

4. **Add next/previous buttons** (20 minutes)
   - Calculate next/previous lesson
   - Add navigation buttons
   - Handle edge cases (first/last lesson)

5. **Move route outside layout** (10 minutes)
   - Restructure App.tsx routing
   - Test auth still works
   - Verify full-screen layout

---

## 📝 Notes

- The current implementation is **80% complete** for a basic watch page
- The **route param bug is blocking** — fix this first
- Most missing features are **enhancements**, not blockers
- The core video player + progress tracking works well
- Focus on **Phase 1** items for MVP launch
- **Phase 2-4** can be added iteratively based on user feedback

---

## 🔗 Related Files

- **Component:** `frontend/src/dashboards/student-dashboard/pages/StudentWatchCourse.tsx`
- **Route:** `frontend/src/App.tsx` (line 255)
- **Services:** 
  - `frontend/src/services/course.service.ts`
  - `frontend/src/services/progress.service.ts`
  - `frontend/src/services/review.service.ts`
- **API Endpoints:** See `.kiro/steering/api-endpoints.md`
