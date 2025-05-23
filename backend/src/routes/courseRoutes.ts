/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { NextFunction, Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Types } from "mongoose";
import Course from "../models/coursesModel.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

// Types for Cloudinary upload result
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

// Type for course material
interface CourseMaterial {
  title: string;
  description: string;
  url: string;
  publicId: string;
  fileType: string;
  fileName: string;
  size: number;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
}

// Type for Express request with user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
    files: 10, // Max 10 files
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    cb(null, true);
  },
});

// Upload single material
router.post(
  "/courses/:courseId/materials",
  authMiddleware,
  roleMiddleware(["instructor", "admin"]),
  upload.single("material"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const { courseId } = req.params;
      const { title, description } = req.body;
      const userId = req.user?.id;

      if (!userId || !Types.ObjectId.isValid(courseId)) {
        res.status(400).json({ error: "Invalid IDs" });
        return;
      }

      // Upload to Cloudinary
      const result = await new Promise<CloudinaryUploadResult>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "auto",
                folder: `course_materials/${courseId}`,
                public_id: `${Date.now()}_${req.file.originalname}`,
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result as CloudinaryUploadResult);
              }
            )
            .end(req.file.buffer);
        }
      );

      // Create material object
      const material: CourseMaterial = {
        title: title || req.file.originalname,
        description: description || "",
        url: result.secure_url,
        publicId: result.public_id,
        fileType: req.file.mimetype,
        fileName: req.file.originalname,
        size: req.file.size,
        uploadedBy: new Types.ObjectId(userId),
        uploadedAt: new Date(),
      };

      // Add to course
      const course = await Course.findByIdAndUpdate(
        courseId,
        { $push: { materials: material } },
        { new: true }
      );

      if (!course) {
        res.status(404).json({ error: "Course not found" });
        return;
      }

      res.status(201).json({
        message: "Material uploaded successfully",
        material,
      });
    } catch (error) {
      console.error("Error uploading material:", error);
      res.status(500).json({ error: "Failed to upload material" });
    }
  }
);

// Upload multiple materials
router.post(
  "/courses/:courseId/materials/batch",
  authMiddleware,
  roleMiddleware(["instructor", "admin"]),
  upload.array("materials"),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Explicitly type the files array
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ error: "No files uploaded" });
        return;
      }

      const { courseId } = req.params;
      const userId = req.user?.id;

      if (!userId || !Types.ObjectId.isValid(courseId)) {
        res.status(400).json({ error: "Invalid IDs" });
        return;
      }

      const uploadPromises = files.map((file: Express.Multer.File) => {
        return new Promise<CourseMaterial>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "auto",
                folder: `course_materials/${courseId}`,
                public_id: `${Date.now()}_${file.originalname}`,
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve({
                    title: file.originalname,
                    description: "",
                    url: (result as CloudinaryUploadResult).secure_url,
                    publicId: (result as CloudinaryUploadResult).public_id,
                    fileType: file.mimetype,
                    fileName: file.originalname,
                    size: file.size,
                    uploadedBy: new Types.ObjectId(userId),
                    uploadedAt: new Date(),
                  });
                }
              }
            )
            .end(file.buffer);
        });
      });

      const materials = await Promise.all(uploadPromises);

      // Add all materials to course
      const course = await Course.findByIdAndUpdate(
        courseId,
        { $push: { materials: { $each: materials } } },
        { new: true }
      );

      if (!course) {
        res.status(404).json({ error: "Course not found" });
        return;
      }

      res.status(201).json({
        message: "Materials uploaded successfully",
        count: materials.length,
        materials,
      });
    } catch (error) {
      next(error);
    }
  }
);
// Get course materials
router.get(
  "/courses/:courseId/materials",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { courseId } = req.params;

      if (!Types.ObjectId.isValid(courseId)) {
        res.status(400).json({ error: "Invalid course ID" });
        return;
      }

      const course = await Course.findById(courseId).select("materials").lean();

      if (!course) {
        res.status(404).json({ error: "Course not found" });
        return;
      }

      res.json({
        materials: course.materials || [],
      });
    } catch (error) {
      console.error("Error fetching materials:", error);
      res.status(500).json({ error: "Failed to fetch materials" });
    }
  }
);

// Delete material
router.delete(
  "/courses/:courseId/materials/:materialId",
  authMiddleware,
  roleMiddleware(["instructor", "admin"]),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { courseId, materialId } = req.params;

      if (
        !Types.ObjectId.isValid(courseId) ||
        !Types.ObjectId.isValid(materialId)
      ) {
        res.status(400).json({ error: "Invalid IDs" });
        return;
      }

      // First find the course
      const course = await Course.findById(courseId);
      if (!course) {
        res.status(404).json({ error: "Course not found" });
        return;
      }

      // Find the material using findIndex since id() method isn't recognized
      const materialIndex = course.materials.findIndex(
        (m) => (m as any)._id.toString() === materialId
      );

      if (materialIndex === -1) {
        res.status(404).json({ error: "Material not found" });
        return;
      }

      const material = course.materials[materialIndex];

      // Delete from Cloudinary
      await cloudinary.uploader.destroy(material.publicId);

      // Remove from course using splice instead of pull
      course.materials.splice(materialIndex, 1);
      await course.save();

      return;
      res.json({ message: "Material deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);
export default router;
