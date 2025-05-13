import express from "express";
import { createMeeting, getMeetings } from "../zoom/index.js";

const router = express.Router();

router.post("/create", createMeeting);
router.get("/list", getMeetings);

export default router;
