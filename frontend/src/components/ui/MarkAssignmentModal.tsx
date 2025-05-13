import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { toast } from "sonner";
import { Assignment } from "@/utils/trpc";

// Define the Grade type
export type Grade = "A" | "B" | "C" | "D" | "E" | "F" | null;

interface MarkAssignmentModalProps {
  assignment: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
  onGradeSubmitted: (id: string, grade: Grade, remark: string) => void;
  isGrading: boolean;
}

const MarkAssignmentModal: React.FC<MarkAssignmentModalProps> = ({
  assignment,
  isOpen,
  onClose,
  onGradeSubmitted,
  isGrading,
}) => {
  const [grade, setGrade] = useState<Grade>(null);
  const [remark, setRemark] = useState<string>("");

  // Reset fields when opening
  useEffect(() => {
    if (isOpen) {
      setGrade(null);
      setRemark("");
    }
  }, [isOpen]);

  if (!assignment) return null;

  const handleSubmit = () => {
    if (!grade) {
      toast.info("Please select a grade");
      return;
    }
    onGradeSubmitted(assignment._id.toString(), grade, remark);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Mark Assignment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Details */}
          <div className="border-b pb-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-0.5">
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-medium">{assignment.title}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm text-gray-500">Course</p>
                <p className="font-medium">{assignment.course.title}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium">
                  {format(new Date(assignment.dueDate), "dd-MM-yyyy")}
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="text-sm text-gray-500">Submission</p>
                <Button
                  disabled={!assignment.submissionFileUrl}
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(assignment.submissionFileUrl, "_blank")
                  }
                >
                  View File
                </Button>
              </div>
            </div>
          </div>

          {/* Grading */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Grade Assignment</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="grade-select">Grade</Label>
                <Select
                  value={grade || ""}
                  onValueChange={(val) => setGrade(val as Grade)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {(["A", "B", "C", "D", "E", "F"] as Grade[]).map((g) => (
                      <SelectItem key={g} value={g!}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1 md:col-span-2">
                <Label htmlFor="remark">Remark (optional)</Label>
                <Textarea
                  id="remark"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Type any feedback or comments"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={isGrading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isGrading}>
            {isGrading ? "Grading..." : "Submit Grade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarkAssignmentModal;
