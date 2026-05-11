//@lib/auth-client.ts

import { createAuthClient } from "better-auth/react"

// In production (Vercel), VITE_API_URL is not set so baseURL is undefined,
// which makes better-auth use relative URLs (e.g. /api/auth/...).
// Vercel's proxy rewrites /api/* → https://lms-services.ggecl.com/api/*,
// so auth requests stay same-origin — no cross-site cookie issues.
//
// In local dev, VITE_API_URL=http://localhost:3000 is set in .env,
// so requests go directly to the local backend as before.
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || undefined,
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
})