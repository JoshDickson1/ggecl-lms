#!/usr/bin/env python3
"""
Script to refactor StudentAssignment.tsx to use TanStack Query and add responsive design
"""

import re

# Read the original file
with open('frontend/src/dashboards/student-dashboard/pages/StudentAssignment.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    'import { useState, useRef, useEffect, useCallback } from "react";',
    'import { useState, useRef } from "react";'
)

# Add TanStack Query import after the react import
content = content.replace(
    'import { motion, AnimatePresence } from "framer-motion";',
    '''import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";'''
)

# 2. Replace the SubmitModal function signature and add queryClient
old_submit_modal_start = '''function SubmitModal({
  assignment,
  onClose,
  onSubmitted,
}: {
  assignment: StudentAssignmentItem;
  onClose: () => void;
  onSubmitted: (submission: NormalisedSubmission) => void;
}) {
  const [files, setFiles]     = useState<File[]>([]);
  const [note, setNote]       = useState("");
  const [status, setStatus]   = useState<"idle" | "uploading" | "submitting" | "done">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError]     = useState<string | null>(null);
  const fileRef               = useRef<HTMLInputElement>(null);

  const isLate    = new Date() > new Date(assignment.dueDate);
  const isBusy    = status === "uploading" || status === "submitting";'''

new_submit_modal_start = '''function SubmitModal({
  assignment,
  onClose,
}: {
  assignment: StudentAssignmentItem;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [files, setFiles]     = useState<File[]>([]);
  const [note, setNote]       = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef               = useRef<HTMLInputElement>(null);

  const isLate    = new Date() > new Date(assignment.dueDate);'''

content = content.replace(old_submit_modal_start, new_submit_modal_start)

# 3. Replace the submit function with useMutation
old_submit_fn = '''  const submit = async () => {
    if (!files.length || isBusy) return;
    setError(null);

    try {
      // 1. Upload each file to R2, collect public CDN URLs
      setStatus("uploading");
      const attachments: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await StorageService.upload("assignments", files[i]);
        attachments.push(url);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      // 2. Submit to API — response is already normalised by the service
      setStatus("submitting");
      const normSub = await AssignmentService.submit(assignment.id, {
        attachments,
        note: note.trim() || undefined,
      });

      setStatus("done");
      onSubmitted(normSub);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
      setStatus("idle");
    }
  };

  const statusLabel =
    status === "uploading"  ? `Uploading files… ${uploadProgress}%` :
    status === "submitting" ? "Submitting…" : "";'''

new_submit_fn = '''  const submitMutation = useMutation({
    mutationFn: async () => {
      // 1. Upload each file to R2, collect public CDN URLs
      setIsUploading(true);
      const attachments: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await StorageService.upload("assignments", files[i]);
        attachments.push(url);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setIsUploading(false);

      // 2. Submit to API — response is already normalised by the service
      return AssignmentService.submit(assignment.id, {
        attachments,
        note: note.trim() || undefined,
      });
    },
    onSuccess: () => {
      // Invalidate all assignment queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["student-assignments"] });
      onClose();
    },
  });

  const isBusy = isUploading || submitMutation.isPending;
  const statusLabel =
    isUploading ? `Uploading files… ${uploadProgress}%` :
    submitMutation.isPending ? "Submitting…" : "";'''

content = content.replace(old_submit_fn, new_submit_fn)

# 4. Update error handling in modal
content = content.replace(
    '{error && (',
    '{submitMutation.isError && ('
)
content = content.replace(
    '<p className="text-xs text-red-700 dark:text-red-400 font-medium">{error}</p>',
    '<p className="text-xs text-red-700 dark:text-red-400 font-medium">{submitMutation.error instanceof Error ? submitMutation.error.message : "Submission failed. Please try again."}</p>'
)

# 5. Update submit button onClick
content = content.replace(
    'onClick={submit}',
    'onClick={() => submitMutation.mutate()}'
)

