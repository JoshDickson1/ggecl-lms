import express from "express";
import { register, login } from "../controllers/students/auth.js";
import { getStudentById } from "../controllers/students/index.js";

import { handleStudentGoogleAuth } from "../controllers/students/googleAuth.js";
import { authenticator } from "../middlewares/authenticator.js";
import { checkObjectId } from "../middlewares/checkObjectId.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.post("/google/auth", handleStudentGoogleAuth);
router.get("/:id", authenticator, checkObjectId, getStudentById);

export default router;
