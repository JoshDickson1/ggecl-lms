import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useStudents } from "@/hooks/useStudents";
import { useEnrollStudentsToCourse } from "../hooks/useEnrollStudentsToCourse";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

interface EnrollStudentModalProps {
  isModalOpen: boolean;
  selectedCourse: string | null;
  onModalOpen: (open: boolean) => void;
}

export default function EnrollStudentModal({
  isModalOpen,
  onModalOpen,
  selectedCourse,
}: EnrollStudentModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const { debouncedValue } = useDebounce(searchTerm);

  const { enrollStudents, isEnrolling } = useEnrollStudentsToCourse();
  const { students, loading } = useStudents({
    search: debouncedValue,
    course: selectedCourse || undefined,
  });

  useEffect(() => {
    if (!isModalOpen) {
      setSearchTerm("");
      setSelectedStudents([]);
    }
  }, [isModalOpen]);

  const handleEnrollStudents = (studentIds: string[]) => {
    if (!selectedCourse) {
      toast.error("No course selected.");
      return;
    }

    if (selectedStudents.length === 0) {
      toast.info("Please select at least one student.");
      return;
    }

    enrollStudents({
      courseId: selectedCourse,
      studentIds,
    });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onModalOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enroll Students</DialogTitle>
          <DialogDescription>
            Search for students and select who to enroll.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Search students by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />

          <div className="max-h-60 space-y-2 overflow-y-auto">
            {loading && <p className="italic">Loading students...</p>}
            {!loading && students.length === 0 && (
              <p className="italic">No students found.</p>
            )}
            {!loading &&
              students.map((student) => (
                <div
                  key={student._id.toString()}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    checked={selectedStudents.includes(student._id.toString())}
                    onCheckedChange={(checked) =>
                      setSelectedStudents((prev) =>
                        checked
                          ? [...prev, student._id.toString()]
                          : prev.filter((s) => s !== student._id.toString()),
                      )
                    }
                  />
                  <span className="truncate">{student.fullName}</span>
                </div>
              ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onModalOpen(false)}
            disabled={isEnrolling}
          >
            Cancel
          </Button>
          <Button
            disabled={isEnrolling || selectedStudents.length === 0}
            onClick={() => handleEnrollStudents(selectedStudents)}
          >
            {isEnrolling ? "Enrolling..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
