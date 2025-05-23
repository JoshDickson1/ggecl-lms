import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  FileType2,
} from "lucide-react"
import { Label } from "@/components/ui/label"

const materialTypes = [
  { label: "PDF", icon: FileType2, accept: "application/pdf" },
  { label: "Word", icon: File, accept: ".doc,.docx" },
  { label: "Image", icon: FileImage, accept: "image/*" },
  { label: "Video", icon: FileVideo, accept: "video/*" },
  { label: "Audio", icon: FileAudio, accept: "audio/*" },
]

const CourseMaterialsCard = () => {
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({})

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, label: string) => {
    const file = e.target.files?.[0] ?? null
    setSelectedFiles((prev) => ({ ...prev, [label]: file }))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Course Materials</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Text Input */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-md font-medium">
            <FileText className="w-5 h-5 text-muted-foreground" />
            Text Content
          </Label>
          <Textarea placeholder="Enter text content..." />
        </div>

        {/* File Uploads */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {materialTypes.map((type) => {
            const Icon = type.icon
            const file = selectedFiles[type.label]

            return (
              <div key={type.label} className="flex flex-col items-center">
                <Label className="min-h-40 w-full flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-xl hover:shadow-md cursor-pointer transition-all">
                  <Icon className="w-8 h-8 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {type.label}
                  </span>
                  <input
                    type="file"
                    accept={type.accept}
                    onChange={(e) => handleFileChange(e, type.label)}
                    className="hidden"
                  />
                </Label>
                {file && (
                  <p className="text-sm text-center text-muted-foreground mt-1 truncate w-full">
                    {file.name}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default CourseMaterialsCard
