import { createClient } from "redis";
import { envConfig } from "./envValidator.js";

export const redis = createClient({
  url: envConfig.redisUrl
});

redis.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

export async function connectToCache() {
  if (redis.isOpen) {
    console.log("Redis is already connected.");
    return;
  }
  console.log("⚡ Connecting to cache...");
  try {
    await redis.connect();
    console.log("✅ Connected to cache!");
  } catch (err) {
    console.error("❌ Redis connection error:", err);
    process.exit(1);
  }
}