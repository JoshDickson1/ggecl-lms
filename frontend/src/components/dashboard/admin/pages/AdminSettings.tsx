import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage, // Import FormMessage to display errors
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUpdateAdmin } from "../hooks/useUpdateAdmin";
import { useUpdateAdminPassword } from "../hooks/useUpdateAdminPassword";
import { validateFile } from "@/utils/validateFile";
import { Progress } from "@/components/ui/progress";
import { useUploadImage } from "@/hooks/useUploadImage";

// --- Zod Schemas ---

// Schema for Account Information
const accountFormSchema = z.object({
  fullName: z.string().min(1, { message: "Full Name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
});

// Schema for Password Change
const passwordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required." }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your new password." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

// --- Types from Zod Schemas ---
type AccountFormValues = z.infer<typeof accountFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const AdminSettings: React.FC = () => {
  const { admin } = useAdmin();

  const [showPassword, setShowPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const {
    isImageUploading: isUploadingImage,
    uploadImage,
    uploadProgress,
  } = useUploadImage();

  const { isUpdatingAdmin, updateAdmin } = useUpdateAdmin();
  const { isUpdatingAdminPassword, updateAdminPassword } =
    useUpdateAdminPassword();

  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      fullName: admin.fullName || "",
      email: admin.email || "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const { valid, error } = validateFile(file, "image");

    if (!valid || !file) {
      toast.error(error);
      return;
    }

    setImageFile(file);
    setSelectedImage(URL.createObjectURL(file));
  };

  const onSubmitAccount = async (values: AccountFormValues) => {
    const { fullName, email } = values;

    const changes: Partial<AccountFormValues> = {
      ...(fullName && fullName !== admin.fullName && { fullName }),
      ...(email && email !== admin.email && { email }),
    };

    if (!imageFile && Object.keys(changes).length === 0) {
      toast.info("No changes detected.");
      return;
    }

    let pictureUrl;
    if (imageFile) {
      pictureUrl = await uploadImage(imageFile, "profile_pictures");
    }

    updateAdmin({
      id: admin._id.toString(),
      data: {
        ...changes,
        ...(pictureUrl && { picture: pictureUrl }),
      },
    });
  };

  const onSubmitPassword = (values: PasswordFormValues) => {
    if (values.currentPassword === values.newPassword) {
      toast.info("New password cannot be the same as the old one.");
      return;
    }
    updateAdminPassword({ ...values });
  };

  return (
    <div className="p-6 dark:text-gray-200">
      <h1 className="text-3xl font-bold">Account Settings</h1>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-10">
        <div className="col-span-1 rounded-lg border p-4 md:col-span-7 dark:border-gray-700">
          <h2 className="mb-6 text-2xl font-semibold">Profile Information</h2>
          <Form {...accountForm}>
            <form
              onSubmit={accountForm.handleSubmit(onSubmitAccount)}
              className="flex flex-col gap-6"
            >
              <FormField
                control={accountForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={accountForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isUpdatingAdmin || isUploadingImage}
                className="mt-2 self-start"
              >
                {isUpdatingAdmin || isUploadingImage
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </form>
          </Form>
        </div>

        <div className="col-span-1 flex flex-col items-center gap-4 rounded-lg border p-4 md:col-span-3 dark:border-gray-700">
          <h3 className="text-lg font-semibold">Profile Picture</h3>
          <div className="relative">
            <img
              src={selectedImage || admin.picture}
              alt="Profile"
              className="h-36 w-36 rounded-full border object-cover dark:border-gray-700"
            />
            <label
              htmlFor="upload"
              className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity hover:opacity-100"
            >
              Click to Upload
            </label>
            <input
              id="upload"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG, WEBP up to 2MB. 1:1 ratio recommended.
          </p>

          {isUploadingImage && (
            <div className="w-full">
              <Progress value={uploadProgress} className="h-2 rounded-full" />
              <p className="mt-1 text-sm">Uploading: {uploadProgress}%</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 max-w-md rounded-lg border p-4 dark:border-gray-700">
        <h2 className="mb-6 text-2xl font-semibold">Change Password</h2>
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
            className="flex flex-col gap-6"
          >
            {(
              [
                { name: "currentPassword", label: "Current Password" },
                { name: "newPassword", label: "New Password" },
                { name: "confirmPassword", label: "Confirm New Password" },
              ] as const
            ).map(({ name, label }) => (
              <FormField
                key={name}
                control={passwordForm.control}
                name={name}
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        className="pr-10"
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-500 dark:text-gray-400"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <Button
              type="submit"
              disabled={isUpdatingAdminPassword}
              className="mt-2 self-start"
            >
              {isUpdatingAdminPassword ? "Saving..." : "Save Password"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AdminSettings;
