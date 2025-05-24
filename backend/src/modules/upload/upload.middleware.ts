/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/upload/upload.middleware.ts
import multer from "multer";
import { Request } from "express";
import { UploadCategory, uploadConfigs } from "./upload.types.js";
import { TRPCError } from "@trpc/server";

export const uploadMiddleware = (category: UploadCategory) => {
  const config = uploadConfigs[category];

  return async ({ ctx, next }) => {
    const fileFilter = (
      req: Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
      if (!config.allowedMimeTypes.includes(file.mimetype)) {
        return cb(
          new Error(
            `Invalid file type for ${category}. Allowed types: ${config.allowedMimeTypes.join(
              ", "
            )}`
          )
        );
      }

      if (file.size > config.maxSize) {
        return cb(
          new Error(
            `File size exceeds maximum limit of ${
              config.maxSize / (1024 * 1024)
            }MB`
          )
        );
      }
      cb(null, true);
    };

    const storage = multer.memoryStorage();
    const upload = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: config.maxSize,
        files: config.maxCount,
      },
    }).single(category);

    // Wrap the multer callback in a promise
    await new Promise<void>((resolve, reject) => {
      upload(ctx.req, ctx.res, (err: any) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            return reject(
              new TRPCError({
                code: "BAD_REQUEST",
                message:
                  err.code === "LIMIT_FILE_SIZE"
                    ? `File too large. Maximum size is ${
                        config.maxSize / (1024 * 1024)
                      }MB`
                    : `Too many files. Maximum ${config.maxCount} file(s) allowed`,
              })
            );
          }
          return reject(
            new TRPCError({
              code: "BAD_REQUEST",
              message: err.message,
            })
          );
        }
        resolve();
      });
    });

    return next();
  };
};

export const multiUploadMiddleware = (category: UploadCategory) => {
  const config = uploadConfigs[category];

  return async ({ ctx, next }) => {
    const fileFilter = (
      req: Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
      if (!config.allowedMimeTypes.includes(file.mimetype)) {
        return cb(
          new Error(
            `Invalid file type for ${category}. Allowed types: ${config.allowedMimeTypes.join(
              ", "
            )}`
          )
        );
      }

      if (file.size > config.maxSize) {
        return cb(
          new Error(
            `File size exceeds maximum limit of ${
              config.maxSize / (1024 * 1024)
            }MB`
          )
        );
      }
      cb(null, true);
    };

    const storage = multer.memoryStorage();
    const upload = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: config.maxSize,
        files: config.maxCount,
      },
    }).array(category, config.maxCount);

    await new Promise<void>((resolve, reject) => {
      upload(ctx.req, ctx.res, (err: any) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            return reject(
              new TRPCError({
                code: "BAD_REQUEST",
                message:
                  err.code === "LIMIT_FILE_SIZE"
                    ? `File too large. Maximum size is ${
                        config.maxSize / (1024 * 1024)
                      }MB`
                    : `Too many files. Maximum ${config.maxCount} file(s) allowed`,
              })
            );
          }
          return reject(
            new TRPCError({
              code: "BAD_REQUEST",
              message: err.message,
            })
          );
        }
        resolve();
      });
    });

    return next();
  };
};
