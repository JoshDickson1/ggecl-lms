# StudentAssignment.tsx Refactoring Guide

## Summary
This document outlines the changes needed to refactor `StudentAssignment.tsx` to use TanStack Query for proper caching and make it responsive for mobile devices.

## Changes Required

### 1. Import Changes
**Replace:**
```typescript
import { useState, useRef, useEffect, useCallback } from "react";
```

**With:**
```typescript
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
```

### 2. SubmitModal Component Refactoring

**Replace the entire SubmitModal function with:**

```typescript
function SubmitModal({
  assignment,
  onClose,
}: {
  assignment: StudentAssignmentItem;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isLate = new Date() > new Date(assignment.dueDate);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      // 1. Upload files
      setIsUploading(true);
      const attachments: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await StorageService.upload("assignments", files[i]);
        attachments.push(url);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setIsUploading(false);

      // 2. Submit to API
      return AssignmentService.submit(assignment.id, {
        attachments,
        note: note.trim() || undefined,
      });
    },
    onSuccess: () => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["student-assignments"] });
      onClose();
    },
  });

  const isBusy = isUploading || submitMutation.isPending;
  const statusLabel =
    isUploading ? `Uploading files… ${uploadProgress}%` :
    submitMutation.isPending ? "Submitting…" : "";

  // ... rest of the modal JSX (update error handling to use submitMutation.isError and submitMutation.error)
}
```

### 3. Main Component Refactoring

**Replace the entire export default function with:**

```typescript
export default function StudentAssignment() {
  const [filter, setFilter] = useState<"all" | "pending" | "submitted" | "graded">("all");
  const [page, setPage] = useState(1);
  const [sortType, setSortType] = useState<"soon" | "recent" | "old" | "default">("recent");

  // Use TanStack Query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["student-assignments", filter, page],
    queryFn: async () => {
      const result = await AssignmentService.getMyAssignments({
        status: filter === "all" ? undefined : filter,
        page,
        limit: 20,
      });
      return result;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10,   // 10 minutes
  });

  const assignments = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 1;

  const handleFilterChange = (f: typeof filter) => {
    setFilter(f);
    setPage(1);
  };

  const counts = assignments.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // ... rest of component (update to use isLoading, isError, error instead of loading, error state)
}
```

### 4. Responsive Design Changes

#### Header Section:
```typescript
<div className="max-w-[900px] mx-auto space-y-4 sm:space-y-6 pb-10 px-4 sm:px-0">
  <Fade>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
          My <span className="text-blue-600 dark:text-blue-400">Assignments</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">All assignments from your enrolled courses</p>
      </div>
      <div className="flex items-center gap-2">
        {/* ... sort dropdown and refresh button ... */}
      </div>
    </div>
  </Fade>
```

#### Filter Tabs:
```typescript
<div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
  {FILTER_OPTIONS.map(({ key, label }) => (
    <button
      key={key}
      onClick={() => handleFilterChange(key)}
      className={cn(
        "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap",
        // ... rest of classes
      )}
    >
      {label}
      {/* ... badge ... */}
    </button>
  ))}
</div>
```

#### Assignment Card:
```typescript
<button
  className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 text-left"
  onClick={() => setOpen(p => !p)}
>
  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
  </div>

  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2 flex-wrap mb-0.5">
      <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">{assignment.title}</p>
      {/* ... badges ... */}
    </div>
    <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-2 sm:gap-3 flex-wrap">
      <span className="flex items-center gap-1">
        <BookOpen className="w-3 h-3" />
        <span className="truncate max-w-[120px] sm:max-w-none">{assignment.courseName}</span>
      </span>
      {/* ... other info ... */}
      <span className="hidden sm:inline">by {assignment.creatorName}</span>
    </p>
  </div>
  {/* ... score and chevron ... */}
</button>
```

#### Submit Modal:
```typescript
<motion.div
  // ... animations ...
  className="relative w-full max-w-lg rounded-[24px] bg-white dark:bg-[#0f1623]
    border border-gray-100 dark:border-white/[0.07]
    shadow-[0_24px_80px_rgba(0,0,0,0.25)] z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
>
  <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-white/[0.06] sticky top-0 bg-white dark:bg-[#0f1623] z-10">
    <div className="flex-1 min-w-0 mr-2">
      <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white">Submit Assignment</h2>
      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{assignment.title}</p>
    </div>
    {/* ... close button ... */}
  </div>

  <div className="p-4 sm:p-6 space-y-5">
    {/* ... form content with responsive padding and text sizes ... */}
  </div>
</motion.div>
```

## Benefits of These Changes

### TanStack Query Benefits:
1. **Automatic Caching** - Data is cached for 2 minutes, reducing unnecessary API calls
2. **Background Refetching** - Stale data is automatically refreshed
3. **Optimistic Updates** - UI updates immediately when submitting assignments
4. **Automatic Cache Invalidation** - After submission, the list automatically refetches
5. **Better Loading States** - Built-in loading, error, and success states
6. **Request Deduplication** - Multiple components requesting the same data share a single request

### Responsive Design Benefits:
1. **Mobile-First** - Works on screens as small as 320px
2. **Touch-Friendly** - Larger tap targets on mobile
3. **Readable Text** - Appropriate font sizes for all screen sizes
4. **Horizontal Scrolling** - Filter tabs scroll horizontally on mobile
5. **Adaptive Layout** - Stacks elements vertically on small screens
6. **Truncation** - Long text truncates appropriately on mobile

## Testing Checklist

- [ ] Assignments load correctly on mount
- [ ] Filter tabs work and cache separately
- [ ] Pagination works and caches each page
- [ ] Submitting an assignment invalidates cache and refetches
- [ ] Error states display correctly
- [ ] Loading states show skeletons
- [ ] Refresh button works
- [ ] Mobile view (< 640px) displays correctly
- [ ] Tablet view (640px - 1024px) displays correctly
- [ ] Desktop view (> 1024px) displays correctly
- [ ] Modal is scrollable on small screens
- [ ] Filter tabs scroll horizontally on mobile
