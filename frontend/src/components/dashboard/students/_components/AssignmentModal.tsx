import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Assignment } from "@/utils/trpc";
import { format } from "date-fns";
import { Upload } from "lucide-react";

type AssignmentModalProps = {
  assignment: Assignment;
  isOpen: boolean;
  onClose: () => void;
  onUpload: (assignment: Assignment) => void;
};

export default function AssignmentModal({
  assignment,
  isOpen,
  onClose,
  onUpload,
}: AssignmentModalProps) {
  const handleUploadClick = () => {
    onUpload(assignment);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle className="text-2xl font-bold">
            {assignment.title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Course: {assignment.course.title} | Due:{" "}
            {format(new Date(assignment.dueDate), "dd-MM-yyyy")} | Status:{" "}
            {assignment.status}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="text-sm text-gray-700 dark:text-gray-300">
          <h1 className="space-y-2 text-lg font-bold">Question:</h1>
          <p>{assignment.question}</p>
        </div>

        {assignment.status === "graded" && (
          <div className="space-y-5">
            <div>
              <h1 className="space-y-2 text-lg font-bold">Remark:</h1>
              <p>{assignment.remark}</p>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold">Grade:</h1>
              <p className="text-xl font-bold text-green-500">
                {assignment.grade}
              </p>
            </div>
          </div>
        )}

        <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={
              assignment.status === "graded" ||
              assignment.status === "submitted"
            }
            onClick={handleUploadClick}
            aria-label={`Upload assignment ${assignment.title}`}
          >
            <Upload className={cn("mr-2 h-4 w-4")} /> Upload Submission
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