# 6. Update modal responsive classes
content = content.replace(
    'className="relative w-full max-w-lg rounded-[24px] bg-white dark:bg-[#0f1623]\n          border border-gray-100 dark:border-white/[0.07]\n          shadow-[0_24px_80px_rgba(0,0,0,0.25)] z-10 overflow-hidden"',
    'className="relative w-full max-w-lg rounded-[24px] bg-white dark:bg-[#0f1623]\n          border border-gray-100 dark:border-white/[0.07]\n          shadow-[0_24px_80px_rgba(0,0,0,0.25)] z-10 overflow-hidden max-h-[90vh] overflow-y-auto"'
)

content = content.replace(
    'className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">',
    'className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-white/[0.06] sticky top-0 bg-white dark:bg-[#0f1623] z-10">'
)

# 7. Replace main component
old_main_start = '''export default function StudentAssignment() {
  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [filter, setFilter]           = useState<"all" | "pending" | "submitted" | "graded">("all");
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [sortType, setSortType]       = useState<"soon" | "recent" | "old" | "default">("recent");

  const fetchAssignments = useCallback(async (currentFilter: typeof filter, currentPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await AssignmentService.getMyAssignments({
        status: currentFilter === "all" ? undefined : currentFilter,
        page:   currentPage,
        limit:  20,
      });
      setAssignments(result.data);
      setTotalPages(result.meta.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments(filter, page);
  }, [filter, page, fetchAssignments]);'''

new_main_start = '''export default function StudentAssignment() {
  const [filter, setFilter]   = useState<"all" | "pending" | "submitted" | "graded">("all");
  const [page, setPage]       = useState(1);
  const [sortType, setSortType] = useState<"soon" | "recent" | "old" | "default">("recent");

  // Use TanStack Query for data fetching with caching
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
    staleTime: 1000 * 60 * 2, // 2 minutes - data stays fresh
    gcTime: 1000 * 60 * 10,   // 10 minutes - keep in cache
  });

  const assignments = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 1;'''

content = content.replace(old_main_start, new_main_start)

# 8. Update main container responsive classes
content = content.replace(
    '<div className="max-w-[900px] mx-auto space-y-6 pb-10">',
    '<div className="max-w-[900px] mx-auto space-y-4 sm:space-y-6 pb-10 px-4 sm:px-0">'
)

# 9. Update header responsive classes
content = content.replace(
    '<div className="flex items-center justify-between">',
    '<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">'
)

content = content.replace(
    '<h1 className="text-3xl font-black text-gray-900 dark:text-white">',
    '<h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">'
)

content = content.replace(
    '<p className="text-sm text-gray-400 mt-1">All assignments from your enrolled courses</p>',
    '<p className="text-xs sm:text-sm text-gray-400 mt-1">All assignments from your enrolled courses</p>'
)

# 10. Update error/loading references
content = content.replace('loading &&', 'isLoading &&')
content = content.replace('!loading && !error', '!isLoading && !isError')
content = content.replace('error && !loading', 'isError && !isLoading')
content = content.replace('{error}', '{error instanceof Error ? error.message : "Failed to load assignments"}')

# 11. Update fetchAssignments calls to refetch
content = content.replace('fetchAssignments(filter, page)', 'refetch()')

# 12. Remove handleSubmitted from AssignmentCard
content = content.replace(
    '''  const handleSubmitted = (sub: NormalisedSubmission) => {
    setSubmission(sub);
    setAssignment(prev => ({
      ...prev,
      submission:   sub,
      status:       sub.isLate ? "late" : "submitted",
      submittedAt:  sub.submittedAt,
      isLate:       sub.isLate,
      submissionId: sub.id,
    }));
  };''',
    ''
)

content = content.replace(
    '''            onSubmitted={handleSubmitted}''',
    ''
)

# Write the refactored content
with open('frontend/src/dashboards/student-dashboard/pages/StudentAssignment.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactoring complete!")
print("Changes made:")
print("1. Added TanStack Query imports")
print("2. Converted SubmitModal to use useMutation")
print("3. Converted main component to use useQuery")
print("4. Added responsive design classes")
print("5. Updated error and loading state handling")
