import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { envConfig } from "../config/envValidator.js";
import { generateToken } from "../utils/generateToken.js";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../utils/cookieUtils.js";
import {
  combinedUserModel,
  roleMappings,
  UserRole,
} from "../utils/roleMappings.js";
import { CACHE } from "../utils/nodeCache.js";

export interface JwtPayload {
  id: string;
  role: UserRole;
}

const isJwtPayload = (decoded: unknown): decoded is JwtPayload => {
  return (
    typeof decoded === "object" &&
    decoded !== null &&
    "id" in decoded &&
    "role" in decoded &&
    (decoded as JwtPayload).role in roleMappings
  );
};

const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.session;

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      message: "Refresh token required",
    });

    return;
  }

  const cacheKey = `refresh:${refreshToken}`;
  const cachedData = CACHE.get<{
    accessToken: string;
    newRefreshToken: string;
  }>(cacheKey);

  if (cachedData) {
    const { accessToken, newRefreshToken } = cachedData;
    setRefreshTokenCookie(res, newRefreshToken);
    res.json({ success: true, fromCache: true, token: accessToken });
    return;
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(refreshToken, envConfig.refreshToken) as JwtPayload;
  } catch (error) {
    clearRefreshTokenCookie(res);
    res.status(401).json({
      success: false,
      message:
        error instanceof jwt.TokenExpiredError
          ? "Session expired - Please login again"
          : "Invalid refresh token - Please login",
    });

    return;
  }

  if (!isJwtPayload(decoded)) {
    clearRefreshTokenCookie(res);
    res.status(401).json({
      success: false,
      message: "Invalid token payload",
    });

    return;
  }

  const { id, role } = decoded;
  const userModel = combinedUserModel(role);
  const user = await userModel.findById(id);

  if (!user) {
    clearRefreshTokenCookie(res);
    res.status(401).json({
      success: false,
      message: "User not found or session invalid",
    });

    return;
  }

  const newRefreshToken = generateToken({
    id: user._id.toString(),
    role,
    type: "refreshToken",
  });

  const accessToken = generateToken({
    id: user._id.toString(),
    role,
    type: "accessToken",
  });

  // ✅ Set new token pair in node-cache with 14 min TTL
  CACHE.set(`refresh:${newRefreshToken}`, { accessToken, newRefreshToken });

  // ✅ Delete the old cache entry
  CACHE.del(`refresh:${refreshToken}`);

  // Update user record with new refresh token
  await userModel.findByIdAndUpdate(user._id, {
    refreshToken: newRefreshToken,
  });

  setRefreshTokenCookie(res, newRefreshToken);
  res.json({ success: true, token: accessToken });
});

export default refresh;
