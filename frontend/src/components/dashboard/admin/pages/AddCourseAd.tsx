import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { UploadCloud, Video, Image as ImageIcon } from "lucide-react";

import { UploadOverlay } from "@/components/ui/UploadOverlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TAllowedFileTypes, validateFile } from "@/utils/validateFile";
import { AxiosError } from "axios";

import { useAddCourse } from "../hooks/useAddCourse";
import { useInstructors } from "../../../../hooks/useInstructors";
import { useUploadToCloud } from "@/hooks/useUploadToCloud";

// --- Zod Schema Definition ---
const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  instructorId: z.string({ required_error: "Please select an instructor." }),
  description: z
    .string()
    .min(20, { message: "Description must be at least 20 characters." })
    .max(5000, { message: "Description cannot exceed 5000 characters." }),
  certification: z.string().optional(),
  syllabus: z.string().optional(),
  duration: z.string().min(1, { message: "Please enter the course duration." }),
  lectures: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(1, { message: "Must have at least 1 lecture." })
    .default(1),
  level: z
    .enum(["Beginner", "Intermediate", "Advanced"], {
      required_error: "Please select a course level.",
    })
    .default("Beginner"),
  price: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(0, { message: "Price cannot be negative." }),
  badge: z.string().optional(),
});

const AddCourseAd = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    setUploadProgress((imageUploadProgress + videoUploadProgress) / 2);
  }, [imageUploadProgress, videoUploadProgress]);

  const { uploadToCloud } = useUploadToCloud();

  const { loading: loadingInstructors, instructors } = useInstructors({
    limit: 100,
  });

  const { addCourse } = useAddCourse();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      instructorId: "",
      description: "",
      certification: "",
      syllabus: "",
      duration: "",
      lectures: undefined,
      level: undefined,
      price: undefined,
      badge: "",
    },
  });

  function handleReset() {
    setSelectedImage(null);
    setSelectedVideo(null);
    setImageFile(null);
    setVideoFile(null);
    setIsSubmitting(false);
    setUploadProgress(0);
    form.reset();
  }

  const onFileChange =
    (t: TAllowedFileTypes) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setUploadProgress(0);

      const { valid, error: validationError } = validateFile(file, t);

      if (!valid || !file) {
        toast.error(validationError || `Invalid ${t} file.`);
        e.target.value = "";
        if (t === "image") {
          setSelectedImage(null);
          setImageFile(null);
        } else {
          setSelectedVideo(null);
        }
        return;
      }

      switch (t) {
        case "video":
          setVideoFile(file);
          const videoUrl = URL.createObjectURL(file);
          setSelectedVideo(videoUrl);
          break;

        case "image":
          const imageUrl = URL.createObjectURL(file);
          setSelectedImage(imageUrl);
          setImageFile(file);
          break;

        default:
          toast.info("Invaild upload action type");
          break;
      }

      e.target.value = "";
    };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setUploadProgress(0);

    // --- Validation for Files ---
    // Inside onSubmit
    if (!imageFile) {
      toast.error("Course thumbnail is required.");
      setIsSubmitting(false);
      return;
    }
    if (!videoFile) {
      toast.error("Course video is required.");
      setIsSubmitting(false);
      return;
    }

    // debug logs
    console.log("Form Values:", values);

    try {
      const [imgUrl, videoUrl] = await Promise.all([
        uploadToCloud(imageFile, "image", "images", setImageUploadProgress),
        uploadToCloud(videoFile, "video", "courses", setVideoUploadProgress),
      ]);

      if (!imgUrl || !videoUrl) {
        throw new Error("One or more file uploads failed. Please try again.");
      }

      const newCoursePayload = {
        ...values,
        img: imgUrl,
        videoUrl,
        syllabus: values?.syllabus
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      await addCourse(newCoursePayload);

      console.log("Cloudinary Upload Result:", { imgUrl, videoUrl });

      handleReset();
    } catch (err) {
      console.error("Submission Process Error:", err);
      let message = "An unexpected error occurred during submission.";
      if (err instanceof AxiosError && err.response?.data?.error?.message) {
        message = `Upload failed: ${err.response.data.error.message}`;
      } else if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      }

      toast.error(message);
      console.error(message);
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
        setUploadProgress(0);
      }, 1000);
    }
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8">
      {isSubmitting && (
        <UploadOverlay
          progress={uploadProgress}
          showSuccess={uploadProgress === 100 && !isSubmitting}
        />
      )}

      <h1 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">
        Create New Course
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="col-span-1 flex flex-col gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Course Thumbnail</CardTitle>
                  <CardDescription>
                    Upload an image (JPG, PNG, WEBP). Ratio 16:9 recommended,
                    max 2MB.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <Label
                    htmlFor="imageUpload"
                    className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed transition-colors ${selectedImage ? "border-primary" : "border-border hover:border-primary/50"} ${form.formState.errors.title ? "border-destructive" : ""}`}
                  >
                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        alt="Thumbnail Preview"
                        className="h-full w-full rounded-md object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground text-center">
                        <ImageIcon className="mx-auto mb-2 h-10 w-10" />
                        <span>Click or drag to upload</span>
                      </div>
                    )}
                  </Label>
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={onFileChange("image")}
                    disabled={isSubmitting}
                  />
                </CardContent>
                <CardFooter>
                  <Button
                    disabled={isSubmitting}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      document.getElementById("imageUpload")?.click()
                    }
                  >
                    <UploadCloud className="mr-2 h-4 w-4" /> Choose Image
                  </Button>
                </CardFooter>
              </Card>

              {/* --- Video Upload --- */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Introduction Video</CardTitle>
                  <CardDescription>
                    Upload a video (MP4, WEBM). Max 1.5GB recommended.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  {selectedVideo ? (
                    <div className="w-full">
                      <video
                        controls
                        src={selectedVideo}
                        className="bg-muted h-48 w-full rounded-md border object-cover"
                      />
                    </div>
                  ) : (
                    <div className="border-border text-muted-foreground flex h-48 w-full flex-col items-center justify-center rounded-md border-2 border-dashed text-center">
                      <Video className="mx-auto mb-2 h-10 w-10" />
                      <span>No video selected</span>
                    </div>
                  )}
                  <Input
                    id="videoUpload"
                    type="file"
                    accept="video/mp4,video/webm"
                    className="file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 h-fit w-full cursor-pointer file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold disabled:opacity-50"
                    onChange={onFileChange("video")}
                    disabled={isSubmitting}
                  />
                </CardContent>
              </Card>
            </div>

            {/* --- Right Column (Form Fields) --- */}
            <div className="col-span-1 space-y-6 md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                  <CardDescription>
                    Fill in the main details about your course.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Introduction to React Development"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="instructorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructor *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an instructor to assign this course" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {!loadingInstructors ? (
                              instructors.map((i) => (
                                <SelectItem
                                  key={i._id.toString()}
                                  value={i._id.toString()}
                                >
                                  {i.fullName}
                                </SelectItem>
                              ))
                            ) : (
                              <span>Loading...</span>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide a detailed description covering course topics, target audience, and learning outcomes."
                            className="min-h-[130px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Structure</CardTitle>
                  <CardDescription>
                    Define the structure and metadata for the course.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Duration *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 10 hours, 6 weeks"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Approximate total time commitment.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lectures"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Lectures *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 25"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Approximate Number of chapters.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Level *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">
                              Intermediate
                            </SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Price (USD) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g., 99.99"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter 0 for a free course.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="certification"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Certification</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Certificate of Completion, Advanced Web Developer"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Type of certification offered upon completion
                          (optional).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="syllabus"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Syllabus / Key Topics</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List key topics or modules, separated by commas."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a brief overview of the course content
                          (optional).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="badge"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Badge</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Bestseller, New, Popular Choice"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Highlight this course with a special badge (optional).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* --- Submit Button --- */}
          <div className="flex justify-end pt-4 font-medium">
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting ? "Creating Course..." : "Create Course"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddCourseAd;
