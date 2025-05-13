import express from "express";

import {
  getAllGroups,
  getGroupMessages,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/get-groups", getAllGroups);
router.get("/get-messages/:groupId", getGroupMessages);

export default router;
