import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { UploadCloud, Image as ImageIcon } from "lucide-react";

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

import { useUploadToCloud } from "@/hooks/useUploadToCloud";
import { useEditCourse } from "../hooks/useEditCourse";
import { useParams } from "react-router";
import { useCoursesById } from "@/hooks/useCourseById";
import CourseMaterialsCard from "../components/CourseMaterialsCard";

// --- Zod Schema Definition ---
const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
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
  level: z.enum(["Beginner", "Intermediate", "Advanced"], {
    required_error: "Please select a course level.",
  }),
  price: z.coerce.number({ invalid_type_error: "Must be a number" }).min(0, {
    message: "Price cannot be negative.",
  }),
  badge: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const EditCourseForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [imageError, setImageError] = useState(false);

  const { uploadToCloud } = useUploadToCloud();
  const { courseId } = useParams<{ courseId: string }>();
  const { singleCourse: course } = useCoursesById(courseId || "");

  const { editCourse } = useEditCourse();

  const form = useForm<FormData>({ resolver: zodResolver(formSchema) });

  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title,
        description: course.description,
        certification: course.certification || "",
        syllabus: course.syllabus.join(", ") || "",
        duration: course.duration,
        lectures: course.lectures,
        level: course.level as "Beginner" | "Intermediate" | "Advanced",
        price: course.price,
        badge: course.badge || "",
      });
      setSelectedImage(course.img || null);
      setImageFile(null);
      setImageUploadProgress(0);
      setImageError(false);
    }
  }, [course, form]);

  function handleReset() {
    form.reset();
    setSelectedImage(course?.img || null);
    setImageFile(null);
    setImageUploadProgress(0);
    setImageError(false);
    setIsSubmitting(false);
  }

  const onFileChange =
    (t: TAllowedFileTypes) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setImageUploadProgress(0);
      setImageError(false);

      const { valid, error: validationError } = validateFile(file, t);
      if (!valid || !file) {
        toast.error(validationError || `Invalid ${t} file.`);
        e.target.value = "";
        setSelectedImage(course?.img || null);
        setImageFile(null);
        return;
      }

      if (t === "image") {
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);
        setImageFile(file);
      }

      e.target.value = "";
    };

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    setImageError(false);
    setImageUploadProgress(0);

    try {
      let imgUrl: string | null = course?.img || null;
      if (imageFile) {
        const uploaded = (await uploadToCloud(
          imageFile,
          "image",
          "images",
          setImageUploadProgress,
        )) as string;
        if (!uploaded) throw new Error("Image upload failed.");
        imgUrl = uploaded;
      }

      const payload = {
        ...values,
        img: imgUrl || undefined,
        syllabus: values.syllabus
          ? values.syllabus
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      };

      await editCourse({ courseData: payload, courseId: courseId || "" });
      handleReset();
    } catch (err) {
      console.error(err);
      let message = "An unexpected error occurred.";
      if (err instanceof AxiosError && err.response?.data?.error?.message) {
        message = err.response.data.error.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setImageError(!imageFile && !selectedImage);
      toast.error(message);
    } finally {
      setTimeout(() => setIsSubmitting(false), 500);
    }
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8">
      {isSubmitting && (
        <UploadOverlay
          progress={imageUploadProgress}
          showSuccess={imageUploadProgress === 100 && !isSubmitting}
        />
      )}

      <h1 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">
        Edit Course
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
                    tabIndex={0}
                    onKeyDown={(e) =>
                      ["Enter", " "].includes(e.key) &&
                      document.getElementById("imageUpload")?.click()
                    }
                    className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 transition-colors ${
                      imageError
                        ? "border-destructive"
                        : selectedImage
                          ? "border-primary"
                          : "border-border hover:border-primary/50"
                    }`}
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
                  {isSubmitting && (
                    <progress
                      value={imageUploadProgress}
                      max={100}
                      className="w-full"
                    />
                  )}
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
                          value={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                defaultValue={course?.level}
                                placeholder="Select difficulty level"
                              />
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
          <CourseMaterialsCard />
          {/* --- Submit Button --- */}
          <div className="flex justify-end pt-4 font-medium">
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting ? "Updating Course..." : "Update Course"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditCourseForm;
