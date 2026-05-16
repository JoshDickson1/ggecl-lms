//@lib/auth-client.ts

import { createAuthClient } from "better-auth/react"

// Always use relative URLs so all /api/auth/* requests stay same-origin.
// Dev:  Vite proxy rewrites /api/* → http://localhost:3000
// Prod: Vercel rewrites /api/* → https://lms-services.ggecl.com
// This avoids third-party cookie blocking in Safari / Firefox strict mode.
export const authClient = createAuthClient({
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
})