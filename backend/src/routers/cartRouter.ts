import NodeCache from "node-cache";
import z from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc.js";

import StudentModel from "../models/studentModel.js";
import CoursesModel from "../models/coursesModel.js";
import { ICart } from "../models/cartModel.js";

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

export const CACHE_PREFIX = "cartItems"; 

const getCachedCartItems = (userId: string): ICart[] | undefined => {
  return cache.get<ICart[]>(`${CACHE_PREFIX}:${userId}`);
};

const setCachedCartItems = (userId: string, items: ICart[]) => {
  cache.set(`${CACHE_PREFIX}:${userId}`, items);
};

const deleteCachedCartItems = (userId: string) => {
  cache.del(`${CACHE_PREFIX}:${userId}`);
};

// --- tRPC Router ---

export const cartRouter = router({
  addItem: protectedProcedure
    .input(
      z.object({
        courseId: z.string().min(1, { message: "Course ID is required" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { courseId } = input;

      try {
        const course = await CoursesModel.findById(courseId)
          .populate<{ instructor: { _id: string; fullName: string } }>(
            "instructor",
            "fullName"
          )
          .select("-reviews -syllabus")
          .lean();

        if (!course) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Course with ID ${courseId} not found.`,
          });
        }

        if (
          !course.instructor ||
          typeof course.instructor !== "object" ||
          !course.instructor.fullName
        ) {
          console.error(
            `Instructor data missing or invalid for course ${courseId}`
          );
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Course data is incomplete (missing instructor information).",
          });
        }

        const cartItemToAdd: ICart = {
          ...course,
          _id: course._id.toString(),
          instructor: course.instructor.fullName,
        };

        const updatedStudent = await StudentModel.findByIdAndUpdate(
          userId,
          { $addToSet: { cartItems: cartItemToAdd } },
          { new: true }
        ).lean();

        if (!updatedStudent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found.",
          });
        }

        const updatedCartItems: ICart[] = updatedStudent.cartItems as ICart[];
        setCachedCartItems(userId, updatedCartItems);

        return updatedCartItems;
      } catch (error) {
        console.error("Error adding item to cart:", {
          userId,
          courseId,
          error,
        });
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "An unexpected error occurred while adding the item to the cart.",
        });
      }
    }),

  getAllItems: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const cachedCartItems = getCachedCartItems(userId);

    if (cachedCartItems) {
      console.log(`Cache hit for cartItems: ${userId}`);
      return cachedCartItems;
    }

    console.log(`Cache miss for cartItems: ${userId}`);
    try {
      const student = await StudentModel.findById(userId)
        .select("cartItems")
        .lean();

      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        });
      }

      const cartItems = student.cartItems as ICart[];

      setCachedCartItems(userId, cartItems);

      return cartItems;
    } catch (error) {
      console.error("Error retrieving cart items:", { userId, error });
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while retrieving cart items.",
      });
    }
  }),

  deleteItem: protectedProcedure
    .input(
      z.object({
        itemId: z.string().min(1, { message: "Item ID is required" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { itemId } = input;

      try {
        const updateResult = await StudentModel.updateOne(
          { _id: userId },
          { $pull: { cartItems: { _id: itemId } } }
        );

        if (updateResult.matchedCount === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found.",
          });
        }

        deleteCachedCartItems(userId);

        return { success: true };
      } catch (error) {
        console.error("Error deleting cart item:", { userId, itemId, error });
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while deleting the cart item.",
        });
      }
    }),
});
