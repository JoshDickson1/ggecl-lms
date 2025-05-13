/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";

import type { AppRouter } from "@backend/src/routers/appRouter"; // Adjust path if needed
import { API_URL, authProvider } from "../api/client"; // Adjust path if needed
import { inferProcedureOutput } from "@trpc/server";

// --- Type Exports (remain the same) ---
export type GetAllCoursesOutput = inferProcedureOutput<
  AppRouter["course"]["getAll"]
>;

export type GetAssignmentsOutput = inferProcedureOutput<
  AppRouter["assignment"]["getAllSubmitted"]
>;

// export type GetAssignmentsStudentOutput = inferProcedureOutput<
//   AppRouter["assignment"]["getAllForStudent"]
// >;

export type GetCourseOutput = inferProcedureOutput<
  AppRouter["course"]["getById"]
>;
export type GetStudentOutput = inferProcedureOutput<
  AppRouter["student"]["getById"]
>;
export type GetInstructorOutput = inferProcedureOutput<
  AppRouter["instructor"]["getById"]
>;
export type GetAdminOutput = inferProcedureOutput<
  AppRouter["admin"]["getById"]
>;
export type ICourseSummary = GetAllCoursesOutput["courses"][number];

export type Assignment = GetAssignmentsOutput["assignments"][number];
// export type SAssignment = GetAssignmentsStudentOutput["assignments"][number];

export const queryClient = new QueryClient();

// --- Concurrency control for token refresh ---
let isRefreshingToken = false;
let refreshTokenPromise: Promise<string | null> | null = null;

// --- Custom Fetch Interceptor ---
async function customFetch(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
): Promise<Response> {
  const originalInit = { ...(init ?? {}) };

  let response = await fetch(input, originalInit);

  if (response.status === 401) {
    console.log("Intercepted 401 Unauthorized response.");

    const responseClone = response.clone();
    let errorBody: any;
    try {
      errorBody = (await responseClone.json())[0]?.error?.json;
      console.log("401 Response Body:", errorBody);
    } catch (e) {
      console.warn("Failed to parse 401 response body as JSON.", e);
      return response;
    }

    const isTokenExpiredError =
      errorBody?.error?.message?.toLowerCase().includes("expire") ||
      errorBody?.message?.toLowerCase().includes("expire") ||
      errorBody?.code === "TOKEN_EXPIRED";

    if (isTokenExpiredError) {
      console.warn("Detected potential token expiry. Attempting refresh...");

      if (!isRefreshingToken) {
        console.log("Starting new token refresh process.");
        isRefreshingToken = true;

        refreshTokenPromise = new Promise((resolve) => {
          const refreshToken = async () => {
            try {
              const newAccessToken = await authProvider.refreshAccessToken();

              if (!newAccessToken || typeof newAccessToken !== "string") {
                throw new Error(
                  "refreshAccessToken did not return a valid new access token string.",
                );
              }

              console.log("Token refreshed successfully.");

              authProvider.setAccessToken(newAccessToken);

              resolve(newAccessToken);
            } catch (refreshError) {
              console.error("Failed to refresh token:", refreshError);
              // authProvider.logout(); // add

              resolve(null);
            } finally {
              console.log(
                "Token refresh process finished. Resetting refresh state.",
              );
              isRefreshingToken = false;
            }
          };

          refreshToken();
        });
      } else {
        console.log(
          "Token refresh already in progress, waiting for it to complete...",
        );
      }

      try {
        const newAccessToken = await refreshTokenPromise;

        if (newAccessToken) {
          console.log("Retrying original request with newly refreshed token.");
          const retryInit: RequestInit = {
            ...originalInit,
            headers: {
              ...(originalInit.headers ?? {}),
              Authorization: `Bearer ${newAccessToken}`,
            },
          };
          response = await fetch(input, retryInit);
        } else {
          console.error(
            "Token refresh failed or did not provide a token. Returning original 401 response.",
          );
          return response;
        }
      } catch (waitError) {
        console.error(
          "Error occurred while waiting for token refresh:",
          waitError,
        );

        return response;
      }
    } else {
      console.log(
        "401 error received, but not identified as a token expiry issue. Returning original 401 response.",
      );
      return response;
    }
  }
  return response;
}

// --- tRPC Client Setup ---
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: API_URL + "/trpc",
      headers() {
        const token = authProvider.getAccessToken();
        if (token) {
          return {
            Authorization: `Bearer ${token}`,
          };
        }
        return {};
      },
      fetch: (url, options) => {
        return customFetch(url, {
          ...options,
          credentials: "include",
        });
      },
      transformer: superjson,
    }),
  ],
});

// --- tRPC Proxy (remains the same) ---
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
