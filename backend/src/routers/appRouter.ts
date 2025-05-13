import { router } from "../trpc.js";
import { notificationRouter } from "./notificationRouter.js";
import { forgotPasswordRouter } from "./forgotPasswordRouter.js";
import { cartRouter } from "./cartRouter.js";
import { studentRouter } from "./studentRouter.js";
import { instructorRouter } from "./instructorRouter.js";
import { adminRouter } from "./adminRouter.js";
import { assignmentRouter } from "./assignmentRouter.js";
import { courseRouter } from "./cRouter.js";

export const appRouter = router({
  notification: notificationRouter,
  forgotPassword: forgotPasswordRouter,
  cart: cartRouter,
  course: courseRouter,
  student: studentRouter,
  instructor: instructorRouter,
  admin: adminRouter,
  assignment: assignmentRouter,
});

export type AppRouter = typeof appRouter;
