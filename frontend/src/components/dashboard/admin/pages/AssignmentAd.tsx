import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import FileUploadModalAd from "../components/FileUploadModalAd";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useCallback } from "react";

import MarkAssignmentModal, { Grade } from "@/components/ui/MarkAssignmentModal";
import GivenAssignment from "../components/GivenAssignment";
import SubmittedAssignment from "../components/SubmittedAssignment";
import InstructorAssignment from "../components/InstructorAssignment";

export default function AssignmentAd() {
  // Sample data
  const courses = [
    { _id: "course1", title: "Mathematics" },
    { _id: "course2", title: "Physics" },
  ];

  const [newTitle, setNewTitle] = useState<string>("");
  const [newCourse, setNewCourse] = useState<string>(courses[0]?._id || "");
  const [newDueDate, setNewDueDate] = useState<string>("");
  const [newQuestion, setNewQuestion] = useState<string>("");

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [selected, setSelected] = useState<any>(null);
  const closeModal = useCallback(() => setSelected(null), []);
//   const openModal = useCallback((assignment: any) => setSelected(assignment), []);

  const handleCreate = () => {
    console.log("Assignment Data:", {
      title: newTitle,
      course: newCourse,
      dueDate: newDueDate,
      question: newQuestion,
      uploadedFiles,
    });
    alert("Assignment created (mock)");
    setNewTitle("");
    setNewDueDate("");
    setNewQuestion("");
    setUploadedFiles([]);
  };

  const handleGrade = (id: string, grade: Grade, remark: string) => {
    console.log("Grading assignment:", { id, grade, remark });
    alert("Assignment graded (mock)");
    closeModal();
  };

  return (
    <div className="container mx-auto rounded-lg bg-white p-6 shadow dark:bg-gray-900">
      <div className="mb-5 space-y-0.5">
        <h1 className="text-3xl font-bold md:text-4xl">Manage Assignments</h1>
        <p className="text-gray-600 dark:text-gray-300">
          View, search, and grade submitted assignments.
        </p>
      </div>

      <main className="space-y-20 py-7">
        <GivenAssignment />
        <InstructorAssignment />
        <SubmittedAssignment />
      </main>

      {/* Create Assignment */}
      <div className="mt-8 rounded-lg bg-gray-50 p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-semibold">Create New Assignment</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="new-title">Title</Label>
            <Input
              id="new-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Assignment title"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="new-course">Course</Label>
            <Select value={newCourse} onValueChange={setNewCourse}>
              <SelectTrigger id="new-course">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="new-due-date">Due Date</Label>
            <Input
              id="new-due-date"
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-2 md:col-span-3">
            <Label htmlFor="new-question">Question</Label>
            <Textarea
              id="new-question"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Enter assignment question"
              rows={4}
            />
          </div>

          {/* File Upload */}
          <div className="flex flex-col space-y-2 md:col-span-3">
            <Label>Upload Files</Label>
            <Button variant="outline" onClick={() => setShowUploadModal(true)}>
              Select Files
            </Button>
            {uploadedFiles.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-sm text-gray-700 dark:text-gray-300">
                {uploadedFiles.map((file, i) => (
                  <li key={i}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <FileUploadModalAd
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onFilesSelected={(files) => setUploadedFiles(files)}
        />

        <Button className="mt-4" variant="secondary" onClick={handleCreate}>
          Create Assignment
        </Button>
      </div>

      {/* Grading Modal */}
      {selected && (
        <MarkAssignmentModal
          assignment={selected}
          isOpen={Boolean(selected)}
          onClose={closeModal}
          onGradeSubmitted={handleGrade}
          isGrading={false}
        />
      )}
    </div>
  );
}
