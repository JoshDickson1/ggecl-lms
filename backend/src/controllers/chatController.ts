import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { Group, Message } from "../models/messageSchema.js";
import { createErrorResponse } from "../utils/responseUtils.js";

export const getAllGroups = expressAsyncHandler(
  async (_req: Request, res: Response) => {
    try {
      const groups = await Group.find().sort({ createdAt: -1 });
      res.status(200).json(groups);
    } catch (error) {
      console.error("Fetch groups error:", error);
      createErrorResponse(res, 500, "Failed to fetch groups");
    }
  }
);

export const getGroupById = expressAsyncHandler(
  async (req: Request, res: Response) => {
    try {
      const group = await Group.findOne({ groupId: req.params.groupId });
      if (!group) {
        return createErrorResponse(res, 404, "Group not found");
      }
      res.status(200).json(group);
    } catch (error) {
      console.error("Fetch group error:", error);
      createErrorResponse(res, 500, "Failed to fetch group");
    }
  }
);

export const getGroupMessages = expressAsyncHandler(
  async (req: Request, res: Response) => {
    try {
      const messages = await Message.find({ group: req.params.groupId }).sort({
        createdAt: 1,
      });
      res.status(200).json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      createErrorResponse(res, 500, "Failed to fetch messages");
    }
  }
);

export const updateGroup = expressAsyncHandler(
  async (req: Request, res: Response) => {
    try {
      const updated = await Group.findOneAndUpdate(
        { groupId: req.params.groupId },
        req.body,
        { new: true }
      );
      res.status(200).json(updated);
    } catch (error) {
      console.error("Update group error:", error);
      createErrorResponse(res, 500, "Failed to update group");
    }
  }
);

export const deleteGroup = expressAsyncHandler(
  async (req: Request, res: Response) => {
    try {
      await Group.findOneAndDelete({ groupId: req.params.groupId });
      res.status(200).json({ message: "Group deleted" });
    } catch (error) {
      console.error("Delete group error:", error);
      createErrorResponse(res, 500, "Failed to delete group");
    }
  }
);
