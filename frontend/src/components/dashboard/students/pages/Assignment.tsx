import { useState, useCallback, useRef } from "react";

import AssignmentModal from "../_components/AssignmentModal";
import AssignmentTable from "../_components/AssignmentTable";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { validateFile } from "@/utils/validateFile";
import { UploadOverlay } from "@/components/ui/UploadOverlay";
import { useCreateAssignmentCloudinarySig } from "../hooks/useCreateAssignmentCloudinarySig";
import { useMarkAssignmentSubmissionComplete } from "../hooks/useMarkAssignmentSubmissionComplete";
import { uploadToCloudinary } from "@/api/services/uploadToCloudinary";
import { Assignment } from "@/utils/trpc";

export default function AssignmentList() {
  // File upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentToSubmitFor, setAssignmentToSubmitFor] =
    useState<Assignment | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createSignatureCloudinary } = useCreateAssignmentCloudinarySig();
  const { markSubmissionComplete } = useMarkAssignmentSubmissionComplete();

  // File input change
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    setUploadProgress(0);

    if (!assignmentToSubmitFor || !file) {
      toast.error("Please select an assignment before uploading.");
      return;
    }

    const { valid, error: validationError } = validateFile(file, "pdf");
    if (!valid) {
      toast.error(validationError);
      return;
    }

    submitToCloud(assignmentToSubmitFor, file);
  };

  // Upload handler
  const submitToCloud = useCallback(
    async (assignment: Assignment, file: File) => {
      setIsSubmitting(true);
      setUploadProgress(0);

      try {
        const sig = await createSignatureCloudinary({
          assignmentId: assignment._id.toString(),
          originalFileName: file.name,
        });

        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", sig.apiKey);
        fd.append("timestamp", String(sig.timestamp));
        fd.append("folder", sig.folder);
        fd.append("public_id", sig.publicId);
        fd.append("signature", sig.signature);
        fd.append("resource_type", "raw");

        const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/raw/upload`;
        const { result } = await uploadToCloudinary({
          cloudinaryUrl: url,
          formData: fd,
          callback: setUploadProgress,
        });

        if (result.status < 200 || result.status >= 300) {
          throw new Error(result.statusText);
        }

        await markSubmissionComplete(
          {
            assignmentId: assignment._id.toString(),
            publicId: result.data.public_id,
            fileName: file.name,
            fileSize: result.data.bytes,
            fileType: file.type,
            fileUrl: result.data.secure_url,
          },
          {
            onSuccess: (data) => {
              if (data.success) {
                toast.success("Assignment submitted for marking");
                closeModal();
              }
            },
            onSettled: () => {
              setTimeout(() => {
                setIsSubmitting(false);
                setUploadProgress(0);
                setAssignmentToSubmitFor(null);
              }, 1500);
            },
          },
        );
      } catch (err) {
        let message = "Upload failed.";
        if (err instanceof AxiosError && err.response?.data?.error?.message) {
          message = err.response.data.error.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        toast.error(message);
      }
    },
    [createSignatureCloudinary, markSubmissionComplete],
  );

  // Table action handlers
  const handleView = useCallback((assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  }, []);

  const handleUploadAction = useCallback((assignment: Assignment) => {
    if (assignment.status === "submitted") {
      toast.info("Already submitted.");
      return;
    }
    setAssignmentToSubmitFor(assignment);
    fileInputRef.current?.click();
  }, []);

  const handleTableAction = useCallback(
    (action: string, assignment: Assignment) => {
      if (action === "View") handleView(assignment);
      if (action === "Upload") handleUploadAction(assignment);
    },
    [handleView, handleUploadAction],
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedAssignment(null), 300);
  }, []);

  return (
    <div className="container mx-auto bg-white px-4 py-8 text-gray-800 md:px-10 dark:bg-gray-900 dark:text-gray-200">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={onFileChange}
        className="hidden"
        disabled={isSubmitting}
      />

      {isSubmitting && (
        <UploadOverlay
          progress={uploadProgress}
          showSuccess={uploadProgress === 100 && !isSubmitting}
        />
      )}

      <AssignmentTable onHandleTableAction={handleTableAction} />

      {selectedAssignment && (
        <AssignmentModal
          assignment={selectedAssignment}
          isOpen={isModalOpen}
          onClose={closeModal}
          onUpload={handleUploadAction}
        />
      )}
    </div>
  );
}
