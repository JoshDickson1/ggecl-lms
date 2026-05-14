//@lib/auth-client.ts

import { createAuthClient } from "better-auth/react"

// Both dev and production use relative URLs so all /api/auth/* requests
// go through the local Vite proxy (dev) or Vercel rewrite (prod) — keeping
// everything same-origin and avoiding cross-port/cross-subdomain cookie issues.
//
// Dev:  Vite proxy → http://localhost:3000
// Prod: requests go directly to https://lms-services.ggecl.com via VITE_API_URL
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || undefined,
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
})