import express from "express";
import jwt from "jsonwebtoken";
import { envConfig } from "../config/envValidator.js";
import { JwtPayload } from "../controllers/refresh.js";
import { combinedUserModel } from "../utils/roleMappings.js";
import { CACHE } from "../utils/nodeCache.js";

const router = express.Router();

// Cache TTL configuration (1 hour)
const USER_CACHE_TTL = 3600;

router.get("/auth/session", async (req, res) => {
  const token = req.cookies.session;

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, envConfig.refreshToken) as JwtPayload;
    const { role, id } = decoded;

    const cacheKey = `user:${id}:${role}`;
    const cachedUser = CACHE.get<{ id: string; role: string }>(cacheKey);

    if (cachedUser) {
      res.json({
        success: true,
        fromCache: true,
        data: cachedUser,
      });
      return;
    }

    const userModel = combinedUserModel(role);
    const user = await userModel
      .findById(id)
      .select(
        "-password -refreshToken -emailVerificationExpires -emailVerificationToken"
      )
      .lean()
      .exec();

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const sessionData = { id: user._id.toString(), role };

    // ✅ Save to node-cache with TTL
    CACHE.set(cacheKey, sessionData, USER_CACHE_TTL);

    res.json({ success: true, data: sessionData });
  } catch (error) {
    console.error("Session verification error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: "Invalid token" });
      return;
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
