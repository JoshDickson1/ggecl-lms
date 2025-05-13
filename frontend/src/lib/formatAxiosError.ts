import { AxiosError } from "axios";

interface ErrorResponse {
  success: boolean;
  message?: string;
}

// Type guard for AxiosError
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    error instanceof AxiosError &&
    error.isAxiosError === true
  );
}

export function formatAxiosError(error: unknown): { response: ErrorResponse } {
  console.log(error);
  if (isAxiosError(error)) {
    const data = error.response?.data as ErrorResponse | undefined;
    return {
      response: data || {
        success: false,
        message: error.message || "An unknown Axios error occurred.",
      },
    };
  }

  return {
    response: { success: false, message: "An unknown error occurred." },
  };
}
