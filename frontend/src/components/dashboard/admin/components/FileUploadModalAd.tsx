// components/ui/FileUploadModalAd.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected: (files: File[]) => void;
};

export default function FileUploadModalAd({ isOpen, onClose, onFilesSelected }: Props) {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleSubmit = () => {
    onFilesSelected(files);
    setFiles([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Assignment Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label className="mb-4 dark:text-gray-300">Videos (.mp4, .webm, .ogg)</Label>
            <Input type="file" accept=".mp4,.webm,.ogg" multiple onChange={handleFileChange} />
          </div>

          <div>
            <Label className="mb-4 dark:text-gray-300">PDFs</Label>
            <Input type="file" accept="application/pdf" multiple onChange={handleFileChange} />
          </div>

          <div>
            <Label className="mb-4 dark:text-gray-300">Images (.jpg, .jpeg, .png)</Label>
            <Input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              multiple
              onChange={handleFileChange}
            />
          </div>

          <div>
            <Label className="mb-4 dark:text-gray-300">MS Word (.doc, .docx)</Label>
            <Input
              type="file"
              accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              multiple
              onChange={handleFileChange}
            />
          </div>

          {files.length > 0 && (
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
              {files.map((f, idx) => (
                <li key={idx}>{f.name}</li>
              ))}
            </ul>
          )}

          <Button onClick={handleSubmit}>Save Files</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
