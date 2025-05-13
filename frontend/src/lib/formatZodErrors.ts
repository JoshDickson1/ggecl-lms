type ZodErrorField = {
  field: string;
  message: string;
};

interface ZodErrorResponse {
  errors: ZodErrorField[];
  message?: string;
}

export function formatZodErrors(errorData: ZodErrorResponse): string {
  // Format each error as "field: message"
  const formattedErrors = errorData.errors.map(
    (err) => `${err.field}: ${err.message}`
  );
  // Combine the general message with the detailed errors
  return `${errorData.message}: ${formattedErrors.join(", ")}`;
}
